"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { CourseData } from "@/lib/courses-data";

const COURSE_PRICE = 489;

const TIER_LABEL: Record<string, string> = {
  basic: "Basic",
  pro: "Pro",
  elite: "Elite",
};

const TIER_COLOR: Record<string, { color: string; bg: string; border: string }> = {
  basic: {
    color: "rgba(196,133,122,0.85)",
    bg: "rgba(196,133,122,0.08)",
    border: "rgba(196,133,122,0.3)",
  },
  pro: {
    color: "rgba(212,153,142,0.95)",
    bg: "rgba(212,153,142,0.1)",
    border: "rgba(212,153,142,0.35)",
  },
  elite: {
    color: "#D4998E",
    bg: "rgba(212,153,142,0.14)",
    border: "#D4998E",
  },
};

interface CourseCardProps {
  course: CourseData;
}

export function CourseCard({ course }: CourseCardProps) {
  const [showVideo, setShowVideo] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tc = TIER_COLOR[course.tier];

  const handleMouseEnter = useCallback(() => {
    if (!course.videoId) return;
    timerRef.current = setTimeout(() => setShowVideo(true), 380);
  }, [course.videoId]);

  const handleMouseLeave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowVideo(false);
  }, []);

  return (
    <div className="flex flex-col">
      <Link href={`/courses/${course.slug}`} className="block">
      <div
        className="relative rounded-xl overflow-hidden cursor-pointer group select-none"
        style={{ aspectRatio: "3/4", background: "#140e12" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Course image */}
        <Image
          src={course.image}
          alt={course.title}
          fill
          className="object-cover transition-all duration-500 group-hover:scale-[1.06] group-hover:brightness-[1.08]"
          style={{ opacity: showVideo ? 0 : 1, transition: "opacity 0.4s ease, transform 0.5s ease, filter 0.5s ease" }}
          sizes="(max-width: 768px) 50vw, 25vw"
        />

        {/* Netflix YouTube teaser — covers card, video fills via scale */}
        {showVideo && course.videoId && (
          <div className="absolute inset-0 z-10 overflow-hidden" style={{ animation: "fadeIn 0.3s ease" }}>
            <iframe
              src={`https://www.youtube.com/embed/${course.videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${course.videoId}&modestbranding=1&rel=0&playsinline=1`}
              allow="autoplay; encrypted-media"
              style={{
                position: "absolute",
                /* Scale 16:9 iframe to cover 3/4 portrait card */
                width: "240%",
                height: "100%",
                left: "-70%",
                top: 0,
                border: "none",
                pointerEvents: "none",
              }}
            />
          </div>
        )}

        {/* Gradient overlay — always on top of image/video */}
        <div
          className="absolute inset-0 z-20"
          style={{
            background:
              "linear-gradient(to top, rgba(8,6,8,0.97) 0%, rgba(8,6,8,0.6) 40%, rgba(8,6,8,0.12) 72%, transparent 100%)",
          }}
        />

        {/* New badge — top right (RTL: right = document start) */}
        {course.isNew && (
          <div
            className="absolute top-2.5 right-2.5 z-30 px-2.5 py-[3px] rounded-full text-[0.5rem] font-black uppercase tracking-wider"
            style={{
              background: "linear-gradient(135deg, #C4857A, #D4998E)",
              color: "#080608",
              boxShadow: "0 2px 8px rgba(196,133,122,0.4)",
            }}
          >
            חדש
          </div>
        )}

        {/* Rose border glow on hover */}
        <div
          className="absolute inset-0 z-30 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            boxShadow: "inset 0 0 0 1.5px rgba(196,133,122,0.5)",
          }}
        />

        {/* Card body */}
        <div className="absolute inset-x-0 bottom-0 z-30 p-3 md:p-4">
          {/* Tier badge */}
          <span
            className="inline-block mb-2 px-[7px] py-[2px] rounded-[4px] text-[0.46rem] md:text-[0.5rem] font-bold tracking-[0.18em] uppercase"
            style={{
              color: tc.color,
              background: tc.bg,
              border: `1px solid ${tc.border}`,
            }}
          >
            {TIER_LABEL[course.tier]}
          </span>

          <h3
            className="text-[0.78rem] md:text-[0.9rem] font-bold leading-snug mb-1.5"
            style={{ color: "#FFF8F5" }}
          >
            {course.title}
          </h3>

          {/* Dash divider */}
          <div
            className="w-7 h-[1.5px] mb-1.5 rounded-full"
            style={{ background: "linear-gradient(90deg, #C4857A, transparent)" }}
          />

          <p className="text-[0.57rem] md:text-[0.6rem] mb-0.5" style={{ color: "rgba(255,248,245,0.5)" }}>
            {course.instructor.name}
          </p>
          <p className="text-[0.53rem] md:text-[0.56rem]" style={{ color: "rgba(255,248,245,0.28)" }}>
            {course.duration}
          </p>
        </div>
      </div>
      </Link>

      {/* Purchase row */}
      <div className="flex items-center justify-between mt-2 px-0.5">
        <span className="text-[0.72rem] font-black" style={{ color: "#FFF8F5" }}>
          ₪{COURSE_PRICE}
        </span>
        <Link
          href={`/checkout/${course.slug}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.62rem] font-bold transition-all hover:opacity-90 active:scale-95"
          style={{
            background: "linear-gradient(135deg,#C4857A,#D4998E)",
            color: "#080608",
            boxShadow: "0 2px 10px rgba(196,133,122,0.35)",
          }}
        >
          <ShoppingBag size={10} />
          רכישת קורס
        </Link>
      </div>
    </div>
  );
}
