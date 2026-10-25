-- Atomic commit boundary for server-executed game commands.
create table if not exists public.game_command_receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  command_key text not null,
  command_name text not null,
  result jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, command_key)
);
alter table public.game_command_receipts enable row level security;
revoke all on table public.game_command_receipts from anon, authenticated;

create or replace function public.commit_game_command(
  p_user_id uuid,
  p_command_key text,
  p_command_name text,
  p_expected_updated_at timestamptz,
  p_player_name text,
  p_game_day integer,
  p_save_data jsonb,
  p_result jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_receipt public.game_command_receipts;
  v_updated integer;
begin
  if p_user_id is null or p_command_key is null or length(p_command_key) < 16 or length(p_command_key) > 180 then
    raise exception 'invalid_command_key';
  end if;
  if p_save_data is null or jsonb_typeof(p_save_data) <> 'object' then raise exception 'invalid_profile_payload'; end if;
  if p_result is null or jsonb_typeof(p_result) <> 'object' then raise exception 'invalid_command_result'; end if;
  select * into v_receipt from public.game_command_receipts where user_id = p_user_id and command_key = p_command_key limit 1;
  if v_receipt.id is not null then return v_receipt.result || jsonb_build_object('duplicate', true); end if;
  perform 1 from public.game_profiles where user_id = p_user_id for update;
  update public.game_profiles
  set player_name = p_player_name, game_day = p_game_day, save_data = p_save_data, updated_at = now()
  where user_id = p_user_id and updated_at = p_expected_updated_at;
  get diagnostics v_updated = row_count;
  if v_updated <> 1 then raise exception 'profile_write_conflict'; end if;
  insert into public.game_command_receipts (user_id, command_key, command_name, result)
  values (p_user_id, p_command_key, p_command_name, p_result);
  return p_result;
end;
$$;
revoke execute on function public.commit_game_command(uuid, text, text, timestamptz, text, integer, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.commit_game_command(uuid, text, text, timestamptz, text, integer, jsonb, jsonb) to service_role;
