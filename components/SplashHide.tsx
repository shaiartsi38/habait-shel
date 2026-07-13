"use client";
import { useEffect } from "react";

export default function SplashHide() {
  useEffect(() => {
    window.dispatchEvent(new Event("habait-ready"));
  }, []);
  return null;
}
