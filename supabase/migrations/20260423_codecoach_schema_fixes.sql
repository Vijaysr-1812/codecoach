-- =============================================================
-- CodeCoach schema fixes for the roadmap progression bridge.
-- Safe to run after the consolidated schema in a fresh Supabase project.
-- =============================================================

create extension if not exists pgcrypto;

create table if not exists public.roadmap_progress (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  completed_topic_ids text[] not null default array[]::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_roadmap_progress_updated_at on public.roadmap_progress;
create trigger set_roadmap_progress_updated_at
before update on public.roadmap_progress
for each row
execute function public.set_updated_at();

alter table public.roadmap_progress enable row level security;

drop policy if exists "Users read own roadmap progress" on public.roadmap_progress;
create policy "Users read own roadmap progress"
on public.roadmap_progress
for select
using (auth.uid() = user_id);

drop policy if exists "Users insert own roadmap progress" on public.roadmap_progress;
create policy "Users insert own roadmap progress"
on public.roadmap_progress
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users update own roadmap progress" on public.roadmap_progress;
create policy "Users update own roadmap progress"
on public.roadmap_progress
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);
