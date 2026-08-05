import React from "react";
import { SchoolLogo } from "./Header";
import { AppContainer } from "./layout/AppContainer";

interface FooterProps {
  logoError: boolean;
  setLogoError: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMediaModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsFaqModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Footer({
  logoError,
  setLogoError,
  setIsMediaModalOpen,
  setIsFaqModalOpen,
}: FooterProps) {
  return (
    <footer className="bg-ink-navy border-t border-brass-gold/25 py-8 sm:py-12 w-full mt-auto text-white">
      <AppContainer size="standard" padding="standard">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo & Institution Info */}
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-full border border-brass-gold overflow-hidden bg-white flex items-center justify-center shrink-0 shadow-sm">
              {logoError ? (
                <SchoolLogo className="w-full h-full" />
              ) : (
                <img
                  src="/assets/logo.jpeg?v=2"
                  alt="AMPS Crest Small"
                  onError={() => setLogoError(true)}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-serif text-xs sm:text-sm text-white font-bold leading-snug tracking-tight">
                Ashish Memorial Public Senior Secondary School
              </span>
              <span className="font-mono text-[9px] sm:text-xs text-brass-gold uppercase tracking-[0.18em] mt-1 font-medium">
                Hindaun City (Karauli) · Estd. 2005
              </span>
            </div>
          </div>

          {/* Quick Links Navigation */}
          <nav aria-label="Footer Navigation" className="hidden sm:flex flex-nowrap gap-x-3 sm:gap-x-4 md:gap-x-6 text-xs font-mono text-white/80 justify-center whitespace-nowrap">
            <a href="#notices" className="hover:text-brass-gold transition-colors focus-visible:outline-2 focus-visible:outline-brass-gold rounded-xs px-1 py-0.5 tracking-[0.15em] font-semibold">
              NOTICES
            </a>
            <span className="text-white/30">·</span>
            <a href="#about" className="hover:text-brass-gold transition-colors focus-visible:outline-2 focus-visible:outline-brass-gold rounded-xs px-1 py-0.5 tracking-[0.15em] font-semibold">
              ABOUT
            </a>
            <span className="text-white/30">·</span>
            <button
              onClick={() => setIsMediaModalOpen(true)}
              className="hover:text-brass-gold transition-colors cursor-pointer text-xs font-mono text-white/80 bg-transparent border-none p-0 outline-none uppercase tracking-[0.15em] font-semibold focus-visible:outline-2 focus-visible:outline-brass-gold rounded-xs px-1 py-0.5"
            >
              MEDIA
            </button>
            <span className="text-white/30">·</span>
            {setIsFaqModalOpen && (
              <>
                <button
                  onClick={() => setIsFaqModalOpen(true)}
                  className="hover:text-brass-gold transition-colors cursor-pointer text-xs font-mono text-white/80 bg-transparent border-none p-0 outline-none uppercase tracking-[0.15em] font-semibold focus-visible:outline-2 focus-visible:outline-brass-gold rounded-xs px-1 py-0.5"
                >
                  FAQ
                </button>
                <span className="text-white/30">·</span>
              </>
            )}
            <a href="#contact" className="hover:text-brass-gold transition-colors focus-visible:outline-2 focus-visible:outline-brass-gold rounded-xs px-1 py-0.5 tracking-[0.15em] font-semibold">
              CONTACT
            </a>
          </nav>

          {/* Copyright & Board Affiliation */}
          <div className="text-center md:text-right">
            <p className="font-mono text-[9px] sm:text-[10px] text-white/60 tracking-wider">
              © 2026 Ashish Memorial Public Senior Secondary School. All Rights Reserved.
            </p>
            <p className="font-mono text-[9px] sm:text-[10px] text-brass-gold/70 tracking-[0.15em] mt-1 font-medium">
              Approved by Rajasthan State Board of Secondary Education
            </p>
          </div>
        </div>
      </AppContainer>
    </footer>
  );
}
