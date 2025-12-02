# ROTOR Smart Contract

Welcome to the backend of ROTOR—a time capsule protocol that lets you lock messages and SOL tokens until a future date. Think of it as a blockchain-powered time vault where your secrets stay sealed until the moment you choose.Built on Solana using the Anchor framework, it's fast, secure, and immutable. Once you lock something in, not even you can peek inside until the unlock time hits.

Everything is enforced by the blockchain. No databases, no trust required, no "admin override" button. The code is the law.

## Core Features

- **Time-Locked Vaults**: Lock up messages and SOL until a timestamp you choose
- **User Profiles**: On-chain profiles that track your capsule stats
- **Transfer Ownership**: Change who gets to unlock the capsule (great for gifts!)
- **Cancellation**: Changed your mind? Cancel before unlock and get your SOL back
- **Platform Fees**: Small fee on unlock (configurable, currently 0.5%)
- **Delete After Unlock**: Clean up old capsules and reclaim rent

## Tech Stack

- **Solana** - The blockchain we're building on
- **Anchor** - Solana's development framework (makes life much easier)
- **Rust** - The language Solana programs are written in
- **TypeScript** - For tests and scripts

## Getting Started

### Prerequisites

You'll need these installed:
- Rust (latest stable)
- Solana CLI (v1.18+)
- Anchor CLI (v0.30+)
- Yarn or npm

If you're new to Solana development, I'd recommend going through the [Anchor Book](https://book.anchor-lang.com/) first. It'll save you hours of confusion.

### Installation

```bash
cd rotor
yarn install
```

### Building

```bash
anchor build
```

This spits out the compiled program and generates the IDL at `target/idl/rotor.json`. The IDL is basically a JSON description of your program that clients use to interact with it.

### Testing

We've got comprehensive tests covering both happy and unhappy paths:

```bash
anchor test
```

**What we're testing:**
- Creating user profiles (with validation)
- Creating capsules with various unlock times
- Unlocking at the right time (and failing when too early)
- Transferring ownership between users
- Cancellation and refunds
- Fee collection
- All the error cases you can think of

The tests run on a local validator, so they're fast and deterministic. No flaky network issues here.

## Deployment

Currently deployed on Devnet at:
```
GHLyEoD7GMM14KQj1ydEGExkvaNH3Y2P2X19NVN4DyPX
```

### Deploying Your Own

1. Make sure `Anchor.toml` points to your wallet and the right cluster
2. Build it: `anchor build`
3. Deploy: `anchor deploy`
4. Initialize global state (one-time): `yarn run init-global-state`

**Pro tip**: Global state initialization sets up the platform fee and fee wallet. Only the deployer can do this, and it can only be done once. Don't mess it up.

## How It Works (Quick Version)

1. **User creates a profile** - Stores their username and stats
2. **User creates a capsule** - Locks a message, optionally some SOL, sets unlock time
3. **Time passes...**
4. **Recipient unlocks** - Gets the message and SOL (minus platform fee)
5. **Optionally delete** - Clean up and reclaim rent

Everything is stored in PDAs (Program Derived Addresses). These are deterministic addresses derived from seeds, which means we can find accounts without storing addresses everywhere. Super efficient.

## File Structure

```
programs/rotor/src/
└── lib.rs          # The entire smart contract (562 lines)

tests/
└── rotor.ts        # Integration tests (8 test cases)

scripts/
└── init-global-state.ts  # One-time setup script
```

## Common Gotchas

- **Past Unlock Dates**: The program will reject capsules with unlock times in the past. Seems obvious, but you'd be surprised how often this trips people up in tests.
- **Fee Calculation**: Fees are in basis points (bps). 100 bps = 1%. Currently set to 50 bps = 0.5%.
- **PDA Bumps**: We store bump seeds in accounts for verification. Don't manually calculate them—let Anchor handle it.
- **Account Size**: TimeCapsule accounts are allocated 600 bytes. If you modify the struct, update the space allocation.

## Need Help?

Check out:
- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- The tests—they're basically usage examples

## License

Use it however you want. Just don't blame me if you lock your life savings until the year 2100.
