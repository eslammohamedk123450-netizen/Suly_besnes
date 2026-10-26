import { describe, expect, it } from 'vitest';
import { validatePlayerProfile } from '../../supabase/functions/game-command/profile-validator';
import { findCountry } from '../domain/countries';
import { createNewPlayer } from '../domain/player';
import {
  advanceDay,
  buyGlobalMaterial,
  drawFromForwardContract,
  exportGlobalProduct,
  runProduction,
  signForwardContract,
} from './engine';
import {
  calculateImportQuote,
  getCommodityBenchmarks,
  getCountryTradeProfile,
  getForwardContractTemplates,
  getGlobalExportBids,
  getGlobalMarketOffers,
  negotiateGlobalMarketOffer,
  proposeGlobalCounterOffer,
} from './globalMarket';
import { getDiscountedDiamondPrice } from './purchasePricing';

const newTestProfile = (countryId: 'egypt' | 'saudi' | 'uae' = 'egypt') =>
  createNewPlayer(findCountry(countryId)!, 'اختبار السوق العالمي', new Date('2026-04-01T00:00:00.000Z'));

describe('global commodity exchange & international trade engine', () => {
  it('publishes multi-tier global offers (Free-Zone B, Certified A+, Port Surplus C) with fixed and negotiable terms', () => {
    const profile = newTestProfile();
    const offers = getGlobalMarketOffers(profile);
    expect(offers.length).toBeGreaterThanOrEqual(33); // 11 commodities * 3 global tiers
    expect(offers.some((offer) => offer.negotiable)).toBe(true);
    expect(offers.some((offer) => !offer.negotiable)).toBe(true);
    expect(offers.some((offer) => offer.grade === 'A+' && offer.qualityScore === 97)).toBe(true);
    expect(offers.some((offer) => offer.grade === 'B' && offer.isLocalFreeZone)).toBe(true);
    expect(offers.some((offer) => offer.grade === 'C' && offer.qualityScore === 78)).toBe(true);
  });

  it('computes 7-day spot benchmarks and applies country comparative advantages', () => {
    const egyptProfile = newTestProfile('egypt');
    const saudiProfile = newTestProfile('saudi');
    const uaeTrade = getCountryTradeProfile('uae');

    const egyptBench = getCommodityBenchmarks(egyptProfile);
    const saudiBench = getCommodityBenchmarks(saudiProfile);

    const egyptOil = egyptBench.find((b) => b.materialId === 'crude-oil')!;
    const saudiOil = saudiBench.find((b) => b.materialId === 'crude-oil')!;
    expect(egyptOil.history).toHaveLength(7);
    expect(saudiOil.countryAdvantagePct).toBeGreaterThan(0);
    expect(saudiOil.spotPrice).toBeLessThan(egyptOil.spotPrice);
    expect(uaeTrade.baseCustomsTariffRate).toBe(0.01);
  });

  it('rejects purchases beyond the warehouse capacity and accepts stock within the limit', () => {
    const profile = { ...newTestProfile(), bankBalance: 5_000_000 };
    const offer = getGlobalMarketOffers(profile).find((item) => item.materialId === 'water')!;
    const oversized = buyGlobalMaterial(profile, offer.id, 2_500, offer.unitPrice);
    expect(oversized.ok).toBe(false);
    const result = buyGlobalMaterial(profile, offer.id, 2_000, offer.unitPrice);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.profile.inventory.find((lot) => lot.materialOrProductId === offer.materialId)?.quantity).toBe(2_000);
    }
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

  it('does not claim a fixed offer is negotiable and supports interactive counter-offers on negotiable lots', () => {
    const profile = newTestProfile();
    const fixedOffer = getGlobalMarketOffers(profile).find((item) => !item.negotiable)!;
    const fixedResult = negotiateGlobalMarketOffer(profile, fixedOffer.id);
    expect(fixedResult.accepted).toBe(false);
    expect(fixedResult.unitPrice).toBe(fixedOffer.unitPrice);

    const surplusOffer = getGlobalMarketOffers(profile).find((item) => item.grade === 'C' && item.negotiable)!;
    const tooLow = proposeGlobalCounterOffer(profile, surplusOffer.id, 50, 1);
    expect(tooLow.accepted).toBe(false);
    expect(tooLow.counterPrice).toBeDefined();

    const fairCounter = proposeGlobalCounterOffer(profile, surplusOffer.id, 50, surplusOffer.floorPrice);
    expect(fairCounter.accepted).toBe(true);
    expect(fairCounter.unitPrice).toBeLessThanOrEqual(surplusOffer.unitPrice);
  });

  it('handles Sea Freight (CIF) with Letter of Credit (30% upfront / 70% on port arrival) andfleet freight discounts', () => {
    const base = {
      ...newTestProfile(),
      bankBalance: 50_000,
      reputation: 70, // Unlocks Documentary LC (30/70)
    };
    const certOffer = getGlobalMarketOffers(base).find(
      (o) => o.materialId === 'grain' && o.grade === 'A+',
    )!;

    const quoteNoFleet = calculateImportQuote(base, certOffer, 50, {
      shippingMode: 'sea-cif',
      paymentTerm: 'lc-net2',
      fleetCount: 0,
    });
    const quoteWithFleet = calculateImportQuote(base, certOffer, 50, {
      shippingMode: 'sea-cif',
      paymentTerm: 'lc-net2',
      fleetCount: 2,
    });
    expect(quoteWithFleet.freightCost).toBeLessThan(quoteNoFleet.freightCost);
    expect(quoteWithFleet.upfrontCashDue).toBe(Math.round(quoteWithFleet.totalLandedCost * 0.3));
    expect(quoteWithFleet.deferredBalanceDue).toBe(
      quoteWithFleet.totalLandedCost - quoteWithFleet.upfrontCashDue,
    );

    const seaBuy = buyGlobalMaterial(base, certOffer.id, 50, undefined, 'cash', {
      shippingMode: 'sea-cif',
      paymentTerm: 'lc-net2',
      fleetCount: 2,
    });
    expect(seaBuy.ok).toBe(true);
    if (!seaBuy.ok) return;

    // Cargo is in-transit, not yet in warehouse, and only 30% upfront was deducted
    expect(seaBuy.data.inTransit).toBe(true);
    expect(seaBuy.profile.bankBalance).toBe(base.bankBalance - quoteWithFleet.upfrontCashDue);
    expect(seaBuy.profile.inventory.find((l) => l.materialOrProductId === 'grain')).toBeUndefined();
    expect(seaBuy.profile.globalShipments).toHaveLength(1);
    expect(validatePlayerProfile(seaBuy.profile)).toEqual({ ok: true });

    // Advance days until cargo arrives at port -> automatically unloaded & 70% LC settled
    let current = seaBuy.profile;
    while (current.day < seaBuy.data.arrivesOnDay) {
      const next = advanceDay(current);
      expect(next.ok).toBe(true);
      if (next.ok) current = next.profile;
    }

    const grainLot = current.inventory.find((l) => l.materialOrProductId === 'grain');
    expect(grainLot?.quantity).toBe(50);
    expect(grainLot?.qualityScore).toBe(97);
    expect(current.globalShipments?.[0].status).toBe('delivered');
    expect(current.globalShipments?.[0].deferredBalanceDue).toBe(0);
    expect(validatePlayerProfile(current)).toEqual({ ok: true });
  });

  it('raises finished product quality when using Grade A+ raw materials and exports containers internationally', () => {
    const base = newTestProfile();
    let current = {
      ...base,
      bankBalance: 25_000,
      companies: base.companies.map((c) => ({ ...c, maintenanceCondition: 100 })),
    };
    const offers = getGlobalMarketOffers(current);
    const certGrain = offers.find((o) => o.materialId === 'grain' && o.grade === 'A+')!;
    const certPack = offers.find((o) => o.materialId === 'packaging' && o.grade === 'A+')!;

    const gRes = buyGlobalMaterial(current, certGrain.id, 24, certGrain.unitPrice, 'cash');
    expect(gRes.ok).toBe(true);
    if (!gRes.ok) return;
    current = gRes.profile;

    const pRes = buyGlobalMaterial(current, certPack.id, 6, certPack.unitPrice, 'cash');
    expect(pRes.ok).toBe(true);
    if (!pRes.ok) return;
    current = pRes.profile;

    // Produce 4 batches of food-pack -> Grade A+ (97%) boosts base 86% quality to 92%!
    const prod = runProduction(current, current.companies[0].id, 4);
    expect(prod.ok).toBe(true);
    if (!prod.ok) return;
    current = prod.profile;
    expect(current.productionOrders[0].qualityScore).toBeGreaterThanOrEqual(92);

    while (current.productionOrders.some((o) => o.status === 'active')) {
      const next = advanceDay(current);
      expect(next.ok).toBe(true);
      if (next.ok) current = next.profile;
    }
    const foodLot = current.inventory.find((l) => l.materialOrProductId === 'food-pack')!;
    expect(foodLot.qualityScore).toBeGreaterThanOrEqual(92);

    // Export container to international port bid
    const exportBid = getGlobalExportBids(current).find((b) => b.productId === 'food-pack')!;
    expect(exportBid).toBeDefined();
    expect(exportBid.unitPrice).toBeGreaterThanOrEqual(exportBid.localReferencePrice);

    const balanceBeforeExport = current.bankBalance;
    const repBeforeExport = current.reputation ?? 50;
    const exported = exportGlobalProduct(current, exportBid.id, exportBid.minQuantity);
    expect(exported.ok).toBe(true);
    if (!exported.ok) return;

    expect(exported.profile.bankBalance).toBeGreaterThan(balanceBeforeExport);
    expect(exported.profile.reputation).toBeGreaterThan(repBeforeExport);
    expect(validatePlayerProfile(exported.profile)).toEqual({ ok: true });
  });

  it('signs forward supply hedging contracts (15% margin) and draws stock at locked price (85% settlement)', () => {
    let current = { ...newTestProfile(), bankBalance: 25_000 };
    const template = getForwardContractTemplates(current).find((t) => t.materialId === 'grain')!;
    expect(template).toBeDefined();
    expect(template.lockedUnitPrice).toBeLessThan(template.spotUnitPrice);

    const signed = signForwardContract(current, template.id);
    expect(signed.ok).toBe(true);
    if (!signed.ok) return;
    current = signed.profile;
    expect(current.bankBalance).toBe(25_000 - template.marginDeposit);
    expect(current.forwardContracts).toHaveLength(1);

    const contractId = current.forwardContracts![0].id;
    const drawn = drawFromForwardContract(current, contractId, 20);
    expect(drawn.ok).toBe(true);
    if (!drawn.ok) return;
    current = drawn.profile;

    const grainLot = current.inventory.find((l) => l.materialOrProductId === 'grain');
    expect(grainLot?.quantity).toBe(20);
    expect(grainLot?.unitCost).toBe(template.lockedUnitPrice);
    expect(current.forwardContracts![0].remainingQuota).toBe(template.totalContractUnits - 20);
    expect(validatePlayerProfile(current)).toEqual({ ok: true });
  });
});
