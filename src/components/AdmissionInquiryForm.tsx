import React, { useState } from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import { motion } from "motion/react";
import { AppSection } from "./layout/AppSection";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input, Textarea } from "./ui/Input";
import { MagneticButton } from "./ui/MagneticButton";
import { childItemVariants } from "../utils/motion";

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

  // Contact Inquiry State
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

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      return "Please enter a valid email address (e.g. name@gmail.com).";
    }

    const parts = trimmed.split("@");
    const domain = parts[1] || "";
    if (domain.includes("..") || domain.startsWith(".") || domain.endsWith(".")) {
      return "Email domain format is invalid.";
    }

    if (COMMON_DOMAIN_TYPOS[domain]) {
      return `Did you mean ${parts[0]}@${COMMON_DOMAIN_TYPOS[domain]}?`;
    }

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
      if (response.ok && (data.verified || data.success)) {
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

    let isVerified = otpVerified;

    if (!isVerified) {
      if (!otpSent) {
        handleSendOtp();
        return;
      }

      if (!otpCode || otpCode.trim().length !== 6) {
        setOtpError("Please enter the 6-digit OTP code sent to your email.");
        return;
      }

      setOtpVerifying(true);
      setOtpError(null);
      try {
        const verifyRes = await fetch("/api/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: inquiryEmail.trim(),
            otp: otpCode.trim()
          })
        });
        const verifyData = await verifyRes.json();
        if (verifyRes.ok && verifyData.verified) {
          setOtpVerified(true);
          setOtpSuccess("Email address verified successfully!");
          isVerified = true;
        } else {
          setOtpError(verifyData.message || "Incorrect OTP code. Please try again.");
          setOtpVerifying(false);
          return;
        }
      } catch (err: any) {
        setOtpError(err.message || "Invalid OTP code. Please try again.");
        setOtpVerifying(false);
        return;
      } finally {
        setOtpVerifying(false);
      }
    }

    setInquirySubmitting(true);
    setInquiryError(null);

    const cleanedPhone = cleanPhoneNumber(inquiryPhone);

    try {
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
        setEmailSent(!!data.emailSent);
        setDispatchStatus(data.dispatchStatus || "SavedToDatabase");
        setWhatsappUrl(data.whatsappUrl || "");
      } else {
        throw new Error(data.message || "Failed to process inquiry.");
      }
    } catch (err: any) {
      console.error("[Inquiry Error]", err);
      setInquiryError(err.message || "Something went wrong. Please check your network.");
    } finally {
      setInquirySubmitting(false);
    }
  };

  return (
    <AppSection id="contact" className="bg-[#FAF9F6] py-18 sm:py-22 lg:py-28 border-t border-border-custom/60">
      <motion.div variants={childItemVariants} className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <span className="font-mono text-[11px] sm:text-xs tracking-[0.18em] text-brass-gold font-bold uppercase block mb-2 sm:mb-2.5">
          Contact Us
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-ink-navy font-bold tracking-tight leading-[1.2]">
          {formContext === "counselling" ? "Book Stream Selection Counselling" : "Get in Touch with Administration"}
        </h2>
        <p className="text-muted-text mt-3.5 text-sm md:text-base font-sans leading-[1.75] max-w-xl mx-auto">
          Have questions regarding admissions, fees, or stream selection? Contact our administrative block or send an instant inquiry below.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
        {/* Left 5 Columns: Contact Information Cards */}
        <motion.div variants={childItemVariants} className="lg:col-span-5 flex flex-col justify-between space-y-5">
          {/* Card 1: Address */}
          <Card variant="elevated" padding="lg" className="bg-[#FDFBF7] border border-border-custom/80 hover:border-brass-gold/40 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full p-6 sm:p-7">
            <div>
              <div className="w-12 h-12 bg-maroon/8 rounded-xl border border-maroon/20 flex items-center justify-center text-maroon mb-4 shrink-0 shadow-xs">
                <MapPin className="w-6 h-6 text-maroon" />
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-ink-navy mb-2 tracking-tight">
                School Campus
              </h3>
              <p className="text-muted-text text-xs sm:text-sm leading-[1.7] font-sans">
                Behind Patthar Walo Ki Dharamshala, New Jyoti Nagar, Hindaun City, Karauli (Raj.) 322230
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-border-custom/60">
              <span className="font-mono text-[10px] sm:text-[11px] text-brass-gold font-bold tracking-[0.15em] uppercase">
                Location Reference
              </span>
            </div>
          </Card>

          {/* Card 2: Phone */}
          <Card variant="elevated" padding="lg" className="bg-[#FDFBF7] border border-border-custom/80 hover:border-brass-gold/40 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full p-6 sm:p-7">
            <div>
              <div className="w-12 h-12 bg-maroon/8 rounded-xl border border-maroon/20 flex items-center justify-center text-maroon mb-4 shrink-0 shadow-xs">
                <Phone className="w-6 h-6 text-maroon" />
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-ink-navy mb-2 tracking-tight">
                Call Administration
              </h3>
              <div className="space-y-1.5">
                <a href="tel:9116304006" className="block font-mono text-xs sm:text-sm text-muted-text hover:text-brass-gold font-semibold tracking-wide transition-colors">
                  91163 04006
                </a>
                <a href="tel:9783199992" className="block font-mono text-xs sm:text-sm text-muted-text hover:text-brass-gold font-semibold tracking-wide transition-colors">
                  97831 99992
                </a>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-border-custom/60">
              <span className="font-mono text-[10px] sm:text-[11px] text-brass-gold font-bold tracking-[0.15em] uppercase">
                Hours: 8 AM - 3 PM
              </span>
            </div>
          </Card>

          {/* Card 3: Email */}
          <Card variant="elevated" padding="lg" className="bg-[#FDFBF7] border border-border-custom/80 hover:border-brass-gold/40 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full p-6 sm:p-7">
            <div>
              <div className="w-12 h-12 bg-maroon/8 rounded-xl border border-maroon/20 flex items-center justify-center text-maroon mb-4 shrink-0 shadow-xs">
                <Mail className="w-6 h-6 text-maroon" />
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-ink-navy mb-2 tracking-tight">
                Email Address
              </h3>
              <a href="mailto:ampspankaj@gmail.com" className="font-mono text-xs sm:text-sm text-muted-text hover:text-maroon transition-colors break-all block font-semibold tracking-wide">
                ampspankaj@gmail.com
              </a>
            </div>
            <div className="pt-4 mt-4 border-t border-border-custom/60">
              <span className="font-mono text-[10px] sm:text-[11px] text-brass-gold font-bold tracking-[0.15em] uppercase">
                24/7 Digital Desk
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Right 7 Columns: Admission Inquiry Form (The Hero of the Section) */}
        <motion.div variants={childItemVariants} className="lg:col-span-7">
          <Card variant="elevated" padding="none" className="bg-white border-2 border-brass-gold/35 rounded-2xl p-7 sm:p-9 md:p-10 shadow-xl relative overflow-hidden text-slate-800">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brass-gold via-maroon to-brass-gold pointer-events-none" />

            <span className="font-mono text-xs text-maroon uppercase tracking-[0.18em] font-bold block mb-1.5">
              {formContext === "counselling" ? "Academic Guidance Desk" : "Instant Advisory Desk"}
            </span>
            <h3 className="font-serif text-xl sm:text-2xl text-ink-navy font-bold mb-6 sm:mb-7 tracking-tight">
              {formContext === "counselling" ? "Book Your Counselling Session" : "Send a Quick Admission Inquiry"}
            </h3>

            {inquirySubmitted ? (
              dispatchStatus === "Failed" ? (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-7 rounded-xl text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto text-rose-600 font-bold text-lg">
                    ⚠️
                  </div>
                  <h4 className="font-serif font-bold text-lg text-rose-900">
                    Failed to Send Inquiry
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    We were unable to deliver your email inquiry right now. Please call us directly at <a href="tel:9116304006" className="font-bold text-ink-navy underline">91163 04006</a> or connect via WhatsApp below.
                  </p>
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold uppercase tracking-wider h-[52px] px-6 rounded-lg transition-colors border border-emerald-600 shadow-md"
                    >
                      💬 Connect via WhatsApp Instead
                    </a>
                  )}
                  <button
                    onClick={() => { setInquirySubmitted(false); setInquiryError(null); }}
                    className="font-mono text-xs uppercase tracking-wider text-slate-600 hover:underline block mx-auto font-bold cursor-pointer pt-2"
                  >
                    ← Try Again
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50/90 border border-emerald-200 text-emerald-800 p-7 rounded-xl text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                    <svg className="w-7 h-7 stroke-emerald-600" viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <motion.path
                        d="M20 6L9 17l-5-5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </svg>
                  </div>
                  <h4 className="font-serif font-bold text-lg text-emerald-900">
                    Inquiry Sent Successfully!
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    Thank you! Your admission inquiry has been successfully submitted to <strong>Ashish Memorial Public Sr. Sec. School</strong>. Our admissions team will get in touch with you shortly.
                  </p>

                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold uppercase tracking-wider h-[52px] px-6 rounded-lg transition-colors border border-emerald-600 shadow-md"
                    >
                      💬 Connect via WhatsApp
                    </a>
                  )}

                  <button
                    onClick={() => setInquirySubmitted(false)}
                    className="font-mono text-xs uppercase tracking-wider text-slate-600 hover:underline block mx-auto font-bold cursor-pointer pt-2"
                  >
                    ← Send Another Inquiry
                  </button>
                </div>
              )
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-5 sm:space-y-6">
                {inquiryError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-lg text-xs sm:text-sm font-sans">
                    ⚠️ {inquiryError}
                  </div>
                )}

                <Input
                  label="Parent / Student Name *"
                  placeholder="Parent or Student Name"
                  required
                  disabled={inquirySubmitting}
                  value={inquiryName}
                  onChange={(e) => setInquiryName(e.target.value)}
                />

                <Input
                  label="Mobile Number (WhatsApp) *"
                  type="tel"
                  placeholder="10-digit WhatsApp number"
                  required
                  disabled={inquirySubmitting}
                  value={inquiryPhone}
                  error={phoneTouched ? phoneError : null}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInquiryPhone(val);
                    if (phoneTouched) setPhoneError(validatePhone(val));
                  }}
                  onBlur={() => {
                    setPhoneTouched(true);
                    setPhoneError(validatePhone(inquiryPhone));
                  }}
                />

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="block font-sans text-xs font-semibold text-body-text uppercase tracking-wider">
                      Email Address *
                    </span>
                    {otpVerified && (
                      <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2.5">
                    <Input
                      type="email"
                      required
                      disabled={inquirySubmitting || otpVerified}
                      placeholder="Email Address"
                      value={inquiryEmail}
                      error={emailTouched ? emailError : null}
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
                      className="w-full"
                    />
                    {!otpVerified && (
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={handleSendOtp}
                        isLoading={otpSending}
                        disabled={otpSending || Boolean(validateEmail(inquiryEmail)) || !inquiryEmail.trim()}
                        className="shrink-0 font-mono text-xs uppercase h-12 px-4 rounded-lg"
                      >
                        {otpSent ? "Resend OTP" : "Send OTP"}
                      </Button>
                    )}
                  </div>

                  {/* OTP Verification Box */}
                  {otpSent && !otpVerified && (
                    <div className="mt-3.5 bg-amber-50/90 border border-amber-200 p-4 rounded-lg space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                          🔒 Enter 6-Digit Code
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
                            Resend Code
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2.5">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="6-Digit Code"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                          className="w-full bg-white border border-amber-300 px-3.5 h-11 rounded-lg font-mono text-center font-bold tracking-widest text-base text-ink-navy focus:outline-none focus:border-maroon shadow-xs"
                        />
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={handleVerifyOtp}
                          isLoading={otpVerifying}
                          disabled={otpVerifying || otpCode.length !== 6}
                          className="shrink-0 font-mono text-xs uppercase h-11 px-4 rounded-lg"
                        >
                          Verify OTP
                        </Button>
                      </div>
                    </div>
                  )}

                  {otpError && (
                    <p className="text-xs text-error font-sans mt-1.5">⚠️ {otpError}</p>
                  )}
                  {otpSuccess && (
                    <p className="text-xs text-success font-sans mt-1.5 font-medium">✓ {otpSuccess}</p>
                  )}
                </div>

                <Textarea
                  label="Message / Desired Stream or Class"
                  rows={3}
                  disabled={inquirySubmitting}
                  placeholder="Desired class, stream, or specific query"
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                />

                <MagneticButton className="w-full">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    whileHover={{ y: 0 }}
                    whileTap={{ y: 0 }}
                    isLoading={inquirySubmitting}
                    disabled={inquirySubmitting || Boolean(phoneError || emailError || !inquiryName || !inquiryPhone || !inquiryEmail)}
                    className="h-[52px] w-full text-base font-bold tracking-wider uppercase shadow-md hover:shadow-lg hover:shadow-brass-gold/20 transition-all duration-200"
                  >
                    {!otpVerified ? "VERIFY EMAIL & SUBMIT INQUIRY" : "SUBMIT & SEND INQUIRY"}
                  </Button>
                </MagneticButton>

                <p className="text-[11px] text-muted-text text-center italic mt-2.5 font-sans">
                  Inquiry will be saved securely and dispatched to administration instantly.
                </p>
              </form>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Location Reference Banner */}
      <motion.div variants={childItemVariants} className="mt-10 sm:mt-12">
        <Card variant="flat" padding="lg" className="rounded-2xl border border-border-custom/80 bg-white/90 shadow-sm p-6 sm:p-7">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex gap-3.5 items-center">
              <div className="w-10 h-10 rounded-xl bg-brass-gold/10 border border-brass-gold/30 flex items-center justify-center text-brass-gold shrink-0">
                <MapPin className="w-5 h-5 text-brass-gold shrink-0" />
              </div>
              <div className="text-left">
                <h4 className="font-serif text-base font-bold text-ink-navy tracking-tight">Location Reference</h4>
                <p className="text-muted-text text-xs sm:text-sm mt-0.5 font-sans leading-relaxed">
                  Located behind Patthar Walo Ki Dharamshala, New Jyoti Nagar, Hindaun City, Karauli district. Easy bus and auto connectivity.
                </p>
              </div>
            </div>
            <span className="font-mono text-[10px] sm:text-[11px] text-muted-text uppercase tracking-widest bg-white px-3.5 py-2 border border-border-custom rounded-lg text-center shrink-0 font-medium">
              Coordinates: Behind Patthar Walo Ki Dharamshala, New Jyoti Nagar
            </span>
          </div>
        </Card>
      </motion.div>
    </AppSection>
  );
}
