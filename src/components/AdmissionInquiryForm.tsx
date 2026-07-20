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

interface AdmissionInquiryFormProps {
  presetMessage?: string;
  prefillMessage?: string;
  formContext?: "admission" | "counselling";
}

export default function AdmissionInquiryForm({
  presetMessage,
  prefillMessage,
  formContext = "admission"
}: AdmissionInquiryFormProps = {}) {
  const initialMsg = prefillMessage || presetMessage || "";
  // Contact Inquiry State with Intelligent Server-Side Database & Fallbacks
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState(initialMsg);

  // Validation State & Helpers
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const cleanPhoneNumber = (val: string) => {
    return val.replace(/[\s\-\+\(\)]/g, "").replace(/^91(?=\d{10}$)/, "");
  };

  const validatePhone = (val: string): string | null => {
    const cleaned = cleanPhoneNumber(val);
    if (!cleaned) return "Mobile number is required.";
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      return "Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.";
    }
    return null;
  };

  const COMMON_DOMAIN_TYPOS: Record<string, string> = {
    "gmai.com": "gmail.com",
    "gmial.com": "gmail.com",
    "gamil.com": "gmail.com",
    "gmail.co": "gmail.com",
    "gmail.cm": "gmail.com",
    "gmal.com": "gmail.com",
    "yaho.com": "yahoo.com",
    "yahoo.co": "yahoo.com",
    "hotmai.com": "hotmail.com",
    "outlok.com": "outlook.com"
  };

  const validateEmail = (val: string): string | null => {
    const trimmed = val.trim().toLowerCase();
    if (!trimmed) return "Email address is required.";

    // 1. Strict format check: user@domain.2+letter TLD
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      return "Please enter a valid email address (e.g. name@gmail.com).";
    }

    // 2. Reject consecutive dots or invalid dots in domain
    const parts = trimmed.split("@");
    const domain = parts[1] || "";
    if (domain.includes("..") || domain.startsWith(".") || domain.endsWith(".")) {
      return "Email domain format is invalid.";
    }

    // 3. Check for common domain typos (e.g. gmai.com, gmial.com)
    if (COMMON_DOMAIN_TYPOS[domain]) {
      return `Did you mean ${parts[0]}@${COMMON_DOMAIN_TYPOS[domain]}?`;
    }

    // 4. Validate Top-Level Domain (TLD) length and characters
    const tld = domain.split(".").pop();
    if (!tld || tld.length < 2 || !/^[a-z]+$/.test(tld)) {
      return "Please enter a valid domain extension (e.g. .com, .in, .org).";
    }

    return null;
  };

  React.useEffect(() => {
    const msg = prefillMessage || presetMessage;
    if (msg !== undefined) {
      setInquiryMessage(msg);
    }
  }, [prefillMessage, presetMessage]);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);

  // Advanced dispatch fallback states
  const [emailSent, setEmailSent] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState("Pending");
  const [whatsappUrl, setWhatsappUrl] = useState("");

  // OTP Verification States
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  React.useEffect(() => {
    let interval: any = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async () => {
    setPhoneTouched(true);
    setEmailTouched(true);
    const pErr = validatePhone(inquiryPhone);
    const eErr = validateEmail(inquiryEmail);
    setPhoneError(pErr);
    setEmailError(eErr);

    if (!inquiryName || pErr || eErr) {
      setOtpError("Please enter a valid Name, Mobile number, and Email address first.");
      return;
    }

    setOtpSending(true);
    setOtpError(null);
    setOtpSuccess(null);

    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inquiryEmail.trim(),
          name: inquiryName,
          formContext
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setOtpSent(true);
        setResendTimer(60);
        setOtpSuccess(`OTP code sent to ${inquiryEmail.trim()}. Please check your email inbox.`);
      } else {
        throw new Error(data.message || "Failed to send OTP code.");
      }
    } catch (err: any) {
      console.error("[OTP Send Error]", err);
      setOtpError(err.message || "Could not send OTP. Please try again.");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpError("Please enter the 6-digit OTP verification code.");
      return;
    }

    setOtpVerifying(true);
    setOtpError(null);
    setOtpSuccess(null);

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inquiryEmail.trim(),
          otp: otpCode.trim()
        })
      });
      const data = await response.json();
      if (response.ok && data.verified) {
        setOtpVerified(true);
        setOtpError(null);
        setOtpSuccess("Email address verified successfully!");
      } else {
        throw new Error(data.message || "Incorrect OTP code.");
      }
    } catch (err: any) {
      console.error("[OTP Verification Error]", err);
      setOtpError(err.message || "Invalid OTP code. Please try again.");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneTouched(true);
    setEmailTouched(true);

    const pErr = validatePhone(inquiryPhone);
    const eErr = validateEmail(inquiryEmail);
    setPhoneError(pErr);
    setEmailError(eErr);

    if (!inquiryName || pErr || eErr) return;

    if (!otpVerified) {
      if (!otpSent) {
        handleSendOtp();
        return;
      }
      setOtpError("Please enter the 6-digit OTP code sent to your email and click Verify.");
      return;
    }

    setInquirySubmitting(true);
    setInquiryError(null);

    const cleanedPhone = cleanPhoneNumber(inquiryPhone);

    try {
      console.log(`[Inquiry Client] formContext: ${formContext}, sending inquiry for ${inquiryName}...`);

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inquiryName,
          phone: cleanedPhone,
          email: inquiryEmail.trim(),
          message: inquiryMessage,
          formContext: formContext
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setInquirySubmitted(true);
        setEmailSent(data.emailSent);
        setDispatchStatus(data.dispatchStatus);
        setWhatsappUrl(data.whatsappRedirectUrl);

        // Clear input fields and validation states
        setInquiryName("");
        setInquiryPhone("");
        setInquiryEmail("");
        setInquiryMessage("");
        setOtpSent(false);
        setOtpVerified(false);
        setOtpCode("");
        setOtpSuccess(null);
        setOtpError(null);
        setPhoneError(null);
        setEmailError(null);
        setPhoneTouched(false);
        setEmailTouched(false);
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
      className="py-6 sm:py-16 md:py-20 bg-muted-board px-4 sm:px-6 lg:px-8 w-full border-t border-border-custom"
    >
      <div className="max-w-7xl mx-auto">

        <motion.div variants={childVariants} className="text-center max-w-2xl mx-auto mb-4 sm:mb-16">
          <span className="font-mono text-xs tracking-widest text-maroon font-semibold uppercase block mb-2">
            Get in Touch
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-ink-navy font-bold tracking-tight">
            Visit or reach out
          </h2>
          <div className="w-16 h-1 bg-brass-gold mx-auto mt-3 sm:mt-4"></div>
        </motion.div>

        <motion.div variants={childVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-12 lg:gap-16">

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
                  <a href="tel:9116304006" className="block text-muted-text hover:text-maroon transition-colors">
                    91163 04006
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
                  Office Hours: 8 AM-3 PM
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
              {formContext === "counselling" ? "Academic Guidance Desk" : "Instant Advisory Desk"}
            </span>
            <h3 className="font-serif text-lg sm:text-xl text-ink-navy font-bold mb-4">
              {formContext === "counselling" ? "Book Your Counselling Session" : "Send a Quick Admission Inquiry"}
            </h3>

            {inquirySubmitted ? (
              dispatchStatus === "Failed" ? (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-sm text-center">
                  <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-3">
                    <span className="text-rose-600 text-xl font-bold">⚠️</span>
                  </div>
                  <h4 className="font-serif font-bold text-lg text-rose-900 mb-2">
                    Failed to Send Inquiry
                  </h4>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed font-sans">
                    We were unable to deliver your email inquiry right now. Please try calling us directly at <a href="tel:9116304006" className="font-bold text-ink-navy underline">91163 04006</a> or connect via WhatsApp below.
                  </p>
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-sm transition-colors border border-emerald-600 shadow-sm mb-3"
                    >
                      💬 Connect via WhatsApp Instead
                    </a>
                  )}
                  <button
                    onClick={() => { setInquirySubmitted(false); setInquiryError(null); }}
                    className="mt-3 font-mono text-[10px] uppercase tracking-wider text-slate-600 hover:text-slate-900 hover:underline block mx-auto font-bold text-center cursor-pointer"
                  >
                    ← Try Again
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50/90 border border-emerald-200 text-emerald-800 p-6 rounded-sm text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                    <span className="text-emerald-600 text-xl font-bold">✓</span>
                  </div>
                  <h4 className="font-serif font-bold text-lg text-emerald-900 mb-2">
                    Inquiry Sent Successfully!
                  </h4>
                  <p className="text-xs text-slate-600 mb-5 leading-relaxed font-sans">
                    Thank you! Your admission inquiry has been successfully submitted to <strong>Ashish Memorial Public Sr. Sec. School</strong>. Our admissions team will get in touch with you shortly.
                  </p>

                  {whatsappUrl && (
                    <div className="mb-4">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-sm transition-colors border border-emerald-600 shadow-sm"
                      >
                        💬 Connect via WhatsApp
                      </a>
                    </div>
                  )}

                  <button
                    onClick={() => setInquirySubmitted(false)}
                    className="font-mono text-[10px] uppercase tracking-wider text-slate-600 hover:text-slate-900 hover:underline block mx-auto font-bold text-center cursor-pointer"
                  >
                    ← Send Another Inquiry
                  </button>
                </div>
              )
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
                    placeholder="Parent or Student Name"
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    className="w-full bg-ivory-paper border border-border-custom p-2.5 rounded-sm focus:outline-none focus:border-brass-gold text-body-text disabled:opacity-60 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted-text uppercase tracking-wider mb-1">
                    Mobile Number (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    disabled={inquirySubmitting}
                    placeholder="10-digit WhatsApp number"
                    value={inquiryPhone}
                    onChange={(e) => {
                      const val = e.target.value;
                      setInquiryPhone(val);
                      if (phoneTouched) setPhoneError(validatePhone(val));
                    }}
                    onBlur={() => {
                      setPhoneTouched(true);
                      setPhoneError(validatePhone(inquiryPhone));
                    }}
                    className={`w-full bg-ivory-paper border p-2.5 rounded-sm focus:outline-none text-body-text disabled:opacity-60 text-sm ${phoneTouched && phoneError ? "border-rose-500 focus:border-rose-500 bg-rose-50/20" : "border-border-custom focus:border-brass-gold"
                      }`}
                  />
                  {phoneTouched && phoneError && (
                    <p className="text-xs text-rose-600 font-sans mt-1">
                      ⚠️ {phoneError}
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-mono text-muted-text uppercase tracking-wider">
                      Email Address *
                    </label>
                    {otpVerified && (
                      <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <div className="relative flex gap-2">
                    <input
                      type="email"
                      required
                      disabled={inquirySubmitting || otpVerified}
                      placeholder="Email Address"
                      value={inquiryEmail}
                      onChange={(e) => {
                        const val = e.target.value;
                        setInquiryEmail(val);
                        if (emailTouched) setEmailError(validateEmail(val));
                        if (otpSent && !otpVerified) {
                          setOtpSent(false);
                          setOtpCode("");
                          setOtpError(null);
                          setOtpSuccess(null);
                        }
                      }}
                      onBlur={() => {
                        setEmailTouched(true);
                        setEmailError(validateEmail(inquiryEmail));
                      }}
                      className={`w-full bg-ivory-paper border p-2.5 rounded-sm focus:outline-none text-body-text disabled:opacity-80 text-sm ${emailTouched && emailError
                        ? "border-rose-500 focus:border-rose-500 bg-rose-50/20"
                        : otpVerified
                          ? "border-emerald-500 bg-emerald-50/20"
                          : "border-border-custom focus:border-brass-gold"
                        }`}
                    />
                    {!otpVerified && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpSending || Boolean(validateEmail(inquiryEmail)) || !inquiryEmail.trim()}
                        className="bg-brass-gold text-ink-navy hover:bg-brass-gold/90 font-mono text-xs font-bold uppercase tracking-wider px-3.5 rounded-sm transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1"
                      >
                        {otpSending ? (
                          <span className="w-3 h-3 border-2 border-ink-navy/30 border-t-ink-navy rounded-full animate-spin"></span>
                        ) : otpSent ? (
                          "Resend OTP"
                        ) : (
                          "Send OTP"
                        )}
                      </button>
                    )}
                  </div>
                  {emailTouched && emailError && (
                    <p className="text-xs text-rose-600 font-sans mt-1">
                      ⚠️ {emailError}
                    </p>
                  )}

                  {/* OTP Entry Card */}
                  {otpSent && !otpVerified && (
                    <div className="mt-3 bg-amber-50/80 border border-amber-200 p-3 rounded-sm space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                          🔒 Enter 6-Digit Verification Code
                        </span>
                        {resendTimer > 0 ? (
                          <span className="font-mono text-[10px] text-amber-700 font-semibold">
                            Resend in {resendTimer}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={otpSending}
                            className="font-mono text-[10px] text-maroon hover:underline font-bold uppercase cursor-pointer"
                          >
                            Resend Code Now
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="6-Digit Code"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                          className="w-full bg-white border border-amber-300 p-2 rounded-sm font-mono text-center font-bold tracking-widest text-base text-ink-navy focus:outline-none focus:border-maroon"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={otpVerifying || otpCode.length !== 6}
                          className="bg-maroon hover:bg-maroon/90 text-white font-mono text-xs font-bold uppercase tracking-wider px-4 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shrink-0"
                        >
                          {otpVerifying ? (
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          ) : (
                            "Verify OTP"
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {otpError && (
                    <p className="text-xs text-rose-600 font-sans mt-1">
                      ⚠️ {otpError}
                    </p>
                  )}
                  {otpSuccess && (
                    <p className="text-xs text-emerald-700 font-sans mt-1 font-medium">
                      ✓ {otpSuccess}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted-text uppercase tracking-wider mb-1">
                    Message / Desired Stream or Class
                  </label>
                  <textarea
                    rows={3}
                    disabled={inquirySubmitting}
                    placeholder="Desired class, stream, or any specific query"
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className="w-full bg-ivory-paper border border-border-custom p-2.5 rounded-sm focus:outline-none focus:border-brass-gold text-body-text resize-none disabled:opacity-60 text-sm"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: inquirySubmitting || Boolean(phoneError || emailError || !inquiryName || !inquiryPhone || !inquiryEmail) ? 1 : 1.02 }}
                  whileTap={{ scale: inquirySubmitting || Boolean(phoneError || emailError || !inquiryName || !inquiryPhone || !inquiryEmail) ? 1 : 0.97 }}
                  type="submit"
                  disabled={inquirySubmitting || Boolean(phoneError || emailError || !inquiryName || !inquiryPhone || !inquiryEmail)}
                  className="w-full bg-ink-navy text-white hover:bg-navy-light font-mono text-xs font-bold uppercase tracking-wider py-3 rounded-sm transition-colors border border-ink-navy shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {inquirySubmitting ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      {formContext === "counselling" ? "Booking Counselling Session..." : "Saving Inquiry Logs..."}
                    </>
                  ) : !otpVerified ? (
                    formContext === "counselling" ? "VERIFY EMAIL & BOOK COUNSELLING" : "VERIFY EMAIL & SUBMIT INQUIRY"
                  ) : (
                    formContext === "counselling" ? "BOOK COUNSELLING SESSION" : "SUBMIT & SEND INQUIRY"
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
        <motion.div variants={childVariants} className="mt-4 sm:mt-16 bg-white p-4 border border-border-custom rounded-sm shadow-sm text-slate-800">
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
