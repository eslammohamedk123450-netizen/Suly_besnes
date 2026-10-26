-- Live public leaderboard metrics are derived only from synchronized profiles.
-- Never expose user IDs, save_data, balances, or individual asset details.
create or replace function public.leaderboard_json_num(p_obj jsonb, p_key text, p_default numeric default 0)
returns numeric
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_text text;
begin
  v_text := p_obj ->> p_key;
  if v_text is not null and v_text ~ '^-?[0-9]{1,15}(\.[0-9]{1,4})?$' then
    return v_text::numeric;
  end if;
  return p_default;
end;
$$;

create or replace function public.leaderboard_profile_net_worth(p_profile jsonb)
returns bigint
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_items jsonb;
  v_item jsonb;
  v_linked_land jsonb;
  v_total numeric := 0;
  v_land numeric;
  v_equipment numeric;
  v_upgrades numeric;
  v_condition numeric;
  v_liabilities numeric := 0;
begin
  v_total := public.leaderboard_json_num(p_profile, 'bankBalance', 0)
    + round(public.leaderboard_json_num(p_profile, 'goldGrams', 0) * 85);

  v_items := case when pg_catalog.jsonb_typeof(p_profile -> 'assets') = 'array' then p_profile -> 'assets' else '[]'::jsonb end;
  for v_item in select value from pg_catalog.jsonb_array_elements(v_items) as a(value) loop
    v_total := v_total + public.leaderboard_json_num(v_item, 'value', 0);
  end loop;

  v_items := case when pg_catalog.jsonb_typeof(p_profile -> 'lands') = 'array' then p_profile -> 'lands' else '[]'::jsonb end;
  for v_item in select value from pg_catalog.jsonb_array_elements(v_items) as a(value) loop
    if not exists (
      select 1 from pg_catalog.jsonb_array_elements(
        case when pg_catalog.jsonb_typeof(p_profile -> 'companies') = 'array' then p_profile -> 'companies' else '[]'::jsonb end
      ) as c(value) where c.value ->> 'landId' = v_item ->> 'id'
    ) then
      v_land := public.leaderboard_json_num(v_item, 'purchasePrice', 0)
        * (1 + public.leaderboard_json_num(v_item, 'upgradeLevel', 1) * 0.15);
      v_total := v_total + round(v_land);
    end if;
  end loop;

  v_items := case when pg_catalog.jsonb_typeof(p_profile -> 'companies') = 'array' then p_profile -> 'companies' else '[]'::jsonb end;
  for v_item in select value from pg_catalog.jsonb_array_elements(v_items) as a(value) loop
    v_linked_land := '{}'::jsonb;
    select l.value into v_linked_land
      from pg_catalog.jsonb_array_elements(
        case when pg_catalog.jsonb_typeof(p_profile -> 'lands') = 'array' then p_profile -> 'lands' else '[]'::jsonb end
      ) as l(value)
      where l.value ->> 'id' = v_item ->> 'landId'
      limit 1;
    v_land := case when v_linked_land is null then 0 else round(
      public.leaderboard_json_num(v_linked_land, 'purchasePrice', 0)
      * (1 + public.leaderboard_json_num(v_linked_land, 'upgradeLevel', 1) * 0.15)
    ) end;
    v_equipment := public.leaderboard_json_num(v_item, 'operatingCostPerDay', 120) * 100
      + public.leaderboard_json_num(v_item, 'energyCapacity', 80) * 450;
    v_upgrades := greatest(0, public.leaderboard_json_num(v_item, 'upgradeLevel', 1) - 1) * 22000;
    v_condition := greatest(0, least(100, public.leaderboard_json_num(v_item, 'maintenanceCondition', 100))) / 100;
    v_total := v_total + greatest(15000, round(v_land + (v_equipment + v_upgrades) * v_condition));
  end loop;

  v_items := case when pg_catalog.jsonb_typeof(p_profile -> 'inventory') = 'array' then p_profile -> 'inventory' else '[]'::jsonb end;
  for v_item in select value from pg_catalog.jsonb_array_elements(v_items) as a(value) loop
    v_total := v_total + public.leaderboard_json_num(v_item, 'quantity', 0) * public.leaderboard_json_num(v_item, 'unitCost', 0);
  end loop;

  v_items := case when pg_catalog.jsonb_typeof(p_profile -> 'investments') = 'array' then p_profile -> 'investments' else '[]'::jsonb end;
  for v_item in select value from pg_catalog.jsonb_array_elements(v_items) as a(value) loop
    if v_item ->> 'status' = 'active' then v_total := v_total + public.leaderboard_json_num(v_item, 'principal', 0); end if;
  end loop;
  v_items := case when pg_catalog.jsonb_typeof(p_profile #> '{banking,deposits}') = 'array' then p_profile #> '{banking,deposits}' else '[]'::jsonb end;
  for v_item in select value from pg_catalog.jsonb_array_elements(v_items) as a(value) loop
    if v_item ->> 'status' = 'active' then v_total := v_total + public.leaderboard_json_num(v_item, 'principal', 0); end if;
  end loop;

  v_liabilities := public.leaderboard_json_num(p_profile, 'payables', 0);
  v_items := case when pg_catalog.jsonb_typeof(p_profile -> 'staff') = 'array' then p_profile -> 'staff' else '[]'::jsonb end;
  for v_item in select value from pg_catalog.jsonb_array_elements(v_items) as a(value) loop
    if v_item ->> 'status' = 'active' then v_liabilities := v_liabilities + public.leaderboard_json_num(v_item, 'unpaidSalary', 0); end if;
  end loop;
  v_items := case when pg_catalog.jsonb_typeof(p_profile #> '{banking,loans}') = 'array' then p_profile #> '{banking,loans}' else '[]'::jsonb end;
  for v_item in select value from pg_catalog.jsonb_array_elements(v_items) as a(value) loop
    if v_item ->> 'status' = 'active' then v_liabilities := v_liabilities + public.leaderboard_json_num(v_item, 'remainingBalance', 0); end if;
  end loop;
  return greatest(0, round(v_total - v_liabilities))::bigint;
exception when others then
  return 0;
end;
$$;

revoke all on function public.leaderboard_json_num(jsonb, text, numeric) from public, anon, authenticated;
revoke all on function public.leaderboard_profile_net_worth(jsonb) from public, anon, authenticated;

create or replace function public.get_ranked_global_leaderboard(
  p_season_id uuid,
  p_category text default 'season',
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
  if p_category is null or p_category not in ('points', 'production', 'contracts', 'badges', 'net_worth', 'prestige', 'sovereignty', 'season') then
    raise exception 'invalid_leaderboard_category';
  end if;
  if not exists (select 1 from public.game_seasons s where s.id = p_season_id and s.status in ('active', 'finalized')) then
    raise exception 'season_not_visible';
  end if;

  return query
  with season_context as (
    select s.id, s.season_key from public.game_seasons s where s.id = p_season_id
  ), metrics as (
    select
      gp.user_id,
      left(coalesce(nullif(trim(gp.player_name), ''), 'مستثمر'), 80) as public_name,
      greatest(coalesce(ss.score, 0), case
        when gp.save_data -> 'season' ->> 'seasonId' = sc.season_key
          and gp.save_data -> 'season' ->> 'points' ~ '^[0-9]{1,12}$'
          then (gp.save_data -> 'season' ->> 'points')::bigint else 0 end) as season_points,
      case when gp.save_data -> 'season' ->> 'seasonId' = sc.season_key
        and pg_catalog.jsonb_typeof(gp.save_data -> 'season' -> 'claimedChallengeKeys') = 'array'
        then pg_catalog.jsonb_array_length(gp.save_data -> 'season' -> 'claimedChallengeKeys')
        else coalesce(ss.completed_challenges, 0) end::integer as completed_challenges,
      ss.badge_key,
      gp.updated_at,
      case when gp.save_data ->> 'level' ~ '^[0-9]{1,5}$' then (gp.save_data ->> 'level')::integer else 1 end as player_level,
      case when pg_catalog.jsonb_typeof(gp.save_data -> 'companies') = 'array' then pg_catalog.jsonb_array_length(gp.save_data -> 'companies') else 0 end::integer as company_count,
      case when pg_catalog.jsonb_typeof(gp.save_data -> 'lands') = 'array' then pg_catalog.jsonb_array_length(gp.save_data -> 'lands') else 0 end::integer as land_count,
      case when pg_catalog.jsonb_typeof(gp.save_data -> 'badges') = 'array' then pg_catalog.jsonb_array_length(gp.save_data -> 'badges') else 0 end::integer as badge_count,
      coalesce((select count(*) from pg_catalog.jsonb_array_elements(case when pg_catalog.jsonb_typeof(gp.save_data -> 'productionOrders') = 'array' then gp.save_data -> 'productionOrders' else '[]'::jsonb end) o(value) where o.value ->> 'status' = 'completed'),0)::bigint as production_count,
      coalesce((select count(*) from pg_catalog.jsonb_array_elements(case when pg_catalog.jsonb_typeof(gp.save_data -> 'contracts') = 'array' then gp.save_data -> 'contracts' else '[]'::jsonb end) c(value) where c.value ->> 'status' = 'completed'),0)::bigint as contract_count,
      public.leaderboard_profile_net_worth(gp.save_data) as net_worth,
      (case when pg_catalog.jsonb_typeof(gp.save_data -> 'badges') = 'array' then pg_catalog.jsonb_array_length(gp.save_data -> 'badges') else 0 end * 250
        + case when pg_catalog.jsonb_typeof(gp.save_data -> 'achievements') = 'array' then pg_catalog.jsonb_array_length(gp.save_data -> 'achievements') else 0 end * 100
        + greatest(0, public.leaderboard_json_num(gp.save_data, 'reputation', 50)) * 10)::bigint as prestige_points,
      (case when pg_catalog.jsonb_typeof(gp.save_data -> 'companies') = 'array' then pg_catalog.jsonb_array_length(gp.save_data -> 'companies') else 0 end * 100
        + case when pg_catalog.jsonb_typeof(gp.save_data -> 'lands') = 'array' then pg_catalog.jsonb_array_length(gp.save_data -> 'lands') else 0 end * 25
        + coalesce((select count(distinct c.value ->> 'countryId') from pg_catalog.jsonb_array_elements(case when pg_catalog.jsonb_typeof(gp.save_data -> 'companies') = 'array' then gp.save_data -> 'companies' else '[]'::jsonb end) c(value) where c.value ->> 'countryId' is not null and c.value ->> 'countryId' <> gp.save_data ->> 'countryId'),0) * 500
        + greatest(0, public.leaderboard_json_num(gp.save_data, 'reputation', 50)) * 5)::bigint as sovereignty_points
    from public.game_profiles gp
    cross join season_context sc
    left join public.season_scores ss on ss.season_id = sc.id and ss.user_id = gp.user_id
  ), ranked as (
    select m.*,
      case p_category
        when 'production' then m.production_count
        when 'contracts' then m.contract_count
        when 'badges' then m.badge_count::bigint
        when 'net_worth' then m.net_worth
        when 'prestige' then m.prestige_points
        when 'sovereignty' then m.sovereignty_points
        else m.season_points end as category_value,
      row_number() over (order by
        case p_category
          when 'production' then m.production_count
          when 'contracts' then m.contract_count
          when 'badges' then m.badge_count::bigint
          when 'net_worth' then m.net_worth
          when 'prestige' then m.prestige_points
          when 'sovereignty' then m.sovereignty_points
          else m.season_points end desc,
        m.season_points desc, m.updated_at asc, m.user_id asc) as calculated_rank
    from metrics m
  )
  select r.calculated_rank, r.public_name, r.season_points, r.category_value,
    r.completed_challenges, r.badge_key, r.updated_at, r.player_level,
    r.company_count, r.land_count, r.badge_count, r.user_id = auth.uid()
  from ranked r
  where r.calculated_rank <= v_limit or r.user_id = auth.uid()
  order by r.calculated_rank;
end;
$$;

revoke execute on function public.get_ranked_global_leaderboard(uuid, text, integer) from public;
grant execute on function public.get_ranked_global_leaderboard(uuid, text, integer) to anon, authenticated;
comment on function public.get_ranked_global_leaderboard(uuid, text, integer) is
  'Ranks real synchronized player profiles by season points, net worth, prestige and economic sovereignty. Returns no identifiers or raw saves.';
