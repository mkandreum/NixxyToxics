import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, ArrowRight, Instagram } from "lucide-react";
import { useEffect, useState } from "react";

export default function Hero() {
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(setSettings)
      .catch(err => console.error("Error fetching hero settings:", err));
  }, []);

  const phrase = settings.hero_phrase || "It's Nixxy Toxic Bitch!";
  const imageUrl = settings.hero_image_url;

  return (
    <section className="relative min-h-[80vh] flex flex-col items-center justify-center overflow-hidden py-12 px-4">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* No color glows to avoid mixing greens */}
      </div>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Text Content */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", duration: 1 }}
          >
            <h1 className="text-6xl md:text-8xl xl:text-9xl font-logo signature-toxic leading-none mb-8 tracking-tighter">
              {phrase.split(' ').map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="inline-block mr-4 last:mr-0"
                >
                  {word}
                </motion.span>
              ))}
            </h1>
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col gap-6 mt-8 w-full sm:w-auto"
          >
            {settings.instagram_url && (
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-[#ff00ff] text-white px-10 py-5 text-2xl uppercase font-black border-4 border-black hover:bg-black hover:text-[#ff00ff] transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-4 hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                <Instagram size={28} />
                Instagram
                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </a>
            )}

            <a
              href="#store"
              className="group bg-black text-[#d9ff36] px-10 py-5 text-2xl uppercase font-black border-4 border-black hover:bg-[#ff00ff] hover:text-white transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-4 hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              <ShoppingBag size={28} />
              Grab Merch
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </a>

            <a
              href="#gallery"
              className="bg-white text-black px-10 py-5 text-2xl uppercase font-black border-4 border-black hover:bg-[#d9ff36] transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              See Life
            </a>
          </motion.div>
        </div>

        {/* Hero Image */}
        <div className="relative order-1 lg:order-2 flex justify-center items-center">
          <AnimatePresence mode="wait">
            {imageUrl ? (
              <motion.div
                key="image"
                initial={{ scale: 0.8, opacity: 0, rotate: 10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.4, duration: 1.5 }}
                className="relative z-10 w-full max-w-[500px] aspect-[4/5] md:aspect-auto"
              >
                {/* Decorative background for image */}
                <div className="absolute inset-0 bg-black border-4 border-black translate-x-4 translate-y-4 -z-1" />
                <div className="absolute inset-0 border-4 border-black bg-white -z-1" />

                <img
                  src={imageUrl}
                  alt="Nixxy Toxic"
                  className="w-full h-full object-cover"
                />

                {/* Floating tags */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 -right-6 bg-[#ff00ff] text-white px-6 py-3 border-4 border-black text-2xl font-black uppercase -rotate-6 shadow-lg"
                >
                  Pure Toxic
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute -bottom-6 -left-6 bg-[#d9ff36] text-black px-6 py-3 border-4 border-black text-2xl font-black uppercase rotate-3 shadow-lg"
                >
                  BITCH!
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full max-w-[500px] aspect-square border-8 border-black border-dashed flex items-center justify-center bg-black/5"
              >
                <p className="text-4xl font-black uppercase opacity-20 rotate-12">No Hero Image Bitch!</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Abstract shapes behind image */}
          <div className="absolute inset-0 flex items-center justify-center -z-1 opacity-20">
            <div className="w-[120%] h-[120%] border-[20px] border-black rounded-full animate-spin-slow pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-black flex flex-col items-center gap-2 opacity-30"
      >
        <span className="uppercase text-xs font-black tracking-widest">Scroll Down</span>
        <div className="w-1 h-12 bg-black rounded-full" />
      </motion.div>
    </section>
  );
}
