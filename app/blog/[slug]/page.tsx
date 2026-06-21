import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import sanitizeHtml from "sanitize-html";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, CalendarDays, Tag } from "lucide-react";

const ALLOWED_TAGS = [
  "h1","h2","h3","h4","h5","h6","p","br","strong","em","u","s",
  "ul","ol","li","blockquote","a","img","figure","figcaption",
  "table","thead","tbody","tr","th","td","hr","code","pre",
];

function sanitize(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height", "data-align"],
      "*": ["class", "dir", "style", "data-align"],
    },
    allowedStyles: {
      "*": {
        "text-align": [/.*/],
        "font-size": [/.*/],
        "color": [/.*/],
        "font-family": [/.*/],
        "width": [/.*/],
      },
    },
  });
}

export const revalidate = 60;

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

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  return (
    <main className="min-h-screen bg-[#FDF8F5]" dir="rtl">
      {/* Cover image */}
      {post.cover_image && (
        <div className="w-full aspect-[16/6] overflow-hidden">
          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Back */}
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-8">
          <ArrowRight size={15} />
          כל המאמרים
        </Link>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="flex items-center gap-1 text-xs bg-rose-100 text-rose-600 px-3 py-1 rounded-full font-medium">
            <Tag size={11} />
            {post.category}
          </span>
          {post.published_at && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <CalendarDays size={13} />
              {formatDate(post.published_at)}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight mb-4">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-lg text-gray-500 leading-relaxed mb-8 pb-8 border-b border-gray-200">
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        <style>{`
          .blog-content img { border-radius: 12px; max-width: 100%; }
          .blog-content img[data-align="center"] { display: block; margin: 0 auto; }
          .blog-content img[data-align="right"]  { display: block; margin-right: 0; }
          .blog-content img[data-align="left"]   { display: block; margin-left: 0; }
        `}</style>
        <div
          className="blog-content prose prose-lg max-w-none text-right prose-headings:text-gray-800 prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-rose-500 prose-blockquote:border-rose-300 prose-blockquote:bg-rose-50 prose-blockquote:rounded-lg prose-blockquote:px-4"
          dir="rtl"
          dangerouslySetInnerHTML={{ __html: sanitize(post.content) }}
        />

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex items-center justify-between">
          <Link href="/blog" className="text-rose-500 hover:text-rose-600 font-medium transition-colors text-sm">
            ← מאמרים נוספים
          </Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            לאקדמיה של נטלי →
          </Link>
        </div>
      </div>
    </main>
  );
}
