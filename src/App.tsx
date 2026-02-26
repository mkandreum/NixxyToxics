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
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-fit max-w-[98vw] z-50 border-4 border-black rounded-full bg-[#dfff00]/20 backdrop-blur-[1px] flex justify-between items-center px-8 py-4 md:px-14 md:py-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] gap-4 sm:gap-10 md:gap-16 whitespace-nowrap">
          <a href="#gallery" className="text-xl sm:text-3xl md:text-5xl uppercase hover:glitch-text transition-all font-mono font-black shrink hover:text-[#ff00ff]">Gallery</a>
          <a href="#events" className="text-xl sm:text-3xl md:text-5xl uppercase hover:glitch-text transition-all font-mono font-black shrink hover:text-[#ff00ff]">Shows</a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="mx-4 md:mx-10 select-none flex items-center justify-center flex-shrink-0 min-w-fit hover:scale-110 active:scale-95 transition-transform"
          >
            {siteSettings.site_logo_url ? (
              <img src={siteSettings.site_logo_url} alt="Logo" className="h-24 sm:h-28 md:h-40 w-auto object-contain drop-shadow-[5px_5px_0px_rgba(0,0,0,1)] flex-shrink-0" />
            ) : (
              <span className="text-4xl sm:text-6xl md:text-8xl font-logo leading-none text-center flex flex-col uppercase flex-shrink-0">
                {siteSettings.site_logo_text.split(' ').map((word: string, i: number) => (
                  <span key={i} className={i % 2 === 0 ? "text-black" : "text-[#ff00ff]"}>{word}</span>
                ))}
              </span>
            )}
          </a>

          <a href="#store" className="text-xl sm:text-3xl md:text-5xl uppercase hover:glitch-text transition-all font-mono font-black shrink hover:text-[#ff00ff]">Store</a>

          <button
            onClick={handleMenuClick}
            className="relative w-10 h-6 sm:w-14 sm:h-8 z-50 flex-shrink-0 cursor-pointer group flex flex-col justify-around items-center"
            aria-label="Menu"
          >
            <motion.span
              animate={isMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              className="w-full h-[5px] bg-black block transition-all group-hover:bg-[#ff00ff]"
            />
            <motion.span
              animate={isMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              className="w-full h-[5px] bg-black block transition-all group-hover:bg-[#ff00ff]"
            />
          </button>
        </nav>

        {/* Fullscreen Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.6 }}
              className="fixed inset-0 z-40 bg-black text-[#dfff00] pt-32 px-8 flex flex-col gap-8 text-5xl md:text-8xl uppercase tracking-tighter font-black overflow-y-auto pb-12"
            >
              <a href="#gallery" onClick={() => setIsMenuOpen(false)} className="hover:text-[#ff00ff] transition-colors flex items-center gap-6 py-4 border-b-4 border-[#dfff00]/20 hover:border-[#ff00ff] hover:pl-8">
                <ImageIcon size={64} className="hidden md:block" /> Gallery
              </a>
              <a href="#events" onClick={() => setIsMenuOpen(false)} className="hover:text-[#00ff00] transition-colors flex items-center gap-6 py-4 border-b-4 border-[#dfff00]/20 hover:border-[#00ff00] hover:pl-8">
                <Calendar size={64} className="hidden md:block" /> Shows
              </a>
              <a href="#store" onClick={() => setIsMenuOpen(false)} className="hover:text-[#00ffff] transition-colors flex items-center gap-6 py-4 border-b-4 border-[#dfff00]/20 hover:border-[#00ffff] hover:pl-8">
                <ShoppingCart size={64} className="hidden md:block" /> Store
              </a>

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

        <main className="pt-20 md:pt-32">
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
            <AdminDashboard onLogout={() => setCurrentView('home')} />
          )}
        </main>

        <footer className="border-t-4 border-black bg-black text-[#dfff00] p-12 md:p-24 text-center flex flex-col items-center gap-8">
          <h2 className="text-6xl md:text-9xl font-logo text-[#dfff00]">Nixxy Toxic</h2>
          <p className="text-2xl md:text-4xl uppercase">© {new Date().getFullYear()} All rights reserved, Bitch!</p>
        </footer>
      </div>
    </ToastProvider>
  );
}
