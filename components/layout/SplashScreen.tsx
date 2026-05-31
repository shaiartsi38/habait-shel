"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: "#080608" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {/* גלו עדין ברקע */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 55% 38% at 50% 50%, rgba(196,133,122,0.09) 0%, transparent 68%)",
            }}
          />

          {/* לוגו — מוצג מיידית, ללא initial opacity:0 */}
          <div className="relative flex flex-col items-center gap-3 select-none">
            <motion.div
              className="flex flex-col items-center gap-3"
              animate={{ scale: [1, 1.014, 1], opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* תת-כותרת */}
              <span
                className="text-[0.65rem] tracking-[0.35em] uppercase"
                style={{ color: "#C4857A" }}
              >
                Natalie Artsi
              </span>

              {/* שם */}
              <div className="flex flex-col items-center leading-none gap-1">
                <span
                  className="text-[2rem] font-light tracking-wide"
                  style={{ color: "#FFF8F5", fontFamily: "Heebo, sans-serif" }}
                >
                  הבית של
                </span>
                <span
                  className="text-[3.2rem] font-black tracking-tight"
                  style={{
                    fontFamily: "Heebo, sans-serif",
                    backgroundImage:
                      "linear-gradient(135deg, #C4857A 0%, #D4998E 50%, #C4857A 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  המאפרים
                </span>
              </div>

              {/* קו */}
              <div
                className="h-px w-16 mt-1"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(196,133,122,0.6), transparent)",
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
