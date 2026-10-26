import { describe, expect, it } from 'vitest';
import { COUNTRIES } from '../domain/countries';
import { createNewPlayer, type PlayerProfile } from '../domain/player';
import { getContractOffers } from './contracts';
import { advanceDay, acceptContract, buyDirectLand, buyGoldWithDiamonds, buyMaterial, buySpeedCard, createDeposit, deliverContract, executeGameCommand, foundCompany, getDayBriefing, getStaffUpgradeCost, mergeDeposits, payStaffSalary, placeBid, repayLoan, runProduction, sellGold, takeLoan, updateNotificationState, upgradeLand, upgradeStaff, upgradeWarehouse, useDaySpeedCard, withdrawDeposit } from './engine';
import { negotiateContract } from './engine';
import { getSynergyBonuses } from './synergy';
import { normalizeSavedProfile } from '../storage/saveRepository';
import { getCashPriceForDiamondPrice } from './purchasePricing';

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

  it('upgrades staff and develops experience without breaking legacy contracts', () => {
    const employee = { id: 'staff-1', role: 'accountant' as const, name: 'محاسب التطوير', dailySalary: 4_500, hiredOnDay: 1, nextPayDay: 2, status: 'active' as const };
    const base = profile({ bankBalance: 500_000, staff: [employee] });
    const upgraded = upgradeStaff(base, employee.id);
    expect(upgraded.ok).toBe(true);
    if (!upgraded.ok) return;
    expect(upgraded.profile.staff[0].level).toBe(2);
    expect(upgraded.profile.bankBalance).toBe(500_000 - getStaffUpgradeCost(employee));
    const next = advanceDay(upgraded.profile);
    expect(next.ok).toBe(true);
    if (!next.ok) return;
    expect(next.profile.staff[0].experience).toBe(10);
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
    const base = profile({ diamonds: 5 });
    const bought = buySpeedCard(base, 'production-50', 2);
    expect(bought.ok).toBe(true);
    if (!bought.ok) return;
    expect(bought.profile.diamonds).toBe(1);
    expect(bought.profile.speedCards.find((card) => card.kind === 'production-50')?.quantity).toBe(2);
    expect(buySpeedCard(bought.profile, 'production-instant', 1).ok).toBe(false);
  });

  it('allows buying speed cards with cash at the matching 1%-discounted diamond rate', () => {
    const base = profile({ bankBalance: 1_000_000, diamonds: 0 });
    const cashPrice = getCashPriceForDiamondPrice(2);
    const bought = buySpeedCard(base, 'production-50', 1, 'cash');
    expect(bought.ok).toBe(true);
    if (!bought.ok) return;
    expect(bought.profile.bankBalance).toBe(base.bankBalance - cashPrice);
    expect(bought.profile.diamonds).toBe(0);
    expect(bought.data.cashSpent).toBe(cashPrice);
    expect(bought.profile.finances.totalExpenses).toBe(base.finances.totalExpenses + cashPrice);
  });

  it('awards the founder badge automatically after creating a company', () => {
    const base = profile({ lands: [{ id: 'land-1', label: 'أرض اختبار', landType: 'agricultural', areaSquareMeters: 500, purchasePrice: 100_000, acquiredAt: '2026-01-01T00:00:00.000Z', acquiredOnDay: 1 }] });
    const result = foundCompany(base, 'food', 'land-1', 'شركة الاختبار');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.profile.badges).toContain('شارة المؤسس');
  });

  it('executes season points, login rewards and daily events through serializable game commands', () => {
    const base = profile({ lands: [{ id: 'land-season', label: 'أرض الموسم', landType: 'agricultural', areaSquareMeters: 500, purchasePrice: 100_000, acquiredAt: '2026-01-01T00:00:00.000Z', acquiredOnDay: 1 }] });
    const challenge = executeGameCommand(base, { name: 'claim_season_challenge', args: { challengeId: 'daily-empire' } });
    expect(challenge.ok).toBe(true);
    if (challenge.ok) expect(challenge.profile.season?.points).toBe(10);

    const loginReward = executeGameCommand(base, { name: 'claim_login_reward', args: { rewardId: 'diamonds' } });
    expect(loginReward.ok).toBe(true);
    if (loginReward.ok) {
      expect(loginReward.profile.season?.points).toBe(5);
      expect(loginReward.profile.diamonds).toBe(base.diamonds + 8);
    }

    const event = executeGameCommand(base, { name: 'choose_season_event', args: { choiceId: 'safe' } });
    expect(event.ok).toBe(true);
    if (event.ok) {
      expect(event.profile.season?.points).toBe(5);
      expect(event.profile.bankBalance).toBe(base.bankBalance + 12_000);
    }
  });

  it('exchanges 50 diamonds for 100 grams of gold at the configured rate', () => {
    const bought = buyGoldWithDiamonds(profile({ diamonds: 60 }), 2);
    expect(bought.ok).toBe(true);
    if (!bought.ok) return;
    expect(bought.profile.diamonds).toBe(59);
    expect(bought.profile.goldGrams).toBe(2);
    expect(bought.profile.goldCostBasis).toBe(220);
    expect(bought.profile.ledger.at(-1)?.amount).toBe(220);
    const sold = sellGold(bought.profile, 0.5);
    expect(sold.ok).toBe(true);
    if (sold.ok) expect(sold.profile.bankBalance).toBeGreaterThan(bought.profile.bankBalance);
    expect(buyGoldWithDiamonds(bought.profile, 120).ok).toBe(false);
    expect(buyGoldWithDiamonds(profile({ diamonds: 50 }), 100).ok).toBe(true);
    expect(buyGoldWithDiamonds(profile({ diamonds: 50 }), 0.1).ok).toBe(false);
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

  it('blocks direct raw-material purchases and caps active deposits and loans', () => {
    const base = profile({ bankBalance: 1_000_000 });
    expect(buyMaterial(base, 'grain', 1).ok).toBe(false);

    let funded = base;
    for (let index = 0; index < 5; index += 1) {
      const opened = createDeposit(funded, 50_000, 3);
      expect(opened.ok).toBe(true);
      if (!opened.ok) return;
      funded = opened.profile;
    }
    expect(createDeposit(funded, 50_000, 3).ok).toBe(false);
    const merged = mergeDeposits(funded, funded.banking.deposits.filter((deposit) => deposit.status === 'active').map((deposit) => deposit.id));
    expect(merged.ok).toBe(true);
    if (merged.ok) {
      expect(merged.data.tranches).toHaveLength(5);
      expect(merged.data.principal).toBe(250_000);
      expect(merged.profile.banking.deposits.filter((deposit) => deposit.status === 'active')).toHaveLength(1);
    }

    const lands = Array.from({ length: 4 }, (_, index) => ({ id: `land-${index + 1}`, label: `ضمان ${index + 1}`, landType: 'industrial' as const, areaSquareMeters: 1_000, purchasePrice: 100_000, acquiredAt: '2026-01-01T00:00:00.000Z', acquiredOnDay: 1 }));
    let loansProfile = profile({ bankBalance: 0, lands, banking: { deposits: [], loans: [] } });
    for (let index = 0; index < 3; index += 1) {
      const loan = takeLoan(loansProfile, 'land', lands[index].id, 25_000, 7);
      expect(loan.ok).toBe(true);
      if (!loan.ok) return;
      loansProfile = loan.profile;
    }
    expect(takeLoan(loansProfile, 'land', lands[3].id, 25_000, 7).ok).toBe(false);
  });

  it('merges deposits while preserving each tranche maturity and settles them separately', () => {
    const base = profile({ bankBalance: 1_000_000 });
    const shortDeposit = createDeposit(base, 50_000, 3);
    expect(shortDeposit.ok).toBe(true);
    if (!shortDeposit.ok) return;
    const longDeposit = createDeposit(shortDeposit.profile, 50_000, 7);
    expect(longDeposit.ok).toBe(true);
    if (!longDeposit.ok) return;
    const merged = mergeDeposits(longDeposit.profile, [shortDeposit.data.id, longDeposit.data.id]);
    expect(merged.ok).toBe(true);
    if (!merged.ok) return;
    expect(normalizeSavedProfile(merged.profile)?.banking.deposits.find((deposit) => deposit.id === merged.data.id)?.tranches).toHaveLength(2);

    const firstSettlement = withdrawDeposit({ ...merged.profile, day: shortDeposit.data.maturityDay }, merged.data.id);
    expect(firstSettlement.ok).toBe(true);
    if (!firstSettlement.ok) return;
    expect(firstSettlement.data.amount).toBe(50_250);
    const remaining = firstSettlement.profile.banking.deposits.find((deposit) => deposit.id === merged.data.id)!;
    expect(remaining.status).toBe('active');
    expect(remaining.principal).toBe(50_000);

    const finalSettlement = withdrawDeposit({ ...firstSettlement.profile, day: longDeposit.data.maturityDay }, merged.data.id);
    expect(finalSettlement.ok).toBe(true);
    if (finalSettlement.ok) {
      expect(finalSettlement.data.amount).toBe(50_933);
      expect(finalSettlement.profile.banking.deposits.find((deposit) => deposit.id === merged.data.id)?.status).toBe('paid');
      expect(finalSettlement.profile.bankBalance).toBe(1_001_183);
    }
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

  it('records newly completed production for one persistent notification and safely updates notification state', () => {
    const productionOrder = { id: 'production-notice-1', companyId: 'company-1', productId: 'food-pack', productName: 'غذاء', batches: 1, outputQuantity: 20, outputUnit: 'عبوة', materialCost: 500, energyCost: 20, expectedUnitCost: 25, demandForecast: 100, qualityScore: 90, maintenanceCost: 0, startedOnDay: 1, completesOnDay: 2, status: 'active' as const };
    const result = advanceDay(profile({ bankBalance: 1_000_000, productionOrders: [productionOrder] }));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.profile.unreadProductionOrderIds).toEqual(['production-notice-1']);
    const marked = updateNotificationState(result.profile, 'read', ['production-completed:production-notice-1']);
    expect(marked.ok).toBe(true);
    if (marked.ok) {
      expect(marked.profile.readNotificationIds).toContain('production-completed:production-notice-1');
      expect(marked.profile.unreadProductionOrderIds).toEqual([]);
    }
  });

  it('keeps a newly purchased land parcel unavailable until the next in-game day', () => {
    const purchased = buyDirectLand(profile({ bankBalance: 1_000_000 }), 'starter-village-land');
    expect(purchased.ok).toBe(true);
    if (!purchased.ok) return;
    const purchasedLand = purchased.profile.lands.find((l) => l.id === purchased.data.landId);
    expect(purchasedLand?.availableForCompanyOnDay).toBe(2);
    const premature = foundCompany(purchased.profile, 'food', purchased.data.landId, 'شركة مبكرة');
    expect(premature.ok).toBe(false);
    if (!premature.ok) expect(premature.reason).toBe('condition-not-met');
    const ready = foundCompany({ ...purchased.profile, day: 2 }, 'food', purchased.data.landId, 'شركة جاهزة');
    expect(ready.ok).toBe(true);
  });

  it('requires a bid above both automated competitors and accepts the safe recommendation', () => {
    const base = profile({ countryId: 'egypt', bankBalance: 1_000_000, createdAt: new Date().toISOString() });
    const tied = placeBid(base, 'land-cairo-industrial-day-1', 3_600);
    expect(tied.ok).toBe(false);
    if (!tied.ok) expect(tied.reason).toBe('auction-lost');
    const safe = placeBid(base, 'land-cairo-industrial-day-1', 3_800);
    expect(safe.ok).toBe(true);
  });

  it('charges the discounted whole-diamond price for land and rejects invalid payment methods', () => {
    const base = profile({ bankBalance: 0, diamonds: 20 });
    const purchased = buyDirectLand(base, 'starter-village-land', 'diamonds');
    expect(purchased.ok).toBe(true);
    if (!purchased.ok) return;
    expect(purchased.profile.bankBalance).toBe(0);
    expect(purchased.profile.diamonds).toBe(3);
    expect(purchased.data.diamondsSpent).toBe(17);
    const invalid = buyDirectLand(base, 'starter-village-land', 'credits' as never);
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) expect(invalid.profile).toEqual(base);
  });

  it('consumes required raw materials and cash when upgrading warehouse capacity', () => {
    const base = profile({
      bankBalance: 100_000,
      inventory: [
        { id: 'steel-lot', materialOrProductId: 'steel', quantity: 2, unit: 'طن', unitCost: 6_000 },
        { id: 'cement-lot', materialOrProductId: 'cement', quantity: 5, unit: 'طن', unitCost: 2_000 },
      ],
    });
    const upgraded = upgradeWarehouse(base);
    expect(upgraded.ok).toBe(true);
    if (!upgraded.ok) return;
    expect(upgraded.profile.warehouseLevel).toBe(2);
    expect(upgraded.profile.bankBalance).toBe(60_000);
    expect(upgraded.profile.inventory).toHaveLength(0);
    expect(upgraded.data.capacity.materials).toBeGreaterThan(8_050);
  });

  it('activates a day-speed card once and restores normal speed after day rollover', () => {
    const bought = buySpeedCard(profile({ diamonds: 30 }), 'day-speed-2x', 1);
    expect(bought.ok).toBe(true);
    if (!bought.ok) return;
    const activated = useDaySpeedCard(bought.profile, 'day-speed-2x');
    expect(activated.ok).toBe(true);
    if (!activated.ok) return;
    expect(activated.profile.activeDaySpeedMultiplier).toBe(2);
    expect(activated.profile.speedCards).toHaveLength(0);
    expect(useDaySpeedCard(activated.profile, 'day-speed-3x').ok).toBe(false);
    const nextDay = advanceDay(activated.profile);
    expect(nextDay.ok).toBe(true);
    if (nextDay.ok) expect(nextDay.profile.activeDaySpeedMultiplier).toBe(1);
  });
});
