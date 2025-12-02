"use client";

import { Icon } from "@iconify/react";
import ClientWalletMultiButton from "./ClientWalletMultiButton";
import { useRotor } from "@/hooks/useRotor";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Sidebar() {
    const { userProfile, initializeUser, loading } = useRotor();
    const { connected } = useWallet();

    return (
        <nav className="fixed md:w-20 flex flex-col z-50 bg-slate-900/90 w-16 h-full border-sky-800/30 border-r pt-8 pb-8 top-0 left-0 shadow-2xl backdrop-blur-xl items-center">
            {/* Logo Icon */}
            <div className="mb-12 cursor-pointer" onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })}>
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
                    <Icon icon="solar:hourglass-bold-duotone" width="24" />
                </div>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col flex-1 w-full gap-x-8 gap-y-8 items-center">
                <button
                    onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })}
                    className="group relative w-10 h-10 flex items-center justify-center rounded-lg transition-all hover:bg-slate-800"
                >
                    <Icon
                        icon="solar:home-smile-bold-duotone"
                        className="text-slate-400 group-hover:text-cyan-400 transition-colors"
                        width="24"
                    />
                    <span className="absolute left-14 bg-slate-800 text-cyan-400 text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-mono pointer-events-none border border-sky-800 z-50">
                        Home
                    </span>
                </button>

                <button
                    onClick={() => document.getElementById('capsules')?.scrollIntoView({ behavior: 'smooth' })}
                    className="group relative w-10 h-10 flex items-center justify-center rounded-lg transition-all hover:bg-slate-800"
                >
                    <Icon
                        icon="solar:safe-square-bold-duotone"
                        className="text-slate-400 group-hover:text-cyan-400 transition-colors"
                        width="24"
                    />
                    <span className="absolute left-14 bg-slate-800 text-cyan-400 text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-mono pointer-events-none border border-sky-800 z-50">
                        Vaults
                    </span>
                </button>

                <button
                    onClick={() => document.getElementById('create')?.scrollIntoView({ behavior: 'smooth' })}
                    className="group relative w-10 h-10 flex items-center justify-center rounded-lg transition-all hover:bg-slate-800"
                >
                    <Icon
                        icon="solar:add-square-bold-duotone"
                        className="text-slate-400 group-hover:text-cyan-400 transition-colors"
                        width="24"
                    />
                    <span className="absolute left-14 bg-slate-800 text-cyan-400 text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-mono pointer-events-none border border-sky-800 z-50">
                        Create
                    </span>
                </button>
            </div>

            {/* User Profile / Connect Wallet */}
            <div className="mt-auto mb-8 flex flex-col items-center gap-4 w-full px-2">
                {connected && !userProfile && !loading && (
                    <button
                        onClick={() => {
                            const name = window.prompt("Enter your username:");
                            if (name) initializeUser(name);
                        }}
                        className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-white transition-colors"
                        title="Create Profile"
                    >
                        <Icon icon="solar:user-plus-bold-duotone" width="20" />
                    </button>
                )}
                {userProfile && (
                    <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-mono font-bold" title={userProfile.username}>
                        {userProfile.username.charAt(0).toUpperCase()}
                    </div>
                )}
                <div className="wallet-adapter-button-trigger overflow-hidden w-10 h-10 rounded-lg flex items-center justify-center hover:w-auto hover:px-4 transition-all duration-300 bg-slate-800 border border-slate-700 hover:border-cyan-500/50 absolute bottom-8 hover:z-50 hover:bg-slate-900">
                    <div className="opacity-0 hover:opacity-100 absolute inset-0 flex items-center justify-center pointer-events-none">
                        {/* Hidden text revealed on hover */}
                    </div>
                    <ClientWalletMultiButton />
                </div>
                {/* Placeholder icon for wallet when collapsed */}
                <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 pointer-events-none">
                    <Icon icon="solar:wallet-bold-duotone" width="20" />
                </div>
            </div>
        </nav>
    );
}
