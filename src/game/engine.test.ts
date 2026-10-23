import { describe, expect, it } from 'vitest';
import { COUNTRIES } from '../domain/countries';
import { createNewPlayer, type PlayerProfile } from '../domain/player';
import { getContractOffers } from './contracts';
import { advanceDay, acceptContract, deliverContract, payStaffSalary, runProduction } from './engine';
import { normalizeSavedProfile } from '../storage/saveRepository';

function profile(overrides: Partial<PlayerProfile> = {}): PlayerProfile {
  return {
    ...createNewPlayer(COUNTRIES[0], 'اختبار', new Date('2026-01-01T00:00:00.000Z')),
    ...overrides,
  };
}

describe('Business Empire economy invariants', () => {
  it('does not accept or deliver the same contract twice', () => {
    const base = profile();
    const offer = getContractOffers(base)[0];
    const accepted = acceptContract(base, offer.id);
    expect(accepted.ok).toBe(true);
    if (!accepted.ok) return;
    expect(acceptContract(accepted.profile, offer.id).ok).toBe(false);
    const withStock = { ...accepted.profile, inventory: [{ id: 'lot-1', materialOrProductId: offer.productId, quantity: offer.quantity, unit: 'وحدة', unitCost: 10 }] };
    const delivered = deliverContract(withStock, offer.id);
    expect(delivered.ok).toBe(true);
    if (!delivered.ok) return;
    expect(deliverContract(delivered.profile, offer.id).ok).toBe(false);
  });

  it('accrues salary once per elapsed day and pays it as a settlement', () => {
    const base = profile({
      bankBalance: 500_000,
      staff: [{ id: 'staff-1', role: 'accountant', name: 'محاسب الاختبار', dailySalary: 4_500, hiredOnDay: 1, nextPayDay: 2, status: 'active' }],
    });
    const next = advanceDay(base);
    expect(next.ok).toBe(true);
    if (!next.ok) return;
    const employee = next.profile.staff[0];
    expect(employee.unpaidSalary).toBe(4_500);
    expect(next.profile.ledger.filter((entry) => entry.note === 'رواتب مستحقة عن اليوم')).toHaveLength(1);
    const paid = payStaffSalary(next.profile, employee.id);
    expect(paid.ok).toBe(true);
    if (!paid.ok) return;
    expect(paid.profile.staff[0].unpaidSalary).toBe(0);
    expect(paid.profile.ledger.filter((entry) => entry.note.startsWith('سداد راتب مستحق'))).toHaveLength(1);
    expect(paid.profile.ledger.filter((entry) => entry.note === 'رواتب مستحقة عن اليوم')).toHaveLength(1);
  });

  it('pauses and restores energy around unpaid obligations', () => {
    const base = profile({
      bankBalance: 0,
      staff: [{ id: 'staff-1', role: 'accountant', name: 'محاسب الاختبار', dailySalary: 4_500, hiredOnDay: 1, nextPayDay: 2, status: 'active' }],
      companies: [{ id: 'company-1', name: 'شركة اختبار', industryId: 'food', countryId: 'egypt', foundedAt: '2026-01-01T00:00:00.000Z', foundedOnDay: 1, energyUnits: 0, energyCapacity: 60, operatingCostPerDay: 0, maintenanceCondition: 100 }],
    });
    const paused = advanceDay(base);
    expect(paused.ok).toBe(true);
    if (!paused.ok) return;
    expect(paused.profile.companies[0].energyUnits).toBe(0);
    const paid = payStaffSalary(paused.profile, 'staff-1');
    expect(paid.ok).toBe(false);
    const funded = { ...paused.profile, bankBalance: 1_000_000 };
    const settled = payStaffSalary(funded, 'staff-1');
    expect(settled.ok).toBe(true);
    if (!settled.ok) return;
    const resumed = advanceDay({ ...settled.profile, staff: settled.profile.staff.map((item) => ({ ...item, status: 'terminated' as const })) });
    expect(resumed.ok).toBe(true);
    if (!resumed.ok) return;
    expect(resumed.profile.companies[0].energyUnits).toBeGreaterThan(0);
  });

  it('rejects production that would exceed product storage', () => {
    const base = profile({
      bankBalance: 500_000,
      companies: [{ id: 'company-1', name: 'مصنع اختبار', industryId: 'food', countryId: 'egypt', foundedAt: '2026-01-01T00:00:00.000Z', foundedOnDay: 1, energyUnits: 60, energyCapacity: 60, operatingCostPerDay: 0, maintenanceCondition: 100 }],
      inventory: [
        { id: 'grain', materialOrProductId: 'grain', quantity: 4, unit: 'كجم', unitCost: 500 },
        { id: 'packaging', materialOrProductId: 'packaging', quantity: 1, unit: 'وحدة', unitCost: 350 },
        { id: 'food', materialOrProductId: 'food-pack', quantity: 997, unit: 'عبوة', unitCost: 500 },
      ],
    });
    const result = runProduction(base, 'company-1', 1);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('storage-limit');
  });

  it('rejects malformed cloud saves while retaining valid legacy saves', () => {
    expect(normalizeSavedProfile({ id: 'x', bankBalance: 'not-a-number' })).toBeNull();
    const valid = profile();
    expect(normalizeSavedProfile(valid)?.id).toBe(valid.id);
  });
});
