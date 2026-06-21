import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import sanitizeHtml from "sanitize-html";
import { createClient } from "@/lib/supabase/server";
import { ReadingProgress } from "@/components/blog/ReadingProgress";

export const revalidate = 60;

// ─── Category colors ─────────────────────────────────────────────
const CAT_STYLE: Record<string, { color: string; border: string; bg: string }> = {
  "כללי":           { color: "#C4857A", border: "rgba(196,133,122,0.3)", bg: "rgba(196,133,122,0.1)" },
  "טכניקות איפור":  { color: "#C4857A", border: "rgba(196,133,122,0.3)", bg: "rgba(196,133,122,0.1)" },
  "בחירת מוצרים":   { color: "#c9a96e", border: "rgba(201,169,110,0.3)", bg: "rgba(201,169,110,0.1)" },
  "קריירה":         { color: "#7eb8e8", border: "rgba(100,150,200,0.3)", bg: "rgba(100,150,200,0.1)" },
  "השראה":          { color: "#c89ad4", border: "rgba(180,120,200,0.3)", bg: "rgba(180,120,200,0.1)" },
  "שאלות ותשובות":  { color: "#7ed49a", border: "rgba(100,190,120,0.3)", bg: "rgba(100,190,120,0.1)" },
};
function catStyle(cat: string) {
  return CAT_STYLE[cat] ?? CAT_STYLE["כללי"];
}

// ─── Sanitize ────────────────────────────────────────────────────
const ALLOWED_TAGS = [
  "h1","h2","h3","h4","h5","h6","p","br","strong","em","u","s",
  "ul","ol","li","blockquote","a","img","figure","figcaption",
  "table","thead","tbody","tr","th","td","hr","code","pre","span","div",
];

function sanitize(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
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

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
}

function readingTime(content: string) {
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

// ─── Data ────────────────────────────────────────────────────────
async function getPost(slug: string) {
  try {
    const sb = createClient();
    const { data } = await sb
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return {};
  return {
    title: `${post.title} — הבית של המאפרים`,
    description: post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      images: post.cover_image ? [{ url: post.cover_image }] : [],
    },
  };
}

// ─── Page ────────────────────────────────────────────────────────
export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const mins = readingTime(post.content);
  const s = catStyle(post.category);
  const heroImg = post.cover_image || (post.content.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? null);

  return (
    <main style={{ background: "#080608", minHeight: "100vh", color: "#FFF8F5", direction: "rtl" }}>

      {/* Reading progress */}
      <ReadingProgress />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .post-animate-1 { animation: fadeUp 0.6s 0.05s ease both; }
        .post-animate-2 { animation: fadeUp 0.6s 0.12s ease both; }
        .post-animate-3 { animation: fadeUp 0.6s 0.2s ease both; }

        /* Post content typography */
        .post-body { font-size: 1.05rem; line-height: 1.88; color: rgba(255,248,245,0.72); }
        .post-body p  { margin-bottom: 1.5em; }
        .post-body h2 { font-size: 1.55rem; font-weight: 700; color: #FFF8F5; margin: 2em 0 0.6em; }
        .post-body h3 { font-size: 1.25rem; font-weight: 700; color: #FFF8F5; margin: 1.6em 0 0.5em; }
        .post-body h1 { font-size: 1.9rem;  font-weight: 800; color: #FFF8F5; margin: 1.8em 0 0.5em; }
        .post-body ul { list-style: disc;    padding-right: 1.6em; margin-bottom: 1.2em; }
        .post-body ol { list-style: decimal; padding-right: 1.6em; margin-bottom: 1.2em; }
        .post-body li { margin-bottom: 0.4em; }
        .post-body a  { color: #C4857A; text-decoration: underline; text-underline-offset: 3px; }
        .post-body hr { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 2em 0; }
        .post-body img {
          max-width: 100%; border-radius: 14px; margin: 1em 0;
        }
        .post-body img[data-align="center"] { display: block; margin: 1em auto; }
        .post-body img[data-align="left"]   { display: block; margin-left: 0; }
        .post-body img[data-align="right"]  { display: block; margin-right: 0; }
        .post-body blockquote {
          margin: 1.8em 0;
          padding: 20px 24px 20px 0;
          border-right: 3px solid #C4857A;
          background: rgba(196,133,122,0.055);
          border-radius: 0 14px 14px 0;
          font-style: italic;
          color: rgba(255,248,245,0.65);
          font-size: 1.08rem;
          line-height: 1.72;
        }
        .post-body code {
          background: rgba(255,255,255,0.06);
          border-radius: 5px;
          padding: 2px 7px;
          font-size: 0.9em;
          font-family: 'Courier New', monospace;
          color: #c9a96e;
        }

        /* Drop cap on first paragraph */
        .post-body > p:first-of-type::first-letter {
          font-size: 3.8em;
          font-weight: 800;
          color: #C4857A;
          float: right;
          line-height: 0.76;
          margin-left: 10px;
          margin-top: 6px;
        }
      `}</style>

      {/* ── HERO IMAGE (cover_image or first image from content) ── */}
      {heroImg ? (
        <div style={{ height: 400, position: "relative", overflow: "hidden" }}>
          <img
            src={heroImg}
            alt={post.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(8,6,8,0.15) 0%, rgba(8,6,8,0.75) 75%, #080608 100%)",
          }} />
        </div>
      ) : (
        <div style={{
          height: 200,
          background: "linear-gradient(180deg, rgba(196,133,122,0.06) 0%, #080608 100%)",
          borderBottom: "1px solid rgba(196,133,122,0.08)",
        }} />
      )}

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 740, margin: "0 auto", padding: "0 24px 100px" }}>

        {/* Breadcrumb */}
        <div className="post-animate-1" style={{
          padding: "24px 0 20px",
          fontSize: "0.78rem",
          color: "rgba(255,248,245,0.28)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <Link href="/blog" style={{
            color: "#C4857A", textDecoration: "none",
            transition: "opacity 0.15s",
          }}>
            ← הבלוג
          </Link>
          <span>·</span>
          <span>{post.category}</span>
        </div>

        {/* Meta row */}
        <div className="post-animate-2" style={{
          display: "flex", alignItems: "center", gap: 12,
          flexWrap: "wrap", marginBottom: 20,
        }}>
          <span style={{
            fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase",
            padding: "4px 12px", borderRadius: 100, fontWeight: 600,
            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
          }}>
            {post.category}
          </span>
          {post.published_at && (
            <span style={{ fontSize: "0.75rem", color: "rgba(255,248,245,0.3)" }}>
              {formatDate(post.published_at)}
            </span>
          )}
          <span style={{ fontSize: "0.75rem", color: "rgba(255,248,245,0.3)" }}>·</span>
          <span style={{ fontSize: "0.75rem", color: "rgba(255,248,245,0.3)" }}>
            {mins} דק׳ קריאה
          </span>
        </div>

        {/* Title */}
        <h1 className="post-animate-2" style={{
          fontSize: "clamp(1.8rem, 4vw, 2.7rem)", fontWeight: 800,
          lineHeight: 1.2, marginBottom: 20, color: "#FFF8F5",
        }}>
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="post-animate-3" style={{
            fontSize: "1.12rem", color: "rgba(255,248,245,0.44)",
            lineHeight: 1.75, marginBottom: 36,
            paddingBottom: 36, borderBottom: "1px solid rgba(255,255,255,0.06)",
            fontWeight: 300,
          }}>
            {post.excerpt}
          </p>
        )}

        {/* ── ARTICLE BODY ── */}
        <div
          className="post-body post-animate-3"
          dir="rtl"
          dangerouslySetInnerHTML={{ __html: sanitize(post.content) }}
        />

        {/* ── AUTHOR CARD ── */}
        <div style={{
          marginTop: 64, padding: "32px",
          borderRadius: 22,
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.06)",
          display: "flex", gap: 24, alignItems: "center",
        }}>
          <div style={{
            width: 66, height: 66, borderRadius: "50%", flexShrink: 0,
            background: "rgba(196,133,122,0.12)",
            border: "2px solid rgba(196,133,122,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.7rem",
          }}>✨</div>
          <div>
            <div style={{
              fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase",
              color: "#C4857A", fontWeight: 600, marginBottom: 6,
            }}>
              נטלי ארצי · מאפרת מקצועית
            </div>
            <div style={{
              fontSize: "0.85rem", color: "rgba(255,248,245,0.38)", lineHeight: 1.65,
            }}>
              מאפרת עם שנים של ניסיון בכלות, סטים ואירועים. מלמדת איפור מקצועי ורוצה שכל תלמידה תגיע רחוק יותר, מהר יותר.
            </div>
          </div>
        </div>

        {/* ── FOOTER NAV ── */}
        <div style={{
          marginTop: 48, paddingTop: 28,
          borderTop: "1px solid rgba(255,255,255,0.055)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Link href="/blog" style={{
            fontSize: "0.85rem", color: "#C4857A",
            textDecoration: "none", fontWeight: 500,
            transition: "opacity 0.15s",
          }}>
            ← עוד מאמרים
          </Link>
          <Link href="/" style={{
            fontSize: "0.82rem", color: "rgba(255,248,245,0.28)",
            textDecoration: "none", transition: "color 0.15s",
          }}>
            לאקדמיה של נטלי →
          </Link>
        </div>
      </div>
    </main>
  );
}
