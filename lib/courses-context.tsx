"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { COURSES, type CourseData } from "./courses-data";
import { dbFetchCourses } from "./supabase/courses-db";

interface CoursesContextValue {
  courses: CourseData[];
  setCourses: (courses: CourseData[]) => void;
  resetToDefaults: () => void;
}

const CoursesContext = createContext<CoursesContextValue | null>(null);

export function CoursesProvider({ children }: { children: ReactNode }) {
  const [courses, setCoursesState] = useState<CourseData[]>(COURSES);

  // על כל טעינה — שולפים ישירות מ-Supabase כמקור אמת
  useEffect(() => {
    dbFetchCourses()
      .then((live) => { if (live.length > 0) setCoursesState(live); })
      .catch(() => {}); // fallback: נשארים עם COURSES הסטטי
  }, []);

  const setCourses = (next: CourseData[]) => setCoursesState(next);

  const resetToDefaults = () => setCoursesState(COURSES);

  return (
    <CoursesContext.Provider value={{ courses, setCourses, resetToDefaults }}>
      {children}
    </CoursesContext.Provider>
  );
}

export function useCourses() {
  const ctx = useContext(CoursesContext);
  if (!ctx) throw new Error("useCourses must be used inside <CoursesProvider>");
  return ctx;
}
