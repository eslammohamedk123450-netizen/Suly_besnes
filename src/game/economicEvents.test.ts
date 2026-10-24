import { describe, expect, it } from 'vitest';
import { findCountry } from '../domain/countries';
import { createNewPlayer, type PlayerProfile } from '../domain/player';
import { advanceDay } from './engine';
import { getGlobalMarketOffers } from './globalMarket';
import { getMarketQuote } from './market';
import { validatePlayerProfile } from '../../supabase/functions/game-command/profile-validator';

const createProfile = (day = 1): PlayerProfile => ({
  ...createNewPlayer(findCountry('egypt')!, 'اختبار الأحداث', new Date('2026-01-01T00:00:00.000Z')),
  day,
});

describe('scoped economic events', () => {
  it('raises only steel offers during the raw-material shortage and expires on schedule', () => {
    const result = advanceDay(createProfile(4));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const shortage = result.profile.events.at(-1)!;
    expect(shortage).toMatchObject({ materialId: 'steel', materialPriceMultiplier: 1.25, effectExpiresOnDay: 8, industryId: 'construction' });
    expect(validatePlayerProfile(result.profile)).toEqual({ ok: true });

    const regularOffers = getGlobalMarketOffers({ ...result.profile, events: [] });
    const affectedOffers = getGlobalMarketOffers(result.profile);
    const steelIndex = affectedOffers.findIndex((offer) => offer.materialId === 'steel');
    const grainIndex = affectedOffers.findIndex((offer) => offer.materialId === 'grain');
    expect(affectedOffers[steelIndex].unitPrice).toBeGreaterThan(regularOffers[steelIndex].unitPrice);
    expect(affectedOffers[grainIndex].unitPrice).toBe(regularOffers[grainIndex].unitPrice);

    const expired = { ...result.profile, day: 9 };
    const expiredOffers = getGlobalMarketOffers(expired);
    const dayNineBaseline = getGlobalMarketOffers({ ...expired, events: [] });
    expect(expiredOffers.find((offer) => offer.materialId === 'steel')?.unitPrice).toBe(dayNineBaseline.find((offer) => offer.materialId === 'steel')?.unitPrice);
  });

  it('raises food demand during the strong season and removes the boost after expiry', () => {
    const result = advanceDay(createProfile(7));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const season = result.profile.events.at(-1)!;
    expect(season).toMatchObject({ productId: 'food-pack', demandMultiplier: 1.25, effectExpiresOnDay: 12, industryId: 'food' });
    const seasonalDemand = getMarketQuote(result.profile, 'food-pack')!.demandUnits;
    const regularDemand = getMarketQuote({ ...result.profile, events: [] }, 'food-pack')!.demandUnits;
    expect(seasonalDemand).toBeGreaterThan(regularDemand);
    expect(getMarketQuote(result.profile, 'electronics')?.demandUnits).toBe(getMarketQuote({ ...result.profile, events: [] }, 'electronics')?.demandUnits);

    const expired = { ...result.profile, day: 13 };
    expect(getMarketQuote(expired, 'food-pack')?.demandUnits).toBe(getMarketQuote({ ...expired, events: [] }, 'food-pack')?.demandUnits);
  });

  it('keeps 30- and 60-day business cash flows finite, non-negative, and deterministic', () => {
    const start: PlayerProfile = {
      ...createProfile(),
      bankBalance: 1_000_000,
      companies: [{ id: 'food-company', name: 'شركة أغذية', industryId: 'food' as const, countryId: 'egypt' as const, foundedAt: '2026-01-01T00:00:00.000Z', foundedOnDay: 1, energyUnits: 50, energyCapacity: 60, operatingCostPerDay: 14_000, maintenanceCondition: 100 }],
    };
    const simulate = (days: number) => {
      let current: PlayerProfile = start;
      for (let index = 0; index < days; index += 1) {
        const result = advanceDay(current);
        expect(result.ok).toBe(true);
        if (!result.ok) throw new Error(result.message);
        current = result.profile;
        expect(Number.isFinite(current.bankBalance)).toBe(true);
        expect(current.bankBalance).toBeGreaterThanOrEqual(0);
        expect(Number.isFinite(current.payables)).toBe(true);
      }
      return current;
    };

    const after30 = simulate(30);
    const after60 = simulate(60);
    const repeat60 = simulate(60);
    expect(after30.day).toBe(31);
    expect(after60.day).toBe(61);
    expect(after30.bankBalance).toBeGreaterThan(0);
    expect(after60.bankBalance).toBeGreaterThan(0);
    expect(after60.payables).toBe(0);
    expect(after60.bankBalance).toBe(repeat60.bankBalance);
    expect(after60.events.map((event) => event.title)).toEqual(repeat60.events.map((event) => event.title));
  });
});
