-- Do not expose score ingestion to browser clients.
-- A future Edge Function or trusted worker must validate game evidence before calling the RPC.
revoke execute on function public.record_season_event(uuid, text, text, text, jsonb) from anon, authenticated;
grant execute on function public.record_season_event(uuid, text, text, text, jsonb) to service_role;
