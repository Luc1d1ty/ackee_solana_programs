use anchor_lang::prelude::*;

declare_id!("GHLyEoD7GMM14KQj1ydEGExkvaNH3Y2P2X19NVN4DyPX");

#[program]
pub mod rotor {
    use super::*;

    // -------------------------------------------------------------------------
    // INSTRUCTION 1: Initialize User Profile
    // -------------------------------------------------------------------------
    // This function creates a PDA (Program Derived Address) for the user.
    // A PDA is an account that is controlled by the program, not a private key.
    // We use it to store data securely.
    pub fn initialize_user_profile(
        ctx: Context<InitializeUserProfile>,
        username: String,
    ) -> Result<()> {
        // 1. Validate Input
        require!(username.len() <= 32, RotorError::UsernameTooLong);

        // 2. Initialize the Account
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.owner = ctx.accounts.user.key();
        user_profile.username = username;
        user_profile.total_capsules_created = 0;
        user_profile.total_capsules_received = 0;
        user_profile.created_at = Clock::get()?.unix_timestamp;
        user_profile.bump = ctx.bumps.user_profile;

        msg!("User profile initialized for: {}", user_profile.owner);
        Ok(())
    }

    // -------------------------------------------------------------------------
    // INSTRUCTION 1.5: Initialize Global State
    // -------------------------------------------------------------------------
    pub fn initialize_global_state(
        ctx: Context<InitializeGlobalState>,
        platform_fee_bps: u16,
    ) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;
        global_state.admin = ctx.accounts.admin.key();
        global_state.total_capsules = 0;
        global_state.total_unlocked = 0;
        global_state.total_sol_locked = 0;
        global_state.fee_wallet = ctx.accounts.fee_wallet.key();
        global_state.platform_fee_bps = platform_fee_bps;
        global_state.bump = ctx.bumps.global_state;
        Ok(())
    }

    // -------------------------------------------------------------------------
    // INSTRUCTION 2: Create Time Capsule
    // -------------------------------------------------------------------------
    pub fn create_time_capsule(
        ctx: Context<CreateTimeCapsule>,
        capsule_id: u64,
        title: String,
        message: String,
        unlock_at: i64,
        locked_sol: u64,
        is_public: bool,
        capsule_type: CapsuleType,
    ) -> Result<()> {
        // 1. Validation
        require!(title.len() <= 64, RotorError::TitleTooLong);
        require!(message.len() <= 280, RotorError::MessageTooLong);
        require!(
            unlock_at > Clock::get()?.unix_timestamp,
            RotorError::InvalidUnlockDate
        );

        // 2. Transfer SOL to Vault
        if locked_sol > 0 {
            require!(
                ctx.accounts.creator.lamports() >= locked_sol,
                RotorError::InsufficientFunds
            );

            let cpi_context = CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.creator.to_account_info(),
                    to: ctx.accounts.capsule_vault.to_account_info(),
                },
            );
            anchor_lang::system_program::transfer(cpi_context, locked_sol)?;
        }

        // 3. Initialize TimeCapsule
        let time_capsule = &mut ctx.accounts.time_capsule;
        time_capsule.creator = ctx.accounts.creator.key();
        time_capsule.recipient = ctx.accounts.recipient_profile.owner;
        time_capsule.capsule_id = capsule_id;
        time_capsule.title = title;
        time_capsule.message = message;
        time_capsule.locked_sol = locked_sol;
        time_capsule.created_at = Clock::get()?.unix_timestamp;
        time_capsule.unlock_at = unlock_at;
        time_capsule.unlocked_at = None;
        time_capsule.is_cancelled = false;
        time_capsule.is_public = is_public;
        time_capsule.capsule_type = capsule_type;
        time_capsule.bump = ctx.bumps.time_capsule;

        // 4. Initialize CapsuleVault
        let capsule_vault = &mut ctx.accounts.capsule_vault;
        capsule_vault.capsule = time_capsule.key();
        capsule_vault.bump = ctx.bumps.capsule_vault;

        // 5. Update Counters
        let creator_profile = &mut ctx.accounts.creator_profile;
        creator_profile.total_capsules_created = creator_profile
            .total_capsules_created
            .checked_add(1)
            .unwrap();

        let recipient_profile = &mut ctx.accounts.recipient_profile;
        recipient_profile.total_capsules_received = recipient_profile
            .total_capsules_received
            .checked_add(1)
            .unwrap();

        let global_state = &mut ctx.accounts.global_state;
        global_state.total_capsules = global_state.total_capsules.checked_add(1).unwrap();
        global_state.total_sol_locked = global_state
            .total_sol_locked
            .checked_add(locked_sol)
            .unwrap();

        msg!("Time Capsule created: {}", time_capsule.key());
        Ok(())
    }

    // -------------------------------------------------------------------------
    // INSTRUCTION 3: Unlock Time Capsule
    // -------------------------------------------------------------------------
    pub fn unlock_time_capsule(ctx: Context<UnlockTimeCapsule>) -> Result<()> {
        let time_capsule = &mut ctx.accounts.time_capsule;
        let global_state = &mut ctx.accounts.global_state;
        let now = Clock::get()?.unix_timestamp;

        // 1. Validation
        require!(
            now >= time_capsule.unlock_at,
            RotorError::CapsuleStillLocked
        );
        require!(
            time_capsule.unlocked_at.is_none(),
            RotorError::AlreadyUnlocked
        );
        require!(!time_capsule.is_cancelled, RotorError::CapsuleCancelled);

        // 2. Calculate Fee
        let locked_amount = time_capsule.locked_sol;
        let fee_amount =
            (locked_amount as u128 * global_state.platform_fee_bps as u128 / 10000) as u64;

        // 3. Transfer Fee (from Vault to Fee Wallet)
        if fee_amount > 0 {
            **ctx
                .accounts
                .capsule_vault
                .to_account_info()
                .try_borrow_mut_lamports()? -= fee_amount;
            **ctx
                .accounts
                .fee_wallet
                .to_account_info()
                .try_borrow_mut_lamports()? += fee_amount;
        }

        // 4. Update State
        time_capsule.unlocked_at = Some(now);
        global_state.total_unlocked = global_state.total_unlocked.checked_add(1).unwrap();
        global_state.total_sol_locked = global_state
            .total_sol_locked
            .checked_sub(time_capsule.locked_sol)
            .unwrap();

        msg!("Capsule unlocked! Fee paid: {}", fee_amount);
        Ok(())
    }

    // -------------------------------------------------------------------------
    // INSTRUCTION 4: Transfer Capsule Recipient
    // -------------------------------------------------------------------------
    pub fn transfer_capsule_recipient(
        ctx: Context<TransferCapsuleRecipient>,
        new_recipient: Pubkey,
    ) -> Result<()> {
        let time_capsule = &mut ctx.accounts.time_capsule;
        let old_recipient_profile = &mut ctx.accounts.old_recipient_profile;
        let new_recipient_profile = &mut ctx.accounts.new_recipient_profile;

        require!(
            time_capsule.unlocked_at.is_none(),
            RotorError::AlreadyUnlocked
        );
        require!(!time_capsule.is_cancelled, RotorError::CapsuleCancelled);

        time_capsule.recipient = new_recipient;

        if old_recipient_profile.total_capsules_received > 0 {
            old_recipient_profile.total_capsules_received -= 1;
        }
        new_recipient_profile.total_capsules_received += 1;

        msg!("Capsule transferred to: {}", new_recipient);
        Ok(())
    }

    // -------------------------------------------------------------------------
    // INSTRUCTION 5: Cancel Time Capsule
    // -------------------------------------------------------------------------
    pub fn cancel_time_capsule(ctx: Context<CancelTimeCapsule>) -> Result<()> {
        let time_capsule = &mut ctx.accounts.time_capsule;
        let global_state = &mut ctx.accounts.global_state;
        let recipient_profile = &mut ctx.accounts.recipient_profile;

        require!(
            time_capsule.unlocked_at.is_none(),
            RotorError::AlreadyUnlocked
        );
        require!(!time_capsule.is_cancelled, RotorError::CapsuleCancelled);

        time_capsule.is_cancelled = true;

        global_state.total_sol_locked = global_state
            .total_sol_locked
            .checked_sub(time_capsule.locked_sol)
            .unwrap();

        if recipient_profile.total_capsules_received > 0 {
            recipient_profile.total_capsules_received -= 1;
        }

        msg!("Capsule cancelled");
        Ok(())
    }

    // -------------------------------------------------------------------------
    // INSTRUCTION 6: Delete Time Capsule
    // -------------------------------------------------------------------------
    pub fn delete_time_capsule(ctx: Context<DeleteTimeCapsule>) -> Result<()> {
        let time_capsule = &ctx.accounts.time_capsule;

        require!(
            time_capsule.unlocked_at.is_some() || time_capsule.is_cancelled,
            RotorError::CapsuleStillLocked
        );

        msg!("Time Capsule deleted");
        Ok(())
    }
}

// =============================================================================
// ACCOUNT STRUCTURES (The "State")
// =============================================================================

// 1. UserProfile
// Tracks stats for a user.
// Seeds: ["user-profile", user_pubkey]
#[account]
pub struct UserProfile {
    pub owner: Pubkey,                // 32 bytes
    pub username: String,             // 4 + 32 bytes (max 32 chars)
    pub total_capsules_created: u32,  // 4 bytes
    pub total_capsules_received: u32, // 4 bytes
    pub created_at: i64,              // 8 bytes
    pub bump: u8,                     // 1 byte
}

// 2. TimeCapsule
// The core data structure.
// Seeds: ["time-capsule", creator_pubkey, capsule_id]
#[account]
pub struct TimeCapsule {
    pub creator: Pubkey,           // 32 bytes
    pub recipient: Pubkey,         // 32 bytes
    pub capsule_id: u64,           // 8 bytes
    pub title: String,             // 4 + 64 bytes
    pub message: String,           // 4 + 280 bytes
    pub locked_sol: u64,           // 8 bytes
    pub created_at: i64,           // 8 bytes
    pub unlock_at: i64,            // 8 bytes
    pub unlocked_at: Option<i64>,  // 1 + 8 bytes
    pub is_cancelled: bool,        // 1 byte
    pub is_public: bool,           // 1 byte
    pub capsule_type: CapsuleType, // 1 byte (enum)
    pub bump: u8,                  // 1 byte
}

// 3. CapsuleVault
// A PDA that holds the locked SOL. It has no data, just lamports.
// Seeds: ["capsule-vault", time_capsule_pubkey]
#[account]
pub struct CapsuleVault {
    pub capsule: Pubkey, // 32 bytes
    pub bump: u8,        // 1 byte
}

// 4. GlobalState
// Tracks platform-wide stats.
// Seeds: ["global-state"]
#[account]
pub struct GlobalState {
    pub admin: Pubkey,         // 32 bytes
    pub total_capsules: u64,   // 8 bytes
    pub total_unlocked: u64,   // 8 bytes
    pub total_sol_locked: u64, // 8 bytes
    pub fee_wallet: Pubkey,    // 32 bytes
    pub platform_fee_bps: u16, // 2 bytes
    pub bump: u8,              // 1 byte
}

// =============================================================================
// ENUMS & ERRORS
// =============================================================================

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum CapsuleType {
    Personal,   // 0
    Gift,       // 1
    Collective, // 2
    Legacy,     // 3
}

#[error_code]
pub enum RotorError {
    #[msg("Username too long (max 32 chars)")]
    UsernameTooLong,
    #[msg("Title too long (max 64 chars)")]
    TitleTooLong,
    #[msg("Message too long (max 280 chars)")]
    MessageTooLong,
    #[msg("Unlock time must be in the future")]
    InvalidUnlockDate,
    #[msg("Capsule is still locked")]
    CapsuleStillLocked,
    #[msg("Capsule is already unlocked")]
    AlreadyUnlocked,
    #[msg("Capsule is cancelled")]
    CapsuleCancelled,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Insufficient funds to lock")]
    InsufficientFunds,
}

// =============================================================================
// CONTEXTS (Validation Logic)
// =============================================================================

#[derive(Accounts)]
#[instruction(username: String)]
pub struct InitializeUserProfile<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = 150,
        seeds = [b"user-profile", user.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeGlobalState<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 8 + 8 + 8 + 32 + 2 + 1,
        seeds = [b"global-state"],
        bump
    )]
    pub global_state: Account<'info, GlobalState>,
    /// CHECK: Safe to set any fee wallet
    pub fee_wallet: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(capsule_id: u64)]
pub struct CreateTimeCapsule<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        mut,
        seeds = [b"user-profile", creator.key().as_ref()],
        bump,
    )]
    pub creator_profile: Account<'info, UserProfile>,

    /// CHECK: Used to derive recipient_profile seeds
    pub recipient: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"user-profile", recipient.key().as_ref()],
        bump,
    )]
    pub recipient_profile: Account<'info, UserProfile>,

    #[account(
        init,
        payer = creator,
        space = 600,
        seeds = [b"time-capsule", creator.key().as_ref(), &capsule_id.to_le_bytes()],
        bump
    )]
    pub time_capsule: Account<'info, TimeCapsule>,

    #[account(
        init,
        payer = creator,
        space = 8 + 32 + 1,
        seeds = [b"capsule-vault", time_capsule.key().as_ref()],
        bump
    )]
    pub capsule_vault: Account<'info, CapsuleVault>,

    #[account(
        mut,
        seeds = [b"global-state"],
        bump
    )]
    pub global_state: Account<'info, GlobalState>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UnlockTimeCapsule<'info> {
    #[account(mut)]
    pub recipient: Signer<'info>,

    #[account(
        mut,
        seeds = [b"time-capsule", time_capsule.creator.as_ref(), &time_capsule.capsule_id.to_le_bytes()],
        bump = time_capsule.bump,
        has_one = recipient,
    )]
    pub time_capsule: Account<'info, TimeCapsule>,

    #[account(
        mut,
        seeds = [b"capsule-vault", time_capsule.key().as_ref()],
        bump = capsule_vault.bump,
        close = recipient
    )]
    pub capsule_vault: Account<'info, CapsuleVault>,

    #[account(
        mut,
        seeds = [b"global-state"],
        bump = global_state.bump,
        has_one = fee_wallet,
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(mut)]
    /// CHECK: Verified via has_one constraint on global_state
    pub fee_wallet: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(new_recipient: Pubkey)]
pub struct TransferCapsuleRecipient<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        mut,
        seeds = [b"time-capsule", creator.key().as_ref(), &time_capsule.capsule_id.to_le_bytes()],
        bump = time_capsule.bump,
        has_one = creator,
    )]
    pub time_capsule: Account<'info, TimeCapsule>,

    #[account(
        mut,
        seeds = [b"user-profile", time_capsule.recipient.as_ref()],
        bump = old_recipient_profile.bump,
    )]
    pub old_recipient_profile: Account<'info, UserProfile>,

    #[account(
        mut,
        seeds = [b"user-profile", new_recipient.as_ref()],
        bump,
    )]
    pub new_recipient_profile: Account<'info, UserProfile>,
}

#[derive(Accounts)]
pub struct CancelTimeCapsule<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        mut,
        seeds = [b"time-capsule", creator.key().as_ref(), &time_capsule.capsule_id.to_le_bytes()],
        bump = time_capsule.bump,
        has_one = creator,
    )]
    pub time_capsule: Account<'info, TimeCapsule>,

    #[account(
        mut,
        seeds = [b"capsule-vault", time_capsule.key().as_ref()],
        bump = capsule_vault.bump,
        close = creator
    )]
    pub capsule_vault: Account<'info, CapsuleVault>,

    #[account(
        mut,
        seeds = [b"user-profile", time_capsule.recipient.as_ref()],
        bump = recipient_profile.bump,
    )]
    pub recipient_profile: Account<'info, UserProfile>,

    #[account(
        mut,
        seeds = [b"global-state"],
        bump = global_state.bump,
    )]
    pub global_state: Account<'info, GlobalState>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DeleteTimeCapsule<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        mut,
        seeds = [b"time-capsule", creator.key().as_ref(), &time_capsule.capsule_id.to_le_bytes()],
        bump = time_capsule.bump,
        has_one = creator,
        close = creator
    )]
    pub time_capsule: Account<'info, TimeCapsule>,

    pub system_program: Program<'info, System>,
}
