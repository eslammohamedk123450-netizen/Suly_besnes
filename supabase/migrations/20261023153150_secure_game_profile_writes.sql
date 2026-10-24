-- Cloud saves must go through a server endpoint. Clients retain read-only access to their own profile.
create or replace function public.replace_game_profile(
  p_user_id uuid,
  p_expected_updated_at timestamptz,
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
  if p_user_id is null or p_save_data is null or jsonb_typeof(p_save_data) <> 'object' then
    raise exception 'invalid_profile_payload';
  end if;
  if p_player_name is null or length(trim(p_player_name)) < 1 or length(p_player_name) > 120 then
    raise exception 'invalid_player_name';
  end if;
  if p_game_day is null or p_game_day < 1 then
    raise exception 'invalid_game_day';
  end if;
  if p_expected_updated_at is null then
    insert into public.game_profiles (user_id, player_name, game_day, save_data, updated_at)
    values (p_user_id, trim(p_player_name), p_game_day, p_save_data, now())
    on conflict (user_id) do nothing;
    return found;
  end if;
  update public.game_profiles
  set player_name = trim(p_player_name), game_day = p_game_day, save_data = p_save_data, updated_at = now()
  where user_id = p_user_id and updated_at = p_expected_updated_at;
  return found;
end;
$$;
revoke execute on function public.replace_game_profile(uuid, timestamptz, text, integer, jsonb) from public, anon, authenticated;
grant execute on function public.replace_game_profile(uuid, timestamptz, text, integer, jsonb) to service_role;
revoke insert, update, delete on table public.game_profiles from anon, authenticated;
