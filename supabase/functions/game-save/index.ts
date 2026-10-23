import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (const character of seed) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return hash >>> 0;
}

function accountCodeFromSeed(seed: string): string {
  const first = hashSeed(seed).toString(36).toUpperCase().padStart(7, '0').slice(-7);
  const second = hashSeed(`${seed}:business-empire`).toString(36).toUpperCase().padStart(5, '0').slice(-5);
  return `BE-${first}-${second}`;
}

function createInitialProfile(playerName: string, userId: string): Record<string, unknown> {
  return {
    id: crypto.randomUUID(),
    accountCode: accountCodeFromSeed(userId),
    name: playerName.trim() || 'المستثمر الجديد',
    level: 1,
    countryId: 'egypt',
    createdAt: new Date().toISOString(),
    bankBalance: 1_000_000,
    payables: 0,
    goldGrams: 0,
    goldCostBasis: 0,
    diamonds: 0,
    speedCards: [],
    badges: [],
    assets: [],
    lands: [],
    companies: [],
    finances: { netProfit: 0, totalRevenue: 0, totalExpenses: 0 },
    day: 1,
    inventory: [],
    licenses: [],
    investments: [],
    banking: { deposits: [], loans: [] },
    staff: [],
    productionOrders: [],
    auctionHistory: [],
    redeemedCodeIds: [],
    sales: [],
    ledger: [],
    events: [],
    tasks: [],
    completedTaskIds: [],
    reputation: 50,
    contracts: [],
    achievements: [],
    onboarding: { introCompleted: false, chapter: 0, seenGuides: [] },
    season: { seasonId: 'expansion-season-1', startedOnDay: 1, endsOnDay: 30, points: 0, claimedChallengeKeys: [] },
  };
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

  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const readProfile = async () => await adminClient
    .from('game_profiles')
    .select('save_data')
    .eq('user_id', user.id)
    .maybeSingle();

  const { data: current, error: readError } = await readProfile();
  if (readError) return json({ error: 'profile_lookup_failed' }, 500);
  if (current) return json({ ok: true, saveData: current.save_data });

  let payload: { playerName?: unknown; countryId?: unknown };
  try {
    const body: unknown = await request.json();
    if (body === null || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'invalid_profile_payload' }, 400);
    payload = body as { playerName?: unknown; countryId?: unknown };
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  if (typeof payload.playerName !== 'string' || payload.playerName.trim().length < 1 || payload.playerName.length > 120) {
    return json({ error: 'invalid_player_name' }, 400);
  }
  if (payload.countryId !== 'egypt') return json({ error: 'unsupported_country' }, 400);

  const initialProfile = createInitialProfile(payload.playerName, user.id);
  if (initialProfile.countryId !== 'egypt'
    || initialProfile.bankBalance !== 1_000_000
    || initialProfile.day !== 1
    || initialProfile.accountCode !== accountCodeFromSeed(user.id)) {
    return json({ error: 'invalid_initial_profile' }, 500);
  }

  const { data, error } = await adminClient.rpc('replace_game_profile', {
    p_user_id: user.id,
    p_expected_updated_at: null,
    p_player_name: payload.playerName,
    p_game_day: 1,
    p_save_data: initialProfile,
  });
  if (error) return json({ error: error.message }, 400);
  if (data === true) return json({ ok: true, saveData: initialProfile });

  // Another request may have created the profile after the initial lookup.
  const { data: racedProfile, error: raceReadError } = await readProfile();
  if (raceReadError) return json({ error: 'profile_lookup_failed' }, 500);
  if (racedProfile) return json({ ok: true, saveData: racedProfile.save_data });
  return json({ error: 'profile_write_conflict' }, 409);
});
