import type { PlayerProfile } from './player';

export type SpeedCardKind = 'production-25' | 'production-50' | 'production-instant' | 'capacity-boost' | 'day-speed-2x' | 'day-speed-3x';

export interface SpeedCardStack {
  kind: SpeedCardKind;
  quantity: number;
}

export const SPEED_CARD_LABELS: Record<SpeedCardKind, string> = {
  'production-25': 'تسريع الإنتاج 25%',
  'production-50': 'تسريع الإنتاج 50%',
  'production-instant': 'إكمال الإنتاج فورًا',
  'capacity-boost': 'زيادة السعة المؤقتة',
  'day-speed-2x': 'تسريع اليوم ×2',
  'day-speed-3x': 'تسريع اليوم ×3',
};

export const SPEED_CARD_DIAMOND_COSTS: Record<SpeedCardKind, number> = {
  'production-25': 1,
  'production-50': 2,
  'production-instant': 3,
  'capacity-boost': 36,
  'day-speed-2x': 10,
  'day-speed-3x': 60,
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
    avatarId: typeof profile.avatarId === 'string' && profile.avatarId ? profile.avatarId : 'avatar_free_male_1',
    unlockedAvatarIds: Array.isArray(profile.unlockedAvatarIds) && profile.unlockedAvatarIds.length > 0
      ? Array.from(new Set(['avatar_free_male_1', 'avatar_free_male_2', 'avatar_free_female_1', 'avatar_free_female_2', ...profile.unlockedAvatarIds]))
      : ['avatar_free_male_1', 'avatar_free_male_2', 'avatar_free_female_1', 'avatar_free_female_2'],
    bio: typeof profile.bio === 'string' && profile.bio.trim().length > 0 ? profile.bio : 'ابنِ إمبراطوريتك الاستثمارية بعزيمة لا تلين ورؤية لا تعرف المستحيل.',
    renameCountThisWeek: typeof profile.renameCountThisWeek === 'number' && Number.isInteger(profile.renameCountThisWeek) ? profile.renameCountThisWeek : 0,
    lastRenameWeekTimestamp: typeof profile.lastRenameWeekTimestamp === 'number' ? profile.lastRenameWeekTimestamp : Date.now(),
  };
}
