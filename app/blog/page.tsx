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
  const featured = posts[0];
  const rest = posts.slice(1);

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
        .blog-hero-tag  { animation: fadeDown 0.6s ease both; }
        .blog-hero-h1   { animation: fadeUp 0.65s 0.08s ease both; }
        .blog-hero-sub  { animation: fadeUp 0.65s 0.16s ease both; }
        .blog-cats      { animation: fadeUp 0.65s 0.24s ease both; }
        .blog-featured  { animation: fadeUp 0.7s 0.1s ease both; }
        .blog-banner    { animation: fadeUp 0.7s 0.18s ease both; }
        .blog-card-1    { animation: fadeUp 0.6s 0.1s ease both; }
        .blog-card-2    { animation: fadeUp 0.6s 0.2s ease both; }
        .blog-card-3    { animation: fadeUp 0.6s 0.3s ease both; }
        .blog-card-4    { animation: fadeUp 0.6s 0.15s ease both; }
        .blog-card-5    { animation: fadeUp 0.6s 0.25s ease both; }
        .blog-card-6    { animation: fadeUp 0.6s 0.35s ease both; }

        .blog-featured-wrap { cursor: pointer; }
        .blog-featured-wrap img { transition: transform 0.6s ease; }
        .blog-featured-wrap:hover img { transform: scale(1.04); }
        .blog-featured-arrow { transition: transform 0.2s; }
        .blog-featured-wrap:hover .blog-featured-arrow { transform: translateX(-5px); }

        .bcard { transition: transform 0.28s ease, box-shadow 0.28s ease, background 0.28s ease, border-color 0.28s ease; }
        .bcard:hover {
          transform: translateY(-5px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(196,133,122,0.15);
          background: rgba(196,133,122,0.07) !important;
          border-color: rgba(196,133,122,0.22) !important;
        }
        .bcard:hover .bcard-title { color: #d4a59c; }
        .bcard:hover .bcard-img img { transform: scale(1.07); }
        .bcard:hover .bcard-arrow { opacity: 1; transform: translateX(0); }
        .bcard-img img { transition: transform 0.5s ease; }
        .bcard-arrow { opacity: 0; transform: translateX(6px); transition: opacity 0.2s, transform 0.2s; }

        .cat-pill { transition: all 0.18s; }
        .cat-pill:hover { transform: translateY(-1px); opacity: 0.85; }

        .natalie-dot { animation: pulse-dot 2.2s infinite; }
      `}</style>

      {/* ── HERO ── */}
      <section style={{
        position: "relative",
        minHeight: 440,
        display: "flex",
        alignItems: "center",
        padding: "96px 24px 64px",
        overflow: "hidden",
      }}>
        {/* Background radials */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `
            radial-gradient(ellipse 70% 60% at 18% 50%, rgba(196,133,122,0.11) 0%, transparent 68%),
            radial-gradient(ellipse 50% 80% at 82% 30%, rgba(201,169,110,0.07) 0%, transparent 60%)
          `,
        }} />
        {/* Top shimmer line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(196,133,122,0.45), transparent)",
        }} />

        <div style={{ position: "relative", maxWidth: 780, margin: "0 auto", textAlign: "center", width: "100%" }}>
          {/* Tag */}
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

          {/* Title */}
          <h1 className="blog-hero-h1" style={{
            fontSize: "clamp(2.6rem, 6vw, 4.2rem)", fontWeight: 800,
            lineHeight: 1.1, marginBottom: 20,
            background: "linear-gradient(135deg, #FFF8F5 30%, #d4a59c)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            הבלוג של נטלי
          </h1>

          {/* Subtitle */}
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
            }} className="cat-pill">
              הכל
            </Link>
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
                }} className="cat-pill">
                  {c}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px 100px" }}>

        {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,248,245,0.2)" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>✍️</div>
            <p style={{ fontSize: "1.1rem" }}>מאמרים בדרך...</p>
          </div>
        ) : (
          <>
            {/* ── FEATURED ── */}
            {featured && (
              <Link href={`/blog/${featured.slug}`} style={{ textDecoration: "none", display: "block" }}>
                <div className="blog-featured blog-featured-wrap" style={{
                  position: "relative", borderRadius: 28, overflow: "hidden",
                  aspectRatio: "16/7", marginBottom: 44,
                }}>
                  {featured.cover_image ? (
                    <img src={featured.cover_image} alt={featured.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  ) : (
                    <div style={{
                      width: "100%", height: "100%",
                      background: "linear-gradient(135deg, #1a0e0e 0%, #2a1818 100%)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "5rem", opacity: 0.15,
                    }}>💄</div>
                  )}
                  {/* Overlay */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to top, rgba(8,6,8,0.96) 0%, rgba(8,6,8,0.55) 45%, rgba(8,6,8,0.08) 100%)",
                  }} />
                  {/* Content */}
                  <div style={{ position: "absolute", bottom: 0, right: 0, left: 0, padding: "40px 44px" }}>
                    {/* Badge */}
                    <div style={{
                      display: "inline-block", marginBottom: 14,
                      fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase",
                      color: "#C4857A", border: "1px solid rgba(196,133,122,0.4)",
                      padding: "4px 14px", borderRadius: 100, background: "rgba(196,133,122,0.08)",
                    }}>
                      ✦ {featured.category}
                    </div>
                    <h2 style={{
                      fontSize: "clamp(1.4rem,3vw,2.2rem)", fontWeight: 700,
                      lineHeight: 1.25, marginBottom: 14, maxWidth: 680, color: "#FFF8F5",
                    }}>
                      {featured.title}
                    </h2>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 14,
                      fontSize: "0.78rem", color: "rgba(255,248,245,0.42)",
                    }}>
                      <span>נטלי ארצי</span>
                      <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#C4857A", display: "inline-block" }} />
                      <span>{formatDate(featured.published_at)}</span>
                      <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#C4857A", display: "inline-block" }} />
                      <span>{readingTime(featured.content)} דק׳ קריאה</span>
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="blog-featured-arrow" style={{
                    position: "absolute", left: 44, bottom: 44,
                    width: 44, height: 44, borderRadius: "50%",
                    background: "#C4857A", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.1rem", color: "#fff",
                  }}>←</div>
                </div>
              </Link>
            )}

            {/* ── NATALIE QUOTE BANNER ── */}
            <div className="blog-banner" style={{
              marginBottom: 44,
              borderRadius: 24,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(196,133,122,0.14)",
              padding: "36px 48px",
              display: "flex", alignItems: "center", gap: 32,
              position: "relative", overflow: "hidden",
            }}>
              {/* Big quote mark */}
              <div style={{
                position: "absolute", left: 24, top: -16,
                fontSize: "9rem", lineHeight: 1, fontFamily: "Georgia, serif",
                color: "rgba(196,133,122,0.06)", pointerEvents: "none", userSelect: "none",
              }}>"</div>
              {/* Avatar placeholder */}
              <div style={{
                width: 70, height: 70, borderRadius: "50%", flexShrink: 0,
                background: "rgba(196,133,122,0.12)",
                border: "2px solid rgba(196,133,122,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.8rem",
              }}>✨</div>
              <div style={{ position: "relative" }}>
                <p style={{
                  fontSize: "1.08rem", lineHeight: 1.72, fontWeight: 300, fontStyle: "italic",
                  color: "rgba(255,248,245,0.72)", marginBottom: 12,
                }}>
                  כל מאמר כאן הוא דבר שרציתי שמישהו יגיד לי בתחילת הדרך. אני כותבת כדי שתגיעו רחוק יותר, מהר יותר.
                </p>
                <div style={{
                  fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase",
                  color: "#C4857A", fontWeight: 600,
                }}>
                  — נטלי ארצי, מאפרת מקצועית
                </div>
              </div>
            </div>

            {/* ── GRID ── */}
            {rest.length > 0 && (
              <>
                <div style={{
                  fontSize: "0.62rem", letterSpacing: "0.25em", textTransform: "uppercase",
                  color: "rgba(255,248,245,0.22)", marginBottom: 24,
                  display: "flex", alignItems: "center", gap: 16,
                }}>
                  <span>עוד מאמרים</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: 20,
                }}>
                  {rest.map((post, i) => {
                    const s = catStyle(post.category);
                    return (
                      <Link key={post.id} href={`/blog/${post.slug}`}
                        style={{ textDecoration: "none" }}
                        className={`blog-card-${(i % 3) + 1}`}
                      >
                        <article className="bcard" style={{
                          borderRadius: 20,
                          background: "rgba(255,255,255,0.028)",
                          border: "1px solid rgba(255,255,255,0.055)",
                          overflow: "hidden",
                          display: "flex", flexDirection: "column",
                          height: "100%",
                        }}>
                          {/* Image */}
                          <div className="bcard-img" style={{ aspectRatio: "4/3", overflow: "hidden" }}>
                            {post.cover_image ? (
                              <img src={post.cover_image} alt={post.title}
                                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                            ) : (
                              <div style={{
                                width: "100%", height: "100%",
                                background: "linear-gradient(135deg, rgba(196,133,122,0.07), rgba(8,6,8,0.3))",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "2.8rem", opacity: 0.35,
                              }}>💄</div>
                            )}
                          </div>

                          {/* Body */}
                          <div style={{ padding: "22px", flex: 1, display: "flex", flexDirection: "column" }}>
                            {/* Meta */}
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                              <span style={{
                                fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase",
                                padding: "3px 10px", borderRadius: 100, fontWeight: 600,
                                background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                              }}>{post.category}</span>
                              <span style={{ fontSize: "0.72rem", color: "rgba(255,248,245,0.26)" }}>
                                {formatDate(post.published_at)}
                              </span>
                            </div>

                            {/* Title */}
                            <h3 className="bcard-title" style={{
                              fontSize: "1rem", fontWeight: 700, lineHeight: 1.45,
                              color: "#FFF8F5", marginBottom: 10,
                              transition: "color 0.2s",
                            }}>
                              {post.title}
                            </h3>

                            {/* Excerpt */}
                            {post.excerpt && (
                              <p style={{
                                fontSize: "0.82rem", lineHeight: 1.65,
                                color: "rgba(255,248,245,0.34)", flex: 1,
                                display: "-webkit-box", WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical", overflow: "hidden",
                              }}>{post.excerpt}</p>
                            )}

                            {/* Footer */}
                            <div style={{
                              marginTop: 18, paddingTop: 14,
                              borderTop: "1px solid rgba(255,255,255,0.05)",
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                            }}>
                              <span style={{ fontSize: "0.72rem", color: "rgba(255,248,245,0.24)" }}>
                                {readingTime(post.content)} דק׳ קריאה
                              </span>
                              <span className="bcard-arrow" style={{ fontSize: "0.8rem", color: "#C4857A" }}>
                                ← קראי
                              </span>
                            </div>
                          </div>
                        </article>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
