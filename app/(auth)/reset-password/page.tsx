"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState<boolean | null>(null);

  useEffect(() => {
    // Supabase exchanges the code in the URL automatically — just verify session exists
    createClient().auth.getSession().then(({ data: { session } }) => {
      setSessionReady(!!session);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError("הסיסמה חייבת להכיל לפחות 6 תווים"); return; }
    if (password !== confirm)  { setError("הסיסמאות אינן תואמות"); return; }
    setLoading(true);
    setError(null);
    try {
      const sb = createClient();
      const { error: authErr } = await sb.auth.updateUser({ password });
      if (authErr) throw authErr;
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "שגיאה בעדכון הסיסמה");
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
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #C4857A, #D4998E, #C4857A)" }} />

        <div className="px-8 py-9">
          <div className="text-center mb-8">
            <p className="text-[0.55rem] tracking-[0.32em] uppercase mb-2" style={{ color: "#C4857A" }}>by Natalie Artzi</p>
            <h1 className="text-xl font-black" style={{ color: "#FFF8F5" }}>סיסמה חדשה</h1>
            <p className="text-xs mt-2" style={{ color: "#5A3830" }}>הגדרת סיסמה חדשה לחשבון</p>
          </div>

          {sessionReady === null && (
            <div className="flex justify-center py-8">
              <Loader2 size={22} className="animate-spin" style={{ color: "#C4857A" }} />
            </div>
          )}

          {sessionReady === false && (
            <div className="text-center py-4">
              <p className="text-sm mb-4" style={{ color: "#e05555" }}>
                הקישור לאיפוס פג תוקפו או אינו תקין.
              </p>
              <Link href="/forgot-password" className="text-[0.75rem] font-semibold hover:underline" style={{ color: "#C4857A" }}>
                בקשי קישור חדש
              </Link>
            </div>
          )}

          {sessionReady === true && !done && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[0.6rem] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#8B6355" }}>
                  סיסמה חדשה
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    dir="ltr"
                    placeholder="לפחות 6 תווים"
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.14)", color: "#FFF8F5", caretColor: "#C4857A" }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(196,133,122,0.45)")}
                    onBlur={(e)  => (e.target.style.borderColor = "rgba(196,133,122,0.14)")}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#5A3830" }}>
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[0.6rem] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#8B6355" }}>
                  אימות סיסמה
                </label>
                <input
                  type={showPass ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  dir="ltr"
                  placeholder="חזרי על הסיסמה"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.14)", color: "#FFF8F5", caretColor: "#C4857A" }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(196,133,122,0.45)")}
                  onBlur={(e)  => (e.target.style.borderColor = "rgba(196,133,122,0.14)")}
                />
              </div>

              {error && (
                <p className="text-[0.7rem] text-center py-2 rounded-lg" style={{ background: "rgba(196,50,50,0.1)", color: "#e05555", border: "1px solid rgba(196,50,50,0.2)" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-[0.85rem] font-black transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                style={{ background: "linear-gradient(135deg,#C4857A,#D4998E)", color: "#080608", boxShadow: "0 6px 20px rgba(196,133,122,0.32)" }}
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? "שומרת..." : "שמרי סיסמה חדשה"}
              </button>
            </form>
          )}

          {done && (
            <motion.div
              className="flex flex-col items-center gap-4 py-4 text-center"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <CheckCircle2 size={40} style={{ color: "#4A9B6F" }} />
              <p className="text-sm font-semibold" style={{ color: "#FFF8F5" }}>הסיסמה עודכנה!</p>
              <p className="text-[0.7rem]" style={{ color: "#5A3830" }}>מעבירה אותך לדשבורד...</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
