import { createClient } from "./client";

const hasSupabase = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function dbGetFavorites(): Promise<string[]> {
  if (!hasSupabase()) return [];
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];
  const { data } = await sb
    .from("user_favorites")
    .select("course_id")
    .eq("user_id", user.id);
  return (data ?? []).map((r) => String(r.course_id));
}

export async function dbToggleFavorite(courseId: string): Promise<"added" | "removed"> {
  if (!hasSupabase()) return "added";
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: existing } = await sb
    .from("user_favorites")
    .select("course_id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();

  if (existing) {
    await sb.from("user_favorites").delete().eq("user_id", user.id).eq("course_id", courseId);
    return "removed";
  }
  await sb.from("user_favorites").insert({ user_id: user.id, course_id: courseId });
  return "added";
}
