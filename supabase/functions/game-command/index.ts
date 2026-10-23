import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const ENGINE_URL = 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663982499695/MMDLtcccRyLMJmlF.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const allowedCommands = new Set([
  'place_bid', 'buy_direct_land', 'buy_direct_company', 'sell_land', 'sell_company', 'sell_asset',
  'buy_material', 'found_company', 'upgrade_company', 'run_production', 'service_company',
  'cancel_production', 'use_speed_card', 'sell_product', 'buy_gold', 'sell_gold', 'hire_staff',
  'pay_staff_salary', 'terminate_staff', 'create_deposit', 'withdraw_deposit', 'take_loan',
  'create_investment', 'advance_day', 'accept_contract', 'deliver_contract', 'negotiate_contract', 'claim_task',
]);
function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
function newItems(previous: unknown, next: unknown, predicate: (item: Record<string, unknown>) => boolean): string[] {
  const before = Array.isArray(previous) ? previous : [];
  const seen = new Set(before.filter((item) => item && typeof item === 'object').map((item) => JSON.stringify(item)));
  return (Array.isArray(next) ? next : []).filter((item) => item && typeof item === 'object' && predicate(item as Record<string, unknown>) && !seen.has(JSON.stringify(item))).map((item) => item as Record<string, unknown> as any);
}
async function recordVerifiedTransactions(admin: ReturnType<typeof createClient>, userId: string, before: Record<string, unknown>, after: Record<string, unknown>) {
  const seasonId = typeof (after.season as Record<string, unknown> | undefined)?.seasonId === 'string' ? (after.season as Record<string, unknown>).seasonId : null;
  if (!seasonId) return;
  const sales = newItems(before.sales, after.sales, () => true).map((item) => item.id).filter((id): id is string => typeof id === 'string');
  const production = newItems(before.productionOrders, after.productionOrders, (item) => item.status === 'completed').map((item) => item.id).filter((id): id is string => typeof id === 'string');
  const contracts = newItems(before.contracts, after.contracts, (item) => item.status === 'completed').map((item) => item.id).filter((id): id is string => typeof id === 'string');
  const auctions = newItems(before.auctionHistory, after.auctionHistory, (item) => item.bidder === 'player').map((item) => item.listingId).filter((id): id is string => typeof id === 'string');
  for (const [transactionType, ids] of [['sale_completed', sales], ['production_completed', production], ['contract_delivered', contracts], ['auction_won', auctions]] as const) {
    for (const sourceId of ids) {
      await admin.rpc('record_verified_game_transaction', { p_user_id: userId, p_season_id: seasonId, p_transaction_type: transactionType, p_idempotency_key: `${transactionType}:${sourceId}`, p_source_id: sourceId, p_metadata: { source: 'game-command-edge-function' } });
    }
  }
}
Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return json({ error: 'missing_authorization' }, 401);
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceRoleKey) return json({ error: 'server_configuration_error' }, 500);
  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) return json({ error: 'invalid_session' }, 401);
  let payload: { command?: { name?: unknown; args?: unknown }; commandKey?: unknown; saveData?: unknown };
  try { payload = await request.json(); } catch { return json({ error: 'invalid_json' }, 400); }
  if ('saveData' in payload) return json({ error: 'save_data_not_accepted' }, 400);
  const command = payload.command;
  if (!command || typeof command !== 'object' || typeof command.name !== 'string' || !allowedCommands.has(command.name) || !command.args || typeof command.args !== 'object' || Array.isArray(command.args)) return json({ error: 'invalid_command' }, 400);
  const commandKey = typeof payload.commandKey === 'string' && payload.commandKey.length >= 16 ? payload.commandKey : crypto.randomUUID();
  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: row, error: readError } = await admin.from('game_profiles').select('save_data, updated_at').eq('user_id', user.id).maybeSingle();
  if (readError || !row?.save_data || typeof row.save_data !== 'object') return json({ error: 'profile_not_found' }, 404);
  const before = row.save_data as Record<string, unknown>;
  const { executeGameCommand } = await import(ENGINE_URL);
  const result = executeGameCommand(before as never, command as never) as { ok: boolean; profile: Record<string, unknown>; message: string; data?: unknown; reason?: string };
  if (!result.ok) return json({ ok: true, result });
  const nextProfile = result.profile;
  const commitResult = { ok: true, profile: nextProfile, result };
  const { data: committed, error: commitError } = await admin.rpc('commit_game_command', {
    p_user_id: user.id,
    p_command_key: commandKey,
    p_command_name: command.name,
    p_expected_updated_at: row.updated_at,
    p_player_name: String(nextProfile.name ?? 'المستثمر الجديد'),
    p_game_day: Number(nextProfile.day ?? 1),
    p_save_data: nextProfile,
    p_result: commitResult,
  });
  if (commitError) return json({ error: 'command_commit_failed', detail: commitError.message }, 409);
  await recordVerifiedTransactions(admin, user.id, before, nextProfile);
  return json({ ok: true, profile: committed?.profile ?? nextProfile, result: committed?.result ?? result });
});
