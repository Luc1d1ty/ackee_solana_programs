"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import ClientWalletMultiButton from "./ClientWalletMultiButton";
import { useRotor } from "@/hooks/useRotor";
import { useWallet } from "@solana/wallet-adapter-react";
import OnboardingModal from "./OnboardingModal";

export default function TopNavbar() {
    const { userProfile, loading } = useRotor();
    const { connected } = useWallet();
    const [showOnboarding, setShowOnboarding] = useState(false);

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-6 md:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <button
                            onClick={() => scrollToSection('hero')}
                            className="flex items-center gap-3 group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/50 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                                <Icon icon="solar:hourglass-bold-duotone" width="24" />
                            </div>
                            <span className="text-xl font-bold font-mono text-white tracking-tight">ROTOR</span>
                        </button>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center gap-8">
                            <button
                                onClick={() => scrollToSection('hero')}
                                className="nav-btn"
                            >
                                Home
                            </button>
                            <button
                                onClick={() => scrollToSection('capsules')}
                                className="nav-btn"
                            >
                                My Vaults
                            </button>
                            <button
                                onClick={() => scrollToSection('create')}
                                className="nav-btn"
                            >
                                Create
                            </button>
                        </div>

                        {/* Right Side: Profile + Wallet */}
                        <div className="flex items-center gap-4">
                            {connected && !userProfile && !loading && (
                                <button
                                    onClick={() => setShowOnboarding(true)}
                                    className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-white transition-colors font-mono text-sm flex items-center gap-2"
                                    title="Create Profile"
                                >
                                    <Icon icon="solar:user-plus-bold-duotone" width="18" />
                                    <span className="hidden sm:inline">Create Profile</span>
                                </button>
                            )}
                            {userProfile && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700">
                                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm">
                                        {userProfile.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-slate-300 font-mono text-sm hidden sm:inline">{userProfile.username}</span>
                                </div>
                            )}
                            <ClientWalletMultiButton />
                        </div>
                    </div>
                </div>
            </nav>

            <OnboardingModal
                isOpen={showOnboarding}
                onClose={() => setShowOnboarding(false)}
            />
        </>
    );
}
