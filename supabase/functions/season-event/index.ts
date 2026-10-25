import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return json({ error: 'missing_authorization' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const publishableKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !publishableKey || !serviceRoleKey) return json({ error: 'server_configuration_error' }, 500);

  const userClient = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return json({ error: 'invalid_session' }, 401);

  let payload: { seasonId?: string; eventType?: string } = {};
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  // This first server event is deliberately narrow. Game-action events will be
  // added only after their evidence is stored in server-controlled transactions.
  if (payload.eventType !== 'login_reward' || !payload.seasonId) {
    return json({ error: 'event_not_allowed' }, 400);
  }

  const dayKey = new Date().toISOString().slice(0, 10);
  const eventKey = `login:${user.id}:${dayKey}`;
  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await adminClient.rpc('record_season_event', {
    p_user_id: user.id,
    p_season_id: payload.seasonId,
    p_event_key: eventKey,
    p_event_type: 'login_reward',
    p_source_id: `auth-login:${dayKey}`,
    p_metadata: { source: 'season-event-edge-function', day: dayKey },
  });

  if (error) return json({ error: error.message }, error.code === 'PGRST116' ? 409 : 400);
  return json({ ok: true, seasonScore: data });
});
