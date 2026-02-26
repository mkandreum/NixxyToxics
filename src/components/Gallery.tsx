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
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.4,
                  delay: (i % 3) * 0.1, // Better stagger logic for grid
                  ease: [0.215, 0.61, 0.355, 1] // Out-Cubic for snappy entrance
                }}
                className={`border-4 border-black p-3 bg-white transform hover:z-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-shadow duration-300 ${i % 2 === 0 ? 'md:translate-y-8' : ''}`}
              >
                <div className="overflow-hidden border-2 border-black bg-gray-50 aspect-[4/5] md:aspect-auto">
                  <img
                    src={src}
                    alt={`Nixxy Toxic ${i}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    onLoad={(e) => (e.currentTarget.style.opacity = "1")}
                    style={{ opacity: 0, transition: "opacity 0.5s" }}
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
