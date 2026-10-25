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

-- Public support/admin identifier. It is intentionally separate from auth.users.email.
alter table public.game_profiles add column if not exists account_code text;
create unique index if not exists game_profiles_account_code_idx on public.game_profiles(account_code) where account_code is not null;

create table if not exists public.admin_grant_audit (
  id uuid primary key default gen_random_uuid(),
  account_code text not null,
  grant_payload jsonb not null,
  granted_by text not null,
  created_at timestamptz not null default now()
);

alter table public.admin_grant_audit enable row level security;
revoke all on table public.admin_grant_audit from anon, authenticated;

-- Called only by the server-side admin API using the service_role key.
create or replace function public.admin_grant_account(
  p_account_code text,
  p_cash integer default 0,
  p_gold numeric default 0,
  p_diamonds integer default 0,
  p_badge text default null,
  p_speed_card_kind text default null,
  p_speed_card_quantity integer default 0,
  p_granted_by text default 'admin'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_save jsonb;
  v_payload jsonb;
  v_cards jsonb;
begin
  if p_account_code is null or p_account_code !~ '^BE-[A-Z0-9]+-[A-Z0-9]+$' then
    raise exception 'invalid account code';
  end if;
  if p_cash < 0 or p_gold < 0 or p_diamonds < 0 or p_speed_card_quantity < 0 then
    raise exception 'grant values must be non-negative';
  end if;
  select user_id, save_data into v_user_id, v_save
    from public.game_profiles where account_code = p_account_code for update;
  if v_user_id is null then raise exception 'account not found'; end if;

  v_save := jsonb_set(v_save, '{bankBalance}', to_jsonb(coalesce((v_save->>'bankBalance')::numeric, 0) + p_cash), true);
  v_save := jsonb_set(v_save, '{goldGrams}', to_jsonb(coalesce((v_save->>'goldGrams')::numeric, 0) + p_gold), true);
  v_save := jsonb_set(v_save, '{diamonds}', to_jsonb(coalesce((v_save->>'diamonds')::integer, 0) + p_diamonds), true);

  if p_badge is not null and length(trim(p_badge)) > 0 then
    v_save := jsonb_set(v_save, '{badges}', (
      select jsonb_agg(distinct item) from jsonb_array_elements_text(coalesce(v_save->'badges', '[]'::jsonb) || to_jsonb(array[p_badge])) item
    ), true);
  end if;

  if p_speed_card_kind is not null and p_speed_card_quantity > 0 then
    v_cards := coalesce(v_save->'speedCards', '[]'::jsonb);
    if exists (select 1 from jsonb_array_elements(v_cards) item where item->>'kind' = p_speed_card_kind) then
      select jsonb_agg(case when item->>'kind' = p_speed_card_kind then jsonb_set(item, '{quantity}', to_jsonb((item->>'quantity')::integer + p_speed_card_quantity), true) else item end)
        into v_cards from jsonb_array_elements(v_cards) item;
    else
      v_cards := v_cards || jsonb_build_array(jsonb_build_object('kind', p_speed_card_kind, 'quantity', p_speed_card_quantity));
    end if;
    v_save := jsonb_set(v_save, '{speedCards}', v_cards, true);
  end if;

  update public.game_profiles set save_data = v_save, updated_at = now() where user_id = v_user_id;
  v_payload := jsonb_build_object('cash', p_cash, 'gold', p_gold, 'diamonds', p_diamonds, 'badge', p_badge, 'speedCardKind', p_speed_card_kind, 'speedCardQuantity', p_speed_card_quantity);
  insert into public.admin_grant_audit(account_code, grant_payload, granted_by) values (p_account_code, v_payload, p_granted_by);
  return jsonb_build_object('accountCode', p_account_code, 'userId', v_user_id, 'payload', v_payload);
end;
$$;

revoke all on function public.admin_grant_account(text, integer, numeric, integer, text, text, integer, text) from public, anon, authenticated;
grant execute on function public.admin_grant_account(text, integer, numeric, integer, text, text, integer, text) to service_role;

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
