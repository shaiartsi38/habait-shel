-- ═══════════════════════════════════════════════════════
-- הבית של המאפרים — Supabase Schema + RLS מלא
-- הרץ בסדר הזה ב: Supabase → SQL Editor → New query
-- ═══════════════════════════════════════════════════════

-- ── 1. טבלת פרופילים ────────────────────────────────────
create table if not exists public.profiles (
  id           uuid        references auth.users(id) on delete cascade primary key,
  email        text        unique not null,
  full_name    text,
  avatar_url   text,
  role         text        not null default 'user'
                           check (role in ('user', 'admin')),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ── 2. RLS — הפעלה ───────────────────────────────────────
alter table public.profiles enable row level security;

-- SELECT: כל משתמש קורא רק את הפרופיל שלו
create policy "profiles: self select"
  on public.profiles for select
  using (auth.uid() = id);

-- SELECT: אדמין קורא את כל הפרופילים
create policy "profiles: admin select all"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- INSERT: אסור ישירות — רק ה-Trigger מכניס
-- (המדיניות נועלת INSERT מכל משתמש; הטריגר רץ כ-security definer)
create policy "profiles: no direct insert"
  on public.profiles for insert
  with check (false);

-- UPDATE: משתמש מעדכן רק שדות שאינם role
create policy "profiles: self update non-role"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.profiles where id = auth.uid())
  );

-- UPDATE: אדמין מעדכן כל שדה בכל פרופיל (כולל role)
create policy "profiles: admin update all"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- DELETE: אסור לכולם מלבד Service Role (מחיקה דרך cascade בלבד)
create policy "profiles: no delete"
  on public.profiles for delete
  using (false);

-- ── 3. Trigger — פרופיל אוטומטי בהרשמה ─────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    -- ניתן לשלוח role='admin' דרך server-side webhook עתידי
    coalesce(new.raw_user_meta_data->>'role', 'user')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 4. JWT Custom Claims — role בתוך ה-Token ─────────────
-- מאפשר ל-Middleware לקרוא את ה-role ישירות מה-JWT (ללא DB query)
-- לאחר יצירת הפונקציה: Supabase → Auth → Hooks → Customize Access Token
-- → הגדר function = auth.custom_access_token_hook
create or replace function auth.custom_access_token_hook(event jsonb)
returns jsonb as $$
declare
  claims    jsonb;
  user_role text;
begin
  select role into user_role
  from public.profiles
  where id = (event->>'user_id')::uuid;

  claims := event->'claims';
  claims := jsonb_set(claims, '{user_role}', to_jsonb(coalesce(user_role, 'user')));
  return jsonb_set(event, '{claims}', claims);
end;
$$ language plpgsql security definer stable;

grant execute on function auth.custom_access_token_hook to supabase_auth_admin;
revoke execute on function auth.custom_access_token_hook from authenticated, anon, public;

-- ── 5. תבנית RLS לטבלאות תוכן עתידיות (קורסים, שיעורים) ─
-- הפעל על כל טבלת תוכן שתיצור:
--
-- alter table public.courses enable row level security;
--
-- -- כולם קוראים תוכן מפורסם
-- create policy "courses: public read"
--   on public.courses for select
--   using (is_published = true);
--
-- -- INSERT: רק אדמין
-- create policy "courses: admin insert"
--   on public.courses for insert
--   with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
--
-- -- UPDATE: רק אדמין
-- create policy "courses: admin update"
--   on public.courses for update
--   using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
--
-- -- DELETE: רק אדמין
-- create policy "courses: admin delete"
--   on public.courses for delete
--   using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ═══════════════════════════════════════════════════════
-- שלב אחרון: לאחר יצירת משתמש האדמין דרך Supabase Auth
-- הרץ שורה זו כדי להעלות אותו לתפקיד אדמין:
--
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'shaiartsi26@gmail.com';
-- ═══════════════════════════════════════════════════════
