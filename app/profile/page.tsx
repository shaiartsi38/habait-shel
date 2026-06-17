"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, Check, AlertCircle, Loader2, User, KeyRound } from "lucide-react";
import { dbGetMyProfile, dbUpdateProfile, dbUploadAvatar, type UserProfile } from "@/lib/supabase/profile-db";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const [profile, setProfile]       = useState<UserProfile | null>(null);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    years_experience: "" as string | number,
    bio: "",
    photo_url: "",
  });

  useEffect(() => {
    dbGetMyProfile()
      .then((p) => {
        if (p) {
          setProfile(p);
          setForm({
            first_name: p.first_name ?? "",
            last_name: p.last_name ?? "",
            years_experience: p.years_experience ?? "",
            bio: p.bio ?? "",
            photo_url: p.photo_url ?? "",
          });
        }
      })
      .catch(() => setError("שגיאה בטעינת הפרופיל"))
      .finally(() => setLoading(false));
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) { setError("הקובץ גדול מדי — מקסימום 5MB"); return; }
    e.target.value = "";
    setUploadingPhoto(true);
    setError(null);
    try {
      const url = await dbUploadAvatar(file);
      setForm((f) => ({ ...f, photo_url: url }));
      await dbUpdateProfile({ photo_url: url });
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => setForm((f) => ({ ...f, photo_url: ev.target?.result as string }));
      reader.readAsDataURL(file);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await dbUpdateProfile({
        first_name: form.first_name || undefined,
        last_name: form.last_name || undefined,
        years_experience: form.years_experience ? Number(form.years_experience) : undefined,
        bio: form.bio || undefined,
        photo_url: form.photo_url || undefined,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  const [pwForm, setPwForm] = useState({ newPassword: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const handlePasswordChange = async () => {
    if (pwForm.newPassword.length < 8) { setPwError("הסיסמה חייבת להכיל לפחות 8 תווים"); return; }
    if (pwForm.newPassword !== pwForm.confirm) { setPwError("הסיסמאות אינן תואמות"); return; }
    setPwSaving(true); setPwError(null);
    try {
      const { error } = await createClient().auth.updateUser({ password: pwForm.newPassword });
      if (error) throw error;
      setPwSuccess(true);
      setPwForm({ newPassword: "", confirm: "" });
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (e) {
      setPwError(e instanceof Error ? e.message : "שגיאה בשינוי הסיסמה");
    } finally {
      setPwSaving(false);
    }
  };

  const displayName = [form.first_name, form.last_name].filter(Boolean).join(" ") || profile?.email || "משתמשת";
  const initials = [form.first_name?.[0], form.last_name?.[0]].filter(Boolean).join("").toUpperCase() || "?";

  if (loading) {
    return (
      <div className="min-h-screen sidebar-safe flex items-center justify-center" style={{ background: "var(--black)" }}>
        <Loader2 size={22} className="animate-spin" style={{ color: "#C4857A" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen sidebar-safe px-4 md:px-12 py-12" style={{ background: "var(--black)" }}>
      <motion.div
        className="max-w-lg"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <p className="text-[0.58rem] tracking-[0.3em] uppercase mb-2" style={{ color: "#C4857A" }}>הפרופיל שלי</p>
        <h1 className="text-2xl font-black mb-8" style={{ color: "#FFF8F5" }}>פרטים אישיים</h1>

        {/* Feedback */}
        {(success || error) && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-[0.75rem] mb-6"
            style={success
              ? { background: "rgba(74,155,111,0.08)", color: "#4A9B6F", border: "1px solid rgba(74,155,111,0.2)" }
              : { background: "rgba(196,50,50,0.08)", color: "#e05555", border: "1px solid rgba(196,50,50,0.2)" }
            }
          >
            {success ? <Check size={14} /> : <AlertCircle size={14} />}
            {success ? "הפרופיל עודכן בהצלחה!" : error}
          </div>
        )}

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-8">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center shrink-0"
              style={{ background: "#140e12", border: "2px solid rgba(196,133,122,0.25)" }}
            >
              {uploadingPhoto ? (
                <Loader2 size={20} className="animate-spin" style={{ color: "#C4857A" }} />
              ) : form.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.photo_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-black" style={{ color: "#C4857A" }}>{initials}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute -bottom-1 -left-1 w-7 h-7 rounded-full flex items-center justify-center transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg,#C4857A,#D4998E)", boxShadow: "0 2px 8px rgba(196,133,122,0.4)" }}
            >
              <Camera size={12} style={{ color: "#080608" }} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>
          <div>
            <p className="text-sm font-black" style={{ color: "#FFF8F5" }}>{displayName}</p>
            <p className="text-[0.62rem] mt-0.5" style={{ color: "#5A3830" }}>{profile?.email}</p>
            <p
              className="text-[0.55rem] mt-1 cursor-pointer hover:opacity-70 transition-opacity"
              style={{ color: "rgba(196,133,122,0.55)" }}
              onClick={() => fileRef.current?.click()}
            >
              החלפי תמונה
            </p>
          </div>
        </div>

        {/* Form */}
        <div
          className="rounded-2xl p-6 space-y-5"
          style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.08)" }}
        >
          {/* Name row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.6rem] font-semibold mb-1.5 tracking-wider uppercase" style={{ color: "#8B6355" }}>
                שם פרטי
              </label>
              <input
                value={form.first_name}
                onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                placeholder="שרה"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all"
                style={{ background: "#0f0b0e", border: "1px solid rgba(196,133,122,0.12)", color: "#FFF8F5", caretColor: "#C4857A" }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(196,133,122,0.4)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(196,133,122,0.12)")}
              />
            </div>
            <div>
              <label className="block text-[0.6rem] font-semibold mb-1.5 tracking-wider uppercase" style={{ color: "#8B6355" }}>
                שם משפחה
              </label>
              <input
                value={form.last_name}
                onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                placeholder="לוי"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all"
                style={{ background: "#0f0b0e", border: "1px solid rgba(196,133,122,0.12)", color: "#FFF8F5", caretColor: "#C4857A" }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(196,133,122,0.4)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(196,133,122,0.12)")}
              />
            </div>
          </div>

          {/* Years experience */}
          <div>
            <label className="block text-[0.6rem] font-semibold mb-1.5 tracking-wider uppercase" style={{ color: "#8B6355" }}>
              כמה שנים את מאפרת?
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={50}
                value={form.years_experience}
                onChange={(e) => setForm((f) => ({ ...f, years_experience: e.target.value }))}
                placeholder="0"
                dir="ltr"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all"
                style={{ background: "#0f0b0e", border: "1px solid rgba(196,133,122,0.12)", color: "#FFF8F5", caretColor: "#C4857A" }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(196,133,122,0.4)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(196,133,122,0.12)")}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[0.65rem] pointer-events-none" style={{ color: "#5A3830" }}>
                שנים
              </span>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[0.6rem] font-semibold mb-1.5 tracking-wider uppercase" style={{ color: "#8B6355" }}>
              ספרי קצת על עצמך (אופציונלי)
            </label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="מאפרת עצמאית מתל אביב, מתמחה בכלות..."
              className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none transition-all"
              style={{ background: "#0f0b0e", border: "1px solid rgba(196,133,122,0.12)", color: "#FFF8F5", caretColor: "#C4857A" }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(196,133,122,0.4)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(196,133,122,0.12)")}
            />
          </div>
        </div>

        {/* Public note */}
        <div className="flex items-start gap-2 mt-4 mb-6">
          <User size={12} className="mt-0.5 shrink-0" style={{ color: "rgba(196,133,122,0.4)" }} />
          <p className="text-[0.6rem] leading-relaxed" style={{ color: "#3A2020" }}>
            השם ותמונת הפרופיל יוצגו לחברות האחרות בקהילה.
          </p>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-40"
          style={{
            background: "linear-gradient(135deg,#C4857A,#D4998E)",
            color: "#080608",
            boxShadow: "0 4px 18px rgba(196,133,122,0.3)",
          }}
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          שמרי שינויים
        </button>

        {/* Password change */}
        <div
          className="rounded-2xl p-6 space-y-4 mt-8"
          style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.08)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <KeyRound size={14} style={{ color: "#C4857A" }} />
            <p className="text-sm font-black" style={{ color: "#FFF8F5" }}>שינוי סיסמה</p>
          </div>

          {(pwSuccess || pwError) && (
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-[0.75rem]"
              style={pwSuccess
                ? { background: "rgba(74,155,111,0.08)", color: "#4A9B6F", border: "1px solid rgba(74,155,111,0.2)" }
                : { background: "rgba(196,50,50,0.08)", color: "#e05555", border: "1px solid rgba(196,50,50,0.2)" }
              }
            >
              {pwSuccess ? <Check size={14} /> : <AlertCircle size={14} />}
              {pwSuccess ? "הסיסמה שונתה בהצלחה!" : pwError}
            </div>
          )}

          <div>
            <label className="block text-[0.6rem] font-semibold mb-1.5 tracking-wider uppercase" style={{ color: "#8B6355" }}>
              סיסמה חדשה
            </label>
            <input
              type="password"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
              placeholder="לפחות 8 תווים"
              dir="ltr"
              className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all"
              style={{ background: "#0f0b0e", border: "1px solid rgba(196,133,122,0.12)", color: "#FFF8F5", caretColor: "#C4857A" }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(196,133,122,0.4)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(196,133,122,0.12)")}
            />
          </div>
          <div>
            <label className="block text-[0.6rem] font-semibold mb-1.5 tracking-wider uppercase" style={{ color: "#8B6355" }}>
              אימות סיסמה
            </label>
            <input
              type="password"
              value={pwForm.confirm}
              onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
              placeholder="הכניסי שוב את הסיסמה"
              dir="ltr"
              className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all"
              style={{ background: "#0f0b0e", border: "1px solid rgba(196,133,122,0.12)", color: "#FFF8F5", caretColor: "#C4857A" }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(196,133,122,0.4)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(196,133,122,0.12)")}
            />
          </div>
          <button
            onClick={handlePasswordChange}
            disabled={pwSaving || !pwForm.newPassword}
            className="w-full py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: "rgba(196,133,122,0.1)", color: "#C4857A", border: "1px solid rgba(196,133,122,0.2)" }}
          >
            {pwSaving && <Loader2 size={14} className="animate-spin" />}
            שנה סיסמה
          </button>
        </div>
      </motion.div>
    </div>
  );
}
