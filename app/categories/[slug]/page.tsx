import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { dbFetchCoursesByCategory } from "@/lib/supabase/courses-db";
import { CourseCard } from "@/components/courses/CourseCard";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const name = decodeURIComponent(params.slug);
  return {
    title: `${name} — הבית של המאפרים`,
    description: `קורסים בקטגוריית ${name} — הבית של המאפרים`,
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const categoryName = decodeURIComponent(params.slug);
  if (!categoryName) notFound();

  const courses = await dbFetchCoursesByCategory(categoryName).catch(() => []);

  return (
    <main style={{ background: "#080608", minHeight: "100vh", color: "#FFF8F5", direction: "rtl" }}>
      {/* Hero */}
      <section style={{
        padding: "96px 24px 48px",
        background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(196,133,122,0.09) 0%, transparent 70%)",
        borderBottom: "1px solid rgba(196,133,122,0.07)",
        textAlign: "center",
      }}>
        <Link href="/courses" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase",
          color: "rgba(196,133,122,0.6)", marginBottom: 20, textDecoration: "none",
        }}>
          ← כל הקורסים
        </Link>
        <h1 style={{
          fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, lineHeight: 1.1,
          background: "linear-gradient(135deg, #FFF8F5 30%, #D4998E)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 12,
        }}>
          {categoryName}
        </h1>
        <p style={{ fontSize: "0.9rem", color: "rgba(255,248,245,0.35)" }}>
          {courses.length} קורסים בקטגוריה זו
        </p>
      </section>

      {/* Grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 100px" }}>
        {courses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,248,245,0.2)" }}>
            <p style={{ fontSize: "1.1rem" }}>אין קורסים בקטגוריה זו עדיין</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 20,
          }}>
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
