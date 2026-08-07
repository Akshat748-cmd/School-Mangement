import React from "react";
import { Phone } from "lucide-react";
import { motion } from "motion/react";
import { AppSection } from "./layout/AppSection";
import { TiltCard } from "./ui/TiltCard";
import { childItemVariants, MotionViewport } from "../utils/motion";

export default function LeadershipSection() {
  return (
    <AppSection id="leadership" className="bg-[#FAF9F6] py-18 sm:py-22 lg:py-28 border-t border-border-custom/60">
      <motion.div variants={childItemVariants} className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <span className="font-mono text-[11px] sm:text-xs tracking-[0.18em] text-maroon font-bold uppercase block mb-2 sm:mb-2.5">
          Leadership
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-ink-navy font-bold tracking-tight leading-[1.2]">
          Guiding the Institution
        </h2>
        <p className="text-muted-text mt-3.5 text-sm md:text-base font-sans leading-[1.75] max-w-xl mx-auto">
          The experienced pioneers steering Ashish Memorial Public School with academic excellence and scholarly values.
        </p>
      </motion.div>

      {/* 3-column grid of leadership cards with equalized height */}
      <motion.div variants={childItemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        
        {/* Card 1: Chairman */}
        <motion.div
          variants={childItemVariants}
          viewport={MotionViewport.card}
          className="h-full flex flex-col group"
        >
          <TiltCard className="h-full rounded-2xl">
            <div className="bg-[#FDFBF7] p-6 pt-8 pb-6 sm:p-8 sm:pt-10 sm:pb-8 rounded-2xl border border-brass-gold/25 hover:border-brass-gold/60 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between text-center h-full relative overflow-hidden">
              <div>
                <span className="font-mono text-[11px] sm:text-xs text-brass-gold tracking-[0.18em] uppercase font-bold block mb-5">
                  Chairman
                </span>
                
                {/* Standardized 96px-112px Circular Portrait with Elevation */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-6 rounded-full border-2 border-brass-gold p-1 bg-white shadow-md relative group-hover:border-brass-gold/80 transition-colors">
                  <div className="w-full h-full rounded-full overflow-hidden bg-ink-navy">
                    <img 
                      src="/assets/chairman.jpeg?v=2" 
                      alt="Chairman Riddhi Chand Jain" 
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl text-ink-navy font-bold mb-1 tracking-tight">
                  Riddhi Chand Jain
                </h3>
                <p className="font-serif text-xs sm:text-sm text-muted-text italic mb-4 leading-relaxed">
                  (Advocate)
                </p>
                <p className="text-muted-text text-xs sm:text-sm leading-[1.72] mb-6 font-sans max-w-xs mx-auto">
                  An esteemed advocate providing strategic oversight and steering the school’s core vision toward robust community integration.
                </p>
              </div>
              
              <div className="pt-4 border-t border-border-custom/60 mt-auto">
                <a 
                  href="tel:9783199992" 
                  className="inline-flex items-center gap-2 font-mono text-xs text-ink-navy hover:text-maroon font-semibold tracking-wide transition-colors py-1.5 px-3 bg-white border border-border-custom/80 hover:border-brass-gold/50 rounded-lg shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5 text-brass-gold" /> 9783199992
                </a>
              </div>
            </div>
          </TiltCard>
        </motion.div>

        {/* Card 2: Administrator */}
        <motion.div
          variants={childItemVariants}
          viewport={MotionViewport.card}
          className="h-full flex flex-col group"
        >
          <TiltCard className="h-full rounded-2xl">
            <div className="bg-[#FDFBF7] p-6 pt-8 pb-6 sm:p-8 sm:pt-10 sm:pb-8 rounded-2xl border border-brass-gold/25 hover:border-brass-gold/60 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between text-center h-full relative overflow-hidden">
              <div>
                <span className="font-mono text-[11px] sm:text-xs text-maroon tracking-[0.18em] uppercase font-bold block mb-5">
                  Hon. Administrator
                </span>
                
                {/* Standardized 96px-112px Circular Portrait with Elevation */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-6 rounded-full border-2 border-maroon p-1 bg-white shadow-md relative group-hover:border-maroon/80 transition-colors">
                  <div className="w-full h-full rounded-full overflow-hidden bg-ink-navy">
                    <img 
                      src="/assets/administrator.jpeg" 
                      alt="Administrator Ashok Sharma" 
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl text-ink-navy font-bold mb-1 tracking-tight">
                  Ashok Sharma
                </h3>
                <p className="font-serif text-xs sm:text-sm text-muted-text italic mb-4 leading-relaxed">
                  Management Oversight
                </p>
                <p className="text-muted-text text-xs sm:text-sm leading-[1.72] mb-6 font-sans max-w-xs mx-auto">
                  Leading the active operational strategy, campus resources, and safety standard protocols for student well-being.
                </p>
              </div>
              
              <div className="pt-4 border-t border-border-custom/60 mt-auto">
                <a 
                  href="tel:9414400824" 
                  className="inline-flex items-center gap-2 font-mono text-xs text-ink-navy hover:text-maroon font-semibold tracking-wide transition-colors py-1.5 px-3 bg-white border border-border-custom/80 hover:border-maroon/50 rounded-lg shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5 text-maroon" /> 9414400824
                </a>
              </div>
            </div>
          </TiltCard>
        </motion.div>

        {/* Card 3: Principal */}
        <motion.div
          variants={childItemVariants}
          viewport={MotionViewport.card}
          className="h-full flex flex-col group"
        >
          <TiltCard className="h-full rounded-2xl">
            <div className="bg-[#FDFBF7] p-6 pt-8 pb-6 sm:p-8 sm:pt-10 sm:pb-8 rounded-2xl border border-brass-gold/25 hover:border-brass-gold/60 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between text-center h-full relative overflow-hidden">
              <div>
                <span className="font-mono text-[11px] sm:text-xs text-navy-light tracking-[0.18em] uppercase font-bold block mb-5">
                  Principal
                </span>
                
                {/* Standardized 96px-112px Circular Portrait with Elevation */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-6 rounded-full border-2 border-navy-light p-1 bg-white shadow-md relative group-hover:border-navy-light/80 transition-colors">
                  <div className="w-full h-full rounded-full overflow-hidden bg-ink-navy">
                    <img 
                      src="/assets/principal-1.jpeg?v=2" 
                      alt="Principal Vardhman Jain" 
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl text-ink-navy font-bold mb-1 tracking-tight">
                  Vardhman Jain
                </h3>
                <p className="font-serif text-xs sm:text-sm text-muted-text italic mb-4 leading-relaxed">
                  Academic Head
                </p>
                <p className="text-muted-text text-xs sm:text-sm leading-[1.72] mb-6 font-sans max-w-xs mx-auto">
                  Supervising rigorous classroom schedules, bilingual curriculum design, and specialized JEE-NEET coaching integration.
                </p>
              </div>
              
              <div className="pt-4 border-t border-border-custom/60 mt-auto">
                <a 
                  href="tel:9413182619" 
                  className="inline-flex items-center gap-2 font-mono text-xs text-ink-navy hover:text-maroon font-semibold tracking-wide transition-colors py-1.5 px-3 bg-white border border-border-custom/80 hover:border-brass-gold/50 rounded-lg shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5 text-navy-light" /> 9413182619
                </a>
              </div>
            </div>
          </TiltCard>
        </motion.div>

      </motion.div>
    </AppSection>
  );
}
