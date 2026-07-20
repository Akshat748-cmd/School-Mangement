import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";

// Beautiful custom SVG school logo fallback that matches the official school's branding
export function SchoolLogo({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`${className} bg-white`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Curving paths for circular text */}
        <path id="textPathTop" d="M 15 50 A 35 35 0 0 1 85 50" fill="none" />
        <path id="textPathBottom" d="M 85 50 A 35 35 0 0 1 15 50" fill="none" />
      </defs>
      
      {/* Outer base and concentric circular rings */}
      <circle cx="50" cy="50" r="48" fill="#14213D" />
      <circle cx="50" cy="50" r="45" fill="none" stroke="#C9A227" strokeWidth="2" />
      <circle cx="50" cy="50" r="38" fill="#14213D" stroke="#C9A227" strokeWidth="1" strokeDasharray="2,2" />
      <circle cx="50" cy="50" r="31" fill="#14213D" stroke="#C9A227" strokeWidth="1" />
      
      {/* Top Curved Text */}
      <text fill="#C9A227" fontFamily="Georgia, serif" fontSize="6.2" fontWeight="bold" letterSpacing="0.4">
        <textPath href="#textPathTop" startOffset="50%" textAnchor="middle">
          ASHISH MEMORIAL PUB. SCHOOL
        </textPath>
      </text>
      
      {/* Bottom Curved Text */}
      <text fill="#C9A227" fontFamily="Georgia, serif" fontSize="6.2" fontWeight="bold" letterSpacing="0.4">
        <textPath href="#textPathBottom" startOffset="50%" textAnchor="middle">
          HINDAUN CITY (KARAULI)
        </textPath>
      </text>

      {/* Central Shield Crest */}
      <g transform="translate(50, 50) scale(0.48)">
        {/* Shield Border and Background */}
        <path d="M -22 -22 L 22 -22 C 22 -22 22 12 0 32 C -22 12 -22 -22 -22 -22 Z" fill="#C9A227" stroke="#FBF7EE" strokeWidth="1" />
        <path d="M -19 -19 L 19 -19 C 19 -19 19 10 0 28 C -19 10 -19 -19 -19 -19 Z" fill="#7A2331" />
        
        {/* Open Book of Knowledge */}
        <path d="M -10 -5 Q -5 -9 0 -6 Q 5 -9 10 -5 V 5 Q 5 1 0 5 Q -5 1 -10 5 Z" fill="#FBF7EE" stroke="#14213D" strokeWidth="0.7" />
        <path d="M 0 -6 V 5" stroke="#14213D" strokeWidth="0.7" />
        <line x1="-7" y1="-2" x2="-3" y2="-4" stroke="#14213D" strokeWidth="0.5" />
        <line x1="-7" y1="1" x2="-3" y2="-1" stroke="#14213D" strokeWidth="0.5" />
        <line x1="3" y1="-4" x2="7" y2="-2" stroke="#14213D" strokeWidth="0.5" />
        <line x1="3" y1="-1" x2="7" y2="1" stroke="#14213D" strokeWidth="0.5" />

        {/* Torch of Enlightenment */}
        <path d="M -2 -14 L 2 -14 L 3 -10 L 0 -8 L -3 -10 Z" fill="#C9A227" />
        <path d="M -4 -13 C -3 -17 0 -18 0 -18 C 0 -18 3 -17 4 -13 C 2 -15 0 -14 0 -14 C 0 -14 -2 -15 -4 -13 Z" fill="#E63946" />
        
        {/* Banner with initials AMPS */}
        <path d="M -24 16 Q 0 22 24 16 V 11 Q 0 17 -24 11 Z" fill="#C9A227" stroke="#FBF7EE" strokeWidth="0.7" />
        <text y="15.5" fontFamily="sans-serif" fontSize="6.2" fontWeight="bold" fill="#14213D" textAnchor="middle" letterSpacing="0.5">AMPS</text>
      </g>
    </svg>
  );
}

interface HeaderProps {
  logoError: boolean;
  setLogoError: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMediaModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsFaqModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Header({
  logoError,
  setLogoError,
  setIsMediaModalOpen,
  setIsFaqModalOpen
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      id="navbar" 
      className="sticky top-0 z-50 transition-all duration-300 bg-ink-navy border-b border-brass-gold/20 shadow-md backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${
          isScrolled ? "h-14 sm:h-16" : "h-18 md:h-20"
        }`}>
          
          {/* Left: Brand / Logo */}
          <a href="#hero" className="flex items-center gap-2.5 sm:gap-3 md:gap-4 group">
            <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-13 md:h-13 rounded-full border-2 border-brass-gold overflow-hidden bg-white flex items-center justify-center shrink-0 shadow-inner">
              {logoError ? (
                <SchoolLogo className="w-full h-full" />
              ) : (
                <img 
                  src="/assets/logo.jpeg?v=2" 
                  alt="AMPS School Crest Logo" 
                  onError={() => setLogoError(true)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-serif text-white text-xs sm:text-base md:text-lg font-bold leading-tight tracking-tight group-hover:text-brass-gold transition-colors">
                Ashish Memorial Public Senior Secondary School
              </span>
              <span className="font-mono text-brass-gold text-[9px] md:text-xs tracking-wider uppercase font-medium mt-0.5">
                Hindaun City (Karauli) · Estd. 2005
              </span>
            </div>
          </a>

          {/* Center-Right: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-mono text-sm tracking-wide">
            <motion.a 
              whileTap={{ scale: 0.95 }}
              href="#notices" 
              className="text-white/85 hover:text-brass-gold transition-colors uppercase"
            >
              Notices
            </motion.a>
            <motion.a 
              whileTap={{ scale: 0.95 }}
              href="#about" 
              className="text-white/85 hover:text-brass-gold transition-colors uppercase"
            >
              About
            </motion.a>
            <motion.a 
              whileTap={{ scale: 0.95 }}
              href="#why-amps" 
              className="text-white/85 hover:text-brass-gold transition-colors uppercase"
            >
              Academics
            </motion.a>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMediaModalOpen(true)} 
              className="text-white/85 hover:text-brass-gold transition-colors uppercase cursor-pointer bg-transparent border-none p-0 outline-none font-mono text-sm tracking-wide"
            >
              Media
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFaqModalOpen(true)} 
              className="text-white/85 hover:text-brass-gold transition-colors uppercase cursor-pointer bg-transparent border-none p-0 outline-none font-mono text-sm tracking-wide"
            >
              FAQ
            </motion.button>
            <motion.a 
              whileTap={{ scale: 0.95 }}
              href="#contact" 
              className="text-white/85 hover:text-brass-gold transition-colors uppercase"
            >
              Contact
            </motion.a>
          </nav>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-brass-gold focus:outline-none p-2 cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[#1b2b4d] border-t border-brass-gold/20 font-mono text-sm"
          >
            <div className="px-4 pt-4 pb-6 space-y-3 flex flex-col uppercase tracking-wider">
              <a 
                href="#notices" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-white/90 hover:text-brass-gold py-2 transition-colors border-b border-white/5"
              >
                Notices
              </a>
              <a 
                href="#about" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-white/90 hover:text-brass-gold py-2 transition-colors border-b border-white/5"
              >
                About
              </a>
              <a 
                href="#why-amps" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-white/90 hover:text-brass-gold py-2 transition-colors border-b border-white/5"
              >
                Academics
              </a>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsMediaModalOpen(true);
                }}
                className="text-white/90 hover:text-brass-gold py-2 text-left transition-colors border-b border-white/5 uppercase font-mono text-sm tracking-wider bg-transparent border-none p-0 outline-none cursor-pointer"
              >
                Media
              </button>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsFaqModalOpen(true);
                }}
                className="text-white/90 hover:text-brass-gold py-2 text-left transition-colors border-b border-white/5 uppercase font-mono text-sm tracking-wider bg-transparent border-none p-0 outline-none cursor-pointer"
              >
                FAQ
              </button>
              <a 
                href="#contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-white/90 hover:text-brass-gold py-2 transition-colors"
              >
                Contact
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
