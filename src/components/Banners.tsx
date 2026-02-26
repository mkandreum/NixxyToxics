import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface Banner {
    id: number;
    text: string;
    bg_color: string;
    text_color: string;
    active: number;
}

export default function Banners() {
    const [banners, setBanners] = useState<Banner[]>([]);

    useEffect(() => {
        fetch('/api/banners')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setBanners(data.filter(b => b.active === 1));
                }
            })
            .catch(err => console.error("Error fetching banners:", err));
    }, []);

    if (banners.length === 0) return null;

    return (
        <div className="fixed top-0 left-0 w-full z-[100] flex flex-col pointer-events-none">
            <AnimatePresence>
                {banners.map((banner, i) => (
                    <motion.div
                        key={banner.id}
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className="w-full py-2 px-4 shadow-lg flex justify-center items-center pointer-events-auto border-b-2 border-black"
                        style={{ backgroundColor: banner.bg_color, color: banner.text_color }}
                    >
                        <p className="text-sm md:text-lg uppercase font-black text-center tracking-widest px-8">
                            {banner.text}
                        </p>
                        <button
                            onClick={() => setBanners(prev => prev.filter(b => b.id !== banner.id))}
                            className="absolute right-4 hover:scale-110 transition-transform"
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
