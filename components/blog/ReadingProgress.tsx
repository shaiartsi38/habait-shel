"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div
      className="fixed top-0 right-0 left-0 h-[3px] z-50 origin-left"
      style={{
        background: "linear-gradient(90deg, #C4857A, #c9a96e)",
        transform: `scaleX(${progress / 100})`,
        transformOrigin: "right",
        transition: "transform 0.1s linear",
      }}
    />
  );
}
