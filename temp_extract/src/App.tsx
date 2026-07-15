/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  Menu, 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  BookOpen, 
  ShieldCheck, 
  Award, 
  GraduationCap, 
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  Sparkles,
  ArrowRight,
  ExternalLink
} from "lucide-react";

// Beautiful custom SVG school logo fallback that matches the official school's branding
function SchoolLogo({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`${className} bg-white`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Curving paths for circular text */}
        <path id="textPathTop" d="M 15 50 A 35 35 0 0 1 85 50" fill="none" />
        <path id="textPathBottom" d="M 85 50 A 35 35 0 0 1 15 50" fill="none" />
      </defs>
      
      {/* Outer base and concentric circular rings */}
      <circle cx="50" cy="50" r="48" fill="#14213D" />
      <circle cx="50" cy="50" r="45" fill="none" stroke="#C9A227" strokeWidth="2" />
      <circle cx="50" cy="50" r="38" fill="#14213D" stroke="#C9A227" strokeWidth="1" strokeDasharray="2,2" />
      <circle cx="50" cy="50" r="31" fill="#14213D" stroke="#C9A227" strokeWidth="1" />
      
      {/* Top Curved Text */}
      <text fill="#C9A227" fontFamily="Georgia, serif" fontSize="6.2" fontWeight="bold" letterSpacing="0.4">
        <textPath href="#textPathTop" startOffset="50%" textAnchor="middle">
          ASHISH MEMORIAL PUB. SCHOOL
        </textPath>
      </text>
      
      {/* Bottom Curved Text */}
      <text fill="#C9A227" fontFamily="Georgia, serif" fontSize="6.2" fontWeight="bold" letterSpacing="0.4">
        <textPath href="#textPathBottom" startOffset="50%" textAnchor="middle">
          HINDAUN CITY (KARAULI)
        </textPath>
      </text>

      {/* Central Shield Crest */}
      <g transform="translate(50, 50) scale(0.48)">
        {/* Shield Border and Background */}
        <path d="M -22 -22 L 22 -22 C 22 -22 22 12 0 32 C -22 12 -22 -22 -22 -22 Z" fill="#C9A227" stroke="#FBF7EE" strokeWidth="1" />
        <path d="M -19 -19 L 19 -19 C 19 -19 19 10 0 28 C -19 10 -19 -19 -19 -19 Z" fill="#7A2331" />
        
        {/* Open Book of Knowledge */}
        <path d="M -10 -5 Q -5 -9 0 -6 Q 5 -9 10 -5 V 5 Q 5 1 0 5 Q -5 1 -10 5 Z" fill="#FBF7EE" stroke="#14213D" strokeWidth="0.7" />
        <path d="M 0 -6 V 5" stroke="#14213D" strokeWidth="0.7" />
        <line x1="-7" y1="-2" x2="-3" y2="-4" stroke="#14213D" strokeWidth="0.5" />
        <line x1="-7" y1="1" x2="-3" y2="-1" stroke="#14213D" strokeWidth="0.5" />
        <line x1="3" y1="-4" x2="7" y2="-2" stroke="#14213D" strokeWidth="0.5" />
        <line x1="3" y1="-1" x2="7" y2="1" stroke="#14213D" strokeWidth="0.5" />

        {/* Torch of Enlightenment */}
        <path d="M -2 -14 L 2 -14 L 3 -10 L 0 -8 L -3 -10 Z" fill="#C9A227" />
        <path d="M -4 -13 C -3 -17 0 -18 0 -18 C 0 -18 3 -17 4 -13 C 2 -15 0 -14 0 -14 C 0 -14 -2 -15 -4 -13 Z" fill="#E63946" />
        
        {/* Banner with initials AMPS */}
        <path d="M -24 16 Q 0 22 24 16 V 11 Q 0 17 -24 11 Z" fill="#C9A227" stroke="#FBF7EE" strokeWidth="0.7" />
        <text y="15.5" fontFamily="sans-serif" fontSize="6.2" fontWeight="bold" fill="#14213D" textAnchor="middle" letterSpacing="0.5">AMPS</text>
      </g>
    </svg>
  );
}

export default function App() {
  const [logoError, setLogoError] = useState(false);
  const [img1Error, setImg1Error] = useState(false);
  const [img2Error, setImg2Error] = useState(false);
  const [principalImgError, setPrincipalImgError] = useState(false);
  const [chairmanImgError, setChairmanImgError] = useState(false);
  const [administratorImgError, setAdministratorImgError] = useState(false);
  const [originalPrincipalImgError, setOriginalPrincipalImgError] = useState(false);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNoticeIndex, setActiveNoticeIndex] = useState<number | null>(null);
  
  // Custom interactive feature: Contact Inquiry State with Intelligent Server-Side Database & Fallbacks
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);
  
  // Advanced dispatch fallback states
  const [emailSent, setEmailSent] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState("Pending");
  const [whatsappUrl, setWhatsappUrl] = useState("");

  // Admin Dashboard Management States
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminInquiries, setAdminInquiries] = useState<any[]>([]);
  const [adminSettings, setAdminSettings] = useState<any>({
    adminPassword: "ampsadmin",
    whatsappPhone: "919829012345",
    emailProvider: "web3forms",
    web3formsKey: "",
    smtpHost: "",
    smtpPort: "465",
    smtpUser: "",
    smtpPass: "",
    inquiryRecipient: "jainakshat6878@gmail.com"
  });
  const [adminActiveTab, setAdminActiveTab] = useState<"inquiries" | "settings">("inquiries");
  const [adminErrorMsg, setAdminErrorMsg] = useState("");
  const [adminSuccessMsg, setAdminSuccessMsg] = useState("");

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryPhone) return;

    setInquirySubmitting(true);
    setInquiryError(null);

    try {
      const recipientEmail = "jainakshat6878@gmail.com";
      console.log(`[Inquiry Client] Sending inquiry for ${inquiryName}. Starting browser-direct dispatch to ${recipientEmail}...`);

      let clientDispatched = false;
      let clientStatus = "Pending";
      let clientError = "";

      // We attempt to dispatch from the browser (client-side) first.
      // This is highly trusted because it runs from the user's home IP, bypassing any Cloud Run server blocks.
      try {
        const clientResponse = await fetch(`https://formsubmit.co/ajax/${recipientEmail}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            "Name / Parent": inquiryName,
            "Phone / Mobile": inquiryPhone,
            "Message / Inquiry": inquiryMessage || "Interested in school admission",
            "_subject": `✨ Direct AMPS Admission Inquiry: ${inquiryName} (${inquiryPhone})`,
            "_captcha": "false"
          })
        });

        if (clientResponse.ok) {
          const clientData = await clientResponse.json();
          clientDispatched = true;
          
          if (clientData.success === "false" || (clientData.message && clientData.message.toLowerCase().includes("activate"))) {
            clientStatus = "Needs Activation";
            console.log("[Inquiry Client] Direct FormSubmit triggered successfully! Activation mail dispatched to:", recipientEmail);
          } else {
            clientStatus = "Delivered";
            console.log("[Inquiry Client] Direct FormSubmit delivered successfully!");
          }
        } else {
          console.warn("[Inquiry Client] Direct FormSubmit failed. Status:", clientResponse.status);
          clientError = `HTTP error ${clientResponse.status}`;
        }
      } catch (clientErr: any) {
        console.error("[Inquiry Client] Direct FormSubmit error:", clientErr);
        clientError = clientErr.message || "Network error";
      }

      console.log(`[Inquiry Client] Logging inquiry inside local database...`);
      // Notify the server about the inquiry.
      // If clientDispatched is true, the server will skip sending emails (avoiding duplicates or server IP blocks)
      // and directly log it as successful!
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inquiryName,
          phone: inquiryPhone,
          message: inquiryMessage,
          clientDispatched,
          clientStatus,
          clientError
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setInquirySubmitted(true);
        setEmailSent(clientDispatched || data.emailSent);
        setDispatchStatus(clientDispatched ? clientStatus : data.dispatchStatus);
        setWhatsappUrl(data.whatsappRedirectUrl);

        // Clear input fields
        setInquiryName("");
        setInquiryPhone("");
        setInquiryMessage("");
      } else {
        throw new Error(data.message || "Failed to dispatch inquiry on server database.");
      }
    } catch (err: any) {
      console.error("[Inquiry Client] Error processing inquiry:", err);
      setInquiryError(err.message || "Unable to submit inquiry. Please use direct phone/WhatsApp instead.");
    } finally {
      setInquirySubmitting(false);
    }
  };

  const handleAdminLogin = async () => {
    setAdminErrorMsg("");
    setAdminSuccessMsg("");
    try {
      const response = await fetch("/api/admin/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPasswordInput })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setIsAdminAuthenticated(true);
        setAdminInquiries(data.inquiries);
        
        // Fetch current settings as well
        const settingsRes = await fetch("/api/admin/settings");
        const settingsData = await settingsRes.json();
        if (settingsData.success) {
          setAdminSettings(settingsData.settings);
        }
      } else {
        setAdminErrorMsg(data.message || "Incorrect admin password.");
      }
    } catch (err: any) {
      setAdminErrorMsg("Connection failed: " + err.message);
    }
  };

  const handleSaveSettings = async () => {
    setAdminErrorMsg("");
    setAdminSuccessMsg("");
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: adminPasswordInput,
          settings: adminSettings
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAdminSuccessMsg("Settings saved successfully! Server-side dispatch has been updated.");
        setAdminSettings(data.settings);
      } else {
        setAdminErrorMsg(data.message || "Failed to save settings.");
      }
    } catch (err: any) {
      setAdminErrorMsg("Error saving settings: " + err.message);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      const response = await fetch("/api/admin/clear-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPasswordInput, id })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAdminInquiries(data.inquiries);
        setAdminSuccessMsg("Inquiry deleted from database logs.");
      }
    } catch (err: any) {
      setAdminErrorMsg("Error deleting inquiry: " + err.message);
    }
  };

  const handleClearAllInquiries = async () => {
    if (!window.confirm("CRITICAL: Are you sure you want to permanently delete ALL inquiry logs? This cannot be undone!")) return;
    try {
      const response = await fetch("/api/admin/clear-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPasswordInput })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAdminInquiries([]);
        setAdminSuccessMsg("Inquiry log database has been cleared.");
      }
    } catch (err: any) {
      setAdminErrorMsg("Error wiping database logs: " + err.message);
    }
  };

  const refreshInquiries = async () => {
    try {
      const response = await fetch("/api/admin/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPasswordInput })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAdminInquiries(data.inquiries);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Photo Gallery Interactive States & Metadata
  const [galleryFilter, setGalleryFilter] = useState("all");
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<{
    id: string;
    title: string;
    subtitle: string;
    category: string;
    localSrc: string;
    fallbackSrc: string;
  } | null>(null);
  
  // Track load failures for any of the event images so they show beautiful high-res fallbacks
  const [galleryImgErrors, setGalleryImgErrors] = useState<Record<string, boolean>>({});

  const galleryItems = [
    {
      id: "news-1",
      title: "Dainik Bhaskar Merit Feature",
      subtitle: "Dainik Bhaskar newspaper clipping covering the outstanding academic performance and topper merit list of our board students.",
      category: "news",
      localSrc: "/assets/news-1.jpeg",
      fallbackSrc: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {
      id: "news-2",
      title: "Earth Day Group Exhibition",
      subtitle: "Students holding a globe model and awareness posters stand together with faculty in front of the campus building to commemorate Earth Day.",
      category: "news",
      localSrc: "/assets/news-2.jpeg",
      fallbackSrc: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {
      id: "news-3",
      title: "School Staff News Portrait",
      subtitle: "A group photograph of school faculty members, wearing elegant coordinated uniforms, printed in the regional Hindi news media.",
      category: "news",
      localSrc: "/assets/news-3.jpg",
      fallbackSrc: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {
      id: "award-1",
      title: "Academic Excellence Felicitation",
      subtitle: "Outstanding student scholars being honored with medals and certificates on stage during the academic topper award ceremony.",
      category: "awards",
      localSrc: "/assets/award-1.jpg",
      fallbackSrc: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {
      id: "award-2",
      title: "Annual Day Excellence Awards",
      subtitle: "School management team and principal presenting achievement shields and trophies to top ranking merit students.",
      category: "awards",
      localSrc: "/assets/award-2.jpg",
      fallbackSrc: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {
      id: "award-4",
      title: "Board Merit Position Winners",
      subtitle: "Eminent chief guests presenting certificates of merit and academic recognition to board rank achievers.",
      category: "awards",
      localSrc: "/assets/award-4.jpeg",
      fallbackSrc: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {
      id: "award-5",
      title: "Meritorious Scholar Award Distribution",
      subtitle: "A distinguished school patron presenting a trophy and scholarship certificate to a primary block boy student in full uniform.",
      category: "awards",
      localSrc: "/assets/award.jpeg",
      fallbackSrc: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {
      id: "sports-1",
      title: "Annual Sports Day Athletics",
      subtitle: "Senior and middle-school students competing in track-and-field sprint races on the sports playground.",
      category: "sports",
      localSrc: "/assets/sports-1.jpg",
      fallbackSrc: "https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {
      id: "sports-2",
      title: "Physical Development Events",
      subtitle: "Active track meets and student athletics encouraging team coordination, speed, and healthy physical endurance.",
      category: "sports",
      localSrc: "/assets/sports-2.jpg",
      fallbackSrc: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {
      id: "cultural-1",
      title: "Daily Morning Prayer & Assembly",
      subtitle: "Disciplined queues of senior and junior students standing together during the morning assembly, fostering routine and devotion.",
      category: "cultural",
      localSrc: "/assets/cultural-1.jpg",
      fallbackSrc: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {
      id: "cultural-2",
      title: "School Gathering & Assembly Prayers",
      subtitle: "A peaceful morning session with students and faculty folded in prayer, invoking positivity, dedication, and school spirit.",
      category: "cultural",
      localSrc: "/assets/cultural-2.jpg",
      fallbackSrc: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {
      id: "cultural-3",
      title: "Outdoor Sitting Assembly & Discourse",
      subtitle: "Students in school uniforms seated in organized rows on floor mats in an outdoor courtyard during a moral lecture session.",
      category: "cultural",
      localSrc: "/assets/cultural-3.jpg",
      fallbackSrc: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {
      id: "cultural-4",
      title: "Kindergarten Welcome Performance",
      subtitle: "Seven adorable kindergarten students in uniform standing on a stage holding colorful cutouts spelling out WELCOME.",
      category: "cultural",
      localSrc: "/assets/cultural-4.jpg",
      fallbackSrc: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {
      id: "cultural-5",
      title: "Saraswati Puja Devotional Ceremony",
      subtitle: "A school member offering tilak to a framed portrait of Goddess Saraswati during a devotional prayer session seeking knowledge.",
      category: "cultural",
      localSrc: "/assets/cultural-5.jpeg",
      fallbackSrc: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {
      id: "science-1",
      title: "Student Showcasing Exhibition Model",
      subtitle: "A student in school uniform presenting her town-planning model and geography project to evaluators at a school exhibition.",
      category: "science",
      localSrc: "/assets/science-fair-1.jpg",
      fallbackSrc: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {
      id: "science-2",
      title: "District Science Seminar Winners",
      subtitle: "High-school students holding up their official certificates of achievement alongside their science teachers after a successful seminar presentation.",
      category: "science",
      localSrc: "/assets/science-fair-2.jpg",
      fallbackSrc: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {
      id: "science-3",
      title: "Patriotic Painting & Poster Exhibition",
      subtitle: "A student proudly displaying his tricolor artwork featuring Mahatma Gandhi, peace doves, and national integration themes.",
      category: "science",
      localSrc: "/assets/science-fair-3.jpeg",
      fallbackSrc: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800&h=600"
    }
  ];

  // Get filtered items:
  // - If galleryFilter is "all", show only the first item from each unique category
  // - If galleryFilter is a specific folder/category, show all items from that category
  const getDisplayedGalleryItems = () => {
    if (galleryFilter !== "all") {
      return galleryItems.filter(item => item.category === galleryFilter);
    }
    const categoriesSeen = new Set<string>();
    return galleryItems.filter(item => {
      if (categoriesSeen.has(item.category)) {
        return false;
      }
      categoriesSeen.add(item.category);
      return true;
    });
  };

  const displayedGalleryItems = getDisplayedGalleryItems();

  // Helper to handle Lightbox navigation
  const navigateLightbox = (direction: "prev" | "next") => {
    if (!selectedGalleryImg) return;
    const currentIndex = displayedGalleryItems.findIndex(item => item.id === selectedGalleryImg.id);
    if (currentIndex === -1) return;
    
    let nextIndex = currentIndex;
    if (direction === "prev") {
      nextIndex = currentIndex === 0 ? displayedGalleryItems.length - 1 : currentIndex - 1;
    } else {
      nextIndex = currentIndex === displayedGalleryItems.length - 1 ? 0 : currentIndex + 1;
    }
    setSelectedGalleryImg(displayedGalleryItems[nextIndex]);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brass-gold selection:text-ink-navy bg-ivory-paper">
      
      {/* 1. STICKY NAVBAR */}
      <header id="navbar" className="sticky top-0 z-50 bg-ink-navy border-b border-brass-gold/20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 md:h-20">
            
            {/* Left: Brand / Logo */}
            <a href="#hero" className="flex items-center gap-3 md:gap-4 group">
              <div className="w-11 h-11 md:w-13 md:h-13 rounded-full border-2 border-brass-gold overflow-hidden bg-white flex items-center justify-center shrink-0 shadow-inner">
                {logoError ? (
                  <SchoolLogo className="w-full h-full" />
                ) : (
                  <img 
                    src="/assets/logo.png" 
                    alt="AMPS School Crest Logo" 
                    onError={() => setLogoError(true)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-white text-sm sm:text-base md:text-lg font-bold leading-tight tracking-tight group-hover:text-brass-gold transition-colors">
                  Ashish Memorial Public Senior Secondary School
                </span>
                <span className="font-mono text-brass-gold text-[9px] md:text-xs tracking-wider uppercase font-medium mt-0.5">
                  Hindaun City (Karauli) · Estd. 2005
                </span>
              </div>
            </a>

            {/* Center-Right: Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 font-mono text-sm tracking-wide">
              <a href="#notices" className="text-white/85 hover:text-brass-gold transition-colors uppercase">
                Notices
              </a>
              <a href="#about" className="text-white/85 hover:text-brass-gold transition-colors uppercase">
                About
              </a>
              <a href="#why-amps" className="text-white/85 hover:text-brass-gold transition-colors uppercase">
                Academics
              </a>
              <a href="#contact" className="text-white/85 hover:text-brass-gold transition-colors uppercase">
                Contact
              </a>
            </nav>

            {/* Far Right: Login Button */}
            <div className="hidden md:flex items-center">
              <a 
                href="#login-placeholder" 
                onClick={(e) => {
                  e.preventDefault();
                  alert("Student/Teacher Portal login interface is currently a placeholder for integration with future modules.");
                }}
                className="bg-brass-gold text-ink-navy hover:bg-brass-gold/90 transition-all font-mono font-bold text-xs tracking-wider uppercase px-4 py-2 rounded-sm border border-brass-gold shadow-sm hover:translate-y-[-1px] active:translate-y-0"
              >
                Login
              </a>
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:text-brass-gold focus:outline-none p-2"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-navy-light border-t border-brass-gold/20 font-mono text-sm"
            >
              <div className="px-4 pt-4 pb-6 space-y-3 flex flex-col uppercase tracking-wider">
                <a 
                  href="#notices" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white/90 hover:text-brass-gold py-2 transition-colors border-b border-white/5"
                >
                  Notices
                </a>
                <a 
                  href="#about" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white/90 hover:text-brass-gold py-2 transition-colors border-b border-white/5"
                >
                  About
                </a>
                <a 
                  href="#why-amps" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white/90 hover:text-brass-gold py-2 transition-colors border-b border-white/5"
                >
                  Academics
                </a>
                <a 
                  href="#contact" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white/90 hover:text-brass-gold py-2 transition-colors border-b border-white/5"
                >
                  Contact
                </a>
                <a 
                  href="#login-placeholder"
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    alert("Portal login interface is a placeholder for future integration.");
                  }}
                  className="bg-brass-gold text-ink-navy text-center font-bold py-2.5 rounded-sm shadow-sm mt-3"
                >
                  Login
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. HERO SECTION */}
      <section id="hero" className="relative py-16 md:py-24 overflow-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column (Text & CTAs) */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-mono text-[10px] md:text-xs tracking-wider text-maroon font-bold bg-maroon/5 px-3 py-1 rounded-full border border-maroon/10 uppercase">
                Est. 2005
              </span>
              <span className="font-mono text-[10px] md:text-xs tracking-wider text-navy-light font-bold bg-navy-light/5 px-3 py-1 rounded-full border border-navy-light/10 uppercase">
                Rajasthan State Board
              </span>
              <span className="font-mono text-[10px] md:text-xs tracking-wider text-brass-gold font-bold bg-brass-gold/5 px-3 py-1 rounded-full border border-brass-gold/10 uppercase">
                English & Hindi Medium
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink-navy font-bold leading-tight tracking-tight">
                For a better tomorrow, <br className="hidden sm:inline" />
                <span className="italic text-maroon font-semibold block mt-1">
                  outshining every year.
                </span>
              </h1>
            </div>

            <p className="text-muted-text text-base md:text-lg leading-relaxed max-w-2xl font-sans">
              Ashish Memorial Public Sr. Sec. School (AMPS) is a premier educational institution in Hindaun City, Rajasthan. Guided by scholarly principles, deep discipline, and modern pedagogical rigor, we guide our students towards stellar state board records and seamless foundation preparation for IIT-JEE and NEET.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <a 
                href="#about"
                className="bg-ink-navy text-ivory-paper hover:bg-navy-light px-6 py-3.5 rounded-sm font-sans font-medium text-sm md:text-base tracking-wide shadow-md transition-all duration-200 border border-ink-navy hover:translate-y-[-1px]"
              >
                Explore the School
              </a>
              <a 
                href="#contact"
                className="border-2 border-ink-navy text-ink-navy hover:bg-ink-navy hover:text-ivory-paper px-6 py-3 rounded-sm font-sans font-medium text-sm md:text-base tracking-wide transition-all duration-200 hover:translate-y-[-1px]"
              >
                Admission 2026–27
              </a>
            </div>

            {/* Quick trust metrics badge */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border-custom max-w-lg">
              <div>
                <p className="font-serif text-2xl font-bold text-ink-navy">100%</p>
                <p className="font-mono text-[10px] text-muted-text uppercase tracking-wider">Board Success</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-ink-navy">Science</p>
                <p className="font-mono text-[10px] text-muted-text uppercase tracking-wider">Commerce & Arts</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-ink-navy">PG-XII</p>
                <p className="font-mono text-[10px] text-muted-text uppercase tracking-wider">Complete Journey</p>
              </div>
            </div>

          </div>

          {/* Right Column (Hero Photo Card) */}
          <div className="lg:col-span-5">
            <div className="bg-white p-3.5 md:p-4 rounded-sm border border-border-custom shadow-md max-w-md mx-auto">
              <div className="relative overflow-hidden aspect-video sm:aspect-square md:aspect-[4/3] bg-muted-board border border-border-custom/50 rounded-sm">
                <img 
                  src={img1Error ? "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200&h=900" : "/assets/school-building-2.jpg"} 
                  alt="Ashish Memorial Public School Building" 
                  onError={() => setImg1Error(true)}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-ink-navy text-white font-mono text-[9px] tracking-widest uppercase py-1 px-2.5 rounded-sm shadow-sm border border-brass-gold/20">
                  AMPS Main Campus
                </div>
              </div>
              <div className="pt-4 pb-2 text-center">
                <p className="font-serif italic text-muted-text text-sm sm:text-base">
                  "AMPS beats and outshines"
                </p>
                <p className="font-mono text-[9px] text-brass-gold uppercase tracking-widest mt-1">
                  OUR HOLISTIC CREST MOTTO
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. THIN DASHED GOLD DIVIDER LINE */}
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="dashed-divider h-0.5 w-full opacity-65 my-4"></div>
      </div>

      {/* 4. NOTICE BOARD SECTION */}
      <section id="notices" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="font-mono text-xs tracking-widest text-maroon font-semibold uppercase block mb-2">
            Notice Board
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-ink-navy font-bold tracking-tight">
            Latest from the school
          </h2>
          <p className="text-muted-text mt-3 font-sans text-sm md:text-base">
            Keep track of live school notices, educational updates, and schedules. Hover over any pin to inspect details.
          </p>
        </div>

        {/* Tan/cork-colored board container */}
        <div className="bg-muted-board rounded-sm p-6 sm:p-8 lg:p-12 border border-border-custom shadow-inner relative overflow-hidden">
          {/* Subtle wooden texture styling background elements */}
          <div className="absolute inset-0 bg-opacity-5 pointer-events-none bg-[radial-gradient(#C9A227_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
          
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            
            {/* CARD 1: Admission Open */}
            <motion.div 
              whileHover={{ rotate: 0, y: -8, scale: 1.01 }}
              initial={{ rotate: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white p-6 pt-10 pb-8 rounded-sm shadow-md border border-border-custom relative transition-shadow hover:shadow-xl flex flex-col justify-between"
            >
              {/* Wooden Pin Accent */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-maroon shadow-sm border border-black/10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-brass-gold"></div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-mono text-[9px] tracking-widest text-maroon uppercase font-bold bg-maroon/5 px-2 py-0.5 rounded">
                    URGENT NOTICE
                  </span>
                  <span className="font-mono text-[9px] text-muted-text">2026–27</span>
                </div>
                
                <h3 className="font-serif text-xl text-ink-navy font-bold mb-3">
                  Admission Open 2026–27
                </h3>
                
                <ul className="text-muted-text text-sm space-y-2 mb-4 leading-relaxed font-sans">
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
                <a 
                  href="#contact" 
                  className="font-mono text-[11px] text-maroon hover:text-ink-navy font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                >
                  Apply / Inquire Now <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>

            {/* CARD 2: IIT-JEE & NEET */}
            <motion.div 
              whileHover={{ rotate: 0, y: -8, scale: 1.01 }}
              initial={{ rotate: -1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white p-6 pt-10 pb-8 rounded-sm shadow-md border border-border-custom relative transition-shadow hover:shadow-xl flex flex-col justify-between"
            >
              {/* Wooden Pin Accent */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-maroon shadow-sm border border-black/10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-brass-gold"></div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-mono text-[9px] tracking-widest text-navy-light uppercase font-bold bg-navy-light/5 px-2 py-0.5 rounded">
                    FOUNDATION
                  </span>
                  <span className="font-mono text-[9px] text-muted-text">Classes XI & XII</span>
                </div>

                <h3 className="font-serif text-xl text-ink-navy font-bold mb-3">
                  IIT-JEE & NEET Foundation
                </h3>

                <p className="text-muted-text text-sm leading-relaxed mb-4">
                  Dedicated in-house coaching curriculum with separate research booklets, routine evaluation tests, and doubt clearing squads to boost scientific and engineering readiness.
                </p>

                <div className="bg-muted-board/30 p-3 rounded border border-border-custom/50 text-[12px] text-body-text font-serif italic">
                  "No need to migrate to separate tuition centers — complete integration at school."
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-dashed border-border-custom">
                <a 
                  href="#why-amps" 
                  className="font-mono text-[11px] text-maroon hover:text-ink-navy font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                >
                  Explore Curriculum <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>

            {/* CARD 3: Safe System for Girls */}
            <motion.div 
              whileHover={{ rotate: 0, y: -8, scale: 1.01 }}
              initial={{ rotate: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white p-6 pt-10 pb-8 rounded-sm shadow-md border border-border-custom relative transition-shadow hover:shadow-xl flex flex-col justify-between"
            >
              {/* Wooden Pin Accent */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-maroon shadow-sm border border-black/10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-brass-gold"></div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-mono text-[9px] tracking-widest text-brass-gold uppercase font-bold bg-brass-gold/5 px-2 py-0.5 rounded">
                    CAMPUS SAFETY
                  </span>
                  <span className="font-mono text-[9px] text-muted-text">SECURE Campus</span>
                </div>

                <h3 className="font-serif text-xl text-ink-navy font-bold mb-3">
                  Safe System for Girls
                </h3>

                <p className="text-muted-text text-sm leading-relaxed mb-4">
                  A thoroughly secure, CCTV-supervised school perimeter. We provide transport vigilance systems and highly dedicated administrative guardianship for absolute parental peace of mind.
                </p>

                <div className="flex items-center gap-2 text-maroon">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider">Fully Supervised Facility</span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-dashed border-border-custom">
                <a 
                  href="#about" 
                  className="font-mono text-[11px] text-maroon hover:text-ink-navy font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                >
                  Our Safety Mandate <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>

          </div>

          {/* Quick Notice Board Footer/Tip */}
          <div className="mt-8 text-center">
            <span className="font-mono text-[10px] text-muted-text uppercase tracking-widest">
              For manual application collection, please contact the administrative counter.
            </span>
          </div>
        </div>
      </section>

      {/* 5. FEATURES SECTION ("Why AMPS") */}
      <section id="why-amps" className="bg-ink-navy text-white py-20 px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-16 border-b border-brass-gold/20 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="font-mono text-xs tracking-widest text-brass-gold uppercase block mb-2">
                Why Choose AMPS
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-white font-bold tracking-tight">
                Our Core Distinctions
              </h2>
            </div>
            <p className="text-gray-300 max-w-md font-sans text-sm md:text-base leading-relaxed">
              We structure our learning timeline to replicate school periods, building high discipline, focus, and a secure pathway for competitive results.
            </p>
          </div>

          {/* Timetable Period Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Period 01 */}
            <div className="border-l-2 border-brass-gold pl-6 py-2 flex flex-col justify-between">
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
              <div className="mt-6 text-[11px] font-mono text-brass-gold uppercase tracking-wider">
                Academic Merit
              </div>
            </div>

            {/* Period 02 */}
            <div className="border-l-2 border-brass-gold pl-6 py-2 flex flex-col justify-between">
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
              <div className="mt-6 text-[11px] font-mono text-brass-gold uppercase tracking-wider">
                Comprehensive Path
              </div>
            </div>

            {/* Period 03 */}
            <div className="border-l-2 border-brass-gold pl-6 py-2 flex flex-col justify-between">
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
              <div className="mt-6 text-[11px] font-mono text-brass-gold uppercase tracking-wider">
                Dual-Language Mastery
              </div>
            </div>

            {/* Period 04 */}
            <div className="border-l-2 border-brass-gold pl-6 py-2 flex flex-col justify-between">
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
              <div className="mt-6 text-[11px] font-mono text-brass-gold uppercase tracking-wider">
                Competitive Ready
              </div>
            </div>

          </div>

          {/* timtable note card */}
          <div className="mt-16 bg-navy-light border border-brass-gold/25 p-6 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex gap-4 items-start">
              <GraduationCap className="w-10 h-10 text-brass-gold shrink-0 mt-1" />
              <div>
                <h4 className="font-serif text-lg font-bold text-white">Stream Selection Advice Available</h4>
                <p className="text-gray-300 text-xs sm:text-sm mt-1">Our administrative block holds individual counselling sessions for stream matching (Science, Commerce, Arts) for high school board options.</p>
              </div>
            </div>
            <a 
              href="#contact" 
              className="bg-brass-gold text-ink-navy hover:bg-brass-gold/90 px-5 py-2.5 rounded-sm font-mono text-xs font-bold uppercase tracking-wider text-center shrink-0"
            >
              Contact Advisory
            </a>
          </div>

        </div>
      </section>

      {/* 6. STATS STRIP */}
      <section className="bg-muted-board/40 border-y border-border-custom py-12 px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-border-custom/80">
            
            {/* Stat 1 */}
            <div className="text-center px-4 flex flex-col items-center justify-center pt-6 md:pt-0">
              <span className="font-serif text-4xl md:text-5xl text-maroon font-bold mb-2">
                21+
              </span>
              <span className="font-mono text-[10px] tracking-widest text-muted-text uppercase text-center max-w-[160px]">
                Years since 2005
              </span>
            </div>

            {/* Stat 2 */}
            <div className="text-center px-4 flex flex-col items-center justify-center pt-6 md:pt-0">
              <span className="font-serif text-4xl md:text-5xl text-maroon font-bold mb-2">
                3
              </span>
              <span className="font-mono text-[10px] tracking-widest text-muted-text uppercase text-center max-w-[160px]">
                Streams offered
              </span>
            </div>

            {/* Stat 3 */}
            <div className="text-center px-4 flex flex-col items-center justify-center pt-6 md:pt-0">
              <span className="font-serif text-4xl md:text-5xl text-maroon font-bold mb-2">
                2
              </span>
              <span className="font-mono text-[10px] tracking-widest text-muted-text uppercase text-center max-w-[160px]">
                Mediums · Eng & Hindi
              </span>
            </div>

            {/* Stat 4 */}
            <div className="text-center px-4 flex flex-col items-center justify-center pt-6 md:pt-0">
              <span className="font-serif text-4xl md:text-5xl text-maroon font-bold mb-2">
                P.G–XII
              </span>
              <span className="font-mono text-[10px] tracking-widest text-muted-text uppercase text-center max-w-[160px]">
                Rajasthan State Board
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* 7. LEADERSHIP SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-mono text-xs tracking-widest text-maroon font-semibold uppercase block mb-2">
            Leadership
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-ink-navy font-bold tracking-tight">
            Guiding the institution
          </h2>
          <p className="text-muted-text mt-3 text-sm md:text-base">
            The experienced pioneers steering Ashish Memorial Public School with academic excellence and scholarly values.
          </p>
        </div>

        {/* 3-column grid of bordered white cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Chairman */}
          <div className="bg-white p-8 border border-border-custom rounded-sm text-center shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative group">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-brass-gold"></div>
            <div>
              <span className="font-mono text-xs text-brass-gold tracking-widest uppercase font-bold block mb-4">
                Chairman
              </span>
              
              {/* Circular portrait with real image or text fallback */}
              <div className="w-24 h-24 mx-auto mb-5 rounded-full border-2 border-brass-gold overflow-hidden bg-ink-navy flex items-center justify-center shadow-md relative group-hover:scale-105 transition-transform duration-300">
                {!chairmanImgError ? (
                  <img 
                    src="/assets/chairman.jpeg" 
                    alt="Chairman Riddhi Chand Jain" 
                    onError={() => setChairmanImgError(true)}
                    className="w-full h-full object-cover animate-fade-in"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="font-serif text-2xl font-bold text-brass-gold">RC</span>
                )}
              </div>

              <h3 className="font-serif text-2xl text-ink-navy font-bold mb-1">
                Riddhi Chand Jain
              </h3>
              <p className="font-serif text-sm text-muted-text italic mb-4">
                (Advocate)
              </p>
              <p className="text-muted-text text-sm leading-relaxed mb-6">
                An esteemed advocate providing strategic oversight and steering the school’s core vision toward robust community integration.
              </p>
            </div>
            <div className="pt-4 border-t border-border-custom/60">
              <a 
                href="tel:9783199992" 
                className="inline-flex items-center gap-2 font-mono text-xs text-ink-navy hover:text-brass-gold font-bold transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> 9783199992
              </a>
            </div>
          </div>

          {/* Card 2: Administrator */}
          <div className="bg-white p-8 border border-border-custom rounded-sm text-center shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative group">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-maroon"></div>
            <div>
              <span className="font-mono text-xs text-maroon tracking-widest uppercase font-bold block mb-4">
                Hon. Administrator
              </span>
              
              {/* Circular portrait with real image or text fallback */}
              <div className="w-24 h-24 mx-auto mb-5 rounded-full border-2 border-maroon overflow-hidden bg-ink-navy flex items-center justify-center shadow-md relative group-hover:scale-105 transition-transform duration-300">
                {!administratorImgError ? (
                  <img 
                    src="/assets/administrator.jpeg" 
                    alt="Administrator Ashok Sharma" 
                    onError={() => setAdministratorImgError(true)}
                    className="w-full h-full object-cover animate-fade-in"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="font-serif text-2xl font-bold text-maroon">AS</span>
                )}
              </div>

              <h3 className="font-serif text-2xl text-ink-navy font-bold mb-1">
                Ashok Sharma
              </h3>
              <p className="font-serif text-sm text-muted-text italic mb-4">
                Management Oversight
              </p>
              <p className="text-muted-text text-sm leading-relaxed mb-6">
                Leading the active operational strategy, campus resources, and safety standard protocols for student well-being.
              </p>
            </div>
            <div className="pt-4 border-t border-border-custom/60">
              <a 
                href="tel:9414400824" 
                className="inline-flex items-center gap-2 font-mono text-xs text-ink-navy hover:text-brass-gold font-bold transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> 9414400824
              </a>
            </div>
          </div>

          {/* Card 3: Principal */}
          <div className="bg-white p-8 border border-border-custom rounded-sm text-center shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative group">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-navy-light"></div>
            <div>
              <span className="font-mono text-xs text-navy-light tracking-widest uppercase font-bold block mb-4">
                Principal
              </span>
              
              {/* Circular portrait with real image or text fallback */}
              <div className="w-24 h-24 mx-auto mb-5 rounded-full border-2 border-navy-light overflow-hidden bg-ink-navy flex items-center justify-center shadow-md relative group-hover:scale-105 transition-transform duration-300">
                {!principalImgError ? (
                  <img 
                    src="/assets/principal-1.jpeg" 
                    alt="Principal Vardhman Jain" 
                    onError={() => setPrincipalImgError(true)}
                    className="w-full h-full object-cover animate-fade-in"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="font-serif text-2xl font-bold text-navy-light">VJ</span>
                )}
              </div>

              <h3 className="font-serif text-2xl text-ink-navy font-bold mb-1">
                Vardhman Jain
              </h3>
              <p className="font-serif text-sm text-muted-text italic mb-4">
                Academic Head
              </p>
              <p className="text-muted-text text-sm leading-relaxed mb-6">
                Supervising rigorous classroom schedules, bilingual curriculum design, and specialized JEE-NEET coaching integration.
              </p>
            </div>
            <div className="pt-4 border-t border-border-custom/60">
              <a 
                href="tel:9413182619" 
                className="inline-flex items-center gap-2 font-mono text-xs text-ink-navy hover:text-brass-gold font-bold transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> 9413182619
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* 8. PHOTO & EVENTS GALLERY SECTION */}
      <section id="gallery" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border-custom bg-ivory-paper w-full">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-mono text-xs tracking-widest text-maroon font-semibold uppercase block mb-2">
              Media & Press
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-ink-navy font-bold tracking-tight">
              School Events & News Coverage
            </h2>
            <p className="text-muted-text mt-3 text-sm md:text-base leading-relaxed">
              Explore media prints, regional news coverage, and official achievements of AMPS in leading Hindi newspapers alongside academic highlights.
            </p>
            <div className="w-12 h-1 bg-brass-gold mx-auto mt-4"></div>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {[
              { id: "all", label: "All Photos" },
              { id: "awards", label: "Award Ceremonies" },
              { id: "sports", label: "Sports & Fitness" },
              { id: "cultural", label: "Cultural Events" },
              { id: "science", label: "Science & Labs" },
              { id: "news", label: "News Coverage" }
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setGalleryFilter(pill.id)}
                className={`px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider rounded-full border transition-all ${
                  galleryFilter === pill.id
                    ? "bg-ink-navy text-white border-ink-navy shadow-sm"
                    : "bg-white text-muted-text border-border-custom hover:text-ink-navy hover:border-ink-navy"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Gallery Photo Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {displayedGalleryItems
                .map((item) => {
                  const isImgError = galleryImgErrors[item.id];
                  const imgSrc = isImgError ? item.fallbackSrc : item.localSrc;
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{ duration: 0.3 }}
                      key={item.id}
                      className="group bg-white rounded-sm border border-border-custom overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
                      onClick={() => setSelectedGalleryImg(item)}
                    >
                      {/* Photo Container */}
                      <div className="relative overflow-hidden aspect-[4/3] bg-muted-board">
                        <img
                          src={imgSrc}
                          alt={item.title}
                          onError={() => setGalleryImgErrors(prev => ({ ...prev, [item.id]: true }))}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Hover Overlay Icon */}
                        <div className="absolute inset-0 bg-ink-navy/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-white/90 text-ink-navy flex items-center justify-center shadow-md transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            <ZoomIn className="w-5 h-5" />
                          </div>
                        </div>

                        {/* Category Tag pill overlay */}
                        <div className="absolute top-3 left-3 bg-white/95 px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest font-semibold border border-border-custom rounded-sm text-maroon shadow-sm">
                          {item.category === "awards" ? "Award Meet" : 
                           item.category === "sports" ? "Athletics" : 
                           item.category === "cultural" ? "Cultural" : 
                           item.category === "science" ? "Science" : "News Coverage"}
                        </div>
                      </div>

                      {/* Info Panel */}
                      <div className="p-5 border-t border-border-custom/50">
                        <h3 className="font-serif text-lg text-ink-navy font-bold leading-tight group-hover:text-maroon transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-muted-text text-xs font-sans mt-1 leading-relaxed">
                          {item.subtitle}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {displayedGalleryItems.length === 0 && (
            <div className="text-center py-16 bg-white border border-border-custom rounded-sm">
              <span className="font-serif text-muted-text italic text-base">No photos found in this category yet.</span>
            </div>
          )}

          {/* Hint instruction block for user */}
          <div className="mt-12 bg-white/80 border border-border-custom p-5 rounded-sm max-w-2xl mx-auto flex items-start gap-4 shadow-sm">
            <Sparkles className="w-5 h-5 text-brass-gold shrink-0 mt-0.5" />
            <div>
              <h4 className="font-serif text-sm font-bold text-ink-navy">Add Your Own Photos Easily</h4>
              <p className="text-muted-text text-xs mt-1 leading-relaxed">
                You can personalize this gallery by uploading your own images into the explorer! Name them <code className="font-mono font-bold text-maroon bg-muted-board px-1 rounded">award-1.jpg</code>, <code className="font-mono font-bold text-maroon bg-muted-board px-1 rounded">sports-1.jpg</code>, <code className="font-mono font-bold text-maroon bg-muted-board px-1 rounded">cultural-1.jpg</code>, or <code className="font-mono font-bold text-maroon bg-muted-board px-1 rounded">science-1.jpg</code>, and they will automatically display here in full high-resolution!
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Lightbox Modal / Popup */}
      <AnimatePresence>
        {selectedGalleryImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedGalleryImg(null)}
          >
            <button
              onClick={() => setSelectedGalleryImg(null)}
              className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors z-50"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Lightbox Container */}
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative max-w-4xl w-full bg-ink-navy border border-white/10 rounded-sm overflow-hidden shadow-2xl flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside content
            >
              
              {/* Image Column */}
              <div className="relative flex-1 bg-black flex items-center justify-center aspect-[4/3] md:aspect-auto">
                <img
                  src={galleryImgErrors[selectedGalleryImg.id] ? selectedGalleryImg.fallbackSrc : selectedGalleryImg.localSrc}
                  alt={selectedGalleryImg.title}
                  className="max-h-[70vh] md:max-h-[80vh] w-full object-contain"
                />

                {/* Left navigation arrow */}
                <button
                  onClick={() => navigateLightbox("prev")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/80 w-10 h-10 rounded-full flex items-center justify-center transition-colors border border-white/10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Right navigation arrow */}
                <button
                  onClick={() => navigateLightbox("next")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/80 w-10 h-10 rounded-full flex items-center justify-center transition-colors border border-white/10"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Text Information Column */}
              <div className="p-6 md:w-80 shrink-0 bg-ink-navy border-t md:border-t-0 md:border-l border-white/10 flex flex-col justify-between text-white">
                <div>
                  <span className="font-mono text-[10px] tracking-widest text-brass-gold uppercase block mb-2 font-bold">
                    {selectedGalleryImg.category === "awards" ? "Award Meet" : 
                     selectedGalleryImg.category === "sports" ? "Athletics" : 
                     selectedGalleryImg.category === "cultural" ? "Cultural Event" : 
                     selectedGalleryImg.category === "science" ? "Science & Lab" : "News Coverage"}
                  </span>
                  <h3 className="font-serif text-xl font-bold leading-tight tracking-tight text-white mb-3">
                    {selectedGalleryImg.title}
                  </h3>
                  <p className="text-gray-300 text-xs leading-relaxed font-sans">
                    {selectedGalleryImg.subtitle}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between font-mono text-[9px] text-white/40">
                  <span>AMPS HINDAUN CITY</span>
                  <span>EST. 2005</span>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 9. ABOUT SECTION */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border-custom bg-white w-full">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column (Academic Group Photo/Image) */}
            <div className="lg:col-span-5 order-last lg:order-first">
              <div className="relative bg-white p-4 border border-border-custom rounded-sm shadow-md">
                {/* Secondary frame accent */}
                <div className="absolute inset-2 border border-border-custom pointer-events-none"></div>
                <div className="aspect-[4/3] w-full bg-muted-board rounded-sm overflow-hidden relative">
                  <img 
                    src={img2Error ? "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1000&h=750" : "/assets/school-building-1.jpg"} 
                    alt="Ashish Memorial School Campus & Activities" 
                    onError={() => setImg2Error(true)}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-3 right-3 bg-white/95 px-3 py-1 text-[10px] font-mono uppercase tracking-widest font-semibold border border-border-custom text-ink-navy">
                    Established 2005
                  </div>
                </div>
                <p className="text-center font-serif text-xs italic text-muted-text mt-3">
                  The primary academic block and front facade of AMPS Hindaun City.
                </p>
              </div>
            </div>

            {/* Right Column (Text details) */}
            <div className="lg:col-span-7 flex flex-col space-y-6">
              
              <div>
                <span className="font-mono text-xs tracking-widest text-brass-gold uppercase block mb-2 font-semibold">
                  About Our Institution
                </span>
                <h2 className="font-serif text-3xl md:text-4xl text-ink-navy font-bold leading-tight tracking-tight">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
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

            </div>

          </div>
        </div>
      </section>

      {/* 9.5. VISION & MISSION SECTION */}
      <section id="vision-mission" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border-custom bg-ivory-paper w-full">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-mono text-xs tracking-widest text-brass-gold font-semibold uppercase block mb-2">
              Our Foundations
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-ink-navy font-bold tracking-tight">
              Vision, Mission & Values
            </h2>
            <p className="font-serif text-sm text-muted-text italic mt-2">
              हमारा दृष्टिकोण और उद्देश्य - शिक्षित, संस्कारित और सशक्त राष्ट्र निर्माण
            </p>
            <div className="w-16 h-1 bg-brass-gold mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column (Original Principal Image & Inspirational Quote) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative bg-white p-4 border border-border-custom rounded-sm shadow-md w-full max-w-md">
                {/* Secondary frame accent */}
                <div className="absolute inset-2 border border-border-custom pointer-events-none"></div>
                <div className="aspect-[4/5] w-full bg-muted-board rounded-sm overflow-hidden relative">
                  {!originalPrincipalImgError ? (
                    <img 
                      src="/assets/principal.jpeg" 
                      alt="Ashish Memorial Public School Inspirational Leadership" 
                      onError={() => setOriginalPrincipalImgError(true)}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-ink-navy text-brass-gold p-6 text-center">
                      <span className="font-serif text-4xl font-bold mb-2">AMPS</span>
                      <span className="font-mono text-xs uppercase tracking-widest text-white">Estd. 2005</span>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-ink-navy/90 text-white border border-brass-gold/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest font-semibold">
                    Inspiring Minds
                  </div>
                </div>
                
                {/* Overlay Quote */}
                <div className="mt-5 text-center relative px-2">
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
            </div>

            {/* Right Column (Vision, Mission & Core Pillars Cards) */}
            <div className="lg:col-span-7 flex flex-col space-y-8">
              
              {/* Vision Card */}
              <div className="bg-white p-6 sm:p-8 border border-border-custom rounded-sm shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 left-0 h-full w-1.5 bg-brass-gold"></div>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-brass-gold/10 flex items-center justify-center text-brass-gold shrink-0 mt-1">
                    <span className="font-serif text-lg font-bold">V</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-ink-navy mb-2 flex items-center gap-2">
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
              <div className="bg-white p-6 sm:p-8 border border-border-custom rounded-sm shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 left-0 h-full w-1.5 bg-maroon"></div>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-maroon/10 flex items-center justify-center text-maroon shrink-0 mt-1">
                    <span className="font-serif text-lg font-bold">M</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-ink-navy mb-2 flex items-center gap-2">
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
                  <div className="bg-white/80 p-4 border border-border-custom rounded-sm text-center">
                    <div className="w-8 h-8 rounded-full bg-ink-navy/5 flex items-center justify-center text-ink-navy mx-auto mb-2 font-mono text-xs font-bold">01</div>
                    <h5 className="font-serif text-sm font-bold text-ink-navy">Academic Rigor</h5>
                    <p className="text-muted-text text-[11px] mt-1">Proven state merit list results and IIT/NEET foundation.</p>
                  </div>
                  <div className="bg-white/80 p-4 border border-border-custom rounded-sm text-center">
                    <div className="w-8 h-8 rounded-full bg-ink-navy/5 flex items-center justify-center text-ink-navy mx-auto mb-2 font-mono text-xs font-bold">02</div>
                    <h5 className="font-serif text-sm font-bold text-ink-navy">Moral Ethics</h5>
                    <p className="text-muted-text text-[11px] mt-1">Nurturing honesty, deep-rooted discipline, and mutual respect.</p>
                  </div>
                  <div className="bg-white/80 p-4 border border-border-custom rounded-sm text-center">
                    <div className="w-8 h-8 rounded-full bg-ink-navy/5 flex items-center justify-center text-ink-navy mx-auto mb-2 font-mono text-xs font-bold">03</div>
                    <h5 className="font-serif text-sm font-bold text-ink-navy">Holistic Care</h5>
                    <p className="text-muted-text text-[11px] mt-1">CCTV protection, girls' safety, and active athletics.</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 10. CONTACT SECTION */}
      <section id="contact" className="py-20 bg-muted-board px-4 sm:px-6 lg:px-8 w-full border-t border-border-custom">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-mono text-xs tracking-widest text-maroon font-semibold uppercase block mb-2">
              Get in Touch
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-ink-navy font-bold tracking-tight">
              Visit or reach out
            </h2>
            <div className="w-16 h-1 bg-brass-gold mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            
            {/* Left: Contact Info Columns */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Column 1: Address */}
              <div className="flex flex-col space-y-4">
                <div className="w-12 h-12 bg-white rounded-sm border border-border-custom flex items-center justify-center text-maroon shadow-sm">
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
              <div className="flex flex-col space-y-4">
                <div className="w-12 h-12 bg-white rounded-sm border border-border-custom flex items-center justify-center text-maroon shadow-sm">
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
              <div className="flex flex-col space-y-4">
                <div className="w-12 h-12 bg-white rounded-sm border border-border-custom flex items-center justify-center text-maroon shadow-sm">
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
            <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-sm border border-border-custom shadow-sm relative">
              <span className="font-mono text-[10px] text-maroon uppercase tracking-widest font-bold block mb-1">
                Instant Advisory Desk
              </span>
              <h3 className="font-serif text-xl text-ink-navy font-bold mb-4">
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
                      <p className="text-[11px] leading-relaxed text-slate-700 mb-3">
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
                      <p className="font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                        📧 Email Delivery Status
                      </p>

                      {(dispatchStatus === "Needs Activation" || dispatchStatus === "Pending") && (
                        <div className="bg-amber-50 border border-amber-200 p-3 rounded text-amber-950 space-y-2 mb-3">
                          <p className="font-bold text-xs flex items-center gap-1">
                            ⚠️ ACTION REQUIRED: Pehli Mail Active Karein!
                          </p>
                          <p className="text-[11px] leading-relaxed">
                            <strong>Hindi (हिंदी):</strong> Humne aapke email <span className="underline font-bold">jainakshat6878@gmail.com</span> par ek activation link bheja hai. Apne Gmail me <strong>All Mail, Spam, Updates, or Promotions</strong> check karein, "FormSubmit" search karein aur <strong className="text-rose-600 font-bold">"Activate Form"</strong> par click karein. Uske baad saari mail aana chalu ho jayengi!
                          </p>
                          <div className="border-t border-amber-200 my-1"></div>
                          <p className="text-[11px] leading-relaxed">
                            <strong>English:</strong> FormSubmit has sent a verification mail to <span className="underline font-bold">jainakshat6878@gmail.com</span>. Please check your inbox/spam folder and click <strong>"Activate Form"</strong> to start receiving inquiries.
                          </p>
                        </div>
                      )}

                      <div className="space-y-1.5 text-[11px]">
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
                        <p className="text-[10px] text-slate-500 leading-normal mt-2">
                          👉 If you aren't receiving verification emails, please check your **Admin Dashboard (link in footer)** to configure your free Web3Forms Access Key for 100% inbox delivery.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setInquirySubmitted(false)}
                    className="mt-5 font-mono text-[10px] uppercase tracking-wider text-slate-600 hover:text-slate-900 hover:underline block mx-auto font-bold text-center"
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
                  <button 
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
                  </button>
                  <p className="text-[10px] text-muted-text text-center italic mt-2">
                    Inquiry will be saved securely and dispatched to the administrator instantly.
                  </p>
                </form>
              )}
            </div>

          </div>

          {/* Maps / Static Route Advice */}
          <div className="mt-16 bg-white p-4 border border-border-custom rounded-sm shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex gap-3 items-center">
                <MapPin className="w-5 h-5 text-brass-gold shrink-0" />
                <div>
                  <h4 className="font-serif text-sm font-bold text-ink-navy">Location Reference</h4>
                  <p className="text-muted-text text-xs mt-0.5">Located behind Patthar Walo Ki Dharamshala, New Jyoti Nagar, Hindaun City, Karauli district. Easy bus and auto connectivity.</p>
                </div>
              </div>
              <span className="font-mono text-[10px] text-muted-text uppercase tracking-widest bg-muted-board px-3 py-1.5 border border-border-custom rounded-sm">
                Coordinates: Behind Patthar Walo Ki Dharamshala, New Jyoti Nagar
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 10. FOOTER SECTION */}
      <footer className="bg-ink-navy border-t border-brass-gold/25 py-12 px-4 sm:px-6 lg:px-8 w-full mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Logo & Info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-brass-gold overflow-hidden bg-white flex items-center justify-center shrink-0">
              {logoError ? (
                <SchoolLogo className="w-full h-full" />
              ) : (
                <img 
                  src="/assets/logo.png" 
                  alt="AMPS Crest Small" 
                  onError={() => setLogoError(true)}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-sm text-white font-bold leading-none">
                Ashish Memorial Public Senior Secondary School
              </span>
              <span className="font-mono text-[9px] text-brass-gold uppercase tracking-wider mt-1.5">
                Hindaun City (Karauli) · Estd. 2005
              </span>
            </div>
          </div>

          {/* Quick links to sections */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono text-white/70 justify-center">
            <a href="#navbar" className="hover:text-brass-gold transition-colors">TOP</a>
            <span>·</span>
            <a href="#notices" className="hover:text-brass-gold transition-colors">NOTICES</a>
            <span>·</span>
            <a href="#why-amps" className="hover:text-brass-gold transition-colors">ACADEMICS</a>
            <span>·</span>
            <a href="#about" className="hover:text-brass-gold transition-colors">ABOUT</a>
            <span>·</span>
            <a href="#contact" className="hover:text-brass-gold transition-colors">CONTACT</a>
            <span>·</span>
            <button 
              onClick={() => {
                setShowAdminPanel(true);
                setAdminErrorMsg("");
                setAdminSuccessMsg("");
              }}
              className="hover:text-brass-gold transition-colors cursor-pointer text-xs font-mono text-white/70 bg-transparent border-none p-0 outline-none"
            >
              ADMIN PANEL 🔑
            </button>
          </div>

          {/* Copyright Text */}
          <div className="text-center md:text-right">
            <p className="font-mono text-[10px] text-white/50 tracking-wide">
              © 2026 Ashish Memorial Public Senior Secondary School. All Rights Reserved.
            </p>
            <p className="font-mono text-[9px] text-brass-gold/50 tracking-wider mt-0.5">
              Approved by Rajasthan State Board of Secondary Education
            </p>
          </div>

        </div>
      </footer>

      {/* 11. ADMIN DASHBOARD MODAL */}
      {showAdminPanel && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-sm w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col text-slate-800 font-sans">
            
            {/* Header */}
            <div className="bg-ink-navy text-white px-6 py-4 flex justify-between items-center border-b border-brass-gold/30">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔑</span>
                <div>
                  <h3 className="font-serif text-base font-bold tracking-tight text-white">AMPS Administration Portal</h3>
                  <p className="font-mono text-[9px] text-brass-gold uppercase tracking-wider">Inquiry Database & Delivery Management</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowAdminPanel(false);
                  setIsAdminAuthenticated(false);
                  setAdminPasswordInput("");
                }}
                className="text-white/60 hover:text-white font-mono text-lg font-bold p-1 hover:bg-white/10 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content Section */}
            {!isAdminAuthenticated ? (
              // Login Screen
              <div className="p-8 max-w-md mx-auto my-12 text-center space-y-4">
                <span className="text-4xl block">🛡️</span>
                <h4 className="font-serif text-lg font-bold text-slate-900">Protected Administrator Area</h4>
                <p className="text-xs text-slate-500 leading-normal">
                  Please enter the system administrator security key to access the prospective admission inquiry database and configure delivery engines.
                </p>
                
                <div className="space-y-2">
                  <input 
                    type="password"
                    placeholder="Enter Security Password (default: ampsadmin)"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                    className="w-full border border-slate-300 p-2.5 rounded text-center text-sm focus:outline-none focus:border-brass-gold font-mono"
                  />
                  {adminErrorMsg && (
                    <p className="text-xs text-rose-600 font-semibold">{adminErrorMsg}</p>
                  )}
                  <button 
                    onClick={handleAdminLogin}
                    className="w-full bg-ink-navy hover:bg-navy-light text-white font-mono text-xs font-bold uppercase tracking-wider py-3 rounded transition-colors cursor-pointer"
                  >
                    Authenticate Console
                  </button>
                </div>
              </div>
            ) : (
              // Main Dashboard
              <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-[400px]">
                
                {/* Sidebar Navigation */}
                <div className="w-full md:w-56 bg-slate-50 border-r border-slate-100 p-4 space-y-2 flex flex-row md:flex-col shrink-0 gap-2 md:gap-0">
                  <button 
                    onClick={() => { setAdminActiveTab("inquiries"); setAdminErrorMsg(""); setAdminSuccessMsg(""); refreshInquiries(); }}
                    className={`w-full text-left px-4 py-2.5 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer ${adminActiveTab === "inquiries" ? "bg-ink-navy text-white" : "text-slate-600 hover:bg-slate-200"}`}
                  >
                    📋 Inquiries Log ({adminInquiries.length})
                  </button>
                  <button 
                    onClick={() => { setAdminActiveTab("settings"); setAdminErrorMsg(""); setAdminSuccessMsg(""); }}
                    className={`w-full text-left px-4 py-2.5 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer ${adminActiveTab === "settings" ? "bg-ink-navy text-white" : "text-slate-600 hover:bg-slate-200"}`}
                  >
                    ⚙️ Delivery Engines
                  </button>
                </div>

                {/* Tab Workspace */}
                <div className="flex-1 p-6 overflow-y-auto max-h-[60vh] text-slate-700">
                  {adminSuccessMsg && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded text-xs font-semibold mb-4">
                      ✓ {adminSuccessMsg}
                    </div>
                  )}
                  {adminErrorMsg && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded text-xs font-semibold mb-4">
                      ⚠️ {adminErrorMsg}
                    </div>
                  )}

                  {adminActiveTab === "inquiries" ? (
                    // INQUIRIES TAB
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-serif font-bold text-slate-900 text-base">Prospective Leads Database</h4>
                          <p className="text-[11px] text-slate-500">Real-time backup of all inquiries submitted through school forms.</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={async () => {
                              try {
                                const response = await fetch("/api/admin/inquiries", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ password: adminPasswordInput })
                                });
                                const data = await response.json();
                                if (response.ok && data.success) {
                                  setAdminInquiries(data.inquiries);
                                  setAdminSuccessMsg("Data reloaded from cloud filesystem.");
                                }
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-mono text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded cursor-pointer"
                          >
                            🔄 Refresh
                          </button>
                          <button 
                            onClick={handleClearAllInquiries}
                            className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-mono text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded cursor-pointer"
                          >
                            🗑️ Wipe Logs
                          </button>
                        </div>
                      </div>

                      {adminInquiries.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded">
                          <span className="text-3xl block mb-2">📋</span>
                          <p className="text-xs text-slate-500 font-mono uppercase">No Inquiries Found</p>
                          <p className="text-[11px] text-slate-400 mt-1">Submitted leads will appear here instantly even if Gmail blocks SMTP.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {adminInquiries.map((inq: any) => (
                            <div key={inq.id} className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-300 transition-colors">
                              <div className="space-y-1 max-w-xl">
                                <div className="flex items-center gap-2.5">
                                  <span className="font-serif font-bold text-slate-900">{inq.name}</span>
                                  <span className="font-mono text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 border border-indigo-100 rounded font-bold">
                                    📞 {inq.phone}
                                  </span>
                                  <span className={`font-mono text-[9px] px-2 py-0.5 rounded border ${inq.dispatchStatus === "Delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>
                                    📧 {inq.dispatchStatus}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 bg-slate-50/50 p-2 border-l-2 border-slate-300 rounded font-sans leading-relaxed">
                                  {inq.message}
                                </p>
                                <div className="flex flex-wrap gap-4 font-mono text-[9px] text-slate-400 mt-1.5">
                                  <span>📅 Submitted: {new Date(inq.timestamp).toLocaleString("en-IN")}</span>
                                  <span>📡 Channel: {inq.dispatchedVia}</span>
                                  {inq.dispatchError && <span className="text-rose-500">❌ Error: {inq.dispatchError}</span>}
                                </div>
                              </div>
                              <div className="shrink-0 flex gap-2 w-full md:w-auto justify-end">
                                <a 
                                  href={`tel:${inq.phone}`}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-sm cursor-pointer"
                                >
                                  Call
                                </a>
                                <a 
                                  href={`https://api.whatsapp.com/send?phone=91${inq.phone.replace(/[^0-9]/g, "")}&text=` + encodeURIComponent(`Hello ${inq.name}, we received your admission inquiry for Al-Momin Public School...`)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-sm cursor-pointer"
                                >
                                  WhatsApp
                                </a>
                                <button 
                                  onClick={() => handleDeleteInquiry(inq.id)}
                                  className="bg-slate-100 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 text-slate-500 font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-2 rounded-sm cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    // SETTINGS TAB
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-serif font-bold text-slate-900 text-base">Configure Delivery Engines</h4>
                        <p className="text-[11px] text-slate-500">Control how inquiry emails are routed and bypass blocked SMTP network environments.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {/* Column 1: Core Parameters */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-mono text-slate-600 uppercase tracking-wider mb-1">
                              Email Delivery Channel
                            </label>
                            <select 
                              value={adminSettings.emailProvider}
                              onChange={(e) => setAdminSettings({ ...adminSettings, emailProvider: e.target.value })}
                              className="w-full border border-slate-300 p-2 rounded text-sm bg-white"
                            >
                              <option value="web3forms">Web3Forms Secure API (Recommended - 100% Inbox Delivery)</option>
                              <option value="formsubmit">FormSubmit Tunnel</option>
                              <option value="smtp">Nodemailer SMTP Relay (Ports might be blocked)</option>
                            </select>
                            <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                              Web3Forms routes messages over HTTPS Web API, fully bypassing GCP Cloud Run port restrictions!
                            </p>
                          </div>

                          <div>
                            <label className="block text-xs font-mono text-slate-600 uppercase tracking-wider mb-1">
                              Web3Forms Access Key (Get Free Key)
                            </label>
                            <input 
                              type="text" 
                              placeholder="Paste Web3Forms Key here..."
                              value={adminSettings.web3formsKey || ""}
                              onChange={(e) => setAdminSettings({ ...adminSettings, web3formsKey: e.target.value })}
                              className="w-full border border-slate-300 p-2 rounded text-sm font-mono"
                            />
                            <p className="text-[10px] text-slate-500 mt-1 leading-normal bg-amber-50 p-2 border border-amber-100 rounded">
                              💡 <strong>How to get free key in 5 seconds:</strong> Visit <a href="https://web3forms.com/#start" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold underline">web3forms.com</a>, enter your email <strong>{adminSettings.inquiryRecipient || "jainakshat6878@gmail.com"}</strong>, and they will email you an Access Key instantly. Paste that key above for 100% reliable inbox delivery!
                            </p>
                          </div>

                          <div>
                            <label className="block text-xs font-mono text-slate-600 uppercase tracking-wider mb-1">
                              Recipient Notification Inbox
                            </label>
                            <input 
                              type="email" 
                              value={adminSettings.inquiryRecipient || ""}
                              onChange={(e) => setAdminSettings({ ...adminSettings, inquiryRecipient: e.target.value })}
                              className="w-full border border-slate-300 p-2 rounded text-sm font-mono"
                            />
                          </div>
                        </div>

                        {/* Column 2: Advanced Parameters */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-mono text-slate-600 uppercase tracking-wider mb-1">
                              School WhatsApp Phone (For Mobile Redirection)
                            </label>
                            <input 
                              type="text" 
                              placeholder="e.g. 919829012345"
                              value={adminSettings.whatsappPhone || ""}
                              onChange={(e) => setAdminSettings({ ...adminSettings, whatsappPhone: e.target.value })}
                              className="w-full border border-slate-300 p-2 rounded text-sm font-mono"
                            />
                            <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                              The WhatsApp phone number (with country code, no "+" or spaces) where prospective parent leads are directed on mobile submission.
                            </p>
                          </div>

                          <div>
                            <label className="block text-xs font-mono text-slate-600 uppercase tracking-wider mb-1">
                              Change Admin Security Key (Password)
                            </label>
                            <input 
                              type="text" 
                              value={adminSettings.adminPassword || ""}
                              onChange={(e) => setAdminSettings({ ...adminSettings, adminPassword: e.target.value })}
                              className="w-full border border-slate-300 p-2 rounded text-sm font-mono"
                            />
                          </div>

                          {adminSettings.emailProvider === "smtp" && (
                            <div className="bg-slate-50 p-3 border border-slate-200 rounded-sm space-y-2">
                              <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500 font-bold">SMTP Relay Configuration</p>
                              <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-2">
                                  <input type="text" placeholder="Host (smtp.gmail.com)" value={adminSettings.smtpHost || ""} onChange={(e) => setAdminSettings({ ...adminSettings, smtpHost: e.target.value })} className="w-full border border-slate-300 p-1.5 rounded text-xs font-mono" />
                                </div>
                                <div>
                                  <input type="text" placeholder="Port (465)" value={adminSettings.smtpPort || "465"} onChange={(e) => setAdminSettings({ ...adminSettings, smtpPort: e.target.value })} className="w-full border border-slate-300 p-1.5 rounded text-xs font-mono" />
                                </div>
                              </div>
                              <input type="text" placeholder="User (email@domain.com)" value={adminSettings.smtpUser || ""} onChange={(e) => setAdminSettings({ ...adminSettings, smtpUser: e.target.value })} className="w-full border border-slate-300 p-1.5 rounded text-xs font-mono" />
                              <input type="password" placeholder="Pass (Gmail App Password)" value={adminSettings.smtpPass || ""} onChange={(e) => setAdminSettings({ ...adminSettings, smtpPass: e.target.value })} className="w-full border border-slate-300 p-1.5 rounded text-xs font-mono" />
                            </div>
                          )}
                        </div>

                      </div>

                      <div className="border-t border-slate-100 pt-4 flex justify-end gap-3">
                        <button 
                          onClick={handleSaveSettings}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded transition-colors cursor-pointer"
                        >
                          Save Settings
                        </button>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            )}

            {/* Footer */}
            <div className="bg-slate-100 px-6 py-3 flex justify-between items-center text-[10px] text-slate-500 font-mono border-t border-slate-200 shrink-0">
              <span>Database Version: SQLite / JSON Store v2.1</span>
              <span>Logged In: {isAdminAuthenticated ? "TRUE" : "FALSE"}</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
