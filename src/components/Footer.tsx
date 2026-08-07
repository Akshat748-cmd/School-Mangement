import React from "react";
import { motion } from "motion/react";
import { SchoolLogo } from "./Header";
import { AppContainer } from "./layout/AppContainer";
import {
  sectionContainerVariants,
  childItemVariants,
  MotionViewport,
} from "../utils/motion";

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
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={MotionViewport.standard}
      variants={sectionContainerVariants}
      className="bg-ink-navy border-t border-brass-gold/25 py-8 sm:py-12 w-full mt-auto text-white"
    >
      <AppContainer size="standard" padding="standard">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo & Institution Info */}
          <motion.div variants={childItemVariants} className="flex items-center gap-3.5">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 6 }}
              transition={{ duration: 0.2 }}
              className="w-9 h-9 rounded-full border border-brass-gold overflow-hidden bg-white flex items-center justify-center shrink-0 shadow-sm cursor-pointer"
            >
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
            </motion.div>
            <div className="flex flex-col text-left">
              <span className="font-serif text-xs sm:text-sm text-white font-bold leading-snug tracking-tight">
                Ashish Memorial Public Senior Secondary School
              </span>
              <span className="font-mono text-[9px] sm:text-xs text-brass-gold uppercase tracking-[0.18em] mt-1 font-medium">
                Hindaun City (Karauli) · Estd. 2005
              </span>
            </div>
          </motion.div>

          {/* Quick Links Navigation */}
          <motion.nav
            variants={childItemVariants}
            aria-label="Footer Navigation"
            className="hidden sm:flex flex-nowrap gap-x-3 sm:gap-x-4 md:gap-x-6 text-xs font-mono text-white/80 justify-center whitespace-nowrap"
          >
            <motion.a
              whileHover={{ y: -2 }}
              href="#notices"
              className="relative group hover:text-brass-gold transition-colors focus-visible:outline-2 focus-visible:outline-brass-gold rounded-xs px-1 py-0.5 tracking-[0.15em] font-semibold"
            >
              <span>NOTICES</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-brass-gold transition-all duration-300 group-hover:w-full" />
            </motion.a>
            <span className="text-white/30">·</span>
            <motion.a
              whileHover={{ y: -2 }}
              href="#about"
              className="relative group hover:text-brass-gold transition-colors focus-visible:outline-2 focus-visible:outline-brass-gold rounded-xs px-1 py-0.5 tracking-[0.15em] font-semibold"
            >
              <span>ABOUT</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-brass-gold transition-all duration-300 group-hover:w-full" />
            </motion.a>
            <span className="text-white/30">·</span>
            <motion.button
              whileHover={{ y: -2 }}
              onClick={() => setIsMediaModalOpen(true)}
              className="relative group hover:text-brass-gold transition-colors cursor-pointer text-xs font-mono text-white/80 bg-transparent border-none p-0 outline-none uppercase tracking-[0.15em] font-semibold focus-visible:outline-2 focus-visible:outline-brass-gold rounded-xs px-1 py-0.5"
            >
              <span>MEDIA</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-brass-gold transition-all duration-300 group-hover:w-full" />
            </motion.button>
            <span className="text-white/30">·</span>
            {setIsFaqModalOpen && (
              <>
                <motion.button
                  whileHover={{ y: -2 }}
                  onClick={() => setIsFaqModalOpen(true)}
                  className="relative group hover:text-brass-gold transition-colors cursor-pointer text-xs font-mono text-white/80 bg-transparent border-none p-0 outline-none uppercase tracking-[0.15em] font-semibold focus-visible:outline-2 focus-visible:outline-brass-gold rounded-xs px-1 py-0.5"
                >
                  <span>FAQ</span>
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-brass-gold transition-all duration-300 group-hover:w-full" />
                </motion.button>
                <span className="text-white/30">·</span>
              </>
            )}
            <motion.a
              whileHover={{ y: -2 }}
              href="#contact"
              className="relative group hover:text-brass-gold transition-colors focus-visible:outline-2 focus-visible:outline-brass-gold rounded-xs px-1 py-0.5 tracking-[0.15em] font-semibold"
            >
              <span>CONTACT</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-brass-gold transition-all duration-300 group-hover:w-full" />
            </motion.a>
          </motion.nav>

          {/* Copyright & Board Affiliation */}
          <motion.div variants={childItemVariants} className="text-center md:text-right">
            <p className="font-mono text-[9px] sm:text-[10px] text-white/60 tracking-wider">
              © 2026 Ashish Memorial Public Senior Secondary School. All Rights Reserved.
            </p>
            <p className="font-mono text-[9px] sm:text-[10px] text-brass-gold/70 tracking-[0.15em] mt-1 font-medium">
              Approved by Rajasthan State Board of Secondary Education
            </p>
          </motion.div>
        </div>
      </AppContainer>
    </motion.footer>
  );
}
