import { describe, expect, it } from 'vitest';
import { findCountry } from '../domain/countries';
import { createNewPlayer } from '../domain/player';
import { buyGlobalMaterial } from './engine';
import { getGlobalMarketOffers, negotiateGlobalMarketOffer } from './globalMarket';
import { getDiscountedDiamondPrice } from './purchasePricing';

const newTestProfile = () => createNewPlayer(findCountry('egypt')!, 'اختبار السوق', new Date());

describe('global raw-material market', () => {
  it('publishes robot offers with both fixed and negotiable terms', () => {
    const profile = newTestProfile();
    const offers = getGlobalMarketOffers(profile);
    expect(offers.length).toBeGreaterThan(0);
    expect(offers.some((offer) => offer.negotiable)).toBe(true);
    expect(offers.some((offer) => !offer.negotiable)).toBe(true);
  });

  it('rejects purchases beyond the warehouse capacity and accepts stock within the limit', () => {
    const profile = { ...newTestProfile(), bankBalance: 5_000_000 };
    const offer = getGlobalMarketOffers(profile).find((item) => item.materialId === 'water')!;
    const oversized = buyGlobalMaterial(profile, offer.id, 2_500, offer.unitPrice);
    expect(oversized.ok).toBe(false);
    const result = buyGlobalMaterial(profile, offer.id, 2_000, offer.unitPrice);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.profile.inventory.find((lot) => lot.materialOrProductId === offer.materialId)?.quantity).toBe(2_000);
  });

  it('accepts an eligible market purchase with diamonds and leaves cash untouched', () => {
    const base = newTestProfile();
    const offer = getGlobalMarketOffers(base).find((item) => item.materialId === 'water')!;
    const total = 2_000 * offer.unitPrice;
    const diamonds = getDiscountedDiamondPrice(total);
    const profile = { ...base, bankBalance: 0, diamonds };
    const result = buyGlobalMaterial(profile, offer.id, 2_000, offer.unitPrice, 'diamonds');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.profile.bankBalance).toBe(0);
      expect(result.profile.diamonds).toBe(0);
      expect(result.data.diamondsSpent).toBe(diamonds);
    }
  });

  it('does not claim a fixed offer is negotiable', () => {
    const profile = newTestProfile();
    const offer = getGlobalMarketOffers(profile).find((item) => !item.negotiable)!;
    const result = negotiateGlobalMarketOffer(profile, offer.id);
    expect(result.accepted).toBe(false);
    expect(result.unitPrice).toBe(offer.unitPrice);
  });
});
