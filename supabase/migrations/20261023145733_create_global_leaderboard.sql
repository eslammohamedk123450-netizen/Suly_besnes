-- Global leaderboard foundation for Business Empire.
-- Client roles never receive direct write access to score/event tables.

create table if not exists public.game_seasons (
  id uuid primary key default gen_random_uuid(),
  season_key text not null unique,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null check (status in ('scheduled', 'active', 'finalized')),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists public.season_scores (
  season_id uuid not null references public.game_seasons(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  score bigint not null default 0 check (score >= 0),
  completed_challenges integer not null default 0 check (completed_challenges >= 0),
  verified_points bigint not null default 0 check (verified_points >= 0),
  public_name text not null default 'مستثمر',
  badge_key text,
  updated_at timestamptz not null default now(),
  primary key (season_id, user_id)
);

create table if not exists public.season_score_events (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.game_seasons(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_key text not null,
  event_type text not null,
  points bigint not null check (points > 0),
  source_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (season_id, user_id, event_key)
);

create index if not exists season_scores_rank_idx
  on public.season_scores (season_id, score desc, updated_at asc);
create index if not exists season_score_events_user_idx
  on public.season_score_events (season_id, user_id, created_at desc);

alter table public.game_seasons enable row level security;
alter table public.season_scores enable row level security;
alter table public.season_score_events enable row level security;

revoke all on table public.game_seasons from anon, authenticated;
revoke all on table public.season_scores from anon, authenticated;
revoke all on table public.season_score_events from anon, authenticated;

-- Public read surfaces expose only safe fields. The base tables remain private.
drop view if exists public.visible_game_seasons;
create view public.visible_game_seasons as
select id, season_key, title, starts_at, ends_at, status
from public.game_seasons
where status in ('active', 'finalized');

drop view if exists public.global_leaderboard;
create view public.global_leaderboard as
select
  ss.season_id,
  row_number() over (partition by ss.season_id order by ss.score desc, ss.updated_at asc, ss.user_id) as rank,
  ss.public_name,
  ss.score,
  ss.completed_challenges,
  ss.badge_key,
  ss.updated_at
from public.season_scores ss
join public.game_seasons gs on gs.id = ss.season_id
where gs.status in ('active', 'finalized');

grant select on public.visible_game_seasons to anon, authenticated;
grant select on public.global_leaderboard to anon, authenticated;

create or replace function public.record_season_event(
  p_season_id uuid,
  p_event_key text,
  p_event_type text,
  p_source_id text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns public.season_scores
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_points bigint;
  v_score public.season_scores;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if p_event_key is null or length(trim(p_event_key)) < 3 or length(p_event_key) > 160 then
    raise exception 'invalid_event_key';
  end if;

  if not exists (
    select 1
    from public.game_seasons
    where id = p_season_id
      and status = 'active'
      and now() between starts_at and ends_at
  ) then
    raise exception 'season_not_active';
  end if;

  v_points := case p_event_type
    when 'daily_empire' then 10
    when 'daily_market' then 15
    when 'daily_auction' then 15
    when 'weekly_builder' then 45
    when 'weekly_operator' then 35
    when 'weekly_investor' then 30
    when 'login_reward' then 5
    else 0
  end;

  if v_points <= 0 then
    raise exception 'event_not_allowed';
  end if;

  insert into public.season_score_events (
    season_id, user_id, event_key, event_type, points, source_id, metadata
  )
  values (
    p_season_id, v_user_id, trim(p_event_key), p_event_type, v_points, p_source_id, coalesce(p_metadata, '{}'::jsonb)
  )
  on conflict (season_id, user_id, event_key) do nothing;

  insert into public.season_scores (
    season_id, user_id, score, completed_challenges, verified_points, public_name, updated_at
  )
  select
    p_season_id,
    v_user_id,
    coalesce(sum(e.points), 0),
    count(*) filter (where e.event_type like 'daily_%' or e.event_type like 'weekly_%')::integer,
    coalesce(sum(e.points), 0),
    left(coalesce((select gp.player_name from public.game_profiles gp where gp.user_id = v_user_id limit 1), 'مستثمر'), 80),
    now()
  from public.season_score_events e
  where e.season_id = p_season_id
    and e.user_id = v_user_id
  on conflict (season_id, user_id)
  do update set
    score = excluded.score,
    completed_challenges = excluded.completed_challenges,
    verified_points = excluded.verified_points,
    public_name = excluded.public_name,
    updated_at = now()
  returning * into v_score;

  return v_score;
end;
$$;

create or replace function public.get_global_leaderboard(
  p_season_id uuid,
  p_limit integer default 100,
  p_offset integer default 0
)
returns table (
  rank bigint,
  public_name text,
  score bigint,
  completed_challenges integer,
  badge_key text,
  updated_at timestamptz
)
language sql
security invoker
set search_path = ''
as $$
  select rank, public_name, score, completed_challenges, badge_key, updated_at
  from public.global_leaderboard
  where season_id = p_season_id
  order by rank
  limit least(greatest(coalesce(p_limit, 100), 1), 100)
  offset greatest(coalesce(p_offset, 0), 0);
$$;

revoke execute on function public.record_season_event(uuid, text, text, text, jsonb) from public, anon;
grant execute on function public.record_season_event(uuid, text, text, text, jsonb) to authenticated;
revoke execute on function public.get_global_leaderboard(uuid, integer, integer) from public;
grant execute on function public.get_global_leaderboard(uuid, integer, integer) to anon, authenticated;

insert into public.game_seasons (season_key, title, starts_at, ends_at, status)
values ('expansion-season-1', 'موسم التوسع الأول', now(), now() + interval '30 days', 'active')
on conflict (season_key) do nothing;
