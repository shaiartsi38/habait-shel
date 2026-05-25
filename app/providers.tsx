"use client";

import { CoursesProvider } from "@/lib/courses-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <CoursesProvider>{children}</CoursesProvider>;
}
