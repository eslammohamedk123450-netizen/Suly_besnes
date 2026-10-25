-- Reward codes are verified by the Edge Function; this RPC only accepts its
-- authenticated user id and the verified cash/gold totals. Never accept a client profile.
create table if not exists public.reward_code_redemptions (
  code_id uuid primary key,
  redeemed_by uuid not null references auth.users(id) on delete cascade,
  redeemed_at timestamptz not null default now()
);

alter table public.reward_code_redemptions enable row level security;
revoke all on table public.reward_code_redemptions from public, anon, authenticated;

-- Remove the legacy RPC, which accepted a caller-supplied save_data document.
drop function if exists public.redeem_reward_code(uuid, uuid, text, integer, jsonb);
drop function if exists public.redeem_reward_code(uuid, uuid, bigint, numeric);

create function public.redeem_reward_code(
  p_code_id uuid,
  p_user_id uuid,
  p_cash bigint,
  p_gold numeric
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile jsonb;
  v_redeemed_ids jsonb;
  v_ledger jsonb;
  v_now timestamptz := clock_timestamp();
  v_rows integer;
  v_cash numeric;
  v_gold numeric;
  v_gold_basis numeric;
  v_country_id jsonb;
  v_entry jsonb;
begin
  if p_user_id is null or p_code_id is null then
    raise exception 'invalid_reward_identity';
  end if;
  if p_cash is null or p_cash < 0 or p_cash > 1000000
     or p_gold is null or p_gold < 0 or p_gold > 1000000
     or (p_cash = 0 and p_gold = 0) then
    raise exception 'invalid_reward_amounts';
  end if;

  -- Lock the authoritative profile so concurrent updates cannot overwrite rewards.
  select gp.save_data
    into v_profile
    from public.game_profiles as gp
    where gp.user_id = p_user_id
    for update;
  if not found then
    raise exception 'profile_not_found';
  end if;
  if jsonb_typeof(v_profile) is distinct from 'object'
     or jsonb_typeof(v_profile->'bankBalance') is distinct from 'number'
     or jsonb_typeof(v_profile->'goldGrams') is distinct from 'number'
     or jsonb_typeof(v_profile->'goldCostBasis') is distinct from 'number'
     or jsonb_typeof(v_profile->'ledger') is distinct from 'array'
     or jsonb_typeof(v_profile->'finances') is distinct from 'object'
     or jsonb_typeof(v_profile#>'{finances,totalRevenue}') is distinct from 'number'
     or jsonb_typeof(v_profile#>'{finances,netProfit}') is distinct from 'number'
     or jsonb_typeof(v_profile#>'{finances,totalExpenses}') is distinct from 'number'
     or jsonb_typeof(v_profile->'redeemedCodeIds') is distinct from 'array'
     or jsonb_typeof(v_profile->'countryId') is distinct from 'string' then
    raise exception 'invalid_profile_data';
  end if;

  v_redeemed_ids := v_profile->'redeemedCodeIds';
  if exists (
    select 1
    from jsonb_array_elements_text(v_redeemed_ids) as redeemed(value)
    where lower(redeemed.value) = p_code_id::text
  ) then
    raise exception 'code_already_redeemed';
  end if;

  -- The primary key prevents use by every other account as well as retries.
  insert into public.reward_code_redemptions (code_id, redeemed_by, redeemed_at)
  values (p_code_id, p_user_id, v_now)
  on conflict (code_id) do nothing;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    raise exception 'code_already_redeemed';
  end if;

  v_cash := p_cash::numeric;
  v_gold := p_gold;
  v_gold_basis := v_gold * 6000;
  v_country_id := v_profile->'countryId';
  v_ledger := v_profile->'ledger';

  -- Match the existing SULY1 reward model: cash is revenue; gold increases
  -- holdings and its book basis at the game's fixed 6,000 EGP/gram basis.
  if p_cash > 0 then
    v_entry := jsonb_build_object(
      'id', 'ledger-reward-' || (floor(extract(epoch from v_now) * 1000)::bigint)::text || '-' || jsonb_array_length(v_redeemed_ids)::text,
      'category', 'revenue',
      'amount', p_cash,
      'countryId', v_country_id,
      'occurredAt', to_char(v_now at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
      'note', 'مكافأة كود ' || p_code_id::text
    );
    v_ledger := v_ledger || jsonb_build_array(v_entry);
    v_profile := jsonb_set(v_profile, '{ledger}', v_ledger, true);
  end if;

  v_profile := jsonb_set(
    v_profile,
    '{bankBalance}',
    to_jsonb((v_profile->>'bankBalance')::numeric + v_cash),
    true
  );
  v_profile := jsonb_set(
    v_profile,
    '{goldGrams}',
    to_jsonb((v_profile->>'goldGrams')::numeric + v_gold),
    true
  );
  v_profile := jsonb_set(
    v_profile,
    '{goldCostBasis}',
    to_jsonb((v_profile->>'goldCostBasis')::numeric + v_gold_basis),
    true
  );
  v_profile := jsonb_set(
    v_profile,
    '{redeemedCodeIds}',
    v_redeemed_ids || jsonb_build_array(p_code_id::text),
    true
  );
  if p_cash > 0 then
    v_profile := jsonb_set(
      v_profile,
      '{finances,totalRevenue}',
      to_jsonb((v_profile#>>'{finances,totalRevenue}')::numeric + v_cash),
      true
    );
    v_profile := jsonb_set(
      v_profile,
      '{finances,netProfit}',
      to_jsonb((v_profile#>>'{finances,netProfit}')::numeric + v_cash),
      true
    );
  end if;

  update public.game_profiles as gp
    set save_data = v_profile,
        updated_at = v_now
    where gp.user_id = p_user_id;

  return jsonb_build_object(
    'ok', true,
    'codeId', p_code_id::text,
    'profile', v_profile
  );
end;
$$;

revoke all on function public.redeem_reward_code(uuid, uuid, bigint, numeric) from public, anon, authenticated, service_role;
grant execute on function public.redeem_reward_code(uuid, uuid, bigint, numeric) to service_role;
