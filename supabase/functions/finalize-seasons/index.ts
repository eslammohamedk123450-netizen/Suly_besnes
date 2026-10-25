import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceRoleKey) return new Response(JSON.stringify({ error: 'server_configuration_error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  const providedKey = request.headers.get('apikey') ?? request.headers.get('Authorization')?.replace(/^Bearer\s+/, '');
  if (providedKey !== serviceRoleKey) return new Response(JSON.stringify({ error: 'not_authorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  const client = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.rpc('finalize_expired_seasons');
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  return new Response(JSON.stringify({ ok: true, finalized: data ?? 0 }), { headers: { 'Content-Type': 'application/json' } });
});
