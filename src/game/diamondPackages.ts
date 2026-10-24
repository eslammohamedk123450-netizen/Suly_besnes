import type { DiamondPackageId } from '../storage/diamondTopupRepository';

export interface DiamondPackage {
  id: DiamondPackageId;
  diamonds: number;
  priceEgp: number;
  label: string;
  note: string;
}

export const DIAMOND_PACKAGES: readonly DiamondPackage[] = [
  { id: 'starter', diamonds: 100, priceEgp: 50, label: 'الباقة الأولى', note: 'لبداية سريعة' },
  { id: 'builder', diamonds: 250, priceEgp: 100, label: 'باقة التوسع', note: 'الأكثر توازنًا' },
  { id: 'executive', diamonds: 600, priceEgp: 200, label: 'باقة المدير', note: 'لشراء عدة بطاقات' },
  { id: 'empire', diamonds: 1300, priceEgp: 400, label: 'باقة الإمبراطورية', note: 'للتوسع الكبير' },
];

const BASE_DIAMONDS_PER_EGP = DIAMOND_PACKAGES[0].diamonds / DIAMOND_PACKAGES[0].priceEgp;

export function getDiamondPackageBonus(item: DiamondPackage): { diamonds: number; percent: number } {
  const baseDiamonds = item.priceEgp * BASE_DIAMONDS_PER_EGP;
  const diamonds = Math.max(0, item.diamonds - baseDiamonds);
  return { diamonds, percent: baseDiamonds > 0 ? diamonds / baseDiamonds * 100 : 0 };
}
