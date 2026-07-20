import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";

export const galleryItems = [
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
  },
  {
    id: "top-1",
    title: "Board Merit Position Topper",
    subtitle: "Celebrating our outstanding student securing a top district rank in the Rajasthan Board senior secondary examinations.",
    category: "milestones",
    localSrc: "/assets/top-1.jpeg",
    fallbackSrc: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800&h=600"
  },
  {
    id: "top-2",
    title: "State Board Rank Achievers",
    subtitle: "Honoring our high-scoring scholars who achieved remarkable percentages in the annual board examinations.",
    category: "milestones",
    localSrc: "/assets/top-2.jpeg",
    fallbackSrc: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=800&h=600"
  },
  {
    id: "top-3",
    title: "NEET 2025 Exam Achievers",
    subtitle: "Proudly celebrating our future medical professionals who qualified the NEET 2025 exam with exceptional marks and top All India Ranks (AIR).",
    category: "milestones",
    localSrc: "/assets/top-3.jpeg",
    fallbackSrc: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800&h=600"
  },
  {
    id: "top-4",
    title: "JEE Advanced 2025 Toppers",
    subtitle: "Celebrating the outstanding success of our engineering aspirants qualifying the prestigious JEE Advanced 2025 exam with top national ranks.",
    category: "milestones",
    localSrc: "/assets/top-4.jpeg",
    fallbackSrc: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800&h=600"
  },
  {
    id: "cultural-6",
    title: "Fancy Dress Competition",
    subtitle: "Our kindergarten and primary block students showcasing creative costumes representing national leaders, professionals, and social themes.",
    category: "cultural",
    localSrc: "/assets/cultural-6.jpeg",
    fallbackSrc: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800&h=600"
  },
  {
    id: "cultural-7",
    title: "Independence Day Festivities",
    subtitle: "Patriotic programs, group choir songs, and flag hoisting celebrations led by school students and faculty.",
    category: "cultural",
    localSrc: "/assets/cultural-7.jpeg",
    fallbackSrc: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800&h=600"
  },
  {
    id: "cultural-8",
    title: "Annual Drama and Stage Play",
    subtitle: "Our talented students enacting a meaningful theatrical play on social values during the school's annual day.",
    category: "cultural",
    localSrc: "/assets/cultural-8.jpeg",
    fallbackSrc: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=800&h=600"
  },
  {
    id: "cultural-9",
    title: "Guru Vandan Chhatra Abhinandan",
    subtitle: "A prestigious felicitation program organized by Bharat Vikas Parishad to honor our dedicated educators and student achievers.",
    category: "cultural",
    localSrc: "/assets/cultural-9.jpeg",
    fallbackSrc: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800&h=600"
  },
  {
    id: "news-4",
    title: "Rajasthan Patrika Merit Feature",
    subtitle: "Press clipping from Rajasthan Patrika celebrating AMPS students who secured outstanding positions in state board examinations.",
    category: "news",
    localSrc: "/assets/news-4.jpeg",
    fallbackSrc: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800&h=600"
  },
  {
    id: "news-5",
    title: "Academic Milestone Announcement",
    subtitle: "Local Hindi media covering the exceptional success rate and toppers list of AMPS, establishing school leadership.",
    category: "news",
    localSrc: "/assets/news-5.jpeg",
    fallbackSrc: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800&h=600"
  },
  {
    id: "news-6",
    title: "District Science Fair Victory Feature",
    subtitle: "Press clipping celebrating the triumph of our 6 students in the district-level science fair, including projects on Waste Management (Ayush Jain, Class 9), Models for Disabled Children (Gagan Gupta), and Mathematical Models (Poorvi Jindal).",
    category: "news",
    localSrc: "/assets/news-6.jpeg",
    fallbackSrc: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800&h=600"
  },
  {
    id: "top-5",
    title: "Board Merit Distinction Ranker",
    subtitle: "Celebrating our top achiever who scored high honors and distinctions in the board examinations.",
    category: "milestones",
    localSrc: "/assets/top-5.jpeg",
    fallbackSrc: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800&h=600"
  },
  {
    id: "neet-achiever",
    title: "NEET Exam Success Achievers",
    subtitle: "Celebrating the outstanding results of our students in the National Eligibility cum Entrance Test (NEET) 2026.\n\n🏆 NEET ACHIEVER:\n• Piyush Bansal — All India Rank (AIR) 617\n\n📚 PREPARATION CURRICULUM:\n• Qualified with exceptional scores through our integrated school-level foundation course.\n• In-house coaching curriculum including separate evaluation tests and study modules.\n• 100% doubt resolution squads to ensure medical exam readiness without requiring separate external tuition.",
    category: "milestones",
    localSrc: "/assets/neet.jpeg",
    fallbackSrc: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800&h=600"
  },
  {
    id: "science-4",
    title: "Innovative Science Exhibition Stalls",
    subtitle: "Students displaying custom built physics and mechanical projects at their exhibition booths.",
    category: "science",
    localSrc: "/assets/science-fair-4.jpg.jpeg",
    fallbackSrc: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800&h=600"
  },
  {
    id: "science-5",
    title: "Electronics & Robotics Demonstrations",
    subtitle: "A group of students showcasing smart sensor projects and circuit board integrations.",
    category: "science",
    localSrc: "/assets/science-fair-5.jpg.jpeg",
    fallbackSrc: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800&h=600"
  },
  {
    id: "science-6",
    title: "Interactive Working Science Models",
    subtitle: "Exhibitors explaining the mechanical workings and scientific concepts behind their projects to visitors.",
    category: "science",
    localSrc: "/assets/science-fair-6.jpg.jpeg",
    fallbackSrc: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800&h=600"
  },
  {
    id: "science-7",
    title: "Science Exhibition Welcome & Presentation",
    subtitle: "Our students welcoming guests at the front welcome counter with experimental modules ready for evaluation.",
    category: "science",
    localSrc: "/assets/science-fair-7.jpg.jpeg",
    fallbackSrc: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=800&h=600"
  },
  {
    id: "science-8",
    title: "Smart City & Infrastructure Working Model",
    subtitle: "A team of students presenting their green city model featuring smart road grids, solar arrays, and sustainable urban infrastructure.",
    category: "science",
    localSrc: "/assets/science-fair-8.jpg.jpeg",
    fallbackSrc: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800&h=600"
  }
];

interface GalleryProps {
  isMediaModalOpen: boolean;
  setIsMediaModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedGalleryImg: any;
  setSelectedGalleryImg: React.Dispatch<React.SetStateAction<any>>;
}

export default function Gallery({
  isMediaModalOpen,
  setIsMediaModalOpen,
  selectedGalleryImg,
  setSelectedGalleryImg
}: GalleryProps) {
  const [galleryFilter, setGalleryFilter] = useState("all");
  const [galleryImgErrors, setGalleryImgErrors] = useState<Record<string, boolean>>({});

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
    <>
      {/* PHOTO & EVENTS GALLERY MODAL */}
      <AnimatePresence>
        {isMediaModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 md:p-8"
          >
            {/* Click outside to close */}
            <div
              className="absolute inset-0 cursor-default"
              onClick={() => setIsMediaModalOpen(false)}
            />

            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="bg-ivory-paper border-2 border-brass-gold/25 max-w-7xl w-full rounded-md shadow-2xl relative z-10 max-h-[85vh] overflow-hidden flex flex-col text-slate-800"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 md:px-8 md:py-5 border-b border-border-custom bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] tracking-widest text-maroon font-bold uppercase border border-maroon/20 px-2 py-0.5 rounded-sm">
                    Media & Press
                  </span>
                  <h2 className="font-serif text-lg md:text-xl text-ink-navy font-bold tracking-tight hidden sm:block">
                    School Events & News Coverage
                  </h2>
                </div>
                <button
                  onClick={() => setIsMediaModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-black/5 text-ink-navy/70 hover:text-ink-navy transition-colors outline-none cursor-pointer"
                  aria-label="Close Media Gallery"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body - Scrollable content */}
              <div className="overflow-y-auto p-6 md:p-8 flex-1">
                {/* Descriptive subheader inside body for context */}
                <div className="text-center max-w-2xl mx-auto mb-8">
                  <h3 className="font-serif text-2xl text-ink-navy font-bold tracking-tight sm:hidden mb-2">
                    School Events & News Coverage
                  </h3>
                  <p className="text-muted-text text-xs md:text-sm leading-relaxed">
                    Explore media prints, regional news coverage, and official achievements of AMPS in leading Hindi newspapers alongside academic highlights.
                  </p>
                  <div className="w-12 h-[2px] bg-brass-gold mx-auto mt-3"></div>
                </div>

                {/* Interactive Category Filter Pills */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                  {[
                    { id: "all", label: "All Photos" },
                    { id: "milestones", label: "Toppers & Milestones" },
                    { id: "awards", label: "Award Ceremonies" },
                    { id: "sports", label: "Sports & Fitness" },
                    { id: "cultural", label: "Cultural Events" },
                    { id: "science", label: "Science & Labs" },
                    { id: "news", label: "News Coverage" }
                  ].map((pill) => (
                    <button
                      key={pill.id}
                      onClick={() => setGalleryFilter(pill.id)}
                      className={`px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider rounded-full border transition-all cursor-pointer ${galleryFilter === pill.id
                          ? "bg-ink-navy text-white border-ink-navy shadow-sm"
                          : "bg-white text-muted-text border-border-custom hover:text-ink-navy hover:border-ink-navy"
                        }`}
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>

                {/* Gallery Photo Grid */}
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-0">
                  <AnimatePresence mode="popLayout">
                    {displayedGalleryItems.map((item) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.15)" }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        key={item.id}
                        className="break-inside-avoid mb-6 group bg-white rounded-sm border border-border-custom overflow-hidden shadow-sm cursor-pointer flex flex-col"
                        onClick={() => setSelectedGalleryImg(item)}
                      >
                        {/* Photo Container */}
                        <div className="relative overflow-hidden bg-white">
                          <img
                            src={item.localSrc}
                            alt={item.title}
                            loading="lazy"
                            onError={() => setGalleryImgErrors(prev => ({ ...prev, [item.id]: true }))}
                            className="w-full h-auto transition-transform duration-500 group-hover:scale-102"
                          />

                          {/* Hover Overlay Icon */}
                          <div className="absolute inset-0 bg-ink-navy/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="w-9 h-9 rounded-full bg-white/90 text-ink-navy flex items-center justify-center shadow-md transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                              <ZoomIn className="w-4.5 h-4.5" />
                            </div>
                          </div>

                          {/* Category Tag pill overlay */}
                          <div className="absolute top-3 left-3 bg-white/95 px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest font-semibold border border-border-custom rounded-sm text-maroon shadow-sm">
                            {item.category === "awards" ? "Award Meet" :
                              item.category === "sports" ? "Athletics" :
                                item.category === "cultural" ? "Cultural" :
                                  item.category === "science" ? "Science" :
                                    item.category === "milestones" ? "Milestone" : "News Coverage"}
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
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal / Popup */}
      <AnimatePresence>
        {selectedGalleryImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedGalleryImg(null)}
          >
            <button
              onClick={() => setSelectedGalleryImg(null)}
              className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors z-50 cursor-pointer"
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
                  loading="lazy"
                  className="max-h-[70vh] md:max-h-[80vh] w-full object-contain"
                />

                {/* Left navigation arrow */}
                <button
                  onClick={() => navigateLightbox("prev")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/80 w-10 h-10 rounded-full flex items-center justify-center transition-colors border border-white/10 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Right navigation arrow */}
                <button
                  onClick={() => navigateLightbox("next")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/80 w-10 h-10 rounded-full flex items-center justify-center transition-colors border border-white/10 cursor-pointer"
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
                          selectedGalleryImg.category === "science" ? "Science & Lab" :
                            selectedGalleryImg.category === "milestones" ? "Academic Milestone" : "News Coverage"}
                  </span>
                  <h3 className="font-serif text-xl font-bold leading-tight tracking-tight text-white mb-3">
                    {selectedGalleryImg.title}
                  </h3>
                  <p className="text-gray-300 text-xs leading-relaxed font-sans whitespace-pre-line">
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
    </>
  );
}
