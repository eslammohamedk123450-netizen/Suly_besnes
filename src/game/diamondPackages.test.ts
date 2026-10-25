import { describe, expect, it } from 'vitest';
import { DIAMOND_PACKAGES, getDiamondPackageBonus } from './diamondPackages';

describe('diamond package values', () => {
  it('keeps the published package amounts and prices in ascending tiers', () => {
    expect(DIAMOND_PACKAGES.map(({ id, diamonds, priceEgp }) => [id, diamonds, priceEgp])).toEqual([
      ['starter', 100, 50],
      ['builder', 550, 280],
      ['executive', 1000, 399],
      ['empire', 2050, 799],
      ['titan', 5250, 1899],
      ['sovereign', 11000, 3599],
    ]);
  });

  it('shows the requested bonus diamond amounts', () => {
    const bonuses = DIAMOND_PACKAGES.map(getDiamondPackageBonus);
    expect(bonuses.map((bonus) => bonus.diamonds)).toEqual([10, 50, 200, 350, 750, 2500]);
    expect(DIAMOND_PACKAGES.at(-1)?.bonusRewards).toEqual(['20 بطاقة تسريع الإنتاج', '10 بطاقات تسريع اليوم ×2', '50 غرام ذهب']);
  });
});
