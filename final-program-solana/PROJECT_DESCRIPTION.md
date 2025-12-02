# Project Description

**Deployed Frontend URL:** https://rotor-protocol.vercel.app/

**Solana Program ID:** `GHLyEoD7GMM14KQj1ydEGExkvaNH3Y2P2X19NVN4DyPX`

## Project Overview

### Description
**ROTOR** is a decentralized time-capsule protocol built on the Solana blockchain. It allows users to securely lock messages and SOL tokens in on-chain vaults that can only be opened after a specific future date. The protocol leverages the immutability and security of smart contracts to ensure that "time" is the only key. Whether for saving funds for a future goal, sending a message to your future self, ROTOR provides a trustless solution enforced by code.

### Key Features
- **Time-Locked Vaults**: Create capsules containing SOL and encrypted messages that are mathematically impossible to open before the designated unlock time.
- **Responsive UI**: A seamless, responsive frontend experience that updates instantly, masking blockchain latency.
- **Safe Deletion**: Creators can delete empty/unlocked capsules to recover rent storage costs.
- **Global Stats**: On-chain tracking of total value locked (TVL) and total capsules created across the platform.

### How to Use the dApp

1.  **Connect Wallet**: Click the "Select Wallet" button in the top right corner and connect your Phantom or Solflare wallet.
2.  **Create Profile**: If you are a new user, you will be prompted to create an on-chain User Profile. Enter a username and confirm the transaction.
3.  **Create a Capsule**:
    *   Navigate to the "Create" tab.
    *   Enter a title and your secret message.
    *   Select an unlock date and time.
    *   (Optional) Add an amount of SOL to lock in the capsule.
    *   Click "Create Capsule" and approve the transaction.
4.  **View Capsules**: Go to "My Vaults" to see a grid of your created and received capsules.
    *   **LOCKED**: Capsules that cannot be opened yet.
    *   **READY**: Capsules that have passed their unlock time.
    *   **UNLOCKED**: Capsules that have been opened.
5.  **Unlock**: When a capsule is "READY", click the "Unlock" button to reveal the message and withdraw the locked SOL to your wallet.
6.  **Delete**: After unlocking (or if you wish to cancel), click the trash icon to delete the capsule account and reclaim the rent deposit (~0.002 SOL).

## Program Architecture

The ROTOR smart contract is built using the **Anchor framework**. It utilizes a PDA-based architecture to manage state securely and efficiently without requiring a centralized database.

### PDA Usage
We use Program Derived Addresses (PDAs) to deterministically locate accounts and manage ownership without storing large lookup tables.

**PDAs Used:**
-   **Global State**: `["global_state"]`
    *   Stores platform-wide statistics like total active capsules and total value locked.
-   **User Profile**: `["user_profile", user_pubkey]`
    *   Stores user-specific data (username, capsule counts) and ensures one profile per wallet.
-   **Time Capsule**: `["time_capsule", creator_pubkey, seed]`
    *   The main account storing the capsule's data (unlock time, owner, message, state). The `seed` allows a user to create multiple unique capsules.
-   **Capsule Vault**: `["capsule_vault", time_capsule_pubkey]`
    *   A token/SOL vault controlled by the program that holds the locked assets. It is a PDA derived from the Time Capsule's address, ensuring only the specific capsule logic can withdraw funds.

### Program Instructions

**Instructions Implemented:**
-   `initialize_global_state`: Sets up the global counters (admin only, one-time).
-   `initialize_user`: Creates a User Profile for a new wallet.
-   `create_time_capsule`: Initializes a new Time Capsule account, transfers SOL to the vault, and updates global/user stats.
-   `unlock_time_capsule`: Verifies the current time is past the unlock time, transfers SOL back to the owner, and marks the state as Unlocked.
-   `delete_time_capsule`: Closes the Time Capsule and Vault accounts, returning the rent SOL to the owner.
-   `transfer_time_capsule`: Changes the `owner` field of a capsule, transferring unlock rights to a new user.

### Account Structure

```rust
#[account]
pub struct TimeCapsule {
    pub owner: Pubkey,          // The account that can unlock/withdraw
    pub creator: Pubkey,        // The original creator
    pub unlock_time: i64,       // Unix timestamp for unlock
    pub amount: u64,            // Amount of SOL locked (lamports)
    pub created_at: i64,        // Creation timestamp
    pub state: CapsuleState,    // Enum: Locked, Unlocked, Cancelled
    pub message: String,        // The stored message
    pub bump: u8,               // PDA bump seed
}

#[account]
pub struct UserProfile {
    pub authority: Pubkey,
    pub created_capsules: u64,
    pub username: String,
    pub bump: u8,
}
```

## Testing

### Test Coverage
I have implemented a comprehensive test suite using TypeScript and Anchor's testing framework. The tests cover both standard usage (Happy Path) and security/edge cases (Unhappy Path).

**Happy Path Tests:**
-   **Initialize User**: Verifies a user profile is correctly created.
-   **Create Capsule**: Verifies a capsule is created with correct data and SOL is moved to the vault.
-   **Unlock Capsule**: Verifies funds are returned and message is revealed after the time passes.
-   **Delete Capsule**: Verifies accounts are closed and rent is reclaimed.

**Unhappy Path Tests:**
-   **Fails to create with past date**: Ensures capsules cannot be created with an unlock time in the past.
-   **Fails to unlock early**: Attempts to unlock a capsule before the time has passed and asserts that it fails with `CapsuleStillLocked`.
-   **Fails unauthorized cancellation**: Ensures only the creator/owner can interact with the capsule.

### Running Tests
```bash
yarn install
anchor test
```

### Additional Notes for Evaluators
This project was a deep dive into full-stack Solana development. The biggest challenge was definitely the "unhappy path" testing—figuring out how to properly assert error codes in Anchor took some trial and error. Also, implementing the UI for the frontend was tricky but rewarding; making the app feel "instant" while waiting for blockchain confirmation required careful state management.