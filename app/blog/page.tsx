import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "הבלוג של נטלי — הבית של המאפרים",
  description: "טיפים, טכניקות ותובנות מעולם האיפור המקצועי — ישירות מהניסיון של נטלי ארצי",
};

export const revalidate = 60;

// ─── Category colors ──────────────────────────────────────────────
const CAT_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  "כללי":           { bg: "rgba(196,133,122,0.12)", color: "#C4857A",  border: "rgba(196,133,122,0.25)" },
  "טכניקות איפור":  { bg: "rgba(196,133,122,0.12)", color: "#C4857A",  border: "rgba(196,133,122,0.25)" },
  "בחירת מוצרים":   { bg: "rgba(201,169,110,0.12)", color: "#c9a96e",  border: "rgba(201,169,110,0.25)" },
  "קריירה":         { bg: "rgba(100,150,200,0.12)", color: "#7eb8e8",  border: "rgba(100,150,200,0.25)" },
  "השראה":          { bg: "rgba(180,120,200,0.12)", color: "#c89ad4",  border: "rgba(180,120,200,0.25)" },
  "שאלות ותשובות":  { bg: "rgba(100,190,120,0.12)", color: "#7ed49a",  border: "rgba(100,190,120,0.25)" },
};
function catStyle(cat: string) {
  return CAT_STYLE[cat] ?? CAT_STYLE["כללי"];
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
}

function readingTime(content: string) {
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

async function getPosts(category?: string) {
  try {
    const sb = createClient();
    let q = sb
      .from("blog_posts")
      .select("id, title, slug, excerpt, cover_image, category, published_at, content")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (category) q = q.eq("category", category);
    const { data } = await q;
    return data ?? [];
  } catch {
    return [];
  }
}

const ALL_CATS = ["טכניקות איפור", "בחירת מוצרים", "קריירה", "השראה", "שאלות ותשובות"];

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { cat?: string };
}) {
  const activeCat = searchParams.cat;
  const posts = await getPosts(activeCat);

  return (
    <main style={{ background: "#080608", minHeight: "100vh", color: "#FFF8F5", direction: "rtl" }}>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%,100% { opacity:1; } 50% { opacity:0.3; }
        }
        .blog-hero-tag { animation: fadeDown 0.6s ease both; }
        .blog-hero-h1  { animation: fadeUp 0.65s 0.08s ease both; }
        .blog-hero-sub { animation: fadeUp 0.65s 0.16s ease both; }
        .blog-cats     { animation: fadeUp 0.65s 0.24s ease both; }
        .blog-grid     { animation: fadeUp 0.7s 0.1s ease both; }

        .bcard {
          transition: transform 0.26s ease, box-shadow 0.26s ease,
                      background 0.26s ease, border-color 0.26s ease;
        }
        .bcard:hover {
          transform: translateY(-6px);
          box-shadow: 0 28px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(196,133,122,0.18);
          background: rgba(196,133,122,0.07) !important;
          border-color: rgba(196,133,122,0.25) !important;
        }
        .bcard:hover .bcard-title  { color: #d4a59c; }
        .bcard:hover .bcard-img img{ transform: scale(1.06); }
        .bcard:hover .bcard-cta    { color: #C4857A; letter-spacing: 0.02em; }
        .bcard-img img { transition: transform 0.5s ease; }
        .bcard-cta     { transition: color 0.2s, letter-spacing 0.2s; }

        .cat-pill { transition: all 0.18s; }
        .cat-pill:hover { transform: translateY(-1px); opacity: 0.85; }

        .natalie-dot { animation: pulse-dot 2.2s infinite; }
      `}</style>

      {/* ── HERO ── */}
      <section style={{
        position: "relative",
        minHeight: 420,
        display: "flex",
        alignItems: "center",
        padding: "96px 24px 60px",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `
            radial-gradient(ellipse 70% 60% at 18% 50%, rgba(196,133,122,0.11) 0%, transparent 68%),
            radial-gradient(ellipse 50% 80% at 82% 30%, rgba(201,169,110,0.07) 0%, transparent 60%)
          `,
        }} />
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(196,133,122,0.45), transparent)",
        }} />

        <div style={{ position: "relative", maxWidth: 780, margin: "0 auto", textAlign: "center", width: "100%" }}>
          <div className="blog-hero-tag" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontSize: "0.62rem", letterSpacing: "0.28em", textTransform: "uppercase",
            color: "#C4857A", border: "1px solid rgba(196,133,122,0.3)",
            padding: "6px 18px", borderRadius: 100, marginBottom: 28,
            background: "rgba(196,133,122,0.06)",
          }}>
            <span className="natalie-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "#C4857A", display: "inline-block" }} />
            הידע של נטלי
            <span className="natalie-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "#C4857A", display: "inline-block" }} />
          </div>

          <h1 className="blog-hero-h1" style={{
            fontSize: "clamp(2.6rem, 6vw, 4.2rem)", fontWeight: 800,
            lineHeight: 1.1, marginBottom: 20,
            background: "linear-gradient(135deg, #FFF8F5 30%, #d4a59c)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            הבלוג של נטלי
          </h1>

          <p className="blog-hero-sub" style={{
            fontSize: "1.05rem", color: "rgba(255,248,245,0.45)",
            lineHeight: 1.75, maxWidth: 460, margin: "0 auto 40px", fontWeight: 300,
          }}>
            טיפים, טכניקות ותובנות מעולם האיפור המקצועי — ישירות מהניסיון שלי
          </p>

          {/* Category pills */}
          <div className="blog-cats" style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/blog" style={{
              padding: "6px 18px", borderRadius: 100, fontSize: "0.78rem", fontWeight: 500,
              textDecoration: "none",
              background: !activeCat ? "rgba(196,133,122,0.18)" : "rgba(255,255,255,0.04)",
              color: !activeCat ? "#C4857A" : "rgba(255,248,245,0.4)",
              border: `1px solid ${!activeCat ? "rgba(196,133,122,0.35)" : "rgba(255,255,255,0.08)"}`,
            }} className="cat-pill">הכל</Link>
            {ALL_CATS.map((c) => {
              const s = catStyle(c);
              const isActive = activeCat === c;
              return (
                <Link key={c} href={`/blog?cat=${encodeURIComponent(c)}`} style={{
                  padding: "6px 18px", borderRadius: 100, fontSize: "0.78rem", fontWeight: 500,
                  textDecoration: "none",
                  background: isActive ? s.bg : "rgba(255,255,255,0.04)",
                  color: isActive ? s.color : "rgba(255,248,245,0.4)",
                  border: `1px solid ${isActive ? s.border : "rgba(255,255,255,0.08)"}`,
                }} className="cat-pill">{c}</Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── GRID ── */}
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px 100px" }}>

        {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,248,245,0.2)" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>✍️</div>
            <p style={{ fontSize: "1.1rem" }}>מאמרים בדרך...</p>
          </div>
        ) : (
          <>
            {/* Divider label */}
            <div style={{
              fontSize: "0.62rem", letterSpacing: "0.25em", textTransform: "uppercase",
              color: "rgba(255,248,245,0.2)", marginBottom: 32,
              display: "flex", alignItems: "center", gap: 16,
            }}>
              <span>{posts.length} מאמרים</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
            </div>

            {/* 3-column grid — ALL posts equally */}
            <div className="blog-grid" style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 28,
            }}>
              {posts.map((post) => {
                const s = catStyle(post.category);
                return (
                  <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
                    <article className="bcard" style={{
                      borderRadius: 20,
                      background: "rgba(255,255,255,0.028)",
                      border: "1px solid rgba(255,255,255,0.055)",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}>

                      {/* ── Image ── */}
                      <div className="bcard-img" style={{ aspectRatio: "16/10", overflow: "hidden", flexShrink: 0 }}>
                        {post.cover_image ? (
                          <img
                            src={post.cover_image}
                            alt={post.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />
                        ) : (
                          <div style={{
                            width: "100%", height: "100%",
                            background: "linear-gradient(135deg, rgba(196,133,122,0.09) 0%, rgba(8,6,8,0.4) 100%)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "3rem", opacity: 0.3,
                          }}>💄</div>
                        )}
                      </div>

                      {/* ── Body ── */}
                      <div style={{ padding: "24px 24px 20px", flex: 1, display: "flex", flexDirection: "column" }}>

                        {/* Category badge */}
                        <div style={{ marginBottom: 14 }}>
                          <span style={{
                            fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase",
                            padding: "3px 10px", borderRadius: 100, fontWeight: 600,
                            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                          }}>{post.category}</span>
                        </div>

                        {/* Title — large and prominent */}
                        <h2 className="bcard-title" style={{
                          fontSize: "1.12rem",
                          fontWeight: 700,
                          lineHeight: 1.45,
                          color: "#FFF8F5",
                          marginBottom: 12,
                          transition: "color 0.2s",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}>
                          {post.title}
                        </h2>

                        {/* Excerpt — 3 lines */}
                        {post.excerpt && (
                          <p style={{
                            fontSize: "0.85rem",
                            lineHeight: 1.7,
                            color: "rgba(255,248,245,0.4)",
                            flex: 1,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            marginBottom: 20,
                          }}>
                            {post.excerpt}
                          </p>
                        )}

                        {/* Divider */}
                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.055)", paddingTop: 16, marginTop: "auto" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            {/* Read more */}
                            <span className="bcard-cta" style={{
                              fontSize: "0.82rem",
                              fontWeight: 600,
                              color: "rgba(196,133,122,0.75)",
                            }}>
                              המשך קריאה »»»
                            </span>
                            {/* Date */}
                            <span style={{
                              fontSize: "0.72rem",
                              color: "rgba(255,248,245,0.22)",
                            }}>
                              {formatDate(post.published_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                    </article>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
