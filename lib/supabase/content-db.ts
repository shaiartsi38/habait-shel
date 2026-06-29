import { createClient } from "./client";

const hasSupabase = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// ─── Types ────────────────────────────────────────────────────────

export type HeroContent = {
  title1: string;
  title2: string;
  subtitle: string;
  ctaText: string;
  statsStudents: string;
  statsCourses: string;
  heroBg: string;
  heroType?: "image" | "video";
  heroVideoUrl?: string;
};

export type ComingSoonItem = {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  trailerVideoId?: string;
  trailerProvider?: "youtube" | "vimeo" | "direct";
  releaseDate?: string;
};

export type Testimonial = {
  name: string;
  field: string;
  text: string;
  initials: string;
  color: string;
  photoUrl?: string;
};

export type FaqItem = {
  q: string;
  a: string;
};

export type ExtraSection = {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  imageUrl: string;
  ctaText: string;
  ctaHref: string;
  visible: boolean;
};

export type CancellationOffer = {
  id: string;
  reason: string;
  offerTitle: string;
  offerDesc: string;
  offerCta: string;
};

export type CancellationFlow = {
  mainQuestion: string;
  step2Title: string;
  confirmText: string;
  offers: CancellationOffer[];
};

export type SubPlan = {
  id: string;
  name: string;
  nameHe: string;
  price: number;
  period: string;
  desc: string;
  features: string[];
  cta: string;
  featured: boolean;
  color: string;
  checkoutUrl?: string;
};

export type NatalieContent = {
  photo: string;
  instagram: string;
  youtube: string;
  tiktok?: string;
  facebook?: string;
  whatsapp?: string;
  bio: string[];
  achievements: { value: string; label: string }[];
  milestones: { year: string; text: string }[];
};

// ─── Defaults (fallback when Supabase isn't loaded yet) ───────────

export const DEFAULT_HERO: HeroContent = {
  title1: "הבית של",
  title2: "המאפרים",
  subtitle: "להיות צעד אחד לפני כולם. מאסטרקלאסים בלעדיים, תוכן חדש כל שבוע, וקהילה שדוחפת אותך קדימה.",
  ctaText: "אני רוצה להיכנס ➔",
  statsStudents: "847 תלמידות",
  statsCourses: "24+ קורסים",
  heroBg: "https://i.imghippo.com/files/AOv7969jE.jpeg",
};

export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { name: "מיה לוי",       field: "מאפרת כלות",          text: "מאז שהצטרפתי למועדון, הלקוחות שלי פשוט לא מאמינות לתוצאות. הקורס על כלות שינה לי את כל הגישה.", initials: "מל", color: "#C4857A" },
  { name: "נועה ברקוביץ׳", field: "מאפרת פרילנסרית",      text: "התוכן של נטלי הוא הכי מקצועי שמצאתי בעברית. שילמתי פחות מקורס אחד והרווחתי ידע של 10.",          initials: "נב", color: "#D4998E" },
  { name: "שירה אביב",     field: "סטודיו איפור, תל אביב", text: "הקהילה כאן זה הבונוס הכי גדול. מאפרות מכל הארץ שמשתפות, עוזרות, ומדיחות אחת את השנייה.",        initials: "שא", color: "#8B6355" },
  { name: "ליאת כהן",      field: "מאפרת ואמנית עיצוב",   text: "הבסיס שקיבלתי מהמאסטרקלאסים כאן בנה לי קריירה. ממליצה לכל מאפרת שרצינית לגבי העסק שלה.",     initials: "לכ", color: "#C4857A" },
];

export const DEFAULT_PLANS: SubPlan[] = [
  {
    id: "basic", name: "Basic", nameHe: "בסיסי", price: 49, period: "לחודש",
    desc: "כניסה לעולם — קורסי מתחילות ומדגמי תוכן",
    features: ["גישה לכל קורסי Basic", "שיעורים חינמיים בכל קורסי Pro", "קהילה בסיסית", "עדכוני תוכן חודשיים"],
    cta: "התחיל עם Basic", featured: false, color: "#8B6355",
  },
  {
    id: "pro", name: "Pro", nameHe: "מקצועי", price: 89, period: "לחודש",
    desc: "הרמה הפרו — גישה לרוב התוכן + קהילה",
    features: ["גישה לכל קורסי Basic + Pro", "קהילה Pro עם פידבק שבועי", "שאלות ישירות לנטלי", "ספריית כלים ומשאבים", "הנחות על ציוד ואביזרים"],
    cta: "הצטרף ל-Pro", featured: true, color: "#C4857A",
  },
  {
    id: "elite", name: "Elite", nameHe: "יוקרה", price: 149, period: "לחודש",
    desc: "כל מה שיש — ללא פשרות, ללא גבולות",
    features: ["גישה מלאה לכל הקורסים", "קהילה Elite — VIP בלבד", "מפגשי Live חודשיים עם נטלי", "פידבק אישי על עבודות", "ריטריט שנתי — הנחה מיוחדת", "תעודת מקצועית דיגיטלית"],
    cta: "הצטרף ל-Elite", featured: false, color: "#D4998E",
  },
];

export const DEFAULT_NATALIE: NatalieContent = {
  photo: "",
  instagram: "https://instagram.com",
  youtube: "https://youtube.com",
  tiktok: "",
  facebook: "",
  whatsapp: "",
  bio: [
    "נטלי ארצי היא מאפרת מקצועית עם למעלה מ-10 שנות ניסיון בתעשייה — מצילומי אופנה ועד כלות חלומות. היא מאמינה שאיפור הוא לא רק טכניקה, אלא אמנות שמגיעה מהפנים החוצה.",
    "לאחר שנים של עבודה מול מצלמות ובסטודיוס ברחבי העולם, החליטה נטלי להפוך את הידע שצברה לנגיש לכל מאפרת בישראל — ובכך נולד הבית של המאפרים.",
    "הסגנון שלה: מדויק, חושני, ולוקסוס נקי. היא מלמדת לא רק \"איך\" — אלא \"למה\".",
  ],
  achievements: [
    { value: "8+",     label: "קורסים מקצועיים" },
    { value: "1,200+", label: "תלמידות" },
    { value: "10+",    label: "שנות ניסיון" },
  ],
  milestones: [
    { year: "2014", text: "סיימה בהצטיינות את בית הספר למיצ'ה בתל אביב" },
    { year: "2016", text: "התמחות אצל מאפרות Leading בניו יורק ופריז" },
    { year: "2018", text: "הקימה את הסטודיו העצמאי — מאות כלות וצילומי אופנה" },
    { year: "2022", text: 'השיקה את "הבית של המאפרים" — הפלטפורמה המובילה לחינוך מקצועי בעברית' },
  ],
};

export const DEFAULT_CANCELLATION_FLOW: CancellationFlow = {
  mainQuestion: "למה את עוזבת?",
  step2Title: "לפני שאת הולכת, יש לנו הצעה מיוחדת עבורך",
  confirmText: "אני בטוחה שאני רוצה לבטל",
  offers: [
    { id: "price", reason: "יקר לי", offerTitle: "50% הנחה ל-3 חודשים", offerDesc: "נמשיך ביחד — בחצי מחיר. ההנחה תחול כבר מחיוב הבא.", offerCta: "אני רוצה את ההנחה!" },
    { id: "time", reason: "אין לי זמן כרגע", offerTitle: "הקפאת מנוי ל-60 יום", offerDesc: "קפאי את המנוי שלך — ללא חיוב, ללא אובדן תוכן. נחכה לך.", offerCta: "הקפאי את המנוי שלי" },
    { id: "content", reason: "לא מספיק תוכן", offerTitle: "תוכן חדש כל שבוע", offerDesc: "כל שבוע עולה קורס חדש. בחודש הקרוב: מסקרה מתקדמת, עור זוהר לקיץ ועוד.", offerCta: "אשאר לראות מה מגיע" },
    { id: "other", reason: "סיבה אחרת", offerTitle: "חודש מתנה", offerDesc: "לא רוצות לאבד אותך. קבלי חודש נוסף ללא חיוב — במתנה.", offerCta: "אקבל את החודש המתנה" },
  ],
};

export const DEFAULT_TERMS = `תקנון המועדון — הבית של המאפרים

1. כללי — שימוש בפלטפורמה מהווה הסכמה לתנאים אלו.
2. מנוי — המנוי הינו חודשי/שנתי וניתן לביטול בכל עת.
3. תוכן — כל התכנים שמורים לנטלי ארצי ואין להעתיקם.
4. תשלומים — החיוב מתבצע דרך Cardcom בצורה מאובטחת.
5. ביטול — ניתן לבטל בכל עת, הגישה תיחסם בסוף תקופת החיוב.

הניסוח המשפטי המלא יתעדכן בקרוב.`;

export const DEFAULT_COMING_SOON: ComingSoonItem[] = [
  { id: "s1", image: "", title: "קולקציית ערב — Fall 2030", subtitle: "עם נטלי ארצי", category: "עיניים", description: "" },
  { id: "s2", image: "", title: "Bridal Masterclass Vol. 2", subtitle: "עם נטלי ארצי", category: "כלות", description: "" },
  { id: "s3", image: "", title: "Contouring Pro Series", subtitle: "עם נטלי ארצי", category: "Contouring", description: "" },
];

export const DEFAULT_EXTRA_SECTIONS: ExtraSection[] = [];

export const DEFAULT_FAQS: FaqItem[] = [
  { q: "למי המועדון מתאים?", a: "המועדון מתאים לכל מאפרת – ממתחילות שרוצות לבנות בסיס יציב וטכניקה נכונה, ומאפרות ותיקות שרוצות להישאר מעודכנות בטרנדים הכי חמים, לקחת את רמי הביצוע שלהן כמה צעדים קדימה, ללמוד שיטות עבודה מהירות ולשפר את התוצאות שלהן בשטח." },
  { q: "איזה תוכן מחכה לי בפנים?", a: "בתוך הפלטפורמה תמצאי עשרות מאסטרקלאסים מפורטים באורך מלא, קורסים, פתרונות לבעיות שונות ומגוונות שמאפרות נתקלות איתן ביום יום, שיטות וטכניקות שפיתחתי במשך שנים — כמו למשל ׳הדבקת ריסים בשיטת המסקרה ב-15 דק׳, חשיפה של תיק האיפור המקצועי שלי, וגישה מלאה לקהילה סגורה ותומכת. כל חודש עולים תכנים חדשים!" },
  { q: "האם יש התחייבות? איך אפשר לבטל?", a: "במסלול החודשי אין שום התחייבות. את יכולה לבטל את המנוי בכל רגע בלחיצת כפתור פשוטה מתוך אזור הניהול האישי שלך, והגישה תיחסם בתום תקופת החיוב הנוכחית." },
  { q: "איך עובדת הצפייה בתכנים?", a: "הפלטפורמה מותאמת באופן מלא למובייל ולדסקטופ. תוכלי לצפות בכל השיעורים מכל מקום ובכל זמן שנוח לך, באיכות הגבוהה ביותר ובקצב האישי שלך." },
];

// ─── DB Operations ────────────────────────────────────────────────

const _cache = new Map<string, unknown>();
let _prefetchPromise: Promise<void> | null = null;

// שולף את כל הטבלה בפנייה אחת וממלא את ה-cache — קורה פעם אחת לסשן
function prefetchAll(): Promise<void> {
  if (_prefetchPromise) return _prefetchPromise;
  if (!hasSupabase()) return Promise.resolve();
  _prefetchPromise = (async () => {
    try {
      const { data } = await createClient().from("site_content").select("key, value");
      (data ?? []).forEach(({ key, value }: { key: string; value: unknown }) => {
        if (!_cache.has(key)) _cache.set(key, value);
      });
    } catch { /* ignore */ }
  })();
  return _prefetchPromise;
}

async function getContent<T>(key: string, fallback: T): Promise<T> {
  if (!hasSupabase()) return fallback;
  await prefetchAll();
  if (_cache.has(key)) return _cache.get(key) as T;
  return fallback;
}

async function setContent(key: string, value: unknown): Promise<void> {
  const sb = createClient();
  const { error } = await sb
    .from("site_content")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw error;
  _cache.set(key, value);
}

// קריאה חיצונית ל-prefetch — ניתן לקרוא מוקדם ככל האפשר
export { prefetchAll as prefetchAllContent };

export const dbGetHero          = () => getContent<HeroContent>("hero", DEFAULT_HERO);
export const dbGetTestimonials  = () => getContent<Testimonial[]>("testimonials", DEFAULT_TESTIMONIALS);
export const dbGetExtraSections = () => getContent<ExtraSection[]>("extra_sections", DEFAULT_EXTRA_SECTIONS);
export const dbGetPlans         = () => getContent<SubPlan[]>("subscription_plans", DEFAULT_PLANS);
export const dbGetNatalie       = () => getContent<NatalieContent>("natalie", DEFAULT_NATALIE);
export const dbGetFaqs          = () => getContent<FaqItem[]>("faqs", DEFAULT_FAQS);
export const dbGetComingSoon    = () => getContent<ComingSoonItem[]>("coming_soon", DEFAULT_COMING_SOON);
export const dbGetTerms            = () => getContent<string>("terms", DEFAULT_TERMS);
export const dbGetCancellationFlow = () => getContent<CancellationFlow>("cancellation_flow", DEFAULT_CANCELLATION_FLOW);
export const dbGetOgImage          = () => getContent<string>("og_image", "");
export const dbGetCourseCategories = () => getContent<string[]>("course_categories", [
  "עיניים", "עור ובסיס", "כלות", "Editorial", "עסקים ומיתוג", "Contouring",
]);

export const dbSetHero          = (v: HeroContent)       => setContent("hero", v);
export const dbSetTestimonials  = (v: Testimonial[])     => setContent("testimonials", v);
export const dbSetExtraSections = (v: ExtraSection[])    => setContent("extra_sections", v);
export const dbSetPlans         = (v: SubPlan[])          => setContent("subscription_plans", v);
export const dbSetNatalie       = (v: NatalieContent)    => setContent("natalie", v);
export const dbSetFaqs          = (v: FaqItem[])         => setContent("faqs", v);
export const dbSetComingSoon    = (v: ComingSoonItem[])  => setContent("coming_soon", v);
export const dbSetTerms            = (v: string)             => setContent("terms", v);
export const dbSetOgImage          = (v: string)             => setContent("og_image", v);
export const dbSetCancellationFlow = (v: CancellationFlow)   => setContent("cancellation_flow", v);
export const dbSetCourseCategories = (v: string[])            => setContent("course_categories", v);
