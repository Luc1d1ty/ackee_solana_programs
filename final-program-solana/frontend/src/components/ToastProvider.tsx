"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { Icon } from "@iconify/react";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "info") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`
                            pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-md transition-all animate-in slide-in-from-right-full fade-in duration-300
                            ${toast.type === "success" ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : ""}
                            ${toast.type === "error" ? "bg-red-500/10 border-red-500/50 text-red-400" : ""}
                            ${toast.type === "info" ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400" : ""}
                        `}
                    >
                        <Icon
                            icon={
                                toast.type === "success" ? "solar:check-circle-bold" :
                                    toast.type === "error" ? "solar:danger-circle-bold" :
                                        "solar:info-circle-bold"
                            }
                            width="20"
                        />
                        <span className="font-mono text-sm font-medium">{toast.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
