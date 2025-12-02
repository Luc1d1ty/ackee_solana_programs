"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

interface UnlockModalProps {
    isOpen: boolean;
    onClose: () => void;
    message?: string;
}

export default function UnlockModal({ isOpen, onClose, message }: UnlockModalProps) {
    const [stage, setStage] = useState<"initial" | "shaking" | "exploding" | "revealed">("initial");

    useEffect(() => {
        if (isOpen) {
            setStage("initial");
            const t1 = setTimeout(() => setStage("shaking"), 500);
            const t2 = setTimeout(() => setStage("exploding"), 2000);
            const t3 = setTimeout(() => setStage("revealed"), 2500);

            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
                clearTimeout(t3);
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl transition-opacity duration-500 animate-in fade-in"
                onClick={stage === "revealed" ? onClose : undefined}
            ></div>

            {/* Content Container */}
            <div className="relative z-10 max-w-lg w-full text-center">

                {/* Animation Stage: Initial/Shaking */}
                {(stage === "initial" || stage === "shaking") && (
                    <div className={`relative inline-block ${stage === "shaking" ? "animate-shake" : ""}`}>
                        <div className="w-32 h-32 rounded-2xl bg-slate-800 border-2 border-cyan-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                            <Icon icon="solar:lock-keyhole-bold-duotone" width="64" className="text-cyan-400" />
                        </div>
                        {stage === "shaking" && (
                            <div className="absolute inset-0 border-2 border-cyan-400 rounded-2xl animate-ping opacity-50"></div>
                        )}
                    </div>
                )}

                {/* Animation Stage: Exploding */}
                {stage === "exploding" && (
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-white rounded-full blur-[100px] animate-pulse scale-150"></div>
                        <div className="w-32 h-32 flex items-center justify-center">
                            <Icon icon="solar:star-bold-duotone" width="120" className="text-white animate-spin-slow" />
                        </div>
                    </div>
                )}

                {/* Animation Stage: Revealed */}
                {stage === "revealed" && (
                    <div className="animate-float">
                        <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl p-8 shadow-[0_0_100px_rgba(6,182,212,0.3)] relative overflow-hidden">
                            {/* Confetti/Particles (CSS) */}
                            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                                <div className="absolute top-0 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ animationDuration: '1s' }}></div>
                                <div className="absolute top-10 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDuration: '1.5s' }}></div>
                                <div className="absolute bottom-10 left-1/3 w-2 h-2 bg-emerald-400 rounded-full animate-ping" style={{ animationDuration: '1.2s' }}></div>
                            </div>

                            <div className="w-16 h-16 mx-auto bg-cyan-500/20 rounded-full flex items-center justify-center mb-6 text-cyan-400">
                                <Icon icon="solar:lock-unlocked-bold-duotone" width="32" />
                            </div>

                            <h2 className="text-3xl font-bold text-white mb-2 font-mono">CAPSULE OPENED</h2>
                            <p className="text-slate-400 mb-8">The timeline has been bridged.</p>

                            <div className="bg-slate-950/50 rounded-xl p-6 border border-slate-800 mb-8">
                                <p className="font-mono text-cyan-300 text-lg break-words">
                                    {message || "Secret Message Decrypted..."}
                                </p>
                            </div>

                            <button
                                onClick={onClose}
                                className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors w-full shadow-lg shadow-cyan-500/20"
                            >
                                CLAIM ASSETS
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
