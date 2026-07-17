"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedLogo from "@/components/ProtectedLogo";
import type { QuizConfig } from "@/lib/supabase/content-db";
import type { QuizTags } from "@/lib/courses-data";

export type OnboardingCourse = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  thumbnailUrl: string;
  tier: "basic" | "pro" | "elite";
  quizTags?: QuizTags;
};

const TIER_LABELS: Record<string, string> = { basic: "מתחילות", pro: "מקצועי", elite: "אליט" };

type Stage = "welcome" | "quiz" | "result";

function scoreCourses(
  courses: OnboardingCourse[],
  answers: Record<string, string>
): (OnboardingCourse & { score: number })[] {
  return courses
    .map((c) => {
      let score = 0;
      Object.entries(answers).forEach(([key, value]) => {
        const tags = (c.quizTags as Record<string, string[] | undefined> | undefined)?.[key];
        if (tags?.includes(value)) score++;
      });
      return { ...c, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

export default function OnboardingClient({
  quizConfig,
  courses,
}: {
  quizConfig: QuizConfig;
  courses: OnboardingCourse[];
}) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("welcome");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions = quizConfig.questions;
  const total = questions.length;

  const finish = () => {
    try { localStorage.setItem("quiz_done", "true"); } catch {}
    router.push("/dashboard");
  };

  const selectAnswer = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setTimeout(() => {
      if (current < total - 1) setCurrent((c) => c + 1);
      else setStage("result");
    }, 320);
  };

  const restart = () => {
    setStage("welcome");
    setCurrent(0);
    setAnswers({});
  };

  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: "#080608",
        color: "#FFF8F5",
        fontFamily: "'Heebo', sans-serif",
      }}
    >
      {stage === "welcome" && (
        <div className="flex flex-col items-center justify-center text-center px-7" style={{ minHeight: "100vh", padding: "48px 28px" }}>
          <ProtectedLogo width="clamp(200px, 55vw, 300px)" style={{ marginBottom: 32 }} />
          <div style={{ width: 36, height: 1, background: "#C4857A", opacity: 0.6, marginBottom: 28 }} />
          <p style={{ fontSize: 15, lineHeight: 1.9, color: "#FFF8F5", maxWidth: 296, fontWeight: 300, marginBottom: 40, whiteSpace: "pre-line" }}>
            {quizConfig.welcomeMessage}
          </p>
          <button
            onClick={() => setStage(total > 0 ? "quiz" : "result")}
            className="active:opacity-80 transition-opacity"
            style={{
              background: "#C4857A", color: "#FFF8F5", border: "none", borderRadius: 14,
              padding: "17px 48px", fontSize: 16, fontWeight: 700, letterSpacing: "0.04em", cursor: "pointer",
            }}
          >
            {quizConfig.ctaText}
          </button>
        </div>
      )}

      {stage === "quiz" && total > 0 && (
        <QuizStage
          questions={questions}
          current={current}
          onSelect={selectAnswer}
        />
      )}

      {stage === "result" && (
        <ResultStage
          scored={scoreCourses(courses, answers)}
          onSelectCourse={finish}
          onViewAll={finish}
          onRestart={restart}
        />
      )}
    </div>
  );
}

function QuizStage({
  questions, current, onSelect,
}: {
  questions: QuizConfig["questions"];
  current: number;
  onSelect: (key: string, value: string) => void;
}) {
  const q = questions[current];
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const handlePick = (value: string) => {
    setSelectedValue(value);
    onSelect(q.key, value);
  };

  return (
    <div key={current} className="flex flex-col md:flex-row md:items-center" style={{ animation: "onbFadeUp 0.35s ease both" }}>
      <div className="flex items-center justify-between px-5 pt-5 md:px-13 md:pt-6 w-full md:hidden">
        <span style={{ fontSize: 12, fontWeight: 300, letterSpacing: "0.14em", color: "rgba(255,248,245,0.48)", textTransform: "uppercase" }}>
          הבית של המאפרים
        </span>
        <span style={{ fontSize: 12, color: "rgba(255,248,245,0.48)" }}>{current + 1} / {questions.length}</span>
      </div>

      <div className="flex gap-1.5 px-5 pt-3.5 md:px-13 md:pt-4 w-full md:absolute md:top-6">
        {questions.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1, height: 2, borderRadius: 2,
              background: i < current ? "#C4857A" : i === current ? "#FFF8F5" : "rgba(255,248,245,0.09)",
              transition: "background 0.4s",
            }}
          />
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-16 px-5 py-9 md:px-16 w-full" style={{ minHeight: "calc(100vh - 70px)" }}>
        <div className="flex justify-center shrink-0">
          <div
            style={{
              width: "min(175px, 42vw)", aspectRatio: "5/8", borderRadius: 18, overflow: "hidden",
              position: "relative", boxShadow: "0 14px 44px rgba(0,0,0,0.6)", background: "#140e12",
            }}
          >
            {q.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={q.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
            )}
          </div>
        </div>

        <div className="flex-1 w-full">
          <div style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#C4857A", marginBottom: 8 }}>
            {q.label}
          </div>
          <h2 style={{ fontSize: "clamp(22px,2.8vw,36px)", fontWeight: 700, lineHeight: 1.3, marginBottom: 6 }}>{q.title}</h2>
          <p style={{ fontSize: 13, color: "rgba(255,248,245,0.48)", lineHeight: 1.6, marginBottom: 18 }}>{q.sub}</p>

          <div className="grid grid-cols-2 gap-2.5">
            {q.options.map((o) => (
              <button
                key={o.value}
                onClick={() => handlePick(o.value)}
                className="text-right active:scale-[0.97] transition-all"
                style={{
                  background: selectedValue === o.value ? "rgba(196,133,122,0.14)" : "rgba(255,248,245,0.04)",
                  border: `1px solid ${selectedValue === o.value ? "#C4857A" : "rgba(255,248,245,0.09)"}`,
                  borderRadius: 12, padding: 14, color: "#FFF8F5", cursor: "pointer", fontFamily: "inherit",
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 3 }}>{o.title}</span>
                <span style={{ fontSize: 11, color: "rgba(255,248,245,0.48)", display: "block", lineHeight: 1.5 }}>{o.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes onbFadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

function ResultStage({
  scored, onSelectCourse, onViewAll, onRestart,
}: {
  scored: (OnboardingCourse & { score: number })[];
  onSelectCourse: () => void;
  onViewAll: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="flex flex-col items-center px-5 md:px-20" style={{ paddingTop: 32, paddingBottom: 56, minHeight: "100vh" }}>
      <div style={{ fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "#C4857A", marginBottom: 10, textAlign: "center" }}>
        התוצאות שלך
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 700, textAlign: "center", marginBottom: 6 }}>הקורסים המומלצים לך</h1>
      <p style={{ fontSize: 13, color: "rgba(255,248,245,0.48)", textAlign: "center", marginBottom: 28, maxWidth: 300, lineHeight: 1.6 }}>
        בחרנו את הקורסים שהכי מתאימים לאיפה שאת נמצאת עכשיו
      </p>

      <div className="w-full md:grid md:grid-cols-2 md:gap-3.5" style={{ maxWidth: 700, marginBottom: 32 }}>
        {scored.map((c, i) => (
          <button
            key={c.id}
            onClick={onSelectCourse}
            className="w-full text-right mb-3 md:mb-0"
            style={{
              background: i === 0 ? "rgba(196,133,122,0.14)" : "rgba(255,248,245,0.04)",
              border: `1px solid ${i === 0 ? "#C4857A" : "rgba(255,248,245,0.09)"}`,
              borderRadius: 14, padding: 18, cursor: "pointer", fontFamily: "inherit", color: "#FFF8F5",
            }}
          >
            {i === 0 && (
              <div style={{ display: "inline-block", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "#C4857A", background: "rgba(196,133,122,0.18)", borderRadius: 4, padding: "3px 8px", marginBottom: 10 }}>
                ההמלצה הראשית שלך
              </div>
            )}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,248,245,0.48)", marginBottom: 5 }}>
                  {TIER_LABELS[c.tier] ?? c.tier}
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.3 }}>{c.title}</div>
              </div>
              <div style={{ fontSize: 11, color: "#C4857A", whiteSpace: "nowrap", marginTop: 4 }}>{c.score}/4</div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onViewAll}
        className="w-full active:opacity-85"
        style={{ maxWidth: 340, background: "#C4857A", color: "#FFF8F5", border: "none", borderRadius: 12, padding: 17, fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 16, fontFamily: "inherit" }}
      >
        לצפייה בכל הקורסים →
      </button>
      <span onClick={onRestart} style={{ color: "rgba(255,248,245,0.48)", fontSize: 13, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
        חזרי להתחלה
      </span>
    </div>
  );
}
