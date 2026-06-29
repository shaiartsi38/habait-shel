"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Plus, Edit2, Eye, EyeOff, Trash2, X,
  GripVertical, Upload, Check, ChevronDown, ChevronUp, Save,
  Users, BarChart3, Settings, Video, Loader2,
  RefreshCw, AlertCircle, LogOut, Home, Globe, CreditCard, Sparkles, Download, BookOpen, Tag,
} from "lucide-react";
import { HomepageEditor, SubscriptionEditor, NatalieEditor } from "@/components/admin/ContentEditors";
import { dbGetOgImage, dbSetOgImage, dbGetCourseCategories, dbSetCourseCategories } from "@/lib/supabase/content-db";
import { CATEGORIES, type CourseData, type CourseLesson, type CourseHighlight } from "@/lib/courses-data";
import { useCourses } from "@/lib/courses-context";
import {
  dbFetchCourses,
  dbUpsertCourse,
  dbDeleteCourse,
  dbUploadImage,
  dbUploadVideo,
  dbSeedDefaultCourses,
  dbUpdateCourseOrder,
} from "@/lib/supabase/courses-db";
import type { VideoProvider } from "@/lib/courses-data";

// ─── Types ────────────────────────────────────────────────────────

type AdminSection = "courses" | "homepage" | "subscription" | "natalie" | "users" | "analytics" | "settings";

// ─── Helpers ─────────────────────────────────────────────────────

const TIER_LABELS: Record<string, string> = { basic: "Basic", pro: "Pro", elite: "Elite" };

const STATUS_CONFIG = {
  published: { label: "פורסם",  color: "#4A9B6F", bg: "rgba(74,155,111,0.1)",   border: "rgba(74,155,111,0.3)" },
  draft:     { label: "טיוטה",  color: "rgba(255,248,245,0.4)", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)" },
  soon:      { label: "בקרוב",  color: "#C4857A", bg: "rgba(196,133,122,0.1)", border: "rgba(196,133,122,0.3)" },
};

function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (e && typeof e === "object" && "message" in e) return String((e as { message: unknown }).message);
  return "שגיאה לא ידועה";
}

function parseVideoUrl(raw: string): { videoId: string; provider: VideoProvider } {
  const s = raw.trim();
  if (!s) return { videoId: "", provider: "youtube" };

  // YouTube patterns
  const ytMatch =
    s.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/) ??
    s.match(/^([A-Za-z0-9_-]{11})$/);
  if (ytMatch) return { videoId: ytMatch[1], provider: "youtube" };

  // Vimeo patterns
  const vmMatch = s.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/);
  if (vmMatch) return { videoId: vmMatch[1], provider: "vimeo" };

  // Direct URL (http/https)
  if (s.startsWith("http://") || s.startsWith("https://")) return { videoId: s, provider: "direct" };

  return { videoId: s, provider: "youtube" };
}

function getCourseStatus(c: CourseData): "published" | "draft" | "soon" {
  if (c.isPublished) return "published";
  if (c.isNew) return "soon";
  return "draft";
}

function emptyLesson(): CourseLesson {
  return { id: Math.random().toString(36).slice(2), title: "", videoId: "", videoProvider: "youtube", durationMin: 0, isFree: false };
}

function emptyCourse(): CourseData {
  return {
    id: Math.random().toString(36).slice(2),
    slug: "",
    title: "",
    subtitle: "",
    shortDesc: "",
    fullDesc: "",
    image: "",
    videoId: "",
    videoProvider: "youtube",
    duration: "",
    durationMinutes: 0,
    category: "עיניים",
    tier: "basic",
    difficulty: "beginner",
    isPublished: false,
    isNew: false,
    showOnHome: true,
    instructor: { name: "נטלי ארצי", bio: "", photoUrl: "https://i.imghippo.com/files/be7340nfw.webp" },
    lessons: [emptyLesson()],
    tags: [],
  };
}

// ─── Page ─────────────────────────────────────────────────────────

export default function AdminPage() {
  // Admin uses its own local state — does NOT overwrite the global context
  // Global context (public pages) is only updated when admin saves/deletes a course
  const { setCourses: setGlobalCourses } = useCourses();
  const [courses, setAdminCourses] = useState<CourseData[]>([]);
  const router = useRouter();
  const [section, setSection] = useState<AdminSection>("courses");
  const [editing, setEditing] = useState<CourseData | null>(null);
  const [isNewCourse, setIsNewCourse] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [opError, setOpError] = useState<string | null>(null);

  const syncCourses = (list: CourseData[]) => {
    setAdminCourses(list);
    setGlobalCourses(list); // keep public pages in sync
  };

  // Fetch live data from Supabase on mount
  const syncFromDB = useCallback(async () => {
    setFetchLoading(true);
    setOpError(null);
    try {
      const live = await dbFetchCourses();
      setAdminCourses(live); // admin sees exact DB state (even if empty)
      if (live.length > 0) setGlobalCourses(live); // only sync public pages if there's data
    } catch (e) {
      setOpError(errMsg(e) || "שגיאה בטעינת קורסים");
    } finally {
      setFetchLoading(false);
    }
  }, [setGlobalCourses]);

  const handleSeedDefaults = async () => {
    setSeeding(true);
    setOpError(null);
    try {
      const seeded = await dbSeedDefaultCourses();
      syncCourses(seeded);
    } catch (e) {
      setOpError(errMsg(e) || "שגיאה בייבוא קורסים");
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => { syncFromDB(); }, [syncFromDB]);

  const openEdit = (c: CourseData) => {
    setEditing({ ...c, lessons: c.lessons.map((l) => ({ ...l })) });
    setIsNewCourse(false);
  };
  const openAdd = () => { setEditing(emptyCourse()); setIsNewCourse(true); };

  const saveEdit = async (updated: CourseData) => {
    setOpError(null);
    const rawSlug = (updated.slug || updated.title)
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-{2,}/g, "-")
      .replace(/^-+|-+$/g, "");
    const slug = rawSlug || updated.id;
    const duration = updated.duration || `${updated.durationMinutes} דקות`;
    const final = { ...updated, slug, duration };
    // לא תופסים שגיאה כאן — CourseEditForm.handleSave תופסת ומציגה אותה בתוך הדיאלוג
    const saved = await dbUpsertCourse(final);
    const newList = isNewCourse ? [saved, ...courses] : courses.map((c) => (c.id === saved.id ? saved : c));
    syncCourses(newList);
    setEditing(null);
  };

  const deleteCourse = async (id: string) => {
    setOpError(null);
    try {
      await dbDeleteCourse(id);
      syncCourses(courses.filter((c) => c.id !== id));
    } catch (e) {
      setOpError(errMsg(e) || "שגיאה במחיקה");
    }
  };

  const togglePublish = async (id: string) => {
    const course = courses.find((c) => c.id === id);
    if (!course) return;
    const updated = { ...course, isPublished: !course.isPublished };
    try {
      const saved = await dbUpsertCourse(updated);
      syncCourses(courses.map((c) => (c.id === id ? saved : c)));
    } catch (e) {
      setOpError(errMsg(e) || "שגיאה בעדכון");
    }
  };

  const NAV_ITEMS: { id: AdminSection; label: string; icon: React.ElementType }[] = [
    { id: "courses",      label: "קורסים",   icon: Video },
    { id: "homepage",     label: "דף הבית",  icon: Globe },
    { id: "subscription", label: "מנויים",   icon: CreditCard },
    { id: "natalie",      label: "נטלי",     icon: Sparkles },
    { id: "users",        label: "משתמשות",  icon: Users },
    { id: "analytics",    label: "אנליטיקס", icon: BarChart3 },
    { id: "settings",     label: "הגדרות",   icon: Settings },
  ];

  return (
    <div className="min-h-screen sidebar-safe" style={{ background: "var(--black)", color: "var(--white)" }}>
      {/* Admin header */}
      <div
        className="sticky top-0 z-30 px-4 md:px-10 py-4 flex items-center justify-between"
        style={{ background: "rgba(8,6,8,0.88)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(196,133,122,0.08)" }}
      >
        <div>
          <p className="text-[0.55rem] tracking-[0.28em] uppercase mb-0.5" style={{ color: "#C4857A" }}>ניהול</p>
          <h1 className="text-base font-black" style={{ color: "#FFF8F5" }}>הבית של המאפרים</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[0.72rem] font-semibold hover:opacity-80 transition-opacity"
            style={{ color: "#8B6355", border: "1px solid rgba(196,133,122,0.12)" }}
          >
            <Home size={12} /> לאתר
          </Link>
          <Link
            href="/admin/blog"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[0.72rem] font-semibold hover:opacity-80 transition-opacity"
            style={{ color: "#8B6355", border: "1px solid rgba(196,133,122,0.12)" }}
          >
            <BookOpen size={12} /> בלוג
          </Link>
          <button
            onClick={async () => { await createClient().auth.signOut(); router.push("/"); router.refresh(); }}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[0.72rem] font-semibold hover:opacity-80 transition-opacity"
            style={{ color: "#8B6355", border: "1px solid rgba(196,133,122,0.12)" }}
          >
            <LogOut size={12} /> יציאה
          </button>
          <button
            onClick={syncFromDB}
            disabled={fetchLoading}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors disabled:opacity-40"
            title="רענן מהדאטהבייס"
          >
            <RefreshCw size={14} style={{ color: "#8B6355" }} className={fetchLoading ? "animate-spin" : ""} />
          </button>
          {section === "courses" && (
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[0.75rem] font-bold transition-all hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg,#C4857A,#D4998E)", color: "#080608", boxShadow: "0 4px 14px rgba(196,133,122,0.3)" }}
            >
              <Plus size={13} /> קורס חדש
            </button>
          )}
        </div>
      </div>

      {/* Error banner */}
      {opError && (
        <div className="mx-4 md:mx-10 mt-4 flex items-center gap-2 px-4 py-3 rounded-xl text-[0.72rem]" style={{ background: "rgba(196,50,50,0.08)", color: "#e05555", border: "1px solid rgba(196,50,50,0.2)" }}>
          <AlertCircle size={13} />
          <span>{opError}</span>
          <button onClick={() => setOpError(null)} className="mr-auto p-0.5 hover:opacity-70"><X size={12} /></button>
        </div>
      )}

      {/* Mobile tabs — horizontal scroll */}
      <div className="md:hidden flex overflow-x-auto gap-1 px-4 py-3 sticky top-[57px] z-20"
        style={{ background: "rgba(8,6,8,0.95)", borderBottom: "1px solid rgba(196,133,122,0.08)", scrollbarWidth: "none" }}>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSection(id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[0.72rem] font-semibold shrink-0 transition-colors"
            style={{
              color: section === id ? "#FFF8F5" : "#5A3830",
              background: section === id ? "rgba(196,133,122,0.12)" : "transparent",
              border: `1px solid ${section === id ? "rgba(196,133,122,0.25)" : "transparent"}`,
            }}
          >
            <Icon size={13} style={{ color: section === id ? "#C4857A" : "currentColor" }} />
            {label}
          </button>
        ))}
      </div>

      <div className="flex">
        {/* Left nav — desktop only */}
        <aside
          className="hidden md:flex flex-col gap-0.5 w-44 shrink-0 pt-8 px-3 sticky top-16 self-start h-[calc(100vh-4rem)] overflow-y-auto"
          style={{ borderLeft: "1px solid rgba(196,133,122,0.06)" }}
        >
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[0.78rem] font-medium text-right w-full transition-colors"
              style={{ color: section === id ? "#FFF8F5" : "#5A3830", background: section === id ? "rgba(196,133,122,0.1)" : "transparent" }}
            >
              <Icon size={14} style={{ color: section === id ? "#C4857A" : "currentColor" }} />
              {label}
            </button>
          ))}
        </aside>

        {/* Main */}
        <main className="flex-1 px-4 md:px-8 py-8 min-w-0">
          {fetchLoading && courses.length === 0 && section === "courses" ? (
            <div className="flex items-center justify-center py-32 gap-3" style={{ color: "#5A3830" }}>
              <Loader2 size={18} className="animate-spin" style={{ color: "#C4857A" }} />
              <span className="text-sm">טוען קורסים...</span>
            </div>
          ) : section === "courses" ? (
            <CoursesSection courses={courses} onEdit={openEdit} onDelete={deleteCourse} onTogglePublish={togglePublish} onSeedDefaults={handleSeedDefaults} seeding={seeding} />
          ) : section === "homepage" ? (
            <HomepageEditor />
          ) : section === "subscription" ? (
            <SubscriptionEditor />
          ) : section === "natalie" ? (
            <NatalieEditor />
          ) : section === "users" ? (
            <UsersSection />
          ) : section === "analytics" ? (
            <AnalyticsSection />
          ) : section === "settings" ? (
            <SettingsSection />
          ) : (
            <ComingSoon label={NAV_ITEMS.find((n) => n.id === section)?.label ?? ""} />
          )}
        </main>
      </div>

      {/* Edit / Add drawer */}
      <Dialog.Root open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <Dialog.Portal>
          <Dialog.Overlay
            className="fixed inset-0 z-40"
            style={{ background: "rgba(8,6,8,0.8)", backdropFilter: "blur(4px)", animation: "fadeIn 0.18s ease" }}
          />
          {editing && (
            <Dialog.Content
              className="fixed z-50 inset-y-0 left-0 w-full md:w-[640px] overflow-y-auto focus:outline-none"
              style={{ background: "#0f0b0e", borderRight: "1px solid rgba(196,133,122,0.12)", boxShadow: "8px 0 48px rgba(0,0,0,0.6)", animation: "slideUp 0.22s ease" }}
            >
              <CourseEditForm
                course={editing}
                isNew={isNewCourse}
                onSave={saveEdit}
                onClose={() => setEditing(null)}
              />
            </Dialog.Content>
          )}
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

// ─── Course list ──────────────────────────────────────────────────

function CoursesSection({
  courses, onEdit, onDelete, onTogglePublish, onSeedDefaults, seeding,
}: {
  courses: CourseData[];
  onEdit: (c: CourseData) => void;
  onDelete: (id: string) => Promise<void>;
  onTogglePublish: (id: string) => Promise<void>;
  onSeedDefaults?: () => Promise<void>;
  seeding?: boolean;
}) {
  const [delConfirm, setDelConfirm] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [ordered, setOrdered] = useState<CourseData[]>(courses);
  const [orderChanged, setOrderChanged] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const dragIdx = useRef<number | null>(null);

  useEffect(() => { setOrdered(courses); setOrderChanged(false); }, [courses]);

  const handleToggle = async (id: string) => {
    setToggling(id);
    await onTogglePublish(id);
    setToggling(null);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= ordered.length) return;
    const next = [...ordered];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setOrdered(next);
    setOrderChanged(true);
  };

  const handleDragStart = (idx: number) => { dragIdx.current = idx; };
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === idx) return;
    move(dragIdx.current, idx);
    dragIdx.current = idx;
  };
  const handleDragEnd = () => { dragIdx.current = null; };

  const saveOrder = async () => {
    setSavingOrder(true);
    try {
      await dbUpdateCourseOrder(ordered.map((c, i) => ({ id: c.id, sortOrder: i })));
      setOrderChanged(false);
    } finally {
      setSavingOrder(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await onDelete(id);
    setDeleting(null);
    setDelConfirm(null);
  };

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center gap-5">
        <div className="rounded-full p-5" style={{ background: "rgba(196,133,122,0.07)", border: "1px solid rgba(196,133,122,0.12)" }}>
          <Video size={28} style={{ color: "#C4857A", opacity: 0.6 }} />
        </div>
        <div>
          <p className="text-sm font-bold mb-1.5" style={{ color: "rgba(255,248,245,0.35)" }}>אין קורסים בבסיס הנתונים</p>
          <p className="text-[0.65rem]" style={{ color: "#3A2020" }}>ייבאי את הקורסים הבסיסיים או צרי קורס חדש</p>
        </div>
        {onSeedDefaults && (
          <button
            onClick={onSeedDefaults}
            disabled={seeding}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-[0.78rem] font-bold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#C4857A,#D4998E)", color: "#080608", boxShadow: "0 4px 14px rgba(196,133,122,0.3)" }}
          >
            {seeding ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            {seeding ? "מייבאת..." : "ייבאי קורסים בסיסיים"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black" style={{ color: "#FFF8F5" }}>קורסים</h2>
          <p className="text-xs mt-0.5" style={{ color: "#5A3830" }}>
            {courses.length} קורסים · {courses.filter((c) => c.isPublished).length} פורסמו · גרור את ⠿ לסידור
          </p>
        </div>
        {orderChanged && (
          <button
            onClick={saveOrder}
            disabled={savingOrder}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[0.75rem] font-bold shrink-0 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#C4857A,#D4998E)", color: "#080608", boxShadow: "0 3px 12px rgba(196,133,122,0.35)" }}
          >
            {savingOrder ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            {savingOrder ? "שומר..." : "שמור סדר"}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {ordered.map((course, idx) => {
          const st = STATUS_CONFIG[getCourseStatus(course)];
          const isDelConfirm = delConfirm === course.id;

          return (
            <div
              key={course.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className="flex items-center gap-4 rounded-2xl p-4"
              style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.07)", cursor: "grab" }}
            >
              {/* Drag handle + order arrows */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <GripVertical size={16} style={{ color: "rgba(196,133,122,0.35)", cursor: "grab" }} />
                <button onClick={() => move(idx, idx - 1)} disabled={idx === 0} className="p-0.5 rounded hover:opacity-80 disabled:opacity-20">
                  <ChevronUp size={14} style={{ color: "#C4857A" }} />
                </button>
                <span className="text-[0.48rem] font-bold" style={{ color: "#3A2020" }}>{idx + 1}</span>
                <button onClick={() => move(idx, idx + 1)} disabled={idx === ordered.length - 1} className="p-0.5 rounded hover:opacity-80 disabled:opacity-20">
                  <ChevronDown size={14} style={{ color: "#C4857A" }} />
                </button>
              </div>

              {/* Thumbnail */}
              <div className="relative w-24 h-32 md:w-28 md:h-[148px] rounded-xl overflow-hidden shrink-0" style={{ background: "#0f0b0e" }}>
                {course.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" style={{ filter: "brightness(1.05)" }} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  <StatusPill color={st.color} bg={st.bg} border={st.border}>{st.label}</StatusPill>
                  <StatusPill color="rgba(196,133,122,0.7)" bg="rgba(196,133,122,0.08)" border="rgba(196,133,122,0.2)">{TIER_LABELS[course.tier]}</StatusPill>
                  {course.isNew && (
                    <span className="inline-block px-2 py-[2px] rounded-full text-[0.5rem] font-bold uppercase" style={{ background: "linear-gradient(135deg,#C4857A,#D4998E)", color: "#080608" }}>חדש</span>
                  )}
                </div>
                <h3 className="font-bold text-sm truncate mb-0.5" style={{ color: "#FFF8F5" }}>{course.title || "—"}</h3>
                <p className="text-[0.6rem] truncate mb-1" style={{ color: "#5A3830" }}>{course.category} · {course.duration || `${course.durationMinutes} דק׳`}</p>
                <p className="text-[0.65rem] font-semibold" style={{ color: "#8B6355" }}>{course.lessons.length} שיעורים</p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 shrink-0">
                <ActionBtn onClick={() => onEdit(course)} title="עריכה">
                  <Edit2 size={14} style={{ color: "#C4857A" }} />
                </ActionBtn>
                <ActionBtn onClick={() => handleToggle(course.id)} title={course.isPublished ? "הסתר" : "פרסם"} disabled={toggling === course.id}>
                  {toggling === course.id
                    ? <Loader2 size={12} className="animate-spin" style={{ color: "#5A3830" }} />
                    : course.isPublished
                      ? <EyeOff size={14} style={{ color: "#5A3830" }} />
                      : <Eye size={14} style={{ color: "#4A9B6F" }} />
                  }
                </ActionBtn>
                {isDelConfirm ? (
                  <>
                    <ActionBtn
                      onClick={() => handleDelete(course.id)}
                      style={{ background: "rgba(196,50,50,0.15)" }}
                      disabled={deleting === course.id}
                    >
                      {deleting === course.id
                        ? <Loader2 size={12} className="animate-spin" style={{ color: "#e05555" }} />
                        : <Check size={14} style={{ color: "#e05555" }} />
                      }
                    </ActionBtn>
                    <ActionBtn onClick={() => setDelConfirm(null)}>
                      <X size={13} style={{ color: "#5A3830" }} />
                    </ActionBtn>
                  </>
                ) : (
                  <ActionBtn onClick={() => setDelConfirm(course.id)} title="מחק">
                    <Trash2 size={14} style={{ color: "#5A3830" }} />
                  </ActionBtn>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Edit form ────────────────────────────────────────────────────

function CourseEditForm({
  course, isNew, onSave, onClose,
}: {
  course: CourseData;
  isNew: boolean;
  onSave: (c: CourseData) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CourseData>({ ...course, lessons: course.lessons.map((l) => ({ ...l })) });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingHighlightIdx, setUploadingHighlightIdx] = useState<number | null>(null);
  const fileRef  = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const highlightFileRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Vimeo thumbnails for lesson picker ───────────────────────────
  const [vimeoThumbsAdmin, setVimeoThumbsAdmin] = useState<Record<string, string>>({});
  useEffect(() => {
    const vimeoLessons = form.lessons.filter((l) => l.videoProvider === "vimeo" && l.videoId);
    if (!vimeoLessons.length) return;
    vimeoLessons.forEach((l) => {
      if (vimeoThumbsAdmin[l.id]) return;
      fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${l.videoId}`)
        .then((r) => r.json())
        .then((d: { thumbnail_url?: string }) => {
          if (d.thumbnail_url) setVimeoThumbsAdmin((p) => ({ ...p, [l.id]: d.thumbnail_url! }));
        })
        .catch(() => {});
    });
  }, [form.lessons]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Dynamic categories ────────────────────────────────────────────
  const [dbCategories, setDbCategories] = useState<string[]>([...CATEGORIES.filter((c) => c !== "הכל")]);
  const [showCatManager, setShowCatManager] = useState(false);
  const [catDraft, setCatDraft]             = useState<string[]>([]);
  const [newCatName, setNewCatName]         = useState("");
  const [savingCats, setSavingCats]         = useState(false);

  useEffect(() => {
    dbGetCourseCategories().then((cats) => { setDbCategories(cats); setCatDraft(cats); }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openCatManager = () => { setCatDraft([...dbCategories]); setShowCatManager(true); };
  const saveCats = async () => {
    const trimmed = catDraft.map((c) => c.trim()).filter(Boolean);
    setSavingCats(true);
    try { await dbSetCourseCategories(trimmed); setDbCategories(trimmed); setShowCatManager(false); } catch {}
    setSavingCats(false);
  };

  // Auto-calculate total duration from lesson sum
  useEffect(() => {
    const total = form.lessons.reduce((sum, l) => sum + (l.durationMin || 0), 0);
    if (total > 0) setForm((p) => ({ ...p, durationMinutes: total }));
  }, [form.lessons]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof CourseData>(key: K, val: CourseData[K]) =>
    setForm((p) => ({ ...p, [key]: val }));

  const setInstructor = (key: keyof CourseData["instructor"], val: string) =>
    setForm((p) => ({ ...p, instructor: { ...p.instructor, [key]: val } }));

  const setLesson = (idx: number, key: keyof CourseLesson, val: CourseLesson[keyof CourseLesson]) =>
    setForm((p) => { const ls = [...p.lessons]; ls[idx] = { ...ls[idx], [key]: val }; return { ...p, lessons: ls }; });

  const addLesson    = () => setForm((p) => ({ ...p, lessons: [...p.lessons, emptyLesson()] }));
  const removeLesson = (idx: number) => setForm((p) => ({ ...p, lessons: p.lessons.filter((_, i) => i !== idx) }));

  const addHighlight = () => setForm((p) => ({
    ...p,
    highlights: [...(p.highlights ?? []), { id: Date.now().toString(), text: "", imageUrl: "" }],
  }));
  const removeHighlight = (idx: number) => setForm((p) => ({
    ...p,
    highlights: (p.highlights ?? []).filter((_, i) => i !== idx),
  }));
  const setHighlight = (idx: number, key: keyof CourseHighlight, val: string) =>
    setForm((p) => {
      const hs = [...(p.highlights ?? [])];
      hs[idx] = { ...hs[idx], [key]: val };
      return { ...p, highlights: hs };
    });

  const setLessonThumbnail = (lessonId: string, url: string) =>
    setForm((p) => ({
      ...p,
      lessonThumbnails: { ...(p.lessonThumbnails ?? {}), [lessonId]: url },
    }));

  const setLessonProducts = (lessonId: string, products: { name: string; url: string }[]) =>
    setForm((p) => ({
      ...p,
      lessonProducts: { ...(p.lessonProducts ?? {}), [lessonId]: products },
    }));

  const handleHighlightImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    e.target.value = "";
    setUploadingHighlightIdx(idx);
    try {
      const url = await dbUploadImage(file);
      setHighlight(idx, "imageUrl", url);
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => setHighlight(idx, "imageUrl", ev.target?.result as string);
      reader.readAsDataURL(file);
    } finally {
      setUploadingHighlightIdx(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "image" | "videoThumb" | "photo") => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 8 * 1024 * 1024) { alert("הקובץ גדול מדי — מקסימום 8MB"); return; }
    e.target.value = "";

    if (target === "image") setUploadingImg(true);
    else if (target === "videoThumb") setUploadingThumb(true);
    else setUploadingPhoto(true);

    try {
      const url = await dbUploadImage(file);
      if (target === "image") set("image", url);
      else if (target === "videoThumb") set("videoThumbnailUrl", url);
      else setInstructor("photoUrl", url);
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const b64 = ev.target?.result as string;
        if (target === "image") set("image", b64);
        else if (target === "videoThumb") set("videoThumbnailUrl", b64);
        else setInstructor("photoUrl", b64);
      };
      reader.readAsDataURL(file);
    } finally {
      if (target === "image") setUploadingImg(false);
      else if (target === "videoThumb") setUploadingThumb(false);
      else setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setSaveError("חובה למלא כותרת לקורס"); return; }
    setSaving(true);
    setSaveError(null);
    try {
      await onSave(form);
    } catch (e) {
      setSaveError(errMsg(e) || "שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-5 sticky top-0 z-10"
        style={{ background: "#0f0b0e", borderBottom: "1px solid rgba(196,133,122,0.08)" }}
      >
        <div>
          <p className="text-[0.55rem] tracking-[0.28em] uppercase mb-0.5" style={{ color: "#C4857A" }}>
            {isNew ? "קורס חדש" : "עריכת קורס"}
          </p>
          <Dialog.Title className="text-base font-black" style={{ color: "#FFF8F5" }}>
            {form.title || "ללא כותרת"}
          </Dialog.Title>
        </div>
        <Dialog.Close asChild>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5">
            <X size={16} style={{ color: "#5A3830" }} />
          </button>
        </Dialog.Close>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

        {/* ── תמונה ווידאו ── */}
        <FormSection title="תמונה ווידאו" icon="🎬">
          <div
            className="relative w-full aspect-[3/4] max-w-[130px] rounded-xl overflow-hidden mb-3 flex items-center justify-center"
            style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.12)" }}
          >
            {uploadingImg ? (
              <Loader2 size={20} className="animate-spin" style={{ color: "#C4857A" }} />
            ) : form.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.image} alt="תצוגה" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload size={20} style={{ color: "#C4857A" }} />
                <span className="text-[0.52rem]" style={{ color: "#5A3830" }}>תמונת תצוגה</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 mb-3">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "image")} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingImg}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.68rem] font-semibold transition-colors hover:opacity-80 disabled:opacity-40"
              style={{ background: "rgba(196,133,122,0.12)", color: "#C4857A", border: "1px solid rgba(196,133,122,0.2)" }}
            >
              {uploadingImg ? <Loader2 size={10} className="animate-spin" /> : <Upload size={11} />} העלי מהמחשב
            </button>
          </div>

          <FieldLabel>או הדביקי URL של תמונה</FieldLabel>
          <Input value={form.image} onChange={(v) => set("image", v)} placeholder="https://i.imghippo.com/files/..." dir="ltr" />

          <FieldLabel className="mt-3">סרטון טיזר (הדביקי URL של YouTube / Vimeo או ID)</FieldLabel>
          <Input
            value={form.videoId ?? ""}
            onChange={(v) => {
              const parsed = parseVideoUrl(v);
              set("videoId", parsed.videoId || v);
              set("videoProvider", parsed.provider);
            }}
            placeholder="https://www.youtube.com/watch?v=... או ID ישיר"
            dir="ltr"
          />

          <FieldLabel className="mt-4">תמונת פרסומת לנגן (לפני לחיצת Play)</FieldLabel>
          <p className="text-[0.58rem] mb-2" style={{ color: "#3A2020" }}>
            אם לא הועלתה — יוצג כיסוי הקורס. מומלץ: 16:9, 1280×720px
          </p>
          <div className="flex items-center gap-3">
            {form.videoThumbnailUrl ? (
              <div className="relative w-24 h-14 rounded-lg overflow-hidden shrink-0" style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.12)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.videoThumbnailUrl} alt="thumbnail" className="w-full h-full object-cover object-top" />
                <button
                  type="button"
                  onClick={() => set("videoThumbnailUrl", undefined)}
                  className="absolute top-0.5 left-0.5 rounded-full p-0.5"
                  style={{ background: "rgba(8,6,8,0.75)" }}
                >
                  <X size={10} style={{ color: "#e05555" }} />
                </button>
              </div>
            ) : (
              <div className="w-24 h-14 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#140e12", border: "1px dashed rgba(196,133,122,0.2)" }}>
                <span className="text-[0.48rem]" style={{ color: "#3A2020" }}>16:9</span>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "videoThumb")} />
              <button
                type="button"
                onClick={() => thumbRef.current?.click()}
                disabled={uploadingThumb}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.65rem] font-semibold hover:opacity-80 disabled:opacity-40"
                style={{ background: "rgba(196,133,122,0.1)", color: "#C4857A", border: "1px solid rgba(196,133,122,0.18)" }}
              >
                {uploadingThumb ? <Loader2 size={10} className="animate-spin" /> : <Upload size={10} />} העלי תמונה
              </button>
            </div>
          </div>
          <div className="mt-2">
            <Input
              value={form.videoThumbnailUrl ?? ""}
              onChange={(v) => set("videoThumbnailUrl", v || undefined)}
              placeholder="או הדביקי URL של תמונה 16:9"
              dir="ltr"
            />
          </div>
          {form.videoId && (
            <p className="mt-1 text-[0.55rem]" style={{ color: "#5A3830" }}>
              זוהה: {form.videoProvider === "youtube" ? "YouTube" : form.videoProvider === "vimeo" ? "Vimeo" : "קובץ ישיר"} · ID: {form.videoId}
            </p>
          )}
        </FormSection>

        {/* ── פרטי הקורס ── */}
        <FormSection title="פרטי הקורס" icon="📚">
          <FieldLabel>כותרת הקורס *</FieldLabel>
          <Input value={form.title} onChange={(v) => set("title", v)} placeholder="שם הקורס" />

          <FieldLabel className="mt-3">כותרת משנה</FieldLabel>
          <Input value={form.subtitle} onChange={(v) => set("subtitle", v)} placeholder="תיאור קצר מושך" />

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <FieldLabel className="mb-0">קטגוריה</FieldLabel>
                <button type="button" onClick={openCatManager}
                  className="text-[0.52rem] flex items-center gap-0.5 transition-opacity hover:opacity-70"
                  style={{ color: "#C4857A" }}>
                  <Settings size={9} /> ניהול קטגוריות
                </button>
              </div>
              <Select value={form.category} onChange={(v) => set("category", v)} options={dbCategories} />
            </div>
            <div>
              <FieldLabel>רמת גישה</FieldLabel>
              <Select value={form.tier} onChange={(v) => set("tier", v as CourseData["tier"])} options={["basic", "pro", "elite"]} labels={["Basic", "Pro", "Elite"]} />
            </div>
          </div>

          {/* Inline category manager */}
          {showCatManager && (
            <div className="mt-3 rounded-xl p-3 space-y-2"
              style={{ background: "#0f0b0e", border: "1px solid rgba(196,133,122,0.15)" }}>
              <p className="text-[0.62rem] font-bold tracking-wide uppercase" style={{ color: "#C4857A" }}>
                ניהול קטגוריות
              </p>
              {catDraft.map((cat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className="flex-1 px-2 py-1 rounded-lg text-[0.72rem] outline-none"
                    style={{ background: "#140e12", border: "1px solid rgba(255,255,255,0.06)", color: "#FFF8F5" }}
                    value={cat}
                    onChange={(e) => { const d = [...catDraft]; d[i] = e.target.value; setCatDraft(d); }}
                  />
                  <button type="button" onClick={() => setCatDraft(catDraft.filter((_, j) => j !== i))}
                    className="p-1 rounded hover:opacity-60">
                    <X size={11} style={{ color: "#5A3830" }} />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  className="flex-1 px-2 py-1 rounded-lg text-[0.72rem] outline-none"
                  style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.2)", color: "#FFF8F5" }}
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="קטגוריה חדשה..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newCatName.trim()) {
                      setCatDraft([...catDraft, newCatName.trim()]); setNewCatName("");
                    }
                  }}
                />
                <button type="button"
                  onClick={() => { if (newCatName.trim()) { setCatDraft([...catDraft, newCatName.trim()]); setNewCatName(""); } }}
                  className="px-3 py-1 rounded-lg text-[0.68rem] font-bold"
                  style={{ background: "rgba(196,133,122,0.12)", color: "#C4857A" }}>
                  + הוספה
                </button>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={saveCats} disabled={savingCats}
                  className="flex-1 py-1.5 rounded-lg text-[0.72rem] font-bold disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg,#C4857A,#D4998E)", color: "#080608" }}>
                  {savingCats ? "שומרת..." : "שמרי קטגוריות"}
                </button>
                <button type="button" onClick={() => setShowCatManager(false)}
                  className="px-4 py-1.5 rounded-lg text-[0.72rem]"
                  style={{ color: "#5A3830", border: "1px solid rgba(196,133,122,0.1)" }}>
                  ביטול
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <FieldLabel>רמת קושי</FieldLabel>
              <Select value={form.difficulty} onChange={(v) => set("difficulty", v as CourseData["difficulty"])} options={["beginner", "intermediate", "advanced"]} labels={["מתחילות", "בינוני", "מתקדם"]} />
            </div>
            <div>
              <FieldLabel>משך (דקות)</FieldLabel>
              <Input value={String(form.durationMinutes)} onChange={(v) => set("durationMinutes", parseInt(v) || 0)} placeholder="60" type="number" dir="ltr" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <FieldLabel>slug (URL)</FieldLabel>
              <Input value={form.slug} onChange={(v) => set("slug", v)} placeholder="my-course-slug" dir="ltr" />
            </div>
            <div className="flex flex-col justify-end gap-2 pb-0.5">
              <Checkbox checked={form.isPublished} onChange={(v) => set("isPublished", v)} label="מפורסם" />
              <Checkbox checked={form.isNew} onChange={(v) => set("isNew", v)} label='תגית "חדש"' />
              <Checkbox checked={form.showOnHome ?? true} onChange={(v) => set("showOnHome", v)} label="הצג בדף הבית" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <FieldLabel>מחיר (₪) — אופציונלי</FieldLabel>
              <Input
                value={form.price != null ? String(form.price) : ""}
                onChange={(v) => set("price", v === "" ? undefined : (parseFloat(v) || undefined))}
                placeholder="249"
                type="number"
                dir="ltr"
              />
            </div>
            <div>
              <FieldLabel>קישור לרכישה — אופציונלי</FieldLabel>
              <Input
                value={form.purchaseUrl ?? ""}
                onChange={(v) => set("purchaseUrl", v || undefined)}
                placeholder="https://..."
                dir="ltr"
              />
            </div>
          </div>
        </FormSection>

        {/* ── תיאורים ── */}
        <FormSection title="תיאורים" icon="✍️">
          <FieldLabel>תיאור קצר (לכרטיס)</FieldLabel>
          <Textarea value={form.shortDesc} onChange={(v) => set("shortDesc", v)} rows={2} placeholder="תיאור קצר ומושך שיופיע בכרטיס הקורס..." />
          <FieldLabel className="mt-3">תיאור מלא (Markdown)</FieldLabel>
          <Textarea value={form.fullDesc} onChange={(v) => set("fullDesc", v)} rows={5} placeholder="תיאור מלא של הקורס..." />
        </FormSection>

        {/* ── מדריכה ── */}
        <FormSection title="מדריכה" icon="👩‍🏫">
          <div className="flex gap-4 items-start">
            <div className="shrink-0 flex flex-col items-center gap-1.5">
              <div
                className="w-16 h-16 rounded-full overflow-hidden cursor-pointer relative"
                style={{ border: "2px solid rgba(196,133,122,0.3)", background: "#140e12" }}
                onClick={() => photoRef.current?.click()}
              >
                {uploadingPhoto ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 size={14} className="animate-spin" style={{ color: "#C4857A" }} />
                  </div>
                ) : form.instructor.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.instructor.photoUrl} alt="מדריכה" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Upload size={16} style={{ color: "#C4857A" }} />
                  </div>
                )}
              </div>
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "photo")} />
              <span className="text-[0.48rem]" style={{ color: "#5A3830" }}>לחצי לשינוי</span>
            </div>

            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <FieldLabel>שם המדריכה</FieldLabel>
                <Input value={form.instructor.name} onChange={(v) => setInstructor("name", v)} placeholder="נטלי ארצי" />
              </div>
              <div>
                <FieldLabel>URL תמונה (חלופי)</FieldLabel>
                <Input value={form.instructor.photoUrl} onChange={(v) => setInstructor("photoUrl", v)} placeholder="https://..." dir="ltr" />
              </div>
            </div>
          </div>
          <FieldLabel className="mt-3">ביוגרפיה</FieldLabel>
          <Textarea value={form.instructor.bio} onChange={(v) => setInstructor("bio", v)} rows={3} placeholder="ספרי קצת על המדריכה..." />
        </FormSection>

        {/* ── מה תגלי ── */}
        <FormSection title={`מה תגלי בקורס (${(form.highlights ?? []).length} כרטיסים)`} icon="✨">
          <p className="text-[0.58rem] mb-4" style={{ color: "#5A3830" }}>
            אם לא הוגדרו כרטיסים — יוצגו 4 השיעורים הראשונים אוטומטית.
          </p>
          <div className="space-y-3">
            {(form.highlights ?? []).map((h, idx) => (
              <div key={h.id} className="rounded-xl p-3 space-y-2" style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.08)" }}>
                <div className="flex items-center gap-2">
                  <span className="text-[0.6rem] font-bold tabular-nums w-5 shrink-0" style={{ color: "#C4857A" }}>{idx + 1}</span>
                  <input
                    className="flex-1 bg-transparent text-[0.78rem] font-medium outline-none border-b border-transparent focus:border-[rgba(196,133,122,0.25)] transition-colors"
                    style={{ color: "#FFF8F5" }}
                    value={h.text}
                    onChange={(e) => setHighlight(idx, "text", e.target.value)}
                    placeholder="מה תגלה הלומדת בנקודה זו..."
                  />
                  <button onClick={() => removeHighlight(idx)} className="p-1 rounded-lg hover:bg-white/5">
                    <X size={11} style={{ color: "#5A3830" }} />
                  </button>
                </div>
                {/* YouTube thumbnail picker — trailer + first 4 lessons */}
                {(() => {
                  const ytSources = [
                    ...(form.videoId && form.videoProvider === "youtube"
                      ? [{ label: "טיזר", videoId: form.videoId }]
                      : []),
                    ...form.lessons
                      .filter((l) => l.videoProvider === "youtube" && l.videoId)
                      .slice(0, 4)
                      .map((l, li) => ({ label: l.title ? l.title.slice(0, 10) : `ש׳ ${li + 1}`, videoId: l.videoId })),
                  ];
                  if (ytSources.length === 0) return null;
                  return (
                    <div>
                      <p className="text-[0.52rem] mb-1.5 uppercase tracking-wider" style={{ color: "#5A3830" }}>בחרי מסרטוני הקורס</p>
                      <div className="flex gap-2 flex-wrap">
                        {ytSources.map((src) => {
                          const url = `https://img.youtube.com/vi/${src.videoId}/hqdefault.jpg`;
                          return (
                            <div key={src.videoId} className="flex flex-col items-center gap-0.5">
                              <button type="button" onClick={() => setHighlight(idx, "imageUrl", url)}
                                className="relative rounded-lg overflow-hidden transition-all"
                                style={{ width: 72, height: 54, border: `2px solid ${h.imageUrl === url ? "#C4857A" : "rgba(196,133,122,0.15)"}`, flexShrink: 0 }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} alt="" className="w-full h-full object-cover" />
                                {h.imageUrl === url && (
                                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(196,133,122,0.3)" }}>
                                    <Check size={12} style={{ color: "#080608" }} />
                                  </div>
                                )}
                              </button>
                              <span className="text-[0.45rem]" style={{ color: "#5A3830", maxWidth: 72, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {src.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
                {/* Vimeo thumbnail picker — first 4 lessons with fetched thumbnails */}
                {(() => {
                  const vmSources = form.lessons
                    .filter((l) => l.videoProvider === "vimeo" && l.videoId && vimeoThumbsAdmin[l.id])
                    .slice(0, 4)
                    .map((l, li) => ({ label: l.title ? l.title.slice(0, 10) : `ש׳ ${li + 1}`, lessonId: l.id }));
                  if (vmSources.length === 0) return null;
                  return (
                    <div>
                      <p className="text-[0.52rem] mb-1.5 uppercase tracking-wider" style={{ color: "#5A3830" }}>בחרי מסרטוני הקורס</p>
                      <div className="flex gap-2 flex-wrap">
                        {vmSources.map((src) => {
                          const url = vimeoThumbsAdmin[src.lessonId];
                          return (
                            <div key={src.lessonId} className="flex flex-col items-center gap-0.5">
                              <button type="button" onClick={() => setHighlight(idx, "imageUrl", url)}
                                className="relative rounded-lg overflow-hidden transition-all"
                                style={{ width: 72, height: 54, border: `2px solid ${h.imageUrl === url ? "#C4857A" : "rgba(196,133,122,0.15)"}`, flexShrink: 0 }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} alt="" className="w-full h-full object-cover" />
                                {h.imageUrl === url && (
                                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(196,133,122,0.3)" }}>
                                    <Check size={12} style={{ color: "#080608" }} />
                                  </div>
                                )}
                              </button>
                              <span className="text-[0.45rem]" style={{ color: "#5A3830", maxWidth: 72, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {src.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
                {/* Custom upload / URL */}
                <div className="flex gap-2 items-center">
                  <input
                    className="flex-1 bg-transparent text-[0.62rem] outline-none border-b border-transparent focus:border-[rgba(196,133,122,0.2)] transition-colors"
                    style={{ color: "rgba(255,248,245,0.4)", direction: "ltr" }}
                    value={h.imageUrl}
                    onChange={(e) => setHighlight(idx, "imageUrl", e.target.value)}
                    placeholder="או הדביקי URL של תמונה"
                    dir="ltr"
                  />
                  <input ref={(el) => { highlightFileRefs.current[idx] = el; }} type="file" accept="image/*" className="hidden"
                    onChange={(e) => handleHighlightImageUpload(e, idx)} />
                  <button type="button" onClick={() => highlightFileRefs.current[idx]?.click()}
                    disabled={uploadingHighlightIdx === idx}
                    className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-40 shrink-0">
                    {uploadingHighlightIdx === idx
                      ? <Loader2 size={11} className="animate-spin" style={{ color: "#C4857A" }} />
                      : <Upload size={11} style={{ color: "#8B6355" }} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={addHighlight}
            className="mt-3 w-full py-2.5 rounded-xl text-[0.75rem] font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-70"
            style={{ border: "1px dashed rgba(196,133,122,0.25)", color: "#C4857A", background: "rgba(196,133,122,0.05)" }}>
            <Plus size={13} /> הוסיפי כרטיס
          </button>
        </FormSection>

        {/* ── שיעורים ── */}
        <FormSection title={`שיעורים (${form.lessons.length})`} icon="🎞️">
          <div className="space-y-3">
            {form.lessons.map((lesson, idx) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                index={idx}
                total={form.lessons.length}
                onChange={(key, val) => setLesson(idx, key, val)}
                onRemove={() => removeLesson(idx)}
                thumbnailUrl={form.lessonThumbnails?.[lesson.id]}
                onThumbnailChange={(url) => setLessonThumbnail(lesson.id, url)}
                vimeoThumbUrl={vimeoThumbsAdmin[lesson.id]}
                products={form.lessonProducts?.[lesson.id] ?? []}
                onProductsChange={(prods) => setLessonProducts(lesson.id, prods)}
              />
            ))}
          </div>
          <button
            onClick={addLesson}
            className="mt-4 w-full py-2.5 rounded-xl text-[0.75rem] font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-70"
            style={{ border: "1px dashed rgba(196,133,122,0.25)", color: "#C4857A", background: "rgba(196,133,122,0.05)" }}
          >
            <Plus size={13} /> הוסיפי שיעור
          </button>
        </FormSection>
      </div>

      {/* Save bar */}
      <div
        className="sticky bottom-0 px-6 py-4 flex flex-col gap-3"
        style={{ background: "#0f0b0e", borderTop: "1px solid rgba(196,133,122,0.08)" }}
      >
        {saveError && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-[0.7rem]"
            style={{ background: "rgba(196,50,50,0.08)", color: "#e05555", border: "1px solid rgba(196,50,50,0.2)" }}>
            <AlertCircle size={12} /> {saveError}
          </div>
        )}
        <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl text-[0.8rem] font-semibold hover:bg-white/5 transition-colors"
          style={{ color: "#5A3830", border: "1px solid rgba(196,133,122,0.12)" }}
        >
          ביטול
        </button>
        <button
          onClick={handleSave}
          disabled={!form.title.trim() || saving}
          className="px-6 py-2.5 rounded-xl text-[0.8rem] font-bold transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 flex items-center gap-2"
          style={{ background: "linear-gradient(135deg,#C4857A,#D4998E)", color: "#080608", boxShadow: "0 4px 14px rgba(196,133,122,0.3)" }}
        >
          {saving && <Loader2 size={12} className="animate-spin" />}
          {isNew ? "צרי קורס" : "שמרי שינויים"}
        </button>
        </div>
      </div>
    </div>
  );
}

// ─── Lesson row ───────────────────────────────────────────────────

function LessonRow({
  lesson, index, total, onChange, onRemove, thumbnailUrl, onThumbnailChange, vimeoThumbUrl, products, onProductsChange,
}: {
  lesson: CourseLesson;
  index: number;
  total: number;
  onChange: (key: keyof CourseLesson, val: CourseLesson[keyof CourseLesson]) => void;
  onRemove: () => void;
  thumbnailUrl?: string;
  onThumbnailChange: (url: string) => void;
  vimeoThumbUrl?: string;
  products: { name: string; url: string }[];
  onProductsChange: (products: { name: string; url: string }[]) => void;
}) {
  const videoRef = useRef<HTMLInputElement>(null);
  const thumbFileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [showThumbPicker, setShowThumbPicker] = useState(false);

  const handleVideoUrl = (raw: string) => {
    const parsed = parseVideoUrl(raw);
    if (parsed.videoId && parsed.videoId !== raw) {
      onChange("videoId", parsed.videoId);
      onChange("videoProvider", parsed.provider);
    } else {
      onChange("videoId", raw);
    }
  };

  const handleVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    try {
      const url = await dbUploadVideo(file);
      onChange("videoId", url);
      onChange("videoProvider", "direct");
    } catch {
      alert("שגיאה בהעלאת הסרטון — בדקי שמפתחות Supabase מוגדרים");
    } finally {
      setUploading(false);
    }
  };

  const providerLabel = lesson.videoProvider === "vimeo" ? "Vimeo" : lesson.videoProvider === "direct" ? "קובץ" : "YouTube";

  const handleThumbFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    e.target.value = "";
    setUploadingThumb(true);
    try {
      const url = await dbUploadImage(file);
      onThumbnailChange(url);
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => onThumbnailChange(ev.target?.result as string);
      reader.readAsDataURL(file);
    } finally {
      setUploadingThumb(false);
    }
  };

  const ytThumbs = lesson.videoProvider === "youtube" && lesson.videoId
    ? [
        `https://img.youtube.com/vi/${lesson.videoId}/hqdefault.jpg`,
        `https://img.youtube.com/vi/${lesson.videoId}/1.jpg`,
        `https://img.youtube.com/vi/${lesson.videoId}/2.jpg`,
        `https://img.youtube.com/vi/${lesson.videoId}/3.jpg`,
      ]
    : [];

  return (
    <div className="rounded-xl p-3 space-y-2" style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.08)" }}>
      <div className="flex items-center gap-2">
        <GripVertical size={13} style={{ color: "#3A2020" }} className="cursor-grab shrink-0" />
        <span className="text-[0.6rem] font-bold tabular-nums w-5" style={{ color: "#C4857A" }}>{index + 1}</span>
        <input
          className="flex-1 min-w-0 bg-transparent text-[0.78rem] font-medium outline-none border-b border-transparent focus:border-[rgba(196,133,122,0.25)] transition-colors"
          style={{ color: "#FFF8F5" }}
          value={lesson.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="שם השיעור"
        />
        <button onClick={onRemove} disabled={total <= 1} className="p-1 rounded-lg hover:bg-white/5 disabled:opacity-30">
          <X size={11} style={{ color: "#5A3830" }} />
        </button>
      </div>

      {/* Video input row */}
      <div className="flex gap-2 items-center">
        <input
          className="flex-1 min-w-0 bg-transparent text-[0.68rem] outline-none border-b border-transparent focus:border-[rgba(196,133,122,0.2)] transition-colors"
          style={{ color: "rgba(255,248,245,0.55)", direction: "ltr" }}
          value={lesson.videoId}
          onChange={(e) => handleVideoUrl(e.target.value)}
          placeholder="הדביקי URL יוטיוב / Vimeo"
          dir="ltr"
        />
        {lesson.videoId && (
          <span className="text-[0.5rem] px-1.5 py-0.5 rounded-full shrink-0" style={{ background: "rgba(196,133,122,0.1)", color: "#C4857A" }}>
            {providerLabel}
          </span>
        )}
        <button
          type="button"
          title="העלי סרטון מהמחשב"
          onClick={() => videoRef.current?.click()}
          disabled={uploading}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-40 shrink-0"
        >
          {uploading ? <Loader2 size={11} className="animate-spin" style={{ color: "#C4857A" }} /> : <Upload size={11} style={{ color: "#8B6355" }} />}
        </button>
        <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={handleVideoFile} />
      </div>

      {/* Duration + free */}
      <div className="flex gap-2 items-center">
        <span className="text-[0.58rem]" style={{ color: "#5A3830" }}>משך:</span>
        <input
          className="w-14 bg-transparent text-[0.68rem] text-center outline-none border-b border-transparent focus:border-[rgba(196,133,122,0.2)] transition-colors"
          style={{ color: "rgba(255,248,245,0.4)", direction: "ltr" }}
          type="number"
          value={lesson.durationMin || ""}
          onChange={(e) => onChange("durationMin", parseInt(e.target.value) || 0)}
          placeholder="דק׳"
        />
        <span className="text-[0.58rem]" style={{ color: "#5A3830" }}>דקות</span>
        <div className="flex-1" />
        <Checkbox checked={lesson.isFree} onChange={(v) => onChange("isFree", v)} label="חינמי" small />
      </div>

      {/* Products */}
      <div className="rounded-lg p-2.5" style={{ background: "rgba(196,133,122,0.04)", border: "1px solid rgba(196,133,122,0.1)" }}>
        <p className="text-[0.62rem] font-semibold mb-2" style={{ color: "#C4857A" }}>🛍 קישורים ומוצרים לשיעור זה</p>
        {products.map((prod, i) => (
          <div key={i} className="flex gap-1.5 items-center mb-1.5">
            <input
              className="flex-1 px-2 py-1 rounded text-[0.65rem] outline-none"
              style={{ background: "#140e12", border: "1px solid rgba(255,255,255,0.06)", color: "#FFF8F5" }}
              value={prod.name}
              onChange={(e) => { const next = [...products]; next[i] = { ...next[i], name: e.target.value }; onProductsChange(next); }}
              placeholder="שם מוצר / לינק"
            />
            <input
              className="flex-1 px-2 py-1 rounded text-[0.6rem] outline-none"
              style={{ background: "#140e12", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,248,245,0.45)", direction: "ltr" }}
              dir="ltr"
              value={prod.url}
              onChange={(e) => { const next = [...products]; next[i] = { ...next[i], url: e.target.value }; onProductsChange(next); }}
              placeholder="https://..."
            />
            <button type="button" onClick={() => onProductsChange(products.filter((_, j) => j !== i))} className="p-1 rounded hover:bg-white/5">
              <X size={11} style={{ color: "#5A3830" }} />
            </button>
          </div>
        ))}
        <button type="button"
          onClick={() => onProductsChange([...products, { name: "", url: "" }])}
          className="mt-1 text-[0.65rem] flex items-center gap-1 px-2 py-1 rounded transition-colors hover:bg-white/5"
          style={{ color: "#C4857A" }}>
          <Plus size={11} /> הוסיפי קישור / מוצר
        </button>
      </div>

      {/* Thumbnail picker */}
      <div>
        <button type="button" onClick={() => setShowThumbPicker((p) => !p)}
          className="text-[0.52rem] flex items-center gap-1 transition-opacity hover:opacity-70"
          style={{ color: "rgba(196,133,122,0.55)" }}>
          <Video size={9} />
          {thumbnailUrl ? "שנה תמונה לשיעור" : "הוסיפי תמונה לשיעור"}
        </button>

        {showThumbPicker && (
          <div className="mt-2 space-y-2">
            {/* YouTube auto-thumbs */}
            {ytThumbs.length > 0 && (
              <div>
                <p className="text-[0.5rem] mb-1.5 uppercase tracking-wider" style={{ color: "#5A3830" }}>מסרטון היוטיוב</p>
                <div className="flex gap-1.5 flex-wrap">
                  {ytThumbs.map((url) => (
                    <button key={url} type="button" onClick={() => onThumbnailChange(url)}
                      className="relative rounded-lg overflow-hidden transition-all"
                      style={{ width: 64, height: 48, border: `2px solid ${thumbnailUrl === url ? "#C4857A" : "rgba(196,133,122,0.12)"}`, flexShrink: 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      {thumbnailUrl === url && (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(196,133,122,0.35)" }}>
                          <Check size={10} style={{ color: "#080608" }} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Vimeo auto-thumb */}
            {lesson.videoProvider === "vimeo" && vimeoThumbUrl && (
              <div>
                <p className="text-[0.5rem] mb-1.5 uppercase tracking-wider" style={{ color: "#5A3830" }}>מסרטון ה-Vimeo</p>
                <button type="button" onClick={() => onThumbnailChange(vimeoThumbUrl)}
                  className="relative rounded-lg overflow-hidden transition-all"
                  style={{ width: 96, height: 54, border: `2px solid ${thumbnailUrl === vimeoThumbUrl ? "#C4857A" : "rgba(196,133,122,0.12)"}`, flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={vimeoThumbUrl} alt="" className="w-full h-full object-cover" />
                  {thumbnailUrl === vimeoThumbUrl && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(196,133,122,0.35)" }}>
                      <Check size={10} style={{ color: "#080608" }} />
                    </div>
                  )}
                </button>
              </div>
            )}
            {/* Custom URL or upload */}
            <div className="flex gap-2 items-center">
              <input
                className="flex-1 bg-transparent text-[0.6rem] outline-none border-b border-transparent focus:border-[rgba(196,133,122,0.2)] transition-colors"
                style={{ color: "rgba(255,248,245,0.35)", direction: "ltr" }}
                value={thumbnailUrl ?? ""}
                onChange={(e) => onThumbnailChange(e.target.value)}
                placeholder="או הדביקי URL"
                dir="ltr"
              />
              <input ref={thumbFileRef} type="file" accept="image/*" className="hidden" onChange={handleThumbFile} />
              <button type="button" onClick={() => thumbFileRef.current?.click()}
                disabled={uploadingThumb}
                className="p-1 rounded-lg hover:bg-white/5 disabled:opacity-40 shrink-0">
                {uploadingThumb
                  ? <Loader2 size={10} className="animate-spin" style={{ color: "#C4857A" }} />
                  : <Upload size={10} style={{ color: "#8B6355" }} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shared UI ────────────────────────────────────────────────────

function FormSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">{icon}</span>
        <h3 className="text-[0.8rem] font-black tracking-wide" style={{ color: "#C4857A" }}>{title}</h3>
        <div className="flex-1 h-px" style={{ background: "rgba(196,133,122,0.08)" }} />
      </div>
      {children}
    </section>
  );
}

function FieldLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={`block text-[0.6rem] font-semibold mb-1.5 tracking-wider uppercase ${className}`} style={{ color: "#8B6355" }}>
      {children}
    </label>
  );
}

function Input({ value, onChange, placeholder, type = "text", dir = "rtl" }: {
  value: string | number; onChange: (v: string) => void; placeholder?: string; type?: string; dir?: string;
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

function Select({ value, onChange, options, labels }: {
  value: string; onChange: (v: string) => void; options: readonly string[]; labels?: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl text-sm outline-none appearance-none cursor-pointer transition-all"
        style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.12)", color: "#FFF8F5" }}
        onFocus={(e) => (e.target.style.borderColor = "rgba(196,133,122,0.4)")}
        onBlur={(e)  => (e.target.style.borderColor = "rgba(196,133,122,0.12)")}
      >
        {options.map((opt, i) => (
          <option key={opt} value={opt} style={{ background: "#0f0b0e" }}>{labels ? labels[i] : opt}</option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#8B6355" }} />
    </div>
  );
}

function Checkbox({ checked, onChange, label, small = false }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; small?: boolean;
}) {
  return (
    <label className="flex items-center gap-1.5 cursor-pointer select-none" onClick={() => onChange(!checked)}>
      <div
        className="flex items-center justify-center rounded-[5px] transition-all"
        style={{ width: small ? 14 : 16, height: small ? 14 : 16, background: checked ? "linear-gradient(135deg,#C4857A,#D4998E)" : "#140e12", border: checked ? "none" : "1px solid rgba(196,133,122,0.25)" }}
      >
        {checked && <Check size={small ? 9 : 10} style={{ color: "#080608" }} strokeWidth={3} />}
      </div>
      <span className={`${small ? "text-[0.58rem]" : "text-xs"} font-medium`} style={{ color: checked ? "#C4857A" : "#8B6355" }}>
        {label}
      </span>
    </label>
  );
}

function StatusPill({ children, color, bg, border }: { children: React.ReactNode; color: string; bg: string; border: string }) {
  return (
    <span
      className="inline-block px-2 py-[2px] rounded-full text-[0.5rem] font-bold tracking-wider uppercase"
      style={{ color, background: bg, border: `1px solid ${border}` }}
    >
      {children}
    </span>
  );
}

function ActionBtn({ onClick, title, children, style, disabled }: { onClick: () => void; title?: string; children: React.ReactNode; style?: React.CSSProperties; disabled?: boolean }) {
  return (
    <button onClick={onClick} title={title} disabled={disabled} className="p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-40" style={style}>
      {children}
    </button>
  );
}

// ─── Users Section ────────────────────────────────────────────────

type ProfileRow = {
  id: string; role: string; created_at?: string;
  email?: string; first_name?: string; last_name?: string;
  subscription_tier?: string | null;
};

function exportUsersCSV(users: ProfileRow[]) {
  const TIER_LABEL: Record<string, string> = { basic: "Basic", pro: "Pro", elite: "Elite" };
  const headers = ["שם פרטי", "שם משפחה", "אימייל", "תפקיד", "מנוי", "תאריך הצטרפות"];
  const rows = users.map((u) => [
    u.first_name ?? "",
    u.last_name ?? "",
    u.email ?? "",
    u.role,
    u.subscription_tier ? (TIER_LABEL[u.subscription_tier] ?? u.subscription_tier) : "אין",
    u.created_at ? new Date(u.created_at).toLocaleDateString("he-IL") : "—",
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  // BOM להצגה תקינה של עברית ב-Excel
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `משתמשות_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function UsersSection() {
  const [users, setUsers]       = useState<ProfileRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [confirmPromotion, setConfirmPromotion] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const sb = createClient();
        const { data, error: err } = await sb
          .from("profiles")
          .select("id, role, email, first_name, last_name, subscription_tier")
          .order("id", { ascending: false });
        if (err) throw err;
        setUsers((data ?? []) as ProfileRow[]);
      } catch (e) {
        setError(errMsg(e) || "שגיאה בטעינת משתמשים");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (newRole === "admin") {
      const user = users.find((u) => u.id === id);
      const name = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.email || "משתמשת זו";
      setConfirmPromotion({ id, name });
      return;
    }
    await doRoleChange(id, "user");
  };

  const doRoleChange = async (id: string, newRole: string) => {
    setUpdating(id);
    try {
      const sb = createClient();
      const { error: err } = await sb.from("profiles").update({ role: newRole }).eq("id", id);
      if (err) throw err;
      setUsers(users.map((u) => u.id === id ? { ...u, role: newRole } : u));
    } catch (e) {
      setError(errMsg(e) || "שגיאה בעדכון");
    } finally {
      setUpdating(null);
      setConfirmPromotion(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32 gap-3" style={{ color: "#5A3830" }}>
      <Loader2 size={18} className="animate-spin" style={{ color: "#C4857A" }} />
      <span className="text-sm">טוען משתמשים...</span>
    </div>
  );

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-black" style={{ color: "#FFF8F5" }}>משתמשות</h2>
          <p className="text-xs mt-0.5" style={{ color: "#5A3830" }}>{users.length} משתמשות רשומות</p>
        </div>
        <button
          onClick={() => exportUsersCSV(users)}
          disabled={users.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[0.72rem] font-bold transition-all hover:opacity-90 active:scale-95 disabled:opacity-30"
          style={{
            background: "rgba(196,133,122,0.1)",
            border: "1px solid rgba(196,133,122,0.25)",
            color: "#C4857A",
          }}
        >
          <Download size={13} />
          ייצוא לאקסל
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-[0.72rem] mb-4" style={{ background: "rgba(196,50,50,0.08)", color: "#e05555", border: "1px solid rgba(196,50,50,0.2)" }}>
          <AlertCircle size={13} /><span>{error}</span>
          <button onClick={() => setError(null)} className="mr-auto"><X size={12} /></button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {users.map((u) => (
          <div key={u.id} className="flex items-center gap-4 rounded-xl px-4 py-3" style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.07)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[0.65rem] font-black" style={{ background: "rgba(196,133,122,0.1)", color: "#C4857A" }}>
              {u.role === "admin" ? "A" : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[0.75rem] font-semibold truncate" style={{ color: "#FFF8F5" }}>
                {[u.first_name, u.last_name].filter(Boolean).join(" ") || u.email || `${u.id.slice(0, 8)}...`}
              </p>
              <p className="text-[0.58rem] truncate" style={{ color: "#5A3830" }}>
                {u.email && (u.first_name || u.last_name) ? u.email + " · " : ""}
                {u.created_at ? new Date(u.created_at).toLocaleDateString("he-IL") : ""}
                {u.subscription_tier ? ` · ${u.subscription_tier}` : ""}
              </p>
            </div>
            <StatusPill
              color={u.role === "admin" ? "#C4857A" : "rgba(255,248,245,0.35)"}
              bg={u.role === "admin" ? "rgba(196,133,122,0.1)" : "rgba(255,255,255,0.03)"}
              border={u.role === "admin" ? "rgba(196,133,122,0.25)" : "rgba(255,255,255,0.08)"}
            >
              {u.role}
            </StatusPill>
            <ActionBtn
              onClick={() => toggleRole(u.id, u.role)}
              disabled={updating === u.id}
              title={u.role === "admin" ? "הורד לmuser" : "העלה לאדמין"}
            >
              {updating === u.id
                ? <Loader2 size={12} className="animate-spin" style={{ color: "#5A3830" }} />
                : <Edit2 size={13} style={{ color: "#5A3830" }} />
              }
            </ActionBtn>
          </div>
        ))}
        {users.length === 0 && !error && (
          <p className="text-center text-sm py-12" style={{ color: "rgba(255,248,245,0.18)" }}>אין משתמשות רשומות עדיין</p>
        )}
      </div>

      {/* אישור כפול להעלאה לאדמין */}
      {confirmPromotion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(8,6,8,0.85)", backdropFilter: "blur(6px)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: "#0f0b0e", border: "1px solid rgba(196,133,122,0.2)" }}>
            <p className="text-[0.65rem] tracking-widest uppercase mb-3" style={{ color: "#C4857A" }}>אישור נדרש</p>
            <p className="text-sm font-black mb-1" style={{ color: "#FFF8F5" }}>העלאה לאדמין</p>
            <p className="text-xs leading-relaxed mb-6" style={{ color: "#5A3830" }}>
              אתה עומד להפוך את <span style={{ color: "#C4857A" }}>{confirmPromotion.name}</span> לאדמין עם גישה מלאה למערכת. פעולה זו ניתנת לביטול אחר כך.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmPromotion(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-opacity hover:opacity-70"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,248,245,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                ביטול
              </button>
              <button
                onClick={() => doRoleChange(confirmPromotion.id, "admin")}
                disabled={updating === confirmPromotion.id}
                className="flex-1 py-2.5 rounded-xl text-xs font-black transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#C4857A,#D4998E)", color: "#080608" }}
              >
                {updating === confirmPromotion.id ? "מעדכן..." : "כן, העלה לאדמין"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Analytics Section ────────────────────────────────────────────

type TopLesson = { lesson_id: string; course_id: string; views: number };

function AnalyticsSection() {
  const { courses } = useCourses();
  const [stats, setStats] = useState({ users: 0, courses: 0, published: 0, basic: 0, pro: 0, elite: 0, activeWeek: 0 });
  const [topLessons, setTopLessons] = useState<TopLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const sb = createClient();
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        const [
          { count: totalUsers },
          { count: totalCourses },
          { count: published },
          { data: tierData },
          { data: activeData },
          { data: lessonsData },
        ] = await Promise.all([
          sb.from("profiles").select("*", { count: "exact", head: true }),
          sb.from("courses").select("*", { count: "exact", head: true }),
          sb.from("courses").select("*", { count: "exact", head: true }).eq("is_published", true),
          sb.from("profiles").select("subscription_tier").not("subscription_tier", "is", null),
          sb.from("user_progress").select("user_id").gte("updated_at", sevenDaysAgo),
          sb.from("user_progress").select("lesson_id, course_id").eq("completed", true),
        ]);

        const basic  = (tierData ?? []).filter((r) => r.subscription_tier === "basic").length;
        const pro    = (tierData ?? []).filter((r) => r.subscription_tier === "pro").length;
        const elite  = (tierData ?? []).filter((r) => r.subscription_tier === "elite").length;
        const activeWeek = new Set((activeData ?? []).map((r) => r.user_id)).size;

        const lessonCount: Record<string, { course_id: string; views: number }> = {};
        for (const r of (lessonsData ?? [])) {
          if (!lessonCount[r.lesson_id]) lessonCount[r.lesson_id] = { course_id: r.course_id, views: 0 };
          lessonCount[r.lesson_id].views++;
        }
        const top5 = Object.entries(lessonCount)
          .map(([lesson_id, v]) => ({ lesson_id, ...v }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 5);

        setStats({ users: totalUsers ?? 0, courses: totalCourses ?? 0, published: published ?? 0, basic, pro, elite, activeWeek });
        setTopLessons(top5);
      } catch { /* show zeros */ }
      finally { setLoading(false); }
    })();
  }, []);

  const getLessonName = (lessonId: string, courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    const lesson = course?.lessons?.find((l) => l.id === lessonId);
    return lesson?.title ?? lessonId;
  };

  const statTiles = [
    { label: "משתמשות רשומות", value: stats.users,     color: "#C4857A" },
    { label: "קורסים פורסמו",  value: stats.published, color: "#4A9B6F" },
    { label: "פעילות השבוע",   value: stats.activeWeek, color: "#D4998E" },
    { label: "סה\"כ מנויות",   value: stats.basic + stats.pro + stats.elite, color: "#C4857A" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-black" style={{ color: "#FFF8F5" }}>אנליטיקס</h2>
        <p className="text-xs mt-0.5" style={{ color: "#5A3830" }}>נתונים כלליים על הפלטפורמה</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3">
          <Loader2 size={18} className="animate-spin" style={{ color: "#C4857A" }} />
          <span className="text-sm" style={{ color: "#5A3830" }}>טוען...</span>
        </div>
      ) : (
        <>
          {/* General stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statTiles.map((tile) => (
              <div key={tile.label} className="rounded-2xl p-5 text-center" style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.08)" }}>
                <p className="text-3xl font-black mb-1" style={{ color: tile.color }}>{tile.value}</p>
                <p className="text-[0.6rem]" style={{ color: "#5A3830" }}>{tile.label}</p>
              </div>
            ))}
          </div>

          {/* Subscribers by tier */}
          <div className="rounded-2xl p-5" style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.08)" }}>
            <p className="text-sm font-black mb-4" style={{ color: "#FFF8F5" }}>מנויות לפי תוכנית</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Basic", value: stats.basic,  color: "#8B6355" },
                { label: "Pro",   value: stats.pro,    color: "#C4857A" },
                { label: "Elite", value: stats.elite,  color: "#D4998E" },
              ].map((t) => (
                <div key={t.label} className="rounded-xl p-4 text-center" style={{ background: "#0f0b0e", border: "1px solid rgba(196,133,122,0.06)" }}>
                  <p className="text-2xl font-black mb-0.5" style={{ color: t.color }}>{t.value}</p>
                  <p className="text-[0.6rem]" style={{ color: "#5A3830" }}>{t.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top lessons */}
          <div className="rounded-2xl p-5" style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.08)" }}>
            <p className="text-sm font-black mb-4" style={{ color: "#FFF8F5" }}>שיעורים שנצפו הכי הרבה</p>
            {topLessons.length === 0 ? (
              <p className="text-[0.7rem] text-center py-4" style={{ color: "#5A3830" }}>עדיין אין נתוני צפייה</p>
            ) : (
              <div className="space-y-2">
                {topLessons.map((item, i) => (
                  <div key={item.lesson_id} className="flex items-center gap-3 py-2" style={{ borderBottom: i < topLessons.length - 1 ? "1px solid rgba(196,133,122,0.06)" : "none" }}>
                    <span className="text-[0.6rem] font-black w-4 text-center shrink-0" style={{ color: "#5A3830" }}>{i + 1}</span>
                    <p className="text-[0.72rem] flex-1 truncate" style={{ color: "rgba(255,248,245,0.7)" }}>
                      {getLessonName(item.lesson_id, item.course_id)}
                    </p>
                    <span className="text-[0.65rem] font-black shrink-0" style={{ color: "#C4857A" }}>{item.views} צפיות</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Settings Section ─────────────────────────────────────────────

function SettingsSection() {
  const [ogImage, setOgImage]     = useState("");
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dbGetOgImage().then(setOgImage).catch(() => {});
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    try {
      const url = await dbUploadImage(file);
      setOgImage(url);
    } catch (err) {
      setError(errMsg(err) || "שגיאה בהעלאה");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await dbSetOgImage(ogImage);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(errMsg(err) || "שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h2 className="text-lg font-black" style={{ color: "#FFF8F5" }}>הגדרות אתר</h2>
        <p className="text-xs mt-0.5" style={{ color: "#5A3830" }}>SEO ושיתוף ברשתות חברתיות</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-[0.72rem] mb-4"
          style={{ background: "rgba(196,50,50,0.08)", color: "#e05555", border: "1px solid rgba(196,50,50,0.2)" }}>
          <AlertCircle size={13} /><span>{error}</span>
          <button onClick={() => setError(null)} className="mr-auto"><X size={12} /></button>
        </div>
      )}

      {/* OG Image */}
      <div className="rounded-2xl p-5" style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.1)" }}>
        <p className="text-[0.7rem] font-black mb-1" style={{ color: "#FFF8F5" }}>תמונת שיתוף (og:image)</p>
        <p className="text-[0.6rem] mb-4" style={{ color: "#5A3830" }}>
          התמונה שמופיעה כשמשתפים את האתר ב-WhatsApp, Instagram, Facebook.
          מידה מומלצת: 1200×630px.
        </p>

        {/* Preview */}
        <div
          className="relative w-full rounded-xl overflow-hidden mb-4 flex items-center justify-center"
          style={{ aspectRatio: "1200/630", background: "#0f0b0e", border: "1px solid rgba(196,133,122,0.08)" }}
        >
          {ogImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ogImage} alt="og preview" className="w-full h-full object-cover" />
          ) : (
            <p className="text-[0.62rem]" style={{ color: "#3A2020" }}>אין תמונה — ברירת מחדל: תמונת נטלי</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={handleUpload} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[0.7rem] font-semibold transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: "rgba(196,133,122,0.1)", border: "1px solid rgba(196,133,122,0.2)", color: "#C4857A" }}
          >
            {uploading
              ? <Loader2 size={13} className="animate-spin" />
              : <Upload size={13} />}
            {uploading ? "מעלה..." : "העלאת תמונה"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !ogImage}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[0.7rem] font-semibold transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: saving || !ogImage ? "rgba(255,255,255,0.04)" : "linear-gradient(135deg,#C4857A,#D4998E)", color: saving || !ogImage ? "#5A3830" : "#080608" }}
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : saved ? <Check size={13} /> : null}
            {saved ? "נשמר!" : saving ? "שומר..." : "שמור"}
          </button>
          {ogImage && (
            <button
              onClick={() => setOgImage("")}
              className="px-3 py-2 rounded-xl text-[0.7rem] transition-all hover:opacity-70"
              style={{ color: "#5A3830" }}
              title="נקה ושמור ברירת מחדל"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Categories section ───────────────────────────────────────────

function CategoriesSection() {
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function autoSlug(name: string) {
    return name.trim().toLowerCase().replace(/\s+/g, "-");
  }

  useEffect(() => {
    const sb = createClient();
    (async () => {
      try {
        const { data } = await sb.from("categories").select("id, name, slug").order("name");
        setCategories(data ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleAdd() {
    const name = newName.trim();
    const slug = newSlug.trim() || autoSlug(name);
    if (!name) return;
    setSaving(true);
    setError(null);
    try {
      const sb = createClient();
      const { data, error: e } = await sb.from("categories").insert({ name, slug }).select().single();
      if (e) throw e;
      setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
      setNewSlug("");
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const sb = createClient();
    try { await sb.from("categories").delete().eq("id", id); } catch {}
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <h2 className="text-xl font-black mb-2" style={{ color: "#FFF8F5" }}>קטגוריות קורסים</h2>
      <p className="text-sm mb-6" style={{ color: "rgba(255,248,245,0.35)" }}>
        קטגוריות מוצגות בסינון ובדף{" "}
        <code style={{ fontSize: "0.8em", color: "#C4857A" }}>/categories/[slug]</code>
      </p>

      {/* Add form */}
      <div className="flex gap-2 mb-6">
        <input
          value={newName}
          onChange={(e) => { setNewName(e.target.value); if (!newSlug) setNewSlug(autoSlug(e.target.value)); }}
          placeholder="שם קטגוריה (עברית)"
          className="flex-1 px-3 py-2 rounded-lg text-sm"
          style={{ background: "#140e12", border: "1px solid rgba(255,255,255,0.07)", color: "#FFF8F5" }}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <input
          value={newSlug}
          onChange={(e) => setNewSlug(e.target.value)}
          placeholder="slug (אנגלית)"
          className="w-32 px-3 py-2 rounded-lg text-sm"
          style={{ background: "#140e12", border: "1px solid rgba(255,255,255,0.07)", color: "#FFF8F5" }}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button
          onClick={handleAdd}
          disabled={saving || !newName.trim()}
          className="px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-40 transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#C4857A,#D4998E)", color: "#080608" }}
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
        </button>
      </div>
      {error && <p className="text-sm mb-4" style={{ color: "#e87070" }}>{error}</p>}

      {/* List */}
      {loading ? (
        <div className="flex items-center gap-2 py-8" style={{ color: "#5A3830" }}>
          <Loader2 size={16} className="animate-spin" style={{ color: "#C4857A" }} />
          <span className="text-sm">טוען...</span>
        </div>
      ) : categories.length === 0 ? (
        <p className="text-sm py-8 text-center" style={{ color: "rgba(255,248,245,0.2)" }}>
          אין קטגוריות עדיין — הוסיפי את הראשונה
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: "#0f0b0e", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#FFF8F5" }}>{cat.name}</p>
                <p className="text-[0.65rem]" style={{ color: "rgba(196,133,122,0.5)" }}>/categories/{cat.slug}</p>
              </div>
              <button
                onClick={() => handleDelete(cat.id)}
                className="p-1.5 rounded-lg transition-colors hover:bg-red-900/20"
                style={{ color: "rgba(255,100,100,0.5)" }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 rounded-xl" style={{ background: "rgba(196,133,122,0.05)", border: "1px solid rgba(196,133,122,0.1)" }}>
        <p className="text-[0.68rem] font-bold mb-2" style={{ color: "#C4857A" }}>SQL — יש להריץ פעם אחת ב-Supabase</p>
        <pre className="text-[0.6rem] overflow-x-auto" style={{ color: "rgba(255,248,245,0.45)", lineHeight: 1.6 }}>{`CREATE TABLE IF NOT EXISTS categories (
  id   uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON categories FOR SELECT USING (true);
CREATE POLICY "admin write" ON categories FOR ALL TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');`}</pre>
      </div>
    </div>
  );
}

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <p className="text-3xl mb-3">✨</p>
      <p className="text-sm font-semibold" style={{ color: "rgba(255,248,245,0.3)" }}>{label} — בקרוב</p>
    </div>
  );
}
