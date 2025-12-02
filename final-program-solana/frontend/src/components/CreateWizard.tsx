"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import FadeIn from "./FadeIn";
import { useRotor } from "@/hooks/useRotor";
import { BN } from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";

import { useToast } from "@/components/ToastProvider";

export default function CreateWizard() {
    const { createTimeCapsule, loading } = useRotor();
    const { connected } = useWallet();
    const { showToast } = useToast();

    const [step, setStep] = useState(1);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [amount, setAmount] = useState("");
    const [unlockDate, setUnlockDate] = useState("");

    const handleCreate = async () => {
        if (!connected) return showToast("Please connect your wallet first!", "error");

        try {
            const capsuleId = new BN(Date.now()); // Simple ID generation
            const unlockTime = new BN(Math.floor(new Date(unlockDate).getTime() / 1000));
            const lockedSol = new BN(parseFloat(amount || "0") * 1_000_000_000); // Convert SOL to lamports

            await createTimeCapsule(
                capsuleId,
                title,
                message,
                unlockTime,
                lockedSol,
                true // isPublic
            );

            showToast("Capsule created successfully!", "success");

            // Reset form
            setStep(1);
            setTitle("");
            setMessage("");
            setAmount("");
            setUnlockDate("");
        } catch (e) {
            console.error(e);
            showToast("Failed to create capsule. See console.", "error");
        }
    };

    return (
        <section className="px-6 md:px-16 py-20 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-sm relative">
            <div className="absolute left-0 top-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-900 to-transparent"></div>

            <div className="max-w-4xl mx-auto">
                <FadeIn className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
                        CREATE NEW CAPSULE
                    </h2>
                    <div className="flex justify-center items-center gap-4 text-sm font-mono text-slate-500">
                        <span className={step >= 1 ? "text-cyan-400" : ""}>01 CONTENT</span>
                        <span className="w-8 h-px bg-slate-700"></span>
                        <span className={step >= 2 ? "text-cyan-400" : ""}>02 LOCK</span>
                    </div>
                </FadeIn>

                {step === 1 && (
                    <FadeIn delay={1} className="max-w-2xl mx-auto space-y-6">
                        <div>
                            <label className="block text-sm font-mono text-slate-400 mb-2">TITLE</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                                placeholder="e.g. For my future self"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-mono text-slate-400 mb-2">MESSAGE</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none transition-colors h-32"
                                placeholder="Write your message here..."
                            ></textarea>
                        </div>
                    </FadeIn>
                )}

                {step === 2 && (
                    <FadeIn delay={1} className="max-w-2xl mx-auto space-y-6">
                        <div>
                            <label className="block text-sm font-mono text-slate-400 mb-2">UNLOCK DATE</label>
                            <input
                                type="datetime-local"
                                value={unlockDate}
                                onChange={(e) => setUnlockDate(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-mono text-slate-400 mb-2">LOCKED SOL (Optional)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                                placeholder="0.0"
                            />
                        </div>
                    </FadeIn>
                )}

                <FadeIn delay={2} className="mt-10 flex justify-end gap-4">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="px-6 py-3 text-slate-400 hover:text-white font-mono font-bold transition-colors"
                        >
                            BACK
                        </button>
                    )}

                    {step < 2 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                        >
                            NEXT STEP
                            <Icon icon="solar:arrow-right-linear" />
                        </button>
                    ) : (
                        <button
                            onClick={handleCreate}
                            disabled={loading}
                            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Icon icon="svg-spinners:ring-resize" />
                                    CREATING...
                                </>
                            ) : (
                                <>
                                    CREATE CAPSULE
                                    <Icon icon="solar:lock-keyhole-bold-duotone" />
                                </>
                            )}
                        </button>
                    )}
                </FadeIn>
            </div>
        </section>
    );
}
