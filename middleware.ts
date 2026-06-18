import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_ROUTES = ["/admin"];
const USER_ROUTES  = ["/dashboard", "/community", "/profile"];
const AUTH_ROUTES  = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } });
  const { pathname } = request.nextUrl;

  // מצב פיתוח מקומי — Supabase לא מוגדר, מעביר הכל
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string)                                    { return request.cookies.get(name)?.value; },
        set(name: string, value: string, o: Record<string, unknown>) { response.cookies.set({ name, value, ...o }); },
        remove(name: string, o: Record<string, unknown>)             { response.cookies.set({ name, value: "", ...o }); },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const isLoggedIn = !!session;

  // קריאת role מ-JWT claim (נוסף על-ידי custom_access_token_hook)
  // אם ה-hook לא מוגדר עדיין — נשתמש בקריאת DB כגיבוי
  let role: string | null = null;
  if (session) {
    // ניסיון קריאה מ-JWT claim תחילה
    const jwtPayload = session.access_token
      ? JSON.parse(atob(session.access_token.split(".")[1]))
      : null;
    role = jwtPayload?.user_role ?? null;

    // גיבוי: קריאה מ-DB אם ה-claim לא קיים
    if (!role) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      role = profile?.role ?? "user";
    }
  }

  const isAdmin = role === "admin";

  // ── /admin — דורש role=admin ─────────────────────────
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", request.url));
    if (!isAdmin)    return NextResponse.redirect(new URL("/dashboard", request.url));
    return response;
  }

  // ── /dashboard, /community — דורש כל משתמש מחובר ───
  if (USER_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", request.url));
    return response;
  }

  // ── /login, /signup — מחובר כבר? שלח למקום הנכון ───
  if (AUTH_ROUTES.some((r) => pathname === r) && isLoggedIn) {
    return NextResponse.redirect(new URL(isAdmin ? "/admin" : "/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/community/:path*",
    "/profile/:path*",
    "/profile",
    "/login",
    "/signup",
  ],
};
