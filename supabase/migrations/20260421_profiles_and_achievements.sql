-- =============================================================
-- Profiles + achievements tables.
-- Idempotent: safe to run even if `profiles` already exists on
-- the remote (created via earlier dashboard-applied migration).
-- =============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  current_skill_level text default 'Beginner',
  total_problems int not null default 0,
  streak_count int not null default 0,
  created_at timestamptz default now()
);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Leaderboard join needs public read of usernames.
drop policy if exists "Public read usernames" on public.profiles;
create policy "Public read usernames"
  on public.profiles for select
  using (true);

-- Achievements: one row per (user, achievement_name).
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_name text not null,
  earned_at timestamptz default now(),
  unique (user_id, achievement_name)
);

create index if not exists achievements_user_idx
  on public.achievements (user_id, earned_at desc);

alter table public.achievements enable row level security;

drop policy if exists "Users read own achievements" on public.achievements;
create policy "Users read own achievements"
  on public.achievements for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own achievements" on public.achievements;
create policy "Users insert own achievements"
  on public.achievements for insert
  with check (auth.uid() = user_id);
