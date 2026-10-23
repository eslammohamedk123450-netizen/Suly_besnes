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
  const userClient = createClient(supabaseUrl, publishableKey, { global: { headers: { Authorization: authorization } } });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return json({ error: 'invalid_session' }, 401);
  let payload: { codeId?: string; playerName?: string; gameDay?: number; saveData?: unknown };
  try { payload = await request.json(); } catch { return json({ error: 'invalid_json' }, 400); }
  if (!payload.codeId || !payload.playerName || !Number.isInteger(payload.gameDay) || !payload.saveData || typeof payload.saveData !== 'object') return json({ error: 'invalid_reward_payload' }, 400);
  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await adminClient.rpc('redeem_reward_code', {
    p_code_id: payload.codeId,
    p_user_id: user.id,
    p_player_name: payload.playerName,
    p_game_day: payload.gameDay,
    p_save_data: payload.saveData,
  });
  if (error) return json({ error: error.message }, 400);
  return json({ ok: data === true });
});
