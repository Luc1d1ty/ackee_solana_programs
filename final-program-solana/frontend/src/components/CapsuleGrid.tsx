"use client";

import { Icon } from "@iconify/react";
import FadeIn from "./FadeIn";
import { useToast } from "@/components/ToastProvider";
import UnlockModal from "./UnlockModal";
import { useRotor } from "@/hooks/useRotor";
import { BN } from "@coral-xyz/anchor";
import { useState, useEffect } from "react";
import CapsuleCard from "./CapsuleCard";

export default function CapsuleGrid() {
    const { capsules, unlockTimeCapsule, deleteTimeCapsule, loading } = useRotor();
    const { showToast } = useToast();

    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [unlockedMessage, setUnlockedMessage] = useState("");

    const handleUnlock = async (id: BN) => {
        try {
            await unlockTimeCapsule(id);
            // Find the capsule to get its message
            const capsule = capsules.find(c => c.capsuleId.toString() === id.toString());
            setUnlockedMessage(capsule?.message || "Capsule unlocked!");
            setShowUnlockModal(true);
        } catch (e) {
            console.error(e);
            showToast("Failed to unlock capsule. Check console.", "error");
        }
    };

    const handleDelete = async (id: BN) => {
        if (!confirm("Are you sure you want to delete this capsule? This cannot be undone.")) return;

        try {
            await deleteTimeCapsule(id);
            showToast("Capsule deleted successfully!", "success");
        } catch (e) {
            console.error(e);
            showToast("Failed to delete capsule. Check console.", "error");
        }
    };

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

    const isReady = (unlockAt: BN) => {
        return now >= unlockAt.toNumber();
    };

    return (
        <section className="px-6 md:px-16 py-16 w-full max-w-7xl mx-auto">
            <FadeIn className="flex justify-between items-end mb-12">
                <div>
                    <h2 className="text-3xl md:text-4xl font-semibold text-white mb-2">
                        MY CAPSULES
                    </h2>
                    <p className="text-slate-400">Manage your time-locked assets.</p>
                </div>
                <div className="flex gap-4">
                    <button className="text-cyan-400 font-mono text-sm hover:text-white transition-colors flex items-center gap-2">
                        VIEW ALL
                        <Icon icon="solar:arrow-right-linear" />
                    </button>
                </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {capsules.length === 0 && (
                    <div className="col-span-full text-center py-20 text-slate-500 font-mono">
                        NO CAPSULES FOUND. CREATE ONE BELOW.
                    </div>
                )}

                {capsules.map((capsule, idx) => (
                    <FadeIn key={idx} delay={idx * 0.1} className="h-full">
                        <CapsuleCard
                            capsule={capsule}
                            loading={loading}
                            onUnlock={handleUnlock}
                            onDelete={handleDelete}
                        />
                    </FadeIn>
                ))}
            </div>

            <UnlockModal
                isOpen={showUnlockModal}
                onClose={() => setShowUnlockModal(false)}
                message={unlockedMessage}
            />
        </section>
    );
}
