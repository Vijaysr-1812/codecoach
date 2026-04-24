-- =============================================================
-- Exam submissions + personalized roadmaps.
-- Run this in Supabase SQL Editor after 20260419_exam_schema.sql.
-- Safe to re-run: drops & recreates these tables (no user data yet).
-- =============================================================

drop table if exists public.user_roadmaps cascade;
drop table if exists public.exam_submissions cascade;

create table public.exam_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_id uuid references public.exams(id) on delete set null,
  score int not null default 0,
  speed int not null default 0,
  efficiency int not null default 0,
  time_taken int not null default 0,
  level_assigned text,
  language text,
  question_results jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

create index exam_submissions_user_idx
  on public.exam_submissions (user_id, created_at desc);

create table public.user_roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  submission_id uuid references public.exam_submissions(id) on delete cascade,
  level text,
  roadmap_json jsonb not null,
  created_at timestamptz default now()
);

create index user_roadmaps_user_latest_idx
  on public.user_roadmaps (user_id, created_at desc);

-- RLS: users can only read/write their own rows.
alter table public.exam_submissions enable row level security;
alter table public.user_roadmaps     enable row level security;

create policy "Users read own submissions"
  on public.exam_submissions for select
  using (auth.uid() = user_id);

create policy "Users insert own submissions"
  on public.exam_submissions for insert
  with check (auth.uid() = user_id);

create policy "Users read own roadmaps"
  on public.user_roadmaps for select
  using (auth.uid() = user_id);

create policy "Users insert own roadmaps"
  on public.user_roadmaps for insert
  with check (auth.uid() = user_id);
