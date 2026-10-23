import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validatePlayerProfile } from 'https://raw.githubusercontent.com/eslammohamedk123450-netizen/Suly_besnes/929b526bb2e3df36ed6abb593b7cf97139ecc879/supabase/functions/game-command/profile-validator.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
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
  let payload: { playerName?: string; gameDay?: number; saveData?: unknown };
  try { payload = await request.json(); } catch { return json({ error: 'invalid_json' }, 400); }
  if (!payload.playerName || !Number.isInteger(payload.gameDay) || !payload.saveData || typeof payload.saveData !== 'object') return json({ error: 'invalid_profile_payload' }, 400);
  const validation = validatePlayerProfile(payload.saveData);
  if (!validation.ok) return json({ error: 'invalid_initial_profile', details: validation.errors }, 400);
  const initial = payload.saveData as Record<string, unknown>;
  if (initial.name !== payload.playerName || initial.day !== payload.gameDay) return json({ error: 'profile_metadata_mismatch' }, 400);
  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: current, error: readError } = await adminClient.from('game_profiles').select('updated_at').eq('user_id', user.id).maybeSingle();
  if (readError) return json({ error: 'profile_lookup_failed' }, 500);
  if (current?.updated_at) return json({ error: 'full_profile_replacement_disabled' }, 403);
  const { data, error } = await adminClient.rpc('replace_game_profile', {
    p_user_id: user.id,
    p_expected_updated_at: current?.updated_at ?? null,
    p_player_name: payload.playerName,
    p_game_day: payload.gameDay,
    p_save_data: payload.saveData,
  });
  if (error) return json({ error: error.message }, 400);
  if (data !== true) return json({ error: 'profile_write_conflict' }, 409);
  return json({ ok: true });
});
