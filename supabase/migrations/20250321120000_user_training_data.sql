-- Per-user training program (routines) and logged workout sessions.
-- Run in Supabase: SQL Editor → New query → paste → Run.

create table if not exists public.user_training_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  routines jsonb not null default '[]'::jsonb,
  workout_history jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_training_data enable row level security;

create policy "user_training_data_select_own"
  on public.user_training_data
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "user_training_data_insert_own"
  on public.user_training_data
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "user_training_data_update_own"
  on public.user_training_data
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Required so signed-in clients (PostgREST role "authenticated") can touch the table.
-- Without this you get: permission denied for table user_training_data
grant select, insert, update, delete on table public.user_training_data to authenticated;
grant all on table public.user_training_data to service_role;
