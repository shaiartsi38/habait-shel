"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES, type Category } from "@/lib/courses-data";
import { useCourses } from "@/lib/courses-context";
import { CourseCard } from "@/components/courses/CourseCard";
import { CategoryFilter } from "@/components/courses/CategoryFilter";
import { createClient } from "@/lib/supabase/client";

function CourseSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="rounded-xl overflow-hidden" style={{ aspectRatio: "3/4", background: "#140e12" }}>
        <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #140e12 25%, #1e1318 50%, #140e12 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      </div>
      <div className="mt-2 flex justify-between items-center px-0.5">
        <div className="h-3 rounded-full w-12" style={{ background: "#1e1318" }} />
        <div className="h-6 rounded-lg w-20" style={{ background: "#1e1318" }} />
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("הכל");
  const { courses, loading } = useCourses();
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const { data: p } = await sb.from("profiles").select("subscription_tier").eq("id", data.user.id).single();
        if (p?.subscription_tier) setHasSubscription(true);
      }
    });
  }, []);

  const visible =
    activeCategory === "הכל"
      ? courses
      : courses.filter((c) => c.category === activeCategory);

  return (
    <div
      className="min-h-screen sidebar-safe px-4 md:px-12 py-12 md:py-16"
      style={{ background: "var(--black)" }}
    >
      {/* Page header */}
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-5 h-px" style={{ background: "#C4857A" }} />
          <span
            className="text-[0.6rem] font-semibold tracking-[0.3em] uppercase"
            style={{ color: "#C4857A" }}
          >
            המאסטרקלאסים
          </span>
        </div>
        <h1
          className="text-4xl md:text-5xl font-black leading-tight"
          style={{ color: "#FFF8F5" }}
        >
          כל הקורסים
        </h1>
        <p className="mt-3 text-sm leading-relaxed max-w-md" style={{ color: "#5A3830" }}>
          {courses.length} מאסטרקלאסים מקצועיים — מעיניים מרשימות ועד עסקים ומיתוג
        </p>
      </motion.div>

      {/* Category filter */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
      </motion.div>

      {/* Course count */}
      <motion.p
        className="mb-6 text-[0.65rem] tracking-wide"
        style={{ color: "rgba(255,248,245,0.25)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.18 }}
      >
        {visible.length} קורסים
        {activeCategory !== "הכל" && (
          <span> ב{activeCategory}</span>
        )}
      </motion.p>

      {/* Skeleton while loading */}
      {loading && courses.length === 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, i) => <CourseSkeleton key={i} />)}
        </div>
      ) : (
        <>
          {/* Grid */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeCategory}
              className="grid grid-cols-2 md:grid-cols-5 gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {visible.map((course, i) => (
                <motion.div
                  key={course.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.38, delay: (i % 4) * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <CourseCard course={course} hidePurchase={hasSubscription} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Empty states */}
          {visible.length === 0 && courses.length > 0 && (
            <motion.div className="text-center py-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-2xl mb-3">🔍</p>
              <p className="text-sm font-semibold mb-1" style={{ color: "rgba(255,248,245,0.3)" }}>
                אין קורסים ב{activeCategory}
              </p>
              <p className="text-xs" style={{ color: "#3A2020" }}>נסי קטגוריה אחרת</p>
            </motion.div>
          )}
          {courses.length === 0 && !loading && (
            <motion.div className="text-center py-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-2xl mb-3">🎬</p>
              <p className="text-sm font-semibold mb-1" style={{ color: "rgba(255,248,245,0.3)" }}>
                הקורסים בדרך
              </p>
              <p className="text-xs" style={{ color: "#3A2020" }}>נכון לעכשיו אין קורסים זמינים</p>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
