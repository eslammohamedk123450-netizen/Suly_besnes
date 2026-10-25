-- Authoritative game transaction ledger.
-- Clients cannot insert, update, or delete transactions or season points.
create table if not exists public.game_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  season_id uuid not null references public.game_seasons(id) on delete restrict,
  transaction_type text not null check (transaction_type in (
    'production_completed',
    'sale_completed',
    'contract_delivered',
    'auction_won'
  )),
  idempotency_key text not null,
  source_id text not null,
  points bigint not null check (points > 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key),
  unique (user_id, season_id, transaction_type, source_id)
);
create index if not exists game_transactions_season_rank_idx
  on public.game_transactions (season_id, points desc, created_at asc);
create index if not exists game_transactions_user_idx
  on public.game_transactions (user_id, created_at desc);
alter table public.game_transactions enable row level security;
revoke all on table public.game_transactions from anon, authenticated;

create or replace function public.record_verified_game_transaction(
  p_user_id uuid,
  p_season_id uuid,
  p_transaction_type text,
  p_idempotency_key text,
  p_source_id text,
  p_metadata jsonb default '{}'::jsonb
)
returns public.game_transactions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_points bigint;
  v_transaction public.game_transactions;
begin
  if p_user_id is null or p_season_id is null then
    raise exception 'invalid_transaction_identity';
  end if;
  if p_transaction_type not in ('production_completed', 'sale_completed', 'contract_delivered', 'auction_won') then
    raise exception 'transaction_type_not_allowed';
  end if;
  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 8 or length(p_idempotency_key) > 180 then
    raise exception 'invalid_idempotency_key';
  end if;
  if p_source_id is null or length(trim(p_source_id)) < 1 or length(p_source_id) > 180 then
    raise exception 'invalid_source_id';
  end if;
  if not exists (
    select 1 from public.game_seasons
    where id = p_season_id and status = 'active' and now() between starts_at and ends_at
  ) then
    raise exception 'season_not_active';
  end if;
  v_points := case p_transaction_type
    when 'production_completed' then 20
    when 'sale_completed' then 12
    when 'contract_delivered' then 30
    when 'auction_won' then 25
  end;
  insert into public.game_transactions (
    user_id, season_id, transaction_type, idempotency_key, source_id, points, metadata
  ) values (
    p_user_id, p_season_id, p_transaction_type, trim(p_idempotency_key), trim(p_source_id), v_points, coalesce(p_metadata, '{}'::jsonb)
  )
  on conflict (user_id, idempotency_key) do update
    set id = public.game_transactions.id
  returning * into v_transaction;
  insert into public.season_score_events (
    season_id, user_id, event_key, event_type, points, source_id, metadata
  ) values (
    p_season_id, p_user_id, 'verified:' || v_transaction.id::text,
    p_transaction_type, v_points, p_source_id, coalesce(p_metadata, '{}'::jsonb)
  ) on conflict (season_id, user_id, event_key) do nothing;
  insert into public.season_scores (
    season_id, user_id, score, completed_challenges, verified_points, public_name, updated_at
  )
  select
    p_season_id,
    p_user_id,
    coalesce(sum(e.points), 0),
    count(*) filter (where e.event_type like 'daily_%' or e.event_type like 'weekly_%' or e.event_type in ('production_completed', 'sale_completed', 'contract_delivered', 'auction_won'))::integer,
    coalesce(sum(e.points), 0),
    left(coalesce((select gp.player_name from public.game_profiles gp where gp.user_id = p_user_id limit 1), 'مستثمر'), 80),
    now()
  from public.season_score_events e
  where e.season_id = p_season_id and e.user_id = p_user_id
  on conflict (season_id, user_id) do update set
    score = excluded.score,
    completed_challenges = excluded.completed_challenges,
    verified_points = excluded.verified_points,
    public_name = excluded.public_name,
    updated_at = now();
  return v_transaction;
end;
$$;
revoke execute on function public.record_verified_game_transaction(uuid, uuid, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.record_verified_game_transaction(uuid, uuid, text, text, text, jsonb) to service_role;

-- The reward redemption RPC must not be callable by browser roles because it accepts save_data.
revoke execute on function public.redeem_reward_code(uuid, uuid, text, integer, jsonb) from public, anon, authenticated;
