"use client";

import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Clock, Play, CheckCircle, ShoppingBag, ChevronRight } from "lucide-react";
import Link from "next/link";
import { COURSES } from "@/lib/courses-data";
import { useCourses } from "@/lib/courses-context";

const COURSE_PRICE = 489;

const DIFF_LABEL = { beginner: "מתחילות", intermediate: "בינוני", advanced: "מתקדם" } as const;

export default function CheckoutPage({ params }: { params: { slug: string } }) {
  const { courses } = useCourses();
  const course = courses.find((c) => c.slug === params.slug) ?? COURSES.find((c) => c.slug === params.slug);
  if (!course) notFound();

  const freeLessons = course.lessons.filter((l) => l.isFree).length;

  return (
    <div className="min-h-screen sidebar-safe" style={{ background: "var(--black)", color: "var(--white)" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-30 px-4 md:px-10 py-4 flex items-center gap-3"
        style={{ background: "rgba(8,6,8,0.88)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(196,133,122,0.08)" }}
      >
        <Link href={`/courses/${course.slug}`} className="flex items-center gap-1 text-[0.7rem] hover:opacity-70 transition-opacity" style={{ color: "#8B6355" }}>
          <ChevronRight size={13} /> חזרה לקורס
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Course preview */}
        <motion.div
          className="rounded-2xl overflow-hidden mb-8"
          style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.1)" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Thumbnail */}
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={course.image} alt={course.title} className="w-full h-full object-cover" style={{ filter: "brightness(0.6)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #140e12 0%, transparent 60%)" }} />
            <div className="absolute bottom-4 right-4 left-4">
              <p className="text-[0.55rem] tracking-[0.25em] uppercase mb-1" style={{ color: "#C4857A" }}>רכישת קורס בודד</p>
              <h1 className="text-xl md:text-2xl font-black" style={{ color: "#FFF8F5" }}>{course.title}</h1>
            </div>
          </div>

          {/* Course meta */}
          <div className="px-5 py-4 flex flex-wrap gap-4 text-[0.65rem]" style={{ borderTop: "1px solid rgba(196,133,122,0.06)", color: "rgba(255,248,245,0.45)" }}>
            <span className="flex items-center gap-1.5"><Clock size={11} /> {course.duration}</span>
            <span className="flex items-center gap-1.5"><Play size={11} /> {course.lessons.length} שיעורים</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={11} style={{ color: "#4A9B6F" }} /> {freeLessons} שיעורים חינמיים</span>
            <span>{DIFF_LABEL[course.difficulty]}</span>
          </div>
        </motion.div>

        {/* What's included */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-sm font-black mb-4" style={{ color: "#FFF8F5" }}>מה כלול ברכישה</h2>
          <div className="space-y-2.5">
            {[
              `גישה מלאה לכל ${course.lessons.length} השיעורים`,
              "צפייה ללא הגבלת זמן",
              "גישה מכל מכשיר — מובייל ודסקטופ",
              "עדכוני תוכן עתידיים לקורס זה",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm" style={{ color: "rgba(255,248,245,0.6)" }}>
                <CheckCircle size={14} style={{ color: "#C4857A", flexShrink: 0 }} />
                {item}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Lesson list preview */}
        <motion.div
          className="mb-8 rounded-2xl overflow-hidden"
          style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.08)" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="px-5 py-3" style={{ borderBottom: "1px solid rgba(196,133,122,0.06)" }}>
            <p className="text-[0.7rem] font-black" style={{ color: "#C4857A" }}>תכנית הקורס</p>
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(196,133,122,0.05)" }}>
            {course.lessons.slice(0, 5).map((lesson, i) => (
              <div key={lesson.id} className="flex items-center gap-3 px-5 py-3">
                <span className="text-[0.55rem] font-black w-5 text-center tabular-nums" style={{ color: "rgba(196,133,122,0.5)" }}>{i + 1}</span>
                <p className="flex-1 text-[0.72rem]" style={{ color: lesson.isFree ? "#FFF8F5" : "rgba(255,248,245,0.45)" }}>
                  {lesson.title || `שיעור ${i + 1}`}
                </p>
                {lesson.isFree && (
                  <span className="text-[0.48rem] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(74,155,111,0.12)", color: "#4A9B6F", border: "1px solid rgba(74,155,111,0.2)" }}>
                    חינמי
                  </span>
                )}
                {lesson.durationMin > 0 && (
                  <span className="text-[0.55rem]" style={{ color: "rgba(255,248,245,0.25)" }}>{lesson.durationMin} דק׳</span>
                )}
              </div>
            ))}
            {course.lessons.length > 5 && (
              <div className="px-5 py-3 text-center text-[0.62rem]" style={{ color: "rgba(255,248,245,0.25)" }}>
                + עוד {course.lessons.length - 5} שיעורים
              </div>
            )}
          </div>
        </motion.div>

        {/* Instructor */}
        <motion.div
          className="flex items-center gap-4 mb-8 px-5 py-4 rounded-2xl"
          style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.08)" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0" style={{ border: "2px solid rgba(196,133,122,0.3)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={course.instructor.photoUrl} alt={course.instructor.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-[0.55rem] tracking-wider uppercase mb-0.5" style={{ color: "#C4857A" }}>המדריכה</p>
            <p className="text-sm font-black" style={{ color: "#FFF8F5" }}>{course.instructor.name}</p>
          </div>
        </motion.div>

        {/* Payment box */}
        <motion.div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.2)", boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="px-6 py-5">
            {/* Price */}
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-black" style={{ color: "#FFF8F5" }}>₪{COURSE_PRICE}</span>
              <span className="text-[0.65rem]" style={{ color: "rgba(255,248,245,0.35)" }}>תשלום חד פעמי</span>
            </div>
            <p className="text-[0.62rem] mb-5" style={{ color: "rgba(255,248,245,0.3)" }}>
              גישה מלאה לקורס "{course.title}" — ללא הגבלת זמן
            </p>

            {/* CTA — placeholder לחיבור Cardcom */}
            <button
              className="w-full py-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.99]"
              style={{
                background: "linear-gradient(135deg, #C4857A 0%, #D4998E 100%)",
                color: "#080608",
                boxShadow: "0 6px 28px rgba(196,133,122,0.4)",
              }}
              onClick={() => alert("מערכת התשלום בהקמה — נחזור אליך בקרוב!")}
            >
              <ShoppingBag size={16} />
              לרכישה מאובטחת — ₪{COURSE_PRICE}
            </button>

            {/* Trust */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <Lock size={10} style={{ color: "rgba(255,248,245,0.2)" }} />
              <span className="text-[0.55rem]" style={{ color: "rgba(255,248,245,0.2)" }}>
                תשלום מאובטח · לאחר הרכישה תקבלי פרטי גישה במייל תוך מספר דקות
              </span>
            </div>
          </div>
        </motion.div>

        {/* Subscribe upsell */}
        <motion.div
          className="mt-5 p-4 rounded-xl text-center"
          style={{ border: "1px solid rgba(196,133,122,0.08)", background: "rgba(196,133,122,0.03)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <p className="text-[0.65rem] mb-2" style={{ color: "rgba(255,248,245,0.35)" }}>
            רוצה גישה לכל הקורסים?
          </p>
          <Link
            href="/subscription"
            className="text-[0.68rem] font-bold transition-opacity hover:opacity-70"
            style={{ color: "#C4857A" }}
          >
            הצטרפי למנוי מלא החל מ-₪49 לחודש ←
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
