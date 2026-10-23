create extension if not exists pg_cron;

do $do$
declare
  v_job_id bigint;
begin
  select jobid into v_job_id from cron.job where jobname = 'finalize-expired-seasons' limit 1;
  if v_job_id is not null then
    perform cron.unschedule(v_job_id);
  end if;
  perform cron.schedule(
    'finalize-expired-seasons',
    '*/15 * * * *',
    $$select public.finalize_expired_seasons();$$
  );
end;
$do$;
