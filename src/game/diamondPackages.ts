import type { DiamondPackageId } from '../storage/diamondTopupRepository';

export interface DiamondPackage {
  id: DiamondPackageId;
  diamonds: number;
  priceEgp: number;
  priceUsd: number;
  label: string;
  note: string;
  bonusDiamonds: number;
  bonusRewards?: readonly string[];
  topRibbon?: string;
  bottomRibbon?: string;
  isCrown?: boolean;
}

export const DIAMOND_PACKAGES: readonly DiamondPackage[] = [
  {
    id: 'starter',
    diamonds: 100,
    priceEgp: 50,
    priceUsd: 1,
    label: 'ألماس 100',
    note: '+ 10 ألماس إضافية',
    bonusDiamonds: 10,
  },
  {
    id: 'builder',
    diamonds: 550,
    priceEgp: 280,
    priceUsd: 5,
    label: 'ألماس 550',
    note: '+ 50 ألماس إضافية',
    bonusDiamonds: 50,
  },
  {
    id: 'executive',
    diamonds: 1000,
    priceEgp: 399,
    priceUsd: 8,
    label: 'ألماس 1000',
    note: '+ 200 ألماس إضافية',
    bonusDiamonds: 200,
    topRibbon: 'الأكثر شعبية',
    bottomRibbon: 'أفضل قيمة',
  },
  {
    id: 'empire',
    diamonds: 2050,
    priceEgp: 799,
    priceUsd: 16,
    label: 'ألماس 2050',
    note: '+ 350 ألماس إضافية',
    bonusDiamonds: 350,
  },
  {
    id: 'titan',
    diamonds: 5250,
    priceEgp: 1899,
    priceUsd: 38,
    label: 'ألماس 5250',
    note: '+ ألماس إضافية',
    bonusDiamonds: 750,
  },
  {
    id: 'sovereign',
    diamonds: 11000,
    priceEgp: 3599,
    priceUsd: 72,
    label: 'ألماس 11000',
    note: '+ 2500 ألماس إضافية',
    bonusDiamonds: 2500,
    bonusRewards: ['20 بطاقة تسريع الإنتاج', '10 بطاقات تسريع اليوم ×2', '50 غرام ذهب'],
    topRibbon: 'PREMIUM',
    isCrown: true,
  },
];

export function getDiamondPackageBonus(item: DiamondPackage): { diamonds: number; percent: number } {
  const baseDiamonds = item.diamonds - item.bonusDiamonds;
  return { diamonds: item.bonusDiamonds, percent: baseDiamonds > 0 ? (item.bonusDiamonds / baseDiamonds) * 100 : 0 };
}
