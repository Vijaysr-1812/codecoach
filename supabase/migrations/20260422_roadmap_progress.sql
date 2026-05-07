-- =============================================================
-- Roadmap node completion state.
-- Practice writes completed topic IDs here after accepted output.
-- =============================================================

create table if not exists public.roadmap_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  completed_topic_ids text[] not null default array[]::text[],
  updated_at timestamptz default now()
);

alter table public.roadmap_progress enable row level security;

drop policy if exists "Users read own roadmap progress" on public.roadmap_progress;
create policy "Users read own roadmap progress"
  on public.roadmap_progress for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own roadmap progress" on public.roadmap_progress;
create policy "Users insert own roadmap progress"
  on public.roadmap_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own roadmap progress" on public.roadmap_progress;
create policy "Users update own roadmap progress"
  on public.roadmap_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
