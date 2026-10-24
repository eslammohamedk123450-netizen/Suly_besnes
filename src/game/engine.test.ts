import { describe, expect, it } from 'vitest';
import { COUNTRIES } from '../domain/countries';
import { createNewPlayer, type PlayerProfile } from '../domain/player';
import { getContractOffers } from './contracts';
import { advanceDay, acceptContract, buyGoldWithDiamonds, buySpeedCard, deliverContract, foundCompany, getDayBriefing, payStaffSalary, repayLoan, runProduction, sellGold, takeLoan, upgradeLand } from './engine';
import { negotiateContract } from './engine';
import { getSynergyBonuses } from './synergy';
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
    const withStock = { ...accepted.profile, inventory: [{ id: 'lot-1', materialOrProductId: offer.productId, quantity: offer.quantity, unit: 'وحدة', unitCost: 10, qualityScore: 100 }] };
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

  it('allows one bounded contract negotiation and calculates company synergy', () => {
    const base = profile({
      companies: [
        { id: 'food', name: 'غذاء', industryId: 'food', countryId: 'egypt', foundedAt: '2026-01-01T00:00:00.000Z', foundedOnDay: 1 },
        { id: 'transport', name: 'نقل', industryId: 'transport', countryId: 'egypt', foundedAt: '2026-01-01T00:00:00.000Z', foundedOnDay: 1 },
      ],
    });
    const offer = getContractOffers(base)[0];
    const accepted = acceptContract(base, offer.id);
    expect(accepted.ok).toBe(true);
    if (!accepted.ok) return;
    const negotiated = negotiateContract(accepted.profile, offer.id, 'price');
    expect(negotiated.ok).toBe(true);
    if (!negotiated.ok) return;
    expect(negotiated.profile.contracts[0].unitPrice).toBeGreaterThan(offer.unitPrice);
    expect(negotiateContract(negotiated.profile, offer.id, 'deadline').ok).toBe(false);
    expect(getSynergyBonuses(negotiated.profile).length).toBeGreaterThan(0);
  });

  it('buys speed cards with diamonds and rejects unaffordable quantities', () => {
    const base = profile({ diamonds: 60 });
    const bought = buySpeedCard(base, 'production-50', 2);
    expect(bought.ok).toBe(true);
    if (!bought.ok) return;
    expect(bought.profile.diamonds).toBe(12);
    expect(bought.profile.speedCards.find((card) => card.kind === 'production-50')?.quantity).toBe(2);
    expect(buySpeedCard(bought.profile, 'production-instant', 1).ok).toBe(false);
  });

  it('awards the founder badge automatically after creating a company', () => {
    const base = profile({ lands: [{ id: 'land-1', label: 'أرض اختبار', landType: 'agricultural', areaSquareMeters: 500, purchasePrice: 100_000, acquiredAt: '2026-01-01T00:00:00.000Z', acquiredOnDay: 1 }] });
    const result = foundCompany(base, 'food', 'land-1', 'شركة الاختبار');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.profile.badges).toContain('شارة المؤسس');
  });

  it('exchanges diamonds for gold and gold for cash without negative balances', () => {
    const bought = buyGoldWithDiamonds(profile({ diamonds: 120 }), 1);
    expect(bought.ok).toBe(true);
    if (!bought.ok) return;
    expect(bought.profile.diamonds).toBe(60);
    expect(bought.profile.goldGrams).toBe(1);
    const sold = sellGold(bought.profile, 0.5);
    expect(sold.ok).toBe(true);
    if (sold.ok) expect(sold.profile.bankBalance).toBeGreaterThan(bought.profile.bankBalance);
    expect(buyGoldWithDiamonds(bought.profile, 2).ok).toBe(false);
  });

  it('supports paying several loan installments or the full balance at once', () => {
    const base = profile({ bankBalance: 500_000, lands: [{ id: 'land-loan', label: 'ضمان', landType: 'industrial', areaSquareMeters: 1_000, purchasePrice: 200_000, acquiredAt: '2026-01-01T00:00:00.000Z', acquiredOnDay: 1 }] });
    const opened = takeLoan(base, 'land', 'land-loan', 100_000, 14);
    expect(opened.ok).toBe(true);
    if (!opened.ok) return;
    const partial = repayLoan(opened.profile, opened.data.id, 2);
    expect(partial.ok).toBe(true);
    if (!partial.ok) return;
    expect(partial.data.remainingBalance).toBeLessThan(opened.data.remainingBalance);
    const closed = repayLoan(partial.profile, opened.data.id, 'all');
    expect(closed.ok).toBe(true);
    if (closed.ok) expect(closed.data.status).toBe('paid');
  });

  it('upgrades land with a bounded level and increases its usable area', () => {
    const base = profile({ bankBalance: 250_000, lands: [{ id: 'land-upgrade', label: 'أرض تطوير', landType: 'industrial', areaSquareMeters: 1_000, purchasePrice: 120_000, acquiredAt: '2026-01-01T00:00:00.000Z', acquiredOnDay: 1 }] });
    const result = upgradeLand(base, 'land-upgrade');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.level).toBe(2);
      expect(result.profile.lands[0].areaSquareMeters).toBe(1_100);
      expect(result.profile.bankBalance).toBe(170_000);
    }
  });

  it('rotates through a broader deterministic economic event cycle', () => {
    const base = profile();
    const titles = Array.from({ length: 8 }, (_, index) => getDayBriefing({ ...base, day: index + 1 }).event.title);
    expect(new Set(titles).size).toBe(8);
    expect(titles).toContain('فرصة تصدير استثنائية');
  });
});
