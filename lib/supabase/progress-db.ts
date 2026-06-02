import { createClient } from "./client";

export async function dbGetProgress(lessonId: string): Promise<number> {
  const sb = createClient();
  const { data } = await sb
    .from("user_progress")
    .select("progress_seconds")
    .eq("lesson_id", lessonId)
    .maybeSingle();
  return data?.progress_seconds ?? 0;
}

export async function dbGetCourseProgress(courseId: string): Promise<Record<string, number>> {
  const sb = createClient();
  const { data } = await sb
    .from("user_progress")
    .select("lesson_id, progress_seconds")
    .eq("course_id", courseId);
  return Object.fromEntries((data ?? []).map((r) => [r.lesson_id, r.progress_seconds]));
}

export async function dbSaveProgress(
  lessonId: string,
  courseId: string,
  seconds: number,
  completed = false
): Promise<void> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;

  await sb.from("user_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      course_id: courseId,
      progress_seconds: Math.floor(seconds),
      completed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" }
  );
}
