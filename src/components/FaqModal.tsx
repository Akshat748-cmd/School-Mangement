import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, HelpCircle, ChevronDown, MessageSquare } from "lucide-react";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    id: "faq-1",
    question: "What is the admission process for AMPS?",
    answer: "Parents can fill out the Admission Inquiry form on this website or visit the school office directly between 8 AM–2 PM. Our team reviews the inquiry and gets in touch within 24 hours to guide you through documentation and enrollment."
  },
  {
    id: "faq-2",
    question: "What classes does the school offer?",
    answer: "We offer education from Playgroup (P.G.) to Senior Secondary Class XII, with both English and Hindi medium sections available."
  },
  {
    id: "faq-3",
    question: "Which streams are available in senior secondary (XI–XII)?",
    answer: "Students can choose from Science, Commerce, and Arts streams — Arts stream is newly introduced and gives students another well-supported option for board-level studies."
  },
  {
    id: "faq-4",
    question: "Is transport facility available?",
    answer: "Yes, we provide GPS-tracked school buses with a dedicated attendant on every route, along with driver verification and parent notifications for pickup/drop."
  },
  {
    id: "faq-5",
    question: "What safety measures are in place, especially for girls?",
    answer: "Our campus has 24/7 CCTV supervision, a monitored single entry point, dedicated female staff supervision, and an authorized-guardian-only pickup/drop protocol."
  },
  {
    id: "faq-6",
    question: "Do you offer IIT-JEE/NEET preparation?",
    answer: "Yes, we have an in-house IIT-JEE & NEET Foundation program for Classes XI–XII, with dedicated study material, regular mock tests, and doubt-clearing sessions — students don't need to enroll in separate coaching centers outside school."
  },
  {
    id: "faq-7",
    question: "How can I contact the school for more information?",
    answer: "You can call us at 91163 04006 / 94131 82619, email ampspankaj@gmail.com, or visit us in person at our campus in Hindaun City, Karauli district, Rajasthan."
  }
];

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInquiryModal?: () => void;
}

export default function FaqModal({ isOpen, onClose, onOpenInquiryModal }: FaqModalProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
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
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-brass-gold font-bold block">
                    Quick Help & Guidance
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white">
                    Frequently Asked Questions
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close FAQ modal"
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content / Accordion list */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-left space-y-3">
              {faqItems.map((item, index) => {
                const isOpen = openIndex === index;
                const answerId = `modal-faq-answer-${index}`;
                return (
                  <div
                    key={item.id}
                    className="bg-white border border-border-custom rounded-sm shadow-sm overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      className="w-full px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between text-left focus:outline-none focus:bg-muted-board/50 hover:bg-muted-board/30 transition-colors cursor-pointer group"
                    >
                      <span className="font-serif text-sm sm:text-base text-ink-navy font-bold pr-3 group-hover:text-maroon transition-colors">
                        {item.question}
                      </span>
                      <div
                        className={`w-7 h-7 rounded-full bg-muted-board flex items-center justify-center text-ink-navy shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 bg-brass-gold/20 text-maroon" : ""
                          }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={answerId}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 border-t border-border-custom/40 text-muted-text text-xs sm:text-sm leading-relaxed font-sans">
                            {item.answer}
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
                    <MessageSquare className="w-5 h-5 text-brass-gold shrink-0" />
                    <div>
                      <h4 className="font-serif text-sm font-bold text-ink-navy">Have more questions?</h4>
                      <p className="text-muted-text text-xs">Our admissions team is here to assist you.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenInquiryModal();
                    }}
                    className="bg-brass-gold text-ink-navy hover:bg-brass-gold/90 font-mono text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-sm transition-colors shrink-0 cursor-pointer"
                  >
                    Submit Inquiry
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
