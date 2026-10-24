-- Public leaderboard RPC: return only safe profile aggregates, never raw save_data or financial fields.
-- The current authenticated player's rank is included even when it falls below the top ten.
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
  with metrics as (
    select
      scores.season_id,
      scores.user_id,
      scores.public_name,
      scores.score as total_points,
      scores.completed_challenges,
      scores.badge_key,
      scores.updated_at,
      coalesce(transaction_counts.production_count, 0)::bigint as production_count,
      coalesce(transaction_counts.contract_count, 0)::bigint as contract_count,
      case
        when jsonb_typeof(profiles.save_data -> 'badges') = 'array'
          then jsonb_array_length(profiles.save_data -> 'badges')
        else 0
      end::bigint as badge_count,
      case
        when profiles.save_data ->> 'level' ~ '^[0-9]{1,5}$'
          then (profiles.save_data ->> 'level')::integer
        else 1
      end as player_level,
      case
        when jsonb_typeof(profiles.save_data -> 'companies') = 'array'
          then jsonb_array_length(profiles.save_data -> 'companies')
        else 0
      end as company_count,
      case
        when jsonb_typeof(profiles.save_data -> 'lands') = 'array'
          then jsonb_array_length(profiles.save_data -> 'lands')
        else 0
      end as land_count
    from public.season_scores as scores
    left join public.game_profiles as profiles on profiles.user_id = scores.user_id
    left join lateral (
      select
        count(*) filter (where transactions.transaction_type = 'production_completed') as production_count,
        count(*) filter (where transactions.transaction_type = 'contract_delivered') as contract_count
      from public.game_transactions as transactions
      where transactions.season_id = scores.season_id
        and transactions.user_id = scores.user_id
    ) as transaction_counts on true
    where scores.season_id = p_season_id
  ), ranked as (
    select
      metrics.*,
      case p_category
        when 'production' then metrics.production_count
        when 'contracts' then metrics.contract_count
        when 'badges' then metrics.badge_count
        else metrics.total_points
      end as category_value,
      row_number() over (
        order by
          case p_category
            when 'production' then metrics.production_count
            when 'contracts' then metrics.contract_count
            when 'badges' then metrics.badge_count
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
    ranked.badge_count::integer,
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
  'Returns top ten public leaderboard aggregates by category and the caller current rank; excludes raw profile and financial data.';
