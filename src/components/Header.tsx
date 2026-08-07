import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, ArrowRight } from "lucide-react";
import { AppContainer } from "./layout/AppContainer";
import { Button } from "./ui/Button";
import { MagneticButton } from "./ui/MagneticButton";
import { MotionDuration, MotionEase, buttonPressProps } from "../utils/motion";

// Custom SVG school logo fallback matching official school branding
export function SchoolLogo({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`${className} bg-white`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <path id="textPathTop" d="M 15 50 A 35 35 0 0 1 85 50" fill="none" />
        <path id="textPathBottom" d="M 85 50 A 35 35 0 0 1 15 50" fill="none" />
      </defs>
      
      <circle cx="50" cy="50" r="48" fill="#14213D" />
      <circle cx="50" cy="50" r="45" fill="none" stroke="#C9A227" strokeWidth="2" />
      <circle cx="50" cy="50" r="38" fill="#14213D" stroke="#C9A227" strokeWidth="1" strokeDasharray="2,2" />
      <circle cx="50" cy="50" r="31" fill="#14213D" stroke="#C9A227" strokeWidth="1" />
      
      <text fill="#C9A227" fontFamily="Georgia, serif" fontSize="6.2" fontWeight="bold" letterSpacing="0.4">
        <textPath href="#textPathTop" startOffset="50%" textAnchor="middle">
          ASHISH MEMORIAL PUB. SCHOOL
        </textPath>
      </text>
      
      <text fill="#C9A227" fontFamily="Georgia, serif" fontSize="6.2" fontWeight="bold" letterSpacing="0.4">
        <textPath href="#textPathBottom" startOffset="50%" textAnchor="middle">
          HINDAUN CITY (KARAULI)
        </textPath>
      </text>

      <g transform="translate(50, 50) scale(0.48)">
        <path d="M -22 -22 L 22 -22 C 22 -22 22 12 0 32 C -22 12 -22 -22 -22 -22 Z" fill="#C9A227" stroke="#FBF7EE" strokeWidth="1" />
        <path d="M -19 -19 L 19 -19 C 19 -19 19 10 0 28 C -19 10 -19 -19 -19 -19 Z" fill="#7A2331" />
        
        <path d="M -10 -5 Q -5 -9 0 -6 Q 5 -9 10 -5 V 5 Q 5 1 0 5 Q -5 1 -10 5 Z" fill="#FBF7EE" stroke="#14213D" strokeWidth="0.7" />
        <path d="M 0 -6 V 5" stroke="#14213D" strokeWidth="0.7" />
        <line x1="-7" y1="-2" x2="-3" y2="-4" stroke="#14213D" strokeWidth="0.5" />
        <line x1="-7" y1="1" x2="-3" y2="-1" stroke="#14213D" strokeWidth="0.5" />
        <line x1="3" y1="-4" x2="7" y2="-2" stroke="#14213D" strokeWidth="0.5" />
        <line x1="3" y1="-1" x2="7" y2="1" stroke="#14213D" strokeWidth="0.5" />

        <path d="M -2 -14 L 2 -14 L 3 -10 L 0 -8 L -3 -10 Z" fill="#C9A227" />
        <path d="M -4 -13 C -3 -17 0 -18 0 -18 C 0 -18 3 -17 4 -13 C 2 -15 0 -14 0 -14 C 0 -14 -2 -15 -4 -13 Z" fill="#E63946" />
        
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
  setIsFaqModalOpen,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [supportsBackdropBlur, setSupportsBackdropBlur] = useState(true);

  const headerRef = useRef<HTMLElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const mobileDrawerRef = useRef<HTMLDivElement>(null);

  // 1. Detect Backdrop Filter Support for Optimized GPU Blur Rendering
  useEffect(() => {
    if (typeof window !== "undefined" && typeof CSS !== "undefined" && CSS.supports) {
      const supported =
        CSS.supports("backdrop-filter", "blur(1px)") ||
        CSS.supports("-webkit-backdrop-filter", "blur(1px)");
      setSupportsBackdropBlur(supported);
    }
  }, []);

  // 2. Active Section Detection via IntersectionObserver + Route Matching
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check Route
    if (window.location.pathname === "/admin" || window.location.pathname === "/admin/") {
      setActiveSection("admin");
      return;
    }

    const sectionIds = ["hero", "notices", "why-amps", "about", "contact"];
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: "-20% 0px -40% 0px",
      threshold: 0.25,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // 3. Smart Auto-Hide Header Logic (Never hides when menu/modal/focus is active)
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 60);

      // Check if focus is inside header or any modal backdrop is visible
      const isFocusedInHeader = headerRef.current?.contains(document.activeElement) || false;
      const isModalActive = document.querySelector('[role="dialog"]') !== null;

      // Smart Visibility Rules
      if (
        mobileMenuOpen ||
        isFocusedInHeader ||
        isModalActive ||
        currentScrollY <= 120
      ) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY + 8) {
        // Scrolling Down -> Hide Header
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY - 8) {
        // Scrolling Up -> Reveal Header
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobileMenuOpen]);

  // 4. Mobile Drawer Focus Trap, Keyboard Support & Focus Restoration
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      // Restore focus to menu toggle button when closing
      toggleButtonRef.current?.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!mobileMenuOpen) return;

      // Close on Escape
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        return;
      }

      // Keyboard Focus Trap within Drawer
      if (e.key === "Tab" && mobileDrawerRef.current) {
        const focusableElements = mobileDrawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // Dynamic Background & Blur Styling based on Support & Scroll State
  const backgroundStyle = isScrolled
    ? supportsBackdropBlur
      ? "bg-ink-navy/90 backdrop-blur-md border-b border-brass-gold/20 shadow-md"
      : "bg-ink-navy/98 border-b border-brass-gold/20 shadow-md"
    : "bg-ink-navy border-b border-brass-gold/15 shadow-sm";

  return (
    <header
      ref={headerRef}
      id="navbar"
      role="banner"
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${backgroundStyle}`}
    >
      <AppContainer size="standard" padding="standard">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled ? "h-14 sm:h-16" : "h-18 sm:h-20"
          }`}
        >
          {/* Left: School Crest Logo & Branding */}
          <a
            href="#hero"
            aria-label="Ashish Memorial Public School Home"
            className="flex items-center gap-3 sm:gap-4 group focus-visible:outline-2 focus-visible:outline-brass-gold rounded-sm p-1"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full border-2 border-brass-gold overflow-hidden bg-white flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105">
              {logoError ? (
                <SchoolLogo className="w-full h-full" />
              ) : (
                <img
                  src="/assets/logo.jpeg?v=2"
                  alt="AMPS School Crest Logo"
                  onError={() => setLogoError(true)}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-serif text-white text-xs sm:text-base font-bold leading-snug tracking-tight group-hover:text-brass-gold transition-colors">
                Ashish Memorial Public Senior Secondary School
              </span>
              <span className="font-mono text-brass-gold text-[9px] sm:text-xs tracking-[0.18em] uppercase font-medium mt-0.5">
                Hindaun City (Karauli)
              </span>
            </div>
          </a>

          {/* Center-Right: Desktop Navigation Links */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-6 font-mono text-xs font-semibold tracking-[0.15em] uppercase"
          >
            {/* Notices Link */}
            <motion.a
              {...buttonPressProps}
              href="#notices"
              className={`relative py-1 transition-colors ${
                activeSection === "notices"
                  ? "text-brass-gold font-bold"
                  : "text-white/90 hover:text-brass-gold"
              }`}
            >
              <span>Notices</span>
              {activeSection === "notices" && (
                <motion.span
                  layoutId="navActiveIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brass-gold rounded-full"
                  transition={{ duration: MotionDuration.fast, ease: MotionEase.out }}
                />
              )}
            </motion.a>

            {/* About Link */}
            <motion.a
              {...buttonPressProps}
              href="#about"
              className={`relative py-1 transition-colors ${
                activeSection === "about"
                  ? "text-brass-gold font-bold"
                  : "text-white/90 hover:text-brass-gold"
              }`}
            >
              <span>About</span>
              {activeSection === "about" && (
                <motion.span
                  layoutId="navActiveIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brass-gold rounded-full"
                  transition={{ duration: MotionDuration.fast, ease: MotionEase.out }}
                />
              )}
            </motion.a>

            {/* Media Modal Trigger */}
            <motion.button
              {...buttonPressProps}
              onClick={() => setIsMediaModalOpen(true)}
              className="text-white/90 hover:text-brass-gold transition-colors py-1 cursor-pointer bg-transparent border-none outline-none font-sans text-sm font-semibold tracking-wide"
            >
              Media
            </motion.button>

            {/* FAQ Modal Trigger */}
            <motion.button
              {...buttonPressProps}
              onClick={() => setIsFaqModalOpen(true)}
              className="text-white/90 hover:text-brass-gold transition-colors py-1 cursor-pointer bg-transparent border-none outline-none font-sans text-sm font-semibold tracking-wide"
            >
              FAQ
            </motion.button>

            {/* Contact Link */}
            <motion.a
              {...buttonPressProps}
              href="#contact"
              className={`relative py-1 transition-colors ${
                activeSection === "contact"
                  ? "text-brass-gold font-bold"
                  : "text-white/90 hover:text-brass-gold"
              }`}
            >
              <span>Contact</span>
              {activeSection === "contact" && (
                <motion.span
                  layoutId="navActiveIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brass-gold rounded-full"
                  transition={{ duration: MotionDuration.fast, ease: MotionEase.out }}
                />
              )}
            </motion.a>

            {/* Refined Admission Header CTA */}
            <a href="#contact" className="ml-2">
              <MagneticButton maxOffset={8}>
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  className="shadow-sm font-sans uppercase text-[11px] font-bold tracking-wider"
                >
                  Admission 2026–27
                </Button>
              </MagneticButton>
            </a>
          </nav>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden">
            <motion.button
              ref={toggleButtonRef}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-brass-gold focus-visible:outline-2 focus-visible:outline-brass-gold p-2 rounded-sm cursor-pointer min-h-[48px] min-w-[48px] flex items-center justify-center"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>
      </AppContainer>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            ref={mobileDrawerRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: MotionDuration.normal, ease: MotionEase.out }}
            className="md:hidden bg-[#142442] border-t border-brass-gold/20 font-sans text-sm shadow-xl"
          >
            <AppContainer size="standard" padding="standard">
              <div className="py-5 space-y-2 flex flex-col uppercase tracking-wider text-left">
                <a
                  href="#notices"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white/90 hover:text-brass-gold py-3 px-2 min-h-[48px] flex items-center transition-colors border-b border-white/10 font-semibold focus-visible:outline-brass-gold"
                >
                  Notices
                </a>
                <a
                  href="#about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white/90 hover:text-brass-gold py-3 px-2 min-h-[48px] flex items-center transition-colors border-b border-white/10 font-semibold focus-visible:outline-brass-gold"
                >
                  About
                </a>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsMediaModalOpen(true);
                  }}
                  className="text-white/90 hover:text-brass-gold py-3 px-2 min-h-[48px] flex items-center text-left transition-colors border-b border-white/10 uppercase font-sans text-sm font-semibold tracking-wider bg-transparent border-none outline-none cursor-pointer w-full focus-visible:outline-brass-gold"
                >
                  Media
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsFaqModalOpen(true);
                  }}
                  className="text-white/90 hover:text-brass-gold py-3 px-2 min-h-[48px] flex items-center text-left transition-colors border-b border-white/10 uppercase font-sans text-sm font-semibold tracking-wider bg-transparent border-none outline-none cursor-pointer w-full focus-visible:outline-brass-gold"
                >
                  FAQ
                </button>
                <a
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white/90 hover:text-brass-gold py-3 px-2 min-h-[48px] flex items-center transition-colors border-b border-white/10 font-semibold focus-visible:outline-brass-gold"
                >
                  Contact
                </a>

                {/* Mobile Admission CTA */}
                <div className="pt-3">
                  <a
                    href="#contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full block"
                  >
                    <Button
                      variant="primary"
                      size="md"
                      fullWidth
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      className="uppercase font-sans font-bold tracking-wider"
                    >
                      Apply / Admission 2026–27
                    </Button>
                  </a>
                </div>
              </div>
            </AppContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
