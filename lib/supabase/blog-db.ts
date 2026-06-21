import { createClient } from "./client";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string | null;
  category: string;
  status: "draft" | "published";
  published_at: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

export type BlogPostInput = Omit<BlogPost, "id" | "created_at" | "updated_at">;

// Only ASCII-safe slugs — Next.js App Router dynamic segments
// don't route correctly with Hebrew/non-Latin characters (known issue, same as courses).
function slugify(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")   // strip everything non-ASCII including Hebrew
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function generateSlug(title: string): string {
  return slugify(title) || `post-${Date.now()}`;
}

export async function dbGetPublishedPosts(): Promise<BlogPost[]> {
  const sb = createClient();
  const { data, error } = await sb
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BlogPost[];
}

export async function dbGetAllPosts(): Promise<BlogPost[]> {
  const sb = createClient();
  const { data, error } = await sb
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BlogPost[];
}

export async function dbGetPostBySlug(slug: string): Promise<BlogPost | null> {
  const sb = createClient();
  const { data, error } = await sb
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data as BlogPost | null;
}

export async function dbUpsertPost(post: Partial<BlogPost> & { title: string }): Promise<BlogPost> {
  const sb = createClient();
  const now = new Date().toISOString();

  const payload: Record<string, unknown> = {
    ...post,
    updated_at: now,
  };

  if (!payload.slug) {
    payload.slug = generateSlug(post.title);
  }

  if (payload.status === "published" && !payload.published_at) {
    payload.published_at = now;
  }

  if (payload.id) {
    const { data, error } = await sb
      .from("blog_posts")
      .update(payload)
      .eq("id", payload.id as string)
      .select()
      .single();
    if (error) throw error;
    return data as BlogPost;
  } else {
    const { data, error } = await sb
      .from("blog_posts")
      .insert({ ...payload, created_at: now })
      .select()
      .single();
    if (error) throw error;
    return data as BlogPost;
  }
}

export async function dbDeletePost(id: string): Promise<void> {
  const sb = createClient();
  const { error } = await sb.from("blog_posts").delete().eq("id", id);
  if (error) throw error;
}

export async function dbUploadBlogImage(file: File): Promise<string> {
  const sb = createClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `blog/${Date.now()}.${ext}`;
  const { data, error } = await sb.storage.from("course-media").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data: { publicUrl } } = sb.storage.from("course-media").getPublicUrl(data.path);
  return publicUrl;
}
