import React, { useState } from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import { motion } from "motion/react";

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

export default function AdmissionInquiryForm() {
  // Contact Inquiry State with Intelligent Server-Side Database & Fallbacks
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);
  
  // Advanced dispatch fallback states
  const [emailSent, setEmailSent] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState("Pending");
  const [whatsappUrl, setWhatsappUrl] = useState("");

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryPhone) return;

    setInquirySubmitting(true);
    setInquiryError(null);

    try {
      console.log(`[Inquiry Client] Sending inquiry for ${inquiryName}...`);

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inquiryName,
          phone: inquiryPhone,
          email: inquiryEmail,
          message: inquiryMessage
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setInquirySubmitted(true);
        setEmailSent(data.emailSent);
        setDispatchStatus(data.dispatchStatus);
        setWhatsappUrl(data.whatsappRedirectUrl);

        // Clear input fields
        setInquiryName("");
        setInquiryPhone("");
        setInquiryEmail("");
        setInquiryMessage("");
      } else {
        throw new Error(data.message || "Failed to dispatch inquiry on server.");
      }
    } catch (err: any) {
      console.error("[Inquiry Client] Error processing inquiry:", err);
      setInquiryError(err.message || "Unable to submit inquiry. Please use direct phone/WhatsApp instead.");
    } finally {
      setInquirySubmitting(false);
    }
  };

  return (
    <motion.section 
      id="contact" 
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="py-10 sm:py-16 md:py-20 bg-muted-board px-4 sm:px-6 lg:px-8 w-full border-t border-border-custom"
    >
      <div className="max-w-7xl mx-auto">
        
        <motion.div variants={childVariants} className="text-center max-w-2xl mx-auto mb-8 sm:mb-16">
          <span className="font-mono text-xs tracking-widest text-maroon font-semibold uppercase block mb-2">
            Get in Touch
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-ink-navy font-bold tracking-tight">
            Visit or reach out
          </h2>
          <div className="w-16 h-1 bg-brass-gold mx-auto mt-4"></div>
        </motion.div>

        <motion.div variants={childVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-12 lg:gap-16">
          
          {/* Left: Contact Info Columns */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            
            {/* Column 1: Address */}
            <div className="flex flex-col space-y-4 text-slate-800">
              <div className="w-12 h-12 bg-white rounded-sm border border-border-custom flex items-center justify-center text-maroon shadow-sm shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-ink-navy mb-2">
                  Address
                </h3>
                <p className="text-muted-text text-sm leading-relaxed font-sans">
                  Behind Patthar Walo Ki Dharamshala,<br />
                  New Jyoti Nagar, Hindaun City,<br />
                  Dist. Karauli (Raj.) — 322230
                </p>
              </div>
              <div className="pt-2">
                <span className="font-mono text-[10px] text-brass-gold font-bold tracking-widest uppercase">
                  Rajasthan State
                </span>
              </div>
            </div>

            {/* Column 2: Phone */}
            <div className="flex flex-col space-y-4 text-slate-800">
              <div className="w-12 h-12 bg-white rounded-sm border border-border-custom flex items-center justify-center text-maroon shadow-sm shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-ink-navy mb-2">
                  Phone Numbers
                </h3>
                <div className="space-y-1 font-mono text-sm">
                  <a href="tel:07469234006" className="block text-muted-text hover:text-maroon transition-colors">
                    07469 234006
                  </a>
                  <a href="tel:9414400824" className="block text-muted-text hover:text-maroon transition-colors">
                    94144 00824
                  </a>
                  <a href="tel:9413182619" className="block text-muted-text hover:text-maroon transition-colors">
                    94131 82619
                  </a>
                </div>
              </div>
              <div className="pt-2">
                <span className="font-mono text-[10px] text-brass-gold font-bold tracking-widest uppercase">
                  Office Hours: 8AM-2PM
                </span>
              </div>
            </div>

            {/* Column 3: Email */}
            <div className="flex flex-col space-y-4 text-slate-800">
              <div className="w-12 h-12 bg-white rounded-sm border border-border-custom flex items-center justify-center text-maroon shadow-sm shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-ink-navy mb-2">
                  Email Address
                </h3>
                <a 
                  href="mailto:ampspankaj@gmail.com" 
                  className="font-mono text-sm text-muted-text hover:text-maroon transition-colors break-all"
                >
                  ampspankaj@gmail.com
                </a>
              </div>
              <div className="pt-2">
                <span className="font-mono text-[10px] text-brass-gold font-bold tracking-widest uppercase">
                  24/7 Digital Desk
                </span>
              </div>
            </div>

          </div>

          {/* Right: Quick contact form / Inquiry desk */}
          <div className="lg:col-span-5 bg-white p-4 sm:p-6 md:p-8 rounded-sm border border-border-custom shadow-sm relative text-slate-800">
            <span className="font-mono text-[10px] text-maroon uppercase tracking-widest font-bold block mb-1">
              Instant Advisory Desk
            </span>
            <h3 className="font-serif text-lg sm:text-xl text-ink-navy font-bold mb-4">
              Send a Quick Admission Inquiry
            </h3>
            
            {inquirySubmitted ? (
              <div className="bg-emerald-50/85 border border-emerald-200 text-emerald-800 p-6 rounded-sm text-left relative overflow-hidden">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3 animate-bounce">
                  <span className="text-emerald-600 text-xl font-bold">✓</span>
                </div>
                <h4 className="font-serif font-bold text-center text-base text-emerald-900 mb-2">Inquiry Saved on School Server!</h4>
                <p className="text-[11px] text-center text-slate-600 mb-4">
                  Your inquiry has been successfully logged inside Al-Momin Public School's local records.
                </p>
                
                <div className="space-y-4">
                  {/* WhatsApp Fast Channel */}
                  <div className="bg-white p-4 border border-emerald-200 rounded-sm shadow-sm text-center">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-emerald-700 font-bold mb-2">
                      ⚡ Instant Mobile Fallback (Recommended)
                    </p>
                    <p className="text-[11px] leading-relaxed text-slate-700 mb-3 font-sans">
                      Hindi (हिंदी): Email delays se bachne ke liye aur school se turant reply paane ke liye niche diye gaye green button par click karein aur WhatsApp par sidhe details bhejein!
                    </p>
                    {whatsappUrl && (
                      <a 
                        href={whatsappUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-sm transition-colors border border-emerald-600 shadow-md hover:shadow-lg"
                      >
                        💬 Send via WhatsApp Now
                      </a>
                    )}
                  </div>

                  {/* Email Dispatch Status Board */}
                  <div className="bg-slate-50 p-3.5 border border-slate-200 rounded-sm text-xs text-slate-700">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5 mb-1.5 font-sans">
                      📧 Email Delivery Status
                    </p>

                    {(dispatchStatus === "Needs Activation" || dispatchStatus === "Pending") && (
                      <div className="bg-amber-50 border border-amber-200 p-3 rounded text-amber-950 space-y-2 mb-3">
                        <p className="font-bold text-xs flex items-center gap-1 font-sans">
                          ⚠️ ACTION REQUIRED: Pehli Mail Active Karein!
                        </p>
                        <p className="text-[11px] leading-relaxed font-sans">
                          <strong>Hindi (हिंदी):</strong> Humne aapke email <span className="underline font-bold">admin@example.com</span> par ek activation link bheja hai. Apne Gmail me <strong>All Mail, Spam, Updates, or Promotions</strong> check karein, "FormSubmit" search karein aur <strong className="text-rose-600 font-bold">"Activate Form"</strong> par click karein. Uske baad saari mail aana chalu ho jayengi!
                        </p>
                        <div className="border-t border-amber-200 my-1"></div>
                        <p className="text-[11px] leading-relaxed font-sans">
                          <strong>English:</strong> FormSubmit has sent a verification mail to <span className="underline font-bold">admin@example.com</span>. Please check your inbox/spam folder and click <strong>"Activate Form"</strong> to start receiving inquiries.
                        </p>
                      </div>
                    )}

                    <div className="space-y-1.5 text-[11px] font-sans">
                      <p className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-500">Method Configured:</span>
                        <span className="font-mono font-semibold text-slate-800">FormSubmit Tunnel</span>
                      </p>
                      <p className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-500">Delivery Status:</span>
                        <span className={`font-mono font-bold ${dispatchStatus === "Delivered" ? "text-emerald-600" : "text-amber-600"}`}>
                          ● {dispatchStatus}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-500 leading-normal mt-2 italic">
                        👉 If you aren't receiving verification emails, please check your **Admin Dashboard (link in footer)** to configure your free Web3Forms Access Key for 100% inbox delivery.
                      </p>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setInquirySubmitted(false)}
                  className="mt-5 font-mono text-[10px] uppercase tracking-wider text-slate-600 hover:text-slate-900 hover:underline block mx-auto font-bold text-center cursor-pointer"
                >
                  ← Send Another Inquiry
                </button>
              </div>
            ) : (
              <form 
                onSubmit={handleInquirySubmit} 
                className="space-y-4 font-sans text-sm"
              >
                {inquiryError && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-800 p-3 rounded-sm text-xs">
                    ⚠️ {inquiryError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono text-muted-text uppercase tracking-wider mb-1">
                    Parent / Student Name *
                  </label>
                  <input 
                    type="text" 
                    required
                    disabled={inquirySubmitting}
                    placeholder="e.g. Ramesh Kumar"
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    className="w-full bg-ivory-paper border border-border-custom p-2.5 rounded-sm focus:outline-none focus:border-brass-gold text-body-text disabled:opacity-60 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted-text uppercase tracking-wider mb-1">
                    Mobile Number *
                  </label>
                  <input 
                    type="tel" 
                    required
                    disabled={inquirySubmitting}
                    placeholder="e.g. 98290XXXXX"
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    className="w-full bg-ivory-paper border border-border-custom p-2.5 rounded-sm focus:outline-none focus:border-brass-gold text-body-text disabled:opacity-60 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted-text uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input 
                    type="email" 
                    required
                    disabled={inquirySubmitting}
                    placeholder="e.g. parent@domain.com"
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    className="w-full bg-ivory-paper border border-border-custom p-2.5 rounded-sm focus:outline-none focus:border-brass-gold text-body-text disabled:opacity-60 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted-text uppercase tracking-wider mb-1">
                    Message / Desired Stream or Class
                  </label>
                  <textarea 
                    rows={3}
                    disabled={inquirySubmitting}
                    placeholder="e.g. Looking for Class XI Commerce admission with English medium."
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className="w-full bg-ivory-paper border border-border-custom p-2.5 rounded-sm focus:outline-none focus:border-brass-gold text-body-text resize-none disabled:opacity-60 text-sm"
                  />
                </div>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={inquirySubmitting}
                  className="w-full bg-ink-navy text-white hover:bg-navy-light font-mono text-xs font-bold uppercase tracking-wider py-3 rounded-sm transition-colors border border-ink-navy shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {inquirySubmitting ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Saving Inquiry Logs...
                    </>
                  ) : (
                    "Submit & Send Inquiry"
                  )}
                </motion.button>
                <p className="text-[10px] text-muted-text text-center italic mt-2">
                  Inquiry will be saved securely and dispatched to the administrator instantly.
                </p>
              </form>
            )}
          </div>

        </motion.div>

        {/* Maps / Static Route Advice */}
        <motion.div variants={childVariants} className="mt-8 sm:mt-16 bg-white p-4 border border-border-custom rounded-sm shadow-sm text-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex gap-3 items-center">
              <MapPin className="w-5 h-5 text-brass-gold shrink-0" />
              <div>
                <h4 className="font-serif text-sm font-bold text-ink-navy">Location Reference</h4>
                <p className="text-muted-text text-xs mt-0.5">Located behind Patthar Walo Ki Dharamshala, New Jyoti Nagar, Hindaun City, Karauli district. Easy bus and auto connectivity.</p>
              </div>
            </div>
            <span className="font-mono text-[10px] text-muted-text uppercase tracking-widest bg-muted-board px-3 py-1.5 border border-border-custom rounded-sm text-center">
              Coordinates: Behind Patthar Walo Ki Dharamshala, New Jyoti Nagar
            </span>
          </div>
        </motion.div>

      </div>
    </motion.section>
  );
}
