import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

const TIER_RANK: Record<string, number> = { basic: 1, pro: 2, elite: 3 };

function tierCovers(userTier: string | null, requiredTier: string): boolean {
  if (!userTier) return false;
  return (TIER_RANK[userTier] ?? 0) >= (TIER_RANK[requiredTier] ?? 0);
}

export async function GET(req: NextRequest) {
  const lessonId = req.nextUrl.searchParams.get("lessonId");
  if (!lessonId) {
    return Response.json({ error: "Missing lessonId" }, { status: 400 });
  }

  const sb = createClient();

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const [{ data: lesson }, { data: profile }] = await Promise.all([
    sb.from("lessons")
      .select("video_id, video_provider, is_free_preview, course_id")
      .eq("id", lessonId)
      .single(),
    sb.from("profiles")
      .select("role, subscription_tier")
      .eq("id", user.id)
      .single(),
  ]);

  if (!lesson) return Response.json({ error: "Lesson not found" }, { status: 404 });

  const isAdmin = profile?.role === "admin";
  const isFree  = Boolean(lesson.is_free_preview);

  if (isAdmin || isFree) {
    return Response.json({
      videoId: lesson.video_id,
      videoProvider: lesson.video_provider ?? "youtube",
    });
  }

  // בדיקת tier לפי הקורס
  const { data: course } = await sb
    .from("courses")
    .select("required_tier")
    .eq("id", lesson.course_id)
    .single();

  const requiredTier = course?.required_tier ?? "basic";
  const userTier = profile?.subscription_tier ?? null;

  if (!tierCovers(userTier, requiredTier)) {
    return Response.json({ error: "Access denied" }, { status: 403 });
  }

  return Response.json({
    videoId: lesson.video_id,
    videoProvider: lesson.video_provider ?? "youtube",
  });
}
