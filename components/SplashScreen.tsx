"use client";
import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("splash-shown")) {
      setVisible(false);
      return;
    }
    const t1 = setTimeout(() => setFading(true), 1800);
    const t2 = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("splash-shown", "1");
    }, 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "#080608",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.7s ease",
        pointerEvents: fading ? "none" : "all",
      }}
    >
      <div style={{
        position: "absolute", width: 640, height: 640, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(196,133,122,0.06) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      <img
        src="/logo-habait.png"
        alt="הבית של המאפרים"
        style={{
          width: "clamp(260px, 55vw, 560px)",
          height: "auto",
          position: "relative",
          animation: "splashIn 0.9s cubic-bezier(0.22,1,0.36,1) both",
        }}
      />

      <div style={{
        marginTop: 40, width: 80, height: 1,
        background: "rgba(196,133,122,0.12)",
        borderRadius: 1, overflow: "hidden", position: "relative",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0,
          width: "100%", height: "100%",
          background: "linear-gradient(to right, transparent, #C4857A 50%, transparent)",
          animation: "splashBar 1.6s ease-in-out 0.5s both",
        }} />
      </div>

      <style>{`
        @keyframes splashIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashBar {
          from { transform: translateX(-200%); }
          to   { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
