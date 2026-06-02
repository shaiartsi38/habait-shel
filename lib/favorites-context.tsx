"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { createClient } from "./supabase/client";
import { dbGetFavorites, dbToggleFavorite } from "./supabase/favorites-db";

interface FavoritesContextValue {
  favorites: Set<string>;
  isLoggedIn: boolean;
  toggle: (courseId: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setIsLoggedIn(true);
      dbGetFavorites().then((ids) => setFavorites(new Set(ids))).catch(() => {});
    });
  }, []);

  const toggle = async (courseId: string) => {
    const isFav = favorites.has(courseId);
    setFavorites((prev) => {
      const next = new Set(prev);
      if (isFav) next.delete(courseId); else next.add(courseId);
      return next;
    });
    try {
      await dbToggleFavorite(courseId);
    } catch {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (isFav) next.add(courseId); else next.delete(courseId);
        return next;
      });
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isLoggedIn, toggle }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be inside <FavoritesProvider>");
  return ctx;
}
