import { motion } from "motion/react";

export default function Marquee({ text, reverse = false, bg = "bg-black", textCol = "text-[#dfff00]" }: { text: string, reverse?: boolean, bg?: string, textCol?: string }) {
  return (
    <div className={`border-y-4 border-black ${bg} ${textCol} overflow-hidden py-4 flex whitespace-nowrap`}>
      <motion.div 
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 15 }}
        className="text-4xl md:text-6xl uppercase tracking-widest flex font-mono glitch-text"
      >
        <span>{text.repeat(10)}</span>
      </motion.div>
    </div>
  );
}
