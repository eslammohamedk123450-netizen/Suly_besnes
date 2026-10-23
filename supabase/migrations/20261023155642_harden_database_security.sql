-- Public data is exposed through invoker views with explicit read policies.
alter view public.visible_game_seasons set (security_invoker = true);
alter view public.global_leaderboard set (security_invoker = true);

drop policy if exists "public visible seasons" on public.game_seasons;
create policy "public visible seasons" on public.game_seasons
  for select to anon, authenticated
  using (status in ('active', 'finalized'));

drop policy if exists "public leaderboard seasons" on public.season_scores;
create policy "public leaderboard seasons" on public.season_scores
  for select to anon, authenticated
  using (exists (select 1 from public.game_seasons gs where gs.id = season_id and gs.status in ('active', 'finalized')));

-- These tables are service-role write/read stores; deny all API-role access explicitly.
create policy "deny api access" on public.game_command_receipts for all to anon, authenticated using (false) with check (false);
create policy "deny api access" on public.game_transactions for all to anon, authenticated using (false) with check (false);
create policy "deny api access" on public.season_score_events for all to anon, authenticated using (false) with check (false);
create policy "deny api access" on public.reward_code_redemptions for all to anon, authenticated using (false) with check (false);

revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- Cover foreign-key lookups used by admin and service functions.
create index if not exists reward_code_redemptions_redeemed_by_idx on public.reward_code_redemptions (redeemed_by);
create index if not exists season_score_events_user_id_idx on public.season_score_events (user_id);
create index if not exists season_scores_user_id_idx on public.season_scores (user_id);

-- Avoid per-row auth.uid() evaluation in the profile policies.
alter policy "read own profile" on public.game_profiles using ((select auth.uid()) = user_id);
alter policy "insert own profile" on public.game_profiles with check ((select auth.uid()) = user_id);
alter policy "update own profile" on public.game_profiles using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
