import React from "react";
import { ExternalLink, ZoomIn, ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { AppContainer } from "./layout/AppContainer";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import {
  sectionContainerVariants,
  childItemVariants,
  buttonPressProps,
  cardHoverProps,
  MotionDuration,
  MotionEase,
} from "../utils/motion";

interface HeroProps {
  setSelectedGalleryImg: (img: any) => void;
  onOpenInquiryModal?: () => void;
  onOpenAboutModal?: () => void;
}

export default function Hero({
  setSelectedGalleryImg,
  onOpenInquiryModal,
  onOpenAboutModal,
}: HeroProps) {
  // GPU-Accelerated Parallax via Framer Motion Values (Zero React Re-renders on Scroll)
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 600], ["0px", "90px"]);
  const scrollIndicatorOpacity = useTransform(scrollY, [0, 150], [1, 0]);

  const handleOpenNeetBanner = () => {
    setSelectedGalleryImg({
      id: "neet-achiever",
      title: "NEET Exam Success Achievers",
      subtitle:
        "Celebrating the outstanding results of our students in the National Eligibility cum Entrance Test (NEET) 2026.\n\n🏆 NEET ACHIEVER:\n• Piyush Bansal — All India Rank (AIR) 617\n\n📚 PREPARATION CURRICULUM:\n• Qualified with exceptional scores through our integrated school-level foundation course.\n• In-house coaching curriculum including separate evaluation tests and study modules.\n• 100% doubt resolution squads to ensure medical exam readiness without requiring separate external tuition.",
      category: "milestones",
      localSrc: "/assets/neet.jpeg",
      fallbackSrc:
        "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800&h=600",
    });
  };

  return (
    <>
      {/* 1. MAIN HERO SECTION */}
      <section
        id="hero"
        aria-label="Welcome to Ashish Memorial Public School"
        className="relative py-16 sm:py-20 md:py-24 overflow-hidden w-full min-h-[680px] sm:min-h-[720px] lg:min-h-[780px] flex items-center justify-center bg-ink-navy"
      >
        {/* Optimized Parallax Background Image with Enhanced Contrast & Architectural Warmth */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 pointer-events-none brightness-[1.08] contrast-[1.08] saturate-[1.12]"
          style={{
            backgroundImage: "url('/assets/school-building-2.jpeg?v=2')",
            y: backgroundY,
          }}
        />

        {/* Refined Navy Gradient Overlay - Deep Readability on Left, Clear Architecture on Right */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink-navy/95 via-ink-navy/70 to-ink-navy/20 pointer-events-none z-0" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] sm:w-[700px] sm:h-[700px] rounded-full bg-brass-gold/[0.09] blur-[130px] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(201,162,39,0.10)_0%,transparent_60%)] pointer-events-none z-0" />

        {/* Hero Content Container - Moved 40-60px Inward with Balanced Margins */}
        <AppContainer size="standard" padding="standard" className="relative z-10 px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24">
          <motion.div
            variants={sectionContainerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-[560px] sm:max-w-[580px] lg:max-w-[600px] xl:max-w-[620px] flex flex-col text-left"
          >
            {/* Editorial Badges */}
            <motion.div variants={childItemVariants} className="flex flex-wrap gap-2.5 sm:gap-3 items-center mb-5 sm:mb-6">
              <span className="font-mono text-xs sm:text-sm tracking-wide font-medium text-white/95 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 uppercase backdrop-blur-md shadow-sm">
                Est. 2005
              </span>
              <span className="font-mono text-xs sm:text-sm tracking-wide font-medium text-brass-gold bg-brass-gold/15 px-4 py-1.5 rounded-full border border-brass-gold/30 uppercase backdrop-blur-md shadow-sm">
                Rajasthan State Board
              </span>
              <span className="font-mono text-xs sm:text-sm tracking-wide font-medium text-white/95 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 uppercase backdrop-blur-md shadow-sm">
                English & Hindi Medium
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.div variants={childItemVariants} className="mb-4 sm:mb-5">
              <h1 className="font-serif text-[40px] sm:text-[50px] md:text-[58px] lg:text-[68px] text-white font-bold leading-[1.12] tracking-tight drop-shadow-sm">
                For a better tomorrow,{" "}
                <br className="hidden sm:inline" />
                <span className="italic text-brass-gold font-semibold block mt-1.5 drop-shadow-sm">
                  outshining every year.
                </span>
              </h1>
            </motion.div>

            {/* Sub-headline Paragraph - Limited to 500-520px with Generous Line-Height */}
            <motion.p
              variants={childItemVariants}
              className="text-slate-100/90 text-sm sm:text-base lg:text-[17px] leading-[1.78] sm:leading-[1.85] max-w-[510px] font-sans drop-shadow-xs mb-6 sm:mb-7"
            >
              Ashish Memorial Public Sr. Sec. School (AMPS) is a premier educational institution in Hindaun City, Rajasthan. Guided by scholarly principles, deep discipline, and modern pedagogical rigor, we guide our students towards stellar state board records and seamless foundation preparation for IIT-JEE and NEET.
            </motion.p>

            {/* Primary & Secondary Call to Actions */}
            <motion.div variants={childItemVariants} className="flex flex-wrap gap-4 sm:gap-5 items-center max-w-[510px] mb-7 sm:mb-8">
              <Button
                variant="primary"
                size="md"
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                onClick={(e) => {
                  if (onOpenAboutModal) {
                    e.preventDefault();
                    onOpenAboutModal();
                  }
                }}
                className="h-[50px] sm:h-[52px] px-[26px] sm:px-[28px] text-sm sm:text-base font-bold shadow-md hover:shadow-lg hover:shadow-brass-gold/20 transition-all duration-200"
              >
                Explore the School
              </Button>

              <a
                href="#contact"
                onClick={(e) => {
                  if (onOpenInquiryModal) {
                    e.preventDefault();
                    onOpenInquiryModal();
                  }
                }}
              >
                <Button
                  variant="outline"
                  size="md"
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  className="h-[50px] sm:h-[52px] px-[26px] sm:px-[28px] text-sm sm:text-base font-bold text-white border-white/80 hover:bg-white hover:text-ink-navy shadow-sm hover:shadow-lg transition-all duration-200"
                >
                  Admission 2026–27
                </Button>
              </a>
            </motion.div>

            {/* Key Academic Statistics Grid - 100% Fully Visible */}
            <motion.div
              variants={childItemVariants}
              className="grid grid-cols-3 gap-3 sm:gap-4 pt-5 border-t border-white/15 max-w-[510px] w-full"
            >
              <div className="bg-white/[0.08] backdrop-blur-md border border-white/15 rounded-xl py-2.5 px-3 sm:py-3 sm:px-4 text-left transition-all duration-300 hover:border-brass-gold/40 hover:bg-white/[0.12] shadow-sm group">
                <p className="font-serif text-lg sm:text-xl font-bold text-white/95 group-hover:text-brass-gold transition-colors">100%</p>
                <p className="font-mono text-[9px] sm:text-[10px] text-slate-200/90 uppercase tracking-wider mt-0.5 font-medium">
                  Board Success
                </p>
              </div>

              <div className="bg-white/[0.08] backdrop-blur-md border border-white/15 rounded-xl py-2.5 px-3 sm:py-3 sm:px-4 text-left transition-all duration-300 hover:border-brass-gold/40 hover:bg-white/[0.12] shadow-sm group">
                <p className="font-serif text-lg sm:text-xl font-bold text-white/95 group-hover:text-brass-gold transition-colors">Science</p>
                <p className="font-mono text-[9px] sm:text-[10px] text-slate-200/90 uppercase tracking-wider mt-0.5 font-medium">
                  Commerce & Arts
                </p>
              </div>

              <div className="bg-white/[0.08] backdrop-blur-md border border-white/15 rounded-xl py-2.5 px-3 sm:py-3 sm:px-4 text-left transition-all duration-300 hover:border-brass-gold/40 hover:bg-white/[0.12] shadow-sm group">
                <p className="font-serif text-lg sm:text-xl font-bold text-white/95 group-hover:text-brass-gold transition-colors">PG-XII</p>
                <p className="font-mono text-[9px] sm:text-[10px] text-slate-200/90 uppercase tracking-wider mt-0.5 font-medium">
                  Complete Journey
                </p>
              </div>
            </motion.div>
          </motion.div>
        </AppContainer>

        {/* Minimal Animated Scroll Down Indicator */}
        <motion.div
          style={{ opacity: scrollIndicatorOpacity }}
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 pointer-events-none"
          aria-hidden="true"
        >
          <div className="flex flex-col items-center gap-1 bg-black/20 backdrop-blur-sm border border-brass-gold/25 px-2.5 py-1 rounded-full shadow-sm">
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-brass-gold font-medium">Scroll</span>
            <motion.div
              animate={{ y: [0, 3, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown className="w-3.5 h-3.5 text-brass-gold" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* 2. NEET 2026 RESULT SPECIAL HIGHLIGHT SECTION - Floating Natural Below Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: MotionDuration.slow, ease: MotionEase.out }}
        className="bg-ivory-paper pt-8 sm:pt-12 md:pt-14 pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8 w-full relative z-20"
      >
        <AppContainer size="standard" padding="none">
          <div className="bg-gradient-to-r from-ink-navy via-navy-surface to-ink-navy border border-brass-gold/40 rounded-2xl p-7 sm:p-9 md:p-10 shadow-xl sm:shadow-2xl flex flex-col md:flex-row gap-6 sm:gap-8 items-center justify-between relative overflow-hidden group backdrop-blur-xl">
            {/* Subtle Lighting Accents */}
            <div className="absolute right-0 bottom-0 w-64 h-64 rounded-full bg-brass-gold/5 blur-2xl pointer-events-none z-0" />
            <div className="absolute left-0 top-0 w-48 h-48 rounded-full bg-maroon/10 blur-2xl pointer-events-none z-0" />

            {/* Left Block: Achievement Details */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left relative z-10">
              <div className="bg-brass-gold text-ink-navy font-mono font-black text-xs sm:text-sm px-3.5 py-2 rounded-sm shadow-sm uppercase tracking-wider shrink-0 select-none">
                🏆 AIR 617
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="font-mono text-[8px] tracking-wider text-white bg-maroon px-2 py-0.5 rounded font-bold uppercase inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white block animate-ping"></span> Live Announcement
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
                <p className="text-slate-300 text-[11px] sm:text-xs font-sans max-w-xl leading-relaxed">
                  Qualified under our integrated foundation curriculum without requiring external coaching migration. Click to view the full announcement poster and school details.
                </p>
              </div>
            </div>

            {/* Right Block: Thumbnail & Call to Action */}
            <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-center md:justify-end relative z-10">
              <motion.div
                {...cardHoverProps}
                onClick={handleOpenNeetBanner}
                className="w-12 h-12 rounded border border-white/20 overflow-hidden shadow-md cursor-pointer hover:border-brass-gold/60 transition-colors shrink-0 group relative bg-slate-900"
              >
                <img
                  src="/assets/piyush.jpeg"
                  alt="Piyush Bansal Portrait"
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                  <ZoomIn className="w-3.5 h-3.5 text-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </motion.div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenNeetBanner}
                rightIcon={<ExternalLink className="w-3 h-3" />}
                className="text-[10px] uppercase font-mono tracking-wider font-bold"
              >
                View Poster
              </Button>
            </div>
          </div>
        </AppContainer>
      </motion.section>
    </>
  );
}

