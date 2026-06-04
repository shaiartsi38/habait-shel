"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CreditCard, Heart, Home, LayoutDashboard, Play, Settings, Sparkles, Users, PanelRightClose, PanelRightOpen, LogIn, LogOut, UserCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/",              label: "בית",         icon: Home },
  { href: "/courses",       label: "קורסים",       icon: Play },
  { href: "/favorites",     label: "מועדפים",      icon: Heart },
  { href: "/dashboard",     label: "דשבורד",        icon: LayoutDashboard },
  { href: "/community",     label: "קהילה",        icon: Users },
  { href: "/subscription",  label: "מנוי",         icon: CreditCard },
  { href: "/natalie",       label: "נטלי ארצי",    icon: Sparkles },
  { href: "/profile",       label: "הפרופיל שלי",  icon: UserCircle },
] as const;

export default function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [open, setOpen]       = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
    const { data: { subscription } } = sb.auth.onAuthStateChange((_, session) => {
      setUserEmail(session?.user.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const sb = createClient();
    await sb.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* ── Desktop ─────────────────────────────────────────── */}
      <>
        {/* Toggle button */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="hidden md:flex fixed top-5 right-5 z-[60] items-center gap-2 px-3 h-10 rounded-xl transition-all hover:opacity-90 active:scale-95"
          style={{
            background: open ? "rgba(196,133,122,0.12)" : "linear-gradient(135deg,rgba(196,133,122,0.22),rgba(196,133,122,0.12))",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(196,133,122,0.35)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.45), 0 0 0 1px rgba(196,133,122,0.08) inset",
          }}
          aria-label={open ? "סגור תפריט" : "פתח תפריט"}
        >
          {open
            ? <PanelRightClose size={16} style={{ color: "#C4857A" }} />
            : <PanelRightOpen  size={16} style={{ color: "#C4857A" }} />
          }
          <span className="text-[0.68rem] font-semibold" style={{ color: "#C4857A" }}>
            {open ? "סגור" : "תפריט"}
          </span>
        </button>

        {/* Sidebar panel */}
        <AnimatePresence>
          {open && (
            <motion.nav
              aria-label="ניווט ראשי"
              className="hidden md:flex fixed top-4 bottom-4 right-4 z-50 flex-col"
              style={{ width: 248 }}
              initial={{ x: 280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 280, opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 36 }}
            >
              <div
                className="flex flex-col h-full rounded-3xl overflow-hidden"
                style={{
                  background: "rgba(10,10,10,0.72)",
                  backdropFilter: "blur(32px) saturate(180%)",
                  WebkitBackdropFilter: "blur(32px) saturate(180%)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow:
                    "0 0 0 0.5px rgba(196,133,122,0.08) inset, 0 1px 0 rgba(255,255,255,0.05) inset, 0 16px 64px rgba(0,0,0,0.65)",
                }}
              >
                {/* Brand */}
                <div className="px-5 pt-6 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <p className="text-[0.56rem] tracking-[0.34em] uppercase mb-1.5 font-semibold" style={{ color: "#C4857A" }}>
                    Natalie Artsi
                  </p>
                  <p className="text-[0.9rem] font-bold leading-tight" style={{ color: "#FFF8F5" }}>
                    הבית של המאפרים
                  </p>
                </div>

                {/* Nav */}
                <div className="flex-1 py-3 px-3 flex flex-col gap-0.5 overflow-y-auto">
                  {NAV.map((item) => (
                    <NavItem
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      active={isActive(item.href)}
                      onClick={item.href === "/courses" ? () => setOpen(false) : undefined}
                    />
                  ))}
                  {isAdmin && (
                    <>
                      <div className="my-2 mx-2 h-px" style={{ background: "rgba(255,255,255,0.04)" }} />
                      <NavItem href="/admin" label="ניהול" icon={Settings} active={isActive("/admin")} />
                    </>
                  )}
                </div>

                {/* Auth + CTA */}
                <div className="px-4 pb-5 pt-4 flex flex-col gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                  {userEmail ? (
                    <>
                      <p className="text-[0.55rem] truncate text-center" style={{ color: "#5A3830" }}>{userEmail}</p>
                      <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-[0.72rem] font-semibold hover:opacity-80 transition-opacity"
                        style={{ color: "#8B6355", border: "1px solid rgba(196,133,122,0.12)" }}
                      >
                        <LogOut size={12} /> יציאה
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-[0.72rem] font-semibold hover:opacity-80 transition-opacity"
                      style={{ color: "#C4857A", border: "1px solid rgba(196,133,122,0.2)" }}
                    >
                      <LogIn size={12} /> כניסה
                    </Link>
                  )}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
                    <Link
                      href="/subscription"
                      className="block w-full py-2.5 rounded-xl text-center text-[0.8rem] font-black"
                      style={{
                        background: "linear-gradient(135deg, #C4857A 0%, #D4998E 100%)",
                        color: "#080608",
                        boxShadow: "0 4px 18px rgba(196,133,122,0.32)",
                      }}
                    >
                      שדרג את המנוי
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </>

      {/* ── Mobile — bottom tab bar ──────────────────────────── */}
      <motion.nav
        aria-label="ניווט תחתון"
        className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-center justify-around"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, delay: 0.18 }}
        style={{
          background: "rgba(8,6,8,0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderTop: "1px solid rgba(196,133,122,0.1)",
          paddingBottom: "max(0.875rem, env(safe-area-inset-bottom))",
          paddingTop: "0.625rem",
        }}
      >
        <MobileTab href="/" label="בית" icon={Home} active={isActive("/")} />
        <MobileTab href="/courses" label="קורסים" icon={Play} active={isActive("/courses")} />
        {userEmail ? (
          <>
            {isAdmin
              ? <MobileTab href="/admin" label="ניהול" icon={Settings} active={isActive("/admin")} />
              : <MobileTab href="/dashboard" label="דשבורד" icon={LayoutDashboard} active={isActive("/dashboard")} />
            }
            <MobileTab href="/community" label="קהילה" icon={Users} active={isActive("/community")} />
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-0.5 px-2 min-w-[52px]"
              style={{ minHeight: 44, justifyContent: "center" }}
            >
              <div className="p-2 rounded-xl">
                <LogOut size={22} style={{ color: "#8B6355" }} />
              </div>
              <span className="text-[0.56rem] font-medium" style={{ color: "#8B6355" }}>יציאה</span>
            </button>
          </>
        ) : (
          <>
            <MobileTab href="/subscription" label="מנוי" icon={CreditCard} active={isActive("/subscription")} />
            <Link
              href="/login"
              className="flex flex-col items-center gap-0.5 px-2 min-w-[52px]"
              style={{ minHeight: 44, justifyContent: "center" }}
            >
              <div className="p-2 rounded-xl">
                <LogIn size={22} style={{ color: "#C4857A" }} />
              </div>
              <span className="text-[0.56rem] font-medium" style={{ color: "#C4857A" }}>כניסה</span>
            </Link>
          </>
        )}
      </motion.nav>
    </>
  );
}

// ── Desktop nav item ─────────────────────────────────────────────
function NavItem({ href, label, icon: Icon, active, onClick }: { href: string; label: string; icon: React.ElementType; active: boolean; onClick?: () => void }) {
  return (
    <Link href={href} className="block relative" onClick={onClick}>
      <motion.div
        className="relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-[0.82rem] font-medium cursor-pointer select-none"
        style={{ color: active ? "#FFF8F5" : "#4A2E2E" }}
        whileHover={{ color: active ? "#FFF8F5" : "#8B6355" }}
        transition={{ duration: 0.14 }}
      >
        <AnimatePresence>
          {active && (
            <motion.div
              layoutId="sidebar-pill"
              className="absolute inset-0 rounded-xl"
              style={{ background: "rgba(196,133,122,0.1)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {active && (
            <motion.div
              layoutId="sidebar-line"
              className="absolute right-0 top-2.5 bottom-2.5 w-[2px] rounded-full"
              style={{ background: "linear-gradient(180deg,#C4857A,#D4998E)" }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              exit={{ scaleY: 0 }}
            />
          )}
        </AnimatePresence>
        <Icon size={15} className="relative z-10 shrink-0" style={{ color: active ? "#C4857A" : "currentColor", transition: "color 0.14s" }} />
        <span className="relative z-10">{label}</span>
      </motion.div>
    </Link>
  );
}

// ── Mobile tab item ───────────────────────────────────────────────
function MobileTab({ href, label, icon: Icon, active }: { href: string; label: string; icon: React.ElementType; active: boolean }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-0.5 px-2 min-w-[52px]"
      style={{ minHeight: 44, justifyContent: "center" }}
    >
      <motion.div className="p-2 rounded-xl" animate={{ background: active ? "rgba(196,133,122,0.12)" : "rgba(0,0,0,0)" }}>
        <Icon size={22} style={{ color: active ? "#C4857A" : "#3A1818", transition: "color 0.18s" }} />
      </motion.div>
      <span className="text-[0.56rem] font-medium" style={{ color: active ? "#C4857A" : "#3A1818" }}>
        {label}
      </span>
    </Link>
  );
}
