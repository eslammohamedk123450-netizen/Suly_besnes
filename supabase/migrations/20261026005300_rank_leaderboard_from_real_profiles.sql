-- Rank real authenticated players from their authoritative game_profiles snapshot.
-- season_scores remains a verified-points source, but no longer determines who appears
-- or the live progress aggregates shown in the public leaderboard.
create or replace function public.get_ranked_global_leaderboard(
  p_season_id uuid,
  p_category text default 'points',
  p_limit integer default 10
)
returns table (
  rank bigint,
  public_name text,
  score bigint,
  category_value bigint,
  completed_challenges integer,
  badge_key text,
  updated_at timestamptz,
  player_level integer,
  company_count integer,
  land_count integer,
  badge_count integer,
  is_current_player boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_limit integer := least(greatest(coalesce(p_limit, 10), 1), 10);
begin
  if p_category is null or p_category not in ('points', 'production', 'contracts', 'badges') then
    raise exception 'invalid_leaderboard_category';
  end if;

  if not exists (
    select 1
    from public.game_seasons as season
    where season.id = p_season_id
      and season.status in ('active', 'finalized')
  ) then
    raise exception 'season_not_visible';
  end if;

  return query
  with season_context as (
    select season.id, season.season_key
    from public.game_seasons as season
    where season.id = p_season_id
  ),
  metrics as (
    select
      profiles.user_id,
      left(coalesce(nullif(trim(profiles.player_name), ''), 'مستثمر'), 80) as public_name,
      greatest(
        coalesce(scores.score, 0),
        case
          when profiles.save_data -> 'season' ->> 'seasonId' = season_context.season_key
            and profiles.save_data -> 'season' ->> 'points' ~ '^[0-9]{1,12}$'
            then (profiles.save_data -> 'season' ->> 'points')::bigint
          else 0
        end
      ) as total_points,
      case
        when profiles.save_data -> 'season' ->> 'seasonId' = season_context.season_key
          and jsonb_typeof(profiles.save_data -> 'season' -> 'claimedChallengeKeys') = 'array'
          then jsonb_array_length(profiles.save_data -> 'season' -> 'claimedChallengeKeys')
        else coalesce(scores.completed_challenges, 0)
      end::integer as completed_challenges,
      scores.badge_key,
      profiles.updated_at,
      case
        when profiles.save_data ->> 'level' ~ '^[0-9]{1,5}$'
          then (profiles.save_data ->> 'level')::integer
        else 1
      end as player_level,
      case
        when jsonb_typeof(profiles.save_data -> 'companies') = 'array'
          then jsonb_array_length(profiles.save_data -> 'companies')
        else 0
      end::integer as company_count,
      case
        when jsonb_typeof(profiles.save_data -> 'lands') = 'array'
          then jsonb_array_length(profiles.save_data -> 'lands')
        else 0
      end::integer as land_count,
      case
        when jsonb_typeof(profiles.save_data -> 'badges') = 'array'
          then jsonb_array_length(profiles.save_data -> 'badges')
        else 0
      end::integer as badge_count,
      coalesce(production_metrics.production_count, 0)::bigint as production_count,
      coalesce(contract_metrics.contract_count, 0)::bigint as contract_count
    from public.game_profiles as profiles
    cross join season_context
    left join public.season_scores as scores
      on scores.season_id = season_context.id
      and scores.user_id = profiles.user_id
    left join lateral (
      select count(*) as production_count
      from jsonb_array_elements(
        case when jsonb_typeof(profiles.save_data -> 'productionOrders') = 'array'
          then profiles.save_data -> 'productionOrders'
          else '[]'::jsonb
        end
      ) as order_row
      where order_row ->> 'status' = 'completed'
    ) as production_metrics on true
    left join lateral (
      select count(*) as contract_count
      from jsonb_array_elements(
        case when jsonb_typeof(profiles.save_data -> 'contracts') = 'array'
          then profiles.save_data -> 'contracts'
          else '[]'::jsonb
        end
      ) as contract_row
      where contract_row ->> 'status' = 'completed'
    ) as contract_metrics on true
  ),
  ranked as (
    select
      metrics.*,
      case p_category
        when 'production' then metrics.production_count
        when 'contracts' then metrics.contract_count
        when 'badges' then metrics.badge_count::bigint
        else metrics.total_points
      end as category_value,
      row_number() over (
        order by
          case p_category
            when 'production' then metrics.production_count
            when 'contracts' then metrics.contract_count
            when 'badges' then metrics.badge_count::bigint
            else metrics.total_points
          end desc,
          metrics.total_points desc,
          metrics.updated_at asc,
          metrics.user_id asc
      ) as calculated_rank
    from metrics
  )
  select
    ranked.calculated_rank,
    ranked.public_name,
    ranked.total_points,
    ranked.category_value,
    ranked.completed_challenges,
    ranked.badge_key,
    ranked.updated_at,
    ranked.player_level,
    ranked.company_count,
    ranked.land_count,
    ranked.badge_count,
    ranked.user_id = auth.uid()
  from ranked
  where ranked.calculated_rank <= v_limit
     or ranked.user_id = auth.uid()
  order by ranked.calculated_rank;
end;
$$;

revoke execute on function public.get_ranked_global_leaderboard(uuid, text, integer) from public;
grant execute on function public.get_ranked_global_leaderboard(uuid, text, integer) to anon, authenticated;

comment on function public.get_ranked_global_leaderboard(uuid, text, integer) is
  'Ranks real game_profiles users from authoritative saved progress, with safe public aggregates only.';
