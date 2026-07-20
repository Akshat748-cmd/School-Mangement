import React, { useState, useEffect } from "react";
import { ExternalLink, ZoomIn } from "lucide-react";
import { motion } from "motion/react";

interface HeroProps {
  setSelectedGalleryImg: (img: any) => void;
  onOpenInquiryModal?: () => void;
}

export default function Hero({ setSelectedGalleryImg, onOpenInquiryModal }: HeroProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleOpenNeetBanner = () => {
    setSelectedGalleryImg({
      id: "neet-achiever",
      title: "NEET Exam Success Achievers",
      subtitle: "Celebrating the outstanding results of our students in the National Eligibility cum Entrance Test (NEET) 2026.\n\n🏆 NEET ACHIEVER:\n• Piyush Bansal — All India Rank (AIR) 617\n\n📚 PREPARATION CURRICULUM:\n• Qualified with exceptional scores through our integrated school-level foundation course.\n• In-house coaching curriculum including separate evaluation tests and study modules.\n• 100% doubt resolution squads to ensure medical exam readiness without requiring separate external tuition.",
      category: "milestones",
      localSrc: "/assets/neet.jpeg",
      fallbackSrc: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800&h=600"
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <>
      {/* 2. HERO SECTION */}
      <section
        id="hero"
        className="relative py-10 sm:py-16 md:py-24 overflow-hidden px-4 sm:px-6 lg:px-8 w-full min-h-[60vh] flex items-center bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('/assets/school-building-2.jpeg?v=2')",
          backgroundPositionY: `${scrollY * 0.15}px`
        }}
      >
        {/* Premium Dark Gradient Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink-navy via-ink-navy/95 to-black/45 z-0" />

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-3xl flex flex-col space-y-5"
          >

            <motion.div variants={itemVariants} className="flex flex-wrap gap-2 items-center">
              <span className="font-mono text-[10px] md:text-xs tracking-wider text-white bg-white/10 px-3 py-1 rounded-full border border-white/20 uppercase backdrop-blur-sm">
                Est. 2005
              </span>
              <span className="font-mono text-[10px] md:text-xs tracking-wider text-brass-gold bg-brass-gold/10 px-3 py-1 rounded-full border border-brass-gold/20 uppercase backdrop-blur-sm">
                Rajasthan State Board
              </span>
              <span className="font-mono text-[10px] md:text-xs tracking-wider text-white bg-white/10 px-3 py-1 rounded-full border border-white/20 uppercase backdrop-blur-sm">
                English & Hindi Medium
              </span>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-3">
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white font-bold leading-tight tracking-tight drop-shadow-sm">
                For a better tomorrow, <br className="hidden sm:inline" />
                <span className="italic text-brass-gold font-semibold block mt-1 drop-shadow-sm">
                  outshining every year.
                </span>
              </h1>
            </motion.div>

            <motion.p variants={itemVariants} className="text-gray-200 text-sm md:text-base leading-relaxed max-w-2xl font-sans drop-shadow-sm">
              Ashish Memorial Public Sr. Sec. School (AMPS) is a premier educational institution in Hindaun City, Rajasthan. Guided by scholarly principles, deep discipline, and modern pedagogical rigor, we guide our students towards stellar state board records and seamless foundation preparation for IIT-JEE and NEET.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-3 pt-1">
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href="#about"
                className="bg-brass-gold text-ink-navy hover:bg-brass-gold/90 px-5 py-2.5 rounded-sm font-sans font-bold text-xs md:text-sm tracking-wide shadow-md transition-all duration-200"
              >
                Explore the School
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href="#contact"
                onClick={(e) => {
                  if (onOpenInquiryModal) {
                    e.preventDefault();
                    onOpenInquiryModal();
                  }
                }}
                className="border-2 border-white text-white hover:bg-white hover:text-ink-navy px-5 py-2 rounded-sm font-sans font-medium text-xs md:text-sm tracking-wide transition-all duration-200 cursor-pointer"
              >
                Admission 2026–27
              </motion.a>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 pt-5 border-t border-white/15 max-w-md">
              <div>
                <p className="font-serif text-xl font-bold text-white">100%</p>
                <p className="font-mono text-[9px] text-gray-300 uppercase tracking-wider">Board Success</p>
              </div>
              <div>
                <p className="font-serif text-xl font-bold text-white">Science</p>
                <p className="font-mono text-[9px] text-gray-300 uppercase tracking-wider">Commerce & Arts</p>
              </div>
              <div>
                <p className="font-serif text-xl font-bold text-white">PG-XII</p>
                <p className="font-mono text-[9px] text-gray-300 uppercase tracking-wider">Complete Journey</p>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* 2.5. NEET 2026 RESULT SPECIAL HIGHLIGHT */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        className="bg-ivory-paper py-4 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full"
      >
        <div className="bg-gradient-to-r from-ink-navy via-[#111c33] to-ink-navy border border-brass-gold/25 rounded p-4 sm:p-6 shadow-lg flex flex-col md:flex-row gap-6 items-center justify-between relative overflow-hidden group">

          {/* Subtle glowing backgrounds */}
          <div className="absolute right-0 bottom-0 w-64 h-64 rounded-full bg-brass-gold/5 blur-2xl pointer-events-none z-0"></div>
          <div className="absolute left-0 top-0 w-48 h-48 rounded-full bg-maroon/5 blur-2xl pointer-events-none z-0"></div>

          {/* Left Block: Compact Achievement Details */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left relative z-10">
            {/* AIR Gold Badge */}
            <div className="bg-brass-gold text-ink-navy font-mono font-black text-sm px-3.5 py-2 rounded-sm shadow-md uppercase tracking-wider shrink-0 select-none">
              🏆 AIR 617
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="font-mono text-[8px] tracking-wider text-white bg-maroon px-2 py-0.5 rounded font-bold uppercase animate-pulse inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white block animate-ping animate-duration-1000"></span> Live Announcement
                </span>
                <span className="font-mono text-[8px] tracking-wider text-brass-gold bg-brass-gold/15 px-2.5 py-1 rounded border border-brass-gold/30 uppercase font-semibold">
                  NEET 2026 Result
                </span>
                <span className="font-serif text-white font-bold text-xs tracking-wide bg-white/10 px-2 py-0.5 rounded">
                  Piyush Bansal
                </span>
              </div>
              <h3 className="font-serif text-sm sm:text-base text-white font-medium tracking-tight">
                Spectacular Success in NEET 2026 Medical Exam!
              </h3>
              <p className="text-gray-300 text-[11px] font-sans max-w-xl leading-relaxed">
                Qualified under our integrated foundation curriculum without requiring external coaching migration. Click to view the full announcement poster and school details.
              </p>
            </div>
          </div>

          {/* Right Block: Thumbnail & Call to Action */}
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-center md:justify-end relative z-10">
            {/* Small Image Preview */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenNeetBanner}
              className="w-12 h-12 rounded border border-white/15 overflow-hidden shadow-md cursor-pointer hover:border-brass-gold/50 transition-colors shrink-0 group relative bg-slate-900"
            >
              <img
                src="/assets/piyush.jpeg"
                alt="Piyush Bansal Portrait"
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                <ZoomIn className="w-3.5 h-3.5 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-350" />
              </div>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleOpenNeetBanner}
              className="bg-brass-gold text-ink-navy hover:bg-brass-gold/90 transition-all font-mono font-bold text-[10px] tracking-wider uppercase px-4 py-2.5 rounded-sm border border-brass-gold shadow-md cursor-pointer flex items-center gap-1.5"
            >
              View Poster <ExternalLink className="w-3 h-3" />
            </motion.button>
          </div>

        </div>
      </motion.section>
    </>
  );
}
