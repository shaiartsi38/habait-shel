"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus, Edit2, Trash2, Eye, ArrowRight,
  Loader2, Save, X, Globe, FileText, Monitor, Upload, ImageIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  dbGetAllPosts, dbUpsertPost, dbDeletePost, dbUploadBlogImage,
  generateSlug, type BlogPost,
} from "@/lib/supabase/blog-db";
import { RichEditor } from "@/components/blog/RichEditor";
import sanitizeHtml from "sanitize-html";

const PREVIEW_ALLOWED_TAGS = [
  "h1","h2","h3","h4","h5","h6","p","br","strong","em","u","s",
  "ul","ol","li","blockquote","a","img","figure","figcaption",
  "table","thead","tbody","tr","th","td","hr","code","pre",
];
function sanitize(html: string) {
  return sanitizeHtml(html, {
    allowedTags: PREVIEW_ALLOWED_TAGS,
    allowedAttributes: {
      a:   ["href", "target", "rel"],
      img: ["src", "alt", "width", "height", "style", "data-align"],
      "*": ["class", "dir", "style", "data-align"],
    },
    allowedStyles: {
      "*": {
        "text-align":  [/.*/],
        "font-size":   [/.*/],
        "color":       [/.*/],
        "font-family": [/.*/],
        "width":       [/.*/],
      },
    },
  });
}

const CATEGORIES = ["כללי", "טכניקות איפור", "בחירת מוצרים", "קריירה", "השראה", "שאלות ותשובות"];

// ─── Preview Modal ────────────────────────────────────────────────
function PreviewModal({ form, onClose }: { form: Partial<BlogPost>; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div
        className="min-h-screen bg-[#FDF8F5] max-w-3xl mx-auto my-8 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Preview header bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Monitor size={15} />
            <span>תצוגה מקדימה</span>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">לא פורסם</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Cover image */}
        {form.cover_image && (
          <div className="w-full aspect-[16/6] overflow-hidden">
            <img src={form.cover_image} alt={form.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="px-8 py-10">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="text-xs bg-rose-100 text-rose-600 px-3 py-1 rounded-full font-medium">
              {form.category || "כללי"}
            </span>
            <span className="text-xs text-gray-400">היום</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight mb-4">
            {form.title || <span className="text-gray-300">ללא כותרת</span>}
          </h1>

          {/* Excerpt */}
          {form.excerpt && (
            <p className="text-lg text-gray-500 leading-relaxed mb-8 pb-8 border-b border-gray-200">
              {form.excerpt}
            </p>
          )}

          {/* Content — custom CSS instead of prose to prevent overriding inline styles */}
          <style>{`
            .preview-content { color: #374151; font-size: 16px; line-height: 1.8; }
            .preview-content h1 { font-size: 2em; font-weight: 700; margin: 0.75em 0 0.4em; color: #111; }
            .preview-content h2 { font-size: 1.5em; font-weight: 700; margin: 0.75em 0 0.4em; color: #111; }
            .preview-content h3 { font-size: 1.25em; font-weight: 700; margin: 0.75em 0 0.4em; color: #111; }
            .preview-content p  { margin: 0.6em 0; }
            .preview-content ul { list-style: disc; padding-right: 1.5em; margin: 0.5em 0; }
            .preview-content ol { list-style: decimal; padding-right: 1.5em; margin: 0.5em 0; }
            .preview-content blockquote { border-right: 3px solid #C4857A; padding-right: 1em; color: #6b7280; margin: 1em 0; }
            .preview-content a   { color: #C4857A; text-decoration: underline; }
            .preview-content img { max-width: 100%; border-radius: 8px; margin: 0.5em 0; }
            .preview-content img[data-align="center"] { display: block; margin: 0.5em auto; }
            .preview-content img[data-align="left"]   { display: block; margin-left: 0; }
            .preview-content img[data-align="right"]  { display: block; margin-right: 0; }
          `}</style>
          {form.content ? (
            <div
              className="preview-content max-w-none text-right"
              dir="rtl"
              dangerouslySetInnerHTML={{ __html: sanitize(form.content) }}
            />
          ) : (
            <p className="text-gray-300 italic text-center py-12">אין תוכן עדיין</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Empty form ───────────────────────────────────────────────────
const emptyForm = (): Partial<BlogPost> => ({
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image: "",
  category: "כללי",
  status: "draft",
});

export default function AdminBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [view, setView] = useState<"list" | "editor">("list");
  const [form, setForm] = useState<Partial<BlogPost>>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // ── Auth guard ─────────────────────────────────────────────────
  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/login"); return; }
      const { data: p } = await sb.from("profiles").select("role").eq("id", data.user.id).single();
      if (p?.role !== "admin") { router.push("/dashboard"); return; }
      loadPosts();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      setPosts(await dbGetAllPosts());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Form helpers ───────────────────────────────────────────────
  const openNew = () => { setForm(emptyForm()); setView("editor"); };
  const openEdit = (p: BlogPost) => { setForm({ ...p }); setView("editor"); };
  const cancelEdit = () => { setForm(emptyForm()); setView("list"); };

  const setField = <K extends keyof BlogPost>(k: K, v: BlogPost[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onTitleChange = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: f.id ? f.slug : generateSlug(title),
    }));
  };

  const save = async (status: "draft" | "published") => {
    if (!form.title?.trim()) { alert("נא להזין כותרת"); return; }
    setSaving(true);
    try {
      await dbUpsertPost({ ...form, title: form.title!, status });
      await loadPosts();
      setView("list");
    } catch (e) {
      console.error(e);
      alert("שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (id: string) => {
    try {
      await dbDeletePost(id);
      setPosts((p) => p.filter((x) => x.id !== id));
      setView("list");
      setForm(emptyForm());
    } catch {
      alert("שגיאה במחיקה");
    } finally {
      setDeleteConfirm(null);
    }
  };

  // ── Render: Editor ─────────────────────────────────────────────
  if (view === "editor") {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={cancelEdit} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
              <ArrowRight size={18} />
              <span>חזרה לרשימה</span>
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-800">
                {form.id ? "עריכת מאמר" : "מאמר חדש"}
              </h1>
              {form.id && (
                <button
                  onClick={() => setDeleteConfirm(form.id!)}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors"
                  title="מחק מאמר זה"
                >
                  <Trash2 size={13} />
                  מחיקה
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">כותרת *</label>
              <input
                value={form.title ?? ""}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="כותרת המאמר..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-rose-300 text-gray-900 bg-white"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (כתובת URL)</label>
              <input
                value={form.slug ?? ""}
                onChange={(e) => setField("slug", e.target.value)}
                dir="ltr"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-300 text-gray-900 bg-white"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תקציר (מופיע בכרטיסייה)</label>
              <textarea
                value={form.excerpt ?? ""}
                onChange={(e) => setField("excerpt", e.target.value)}
                rows={2}
                placeholder="תקציר קצר של המאמר..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none text-gray-900 bg-white"
              />
            </div>

            {/* Category + Cover image row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה</label>
                <select
                  value={form.category ?? "כללי"}
                  onChange={(e) => setField("category", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white text-gray-900"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תמונה ראשית</label>

                {/* Preview */}
                {form.cover_image && (
                  <div className="relative mb-2 rounded-xl overflow-hidden" style={{ aspectRatio: "16/7" }}>
                    <img src={form.cover_image} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setField("cover_image", "")}
                      className="absolute top-2 left-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Upload button + URL input */}
                <div className="flex gap-2">
                  <input
                    value={form.cover_image ?? ""}
                    onChange={(e) => setField("cover_image", e.target.value)}
                    placeholder="https://... או העלי קובץ ←"
                    dir="ltr"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 text-gray-900 bg-white"
                  />
                  <label className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors border ${
                    uploadingCover
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200"
                  }`}>
                    {uploadingCover
                      ? <Loader2 size={15} className="animate-spin" />
                      : <Upload size={15} />}
                    {uploadingCover ? "מעלה..." : "העלאה"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingCover}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingCover(true);
                        try {
                          const url = await dbUploadBlogImage(file);
                          setField("cover_image", url);
                        } catch {
                          alert("שגיאה בהעלאת התמונה");
                        } finally {
                          setUploadingCover(false);
                          e.target.value = "";
                        }
                      }}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                  <ImageIcon size={11} />
                  אם לא תעלי תמונה, תוצג אוטומטית התמונה הראשונה מהמאמר
                </p>
              </div>
            </div>

            {/* Rich editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תוכן המאמר</label>
              <RichEditor
                content={form.content ?? ""}
                onChange={(html) => setField("content", html)}
                onImageUpload={dbUploadBlogImage}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => save("published")}
                disabled={saving}
                className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
                פרסמי
              </button>
              <button
                onClick={() => save("draft")}
                disabled={saving}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-60"
              >
                <Save size={16} />
                שמרי כטיוטה
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-5 py-2.5 rounded-xl font-medium transition-colors border border-blue-200"
              >
                <Monitor size={16} />
                תצוגה מקדימה
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 px-4 py-2.5 rounded-xl transition-colors"
              >
                <X size={16} />
                ביטול
              </button>
            </div>
          </div>
        </div>

      {showPreview && <PreviewModal form={form} onClose={() => setShowPreview(false)} />}
    </div>
  );
}

  // ── Render: List ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600 transition-colors mb-1 block">
              ← חזרה לאדמין
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">ניהול בלוג</h1>
            <p className="text-gray-500 text-sm mt-0.5">{posts.length} מאמרים</p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
          >
            <Plus size={18} />
            מאמר חדש
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-rose-400" size={32} />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <FileText size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">אין עדיין מאמרים</p>
            <button onClick={openNew} className="mt-4 text-rose-500 hover:text-rose-600 font-medium">
              צרי מאמר ראשון
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                {/* Cover thumb */}
                {post.cover_image ? (
                  <img src={post.cover_image} alt="" className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 bg-rose-50 rounded-xl flex-shrink-0 flex items-center justify-center">
                    <FileText size={24} className="text-rose-300" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      post.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {post.status === "published" ? "פורסם" : "טיוטה"}
                    </span>
                    <span className="text-xs text-gray-400">{post.category}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 truncate">{post.title}</h3>
                  <p className="text-sm text-gray-400 truncate">{post.excerpt}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {post.status === "published" && (
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                      title="צפייה"
                    >
                      <Eye size={18} />
                    </Link>
                  )}
                  <button
                    onClick={() => openEdit(post)}
                    className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                    title="עריכה"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(post.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="מחיקה"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl text-center" dir="rtl">
            <Trash2 size={40} className="text-red-400 mx-auto mb-3" />
            <h3 className="font-bold text-gray-800 mb-2">למחוק את המאמר?</h3>
            <p className="text-gray-500 text-sm mb-5">פעולה זו לא ניתנת לביטול</p>
            <div className="flex gap-3">
              <button
                onClick={() => deletePost(deleteConfirm)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-medium transition-colors"
              >
                מחיקה
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-medium transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
