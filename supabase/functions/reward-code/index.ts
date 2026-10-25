import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Keep the SULY1 signing key in sync with src/game/rewards.ts.
const PUBLIC_KEY_DER_BASE64 = 'MCowBQYDK2VwAyEA84UjrthL2DPvb0nU4FJv519tEWgUpuHEBhP4gdmrAiY=';
const ROTATED_PUBLIC_KEY_DER_BASE64 = 'MCowBQYDK2VwAyEAE8KYanYlY/M5eQuNNuKP/EMerujT9v9IaC374LZtBCs=';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_REWARD_AMOUNT = 1_000_000;

interface CashReward { type: 'cash'; amount: number }
interface GoldReward { type: 'gold'; grams: number }
type Reward = CashReward | GoldReward;
interface RewardPayload {
  version: 1;
  codeId: string;
  issuedAt: string;
  expiresAt: string;
  rewards: Reward[];
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function decodeBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  const binary = atob(normalized);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function isExactKeys(value: Record<string, unknown>, expected: string[]): boolean {
  const actual = Object.keys(value).sort();
  const keys = [...expected].sort();
  return actual.length === keys.length && actual.every((key, index) => key === keys[index]);
}

function validatePayload(value: unknown, now: number): { payload: RewardPayload; cash: number; gold: number } | null {
  if (!isRecord(value) || !isExactKeys(value, ['version', 'codeId', 'issuedAt', 'expiresAt', 'rewards'])) return null;
  if (value.version !== 1 || typeof value.codeId !== 'string' || !UUID_RE.test(value.codeId)) return null;
  if (typeof value.issuedAt !== 'string' || typeof value.expiresAt !== 'string') return null;
  const issuedAt = Date.parse(value.issuedAt);
  const expiresAt = Date.parse(value.expiresAt);
  if (!Number.isFinite(issuedAt) || !Number.isFinite(expiresAt) || issuedAt > now || expiresAt <= now || expiresAt <= issuedAt) return null;
  if (!Array.isArray(value.rewards) || value.rewards.length < 1 || value.rewards.length > 16) return null;

  let cash = 0;
  let gold = 0;
  for (const candidate of value.rewards) {
    if (!isRecord(candidate)) return null;
    if (candidate.type === 'cash' && isExactKeys(candidate, ['type', 'amount'])) {
      if (!Number.isSafeInteger(candidate.amount) || (candidate.amount as number) <= 0 || (candidate.amount as number) > MAX_REWARD_AMOUNT) return null;
      cash += candidate.amount as number;
      if (cash > MAX_REWARD_AMOUNT) return null;
    } else if (candidate.type === 'gold' && isExactKeys(candidate, ['type', 'grams'])) {
      if (typeof candidate.grams !== 'number' || !Number.isFinite(candidate.grams) || candidate.grams <= 0 || candidate.grams > MAX_REWARD_AMOUNT) return null;
      gold += candidate.grams;
      if (!Number.isFinite(gold) || gold > MAX_REWARD_AMOUNT) return null;
    } else {
      return null;
    }
  }
  if (cash === 0 && gold === 0) return null;
  return { payload: value as unknown as RewardPayload, cash, gold };
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

  let requestBody: unknown;
  try {
    requestBody = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  if (!isRecord(requestBody) || !isExactKeys(requestBody, ['rawCode']) || typeof requestBody.rawCode !== 'string') {
    return json({ error: 'invalid_request' }, 400);
  }

  const rawCode = requestBody.rawCode.trim();
  if (!rawCode || rawCode.length > 16_384) return json({ error: 'invalid_code' }, 400);
  const parts = rawCode.split('.');
  if (parts.length !== 3 || parts[0] !== 'SULY1' || !parts[1] || !parts[2]) return json({ error: 'invalid_code' }, 400);

  let validated: ReturnType<typeof validatePayload>;
  try {
    const decodedPayload = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(decodeBase64Url(parts[1]))) as unknown;
    validated = validatePayload(decodedPayload, Date.now());
    if (!validated) return json({ error: 'invalid_or_expired_code' }, 400);
    let signatureValid = false;
    for (const trustedKey of [PUBLIC_KEY_DER_BASE64, ROTATED_PUBLIC_KEY_DER_BASE64]) {
      try {
        const publicKey = await crypto.subtle.importKey(
          'spki',
          decodeBase64Url(trustedKey) as unknown as BufferSource,
          { name: 'Ed25519' } as Algorithm,
          false,
          ['verify'],
        );
        signatureValid = await crypto.subtle.verify(
          { name: 'Ed25519' } as Algorithm,
          publicKey,
          decodeBase64Url(parts[2]) as unknown as BufferSource,
          new TextEncoder().encode(parts[1]),
        );
        if (signatureValid) break;
      } catch {
        // Preserve the remaining trusted key as a fallback.
      }
    }
    if (!signatureValid) return json({ error: 'invalid_signature' }, 400);
  } catch {
    return json({ error: 'invalid_code' }, 400);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await adminClient.rpc('redeem_reward_code', {
    p_code_id: validated.payload.codeId,
    p_user_id: user.id,
    p_cash: validated.cash,
    p_gold: validated.gold,
  });
  if (error) {
    if (error.message.includes('code_already_redeemed')) return json({ error: 'code_already_redeemed' }, 409);
    if (error.message.includes('profile_not_found')) return json({ error: 'profile_not_found' }, 404);
    if (error.message.includes('invalid_reward_amounts') || error.message.includes('invalid_profile_data')) return json({ error: 'reward_redemption_failed' }, 409);
    return json({ error: 'reward_redemption_failed' }, 500);
  }
  if (!isRecord(data) || data.ok !== true || !isRecord(data.profile)) return json({ error: 'reward_redemption_failed' }, 500);

  const summary = [
    validated.cash > 0 ? `${validated.cash.toLocaleString('ar-EG')} ج.م` : '',
    validated.gold > 0 ? `${validated.gold} غ ذهب` : '',
  ].filter(Boolean).join(' و');
  return json({
    ok: true,
    profile: data.profile,
    codeId: validated.payload.codeId,
    message: `تم استرداد الكود بنجاح. حصلت على ${summary}.`,
  });
});
