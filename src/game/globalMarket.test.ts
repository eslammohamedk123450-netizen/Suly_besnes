import { describe, expect, it } from 'vitest';
import { findCountry } from '../domain/countries';
import { createNewPlayer } from '../domain/player';
import { buyGlobalMaterial } from './engine';
import { getGlobalMarketOffers, negotiateGlobalMarketOffer } from './globalMarket';

const newTestProfile = () => createNewPlayer(findCountry('egypt')!, 'اختبار السوق', new Date());

describe('global raw-material market', () => {
  it('publishes robot offers with both fixed and negotiable terms', () => {
    const profile = newTestProfile();
    const offers = getGlobalMarketOffers(profile);
    expect(offers.length).toBeGreaterThan(0);
    expect(offers.some((offer) => offer.negotiable)).toBe(true);
    expect(offers.some((offer) => !offer.negotiable)).toBe(true);
  });

  it('accepts a global purchase beyond the catalog storage limit', () => {
    const profile = newTestProfile();
    const offer = getGlobalMarketOffers(profile).find((item) => item.materialId === 'water')!;
    const result = buyGlobalMaterial(profile, offer.id, 2_500, offer.unitPrice);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.profile.inventory.find((lot) => lot.materialOrProductId === offer.materialId)?.quantity).toBe(2_500);
  });

  it('does not claim a fixed offer is negotiable', () => {
    const profile = newTestProfile();
    const offer = getGlobalMarketOffers(profile).find((item) => !item.negotiable)!;
    const result = negotiateGlobalMarketOffer(profile, offer.id);
    expect(result.accepted).toBe(false);
    expect(result.unitPrice).toBe(offer.unitPrice);
  });
});
