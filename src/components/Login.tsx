import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Lock, ArrowLeft } from "lucide-react";

interface LoginProps {
    onLogin: () => void;
    onBack: () => void;
}

export default function Login({ onLogin, onBack }: LoginProps) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            if (res.ok) {
                const { token } = await res.json();
                localStorage.setItem('toxic_token', token);
                onLogin();
            } else {
                throw new Error('Invalid');
            }
        } catch (err) {
            setError(true);
            setTimeout(() => setError(false), 500);
        }
    };

    return (
        <div className="min-h-screen flex items-start md:items-center justify-center bg-[#d9ff36] p-4 pt-12 md:pt-4 font-mono">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md bg-white border-4 border-black p-8 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden"
            >
                {/* Background Glitch Elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-black opacity-10 animate-pulse" />

                <button
                    onClick={onBack}
                    className="mb-8 flex items-center gap-2 uppercase font-black hover:text-[#ff00ff] transition-colors group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to reality
                </button>

                <div className="text-center mb-12">
                    <h2 className="text-6xl font-logo uppercase leading-none mb-4">Admin</h2>
                    <p className="text-xl uppercase tracking-tighter">Enter the toxic zone</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-2xl uppercase font-black">Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className={`w-full border-4 border-black p-4 text-2xl outline-none focus:bg-[#d9ff36]/10 transition-colors ${error ? 'bg-red-100 border-red-500 text-red-500' : 'bg-white'}`}
                                autoFocus
                            />
                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30" />
                        </div>
                        {error && <p className="text-red-500 font-black uppercase text-sm animate-bounce">Access Denied, Bitch!</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-black text-[#d9ff36] py-4 text-3xl uppercase font-black border-4 border-black hover:bg-[#d9ff36] hover:text-black transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] active:shadow-none active:translate-x-1 active:translate-y-1"
                    >
                        Unlock Panel
                    </button>
                </form>

                <div className="mt-12 pt-8 border-t-2 border-black/10 text-center opacity-30 text-xs uppercase">
                    Unauthorized access is strictly toxic
                </div>
            </motion.div>
        </div>
    );
}
