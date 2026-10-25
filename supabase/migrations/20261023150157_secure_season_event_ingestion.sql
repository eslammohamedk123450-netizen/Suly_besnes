drop function if exists public.record_season_event(uuid, text, text, text, jsonb);

create or replace function public.record_season_event(
  p_user_id uuid,
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
  v_score public.season_scores;
  v_points bigint;
begin
  if p_user_id is null then raise exception 'invalid_user'; end if;
  if p_event_type <> 'login_reward' then raise exception 'event_not_allowed'; end if;
  if p_event_key is null or p_event_key !~ ('^login:' || p_user_id::text || ':[0-9]{4}-[0-9]{2}-[0-9]{2}$') then raise exception 'invalid_event_key'; end if;
  if not exists (select 1 from public.game_seasons where id = p_season_id and status = 'active' and now() between starts_at and ends_at) then raise exception 'season_not_active'; end if;

  v_points := 5;
  insert into public.season_score_events (season_id, user_id, event_key, event_type, points, source_id, metadata)
  values (p_season_id, p_user_id, p_event_key, p_event_type, v_points, p_source_id, coalesce(p_metadata, '{}'::jsonb))
  on conflict (season_id, user_id, event_key) do nothing;

  insert into public.season_scores (season_id, user_id, score, completed_challenges, verified_points, public_name, updated_at)
  select p_season_id, p_user_id, coalesce(sum(e.points), 0), count(*) filter (where e.event_type like 'daily_%' or e.event_type like 'weekly_%')::integer,
    coalesce(sum(e.points), 0), left(coalesce((select gp.player_name from public.game_profiles gp where gp.user_id = p_user_id limit 1), 'مستثمر'), 80), now()
  from public.season_score_events e where e.season_id = p_season_id and e.user_id = p_user_id
  on conflict (season_id, user_id) do update set score = excluded.score, completed_challenges = excluded.completed_challenges, verified_points = excluded.verified_points, public_name = excluded.public_name, updated_at = now()
  returning * into v_score;
  return v_score;
end;
$$;

revoke execute on function public.record_season_event(uuid, uuid, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.record_season_event(uuid, uuid, text, text, text, jsonb) to service_role;
