"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { COURSES, type CourseData } from "./courses-data";

const STORAGE_KEY = "hbm-courses-v2";

interface CoursesContextValue {
  courses: CourseData[];
  setCourses: (courses: CourseData[]) => void;
  resetToDefaults: () => void;
}

const CoursesContext = createContext<CoursesContextValue | null>(null);

export function CoursesProvider({ children }: { children: ReactNode }) {
  const [courses, setCoursesState] = useState<CourseData[]>(COURSES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CourseData[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCoursesState(parsed);
        }
      }
    } catch {
      // localStorage unavailable or corrupt — fall back to defaults
    }
    setHydrated(true);
  }, []);

  const setCourses = (next: CourseData[]) => {
    setCoursesState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn("localStorage full or unavailable:", e);
    }
  };

  const resetToDefaults = () => setCourses(COURSES);

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
