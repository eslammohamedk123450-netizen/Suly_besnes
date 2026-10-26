/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LuckyWheelPrize {
  id: number;
  label: string;
  type: 'cash' | 'gold' | 'diamonds' | 'speed_card';
  amount: number;
  icon: string;
  color: string;
  chancePercent: number;
}

export interface LuckyWheelTierConfig {
  level: number;
  name: string;
  subtitle: string;
  badge: string;
  upgradeCostDiamonds: number;
  spinCostDiamonds: number;
  cooldownMinutes: number;
  prizes: LuckyWheelPrize[];
}

export const LUCKY_WHEEL_TIERS: readonly LuckyWheelTierConfig[] = [
  {
    level: 1,
    name: 'المبتدئ',
    subtitle: 'عجلة التأسيس للمشاريع الناشئة',
    badge: 'Starter',
    upgradeCostDiamonds: 0,
    spinCostDiamonds: 2,
    cooldownMinutes: 50,
    prizes: [
      { id: 0, label: '50,000 $', type: 'cash', amount: 50000, icon: '💵', color: '#10b981', chancePercent: 25 },
      { id: 1, label: '5 ماسات', type: 'diamonds', amount: 5, icon: '💎', color: '#06b6d4', chancePercent: 20 },
      { id: 2, label: '0.5 غرام ذهب', type: 'gold', amount: 0.5, icon: '🥇', color: '#f59e0b', chancePercent: 15 },
      { id: 3, label: 'تسريع فوري', type: 'speed_card', amount: 1, icon: '⚡', color: '#8b5cf6', chancePercent: 15 },
      { id: 4, label: '120,000 $', type: 'cash', amount: 120000, icon: '💰', color: '#10b981', chancePercent: 10 },
      { id: 5, label: '10 ماسات', type: 'diamonds', amount: 10, icon: '💎', color: '#38bdf8', chancePercent: 8 },
      { id: 6, label: '1.0 غرام ذهب', type: 'gold', amount: 1.0, icon: '👑', color: '#eab308', chancePercent: 5 },
      { id: 7, label: '25,000 $', type: 'cash', amount: 25000, icon: '💵', color: '#34d399', chancePercent: 2 },
    ],
  },
  {
    level: 2,
    name: 'رائد الأعمال',
    subtitle: 'عجلة التوسع والتجارة السريعة',
    badge: 'Entrepreneur',
    upgradeCostDiamonds: 25,
    spinCostDiamonds: 3,
    cooldownMinutes: 45,
    prizes: [
      { id: 0, label: '250,000 $', type: 'cash', amount: 250000, icon: '💵', color: '#10b981', chancePercent: 25 },
      { id: 1, label: '15 ماسة', type: 'diamonds', amount: 15, icon: '💎', color: '#06b6d4', chancePercent: 20 },
      { id: 2, label: '2.5 غرام ذهب', type: 'gold', amount: 2.5, icon: '🥇', color: '#f59e0b', chancePercent: 15 },
      { id: 3, label: 'تسريع فوري ×2', type: 'speed_card', amount: 2, icon: '⚡', color: '#8b5cf6', chancePercent: 15 },
      { id: 4, label: '600,000 $', type: 'cash', amount: 600000, icon: '💰', color: '#10b981', chancePercent: 10 },
      { id: 5, label: '30 ماسة', type: 'diamonds', amount: 30, icon: '💎', color: '#38bdf8', chancePercent: 8 },
      { id: 6, label: '5.0 غرام ذهب', type: 'gold', amount: 5.0, icon: '👑', color: '#eab308', chancePercent: 5 },
      { id: 7, label: '150,000 $', type: 'cash', amount: 150000, icon: '💵', color: '#34d399', chancePercent: 2 },
    ],
  },
  {
    level: 3,
    name: 'المستثمر',
    subtitle: 'عجلة المحافظ ورؤوس الأموال',
    badge: 'Investor',
    upgradeCostDiamonds: 60,
    spinCostDiamonds: 5,
    cooldownMinutes: 40,
    prizes: [
      { id: 0, label: '1,200,000 $', type: 'cash', amount: 1200000, icon: '💵', color: '#10b981', chancePercent: 25 },
      { id: 1, label: '40 ماسة', type: 'diamonds', amount: 40, icon: '💎', color: '#06b6d4', chancePercent: 20 },
      { id: 2, label: '10 غرام ذهب', type: 'gold', amount: 10, icon: '🥇', color: '#f59e0b', chancePercent: 15 },
      { id: 3, label: 'تسريع فوري ×5', type: 'speed_card', amount: 5, icon: '⚡', color: '#8b5cf6', chancePercent: 15 },
      { id: 4, label: '3,000,000 $', type: 'cash', amount: 3000000, icon: '💰', color: '#10b981', chancePercent: 10 },
      { id: 5, label: '80 ماسة', type: 'diamonds', amount: 80, icon: '💎', color: '#38bdf8', chancePercent: 8 },
      { id: 6, label: '20 غرام ذهب', type: 'gold', amount: 20, icon: '👑', color: '#eab308', chancePercent: 5 },
      { id: 7, label: '800,000 $', type: 'cash', amount: 800000, icon: '💵', color: '#34d399', chancePercent: 2 },
    ],
  },
  {
    level: 4,
    name: 'نقابة الأعمال',
    subtitle: 'عجلة التكتلات والصفقات الصناعية',
    badge: 'Syndicate',
    upgradeCostDiamonds: 120,
    spinCostDiamonds: 8,
    cooldownMinutes: 35,
    prizes: [
      { id: 0, label: '6,000,000 $', type: 'cash', amount: 600000, icon: '💵', color: '#10b981', chancePercent: 25 },
      { id: 1, label: '100 ماسة', type: 'diamonds', amount: 100, icon: '💎', color: '#06b6d4', chancePercent: 20 },
      { id: 2, label: '40 غرام ذهب', type: 'gold', amount: 40, icon: '🥇', color: '#f59e0b', chancePercent: 15 },
      { id: 3, label: 'تسريع فوري ×10', type: 'speed_card', amount: 10, icon: '⚡', color: '#8b5cf6', chancePercent: 15 },
      { id: 4, label: '15,000,000 $', type: 'cash', amount: 15000000, icon: '💰', color: '#10b981', chancePercent: 10 },
      { id: 5, label: '200 ماسة', type: 'diamonds', amount: 200, icon: '💎', color: '#38bdf8', chancePercent: 8 },
      { id: 6, label: '80 غرام ذهب', type: 'gold', amount: 80, icon: '👑', color: '#eab308', chancePercent: 5 },
      { id: 7, label: '4,000,000 $', type: 'cash', amount: 4000000, icon: '💵', color: '#34d399', chancePercent: 2 },
    ],
  },
  {
    level: 5,
    name: 'السيادي',
    subtitle: 'عجلة الثروة الإمبراطورية الكبرى',
    badge: 'Sovereign',
    upgradeCostDiamonds: 250,
    spinCostDiamonds: 12,
    cooldownMinutes: 30,
    prizes: [
      { id: 0, label: '30,000,000 $', type: 'cash', amount: 30000000, icon: '💵', color: '#10b981', chancePercent: 25 },
      { id: 1, label: '300 ماسة', type: 'diamonds', amount: 300, icon: '💎', color: '#06b6d4', chancePercent: 20 },
      { id: 2, label: '150 غرام ذهب', type: 'gold', amount: 150, icon: '🥇', color: '#f59e0b', chancePercent: 15 },
      { id: 3, label: 'تسريع فوري ×25', type: 'speed_card', amount: 25, icon: '⚡', color: '#8b5cf6', chancePercent: 15 },
      { id: 4, label: '75,000,000 $', type: 'cash', amount: 75000000, icon: '💰', color: '#10b981', chancePercent: 10 },
      { id: 5, label: '600 ماسة', type: 'diamonds', amount: 600, icon: '💎', color: '#38bdf8', chancePercent: 8 },
      { id: 6, label: '300 غرام ذهب', type: 'gold', amount: 300, icon: '👑', color: '#eab308', chancePercent: 5 },
      { id: 7, label: '20,000,000 $', type: 'cash', amount: 20000000, icon: '💵', color: '#34d399', chancePercent: 2 },
    ],
  },
];

export function getLuckyWheelTier(level = 1): LuckyWheelTierConfig {
  const safeLevel = Math.max(1, Math.min(5, Math.floor(level || 1)));
  return LUCKY_WHEEL_TIERS[safeLevel - 1] ?? LUCKY_WHEEL_TIERS[0];
}

export interface LuckySpinState {
  isFree: boolean;
  remainingMs: number;
  minutes: number;
  seconds: number;
  formattedCountdown: string;
  cooldownMinutes: number;
  tier: LuckyWheelTierConfig;
}

export function getLuckySpinState(lastSpinTimestamp?: number, wheelLevel = 1): LuckySpinState {
  let ts = lastSpinTimestamp;
  if (!ts && typeof window !== 'undefined') {
    const stored = Number(window.localStorage.getItem('suly_last_spin_time') || 0);
    if (stored > 0) ts = stored;
  }

  const tier = getLuckyWheelTier(wheelLevel);
  const cooldownMs = tier.cooldownMinutes * 60 * 1000;

  const now = Date.now();
  const elapsed = ts ? now - ts : cooldownMs + 1000;
  const isFree = !ts || elapsed >= cooldownMs;
  const remainingMs = isFree ? 0 : Math.max(0, cooldownMs - elapsed);
  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  const formattedCountdown = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    isFree,
    remainingMs,
    minutes,
    seconds,
    formattedCountdown,
    cooldownMinutes: tier.cooldownMinutes,
    tier,
  };
}

export function recordLuckySpinUsed(): number {
  const now = Date.now();
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('suly_last_spin_time', String(now));
  }
  return now;
}

/**
 * Weighted random prize selector according to transparent chances
 */
export function selectWeightedPrize(prizes: readonly LuckyWheelPrize[]): LuckyWheelPrize {
  const totalWeight = prizes.reduce((sum, p) => sum + p.chancePercent, 0);
  const rand = Math.random() * totalWeight;
  let running = 0;
  for (const prize of prizes) {
    running += prize.chancePercent;
    if (rand <= running) {
      return prize;
    }
  }
  return prizes[0];
}
