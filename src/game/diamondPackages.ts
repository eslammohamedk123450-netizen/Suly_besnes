import type { DiamondPackageId } from '../storage/diamondTopupRepository';

export interface DiamondPackage {
  id: DiamondPackageId;
  diamonds: number;
  priceUsd: number;
  label: string;
  note: string;
  bonusDiamonds: number;
  bonusRewards?: readonly string[];
}

export const DIAMOND_PACKAGES: readonly DiamondPackage[] = [
  { id: 'starter', diamonds: 100, priceUsd: 1, label: 'الباقة الأساسية', note: '100 ماسة مقابل 1 دولار', bonusDiamonds: 0 },
  { id: 'builder', diamonds: 545, priceUsd: 5, label: 'باقة البداية', note: '500 أساسية + 45 إضافية', bonusDiamonds: 45 },
  { id: 'executive', diamonds: 1110, priceUsd: 10, label: 'باقة التوسع', note: '1,000 أساسية + 110 إضافية', bonusDiamonds: 110 },
  { id: 'empire', diamonds: 2360, priceUsd: 20, label: 'باقة الإمبراطورية', note: '2,100 أساسية + 260 إضافية', bonusDiamonds: 260 },
  { id: 'titan', diamonds: 4300, priceUsd: 35, label: 'باقة النخبة', note: '3,800 أساسية + 500 إضافية', bonusDiamonds: 500 },
  { id: 'sovereign', diamonds: 7300, priceUsd: 50, label: 'الباقة الملكية', note: '6,200 أساسية + 1,100 إضافية', bonusDiamonds: 1100, bonusRewards: ['20 بطاقة تسريع الإنتاج', '10 بطاقات تسريع اليوم ×2', '50 غرام ذهب'] },
];

export function getDiamondPackageBonus(item: DiamondPackage): { diamonds: number; percent: number } {
  const baseDiamonds = item.diamonds - item.bonusDiamonds;
  return { diamonds: item.bonusDiamonds, percent: baseDiamonds > 0 ? item.bonusDiamonds / baseDiamonds * 100 : 0 };
}
