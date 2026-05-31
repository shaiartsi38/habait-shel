"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Lock, Check, Star, ChevronDown } from "lucide-react";
import { type Category } from "@/lib/courses-data";
import { useCourses } from "@/lib/courses-context";
import { CourseCard } from "@/components/courses/CourseCard";
import { CategoryFilter } from "@/components/courses/CategoryFilter";
import {
  type HeroContent, type Testimonial, type SubPlan, type ExtraSection, type FaqItem, type ComingSoonItem,
  DEFAULT_HERO, DEFAULT_TESTIMONIALS, DEFAULT_PLANS, DEFAULT_EXTRA_SECTIONS, DEFAULT_FAQS, DEFAULT_COMING_SOON, DEFAULT_TERMS,
  dbGetHero, dbGetTestimonials, dbGetPlans, dbGetExtraSections, dbGetFaqs, dbGetComingSoon, dbGetTerms,
} from "@/lib/supabase/content-db";

// ─── Assets ─────────────────────────────────────────────────────
const NATALIE_PROFILE = "https://i.imghippo.com/files/ZNe4792NOg.jpeg";

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

// ─── Page ────────────────────────────────────────────────────────
export default function HomePage() {
  const [hero, setHero]                   = useState<HeroContent>(DEFAULT_HERO);
  const [testimonials, setTestimonials]   = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
  const [plans, setPlans]                 = useState<SubPlan[]>(DEFAULT_PLANS);
  const [extraSections, setExtraSections] = useState<ExtraSection[]>(DEFAULT_EXTRA_SECTIONS);
  const [faqs, setFaqs]                   = useState<FaqItem[]>(DEFAULT_FAQS);
  const [comingSoon, setComingSoon]       = useState<ComingSoonItem[]>(DEFAULT_COMING_SOON);
  const [terms, setTerms]               = useState<string>(DEFAULT_TERMS);

  useEffect(() => {
    dbGetHero().then(setHero).catch(() => {});
    dbGetTestimonials().then(setTestimonials).catch(() => {});
    dbGetPlans().then(setPlans).catch(() => {});
    dbGetExtraSections().then(setExtraSections).catch(() => {});
    dbGetFaqs().then(setFaqs).catch(() => {});
    dbGetComingSoon().then(setComingSoon).catch(() => {});
    dbGetTerms().then(setTerms).catch(() => {});
  }, []);

  return (
    <div style={{ background: "var(--black)" }}>
      <JoinClubButton />
      <HeroSection hero={hero} />
      <CoursesSection comingSoon={comingSoon} />
      <TestimonialsSection testimonials={testimonials} />
      <NatalieSection />
      <ExtraContentSections sections={extraSections} />
      <SubscriptionSection plans={plans} />
      <FaqSection faqs={faqs} />
      <TermsSection terms={terms} />
      <ClosingCTA />
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
function HeroSection({ hero }: { hero: HeroContent }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 600], ["0%", "22%"]);
  const isVideo = hero.heroType === "video" && hero.heroVideoUrl;

  return (
    <section
      ref={ref}
      className="relative w-full min-h-[90vh] md:min-h-screen overflow-hidden flex flex-col"
    >
      {/* BG — תמונה עם parallax או וידאו */}
      {isVideo ? (
        <div className="absolute inset-0">
          <video
            src={hero.heroVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover object-center"
          />
        </div>
      ) : (
        <motion.div
          className="absolute inset-0"
          style={{ y: bgY, scale: 1.14, transformOrigin: "center top" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hero.heroBg}
            alt="Hero"
            className="w-full h-full object-cover object-center"
          />
        </motion.div>
      )}

      {/* Overlay — קל יותר במובייל */}
      <div className="md:hidden absolute inset-0 z-[1]" style={{ background: "rgba(8,6,8,0.42)" }} />
      <div className="hidden md:block absolute inset-0 z-[1]" style={{ background: "rgba(8,6,8,0.72)" }} />
      {/* Bottom vignette */}
      <div
        className="absolute inset-0 z-[2]"
        style={{
          background:
            "linear-gradient(to top, #080608 0%, rgba(8,6,8,0.88) 16%, rgba(8,6,8,0.3) 55%, transparent 100%)",
        }}
      />
      {/* Sidebar right fade */}
      <div
        className="absolute inset-0 z-[2]"
        style={{ background: "linear-gradient(to right, transparent 32%, rgba(8,6,8,0.5) 100%)" }}
      />

      {/* Content — bottom-aligned, right-aligned */}
      <div className="relative z-10 flex flex-col justify-end flex-1 px-6 pb-16 sidebar-safe md:px-14 md:pb-24 text-right">
        {/* Main headline */}
        <div className="overflow-hidden mb-5">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="font-black leading-[0.9] tracking-tight text-4xl md:text-7xl"
          >
            <span style={{ color: "#FFF8F5" }}>{hero.title1}</span>
            <br />
            <span
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #C4857A 0%, #D4998E 38%, #FFF8F5 58%, #D4998E 78%, #C4857A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {hero.title2}
            </span>
          </motion.h1>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.26 }}
          className="text-base md:text-xl font-light mb-7 max-w-xl leading-relaxed mr-0"
          style={{ color: "rgba(255,248,245,0.6)" }}
        >
          {hero.subtitle}
        </motion.p>

        {/* CTA row + social proof מתחתיהם */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.34 }}
          className="flex flex-col items-start gap-4"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
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
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-medium border transition-all hover:bg-white/[0.04]"
              style={{ color: "rgba(255,248,245,0.48)", borderColor: "rgba(255,255,255,0.09)" }}
            >
              גלי את הקורסים
            </Link>
          </div>

          {/* Social proof — ישירות מתחת לכפתורים */}
          <div
            className="flex items-center gap-3 text-[0.65rem]"
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
function CoursesSection({ comingSoon }: { comingSoon: ComingSoonItem[] }) {
  const [activeCategory, setActiveCategory] = useState<Category>("הכל");
  const { courses } = useCourses();
  const published = courses.filter((c) => c.isPublished && c.showOnHome !== false);
  const visible =
    activeCategory === "הכל"
      ? published
      : published.filter((c) => c.category === activeCategory);

  const row1 = visible.slice(0, 4);
  const row2 = visible.slice(4, 7);
  const rest = visible.slice(7);

  return (
    <section className="py-16 px-4 sidebar-safe md:px-10 text-right">
      {/* Heading */}
      <motion.div className="mb-2" {...FI}>
        <p className="text-[0.56rem] tracking-[0.34em] uppercase font-semibold mb-2" style={{ color: "#C4857A" }}>
          מאסטרקלאסים
        </p>
        <h2 className="text-2xl md:text-4xl font-extrabold" style={{ color: "#FFF8F5" }}>
          מה מחכה לך בפנים
        </h2>
      </motion.div>

      {/* Decorative line */}
      <motion.div
        className="mb-8 h-px"
        style={{ background: "linear-gradient(to left, transparent, rgba(196,133,122,0.28), transparent)" }}
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.65 }}
      />

      {/* Category filter */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.35 }}
      >
        <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
      </motion.div>

      {/* Row 1 */}
      {row1.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-0 md:gap-2 mb-0 md:mb-2">
          {row1.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.07 }}
            >
              <BreathingCard>
                <CourseCard course={course} />
              </BreathingCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Natalie luxury divider */}
      <motion.div
        className="mb-3 overflow-hidden rounded-2xl hidden md:flex items-center gap-8 px-10 py-5"
        style={{
          background: "linear-gradient(135deg, rgba(196,133,122,0.05) 0%, rgba(212,153,142,0.03) 100%)",
          border: "1px solid rgba(196,133,122,0.08)",
          minHeight: 80,
        }}
        {...FI}
      >
        <p className="text-[0.48rem] tracking-[0.38em] uppercase font-semibold shrink-0" style={{ color: "rgba(196,133,122,0.45)" }}>
          המדריכה
        </p>
        <h3
          className="text-3xl md:text-4xl font-black leading-none shrink-0"
          style={{
            backgroundImage: "linear-gradient(135deg, #FFF8F5 0%, #D4998E 45%, #C4857A 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          מה שמפריד בין עוד מאפרת לאמנית
        </h3>
        <div className="w-px h-8 mx-2 shrink-0" style={{ background: "rgba(196,133,122,0.13)" }} />
        <p className="text-[0.66rem] leading-relaxed flex-1" style={{ color: "rgba(255,248,245,0.26)" }}>
          מאפרת מקצועית · 100K+ עוקבות · מיליוני צפיות
        </p>
        <Link
          href="/natalie"
          className="shrink-0 text-[0.65rem] font-semibold transition-all hover:opacity-70"
          style={{ color: "#C4857A" }}
        >
          הכירי אותה ←
        </Link>
      </motion.div>

      {/* Row 2 */}
      {row2.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-0 md:gap-2 mb-0 md:mb-2">
          {row2.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.07 }}
            >
              <BreathingCard>
                <CourseCard course={course} />
              </BreathingCard>
            </motion.div>
          ))}
          {/* Symmetry breaker */}
          <motion.div
            className="hidden md:flex flex-col justify-center items-start px-5 py-5 rounded-xl"
            style={{
              background: "rgba(196,133,122,0.04)",
              border: "1px solid rgba(196,133,122,0.07)",
              aspectRatio: "3/4",
            }}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            <span className="text-[0.44rem] tracking-[0.3em] uppercase mb-3 font-semibold" style={{ color: "rgba(196,133,122,0.4)" }}>
              קולקציה
            </span>
            <p
              className="text-xl font-black leading-tight mb-3"
              style={{
                backgroundImage: "linear-gradient(160deg, #FFF8F5 0%, #D4998E 60%, #C4857A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ∞<br />עוד<br />קורסים
            </p>
            <Link href="/courses" className="text-[0.6rem] font-bold transition-all hover:opacity-70" style={{ color: "#C4857A" }}>
              לכל הקורסים ←
            </Link>
          </motion.div>
        </div>
      )}

      {/* Extra rows */}
      {rest.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-0 md:gap-2 mb-0 md:mb-8">
          {rest.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, ease: "easeOut", delay: (i % 4) * 0.07 }}
            >
              <BreathingCard>
                <CourseCard course={course} />
              </BreathingCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Coming Soon */}
      <ComingSoonSection items={comingSoon} />

      {/* All courses link */}
      <motion.div className="mt-8 flex justify-end" {...FI}>
        <Link href="/courses" className="inline-flex items-center gap-2 text-sm font-semibold transition-all hover:gap-3" style={{ color: "#C4857A" }}>
          כל הקורסים ←
        </Link>
      </motion.div>
    </section>
  );
}

// ─── Breathing card wrapper ───────────────────────────────────────
function BreathingCard({ children }: { children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={
        hovered
          ? { scale: [1, 1.022, 1], opacity: [0.88, 1, 0.88] }
          : { scale: 1, opacity: 1 }
      }
      transition={
        hovered
          ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.35, ease: "easeOut" }
      }
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}

// ─── Coming Soon — narrow portrait cards (Netflix style) ──────────
function ComingSoonSection({ items }: { items: ComingSoonItem[] }) {
  const SOON = items.length > 0 ? items : [] as ComingSoonItem[];

  return (
    <div className="mt-14 text-right">
      <motion.div className="mb-2" {...FI}>
        <p className="text-[0.54rem] tracking-[0.32em] uppercase font-semibold mb-2" style={{ color: "rgba(196,133,122,0.48)" }}>
          בקרוב
        </p>
        <h3 className="text-xl md:text-2xl font-black mb-4" style={{ color: "#FFF8F5" }}>
          מה הולך לקרות בקרוב
        </h3>
        <div className="h-px mb-6" style={{ background: "linear-gradient(to left, transparent, rgba(196,133,122,0.2), transparent)" }} />
      </motion.div>

      {/* Narrow portrait grid — max-w per card, flex layout */}
      <div className="flex gap-3 flex-wrap justify-start">
        {SOON.map((item, i) => (
          <motion.div
            key={item.id}
            className="relative rounded-xl overflow-hidden cursor-not-allowed flex-shrink-0"
            style={{
              aspectRatio: "2/3",
              width: "calc((100% - 2.25rem) / 3)",
              maxWidth: 180,
              background: "#140e12",
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.07 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
              style={{ opacity: 0.55 }}
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(8,6,8,0.98) 0%, rgba(8,6,8,0.5) 55%, rgba(8,6,8,0.18) 100%)" }}
            />
            {/* Lock */}
            <div
              className="absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "rgba(196,133,122,0.12)", border: "1px solid rgba(196,133,122,0.18)" }}
            >
              <Lock size={8} style={{ color: "#C4857A" }} />
            </div>
            {/* Badge */}
            <div
              className="absolute top-2 right-2 px-1.5 py-[2px] rounded-full text-[0.4rem] font-black uppercase tracking-wider"
              style={{ border: "1px solid rgba(196,133,122,0.2)", color: "rgba(196,133,122,0.6)", background: "rgba(196,133,122,0.05)" }}
            >
              בקרוב
            </div>
            {/* Info */}
            <div className="absolute inset-x-0 bottom-0 p-2.5 text-right">
              <p className="text-[0.58rem] font-bold leading-snug mb-1" style={{ color: "rgba(255,248,245,0.48)" }}>
                {item.title}
              </p>
              <div className="w-4 h-[1px] mb-1 mr-auto ml-0 rounded-full" style={{ background: "rgba(196,133,122,0.28)" }} />
              <p className="text-[0.44rem]" style={{ color: "rgba(255,248,245,0.22)" }}>{item.subtitle}</p>
            </div>
          </motion.div>
        ))}
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
function NatalieSection() {
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={NATALIE_PROFILE} alt="נטלי ארצי" className="w-full h-full object-cover object-top" />
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
function SubscriptionSection({ plans }: { plans: SubPlan[] }) {
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
        <p className="text-sm" style={{ color: "rgba(255,248,245,0.3)" }}>
          ניסיון 7 ימים חינם · ביטול בכל עת · ללא התחייבות
        </p>
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
  const [open, setOpen] = useState(false);
  return (
    <section className="px-4 sidebar-safe md:px-10 pb-10 text-right">
      <div className="max-w-3xl mx-auto">
        <div className="h-px mb-6" style={{ background: "linear-gradient(to left, transparent, rgba(196,133,122,0.1), transparent)" }} />
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-[0.62rem] tracking-wider transition-opacity hover:opacity-70"
          style={{ color: "rgba(255,248,245,0.2)" }}
        >
          תקנון המועדון {open ? "▲" : "▼"}
        </button>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-5 rounded-2xl text-[0.68rem] leading-relaxed whitespace-pre-wrap"
            style={{ background: "#140e12", color: "rgba(255,248,245,0.3)", border: "1px solid rgba(196,133,122,0.06)" }}
          >
            {terms}
          </motion.div>
        )}
      </div>
    </section>
  );
}

// ─── Closing CTA ──────────────────────────────────────────────────
function ClosingCTA() {
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

        <p className="text-[0.62rem]" style={{ color: "rgba(255,248,245,0.2)" }}>
          ניסיון 7 ימים חינם · ביטול בכל עת
        </p>
      </motion.div>
    </section>
  );
}
