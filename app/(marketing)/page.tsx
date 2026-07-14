import { createClient } from "@/lib/supabase/server";
import {
  type HeroContent,
  type Testimonial,
  type SubPlan,
  type ExtraSection,
  type FaqItem,
  type ComingSoonItem,
  type NatalieContent,
  type NewestSectionContent,
  DEFAULT_HERO,
  DEFAULT_TESTIMONIALS,
  DEFAULT_PLANS,
  DEFAULT_EXTRA_SECTIONS,
  DEFAULT_FAQS,
  DEFAULT_COMING_SOON,
  DEFAULT_TERMS,
  DEFAULT_NATALIE,
  DEFAULT_NEWEST_SECTION,
} from "@/lib/supabase/content-db";
import HomePageClient from "@/components/HomePageClient";

export default async function HomePage() {
  const sb = createClient();

  // שאיבת כל התוכן + auth בקריאה מקבילה אחת מהשרת
  const [{ data: rows }, { data: authData }] = await Promise.all([
    sb.from("site_content").select("key, value"),
    sb.auth.getUser(),
  ]);

  const c = Object.fromEntries(
    (rows ?? []).map(({ key, value }: { key: string; value: unknown }) => [key, value])
  );

  const hero          = (c.hero              as HeroContent)          ?? DEFAULT_HERO;
  const newestSection = (c.newest_section    as NewestSectionContent) ?? DEFAULT_NEWEST_SECTION;
  const testimonials  = (c.testimonials      as Testimonial[])        ?? DEFAULT_TESTIMONIALS;
  const plans         = (c.subscription_plans as SubPlan[])           ?? DEFAULT_PLANS;
  const extraSections = (c.extra_sections    as ExtraSection[])       ?? DEFAULT_EXTRA_SECTIONS;
  const faqs          = (c.faqs              as FaqItem[])            ?? DEFAULT_FAQS;
  const comingSoon    = (c.coming_soon       as ComingSoonItem[])     ?? DEFAULT_COMING_SOON;
  const terms         = (c.terms             as string)               ?? DEFAULT_TERMS;
  const natalie       = (c.natalie           as NatalieContent)       ?? DEFAULT_NATALIE;

  // בדיקת auth + מנוי בשרת (cookie-based — מדויק ומאובטח)
  let isLoggedIn      = false;
  let hasSubscription = false;
  const user = authData?.user ?? null;
  if (user) {
    isLoggedIn = true;
    const { data: profile } = await sb
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single();
    if (profile?.subscription_tier) hasSubscription = true;
  }

  return (
    <HomePageClient
      hero={hero}
      newestSection={newestSection}
      testimonials={testimonials}
      plans={plans}
      extraSections={extraSections}
      faqs={faqs}
      comingSoon={comingSoon}
      terms={terms}
      natalie={natalie}
      isLoggedIn={isLoggedIn}
      hasSubscription={hasSubscription}
    />
  );
}
