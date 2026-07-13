"use client";

import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────
interface A11ySettings {
  highlightLinks: boolean;
  highContrast:   boolean;
  textSpacing:    boolean;
  largeText:      boolean;
  hideImages:     boolean;
  noAnimations:   boolean;
  largeCursor:    boolean;
  dyslexia:       boolean;
  lineHeight:     boolean;
  tooltips:       boolean;
  grayscale:      boolean;
  textAlign:      boolean;
}

const DEFAULT: A11ySettings = {
  highlightLinks: false,
  highContrast:   false,
  textSpacing:    false,
  largeText:      false,
  hideImages:     false,
  noAnimations:   false,
  largeCursor:    false,
  dyslexia:       false,
  lineHeight:     false,
  tooltips:       false,
  grayscale:      false,
  textAlign:      false,
};

const CLASS_MAP: Record<keyof A11ySettings, string> = {
  highlightLinks: "a11y-highlight-links",
  highContrast:   "a11y-high-contrast",
  textSpacing:    "a11y-text-spacing",
  largeText:      "a11y-large-text",
  hideImages:     "a11y-hide-images",
  noAnimations:   "a11y-no-animations",
  largeCursor:    "a11y-large-cursor",
  dyslexia:       "a11y-dyslexia",
  lineHeight:     "a11y-line-height",
  tooltips:       "a11y-tooltips",
  grayscale:      "a11y-grayscale",
  textAlign:      "a11y-text-align",
};

const STORAGE_KEY = "habait-a11y-v1";

// ─── Icons (inline SVG — no external deps) ────────────────────────
function IconA11y() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="1.5" fill="currentColor" stroke="none"/>
      <path d="M6 8h12M12 8v5M9.5 20l2.5-5 2.5 5"/>
      <path d="M8 13c0 0-1 4.5 1.5 6.5M16 13c0 0 1 4.5-1.5 6.5"/>
    </svg>
  );
}

type IconKey = "link"|"monitor"|"spacing"|"type"|"image-off"|"pause"|"cursor"|"book"|"align"|"info"|"droplet"|"center"|"reset"|"x";

function Icon({ name, size = 26 }: { name: IconKey; size?: number }) {
  const s = size;
  const icons: Record<IconKey, JSX.Element> = {
    link: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
    monitor: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
    spacing: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10H3M21 6H3M21 14H3M21 18H3"/></svg>,
    type: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>,
    "image-off": <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" y1="2" x2="22" y2="22"/><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"/><line x1="13.5" y1="6.5" x2="20" y2="6.5"/><path d="M22 22l-5.5-5.5M21.17 21.17A2 2 0 0 1 20 22H4a2 2 0 0 1-2-2V6c0-.53.21-1.01.55-1.36"/></svg>,
    pause: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/></svg>,
    cursor: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m4 4 7.07 17 2.51-7.39L21 11.07z"/></svg>,
    book: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><text x="3" y="18" style={{fontSize:"14px",fontWeight:"900",fill:"currentColor",stroke:"none"}}>Df</text></svg>,
    align: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="9" y2="18"/></svg>,
    info: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    droplet: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
    center: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></svg>,
    reset: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>,
    x: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  };
  return icons[name] ?? null;
}

// ─── Option definitions ───────────────────────────────────────────
const OPTIONS: { key: keyof A11ySettings; label: string; icon: IconKey }[] = [
  { key: "highlightLinks", label: "הדגשת קישורים",   icon: "link"      },
  { key: "highContrast",   label: "ניגודיות בהירה",  icon: "monitor"   },
  { key: "textSpacing",    label: "ריווח טקסט",      icon: "spacing"   },
  { key: "largeText",      label: "טקסט גדול",        icon: "type"      },
  { key: "hideImages",     label: "הסתרת תמונות",    icon: "image-off" },
  { key: "noAnimations",   label: "ביטול הנפשות",    icon: "pause"     },
  { key: "largeCursor",    label: "סמן",              icon: "cursor"    },
  { key: "dyslexia",       label: "תמיכה בדיסלקסיה", icon: "book"      },
  { key: "lineHeight",     label: "גובה שורה",        icon: "align"     },
  { key: "tooltips",       label: "תאורים",           icon: "info"      },
  { key: "grayscale",      label: "רווי",             icon: "droplet"   },
  { key: "textAlign",      label: "יישור טקסט",       icon: "center"    },
];

// ─── Component ────────────────────────────────────────────────────
export function AccessibilityWidget() {
  const [isOpen,      setIsOpen]      = useState(false);
  const [largeMode,   setLargeMode]   = useState(false);
  const [settings,    setSettings]    = useState<A11ySettings>(DEFAULT);
  const [cursorPos,   setCursorPos]   = useState({ x: -100, y: -100 });
  const panelRef = useRef<HTMLDivElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({ ...DEFAULT, ...JSON.parse(raw) });
    } catch {}
  }, []);

  // Apply / remove CSS classes on <html> + persist
  useEffect(() => {
    const html = document.documentElement;
    (Object.keys(CLASS_MAP) as (keyof A11ySettings)[]).forEach(k => {
      if (settings[k]) html.classList.add(CLASS_MAP[k]);
      else              html.classList.remove(CLASS_MAP[k]);
    });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch {}
  }, [settings]);

  // CTRL+U shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "u") { e.preventDefault(); setIsOpen(o => !o); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Large cursor follower
  useEffect(() => {
    if (!settings.largeCursor) return;
    const move = (e: MouseEvent) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [settings.largeCursor]);

  // Close panel on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const btn = document.getElementById("a11y-trigger");
        if (btn && btn.contains(e.target as Node)) return;
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const toggle = (key: keyof A11ySettings) =>
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  const resetAll = () => setSettings(DEFAULT);

  const panelWidth = largeMode ? 380 : 310;
  const cardH      = largeMode ? 96  : 82;
  const anyActive  = (Object.values(settings) as boolean[]).some(Boolean);

  return (
    <>
      {/* Large cursor ring */}
      {settings.largeCursor && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            left: cursorPos.x - 18,
            top:  cursorPos.y - 18,
            width: 36, height: 36,
            borderRadius: "50%",
            border: "2.5px solid #1a3a5c",
            background: "rgba(26,58,92,0.12)",
            pointerEvents: "none",
            zIndex: 99999,
            transition: "left 0.04s linear, top 0.04s linear",
          }}
        />
      )}

      {/* ── Floating trigger button ── */}
      <button
        id="a11y-trigger"
        onClick={() => setIsOpen(o => !o)}
        aria-label="פתח תפריט נגישות (CTRL+U)"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        style={{
          position: "fixed",
          bottom: 24,
          left: 24,
          width: 50, height: 50,
          borderRadius: "50%",
          background: "#0f0b0e",
          border: `2px solid ${anyActive ? "#C4857A" : "rgba(196,133,122,0.35)"}`,
          color: "#C4857A",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          zIndex: 9990,
          boxShadow: anyActive
            ? "0 4px 20px rgba(196,133,122,0.3)"
            : "0 4px 16px rgba(0,0,0,0.5)",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
      >
        <IconA11y />
        {/* Active indicator dot */}
        {anyActive && (
          <span style={{
            position: "absolute", top: 6, right: 6,
            width: 8, height: 8, borderRadius: "50%",
            background: "#C4857A",
            border: "2px solid #0f0b0e",
          }} />
        )}
      </button>

      {/* ── Panel ── */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="תפריט נגישות"
          aria-modal="false"
          dir="rtl"
          style={{
            position: "fixed",
            bottom: 86,
            left: 24,
            width: panelWidth,
            maxHeight: "82vh",
            overflowY: "auto",
            background: "#ffffff",
            borderRadius: 18,
            boxShadow: "0 12px 48px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)",
            zIndex: 9991,
            fontFamily: "'Heebo', system-ui, sans-serif",
            transition: "width 0.2s ease",
          }}
        >
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "13px 16px",
            background: "#1a3a5c",
            borderRadius: "18px 18px 0 0",
            color: "#ffffff",
            position: "sticky", top: 0, zIndex: 2,
          }}>
            <span style={{ fontWeight: 700, fontSize: "0.88rem", letterSpacing: "0.01em" }}>
              תפריט נגישות (CTRL+U)
            </span>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="סגור תפריט נגישות"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1.5px solid rgba(255,255,255,0.4)",
                borderRadius: "50%",
                width: 28, height: 28,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", cursor: "pointer",
              }}
            >
              <Icon name="x" size={13} />
            </button>
          </div>

          <div style={{ padding: "12px 14px 16px" }}>
            {/* Large widget toggle */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "flex-end",
              gap: 10, marginBottom: 12,
            }}>
              <span style={{ fontSize: "0.8rem", color: "#333", fontWeight: 600 }}>
                יישומון גדול
              </span>
              <button
                onClick={() => setLargeMode(v => !v)}
                aria-pressed={largeMode}
                aria-label="מצב יישומון גדול"
                style={{
                  width: 44, height: 24, borderRadius: 12,
                  background: largeMode ? "#1a3a5c" : "#d1d5db",
                  border: "none", cursor: "pointer",
                  position: "relative", transition: "background 0.2s",
                  flexShrink: 0,
                }}
              >
                {largeMode && (
                  <span style={{
                    position: "absolute", top: 4, right: 5,
                    color: "#fff", fontSize: 11, lineHeight: 1,
                    fontWeight: 700,
                  }}>✕</span>
                )}
                <span style={{
                  position: "absolute",
                  top: 3,
                  left: largeMode ? "calc(100% - 21px)" : 3,
                  width: 18, height: 18, borderRadius: "50%",
                  background: "#fff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  transition: "left 0.2s",
                }} />
              </button>
            </div>

            {/* Options grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}>
              {OPTIONS.map(({ key, label, icon }) => {
                const active = settings[key];
                return (
                  <button
                    key={key}
                    onClick={() => toggle(key)}
                    aria-pressed={active}
                    aria-label={label}
                    style={{
                      position: "relative",
                      height: cardH,
                      borderRadius: 12,
                      border: `2px solid ${active ? "#1a3a5c" : "#e5e7eb"}`,
                      background: active ? "rgba(26,58,92,0.06)" : "#f9fafb",
                      cursor: "pointer",
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      gap: 7,
                      color: active ? "#1a3a5c" : "#555",
                      transition: "border-color 0.18s, background 0.18s, color 0.18s",
                      padding: "6px 4px",
                    }}
                  >
                    {active && (
                      <span style={{
                        position: "absolute", top: 5, right: 7,
                        width: 17, height: 17, borderRadius: "50%",
                        background: "#1a3a5c", color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 800, lineHeight: 1,
                      }}>✓</span>
                    )}
                    <Icon name={icon} size={largeMode ? 30 : 26} />
                    <span style={{
                      fontSize: largeMode ? "0.72rem" : "0.64rem",
                      fontWeight: 600,
                      textAlign: "center",
                      lineHeight: 1.25,
                      color: "inherit",
                    }}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Reset */}
            <button
              onClick={resetAll}
              style={{
                marginTop: 12,
                width: "100%",
                padding: "11px 12px",
                borderRadius: 10,
                background: "#1a3a5c",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "0.82rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 8,
                fontFamily: "inherit",
                letterSpacing: "0.01em",
              }}
            >
              <Icon name="reset" size={15} />
              אפס את כל הגדרות הנגישות
            </button>
          </div>
        </div>
      )}
    </>
  );
}
