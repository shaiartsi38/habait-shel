"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError("הסיסמה חייבת להיות לפחות 6 תווים"); return; }
    setLoading(true);
    setError(null);
    try {
      const sb = createClient();
      const { error: authErr } = await sb.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (authErr) throw authErr;
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "שגיאה בהרשמה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="w-full max-w-sm"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="rounded-3xl overflow-hidden"
        style={{
          background: "rgba(14,10,12,0.7)",
          backdropFilter: "blur(32px)",
          border: "1px solid rgba(196,133,122,0.12)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#C4857A,#D4998E,#C4857A)" }} />

        <div className="px-8 py-9">
          {done ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(74,155,111,0.15)", border: "1px solid rgba(74,155,111,0.3)" }}>
                <Check size={24} style={{ color: "#4A9B6F" }} />
              </div>
              <h2 className="text-base font-black mb-2" style={{ color: "#FFF8F5" }}>כמעט שם!</h2>
              <p className="text-[0.7rem] leading-relaxed" style={{ color: "#5A3830" }}>
                שלחנו לך מייל אימות לכתובת<br />
                <strong style={{ color: "#C4857A" }}>{email}</strong><br />
                אשרי את המייל כדי להתחיל.
              </p>
              <Link href="/login" className="inline-block mt-5 text-[0.72rem] font-semibold" style={{ color: "#C4857A" }}>
                חזרי לכניסה ←
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <p className="text-[0.55rem] tracking-[0.32em] uppercase mb-2" style={{ color: "#C4857A" }}>by Natalie Artzi</p>
                <h1 className="text-xl font-black" style={{ color: "#FFF8F5" }}>הצטרפי אלינו</h1>
                <p className="text-xs mt-2" style={{ color: "#5A3830" }}>יצירת חשבון חדש</p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-[0.6rem] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#8B6355" }}>שם מלא</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="נטלי ישראלית"
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.14)", color: "#FFF8F5", caretColor: "#C4857A" }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(196,133,122,0.45)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(196,133,122,0.14)")}
                  />
                </div>
                <div>
                  <label className="block text-[0.6rem] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#8B6355" }}>אימייל</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.14)", color: "#FFF8F5", caretColor: "#C4857A" }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(196,133,122,0.45)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(196,133,122,0.14)")}
                  />
                </div>
                <div>
                  <label className="block text-[0.6rem] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#8B6355" }}>סיסמה</label>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required dir="ltr" placeholder="מינימום 6 תווים"
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                      style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.14)", color: "#FFF8F5", caretColor: "#C4857A" }}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(196,133,122,0.45)")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(196,133,122,0.14)")}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#5A3830" }}>
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-[0.7rem] text-center py-2 rounded-lg" style={{ background: "rgba(196,50,50,0.1)", color: "#e05555", border: "1px solid rgba(196,50,50,0.2)" }}>
                    {error}
                  </p>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl text-[0.85rem] font-black transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                  style={{ background: "linear-gradient(135deg,#C4857A,#D4998E)", color: "#080608", boxShadow: "0 6px 20px rgba(196,133,122,0.32)" }}
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {loading ? "נרשמת..." : "הרשמה"}
                </button>
              </form>

              <p className="text-center text-[0.65rem] mt-6" style={{ color: "#3A2020" }}>
                כבר יש לך חשבון?{" "}
                <Link href="/login" className="font-semibold hover:underline" style={{ color: "#C4857A" }}>כניסה</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
