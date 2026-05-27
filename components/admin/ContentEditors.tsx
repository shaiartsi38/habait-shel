"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, Check, X, AlertCircle, Upload } from "lucide-react";
import {
  type HeroContent, type Testimonial, type ExtraSection, type SubPlan, type NatalieContent,
  DEFAULT_HERO, DEFAULT_TESTIMONIALS, DEFAULT_EXTRA_SECTIONS, DEFAULT_PLANS, DEFAULT_NATALIE,
  dbGetHero, dbGetTestimonials, dbGetExtraSections, dbGetPlans, dbGetNatalie,
  dbSetHero, dbSetTestimonials, dbSetExtraSections, dbSetPlans, dbSetNatalie,
} from "@/lib/supabase/content-db";
import { dbUploadImage } from "@/lib/supabase/courses-db";

// ─── Shared UI ────────────────────────────────────────────────────

function FieldLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={`block text-[0.6rem] font-semibold mb-1.5 tracking-wider uppercase ${className}`} style={{ color: "#8B6355" }}>
      {children}
    </label>
  );
}

function Input({ value, onChange, placeholder, dir = "rtl", type = "text" }: {
  value: string | number; onChange: (v: string) => void; placeholder?: string; dir?: string; type?: string;
}) {
  return (
    <input
      type={type}
      dir={dir}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all"
      style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.12)", color: "#FFF8F5", caretColor: "#C4857A" }}
      onFocus={(e) => (e.target.style.borderColor = "rgba(196,133,122,0.4)")}
      onBlur={(e)  => (e.target.style.borderColor = "rgba(196,133,122,0.12)")}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none transition-all"
      style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.12)", color: "#FFF8F5", caretColor: "#C4857A" }}
      onFocus={(e) => (e.target.style.borderColor = "rgba(196,133,122,0.4)")}
      onBlur={(e)  => (e.target.style.borderColor = "rgba(196,133,122,0.12)")}
    />
  );
}

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-1.5 cursor-pointer select-none" onClick={() => onChange(!checked)}>
      <div
        className="flex items-center justify-center rounded-[5px] transition-all w-4 h-4"
        style={{ background: checked ? "linear-gradient(135deg,#C4857A,#D4998E)" : "#140e12", border: checked ? "none" : "1px solid rgba(196,133,122,0.25)" }}
      >
        {checked && <Check size={10} style={{ color: "#080608" }} strokeWidth={3} />}
      </div>
      <span className="text-xs font-medium" style={{ color: checked ? "#C4857A" : "#8B6355" }}>{label}</span>
    </label>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <h3 className="text-[0.8rem] font-black tracking-wide" style={{ color: "#C4857A" }}>{title}</h3>
      <div className="flex-1 h-px" style={{ background: "rgba(196,133,122,0.08)" }} />
    </div>
  );
}

function SaveBar({ onSave, saving }: { onSave: () => void; saving: boolean }) {
  return (
    <div className="mt-8 flex justify-end">
      <button
        onClick={onSave}
        disabled={saving}
        className="px-6 py-2.5 rounded-xl text-[0.8rem] font-bold transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 flex items-center gap-2"
        style={{ background: "linear-gradient(135deg,#C4857A,#D4998E)", color: "#080608", boxShadow: "0 4px 14px rgba(196,133,122,0.3)" }}
      >
        {saving && <Loader2 size={12} className="animate-spin" />}
        שמור שינויים
      </button>
    </div>
  );
}

function Feedback({ success, error, onClose }: { success: boolean; error: string | null; onClose: () => void }) {
  if (!success && !error) return null;
  return (
    <div
      className="flex items-center gap-2 px-4 py-3 rounded-xl text-[0.72rem] mb-4"
      style={success
        ? { background: "rgba(74,155,111,0.08)", color: "#4A9B6F", border: "1px solid rgba(74,155,111,0.2)" }
        : { background: "rgba(196,50,50,0.08)", color: "#e05555", border: "1px solid rgba(196,50,50,0.2)" }
      }
    >
      {success ? <Check size={13} /> : <AlertCircle size={13} />}
      <span>{success ? "נשמר בהצלחה!" : error}</span>
      <button onClick={onClose} className="mr-auto p-0.5 hover:opacity-70"><X size={12} /></button>
    </div>
  );
}

function TabBar({ tabs, active, onChange }: { tabs: { id: string; label: string }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "rgba(196,133,122,0.05)", border: "1px solid rgba(196,133,122,0.1)" }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className="flex-1 py-2 rounded-lg text-[0.75rem] font-semibold transition-all"
          style={active === tab.id
            ? { background: "linear-gradient(135deg,#C4857A,#D4998E)", color: "#080608" }
            : { color: "#5A3830" }
          }
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center py-32 gap-3" style={{ color: "#5A3830" }}>
      <Loader2 size={18} className="animate-spin" style={{ color: "#C4857A" }} />
      <span className="text-sm">טוען...</span>
    </div>
  );
}

// ─── Homepage Editor ──────────────────────────────────────────────

export function HomepageEditor() {
  const [tab, setTab]                     = useState<"hero" | "testimonials" | "extra">("hero");
  const [hero, setHero]                   = useState<HeroContent>(DEFAULT_HERO);
  const [testimonials, setTestimonials]   = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
  const [extraSections, setExtraSections] = useState<ExtraSection[]>(DEFAULT_EXTRA_SECTIONS);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [success, setSuccess]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  useEffect(() => {
    Promise.all([dbGetHero(), dbGetTestimonials(), dbGetExtraSections()])
      .then(([h, t, e]) => { setHero(h); setTestimonials(t); setExtraSections(e); })
      .finally(() => setLoading(false));
  }, []);

  const clearFeedback = () => { setSuccess(false); setError(null); };

  const handleSave = async () => {
    setSaving(true); clearFeedback();
    try {
      if (tab === "hero")         await dbSetHero(hero);
      else if (tab === "testimonials") await dbSetTestimonials(testimonials);
      else                        await dbSetExtraSections(extraSections);
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingScreen />;

  const updateTestimonial = (i: number, key: keyof Testimonial, val: string) =>
    setTestimonials(testimonials.map((t, j) => j === i ? { ...t, [key]: val } : t));

  const updateExtra = (i: number, key: keyof ExtraSection, val: string | boolean) =>
    setExtraSections(extraSections.map((s, j) => j === i ? { ...s, [key]: val } : s));

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-black" style={{ color: "#FFF8F5" }}>דף הבית</h2>
        <p className="text-xs mt-0.5" style={{ color: "#5A3830" }}>עריכת תוכן דף הבית</p>
      </div>

      <Feedback success={success} error={error} onClose={clearFeedback} />

      <TabBar
        tabs={[{ id: "hero", label: "הירו" }, { id: "testimonials", label: "המלצות" }, { id: "extra", label: "סקשיינים נוספים" }]}
        active={tab}
        onChange={(id) => { setTab(id as typeof tab); clearFeedback(); }}
      />

      {/* ── Hero tab ── */}
      {tab === "hero" && (
        <div className="space-y-5">
          <div>
            <FieldLabel>כותרת שורה 1</FieldLabel>
            <Input value={hero.title1} onChange={(v) => setHero({ ...hero, title1: v })} placeholder="הבית של" />
          </div>
          <div>
            <FieldLabel>כותרת שורה 2 (גרדיאנט)</FieldLabel>
            <Input value={hero.title2} onChange={(v) => setHero({ ...hero, title2: v })} placeholder="המאפרים" />
          </div>
          <div>
            <FieldLabel>תת-כותרת</FieldLabel>
            <Textarea value={hero.subtitle} onChange={(v) => setHero({ ...hero, subtitle: v })} rows={3} />
          </div>
          <div>
            <FieldLabel>טקסט כפתור CTA</FieldLabel>
            <Input value={hero.ctaText} onChange={(v) => setHero({ ...hero, ctaText: v })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>סטטיסטיקת תלמידות</FieldLabel>
              <Input value={hero.statsStudents} onChange={(v) => setHero({ ...hero, statsStudents: v })} placeholder="847 תלמידות" />
            </div>
            <div>
              <FieldLabel>סטטיסטיקת קורסים</FieldLabel>
              <Input value={hero.statsCourses} onChange={(v) => setHero({ ...hero, statsCourses: v })} placeholder="24+ קורסים" />
            </div>
          </div>
          <div>
            <FieldLabel>URL תמונת רקע</FieldLabel>
            <Input value={hero.heroBg} onChange={(v) => setHero({ ...hero, heroBg: v })} dir="ltr" placeholder="https://..." />
          </div>
        </div>
      )}

      {/* ── Testimonials tab ── */}
      {tab === "testimonials" && (
        <div className="space-y-4">
          {testimonials.map((t, i) => (
            <div key={i} className="rounded-xl p-4 space-y-3" style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.08)" }}>
              <div className="flex items-center justify-between">
                <span className="text-[0.7rem] font-bold" style={{ color: "#C4857A" }}>המלצה {i + 1}</span>
                <button onClick={() => setTestimonials(testimonials.filter((_, j) => j !== i))} className="p-1 rounded-lg hover:bg-white/5">
                  <Trash2 size={12} style={{ color: "#5A3830" }} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <FieldLabel>שם</FieldLabel>
                  <Input value={t.name} onChange={(v) => updateTestimonial(i, "name", v)} placeholder="שם" />
                </div>
                <div>
                  <FieldLabel>אותיות ראשיות</FieldLabel>
                  <Input value={t.initials} onChange={(v) => updateTestimonial(i, "initials", v)} placeholder="מל" />
                </div>
              </div>
              <div>
                <FieldLabel>תחום</FieldLabel>
                <Input value={t.field} onChange={(v) => updateTestimonial(i, "field", v)} placeholder="מאפרת כלות" />
              </div>
              <div>
                <FieldLabel>טקסט המלצה</FieldLabel>
                <Textarea value={t.text} onChange={(v) => updateTestimonial(i, "text", v)} rows={3} />
              </div>
            </div>
          ))}
          <button
            onClick={() => setTestimonials([...testimonials, { name: "", field: "", text: "", initials: "", color: "#C4857A" }])}
            className="w-full py-2.5 rounded-xl text-[0.75rem] font-semibold flex items-center justify-center gap-2 hover:opacity-70 transition-opacity"
            style={{ border: "1px dashed rgba(196,133,122,0.25)", color: "#C4857A", background: "rgba(196,133,122,0.05)" }}
          >
            <Plus size={13} /> הוסף המלצה
          </button>
        </div>
      )}

      {/* ── Extra sections tab ── */}
      {tab === "extra" && (
        <div className="space-y-4">
          <p className="text-[0.7rem] mb-2" style={{ color: "#5A3830" }}>
            סקשיינים אלה יופיעו בדף הבית בין "נטלי" לבין "מנויים".
          </p>
          {extraSections.length === 0 && (
            <p className="text-[0.7rem] text-center py-8" style={{ color: "#3A1818" }}>אין סקשיינים עדיין — לחץ להוספה</p>
          )}
          {extraSections.map((sec, i) => (
            <div key={sec.id} className="rounded-xl p-4 space-y-3" style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.08)" }}>
              <div className="flex items-center justify-between">
                <span className="text-[0.7rem] font-bold" style={{ color: "#C4857A" }}>סקשיין {i + 1}</span>
                <div className="flex items-center gap-3">
                  <Checkbox checked={sec.visible} onChange={(v) => updateExtra(i, "visible", v)} label="מוצג" />
                  <button onClick={() => setExtraSections(extraSections.filter((_, j) => j !== i))} className="p-1 rounded-lg hover:bg-white/5">
                    <Trash2 size={12} style={{ color: "#5A3830" }} />
                  </button>
                </div>
              </div>
              <div>
                <FieldLabel>כותרת</FieldLabel>
                <Input value={sec.title} onChange={(v) => updateExtra(i, "title", v)} />
              </div>
              <div>
                <FieldLabel>תת-כותרת</FieldLabel>
                <Input value={sec.subtitle} onChange={(v) => updateExtra(i, "subtitle", v)} />
              </div>
              <div>
                <FieldLabel>תוכן (פסקה)</FieldLabel>
                <Textarea value={sec.body} onChange={(v) => updateExtra(i, "body", v)} rows={3} />
              </div>
              <div>
                <FieldLabel>URL תמונה (אופציונלי)</FieldLabel>
                <Input value={sec.imageUrl} onChange={(v) => updateExtra(i, "imageUrl", v)} dir="ltr" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <FieldLabel>טקסט כפתור (אופציונלי)</FieldLabel>
                  <Input value={sec.ctaText} onChange={(v) => updateExtra(i, "ctaText", v)} placeholder="לחץ כאן" />
                </div>
                <div>
                  <FieldLabel>קישור כפתור</FieldLabel>
                  <Input value={sec.ctaHref} onChange={(v) => updateExtra(i, "ctaHref", v)} dir="ltr" placeholder="/courses" />
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={() => setExtraSections([
              ...extraSections,
              { id: Math.random().toString(36).slice(2), title: "", subtitle: "", body: "", imageUrl: "", ctaText: "", ctaHref: "", visible: true },
            ])}
            className="w-full py-2.5 rounded-xl text-[0.75rem] font-semibold flex items-center justify-center gap-2 hover:opacity-70 transition-opacity"
            style={{ border: "1px dashed rgba(196,133,122,0.25)", color: "#C4857A", background: "rgba(196,133,122,0.05)" }}
          >
            <Plus size={13} /> הוסף סקשיין
          </button>
        </div>
      )}

      <SaveBar onSave={handleSave} saving={saving} />
    </div>
  );
}

// ─── Subscription Editor ──────────────────────────────────────────

export function SubscriptionEditor() {
  const [plans, setPlans]   = useState<SubPlan[]>(DEFAULT_PLANS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    dbGetPlans().then(setPlans).finally(() => setLoading(false));
  }, []);

  const clearFeedback = () => { setSuccess(false); setError(null); };

  const updatePlan = <K extends keyof SubPlan>(i: number, key: K, val: SubPlan[K]) =>
    setPlans(plans.map((p, j) => j === i ? { ...p, [key]: val } : p));

  const updateFeature = (planIdx: number, featIdx: number, val: string) =>
    setPlans(plans.map((p, j) => j === planIdx
      ? { ...p, features: p.features.map((f, k) => k === featIdx ? val : f) }
      : p
    ));

  const addFeature = (planIdx: number) =>
    setPlans(plans.map((p, j) => j === planIdx ? { ...p, features: [...p.features, ""] } : p));

  const removeFeature = (planIdx: number, featIdx: number) =>
    setPlans(plans.map((p, j) => j === planIdx
      ? { ...p, features: p.features.filter((_, k) => k !== featIdx) }
      : p
    ));

  const handleSave = async () => {
    setSaving(true); clearFeedback();
    try { await dbSetPlans(plans); setSuccess(true); }
    catch (e) { setError(e instanceof Error ? e.message : "שגיאה בשמירה"); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-black" style={{ color: "#FFF8F5" }}>מנויים</h2>
        <p className="text-xs mt-0.5" style={{ color: "#5A3830" }}>עריכת תוכניות המנויים</p>
      </div>

      <Feedback success={success} error={error} onClose={clearFeedback} />

      <div className="space-y-6">
        {plans.map((plan, i) => (
          <div
            key={plan.id}
            className="rounded-xl p-5 space-y-4"
            style={{ background: "#140e12", border: plan.featured ? "1px solid rgba(196,133,122,0.3)" : "1px solid rgba(196,133,122,0.08)" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-black" style={{ color: "#FFF8F5" }}>{plan.name || `תוכנית ${i + 1}`}</span>
              <Checkbox checked={plan.featured} onChange={(v) => updatePlan(i, "featured", v)} label="הכי פופולרי" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>שם (אנגלית)</FieldLabel>
                <Input value={plan.name} onChange={(v) => updatePlan(i, "name", v)} placeholder="Pro" dir="ltr" />
              </div>
              <div>
                <FieldLabel>שם (עברית)</FieldLabel>
                <Input value={plan.nameHe} onChange={(v) => updatePlan(i, "nameHe", v)} placeholder="מקצועי" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>מחיר (₪)</FieldLabel>
                <Input value={plan.price} onChange={(v) => updatePlan(i, "price", Number(v) || 0)} type="number" dir="ltr" />
              </div>
              <div>
                <FieldLabel>טקסט כפתור</FieldLabel>
                <Input value={plan.cta} onChange={(v) => updatePlan(i, "cta", v)} placeholder="הצטרף" />
              </div>
            </div>

            <div>
              <FieldLabel>תיאור קצר</FieldLabel>
              <Input value={plan.desc} onChange={(v) => updatePlan(i, "desc", v)} placeholder="תיאור קצר של התוכנית" />
            </div>

            <div>
              <FieldLabel>יתרונות</FieldLabel>
              <div className="space-y-2">
                {plan.features.map((f, fi) => (
                  <div key={fi} className="flex gap-2 items-center">
                    <Input value={f} onChange={(v) => updateFeature(i, fi, v)} placeholder="יתרון" />
                    <button onClick={() => removeFeature(i, fi)} className="p-1.5 rounded-lg hover:bg-white/5 shrink-0">
                      <X size={12} style={{ color: "#5A3830" }} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addFeature(i)}
                  className="text-[0.7rem] font-semibold flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                  style={{ color: "#C4857A" }}
                >
                  <Plus size={12} /> הוסף יתרון
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <SaveBar onSave={handleSave} saving={saving} />
    </div>
  );
}

// ─── Natalie Editor ───────────────────────────────────────────────

export function NatalieEditor() {
  const [content, setContent]     = useState<NatalieContent>(DEFAULT_NATALIE);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    dbGetNatalie().then(setContent).finally(() => setLoading(false));
  }, []);

  const clearFeedback = () => { setSuccess(false); setError(null); };

  const set = <K extends keyof NatalieContent>(key: K, val: NatalieContent[K]) =>
    setContent((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setSaving(true); clearFeedback();
    try { await dbSetNatalie(content); setSuccess(true); }
    catch (e) { setError(e instanceof Error ? e.message : "שגיאה בשמירה"); }
    finally { setSaving(false); }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    try {
      const url = await dbUploadImage(file);
      set("photo", url);
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => set("photo", ev.target?.result as string);
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-black" style={{ color: "#FFF8F5" }}>נטלי ארצי</h2>
        <p className="text-xs mt-0.5" style={{ color: "#5A3830" }}>עריכת דף נטלי</p>
      </div>

      <Feedback success={success} error={error} onClose={clearFeedback} />

      <div className="space-y-6">

        {/* Photo */}
        <div>
          <SectionHeader title="תמונת פרופיל" />
          <div className="flex items-start gap-4">
            <div
              className="w-20 h-20 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
              style={{ background: "#0f0b0e", border: "1px solid rgba(196,133,122,0.12)" }}
            >
              {uploading
                ? <Loader2 size={20} className="animate-spin" style={{ color: "#C4857A" }} />
                // eslint-disable-next-line @next/next/no-img-element
                : content.photo ? <img src={content.photo} alt="נטלי" className="w-full h-full object-cover" />
                : <Upload size={18} style={{ color: "#C4857A" }} />
              }
            </div>
            <div className="flex-1 space-y-2">
              <FieldLabel>URL תמונה</FieldLabel>
              <Input value={content.photo} onChange={(v) => set("photo", v)} dir="ltr" placeholder="https://..." />
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.68rem] font-semibold cursor-pointer hover:opacity-80 transition-opacity" style={{ background: "rgba(196,133,122,0.12)", color: "#C4857A", border: "1px solid rgba(196,133,122,0.2)" }}>
                <Upload size={11} /> העלה מהמחשב
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
          </div>
        </div>

        {/* Social */}
        <div>
          <SectionHeader title="רשתות חברתיות" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Instagram URL</FieldLabel>
              <Input value={content.instagram} onChange={(v) => set("instagram", v)} dir="ltr" placeholder="https://instagram.com/..." />
            </div>
            <div>
              <FieldLabel>YouTube URL</FieldLabel>
              <Input value={content.youtube} onChange={(v) => set("youtube", v)} dir="ltr" placeholder="https://youtube.com/@..." />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <SectionHeader title="ביוגרפיה" />
          <div className="space-y-3">
            {content.bio.map((para, i) => (
              <div key={i} className="flex gap-2">
                <div className="flex-1">
                  <FieldLabel>פסקה {i + 1}</FieldLabel>
                  <Textarea
                    value={para}
                    onChange={(v) => set("bio", content.bio.map((b, j) => j === i ? v : b))}
                    rows={3}
                  />
                </div>
                <button
                  onClick={() => set("bio", content.bio.filter((_, j) => j !== i))}
                  className="mt-6 p-1.5 rounded-lg hover:bg-white/5 h-fit"
                  disabled={content.bio.length <= 1}
                >
                  <X size={12} style={{ color: "#5A3830" }} />
                </button>
              </div>
            ))}
            <button
              onClick={() => set("bio", [...content.bio, ""])}
              className="text-[0.7rem] font-semibold flex items-center gap-1.5 hover:opacity-70 transition-opacity"
              style={{ color: "#C4857A" }}
            >
              <Plus size={12} /> הוסף פסקה
            </button>
          </div>
        </div>

        {/* Achievements */}
        <div>
          <SectionHeader title="הישגים" />
          <div className="space-y-3">
            {content.achievements.map((ach, i) => (
              <div key={i} className="flex gap-2 items-end">
                <div className="w-24 shrink-0">
                  <FieldLabel>ערך</FieldLabel>
                  <Input value={ach.value} onChange={(v) => set("achievements", content.achievements.map((a, j) => j === i ? { ...a, value: v } : a))} placeholder="10+" />
                </div>
                <div className="flex-1">
                  <FieldLabel>תיאור</FieldLabel>
                  <Input value={ach.label} onChange={(v) => set("achievements", content.achievements.map((a, j) => j === i ? { ...a, label: v } : a))} placeholder="שנות ניסיון" />
                </div>
                <button
                  onClick={() => set("achievements", content.achievements.filter((_, j) => j !== i))}
                  className="p-1.5 rounded-lg hover:bg-white/5 mb-0.5"
                >
                  <X size={12} style={{ color: "#5A3830" }} />
                </button>
              </div>
            ))}
            <button
              onClick={() => set("achievements", [...content.achievements, { value: "", label: "" }])}
              className="text-[0.7rem] font-semibold flex items-center gap-1.5 hover:opacity-70 transition-opacity"
              style={{ color: "#C4857A" }}
            >
              <Plus size={12} /> הוסף הישג
            </button>
          </div>
        </div>

        {/* Milestones */}
        <div>
          <SectionHeader title="ציר הזמן" />
          <div className="space-y-3">
            {content.milestones.map((m, i) => (
              <div key={i} className="flex gap-2 items-end">
                <div className="w-20 shrink-0">
                  <FieldLabel>שנה</FieldLabel>
                  <Input value={m.year} onChange={(v) => set("milestones", content.milestones.map((x, j) => j === i ? { ...x, year: v } : x))} placeholder="2022" dir="ltr" />
                </div>
                <div className="flex-1">
                  <FieldLabel>אירוע</FieldLabel>
                  <Input value={m.text} onChange={(v) => set("milestones", content.milestones.map((x, j) => j === i ? { ...x, text: v } : x))} />
                </div>
                <button
                  onClick={() => set("milestones", content.milestones.filter((_, j) => j !== i))}
                  className="p-1.5 rounded-lg hover:bg-white/5 mb-0.5"
                >
                  <X size={12} style={{ color: "#5A3830" }} />
                </button>
              </div>
            ))}
            <button
              onClick={() => set("milestones", [...content.milestones, { year: "", text: "" }])}
              className="text-[0.7rem] font-semibold flex items-center gap-1.5 hover:opacity-70 transition-opacity"
              style={{ color: "#C4857A" }}
            >
              <Plus size={12} /> הוסף אירוע
            </button>
          </div>
        </div>

      </div>

      <SaveBar onSave={handleSave} saving={saving} />
    </div>
  );
}
