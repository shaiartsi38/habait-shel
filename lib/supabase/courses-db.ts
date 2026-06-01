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
    videoProvider: (row.video_provider as "youtube" | "vimeo" | "direct") ?? "youtube",
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
  // Only fields confirmed to exist in the courses table schema
  return {
    slug: c.slug,
    title: c.title,
    subtitle: c.subtitle ?? "",
    description: JSON.stringify(meta),
    thumbnail_url: c.image ?? "",
    trailer_video_id: c.videoId ?? null,
    trailer_provider: c.videoProvider ?? "youtube",
    required_tier: c.tier,
    is_published: Boolean(c.isPublished),
    duration_minutes: Number(c.durationMinutes) || 0,
    tags,
  };
}

function lessonToRow(l: CourseLesson, courseId: string, sortOrder: number): Record<string, unknown> {
  return {
    id: l.id,
    course_id: courseId,
    title: l.title ?? "",
    video_provider: l.videoProvider ?? "youtube",
    video_id: l.videoId ?? "",
    duration_seconds: Number(l.durationMin) * 60 || 0,
    is_free_preview: Boolean(l.isFree),
    sort_order: sortOrder,
  };
}

// ─── DB Operations ────────────────────────────────────────────────

export async function dbFetchCourses(): Promise<CourseData[]> {
  if (!hasSupabase()) return COURSES;
  const sb = createClient();

  // Two separate queries — avoids FK join naming issues
  const { data: coursesData, error: coursesErr } = await sb
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });
  if (coursesErr) throw coursesErr;
  if (!coursesData || coursesData.length === 0) return [];

  const courseIds = coursesData.map((c) => (c as Record<string, unknown>).id as string);
  const { data: lessonsData } = await sb
    .from("lessons")
    .select("*")
    .in("course_id", courseIds);

  const byId: Record<string, unknown[]> = {};
  for (const lesson of lessonsData ?? []) {
    const cid = (lesson as Record<string, unknown>).course_id as string;
    if (!byId[cid]) byId[cid] = [];
    byId[cid].push(lesson);
  }

  return coursesData.map((row) =>
    courseFromRow({ ...(row as Record<string, unknown>), lessons: byId[(row as Record<string, unknown>).id as string] ?? [] })
  );
}

export async function dbFetchCourseBySlug(slug: string): Promise<CourseData | null> {
  if (!hasSupabase()) return COURSES.find((c) => c.slug === slug) ?? null;
  const sb = createClient();
  const { data, error } = await sb
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error || !data) return null;

  const { data: lessonsData } = await sb
    .from("lessons")
    .select("*")
    .eq("course_id", (data as Record<string, unknown>).id);

  return courseFromRow({ ...(data as Record<string, unknown>), lessons: lessonsData ?? [] });
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

export async function dbSeedDefaultCourses(): Promise<CourseData[]> {
  if (!hasSupabase()) return COURSES;
  for (const course of COURSES) {
    await dbUpsertCourse(course);
  }
  return dbFetchCourses();
}

export async function dbUploadVideo(file: File): Promise<string> {
  if (!hasSupabase()) throw new Error("Supabase לא מוגדר — השתמש ב-URL ישיר");
  const sb = createClient();
  const ext = file.name.split(".").pop() ?? "mp4";
  const path = `videos/${Date.now()}.${ext}`;
  const { data, error } = await sb.storage.from("course-media").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data: { publicUrl } } = sb.storage.from("course-media").getPublicUrl(data.path);
  return publicUrl;
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
