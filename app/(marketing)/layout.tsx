import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

const SITE_NAME  = "הבית של המאפרים";
const SITE_DESC  = "פלטפורמת המאסטרקלאס המובילה לאמני איפור מקצועיים — עם נטלי ארצי";
const SITE_URL   = "https://academy.natalieartsi.com";
const FALLBACK_OG = "https://i.imghippo.com/files/ZNe4792NOg.jpeg"; // תמונת נטלי

export async function generateMetadata(): Promise<Metadata> {
  let ogImage = FALLBACK_OG;
  try {
    const sb = createClient();
    const { data } = await sb
      .from("site_content")
      .select("value")
      .eq("key", "og_image")
      .maybeSingle();
    if (data?.value && typeof data.value === "string" && data.value.startsWith("http")) {
      ogImage = data.value;
    }
  } catch { /* fallback */ }

  return {
    title: SITE_NAME,
    description: SITE_DESC,
    openGraph: {
      title: SITE_NAME,
      description: SITE_DESC,
      url: SITE_URL,
      siteName: SITE_NAME,
      locale: "he_IL",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: SITE_DESC,
      images: [ogImage],
    },
  };
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
