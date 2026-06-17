"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const sb = createClient();
      const { error: authErr } = await sb.auth.signInWithPassword({ email, password });
      if (authErr) throw authErr;
      const { data: { user } } = await sb.auth.getUser();
      const { data: profile } = await sb
        .from("profiles")
        .select("role, first_name")
        .eq("id", user!.id)
        .single();
      if (profile?.role === "admin") router.push("/admin");
      else if (!profile?.first_name) router.push("/profile");
      else router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? "אימייל או סיסמה שגויים" : "שגיאה לא ידועה");
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
      {/* Card */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{
          background: "rgba(14,10,12,0.7)",
          backdropFilter: "blur(32px)",
          border: "1px solid rgba(196,133,122,0.12)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        {/* Top stripe */}
        <div
          className="h-1 w-full"
          style={{ background: "linear-gradient(90deg, #C4857A, #D4998E, #C4857A)" }}
        />

        <div className="px-8 py-9">
          {/* Brand */}
          <div className="text-center mb-8">
            <p className="text-[0.55rem] tracking-[0.32em] uppercase mb-2" style={{ color: "#C4857A" }}>Natalie Artsi</p>
            <h1 className="text-xl font-black" style={{ color: "#FFF8F5" }}>הבית של המאפרים</h1>
            <p className="text-xs mt-2" style={{ color: "#5A3830" }}>כניסה לחשבון</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[0.6rem] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#8B6355" }}>
                אימייל
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.14)", color: "#FFF8F5", caretColor: "#C4857A" }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(196,133,122,0.45)")}
                onBlur={(e)  => (e.target.style.borderColor = "rgba(196,133,122,0.14)")}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[0.6rem] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#8B6355" }}>
                סיסמה
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  dir="ltr"
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.14)", color: "#FFF8F5", caretColor: "#C4857A" }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(196,133,122,0.45)")}
                  onBlur={(e)  => (e.target.style.borderColor = "rgba(196,133,122,0.14)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#5A3830" }}
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-[0.7rem] text-center py-2 rounded-lg" style={{ background: "rgba(196,50,50,0.1)", color: "#e05555", border: "1px solid rgba(196,50,50,0.2)" }}>
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-[0.85rem] font-black transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              style={{ background: "linear-gradient(135deg,#C4857A,#D4998E)", color: "#080608", boxShadow: "0 6px 20px rgba(196,133,122,0.32)" }}
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? "נכנסת..." : "כניסה"}
            </button>
          </form>

          <p className="text-center text-[0.65rem] mt-6" style={{ color: "#3A2020" }}>
            שכחת סיסמה?{" "}
            <Link href="/forgot-password" className="font-semibold hover:underline" style={{ color: "#C4857A" }}>
              לחצי כאן לאיפוס
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
