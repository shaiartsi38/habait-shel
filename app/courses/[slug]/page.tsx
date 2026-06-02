"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { Play, Lock, Clock } from "lucide-react";
import Link from "next/link";
import { COURSES, type VideoProvider } from "@/lib/courses-data";
import { useCourses } from "@/lib/courses-context";
import { createClient } from "@/lib/supabase/client";

const DIFF_LABEL = { beginner: "מתחילות", intermediate: "בינוני", advanced: "מתקדם" } as const;
const TIER_LABEL = { basic: "Basic", pro: "Pro", elite: "Elite" } as const;

// ─── Page ────────────────────────────────────────────────────────
export default function CoursePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { courses } = useCourses();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data }) => {
      if (data.user) setIsLoggedIn(true);
    });
    sb.from("profiles").select("role").then(({ data }) => {
      if (data?.[0]?.role === "admin") setIsAdmin(true);
    });
  }, []);

  // Try context first (live admin changes), fall back to static
  const course = courses.find((c) => c.slug === slug) ?? COURSES.find((c) => c.slug === slug);
  if (!course) notFound();

  const firstLesson = course.lessons[0];
  const activeLesson = activeLessonId ? course.lessons.find((l) => l.id === activeLessonId) : null;

  const displayVideoId = activeLesson?.videoId ?? course.videoId ?? firstLesson?.videoId ?? "";
  const displayProvider = activeLesson?.videoProvider
    ?? (course.videoId ? (course.videoProvider ?? "youtube") : (firstLesson?.videoProvider ?? "youtube"));
  const displayTitle = activeLesson?.title ?? course.title;

  return (
    <div className="min-h-screen sidebar-safe" style={{ background: "var(--black)", color: "var(--white)" }}>
      {/* ── Cinematic header ── */}
      <CinematicHeader course={course} />

      {/* ── Main content ── */}
      <div className="px-4 md:px-10 py-10 max-w-4xl">
        {/* Video player */}
        {displayVideoId && (
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <VideoPlayer
              key={activeLessonId ?? "trailer"}
              videoId={displayVideoId}
              provider={displayProvider}
              poster={course.image}
              title={displayTitle}
            />
          </motion.div>
        )}

        <div className="grid md:grid-cols-[1fr_300px] gap-10">
          {/* Left col */}
          <div>
            {/* Meta badges */}
            <motion.div
              className="flex flex-wrap gap-2 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18 }}
            >
              <Badge color="#C4857A" bg="rgba(196,133,122,0.1)" border="rgba(196,133,122,0.25)">
                {TIER_LABEL[course.tier]}
              </Badge>
              <Badge color="rgba(255,248,245,0.5)" bg="rgba(255,255,255,0.04)" border="rgba(255,255,255,0.08)">
                {DIFF_LABEL[course.difficulty]}
              </Badge>
              <Badge color="rgba(255,248,245,0.5)" bg="rgba(255,255,255,0.04)" border="rgba(255,255,255,0.08)">
                <Clock size={10} className="inline ml-1" />
                {course.duration}
              </Badge>
            </motion.div>

            {/* Description */}
            {course.fullDesc && (
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
              >
                <h2 className="text-base font-black mb-3" style={{ color: "#FFF8F5" }}>על הקורס</h2>
                <p className="text-sm leading-relaxed" style={{ color: "#5A3830" }}>{course.fullDesc}</p>
              </motion.div>
            )}

            {/* Lesson list */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
            >
              <h2 className="text-base font-black mb-4" style={{ color: "#FFF8F5" }}>
                תכנית הקורס — {course.lessons.length} שיעורים
              </h2>
              <div className="space-y-2">
                {course.lessons.map((lesson, i) => (
                  <LessonRow
                    key={lesson.id}
                    lesson={lesson}
                    index={i}
                    tier={course.tier}
                    isAccessible={lesson.isFree || isLoggedIn || isAdmin}
                    isActive={lesson.id === activeLessonId}
                    onSelect={() => setActiveLessonId(lesson.id)}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right col — Instructor card */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.32 }}
          >
            <div
              className="sticky top-6 rounded-2xl overflow-hidden"
              style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.1)" }}
            >
              {/* Instructor photo */}
              <div className="p-6 flex flex-col items-center text-center">
                <div
                  className="w-20 h-20 rounded-full overflow-hidden mb-4"
                  style={{ border: "2px solid rgba(196,133,122,0.35)", boxShadow: "0 0 0 4px rgba(196,133,122,0.06)" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={course.instructor.photoUrl} alt={course.instructor.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-[0.55rem] tracking-[0.28em] uppercase mb-1.5" style={{ color: "#C4857A" }}>המדריכה</p>
                <h3 className="text-base font-black mb-2" style={{ color: "#FFF8F5" }}>{course.instructor.name}</h3>
                {course.instructor.bio && (
                  <p className="text-[0.68rem] leading-relaxed" style={{ color: "#5A3830" }}>{course.instructor.bio}</p>
                )}
              </div>

              {/* CTA */}
              <div className="px-5 pb-5">
                <Link
                  href="/subscription"
                  className="block w-full py-3 rounded-xl text-center text-[0.82rem] font-black transition-all hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg,#C4857A,#D4998E)",
                    color: "#080608",
                    boxShadow: "0 4px 18px rgba(196,133,122,0.3)",
                  }}
                >
                  הצטרפי עכשיו
                </Link>
                <p className="text-center text-[0.55rem] mt-2" style={{ color: "#3A2020" }}>
                  גישה מלאה עם מנוי {TIER_LABEL[course.tier]}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─── Cinematic Header ─────────────────────────────────────────────
function CinematicHeader({ course }: { course: (typeof COURSES)[number] }) {
  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: "60vh", display: "flex", alignItems: "flex-end" }}>
      {/* Background image */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={course.image} alt={course.title} className="w-full h-full object-cover object-center" style={{ filter: "brightness(0.55)" }} />
      </div>

      {/* Cinematic gradients */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #080608 0%, rgba(8,6,8,0.8) 30%, rgba(8,6,8,0.2) 70%, rgba(8,6,8,0.55) 100%)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 40%, rgba(8,6,8,0.6) 100%)" }} />

      {/* Content */}
      <div className="relative z-10 w-full px-4 md:px-10 pb-10 pt-24">
        {/* Breadcrumb */}
        <motion.div
          className="flex items-center gap-2 mb-4 text-[0.58rem] tracking-wider uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Link href="/courses" className="transition-colors hover:text-rose-400" style={{ color: "rgba(196,133,122,0.6)" }}>
            קורסים
          </Link>
          <span style={{ color: "rgba(196,133,122,0.3)" }}>›</span>
          <span style={{ color: "rgba(255,248,245,0.4)" }}>{course.category}</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="font-black leading-[1.0] mb-3"
          style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
        >
          <span
            style={{
              backgroundImage: "linear-gradient(135deg, #FFF8F5 0%, #D4998E 50%, #C4857A 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {course.title}
          </span>
        </motion.h1>

        {/* Subtitle */}
        {course.subtitle && (
          <motion.p
            className="text-base md:text-lg font-light mb-2"
            style={{ color: "rgba(255,248,245,0.55)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22 }}
          >
            {course.subtitle}
          </motion.p>
        )}

        <motion.p
          className="text-sm"
          style={{ color: "rgba(196,133,122,0.7)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.26 }}
        >
          עם {course.instructor.name}
        </motion.p>
      </div>
    </div>
  );
}

// ─── Video Player ─────────────────────────────────────────────────
function VideoPlayer({ videoId, provider = "youtube", poster, title }: {
  videoId: string; provider?: VideoProvider; poster: string; title: string;
}) {
  const [playing, setPlaying] = useState(false);

  const embedContent = (() => {
    if (provider === "direct") {
      return (
        <video
          src={videoId}
          className="absolute inset-0 w-full h-full"
          controls
          autoPlay
          style={{ objectFit: "cover" }}
        />
      );
    }
    const src = provider === "vimeo"
      ? `https://player.vimeo.com/video/${videoId}?autoplay=1`
      : `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0`;
    return (
      <iframe
        src={src}
        className="absolute inset-0 w-full h-full"
        allow="autoplay; fullscreen; encrypted-media"
        style={{ border: "none" }}
      />
    );
  })();

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{ aspectRatio: "16/9", background: "#0f0b0e", boxShadow: "0 12px 40px rgba(0,0,0,0.55)" }}
    >
      {playing ? embedContent : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster} alt={title} className="absolute inset-0 w-full h-full object-cover" style={{ filter: "brightness(0.6)" }} />
          <div className="absolute inset-0" style={{ background: "rgba(8,6,8,0.4)" }} />
          <motion.button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 group"
            whileHover={{ scale: 1.0 }}
          >
            <motion.div
              className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center"
              style={{ background: "rgba(196,133,122,0.9)", boxShadow: "0 0 0 8px rgba(196,133,122,0.18), 0 8px 32px rgba(196,133,122,0.4)" }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <Play size={26} fill="#080608" style={{ color: "#080608", marginRight: "-2px" }} />
            </motion.div>
            <span className="text-sm font-semibold" style={{ color: "rgba(255,248,245,0.7)" }}>צפי בטיזר</span>
          </motion.button>
        </>
      )}
    </div>
  );
}

// ─── Lesson row ───────────────────────────────────────────────────
function LessonRow({
  lesson,
  index,
  isAccessible,
  isActive,
  onSelect,
}: {
  lesson: (typeof COURSES)[0]["lessons"][0];
  index: number;
  tier: string;
  isAccessible: boolean;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={isAccessible ? onSelect : undefined}
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
      style={{
        background: isActive ? "rgba(196,133,122,0.1)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${isActive ? "rgba(196,133,122,0.3)" : "rgba(196,133,122,0.07)"}`,
        opacity: isAccessible ? 1 : 0.55,
        cursor: isAccessible ? "pointer" : "default",
      }}
    >
      {/* Number */}
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[0.58rem] font-black"
        style={{
          background: isActive ? "rgba(196,133,122,0.25)" : lesson.isFree ? "rgba(196,133,122,0.15)" : "rgba(255,255,255,0.04)",
          color: isActive || lesson.isFree ? "#C4857A" : "rgba(255,248,245,0.3)",
        }}
      >
        {index + 1}
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <p className="text-[0.8rem] font-medium truncate" style={{ color: isAccessible ? "#FFF8F5" : "rgba(255,248,245,0.45)" }}>
          {lesson.title || `שיעור ${index + 1}`}
        </p>
        {lesson.durationMin > 0 && (
          <p className="text-[0.56rem] mt-0.5" style={{ color: "rgba(255,248,245,0.25)" }}>
            {lesson.durationMin} דקות
          </p>
        )}
      </div>

      {/* Badge */}
      {lesson.isFree ? (
        <span className="text-[0.5rem] font-bold px-2 py-[2px] rounded-full" style={{ background: "rgba(74,155,111,0.12)", color: "#4A9B6F", border: "1px solid rgba(74,155,111,0.25)" }}>
          חינמי
        </span>
      ) : !isAccessible ? (
        <Lock size={12} style={{ color: "rgba(255,248,245,0.25)" }} />
      ) : null}
    </div>
  );
}

// ─── UI helpers ───────────────────────────────────────────────────
function Badge({ children, color, bg, border }: { children: React.ReactNode; color: string; bg: string; border: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.58rem] font-semibold"
      style={{ color, background: bg, border: `1px solid ${border}` }}
    >
      {children}
    </span>
  );
}
