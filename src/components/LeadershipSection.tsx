import React from "react";
import { Phone } from "lucide-react";
import { motion } from "motion/react";

export default function LeadershipSection() {
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.15
      }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <motion.section 
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="py-10 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
    >
      <motion.div variants={childVariants} className="text-center max-w-2xl mx-auto mb-8 sm:mb-16">
        <span className="font-mono text-xs tracking-widest text-maroon font-semibold uppercase block mb-2">
          Leadership
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-ink-navy font-bold tracking-tight">
          Guiding the institution
        </h2>
        <p className="text-muted-text mt-3 text-sm md:text-base">
          The experienced pioneers steering Ashish Memorial Public School with academic excellence and scholarly values.
        </p>
      </motion.div>

      {/* 3-column grid of bordered white cards */}
      <motion.div variants={childVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        
        {/* Card 1: Chairman */}
        <motion.div 
          whileHover={{ y: -6, scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-white p-5 sm:p-8 border border-border-custom rounded-sm text-center shadow-sm flex flex-col justify-between relative group text-slate-800"
        >
          <div className="absolute top-0 inset-x-0 h-1.5 bg-brass-gold"></div>
          <div>
            <span className="font-mono text-xs text-brass-gold tracking-widest uppercase font-bold block mb-4">
              Chairman
            </span>
            
            {/* Circular portrait */}
            <div className="w-24 h-24 mx-auto mb-5 rounded-full border-2 border-brass-gold overflow-hidden bg-ink-navy flex items-center justify-center shadow-md relative group-hover:scale-105 transition-transform duration-300">
              <img 
                src="/assets/chairman.jpeg?v=2" 
                alt="Chairman Riddhi Chand Jain" 
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>

            <h3 className="font-serif text-xl sm:text-2xl text-ink-navy font-bold mb-1">
              Riddhi Chand Jain
            </h3>
            <p className="font-serif text-sm text-muted-text italic mb-4">
              (Advocate)
            </p>
            <p className="text-muted-text text-sm leading-relaxed mb-6 font-sans">
              An esteemed advocate providing strategic oversight and steering the school’s core vision toward robust community integration.
            </p>
          </div>
          <div className="pt-4 border-t border-border-custom/60">
            <a 
              href="tel:9783199992" 
              className="inline-flex items-center gap-2 font-mono text-xs text-ink-navy hover:text-brass-gold font-bold transition-colors"
            >
              <Phone className="w-3.5 h-3.5" /> 9783199992
            </a>
          </div>
        </motion.div>

        {/* Card 2: Administrator */}
        <motion.div 
          whileHover={{ y: -6, scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-white p-5 sm:p-8 border border-border-custom rounded-sm text-center shadow-sm flex flex-col justify-between relative group text-slate-800"
        >
          <div className="absolute top-0 inset-x-0 h-1.5 bg-maroon"></div>
          <div>
            <span className="font-mono text-xs text-maroon tracking-widest uppercase font-bold block mb-4">
              Hon. Administrator
            </span>
            
            {/* Circular portrait */}
            <div className="w-24 h-24 mx-auto mb-5 rounded-full border-2 border-maroon overflow-hidden bg-ink-navy flex items-center justify-center shadow-md relative group-hover:scale-105 transition-transform duration-300">
              <img 
                src="/assets/administrator.jpeg" 
                alt="Administrator Ashok Sharma" 
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>

            <h3 className="font-serif text-xl sm:text-2xl text-ink-navy font-bold mb-1">
              Ashok Sharma
            </h3>
            <p className="font-serif text-sm text-muted-text italic mb-4">
              Management Oversight
            </p>
            <p className="text-muted-text text-sm leading-relaxed mb-6 font-sans">
              Leading the active operational strategy, campus resources, and safety standard protocols for student well-being.
            </p>
          </div>
          <div className="pt-4 border-t border-border-custom/60">
            <a 
              href="tel:9414400824" 
              className="inline-flex items-center gap-2 font-mono text-xs text-ink-navy hover:text-brass-gold font-bold transition-colors"
            >
              <Phone className="w-3.5 h-3.5" /> 9414400824
            </a>
          </div>
        </motion.div>

        {/* Card 3: Principal */}
        <motion.div 
          whileHover={{ y: -6, scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-white p-5 sm:p-8 border border-border-custom rounded-sm text-center shadow-sm flex flex-col justify-between relative group text-slate-800"
        >
          <div className="absolute top-0 inset-x-0 h-1.5 bg-navy-light"></div>
          <div>
            <span className="font-mono text-xs text-navy-light tracking-widest uppercase font-bold block mb-4">
              Principal
            </span>
            
            {/* Circular portrait */}
            <div className="w-24 h-24 mx-auto mb-5 rounded-full border-2 border-navy-light overflow-hidden bg-ink-navy flex items-center justify-center shadow-md relative group-hover:scale-105 transition-transform duration-300">
              <img 
                src="/assets/principal-1.jpeg?v=2" 
                alt="Principal Vardhman Jain" 
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>

            <h3 className="font-serif text-xl sm:text-2xl text-ink-navy font-bold mb-1">
              Vardhman Jain
            </h3>
            <p className="font-serif text-sm text-muted-text italic mb-4">
              Academic Head
            </p>
            <p className="text-muted-text text-sm leading-relaxed mb-6 font-sans">
              Supervising rigorous classroom schedules, bilingual curriculum design, and specialized JEE-NEET coaching integration.
            </p>
          </div>
          <div className="pt-4 border-t border-border-custom/60">
            <a 
              href="tel:9413182619" 
              className="inline-flex items-center gap-2 font-mono text-xs text-ink-navy hover:text-brass-gold font-bold transition-colors"
            >
              <Phone className="w-3.5 h-3.5" /> 9413182619
            </a>
          </div>
        </motion.div>

      </motion.div>
    </motion.section>
  );
}
