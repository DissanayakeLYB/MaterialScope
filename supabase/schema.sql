-- ============================================================================
-- MaterialScope schema
--
-- Run this file in your Supabase project's SQL editor (Dashboard → SQL Editor
-- → New query → paste → Run). It creates the profiles and lesson_progress
-- tables, Row Level Security policies, and the triggers that keep them in
-- sync with auth.users.
--
-- Idempotent: safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Profiles — one row per auth user, created automatically on sign-up.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are readable by their owner" on public.profiles;
create policy "Profiles are readable by their owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Profiles are updatable by their owner" on public.profiles;
create policy "Profiles are updatable by their owner"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row on sign-up (also covers Google OAuth, which sets
-- raw_user_meta_data.full_name).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 2. Lesson progress — one row per (user, lesson).
--    quiz_score is a percentage (0-100), null until a quiz is completed.
-- ---------------------------------------------------------------------------
create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_slug text not null,
  completed_at timestamptz not null default now(),
  quiz_score numeric(5, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lesson_progress_user_lesson_key unique (user_id, lesson_slug)
);

alter table public.lesson_progress enable row level security;

-- Users can only read/write their own progress rows.
drop policy if exists "Users can read their own progress" on public.lesson_progress;
create policy "Users can read their own progress"
  on public.lesson_progress for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own progress" on public.lesson_progress;
create policy "Users can insert their own progress"
  on public.lesson_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own progress" on public.lesson_progress;
create policy "Users can update their own progress"
  on public.lesson_progress for update
  using (auth.uid() = user_id);

-- Keep updated_at fresh on writes.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists lesson_progress_touch_updated_at on public.lesson_progress;
create trigger lesson_progress_touch_updated_at
  before update on public.lesson_progress
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 3. Grants. RLS applies on top; the `authenticated` role can only touch its
--    own rows via the policies above. The `service_role` key (never used by
--    the app) bypasses RLS entirely.
-- ---------------------------------------------------------------------------
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.lesson_progress to authenticated;
