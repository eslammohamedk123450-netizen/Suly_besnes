-- Keep client access to game_profiles read-only and only through RLS policies.
revoke all on table public.game_profiles from anon, authenticated;
grant select on table public.game_profiles to anon, authenticated;
