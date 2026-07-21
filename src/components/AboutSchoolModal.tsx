import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  School, 
  Target, 
  Award, 
  Building2, 
  PhoneCall, 
  ChevronDown, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  BookOpen 
} from "lucide-react";

interface AboutSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInquiryModal?: () => void;
}

export default function AboutSchoolModal({ isOpen, onClose, onOpenInquiryModal }: AboutSchoolModalProps) {
  const [openSection, setOpenSection] = useState<string>("overview");

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? "" : section);
  };

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

  const sections = [
    {
      id: "overview",
      title: "School Overview",
      icon: <School className="w-5 h-5" />,
      content: (
        <p className="text-muted-text text-xs sm:text-sm leading-relaxed font-sans">
          Ashish Memorial Public Sr. Sec. School, established in 2005, is a premier educational institution in Hindaun City, Rajasthan. Guided by scholarly principles, deep discipline, and modern pedagogical rigor, we guide students towards stellar state board records and seamless foundation preparation for IIT-JEE and NEET.
        </p>
      )
    },
    {
      id: "mission",
      title: "Our Mission",
      icon: <Target className="w-5 h-5" />,
      content: (
        <p className="text-muted-text text-xs sm:text-sm leading-relaxed font-sans">
          To foster holistic development of students through academic excellence, character building, and practical skill development, preparing them for competitive exams and life-long success.
        </p>
      )
    },
    {
      id: "why-choose",
      title: "Why Choose AMPS",
      icon: <Award className="w-5 h-5" />,
      content: (
        <ul className="space-y-2 sm:space-y-3 font-sans text-xs sm:text-sm text-muted-text">
          {[
            "Experienced and dedicated faculty committed to individual student growth",
            "State-of-the-art facilities including laboratories, library, and sports grounds",
            "Structured IIT-JEE & NEET foundation programs with in-house coaching",
            "Safe, secure campus with 24/7 CCTV supervision and dedicated female staff",
            "Transport facility with GPS-tracked buses",
            "Bilingual medium (English & Hindi) for inclusive learning"
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 sm:gap-3">
              <CheckCircle2 className="w-4 h-4 text-brass-gold shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )
    },
    {
      id: "facilities",
      title: "Campus Facilities",
      icon: <Building2 className="w-5 h-5" />,
      content: (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 font-sans text-xs sm:text-sm">
          {[
            { name: "Library", desc: "Well-stocked books and study zones" },
            { name: "Science Labs", desc: "Physics, Chemistry & Biology suites" },
            { name: "Computer Lab", desc: "Modern IT systems and resources" },
            { name: "Sports Ground", desc: "Athletics and outdoor activity courts" },
            { name: "Medical Room", desc: "First-aid and immediate healthcare support" }
          ].map((facility, idx) => (
            <div key={idx} className="bg-muted-board/30 border border-border-custom/55 p-3 rounded-sm">
              <span className="font-serif text-sm font-bold text-ink-navy block mb-0.5">
                {facility.name}
              </span>
              <span className="text-[11px] text-muted-text">{facility.desc}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      id: "contact",
      title: "Contact & Visit",
      icon: <PhoneCall className="w-5 h-5" />,
      content: (
        <div className="space-y-3 font-sans text-xs sm:text-sm text-muted-text">
          <p className="leading-relaxed">
            Schedule a campus visit to experience AMPS firsthand.
          </p>
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-3">
              <PhoneCall className="w-4 h-4 text-maroon shrink-0" />
              <span>91163 04006 / 94131 82619</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-maroon shrink-0" />
              <span>ampspankaj@gmail.com</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-maroon shrink-0" />
              <span>Hindaun City (Karauli district), Rajasthan</span>
            </div>
          </div>
        </div>
      )
    }
  ];

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
            className="relative w-full max-w-3xl bg-white border border-border-custom shadow-2xl rounded-sm overflow-hidden text-slate-800 my-auto max-h-[90vh] flex flex-col font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-ink-navy text-white px-5 sm:px-6 py-4 sm:py-5 flex justify-between items-center border-b border-brass-gold/30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-brass-gold/20 border border-brass-gold/40 flex items-center justify-center text-brass-gold shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-brass-gold font-bold block">
                    Learn About Our Institution
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white">
                    About Ashish Memorial Public School (AMPS)
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close About modal"
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content / Accordion list */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-left space-y-3">
              {sections.map((section) => {
                const isCurrentOpen = openSection === section.id;
                const contentId = `modal-about-content-${section.id}`;
                return (
                  <div
                    key={section.id}
                    className="bg-white border border-border-custom rounded-sm shadow-sm overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      aria-expanded={isCurrentOpen}
                      aria-controls={contentId}
                      className="w-full px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between text-left focus:outline-none focus:bg-muted-board/50 hover:bg-muted-board/30 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`text-ink-navy group-hover:text-maroon transition-colors ${isCurrentOpen ? "text-maroon" : ""}`}>
                          {section.icon}
                        </div>
                        <span className="font-serif text-sm sm:text-base text-ink-navy font-bold group-hover:text-maroon transition-colors">
                          {section.title}
                        </span>
                      </div>
                      <div
                        className={`w-7 h-7 rounded-full bg-muted-board flex items-center justify-center text-ink-navy shrink-0 transition-transform duration-300 ${isCurrentOpen ? "rotate-180 bg-brass-gold/20 text-maroon" : ""
                          }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isCurrentOpen && (
                        <motion.div
                          id={contentId}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 border-t border-border-custom/40 text-muted-text">
                            {section.content}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* Call to action footer box in modal */}
              {onOpenInquiryModal && (
                <div className="mt-6 bg-muted-board border border-border-custom p-4 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                  <div className="flex items-center gap-3">
                    <School className="w-5 h-5 text-brass-gold shrink-0" />
                    <div>
                      <h4 className="font-serif text-sm font-bold text-ink-navy">Ready to Join Our Family?</h4>
                      <p className="text-muted-text text-xs">Admissions are open for session 2026–27.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenInquiryModal();
                    }}
                    className="bg-brass-gold text-ink-navy hover:bg-brass-gold/90 font-mono text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-sm transition-colors shrink-0 cursor-pointer"
                  >
                    Send Admission Inquiry
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
