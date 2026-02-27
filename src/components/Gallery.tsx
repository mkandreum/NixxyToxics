import { motion, AnimatePresence } from "motion/react";
import React, { useEffect, useState } from "react";
import { X, Maximize2 } from "lucide-react";

export default function Gallery() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bgVideo, setBgVideo] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch photos
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setPhotos(data.map((p: any) => p.url));
        }
      })
      .catch(err => console.error("Error fetching gallery:", err))
      .finally(() => setIsLoading(false));

    // Fetch background video setting
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.gallery_bg_video) {
          setBgVideo(data.gallery_bg_video);
        }
      })
      .catch(err => console.error("Error fetching bg video:", err));
  }, []);

  return (
    <section id="gallery" className="relative py-24 px-4 md:px-8 border-b-8 border-black bg-[#d9ff36] overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
        <div className="absolute top-10 left-[10%] text-6xl rotate-12 font-black uppercase whitespace-nowrap">Toxic Bitch</div>
        <div className="absolute bottom-20 right-[5%] text-8xl -rotate-6 font-black uppercase text-[#ff00ff]">Gallery</div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] font-black opacity-[0.03]">NIXXY</div>
      </div>

      {bgVideo && (
        <video
          src={bgVideo}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-multiply pointer-events-none"
        />
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-24 text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center"
          >
            <h2 className="text-[18vw] md:text-[12vw] leading-none uppercase tracking-tighter font-mono font-black italic glitch-text flex flex-col items-center">
              <span className="bg-black text-[#d9ff36] px-10 py-4 -rotate-2 shadow-[12px_12px_0px_0px_#ff00ff] transform hover:rotate-0 transition-transform duration-300">Toxic</span>
              <span className="text-[#ff00ff] -mt-6 md:-mt-10 drop-shadow-[4px_4px_0px_black]">Gallery</span>
            </h2>
          </motion.div>

          {/* Decoration Sticker */}
          <motion.div
            animate={{ rotate: [12, 15, 12], scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 md:right-[15%] bg-[#ff00ff] text-white border-4 border-black p-4 rotate-12 shadow-[8px_8px_0px_0px_black] hidden sm:block z-20"
          >
            <span className="font-black text-2xl uppercase italic">No Photos! ⚡</span>
          </motion.div>
        </div>

        {/* Masonry Columns Layout */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
          {photos.length === 0 && !isLoading ? (
            <div className="col-span-full text-center py-32 border-8 border-black border-dashed opacity-40 uppercase text-5xl font-black italic rotate-1">
              No toxicity found yet...
            </div>
          ) : (
            photos.map((src, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50, rotate: i % 2 === 0 ? -1.5 : 1.5 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
                whileHover={{ rotate: 0, scale: 1.03, zIndex: 30, transition: { duration: 0.2 } }}
                className="relative group break-inside-avoid"
              >
                {/* Visual Tape Decor (randomly shown) */}
                {i % 3 === 0 && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-10 bg-black/10 backdrop-blur-sm -rotate-3 z-20 pointer-events-none flex items-center justify-center border-x-2 border-black/10">
                    <div className="w-full h-[1px] bg-white/20" />
                  </div>
                )}

                <div className="border-4 border-black p-3 bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[15px_15px_0px_0px_#ff00ff] transition-all duration-300">
                  <div
                    className="relative overflow-hidden border-2 border-black bg-gray-50 cursor-zoom-in"
                    onClick={() => setSelectedImage(src)}
                  >
                    <img
                      src={src}
                      alt={`Nixxy Toxic ${i}`}
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />

                    {/* Hover UI Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-[#d9ff36] text-black p-4 border-4 border-black rotate-[-10deg] shadow-[4px_4px_0px_0px_black] flex items-center gap-2 font-black uppercase">
                        <Maximize2 size={24} /> View
                      </div>
                    </div>
                  </div>
                </div>

                {/* Polaroid-style caption or badge */}
                {i % 4 === 0 && (
                  <div className="absolute -bottom-3 -left-3 bg-black text-[#d9ff36] text-xs font-black uppercase px-4 py-2 rotate-[-5deg] z-10 border-2 border-black shadow-[4px_4px_0px_0px_rgb(255,0,255)]">
                    Original Toxic
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12 bg-black/95 backdrop-blur-md"
            onClick={() => setSelectedImage(null)}
          >
            <motion.button
              className="absolute top-6 right-6 md:top-10 md:right-10 text-white hover:text-[#ff00ff] transition-colors z-[210] bg-black/50 p-2 border-2 border-white rounded-full"
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedImage(null)}
            >
              <X size={48} strokeWidth={3} />
            </motion.button>

            <motion.div
              initial={{ scale: 0.8, rotate: -3 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.8, rotate: 3 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-full max-h-full border-[6px] md:border-[12px] border-white shadow-[0_0_80px_rgba(255,0,255,0.4)] bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Selected Vision"
                className="max-w-[95vw] max-h-[85vh] object-contain shadow-2xl"
              />
              <div className="absolute -bottom-12 left-0 right-0 text-center text-[#ff00ff] font-black uppercase tracking-[0.3em] text-sm italic">
                Nixxy Toxic Visual Experience • {new Date().getFullYear()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
