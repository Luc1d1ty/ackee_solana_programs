"use client";

import { Icon } from "@iconify/react";
import { BN } from "@coral-xyz/anchor";
import { useState, useEffect } from "react";

interface CapsuleCardProps {
    capsule: {
        capsuleId: BN;
        title: string;
        message: string;
        unlockAt: BN;
        unlockedAt: BN | null;
        createdAt: BN;
        owner: any;
        capsuleType: any;
    };
    loading: boolean;
    onUnlock: (id: BN) => void;
    onDelete: (id: BN) => void;
}

export default function CapsuleCard({ capsule, loading, onUnlock, onDelete }: CapsuleCardProps) {
    const [now, setNow] = useState(Date.now() / 1000);

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now() / 1000), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTimeRemaining = (unlockAt: BN) => {
        const diff = unlockAt.toNumber() - now;

        if (diff <= 0) return "READY";

        const days = Math.floor(diff / 86400);
        const hours = Math.floor((diff % 86400) / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = Math.floor(diff % 60);

        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    };

    const isReady = now >= capsule.unlockAt.toNumber();
    const isUnlocked = capsule.unlockedAt !== null;

    // Generate trackers for 3D tilt effect
    const trackers = Array.from({ length: 25 }, (_, i) => (
        <div key={i} className={`tracker tr-${i + 1}`}></div>
    ));

    if (isUnlocked) {
        return (
            <div className="border border-emerald-500/30 bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 md:p-8 h-full flex flex-col relative shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Icon icon="solar:check-circle-bold-duotone" width="24" />
                    </div>
                    <span className="px-3 py-1 rounded text-[10px] font-mono font-bold tracking-widest bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                        OPENED
                    </span>
                </div>
                <h3 className="text-xl text-white font-semibold mb-2">{capsule.title}</h3>
                <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800 mb-4">
                    <p className="text-slate-300 font-mono text-sm whitespace-pre-wrap break-words">
                        {capsule.message}
                    </p>
                </div>
                <div className="flex justify-between items-center mt-auto">
                    <p className="text-slate-500 text-xs">
                        Unlocked on {new Date(capsule.unlockedAt!.toNumber() * 1000).toLocaleDateString()}
                    </p>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(capsule.capsuleId);
                        }}
                        disabled={loading}
                        className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-bold hover:bg-red-500 hover:text-white transition-colors flex items-center gap-1"
                    >
                        <Icon icon="solar:trash-bin-trash-bold" width="14" />
                        DELETE
                    </button>
                </div>
            </div>
        );
    }

    if (isReady) {
        return (
            <div className="relative h-full group hover:-translate-y-2 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="border border-amber-500/30 bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 md:p-8 h-full flex flex-col relative shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                            <Icon icon="solar:confetti-minimalistic-bold-duotone" width="24" />
                        </div>
                        <span className="px-3 py-1 rounded text-[10px] font-mono font-bold tracking-widest bg-amber-950 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)] animate-pulse">
                            READY
                        </span>
                    </div>
                    <h3 className="text-xl text-white font-semibold mb-2">{capsule.title}</h3>
                    <p className="text-slate-400 text-sm mb-8">Time to open your capsule.</p>
                    <div className="mt-auto">
                        <button
                            onClick={() => onUnlock(capsule.capsuleId)}
                            disabled={loading}
                            className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white font-mono font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 group-btn"
                        >
                            <Icon icon="solar:key-minimalistic-square-3-bold-duotone" className="animate-bounce" />
                            UNLOCK NOW
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // LOCKED STATE - CYBER CARD DESIGN
    return (
        <div className="cyber-card-container h-full">
            <div className="cyber-card-canvas">
                {trackers}
                <div className="cyber-card">
                    <div className="cyber-card-content">
                        <div className="cyber-card-glare" />
                        <div className="cyber-lines">
                            <span /><span /><span /><span />
                        </div>

                        {/* Header */}
                        <div className="flex justify-between items-start mb-6 relative z-10 w-full">
                            <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 transition-colors">
                                <Icon icon="solar:lock-keyhole-bold-duotone" width="24" />
                            </div>
                            <span className="px-3 py-1 rounded text-[10px] font-mono font-bold tracking-widest bg-slate-900/80 text-slate-400 border border-slate-700/50 backdrop-blur-sm">
                                LOCKED
                            </span>
                        </div>

                        {/* Title & Date */}
                        <h3 className="text-xl text-white font-semibold mb-2 relative z-10">{capsule.title}</h3>
                        <p className="text-slate-400 text-sm mb-8 line-clamp-2 relative z-10">
                            Unlocks on {new Date(capsule.unlockAt.toNumber() * 1000).toLocaleDateString()}
                        </p>

                        {/* Glowing Elements (Background) */}
                        <div className="glowing-elements">
                            <div className="glow-1" />
                            <div className="glow-2" />
                            <div className="glow-3" />
                        </div>

                        {/* Corner Elements */}
                        <div className="corner-elements">
                            <span /><span /><span /><span />
                        </div>

                        {/* Scan Line */}
                        <div className="scan-line" />

                        {/* Footer (Timer) */}
                        <div className="mt-auto bg-slate-950/80 backdrop-blur-sm rounded-lg p-4 border border-slate-800/50 relative z-10 w-full">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-mono text-slate-500 uppercase">Time Remaining</span>
                                <Icon icon="solar:clock-circle-linear" className="text-cyan-500 text-xs" />
                            </div>
                            <div className="font-mono text-xl md:text-2xl text-cyan-400 tabular-nums tracking-tight">
                                {formatTimeRemaining(capsule.unlockAt)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
