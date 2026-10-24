import { describe, expect, it } from 'vitest';
import { DIAMOND_PACKAGES, getDiamondPackageBonus } from './diamondPackages';

describe('diamond package values', () => {
  it('keeps the published package amounts and prices in ascending tiers', () => {
    expect(DIAMOND_PACKAGES.map(({ id, diamonds, priceEgp }) => [id, diamonds, priceEgp])).toEqual([
      ['starter', 100, 50],
      ['builder', 250, 100],
      ['executive', 600, 200],
      ['empire', 1300, 400],
    ]);
  });

  it('shows an increasing bonus and preserves the empire package exact 62.5% value', () => {
    const bonuses = DIAMOND_PACKAGES.map(getDiamondPackageBonus);
    expect(bonuses.map((bonus) => bonus.diamonds)).toEqual([0, 50, 200, 500]);
    expect(bonuses.map((bonus) => bonus.percent)).toEqual([0, 25, 50, 62.5]);
    expect(bonuses[0].percent).toBeLessThanOrEqual(bonuses[1].percent);
    expect(bonuses[1].percent).toBeLessThanOrEqual(bonuses[2].percent);
    expect(bonuses[2].percent).toBeLessThanOrEqual(bonuses[3].percent);
  });
});
