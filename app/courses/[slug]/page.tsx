"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { Play, Lock, Clock, ChevronRight, ChevronLeft, Check } from "lucide-react";
import Link from "next/link";
import { COURSES, type VideoProvider } from "@/lib/courses-data";
import { useCourses } from "@/lib/courses-context";
import { createClient } from "@/lib/supabase/client";
import { dbGetProgress, dbGetCourseProgress, dbSaveProgress } from "@/lib/supabase/progress-db";

// ─── YouTube IFrame API loader ────────────────────────────────────
declare global { interface Window { YT: any; onYouTubeIframeAPIReady?: () => void } }
let _ytPromise: Promise<void> | null = null;
function ensureYouTubeAPI(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (_ytPromise) return _ytPromise;
  if (window.YT?.Player) return (_ytPromise = Promise.resolve());
  _ytPromise = new Promise<void>((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { resolve(); prev?.(); };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  });
  return _ytPromise;
}

const DIFF_LABEL = { beginner: "מתחילות", intermediate: "בינוני", advanced: "מתקדם" } as const;
const TIER_LABEL = { basic: "Basic", pro: "Pro", elite: "Elite" } as const;
const TIER_RANK: Record<string, number> = { basic: 1, pro: 2, elite: 3 };
const tierCovers = (userTier: string | null, required: string) =>
  (TIER_RANK[userTier ?? ""] ?? 0) >= (TIER_RANK[required] ?? 0);

// ─── Page ────────────────────────────────────────────────────────
export default function CoursePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { courses } = useCourses();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin]       = useState(false);
  const [userTier, setUserTier]     = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [lessonVideo, setLessonVideo]       = useState<{ videoId: string; videoProvider: string } | null>(null);
  const [videoFetching, setVideoFetching]   = useState(false);
  const [videoAccessDenied, setVideoAccessDenied] = useState(false);
  const [startAt, setStartAt]               = useState(0);
  const [courseProgress, setCourseProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data }) => {
      if (data.user) setIsLoggedIn(true);
    });
    sb.from("profiles").select("role, subscription_tier").then(({ data }) => {
      if (data?.[0]?.role === "admin") setIsAdmin(true);
      setUserTier(data?.[0]?.subscription_tier ?? null);
    });
  }, []);

  // Try context first (live admin changes), fall back to static
  const course = courses.find((c) => c.slug === slug) ?? COURSES.find((c) => c.slug === slug);
  if (!course) notFound();

  const firstLesson    = course.lessons[0];
  const activeLesson   = activeLessonId ? course.lessons.find((l) => l.id === activeLessonId) : null;
  const activeLessonIndex = activeLessonId ? course.lessons.findIndex((l) => l.id === activeLessonId) : -1;
  const prevLesson = activeLessonIndex > 0 ? course.lessons[activeLessonIndex - 1] : null;
  const nextLesson = activeLessonIndex >= 0 && activeLessonIndex < course.lessons.length - 1
    ? course.lessons[activeLessonIndex + 1]
    : null;

  // טעינת התקדמות לכל הקורס (לאינדיקטורים ברשימה)
  useEffect(() => {
    if (!isLoggedIn || !course) return;
    dbGetCourseProgress(course.id).then(setCourseProgress).catch(() => {});
  }, [isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  // כשמשתנה שיעור פעיל — שיעורים חינמיים מהContext, שאר דרך API
  useEffect(() => {
    if (!activeLessonId || !activeLesson) return;
    setVideoAccessDenied(false);
    setStartAt(0);

    // טעינת נקודת המשך שמורה
    if (isLoggedIn) {
      dbGetProgress(activeLessonId).then(setStartAt).catch(() => {});
    }

    if (activeLesson.isFree) {
      setLessonVideo({ videoId: activeLesson.videoId, videoProvider: activeLesson.videoProvider ?? "youtube" });
      return;
    }

    setLessonVideo(null);
    setVideoFetching(true);
    const ctrl = new AbortController();

    fetch(`/api/lesson-video?lessonId=${activeLessonId}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setVideoAccessDenied(true); return; }
        setLessonVideo({ videoId: data.videoId, videoProvider: data.videoProvider ?? "youtube" });
      })
      .catch(() => {})
      .finally(() => setVideoFetching(false));

    return () => ctrl.abort();
  }, [activeLessonId]); // eslint-disable-line react-hooks/exhaustive-deps

  // שמירת התקדמות — stable callback
  const activeLessonIdRef = useRef(activeLessonId);
  activeLessonIdRef.current = activeLessonId;
  const courseIdRef = useRef(course.id);
  courseIdRef.current = course.id;

  const handleProgress = useCallback((seconds: number) => {
    const lid = activeLessonIdRef.current;
    const cid = courseIdRef.current;
    if (!lid) return;
    dbSaveProgress(lid, cid, seconds).catch(() => {});
    setCourseProgress((prev) => ({ ...prev, [lid]: seconds }));
  }, []);

  const displayVideoId = activeLessonId
    ? (lessonVideo?.videoId || "")
    : (course.videoId || firstLesson?.videoId || "");
  const displayProvider = (activeLessonId
    ? lessonVideo?.videoProvider
    : (course.videoId ? (course.videoProvider ?? "youtube") : (firstLesson?.videoProvider ?? "youtube"))
  ) as import("@/lib/courses-data").VideoProvider ?? "youtube";
  const displayTitle = activeLesson?.title || course.title;

  return (
    <div className="min-h-screen sidebar-safe" style={{ background: "var(--black)", color: "var(--white)" }}>
      {/* ── Cinematic header ── */}
      <CinematicHeader course={course} />

      {/* ── Main content ── */}
      <div className="px-4 md:px-10 py-10 max-w-4xl">
        {/* Video player area */}
        <motion.div
          className={activeLessonId ? "mb-3" : "mb-10"}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          {videoFetching ? (
            <div
              className="relative w-full rounded-2xl flex items-center justify-center"
              style={{ aspectRatio: "16/9", background: "#0f0b0e", boxShadow: "0 12px 40px rgba(0,0,0,0.55)" }}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "rgba(196,133,122,0.4)", borderTopColor: "#C4857A" }} />
                <span className="text-[0.65rem]" style={{ color: "rgba(196,133,122,0.6)" }}>טוען שיעור...</span>
              </div>
            </div>
          ) : videoAccessDenied ? (
            <div
              className="relative w-full rounded-2xl flex items-center justify-center"
              style={{ aspectRatio: "16/9", background: "#0f0b0e", boxShadow: "0 12px 40px rgba(0,0,0,0.55)" }}
            >
              <div className="flex flex-col items-center gap-3 text-center px-8">
                <Lock size={28} style={{ color: "rgba(196,133,122,0.5)" }} />
                <p className="text-sm font-bold" style={{ color: "#FFF8F5" }}>אין גישה לשיעור זה</p>
                <p className="text-[0.65rem]" style={{ color: "#5A3830" }}>השיעור דורש מנוי מתאים</p>
                <a
                  href="/subscription"
                  className="mt-1 px-5 py-2 rounded-xl text-[0.72rem] font-black transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#C4857A,#D4998E)", color: "#080608" }}
                >
                  שדרגי מנוי
                </a>
              </div>
            </div>
          ) : displayVideoId ? (
            <VideoPlayer
              key={activeLessonId ?? "trailer"}
              videoId={displayVideoId}
              provider={displayProvider}
              poster={course.videoThumbnailUrl || course.image}
              title={displayTitle}
              autoStart={!!activeLessonId}
              startAt={startAt}
              onProgress={activeLessonId ? handleProgress : undefined}
            />
          ) : null}
        </motion.div>

        {/* Lesson navigation */}
        {activeLessonId && (
          <div className="flex gap-2 mb-8">
            {/* שיעור הבא — prominent, left side in RTL */}
            <button
              onClick={() => nextLesson && setActiveLessonId(nextLesson.id)}
              disabled={!nextLesson}
              className="flex-1 flex items-center justify-between px-4 py-3 rounded-xl transition-all disabled:opacity-25 group"
              style={{
                background: nextLesson ? "#140e12" : "rgba(255,255,255,0.02)",
                border: `1px solid ${nextLesson ? "rgba(196,133,122,0.28)" : "rgba(196,133,122,0.08)"}`,
              }}
            >
              <ChevronRight size={15} style={{ color: nextLesson ? "#C4857A" : "rgba(255,248,245,0.2)" }} />
              <div className="text-right">
                <p className="text-[0.52rem] tracking-wider mb-0.5" style={{ color: "rgba(196,133,122,0.55)" }}>שיעור הבא</p>
                <p className="text-[0.72rem] font-semibold" style={{ color: nextLesson ? "#FFF8F5" : "rgba(255,248,245,0.25)" }}>
                  {nextLesson ? (nextLesson.title || `שיעור ${activeLessonIndex + 2}`) : "סוף הקורס"}
                </p>
              </div>
            </button>

            {/* שיעור קודם — subtle, right side in RTL */}
            <button
              onClick={() => prevLesson && setActiveLessonId(prevLesson.id)}
              disabled={!prevLesson}
              className="flex-1 flex items-center justify-between px-4 py-3 rounded-xl transition-all disabled:opacity-25"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(196,133,122,0.08)",
              }}
            >
              <div className="text-right">
                <p className="text-[0.52rem] tracking-wider mb-0.5" style={{ color: "rgba(255,248,245,0.25)" }}>שיעור קודם</p>
                <p className="text-[0.72rem] font-semibold" style={{ color: prevLesson ? "rgba(255,248,245,0.6)" : "rgba(255,248,245,0.2)" }}>
                  {prevLesson ? (prevLesson.title || `שיעור ${activeLessonIndex}`) : "תחילת הקורס"}
                </p>
              </div>
              <ChevronLeft size={15} style={{ color: "rgba(255,248,245,0.2)" }} />
            </button>
          </div>
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
                    progressSeconds={courseProgress[lesson.id] ?? 0}
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
                <p className="text-[0.55rem] tracking-[0.28em] uppercase mb-1.5" style={{ color: "#C4857A" }}>המנטורית שלך</p>
                <h3 className="text-base font-black mb-2" style={{ color: "#FFF8F5" }}>{course.instructor.name}</h3>
                {course.instructor.bio && (
                  <p className="text-[0.68rem] leading-relaxed" style={{ color: "#5A3830" }}>{course.instructor.bio}</p>
                )}
              </div>

              {/* CTA — לפי מצב auth + tier */}
              <div className="px-5 pb-5">
                {!isLoggedIn ? (
                  <>
                    <Link
                      href="/subscription"
                      className="block w-full py-3 rounded-xl text-center text-[0.82rem] font-black transition-all hover:opacity-90"
                      style={{ background: "linear-gradient(135deg,#C4857A,#D4998E)", color: "#080608", boxShadow: "0 4px 18px rgba(196,133,122,0.3)" }}
                    >
                      הצטרפי עכשיו
                    </Link>
                    <p className="text-center text-[0.55rem] mt-2" style={{ color: "#3A2020" }}>
                      גישה מלאה עם מנוי {TIER_LABEL[course.tier]}
                    </p>
                  </>
                ) : isAdmin || tierCovers(userTier, course.tier) ? (
                  <div
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl"
                    style={{ background: "rgba(74,155,111,0.1)", border: "1px solid rgba(74,155,111,0.22)" }}
                  >
                    <Check size={14} style={{ color: "#4A9B6F" }} />
                    <span className="text-[0.78rem] font-bold" style={{ color: "#4A9B6F" }}>גישה מלאה</span>
                  </div>
                ) : (
                  <>
                    <Link
                      href="/subscription"
                      className="block w-full py-3 rounded-xl text-center text-[0.82rem] font-black transition-all hover:opacity-90"
                      style={{ background: "linear-gradient(135deg,#C4857A,#D4998E)", color: "#080608", boxShadow: "0 4px 18px rgba(196,133,122,0.3)" }}
                    >
                      שדרגי מנוי ↑
                    </Link>
                    <p className="text-center text-[0.55rem] mt-2" style={{ color: "#3A2020" }}>
                      נדרש מנוי {TIER_LABEL[course.tier]}
                    </p>
                  </>
                )}
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
      {/* Blurred background fill */}
      <div className="absolute inset-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={course.image} alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "blur(40px) brightness(0.22) saturate(0.5)", transform: "scale(1.1)" }}
        />
      </div>
      {/* Portrait image — full, contained, centered, no crop */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={course.image} alt={course.title}
          style={{ height: "100%", width: "auto", objectFit: "contain", filter: "brightness(0.72)" }}
        />
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

// ─── YouTube embed with IFrame API (progress tracking) ───────────
function YouTubeEmbed({ videoId, startAt, onProgress }: {
  videoId: string; startAt: number; onProgress?: (s: number) => void;
}) {
  const divRef  = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // seek if startAt changes after player is already created (race condition)
  useEffect(() => {
    if (startAt > 0 && playerRef.current?.seekTo) {
      playerRef.current.seekTo(startAt, true);
    }
  }, [startAt]);

  useEffect(() => {
    let mounted = true;
    ensureYouTubeAPI().then(() => {
      if (!mounted || !divRef.current) return;
      playerRef.current = new window.YT.Player(divRef.current, {
        videoId,
        playerVars: { autoplay: 1, controls: 1, modestbranding: 1, rel: 0, start: Math.floor(startAt) },
        events: {
          onStateChange(e: { data: number }) {
            if (e.data === 1) { // PLAYING
              intervalRef.current = setInterval(() => {
                const t = playerRef.current?.getCurrentTime?.() ?? 0;
                if (t > 0) onProgress?.(Math.floor(t));
              }, 10_000);
            } else {
              if (intervalRef.current) clearInterval(intervalRef.current);
              if (e.data === 2 || e.data === 0) { // PAUSED or ENDED
                const t = playerRef.current?.getCurrentTime?.() ?? 0;
                if (t > 0) onProgress?.(Math.floor(t));
              }
            }
          },
        },
      });
    });
    return () => {
      mounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      playerRef.current?.destroy?.();
    };
  }, [videoId]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={divRef} className="absolute inset-0 w-full h-full" />;
}

// ─── Video Player ─────────────────────────────────────────────────
function VideoPlayer({ videoId, provider = "youtube", poster, title, autoStart = false, startAt = 0, onProgress }: {
  videoId: string; provider?: VideoProvider; poster: string; title: string;
  autoStart?: boolean; startAt?: number; onProgress?: (s: number) => void;
}) {
  const [playing, setPlaying] = useState(autoStart);

  const embedContent = (() => {
    if (provider === "direct") {
      return (
        <video src={videoId} className="absolute inset-0 w-full h-full" controls autoPlay
          style={{ objectFit: "cover" }}
          onTimeUpdate={(e) => onProgress?.(Math.floor(e.currentTarget.currentTime))}
        />
      );
    }
    if (provider === "vimeo") {
      const src = `https://player.vimeo.com/video/${videoId}?autoplay=1${startAt > 0 ? `#t=${startAt}s` : ""}`;
      return (
        <iframe src={src} className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; encrypted-media" style={{ border: "none" }} />
      );
    }
    // YouTube — with IFrame API for progress tracking
    return <YouTubeEmbed videoId={videoId} startAt={startAt} onProgress={onProgress} />;
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
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <Play size={26} fill="#080608" style={{ color: "#080608", marginRight: "-2px" }} />
            </motion.div>
            <span className="text-sm font-semibold" style={{ color: "rgba(255,248,245,0.7)" }}>
              {autoStart ? (startAt > 0 ? `המשך מ-${Math.floor(startAt / 60)}:${String(startAt % 60).padStart(2, "0")}` : "צפה בשיעור") : "צפי בטיזר"}
            </span>
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
  progressSeconds,
  onSelect,
}: {
  lesson: (typeof COURSES)[0]["lessons"][0];
  index: number;
  tier: string;
  isAccessible: boolean;
  isActive: boolean;
  progressSeconds: number;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={isAccessible ? onSelect : undefined}
      className="relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
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

      {/* Badge / progress */}
      {lesson.isFree ? (
        <span className="text-[0.5rem] font-bold px-2 py-[2px] rounded-full" style={{ background: "rgba(74,155,111,0.12)", color: "#4A9B6F", border: "1px solid rgba(74,155,111,0.25)" }}>
          חינמי
        </span>
      ) : !isAccessible ? (
        <Lock size={12} style={{ color: "rgba(255,248,245,0.25)" }} />
      ) : null}

      {/* Progress bar — shown when there's saved progress */}
      {progressSeconds > 0 && lesson.durationMin > 0 && (
        <div className="absolute bottom-0 right-0 left-0 h-[2px] rounded-b-xl overflow-hidden">
          <div
            className="h-full"
            style={{
              width: `${Math.min((progressSeconds / (lesson.durationMin * 60)) * 100, 100)}%`,
              background: "linear-gradient(90deg, #C4857A, #D4998E)",
            }}
          />
        </div>
      )}
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
