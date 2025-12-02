import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Rotor } from "../target/types/rotor";

async function main() {
    // Configure the client to use devnet
    process.env.ANCHOR_PROVIDER_URL = "https://api.devnet.solana.com";
    process.env.ANCHOR_WALLET = process.env.HOME + "/.config/solana/id.json";

    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.Rotor as Program<Rotor>;

    const [globalStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("global-state")],
        program.programId
    );

    const feeWallet = provider.wallet.publicKey; // Set deployer as fee wallet for now

    console.log("Initializing Global State...");
    console.log("Global State PDA:", globalStatePda.toBase58());
    console.log("Fee Wallet:", feeWallet.toBase58());

    try {
        const tx = await program.methods
            .initializeGlobalState(100) // 1% fee
            .accounts({
                admin: provider.wallet.publicKey,
                feeWallet: feeWallet,
            })
            .rpc();

        console.log("Global State initialized! Tx:", tx);
    } catch (e: any) {
        if (e.message.includes("already in use")) {
            console.log("Global State already initialized.");
        } else {
            console.error("Error initializing Global State:", e);
        }
    }
}

main().then(
    () => process.exit(),
    (err) => {
        console.error(err);
        process.exit(-1);
    }
);
