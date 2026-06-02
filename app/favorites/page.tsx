"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useCourses } from "@/lib/courses-context";
import { useFavorites } from "@/lib/favorites-context";
import { CourseCard } from "@/components/courses/CourseCard";

export default function FavoritesPage() {
  const { courses } = useCourses();
  const { favorites, isLoggedIn } = useFavorites();

  const favCourses = courses.filter((c) => favorites.has(c.id));

  return (
    <div className="min-h-screen sidebar-safe px-4 md:px-12 py-12 md:py-16" style={{ background: "var(--black)" }}>
      <motion.div className="mb-10" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-5 h-px" style={{ background: "#C4857A" }} />
          <span className="text-[0.6rem] font-semibold tracking-[0.3em] uppercase" style={{ color: "#C4857A" }}>
            הקורסים שלי
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black leading-tight" style={{ color: "#FFF8F5" }}>
          המועדפים שלי
        </h1>
        {favCourses.length > 0 && (
          <p className="mt-3 text-sm" style={{ color: "#5A3830" }}>
            {favCourses.length} קורסים שמרת
          </p>
        )}
      </motion.div>

      {!isLoggedIn ? (
        <motion.div className="text-center py-32" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Heart size={40} className="mx-auto mb-5" style={{ color: "rgba(196,133,122,0.3)" }} />
          <p className="text-base font-bold mb-2" style={{ color: "rgba(255,248,245,0.3)" }}>
            יש להתחבר כדי לראות מועדפים
          </p>
          <Link
            href="/login"
            className="inline-block mt-4 px-6 py-2.5 rounded-xl text-sm font-black"
            style={{ background: "linear-gradient(135deg,#C4857A,#D4998E)", color: "#080608" }}
          >
            כניסה
          </Link>
        </motion.div>
      ) : favCourses.length === 0 ? (
        <motion.div className="text-center py-32" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Heart size={40} className="mx-auto mb-5" style={{ color: "rgba(196,133,122,0.3)" }} />
          <p className="text-base font-bold mb-2" style={{ color: "rgba(255,248,245,0.3)" }}>
            עדיין לא שמרת קורסים
          </p>
          <p className="text-sm mb-6" style={{ color: "#3A2020" }}>
            לחצי על ♡ על כל קורס שמעניין אותך
          </p>
          <Link
            href="/courses"
            className="inline-block px-6 py-2.5 rounded-xl text-sm font-black"
            style={{ background: "linear-gradient(135deg,#C4857A,#D4998E)", color: "#080608" }}
          >
            לכל הקורסים
          </Link>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-5 gap-2"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
        >
          {favCourses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, delay: (i % 5) * 0.06 }}
            >
              <CourseCard course={course} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
