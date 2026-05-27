import { createClient } from "./client";
import type { CourseData, CourseLesson } from "@/lib/courses-data";
import { COURSES } from "@/lib/courses-data";

// כשמפתחות Supabase לא מוגדרים — נחזיר נתוני דמה מקומיים
const hasSupabase = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// ─── Mappers ──────────────────────────────────────────────────────

function parseMeta(raw: string | null): Record<string, unknown> {
  try { return JSON.parse(raw ?? "{}"); } catch { return {}; }
}

function lessonFromRow(row: Record<string, unknown>): CourseLesson {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    videoId: String(row.video_id ?? ""),
    videoProvider: (row.video_provider as "youtube" | "vimeo") ?? "youtube",
    durationMin: Math.round(Number(row.duration_seconds ?? 0) / 60),
    isFree: Boolean(row.is_free_preview),
  };
}

function courseFromRow(row: Record<string, unknown>): CourseData {
  const meta = parseMeta(row.description as string | null);
  const tags = (row.tags as string[]) ?? [];
  const category = tags.find((t) => t.startsWith("cat:"))?.slice(4) ?? "";
  const difficulty = (tags.find((t) => t.startsWith("diff:"))?.slice(5) ?? "beginner") as CourseData["difficulty"];
  const isNew = tags.includes("new:true");
  const cleanTags = tags.filter((t) => !t.startsWith("cat:") && !t.startsWith("diff:") && t !== "new:true");
  const lessons = ((row.lessons as Record<string, unknown>[] | null) ?? [])
    .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
    .map(lessonFromRow);

  return {
    id: String(row.id),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? ""),
    subtitle: String(row.subtitle ?? ""),
    shortDesc: String(meta.shortDesc ?? ""),
    fullDesc: String(meta.fullDesc ?? ""),
    image: String(row.thumbnail_url ?? ""),
    videoId: row.trailer_video_id ? String(row.trailer_video_id) : undefined,
    videoProvider: (row.trailer_provider as "youtube" | "vimeo") ?? "youtube",
    duration: `${row.duration_minutes ?? 0} דקות`,
    durationMinutes: Number(row.duration_minutes ?? 0),
    category,
    tier: (row.required_tier as CourseData["tier"]) ?? "basic",
    difficulty,
    isPublished: Boolean(row.is_published),
    isNew,
    showOnHome: row.show_on_home !== false,
    instructor: (meta.instructor as CourseData["instructor"]) ?? { name: "נטלי ארצי", bio: "", photoUrl: "" },
    lessons,
    tags: cleanTags,
  };
}

function courseToRow(c: CourseData): Record<string, unknown> {
  const tags = [...c.tags, `cat:${c.category}`, `diff:${c.difficulty}`, ...(c.isNew ? ["new:true"] : [])];
  const meta = { shortDesc: c.shortDesc, fullDesc: c.fullDesc, instructor: c.instructor };
  return {
    slug: c.slug,
    title: c.title,
    subtitle: c.subtitle,
    description: JSON.stringify(meta),
    thumbnail_url: c.image,
    trailer_video_id: c.videoId ?? null,
    trailer_provider: c.videoProvider ?? "youtube",
    required_tier: c.tier,
    is_published: c.isPublished,
    show_on_home: c.showOnHome ?? true,
    duration_minutes: c.durationMinutes,
    lesson_count: c.lessons.length,
    tags,
    updated_at: new Date().toISOString(),
  };
}

function lessonToRow(l: CourseLesson, courseId: string, sortOrder: number): Record<string, unknown> {
  return {
    id: l.id,
    course_id: courseId,
    title: l.title,
    video_provider: l.videoProvider,
    video_id: l.videoId,
    duration_seconds: l.durationMin * 60,
    is_free_preview: l.isFree,
    sort_order: sortOrder,
    attachments: [],
  };
}

// ─── DB Operations ────────────────────────────────────────────────

export async function dbFetchCourses(): Promise<CourseData[]> {
  if (!hasSupabase()) return COURSES;
  const sb = createClient();
  const { data, error } = await sb
    .from("courses")
    .select("*, lessons(*)")
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => courseFromRow(r as Record<string, unknown>));
}

export async function dbFetchCourseBySlug(slug: string): Promise<CourseData | null> {
  if (!hasSupabase()) return COURSES.find((c) => c.slug === slug) ?? null;
  const sb = createClient();
  const { data, error } = await sb
    .from("courses")
    .select("*, lessons(*)")
    .eq("slug", slug)
    .single();
  if (error || !data) return null;
  return courseFromRow(data as Record<string, unknown>);
}

export async function dbUpsertCourse(course: CourseData): Promise<CourseData> {
  if (!hasSupabase()) return course;
  const sb = createClient();
  const row = courseToRow(course);

  const { data: saved, error: courseErr } = await sb
    .from("courses")
    .upsert({ id: course.id, ...row }, { onConflict: "id" })
    .select()
    .single();
  if (courseErr) throw courseErr;

  const courseId = (saved as Record<string, unknown>).id as string;

  await sb.from("lessons").delete().eq("course_id", courseId);
  if (course.lessons.length > 0) {
    const lessonRows = course.lessons.map((l, i) => lessonToRow(l, courseId, i));
    const { error: lessonErr } = await sb.from("lessons").insert(lessonRows);
    if (lessonErr) throw lessonErr;
  }

  return { ...course, id: courseId };
}

export async function dbDeleteCourse(id: string): Promise<void> {
  if (!hasSupabase()) return;
  const sb = createClient();
  const { error } = await sb.from("courses").delete().eq("id", id);
  if (error) throw error;
}

export async function dbUploadImage(file: File): Promise<string> {
  if (!hasSupabase()) throw new Error("Supabase לא מוגדר — השתמשי ב-URL ישיר");
  const sb = createClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `thumbnails/${Date.now()}.${ext}`;
  const { data, error } = await sb.storage.from("course-media").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data: { publicUrl } } = sb.storage.from("course-media").getPublicUrl(data.path);
  return publicUrl;
}
