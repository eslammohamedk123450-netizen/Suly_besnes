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

const ALLOWED_TYPES = new Set([
  'production_completed',
  'sale_completed',
  'contract_delivered',
  'auction_won',
]);

type JsonRecord = Record<string, unknown>;

function hasVerifiedSource(saveData: unknown, eventType: string, sourceId: string): boolean {
  if (!saveData || typeof saveData !== 'object') return false;
  const profile = saveData as JsonRecord;
  if (eventType === 'production_completed') {
    return Array.isArray(profile.productionOrders) && profile.productionOrders.some((item) => (
      item && typeof item === 'object' && (item as JsonRecord).id === sourceId && (item as JsonRecord).status === 'completed'
    ));
  }
  if (eventType === 'sale_completed') {
    return Array.isArray(profile.sales) && profile.sales.some((item) => (
      item && typeof item === 'object' && (item as JsonRecord).id === sourceId
    ));
  }
  if (eventType === 'contract_delivered') {
    return Array.isArray(profile.contracts) && profile.contracts.some((item) => (
      item && typeof item === 'object' && (item as JsonRecord).id === sourceId && (item as JsonRecord).status === 'completed'
    ));
  }
  if (eventType === 'auction_won') {
    return Array.isArray(profile.auctionHistory) && profile.auctionHistory.some((item) => (
      item && typeof item === 'object' && (item as JsonRecord).listingId === sourceId && (item as JsonRecord).bidder === 'player'
    ));
  }
  return false;
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

  let payload: { seasonId?: string; eventType?: string; sourceId?: string; idempotencyKey?: string };
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  if (!payload.seasonId || !payload.eventType || !payload.sourceId || !payload.idempotencyKey) {
    return json({ error: 'missing_transaction_fields' }, 400);
  }
  if (!ALLOWED_TYPES.has(payload.eventType)) return json({ error: 'event_not_allowed' }, 400);

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: profile, error: profileError } = await adminClient
    .from('game_profiles')
    .select('user_id, save_data')
    .eq('user_id', user.id)
    .maybeSingle();
  if (profileError) return json({ error: 'profile_lookup_failed' }, 500);
  if (!profile || !hasVerifiedSource(profile.save_data, payload.eventType, payload.sourceId)) {
    return json({ error: 'transaction_evidence_not_found' }, 409);
  }

  const { data, error } = await adminClient.rpc('record_verified_game_transaction', {
    p_user_id: user.id,
    p_season_id: payload.seasonId,
    p_transaction_type: payload.eventType,
    p_idempotency_key: payload.idempotencyKey,
    p_source_id: payload.sourceId,
    p_metadata: { source: 'game-transaction-edge-function' },
  });
  if (error) return json({ error: error.message }, 400);
  return json({ ok: true, transaction: data });
});
