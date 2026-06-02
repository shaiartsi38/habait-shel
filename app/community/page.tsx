"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pin, Trash2, Reply, Paperclip, Send, X, Loader2, ImageIcon, FileText, AlertCircle, Megaphone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  type CommunityPost,
  dbFetchPosts, dbCreatePost, dbDeletePost, dbTogglePin,
  dbUploadAttachment, subscribeToPosts,
} from "@/lib/supabase/community-db";

// ─── Helpers ──────────────────────────────────────────────────────

function safeUrl(url: string | null): string {
  if (!url) return "#";
  try {
    const p = new URL(url);
    return p.protocol === "https:" || p.protocol === "http:" ? p.toString() : "#";
  } catch {
    return "#";
  }
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "עכשיו";
  if (diff < 3600) return `לפני ${Math.floor(diff / 60)} דק׳`;
  if (diff < 86400) return `לפני ${Math.floor(diff / 3600)} שעות`;
  return `לפני ${Math.floor(diff / 86400)} ימים`;
}

function Avatar({ name, photo, initials, size = 36, isAdmin }: {
  name: string; photo?: string | null; initials?: string;
  size?: number; isAdmin?: boolean;
}) {
  return (
    <div
      className="rounded-full overflow-hidden shrink-0 flex items-center justify-center font-black"
      style={{
        width: size, height: size,
        background: photo ? undefined : isAdmin ? "linear-gradient(135deg,#C4857A,#D4998E)" : "#140e12",
        border: isAdmin ? "2px solid rgba(196,133,122,0.5)" : "1.5px solid rgba(196,133,122,0.15)",
        fontSize: size * 0.35,
        color: isAdmin ? "#080608" : "#C4857A",
      }}
    >
      {photo
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={photo} alt={name} className="w-full h-full object-cover" />
        : <span>{initials ?? "?"}</span>
      }
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────

export default function CommunityPage() {
  const [posts, setPosts]         = useState<CommunityPost[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [userId, setUserId]       = useState<string | null>(null);
  const [isAdmin, setIsAdmin]     = useState(false);
  const [replyTo, setReplyTo]     = useState<CommunityPost | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadPosts = useCallback(async () => {
    try {
      const data = await dbFetchPosts();
      setPosts(data);
    } catch {
      setError("שגיאה בטעינת הודעות");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Get current user
    createClient().auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
    createClient().from("profiles").select("role").then(({ data }) => {
      if (data?.[0]?.role === "admin") setIsAdmin(true);
    });
    loadPosts();
    // Realtime subscription
    const unsubscribe = subscribeToPosts(loadPosts);
    return unsubscribe;
  }, [loadPosts]);

  // Scroll to bottom when new posts arrive
  useEffect(() => {
    if (!loading) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [posts.length, loading]);

  // Separate pinned from rest, nest replies
  const pinned  = posts.filter((p) => p.is_pinned && !p.parent_id);
  const topLevel = posts.filter((p) => !p.is_pinned && !p.parent_id);
  const getReplies = (id: string) => posts.filter((p) => p.parent_id === id);

  const handleDelete = async (id: string) => {
    try { await dbDeletePost(id); await loadPosts(); } catch { /* ignore */ }
  };
  const handlePin = async (id: string, current: boolean) => {
    try { await dbTogglePin(id, !current); await loadPosts(); } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen sidebar-safe flex flex-col" style={{ background: "var(--black)" }}>
      {/* Header */}
      <div className="px-4 md:px-10 pt-10 pb-4">
        <p className="text-[0.58rem] tracking-[0.3em] uppercase mb-1" style={{ color: "#C4857A" }}>קהילה</p>
        <h1 className="text-2xl font-black" style={{ color: "#FFF8F5" }}>הבית שלנו</h1>
        <p className="text-sm mt-1" style={{ color: "#5A3830" }}>שאלי, שתפי, ותתעוררי — יחד אנחנו צומחות</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 md:mx-10 flex items-center gap-2 px-4 py-3 rounded-xl text-[0.72rem] mb-2"
          style={{ background: "rgba(196,50,50,0.08)", color: "#e05555", border: "1px solid rgba(196,50,50,0.2)" }}>
          <AlertCircle size={13} /> {error}
        </div>
      )}

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-4 md:px-10 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={20} className="animate-spin" style={{ color: "#C4857A" }} />
          </div>
        ) : (
          <div className="space-y-1 max-w-2xl">
            {/* Pinned */}
            {pinned.map((post) => (
              <PostBubble
                key={post.id} post={post} replies={getReplies(post.id)}
                userId={userId} isAdmin={isAdmin}
                onReply={() => setReplyTo(post)}
                onDelete={handleDelete} onPin={handlePin}
              />
            ))}
            {pinned.length > 0 && (
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px" style={{ background: "rgba(196,133,122,0.1)" }} />
                <span className="text-[0.54rem] tracking-wider" style={{ color: "rgba(196,133,122,0.35)" }}>הודעות</span>
                <div className="flex-1 h-px" style={{ background: "rgba(196,133,122,0.1)" }} />
              </div>
            )}
            {/* Regular */}
            {topLevel.length === 0 && pinned.length === 0 && (
              <div className="text-center py-16">
                <p className="text-sm font-bold mb-1" style={{ color: "rgba(255,248,245,0.2)" }}>עדיין אין הודעות</p>
                <p className="text-[0.65rem]" style={{ color: "#3A2020" }}>היי ראשונה לכתוב!</p>
              </div>
            )}
            {topLevel.map((post) => (
              <PostBubble
                key={post.id} post={post} replies={getReplies(post.id)}
                userId={userId} isAdmin={isAdmin}
                onReply={() => setReplyTo(post)}
                onDelete={handleDelete} onPin={handlePin}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 md:px-10 pb-6 pt-2 max-w-2xl w-full">
        <MessageInput
          replyTo={replyTo}
          isAdmin={isAdmin}
          onCancelReply={() => setReplyTo(null)}
          onSent={loadPosts}
        />
      </div>
    </div>
  );
}

// ─── Post Bubble ──────────────────────────────────────────────────

function PostBubble({ post, replies, userId, isAdmin, onReply, onDelete, onPin }: {
  post: CommunityPost;
  replies: CommunityPost[];
  userId: string | null;
  isAdmin: boolean;
  onReply: () => void;
  onDelete: (id: string) => void;
  onPin: (id: string, current: boolean) => void;
}) {
  const isOwn = post.user_id === userId;
  const canDelete = isOwn || isAdmin;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Admin announcement style */}
      {post.is_admin_post ? (
        <div
          className="rounded-2xl p-6 mb-4"
          style={{
            background: "linear-gradient(135deg, rgba(196,133,122,0.13), rgba(196,133,122,0.06))",
            border: "1.5px solid rgba(196,133,122,0.35)",
            boxShadow: "0 4px 24px rgba(196,133,122,0.1)",
          }}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(196,133,122,0.15)", border: "1px solid rgba(196,133,122,0.3)" }}>
              <Megaphone size={15} style={{ color: "#C4857A" }} />
            </div>
            <div>
              <span className="text-[0.65rem] font-black tracking-widest uppercase block" style={{ color: "#C4857A" }}>הודעת מנהלת</span>
              <span className="text-[0.55rem]" style={{ color: "#3A2020" }}>{timeAgo(post.created_at)}</span>
            </div>
            {post.is_pinned && (
              <div className="mr-auto flex items-center gap-1 text-[0.58rem] font-semibold" style={{ color: "#C4857A" }}>
                <Pin size={11} /> נעוץ
              </div>
            )}
          </div>
          <p className="text-base leading-relaxed font-medium" style={{ color: "#FFF8F5" }}>{post.content}</p>
          {isAdmin && (
            <div className="flex gap-4 mt-4 pt-3" style={{ borderTop: "1px solid rgba(196,133,122,0.12)" }}>
              <button onClick={() => onPin(post.id, post.is_pinned)} className="text-[0.65rem] font-semibold hover:opacity-70 transition-opacity flex items-center gap-1" style={{ color: "#C4857A" }}>
                <Pin size={11} /> {post.is_pinned ? "בטל נעיצה" : "נעוץ"}
              </button>
              <button onClick={() => onDelete(post.id)} className="text-[0.65rem] font-semibold hover:opacity-70 transition-opacity" style={{ color: "rgba(196,50,50,0.6)" }}>
                מחק
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Regular post — pinned gets highlighted */
        <div
          className={`flex gap-3 py-3 px-3 rounded-2xl group transition-colors ${post.is_pinned ? "mb-2" : ""}`}
          style={post.is_pinned ? {
            background: "rgba(196,133,122,0.05)",
            border: "1px solid rgba(196,133,122,0.15)",
          } : {}}
        >
          <Avatar name={post.author_name ?? ""} photo={post.author_photo} initials={post.author_initials} size={post.is_pinned ? 40 : 36} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`font-black ${post.is_pinned ? "text-sm" : "text-[0.7rem]"}`} style={{ color: post.is_pinned ? "#C4857A" : "#FFF8F5" }}>
                {post.author_name}
              </span>
              {post.is_pinned && (
                <span className="flex items-center gap-1 text-[0.58rem] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(196,133,122,0.1)", color: "#C4857A", border: "1px solid rgba(196,133,122,0.2)" }}>
                  <Pin size={9} /> נעוץ
                </span>
              )}
              <span className="text-[0.58rem]" style={{ color: "#3A2020" }}>{timeAgo(post.created_at)}</span>
            </div>

            {/* Content */}
            <p className={`leading-relaxed break-words ${post.is_pinned ? "text-sm" : "text-[0.82rem]"}`} style={{ color: "rgba(255,248,245,0.85)" }}>
              {post.content}
            </p>

            {/* Attachment */}
            {post.attachment_url && (
              <div className="mt-2">
                {post.attachment_type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={safeUrl(post.attachment_url)} alt={post.attachment_name ?? "תמונה"}
                    className="max-w-[220px] rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => { const u = safeUrl(post.attachment_url); if (u !== "#") window.open(u, "_blank"); }}
                  />
                ) : (
                  <a href={safeUrl(post.attachment_url)} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.65rem] font-semibold hover:opacity-80 transition-opacity"
                    style={{ background: "rgba(196,133,122,0.08)", color: "#C4857A", border: "1px solid rgba(196,133,122,0.15)" }}>
                    <FileText size={11} /> {post.attachment_name ?? "קובץ"}
                  </a>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={onReply} className="flex items-center gap-1 text-[0.58rem] hover:opacity-70 transition-opacity" style={{ color: "#5A3830" }}>
                <Reply size={10} /> תגובה
              </button>
              {isAdmin && (
                <button onClick={() => onPin(post.id, post.is_pinned)} className="flex items-center gap-1 text-[0.58rem] hover:opacity-70 transition-opacity" style={{ color: "#5A3830" }}>
                  <Pin size={10} /> {post.is_pinned ? "בטל נעיצה" : "נעוץ"}
                </button>
              )}
              {canDelete && (
                <button onClick={() => onDelete(post.id)} className="flex items-center gap-1 text-[0.58rem] hover:opacity-70 transition-opacity" style={{ color: "rgba(196,50,50,0.4)" }}>
                  <Trash2 size={10} /> מחק
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Replies */}
      {replies.length > 0 && (
        <div className="mr-9 pr-3 border-r space-y-0" style={{ borderColor: "rgba(196,133,122,0.1)" }}>
          {replies.map((reply) => (
            <div key={reply.id} className="flex gap-2.5 py-2 group">
              <Avatar name={reply.author_name ?? ""} photo={reply.author_photo} initials={reply.author_initials} size={28} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-[0.62rem] font-black" style={{ color: "#FFF8F5" }}>{reply.author_name}</span>
                  <span className="text-[0.54rem]" style={{ color: "#3A2020" }}>{timeAgo(reply.created_at)}</span>
                </div>
                <p className="text-[0.75rem] leading-relaxed break-words" style={{ color: "rgba(255,248,245,0.75)" }}>
                  {reply.content}
                </p>
                {reply.attachment_url && reply.attachment_type === "image" && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={safeUrl(reply.attachment_url)} alt="" className="mt-1.5 max-w-[160px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => { const u = safeUrl(reply.attachment_url); if (u !== "#") window.open(u, "_blank"); }} />
                )}
                {(reply.user_id === null || isAdmin) && (
                  <button onClick={() => onDelete(reply.id)} className="text-[0.54rem] mt-0.5 opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity" style={{ color: "#e05555" }}>
                    מחק
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Message Input ────────────────────────────────────────────────

function MessageInput({ replyTo, isAdmin, onCancelReply, onSent }: {
  replyTo: CommunityPost | null;
  isAdmin: boolean;
  onCancelReply: () => void;
  onSent: () => void;
}) {
  const [text, setText]             = useState("");
  const [sending, setSending]       = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [attachment, setAttachment] = useState<{
    url: string; type: CommunityPost["attachment_type"]; name: string;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { alert("קובץ גדול מדי — מקסימום 20MB"); return; }
    e.target.value = "";
    setUploading(true);
    try {
      const result = await dbUploadAttachment(file);
      setAttachment(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : (e as { message?: string })?.message ?? JSON.stringify(e);
      alert(`שגיאה בהעלאת הקובץ: ${msg}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async () => {
    if (!text.trim() && !attachment) return;
    setSending(true);
    try {
      await dbCreatePost(
        text.trim(),
        replyTo?.id ?? null,
        attachment?.url ?? null,
        attachment?.type ?? null,
        attachment?.name ?? null
      );
      setText("");
      setAttachment(null);
      setIsAnnouncement(false);
      onCancelReply();
      onSent();
      textRef.current?.focus();
    } catch (e) {
      alert(e instanceof Error ? e.message : "שגיאה בשליחה");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#140e12", border: "1px solid rgba(196,133,122,0.12)" }}>
      {/* Reply banner */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center justify-between px-4 py-2"
            style={{ background: "rgba(196,133,122,0.06)", borderBottom: "1px solid rgba(196,133,122,0.1)" }}
          >
            <span className="text-[0.62rem]" style={{ color: "rgba(196,133,122,0.7)" }}>
              <Reply size={10} className="inline ml-1" />
              תגובה ל-{replyTo.author_name}
            </span>
            <button onClick={onCancelReply} className="p-0.5 hover:opacity-70">
              <X size={12} style={{ color: "#5A3830" }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin announcement toggle */}
      {isAdmin && !replyTo && (
        <div className="px-4 pt-2 flex items-center gap-2">
          <button
            onClick={() => setIsAnnouncement((v) => !v)}
            className="flex items-center gap-1.5 text-[0.58rem] font-semibold px-2.5 py-1 rounded-lg transition-all"
            style={isAnnouncement
              ? { background: "rgba(196,133,122,0.15)", color: "#C4857A", border: "1px solid rgba(196,133,122,0.3)" }
              : { color: "#5A3830", border: "1px solid rgba(196,133,122,0.1)" }
            }
          >
            <Megaphone size={10} />
            {isAnnouncement ? "הודעת מנהלת" : "הודעה רגילה"}
          </button>
        </div>
      )}

      {/* Attachment preview */}
      {attachment && (
        <div className="px-4 pt-2 flex items-center gap-2">
          {attachment.type === "image"
            ? <ImageIcon size={12} style={{ color: "#C4857A" }} />
            : <FileText size={12} style={{ color: "#C4857A" }} />
          }
          <span className="text-[0.6rem] flex-1 truncate" style={{ color: "#C4857A" }}>{attachment.name}</span>
          <button onClick={() => setAttachment(null)} className="hover:opacity-70">
            <X size={12} style={{ color: "#5A3830" }} />
          </button>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 px-3 py-2.5">
        <textarea
          ref={textRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={replyTo ? `תגובה ל-${replyTo.author_name}...` : isAnnouncement ? "כתבי הודעת מנהלת..." : "כתבי הודעה... (Enter לשליחה, Shift+Enter לשורה חדשה)"}
          rows={1}
          className="flex-1 bg-transparent text-sm outline-none resize-none leading-relaxed"
          style={{ color: "#FFF8F5", caretColor: "#C4857A", maxHeight: 120, overflowY: "auto" }}
        />

        {/* File button */}
        <input ref={fileRef} type="file" className="hidden" onChange={handleFile}
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip" />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-40 shrink-0"
        >
          {uploading
            ? <Loader2 size={16} className="animate-spin" style={{ color: "#C4857A" }} />
            : <Paperclip size={16} style={{ color: "#5A3830" }} />
          }
        </button>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={sending || (!text.trim() && !attachment)}
          className="p-2 rounded-xl transition-all hover:opacity-90 active:scale-95 disabled:opacity-30 shrink-0"
          style={{ background: "linear-gradient(135deg,#C4857A,#D4998E)" }}
        >
          {sending
            ? <Loader2 size={14} className="animate-spin" style={{ color: "#080608" }} />
            : <Send size={14} style={{ color: "#080608" }} />
          }
        </button>
      </div>
    </div>
  );
}
