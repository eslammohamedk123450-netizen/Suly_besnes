import { describe, expect, it } from 'vitest';
import { COUNTRIES } from '../domain/countries';
import { createNewPlayer } from '../domain/player';
import { getSeasonSnapshot } from './season';

describe('season activity windows', () => {
  it('does not count historical sales for the daily challenge', () => {
    const base = createNewPlayer(COUNTRIES[0], 'اختبار', new Date('2026-01-01T00:00:00.000Z'));
    const profile = { ...base, day: 3, sales: [{ id: 'sale-1', productId: 'food-pack', quantity: 1, unitPrice: 1, grossRevenue: 1, tax: 0, soldOnDay: 2, soldAt: '2026-01-02T00:00:00.000Z' }] };
    expect(getSeasonSnapshot(profile).challenges.find((item) => item.id === 'daily-market')?.available).toBe(false);
  });

  it('counts weekly production only when started inside the active season', () => {
    const base = createNewPlayer(COUNTRIES[0], 'اختبار', new Date('2026-01-01T00:00:00.000Z'));
    const old = { id: 'old', companyId: 'c', productId: 'food-pack', productName: 'غذاء', batches: 1, outputQuantity: 1, outputUnit: 'عبوة', materialCost: 1, energyCost: 1, expectedUnitCost: 1, demandForecast: 1, qualityScore: 90, maintenanceCost: 1, startedOnDay: 1, completesOnDay: 2, status: 'completed' as const };
    const current = { ...old, id: 'current', startedOnDay: 2 };
    const profile = { ...base, day: 3, productionOrders: [old, current] };
    expect(getSeasonSnapshot(profile).challenges.find((item) => item.id === 'weekly-operator')?.available).toBe(true);
    expect(getSeasonSnapshot({ ...profile, day: 31, season: { seasonId: 'expansion-season-2', startedOnDay: 31, endsOnDay: 60, points: 0, claimedChallengeKeys: [] } }).challenges.find((item) => item.id === 'weekly-operator')?.available).toBe(false);
  });
});
