-- ═══════════════════════════════════════════════════════
-- הבית של המאפרים — Blog Posts Table
-- הרץ ב: Supabase → SQL Editor → New query
-- ═══════════════════════════════════════════════════════

-- ── 1. טבלת פוסטים ──────────────────────────────────────
create table if not exists public.blog_posts (
  id            uuid        primary key default gen_random_uuid(),
  title         text        not null,
  slug          text        not null unique,
  content       text        not null default '',
  excerpt       text        not null default '',
  cover_image   text,
  category      text        not null default 'כללי',
  status        text        not null default 'draft'
                            check (status in ('draft', 'published')),
  published_at  timestamptz,
  author_id     uuid        references public.profiles(id) on delete set null,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── 2. RLS ─────────────────────────────────────────────
alter table public.blog_posts enable row level security;

-- SELECT: כולם רואים פוסטים שפורסמו
create policy "blog_posts: public read published"
  on public.blog_posts for select
  using (status = 'published');

-- SELECT: אדמין רואה הכל (כולל טיוטות)
create policy "blog_posts: admin read all"
  on public.blog_posts for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- INSERT / UPDATE / DELETE: אדמין בלבד
create policy "blog_posts: admin insert"
  on public.blog_posts for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "blog_posts: admin update"
  on public.blog_posts for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "blog_posts: admin delete"
  on public.blog_posts for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ── 3. אינדקסים ─────────────────────────────────────────
create index if not exists blog_posts_slug_idx     on public.blog_posts (slug);
create index if not exists blog_posts_status_idx   on public.blog_posts (status);
create index if not exists blog_posts_published_idx on public.blog_posts (published_at desc);
