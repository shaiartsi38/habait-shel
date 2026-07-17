import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type QuizConfig, DEFAULT_QUIZ_CONFIG } from "@/lib/supabase/content-db";
import type { QuizTags } from "@/lib/courses-data";
import OnboardingClient, { type OnboardingCourse } from "@/components/OnboardingClient";

export default async function OnboardingPage() {
  const sb = createClient();

  const [{ data: rows }, { data: courseRows }] = await Promise.all([
    sb.from("site_content").select("key, value").eq("key", "quiz_config"),
    sb
      .from("courses")
      .select("id, slug, title, subtitle, thumbnail_url, required_tier, quiz_tags")
      .eq("is_published", true),
  ]);

  const quizConfig: QuizConfig = (rows?.[0]?.value as QuizConfig) ?? DEFAULT_QUIZ_CONFIG;

  if (!quizConfig.enabled) {
    redirect("/dashboard");
  }

  const courses: OnboardingCourse[] = (courseRows ?? []).map((row) => ({
    id: String(row.id),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? ""),
    subtitle: String(row.subtitle ?? ""),
    thumbnailUrl: String(row.thumbnail_url ?? ""),
    tier: (row.required_tier as "basic" | "pro" | "elite") ?? "basic",
    quizTags: (row.quiz_tags as QuizTags) ?? undefined,
  }));

  return <OnboardingClient quizConfig={quizConfig} courses={courses} />;
}
