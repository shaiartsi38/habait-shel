import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_EMAIL = "shaiartsi26@gmail.com";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } });

  // כשמפתחות Supabase לא מוגדרים — מצב פיתוח מקומי, מעבירים הכל
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value; },
        set(name: string, value: string, options: Record<string, unknown>) { response.cookies.set({ name, value, ...options }); },
        remove(name: string, options: Record<string, unknown>) { response.cookies.set({ name, value: "", ...options }); },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!session || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/community")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/community/:path*"],
};
