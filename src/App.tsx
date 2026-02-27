import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Image as ImageIcon, Calendar, ShoppingCart } from "lucide-react";

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
  console.log("🔥 Full App Rendering...");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuClicks, setMenuClicks] = useState(0);
  const [currentView, setCurrentView] = useState<'home' | 'login' | 'admin'>('home');
  const [siteSettings, setSiteSettings] = useState<any>({ site_logo_text: 'Nixxy Toxic', site_logo_url: '', instagram_url: '' });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object') {
          setSiteSettings((prev: any) => ({ ...prev, ...data }));
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
      <div className="min-h-screen bg-[#d9ff36] text-black font-mono font-bold selection:bg-black selection:text-[#d9ff36]">
        {currentView === 'home' && <Banners />}

        {/* Navigation - Floating Pill */}
        {currentView === 'home' && (
          <nav className="sticky top-4 w-[92vw] md:w-fit md:max-w-[90vw] z-50 border-2 md:border-4 border-black rounded-full bg-[#d9ff36]/15 glass flex items-center justify-between px-4 sm:px-6 py-1 md:px-10 md:py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mx-auto mt-4 mb-4">
            <a href="#gallery" className="flex flex-col items-center md:flex-row md:gap-2 text-base md:text-3xl uppercase hover:glitch-text transition-all font-mono font-black hover:text-[#ff00ff] leading-none">
              <span className="text-xl sm:text-xl md:text-3xl">📸</span>
              <span>Gallery</span>
            </a>
            <a href="#events" className="flex flex-col items-center md:flex-row md:gap-2 text-base md:text-3xl uppercase hover:glitch-text transition-all font-mono font-black hover:text-[#ff00ff] leading-none">
              <span className="text-xl sm:text-xl md:text-3xl">🎤</span>
              <span>Shows</span>
            </a>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="mx-0.5 sm:mx-4 md:mx-8 select-none flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform"
            >
              {siteSettings?.site_logo_url ? (
                <img src={siteSettings.site_logo_url} alt="Logo" className="h-[18vw] max-h-24 md:h-28 w-auto object-contain drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]" />
              ) : (
                <span className="text-2xl sm:text-4xl md:text-6xl font-logo leading-none text-center flex flex-col uppercase">
                  {(siteSettings?.site_logo_text || 'Nixxy Toxic').split(' ').map((word: string, i: number) => (
                    <span key={i} className={i % 2 === 0 ? "text-black" : "text-[#ff00ff]"}>{word}</span>
                  ))}
                </span>
              )}
            </a>

            <a href="#store" className="flex flex-col items-center md:flex-row md:gap-2 text-base md:text-3xl uppercase hover:glitch-text transition-all font-mono font-black hover:text-[#ff00ff] leading-none">
              <span className="text-xl sm:text-xl md:text-3xl">🛒</span>
              <span>Merch</span>
            </a>

            <button
              onClick={handleMenuClick}
              className="w-7 h-4 sm:w-10 sm:h-6 flex-shrink-0 cursor-pointer group flex flex-col justify-between"
              aria-label="Menu"
            >
              <motion.span
                animate={isMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                className="w-full h-[2.5px] sm:h-[4px] bg-black block origin-center group-hover:bg-[#ff00ff]"
              />
              <motion.span
                animate={isMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                className="w-full h-[2.5px] sm:h-[4px] bg-black block origin-center group-hover:bg-[#ff00ff]"
              />
            </button>
          </nav>
        )}

        {/* Fullscreen Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl text-[#d9ff36] pt-32 px-4 flex flex-col gap-6 overflow-y-auto pb-12"
            >
              {[
                { href: "#gallery", label: "Gallery", icon: "📸" },
                { href: "#events", label: "Shows", icon: "🎤" },
                { href: "#store", label: "Merch", icon: "🛒" }
              ].map((item, i) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="border-4 border-[#d9ff36] p-8 text-6xl md:text-9xl font-black uppercase italic flex items-center gap-8 hover:bg-[#d9ff36] hover:text-black transition-all hover:translate-x-4 shadow-[8px_8px_0px_0px_#ff00ff] hover:shadow-none"
                >
                  <span className="text-4xl md:text-7xl">{item.icon}</span>
                  {item.label}
                </motion.a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <main className={currentView === 'home' ? "pt-4" : "pt-0"}>
          {currentView === 'home' && (
            <>
              <Hero />
              <Marquee text="NIXXY TOXIC BITCH! • " />
              <Gallery />
              <Marquee text="UPCOMING EVENTS • " reverse bg="bg-[#d9ff36]" textCol="text-black" />
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

        <footer className="border-t-4 border-black bg-black text-[#d9ff36] p-12 md:p-24 text-center flex flex-col items-center gap-8">
          {siteSettings?.site_logo_url ? (
            <img src={siteSettings.site_logo_url} alt="Logo" className="h-24 md:h-48 w-auto object-contain" />
          ) : (
            <h2 className="text-6xl md:text-9xl font-logo text-[#ff00ff] drop-shadow-[4px_4px_0px_#d9ff36]">
              {siteSettings?.site_logo_text || 'Nixxy Toxic'}
            </h2>
          )}
          <p className="text-2xl md:text-4xl uppercase">© {new Date().getFullYear()} All rights reserved, Bitch!</p>
        </footer>
      </div>
    </ToastProvider>
  );
}
