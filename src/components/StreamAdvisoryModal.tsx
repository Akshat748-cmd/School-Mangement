import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Compass, 
  Atom, 
  Briefcase, 
  BookOpen, 
  UserCheck, 
  Clock, 
  ArrowRight,
  Sparkles
} from "lucide-react";

interface StreamAdvisoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestSession: () => void;
}

export default function StreamAdvisoryModal({
  isOpen,
  onClose,
  onRequestSession
}: StreamAdvisoryModalProps) {
  // Close modal on Escape key press and lock body scrolling when open
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
            className="relative w-full max-w-3xl bg-white border-2 border-brass-gold/35 shadow-2xl rounded-2xl overflow-hidden text-slate-800 my-auto max-h-[90vh] flex flex-col font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-ink-navy text-white px-6 sm:px-8 py-5 flex justify-between items-center border-b border-brass-gold/30 shrink-0 shadow-sm relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brass-gold via-maroon to-brass-gold pointer-events-none" />
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-brass-gold/20 border border-brass-gold/40 flex items-center justify-center text-brass-gold shrink-0">
                  <Compass className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-brass-gold font-bold block mb-0.5">
                    Academic Guidance & Career Alignment
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white">
                    Stream Selection Advisory
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close stream selection advisory modal"
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-left flex-1">
              
              {/* Brief Intro */}
              <div className="bg-[#FAF9F6] border border-border-custom/80 p-4 sm:p-5 rounded-xl flex items-start gap-3.5 shadow-xs">
                <Sparkles className="w-5 h-5 text-brass-gold shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                  We offer individual counselling sessions for stream matching (Science, Commerce, Arts) ahead of high school board options, helping students align their aptitude with future academic and career aspirations.
                </p>
              </div>

              {/* Streams Offered (3 Short Cards) */}
              <div className="space-y-3.5">
                <h4 className="font-serif text-sm sm:text-base font-bold uppercase tracking-wider text-ink-navy border-b border-border-custom/60 pb-2">
                  Streams Offered
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
                  
                  {/* Science Card */}
                  <div className="bg-[#FDFBF7] p-5 border border-border-custom/80 rounded-xl space-y-2.5 relative overflow-hidden group hover:border-brass-gold/50 transition-all shadow-xs flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 text-ink-navy">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                          <Atom className="w-4 h-4" />
                        </div>
                        <h5 className="font-serif font-bold text-ink-navy text-sm sm:text-base">Science Stream</h5>
                      </div>
                      <p className="text-slate-600 leading-relaxed font-sans text-xs">
                        <strong>Subjects:</strong> PCM (Physics, Chemistry, Math) / PCB (Physics, Chemistry, Biology) options.
                      </p>
                    </div>
                    <p className="text-slate-500 italic leading-relaxed pt-2 border-t border-slate-200/60 text-[11px] font-sans">
                      Suited for engineering, medical, research, and technical aspirants.
                    </p>
                  </div>

                  {/* Commerce Card */}
                  <div className="bg-[#FDFBF7] p-5 border border-border-custom/80 rounded-xl space-y-2.5 relative overflow-hidden group hover:border-brass-gold/50 transition-all shadow-xs flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 text-ink-navy">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 font-bold shrink-0">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <h5 className="font-serif font-bold text-ink-navy text-sm sm:text-base">Commerce Stream</h5>
                      </div>
                      <p className="text-slate-600 leading-relaxed font-sans text-xs">
                        <strong>Subjects:</strong> Accountancy, Business Studies, Economics, and Mathematics.
                      </p>
                    </div>
                    <p className="text-slate-500 italic leading-relaxed pt-2 border-t border-slate-200/60 text-[11px] font-sans">
                      Suited for finance, business management, CA, and corporate career aspirants.
                    </p>
                  </div>

                  {/* Arts / Humanities Card */}
                  <div className="bg-[#FDFBF7] p-5 border border-border-custom/80 rounded-xl space-y-2.5 relative overflow-hidden group hover:border-brass-gold/50 transition-all shadow-xs flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 text-ink-navy">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700 font-bold shrink-0">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <h5 className="font-serif font-bold text-ink-navy text-sm sm:text-base">Arts / Humanities</h5>
                      </div>
                      <p className="text-slate-600 leading-relaxed font-sans text-xs">
                        <strong>Subjects:</strong> History, Political Science, Geography, Hindi & English Literature.
                      </p>
                    </div>
                    <p className="text-slate-500 italic leading-relaxed pt-2 border-t border-slate-200/60 text-[11px] font-sans">
                      Suited for civil services, law, design, journalism, and liberal arts aspirants.
                    </p>
                  </div>

                </div>
              </div>

              {/* Who Counsels & Timing Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm pt-2">
                <div className="bg-slate-50/80 border border-slate-200 p-4 sm:p-5 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-ink-navy font-bold font-serif text-sm">
                    <UserCheck className="w-4.5 h-4.5 text-maroon" />
                    Who Counsels
                  </div>
                  <p className="text-slate-600 leading-relaxed font-sans text-xs">
                    Sessions are conducted by our senior faculty members with subject and career-guidance experience.
                  </p>
                </div>

                <div className="bg-slate-50/80 border border-slate-200 p-4 sm:p-5 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-ink-navy font-bold font-serif text-sm">
                    <Clock className="w-4.5 h-4.5 text-maroon" />
                    Timing & Schedule
                  </div>
                  <p className="text-slate-600 leading-relaxed font-sans text-xs">
                    Available on all working days during school hours — book a slot via the inquiry form below.
                  </p>
                </div>
              </div>

            </div>

            {/* Modal Action Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200/80 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
              <p className="text-xs text-slate-500 font-mono text-center sm:text-left">
                Free Academic Advisory Desk for Students & Parents
              </p>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={onRequestSession}
                  className="flex-1 sm:flex-initial bg-brass-gold hover:bg-gold-hover text-ink-navy font-mono text-xs font-bold uppercase tracking-wider h-11 px-5 rounded-lg transition-all duration-200 text-center flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Request a Counselling Session</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onClose}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-mono text-xs font-bold uppercase tracking-wider h-11 px-4 rounded-lg transition-colors cursor-pointer"
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
