"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { BookOpen, Trophy, Flame, Clock, X, ChevronRight, AlertCircle, CheckCircle, Share2 } from "lucide-react";
import {
  type CancellationFlow, DEFAULT_CANCELLATION_FLOW,
  dbGetCancellationFlow,
} from "@/lib/supabase/content-db";

const STATS = [
  { icon: BookOpen, label: "קורסים שהתחלת", value: "0", color: "#C4857A" },
  { icon: Trophy, label: "נקודות שצברת", value: "0", color: "#D4998E" },
  { icon: Flame, label: "סטריק יומי", value: "0 ימים", color: "#C4857A" },
  { icon: Clock, label: "שעות צפייה", value: "0", color: "#D4998E" },
];

export default function DashboardPage() {
  const [showCancel, setShowCancel] = useState(false);
  const [cancelFlow, setCancelFlow] = useState<CancellationFlow>(DEFAULT_CANCELLATION_FLOW);

  useEffect(() => {
    dbGetCancellationFlow().then(setCancelFlow).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen sidebar-safe px-4 md:px-12 py-12" style={{ background: "var(--black)" }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-[0.58rem] tracking-[0.3em] uppercase mb-2" style={{ color: "#C4857A" }}>הדשבורד שלי</p>
        <h1 className="text-3xl font-black mb-2" style={{ color: "#FFF8F5" }}>ברוכה הבאה</h1>
        <p className="text-sm mb-10" style={{ color: "#5A3830" }}>התחילי ללמוד — כל שיעור מקרב אותך למאפרת שתרצי להיות</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {STATS.map(({ icon: Icon, label, value, color }, i) => (
            <motion.div key={label} className="rounded-2xl p-5"
              style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.08)" }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Icon size={20} className="mb-3" style={{ color }} />
              <p className="text-2xl font-black mb-1" style={{ color: "#FFF8F5" }}>{value}</p>
              <p className="text-[0.6rem]" style={{ color: "#5A3830" }}>{label}</p>
            </motion.div>
          ))}
        </div>

        <div className="rounded-2xl p-8 flex flex-col items-center text-center mb-8"
          style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.08)" }}>
          <p className="text-4xl mb-4">🎬</p>
          <h2 className="text-lg font-black mb-2" style={{ color: "#FFF8F5" }}>טרם התחלת קורס</h2>
          <p className="text-sm mb-5" style={{ color: "#5A3830" }}>בחרי קורס ותתחילי ללמוד כבר עכשיו</p>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Link href="/courses" className="px-6 py-2.5 rounded-xl text-sm font-black"
              style={{ background: "linear-gradient(135deg,#C4857A,#D4998E)", color: "#080608" }}>
              לקטלוג הקורסים
            </Link>
            <button
              onClick={() => setShowCancel(true)}
              className="px-6 py-2.5 rounded-xl text-sm font-black transition-opacity hover:opacity-70"
              style={{ color: "#8B6355", border: "1px solid rgba(139,99,85,0.25)", background: "transparent" }}
            >
              ביטול מנוי
            </button>
          </div>
        </div>
      </motion.div>

      {/* WhatsApp share */}
      <motion.div
        className="rounded-2xl p-6 flex items-center justify-between gap-4"
        style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.08)" }}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
      >
        <div>
          <p className="text-sm font-black mb-1" style={{ color: "#FFF8F5" }}>שתפי עם חברה</p>
          <p className="text-[0.65rem]" style={{ color: "#5A3830" }}>
            כל חברה שמצטרפת — עוד מאפרת שצומחת איתך
          </p>
        </div>
        <a
          href={`https://wa.me/?text=${encodeURIComponent("היי! גיליתי פלטפורמה מדהימה לקורסי איפור מקצועיים עם נטלי ארצי 🎨✨\nהצטרפי לקהילה: https://natalieartzi.com")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[0.78rem] font-black shrink-0 transition-opacity hover:opacity-90 active:scale-95"
          style={{ background: "rgba(37,211,102,0.12)", color: "#25D366", border: "1px solid rgba(37,211,102,0.25)" }}
        >
          <Share2 size={14} />
          שלחי ב-WhatsApp
        </a>
      </motion.div>

      {/* Cancellation modal */}
      <AnimatePresence>
        {showCancel && (
          <CancellationModal flow={cancelFlow} onClose={() => setShowCancel(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Cancellation Modal ───────────────────────────────────────────

type Step = "reason" | "offer" | "confirm" | "done";

function CancellationModal({ flow, onClose }: { flow: CancellationFlow; onClose: () => void }) {
  const [step, setStep] = useState<Step>("reason");
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const selectedOffer = flow.offers.find((o) => o.id === selectedReason);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-50"
        style={{ background: "rgba(8,6,8,0.85)", backdropFilter: "blur(6px)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="fixed inset-x-4 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 w-full md:max-w-md rounded-t-3xl md:rounded-3xl overflow-hidden"
        style={{ background: "#0f0b0e", border: "1px solid rgba(196,133,122,0.12)", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        transition={{ type: "spring", stiffness: 340, damping: 36 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid rgba(196,133,122,0.08)" }}>
          <p className="text-[0.7rem] font-black" style={{ color: "#C4857A" }}>
            {step === "reason" && flow.mainQuestion}
            {step === "offer" && flow.step2Title}
            {step === "confirm" && "אישור ביטול"}
            {step === "done" && "המנוי בוטל"}
          </p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5">
            <X size={14} style={{ color: "#5A3830" }} />
          </button>
        </div>

        <div className="px-6 py-6">
          {/* Step 1 — Reason */}
          {step === "reason" && (
            <div className="space-y-2">
              {flow.offers.map((offer) => (
                <button
                  key={offer.id}
                  onClick={() => { setSelectedReason(offer.id); setStep("offer"); }}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-right transition-all hover:opacity-80"
                  style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.08)", color: "rgba(255,248,245,0.7)" }}
                >
                  <span className="text-sm">{offer.reason}</span>
                  <ChevronRight size={14} style={{ color: "#5A3830", transform: "rotate(180deg)" }} />
                </button>
              ))}
            </div>
          )}

          {/* Step 2 — Offer */}
          {step === "offer" && selectedOffer && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: "rgba(196,133,122,0.1)", border: "1px solid rgba(196,133,122,0.2)" }}>
                <span className="text-2xl">🎁</span>
              </div>
              <h3 className="text-lg font-black mb-2" style={{ color: "#FFF8F5" }}>{selectedOffer.offerTitle}</h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "#5A3830" }}>{selectedOffer.offerDesc}</p>
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-xl text-sm font-black mb-3 transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#C4857A,#D4998E)", color: "#080608", boxShadow: "0 4px 18px rgba(196,133,122,0.3)" }}
              >
                {selectedOffer.offerCta}
              </button>
              <button
                onClick={() => setStep("confirm")}
                className="w-full text-[0.65rem] py-2 transition-opacity hover:opacity-60"
                style={{ color: "#3A2020" }}
              >
                {flow.confirmText}
              </button>
            </div>
          )}

          {/* Step 3 — Confirm */}
          {step === "confirm" && (
            <div className="text-center">
              <AlertCircle size={36} className="mx-auto mb-4" style={{ color: "#C4857A" }} />
              <h3 className="text-base font-black mb-2" style={{ color: "#FFF8F5" }}>אישור ביטול סופי</h3>
              <p className="text-sm mb-6" style={{ color: "#5A3830" }}>
                הגישה תיחסם בתום תקופת החיוב הנוכחית. לא ניתן לבטל פעולה זו.
              </p>
              <button
                onClick={() => setStep("done")}
                className="w-full py-3 rounded-xl text-sm font-bold mb-3 transition-opacity hover:opacity-80"
                style={{ background: "rgba(196,50,50,0.1)", color: "#e05555", border: "1px solid rgba(196,50,50,0.2)" }}
              >
                כן, בטלי את המנוי שלי
              </button>
              <button onClick={() => setStep("offer")}
                className="w-full text-[0.65rem] py-2 transition-opacity hover:opacity-70" style={{ color: "#5A3830" }}>
                חזרה
              </button>
            </div>
          )}

          {/* Step 4 — Done */}
          {step === "done" && (
            <div className="text-center py-4">
              <CheckCircle size={36} className="mx-auto mb-4" style={{ color: "#4A9B6F" }} />
              <h3 className="text-base font-black mb-2" style={{ color: "#FFF8F5" }}>המנוי בוטל</h3>
              <p className="text-sm mb-6" style={{ color: "#5A3830" }}>
                הגישה שלך פעילה עד תום תקופת החיוב. תמיד תוכלי לחזור!
              </p>
              <button onClick={onClose}
                className="w-full py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-80"
                style={{ background: "#140e12", color: "#FFF8F5", border: "1px solid rgba(196,133,122,0.12)" }}>
                סגרי
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
