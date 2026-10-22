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

create table if not exists public.reward_code_redemptions (
  code_id uuid primary key,
  redeemed_by uuid not null references auth.users(id) on delete cascade,
  redeemed_at timestamptz not null default now()
);

alter table public.reward_code_redemptions enable row level security;
revoke all on table public.reward_code_redemptions from anon, authenticated;

create or replace function public.redeem_reward_code(
  p_code_id uuid,
  p_user_id uuid,
  p_player_name text,
  p_game_day integer,
  p_save_data jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'not authorized';
  end if;
  insert into public.reward_code_redemptions (code_id, redeemed_by)
  values (p_code_id, p_user_id)
  on conflict (code_id) do nothing;
  if not found then
    return false;
  end if;
  insert into public.game_profiles (user_id, player_name, game_day, save_data, updated_at)
  values (p_user_id, p_player_name, p_game_day, p_save_data, now())
  on conflict (user_id) do update set
    player_name = excluded.player_name,
    game_day = excluded.game_day,
    save_data = excluded.save_data,
    updated_at = excluded.updated_at;
  return true;
end;
$$;

grant execute on function public.redeem_reward_code(uuid, uuid, text, integer, jsonb) to authenticated;
