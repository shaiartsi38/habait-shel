"use client";

import { motion } from "framer-motion";
import { MessageCircle, Heart, Users, Lock } from "lucide-react";
import Link from "next/link";

const THREADS = [
  { id: 1, avatar: "M", name: "מיכל ס.", time: "לפני 2 שעות", title: "איך משיגים אפקט עור זכוכית?", replies: 12, likes: 34, tag: "עור ובסיס" },
  { id: 2, avatar: "N", name: "נועה א.", time: "לפני 5 שעות", title: "טיפ לסמוק שמחזיק כל היום — שתפי!", replies: 8, likes: 27, tag: "עיניים" },
  { id: 3, avatar: "R", name: "רוני כ.", time: "אתמול",       title: "מה הכלי שלא תוותרו עליו בכלות?", replies: 21, likes: 58, tag: "כלות" },
  { id: 4, avatar: "S", name: "שירה ל.", time: "אתמול",       title: "contouring לפנים עגולות — מה עובד?", tag: "Contouring", replies: 9, likes: 19 },
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen sidebar-safe px-4 md:px-12 py-12" style={{ background: "var(--black)" }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

        {/* Header */}
        <p className="text-[0.58rem] tracking-[0.3em] uppercase mb-2" style={{ color: "#C4857A" }}>קהילה</p>
        <h1 className="text-3xl font-black mb-1" style={{ color: "#FFF8F5" }}>הבית שלנו</h1>
        <p className="text-sm mb-10" style={{ color: "#5A3830" }}>שאלי, שתפי, ותתעוררי — יחד אנחנו צומחות</p>

        {/* Stats row */}
        <div className="flex gap-4 mb-10">
          {[
            { icon: Users, label: "חברות", value: "1,240+" },
            { icon: MessageCircle, label: "שיחות", value: "380+" },
            { icon: Heart, label: "לייקים", value: "8.2K+" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex-1 rounded-2xl p-4 flex flex-col items-center text-center" style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.08)" }}>
              <Icon size={18} className="mb-2" style={{ color: "#C4857A" }} />
              <p className="text-lg font-black" style={{ color: "#FFF8F5" }}>{value}</p>
              <p className="text-[0.58rem]" style={{ color: "#5A3830" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Threads */}
        <div className="space-y-3 mb-10">
          {THREADS.map((t, i) => (
            <motion.div
              key={t.id}
              className="flex gap-4 items-start rounded-2xl p-5 cursor-pointer hover:border-[rgba(196,133,122,0.2)] transition-colors"
              style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.08)" }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-black text-sm" style={{ background: "linear-gradient(135deg,#C4857A,#D4998E)", color: "#080608" }}>
                {t.avatar}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 items-center mb-1">
                  <span className="text-[0.58rem] font-bold" style={{ color: "#C4857A" }}>{t.name}</span>
                  <span className="text-[0.55rem]" style={{ color: "#3A2020" }}>·</span>
                  <span className="text-[0.55rem]" style={{ color: "#3A2020" }}>{t.time}</span>
                  <span className="text-[0.52rem] px-2 py-[1px] rounded-full" style={{ background: "rgba(196,133,122,0.1)", color: "#C4857A", border: "1px solid rgba(196,133,122,0.2)" }}>{t.tag}</span>
                </div>
                <p className="text-sm font-semibold mb-2" style={{ color: "#FFF8F5" }}>{t.title}</p>
                <div className="flex gap-4">
                  <span className="flex items-center gap-1 text-[0.6rem]" style={{ color: "#5A3830" }}>
                    <MessageCircle size={10} /> {t.replies} תגובות
                  </span>
                  <span className="flex items-center gap-1 text-[0.6rem]" style={{ color: "#5A3830" }}>
                    <Heart size={10} /> {t.likes}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Locked CTA */}
        <motion.div
          className="rounded-2xl p-8 flex flex-col items-center text-center"
          style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.12)" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(196,133,122,0.1)", border: "1px solid rgba(196,133,122,0.2)" }}>
            <Lock size={18} style={{ color: "#C4857A" }} />
          </div>
          <h2 className="text-lg font-black mb-2" style={{ color: "#FFF8F5" }}>הצטרפי לשיחה</h2>
          <p className="text-sm mb-5 max-w-xs" style={{ color: "#5A3830" }}>
            גישה מלאה לקהילה זמינה לחברות Pro ו-Elite. שאלי שאלות, שתפי עבודות, ותקבלי פידבק מנטלי.
          </p>
          <Link
            href="/subscription"
            className="px-6 py-2.5 rounded-xl text-sm font-black transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#C4857A,#D4998E)", color: "#080608", boxShadow: "0 4px 18px rgba(196,133,122,0.3)" }}
          >
            שדרגי מנוי
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
