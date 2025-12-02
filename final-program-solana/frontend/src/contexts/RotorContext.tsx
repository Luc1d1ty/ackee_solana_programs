"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback, ReactNode } from "react";
import {
    useAnchorWallet,
    useConnection,
    useWallet,
} from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { Rotor } from "@/types/rotor";
import idl from "@/types/rotor.json";

interface RotorContextType {
    program: Program<Rotor> | null;
    userProfile: any;
    capsules: any[];
    loading: boolean;
    initializeUser: (username: string) => Promise<void>;
    fetchUserProfile: () => Promise<void>;
    createTimeCapsule: (
        capsuleId: BN,
        title: string,
        message: string,
        unlockAt: BN,
        lockedSol: BN,
        isPublic: boolean
    ) => Promise<void>;
    unlockTimeCapsule: (capsuleId: BN) => Promise<void>;
    deleteTimeCapsule: (capsuleId: BN) => Promise<void>;
    fetchCapsules: () => Promise<void>;
}

const RotorContext = createContext<RotorContextType>({} as RotorContextType);



export function RotorProvider({ children }: { children: ReactNode }) {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const { publicKey } = useWallet();

    const [program, setProgram] = useState<Program<Rotor> | null>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [capsules, setCapsules] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const provider = useMemo(() => {
        if (!wallet) return null;
        return new AnchorProvider(connection, wallet, {
            preflightCommitment: "processed",
        });
    }, [connection, wallet]);

    useEffect(() => {
        if (provider) {
            const program = new Program(idl as any, provider) as Program<Rotor>;
            setProgram(program);
        }
    }, [provider]);

    const fetchWithRetry = async (fn: () => Promise<any>, retries = 5, delay = 2000) => {
        for (let i = 0; i < retries; i++) {
            try {
                return await fn();
            } catch (error: any) {
                const errorMsg = error?.message || error?.toString() || 'Unknown error';
                const is429 = errorMsg.includes("429");
                const isNetworkError = errorMsg.includes("fetch") || errorMsg.includes("network");

                // Retry on 429, network errors, or any RPC error
                if (i < retries - 1) {
                    const backoffDelay = delay * Math.pow(1.5, i);

                    await new Promise(resolve => setTimeout(resolve, backoffDelay));
                    continue;
                } else {

                    throw error;
                }
            }
        }
    };

    const fetchUserProfile = useCallback(async () => {
        if (!program || !publicKey) return;
        try {
            const [profilePda] = PublicKey.findProgramAddressSync(
                [Buffer.from("user-profile"), publicKey.toBuffer()],
                program.programId
            );

            await fetchWithRetry(async () => {
                const profile = await program.account.userProfile.fetch(profilePda);
                setUserProfile(profile);
            });
        } catch (e) {

            setUserProfile(null);
        }
    }, [program, publicKey]);

    // Load from cache immediately when publicKey changes
    const loadFromCache = useCallback(() => {
        if (!publicKey) return;

        const cacheKey = `rotor_capsules_${publicKey.toBase58()}`;
        try {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                const cachedCapsules = JSON.parse(cached);
                try {
                    const parsedCapsules = cachedCapsules.map((c: any) => {
                        try {
                            return {
                                ...c,
                                capsuleId: new BN(c.capsuleId),
                                lockedSol: new BN(c.lockedSol),
                                unlockAt: new BN(c.unlockAt),
                                createdAt: new BN(c.createdAt),
                                unlockedAt: c.unlockedAt ? new BN(c.unlockedAt) : null,
                                creator: new PublicKey(c.creator),
                                recipient: new PublicKey(c.recipient),
                            };
                        } catch (parseError) {
                            return null;
                        }
                    }).filter(Boolean);

                    if (parsedCapsules.length > 0) {
                        setCapsules(parsedCapsules);
                    }
                } catch (conversionError) {

                    localStorage.removeItem(cacheKey);
                }
            }
        } catch (e) {

        }
    }, [publicKey]);

    // Initial cache load
    useEffect(() => {
        loadFromCache();
    }, [loadFromCache]);

    const updateCache = useCallback((updatedCapsules: any[]) => {
        if (!publicKey) return;
        const cacheKey = `rotor_capsules_${publicKey.toBase58()}`;
        try {
            const serializable = updatedCapsules.map((c: any) => ({
                ...c,
                capsuleId: c.capsuleId.toString(),
                lockedSol: c.lockedSol.toString(),
                unlockAt: c.unlockAt.toString(),
                createdAt: c.createdAt.toString(),
                unlockedAt: c.unlockedAt ? c.unlockedAt.toString() : null,
                creator: c.creator.toString(),
                recipient: c.recipient.toString(),
            }));
            localStorage.setItem(cacheKey, JSON.stringify(serializable));
        } catch (e) {
            // Silent fail
        }
    }, [publicKey]);

    const fetchCapsules = useCallback(async () => {
        if (!publicKey) return;

        // Ensure cache is loaded first
        loadFromCache();

        if (!program) {
            return;
        }

        const cacheKey = `rotor_capsules_${publicKey.toBase58()}`;
        const lastFetchKey = `rotor_last_fetch_${publicKey.toBase58()}`;

        // Check cooldown
        const lastFetchTime = localStorage.getItem(lastFetchKey);
        if (lastFetchTime) {
            const timeSinceLastFetch = Date.now() - parseInt(lastFetchTime);
            const cooldownMs = 30000; // 30 seconds
            if (timeSinceLastFetch < cooldownMs) {
                return;
            }
        }



        try {
            await fetchWithRetry(async () => {
                const allCapsules = await program.account.timeCapsule.all();
                const userCapsules = allCapsules.filter((c: any) =>
                    c.account.creator.toString() === publicKey.toString()
                );



                const capsulesData = userCapsules.map(c => c.account);
                setCapsules(capsulesData);

                // Save to cache
                updateCache(capsulesData);
                try {
                    localStorage.setItem(lastFetchKey, Date.now().toString());
                } catch (e) {
                    // Silent fail
                }
            });
        } catch (e: any) {

        }
    }, [program, publicKey, loadFromCache]);

    // Initial fetch
    useEffect(() => {
        if (program && publicKey) {
            fetchUserProfile();
            fetchCapsules();
        } else if (!publicKey) {
            setUserProfile(null);
            setCapsules([]);
        }
    }, [program, publicKey, fetchUserProfile, fetchCapsules]);

    const initializeUser = async (username: string) => {
        if (!program || !publicKey) return;
        try {
            setLoading(true);
            const [profilePda] = PublicKey.findProgramAddressSync(
                [Buffer.from("user-profile"), publicKey.toBuffer()],
                program.programId
            );

            await program.methods
                .initializeUserProfile(username)
                .accounts({
                    user: publicKey,
                })
                .rpc();

            //Not Optimistic update. wait for user profile to be update
            await new Promise(resolve => setTimeout(resolve, 2000));
            await fetchUserProfile();
        } catch (error) {

            throw error;
        } finally {
            setLoading(false);
        }
    };

    const createTimeCapsule = async (
        capsuleId: BN,
        title: string,
        message: string,
        unlockAt: BN,
        lockedSol: BN,
        isPublic: boolean
    ) => {
        if (!program || !publicKey) return;
        try {
            setLoading(true);

            const [timeCapsulePda] = PublicKey.findProgramAddressSync(
                [Buffer.from("time-capsule"), publicKey.toBuffer(), capsuleId.toArrayLike(Buffer, "le", 8)],
                program.programId
            );

            // Assuming self-recipient for simplicity (demo)
            const recipient = publicKey;

            await program.methods.createTimeCapsule(
                capsuleId,
                title,
                message,
                unlockAt,
                lockedSol,
                isPublic,
                { personal: {} } // Default type
            ).accounts({
                creator: publicKey,
                recipient: recipient,
            }).rpc();

            // Optimistic Update
            const newCapsule = {
                capsuleId,
                creator: publicKey,
                recipient: recipient,
                title,
                message,
                unlockAt,
                lockedSol,
                isPublic,
                capsuleType: { personal: {} },
                unlockedAt: null,
                createdAt: new BN(Date.now() / 1000),
            };
            const updatedCapsules = [...capsules, newCapsule];
            setCapsules(updatedCapsules);

            // Update Cache Immediately
            updateCache(updatedCapsules);

            // Background sync
            setTimeout(() => fetchCapsules(), 5000);
        } catch (error) {

            throw error;
        } finally {
            setLoading(false);
        }
    };

    const unlockTimeCapsule = async (capsuleId: BN) => {
        if (!program || !publicKey) return;
        try {
            setLoading(true);

            const [timeCapsulePda] = PublicKey.findProgramAddressSync(
                [Buffer.from("time-capsule"), publicKey.toBuffer(), capsuleId.toArrayLike(Buffer, "le", 8)],
                program.programId
            );
            const [capsuleVaultPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("capsule-vault"), timeCapsulePda.toBuffer()],
                program.programId
            );
            const [globalStatePda] = PublicKey.findProgramAddressSync(
                [Buffer.from("global-state")],
                program.programId
            );

            // Fetch global state to get fee wallet
            const globalState = await program.account.globalState.fetch(globalStatePda);
            const feeWalletPubkey = globalState.feeWallet;

            await program.methods.unlockTimeCapsule()
                .accounts({
                    recipient: publicKey,
                    timeCapsule: timeCapsulePda,
                    capsuleVault: capsuleVaultPda,
                    globalState: globalStatePda,
                    feeWallet: feeWalletPubkey,
                })
                .rpc();

            // Optimistic Update
            const updatedCapsules = capsules.map(c =>
                c.capsuleId.toString() === capsuleId.toString()
                    ? { ...c, unlockedAt: new BN(Date.now() / 1000) }
                    : c
            );
            setCapsules(updatedCapsules);

            // Update Cache Immediately
            updateCache(updatedCapsules);

            // Background sync
            setTimeout(() => fetchCapsules(), 5000);
        } catch (error) {

            throw error;
        } finally {
            setLoading(false);
        }
    };

    const deleteTimeCapsule = async (capsuleId: BN) => {
        if (!program || !publicKey) return;
        try {
            setLoading(true);
            const [timeCapsulePda] = PublicKey.findProgramAddressSync(
                [Buffer.from("time-capsule"), publicKey.toBuffer(), capsuleId.toArrayLike(Buffer, "le", 8)],
                program.programId
            );

            await program.methods
                .deleteTimeCapsule()
                .accounts({
                    creator: publicKey,
                    timeCapsule: timeCapsulePda,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            // Optimistic Update
            const updatedCapsules = capsules.filter(c => c.capsuleId.toString() !== capsuleId.toString());
            setCapsules(updatedCapsules);

            // Update Cache Immediately
            updateCache(updatedCapsules);

            // Background sync
            setTimeout(() => fetchCapsules(), 5000);
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const value = {
        program,
        userProfile,
        capsules,
        loading,
        initializeUser,
        fetchUserProfile,
        createTimeCapsule,
        unlockTimeCapsule,
        deleteTimeCapsule,
        fetchCapsules,
    };



    return (
        <RotorContext.Provider value={value}>
            {children}
        </RotorContext.Provider>
    );
}

export const useRotor = () => useContext(RotorContext);
