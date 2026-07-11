"use client";
import { useEffect } from "react";

export default function SplashHide() {
  useEffect(() => {
    const t = setTimeout(() => {
      const el = document.getElementById("__splash");
      if (el) el.remove();
    }, 2600);
    return () => clearTimeout(t);
  }, []);
  return null;
}
