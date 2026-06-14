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
**תיאור:** פלטפורמת מנויים ליוצרת איפור — נטלי ארצי. קורסי וידאו ב-3 רמות: Basic / Pro / Elite + רכישת קורס בודד במחיר דינמי לפי קורס.

---

## אינפרסטרקטורה

| שירות | פרטים |
|--------|--------|
| **Vercel** | `https://habait-shel-git-main-shai-habait-shel.vercel.app` |
| **דומיין** | `https://natalieartsi.com` |
| **GitHub** | `git@github.com:shaiartsi38/habait-shel.git` |
| **SSH key** | `~/.ssh/github_habait` — push ישיר ללא tokens |

```bash
git add <files> && git commit -m "..." && GIT_SSH_COMMAND="ssh -i ~/.ssh/github_habait" git push origin main
```

---

## Tech Stack

**Next.js 14.2.18** (App Router) · **TypeScript** strict · **Supabase** (Auth + DB + Storage) · **Tailwind CSS** RTL · **Framer Motion** · **Radix UI** · **Lucide React**

---

## ארכיטקטורה — קבצים מרכזיים

```
app/(marketing)/page.tsx              ← דף הבית
app/admin/page.tsx                    ← CMS מלא
app/courses/[slug]/page.tsx           ← דף קורס + נגן + ניווט שיעורים + המשך צפייה
app/checkout/[slug]/page.tsx          ← דף רכישה בודדת (₪489, placeholder לCardcom)
app/dashboard/page.tsx                ← דשבורד משתמש + מערכת ביטול מנוי
app/natalie/page.tsx                  ← עמוד נטלי (תמונה, ביו, רשתות חברתיות)
app/profile/page.tsx                  ← פרופיל אישי + העלאת תמונה
app/community/page.tsx                ← קהילה (Realtime, צ'אט, קבצים)
app/api/lesson-video/route.ts         ← API מאובטח: מחזיר video_id לפי tier בלבד
components/admin/ContentEditors.tsx   ← HomepageEditor, SubscriptionEditor, NatalieEditor
lib/supabase/courses-db.ts            ← CRUD קורסים + שיעורים + upload
lib/supabase/content-db.ts            ← CRUD תוכן דף הבית (site_content)
lib/supabase/community-db.ts          ← CRUD + upload + Realtime לקהילה
lib/supabase/profile-db.ts            ← CRUD פרופיל אישי
lib/supabase/progress-db.ts           ← שמירת/טעינת המשך צפייה (user_progress)
lib/courses-context.tsx               ← stale-while-revalidate: localStorage → Supabase ברקע
middleware.ts                         ← הגנת routes לפי role
```

---

## Supabase — Schema

**`profiles`:** `id` (uuid) · `role` ("user"/"admin") · `email` · `first_name` · `last_name` · `years_experience` · `bio` · `photo_url` · `subscription_tier` ("basic"/"pro"/"elite"/null)

**`courses`:** `id` (**text**, לא uuid!) · `slug` · `title` · `subtitle` · `thumbnail_url` · `trailer_video_id` · `trailer_provider` · `required_tier` · `is_published` · `tags` (text[]) · `description` (JSON meta: shortDesc, fullDesc, instructor, videoThumbnailUrl, highlights, lessonThumbnails, **price**, **purchaseUrl**) · `show_on_home` · `duration_minutes` · `lesson_count` · `updated_at`

**`lessons`:** `id` (text) · `course_id` (text, FK) · `title` · `video_id` · `video_provider` · `duration_seconds` · `is_free_preview` · `sort_order`

**`community_posts`:** `id` · `user_id` · `content` · `parent_id` · `is_pinned` · `is_admin_post` · `attachment_url` · `attachment_type` · `attachment_name` · `created_at`

**`user_progress`:** `id` (uuid) · `user_id` (FK auth.users) · `lesson_id` (text) · `course_id` (text) · `progress_seconds` (int) · `completed` (bool) · `updated_at` — UNIQUE(user_id, lesson_id)

**Storage bucket:** `course-media` → `thumbnails/` + `videos/` + `avatars/` + `community/`

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

## מערכת רכישה בודדת

- **UI קיים:** כפתור "רכישת קורס" + מחיר על כל כרטיס (`CourseCard`), דף `/checkout/[slug]` מלא.
- **מחיר דינמי:** `course.price` (מוגדר בניהול) מוצג על הכרטיס. אם לא מוגדר — לא מוצג מחיר.
- **קישור חיצוני:** אם הוגדר `course.purchaseUrl` בניהול — כפתור "רכישת קורס" פותח URL חיצוני (דף סליקה/נחיתה) בטאב חדש. אחרת — מוביל ל-`/checkout/[slug]`.
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
- **API route מאובטח** `/api/lesson-video` — כל גישה לוידאו עוברת דרכו ונבדקת בשרת.

### Storage RLS — policies קיימות ב-course-media:
| Policy | פעולה | מי |
|--------|--------|-----|
| `community media upload` | INSERT | authenticated |
| `community media read` | SELECT | public |
| `thumbnails public read` | SELECT | public |
| `avatars public read` | SELECT | public |
| `videos authenticated read` | SELECT | authenticated (אם הוחל) |
| `course-media: admin upload` | INSERT | admin בלבד (role = 'admin') |
| `course-media: admin update` | UPDATE | admin בלבד |
| `course-media: public read` | SELECT | public |

**SQL להרצה בSupabase SQL Editor (אם עדיין לא הורץ — נדרש לעלות תמונות בהגדרות אדמין):**
```sql
DROP POLICY IF EXISTS "course-media: admin upload" ON storage.objects;
CREATE POLICY "course-media: admin upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'course-media'
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "course-media: admin update" ON storage.objects;
CREATE POLICY "course-media: admin update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'course-media'
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "course-media: public read" ON storage.objects;
CREATE POLICY "course-media: public read"
ON storage.objects FOR SELECT USING (bucket_id = 'course-media');
```

---

## Auth

- **Login:** `/login` (כולל "שכחתי סיסמה" — **אין** "הירשמי")
- **Forgot/Reset:** `/forgot-password` → מייל → **`/auth/callback?next=/reset-password`** → `/reset-password`
- **Signup:** Cardcom webhook בלבד. `/signup` מפנה ל-`/login`.
- **Role** נקרא מ-JWT claim (`user_role`) — גיבוי: קריאת DB.
- **subscription_tier** נשמר ב-profiles — יוגדר ע"י Cardcom webhook בעתיד.

### PKCE Auth Callback — `app/auth/callback/route.ts`

`@supabase/ssr` v0.5.x עובד עם PKCE flow. כשמשתמש לוחץ על קישור איפוס סיסמה, Supabase שולח `?code=xxx`. הcode חייב להיות מוחלף לsession בצד השרת לפני שהדף `reset-password` טוען.

**הפתרון:**
- `forgot-password` שולח `redirectTo: /auth/callback?next=/reset-password`
- `/auth/callback` מקבל את ה-code, מחליף אותו לsession (server-side), ומנתב לדף הנכון
- `/reset-password` טוען עם session קיים ←  `getSession()` מחזיר session תקין

**אסור לשנות את הארכיטקטורה הזו** — חזרה ל-`redirectTo: .../reset-password` ישירות = session=null = "הקישור פג תוקפו".

---

## וידאו

```ts
type VideoProvider = "youtube" | "vimeo" | "direct"
```
`parseVideoUrl(url)` — מחלץ ID ומזהה ספק מכל URL (Shorts, youtu.be, vimeo.com, ישיר).

### גישה לוידאו — לוגיקת tier:
| tier משתמש | גישה לקורסי basic | גישה לקורסי pro | גישה לקורסי elite |
|------------|-------------------|-----------------|-------------------|
| null (אין מנוי) | ✗ | ✗ | ✗ |
| basic | ✓ | ✗ | ✗ |
| pro | ✓ | ✓ | ✗ |
| elite | ✓ | ✓ | ✓ |
| admin | ✓ | ✓ | ✓ |
| כל משתמש | שיעורי `is_free_preview` בלבד | | |

### ניווט שיעורים ב-CoursePage:
- לחיצה על שיעור → שיעור חינמי: video_id מהcontext מיידית. שיעור נעול: קריאה ל-`/api/lesson-video`.
- כפתורי "שיעור קודם / שיעור הבא" מתחת לנגן — עובדים גם בזמן ניגון.
- אם tier לא מספיק → מסך "אין גישה" + כפתור שדרוג.

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
6. `??` לא מתמודד עם string ריק — להשתמש ב-`||` כשיש fallback על strings.
7. Storage RLS חייב policies מפורשות לכל נתיב — bucket פרטי = 403 ללא policy.

---

## פרופיל אישי (`/profile`) ✅ הושלם

- שדות ב-`profiles`: `first_name`, `last_name`, `years_experience`, `bio`, `photo_url`
- עריכה + העלאת תמונה לStorage (`course-media/avatars/{user_id}.ext`)
- `lib/supabase/profile-db.ts`: `dbGetMyProfile`, `dbUpdateProfile`, `dbUploadAvatar`, `dbGetProfileById`
- **SQL שחייב לרוץ בSupabase (אם עדיין לא):**
  ```sql
  ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS years_experience integer,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS photo_url text;
  ```

---

## קהילה (`/community`) ✅ הושלם

- טבלת `community_posts` (Supabase Realtime)
- תצוגה: avatar + שם + זמן + תוכן + attachment
- כתיבה + העלאת קובץ/תמונה (`community-media/`)
- Reply / thread (`parent_id`)
- אדמין: pin + הודעות מנוהל (`is_admin_post`)
- הרשאות: מנויים בלבד (role = 'user' | 'admin')
- `lib/supabase/community-db.ts`: CRUD + Realtime

---

## מצב פתוח — SQL migrations שחייבים לרוץ

```sql
-- subscription_tier (שלב 3א)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS subscription_tier text
  CHECK (subscription_tier IN ('basic','pro','elite') OR subscription_tier IS NULL);

-- user_progress (שלב 3ג)
CREATE TABLE IF NOT EXISTS user_progress (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id        text NOT NULL,
  course_id        text NOT NULL,
  progress_seconds integer NOT NULL DEFAULT 0,
  completed        boolean NOT NULL DEFAULT false,
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own progress" ON user_progress
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

---

## מפת עבודה — סטטוס

### ✅ שלב 1 — פרופיל אישי (הושלם)
### ✅ שלב 2 — קהילה (הושלם)

### 🔄 שלב 3 — אבטחה קריטית

**3א ✅ RLS לפי tier על וידאו (הושלם)**
- `/api/lesson-video` — API route שבודק auth + tier בשרת לפני החזרת video_id
- לוגיקת TIER_RANK: basic=1, pro=2, elite=3
- CoursePage מבקש video_id מה-API בלבד (לא מהcontext) לשיעורים נעולים

**3ב ⬜ Signed URLs לסרטוני direct**
- Supabase Storage יספק URLs שפוקעים אחרי שעה
- לא ניתן לשתף / להוריד
- יש להוסיף פונקציה `dbGetSignedVideoUrl(path)` ולעדכן `/api/lesson-video`

**3ג ✅ המשך צפייה (הושלם)**
- `user_progress` table עם RLS — כל משתמש רואה רק את ההתקדמות שלו
- YouTube IFrame API: שומר כל 10 שניות בניגון, ובהשהייה/סיום
- כפתור Play מציג "המשך מ-MM:SS" כשיש נקודת המשך שמורה
- פס צבעוני בתחתית כל שיעור ברשימה מציג % צפייה

### ~~שלב 4~~ — לא רלוונטי (כל הסרטונים YouTube/Vimeo — יש להם נגן מובנה)
- Progress bar גרירה
- בקרת עוצמת קול + mute
- מסך מלא (כפתור fullscreen מובנה)
- מובייל: כפתור Play גדול, touch-friendly
- איכות: 360/720/1080 (רק לdirect)

### 🔄 שלב 5 — אבטחה נוספת

**✅ Security headers** — `next.config.js`: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS, CSP (YouTube/Vimeo/Supabase מורשים)

**✅ Rate limiting** — `lib/rate-limit.ts`: in-memory, 30 req/min per IP על `/api/lesson-video`, 429 על חריגה. לסקייל גדול → Upstash Redis.

**✅ CORS** — להגדיר ידנית ב-Supabase Dashboard: Storage → Settings → CORS → הוסף `https://natalieartsi.com` + URL ה-Vercel.

**⬜ הגבלת sessions** — מניעת שיתוף סיסמה (עתידי)

### ✅ שיפורים נוספים (אחרי course-redesign)

**`CourseData`** — שדות חדשים: `price?: number`, `purchaseUrl?: string` — נשמרים ב-meta JSON של `description` (ללא SQL migration).

**`CourseCard`** — מחיר דינמי מ-`course.price` (לא hardcoded). כפתור "רכישת קורס" → `course.purchaseUrl` (חיצוני) אם מוגדר, אחרת `/checkout/[slug]`.

**`Sidebar`** — סגירה אוטומטית בלחיצה על `/courses` בדסקטופ בלבד.

**גריד קורסים בדף הבית (דסקטופ)** — 4 עמודות × 3 שורות (0-4 / 4-8 / 8-12), `gap-5`. הוסרה "כרטיס קולקציה" (symmetry breaker).

**HeroSection (דף הבית)** — תמונת הרקע `heroBg` **תמיד** מוצגת. וידאו (כשמוגדר `heroType: "video"`) מוצג כ-overlay מעל התמונה. כך אם הוידאו נכשל בטעינה — התמונה נראית. **אסור לחזור למבנה ישן (תמונה OR וידאו) — גורם להירו שחור לחלוטין כשהוידאו שבור.**

**`courses-context.tsx`** — localStorage key עלה ל-`hbm-courses-v4` (ניקה cache ישן).

**NATALIE.photoUrl** — עודכן ל-webp URL חדש: `https://i.imghippo.com/files/be7340nfw.webp`. שים לב: קורסים שמורים ב-Supabase ישמרו את ה-URL מה-meta JSON — לשינוי גלובלי יש לפתוח כל קורס ב-admin ולשמור מחדש.

---

### ✅ עיצוב מחדש דף קורס (branch feat/course-redesign — מוזג ל-main)

**`app/courses/[slug]/page.tsx`** — שכתוב מלא של ה-UI, הלוגיקה לא שונתה:
- **דסקטופ Hero:** MasterClass split — תמונה שמאל (46%), מידע+CTA ימין (56%), `dir="ltr"` על container לפריסה צפויה
- **מובייל Hero:** Apple TV — `height: 100svh`, תמונה `object-cover`, gradient כבד מלמטה, טקסט בתחתית
- **SkillsSection:** `grid-cols-2 md:grid-cols-4` — אם `course.highlights` מוגדר → שימוש בהם; אחרת fallback ל-4 שיעורים ראשונים
- **נגן:** `md:max-w-2xl`, label לפי auth: לא מחובר = "צפי בטיזר", מחובר/אדמין = "צפי בפרק הראשון"
- **רשימת שיעורים:** BBC Maestro — מספר + thumbnail (YouTube auto / lessonThumbnails / course.image) + כותרת + זמן + progress
- **Nav שיעורים:** תמיד גלוי — לפני בחירה: "הבא" = שיעור ראשון
- **Instructor:** סקשיין עצמאי בתחתית (במקום sidebar)

**`lib/courses-data.ts`:**
- `CourseHighlight { id, text, imageUrl }` — ממשק חדש
- `highlights?: CourseHighlight[]` ו-`lessonThumbnails?: Record<string, string>` ב-`CourseData`

**`lib/supabase/courses-db.ts`:**
- `highlights` ו-`lessonThumbnails` נשמרים ב-meta JSON של `description` (ללא migration SQL)

**`app/admin/page.tsx`:**
- סקשיין "✨ מה תגלי בקורס" — הוסף/מחק כרטיסים, טקסט חופשי, YouTube thumbnail picker (טיזר + 4 שיעורים ראשונים) + upload ידני
- Per-lesson thumbnail picker — YouTube auto-frames (1.jpg/2.jpg/3.jpg/hqdefault) + upload + URL

**גיבוי לפני שינויים:** `git tag v1.0-mvp` + branch `backup/pre-redesign` ב-GitHub

---

### ✅ MVP — פריטים שהושלמו
- **og:image דינמי** — `app/(marketing)/layout.tsx` server component, מושך מ-`site_content.og_image`. אדמין → הגדרות → upload + preview.
- **ייצוא CSV** — אדמין → משתמשות → "ייצוא לאקסל", עם BOM לעברית ב-Excel.
- **דף 404** — `app/not-found.tsx` מותאם מותג עם CTA.
- **Favicon + Apple Icon** — `app/icon.tsx` + `app/apple-icon.tsx` דינמיים (ImageResponse), אות "נ" על רקע כהה.
- **PWA Manifest** — `app/manifest.ts` — RTL, theme #C4857A, standalone.
- **Mobile touch targets** — מינימום 44px לפי Apple HIG, viewport meta עם theme-color.
- **Admin mobile nav** — horizontal scroll tabs לאדמין במובייל.
- **Admin CSV export** — `exportUsersCSV()` עם first_name, last_name, email, role, subscription_tier.
- **סידור קורסים** — `sort_order` על טבלת courses. אדמין: drag-and-drop + חיצי ↑↓ + כפתור "שמור סדר". `dbFetchCourses` מסודר לפי sort_order ASC. `dbUpdateCourseOrder()` שומר batch לDB.
- **מועדפים** — `user_favorites` table (RLS). `lib/supabase/favorites-db.ts` + `lib/favorites-context.tsx` (FavoritesProvider, useFavorites). לב ♡ על כל כרטיס קורס — ורוד כשמסומן, אופטימיסטי. דף `/favorites`. "מועדפים" בתפריט sidebar.
- **"המנטורית שלך"** — הוחלף "המדריכה" בכל דפי הקורסים.
- **תמונות קורס — Blurred Dual-Layer** — `CinematicHeader` משתמש בשתי שכבות: (1) רקע: אותה תמונה `object-cover` עם `blur(40px) brightness(0.22) saturate(0.5) scale(1.1)` — ממלא צדדים ריקים. (2) פורטרט: `height:100%, width:auto, objectFit:contain` — מוצג שלם ללא חיתוך. גישה זו פותרת את בעיית תמונות פורטרט 3:4 בcontainer landscape. **אסור לשנות ל-`object-top` / `object-center` — נוסו ונכשלו (הראו קודקוד/תקרה).** `CourseData.videoThumbnailUrl` — שדה אופציונלי לthumbnail מותאם לנגן (16:9), נשמר ב-JSON של `description`. Admin: upload + preview + URL בטופס עריכה. Fallback ל-`course.image`.
- **CTA חכם בדף קורס** — לא מחובר: "הצטרפי עכשיו". מחובר+גישה/אדמין: ✓ "גישה מלאה" (ירוק). מחובר+tier נמוך: "שדרגי מנוי ↑". `userTier` נטען מ-`profiles.subscription_tier`.
- **תמונות נעלמות — תיקון** — `NatalieSection` מושכת תמונה מ-`dbGetNatalie()` (לא hardcoded). `DEFAULT_NATALIE.photo` ריק — Admin חייב להעלות מה-panel. `ComingSoonCard` מטפל ב-empty string + onError (**`src=""`** לא מפעיל onError בChrome — תמיד בדוק `!item.image || imgError`).

### ⬜ MVP — נשאר לעשות (לפי עדיפות)

**🔴 קריטי:**
- [ ] **Cardcom webhook** — `app/api/webhooks/cardcom/route.ts`: אמת HMAC, צור משתמש ב-Supabase Auth, עדכן subscription_tier, שלח מייל Resend. *ממתין לcredentials מCardcom.*
- [ ] **Resend — מייל ברוכה הבאה** — תבנית HTML עם שם + סיסמה זמנית. *ממתין ל-Cardcom webhook.*

**🟡 חשוב — ✅ הושלם:**
- ✅ כפתור "שלחי ב-WhatsApp" בדשבורד — deep link + טקסט הזמנה — דומיין: `https://www.natalieartsi.com`
- ✅ Empty states — קורסים (skeleton + אין תוצאות + אין קורסים כלל)
- ✅ Loading skeletons — shimmer cards בדף הקורסים, `loading` state ב-CoursesContext
- ✅ RTL scrollbars — rose branded, WebKit + Firefox
- ✅ תיקוני מובייל — ראה סעיף מובייל למטה

**🟢 פחות דחוף:**
- [ ] Meta Pixel + Google Analytics
- [ ] Error boundaries
- [ ] הגבלת sessions

---

## מובייל — מצב נוכחי ✅

### Sidebar (`components/layout/Sidebar.tsx`)

**desktop:** sidebar צף מימין, collapsible. כניסה/יציאה + "שדרג מנוי" בתחתית.

**mobile bottom nav — לוגיקה לפי מצב auth:**

| מצב | פריטים |
|-----|--------|
| לא מחובר | בית · קורסים · מנוי · **כניסה** (ורדרד) |
| מחובר (user) | בית · קורסים · דשבורד · קהילה · **יציאה** |
| אדמין | בית · קורסים · **ניהול** · קהילה · יציאה |

- קהילה **תמיד** מוצגת למחוברים (כולל אדמין)
- אדמין רואה "ניהול" במקום "דשבורד"
- Auth state נטען async מ-Supabase — יכול להיות delay קצר בהצגה

### דף הבית — תיקוני מובייל

- **Hero title:** `text-5xl` במובייל (היה `text-4xl`) + overlay כהה יותר (62%, היה 42%) + `text-shadow`
- **גריד קורסים:** גריד שטוח `grid-cols-2` אחד למובייל (`md:hidden`) — ללא "יתומים". דסקטופ שומר מבנה row1/row2/rest עם מחיצת נטלי (`hidden md:grid`).
- **תמונות — fallback:** `onError` handlers על תמונת נטלי ובקארדים "בקרוב" — מציג placeholder ורדרד בעת כישלון טעינה. שורש הבעיה: `i.imghippo.com` לא אמין — **לטפל: להעלות את תמונת נטלי לSupabase Storage** ולעדכן `NATALIE_PROFILE` בשורה 18 של `app/(marketing)/page.tsx`.

### ⬜ שלב 6 — עתידי (לא נוגעים כרגע)
- Cardcom webhook + יצירת משתמשים אוטומטית + `subscription_tier`
- Widevine DRM
- IP limiting
- מערכת מייל יומי
- RLS per-course (`course_purchases` table)
