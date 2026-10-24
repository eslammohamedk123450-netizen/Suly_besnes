create or replace function public.finalize_expired_seasons()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  update public.game_seasons
  set status = 'finalized'
  where status = 'active'
    and ends_at <= now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke execute on function public.finalize_expired_seasons() from public, anon, authenticated;
grant execute on function public.finalize_expired_seasons() to service_role;
