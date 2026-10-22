import type { FinanceLedgerEntry } from '../domain/futureSystems';
import type { PlayerProfile } from '../domain/player';

const PUBLIC_KEY_DER_BASE64 = 'MCowBQYDK2VwAyEA84UjrthL2DPvb0nU4FJv519tEWgUpuHEBhP4gdmrAiY=';

type Reward = { type: 'cash'; amount: number } | { type: 'gold'; grams: number };
interface RewardPayload { version: 1; codeId: string; issuedAt: string; expiresAt: string; rewards: Reward[] }
export interface RedeemResult { ok: boolean; profile: PlayerProfile; message: string; codeId?: string }

function decodeBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  const binary = atob(normalized);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function makeLedger(profile: PlayerProfile, amount: number, note: string): FinanceLedgerEntry {
  return { id: `ledger-reward-${Date.now()}-${profile.redeemedCodeIds.length}`, category: 'revenue', amount, countryId: profile.countryId, occurredAt: new Date().toISOString(), note };
}

export async function redeemRewardCode(profile: PlayerProfile, rawCode: string): Promise<RedeemResult> {
  const code = rawCode.trim();
  const parts = code.split('.');
  if (parts.length !== 3 || parts[0] !== 'SULY1') return { ok: false, profile, message: 'صيغة الكود غير صحيحة.' };
  try {
    const encodedPayload = parts[1];
    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(encodedPayload))) as Partial<RewardPayload>;
    if (payload.version !== 1 || typeof payload.codeId !== 'string' || !Array.isArray(payload.rewards) || !payload.rewards.length || !Number.isFinite(Date.parse(payload.expiresAt ?? ''))) return { ok: false, profile, message: 'الكود ناقص أو غير صالح.' };
    if (Date.parse(payload.expiresAt as string) <= Date.now()) return { ok: false, profile, message: 'انتهت صلاحية هذا الكود.' };
    if (profile.redeemedCodeIds.includes(payload.codeId)) return { ok: false, profile, message: 'تم استخدام هذا الكود من قبل على هذا الحساب.' };
    const publicKey = await crypto.subtle.importKey('spki', decodeBase64Url(PUBLIC_KEY_DER_BASE64) as unknown as BufferSource, { name: 'Ed25519' } as Algorithm, false, ['verify']);
    const valid = await crypto.subtle.verify({ name: 'Ed25519' } as Algorithm, publicKey, decodeBase64Url(parts[2]) as unknown as BufferSource, new TextEncoder().encode(encodedPayload));
    if (!valid) return { ok: false, profile, message: 'توقيع الكود غير صالح.' };
    let cash = 0;
    let gold = 0;
    for (const reward of payload.rewards) {
      if (reward.type === 'cash' && Number.isInteger(reward.amount) && reward.amount > 0 && reward.amount <= 1_000_000) cash += reward.amount;
      else if (reward.type === 'gold' && Number.isFinite(reward.grams) && reward.grams > 0 && reward.grams <= 100) gold += reward.grams;
      else return { ok: false, profile, message: 'يحتوي الكود على مكافأة غير مسموحة.' };
    }
    const ledger = cash > 0 ? [...profile.ledger, makeLedger(profile, cash, `مكافأة كود ${payload.codeId}`)] : profile.ledger;
    const nextProfile: PlayerProfile = { ...profile, bankBalance: profile.bankBalance + cash, goldGrams: profile.goldGrams + gold, goldCostBasis: profile.goldCostBasis + gold * 6_000, redeemedCodeIds: [...profile.redeemedCodeIds, payload.codeId], ledger, finances: { ...profile.finances, totalRevenue: profile.finances.totalRevenue + cash, netProfit: profile.finances.netProfit + cash } };
    const summary = [cash > 0 ? `${cash.toLocaleString('ar-EG')} ج.م` : '', gold > 0 ? `${gold} غ ذهب` : ''].filter(Boolean).join(' و');
    return { ok: true, profile: nextProfile, codeId: payload.codeId, message: `تم التحقق من الكود. جارٍ تسجيل المكافأة عالميًا؛ حصلت على ${summary}.` };
  } catch {
    return { ok: false, profile, message: 'تعذر قراءة الكود أو التحقق من توقيعه.' };
  }
}
