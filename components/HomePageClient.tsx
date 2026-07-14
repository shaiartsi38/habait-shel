"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Lock, Check, Star, ChevronDown, Heart } from "lucide-react";
import { type Category, type CourseData } from "@/lib/courses-data";
import { useFavorites } from "@/lib/favorites-context";
import { useCourses } from "@/lib/courses-context";
import { CourseCard } from "@/components/courses/CourseCard";
import { CategoryFilter } from "@/components/courses/CategoryFilter";
import {
  type HeroContent, type Testimonial, type SubPlan, type ExtraSection, type FaqItem, type ComingSoonItem, type NatalieContent,
  type NewestSectionContent,
  DEFAULT_HERO,
} from "@/lib/supabase/content-db";
import ProtectedLogo from "@/components/ProtectedLogo";


// ─── Animation preset — תנועה ברורה ומורגשת ──────────────────────
const FI = {
  initial:     { opacity: 0, y: 48 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, amount: 0.15 },
  transition:  { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
} as const;

function scrollToSub() {
  document.getElementById("subscription")?.scrollIntoView({ behavior: "smooth" });
}

// ─── Props ────────────────────────────────────────────────────────
interface HomePageProps {
  hero: HeroContent;
  newestSection: NewestSectionContent;
  testimonials: Testimonial[];
  plans: SubPlan[];
  extraSections: ExtraSection[];
  faqs: FaqItem[];
  comingSoon: ComingSoonItem[];
  terms: string;
  natalie: NatalieContent;
  isLoggedIn: boolean;
  hasSubscription: boolean;
}

// ─── Page ────────────────────────────────────────────────────────
export default function HomePageClient({
  hero, newestSection, testimonials, plans, extraSections, faqs, comingSoon, terms, natalie, isLoggedIn, hasSubscription,
}: HomePageProps) {
  return (
    <div style={{ background: "var(--black)" }}>
      {!isLoggedIn && <JoinClubButton />}
      <HeroSection hero={hero} isLoggedIn={isLoggedIn} />

      <CoursesSection comingSoon={comingSoon} hasSubscription={hasSubscription} hero={hero} newestSection={newestSection} />
      <TestimonialsSection testimonials={testimonials} />
      <NatalieSection natalie={natalie} />
      <ExtraContentSections sections={extraSections} />
      {!hasSubscription && <SubscriptionSection plans={plans} terms={terms} />}
      <FaqSection faqs={faqs} />
      {!hasSubscription && <ClosingCTA terms={terms} />}
    </div>
  );
}

// ─── Sticky join button ───────────────────────────────────────────
function JoinClubButton() {
  return (
    <motion.button
      onClick={scrollToSub}
      className="hidden md:flex fixed top-5 left-5 z-[60] items-center gap-2 px-4 py-2 rounded-xl text-[0.72rem] font-black tracking-wide"
      style={{
        background: "rgba(10,10,10,0.72)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(196,133,122,0.22)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.42)",
        color: "#C4857A",
      }}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.35 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#C4857A" }} />
      הצטרפי למועדון
    </motion.button>
  );
}

// ─── Full-Bleed Parallax Hero ─────────────────────────────────────
function HeroSection({ hero, isLoggedIn }: { hero: HeroContent; isLoggedIn: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 600], ["0%", "22%"]);
  const isVideo = hero.heroType === "video" && hero.heroVideoUrl;
  const [videoReady, setVideoReady] = useState(false);

  // fallback לURL ברירת מחדל אם heroBg ריק (למשל ב-Supabase הוגדר ריק)
  const bgSrc = hero.heroBg || DEFAULT_HERO.heroBg;

  return (
    <section
      ref={ref}
      className="relative w-full min-h-[90vh] md:min-h-screen overflow-hidden flex flex-col"
    >
      {/* תמונת רקע — תמיד מוצגת */}
      <motion.div
        className="absolute inset-0"
        style={{ y: bgY, scale: 1.05, transformOrigin: "center top" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bgSrc}
          alt=""
          role="presentation"
          className="w-full h-full object-cover"
          style={{ objectPosition: "50% 25%" }}
          loading="eager"
        />
      </motion.div>

      {/* וידאו overlay — מוצג רק אחרי שנטען בהצלחה */}
      {isVideo && (
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: videoReady ? 1 : 0 }}
        >
          <video
            src={hero.heroVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={bgSrc}
            className="w-full h-full object-cover object-center"
            onCanPlay={() => setVideoReady(true)}
          />
        </div>
      )}

      {/* Overlay — מרכזי, צריך קצת יותר כהה לטקסט מרכזי */}
      <div className="md:hidden absolute inset-0 z-[1]" style={{ background: "rgba(8,6,8,0.7)" }} />
      <div className="hidden md:block absolute inset-0 z-[1]" style={{ background: "rgba(8,6,8,0.78)" }} />
      {/* Bottom vignette */}
      <div
        className="absolute inset-0 z-[2]"
        style={{
          background:
            "linear-gradient(to top, #080608 0%, rgba(8,6,8,0.7) 14%, rgba(8,6,8,0.15) 50%, transparent 100%)",
        }}
      />

      {/* Content — centered */}
      <div className="relative z-10 flex flex-col justify-center items-center flex-1 px-6 py-16 sidebar-safe md:px-14 text-center">
        {/* לוגו מוגן — ללא img element, ללא delay */}
        <motion.div
          className="mb-5"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
        >
          <ProtectedLogo width="clamp(200px, 38vw, 520px)" style={{ margin: "0 auto" }} />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.26 }}
          className="text-base md:text-xl font-light mb-7 max-w-xl leading-relaxed mx-auto"
          style={{ color: "rgba(255,248,245,0.6)" }}
        >
          {hero.subtitle}
        </motion.p>

        {/* CTA row + social proof מתחתיהם */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.34 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {!isLoggedIn && (
              <motion.button
                onClick={scrollToSub}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-black tracking-wide"
                style={{
                  background: "linear-gradient(135deg, #C4857A 0%, #D4998E 100%)",
                  color: "#080608",
                  boxShadow: "0 6px 32px rgba(196,133,122,0.45)",
                }}
                whileHover={{ scale: 1.03, boxShadow: "0 8px 40px rgba(196,133,122,0.6)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                {hero.ctaText}
              </motion.button>
            )}
          </div>

          {/* Social proof — ישירות מתחת לכפתורים */}
          <div
            className="flex items-center justify-center gap-3 text-[0.65rem]"
            style={{ color: "rgba(255,248,245,0.32)" }}
          >
            <span style={{ color: "#C4857A" }}>⭐⭐⭐⭐⭐</span>
            <span className="w-px h-3" style={{ background: "rgba(255,248,245,0.1)" }} />
            <span>{hero.statsCourses}</span>
            <span className="w-px h-3" style={{ background: "rgba(255,248,245,0.1)" }} />
            <span>{hero.statsStudents}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Courses Section ──────────────────────────────────────────────
function CoursesSection({ comingSoon, hasSubscription, hero, newestSection }: {
  comingSoon: ComingSoonItem[];
  hasSubscription: boolean;
  hero: HeroContent;
  newestSection: NewestSectionContent;
}) {
  const [activeCategory, setActiveCategory] = useState<Category>("הכל");
  const { courses, loading } = useCourses();
  const published = courses.filter((c) => c.isPublished && c.showOnHome !== false);
  const visible =
    activeCategory === "הכל"
      ? published
      : published.filter((c) => c.category === activeCategory);

  const sectionTitle1  = hero.sectionTitle1  || "מה מחכה לך בפנים";
  const sectionTitle2  = hero.sectionTitle2  || "עוד קורסים שתאהבי";
  const textBreakTitle = hero.textBreakTitle || "תוכן חדש בכל שבוע";
  const textBreakSub   = hero.textBreakSub   || "נטלי מצלמת ומעלה תוכן חדש כל שבוע — כי מאפרת שרוצה להיות בפנים לא מפסיקה ללמוד.";

  const isFiltered = activeCategory !== "הכל";
  const row1 = visible.slice(0, 5);
  const row2 = visible.slice(5, 9);
  const featuredIds = newestSection.featuredCourseIds ?? [];
  const row3 = featuredIds.length > 0
    ? featuredIds.map((id) => courses.find((c) => c.id === id)).filter(Boolean) as typeof courses
    : [];

  return (
    <section className="text-right" style={{ paddingBottom: 56 }}>
      {/* Category filter */}
      <div className="pt-12 pb-6 px-4 md:px-10">
        <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
      </div>

      {isFiltered ? (
        /* Filtered view: simple flat grid */
        <div className="px-4 md:px-10">
          {visible.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {visible.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: (i % 4) * 0.06 }}
                >
                  <PortraitCard course={course} />
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center py-12 text-sm" style={{ color: "rgba(255,248,245,0.55)" }}>
              אין קורסים בקטגוריה זו
            </p>
          )}
        </div>
      ) : (
        <>
          {/* ── Section 1: 5 portrait cards ── */}
          {row1.length > 0 && (
            <>
              <CoursesSectionHeader eyebrow="מאסטרקלאסים" title={sectionTitle1} />
              {/* Mobile: horizontal scroll */}
              <div
                className="md:hidden flex gap-2.5"
                style={{ overflowX: "auto", scrollSnapType: "x mandatory", padding: "0 16px 20px", scrollbarWidth: "none" }}
              >
                {row1.map((course) => (
                  <div key={course.id} style={{ flexShrink: 0, scrollSnapAlign: "start", width: "calc((100vw - 42px) / 2.3)", minWidth: 130 }}>
                    <PortraitCard course={course} />
                  </div>
                ))}
              </div>
              {/* Desktop: 5-col grid */}
              <div className="hidden md:grid grid-cols-5 gap-3 md:px-10">
                {row1.map((course, i) => (
                  <motion.div key={course.id} {...FI} transition={{ ...FI.transition, delay: i * 0.06 }}>
                    <PortraitCard course={course} />
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* ── Natalie divider ── */}
          <motion.div
            className="mx-4 md:mx-10 mt-5 px-5 py-4 rounded-2xl flex items-center gap-5"
            style={{ background: "rgba(196,133,122,0.03)", border: "1px solid rgba(196,133,122,0.08)" }}
            {...FI}
          >
            <p className="hidden md:block text-[0.42rem] font-bold tracking-[0.4em] uppercase shrink-0" style={{ color: "rgba(196,133,122,0.32)" }}>המדריכה</p>
            <h3
              className="text-lg md:text-2xl font-black flex-1 leading-tight"
              style={{
                backgroundImage: "linear-gradient(135deg, #FFF8F5, #D4998E, #C4857A)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              מה שמפריד בין עוד מאפרת לאמנית
            </h3>
            <Link
              href="/natalie"
              className="shrink-0 text-[0.65rem] font-bold transition-all hover:opacity-70"
              style={{ color: "#C4857A", borderBottom: "1px solid rgba(196,133,122,0.28)", paddingBottom: 2 }}
            >
              הכירי אותה ←
            </Link>
          </motion.div>

          {/* ── Section 2: 4 portrait cards ── */}
          {row2.length > 0 && (
            <>
              <CoursesSectionHeader eyebrow="קורסים נוספים" title={sectionTitle2} />
              {/* Mobile: horizontal scroll */}
              <div
                className="md:hidden flex gap-2.5"
                style={{ overflowX: "auto", scrollSnapType: "x mandatory", padding: "0 16px 20px", scrollbarWidth: "none" }}
              >
                {row2.map((course) => (
                  <div key={course.id} style={{ flexShrink: 0, scrollSnapAlign: "start", width: "calc((100vw - 42px) / 2.3)", minWidth: 130 }}>
                    <PortraitCard course={course} />
                  </div>
                ))}
              </div>
              {/* Desktop: 4-col grid */}
              <div className="hidden md:grid grid-cols-4 gap-3 md:px-10">
                {row2.map((course, i) => (
                  <motion.div key={course.id} {...FI} transition={{ ...FI.transition, delay: i * 0.06 }}>
                    <PortraitCard course={course} />
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* ── Text break ── */}
          {(row1.length > 0 || row2.length > 0) && (
            <div className="mx-4 md:mx-10 text-center" style={{ paddingTop: 72 }}>
              <motion.div {...FI}>
                <p className="text-[0.5rem] font-bold tracking-[0.44em] uppercase mb-4" style={{ color: "rgba(196,133,122,0.45)" }}>
                  NATALIE ARTSI ACADEMY
                </p>
                <h2
                  className="font-black leading-[1.04] tracking-tight mb-4"
                  style={{
                    fontSize: "clamp(2rem, 5vw, 4rem)",
                    backgroundImage: "linear-gradient(135deg, #FFF8F5 0%, #D4998E 55%, #C4857A 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {textBreakTitle}
                </h2>
                <p
                  className="font-light leading-relaxed max-w-md mx-auto mb-10"
                  style={{ fontSize: "clamp(0.78rem, 1.4vw, 0.92rem)", color: "rgba(255,248,245,0.36)" }}
                >
                  {textBreakSub}
                </p>
                <div className="w-px h-14 mx-auto" style={{ background: "linear-gradient(to bottom, rgba(196,133,122,0.4), transparent)" }} />
              </motion.div>
            </div>
          )}

          {/* ── Section 3: 4 landscape cards ── */}
          {row3.length > 0 && (
            <>
              <CoursesSectionHeader eyebrow={newestSection.eyebrow || "חדש באקדמיה"} title={newestSection.title || "הכי חדש — עכשיו זמין"} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 md:px-10 sidebar-safe">
                {row3.map((course, i) => (
                  <motion.div key={course.id} {...FI} transition={{ ...FI.transition, delay: i * 0.06 }}>
                    <LandscapeCard course={course} />
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ── Coming Soon ── */}
      <ComingSoonSection items={comingSoon} />

      {/* ── All courses link ── */}
      <motion.div className="mt-8 flex justify-end px-4 md:px-10" {...FI}>
        <Link href="/courses" className="inline-flex items-center gap-2 text-sm font-semibold transition-all hover:gap-3" style={{ color: "#C4857A" }}>
          כל הקורסים ←
        </Link>
      </motion.div>
    </section>
  );
}

// ─── Section header helper ────────────────────────────────────────
function CoursesSectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <motion.div className="pt-14 pb-5 px-4 md:px-10 text-right md:text-center" {...FI}>
      <p className="text-[0.5rem] font-bold tracking-[0.44em] uppercase mb-3" style={{ color: "rgba(196,133,122,0.5)" }}>
        {eyebrow}
      </p>
      <h2 className="text-2xl md:text-3xl font-black" style={{ color: "#FFF8F5" }}>
        {title}
      </h2>
      <div style={{ width: 34, height: 3, background: "linear-gradient(to left, transparent, #C4857A)", borderRadius: 2, marginTop: 12, marginLeft: "auto", marginRight: "auto" }} />
    </motion.div>
  );
}

// ─── Portrait card (MasterClass style, hover teaser video) ────────
function PortraitCard({ course }: { course: CourseData }) {
  const [hovered, setHovered] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { favorites, isLoggedIn, toggle } = useFavorites();
  const isFav = favorites.has(course.id);

  const handleMouseEnter = () => {
    setHovered(true);
    if (!course.videoId) return;
    timerRef.current = setTimeout(() => setShowVideo(true), 380);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowVideo(false);
  };

  return (
    <motion.div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      style={{
        borderWidth: "1px", borderStyle: "solid",
        borderColor: hovered ? "rgba(196,133,122,0.42)" : "rgba(196,133,122,0.1)",
        borderRadius: 13, overflow: "hidden", background: "#110810",
        boxShadow: hovered ? "0 18px 48px rgba(0,0,0,0.65)" : "none",
        transition: "border-color 0.32s, box-shadow 0.32s",
      }}
    >
      <Link href={`/courses/${course.slug}`} className="block">
        {/* Image — aspect 5/8 */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "5/8" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover"
            style={{ objectPosition: "center 10%", transform: hovered ? "scale(1.04)" : "scale(1)", transition: "transform 0.55s ease", opacity: showVideo ? 0 : 1 }}
          />

          {/* Teaser video on hover */}
          {showVideo && course.videoId && (
            <div className="absolute inset-0 z-10 overflow-hidden" style={{ animation: "fadeIn 0.3s ease" }}>
              <iframe
                src={
                  course.videoProvider === "vimeo"
                    ? `https://player.vimeo.com/video/${course.videoId}?autoplay=1&muted=1&loop=1&controls=0&background=1`
                    : `https://www.youtube.com/embed/${course.videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${course.videoId}&modestbranding=1&rel=0&playsinline=1`
                }
                allow="autoplay; encrypted-media"
                style={{ position: "absolute", width: "284%", height: "100%", left: "-92%", top: 0, border: "none", pointerEvents: "none" }}
              />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 z-20" style={{ background: "linear-gradient(to top, rgba(8,6,8,0.96) 0%, rgba(8,6,8,0.6) 28%, rgba(8,6,8,0.1) 60%, transparent 80%)" }} />
          {/* Tier badge — top left */}
          <div
            className="absolute top-2.5 left-2.5 z-30 px-1.5 py-[2px] rounded-[5px] text-[0.44rem] font-black tracking-[0.16em] uppercase"
            style={{ color: "#C4857A", background: "rgba(8,6,8,0.82)", border: "1px solid rgba(196,133,122,0.28)", backdropFilter: "blur(4px)" }}
          >
            {course.tier}
          </div>
          {/* New badge — top right */}
          {course.isNew && (
            <div
              className="absolute top-2.5 right-2.5 z-30 px-1.5 py-[2px] rounded-[5px] text-[0.46rem] font-black"
              style={{ color: "#080608", background: "#C4857A" }}
            >
              חדש
            </div>
          )}
          {/* Favorite heart */}
          {isLoggedIn && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(course.id); }}
              className="absolute bottom-14 left-2.5 z-30 p-1.5 rounded-full transition-transform active:scale-90"
              style={{ background: "rgba(8,6,8,0.55)", backdropFilter: "blur(8px)" }}
              aria-label={isFav ? "הסר ממועדפים" : "הוסף למועדפים"}
            >
              <Heart size={12} fill={isFav ? "#C4857A" : "none"} style={{ color: isFav ? "#C4857A" : "rgba(255,248,245,0.5)", transition: "color 0.18s, fill 0.18s" }} />
            </button>
          )}
          {/* Category + title on image */}
          <div className="absolute inset-x-0 bottom-0 z-30 px-3 pb-3">
            {course.category && (
              <p className="text-[0.42rem] font-bold tracking-[0.28em] uppercase mb-1.5" style={{ color: "rgba(196,133,122,0.65)" }}>
                {course.category}
              </p>
            )}
            <h3
              className="font-black leading-[1.2]"
              style={{ fontSize: "clamp(0.78rem, 1.4vw, 0.9rem)", color: "#FFF8F5", textShadow: "0 1px 12px rgba(0,0,0,0.9)" }}
            >
              {course.title}
            </h3>
          </div>
        </div>
        {/* Footer */}
        <div className="px-3 py-2.5">
          <p className="text-[0.54rem]" style={{ color: "rgba(255,248,245,0.28)" }}>
            {course.instructor.name} · {course.lessons.length} שיעורים · {course.duration}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Landscape card ────────────────────────────────────────────────
function LandscapeCard({ course }: { course: CourseData }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      style={{
        borderWidth: "1px", borderStyle: "solid",
        borderColor: hovered ? "rgba(196,133,122,0.38)" : "rgba(196,133,122,0.1)",
        borderRadius: 13, overflow: "hidden", background: "#110810",
        boxShadow: hovered ? "0 14px 36px rgba(0,0,0,0.55)" : "none",
        transition: "border-color 0.32s, box-shadow 0.32s",
      }}
    >
      <Link href={`/courses/${course.slug}`} className="block">
        {/* Image — aspect 3/2 */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "3/2" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover"
            style={{ objectPosition: "center 18%", transform: hovered ? "scale(1.04)" : "scale(1)", transition: "transform 0.55s ease" }}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,6,8,0.5) 0%, transparent 55%)" }} />
          {/* Tier badge */}
          <div
            className="absolute top-2.5 left-2.5 z-10 px-1.5 py-[2px] rounded-[5px] text-[0.43rem] font-black tracking-[0.15em] uppercase"
            style={{ color: "#C4857A", background: "rgba(8,6,8,0.82)", border: "1px solid rgba(196,133,122,0.25)", backdropFilter: "blur(4px)" }}
          >
            {course.tier}
          </div>
          {course.isNew && (
            <div
              className="absolute top-2.5 right-2.5 z-10 px-1.5 py-[2px] rounded-[5px] text-[0.43rem] font-black"
              style={{ color: "#080608", background: "#C4857A" }}
            >
              חדש
            </div>
          )}
        </div>
        {/* Body */}
        <div className="px-3 py-3" style={{ borderTop: "1px solid rgba(196,133,122,0.06)" }}>
          <h3 className="text-[0.78rem] font-black leading-[1.28] mb-1.5" style={{ color: "#FFF8F5" }}>
            {course.title}
          </h3>
          <p className="text-[0.54rem] font-bold tracking-[0.04em] mb-2" style={{ color: "rgba(196,133,122,0.5)" }}>
            {course.lessons.length} שיעורים · {course.duration}
          </p>
          <div className="flex gap-1 flex-wrap" style={{ minHeight: "18px" }}>
            {(course.tags?.length ? course.tags.slice(0, 2) : course.category ? [course.category] : []).map((tag) => (
              <span
                key={tag}
                className="text-[0.47rem] font-bold px-1.5 py-[2px] rounded-[5px]"
                style={{ color: "rgba(255,248,245,0.55)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(196,133,122,0.1)" }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Coming Soon — Coverflow 3D ──────────────────────────────────
function ComingSoonSection({ items }: { items: ComingSoonItem[] }) {
  const SOON = (items.length > 0 ? items : []).slice(0, 3);
  const N    = SOON.length;
  const [current, setCurrent] = useState(0);
  const stageRef   = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);
  const mouseDownX = useRef<number | null>(null);
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Responsive card width — mobile-first, sized to stay within overflow:hidden stage
  const [cardW, setCardW] = useState(160);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setCardW(w < 400 ? 145 : w < 768 ? 165 : 240);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const cardH      = Math.round(cardW * 1.5);
  const sideOffset = Math.round(cardW * 0.68);
  const stageH     = cardH + 60;

  // Wheel — must be non-passive to call preventDefault
  useEffect(() => {
    const el = stageRef.current;
    if (!el || N === 0) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (wheelTimer.current) clearTimeout(wheelTimer.current);
      wheelTimer.current = setTimeout(() => {
        const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
        if (delta > 30)       setCurrent(c => (c + 1) % N);
        else if (delta < -30) setCurrent(c => (c - 1 + N) % N);
      }, 40);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [N]);

  if (N === 0) return null;

  const goPrev = () => setCurrent(c => (c - 1 + N) % N);
  const goNext = () => setCurrent(c => (c + 1) % N);

  function offsetFor(i: number) {
    let off = ((i - current) % N + N) % N;
    if (off > N / 2) off -= N;
    return off;
  }

  function transformFor(off: number): { t: string; o: number; z: number } {
    if (off === 0)
      return { t: "rotateY(0deg) scale(1)", o: 1, z: 10 };
    const s = off > 0 ? 1 : -1;
    if (Math.abs(off) === 1)
      return { t: `translateX(${s * sideOffset}px) rotateY(${-s * 62}deg) scale(0.84)`, o: 0.72, z: 7 };
    return { t: `translateX(${s * sideOffset * 2.5}px) rotateY(${-s * 72}deg) scale(0.5)`, o: 0, z: 1 };
  }

  return (
    <div className="mt-14">
      {/* Header — centered like other section headers */}
      <motion.div className="px-4 md:px-10 text-right md:text-center mb-10" {...FI}>
        <p className="text-[0.54rem] tracking-[0.32em] uppercase font-semibold mb-2" style={{ color: "rgba(196,133,122,0.48)" }}>
          בקרוב
        </p>
        <h3 className="text-xl md:text-2xl font-black mb-4" style={{ color: "#FFF8F5" }}>
          מה הולך לקרות בקרוב
        </h3>
        <div className="h-px" style={{ background: "linear-gradient(to left, transparent, rgba(196,133,122,0.2), transparent)" }} />
      </motion.div>

      {/* 3D Coverflow stage — full width + overflow:hidden so body's overflow-x:hidden doesn't clip */}
      <div
        ref={stageRef}
        style={{
          position: "relative",
          width: "100%",
          height: stageH,
          perspective: "1400px",
          perspectiveOrigin: "50% 50%",
          overflow: "hidden",
          cursor: "grab",
          touchAction: "pan-y",
        }}
        onTouchStart={e => { dragStartX.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          if (dragStartX.current === null) return;
          const dx = dragStartX.current - e.changedTouches[0].clientX;
          if (Math.abs(dx) > 40) dx > 0 ? goNext() : goPrev();
          dragStartX.current = null;
        }}
        onMouseDown={e => { mouseDownX.current = e.clientX; }}
        onMouseUp={e => {
          if (mouseDownX.current === null) return;
          const dx = mouseDownX.current - e.clientX;
          if (Math.abs(dx) > 40) dx > 0 ? goNext() : goPrev();
          mouseDownX.current = null;
        }}
      >
        {/* Cards positioned absolutely from stage center — no preserve-3d needed */}
        {SOON.map((item, i) => {
          const off = offsetFor(i);
          const { t, o, z } = transformFor(off);
          return (
            <CoverflowCard
              key={item.id}
              item={item}
              isCenter={off === 0}
              transform={t}
              opacity={o}
              zIndex={z}
              cardW={cardW}
              cardH={cardH}
              onClick={() => { if (off === 1) goNext(); if (off === -1) goPrev(); }}
            />
          );
        })}
      </div>

      {/* Dots */}
      <div className="flex gap-2 justify-center mt-8">
        {SOON.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`קארד ${i + 1}`}
            style={{
              width: current === i ? 22 : 5,
              height: 5,
              borderRadius: current === i ? 3 : "50%",
              background: current === i ? "#C4857A" : "rgba(196,133,122,0.25)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.35s cubic-bezier(0.25,0.46,0.45,0.94)",
            }}
          />
        ))}
      </div>

      {/* Nav arrows */}
      <div className="flex items-center justify-center gap-6 mt-5">
        <button
          onClick={goPrev}
          style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid rgba(196,133,122,0.22)", background: "rgba(196,133,122,0.05)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#C4857A" }}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M6 12.5L10.5 8L6 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={goNext}
          style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid rgba(196,133,122,0.22)", background: "rgba(196,133,122,0.05)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#C4857A" }}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M10 12.5L5.5 8L10 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function CoverflowCard({
  item,
  isCenter,
  transform,
  opacity,
  zIndex,
  cardW,
  cardH,
  onClick,
}: {
  item: ComingSoonItem;
  isCenter: boolean;
  transform: string;
  opacity: number;
  zIndex: number;
  cardW: number;
  cardH: number;
  onClick: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={onClick}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: cardW,
        height: cardH,
        marginLeft: -cardW / 2,
        marginTop: -cardH / 2,
        borderRadius: 16,
        overflow: "hidden",
        cursor: isCenter ? "default" : "pointer",
        transform,
        opacity,
        zIndex,
        background: "#140e12",
        transition: "transform 0.58s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.58s ease, box-shadow 0.58s ease",
        boxShadow: isCenter
          ? "0 28px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(196,133,122,0.22)"
          : "0 12px 30px rgba(0,0,0,0.5)",
      }}
    >
      {/* Image or gradient fallback */}
      {item.image && !imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover"
          style={{ filter: isCenter ? "brightness(1)" : "brightness(0.4) saturate(0.5)", transition: "filter 0.5s ease" }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full" style={{ background: "linear-gradient(160deg, rgba(196,133,122,0.11) 0%, rgba(8,6,8,0.97) 100%)" }} />
      )}

      {/* Shine on center card */}
      {isCenter && (
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)", pointerEvents: "none", zIndex: 2 }} />
      )}

      {/* Bottom overlay */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 18%, rgba(8,6,8,0.28) 50%, rgba(8,6,8,0.93) 100%)", zIndex: 3 }} />

      {/* "בקרוב" badge — center only */}
      {isCenter && (
        <div className="absolute" style={{ top: 10, left: 10, zIndex: 5 }}>
          <span style={{ display: "block", padding: "4px 10px", borderRadius: 8, fontSize: "0.44rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", background: "rgba(8,6,8,0.65)", border: "1px solid rgba(196,133,122,0.35)", color: "rgba(196,133,122,0.9)", backdropFilter: "blur(8px)" }}>
            בקרוב
          </span>
        </div>
      )}

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0" style={{ padding: "1.2rem 1rem", zIndex: 4, direction: "rtl" }}>
        {item.category && (
          <p style={{ fontSize: "0.52rem", fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(196,133,122,0.9)", marginBottom: "0.3rem" }}>
            {item.category}
          </p>
        )}
        <h3 style={{ fontSize: "0.95rem", fontWeight: 800, lineHeight: 1.22, color: "#FFF8F5", marginBottom: "0.25rem" }}>
          {item.title}
        </h3>
        {/* Subtitle + button visible only on center card */}
        <div style={{ maxHeight: isCenter ? 80 : 0, overflow: "hidden", opacity: isCenter ? 1 : 0, transition: "max-height 0.4s ease, opacity 0.35s ease" }}>
          {item.subtitle && (
            <p style={{ fontSize: "0.65rem", fontWeight: 300, color: "rgba(255,248,245,0.48)", lineHeight: 1.4, marginBottom: "0.8rem" }}>
              {item.subtitle}
            </p>
          )}
          <button
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", width: "100%", padding: "0.55rem", borderRadius: 10, fontSize: "0.68rem", fontWeight: 700, background: "rgba(196,133,122,0.12)", border: "1px solid rgba(196,133,122,0.28)", color: "#C4857A", cursor: "pointer", fontFamily: "inherit" }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            עדכנ/י אותי כשיוצא
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────
function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section
      className="py-20 px-4 sidebar-safe md:px-10 text-right"
      style={{ borderTop: "1px solid rgba(196,133,122,0.07)" }}
    >
      <motion.div className="mb-10" {...FI}>
        <p className="text-[0.56rem] tracking-[0.34em] uppercase font-semibold mb-2" style={{ color: "#C4857A" }}>
          ביקורות
        </p>
        <h2 className="text-2xl md:text-3xl font-black" style={{ color: "#FFF8F5" }}>
          המאפרות שבחרו להיות בפנים
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            className="relative rounded-2xl p-5 flex flex-col"
            style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.1)" }}
            initial={{ opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
          >
            {/* Profile */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-[0.7rem] font-black shrink-0"
                style={{ background: `${t.color}18`, border: `1.5px solid ${t.color}44`, color: t.color }}
              >
                {t.photoUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={t.photoUrl} alt={t.name} className="w-full h-full object-cover" />
                  : t.initials
                }
              </div>
              <div>
                <p className="text-[0.78rem] font-bold" style={{ color: "#FFF8F5" }}>{t.name}</p>
                <p className="text-[0.56rem]" style={{ color: "rgba(196,133,122,0.58)" }}>{t.field}</p>
              </div>
            </div>

            {/* Quote */}
            <p className="text-[0.7rem] leading-relaxed flex-1" style={{ color: "rgba(255,248,245,0.42)" }}>
              &ldquo;{t.text}&rdquo;
            </p>

            {/* Rose divider */}
            <div
              className="mt-4 h-[1.5px] rounded-full"
              style={{ background: `linear-gradient(to left, transparent, ${t.color}50, transparent)` }}
            />

            {/* Stars */}
            <div className="flex gap-0.5 mt-3 justify-end">
              {[...Array(5)].map((_, si) => (
                <Star key={si} size={9} fill={t.color} style={{ color: t.color }} />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Natalie Section ──────────────────────────────────────────────
function NatalieSection({ natalie }: { natalie: NatalieContent }) {
  const [imgError, setImgError] = useState(false);
  useEffect(() => { setImgError(false); }, [natalie.photo]);
  return (
    <section
      className="py-20 px-5 sidebar-safe md:px-12 text-right"
      style={{ borderTop: "1px solid rgba(196,133,122,0.07)" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center max-w-2xl mx-auto">
        <motion.div
          {...FI}
          className="order-2 md:order-1"
        >
          <p className="text-[0.56rem] tracking-[0.3em] uppercase font-bold mb-3" style={{ color: "#C4857A" }}>המורה שלך</p>
          <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight" style={{ color: "#FFF8F5" }}>נטלי ארצי</h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "#5A3830" }}>
            מאפרת מקצועית עם מיליוני צפיות חודשיות ו-100,000+ עוקבות.
            כל מאסטרקלאס נבנה מהסטודיו האמיתי — אין מסנני אינסטגרם, רק טכניקה טהורה.
          </p>
          <Link href="/natalie" className="inline-flex items-center gap-2 text-sm font-semibold transition-all hover:gap-3" style={{ color: "#C4857A" }}>
            קראי עוד על נטלי ←
          </Link>
        </motion.div>

        <motion.div
          className="order-1 md:order-2"
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="relative aspect-[4/5] rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 12px 48px rgba(0,0,0,0.5)", border: "1px solid rgba(196,133,122,0.08)" }}
          >
            {imgError ? (
              <div className="w-full h-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, rgba(196,133,122,0.08) 0%, rgba(8,6,8,0.95) 100%)" }}>
                <div className="text-center">
                  <p className="font-black" style={{ fontSize: 72, color: "#C4857A" }}>נ</p>
                  <p className="text-sm font-bold mt-1" style={{ color: "rgba(255,248,245,0.35)" }}>נטלי ארצי</p>
                </div>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={natalie.photo} alt="נטלי ארצי" className="w-full h-full object-cover object-top"
                onError={() => setImgError(true)} />
            )}
            <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none" style={{ background: "linear-gradient(225deg,rgba(196,133,122,0.14) 0%,transparent 65%)" }} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Extra Content Sections ───────────────────────────────────────
function ExtraContentSections({ sections }: { sections: ExtraSection[] }) {
  const visible = sections.filter((s) => s.visible);
  if (visible.length === 0) return null;
  return (
    <>
      {visible.map((sec, i) => (
        <section
          key={sec.id}
          className="py-20 px-5 sidebar-safe md:px-12 text-right"
          style={{ borderTop: "1px solid rgba(196,133,122,0.07)" }}
        >
          <div className="max-w-3xl mx-auto text-center">
            {sec.subtitle && (
              <motion.p
                className="text-[0.56rem] tracking-[0.34em] uppercase font-semibold mb-2"
                style={{ color: "#C4857A" }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.5 }}
              >
                {sec.subtitle}
              </motion.p>
            )}
            {sec.title && (
              <motion.h2
                className="text-2xl md:text-3xl font-black mb-5 leading-tight"
                style={{ color: "#FFF8F5" }}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.55, delay: 0.06 }}
              >
                {sec.title}
              </motion.h2>
            )}
            <div className={`flex gap-8 items-start ${sec.imageUrl ? "flex-col md:flex-row" : ""}`}>
              {sec.imageUrl && (
                <motion.div
                  className="w-full md:w-64 shrink-0 rounded-2xl overflow-hidden"
                  initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sec.imageUrl} alt={sec.title} className="w-full h-full object-cover" style={{ maxHeight: 240 }} />
                </motion.div>
              )}
              <div className="flex-1">
                {sec.body && (
                  <motion.p
                    className="text-sm leading-relaxed mb-6"
                    style={{ color: "rgba(255,248,245,0.5)" }}
                    initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.5, delay: 0.1 + i * 0.04 }}
                  >
                    {sec.body}
                  </motion.p>
                )}
                {sec.ctaText && sec.ctaHref && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.4, delay: 0.18 }}
                  >
                    <Link
                      href={sec.ctaHref}
                      className="inline-flex items-center gap-2 text-sm font-semibold transition-all hover:gap-3"
                      style={{ color: "#C4857A" }}
                    >
                      {sec.ctaText} ←
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

// ─── Subscription Section ─────────────────────────────────────────
function SubscriptionSection({ plans, terms }: { plans: SubPlan[]; terms: string }) {
  return (
    <section
      id="subscription"
      className="py-24 px-4 sidebar-safe md:px-10 text-right"
      style={{ borderTop: "1px solid rgba(196,133,122,0.07)" }}
    >
      <motion.div className="mb-12 text-center" {...FI}>
        <p className="text-[0.56rem] tracking-[0.34em] uppercase font-semibold mb-3" style={{ color: "#C4857A" }}>
          הצטרפי עכשיו
        </p>
        <h2 className="text-2xl md:text-4xl font-black mb-3" style={{ color: "#FFF8F5" }}>
          בחרי את התוכנית שלך
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            className="relative rounded-2xl p-6 flex flex-col"
            style={{
              background: plan.featured ? "rgba(196,133,122,0.07)" : "#140e12",
              border: plan.featured ? "1.5px solid rgba(196,133,122,0.38)" : "1px solid rgba(196,133,122,0.1)",
              boxShadow: plan.featured ? "0 0 44px rgba(196,133,122,0.1)" : "none",
            }}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.1 }}
          >
            {plan.featured && (
              <div
                className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[0.58rem] font-black uppercase tracking-wider whitespace-nowrap"
                style={{ background: "linear-gradient(135deg, #C4857A, #D4998E)", color: "#080608" }}
              >
                הכי פופולרי
              </div>
            )}

            <p className="text-[0.56rem] tracking-[0.28em] uppercase font-bold mb-1" style={{ color: "#C4857A" }}>
              {plan.nameHe}
            </p>
            <h3 className="text-xl font-black mb-4" style={{ color: "#FFF8F5" }}>{plan.name}</h3>

            <div className="flex items-end gap-1 mb-6">
              <span className="text-4xl font-black" style={{ color: plan.featured ? "#D4998E" : "#FFF8F5" }}>
                ₪{plan.price}
              </span>
              <span className="text-sm mb-1.5" style={{ color: "rgba(255,248,245,0.28)" }}>/חודש</span>
            </div>

            <div className="h-px mb-5" style={{ background: "rgba(196,133,122,0.1)" }} />

            <ul className="flex flex-col gap-2.5 mb-8 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-[0.7rem]" style={{ color: "rgba(255,248,245,0.5)" }}>
                  <Check size={12} className="shrink-0 mt-0.5" style={{ color: "#C4857A" }} />
                  {feature}
                </li>
              ))}
            </ul>

            <Link href="/subscription">
              <motion.div
                className="w-full py-3 rounded-xl text-sm font-black text-center cursor-pointer"
                style={
                  plan.featured
                    ? { background: "linear-gradient(135deg, #C4857A, #D4998E)", color: "#080608", boxShadow: "0 6px 24px rgba(196,133,122,0.32)" }
                    : { background: "rgba(196,133,122,0.07)", color: "#C4857A", border: "1px solid rgba(196,133,122,0.18)" }
                }
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                {plan.featured ? "אני מצטרפת עכשיו" : "בחרי תוכנית"}
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.p
        className="text-xs mt-8 text-center"
        style={{ color: "rgba(255,248,245,0.28)" }}
        {...FI}
      >
        * כל המחירים כוללים מע&quot;מ · התחייבות חודשית בלבד · ביטול מיידי בכל עת
      </motion.p>
    </section>
  );
}

// ─── FAQ Accordion ────────────────────────────────────────────────
function FaqSection({ faqs }: { faqs: FaqItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section
      className="py-20 px-4 sidebar-safe md:px-10 text-right"
      style={{ borderTop: "1px solid rgba(196,133,122,0.07)" }}
    >
      <motion.div className="mb-10 text-center" {...FI}>
        <h2 className="text-2xl md:text-3xl font-black" style={{ color: "#FFF8F5" }}>
          שאלות נפוצות
        </h2>
      </motion.div>

      <div className="flex flex-col gap-2 max-w-2xl mx-auto">
        {faqs.map((faq, i) => (
          <FaqItem
            key={i}
            question={faq.q}
            answer={faq.a}
            index={i}
            isOpen={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? null : i)}
          />
        ))}
      </div>
    </section>
  );
}

function FaqItem({
  question,
  answer,
  index,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, ease: "easeOut", delay: index * 0.07 }}
    >
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "#140e12",
          border: "1px solid rgba(196,133,122,0.1)",
        }}
      >
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between px-5 py-4 text-right gap-4"
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="shrink-0"
          >
            <ChevronDown size={15} style={{ color: "#C4857A" }} />
          </motion.div>
          <span className="text-sm font-bold flex-1 text-right" style={{ color: "#FFF8F5" }}>
            {question}
          </span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="answer"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div
                className="px-5 pb-5 pt-0"
                style={{ borderTop: "1px solid rgba(196,133,122,0.07)" }}
              >
                <p className="text-sm leading-relaxed pt-4" style={{ color: "rgba(255,248,245,0.48)" }}>
                  {answer}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Terms Section ────────────────────────────────────────────────
function TermsSection({ terms }: { terms: string }) {
  const [expanded, setExpanded] = useState(false);
  const lines = terms.split("\n").filter((l) => l.trim());
  const preview = lines.slice(0, 5).join("\n");
  const hasMore = lines.length > 5;

  return (
    <div className="mt-6 text-center">
      <div
        className="inline-block text-right mx-auto px-4 py-4 rounded-2xl max-w-xl w-full"
        style={{ background: "rgba(196,133,122,0.04)", border: "1px solid rgba(196,133,122,0.08)" }}
      >
        <p className="text-[0.55rem] tracking-[0.2em] uppercase mb-3 font-semibold text-center" style={{ color: "rgba(196,133,122,0.5)" }}>
          תקנון המועדון
        </p>
        <p className="text-[0.64rem] leading-relaxed whitespace-pre-wrap" style={{ color: "rgba(255,248,245,0.28)" }}>
          {expanded ? terms : preview}
        </p>
        {hasMore && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 text-[0.6rem] font-semibold transition-opacity hover:opacity-70 block w-full text-center"
            style={{ color: "rgba(196,133,122,0.55)" }}
          >
            {expanded ? "הסתר ▲" : "לתקנון המלא ▼"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Closing CTA ──────────────────────────────────────────────────
function ClosingCTA({ terms }: { terms: string }) {
  return (
    <section className="py-24 px-4 sidebar-safe md:px-10 flex flex-col items-center text-center">
      <motion.div
        className="flex flex-col items-center gap-8"
        {...FI}
      >
        <h2
          className="font-black leading-[1.05] tracking-tight"
          style={{ fontSize: "clamp(2.4rem, 6vw, 5.5rem)" }}
        >
          <span style={{ color: "#FFF8F5" }}>מוכנה להיות</span>
          <br />
          <span
            style={{
              backgroundImage: "linear-gradient(135deg, #C4857A 0%, #D4998E 50%, #C4857A 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            צעד אחד לפני כולן?
          </span>
        </h2>

        <motion.button
          onClick={scrollToSub}
          className="inline-flex items-center gap-2.5 px-10 py-4 rounded-xl text-base font-black tracking-wide"
          style={{
            background: "linear-gradient(135deg, #C4857A 0%, #D4998E 100%)",
            color: "#080608",
            boxShadow: "0 8px 36px rgba(196,133,122,0.4)",
          }}
          whileHover={{ scale: 1.04, boxShadow: "0 10px 48px rgba(196,133,122,0.58)" }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          אני נכנסת ➔
        </motion.button>

        <TermsSection terms={terms} />
      </motion.div>
    </section>
  );
}
