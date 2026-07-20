/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, useInView } from "motion/react";
import {
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  MapPin
} from "lucide-react";

// Import modular components
import Header from "./components/Header";
import Hero from "./components/Hero";
import Gallery from "./components/Gallery";
import LeadershipSection from "./components/LeadershipSection";
import AdmissionInquiryForm from "./components/AdmissionInquiryForm";
import Footer from "./components/Footer";
import CurriculumModal from "./components/CurriculumModal";
import SafetyMandateModal from "./components/SafetyMandateModal";
import InquiryModal from "./components/InquiryModal";
import StreamAdvisoryModal from "./components/StreamAdvisoryModal";

// Reusable Count-Up Counter Component
function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (isInView) {
      let startTime: number | null = null;
      const duration = 1200; // 1.2s

      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const easeProgress = progress * (2 - progress); // easeOutQuad
        setCount(Math.floor(easeProgress * value));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };

      window.requestAnimationFrame(step);
    }
  }, [isInView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// Staggered Entrance Animation Variants
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

// Lazy load AdminPanel
const AdminPanel = React.lazy(() => import("./components/AdminPanel"));

export default function App() {
  const [logoError, setLogoError] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<any>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
  const [inquiryPresetMessage, setInquiryPresetMessage] = useState("");
  const [inquiryFormContext, setInquiryFormContext] = useState<"admission" | "counselling">("admission");

  const handleOpenAdmissionInquiry = () => {
    setInquiryFormContext("admission");
    setInquiryPresetMessage("");
    setIsInquiryModalOpen(true);
  };

  const handleRequestCounsellingSession = () => {
    setInquiryFormContext("counselling");
    setInquiryPresetMessage("Requesting a stream selection counselling session (Science/Commerce/Arts).");
    setIsStreamModalOpen(false);
    setIsInquiryModalOpen(true);
  };

  React.useEffect(() => {
    if (window.location.pathname === "/admin" || window.location.pathname === "/admin/") {
      setShowAdminPanel(true);
    }
  }, []);

  const handleCloseAdminPanel = () => {
    setShowAdminPanel(false);
    if (window.location.pathname === "/admin" || window.location.pathname === "/admin/") {
      window.history.pushState({}, "", "/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brass-gold selection:text-ink-navy bg-ivory-paper">

      {/* 1. STICKY NAVBAR */}
      <Header
        logoError={logoError}
        setLogoError={setLogoError}
        setIsMediaModalOpen={setIsMediaModalOpen}
      />

      {/* 2. HERO SECTION (including NEET Special Highlight) */}
      <Hero setSelectedGalleryImg={setSelectedGalleryImg} onOpenInquiryModal={handleOpenAdmissionInquiry} />

      {/* 3. THIN DASHED GOLD DIVIDER LINE */}
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="dashed-divider h-0.5 w-full opacity-65 my-2 sm:my-4"></div>
      </div>

      {/* 4. NOTICE BOARD SECTION */}
      <motion.section
        id="notices"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="py-6 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
      >
        <motion.div variants={childVariants} className="text-center max-w-2xl mx-auto mb-4 sm:mb-12">
          <span className="font-mono text-xs tracking-widest text-maroon font-semibold uppercase block mb-2">
            Notice Board
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-ink-navy font-bold tracking-tight">
            Latest from the school
          </h2>
          <p className="text-muted-text mt-3 font-sans text-sm md:text-base">
            Keep track of live school notices, educational updates, and schedules. Hover over any pin to inspect details.
          </p>
        </motion.div>

        {/* Tan/cork-colored board container */}
        <motion.div
          variants={childVariants}
          className="bg-muted-board rounded-sm p-4 sm:p-8 lg:p-12 border border-border-custom shadow-inner relative overflow-hidden"
        >
          {/* Subtle wooden texture styling background elements */}
          <div className="absolute inset-0 bg-opacity-5 pointer-events-none bg-[radial-gradient(#C9A227_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 lg:gap-10">

            {/* CARD 1: Admission Open 2026–27 */}
            <motion.div
              whileHover={{ rotate: 0, y: -8, scale: 1.01 }}
              initial={{ rotate: -1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white p-4 pt-6 pb-5 sm:p-6 sm:pt-10 sm:pb-8 rounded-sm shadow-md border border-border-custom relative transition-shadow hover:shadow-xl flex flex-col justify-between text-slate-800"
            >
              {/* Wooden Pin Accent */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-maroon shadow-sm border border-black/10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-brass-gold"></div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-mono text-[9px] tracking-widest text-maroon uppercase font-bold bg-maroon/5 px-2 py-0.5 rounded">
                    URGENT NOTICE
                  </span>
                  <span className="font-mono text-[9px] text-muted-text">2026–27</span>
                </div>

                <h3 className="font-serif text-xl text-ink-navy font-bold mb-3 text-left">
                  Admission Open 2026–27
                </h3>

                <ul className="text-muted-text text-sm space-y-2 mb-4 leading-relaxed font-sans text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-brass-gold mt-1 font-bold">·</span>
                    <span><strong>Classes:</strong> Playgroup (P.G.) to Senior Secondary Class XII</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brass-gold mt-1 font-bold">·</span>
                    <span><strong>Mediums:</strong> English & Hindi Medium cohorts available</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brass-gold mt-1 font-bold">·</span>
                    <span><strong>Streams:</strong> Science, Commerce, and Arts (Arts stream excels)</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-dashed border-border-custom">
                <button
                  onClick={handleOpenAdmissionInquiry}
                  className="font-mono text-[11px] text-maroon hover:text-ink-navy font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  Apply / Inquire Now <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>

            {/* CARD 2: IIT-JEE & NEET */}
            <motion.div
              whileHover={{ rotate: 0, y: -8, scale: 1.01 }}
              initial={{ rotate: -1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white p-4 pt-6 pb-5 sm:p-6 sm:pt-10 sm:pb-8 rounded-sm shadow-md border border-border-custom relative transition-shadow hover:shadow-xl flex flex-col justify-between text-slate-800"
            >
              {/* Wooden Pin Accent */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-maroon shadow-sm border border-black/10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-brass-gold"></div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-mono text-[9px] tracking-widest text-navy-light uppercase font-bold bg-navy-light/5 px-2 py-0.5 rounded">
                    FOUNDATION
                  </span>
                  <span className="font-mono text-[9px] text-muted-text">Classes XI & XII</span>
                </div>

                <h3 className="font-serif text-xl text-ink-navy font-bold mb-3 text-left">
                  IIT-JEE & NEET Foundation
                </h3>

                <p className="text-muted-text text-sm leading-relaxed mb-4 text-left">
                  Dedicated in-house coaching curriculum with separate research booklets, routine evaluation tests, and doubt clearing squads to boost scientific and engineering readiness.
                </p>

                <div className="bg-muted-board/30 p-3 rounded border border-border-custom/50 text-[12px] text-body-text font-serif italic text-left">
                  "No need to migrate to separate tuition centers — complete integration at school."
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-dashed border-border-custom">
                <button
                  onClick={() => setIsCurriculumModalOpen(true)}
                  className="font-mono text-[11px] text-maroon hover:text-ink-navy font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  Explore Curriculum <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>

            {/* CARD 3: Safe System for Girls */}
            <motion.div
              whileHover={{ rotate: 0, y: -8, scale: 1.01 }}
              initial={{ rotate: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white p-4 pt-6 pb-5 sm:p-6 sm:pt-10 sm:pb-8 rounded-sm shadow-md border border-border-custom relative transition-shadow hover:shadow-xl flex flex-col justify-between text-slate-800"
            >
              {/* Wooden Pin Accent */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-maroon shadow-sm border border-black/10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-brass-gold"></div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-mono text-[9px] tracking-widest text-brass-gold uppercase font-bold bg-brass-gold/5 px-2 py-0.5 rounded">
                    CAMPUS SAFETY
                  </span>
                  <span className="font-mono text-[9px] text-muted-text">SECURE Campus</span>
                </div>

                <h3 className="font-serif text-xl text-ink-navy font-bold mb-3 text-left">
                  Safe System for Girls
                </h3>

                <p className="text-muted-text text-sm leading-relaxed mb-4 text-left">
                  A thoroughly secure, CCTV-supervised school perimeter. We provide transport vigilance systems and highly dedicated administrative guardianship for absolute parental peace of mind.
                </p>

                <div className="flex items-center gap-2 text-maroon">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider">Fully Supervised Facility</span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-dashed border-border-custom">
                <button
                  onClick={() => setIsSafetyModalOpen(true)}
                  className="font-mono text-[11px] text-maroon hover:text-ink-navy font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  Our Safety Mandate <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>

          </div>

          {/* Quick Notice Board Footer/Tip */}
          <div className="mt-4 sm:mt-8 text-center">
            <span className="font-mono text-[10px] text-muted-text uppercase tracking-widest">
              For manual application collection, please contact the administrative counter.
            </span>
          </div>
        </motion.div>
      </motion.section>

      {/* 5. FEATURES SECTION ("Why AMPS") */}
      <motion.section
        id="why-amps"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="bg-ink-navy text-white py-6 sm:py-16 px-4 sm:px-6 lg:px-8 w-full"
      >
        <div className="max-w-7xl mx-auto">

          <motion.div variants={childVariants} className="mb-4 sm:mb-16 border-b border-brass-gold/20 pb-6 sm:pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
            <div className="text-left">
              <span className="font-mono text-xs tracking-widest text-brass-gold uppercase block mb-2">
                Why Choose AMPS
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white font-bold tracking-tight">
                Our Core Distinctions
              </h2>
            </div>
            <p className="text-gray-300 max-w-md font-sans text-sm md:text-base leading-relaxed text-left">
              We structure our learning timeline to replicate school periods, building high discipline, focus, and a secure pathway for competitive results.
            </p>
          </motion.div>

          {/* Timetable Period Grid */}
          <motion.div variants={childVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">

            {/* Period 01 */}
            <div className="border-l-2 border-brass-gold pl-6 py-2 flex flex-col justify-between text-left">
              <div>
                <span className="font-mono text-brass-gold text-xs tracking-widest block mb-2 uppercase font-semibold">
                  Period 01
                </span>
                <h3 className="font-serif text-xl text-white font-medium mb-3">
                  Top District Results
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  AMPS consistently secures top-tier percentages and board rank scores in Karauli district year after year, building a trustworthy academic name.
                </p>
              </div>
              <div className="mt-4 sm:mt-6 text-[11px] font-mono text-brass-gold uppercase tracking-wider">
                Academic Merit
              </div>
            </div>

            {/* Period 02 */}
            <div className="border-l-2 border-brass-gold pl-6 py-2 flex flex-col justify-between text-left">
              <div>
                <span className="font-mono text-brass-gold text-xs tracking-widest block mb-2 uppercase font-semibold">
                  Period 02
                </span>
                <h3 className="font-serif text-xl text-white font-medium mb-3">
                  Playgroup to XII Journey
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  A structured school journey under one trust. We nurture children from foundational playgroups to high school senior streams.
                </p>
              </div>
              <div className="mt-4 sm:mt-6 text-[11px] font-mono text-brass-gold uppercase tracking-wider">
                Comprehensive Path
              </div>
            </div>

            {/* Period 03 */}
            <div className="border-l-2 border-brass-gold pl-6 py-2 flex flex-col justify-between text-left">
              <div>
                <span className="font-mono text-brass-gold text-xs tracking-widest block mb-2 uppercase font-semibold">
                  Period 03
                </span>
                <h3 className="font-serif text-xl text-white font-medium mb-3">
                  English & Hindi Medium
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Customized classrooms for both mediums. We ensure Hindi medium students master concepts while refining vital English skills.
                </p>
              </div>
              <div className="mt-4 sm:mt-6 text-[11px] font-mono text-brass-gold uppercase tracking-wider">
                Dual-Language Mastery
              </div>
            </div>

            {/* Period 04 */}
            <div className="border-l-2 border-brass-gold pl-6 py-2 flex flex-col justify-between text-left">
              <div>
                <span className="font-mono text-brass-gold text-xs tracking-widest block mb-2 uppercase font-semibold">
                  Period 04
                </span>
                <h3 className="font-serif text-xl text-white font-medium mb-3">
                  JEE & NEET Prep
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  We integrate IIT-JEE & NEET foundation modules early in Class XI & XII, reducing extra tuition costs and keeping focus aligned.
                </p>
              </div>
              <div className="mt-4 sm:mt-6 text-[11px] font-mono text-brass-gold uppercase tracking-wider">
                Competitive Ready
              </div>
            </div>

          </motion.div>

          {/* timetable note card */}
          <motion.div variants={childVariants} className="mt-4 sm:mt-16 bg-navy-light border border-brass-gold/25 p-4 sm:p-6 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 text-left">
            <div className="flex gap-4 items-start">
              <GraduationCap className="w-10 h-10 text-brass-gold shrink-0 mt-1" />
              <div>
                <h4 className="font-serif text-lg font-bold text-white">Stream Selection Advice Available</h4>
                <p className="text-gray-300 text-xs sm:text-sm mt-1 font-sans">Our administrative block holds individual counselling sessions for stream matching (Science, Commerce, Arts) for high school board options.</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsStreamModalOpen(true)}
              className="bg-brass-gold text-ink-navy hover:bg-brass-gold/90 px-5 py-2.5 rounded-sm font-mono text-xs font-bold uppercase tracking-wider text-center shrink-0 cursor-pointer"
            >
              Contact Advisory
            </motion.button>
          </motion.div>

        </div>
      </motion.section>

      {/* 6. STATS STRIP */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-muted-board/40 border-y border-border-custom py-4 sm:py-12 px-4 sm:px-6 lg:px-8 w-full"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-border-custom/80">

            {/* Stat 1 */}
            <div className="text-center px-4 flex flex-col items-center justify-center pt-3 md:pt-0">
              <span className="font-serif text-4xl md:text-5xl text-maroon font-bold mb-2">
                <Counter value={21} suffix="+" />
              </span>
              <span className="font-mono text-[10px] tracking-widest text-muted-text uppercase text-center max-w-[160px]">
                Years since 2005
              </span>
            </div>

            {/* Stat 2 */}
            <div className="text-center px-4 flex flex-col items-center justify-center pt-3 md:pt-0">
              <span className="font-serif text-4xl md:text-5xl text-maroon font-bold mb-2">
                <Counter value={3} />
              </span>
              <span className="font-mono text-[10px] tracking-widest text-muted-text uppercase text-center max-w-[160px]">
                Streams offered
              </span>
            </div>

            {/* Stat 3 */}
            <div className="text-center px-4 flex flex-col items-center justify-center pt-3 md:pt-0">
              <span className="font-serif text-4xl md:text-5xl text-maroon font-bold mb-2">
                <Counter value={2} />
              </span>
              <span className="font-mono text-[10px] tracking-widest text-muted-text uppercase text-center max-w-[160px]">
                Mediums · Eng & Hindi
              </span>
            </div>

            {/* Stat 4 */}
            <div className="text-center px-4 flex flex-col items-center justify-center pt-3 md:pt-0">
              <span className="font-serif text-4xl md:text-5xl text-maroon font-bold mb-2">
                P.G–XII
              </span>
              <span className="font-mono text-[10px] tracking-widest text-muted-text uppercase text-center max-w-[160px]">
                Rajasthan State Board
              </span>
            </div>

          </div>
        </div>
      </motion.section>

      {/* 7. LEADERSHIP SECTION */}
      <LeadershipSection />

      {/* 8. PHOTO & EVENTS GALLERY SECTION */}
      <Gallery
        isMediaModalOpen={isMediaModalOpen}
        setIsMediaModalOpen={setIsMediaModalOpen}
        selectedGalleryImg={selectedGalleryImg}
        setSelectedGalleryImg={setSelectedGalleryImg}
      />

      {/* 9. ABOUT SECTION */}
      <motion.section
        id="about"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="py-6 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-border-custom bg-white w-full"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-12 lg:gap-16 items-center">

            {/* Left Column (Academic Group Photo/Image) */}
            <motion.div variants={childVariants} className="lg:col-span-5 order-last lg:order-first">
              <div className="relative bg-white p-2 sm:p-4 border border-border-custom rounded-sm shadow-md">
                {/* Secondary frame accent */}
                <div className="absolute inset-1 sm:inset-2 border border-border-custom pointer-events-none"></div>
                <div className="w-full bg-white rounded-sm overflow-hidden relative">
                  <img
                    src="/assets/school-building-1.jpeg?v=2"
                    alt="Ashish Memorial School Campus & Activities"
                    loading="lazy"
                    className="w-full h-auto"
                  />
                  <div className="absolute bottom-3 right-3 bg-white/95 px-3 py-1 text-[10px] font-mono uppercase tracking-widest font-semibold border border-border-custom text-ink-navy">
                    Established 2005
                  </div>
                </div>
                <p className="text-center font-serif text-xs italic text-muted-text mt-3">
                  The primary academic block and front facade of AMPS Hindaun City.
                </p>
              </div>
            </motion.div>

            {/* Right Column (Text details) */}
            <motion.div variants={childVariants} className="lg:col-span-7 flex flex-col space-y-4 sm:space-y-6 text-left">

              <div>
                <span className="font-mono text-xs tracking-widest text-brass-gold uppercase block mb-2 font-semibold">
                  About Our Institution
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-ink-navy font-bold leading-tight tracking-tight">
                  The district's No. 1 English medium school in results
                </h2>
              </div>

              <div className="space-y-4 text-muted-text text-sm md:text-base leading-relaxed font-sans">
                <p>
                  Ashish Memorial Public Sr. Sec. School (AMPS) in Hindaun City has established an unmatched legacy of educational brilliance. Serving students from Playgroup to Class XII, we are highly acclaimed for achieving top ranks under the Rajasthan Board. Our dual-medium approach ensures English and Hindi medium students flourish in a collaborative, supportive academic environment.
                </p>
                <p>
                  With dedicated streams in Science, Commerce, and Arts, combined with professional foundation guidance for IIT-JEE & NEET, we build a launching pad for future leaders, engineers, doctors, and scholars. Our campus is built around rigorous academic routines, secure premises with specialized safety systems for girls, and an experienced faculty committed to individual mentoring.
                </p>
              </div>

              {/* Core Values checklist block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 sm:pt-4">
                <div className="flex items-center gap-2.5 text-body-text">
                  <div className="w-5 h-5 rounded-full bg-brass-gold/15 flex items-center justify-center text-brass-gold shrink-0">
                    <span className="text-xs">✓</span>
                  </div>
                  <span className="text-xs font-mono tracking-wider uppercase">Science, Commerce, Arts streams</span>
                </div>
                <div className="flex items-center gap-2.5 text-body-text">
                  <div className="w-5 h-5 rounded-full bg-brass-gold/15 flex items-center justify-center text-brass-gold shrink-0">
                    <span className="text-xs">✓</span>
                  </div>
                  <span className="text-xs font-mono tracking-wider uppercase">Rigorous State Board Preparation</span>
                </div>
                <div className="flex items-center gap-2.5 text-body-text">
                  <div className="w-5 h-5 rounded-full bg-brass-gold/15 flex items-center justify-center text-brass-gold shrink-0">
                    <span className="text-xs">✓</span>
                  </div>
                  <span className="text-xs font-mono tracking-wider uppercase">Safe, well-supervised campus</span>
                </div>
                <div className="flex items-center gap-2.5 text-body-text">
                  <div className="w-5 h-5 rounded-full bg-brass-gold/15 flex items-center justify-center text-brass-gold shrink-0">
                    <span className="text-xs">✓</span>
                  </div>
                  <span className="text-xs font-mono tracking-wider uppercase">Dual-Medium Academic Cohorts</span>
                </div>
              </div>

            </motion.div>

          </div>
        </div>
      </motion.section>

      {/* 9.5. VISION & MISSION SECTION */}
      <motion.section
        id="vision-mission"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="py-6 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-border-custom bg-ivory-paper w-full"
      >
        <div className="max-w-7xl mx-auto">

          <motion.div variants={childVariants} className="text-center max-w-2xl mx-auto mb-4 sm:mb-16">
            <span className="font-mono text-xs tracking-widest text-brass-gold font-semibold uppercase block mb-2">
              Our Foundations
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-ink-navy font-bold tracking-tight">
              Vision, Mission & Values
            </h2>
            <p className="font-serif text-sm text-muted-text italic mt-2">
              हमारा दृष्टिकोण और उद्देश्य - शिक्षित, संस्कारित और सशक्त राष्ट्र निर्माण
            </p>
            <div className="w-16 h-1 bg-brass-gold mx-auto mt-3 sm:mt-4"></div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-12 lg:gap-16 items-center">

            {/* Left Column (Original Principal Image & Inspirational Quote) */}
            <motion.div variants={childVariants} className="lg:col-span-5 flex flex-col items-center">
              <div className="relative bg-white p-2 sm:p-4 border border-border-custom rounded-sm shadow-md w-full max-w-md">
                {/* Secondary frame accent */}
                <div className="absolute inset-1 sm:inset-2 border border-border-custom pointer-events-none"></div>
                <div className="w-full bg-white rounded-sm overflow-hidden relative">
                  <img
                    src="/assets/principal.jpeg?v=2"
                    alt="Ashish Memorial Public School Inspirational Leadership"
                    loading="lazy"
                    className="w-full h-auto"
                  />
                  <div className="absolute bottom-3 left-3 bg-ink-navy/90 text-white border border-brass-gold/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest font-semibold">
                    From the Principal
                  </div>
                </div>

                {/* Overlay Quote */}
                <div className="mt-5 text-center relative px-2 text-slate-800">
                  <span className="absolute -top-3 left-0 text-4xl font-serif text-brass-gold/20 leading-none">“</span>
                  <p className="font-serif text-sm italic text-ink-navy/90 leading-relaxed pt-2">
                    Education is not merely the acquisition of knowledge, but the cultivation of moral character, self-discipline, and the relentless pursuit of excellence.
                  </p>
                  <span className="absolute -bottom-6 right-0 text-4xl font-serif text-brass-gold/20 leading-none">”</span>
                  <div className="w-8 h-[1px] bg-brass-gold/50 mx-auto mt-4"></div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-text mt-2 font-bold">
                    AMPS Core Philosophy
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Column (Vision, Mission & Core Pillars Cards) */}
            <motion.div variants={childVariants} className="lg:col-span-7 flex flex-col space-y-6 sm:space-y-8 text-left">

              {/* Vision Card */}
              <div className="bg-white p-4 sm:p-8 border border-border-custom rounded-sm shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group text-slate-800">
                <div className="absolute top-0 left-0 h-full w-1.5 bg-brass-gold"></div>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-brass-gold/10 flex items-center justify-center text-brass-gold shrink-0 mt-1">
                    <span className="font-serif text-lg font-bold">V</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-ink-navy mb-2 flex items-center gap-2">
                      Our Vision
                      <span className="text-xs font-mono font-normal text-muted-text italic">(हमारा दृष्टिकोण)</span>
                    </h3>
                    <p className="text-muted-text text-sm sm:text-base leading-relaxed">
                      To be a premier educational institution that nurtures young minds into academically accomplished, morally upright, and socially responsible citizens. We strive to foster a culture of lifelong learning, dynamic critical thinking, and inclusive excellence, guiding students to set benchmarks of success both regionally and nationally.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mission Card */}
              <div className="bg-white p-4 sm:p-8 border border-border-custom rounded-sm shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group text-slate-800">
                <div className="absolute top-0 left-0 h-full w-1.5 bg-maroon"></div>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-maroon/10 flex items-center justify-center text-maroon shrink-0 mt-1">
                    <span className="font-serif text-lg font-bold">M</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-ink-navy mb-2 flex items-center gap-2">
                      Our Mission
                      <span className="text-xs font-mono font-normal text-muted-text italic">(हमारा उद्देश्य)</span>
                    </h3>
                    <p className="text-muted-text text-sm sm:text-base leading-relaxed">
                      To deliver top-tier, bilingual (English & Hindi) instruction from kindergarten through Class XII. We commit to a highly structured academic routine, integrating deep board preparation with competitive exam (JEE/NEET) coaching. Through safe campuses, individual mentoring, and rich co-curricular initiatives, we empower every student to thrive.
                    </p>
                  </div>
                </div>
              </div>

              {/* Core Values Pillars */}
              <div>
                <h4 className="font-mono text-xs tracking-widest text-ink-navy uppercase font-bold mb-4">
                  Our Pillars of Excellence
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white/80 p-3 sm:p-4 border border-border-custom rounded-sm text-center text-slate-800">
                    <div className="w-8 h-8 rounded-full bg-ink-navy/5 flex items-center justify-center text-ink-navy mx-auto mb-2 font-mono text-xs font-bold">01</div>
                    <h5 className="font-serif text-sm font-bold text-ink-navy">Academic Rigor</h5>
                    <p className="text-muted-text text-[11px] mt-1 font-sans">Proven state merit list results and IIT/NEET foundation.</p>
                  </div>
                  <div className="bg-white/80 p-3 sm:p-4 border border-border-custom rounded-sm text-center text-slate-800">
                    <div className="w-8 h-8 rounded-full bg-ink-navy/5 flex items-center justify-center text-ink-navy mx-auto mb-2 font-mono text-xs font-bold">02</div>
                    <h5 className="font-serif text-sm font-bold text-ink-navy">Moral Ethics</h5>
                    <p className="text-muted-text text-[11px] mt-1 font-sans">Nurturing honesty, deep-rooted discipline, and mutual respect.</p>
                  </div>
                  <div className="bg-white/80 p-3 sm:p-4 border border-border-custom rounded-sm text-center text-slate-800">
                    <div className="w-8 h-8 rounded-full bg-ink-navy/5 flex items-center justify-center text-ink-navy mx-auto mb-2 font-mono text-xs font-bold">03</div>
                    <h5 className="font-serif text-sm font-bold text-ink-navy">Holistic Care</h5>
                    <p className="text-muted-text text-[11px] mt-1 font-sans">CCTV protection, girls' safety, and active athletics.</p>
                  </div>
                </div>
              </div>

            </motion.div>

          </div>
        </div>
      </motion.section>

      {/* 10. CONTACT SECTION & INQUIRY FORM */}
      <AdmissionInquiryForm formContext="admission" />

      {/* 10. FOOTER SECTION */}
      <Footer
        logoError={logoError}
        setLogoError={setLogoError}
        setIsMediaModalOpen={setIsMediaModalOpen}
      />

      {/* 11. CURRICULUM DETAIL MODAL */}
      <CurriculumModal
        isOpen={isCurriculumModalOpen}
        onClose={() => setIsCurriculumModalOpen(false)}
        onOpenInquiryModal={handleOpenAdmissionInquiry}
      />

      {/* 12. SAFETY MANDATE DETAIL MODAL */}
      <SafetyMandateModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
        onOpenInquiryModal={handleOpenAdmissionInquiry}
      />

      {/* 13. ADMISSION INQUIRY POPUP MODAL */}
      <InquiryModal
        key={inquiryFormContext}
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        presetMessage={inquiryPresetMessage}
        prefillMessage={inquiryPresetMessage}
        formContext={inquiryFormContext}
      />

      {/* 14. STREAM SELECTION ADVISORY MODAL */}
      <StreamAdvisoryModal
        isOpen={isStreamModalOpen}
        onClose={() => setIsStreamModalOpen(false)}
        onRequestSession={handleRequestCounsellingSession}
      />

      {/* 14. ADMIN DASHBOARD MODAL */}
      {showAdminPanel && (
        <React.Suspense fallback={null}>
          <AdminPanel onClose={handleCloseAdminPanel} />
        </React.Suspense>
      )}

    </div>
  );
}
