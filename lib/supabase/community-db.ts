import { createClient } from "./client";

// ─── Types ────────────────────────────────────────────────────────

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  is_pinned: boolean;
  is_admin_post: boolean;
  attachment_url: string | null;
  attachment_type: "image" | "video" | "file" | null;
  attachment_name: string | null;
  created_at: string;
  // joined from profiles
  author_name?: string;
  author_photo?: string | null;
  author_initials?: string;
  // computed
  replies?: CommunityPost[];
}

// ─── Fetch ────────────────────────────────────────────────────────

export async function dbFetchPosts(): Promise<CommunityPost[]> {
  const sb = createClient();
  const { data, error } = await sb
    .from("community_posts")
    .select(`
      id, user_id, content, parent_id, is_pinned, is_admin_post,
      attachment_url, attachment_type, attachment_name, created_at,
      profiles:user_id (first_name, last_name, photo_url)
    `)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const p = row.profiles as { first_name?: string; last_name?: string; photo_url?: string } | null;
    const fullName = [p?.first_name, p?.last_name].filter(Boolean).join(" ") || "חברת מועדון";
    const initials = [p?.first_name?.[0], p?.last_name?.[0]].filter(Boolean).join("").toUpperCase() || "?";
    return {
      ...(row as unknown as CommunityPost),
      author_name: fullName,
      author_photo: p?.photo_url ?? null,
      author_initials: initials,
    };
  });
}

// ─── Write ────────────────────────────────────────────────────────

export async function dbCreatePost(
  content: string,
  parentId: string | null,
  attachmentUrl: string | null,
  attachmentType: CommunityPost["attachment_type"],
  attachmentName: string | null
): Promise<void> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("לא מחוברת");

  const { error } = await sb.from("community_posts").insert({
    user_id: user.id,
    content,
    parent_id: parentId,
    attachment_url: attachmentUrl,
    attachment_type: attachmentType,
    attachment_name: attachmentName,
  });
  if (error) throw error;
}

export async function dbDeletePost(id: string): Promise<void> {
  const sb = createClient();
  const { error } = await sb.from("community_posts").delete().eq("id", id);
  if (error) throw error;
}

export async function dbTogglePin(id: string, pinned: boolean): Promise<void> {
  const sb = createClient();
  const { error } = await sb
    .from("community_posts")
    .update({ is_pinned: pinned })
    .eq("id", id);
  if (error) throw error;
}

// ─── Upload ───────────────────────────────────────────────────────

export async function dbUploadAttachment(file: File): Promise<{
  url: string;
  type: CommunityPost["attachment_type"];
  name: string;
}> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("לא מחוברת");

  const rawExt = file.name.split(".").pop() ?? "bin";
  const ext = /^[a-z0-9]{1,8}$/i.test(rawExt) ? rawExt.toLowerCase() : "bin";
  const path = `community/${user.id}/${crypto.randomUUID()}.${ext}`;

  const { data, error } = await sb.storage
    .from("course-media")
    .upload(path, file, { upsert: false });
  if (error) throw error;

  const { data: { publicUrl } } = sb.storage.from("course-media").getPublicUrl(data.path);

  const type: CommunityPost["attachment_type"] = file.type.startsWith("image/")
    ? "image"
    : file.type.startsWith("video/")
      ? "video"
      : "file";

  return { url: publicUrl, type, name: file.name };
}

// ─── Realtime ─────────────────────────────────────────────────────

export function subscribeToPosts(onUpdate: () => void) {
  const sb = createClient();
  const channel = sb
    .channel("community_posts_changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "community_posts" }, onUpdate)
    .subscribe();
  return () => { sb.removeChannel(channel); };
}
