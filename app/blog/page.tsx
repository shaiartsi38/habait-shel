import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "בלוג — הבית של המאפרים",
  description: "טיפים, השראה וטכניקות איפור מנטלי ארצי",
};

export const revalidate = 60;

async function getPosts() {
  try {
    const sb = createClient();
    const { data } = await sb
      .from("blog_posts")
      .select("id, title, slug, excerpt, cover_image, category, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <main className="min-h-screen bg-[#FDF8F5]" dir="rtl">
      {/* Header */}
      <section className="bg-white border-b border-gray-100 py-14 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">הבלוג של נטלי</h1>
        <p className="text-gray-500 text-lg max-w-lg mx-auto">
          טיפים, השראה וכל מה שצריך לדעת על עולם האיפור המקצועי
        </p>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-24">
            <FileText size={48} className="text-rose-200 mx-auto mb-4" />
            <p className="text-gray-400 text-xl">מאמרים בדרך...</p>
            <p className="text-gray-400 text-sm mt-1">חזרי בקרוב</p>
          </div>
        ) : (
          <>
            {/* Featured post */}
            {posts[0] && (
              <Link href={`/blog/${posts[0].slug}`} className="group block mb-10">
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  {posts[0].cover_image && (
                    <div className="aspect-[16/7] overflow-hidden">
                      <img
                        src={posts[0].cover_image}
                        alt={posts[0].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-8">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs bg-rose-100 text-rose-600 px-3 py-1 rounded-full font-medium">
                        {posts[0].category}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(posts[0].published_at)}</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3 group-hover:text-rose-600 transition-colors">
                      {posts[0].title}
                    </h2>
                    {posts[0].excerpt && (
                      <p className="text-gray-500 leading-relaxed">{posts[0].excerpt}</p>
                    )}
                    <span className="inline-block mt-4 text-rose-500 font-medium text-sm">
                      קראי עוד ←
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Rest of posts */}
            {posts.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.slice(1).map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full flex flex-col">
                      {post.cover_image ? (
                        <div className="aspect-[4/3] overflow-hidden">
                          <img
                            src={post.cover_image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[4/3] bg-rose-50 flex items-center justify-center">
                          <FileText size={40} className="text-rose-200" />
                        </div>
                      )}
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs bg-rose-100 text-rose-600 px-2.5 py-0.5 rounded-full font-medium">
                            {post.category}
                          </span>
                          <span className="text-xs text-gray-400">{formatDate(post.published_at)}</span>
                        </div>
                        <h3 className="font-bold text-gray-800 mb-2 group-hover:text-rose-600 transition-colors leading-snug">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">{post.excerpt}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
