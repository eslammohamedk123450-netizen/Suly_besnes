import type { PlayerProfile } from './player';

export type SpeedCardKind = 'production-25' | 'production-50' | 'production-instant' | 'capacity-boost';

export interface SpeedCardStack {
  kind: SpeedCardKind;
  quantity: number;
}

export const SPEED_CARD_LABELS: Record<SpeedCardKind, string> = {
  'production-25': 'تسريع الإنتاج 25%',
  'production-50': 'تسريع الإنتاج 50%',
  'production-instant': 'إكمال الإنتاج فورًا',
  'capacity-boost': 'زيادة السعة المؤقتة',
};

export const SPEED_CARD_DIAMOND_COSTS: Record<SpeedCardKind, number> = {
  'production-25': 12,
  'production-50': 24,
  'production-instant': 60,
  'capacity-boost': 36,
};

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (const character of seed) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return hash >>> 0;
}

/** Stable public identifier; it is safe to show to support/admin and does not expose email. */
export function accountCodeFromSeed(seed: string): string {
  const first = hashSeed(seed).toString(36).toUpperCase().padStart(7, '0').slice(-7);
  const second = hashSeed(`${seed}:business-empire`).toString(36).toUpperCase().padStart(5, '0').slice(-5);
  return `BE-${first}-${second}`;
}

function safeNonNegative(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
}

export function normalizeAccountFeatures(profile: PlayerProfile, accountSeed?: string): PlayerProfile {
  return {
    ...profile,
    accountCode: typeof profile.accountCode === 'string' && profile.accountCode.startsWith('BE-')
      ? profile.accountCode
      : accountCodeFromSeed(accountSeed ?? profile.id),
    diamonds: Math.floor(safeNonNegative(profile.diamonds)),
    speedCards: Array.isArray(profile.speedCards)
      ? profile.speedCards.filter((card) => card && typeof card.kind === 'string' && safeNonNegative(card.quantity) > 0).map((card) => ({ kind: card.kind, quantity: Math.floor(safeNonNegative(card.quantity)) }))
      : [],
    badges: Array.isArray(profile.badges) ? profile.badges.filter((badge): badge is string => typeof badge === 'string' && badge.trim().length > 0) : [],
  };
}
