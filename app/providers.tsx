"use client";

import { CoursesProvider } from "@/lib/courses-context";
import { FavoritesProvider } from "@/lib/favorites-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CoursesProvider>
      <FavoritesProvider>
        {children}
      </FavoritesProvider>
    </CoursesProvider>
  );
}
