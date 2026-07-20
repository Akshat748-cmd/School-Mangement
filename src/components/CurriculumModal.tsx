import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  BookOpen, 
  CheckCircle2, 
  GraduationCap, 
  FileText, 
  HelpCircle, 
  Users, 
  Atom,
  Dna,
  ArrowRight
} from "lucide-react";

interface CurriculumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInquiryModal?: () => void;
}

export default function CurriculumModal({ isOpen, onClose, onOpenInquiryModal }: CurriculumModalProps) {
  // Close modal on Escape key press and disable background scrolling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-4xl bg-white border border-border-custom shadow-2xl rounded-sm overflow-hidden text-slate-800 my-auto max-h-[90vh] flex flex-col font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-ink-navy text-white px-6 py-4 sm:py-5 flex justify-between items-center border-b border-brass-gold/30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-brass-gold/20 border border-brass-gold/40 flex items-center justify-center text-brass-gold shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-brass-gold font-bold">
                      Integrated Coaching Program
                    </span>
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white">
                    IIT-JEE & NEET Foundation Curriculum
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close curriculum modal"
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content Body */}
            <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-8 flex-1 text-left">
              
              {/* Overview Banner */}
              <div className="bg-muted-board/60 border border-border-custom p-4 sm:p-5 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="font-mono text-[10px] text-maroon font-bold uppercase tracking-wider block">
                    Zero Migration Needed
                  </span>
                  <h4 className="font-serif font-bold text-ink-navy text-base">
                    Complete School + Coaching Integration in One Campus
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans max-w-2xl">
                    Our foundation program bridges board academics with competitive entrance requirements so students excel in Class XI & XII CBSE/RBSE boards while preparing for national engineering and medical entrances.
                  </p>
                </div>
                <div className="shrink-0 bg-ink-navy text-brass-gold px-3 py-2 rounded-sm border border-brass-gold/30 text-center font-mono text-[11px] font-bold uppercase tracking-wider">
                  Classes XI & XII
                </div>
              </div>

              {/* 1. Program Structure */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-border-custom pb-2">
                  <BookOpen className="w-5 h-5 text-maroon" />
                  <h4 className="font-serif text-base sm:text-lg font-bold text-ink-navy">
                    1. Program Structure & Progression
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Class XI Card */}
                  <div className="bg-white border border-border-custom p-4 rounded-sm shadow-sm space-y-2 hover:border-slate-300 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[10px] font-bold bg-navy-light/10 text-ink-navy px-2 py-0.5 rounded uppercase">
                        Class XI Focus
                      </span>
                      <span className="font-mono text-[10px] text-brass-gold font-bold">Phase 1</span>
                    </div>
                    <h5 className="font-serif font-bold text-ink-navy text-sm">
                      Foundation Building & Core Concepts
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">
                      Deep alignment with NCERT fundamentals combined with gradual introduction to JEE Main/NEET pattern numerical problems and analytical reasoning skills.
                    </p>
                    <ul className="text-[11px] text-slate-700 space-y-1 pt-1 font-sans">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>NCERT mastery + Subjective & Objective practice</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Conceptual clarity & fundamental problem solving</span>
                      </li>
                    </ul>
                  </div>

                  {/* Class XII Card */}
                  <div className="bg-white border border-border-custom p-4 rounded-sm shadow-sm space-y-2 hover:border-slate-300 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[10px] font-bold bg-maroon/10 text-maroon px-2 py-0.5 rounded uppercase">
                        Class XII Focus
                      </span>
                      <span className="font-mono text-[10px] text-brass-gold font-bold">Phase 2</span>
                    </div>
                    <h5 className="font-serif font-bold text-ink-navy text-sm">
                      Advanced Problem Solving & Board Balance
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">
                      High-level competitive problem solving balanced with rigorous board revision, mock test series, speed building, and time management strategies.
                    </p>
                    <ul className="text-[11px] text-slate-700 space-y-1 pt-1 font-sans">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Advanced JEE/NEET PYQs & speed drills</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Full syllabus revision & Board exam readiness</span>
                      </li>
                    </ul>
                  </div>

                </div>
              </section>

              {/* 2. Subjects Covered (JEE vs NEET Tracks) */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-border-custom pb-2">
                  <Atom className="w-5 h-5 text-maroon" />
                  <h4 className="font-serif text-base sm:text-lg font-bold text-ink-navy">
                    2. Subjects Covered & Stream Tracks
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* JEE Track */}
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Atom className="w-5 h-5 text-indigo-700" />
                        <h5 className="font-serif font-bold text-ink-navy text-base">JEE Stream</h5>
                      </div>
                      <span className="font-mono text-[9px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold uppercase">
                        Engineering Track
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-white p-3 border border-slate-200 rounded text-xs">
                        <p className="font-mono text-[10px] font-bold text-indigo-700 uppercase mb-1">Core Subjects</p>
                        <p className="font-semibold text-slate-800">Physics · Chemistry · Mathematics</p>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Comprehensive coverage of mechanics, electrodynamics, organic/inorganic chemistry, calculus, algebra, and 3D geometry with step-by-step mathematical problem solving.
                      </p>
                    </div>
                  </div>

                  {/* NEET Track */}
                  <div className="bg-emerald-50/50 border border-emerald-200 p-5 rounded-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Dna className="w-5 h-5 text-emerald-700" />
                        <h5 className="font-serif font-bold text-ink-navy text-base">NEET Stream</h5>
                      </div>
                      <span className="font-mono text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase">
                        Medical Track
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-white p-3 border border-emerald-200 rounded text-xs">
                        <p className="font-mono text-[10px] font-bold text-emerald-700 uppercase mb-1">Core Subjects</p>
                        <p className="font-semibold text-slate-800">Physics · Chemistry · Biology (Botany & Zoology)</p>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        In-depth line-by-line NCERT Biology mastery, diagrammatic analysis, chemical reactions, and targeted Physics numerical practice tailored for medical entrance speed.
                      </p>
                    </div>
                  </div>

                </div>
              </section>

              {/* 3. Teaching Methodology */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-border-custom pb-2">
                  <GraduationCap className="w-5 h-5 text-maroon" />
                  <h4 className="font-serif text-base sm:text-lg font-bold text-ink-navy">
                    3. Teaching Methodology & Learning Assets
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-white p-4 border border-border-custom rounded-sm space-y-2">
                    <div className="w-8 h-8 rounded bg-brass-gold/10 flex items-center justify-center text-brass-gold font-bold text-sm">
                      👨‍🏫
                    </div>
                    <h5 className="font-serif font-bold text-ink-navy text-sm">Expert In-House Faculty</h5>
                    <p className="text-slate-600 leading-relaxed">
                      In-house faculty trained specifically in competitive exam patterns and high-yield problem solving.
                    </p>
                  </div>

                  <div className="bg-white p-4 border border-border-custom rounded-sm space-y-2">
                    <div className="w-8 h-8 rounded bg-brass-gold/10 flex items-center justify-center text-brass-gold font-bold text-sm">
                      📚
                    </div>
                    <h5 className="font-serif font-bold text-ink-navy text-sm">Research Booklets & Study Material</h5>
                    <p className="text-slate-600 leading-relaxed">
                      Research booklets, topic-wise study material, formula handbooks, and previous year question archives.
                    </p>
                  </div>

                  <div className="bg-white p-4 border border-border-custom rounded-sm space-y-2">
                    <div className="w-8 h-8 rounded bg-brass-gold/10 flex items-center justify-center text-brass-gold font-bold text-sm">
                      💡
                    </div>
                    <h5 className="font-serif font-bold text-ink-navy text-sm">Concept + Problem Sessions</h5>
                    <p className="text-slate-600 leading-relaxed">
                      Concept lectures paired with dedicated numerical problem-solving sessions.
                    </p>
                  </div>
                </div>
              </section>

              {/* 4. Testing & Evaluation */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-border-custom pb-2">
                  <FileText className="w-5 h-5 text-maroon" />
                  <h4 className="font-serif text-base sm:text-lg font-bold text-ink-navy">
                    4. Testing & Evaluation System
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white p-4 border border-border-custom rounded-sm flex items-start gap-3">
                    <span className="text-xl">⏱️</span>
                    <div className="space-y-1">
                      <h5 className="font-serif font-bold text-ink-navy text-sm">Weekly / Bi-Weekly Topic Tests</h5>
                      <p className="text-slate-600 leading-relaxed">
                        Frequent chapter-level topic tests to evaluate immediate retention, concept application, and track ongoing progress.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-4 border border-border-custom rounded-sm flex items-start gap-3">
                    <span className="text-xl">📝</span>
                    <div className="space-y-1">
                      <h5 className="font-serif font-bold text-ink-navy text-sm">Monthly Full-Syllabus Mock Tests</h5>
                      <p className="text-slate-600 leading-relaxed">
                        Monthly full-syllabus mock exams in exact JEE Main / NEET pattern featuring MCQs, negative marking rules, and OMR practice.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 5. Doubt Clearing & Remedial Classes */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-border-custom pb-2">
                  <HelpCircle className="w-5 h-5 text-maroon" />
                  <h4 className="font-serif text-base sm:text-lg font-bold text-ink-navy">
                    5. Doubt Clearing & Remedial Support
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white p-4 border border-border-custom rounded-sm flex items-start gap-3">
                    <span className="text-xl">❓</span>
                    <div className="space-y-1">
                      <h5 className="font-serif font-bold text-ink-navy text-sm">Dedicated Doubt Clearing Sessions</h5>
                      <p className="text-slate-600 leading-relaxed">
                        Dedicated doubt-clearing sessions with subject faculty to resolve individual numerical doubts and subject questions.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-4 border border-border-custom rounded-sm flex items-start gap-3">
                    <span className="text-xl">🎯</span>
                    <div className="space-y-1">
                      <h5 className="font-serif font-bold text-ink-navy text-sm">Remedial Classes for Weak Students</h5>
                      <p className="text-slate-600 leading-relaxed">
                        Focused remedial classes and foundational revision for weak students to build confidence and bridge subject gaps.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 6. Extra Support & Parental Guidance */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-border-custom pb-2">
                  <Users className="w-5 h-5 text-maroon" />
                  <h4 className="font-serif text-base sm:text-lg font-bold text-ink-navy">
                    6. Extra Support & Career Counselling
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white p-4 border border-border-custom rounded-sm flex items-start gap-3">
                    <span className="text-xl">📊</span>
                    <div className="space-y-1">
                      <h5 className="font-serif font-bold text-ink-navy text-sm">Performance Tracking Reports</h5>
                      <p className="text-slate-600 leading-relaxed">
                        Detailed performance tracking reports shared periodically with parents to monitor test scores and academic growth.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-4 border border-border-custom rounded-sm flex items-start gap-3">
                    <span className="text-xl">🧭</span>
                    <div className="space-y-1">
                      <h5 className="font-serif font-bold text-ink-navy text-sm">Career Counselling & Exam Strategy</h5>
                      <p className="text-slate-600 leading-relaxed">
                        One-on-one career counselling for stream and exam strategy guidance, time management, and competitive exam preparation.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

            </div>

            {/* Modal Action Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
              <p className="text-[11px] text-slate-500 font-mono text-center sm:text-left">
                Admissions open for Class XI & XII (Science Stream)
              </p>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenInquiryModal) onOpenInquiryModal();
                  }}
                  className="flex-1 sm:flex-initial bg-maroon hover:bg-maroon/90 text-white font-mono text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-sm transition-colors text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Apply / Inquire Now <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onClose}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-mono text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-sm transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
