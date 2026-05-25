"use client";

import { motion } from "framer-motion";
import { Instagram, Youtube, Award, BookOpen, Users } from "lucide-react";
import Link from "next/link";

const PHOTO = "https://i.imghippo.com/files/ZNe4792NOg.jpeg";

const ACHIEVEMENTS = [
  { icon: BookOpen, value: "8+", label: "קורסים מקצועיים" },
  { icon: Users,    value: "1,200+", label: "תלמידות" },
  { icon: Award,    value: "10+", label: "שנות ניסיון" },
];

const MILESTONES = [
  { year: "2014", text: "סיימה בהצטיינות את בית הספר למיצ'ה בתל אביב" },
  { year: "2016", text: "התמחות אצל מאפרות Leading בניו יורק ופריז" },
  { year: "2018", text: "הקימה את הסטודיו העצמאי — מאות כלות וצילומי אופנה" },
  { year: "2022", text: 'השיקה את "הבית של המאפרים" — הפלטפורמה המובילה לחינוך מקצועי בעברית' },
];

export default function NataliePage() {
  return (
    <div className="min-h-screen sidebar-safe" style={{ background: "var(--black)" }}>

      {/* Cinematic hero */}
      <div className="relative overflow-hidden" style={{ minHeight: "55vh", display: "flex", alignItems: "flex-end" }}>
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PHOTO} alt="נטלי ארצי" className="w-full h-full object-cover object-top" style={{ filter: "brightness(0.45)" }} />
        </div>
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #080608 0%, rgba(8,6,8,0.6) 40%, transparent 80%)" }} />

        <div className="relative z-10 w-full px-4 md:px-12 pb-12 pt-32">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-[0.58rem] tracking-[0.3em] uppercase mb-2" style={{ color: "#C4857A" }}>המדריכה שלך</p>
            <h1
              className="font-black leading-[1.0] mb-3"
              style={{
                fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
                backgroundImage: "linear-gradient(135deg, #FFF8F5 0%, #D4998E 50%, #C4857A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              נטלי ארצי
            </h1>
            <p className="text-base md:text-lg font-light" style={{ color: "rgba(255,248,245,0.55)" }}>
              מאפרת מקצועית · מדריכה · יוצרת תוכן
            </p>
          </motion.div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 md:px-12 py-12 max-w-4xl">

        {/* Stats */}
        <motion.div
          className="grid grid-cols-3 gap-4 mb-12"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {ACHIEVEMENTS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="rounded-2xl p-5 text-center" style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.08)" }}>
              <Icon size={18} className="mx-auto mb-2" style={{ color: "#C4857A" }} />
              <p className="text-2xl font-black mb-0.5" style={{ color: "#FFF8F5" }}>{value}</p>
              <p className="text-[0.6rem]" style={{ color: "#5A3830" }}>{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Bio */}
        <motion.div className="mb-12" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <h2 className="text-base font-black mb-4" style={{ color: "#FFF8F5" }}>על נטלי</h2>
          <div className="space-y-4 text-sm leading-relaxed" style={{ color: "#5A3830" }}>
            <p>
              נטלי ארצי היא מאפרת מקצועית עם למעלה מ-10 שנות ניסיון בתעשייה — מצילומי אופנה ועד כלות חלומות.
              היא מאמינה שאיפור הוא לא רק טכניקה, אלא אמנות שמגיעה מהפנים החוצה.
            </p>
            <p>
              לאחר שנים של עבודה מול מצלמות ובסטודיוס ברחבי העולם, החליטה נטלי להפוך את הידע שצברה
              לנגיש לכל מאפרת בישראל — ובכך נולד הבית של המאפרים.
            </p>
            <p>
              הסגנון שלה: מדויק, חושני, ולוקסוס נקי. היא מלמדת לא רק "איך" — אלא "למה".
            </p>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div className="mb-12" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
          <h2 className="text-base font-black mb-6" style={{ color: "#FFF8F5" }}>ציר הזמן</h2>
          <div className="relative">
            <div className="absolute right-[5.5rem] top-0 bottom-0 w-px" style={{ background: "rgba(196,133,122,0.12)" }} />
            <div className="space-y-6">
              {MILESTONES.map((m, i) => (
                <motion.div
                  key={m.year}
                  className="flex gap-6 items-start"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.28 + i * 0.07 }}
                >
                  <div className="shrink-0 text-left w-20">
                    <span className="text-[0.78rem] font-black" style={{ color: "#C4857A" }}>{m.year}</span>
                  </div>
                  <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: "#C4857A", boxShadow: "0 0 8px rgba(196,133,122,0.4)" }} />
                  <p className="text-sm leading-relaxed flex-1" style={{ color: "#5A3830" }}>{m.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Social + CTA */}
        <motion.div
          className="rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.1)" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[0.75rem] font-semibold transition-colors hover:opacity-80"
              style={{ background: "rgba(196,133,122,0.1)", color: "#C4857A", border: "1px solid rgba(196,133,122,0.2)" }}
            >
              <Instagram size={14} /> אינסטגרם
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[0.75rem] font-semibold transition-colors hover:opacity-80"
              style={{ background: "rgba(196,133,122,0.1)", color: "#C4857A", border: "1px solid rgba(196,133,122,0.2)" }}
            >
              <Youtube size={14} /> יוטיוב
            </a>
          </div>

          <Link
            href="/courses"
            className="px-6 py-2.5 rounded-xl text-sm font-black transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#C4857A,#D4998E)", color: "#080608", boxShadow: "0 4px 18px rgba(196,133,122,0.3)" }}
          >
            לקורסים שלי
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
