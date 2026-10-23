begin;
select plan(11);

select ok(
  has_table_privilege('anon', 'public.visible_game_seasons', 'select'),
  'anon can read seasons only through the public read surface'
);
select ok(
  not has_table_privilege('anon', 'public.game_seasons', 'insert,update,delete'),
  'anon cannot mutate seasons'
);
select ok(
  not has_table_privilege('authenticated', 'public.season_scores', 'insert,update,delete'),
  'authenticated cannot mutate scores directly'
);
select ok(
  not has_table_privilege('authenticated', 'public.season_score_events', 'insert,update,delete'),
  'authenticated cannot mutate score events directly'
);
select ok(
  has_table_privilege('anon', 'public.global_leaderboard', 'select'),
  'anon can read the public leaderboard view'
);
select ok(
  has_function_privilege('anon', 'public.get_global_leaderboard(uuid,integer,integer)', 'execute'),
  'anon can execute leaderboard reads'
);
select ok(
  not has_function_privilege('anon', 'public.record_season_event(uuid,text,text,text,jsonb)', 'execute'),
  'anon cannot record season events'
);
select ok(
  not has_function_privilege('authenticated', 'public.record_season_event(uuid,text,text,text,jsonb)', 'execute'),
  'authenticated cannot submit unverified score events'
);
select ok(
  has_function_privilege('service_role', 'public.record_season_event(uuid,text,text,text,jsonb)', 'execute'),
  'service_role can submit server-validated score events'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.season_scores'::regclass limit 1),
  'RLS is enabled on season scores'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.season_score_events'::regclass limit 1),
  'RLS is enabled on season score events'
);

select * from finish();
rollback;
