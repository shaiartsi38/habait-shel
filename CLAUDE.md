# CLAUDE.md — הבית של המאפרים

## כלל עבודה מחייב

**אל תשנה שום דבר בקוד, בגרפיקה, בסקשיינים או בכל מה שקשור לפרוייקט אלא אם כן שי אומר זאת במפורש.**
אם יש ספק, התלבטות, או שאלה האם מותר — **שואלים קודם, לא עושים.**
זה כולל: שינויי עיצוב, שינויי לוגיקה, הוספת פיצ'רים, ריפקטור, ואפילו "שיפורים קטנים".

---

## הפרוייקט

**שם:** הבית של המאפרים  
**בעלים:** שי ארצי (`shaiartsi26@gmail.com`)  
**תיאור:** פלטפורמת מנויים ליוצרת תוכן איפור — נטלי ארצי. מכירת קורסי וידאו בשלוש רמות מנוי (Basic / Pro / Elite).

---

## URLs ואינפרסטרקטורה

| שירות | כתובת / פרטים |
|--------|--------------|
| **Vercel (פרודקשן)** | `https://habait-shel-git-main-shai-habait-shel.vercel.app` |
| **דומיין עתידי** | `habait-hamefarem.co.il` |
| **GitHub** | `git@github.com:shaiartsi38/habait-shel.git` |
| **Supabase** | ב-Vercel Environment Variables |
| **Git remote** | SSH (מפתח: `~/.ssh/github_habait`) — push עובד בלי tokens |

### פרסום שינויי קוד
```bash
git add <files> && git commit -m "..." && git push origin main
```
Vercel מפרסם אוטומטית תוך ~2 דקות.

### שינויי תוכן (קורסים, שיעורים, טקסטים)
דרך ממשק האדמין → Supabase → מיידי. **אין צורך ב-git.**

---

## Tech Stack

| טכנולוגיה | גרסה / פרטים |
|-----------|-------------|
| Next.js | 14.2.18, App Router |
| TypeScript | strict |
| Tailwind CSS | RTL, גופנים עבריים |
| Framer Motion | אנימציות — אסור לשבור |
| Supabase | Auth + DB (PostgreSQL) + Storage |
| Radix UI | Dialog ועוד |
| Lucide React | אייקונים |

---

## ארכיטקטורה

### שתי שכבות נפרדות
1. **קוד ופיצ'רים** → GitHub → Vercel → deploy
2. **תוכן (קורסים, דפי נחיתה, המלצות, FAQ)** → Supabase → מיידי

### תיקיות עיקריות
```
app/
  (marketing)/page.tsx     ← דף הבית הציבורי
  (auth)/                  ← login, forgot-password, reset-password
  admin/page.tsx           ← CMS מלא לאדמין
  courses/[slug]/page.tsx  ← דף קורס בודד
  dashboard/               ← אזור אישי למנויים
components/
  admin/ContentEditors.tsx ← עורכי תוכן: הירו, המלצות, FAQ, סקשיינים
  layout/                  ← ShellLayout, Sidebar
lib/
  courses-data.ts          ← נתוני קורסים סטטיים (fallback)
  courses-context.tsx      ← Context גלובלי לקורסים
  supabase/
    courses-db.ts          ← CRUD קורסים + שיעורים + upload
    content-db.ts          ← CRUD תוכן דף הבית (hero, testimonials, FAQ)
    client.ts / server.ts  ← Supabase clients
middleware.ts              ← הגנת routes לפי role
```

---

## Supabase — מסד הנתונים

### טבלאות

**`profiles`** — משתמשים
- `id` (uuid, FK → auth.users)
- `role` (text): `"user"` / `"admin"`
- `email` (text)

**`courses`** — קורסים
- `id` (text, NOT uuid — חשוב! IDs כמו "mascara", "bride")
- `slug`, `title`, `subtitle`
- `thumbnail_url`, `trailer_video_id`, `trailer_provider`
- `required_tier` (text): `"basic"` / `"pro"` / `"elite"`
- `is_published`, `show_on_home`
- `tags` (text[]): כולל `cat:עיניים`, `diff:beginner`, `new:true`
- `description` (text, JSON): `{ shortDesc, fullDesc, instructor }`

**`lessons`** — שיעורים
- `id` (text)
- `course_id` (text, FK → courses.id)
- `title`, `video_id`, `video_provider`
- `duration_seconds`, `is_free_preview`, `sort_order`

### RLS — Row Level Security
- **חשוב מאוד:** לא להשתמש ב-`EXISTS (SELECT 1 FROM profiles ...)` בתוך policy על `profiles` — גורם ל-recursion!
- יש פונקציה `get_my_role()` עם `SECURITY DEFINER` שעוקפת את הבעיה
- כל policy על admin משתמשת ב-`get_my_role() = 'admin'`

### Storage
- Bucket: `course-media`
- `thumbnails/` — תמונות קורסים
- `videos/` — סרטונים ישירים

---

## Auth

- **Login:** `/login`
- **Forgot Password:** `/forgot-password` → מייל → `/reset-password`
- **Signup:** מנוי דרך Cardcom webhook בלבד — `/signup` מפנה ל-`/login`
- **Role** נקרא מ-JWT claim (`user_role`) — גיבוי: קריאת DB
- **Admin:** `role = 'admin'` בטבלת `profiles` — **אסור להרדקוד אימייל**

---

## סוגי וידאו (`VideoProvider`)

```ts
type VideoProvider = "youtube" | "vimeo" | "direct"
```

- **YouTube:** embed רגיל — `youtube.com/embed/{id}`
- **Vimeo:** `player.vimeo.com/video/{id}`
- **Direct:** תג `<video src={url}>`

`parseVideoUrl(url)` — מחלץ ID ומזהה ספק אוטומטית מכל פורמט URL.

---

## נתוני Fallback

`lib/courses-data.ts` — מכיל `COURSES[]` סטטי עם 8 קורסים. כשאין Supabase מוגדר, המערכת נופלת לנתונים אלו. **אסור למחוק.**

---

## Admin CMS

הממשק ב-`/admin` מאפשר ניהול מלא:
- **קורסים:** הוסף/ערוך/מחק, פרסום, thumbnail, טיזר, שיעורים
- **דף הבית:** הירו (תמונה/וידאו), המלצות (עם תמונה), סקשיינים, FAQ
- **מנויים:** עמוד המנויים
- **נטלי:** עמוד "אודות"
- **משתמשות:** רשימת users + שינוי role
- **אנליטיקס:** סטטיסטיקות בסיסיות

ה-admin **לא** מחליף את ה-global context אוטומטית — רק עם שמירה מפורשת.

---

## כללי עיצוב

- **שפה:** עברית RTL
- **פלטת צבעים:** `#080608` (רקע), `#FFF8F5` (טקסט), `#C4857A` (אקסנט/rose)
- **גופן:** עברי bold לכותרות
- **אנימציות:** Framer Motion — חובה לשמור אותן
- **אין emoji** בקוד אלא אם המשתמש ביקש

---

## דברים שנלמדו / בעיות שנפתרו

1. **`courses.id` הוא `text`, לא `uuid`** — IDs כמו "mascara". שינוי הדפוס דרש: drop policies → drop FK → alter type → recreate.
2. **RLS recursion על `profiles`** — נפתר עם `get_my_role() SECURITY DEFINER`.
3. **שגיאות Supabase** — plain objects, לא `Error` instances. תמיד להשתמש ב-`errMsg(e)` ולא `e instanceof Error`.
4. **SSH key** — `~/.ssh/github_habait` מוגדר. `git push origin main` עובד ישירות.

---

## ENV Variables (ב-Vercel)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL
```
