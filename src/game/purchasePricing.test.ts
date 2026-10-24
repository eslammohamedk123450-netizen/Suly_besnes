import { describe, expect, it } from 'vitest';
import { DIAMOND_VALUE_EGP, getCashPriceForDiamondPrice, getDiscountedDiamondPrice } from './purchasePricing';

describe('diamond purchase pricing', () => {
  it('uses 100 grams of gold at 6,000 EGP per gram as 50 diamonds', () => {
    expect(DIAMOND_VALUE_EGP).toBe(12_000);
    expect(getDiscountedDiamondPrice(100 * 6_000)).toBe(49);
  });

  it('applies at least the 1% discount when converting cash prices to whole diamonds', () => {
    const cashPrice = 500_000;
    const diamonds = getDiscountedDiamondPrice(cashPrice);
    expect(diamonds).toBeGreaterThan(0);
    expect(diamonds * DIAMOND_VALUE_EGP).toBeLessThanOrEqual(cashPrice * 0.99);
  });

  it('returns no diamond quote when the discounted value is less than one whole diamond', () => {
    expect(getDiscountedDiamondPrice(12_000)).toBe(0);
  });

  it('pairs existing card prices with a cash price whose discounted quote returns the same diamonds', () => {
    for (const diamonds of [12, 24, 30, 60]) {
      expect(getDiscountedDiamondPrice(getCashPriceForDiamondPrice(diamonds))).toBe(diamonds);
    }
  });
});
