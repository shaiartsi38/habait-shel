"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "#080608" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        {/* Decorative number */}
        <p
          className="font-black mb-2 leading-none select-none"
          style={{
            fontSize: "clamp(6rem, 20vw, 11rem)",
            backgroundImage: "linear-gradient(135deg, rgba(196,133,122,0.18) 0%, rgba(196,133,122,0.06) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          404
        </p>

        <p className="text-[0.58rem] tracking-[0.3em] uppercase mb-3" style={{ color: "#C4857A" }}>
          הדף לא נמצא
        </p>
        <h1 className="text-2xl font-black mb-3" style={{ color: "#FFF8F5" }}>
          נראה שהלכת לאיבוד
        </h1>
        <p className="text-sm mb-8 max-w-xs" style={{ color: "#5A3830" }}>
          הדף שחיפשת לא קיים, אולי הועבר או שה-URL שגוי.
        </p>

        <Link
          href="/"
          className="px-7 py-3 rounded-2xl font-black text-[0.85rem] transition-opacity hover:opacity-90 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #C4857A, #D4998E)",
            color: "#080608",
            boxShadow: "0 6px 24px rgba(196,133,122,0.35)",
          }}
        >
          חזרה לדף הבית
        </Link>
      </motion.div>
    </div>
  );
}
