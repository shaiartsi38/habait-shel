"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES, type Category } from "@/lib/courses-data";
import { useCourses } from "@/lib/courses-context";
import { CourseCard } from "@/components/courses/CourseCard";
import { CategoryFilter } from "@/components/courses/CategoryFilter";

export default function CoursesPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("הכל");
  const { courses } = useCourses();

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

      {/* Grid */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={activeCategory}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
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
              transition={{
                duration: 0.38,
                delay: (i % 4) * 0.05,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <CourseCard course={course} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {visible.length === 0 && (
        <motion.div
          className="text-center py-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-lg font-light" style={{ color: "rgba(255,248,245,0.25)" }}>
            אין קורסים בקטגוריה זו עדיין
          </p>
        </motion.div>
      )}
    </div>
  );
}
