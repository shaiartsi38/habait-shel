"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: "₪49",
    period: "לחודש",
    desc: "כניסה לעולם — קורסי מתחילות ומדגמי תוכן",
    color: "#8B6355",
    features: [
      "גישה לכל קורסי Basic",
      "שיעורים חינמיים בכל קורסי Pro",
      "קהילה בסיסית",
      "עדכוני תוכן חודשיים",
    ],
    cta: "התחילי עם Basic",
    featured: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "₪89",
    period: "לחודש",
    desc: "הרמה הפרו — גישה לרוב התוכן + קהילה",
    color: "#C4857A",
    features: [
      "גישה לכל קורסי Basic + Pro",
      "קהילה Pro עם פידבק שבועי",
      "שאלות ישירות לנטלי",
      "ספריית כלים ומשאבים",
      "הנחות על ציוד ואביזרים",
    ],
    cta: "הצטרפי ל-Pro",
    featured: true,
  },
  {
    id: "elite",
    name: "Elite",
    price: "₪149",
    period: "לחודש",
    desc: "כל מה שיש — ללא פשרות, ללא גבולות",
    color: "#D4998E",
    features: [
      "גישה מלאה לכל הקורסים",
      "קהילה Elite — VIP בלבד",
      "מפגשי Live חודשיים עם נטלי",
      "פידבק אישי על עבודות",
      "ריטריט שנתי — הנחה מיוחדת",
      "תעודת מקצועית דיגיטלית",
    ],
    cta: "הצטרפי ל-Elite",
    featured: false,
  },
];

const FAQ = [
  { q: "האם יש ניסיון חינם?", a: "כן — שיעורים מסומנים כ'חינמי' זמינים לכולן, ללא קרדיט." },
  { q: "האם אוכל לבטל בכל עת?", a: "בהחלט. אין מינימום ואין דמי ביטול." },
  { q: "מה ההבדל בין Pro ל-Elite?", a: "Elite כוללת מפגשי Live, פידבק אישי ותעודה — Pro היא הרמה היומיומית המלאה." },
  { q: "האם הקורסים בעברית?", a: "כולם בעברית, עם כתוביות ומצגות מקצועיות." },
];

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen sidebar-safe px-4 md:px-12 py-16" style={{ background: "var(--black)" }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-[0.58rem] tracking-[0.3em] uppercase mb-3" style={{ color: "#C4857A" }}>מנויים</p>
          <h1 className="text-3xl md:text-4xl font-black mb-3" style={{ color: "#FFF8F5" }}>
            בחרי את הרמה שלך
          </h1>
          <p className="text-sm max-w-md mx-auto" style={{ color: "#5A3830" }}>
            כל מנוי כולל גישה מיידית — אין המתנה, אין בירוקרטיה.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-3 gap-5 mb-16 max-w-4xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              className="relative rounded-2xl overflow-hidden flex flex-col"
              style={{
                background: plan.featured ? "rgba(20,14,18,0.9)" : "#140e12",
                border: plan.featured ? `1px solid rgba(196,133,122,0.35)` : "1px solid rgba(196,133,122,0.1)",
                boxShadow: plan.featured ? "0 0 40px rgba(196,133,122,0.1)" : "none",
              }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              {/* Top accent */}
              {plan.featured && (
                <>
                  <div className="h-[2px] w-full" style={{ background: "linear-gradient(90deg,#C4857A,#D4998E,#C4857A)" }} />
                  <div className="absolute top-3 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[0.55rem] font-bold" style={{ background: "rgba(196,133,122,0.15)", color: "#C4857A", border: "1px solid rgba(196,133,122,0.3)" }}>
                      <Sparkles size={9} /> הכי פופולרי
                    </span>
                  </div>
                </>
              )}

              <div className="p-7 flex flex-col flex-1" style={{ paddingTop: plan.featured ? "2.5rem" : "1.75rem" }}>
                {/* Plan name */}
                <p className="text-[0.6rem] tracking-[0.25em] uppercase font-bold mb-3" style={{ color: plan.color }}>{plan.name}</p>

                {/* Price */}
                <div className="mb-2">
                  <span className="text-3xl font-black" style={{ color: "#FFF8F5" }}>{plan.price}</span>
                  <span className="text-sm font-medium mr-1" style={{ color: "#5A3830" }}>{plan.period}</span>
                </div>

                <p className="text-[0.7rem] mb-6 leading-relaxed" style={{ color: "#5A3830" }}>{plan.desc}</p>

                {/* Features */}
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${plan.color}20`, border: `1px solid ${plan.color}40` }}>
                        <Check size={9} style={{ color: plan.color }} strokeWidth={3} />
                      </div>
                      <span className="text-[0.72rem] leading-relaxed" style={{ color: "rgba(255,248,245,0.6)" }}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href="/signup"
                  className="block w-full py-3 rounded-xl text-center text-[0.82rem] font-black transition-all hover:opacity-90 active:scale-95"
                  style={
                    plan.featured
                      ? { background: "linear-gradient(135deg,#C4857A,#D4998E)", color: "#080608", boxShadow: "0 4px 18px rgba(196,133,122,0.3)" }
                      : { background: "rgba(196,133,122,0.1)", color: "#C4857A", border: "1px solid rgba(196,133,122,0.2)" }
                  }
                >
                  {plan.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-base font-black mb-6 text-center" style={{ color: "#FFF8F5" }}>שאלות נפוצות</h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <motion.div
                key={item.q}
                className="rounded-2xl p-5"
                style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.08)" }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
              >
                <p className="text-sm font-bold mb-1" style={{ color: "#FFF8F5" }}>{item.q}</p>
                <p className="text-[0.72rem] leading-relaxed" style={{ color: "#5A3830" }}>{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </motion.div>
    </div>
  );
}
