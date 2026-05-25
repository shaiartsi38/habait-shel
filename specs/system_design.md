# System Design — הבית של המאפרים

**Stack:** Next.js 14 (App Router) · Supabase (Auth + PostgreSQL + Storage) · Tailwind CSS + Shadcn/ui · Framer Motion  
**Date:** 2026-05-20

---

## Subscription Tiers

| Tier  | Price (monthly) | Price (annual) | Access |
|-------|----------------|----------------|--------|
| Basic | ₪109 / month   | ₪960 / year    | All published courses, community |
| Pro   | ₪179 / month   | ₪1,680 / year  | Basic + early access, 1:1 Q&A, downloads |
| Elite | ₪299 / month   | ₪2,880 / year  | Pro + live sessions, private community, certificates |

---

## Supabase Schema

### `profiles`
Extends `auth.users`. Created automatically via trigger on signup.

```sql
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  full_name       TEXT,
  avatar_url      TEXT,
  phone           TEXT,
  
  -- Subscription
  subscription_tier    TEXT CHECK (subscription_tier IN ('basic', 'pro', 'elite')) DEFAULT NULL,
  subscription_status  TEXT CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid')) DEFAULT NULL,
  subscription_cycle   TEXT CHECK (subscription_cycle IN ('monthly', 'annual')) DEFAULT NULL,
  subscription_start   TIMESTAMPTZ,
  subscription_end     TIMESTAMPTZ,
  
  -- Payment (Stripe)
  stripe_customer_id   TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  
  -- Meta
  is_admin        BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

### `subscription_history`
Full audit trail of all subscription events (upgrades, downgrades, cancellations).

```sql
CREATE TABLE subscription_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  tier            TEXT NOT NULL CHECK (tier IN ('basic', 'pro', 'elite')),
  status          TEXT NOT NULL,
  cycle           TEXT CHECK (cycle IN ('monthly', 'annual')),
  price_paid      NUMERIC(10,2),
  currency        TEXT DEFAULT 'ILS',
  
  stripe_event_id TEXT,
  
  started_at      TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own history" ON subscription_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins full access" ON subscription_history USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
```

---

### `courses`

```sql
CREATE TABLE courses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  
  -- Content (Hebrew primary)
  title           TEXT NOT NULL,           -- Hebrew
  subtitle        TEXT,                    -- Hebrew
  description     TEXT,                    -- Hebrew, markdown
  
  -- Media
  thumbnail_url   TEXT,
  trailer_video_url TEXT,
  trailer_provider TEXT CHECK (trailer_provider IN ('youtube', 'vimeo', 'mux')),
  trailer_video_id  TEXT,
  
  -- Access control
  required_tier   TEXT NOT NULL DEFAULT 'basic' CHECK (required_tier IN ('basic', 'pro', 'elite')),
  
  -- Publishing
  is_published    BOOLEAN DEFAULT FALSE,
  release_date    DATE,
  
  -- Display
  duration_minutes INTEGER,
  lesson_count     INTEGER DEFAULT 0,      -- denormalized, updated by trigger
  sort_order       INTEGER DEFAULT 0,
  tags             TEXT[] DEFAULT '{}',
  
  -- Stats (denormalized)
  enrolled_count   INTEGER DEFAULT 0,
  avg_rating       NUMERIC(3,2),
  
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
-- Published courses visible to all authenticated users with active subscription
CREATE POLICY "Subscribers can view published courses" ON courses FOR SELECT USING (
  is_published = TRUE AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND subscription_status = 'active'
  )
);
-- Admins see all
CREATE POLICY "Admins full access" ON courses USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
```

---

### `lessons`

```sql
CREATE TABLE lessons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Content
  title           TEXT NOT NULL,           -- Hebrew
  description     TEXT,                    -- Hebrew
  
  -- Video
  video_provider  TEXT CHECK (video_provider IN ('youtube', 'vimeo', 'mux')),
  video_id        TEXT,                    -- provider-specific ID
  video_url       TEXT,                    -- direct URL fallback
  duration_seconds INTEGER,
  
  -- Display
  thumbnail_url   TEXT,
  sort_order      INTEGER DEFAULT 0,
  is_free_preview BOOLEAN DEFAULT FALSE,   -- visible without subscription
  
  -- Attachments (PDF downloads, Pro+ only)
  attachments     JSONB DEFAULT '[]',      -- [{name, url, tier_required}]
  
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Free previews visible to all" ON lessons FOR SELECT USING (is_free_preview = TRUE);
CREATE POLICY "Subscribers can view all lessons" ON lessons FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN courses c ON c.id = course_id
    WHERE p.id = auth.uid()
    AND p.subscription_status = 'active'
    AND (
      c.required_tier = 'basic'
      OR (c.required_tier = 'pro' AND p.subscription_tier IN ('pro', 'elite'))
      OR (c.required_tier = 'elite' AND p.subscription_tier = 'elite')
    )
  )
);
CREATE POLICY "Admins full access" ON lessons USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
```

---

### `lesson_progress`
Tracks watch progress per user per lesson.

```sql
CREATE TABLE lesson_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id       UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  
  watched_seconds  INTEGER DEFAULT 0,
  duration_seconds INTEGER,               -- snapshot at time of watch
  completed        BOOLEAN DEFAULT FALSE,  -- true when watched >= 90%
  completed_at     TIMESTAMPTZ,
  last_watched_at  TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE (user_id, lesson_id)
);

ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own progress" ON lesson_progress USING (auth.uid() = user_id);
```

---

### `community_scores`
Leaderboard engine. Points accumulate from course completions, streaks, and engagement.

```sql
CREATE TYPE community_level AS ENUM ('bronze', 'silver', 'gold', 'diamond');

CREATE TABLE community_scores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Points breakdown
  total_points     INTEGER DEFAULT 0,
  courses_completed INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  streak_days      INTEGER DEFAULT 0,
  streak_best      INTEGER DEFAULT 0,
  last_activity_date DATE,
  
  -- Level (computed, updated by trigger)
  level           community_level DEFAULT 'bronze',
  
  -- Badges: [{id, name_he, icon, awarded_at}]
  badges          JSONB DEFAULT '[]',
  
  -- Leaderboard position (computed weekly via cron)
  rank_weekly     INTEGER,
  rank_monthly    INTEGER,
  rank_alltime    INTEGER,
  
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Level thresholds: bronze 0-499, silver 500-1999, gold 2000-4999, diamond 5000+
CREATE OR REPLACE FUNCTION update_community_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.level := CASE
    WHEN NEW.total_points >= 5000 THEN 'diamond'::community_level
    WHEN NEW.total_points >= 2000 THEN 'gold'::community_level
    WHEN NEW.total_points >= 500  THEN 'silver'::community_level
    ELSE 'bronze'::community_level
  END;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER community_level_trigger
  BEFORE UPDATE ON community_scores
  FOR EACH ROW EXECUTE FUNCTION update_community_level();

ALTER TABLE community_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All subscribers can view leaderboard" ON community_scores FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND subscription_status = 'active')
);
CREATE POLICY "Users manage own scores" ON community_scores FOR UPDATE USING (auth.uid() = user_id);
```

---

### `cart_abandonment`
Analytics for recovering users who reach the checkout flow but don't subscribe.

```sql
CREATE TABLE cart_abandonment (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity (may be anonymous initially)
  session_id      TEXT NOT NULL,           -- browser session fingerprint
  user_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  email           TEXT,                    -- captured from email field before abandonment
  
  -- What they were buying
  selected_tier   TEXT CHECK (selected_tier IN ('basic', 'pro', 'elite')),
  selected_cycle  TEXT CHECK (selected_cycle IN ('monthly', 'annual')),
  price_shown     NUMERIC(10,2),
  
  -- Where they dropped off
  funnel_step     TEXT NOT NULL CHECK (funnel_step IN (
    'pricing_view',     -- viewed pricing page
    'tier_selected',    -- clicked a plan
    'email_entered',    -- typed email in checkout
    'payment_initiated',-- reached payment form
    'payment_failed'    -- card declined / error
  )),
  
  -- Recovery
  abandoned_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recovery_email_sent_at TIMESTAMPTZ,
  recovery_email_count   INTEGER DEFAULT 0,
  recovered_at         TIMESTAMPTZ,        -- set when they eventually subscribe
  recovered_user_id    UUID REFERENCES profiles(id),
  
  -- Attribution
  utm_source      TEXT,
  utm_medium      TEXT,
  utm_campaign    TEXT,
  utm_content     TEXT,
  referrer        TEXT,
  
  -- Device
  user_agent      TEXT,
  country         TEXT DEFAULT 'IL',
  
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS for users — this is admin-only analytics
ALTER TABLE cart_abandonment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins only" ON cart_abandonment USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Index for recovery email queries
CREATE INDEX idx_cart_abandonment_email ON cart_abandonment(email) WHERE email IS NOT NULL;
CREATE INDEX idx_cart_abandonment_recovery ON cart_abandonment(recovery_email_sent_at, recovered_at)
  WHERE recovered_at IS NULL AND recovery_email_count < 3;
```

---

## Storage Buckets

```sql
-- Course thumbnails & images (public read)
INSERT INTO storage.buckets (id, name, public) VALUES ('course-media', 'course-media', true);

-- User avatars (public read)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Lesson attachments/PDFs (authenticated, tier-gated via signed URLs)
INSERT INTO storage.buckets (id, name, public) VALUES ('lesson-attachments', 'lesson-attachments', false);
```

---

## Points System

| Action | Points |
|--------|--------|
| Complete a lesson | +10 |
| Complete a course | +100 |
| 7-day streak | +50 |
| 30-day streak | +200 |
| First login of day | +5 |
| Leave a comment | +2 |
| Refer a friend (converts) | +500 |

---

## Key Relationships

```
auth.users (Supabase built-in)
    └── profiles (1:1)
            ├── subscription_history (1:many)
            ├── lesson_progress (1:many) ──→ lessons ──→ courses
            └── community_scores (1:1)

courses
    └── lessons (1:many)
            └── lesson_progress (1:many) ──→ profiles

cart_abandonment (standalone analytics, weak FK to profiles)
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server-side only
STRIPE_SECRET_KEY=                   # server-side only
STRIPE_WEBHOOK_SECRET=               # server-side only
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=https://habait-hamefarem.co.il
```
