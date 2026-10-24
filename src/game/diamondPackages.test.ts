import { describe, expect, it } from 'vitest';
import { DIAMOND_PACKAGES, getDiamondPackageBonus } from './diamondPackages';

describe('diamond package values', () => {
  it('keeps the published package amounts and dollar prices in ascending tiers', () => {
    expect(DIAMOND_PACKAGES.map(({ id, diamonds, priceUsd }) => [id, diamonds, priceUsd])).toEqual([
      ['starter', 100, 1],
      ['builder', 545, 5],
      ['executive', 1110, 10],
      ['empire', 2360, 20],
      ['titan', 4300, 35],
      ['sovereign', 7300, 50],
    ]);
  });

  it('shows the requested bonus diamond amounts', () => {
    const bonuses = DIAMOND_PACKAGES.map(getDiamondPackageBonus);
    expect(bonuses.map((bonus) => bonus.diamonds)).toEqual([0, 45, 110, 260, 500, 1100]);
    expect(DIAMOND_PACKAGES.at(-1)?.bonusRewards).toEqual(['20 بطاقة تسريع الإنتاج', '10 بطاقات تسريع اليوم ×2', '50 غرام ذهب']);
  });
});
