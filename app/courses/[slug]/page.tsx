"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { Play, Lock, Clock, ChevronRight, ChevronLeft, Check } from "lucide-react";
import Link from "next/link";
import { COURSES, type VideoProvider, type CourseData } from "@/lib/courses-data";
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

type AuthState = { isLoggedIn: boolean; isAdmin: boolean; userTier: string | null };

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
  const [courseProgress, setCourseProgress]     = useState<Record<string, number>>({});
  const [vimeoThumbnails, setVimeoThumbnails]   = useState<Record<string, string>>({});
  const playerSectionRef = useRef<HTMLDivElement>(null);

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

  const course = courses.find((c) => c.slug === slug) ?? COURSES.find((c) => c.slug === slug);
  if (!course) notFound();

  const firstLesson           = course.lessons[0];
  const firstNonPreviewLesson = course.lessons.find((l) => !l.isFree) ?? firstLesson;
  const hasAccess             = isAdmin || tierCovers(userTier, course.tier);
  const activeLesson      = activeLessonId ? course.lessons.find((l) => l.id === activeLessonId) : null;
  const activeLessonIndex = activeLessonId ? course.lessons.findIndex((l) => l.id === activeLessonId) : -1;
  const prevLesson = activeLessonIndex > 0 ? course.lessons[activeLessonIndex - 1] : null;
  const nextLesson =
    activeLessonIndex >= 0 && activeLessonIndex < course.lessons.length - 1
      ? course.lessons[activeLessonIndex + 1]
      : null;

  // nav always visible: before any selection, subscribers skip the free preview (teaser)
  const navNext = activeLessonId ? nextLesson : ((hasAccess ? firstNonPreviewLesson : firstLesson) ?? null);
  const navPrev = activeLessonId ? prevLesson : null;
  const navNextLabel = navNext ? (navNext.title || `שיעור ${activeLessonId ? activeLessonIndex + 2 : 1}`) : "סוף הקורס";
  const navPrevLabel = navPrev ? (navPrev.title || `שיעור ${activeLessonIndex}`) : "תחילת הקורס";

  useEffect(() => {
    if (!isLoggedIn || !course) return;
    dbGetCourseProgress(course.id).then(setCourseProgress).catch(() => {});
  }, [isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const vimeoLessons = course.lessons.filter((l) => l.videoProvider === "vimeo" && l.videoId);
    if (vimeoLessons.length === 0) return;
    Promise.all(
      vimeoLessons.map((l) =>
        fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${l.videoId}`)
          .then((r) => r.json())
          .then((d: { thumbnail_url?: string }) => [l.id, d.thumbnail_url ?? ""] as const)
          .catch(() => [l.id, ""] as const)
      )
    ).then((pairs) => {
      const map: Record<string, string> = {};
      for (const [id, url] of pairs) if (url) map[id] = url;
      setVimeoThumbnails(map);
    }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!activeLessonId || !activeLesson) return;
    setVideoAccessDenied(false);
    setStartAt(0);
    playerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

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
  ) as VideoProvider ?? "youtube";
  const displayTitle = activeLesson?.title || course.title;

  const auth: AuthState = { isLoggedIn, isAdmin, userTier };

  return (
    <div className="min-h-screen sidebar-safe" style={{ background: "var(--black)", color: "var(--white)" }}>

      {/* ── Mobile Hero (Apple TV) ── */}
      <div className="md:hidden">
        <CourseHeroMobile course={course} auth={auth} />
      </div>

      {/* ── Desktop Hero (MasterClass split) ── */}
      <div className="hidden md:block">
        <CourseHeroDesktop course={course} auth={auth} />
      </div>

      {/* ── Skills Section ── */}
      {course.lessons.length > 0 && <SkillsSection course={course} vimeoThumbnails={vimeoThumbnails} />}

      {/* ── Video Player ── */}
      <div ref={playerSectionRef} className="px-4 md:px-16 py-8">
        <p className="text-[0.62rem] tracking-[0.2em] uppercase font-bold mb-4"
          style={{ color: "rgba(196,133,122,0.6)" }}>
          {activeLessonId ? `▶ ${displayTitle}` : "▶ צפי בטריילר"}
        </p>

        <div className="md:max-w-2xl">
        <motion.div
          className={activeLessonId ? "mb-3" : "mb-4"}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          {videoFetching ? (
            <div className="relative w-full rounded-2xl flex items-center justify-center"
              style={{ aspectRatio: "16/9", background: "#0f0b0e", boxShadow: "0 12px 40px rgba(0,0,0,0.55)" }}>
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: "rgba(196,133,122,0.4)", borderTopColor: "#C4857A" }} />
                <span className="text-[0.65rem]" style={{ color: "rgba(196,133,122,0.6)" }}>טוען שיעור...</span>
              </div>
            </div>
          ) : videoAccessDenied ? (
            <div className="relative w-full rounded-2xl flex items-center justify-center"
              style={{ aspectRatio: "16/9", background: "#0f0b0e", boxShadow: "0 12px 40px rgba(0,0,0,0.55)" }}>
              <div className="flex flex-col items-center gap-3 text-center px-8">
                <Lock size={28} style={{ color: "rgba(196,133,122,0.5)" }} />
                <p className="text-sm font-bold" style={{ color: "#FFF8F5" }}>אין גישה לשיעור זה</p>
                <p className="text-[0.65rem]" style={{ color: "#5A3830" }}>השיעור דורש מנוי מתאים</p>
                <a href="/subscription"
                  className="mt-1 px-5 py-2 rounded-xl text-[0.72rem] font-black transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#C4857A,#D4998E)", color: "#080608" }}>
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
              playLabel={!activeLessonId && (isLoggedIn || isAdmin) ? "צפי בפרק הראשון" : undefined}
            />
          ) : null}
        </motion.div>

        </div> {/* md:max-w-2xl */}

        {/* Lesson prev/next navigation — always visible */}
        {course.lessons.length > 0 && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => navNext && setActiveLessonId(navNext.id)}
              disabled={!navNext}
              className="flex-1 flex items-center justify-between px-4 py-3 rounded-xl transition-all disabled:opacity-25"
              style={{
                background: navNext ? "#140e12" : "rgba(255,255,255,0.02)",
                border: `1px solid ${navNext ? "rgba(196,133,122,0.28)" : "rgba(196,133,122,0.08)"}`,
              }}
            >
              <ChevronRight size={15} style={{ color: navNext ? "#C4857A" : "rgba(255,248,245,0.2)" }} />
              <div className="text-right">
                <p className="text-[0.52rem] tracking-wider mb-0.5" style={{ color: "rgba(196,133,122,0.55)" }}>שיעור הבא</p>
                <p className="text-[0.72rem] font-semibold" style={{ color: navNext ? "#FFF8F5" : "rgba(255,248,245,0.25)" }}>
                  {navNextLabel}
                </p>
              </div>
            </button>

            <button
              onClick={() => navPrev && setActiveLessonId(navPrev.id)}
              disabled={!navPrev}
              className="flex-1 flex items-center justify-between px-4 py-3 rounded-xl transition-all disabled:opacity-25"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(196,133,122,0.08)",
              }}
            >
              <div className="text-right">
                <p className="text-[0.52rem] tracking-wider mb-0.5" style={{ color: "rgba(255,248,245,0.25)" }}>שיעור קודם</p>
                <p className="text-[0.72rem] font-semibold" style={{ color: navPrev ? "rgba(255,248,245,0.6)" : "rgba(255,248,245,0.2)" }}>
                  {navPrevLabel}
                </p>
              </div>
              <ChevronLeft size={15} style={{ color: "rgba(255,248,245,0.2)" }} />
            </button>
          </div>
        )}
      </div>

      {/* ── Lesson Plan ── */}
      <div className="px-4 md:px-16 pb-12">
        <div className="flex items-baseline gap-3 mb-1">
          <h2 className="text-xl font-black" style={{ color: "#FFF8F5" }}>תוכנית הלמידה</h2>
          <span className="text-sm" style={{ color: "rgba(255,248,245,0.35)" }}>
            {course.lessons.length} שיעורים
          </span>
        </div>
        <div className="mt-4">
          {course.lessons.map((lesson, i) => {
            const ytThumb     = lesson.videoProvider === "youtube" && lesson.videoId
              ? `https://img.youtube.com/vi/${lesson.videoId}/mqdefault.jpg`
              : null;
            const vimeoThumb  = lesson.videoProvider === "vimeo" ? (vimeoThumbnails[lesson.id] ?? null) : null;
            const thumbSrc    = course.lessonThumbnails?.[lesson.id] || ytThumb || vimeoThumb || course.image;
            return (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                index={i}
                isAccessible={lesson.isFree || isLoggedIn || isAdmin}
                isActive={lesson.id === activeLessonId}
                progressSeconds={courseProgress[lesson.id] ?? 0}
                courseImage={thumbSrc}
                onSelect={() => setActiveLessonId(lesson.id)}
              />
            );
          })}
        </div>
      </div>

      {/* ── Instructor ── */}
      <div className="px-4 md:px-16 pb-16">
        <InstructorSection course={course} />
      </div>
    </div>
  );
}

// ─── Mobile Hero — Apple TV style ────────────────────────────────
function CourseHeroMobile({ course, auth }: { course: CourseData; auth: AuthState }) {
  return (
    <div className="relative overflow-hidden" style={{ height: "100svh" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={course.image} alt={course.title}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: "50% 20%" }}
        loading="eager"
      />
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to bottom, rgba(8,6,8,0.45) 0%, rgba(8,6,8,0.05) 35%, rgba(8,6,8,0.7) 65%, #080608 100%)"
      }} />

      <div className="absolute inset-x-0 bottom-0 px-5 pb-12 pt-24">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 mb-4 text-[0.52rem] tracking-widest uppercase">
          <Link href="/courses" style={{ color: "rgba(196,133,122,0.6)" }}>קורסים</Link>
          <span style={{ color: "rgba(196,133,122,0.3)" }}>›</span>
          <span style={{ color: "rgba(255,248,245,0.4)" }}>{course.category}</span>
        </div>

        {/* Badges */}
        <div className="flex gap-2 mb-4">
          <Badge color="#C4857A" bg="rgba(196,133,122,0.15)" border="rgba(196,133,122,0.3)">
            {TIER_LABEL[course.tier]}
          </Badge>
          <Badge color="rgba(255,248,245,0.5)" bg="rgba(255,255,255,0.06)" border="rgba(255,255,255,0.1)">
            {DIFF_LABEL[course.difficulty]}
          </Badge>
        </div>

        {/* Title */}
        <h1 className="font-black leading-[1.05] mb-3" style={{ fontSize: "clamp(2rem, 9vw, 3rem)" }}>
          <span style={{
            backgroundImage: "linear-gradient(135deg, #FFF8F5 0%, #D4998E 60%, #C4857A 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            {course.title}
          </span>
        </h1>

        {course.subtitle && (
          <p className="text-sm mb-1 leading-snug" style={{ color: "rgba(255,248,245,0.55)" }}>{course.subtitle}</p>
        )}

        <div className="flex gap-3 text-[0.62rem] mb-6" style={{ color: "rgba(255,248,245,0.4)" }}>
          <span>{course.lessons.length} שיעורים</span>
          <span>·</span>
          <span>{course.duration}</span>
        </div>

        <CourseCTA course={course} auth={auth} />
      </div>
    </div>
  );
}

// ─── Desktop Hero — MasterClass split ────────────────────────────
function CourseHeroDesktop({ course, auth }: { course: CourseData; auth: AuthState }) {
  return (
    <div className="relative" style={{ height: "88vh", maxHeight: 800, background: "#080608" }} dir="ltr">
      {/* Left — Image */}
      <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: "46%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={course.image} alt={course.title}
          className="w-full h-full"
          style={{ objectFit: "cover", objectPosition: "center center" }}
          loading="eager"
        />
        {/* Blend right edge into panel */}
        <div className="absolute inset-y-0 right-0 w-40"
          style={{ background: "linear-gradient(to right, transparent, #080608)" }} />
        {/* Blend bottom */}
        <div className="absolute inset-x-0 bottom-0 h-20"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(8,6,8,0.85))" }} />
      </div>

      {/* Right — Info */}
      <div className="absolute inset-y-0 right-0 flex flex-col justify-center overflow-y-auto"
        style={{ width: "56%", padding: "3rem 3.5rem 3rem 1.5rem" }} dir="rtl">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 mb-6 text-[0.52rem] tracking-widest uppercase">
          <Link href="/courses" className="transition-colors hover:text-rose-400"
            style={{ color: "rgba(196,133,122,0.6)" }}>קורסים</Link>
          <span style={{ color: "rgba(196,133,122,0.3)" }}>›</span>
          <span style={{ color: "rgba(255,248,245,0.4)" }}>{course.category}</span>
        </div>

        {/* Badges */}
        <div className="flex gap-2 mb-5">
          <Badge color="#C4857A" bg="rgba(196,133,122,0.1)" border="rgba(196,133,122,0.25)">
            {TIER_LABEL[course.tier]}
          </Badge>
          <Badge color="rgba(255,248,245,0.5)" bg="rgba(255,255,255,0.04)" border="rgba(255,255,255,0.08)">
            {DIFF_LABEL[course.difficulty]}
          </Badge>
          <Badge color="rgba(255,248,245,0.5)" bg="rgba(255,255,255,0.04)" border="rgba(255,255,255,0.08)">
            <Clock size={10} className="inline ml-1" />{course.duration}
          </Badge>
        </div>

        {/* Title */}
        <motion.h1
          className="font-black leading-[1.05] mb-3"
          style={{ fontSize: "clamp(1.9rem, 2.8vw, 3rem)" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <span style={{
            backgroundImage: "linear-gradient(135deg, #FFF8F5 0%, #D4998E 50%, #C4857A 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            {course.title}
          </span>
        </motion.h1>

        {course.subtitle && (
          <p className="text-lg font-light mb-3" style={{ color: "rgba(255,248,245,0.55)" }}>
            {course.subtitle}
          </p>
        )}

        {course.shortDesc && (
          <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,248,245,0.4)" }}>
            {course.shortDesc}
          </p>
        )}

        {/* Stats */}
        <div className="flex gap-4 text-sm mb-7" style={{ color: "rgba(255,248,245,0.38)" }}>
          <span>{course.lessons.length} שיעורים</span>
          <span>·</span>
          <span>{course.duration}</span>
        </div>

        {/* CTA */}
        <div style={{ maxWidth: 280 }}>
          <CourseCTA course={course} auth={auth} />
        </div>

        {/* Instructor strip */}
        <div className="flex items-center gap-3 mt-7 pt-6"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={course.instructor.photoUrl} alt={course.instructor.name}
            className="w-9 h-9 rounded-full object-cover shrink-0"
            style={{ border: "1.5px solid rgba(196,133,122,0.3)" }}
          />
          <div>
            <p className="text-[0.5rem] tracking-widest uppercase" style={{ color: "rgba(196,133,122,0.55)" }}>המנטורית שלך</p>
            <p className="text-[0.78rem] font-semibold" style={{ color: "rgba(255,248,245,0.75)" }}>
              {course.instructor.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skills Section ───────────────────────────────────────────────
function SkillsSection({ course, vimeoThumbnails }: { course: CourseData; vimeoThumbnails: Record<string, string> }) {
  // Use admin-defined highlights if they exist, else fall back to first 4 lessons
  const hasHighlights = course.highlights && course.highlights.length > 0;
  const cards = hasHighlights
    ? course.highlights!.map((h) => ({ id: h.id, text: h.text, imageUrl: h.imageUrl || course.image }))
    : course.lessons.slice(0, 4).map((l) => ({
        id: l.id, text: l.title || "",
        imageUrl: course.lessonThumbnails?.[l.id] || vimeoThumbnails[l.id] || course.image,
      }));

  if (cards.length === 0) return null;

  return (
    <div className="px-4 md:px-16 py-10">
      <h2 className="text-lg font-black mb-5" style={{ color: "#FFF8F5" }}>מה תגלי בקורס זה</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((card, i) => (
          <div key={card.id} className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={card.imageUrl} alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: "brightness(0.28)" }} />
            <div
              className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-[0.58rem] font-black"
              style={{ background: "rgba(196,133,122,0.85)", color: "#080608" }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="absolute inset-x-0 bottom-0 px-3 py-3"
              style={{ background: "linear-gradient(to top, rgba(8,6,8,0.92), transparent)" }}>
              <p className="text-[0.66rem] font-semibold leading-snug"
                style={{ color: "rgba(255,248,245,0.85)" }}>
                {card.text || `שיעור ${i + 1}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Course CTA (shared) ─────────────────────────────────────────
function CourseCTA({ course, auth }: { course: CourseData; auth: AuthState }) {
  const btnClass = "block w-full py-3 rounded-xl text-center text-[0.85rem] font-black transition-all hover:opacity-90";
  const btnStyle: React.CSSProperties = {
    background: "linear-gradient(135deg,#C4857A,#D4998E)",
    color: "#080608",
    boxShadow: "0 4px 18px rgba(196,133,122,0.3)",
  };

  const buyHref = course.purchaseUrl || "/subscription";
  const buyTarget = course.purchaseUrl ? "_blank" : undefined;
  const buyRel = course.purchaseUrl ? "noopener noreferrer" : undefined;

  if (!auth.isLoggedIn) {
    const label = course.price != null ? `הצטרפי עכשיו · ₪${course.price}` : "הצטרפי עכשיו";
    return (
      <>
        <a href={buyHref} target={buyTarget} rel={buyRel} className={btnClass} style={btnStyle}>{label}</a>
        <p className="text-center text-[0.55rem] mt-2" style={{ color: "rgba(255,248,245,0.3)" }}>
          גישה מלאה עם מנוי {TIER_LABEL[course.tier]}
        </p>
      </>
    );
  }
  if (auth.isAdmin || tierCovers(auth.userTier, course.tier)) {
    return (
      <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl"
        style={{ background: "rgba(74,155,111,0.1)", border: "1px solid rgba(74,155,111,0.22)" }}>
        <Check size={14} style={{ color: "#4A9B6F" }} />
        <span className="text-[0.78rem] font-bold" style={{ color: "#4A9B6F" }}>גישה מלאה</span>
      </div>
    );
  }
  const upgradeLabel = course.price != null ? `רכשי קורס · ₪${course.price}` : "שדרגי מנוי ↑";
  return (
    <>
      <a href={buyHref} target={buyTarget} rel={buyRel} className={btnClass} style={btnStyle}>{upgradeLabel}</a>
      <p className="text-center text-[0.55rem] mt-2" style={{ color: "rgba(255,248,245,0.3)" }}>
        נדרש מנוי {TIER_LABEL[course.tier]}
      </p>
    </>
  );
}

// ─── Instructor Section ───────────────────────────────────────────
function InstructorSection({ course }: { course: CourseData }) {
  return (
    <div
      className="rounded-2xl p-7 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-6"
      style={{ background: "#0f0d0e", border: "1px solid rgba(196,133,122,0.1)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={course.instructor.photoUrl} alt={course.instructor.name}
        className="w-24 h-24 rounded-full object-cover shrink-0"
        style={{ border: "2px solid rgba(196,133,122,0.35)", boxShadow: "0 0 0 4px rgba(196,133,122,0.06)" }}
      />
      <div>
        <p className="text-[0.52rem] tracking-[0.28em] uppercase mb-1.5" style={{ color: "#C4857A" }}>המנטורית שלך</p>
        <h3 className="text-xl font-black mb-3" style={{ color: "#FFF8F5" }}>{course.instructor.name}</h3>
        {course.instructor.bio && (
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,248,245,0.45)" }}>
            {course.instructor.bio}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── YouTube embed with IFrame API ────────────────────────────────
function YouTubeEmbed({ videoId, startAt, onProgress }: {
  videoId: string; startAt: number; onProgress?: (s: number) => void;
}) {
  const divRef     = useRef<HTMLDivElement>(null);
  const playerRef  = useRef<any>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
            if (e.data === 1) {
              intervalRef.current = setInterval(() => {
                const t = playerRef.current?.getCurrentTime?.() ?? 0;
                if (t > 0) onProgress?.(Math.floor(t));
              }, 10_000);
            } else {
              if (intervalRef.current) clearInterval(intervalRef.current);
              if (e.data === 2 || e.data === 0) {
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

// ─── Vimeo embed with Player SDK (progress tracking) ─────────────
function VimeoEmbed({ videoId, startAt, onProgress }: {
  videoId: string; startAt: number; onProgress?: (s: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let player: any = null;
    let mounted     = true;

    (async () => {
      const { default: Player } = await import("@vimeo/player");
      if (!mounted || !containerRef.current) return;

      player = new Player(containerRef.current, {
        id: Number(videoId),
        autoplay: true,
        responsive: true,
        dnt: true,
      });

      if (startAt > 0) player.setCurrentTime(startAt).catch(() => {});

      player.on("play", () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(async () => {
          const t = await player.getCurrentTime().catch(() => 0);
          if (t > 0) onProgress?.(Math.floor(t));
        }, 10_000);
      });

      player.on("pause", async () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        const t = await player.getCurrentTime().catch(() => 0);
        if (t > 0) onProgress?.(Math.floor(t));
      });

      player.on("ended", () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      });
    })();

    return () => {
      mounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      player?.destroy().catch(() => {});
    };
  }, [videoId]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />;
}

// ─── Video Player ─────────────────────────────────────────────────
function VideoPlayer({ videoId, provider = "youtube", poster, title, autoStart = false, startAt = 0, onProgress, playLabel }: {
  videoId: string; provider?: VideoProvider; poster: string; title: string;
  autoStart?: boolean; startAt?: number; onProgress?: (s: number) => void; playLabel?: string;
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
      return <VimeoEmbed videoId={videoId} startAt={startAt} onProgress={onProgress} />;
    }
    return <YouTubeEmbed videoId={videoId} startAt={startAt} onProgress={onProgress} />;
  })();

  return (
    <div className="relative w-full overflow-hidden rounded-2xl"
      style={{ aspectRatio: "16/9", background: "#0f0b0e", boxShadow: "0 12px 40px rgba(0,0,0,0.55)" }}>
      {playing ? embedContent : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster} alt={title} className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.6)" }} />
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
              {autoStart
                ? (startAt > 0 ? `המשך מ-${Math.floor(startAt / 60)}:${String(startAt % 60).padStart(2, "0")}` : "צפה בשיעור")
                : (playLabel ?? "צפי בטיזר")}
            </span>
          </motion.button>
        </>
      )}
    </div>
  );
}

// ─── Lesson Row — BBC Maestro style ──────────────────────────────
function LessonRow({
  lesson,
  index,
  isAccessible,
  isActive,
  progressSeconds,
  courseImage,
  onSelect,
}: {
  lesson: CourseData["lessons"][0];
  index: number;
  isAccessible: boolean;
  isActive: boolean;
  progressSeconds: number;
  courseImage: string;
  onSelect: () => void;
}) {
  const totalSec = lesson.durationMin * 60;
  const progress = totalSec > 0 ? Math.min((progressSeconds / totalSec) * 100, 100) : 0;
  const timeLabel = lesson.durationMin > 0 ? `${lesson.durationMin}:00` : "";

  return (
    <div
      onClick={isAccessible ? onSelect : undefined}
      className="flex items-center gap-3 md:gap-4 px-2 md:px-3 py-3 rounded-xl transition-all"
      style={{
        cursor: isAccessible ? "pointer" : "default",
        background: isActive ? "rgba(196,133,122,0.08)" : "transparent",
        opacity: isAccessible ? 1 : 0.48,
      }}
    >
      {/* Number */}
      <span
        className="text-[0.62rem] font-mono w-5 shrink-0 text-center tabular-nums"
        style={{ color: isActive ? "#C4857A" : "rgba(255,248,245,0.28)" }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Thumbnail */}
      <div className="relative shrink-0 rounded-lg overflow-hidden" style={{ width: 72, height: 54 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={courseImage} alt=""
          className="w-full h-full object-cover"
          style={{ filter: `brightness(${isActive ? 0.55 : 0.3})` }} />
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Play size={13} fill="#C4857A" style={{ color: "#C4857A" }} />
          </div>
        )}
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="h-full" style={{ width: `${progress}%`, background: "linear-gradient(90deg,#C4857A,#D4998E)" }} />
          </div>
        )}
      </div>

      {/* Title + free badge */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[0.8rem] font-medium leading-snug truncate"
          style={{ color: isAccessible ? (isActive ? "#FFF8F5" : "rgba(255,248,245,0.75)") : "rgba(255,248,245,0.3)" }}
        >
          {lesson.title || `שיעור ${index + 1}`}
        </p>
        {lesson.isFree && (
          <span
            className="text-[0.47rem] font-bold px-1.5 py-[1px] rounded-full mt-1 inline-block"
            style={{ background: "rgba(74,155,111,0.12)", color: "#4A9B6F", border: "1px solid rgba(74,155,111,0.2)" }}
          >
            חינמי
          </span>
        )}
      </div>

      {/* Duration + lock */}
      <div className="flex items-center gap-2 shrink-0">
        {timeLabel && (
          <span className="text-[0.6rem] tabular-nums" style={{ color: "rgba(255,248,245,0.28)" }}>
            {timeLabel}
          </span>
        )}
        {!isAccessible && <Lock size={11} style={{ color: "rgba(255,248,245,0.18)" }} />}
      </div>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────
function Badge({ children, color, bg, border }: {
  children: React.ReactNode; color: string; bg: string; border: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.58rem] font-semibold"
      style={{ color, background: bg, border: `1px solid ${border}` }}
    >
      {children}
    </span>
  );
}
