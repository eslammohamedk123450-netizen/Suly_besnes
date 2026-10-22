create table if not exists public.game_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  player_name text not null default 'المستثمر الجديد',
  game_day integer not null default 1,
  save_data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.game_profiles enable row level security;

drop policy if exists "Users can read their own game profile" on public.game_profiles;
create policy "Users can read their own game profile"
  on public.game_profiles for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own game profile" on public.game_profiles;
create policy "Users can insert their own game profile"
  on public.game_profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own game profile" on public.game_profiles;
create policy "Users can update their own game profile"
  on public.game_profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists game_profiles_updated_at_idx on public.game_profiles(updated_at);
