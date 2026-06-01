# CLAUDE.md — הבית של המאפרים

## כללי עבודה מחייבים

1. **אסור לשנות** קוד, עיצוב, לוגיקה, סקשיינים או כל דבר — ללא אישור מפורש משי. ספק = שואלים קודם.
2. **עדכון קובץ זה:** אחרי כל שינוי מהותי — לשאול את שי האם להוסיף לכאן לפני הסגירה.
3. **קוד מודולרי.** כל שינוי ב-Schema של Supabase מחייב עדכון מקביל ב-TypeScript interfaces.
4. **Supabase הוא מקור האמת.** `courses-data.ts` הוא fallback בלבד בסביבת dev ללא env keys.
5. **כל עריכה באדמין** חייבת לעדכן את ה-DB ישירות.
6. **SSR עדיף** על Client Components בדפים ציבוריים.
7. **Zod** לולידציה. אם יש סתירה בין UI לקוד — DB גובר.

---

## הפרוייקט

**שם:** הבית של המאפרים | **בעלים:** שי ארצי (`shaiartsi26@gmail.com`)
**תיאור:** פלטפורמת מנויים ליוצרת איפור — נטלי ארצי. קורסי וידאו ב-3 רמות: Basic / Pro / Elite + רכישת קורס בודד ב-₪489.

---

## אינפרסטרקטורה

| שירות | פרטים |
|--------|--------|
| **Vercel** | `https://habait-shel-git-main-shai-habait-shel.vercel.app` |
| **דומיין** | `https://natalieartsi.com` |
| **GitHub** | `git@github.com:shaiartsi38/habait-shel.git` |
| **SSH key** | `~/.ssh/github_habait` — push ישיר ללא tokens |

```bash
git add <files> && git commit -m "..." && git push origin main
```

---

## Tech Stack

**Next.js 14.2.18** (App Router) · **TypeScript** strict · **Supabase** (Auth + DB + Storage) · **Tailwind CSS** RTL · **Framer Motion** · **Radix UI** · **Lucide React**

---

## ארכיטקטורה — קבצים מרכזיים

```
app/(marketing)/page.tsx         ← דף הבית
app/admin/page.tsx               ← CMS מלא
app/courses/[slug]/page.tsx      ← דף קורס
app/checkout/[slug]/page.tsx     ← דף רכישה בודדת (₪489, placeholder לCardcom)
app/dashboard/page.tsx           ← דשבורד משתמש + מערכת ביטול מנוי
app/natalie/page.tsx             ← עמוד נטלי (תמונה, ביו, רשתות חברתיות)
components/admin/ContentEditors.tsx  ← HomepageEditor, SubscriptionEditor, NatalieEditor
lib/supabase/courses-db.ts       ← CRUD קורסים + שיעורים + upload
lib/supabase/content-db.ts       ← CRUD תוכן דף הבית (site_content)
lib/courses-context.tsx          ← stale-while-revalidate: localStorage → Supabase ברקע
middleware.ts                    ← הגנת routes לפי role
```

---

## Supabase — Schema

**`profiles`:** `id` (uuid) · `role` ("user"/"admin") · `email`
**`courses`:** `id` (**text**, לא uuid!) · `slug` · `title` · `subtitle` · `thumbnail_url` · `trailer_video_id` · `trailer_provider` · `required_tier` · `is_published` · `tags` (text[]) · `description` (JSON: shortDesc, fullDesc, instructor)
**`lessons`:** `id` (text) · `course_id` (text, FK) · `title` · `video_id` · `video_provider` · `duration_seconds` · `is_free_preview` · `sort_order`

**Storage bucket:** `course-media` → `thumbnails/` + `videos/`

---

## Admin CMS — `site_content` (Supabase)

כל פנייה ל-DB שולפת את **כל הטבלה בפנייה אחת** (`prefetchAll`) ושומרת ב-in-memory cache. הcache מתרענן רק אחרי `setContent`. זה מה שמונע את הטעינה האיטית.

| Key | Type | תיאור |
|-----|------|--------|
| `hero` | `HeroContent` | כותרות, CTA, סטטיסטיקות, רקע תמונה/וידאו |
| `testimonials` | `Testimonial[]` | שם, תחום, טקסט, תמונה |
| `extra_sections` | `ExtraSection[]` | סקשיינים בין נטלי למנויים |
| `faqs` | `FaqItem[]` | שאלות ותשובות |
| `coming_soon` | `ComingSoonItem[]` | קורסים עתידיים — מוצגים מקסימום 3, עם hover float |
| `subscription_plans` | `SubPlan[]` | תוכניות מנוי |
| `natalie` | `NatalieContent` | תמונה, ביו, instagram/youtube/tiktok/facebook/whatsapp |
| `terms` | `string` | תקנון המועדון — מוצג ב-ClosingCTA, 5 שורות preview |
| `cancellation_flow` | `CancellationFlow` | שאלות/הצעות במערכת ביטול המנוי |

`HeroContent`: תומך `heroType: "image" | "video"` + `heroVideoUrl`.

---

## מערכת רכישה בודדת (₪489)

- **UI קיים:** כפתור "רכישת קורס" + מחיר על כל כרטיס, דף `/checkout/[slug]` מלא.
- **Backend בהמשך:** Cardcom webhook → יצירת משתמש → RLS per-course → מייל Resend.
- **DB עתידי:** טבלת `course_purchases` — `user_id, course_id, purchased_at, price`.

---

## מערכת ביטול מנוי (Cancellation Flow)

נמצאת ב-`/dashboard`. 4 שלבים:
1. בחירת סיבה (מה ה-`reason`)
2. הצעה מותאמת לסיבה (`offerTitle` + `offerDesc` + `offerCta`)
3. אישור סופי
4. אישור ביטול

**עריכת התוכן:** ניהול → מנויים → טאב "מערכת ביטול".

---

## אבטחה

- **RLS חובה** בכל טבלה. משתמשים ללא tier מתאים לא רואים קישורי וידאו.
- **אסור** `EXISTS (SELECT 1 FROM profiles ...)` בתוך policy על `profiles` — recursion.
- פונקציה `get_my_role() SECURITY DEFINER` — בכל policy של admin.
- **אסור להרדקוד אימייל** — תמיד `role = 'admin'` בלבד.

---

## Auth

- **Login:** `/login` (כולל "שכחתי סיסמה" — **אין** "הירשמי")
- **Forgot/Reset:** `/forgot-password` → מייל → `/reset-password`
- **Signup:** Cardcom webhook בלבד. `/signup` מפנה ל-`/login`.
- **Role** נקרא מ-JWT claim (`user_role`) — גיבוי: קריאת DB.

---

## וידאו

```ts
type VideoProvider = "youtube" | "vimeo" | "direct"
```
`parseVideoUrl(url)` — מחלץ ID ומזהה ספק מכל URL (Shorts, youtu.be, vimeo.com, ישיר).

---

## עיצוב (מותג)

- **פלטה:** רקע `#080608` · טקסט `#FFF8F5` · אקסנט `#C4857A`
- **RTL עברית מלאה** · **Framer Motion — חובה לשמור** על כל האנימציות
- `whileHover` של Framer Motion — **לא** `animate` עם state. `animate` + `whileInView` מתנגשים.

---

## שגיאות ידועות / לקחים

1. `courses.id` הוא **text** (לא uuid) — שינוי דרש: drop policies → drop FK → alter type → recreate.
2. RLS recursion על `profiles` — נפתר עם `get_my_role() SECURITY DEFINER`.
3. שגיאות Supabase הן plain objects — `errMsg(e)`, לא `e instanceof Error`.
4. `animate` + `whileInView` מתנגשים ב-Framer Motion — תמיד `whileHover` לאנימציות hover.
5. יצירת `profiles` אוטומטית בעת Signup עדיין לא יציבה — **בעיה פתוחה**.

---

## פרופיל אישי (`/profile`)

- שדות ב-`profiles`: `first_name`, `last_name`, `years_experience`, `bio`, `photo_url`
- עריכה + העלאת תמונה לStorage (`course-media/avatars/{user_id}.ext`)
- `lib/supabase/profile-db.ts`: `dbGetMyProfile`, `dbUpdateProfile`, `dbUploadAvatar`, `dbGetProfileById`
- **SQL שחייב לרוץ בSupabase:**
  ```sql
  ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS years_experience integer,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS photo_url text;
  ```

---

## קהילה (`/community`)

- טבלת `community_posts` (Supabase Realtime)
- תצוגה: avatar + שם + זמן + תוכן + attachment
- כתיבה + העלאת קובץ (`community-media/`)
- Reply / thread (`parent_id`)
- אדמין: pin + הודעות מנוהל (`is_admin_post`)
- הרשאות: מנויים בלבד (role = 'user' | 'admin')
- `lib/supabase/community-db.ts`: CRUD + Realtime

---

## וידאו — החלטות ארכיטקטורה

- **Vimeo** — כל הסרטונים הפרמיום יעברו לVimeo (HLS + quality + fullscreen אוטומטי)
- **המשך צפייה** — לוגיקה צד שרת (טבלת `user_progress`) — לא Vimeo
- שלב 4 (נגן) יתכווץ לבניית המשך צפייה בלבד לאחר מעבר לVimeo

---

## סטטוס פתוח

- [ ] SQL migration לפרופיל (ראה למעלה)
- [ ] Cardcom webhook — יצירת משתמש + רישום רכישה + Resend מייל
- [ ] RLS per-course (`course_purchases` table)
- [ ] המשך צפייה (`user_progress` table)
- [ ] Security: RLS לוידאו לפי tier, signed URLs, rate limiting, headers
- [ ] Zod לולידציה
- [ ] SSR לדפים ציבוריים
