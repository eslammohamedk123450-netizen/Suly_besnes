revoke all on table public.visible_game_seasons from anon, authenticated;
revoke all on table public.global_leaderboard from anon, authenticated;
grant select on table public.visible_game_seasons to anon, authenticated;
grant select on table public.global_leaderboard to anon, authenticated;
