"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { useRotor } from "@/hooks/useRotor";
import { useToast } from "@/components/ToastProvider";

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
    const { initializeUser, loading } = useRotor();
    const { showToast } = useToast();
    const [username, setUsername] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;

        try {
            await initializeUser(username);
            showToast("Welcome to ROTOR! Profile created.", "success");
            // Small delay for state updates 
            setTimeout(() => {
                onClose();
            }, 500);
        } catch (error) {
            console.error(error);
            showToast("Failed to create profile. Please try again.", "error");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6">
                        <Icon icon="solar:user-plus-bold-duotone" width="32" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Create Your Profile</h2>
                    <p className="text-slate-400">
                        To start using ROTOR, you need to register a username on the blockchain.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-mono text-slate-400 mb-2">USERNAME</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-white focus:border-cyan-500 focus:outline-none transition-colors font-mono"
                            placeholder="e.g. satoshi"
                            maxLength={20}
                            autoFocus
                        />
                        <p className="text-xs text-slate-500 mt-2 text-right">{username.length}/20</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !username.trim()}
                        className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold rounded-lg transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Icon icon="svg-spinners:ring-resize" />
                                CREATING...
                            </>
                        ) : (
                            <>
                                CREATE PROFILE
                                <Icon icon="solar:arrow-right-linear" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
