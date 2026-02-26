import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export type ToastType = 'loading' | 'success' | 'error';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    progress?: number;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => string;
    updateToast: (id: string, progress: number) => void;
    hideToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type, progress: type === 'loading' ? 0 : undefined }]);

        if (type !== 'loading') {
            setTimeout(() => hideToast(id), 3000);
        }
        return id;
    };

    const updateToast = (id: string, progress: number) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, progress } : t));
    };

    const hideToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast, updateToast, hideToast }}>
            {children}
            <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-4 min-w-[320px]">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 100, opacity: 0 }}
                            className="bg-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-2"
                        >
                            <div className="flex items-center gap-3">
                                {toast.type === 'loading' && <Loader2 className="animate-spin text-blue-500" size={24} />}
                                {toast.type === 'success' && <CheckCircle2 className="text-green-500" size={24} />}
                                {toast.type === 'error' && <AlertCircle className="text-red-500" size={24} />}
                                <span className="font-mono font-black uppercase text-lg">{toast.message}</span>
                            </div>

                            {toast.type === 'loading' && (
                                <div className="w-full h-4 bg-gray-200 border-2 border-black overflow-hidden mt-1">
                                    <motion.div
                                        className="h-full bg-[#dfff00]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${toast.progress ?? 0}%` }}
                                    />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = React.useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
};
