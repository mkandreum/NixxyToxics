import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Image as ImageIcon, Calendar, ShoppingCart } from "lucide-react";

// Components
import Hero from "./components/Hero";
import Gallery from "./components/Gallery";
import Events from "./components/Events";
import Store from "./components/Store";
import Marquee from "./components/Marquee";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import Banners from "./components/Banners";
import { ToastProvider } from "./components/Toast";

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuClicks, setMenuClicks] = useState(0);
  const [currentView, setCurrentView] = useState<'home' | 'login' | 'admin'>('home');
  const [siteSettings, setSiteSettings] = useState<any>({ site_logo_text: 'Nixxy Toxic', site_logo_url: '' });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setSiteSettings(data);
        }
      })
      .catch(err => console.error("Error fetching settings:", err));
  }, []);

  const handleMenuClick = () => {
    const newClicks = menuClicks + 1;
    setMenuClicks(newClicks);
    if (newClicks >= 5) {
      setCurrentView('login');
      setMenuClicks(0);
      setIsMenuOpen(false);
    } else {
      setIsMenuOpen(!isMenuOpen);
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#dfff00] text-black font-mono font-bold selection:bg-black selection:text-[#dfff00]">
        <Banners />

        {/* Navigation - Floating Pill */}
        {currentView === 'home' && (
          <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[85vw] md:w-fit md:max-w-[90vw] z-50 border-2 md:border-4 border-black rounded-full bg-[#dfff00]/10 backdrop-blur-[1px] flex items-center justify-between overflow-hidden px-5 py-2 md:px-10 md:py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <a href="#gallery" className="flex flex-col items-center md:flex-row md:gap-2 text-base sm:text-lg md:text-3xl uppercase hover:glitch-text transition-all font-mono font-black hover:text-[#ff00ff] leading-tight"><span className="text-xl sm:text-2xl md:text-3xl">📸</span><span>Gallery</span></a>
            <a href="#events" className="flex flex-col items-center md:flex-row md:gap-2 text-base sm:text-lg md:text-3xl uppercase hover:glitch-text transition-all font-mono font-black hover:text-[#ff00ff] leading-tight"><span className="text-xl sm:text-2xl md:text-3xl">🎤</span><span>Shows</span></a>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="mx-3 md:mx-8 select-none flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform"
            >
              {siteSettings.site_logo_url ? (
                <img src={siteSettings.site_logo_url} alt="Logo" className="h-16 sm:h-20 md:h-28 w-auto object-contain drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]" />
              ) : (
                <span className="text-2xl sm:text-4xl md:text-6xl font-logo leading-none text-center flex flex-col uppercase">
                  {siteSettings.site_logo_text.split(' ').map((word: string, i: number) => (
                    <span key={i} className={i % 2 === 0 ? "text-black" : "text-[#ff00ff]"}>{word}</span>
                  ))}
                </span>
              )}
            </a>

            <a href="#store" className="flex flex-col items-center md:flex-row md:gap-2 text-base sm:text-lg md:text-3xl uppercase hover:glitch-text transition-all font-mono font-black hover:text-[#ff00ff] leading-tight"><span className="text-xl sm:text-2xl md:text-3xl">🛒</span><span>Store</span></a>

            <button
              onClick={handleMenuClick}
              className="w-7 h-4 sm:w-10 sm:h-6 flex-shrink-0 cursor-pointer group flex flex-col justify-between ml-1 sm:ml-4"
              aria-label="Menu"
            >
              <motion.span
                animate={isMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                className="w-full h-[3px] sm:h-[4px] bg-black block origin-center group-hover:bg-[#ff00ff]"
              />
              <motion.span
                animate={isMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                className="w-full h-[3px] sm:h-[4px] bg-black block origin-center group-hover:bg-[#ff00ff]"
              />
            </button>
          </nav>
        )}

        {/* Fullscreen Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{
                type: "tween",
                ease: [0.16, 1, 0.3, 1],
                duration: 0.5,
              }}
              style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
              className="fixed inset-0 z-40 bg-black text-[#dfff00] pt-32 px-8 flex flex-col gap-8 text-5xl md:text-8xl uppercase tracking-tighter font-black overflow-y-auto pb-12 will-change-transform"
            >
              {[
                { href: "#gallery", label: "Gallery", icon: ImageIcon, color: "hover:text-[#ff00ff]" },
                { href: "#events", label: "Shows", icon: Calendar, color: "hover:text-[#00ff00]" },
                { href: "#store", label: "Store", icon: ShoppingCart, color: "hover:text-[#00ffff]" }
              ].map((item, i) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + (i * 0.1), ease: [0.16, 1, 0.3, 1] }}
                  className={`${item.color} transition-colors flex items-center gap-6 py-4 border-b-4 border-[#dfff00]/20 hover:border-[#ff00ff] hover:pl-8`}
                >
                  <item.icon size={64} className="hidden md:block" /> {item.label}
                </motion.a>
              ))}
              <div className="mt-auto pt-12 text-2xl md:text-4xl text-white opacity-50">
                Follow the toxicity
                <div className="flex gap-6 mt-4">
                  <a href="#" className="hover:text-[#ff00ff]">IG</a>
                  <a href="#" className="hover:text-[#00ff00]">TT</a>
                  <a href="#" className="hover:text-[#00ffff]">X</a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="pt-32 md:pt-36">
          {currentView === 'home' && (
            <>
              <Hero />
              <Marquee text="NIXXY TOXIC BITCH! • " />
              <Gallery />
              <Marquee text="UPCOMING EVENTS • " reverse bg="bg-[#dfff00]" textCol="text-black" />
              <Events />
              <Marquee text="MERCHANDISE • " />
              <Store />
            </>
          )}

          {currentView === 'login' && (
            <Login onLogin={() => setCurrentView('admin')} onBack={() => setCurrentView('home')} />
          )}

          {currentView === 'admin' && (
            <AdminDashboard onLogout={() => {
              setCurrentView('home');
              window.scrollTo(0, 0);
            }} />
          )}
        </main>

        <footer className="border-t-4 border-black bg-black text-[#dfff00] p-12 md:p-24 text-center flex flex-col items-center gap-8">
          {siteSettings.site_logo_url ? (
            <img src={siteSettings.site_logo_url} alt="Logo" className="h-24 md:h-48 w-auto object-contain brightness-0 invert" />
          ) : (
            <h2 className="text-6xl md:text-9xl font-logo text-[#dfff00]">
              {siteSettings.site_logo_text}
            </h2>
          )}
          <p className="text-2xl md:text-4xl uppercase">© {new Date().getFullYear()} All rights reserved, Bitch!</p>
        </footer>
      </div>
    </ToastProvider>
  );
}
