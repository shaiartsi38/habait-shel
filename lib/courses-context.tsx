"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { COURSES, type CourseData } from "./courses-data";
import { dbFetchCourses } from "./supabase/courses-db";
import { prefetchAllContent } from "./supabase/content-db";

const STORAGE_KEY = "hbm-courses-v4";

interface CoursesContextValue {
  courses: CourseData[];
  loading: boolean;
  setCourses: (courses: CourseData[]) => void;
  resetToDefaults: () => void;
}

const CoursesContext = createContext<CoursesContextValue | null>(null);

export function CoursesProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [courses, setCoursesState] = useState<CourseData[]>(() => {
    // טעינה מיידית מ-localStorage — ללא השהייה
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CourseData[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* ignore */ }
    return COURSES;
  });

  useEffect(() => {
    // Prefetch כל site_content בפנייה אחת ברקע — מאיץ את כל עמודי האדמין
    prefetchAllContent();

    // עדכון קורסים ברקע מ-Supabase (stale-while-revalidate)
    dbFetchCourses()
      .then((live) => {
        if (live.length > 0) {
          setCoursesState(live);
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(live)); } catch { /* ignore */ }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const setCourses = (next: CourseData[]) => {
    setCoursesState(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const resetToDefaults = () => setCourses(COURSES);

  return (
    <CoursesContext.Provider value={{ courses, loading, setCourses, resetToDefaults }}>
      {children}
    </CoursesContext.Provider>
  );
}

export function useCourses() {
  const ctx = useContext(CoursesContext);
  if (!ctx) throw new Error("useCourses must be used inside <CoursesProvider>");
  return ctx;
}
