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
app/courses/[slug]/page.tsx           ← דף קורס + נגן + ניווט שיעורים
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
lib/courses-context.tsx               ← stale-while-revalidate: localStorage → Supabase ברקע
middleware.ts                         ← הגנת routes לפי role
```

---

## Supabase — Schema

**`profiles`:** `id` (uuid) · `role` ("user"/"admin") · `email` · `first_name` · `last_name` · `years_experience` · `bio` · `photo_url` · `subscription_tier` ("basic"/"pro"/"elite"/null)

**`courses`:** `id` (**text**, לא uuid!) · `slug` · `title` · `subtitle` · `thumbnail_url` · `trailer_video_id` · `trailer_provider` · `required_tier` · `is_published` · `tags` (text[]) · `description` (JSON: shortDesc, fullDesc, instructor) · `show_on_home` · `duration_minutes` · `lesson_count` · `updated_at`

**`lessons`:** `id` (text) · `course_id` (text, FK) · `title` · `video_id` · `video_provider` · `duration_seconds` · `is_free_preview` · `sort_order`

**`community_posts`:** `id` · `user_id` · `content` · `parent_id` · `is_pinned` · `is_admin_post` · `attachment_url` · `attachment_type` · `attachment_name` · `created_at`

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
- **API route מאובטח** `/api/lesson-video` — כל גישה לוידאו עוברת דרכו ונבדקת בשרת.

### Storage RLS — policies קיימות ב-course-media:
| Policy | פעולה | מי |
|--------|--------|-----|
| `community media upload` | INSERT | authenticated |
| `community media read` | SELECT | public |
| `thumbnails public read` | SELECT | public |
| `avatars public read` | SELECT | public |
| `videos authenticated read` | SELECT | authenticated (אם הוחל) |

---

## Auth

- **Login:** `/login` (כולל "שכחתי סיסמה" — **אין** "הירשמי")
- **Forgot/Reset:** `/forgot-password` → מייל → `/reset-password`
- **Signup:** Cardcom webhook בלבד. `/signup` מפנה ל-`/login`.
- **Role** נקרא מ-JWT claim (`user_role`) — גיבוי: קריאת DB.
- **subscription_tier** נשמר ב-profiles — יוגדר ע"י Cardcom webhook בעתיד.

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

**3ג ⬜ המשך צפייה**
- שמירת מיקום נוכחי ב-`user_progress` table + טעינה בכניסה חוזרת לשיעור
- שדות: `user_id, lesson_id, progress_seconds, completed, updated_at`

### ⬜ שלב 4 — שיפורי נגן וידאו (לסרטוני direct, עד המעבר לVimeo)
- Progress bar גרירה
- בקרת עוצמת קול + mute
- מסך מלא (כפתור fullscreen מובנה)
- מובייל: כפתור Play גדול, touch-friendly
- איכות: 360/720/1080 (רק לdirect)

### ⬜ שלב 5 — אבטחה נוספת (לאחר השקה)
- Security headers ב-`next.config.js`
- Rate limiting על API routes
- CORS על bucket course-media
- הגבלת sessions (מניעת שיתוף סיסמה)

### ⬜ שלב 6 — עתידי (לא נוגעים כרגע)
- Cardcom webhook + יצירת משתמשים אוטומטית + `subscription_tier`
- Widevine DRM
- IP limiting
- מערכת מייל יומי
- RLS per-course (`course_purchases` table)
