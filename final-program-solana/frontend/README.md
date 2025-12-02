# ROTOR Frontend

The web interface for ROTOR. Built with Next.js, this dApp lets you create, view, and unlock time capsules on Solana. You can lock messages and SOL tokens until a future date, and unlock them when the time comes.

No backend server. No database.

## Features That Matter


### The Functional Stuff
- **Wallet Integration**: Connect with Phantom or Solflare 
- **Create Capsules**: Two-step wizard that's actually easy to use
- **Delete Capsules**: Reclaim rent from unlocked/cancelled capsules

## Tech Choices (And Why)

- **Next.js 15**: Latest version, using the App Router. Why? It's production-ready, performant, and the routing is actually intuitive now.
- **Anchor Client**: Type-safe interaction with the smart contract. Those auto-generated types save SO much debugging time.
- **LocalStorage**: Client-side caching with background revalidation. Solana RPC can be slow, so we cache aggressively while keeping data fresh.

## Getting Started

### You'll Need

- Node.js 18 or newer
- Yarn (npm works too, but the lockfile is yarn)
- A Phantom or Solflare wallet with some Devnet SOL

### Installation

```bash
cd frontend
yarn install
```

### Running Locally

```bash
yarn dev
```

Then open [http://localhost:3000](http://localhost:3000). You should see the landing page. Connect your wallet and you're good to go.

**First-time users**: You'll see a "Create Profile" button. Click it, choose a username, and sign the transaction. This is a one-time thing.

### Building for Production

```bash
yarn build
```

Creates an optimized production bundle in `.next/`. You can test it locally with `yarn start`.

## How State Management Works

We use a context provider (`RotorContext`) that wraps the entire app. It handles:
- Connecting to the Solana program
- Fetching your user profile and capsules
- Caching data in LocalStorage
- Optimistic updates for instant UI feedback
- Retry logic for failed RPC calls

When you create a capsule, we immediately add it to the state and update the cache. Then we send the transaction in the background. If it fails, we remove it. If it succeeds, we update it with the real data. This makes the app feel instant even though blockchain transactions take time.

## Project Structure

```
src/
├── app/
│   ├── globals.css       # Custom CSS animations, cyber card styles
│   ├── layout.tsx        # Root layout with providers
│   └── page.tsx          # Landing page
├── components/
│   ├── CapsuleCard.tsx   # Individual capsule display 
│   ├── CapsuleGrid.tsx   # Grid of all your capsules
│   ├── CreateWizard.tsx  # 2-step capsule creation flow
│   ├── Hero.tsx          # Landing section
│   ├── TopNavbar.tsx     # Navigation + wallet button
│   └── ...
├── contexts/
│   └── RotorContext.tsx  # Main state management 
├── hooks/
│   └── useRotor.tsx      # Re-export of context hook
└── types/
    ├── rotor.json        # Auto-generated IDL
    └── rotor.ts          # Auto-generated types
```

## Environment Setup

The program ID is hardcoded in `WalletContextProvider.tsx`:
```typescript
const network = WalletAdapterNetwork.Devnet;
```

To switch to mainnet or a different program:
1. Change the network in `WalletContextProvider.tsx`
2. Update the IDL and types in `src/types/`
3. Update the program ID reference if needed

## Common Issues

### "User profile not found"
You haven't created a profile yet. Click the "Create Profile" button in the navbar.

### "Transaction simulation failed"
Usually means you don't have enough SOL. Make sure you have at least 0.1 SOL for rent + capsule amount.

## Contributing

Found a bug? Have a feature idea? submit a PR.