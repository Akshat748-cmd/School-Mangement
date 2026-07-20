import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  ShieldCheck, 
  Camera, 
  Bus, 
  UserCheck, 
  Flame, 
  FileCheck, 
  PhoneCall, 
  CheckCircle2, 
  Lock,
  ArrowRight,
  HeartHandshake
} from "lucide-react";

interface SafetyMandateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInquiryModal?: () => void;
}

export default function SafetyMandateModal({ isOpen, onClose, onOpenInquiryModal }: SafetyMandateModalProps) {
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
            className="relative w-full max-w-4xl bg-white border border-border-custom shadow-2xl rounded-sm overflow-hidden text-slate-800 my-auto max-h-[90vh] flex flex-col font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-ink-navy text-white px-6 py-4 sm:py-5 flex justify-between items-center border-b border-brass-gold/30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-maroon/20 border border-maroon/40 flex items-center justify-center text-brass-gold shrink-0">
                  <ShieldCheck className="w-6 h-6 text-brass-gold" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-brass-gold font-bold">
                      Campus Security Standard
                    </span>
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white">
                    Our Comprehensive Safety Mandate
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close safety mandate modal"
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content Body */}
            <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-8 flex-1 text-left">
              
              {/* Top Announcement Banner */}
              <div className="bg-muted-board/60 border border-border-custom p-4 sm:p-5 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="font-mono text-[10px] text-maroon font-bold uppercase tracking-wider block">
                    Zero Compromise Policy
                  </span>
                  <h4 className="font-serif font-bold text-ink-navy text-base">
                    Dedicated Safety Infrastructure for Total Peace of Mind
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans max-w-2xl">
                    Ashish Memorial Public School maintains a rigorous multi-tier security framework encompassing 24/7 digital surveillance, girls-specific protective measures, transport tracking, and strict staff verification.
                  </p>
                </div>
                <div className="shrink-0 bg-maroon text-white px-3 py-2 rounded-sm border border-maroon/40 text-center font-mono text-[11px] font-bold uppercase tracking-wider">
                  🔒 100% Supervised Campus
                </div>
              </div>

              {/* 1. Campus Perimeter Security */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-border-custom pb-2">
                  <Camera className="w-5 h-5 text-maroon" />
                  <h4 className="font-serif text-base sm:text-lg font-bold text-ink-navy">
                    1. Campus Perimeter & Digital Surveillance
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-white p-4 border border-border-custom rounded-sm space-y-2">
                    <div className="w-8 h-8 rounded bg-navy-light/10 flex items-center justify-center text-ink-navy font-bold">
                      📹
                    </div>
                    <h5 className="font-serif font-bold text-ink-navy text-sm">24/7 CCTV Coverage</h5>
                    <p className="text-slate-600 leading-relaxed">
                      Complete High-Definition CCTV camera monitoring across all campus entry points, main corridors, administrative blocks, and playground areas.
                    </p>
                  </div>

                  <div className="bg-white p-4 border border-border-custom rounded-sm space-y-2">
                    <div className="w-8 h-8 rounded bg-navy-light/10 flex items-center justify-center text-ink-navy font-bold">
                      🚪
                    </div>
                    <h5 className="font-serif font-bold text-ink-navy text-sm">Single Monitored Entry Gate</h5>
                    <p className="text-slate-600 leading-relaxed">
                      Strict single-access perimeter control. All entry and exit points are actively manned by trained security personnel round-the-clock.
                    </p>
                  </div>

                  <div className="bg-white p-4 border border-border-custom rounded-sm space-y-2">
                    <div className="w-8 h-8 rounded bg-navy-light/10 flex items-center justify-center text-ink-navy font-bold">
                      📋
                    </div>
                    <h5 className="font-serif font-bold text-ink-navy text-sm">Visitor Verification & Logging</h5>
                    <p className="text-slate-600 leading-relaxed">
                      Mandatory government ID verification, digital visitor logging, and visitor pass issuance before allowing entry into the school premises.
                    </p>
                  </div>
                </div>
              </section>

              {/* 2. Transport Safety */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-border-custom pb-2">
                  <Bus className="w-5 h-5 text-maroon" />
                  <h4 className="font-serif text-base sm:text-lg font-bold text-ink-navy">
                    2. Transport Safety & Fleet Vigilance
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white p-4 border border-border-custom rounded-sm space-y-2">
                    <h5 className="font-serif font-bold text-ink-navy text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      GPS-Tracked Buses & Dedicated Attendants
                    </h5>
                    <p className="text-slate-600 leading-relaxed">
                      Every school bus is equipped with real-time GPS tracking devices and Accompanied by a dedicated female/male attendant on every route to supervise children during commute.
                    </p>
                  </div>

                  <div className="bg-white p-4 border border-border-custom rounded-sm space-y-2">
                    <h5 className="font-serif font-bold text-ink-navy text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Verified Drivers & Parent Alerts
                    </h5>
                    <p className="text-slate-600 leading-relaxed">
                      Strict police background checks for all bus drivers. Automated parent SMS and app notifications for pickup, drop-off, and route updates.
                    </p>
                  </div>
                </div>
              </section>

              {/* 3. Girls-Specific Safety Measures */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-border-custom pb-2">
                  <UserCheck className="w-5 h-5 text-maroon" />
                  <h4 className="font-serif text-base sm:text-lg font-bold text-ink-navy">
                    3. Girls-Specific Safety Protocols
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-sm space-y-2">
                    <h5 className="font-serif font-bold text-emerald-950 text-sm flex items-center gap-2">
                      <span className="text-base">👩‍🏫</span>
                      Dedicated Female Staff Supervision
                    </h5>
                    <p className="text-slate-600 leading-relaxed">
                      Continuous supervision by female faculty and staff members during all school hours, library periods, recess times, and co-curricular activities.
                    </p>
                  </div>

                  <div className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-sm space-y-2">
                    <h5 className="font-serif font-bold text-emerald-950 text-sm flex items-center gap-2">
                      <span className="text-base">🚾</span>
                      Monitored Separate Washrooms
                    </h5>
                    <p className="text-slate-600 leading-relaxed">
                      Dedicated, clean, and strictly separate washrooms for girls with lady attendants stationed outside to maintain hygiene and safety.
                    </p>
                  </div>

                  <div className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-sm space-y-2">
                    <h5 className="font-serif font-bold text-emerald-950 text-sm flex items-center gap-2">
                      <span className="text-base">⚖️</span>
                      Anti-Harassment & POSH Committee
                    </h5>
                    <p className="text-slate-600 leading-relaxed">
                      An active internal Anti-Harassment & Student Redressal Committee headed by senior female teachers to address concerns immediately with full confidentiality.
                    </p>
                  </div>

                  <div className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-sm space-y-2">
                    <h5 className="font-serif font-bold text-emerald-950 text-sm flex items-center gap-2">
                      <span className="text-base">🪪</span>
                      Authorized Guardian Pickup Protocol
                    </h5>
                    <p className="text-slate-600 leading-relaxed">
                      Strict pickup protocol allowing student dispatch ONLY to pre-authorized parent/guardian ID card holders verified by school administration.
                    </p>
                  </div>
                </div>
              </section>

              {/* 4. Emergency Preparedness */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-border-custom pb-2">
                  <Flame className="w-5 h-5 text-maroon" />
                  <h4 className="font-serif text-base sm:text-lg font-bold text-ink-navy">
                    4. Emergency Preparedness & First-Aid
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-white p-4 border border-border-custom rounded-sm space-y-2">
                    <div className="w-8 h-8 rounded bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      🧯
                    </div>
                    <h5 className="font-serif font-bold text-ink-navy text-sm">Fire Safety & Drills</h5>
                    <p className="text-slate-600 leading-relaxed">
                      Certified fire safety equipment installed on all floors with periodic evacuation drills for students and teachers.
                    </p>
                  </div>

                  <div className="bg-white p-4 border border-border-custom rounded-sm space-y-2">
                    <div className="w-8 h-8 rounded bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                      🏥
                    </div>
                    <h5 className="font-serif font-bold text-ink-navy text-sm">On-Campus First-Aid Room</h5>
                    <p className="text-slate-600 leading-relaxed">
                      Dedicated medical room equipped with essential first-aid supplies and trained healthcare personnel for immediate medical assistance.
                    </p>
                  </div>

                  <div className="bg-white p-4 border border-border-custom rounded-sm space-y-2">
                    <div className="w-8 h-8 rounded bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                      📞
                    </div>
                    <h5 className="font-serif font-bold text-ink-navy text-sm">Immediate Parent Notification</h5>
                    <p className="text-slate-600 leading-relaxed">
                      Instant telephonic and SMS notification protocol to inform parents immediately in case of any health or safety event.
                    </p>
                  </div>
                </div>
              </section>

              {/* 5. Staff Verification */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-border-custom pb-2">
                  <FileCheck className="w-5 h-5 text-maroon" />
                  <h4 className="font-serif text-base sm:text-lg font-bold text-ink-navy">
                    5. Staff Background Verification & Training
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white p-4 border border-border-custom rounded-sm flex items-start gap-3">
                    <span className="text-xl">👮</span>
                    <div className="space-y-1">
                      <h5 className="font-serif font-bold text-ink-navy text-sm">Police & Background Verification</h5>
                      <p className="text-slate-600 leading-relaxed">
                        Mandatory police verification, reference checks, and strict background screening for all teaching and non-teaching staff prior to employment.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-4 border border-border-custom rounded-sm flex items-start gap-3">
                    <span className="text-xl">🎓</span>
                    <div className="space-y-1">
                      <h5 className="font-serif font-bold text-ink-navy text-sm">Regular Safety Training Workshops</h5>
                      <p className="text-slate-600 leading-relaxed">
                        Quarterly safety, child protection, and emergency management training workshops conducted for all school employees.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 6. Grievance Reporting */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-border-custom pb-2">
                  <PhoneCall className="w-5 h-5 text-maroon" />
                  <h4 className="font-serif text-base sm:text-lg font-bold text-ink-navy">
                    6. Direct Grievance Reporting & Helpline
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-sm space-y-2">
                    <h5 className="font-serif font-bold text-ink-navy text-sm flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-maroon" />
                      Dedicated Safety Helpline & Email
                    </h5>
                    <p className="text-slate-600 leading-relaxed">
                      Direct access to the school principal and safety desk at <a href="tel:9116304006" className="font-bold text-ink-navy underline">91163 04006</a> or via email at <a href="mailto:ampspankaj@gmail.com" className="font-bold text-maroon underline">ampspankaj@gmail.com</a>.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-sm space-y-2">
                    <h5 className="font-serif font-bold text-ink-navy text-sm flex items-center gap-2">
                      <Lock className="w-4 h-4 text-maroon" />
                      Anonymous Suggestion & Complaint Dropboxes
                    </h5>
                    <p className="text-slate-600 leading-relaxed">
                      Physical anonymous suggestion/complaint boxes installed across student corridors, checked directly by the principal every week.
                    </p>
                  </div>
                </div>
              </section>

            </div>

            {/* Modal Action Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
              <p className="text-[11px] text-slate-500 font-mono text-center sm:text-left">
                Safety Emergency & Helpline: 91163 04006 | 94144 00824
              </p>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenInquiryModal) onOpenInquiryModal();
                  }}
                  className="flex-1 sm:flex-initial bg-maroon hover:bg-maroon/90 text-white font-mono text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-sm transition-colors text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Inquire / Visit Campus <ArrowRight className="w-3.5 h-3.5" />
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
