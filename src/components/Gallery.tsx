import { motion } from "motion/react";
import React, { useEffect, useState } from "react";

export default function Gallery() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bgVideo, setBgVideo] = useState<string>("");

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
    <section id="gallery" className="relative py-24 px-4 md:px-8 border-b-4 border-black bg-[#dfff00] overflow-hidden">
      {/* Background Video */}
      {bgVideo && (
        <video
          src={bgVideo}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-multiply pointer-events-none"
        />
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[15vw] md:text-[10vw] leading-none uppercase tracking-tighter mb-16 text-center font-mono glitch-text"
        >
          Gallery
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {photos.length === 0 && !isLoading ? (
            <div className="col-span-full text-center py-20 border-4 border-black border-dashed opacity-50 uppercase text-4xl">
              No toxicity found yet...
            </div>
          ) : (
            photos.map((src, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: Math.min(i * 0.05, 0.2), ease: [0.16, 1, 0.3, 1] }}
                className={`border-4 border-black p-3 bg-white transform transition-transform duration-300 hover:z-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] ${i % 2 === 0 ? 'md:translate-y-12' : ''}`}
              >
                <div className="overflow-hidden border-2 border-black">
                  <img
                    src={src}
                    alt={`Nixxy Toxic ${i}`}
                    className="w-full h-auto object-cover hover:scale-110 transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
