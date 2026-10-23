import { describe, expect, it } from 'vitest';
import { validatePlayerProfile } from './profile-validator';

const validProfile = () => ({
  id: 'player-1', accountCode: 'BE-ABCDE-12345', name: 'مستثمر', level: 1, countryId: 'egypt',
  createdAt: '2026-10-23T00:00:00.000Z', bankBalance: 1_000_000, payables: 0, goldGrams: 0,
  goldCostBasis: 0, diamonds: 0, speedCards: [], badges: [], assets: [], lands: [], companies: [],
  finances: { netProfit: 0, totalRevenue: 0, totalExpenses: 0 }, day: 1, inventory: [], licenses: [],
  investments: [], banking: { deposits: [], loans: [] }, staff: [], productionOrders: [], auctionHistory: [],
  redeemedCodeIds: [], sales: [], ledger: [], events: [], tasks: [], completedTaskIds: [],
  season: { seasonId: 'season-1', startedOnDay: 1, endsOnDay: 30, points: 0, claimedChallengeKeys: [] },
  reputation: 50, contracts: [], achievements: [], onboarding: { introCompleted: false, chapter: 0, seenGuides: [] },
});

const hasError = (profile: unknown, fragment: string, previous?: unknown) => {
  const result = validatePlayerProfile(profile, previous);
  return !result.ok && result.errors.some((error) => error.includes(fragment));
};

describe('validatePlayerProfile', () => {
  it('accepts a valid new player profile', () => {
    expect(validatePlayerProfile(validProfile())).toEqual({ ok: true });
  });

  it('rejects negative balances and gold', () => {
    expect(hasError({ ...validProfile(), bankBalance: -1 }, 'bankBalance')).toBe(true);
    expect(hasError({ ...validProfile(), goldGrams: -0.1 }, 'goldGrams')).toBe(true);
  });

  it('rejects duplicate entity IDs', () => {
    const profile = validProfile();
    profile.assets = [
      { id: 'asset-1', label: 'A', value: 100, acquiredAt: profile.createdAt },
      { id: 'asset-1', label: 'B', value: 100, acquiredAt: profile.createdAt },
    ];
    expect(hasError(profile, 'duplicate_id')).toBe(true);
  });

  it('requires each company to reference an owned land parcel', () => {
    const profile = validProfile();
    profile.companies = [{
      id: 'company-1', name: 'شركة', industryId: 'food', countryId: 'egypt',
      foundedAt: profile.createdAt, landId: 'missing-land', licenseIds: [], energyUnits: 10, energyCapacity: 20,
    }];
    expect(hasError(profile, 'company_requires_owned_land')).toBe(true);
  });

  it('rejects products without a completed production order', () => {
    const profile = validProfile();
    profile.inventory = [{ id: 'lot-1', materialOrProductId: 'food-pack', quantity: 1, unit: 'عبوة', unitCost: 10 }];
    expect(hasError(profile, 'product_without_completed_production')).toBe(true);
  });

  it('rejects an order whose product does not match the company industry', () => {
    const profile = validProfile();
    profile.lands = [{ id: 'land-1', label: 'أرض', areaSquareMeters: 10, purchasePrice: 100, acquiredAt: profile.createdAt }];
    profile.companies = [{
      id: 'company-1', name: 'شركة', industryId: 'food', countryId: 'egypt',
      foundedAt: profile.createdAt, landId: 'land-1', licenseIds: [], energyUnits: 10, energyCapacity: 20,
    }];
    profile.productionOrders = [{
      id: 'order-1', companyId: 'company-1', productId: 'refined-fuel', productName: 'منتج', batches: 1,
      outputQuantity: 4, outputUnit: 'وحدة', materialCost: 1, energyCost: 1, expectedUnitCost: 1,
      demandForecast: 1, qualityScore: 90, maintenanceCost: 1, startedOnDay: 1, completesOnDay: 2, status: 'completed',
    }];
    expect(hasError(profile, 'invalid_company_product')).toBe(true);
  });

  it('rejects energy above a company capacity and inventory above catalog capacity', () => {
    const profile = validProfile();
    profile.lands = [{ id: 'land-1', label: 'أرض', areaSquareMeters: 10, purchasePrice: 100, acquiredAt: profile.createdAt }];
    profile.companies = [{
      id: 'company-1', name: 'شركة', industryId: 'food', countryId: 'egypt',
      foundedAt: profile.createdAt, landId: 'land-1', licenseIds: [], energyUnits: 21, energyCapacity: 20,
    }];
    profile.inventory = [{ id: 'lot-1', materialOrProductId: 'grain', quantity: 1001, unit: 'كجم', unitCost: 1 }];
    const result = validatePlayerProfile(profile);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((error) => error.includes('exceeds_capacity'))).toBe(true);
      expect(result.errors.some((error) => error.includes('exceeds_storage_capacity'))).toBe(true);
    }
  });

  it('rejects a game day that moves backward and preserves profile identity', () => {
    const previous = { ...validProfile(), day: 5 };
    expect(hasError({ ...validProfile(), day: 4 }, 'cannot_move_backward', previous)).toBe(true);
    expect(hasError({ ...validProfile(), id: 'different-player' }, 'identity_changed', previous)).toBe(true);
  });

  it('rejects out-of-range level and seasonal points', () => {
    const profile = validProfile();
    profile.level = 1001;
    profile.season.points = 1_000_000_001;
    const result = validatePlayerProfile(profile);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((error) => error.includes('profile.level'))).toBe(true);
      expect(result.errors.some((error) => error.includes('profile.season.points'))).toBe(true);
    }
  });

  it('rejects unexpected profile fields and oversized content', () => {
    expect(hasError({ ...validProfile(), clientInjected: true }, 'unexpected_field')).toBe(true);
    const profile = validProfile();
    profile.events = [{ id: 'event-1', day: 1, title: 'x'.repeat(530_000), cashImpact: 0, occurredAt: profile.createdAt }];
    expect(hasError(profile, 'payload_too_large')).toBe(true);
  });

  it('accepts a valid product backed by completed production and rejects over-capacity plans', () => {
    const profile = validProfile();
    profile.lands = [{ id: 'land-1', label: 'أرض', areaSquareMeters: 10, purchasePrice: 100, acquiredAt: profile.createdAt }];
    profile.companies = [{
      id: 'company-1', name: 'شركة', industryId: 'food', countryId: 'egypt',
      foundedAt: profile.createdAt, landId: 'land-1', licenseIds: [], energyUnits: 10, energyCapacity: 20,
    }];
    profile.productionOrders = [{
      id: 'order-1', companyId: 'company-1', productId: 'food-pack', productName: 'عبوات غذائية', batches: 1,
      outputQuantity: 8, outputUnit: 'عبوة', materialCost: 10, energyCost: 1, expectedUnitCost: 2,
      demandForecast: 10, qualityScore: 90, maintenanceCost: 1, startedOnDay: 1, completesOnDay: 2, status: 'completed',
    }];
    profile.inventory = [{ id: 'lot-1', materialOrProductId: 'food-pack', quantity: 8, unit: 'عبوة', unitCost: 2, qualityScore: 90 }];
    expect(validatePlayerProfile(profile)).toEqual({ ok: true });
    profile.productionOrders[0].status = 'active';
    expect(hasError(profile, 'product_without_completed_production')).toBe(true);
  });
});
