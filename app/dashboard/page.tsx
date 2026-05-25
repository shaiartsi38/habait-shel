"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Trophy, Flame, Clock } from "lucide-react";

const STATS = [
  { icon: BookOpen, label: "קורסים שהתחלת", value: "0", color: "#C4857A" },
  { icon: Trophy, label: "נקודות שצברת", value: "0", color: "#D4998E" },
  { icon: Flame, label: "סטריק יומי", value: "0 ימים", color: "#C4857A" },
  { icon: Clock, label: "שעות צפייה", value: "0", color: "#D4998E" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen sidebar-safe px-4 md:px-12 py-12" style={{ background: "var(--black)" }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-[0.58rem] tracking-[0.3em] uppercase mb-2" style={{ color: "#C4857A" }}>הדשבורד שלי</p>
        <h1 className="text-3xl font-black mb-2" style={{ color: "#FFF8F5" }}>ברוכה הבאה</h1>
        <p className="text-sm mb-10" style={{ color: "#5A3830" }}>התחילי ללמוד — כל שיעור מקרב אותך למאפרת שתרצי להיות</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {STATS.map(({ icon: Icon, label, value, color }, i) => (
            <motion.div
              key={label}
              className="rounded-2xl p-5"
              style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.08)" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Icon size={20} className="mb-3" style={{ color }} />
              <p className="text-2xl font-black mb-1" style={{ color: "#FFF8F5" }}>{value}</p>
              <p className="text-[0.6rem]" style={{ color: "#5A3830" }}>{label}</p>
            </motion.div>
          ))}
        </div>

        <div className="rounded-2xl p-8 flex flex-col items-center text-center" style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.08)" }}>
          <p className="text-4xl mb-4">🎬</p>
          <h2 className="text-lg font-black mb-2" style={{ color: "#FFF8F5" }}>טרם התחלת קורס</h2>
          <p className="text-sm mb-5" style={{ color: "#5A3830" }}>בחרי קורס ותתחילי ללמוד כבר עכשיו</p>
          <Link href="/courses" className="px-6 py-2.5 rounded-xl text-sm font-black" style={{ background: "linear-gradient(135deg,#C4857A,#D4998E)", color: "#080608" }}>
            לקטלוג הקורסים
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
