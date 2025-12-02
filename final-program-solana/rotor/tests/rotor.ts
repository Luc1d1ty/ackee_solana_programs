import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Rotor } from "../target/types/rotor";
import { assert } from "chai";

describe("rotor", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.rotor as Program<Rotor>;

  const feeWallet = anchor.web3.Keypair.generate();
  const platformFeeBps = 50; // 0.5%

  it("Initializes User Profile", async () => {
    const [userProfilePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user-profile"), provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .initializeUserProfile("alice")
      .accounts({
        user: provider.wallet.publicKey,
      })
      .rpc();

    const profile = await program.account.userProfile.fetch(userProfilePda);
    assert.equal(profile.username, "alice");
    assert.equal(profile.owner.toBase58(), provider.wallet.publicKey.toBase58());
  });

  it("Fails with long username", async () => {
    const newUser = anchor.web3.Keypair.generate();
    const signature = await provider.connection.requestAirdrop(newUser.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL);
    const latestBlockHash = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: signature,
    });

    const [userProfilePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user-profile"), newUser.publicKey.toBuffer()],
      program.programId
    );

    const longUsername = "a".repeat(33);

    try {
      await program.methods
        .initializeUserProfile(longUsername)
        .accounts({
          user: newUser.publicKey,
        })
        .signers([newUser])
        .rpc();
      assert.fail("Should have failed with UsernameTooLong");
    } catch (e: any) {
      assert.ok(e);
    }
  });

  it("Initializes Global State", async () => {
    const [globalStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("global-state")],
      program.programId
    );

    await program.methods
      .initializeGlobalState(platformFeeBps)
      .accounts({
        admin: provider.wallet.publicKey,
        feeWallet: feeWallet.publicKey,
      })
      .rpc();

    const state = await program.account.globalState.fetch(globalStatePda);
    assert.equal(state.admin.toBase58(), provider.wallet.publicKey.toBase58());
    assert.equal(state.feeWallet.toBase58(), feeWallet.publicKey.toBase58());
    assert.equal(state.platformFeeBps, platformFeeBps);
  });

  it("Creates and Unlocks a Time Capsule", async () => {
    // 1. Setup Recipient
    const recipient = anchor.web3.Keypair.generate();
    const signature = await provider.connection.requestAirdrop(recipient.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL);
    const feeWalletSignature = await provider.connection.requestAirdrop(feeWallet.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL);
    const latestBlockHash = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: signature,
    });
    await provider.connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: feeWalletSignature,
    });

    const [recipientProfilePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user-profile"), recipient.publicKey.toBuffer()],
      program.programId
    );

    await program.methods.initializeUserProfile("bob")
      .accounts({
        user: recipient.publicKey,
      })
      .signers([recipient])
      .rpc();

    // 2. Create Capsule
    const capsuleId = new anchor.BN(2);
    const [timeCapsulePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("time-capsule"), provider.wallet.publicKey.toBuffer(), capsuleId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const [capsuleVaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("capsule-vault"), timeCapsulePda.toBuffer()],
      program.programId
    );

    const [creatorProfilePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user-profile"), provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    const [globalStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("global-state")],
      program.programId
    );

    // Set unlock time to NOW + 2 seconds
    const now = Math.floor(Date.now() / 1000);
    const unlockAt = new anchor.BN(now + 2);
    const lockedSol = new anchor.BN(0.1 * anchor.web3.LAMPORTS_PER_SOL);

    await program.methods.createTimeCapsule(
      capsuleId,
      "Unlock Me",
      "This is a secret message that will unlock in 2 seconds!",
      unlockAt,
      lockedSol,
      false,
      { personal: {} }
    ).accounts({
      creator: provider.wallet.publicKey,
      recipient: recipient.publicKey,
    }).rpc();

    // Verify creation
    let capsule = await program.account.timeCapsule.fetch(timeCapsulePda);
    assert.equal(capsule.title, "Unlock Me");
    assert.equal(capsule.lockedSol.toString(), lockedSol.toString());

    // 3. Wait for Unlock
    console.log("Waiting 3 seconds for unlock...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 4. Unlock
    const initialFeeWalletBalance = await provider.connection.getBalance(feeWallet.publicKey);

    await program.methods.unlockTimeCapsule()
      .accounts({
        recipient: recipient.publicKey,
        timeCapsule: timeCapsulePda,
        capsuleVault: capsuleVaultPda,
        globalState: globalStatePda,
        feeWallet: feeWallet.publicKey,
      })
      .signers([recipient])
      .rpc();

    // 5. Verify
    const finalFeeWalletBalance = await provider.connection.getBalance(feeWallet.publicKey);

    const expectedFee = lockedSol.toNumber() * platformFeeBps / 10000;

    assert.equal(finalFeeWalletBalance - initialFeeWalletBalance, expectedFee);

    // Check capsule state
    capsule = await program.account.timeCapsule.fetch(timeCapsulePda);
    assert.ok(capsule.unlockedAt);
  });

  it("Transfers and Cancels a Time Capsule", async () => {
    // 1. Setup
    const recipient1 = anchor.web3.Keypair.generate();
    const recipient2 = anchor.web3.Keypair.generate();

    // Airdrop for profiles
    for (const r of [recipient1, recipient2]) {
      const sig = await provider.connection.requestAirdrop(r.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL);
      const lbh = await provider.connection.getLatestBlockhash();
      await provider.connection.confirmTransaction({ blockhash: lbh.blockhash, lastValidBlockHeight: lbh.lastValidBlockHeight, signature: sig });

      const [profilePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("user-profile"), r.publicKey.toBuffer()],
        program.programId
      );
      await program.methods.initializeUserProfile("user").accounts({
        user: r.publicKey,
      }).signers([r]).rpc();
    }

    const [recipient1Profile] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("user-profile"), recipient1.publicKey.toBuffer()], program.programId);
    const [recipient2Profile] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("user-profile"), recipient2.publicKey.toBuffer()], program.programId);

    // 2. Create Capsule
    const capsuleId = new anchor.BN(3);
    const [timeCapsulePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("time-capsule"), provider.wallet.publicKey.toBuffer(), capsuleId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );
    const [capsuleVaultPda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("capsule-vault"), timeCapsulePda.toBuffer()], program.programId);
    const [creatorProfilePda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("user-profile"), provider.wallet.publicKey.toBuffer()], program.programId);
    const [globalStatePda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("global-state")], program.programId);

    const unlockAt = new anchor.BN(Date.now() / 1000 + 1000);
    const lockedSol = new anchor.BN(0.1 * anchor.web3.LAMPORTS_PER_SOL);

    await program.methods.createTimeCapsule(
      capsuleId, "Transfer Me", "This capsule will be transferred", unlockAt, lockedSol, false, { personal: {} }
    ).accounts({
      creator: provider.wallet.publicKey, recipient: recipient1.publicKey,
    }).rpc();

    // 3. Transfer
    await program.methods.transferCapsuleRecipient(recipient2.publicKey)
      .accounts({
        creator: provider.wallet.publicKey,
        timeCapsule: timeCapsulePda,
        oldRecipientProfile: recipient1Profile,
        newRecipientProfile: recipient2Profile,
      })
      .rpc();

    let capsule = await program.account.timeCapsule.fetch(timeCapsulePda);
    assert.equal(capsule.recipient.toBase58(), recipient2.publicKey.toBase58());

    // 4. Cancel
    await program.methods.cancelTimeCapsule()
      .accounts({
        creator: provider.wallet.publicKey,
        timeCapsule: timeCapsulePda,
        capsuleVault: capsuleVaultPda,
        recipientProfile: recipient2Profile,
        globalState: globalStatePda,
      })
      .rpc();

    // Verify
    capsule = await program.account.timeCapsule.fetch(timeCapsulePda);
    assert.ok(capsule.isCancelled);

    const vaultAccount = await provider.connection.getAccountInfo(capsuleVaultPda);
    assert.isNull(vaultAccount);
  });

  it("Fails to create capsule with past unlock date", async () => {
    const capsuleId = new anchor.BN(4);
    const [timeCapsulePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("time-capsule"), provider.wallet.publicKey.toBuffer(), capsuleId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );
    const [capsuleVaultPda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("capsule-vault"), timeCapsulePda.toBuffer()], program.programId);
    const [creatorProfilePda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("user-profile"), provider.wallet.publicKey.toBuffer()], program.programId);
    const [globalStatePda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("global-state")], program.programId);

    // Past date
    const unlockAt = new anchor.BN(Math.floor(Date.now() / 1000) - 100);
    const lockedSol = new anchor.BN(0.1 * anchor.web3.LAMPORTS_PER_SOL);

    try {
      await program.methods.createTimeCapsule(
        capsuleId, "Past Date", "This should fail", unlockAt, lockedSol, false, { personal: {} }
      ).accounts({
        creator: provider.wallet.publicKey, recipient: provider.wallet.publicKey,
      }).rpc();
      assert.fail("Should have failed with InvalidUnlockDate");
    } catch (e: any) {
      assert.ok(e.message.includes("InvalidUnlockDate") || e.error?.errorCode?.code === "InvalidUnlockDate");
    }
  });

  it("Fails to unlock capsule early", async () => {
    const capsuleId = new anchor.BN(5);
    const [timeCapsulePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("time-capsule"), provider.wallet.publicKey.toBuffer(), capsuleId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );
    const [capsuleVaultPda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("capsule-vault"), timeCapsulePda.toBuffer()], program.programId);
    const [creatorProfilePda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("user-profile"), provider.wallet.publicKey.toBuffer()], program.programId);
    const [globalStatePda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("global-state")], program.programId);

    // Future date
    const unlockAt = new anchor.BN(Math.floor(Date.now() / 1000) + 10000);
    const lockedSol = new anchor.BN(0.1 * anchor.web3.LAMPORTS_PER_SOL);

    await program.methods.createTimeCapsule(
      capsuleId, "Early Unlock", "This capsule is locked far in the future", unlockAt, lockedSol, false, { personal: {} }
    ).accounts({
      creator: provider.wallet.publicKey, recipient: provider.wallet.publicKey,
    }).rpc();

    try {
      await program.methods.unlockTimeCapsule()
        .accounts({
          recipient: provider.wallet.publicKey,
          timeCapsule: timeCapsulePda,
          capsuleVault: capsuleVaultPda,
          globalState: globalStatePda,
          feeWallet: feeWallet.publicKey,
        })
        .rpc();
      assert.fail("Should have failed with CapsuleStillLocked");
    } catch (e: any) {
      assert.ok(e.message.includes("CapsuleStillLocked") || e.error?.errorCode?.code === "CapsuleStillLocked");
    }
  });

  it("Fails unauthorized cancellation", async () => {
    const capsuleId = new anchor.BN(6);
    const [timeCapsulePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("time-capsule"), provider.wallet.publicKey.toBuffer(), capsuleId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );
    const [capsuleVaultPda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("capsule-vault"), timeCapsulePda.toBuffer()], program.programId);
    const [creatorProfilePda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("user-profile"), provider.wallet.publicKey.toBuffer()], program.programId);
    const [globalStatePda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("global-state")], program.programId);

    const unlockAt = new anchor.BN(Math.floor(Date.now() / 1000) + 10000);
    const lockedSol = new anchor.BN(0.1 * anchor.web3.LAMPORTS_PER_SOL);

    await program.methods.createTimeCapsule(
      capsuleId, "Unauthorized Cancel", "Testing unauthorized access", unlockAt, lockedSol, false, { personal: {} }
    ).accounts({
      creator: provider.wallet.publicKey, recipient: provider.wallet.publicKey,
    }).rpc();

    const unauthorizedUser = anchor.web3.Keypair.generate();
    const sig = await provider.connection.requestAirdrop(unauthorizedUser.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL);
    const lbh = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({ blockhash: lbh.blockhash, lastValidBlockHeight: lbh.lastValidBlockHeight, signature: sig });

    try {
      await program.methods.cancelTimeCapsule()
        .accounts({
          creator: unauthorizedUser.publicKey, // Wrong creator
          timeCapsule: timeCapsulePda,
          capsuleVault: capsuleVaultPda,
        })
        .signers([unauthorizedUser])
        .rpc();
      assert.fail("Should have failed with constraint error (seeds mismatch)");
    } catch (e: any) {
      assert.ok(e);
    }
  });
});
