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

import { ScrollProgressBar } from "./components/ui/ScrollProgressBar";
import { TiltCard } from "./components/ui/TiltCard";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Gallery from "./components/Gallery";
import LeadershipSection from "./components/LeadershipSection";
import FaqModal from "./components/FaqModal";
import AdmissionInquiryForm from "./components/AdmissionInquiryForm";
import Footer from "./components/Footer";
import CurriculumModal from "./components/CurriculumModal";
import SafetyMandateModal from "./components/SafetyMandateModal";
import InquiryModal from "./components/InquiryModal";
import StreamAdvisoryModal from "./components/StreamAdvisoryModal";
import AboutSchoolModal from "./components/AboutSchoolModal";

// Design System Foundations
import { AppSection } from "./components/layout/AppSection";
import { AppContainer } from "./components/layout/AppContainer";
import { Card } from "./components/ui/Card";
import { Button } from "./components/ui/Button";
import {
  sectionContainerVariants,
  childItemVariants,
  cardHoverProps,
  buttonPressProps,
  MotionDuration,
  MotionEase,
} from "./utils/motion";

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

// Helper function to render notice content in exact Card 2 bulleted format
function renderFormattedNoticeContent(text: string) {
  if (!text) return null;

  const rawLines = text.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0 && l !== "•");

  if (rawLines.length > 1) {
    return (
      <ul className="text-muted-text text-sm space-y-2 mb-4 leading-relaxed font-sans text-left">
        {rawLines.map((line, idx) => {
          const cleanLine = line.replace(/^[•\-\*]\s*/, "");
          const colonIdx = cleanLine.indexOf(":");
          if (colonIdx > 0 && colonIdx < 35) {
            const key = cleanLine.substring(0, colonIdx);
            const val = cleanLine.substring(colonIdx + 1);
            return (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-brass-gold mt-1 font-bold shrink-0">·</span>
                <span>
                  <strong className="text-ink-navy font-semibold">{key}:</strong>
                  {val}
                </span>
              </li>
            );
          }
          return (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-brass-gold mt-1 font-bold shrink-0">·</span>
              <span>{cleanLine}</span>
            </li>
          );
        })}
      </ul>
    );
  }

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  if (sentences.length > 1) {
    return (
      <ul className="text-muted-text text-sm space-y-2 mb-4 leading-relaxed font-sans text-left">
        {sentences.slice(0, 4).map((st, idx) => {
          const cleanSt = st.trim();
          const colonIdx = cleanSt.indexOf(":");
          if (colonIdx > 0 && colonIdx < 30) {
            const key = cleanSt.substring(0, colonIdx);
            const val = cleanSt.substring(colonIdx + 1);
            return (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-brass-gold mt-1 font-bold shrink-0">·</span>
                <span>
                  <strong className="text-ink-navy font-semibold">{key}:</strong>
                  {val}
                </span>
              </li>
            );
          }
          return (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-brass-gold mt-1 font-bold shrink-0">·</span>
              <span>{cleanSt}</span>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <p className="text-muted-text text-sm leading-relaxed mb-4 text-left font-sans">
      {text}
    </p>
  );
}

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
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [inquiryPresetMessage, setInquiryPresetMessage] = useState("");
  const [inquiryFormContext, setInquiryFormContext] = useState<"admission" | "counselling">("admission");
  const [liveAnnouncements, setLiveAnnouncements] = useState<any[]>([]);

  React.useEffect(() => {
    fetch("/api/announcements")
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.announcements)) {
          setLiveAnnouncements(data.announcements);
        }
      })
      .catch(err => console.error("Error fetching live announcements:", err));
  }, []);

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
      {/* GLOBAL SCROLL PROGRESS BAR */}
      <ScrollProgressBar />

      {/* 1. STICKY NAVBAR */}
      <Header
        logoError={logoError}
        setLogoError={setLogoError}
        setIsMediaModalOpen={setIsMediaModalOpen}
        setIsFaqModalOpen={setIsFaqModalOpen}
      />

      {/* 2. HERO SECTION */}
      <Hero 
        setSelectedGalleryImg={setSelectedGalleryImg} 
        onOpenInquiryModal={handleOpenAdmissionInquiry} 
        onOpenAboutModal={() => setIsAboutModalOpen(true)} 
      />

      {/* 3. THIN DASHED GOLD DIVIDER LINE */}
      <AppContainer size="standard" padding="standard">
        <div className="dashed-divider h-0.5 w-full opacity-65 my-2 sm:my-4"></div>
      </AppContainer>

      {/* 4. NOTICE BOARD SECTION - Premium Editorial Announcement Board */}
      <AppSection id="notices" className="bg-[#FAF9F6] py-18 sm:py-22 lg:py-28 border-y border-border-custom/60">
        <motion.div variants={childItemVariants} className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="font-mono text-[11px] sm:text-xs tracking-[0.18em] text-brass-gold font-bold uppercase block mb-2 sm:mb-2.5">
            Notice Board
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-ink-navy font-bold tracking-tight leading-[1.2]">
            Latest from the School
          </h2>
          <p className="text-muted-text mt-3.5 font-sans text-sm md:text-base leading-[1.75] max-w-xl mx-auto">
            Keep track of live school notices, educational updates, and schedules. Hover over any pin to inspect details.
          </p>
        </motion.div>

        {/* Warm Premium Cork & Paper Board Container */}
        <motion.div
          variants={childItemVariants}
          className="bg-muted-board/70 rounded-2xl p-5 sm:p-9 lg:p-12 border border-border-custom/80 shadow-md relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-opacity-5 pointer-events-none bg-[radial-gradient(#C9A227_1.2px,transparent_1.2px)] [background-size:18px_18px] opacity-10"></div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">

            {/* LIVE ANNOUNCEMENTS FROM ADMIN PANEL (SORTED BY PRIORITY) */}
            {[...liveAnnouncements]
              .sort((a, b) => {
                const pOrder: Record<string, number> = { high: 0, normal: 1, low: 2 };
                const pA = pOrder[a.priority] ?? 1;
                const pB = pOrder[b.priority] ?? 1;
                if (pA !== pB) return pA - pB;
                return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
              })
              .map((ann: any, index: number) => {
                const isHigh = ann.priority === "high";
                const isLow = ann.priority === "low";

                const priorityBadge = isHigh ? "URGENT NOTICE" : isLow ? "NOTICE" : "SCHOOL ANNOUNCEMENT";
                const priorityColor = isHigh ? "text-rose-800 bg-rose-50 border-rose-200 font-extrabold" :
                                      isLow ? "text-slate-700 bg-slate-100 border-slate-200 font-bold" :
                                      "text-maroon bg-maroon/8 border-maroon/20 font-bold";

                const cardBorder = isHigh ? "border-2 border-rose-400 shadow-rose-100" : "border border-brass-gold/25 hover:border-brass-gold/60";
                const pinBg = isHigh ? "bg-rose-600" : "bg-maroon";

                return (
                  <motion.div
                    key={ann.id || index}
                    whileHover={{ y: -4 }}
                    initial={{ rotate: index % 2 === 0 ? -0.5 : 0.5 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={`bg-[#FDFBF7] p-6 pt-8 pb-6 sm:p-8 sm:pt-10 sm:pb-8 rounded-xl shadow-sm hover:shadow-xl ${cardBorder} relative transition-all flex flex-col justify-between text-slate-800 h-full group/card`}
                  >
                    <div className={`absolute top-3.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full ${pinBg} shadow-md border border-black/10 flex items-center justify-center z-10`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-brass-gold"></div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-4 pb-3 border-b border-border-custom/40">
                        <span className={`font-mono text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 rounded-md border ${priorityColor}`}>
                          {priorityBadge}
                        </span>
                        <span className="font-mono text-[10px] text-muted-text font-semibold tracking-wider">
                          {new Date(ann.created_at || Date.now()).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                        </span>
                      </div>

                      <h3 className="font-serif text-[22px] sm:text-2xl text-ink-navy font-bold mb-3 sm:mb-4 text-left leading-snug tracking-tight group-hover/card:text-maroon transition-colors">
                        {ann.title}
                      </h3>

                      {renderFormattedNoticeContent(ann.content)}
                    </div>

                    <div className="pt-4 sm:pt-5 border-t border-dashed border-border-custom flex items-center justify-between text-[11px] font-mono text-muted-text mt-auto">
                      <span>By <strong className="text-ink-navy">{ann.created_by || "Admin"}</strong></span>
                      <button
                        onClick={handleOpenAdmissionInquiry}
                        className="group/link font-mono text-xs text-maroon hover:text-ink-navy font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-brass-gold rounded-xs"
                      >
                        <span>Inquire</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform duration-200" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}

            {/* CARD 1: Admission Open 2026–27 */}
            <motion.div
              whileHover={{ y: -4 }}
              initial={{ rotate: -0.5 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-[#FDFBF7] p-6 pt-8 pb-6 sm:p-8 sm:pt-10 sm:pb-8 rounded-xl shadow-sm hover:shadow-xl border border-brass-gold/25 hover:border-brass-gold/60 relative transition-all flex flex-col justify-between text-slate-800 h-full group/card"
            >
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-maroon shadow-md border border-black/10 flex items-center justify-center z-10">
                <div className="w-1.5 h-1.5 rounded-full bg-brass-gold"></div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-border-custom/40">
                  <span className="font-mono text-[10px] tracking-[0.15em] text-maroon uppercase font-bold bg-maroon/8 border border-maroon/20 px-2.5 py-1 rounded-md">
                    URGENT NOTICE
                  </span>
                  <span className="font-mono text-[10px] text-muted-text font-semibold tracking-wider">2026–27</span>
                </div>

                <h3 className="font-serif text-[22px] sm:text-2xl text-ink-navy font-bold mb-3 sm:mb-4 text-left leading-snug tracking-tight group-hover/card:text-maroon transition-colors">
                  Admission Open 2026–27
                </h3>

                <ul className="text-muted-text text-sm space-y-2.5 mb-5 leading-[1.7] font-sans text-left">
                  <li className="flex items-start gap-2.5">
                    <span className="text-brass-gold mt-1 font-bold">·</span>
                    <span><strong>Classes:</strong> Playgroup (P.G.) to Senior Secondary Class XII</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-brass-gold mt-1 font-bold">·</span>
                    <span><strong>Mediums:</strong> English & Hindi Medium cohorts available</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-brass-gold mt-1 font-bold">·</span>
                    <span><strong>Streams:</strong> Science, Commerce, and Arts (Arts stream excels)</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 sm:pt-5 border-t border-dashed border-border-custom mt-auto">
                <button
                  onClick={handleOpenAdmissionInquiry}
                  className="group/link font-mono text-xs text-maroon hover:text-ink-navy font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-brass-gold rounded-xs"
                >
                  <span>Apply / Inquire Now</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform duration-200" />
                </button>
              </div>
            </motion.div>

            {/* CARD 2: IIT-JEE & NEET */}
            <motion.div
              whileHover={{ y: -4 }}
              initial={{ rotate: -0.5 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-[#FDFBF7] p-6 pt-8 pb-6 sm:p-8 sm:pt-10 sm:pb-8 rounded-xl shadow-sm hover:shadow-xl border border-brass-gold/25 hover:border-brass-gold/60 relative transition-all flex flex-col justify-between text-slate-800 h-full group/card"
            >
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-maroon shadow-md border border-black/10 flex items-center justify-center z-10">
                <div className="w-1.5 h-1.5 rounded-full bg-brass-gold"></div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-border-custom/40">
                  <span className="font-mono text-[10px] tracking-[0.15em] text-navy-light uppercase font-bold bg-navy-light/8 border border-navy-light/20 px-2.5 py-1 rounded-md">
                    FOUNDATION
                  </span>
                  <span className="font-mono text-[10px] text-muted-text font-semibold tracking-wider">Classes XI & XII</span>
                </div>

                <h3 className="font-serif text-[22px] sm:text-2xl text-ink-navy font-bold mb-3 sm:mb-4 text-left leading-snug tracking-tight group-hover/card:text-maroon transition-colors">
                  IIT-JEE & NEET Foundation
                </h3>

                <p className="text-muted-text text-sm leading-[1.7] mb-4 text-left font-sans">
                  Dedicated in-house coaching curriculum with separate research booklets, routine evaluation tests, and doubt clearing squads to boost scientific and engineering readiness.
                </p>

                <div className="bg-white/80 p-3.5 rounded-lg border border-border-custom/60 text-[12px] text-body-text font-serif italic text-left leading-relaxed shadow-xs">
                  "No need to migrate to separate tuition centers — complete integration at school."
                </div>
              </div>

              <div className="pt-4 sm:pt-5 border-t border-dashed border-border-custom mt-auto">
                <button
                  onClick={() => setIsCurriculumModalOpen(true)}
                  className="group/link font-mono text-xs text-maroon hover:text-ink-navy font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-brass-gold rounded-xs"
                >
                  <span>Explore Curriculum</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform duration-200" />
                </button>
              </div>
            </motion.div>

            {/* CARD 3: Safe System for Girls */}
            <motion.div
              whileHover={{ y: -4 }}
              initial={{ rotate: 0.5 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-[#FDFBF7] p-6 pt-8 pb-6 sm:p-8 sm:pt-10 sm:pb-8 rounded-xl shadow-sm hover:shadow-xl border border-brass-gold/25 hover:border-brass-gold/60 relative transition-all flex flex-col justify-between text-slate-800 h-full group/card"
            >
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-maroon shadow-md border border-black/10 flex items-center justify-center z-10">
                <div className="w-1.5 h-1.5 rounded-full bg-brass-gold"></div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-border-custom/40">
                  <span className="font-mono text-[10px] tracking-[0.15em] text-brass-gold uppercase font-bold bg-brass-gold/10 border border-brass-gold/30 px-2.5 py-1 rounded-md">
                    CAMPUS SAFETY
                  </span>
                  <span className="font-mono text-[10px] text-muted-text font-semibold tracking-wider">SECURE Campus</span>
                </div>

                <h3 className="font-serif text-[22px] sm:text-2xl text-ink-navy font-bold mb-3 sm:mb-4 text-left leading-snug tracking-tight group-hover/card:text-maroon transition-colors">
                  Safe System for Girls
                </h3>

                <p className="text-muted-text text-sm leading-[1.7] mb-4 text-left font-sans">
                  A thoroughly secure, CCTV-supervised school perimeter. We provide transport vigilance systems and highly dedicated administrative guardianship for absolute parental peace of mind.
                </p>

                <div className="flex items-center gap-2 text-maroon pt-1">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider">Fully Supervised Facility</span>
                </div>
              </div>

              <div className="pt-4 sm:pt-5 border-t border-dashed border-border-custom mt-auto">
                <button
                  onClick={() => setIsSafetyModalOpen(true)}
                  className="group/link font-mono text-xs text-maroon hover:text-ink-navy font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-brass-gold rounded-xs"
                >
                  <span>Our Safety Mandate</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform duration-200" />
                </button>
              </div>
            </motion.div>

          </div>

          <div className="mt-8 sm:mt-10 text-center">
            <span className="font-mono text-[10px] sm:text-[11px] text-muted-text uppercase tracking-[0.18em] font-medium">
              For manual application collection, please contact the administrative counter.
            </span>
          </div>
        </motion.div>
      </AppSection>

      {/* 5. FEATURES SECTION ("Why AMPS") */}
      <AppSection id="why-amps" bg="navy" paddingY="lg">
        <motion.div variants={childItemVariants} className="mb-10 sm:mb-16 border-b border-brass-gold/20 pb-6 sm:pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
          <div className="text-left">
            <span className="font-mono text-[11px] sm:text-xs tracking-[0.18em] text-brass-gold uppercase block mb-2 font-bold">
              Why Choose AMPS
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white font-bold tracking-tight leading-[1.2]">
              Our Core Distinctions
            </h2>
          </div>
          <p className="text-slate-300 max-w-md font-sans text-sm md:text-[15px] leading-[1.75] text-left">
            We structure our learning timeline to replicate school periods, building high discipline, focus, and a secure pathway for competitive results.
          </p>
        </motion.div>

        {/* Timetable Period Grid */}
        <motion.div variants={childItemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">

          {/* Period 01 */}
          <div className="border-l-2 border-brass-gold pl-6 py-2 flex flex-col justify-between text-left">
            <div>
              <span className="font-mono text-brass-gold text-xs tracking-[0.18em] block mb-2 uppercase font-bold">
                Period 01
              </span>
              <h3 className="font-serif text-xl sm:text-[22px] text-white font-semibold mb-3 leading-snug">
                Top District Results
              </h3>
              <p className="text-slate-300 text-sm leading-[1.72] font-sans">
                AMPS consistently secures top-tier percentages and board rank scores in Karauli district year after year, building a trustworthy academic name.
              </p>
            </div>
            <div className="mt-4 sm:mt-6 text-[11px] font-mono text-brass-gold uppercase tracking-[0.15em] font-semibold">
              Academic Merit
            </div>
          </div>

          {/* Period 02 */}
          <div className="border-l-2 border-brass-gold pl-6 py-2 flex flex-col justify-between text-left">
            <div>
              <span className="font-mono text-brass-gold text-xs tracking-[0.18em] block mb-2 uppercase font-bold">
                Period 02
              </span>
              <h3 className="font-serif text-xl sm:text-[22px] text-white font-semibold mb-3 leading-snug">
                Playgroup to XII Journey
              </h3>
              <p className="text-slate-300 text-sm leading-[1.72] font-sans">
                A structured school journey under one trust. We nurture children from foundational playgroups to high school senior streams.
              </p>
            </div>
            <div className="mt-4 sm:mt-6 text-[11px] font-mono text-brass-gold uppercase tracking-[0.15em] font-semibold">
              Comprehensive Path
            </div>
          </div>

          {/* Period 03 */}
          <div className="border-l-2 border-brass-gold pl-6 py-2 flex flex-col justify-between text-left">
            <div>
              <span className="font-mono text-brass-gold text-xs tracking-[0.18em] block mb-2 uppercase font-bold">
                Period 03
              </span>
              <h3 className="font-serif text-xl sm:text-[22px] text-white font-semibold mb-3 leading-snug">
                English & Hindi Medium
              </h3>
              <p className="text-slate-300 text-sm leading-[1.72] font-sans">
                Customized classrooms for both mediums. We ensure Hindi medium students master concepts while refining vital English skills.
              </p>
            </div>
            <div className="mt-4 sm:mt-6 text-[11px] font-mono text-brass-gold uppercase tracking-[0.15em] font-semibold">
              Dual-Language Mastery
            </div>
          </div>

          {/* Period 04 */}
          <div className="border-l-2 border-brass-gold pl-6 py-2 flex flex-col justify-between text-left">
            <div>
              <span className="font-mono text-brass-gold text-xs tracking-[0.18em] block mb-2 uppercase font-bold">
                Period 04
              </span>
              <h3 className="font-serif text-xl sm:text-[22px] text-white font-semibold mb-3 leading-snug">
                JEE & NEET Prep
              </h3>
              <p className="text-slate-300 text-sm leading-[1.72] font-sans">
                We integrate IIT-JEE & NEET foundation modules early in Class XI & XII, reducing extra tuition costs and keeping focus aligned.
              </p>
            </div>
            <div className="mt-4 sm:mt-6 text-[11px] font-mono text-brass-gold uppercase tracking-[0.15em] font-semibold">
              Competitive Ready
            </div>
          </div>

        </motion.div>

        {/* Stream selection callout banner */}
        <motion.div variants={childItemVariants} className="mt-12 sm:mt-16 bg-navy-surface border border-brass-gold/25 p-5 sm:p-6 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-left shadow-md">
          <div className="flex gap-4 items-start">
            <GraduationCap className="w-10 h-10 text-brass-gold shrink-0 mt-1" />
            <div>
              <h4 className="font-serif text-lg font-bold text-white leading-snug">Stream Selection Advice Available</h4>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 font-sans leading-[1.7]">Our administrative block holds individual counselling sessions for stream matching (Science, Commerce, Arts) for high school board options.</p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsStreamModalOpen(true)}
            className="uppercase font-mono font-bold tracking-wider shrink-0 text-xs"
          >
            Contact Advisory
          </Button>
        </motion.div>
      </AppSection>

      {/* 6. STATS STRIP */}
      <AppSection bg="muted" paddingY="sm" bordered animated={false}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-border-custom/80">
          <div className="text-center px-4 flex flex-col items-center justify-center pt-3 md:pt-0">
            <span className="font-serif text-3xl sm:text-4xl md:text-[44px] text-maroon font-bold mb-2">
              <Counter value={21} suffix="+" />
            </span>
            <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.15em] text-muted-text uppercase text-center max-w-[160px] font-medium">
              Years since 2005
            </span>
          </div>

          <div className="text-center px-4 flex flex-col items-center justify-center pt-3 md:pt-0">
            <span className="font-serif text-3xl sm:text-4xl md:text-[44px] text-maroon font-bold mb-2">
              <Counter value={3} />
            </span>
            <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.15em] text-muted-text uppercase text-center max-w-[160px] font-medium">
              Streams offered
            </span>
          </div>

          <div className="text-center px-4 flex flex-col items-center justify-center pt-3 md:pt-0">
            <span className="font-serif text-3xl sm:text-4xl md:text-[44px] text-maroon font-bold mb-2">
              <Counter value={2} />
            </span>
            <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.15em] text-muted-text uppercase text-center max-w-[160px] font-medium">
              Mediums · Eng & Hindi
            </span>
          </div>

          <div className="text-center px-4 flex flex-col items-center justify-center pt-3 md:pt-0">
            <span className="font-serif text-3xl sm:text-4xl md:text-[44px] text-maroon font-bold mb-2">
              P.G–XII
            </span>
            <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.15em] text-muted-text uppercase text-center max-w-[160px] font-medium">
              Rajasthan State Board
            </span>
          </div>
        </div>
      </AppSection>

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
      <AppSection id="about" bg="white" paddingY="lg" bordered>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          <motion.div variants={childItemVariants} className="lg:col-span-5 order-last lg:order-first">
            <Card variant="elevated" padding="sm" className="relative shadow-md">
              <div className="absolute inset-2 border border-border-custom pointer-events-none"></div>
              <div className="w-full bg-white rounded-sm overflow-hidden relative">
                <img
                  src="/assets/school-building-1.jpeg?v=2"
                  alt="Ashish Memorial School Campus & Activities"
                  loading="lazy"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute bottom-3 right-3 bg-white/95 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em] font-bold border border-border-custom text-ink-navy shadow-sm">
                  Established 2005
                </div>
              </div>
              <p className="text-center font-serif text-xs italic text-muted-text mt-3">
                The primary academic block and front facade of AMPS Hindaun City.
              </p>
            </Card>
          </motion.div>

          <motion.div variants={childItemVariants} className="lg:col-span-7 flex flex-col space-y-5 text-left">
            <div>
              <span className="font-mono text-[11px] sm:text-xs tracking-[0.18em] text-brass-gold uppercase block mb-2 font-bold">
                About Our Institution
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-ink-navy font-bold leading-[1.22] tracking-tight">
                The district's No. 1 English medium school in results
              </h2>
            </div>

            <div className="space-y-4 text-muted-text text-sm md:text-[15px] leading-[1.75] font-sans max-w-2xl">
              <p>
                Ashish Memorial Public Sr. Sec. School (AMPS) in Hindaun City has established an unmatched legacy of educational brilliance. Serving students from Playgroup to Class XII, we are highly acclaimed for achieving top ranks under the Rajasthan Board. Our dual-medium approach ensures English and Hindi medium students flourish in a collaborative, supportive academic environment.
              </p>
              <p>
                With dedicated streams in Science, Commerce, and Arts, combined with professional foundation guidance for IIT-JEE & NEET, we build a launching pad for future leaders, engineers, doctors, and scholars. Our campus is built around rigorous academic routines, secure premises with specialized safety systems for girls, and an experienced faculty committed to individual mentoring.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="flex items-center gap-2.5 text-body-text">
                <div className="w-5 h-5 rounded-full bg-brass-gold/15 flex items-center justify-center text-brass-gold shrink-0 font-bold">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-xs font-mono tracking-wider uppercase font-medium">Science, Commerce, Arts streams</span>
              </div>
              <div className="flex items-center gap-2.5 text-body-text">
                <div className="w-5 h-5 rounded-full bg-brass-gold/15 flex items-center justify-center text-brass-gold shrink-0 font-bold">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-xs font-mono tracking-wider uppercase font-medium">Rigorous State Board Preparation</span>
              </div>
              <div className="flex items-center gap-2.5 text-body-text">
                <div className="w-5 h-5 rounded-full bg-brass-gold/15 flex items-center justify-center text-brass-gold shrink-0 font-bold">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-xs font-mono tracking-wider uppercase font-medium">Safe, well-supervised campus</span>
              </div>
              <div className="flex items-center gap-2.5 text-body-text">
                <div className="w-5 h-5 rounded-full bg-brass-gold/15 flex items-center justify-center text-brass-gold shrink-0 font-bold">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-xs font-mono tracking-wider uppercase font-medium">Dual-Medium Academic Cohorts</span>
              </div>
            </div>
          </motion.div>
        </div>
      </AppSection>

      {/* 9.5. VISION & MISSION SECTION - Editorial Foundation Pass */}
      <AppSection id="vision-mission" className="bg-[#FAF9F6] py-18 sm:py-22 lg:py-28 border-t border-border-custom/60">
        <motion.div variants={childItemVariants} className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="font-mono text-[11px] sm:text-xs tracking-[0.18em] text-brass-gold font-bold uppercase block mb-2 sm:mb-2.5">
            Our Foundations
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-ink-navy font-bold tracking-tight leading-[1.2]">
            Vision, Mission & Values
          </h2>
          <p className="font-serif text-sm sm:text-base text-muted-text italic mt-3 leading-relaxed">
            हमारा दृष्टिकोण और उद्देश्य - शिक्षित, संस्कारित और सशक्त राष्ट्र निर्माण
          </p>
          <div className="w-16 h-1 bg-brass-gold mx-auto mt-4 rounded-full"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Quote & Image Card Frame */}
          <motion.div variants={childItemVariants} className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-[440px] bg-white rounded-2xl p-3 sm:p-4 border-2 border-brass-gold/35 shadow-xl relative overflow-hidden text-slate-800">
              <div className="w-full bg-slate-100 rounded-xl overflow-hidden relative shadow-xs">
                <img
                  src="/assets/principal-2.jpeg"
                  alt="Ashish Memorial Public School Inspirational Leadership"
                  loading="lazy"
                  className="w-full h-auto object-cover max-h-[460px]"
                />
                <div className="absolute bottom-3 left-3 bg-ink-navy/95 text-white border border-brass-gold/40 px-3.5 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-[0.18em] font-bold shadow-md">
                  From the Principal
                </div>
              </div>

              <div className="mt-5 sm:mt-6 text-center relative px-3 pb-2 text-slate-800">
                <span className="absolute -top-3 left-1 text-5xl font-serif text-brass-gold/25 leading-none select-none">“</span>
                <p className="font-serif text-sm sm:text-[15px] italic text-ink-navy/90 leading-[1.78] pt-2 max-w-sm mx-auto">
                  Education is not merely the acquisition of knowledge, but the cultivation of moral character, self-discipline, and the relentless pursuit of excellence.
                </p>
                <span className="absolute -bottom-7 right-1 text-5xl font-serif text-brass-gold/25 leading-none select-none">”</span>
                <div className="w-12 h-[1px] bg-brass-gold/40 mx-auto mt-4"></div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-text mt-2.5 font-bold">
                  AMPS Core Philosophy
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Vision, Mission & Pillars */}
          <motion.div variants={childItemVariants} className="lg:col-span-7 flex flex-col space-y-6 sm:space-y-8 text-left">
            {/* Vision Card */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white border-l-4 border-l-brass-gold border-y border-r border-border-custom/80 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex gap-4.5 items-start">
                <div className="w-12 h-12 rounded-xl bg-brass-gold/10 border border-brass-gold/30 flex items-center justify-center text-brass-gold shrink-0 shadow-xs mt-0.5">
                  <span className="font-serif text-xl font-bold">V</span>
                </div>
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-ink-navy mb-2 flex items-center gap-2.5 tracking-tight">
                    Our Vision
                    <span className="text-xs font-mono font-normal text-muted-text italic">(हमारा दृष्टिकोण)</span>
                  </h3>
                  <p className="text-muted-text text-sm sm:text-[15px] leading-[1.78] font-sans">
                    To be a premier educational institution that nurtures young minds into academically accomplished, morally upright, and socially responsible citizens. We strive to foster a culture of lifelong learning, dynamic critical thinking, and inclusive excellence, guiding students to set benchmarks of success both regionally and nationally.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Mission Card */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white border-l-4 border-l-maroon border-y border-r border-border-custom/80 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex gap-4.5 items-start">
                <div className="w-12 h-12 rounded-xl bg-maroon/10 border border-maroon/30 flex items-center justify-center text-maroon shrink-0 shadow-xs mt-0.5">
                  <span className="font-serif text-xl font-bold">M</span>
                </div>
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-ink-navy mb-2 flex items-center gap-2.5 tracking-tight">
                    Our Mission
                    <span className="text-xs font-mono font-normal text-muted-text italic">(हमारा उद्देश्य)</span>
                  </h3>
                  <p className="text-muted-text text-sm sm:text-[15px] leading-[1.78] font-sans">
                    To deliver top-tier, bilingual (English & Hindi) instruction from kindergarten through Class XII. We commit to a highly structured academic routine, integrating deep board preparation with competitive exam (JEE/NEET) coaching. Through safe campuses, individual mentoring, and rich co-curricular initiatives, we empower every student to thrive.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Core Values Pillars */}
            <div className="pt-2">
              <h4 className="font-mono text-xs tracking-[0.18em] text-ink-navy uppercase font-bold mb-4">
                Our Pillars of Excellence
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
                {/* Pillar 1 */}
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="bg-white p-5 sm:p-6 border border-border-custom/80 hover:border-brass-gold/40 rounded-xl shadow-sm hover:shadow-md transition-all text-center flex flex-col justify-between h-full group"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-brass-gold/10 border border-brass-gold/30 flex items-center justify-center text-brass-gold mx-auto mb-3 font-mono text-xs font-bold shadow-xs">
                      01
                    </div>
                    <h5 className="font-serif text-base sm:text-lg font-bold text-ink-navy tracking-tight mb-1.5">Academic Rigor</h5>
                    <p className="text-muted-text text-xs leading-[1.65] font-sans">Proven state merit list results and IIT/NEET foundation.</p>
                  </div>
                </motion.div>

                {/* Pillar 2 */}
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="bg-white p-5 sm:p-6 border border-border-custom/80 hover:border-brass-gold/40 rounded-xl shadow-sm hover:shadow-md transition-all text-center flex flex-col justify-between h-full group"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-maroon/10 border border-maroon/30 flex items-center justify-center text-maroon mx-auto mb-3 font-mono text-xs font-bold shadow-xs">
                      02
                    </div>
                    <h5 className="font-serif text-base sm:text-lg font-bold text-ink-navy tracking-tight mb-1.5">Moral Ethics</h5>
                    <p className="text-muted-text text-xs leading-[1.65] font-sans">Nurturing honesty, deep-rooted discipline, and mutual respect.</p>
                  </div>
                </motion.div>

                {/* Pillar 3 */}
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="bg-white p-5 sm:p-6 border border-border-custom/80 hover:border-brass-gold/40 rounded-xl shadow-sm hover:shadow-md transition-all text-center flex flex-col justify-between h-full group"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-navy-light/10 border border-navy-light/30 flex items-center justify-center text-navy-light mx-auto mb-3 font-mono text-xs font-bold shadow-xs">
                      03
                    </div>
                    <h5 className="font-serif text-base sm:text-lg font-bold text-ink-navy tracking-tight mb-1.5">Holistic Care</h5>
                    <p className="text-muted-text text-xs leading-[1.65] font-sans">CCTV protection, girls' safety, and active athletics.</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </AppSection>

      {/* 10. CONTACT SECTION & INQUIRY FORM */}
      <AdmissionInquiryForm formContext="admission" />

      {/* 11. FOOTER SECTION */}
      <Footer
        logoError={logoError}
        setLogoError={setLogoError}
        setIsMediaModalOpen={setIsMediaModalOpen}
        setIsFaqModalOpen={setIsFaqModalOpen}
      />

      {/* 12. CURRICULUM DETAIL MODAL */}
      <CurriculumModal
        isOpen={isCurriculumModalOpen}
        onClose={() => setIsCurriculumModalOpen(false)}
        onOpenInquiryModal={handleOpenAdmissionInquiry}
      />

      {/* 13. SAFETY MANDATE DETAIL MODAL */}
      <SafetyMandateModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
        onOpenInquiryModal={handleOpenAdmissionInquiry}
      />

      {/* 14. ADMISSION INQUIRY POPUP MODAL */}
      <InquiryModal
        key={inquiryFormContext}
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        presetMessage={inquiryPresetMessage}
        prefillMessage={inquiryPresetMessage}
        formContext={inquiryFormContext}
      />

      {/* 15. STREAM SELECTION ADVISORY MODAL */}
      <StreamAdvisoryModal
        isOpen={isStreamModalOpen}
        onClose={() => setIsStreamModalOpen(false)}
        onRequestSession={handleRequestCounsellingSession}
      />

      {/* 16. ADMIN DASHBOARD MODAL */}
      {showAdminPanel && (
        <React.Suspense fallback={null}>
          <AdminPanel onClose={handleCloseAdminPanel} />
        </React.Suspense>
      )}

      {/* 17. FAQ DETAIL MODAL */}
      <FaqModal
        isOpen={isFaqModalOpen}
        onClose={() => setIsFaqModalOpen(false)}
        onOpenInquiryModal={handleOpenAdmissionInquiry}
      />

      {/* 18. ABOUT SCHOOL DETAIL MODAL */}
      <AboutSchoolModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        onOpenInquiryModal={handleOpenAdmissionInquiry}
      />

    </div>
  );
}
