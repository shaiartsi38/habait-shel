# CLAUDE.md — הבית של המאפרים

## כללי עבודה מחייבים

1. **אסור לשנות** קוד, עיצוב, לוגיקה, סקשיינים או כל דבר — ללא אישור מפורש משי. ספק = שואלים קודם.
2. **עדכון קובץ זה:** אחרי כל שינוי מהותי (סקשיין חדש, שינוי באדמין, שינוי ב-schema, פיצ'ר חדש) — לשאול את שי האם להוסיף לכאן לפני הסגירה.
2. **קוד מודולרי.** כל שינוי ב-Schema של Supabase מחייב עדכון מקביל ב-TypeScript interfaces.
3. **Supabase הוא מקור האמת.** אין להשתמש ב-`courses-data.ts` כמקור נתונים בפרודקשן — רק כ-fallback בסביבת dev ללא env keys.
4. **כל עריכה באדמין** (קורסים, תמונות, סקשיינים) חייבת לעדכן את ה-DB ישירות — לא state מקומי בלבד.
5. **SSR עדיף** על Client Components בדפים ציבוריים (SEO, ביצועים).
6. **Zod** לולידציית נתונים מול ה-DB. אם יש סתירה בין UI לקוד — DB גובר.

---

## הפרוייקט

**שם:** הבית של המאפרים | **בעלים:** שי ארצי (`shaiartsi26@gmail.com`)
**תיאור:** פלטפורמת מנויים ליוצרת איפור — נטלי ארצי. קורסי וידאו ב-3 רמות: Basic / Pro / Elite.

---

## אינפרסטרקטורה

| שירות | פרטים |
|--------|--------|
| **Vercel** | `https://habait-shel-git-main-shai-habait-shel.vercel.app` |
| **דומיין** | `https://natalieartsi.com` |
| **GitHub** | `git@github.com:shaiartsi38/habait-shel.git` |
| **SSH key** | `~/.ssh/github_habait` — push ישיר ללא tokens |

```bash
# פרסום שינויי קוד (Vercel מפרסם אוטומטית תוך ~2 דק')
git add <files> && git commit -m "..." && git push origin main
```

---

## Tech Stack

**Next.js 14.2.18** (App Router) · **TypeScript** strict · **Supabase** (Auth + DB + Storage) · **Tailwind CSS** RTL · **Framer Motion** · **Radix UI** · **Lucide React**

---

## ארכיטקטורה — קבצים מרכזיים

```
app/(marketing)/page.tsx        ← דף הבית (SSR מועדף)
app/admin/page.tsx              ← CMS מלא
app/courses/[slug]/page.tsx     ← דף קורס
components/admin/ContentEditors.tsx  ← עורכי הירו, המלצות, FAQ, סקשיינים
lib/supabase/courses-db.ts      ← CRUD קורסים + שיעורים + upload
lib/supabase/content-db.ts      ← CRUD תוכן דף הבית
lib/courses-data.ts             ← fallback סטטי (dev בלבד — אסור למחוק)
middleware.ts                   ← הגנת routes לפי role
```

---

## Supabase — Schema

**`profiles`:** `id` (uuid) · `role` ("user"/"admin") · `email`
**`courses`:** `id` (**text**, לא uuid!) · `slug` · `title` · `subtitle` · `thumbnail_url` · `trailer_video_id` · `trailer_provider` · `required_tier` · `is_published` · `tags` (text[]) · `description` (JSON: shortDesc, fullDesc, instructor)
**`lessons`:** `id` (text) · `course_id` (text, FK) · `title` · `video_id` · `video_provider` · `duration_seconds` · `is_free_preview` · `sort_order`

**Storage bucket:** `course-media` → `thumbnails/` + `videos/`

---

## אבטחה

- **RLS חובה** בכל טבלה. משתמשים ללא tier מתאים לא רואים קישורי וידאו — רק טיזרים.
- **אסור** `EXISTS (SELECT 1 FROM profiles ...)` בתוך policy על `profiles` — גורם recursion.
- פונקציה `get_my_role() SECURITY DEFINER` — חובה להשתמש בה בכל policy של admin.
- **אסור להרדקוד אימייל** לבדיקת admin — תמיד `role = 'admin'` בלבד.

---

## Auth

- **Login:** `/login` (כולל "שכחתי סיסמה" — **אין** "הירשמי")
- **Forgot/Reset:** `/forgot-password` → מייל → `/reset-password`
- **Signup:** מנוי דרך Cardcom webhook בלבד. `/signup` מפנה ל-`/login`.
- **Role** נקרא מ-JWT claim (`user_role`) — גיבוי: קריאת DB.

---

## וידאו

```ts
type VideoProvider = "youtube" | "vimeo" | "direct"
```
`parseVideoUrl(url)` — חובה לחלץ ID ולזהות ספק מכל פורמט URL אוטומטית (Shorts, youtu.be, vimeo.com, URL ישיר).

---

## עיצוב (מותג)

- **פלטה:** רקע `#080608` · טקסט `#FFF8F5` · אקסנט `#C4857A`
- **RTL עברית מלאה** · **Framer Motion — חובה לשמור** על כל האנימציות

---

## שגיאות ידועות / לקחים

1. `courses.id` הוא **text** (לא uuid) — שינוי דרש: drop policies → drop FK → alter type → recreate.
2. RLS recursion על `profiles` — נפתר עם `get_my_role() SECURITY DEFINER`.
3. שגיאות Supabase הן plain objects — להשתמש ב-`errMsg(e)`, לא `e instanceof Error`.
4. יצירת `profiles` אוטומטית בעת Signup עדיין לא יציבה — **בעיה פתוחה**.

---

## סטטוס פתוח

- [ ] תיקון מנגנון יצירת Profile אוטומטי (Cardcom webhook)
- [ ] הוספת Zod לולידציית נתונים מ-DB
- [ ] מעבר מלא ל-SSR בדפים ציבוריים
- [ ] בניית מערכת תשלום + Stripe webhooks
