import React from "react";
import { SchoolLogo } from "./Header";

interface FooterProps {
  logoError: boolean;
  setLogoError: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMediaModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Footer({
  logoError,
  setLogoError,
  setIsMediaModalOpen
}: FooterProps) {
  return (
    <footer className="bg-ink-navy border-t border-brass-gold/25 py-6 sm:py-12 px-4 sm:px-6 lg:px-8 w-full mt-auto text-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
        
        {/* Logo & Info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-brass-gold overflow-hidden bg-white flex items-center justify-center shrink-0">
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
            <span className="font-serif text-sm text-white font-bold leading-none">
              Ashish Memorial Public Senior Secondary School
            </span>
            <span className="font-mono text-[9px] text-brass-gold uppercase tracking-wider mt-1.5">
              Hindaun City (Karauli) · Estd. 2005
            </span>
          </div>
        </div>

        {/* Quick links to sections */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono text-white/70 justify-center">
          <a href="#navbar" className="hover:text-brass-gold transition-colors">TOP</a>
          <span>·</span>
          <a href="#notices" className="hover:text-brass-gold transition-colors">NOTICES</a>
          <span>·</span>
          <a href="#why-amps" className="hover:text-brass-gold transition-colors">ACADEMICS</a>
          <span>·</span>
          <a href="#about" className="hover:text-brass-gold transition-colors">ABOUT</a>
          <span>·</span>
          <button 
            onClick={() => setIsMediaModalOpen(true)}
            className="hover:text-brass-gold transition-colors cursor-pointer text-xs font-mono text-white/70 bg-transparent border-none p-0 outline-none uppercase font-mono"
          >
            MEDIA
          </button>
          <span>·</span>
          <a href="#contact" className="hover:text-brass-gold transition-colors">CONTACT</a>
        </div>

        {/* Copyright Text */}
        <div className="text-center md:text-right">
          <p className="font-mono text-[10px] text-white/50 tracking-wide">
            © 2026 Ashish Memorial Public Senior Secondary School. All Rights Reserved.
          </p>
          <p className="font-mono text-[9px] text-brass-gold/50 tracking-wider mt-0.5">
            Approved by Rajasthan State Board of Secondary Education
          </p>
        </div>

      </div>
    </footer>
  );
}
