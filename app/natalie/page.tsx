"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Instagram, Youtube, Award, BookOpen, Users, MessageCircle, Facebook } from "lucide-react";
import Link from "next/link";
import { type NatalieContent, DEFAULT_NATALIE, dbGetNatalie } from "@/lib/supabase/content-db";

const ACHIEVEMENT_ICONS = [BookOpen, Users, Award];

export default function NataliePage() {
  const [content, setContent] = useState<NatalieContent>(DEFAULT_NATALIE);

  useEffect(() => {
    dbGetNatalie().then(setContent).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen sidebar-safe" style={{ background: "var(--black)" }}>

      {/* Cinematic hero */}
      <div className="relative overflow-hidden" style={{ minHeight: "85vh" }}>
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={content.photo}
            alt="נטלי ארצי"
            className="w-full h-full object-cover"
            style={{ objectPosition: "50% 18%", filter: "brightness(0.44) contrast(1.18) saturate(0.82)" }}
          />
        </div>
        {/* פסי letterbox קולנועיים */}
        <div className="absolute inset-x-0 top-0 h-[6vh]" style={{ background: "#080608" }} />
        <div className="absolute inset-x-0 bottom-0 h-[6vh]" style={{ background: "#080608" }} />
        {/* grain overlay — מסתיר איכות נמוכה */}
        <div className="absolute inset-0" style={{ background: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")", opacity: 0.35, mixBlendMode: "overlay" }} />
        {/* Vignette מלמעלה — חזק יותר */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,6,8,0.7) 0%, rgba(8,6,8,0.1) 35%, transparent 55%)" }} />
        {/* Vignette מלמטה */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #080608 0%, rgba(8,6,8,0.88) 20%, rgba(8,6,8,0.2) 50%, transparent 100%)" }} />
        {/* צלליות צד קולנועיות — רחבות יותר */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(8,6,8,0.55) 0%, transparent 35%, transparent 65%, rgba(8,6,8,0.55) 100%)" }} />
        {/* overlay חם עדין — מוסיף עומק ומסתיר פיקסלים */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(196,133,122,0.06) 0%, transparent 65%)" }} />

        {/* כיתוב — נצמד לתחתית בלבד */}
        <div className="absolute bottom-0 right-0 left-0 px-4 md:px-12 pb-10">
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

        {/* Bio */}
        <motion.div className="mb-12" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-base font-black mb-4" style={{ color: "#FFF8F5" }}>על נטלי</h2>
          <div className="space-y-4 text-sm leading-relaxed" style={{ color: "#5A3830" }}>
            {content.bio.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </motion.div>

        {/* Stats — מתחת לביו, לא מסתיר את התמונה */}
        <motion.div
          className="grid grid-cols-3 gap-4 mb-12"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          {content.achievements.map(({ value, label }, i) => {
            const Icon = ACHIEVEMENT_ICONS[i % ACHIEVEMENT_ICONS.length];
            return (
              <div key={label} className="rounded-2xl p-5 text-center" style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.08)" }}>
                <Icon size={18} className="mx-auto mb-2" style={{ color: "#C4857A" }} />
                <p className="text-2xl font-black mb-0.5" style={{ color: "#FFF8F5" }}>{value}</p>
                <p className="text-[0.6rem]" style={{ color: "#5A3830" }}>{label}</p>
              </div>
            );
          })}
        </motion.div>

        {/* Timeline */}
        <motion.div className="mb-12" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
          <h2 className="text-base font-black mb-6" style={{ color: "#FFF8F5" }}>ציר הזמן</h2>
          <div className="relative">
            <div className="absolute right-[5.5rem] top-0 bottom-0 w-px" style={{ background: "rgba(196,133,122,0.12)" }} />
            <div className="space-y-6">
              {content.milestones.map((m, i) => (
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
          <div className="flex flex-wrap gap-3">
            {content.instagram && (
              <a href={content.instagram} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[0.75rem] font-semibold transition-colors hover:opacity-80"
                style={{ background: "rgba(196,133,122,0.1)", color: "#C4857A", border: "1px solid rgba(196,133,122,0.2)" }}>
                <Instagram size={14} /> אינסטגרם
              </a>
            )}
            {content.youtube && (
              <a href={content.youtube} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[0.75rem] font-semibold transition-colors hover:opacity-80"
                style={{ background: "rgba(196,133,122,0.1)", color: "#C4857A", border: "1px solid rgba(196,133,122,0.2)" }}>
                <Youtube size={14} /> יוטיוב
              </a>
            )}
            {content.tiktok && (
              <a href={content.tiktok} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[0.75rem] font-semibold transition-colors hover:opacity-80"
                style={{ background: "rgba(196,133,122,0.1)", color: "#C4857A", border: "1px solid rgba(196,133,122,0.2)" }}>
                <span className="text-[0.7rem] font-black">TT</span> טיקטוק
              </a>
            )}
            {content.facebook && (
              <a href={content.facebook} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[0.75rem] font-semibold transition-colors hover:opacity-80"
                style={{ background: "rgba(196,133,122,0.1)", color: "#C4857A", border: "1px solid rgba(196,133,122,0.2)" }}>
                <Facebook size={14} /> פייסבוק
              </a>
            )}
            {content.whatsapp && (
              <a href={content.whatsapp} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[0.75rem] font-semibold transition-colors hover:opacity-80"
                style={{ background: "rgba(196,133,122,0.1)", color: "#C4857A", border: "1px solid rgba(196,133,122,0.2)" }}>
                <MessageCircle size={14} /> וואטסאפ
              </a>
            )}
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
