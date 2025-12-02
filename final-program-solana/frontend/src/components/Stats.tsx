"use client";

import { Icon } from "@iconify/react";
import FadeIn from "./FadeIn";
import { useRotor } from "@/hooks/useRotor";
import { useMemo, useState, useEffect } from "react";

export default function Stats() {
    const { capsules } = useRotor();
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const stats = useMemo(() => {
        const totalVaults = capsules.length;

        const nextUnlock = capsules
            .filter(c => !c.isUnlocked && c.unlockAt.toNumber() * 1000 > now)
            .sort((a, b) => a.unlockAt.toNumber() - b.unlockAt.toNumber())[0];

        let nextUnlockTime = "N/A";
        if (nextUnlock) {
            const diff = (nextUnlock.unlockAt.toNumber() * 1000) - now;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            nextUnlockTime = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }

        const totalAssets = capsules.reduce((acc, c) => acc + (c.lockedSol.toNumber() / 1_000_000_000), 0);

        return {
            totalVaults,
            nextUnlockTime,
            totalAssets: totalAssets.toFixed(2)
        };
    }, [capsules, now]);

    return (
        <section className="px-6 md:px-16 py-12 w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FadeIn delay={0.2} className="w-full">
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm hover:border-cyan-500/30 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                                <Icon icon="solar:safe-square-bold-duotone" width="32" />
                            </div>
                            <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                                TOTAL
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1 font-mono">
                            {stats.totalVaults}
                        </div>
                        <div className="text-sm text-slate-400">Vaults Created</div>
                    </div>
                </FadeIn>

                <FadeIn delay={0.3} className="w-full">
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm hover:border-purple-500/30 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                                <Icon icon="solar:clock-circle-bold-duotone" width="32" />
                            </div>
                            <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                                UPCOMING
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1 font-mono">
                            {stats.nextUnlockTime}
                        </div>
                        <div className="text-sm text-slate-400">Next Global Unlock</div>
                    </div>
                </FadeIn>

                <FadeIn delay={0.4} className="w-full">
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm hover:border-emerald-500/30 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                                <Icon icon="solar:shield-check-bold-duotone" width="32" />
                            </div>
                            <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                                SECURED
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1 font-mono">
                            {stats.totalAssets} SOL
                        </div>
                        <div className="text-sm text-slate-400">Assets Secured</div>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}
