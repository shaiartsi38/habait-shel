export type Tier = "basic" | "pro" | "elite";
export type Difficulty = "beginner" | "intermediate" | "advanced";
export type VideoProvider = "youtube" | "vimeo" | "direct";

export interface CourseLesson {
  id: string;
  title: string;
  videoId: string;
  videoProvider: VideoProvider;
  durationMin: number;
  isFree: boolean;
}

export interface CourseInstructor {
  name: string;
  bio: string;
  photoUrl: string;
}

export interface CourseData {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  shortDesc: string;
  fullDesc: string;
  image: string;
  videoId?: string;
  videoProvider?: VideoProvider;
  duration: string;
  durationMinutes: number;
  category: string;
  tier: Tier;
  difficulty: Difficulty;
  isPublished: boolean;
  isNew: boolean;
  showOnHome?: boolean;
  sortOrder?: number;
  instructor: CourseInstructor;
  lessons: CourseLesson[];
  tags: string[];
}

export const CATEGORIES = [
  "הכל",
  "עיניים",
  "עור ובסיס",
  "כלות",
  "Editorial",
  "עסקים ומיתוג",
  "Contouring",
] as const;

export type Category = (typeof CATEGORIES)[number];

const NATALIE: CourseInstructor = {
  name: "נטלי ארצי",
  bio: "מאפרת מקצועית עם מיליוני צפיות חודשיות ו-100,000+ עוקבים. כל מאסטרקלאס נבנה מהסטודיו האמיתי — אין מסנני אינסטגרם, רק טכניקה טהורה.",
  photoUrl: "https://i.imghippo.com/files/ZNe4792NOg.jpeg",
};

export const COURSES: CourseData[] = [
  {
    id: "mascara",
    slug: "mascara",
    title: "שיטת המסקרה ב-15 דקות",
    subtitle: "הסוד המקצועי לריסים מושלמים",
    shortDesc: "טכניקת מסקרה מהפכנית שתשנה את האיפור שלך לנצח.",
    fullDesc:
      "בקורס הזה נלמד את שיטת המסקרה הייחודית שנטלי פיתחה לאחר שנים בתעשייה. נבין את ההבדלים בין סוגי המסקרות, נלמד את טכניקות הריסים הקשתות והארוכות, ונסיים עם מבט עמוק ומרשים.",
    image: "https://i.imghippo.com/files/MWT4749Gg.jpeg",
    videoId: "N9Ua_0qYYhI",
    videoProvider: "youtube",
    duration: "62 דקות",
    durationMinutes: 62,
    category: "עיניים",
    tier: "basic",
    difficulty: "beginner",
    isPublished: true,
    isNew: true,
    instructor: NATALIE,
    lessons: [
      { id: "m1", title: "הקדמה ועקרונות הבסיס", videoId: "N9Ua_0qYYhI", videoProvider: "youtube", durationMin: 8, isFree: true },
      { id: "m2", title: "בחירת המסקרה הנכונה", videoId: "", videoProvider: "youtube", durationMin: 12, isFree: false },
      { id: "m3", title: "טכניקת הריסים הקשתות", videoId: "", videoProvider: "youtube", durationMin: 18, isFree: false },
      { id: "m4", title: "ריסים ארוכים ופתוחים", videoId: "", videoProvider: "youtube", durationMin: 15, isFree: false },
      { id: "m5", title: "הגמר המושלם", videoId: "", videoProvider: "youtube", durationMin: 9, isFree: false },
    ],
    tags: ["מסקרה", "ריסים", "עיניים", "יומיומי"],
  },
  {
    id: "bride",
    slug: "bride",
    title: "כלה מיליון דולר",
    subtitle: "איפור כלות יוקרתי מקצה לקצה",
    shortDesc: "מהכנת עור מושלמת ועד לגמר שמחזיק כל הלילה — הקורס המקיף לאיפור כלות.",
    fullDesc:
      "הקורס המלא לאיפור כלות: מטכניקות הכנת עור, דרך בניית בסיס מושלם, ועד לעיניים הנוצצות ושפתיים שנשארות כל היום. כולל טיפים לאיפור עמיד ומוכן לצילומים.",
    image: "https://i.imghippo.com/files/g6246kuU.jpeg",
    videoId: "9EAgMGmsYzg",
    videoProvider: "youtube",
    duration: "85 דקות",
    durationMinutes: 85,
    category: "כלות",
    tier: "elite",
    difficulty: "advanced",
    isPublished: true,
    isNew: true,
    instructor: NATALIE,
    lessons: [
      { id: "b1", title: "הכנת עור לכלה", videoId: "9EAgMGmsYzg", videoProvider: "youtube", durationMin: 14, isFree: true },
      { id: "b2", title: "בסיס ממוזג ופריימר", videoId: "", videoProvider: "youtube", durationMin: 16, isFree: false },
      { id: "b3", title: "קונסילר מושלם", videoId: "", videoProvider: "youtube", durationMin: 11, isFree: false },
      { id: "b4", title: "עיניים קלאסיות לכלה", videoId: "", videoProvider: "youtube", durationMin: 20, isFree: false },
      { id: "b5", title: "שפתיים ארוכות יום", videoId: "", videoProvider: "youtube", durationMin: 12, isFree: false },
      { id: "b6", title: "סיום ועמידות לאורם", videoId: "", videoProvider: "youtube", durationMin: 12, isFree: false },
    ],
    tags: ["כלות", "חתונה", "יוקרה", "עמיד"],
  },
  {
    id: "captivating",
    slug: "captivating",
    title: "המבט הכובש",
    subtitle: "עיניים עמוקות שלא ניתן להתעלם מהן",
    shortDesc: "בנייה מקצועית של מבט עמוק ומיסטי.",
    fullDesc: "סמוקי איי, לינר חד, צלליות ושכבות צבע שיוצרים את המבט הכי כובש שיצא לך.",
    image: "https://i.imghippo.com/files/AVtj3775tsA.jpeg",
    videoId: "fqPXgq-HZtQ",
    videoProvider: "youtube",
    duration: "48 דקות",
    durationMinutes: 48,
    category: "עיניים",
    tier: "pro",
    difficulty: "intermediate",
    isPublished: true,
    isNew: false,
    instructor: NATALIE,
    lessons: [
      { id: "c1", title: "פריימר עיניים ובסיס", videoId: "fqPXgq-HZtQ", videoProvider: "youtube", durationMin: 9, isFree: true },
      { id: "c2", title: "שכבות צלליות", videoId: "", videoProvider: "youtube", durationMin: 14, isFree: false },
      { id: "c3", title: "לינר בטכניקת Wing", videoId: "", videoProvider: "youtube", durationMin: 13, isFree: false },
      { id: "c4", title: "סמוקי ואפקט עומק", videoId: "", videoProvider: "youtube", durationMin: 12, isFree: false },
    ],
    tags: ["סמוקי", "עיניים", "לינר", "ערב"],
  },
  {
    id: "no-makeup",
    slug: "no-makeup",
    title: "איפור ללא איפור",
    subtitle: "עור שנראה כמו עור — רק מושלם",
    shortDesc: "הסוד לאיפור טבעי שגורם לאנשים לשאול האם את בכלל מאופרת.",
    fullDesc: "הפסיכולוגיה של ה-no makeup look: שכבות קלות, קורקטורים ערים, ולחות שמבהיקה. הכי קשה לעשות, הכי קל להיראות טוב.",
    image: "https://i.imghippo.com/files/buo9489kbs.jpeg",
    duration: "55 דקות",
    durationMinutes: 55,
    category: "עור ובסיס",
    tier: "basic",
    difficulty: "beginner",
    isPublished: true,
    isNew: false,
    instructor: NATALIE,
    lessons: [
      { id: "n1", title: "עור מוכן ולח", videoId: "", videoProvider: "youtube", durationMin: 11, isFree: true },
      { id: "n2", title: "BB ו-CC קרמים", videoId: "", videoProvider: "youtube", durationMin: 13, isFree: false },
      { id: "n3", title: "קורקטור ותיקונים", videoId: "", videoProvider: "youtube", durationMin: 14, isFree: false },
      { id: "n4", title: "סיום זוהר טבעי", videoId: "", videoProvider: "youtube", durationMin: 17, isFree: false },
    ],
    tags: ["טבעי", "עור", "יומיומי", "no-makeup"],
  },
  {
    id: "al-ain",
    slug: "al-ain",
    title: "סדנת אל עין",
    subtitle: "איפור Editorial מקצועי",
    shortDesc: "עבודה עם צבעים נועזים, טקסטורות וטכניקות מגזינים.",
    fullDesc: "לא כל איפור נועד לרחוב. בסדנה הזאת נלמד לעבוד עם צבעים קיצוניים, טקסטורות שונות ולבנות Editorial looks מושלמים לצילומים.",
    image: "https://i.imghippo.com/files/uHu6506qHA.jpeg",
    duration: "72 דקות",
    durationMinutes: 72,
    category: "Editorial",
    tier: "pro",
    difficulty: "advanced",
    isPublished: true,
    isNew: false,
    instructor: NATALIE,
    lessons: [
      { id: "a1", title: "מה זה Editorial", videoId: "", videoProvider: "youtube", durationMin: 8, isFree: true },
      { id: "a2", title: "עבודה עם צבע נועז", videoId: "", videoProvider: "youtube", durationMin: 20, isFree: false },
      { id: "a3", title: "טקסטורות מגוונות", videoId: "", videoProvider: "youtube", durationMin: 22, isFree: false },
      { id: "a4", title: "צילום ומצלמה", videoId: "", videoProvider: "youtube", durationMin: 22, isFree: false },
    ],
    tags: ["Editorial", "מגזין", "יצירתי", "נועז"],
  },
  {
    id: "ai-makeup",
    slug: "ai-makeup",
    title: "איפור עם AI",
    subtitle: "הטכנולוגיה שמשנה את ענף האיפור",
    shortDesc: "כיצד להשתמש בכלי AI לשיפור העסק, הפרסום והיצירתיות.",
    fullDesc: "ה-AI כבר כאן. נלמד כיצד מאפרות מקצועיות משתמשות בכלי בינה מלאכותית לבניית תיקים, הצגת לקוחות ושיפור הנוכחות הדיגיטלית.",
    image: "https://i.imghippo.com/files/dKr6384dN.jpeg",
    duration: "40 דקות",
    durationMinutes: 40,
    category: "עסקים ומיתוג",
    tier: "basic",
    difficulty: "beginner",
    isPublished: true,
    isNew: true,
    instructor: NATALIE,
    lessons: [
      { id: "ai1", title: "AI בעולם האיפור", videoId: "", videoProvider: "youtube", durationMin: 7, isFree: true },
      { id: "ai2", title: "כלים לבניית תיק עבודות", videoId: "", videoProvider: "youtube", durationMin: 15, isFree: false },
      { id: "ai3", title: "שיווק ומדיה חברתית עם AI", videoId: "", videoProvider: "youtube", durationMin: 18, isFree: false },
    ],
    tags: ["AI", "עסקים", "דיגיטלי", "שיווק"],
  },
  {
    id: "quiet-bride",
    slug: "quiet-bride",
    title: "הכלה השקטה",
    subtitle: "אלגנטיות מינימליסטית לחתונה",
    shortDesc: "פחות הוא יותר — איפור כלה עדין, קלאסי ונצחי.",
    fullDesc: "לכלות שאוהבות עדינות: בניית look מינימליסטי שמחזיק לאורך היום ומצטלם בצורה מושלמת. פריסה, שפתיים עדינות ועיניים שמדברות בשקט.",
    image: "https://i.imghippo.com/files/AOv7969jE.jpeg",
    duration: "65 דקות",
    durationMinutes: 65,
    category: "כלות",
    tier: "elite",
    difficulty: "intermediate",
    isPublished: true,
    isNew: true,
    instructor: NATALIE,
    lessons: [
      { id: "q1", title: "קונספט הכלה השקטה", videoId: "", videoProvider: "youtube", durationMin: 10, isFree: true },
      { id: "q2", title: "עור זוהר ועדין", videoId: "", videoProvider: "youtube", durationMin: 18, isFree: false },
      { id: "q3", title: "עיניים מינימליסטיות", videoId: "", videoProvider: "youtube", durationMin: 20, isFree: false },
      { id: "q4", title: "שפתיים nude מושלמות", videoId: "", videoProvider: "youtube", durationMin: 17, isFree: false },
    ],
    tags: ["כלות", "מינימליסטי", "עדין", "קלאסי"],
  },
  {
    id: "transparent-skin",
    slug: "transparent-skin",
    title: "עור שקוף",
    subtitle: "הטכניקה המתקדמת לעור נטול פגמים",
    shortDesc: "עור שנראה כמו זכוכית — טכניקת layering מתקדמת.",
    fullDesc: "בניית עור שקוף ומבריק כמו של ידוענים: layering חכם, highlight ב-placement מדויק ושכבות צבע שמשפרות את המרקם הטבעי.",
    image: "https://i.imghippo.com/files/ijG6508Ao.jpeg",
    duration: "50 דקות",
    durationMinutes: 50,
    category: "עור ובסיס",
    tier: "basic",
    difficulty: "intermediate",
    isPublished: true,
    isNew: true,
    instructor: NATALIE,
    lessons: [
      { id: "s1", title: "הכנת עור — לחות ופריימר", videoId: "", videoProvider: "youtube", durationMin: 12, isFree: true },
      { id: "s2", title: "Foundation שקוף", videoId: "", videoProvider: "youtube", durationMin: 15, isFree: false },
      { id: "s3", title: "Highlight ו-Glow", videoId: "", videoProvider: "youtube", durationMin: 13, isFree: false },
      { id: "s4", title: "סיום ועמידות", videoId: "", videoProvider: "youtube", durationMin: 10, isFree: false },
    ],
    tags: ["עור", "גלוס", "שקוף", "highlight"],
  },
];
