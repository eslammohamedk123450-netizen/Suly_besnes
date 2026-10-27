import { beforeEach, describe, expect, it } from 'vitest';
import { COUNTRIES, findCountry } from '../domain/countries';
import { getCitiesForCountry } from '../domain/empireExpansion';
import { createNewPlayer, type PlayerProfile } from '../domain/player';
import { loadSavedGame, saveGame } from '../storage/saveRepository';
import { validatePlayerProfile } from '../../supabase/functions/game-command/profile-validator';
import {
  advanceDay,
  autoSupplyAndProduce,
  hireStaff,
  sellProduct,
  serviceCompany,
} from './engine';
import {
  activateReadyEmpireFacilities,
  assignStaffToEmpireFacility,
  buildExpansionOperationId,
  COUNTRY_EXPANSION_GATEWAY,
  evaluateCountryExpansion,
  executeCityExpansion,
  previewCityExpansion,
  registerCountryExpansionIntent,
  selectEmpireAdminReport,
  selectEmpireOperationalAlerts,
  selectUnifiedEmpireFacilities,
} from './empireExpansionEngine';

function ensureMemoryLocalStorage(): void {
  if (typeof globalThis.localStorage?.getItem === 'function') {
    globalThis.localStorage.clear();
    return;
  }
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, val: string) => {
        store.set(key, String(val));
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => {
        store.clear();
      },
    },
  });
}

function makeRichTestPlayer(): PlayerProfile {
  const egypt = findCountry('egypt') ?? COUNTRIES[0];
  const base = createNewPlayer(egypt, 'سولي مؤسس الإمبراطورية', new Date('2026-01-01T00:00:00.000Z'));
  return {
    ...base,
    level: 4,
    bankBalance: 120_000,
    ledger: [
      ...base.ledger,
      {
        id: 'seed-capital-boost',
        category: 'revenue',
        amount: 95_000,
        countryId: 'egypt',
        occurredAt: base.createdAt,
        note: 'رأس مال توسعي مسجل للاختبار',
      },
    ],
    finances: {
      totalRevenue: base.finances.totalRevenue + 95_000,
      totalExpenses: base.finances.totalExpenses,
      netProfit: base.finances.netProfit + 95_000,
    },
  };
}

describe('Empire Expansion & Strategic Management System', () => {
  beforeEach(() => {
    ensureMemoryLocalStorage();
  });

  it('creates a new facility in a second city, deducts cost once, assigns traceable ID, and passes validator', () => {
    const before = makeRichTestPlayer();
    const cities = getCitiesForCountry('egypt');
    const alexandria = cities[1]; // الإسكندرية وبرج العرب
    const opId = buildExpansionOperationId({
      countryId: 'egypt',
      cityId: alexandria.id,
      kind: 'factory',
      subType: 'water',
      day: before.day,
      sequenceHint: 1,
    });

    const preview = previewCityExpansion(before, {
      operationId: opId,
      cityId: alexandria.id,
      kind: 'factory',
      industryId: 'water',
      paymentMethod: 'cash',
    });
    expect(preview).not.toBeNull();
    expect(preview!.allRequirementsMet).toBe(true);
    expect(preview!.requiresNewLicense).toBe(true);
    expect(preview!.licenseFee).toBeGreaterThan(0);

    const res = executeCityExpansion(before, {
      operationId: opId,
      cityId: alexandria.id,
      kind: 'factory',
      industryId: 'water',
      customName: 'مصنع مياه الإسكندرية النقية',
      paymentMethod: 'cash',
    });

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    // Exact single deduction
    expect(res.profile.bankBalance).toBe(before.bankBalance - preview!.totalCashCost);
    expect(res.data.totalCashPaid).toBe(preview!.totalCashCost);
    expect(res.data.operationId).toBe(opId);

    // Owned land + company + license created and linked to Alexandria
    expect(res.profile.lands.length).toBe(before.lands.length + 1);
    expect(res.profile.companies.length).toBe(before.companies.length + 1);
    expect(res.profile.licenses.some((l) => l.industryId === 'water')).toBe(true);
    expect(res.profile.empireExpansion?.processedOperationIds).toContain(opId);
    expect(res.profile.empireExpansion?.facilityCities[res.data.facilityId]).toBe(alexandria.id);

    // Unified facilities screen reflects under-construction status until Day + 1
    const unified = selectUnifiedEmpireFacilities(res.profile);
    const createdFacility = unified.find((f) => f.id === res.data.facilityId);
    expect(createdFacility).toBeDefined();
    expect(createdFacility?.cityName).toBe(alexandria.name);
    expect(createdFacility?.operationalState).toBe('constructing');

    // Edge profile validator passes without unexpected_field or duplicate_id errors
    const validation = validatePlayerProfile(res.profile, before);
    expect(validation).toEqual({ ok: true });
  });

  it('blocks opening a facility when funds or level/parent-company requirements are unmet', () => {
    const poorPlayer = {
      ...makeRichTestPlayer(),
      bankBalance: 1_200, // Not enough for city land + setup
    };
    const alexandria = getCitiesForCountry('egypt')[1];

    const insufficientRes = executeCityExpansion(poorPlayer, {
      operationId: 'op-insufficient-funds-1',
      cityId: alexandria.id,
      kind: 'shop',
      shopType: 'groceries',
      paymentMethod: 'cash',
    });

    expect(insufficientRes.ok).toBe(false);
    if (!insufficientRes.ok) {
      expect(insufficientRes.reason).toBe('insufficient-funds');
    }
    expect(insufficientRes.profile.bankBalance).toBe(1_200);
    expect(insufficientRes.profile.shops ?? []).toHaveLength(0);

    // Level requirement block (As-Suez requires level 2, test with level 1 novice)
    const egypt = findCountry('egypt')!;
    const lvl1Player = {
      ...createNewPlayer(egypt, 'مبتدئ', new Date('2026-01-01T00:00:00.000Z')),
      bankBalance: 100_000,
    };
    const aswanCity = getCitiesForCountry('egypt')[4]; // requires level 3
    const levelBlockedRes = executeCityExpansion(lvl1Player, {
      operationId: 'op-level-blocked-1',
      cityId: aswanCity.id,
      kind: 'branch',
      parentCompanyId: lvl1Player.companies[0].id,
      paymentMethod: 'cash',
    });
    expect(levelBlockedRes.ok).toBe(false);
    if (!levelBlockedRes.ok) {
      expect(levelBlockedRes.reason).toBe('condition-not-met');
    }
    expect(levelBlockedRes.profile.bankBalance).toBe(100_000);
  });

  it('prevents duplicate execution and double deduction on repeated clicks with the same operationId', () => {
    const player = makeRichTestPlayer();
    const alexandria = getCitiesForCountry('egypt')[1];
    const req = {
      operationId: 'op-repeat-click-guard-99',
      cityId: alexandria.id,
      kind: 'branch' as const,
      parentCompanyId: player.companies[0].id,
      paymentMethod: 'cash' as const,
    };

    const first = executeCityExpansion(player, req);
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const balanceAfterFirst = first.profile.bankBalance;
    const branchCountAfterFirst = (first.profile.branches ?? []).length;

    // Simulate repeated rapid clicks submitting the same operationId
    const second = executeCityExpansion(first.profile, req);
    const third = executeCityExpansion(second.profile, req);

    expect(second.ok).toBe(false);
    expect(third.ok).toBe(false);
    if (!second.ok) {
      expect(second.reason).toBe('already-claimed');
    }
    expect(third.profile.bankBalance).toBe(balanceAfterFirst);
    expect((third.profile.branches ?? []).length).toBe(branchCountAfterFirst);
    expect(third.profile.empireExpansion?.operationsLog).toHaveLength(1);
  });

  it('records real revenues and expenses per facility and reconciles 100% with profile.finances', () => {
    let profile = makeRichTestPlayer();
    const inheritedId = profile.companies[0].id;

    // 1. Repair inherited factory (records real maintenance expense)
    const repaired = serviceCompany(profile, inheritedId, 'cash');
    expect(repaired.ok).toBe(true);
    profile = repaired.profile;

    // 2. Run real production (autoSupplyAndProduce buys materials + reserves energy/maintenance)
    const produced = autoSupplyAndProduce(profile, inheritedId, 2);
    expect(produced.ok).toBe(true);
    profile = produced.profile;

    // 3. Advance day to complete production order and incur daily operating expenses
    const nextDay = advanceDay(profile);
    expect(nextDay.ok).toBe(true);
    profile = nextDay.profile;

    // 4. Sell finished food-pack in the market (records real revenue & sales tax)
    const foodStock = profile.inventory.find((lot) => lot.materialOrProductId === 'food-pack');
    expect(foodStock?.quantity).toBeGreaterThan(0);
    const sold = sellProduct(profile, 'food-pack', Math.min(10, foodStock!.quantity));
    expect(sold.ok).toBe(true);
    profile = sold.profile;

    const report = selectEmpireAdminReport(profile);
    const factoryRow = report.facilities.find((f) => f.facilityId === inheritedId);
    expect(factoryRow).toBeDefined();
    expect(factoryRow!.revenue).toBeGreaterThan(0);
    expect(factoryRow!.expenses).toBeGreaterThan(0);
    expect(factoryRow!.netProfit).toBe(factoryRow!.revenue - factoryRow!.expenses);

    // Grand total must match actual profile.finances with zero fabricated profit
    expect(report.grandTotal.reconciledWithLedger).toBe(true);
    expect(report.grandTotal.revenue).toBe(profile.finances.totalRevenue);
    expect(report.grandTotal.expenses).toBe(profile.finances.totalExpenses);
    expect(report.grandTotal.netProfit).toBe(profile.finances.netProfit);
  });

  it('distributes staff across branches and shops without creating duplicate payroll on advanceDay', () => {
    let profile = makeRichTestPlayer();
    const alexandria = getCitiesForCountry('egypt')[1];

    // Open a branch and a shop
    const branchRes = executeCityExpansion(profile, {
      operationId: 'op-staff-branch-1',
      cityId: alexandria.id,
      kind: 'branch',
      parentCompanyId: profile.companies[0].id,
    });
    expect(branchRes.ok).toBe(true);
    profile = branchRes.profile;
    const branchId = branchRes.ok ? branchRes.data.facilityId : '';

    // Hire a manager using the existing HR system
    const hired = hireStaff(profile, 'manager', 'أحمد منصور', profile.companies[0].id);
    expect(hired.ok).toBe(true);
    profile = hired.profile;
    const manager = profile.staff[0];
    expect(profile.staff).toHaveLength(1);

    // Reassign manager to the new regional branch
    const assigned = assignStaffToEmpireFacility(profile, manager.id, branchId);
    expect(assigned.ok).toBe(true);
    profile = assigned.profile;

    expect(profile.staff).toHaveLength(1);
    expect(profile.branches?.[0]?.managerStaffId).toBe(manager.id);
    expect(profile.empireExpansion?.facilityStaffAssignments[manager.id]).toBe(branchId);

    // Advance day until salary pay day and confirm salary is charged only ONCE
    let current = profile;
    const salaryLedgerBefore = current.ledger.filter((e) => e.note.includes(manager.name)).length;
    while (current.day < manager.nextPayDay) {
      const step = advanceDay(current);
      expect(step.ok).toBe(true);
      current = step.profile;
    }
    const salaryEntries = current.ledger.filter(
      (e) => e.category === 'expense' && e.note.includes(manager.name),
    );
    expect(salaryEntries.length - salaryLedgerBefore).toBeLessThanOrEqual(1);
    if (salaryEntries.length > salaryLedgerBefore) {
      expect(salaryEntries[salaryEntries.length - 1].amount).toBe(manager.dailySalary);
    }

    // Activate constructing branch now that day has advanced
    const activated = activateReadyEmpireFacilities(current);
    expect(activated.ok).toBe(true);
    if (activated.ok) {
      expect(activated.profile.branches?.[0]?.status).toBe('active');
    }
  });

  it('detects halted facilities, halt reasons, and operational alerts accurately', () => {
    const base = makeRichTestPlayer();
    const brokenProfile: PlayerProfile = {
      ...base,
      payables: 3_400,
      companies: base.companies.map((c, idx) =>
        idx === 0 ? { ...c, maintenanceCondition: 18, energyUnits: 0 } : c,
      ),
    };

    const facilities = selectUnifiedEmpireFacilities(brokenProfile);
    const factory = facilities.find((f) => f.kind === 'company');
    expect(factory?.operationalState).toBe('halted');
    expect(factory?.haltReasons.some((r) => r.includes('تعطل الآلات'))).toBe(true);
    expect(factory?.haltReasons.some((r) => r.includes('التزامات'))).toBe(true);

    const alerts = selectEmpireOperationalAlerts(brokenProfile);
    expect(alerts.some((a) => a.category === 'finance' && a.id === 'emp-alert-payables')).toBe(true);
    expect(alerts.some((a) => a.category === 'production' && a.severity === 'critical')).toBe(true);
    expect(alerts.some((a) => a.category === 'inventory')).toBe(true);
  });

  it('evaluates inter-country taxes/FX accurately and marks cross-border runtime as incomplete without deducting money', () => {
    const profile = makeRichTestPlayer();
    const assessment = evaluateCountryExpansion(profile, 'saudi', 'saudi-jubail', 'factory', {
      industryId: 'petroleum',
    });
    expect(assessment).not.toBeNull();
    expect(assessment!.gateway.isRuntimeExecutionEnabled).toBe(false);
    expect(assessment!.gateway.status).toBe('incomplete_multi_currency_runtime');
    expect(assessment!.costsInTargetCurrency.currencyCode).toBe('SAR');
    expect(assessment!.taxRatePercent).toBe(15);

    const intentRes = registerCountryExpansionIntent(profile, {
      intentId: 'intl-saudi-jubail-test-1',
      targetCountryId: 'saudi',
      targetCityId: 'saudi-jubail',
      activityKind: 'factory',
      industryId: 'petroleum',
    });
    expect(intentRes.ok).toBe(true);
    // Zero fake balance deduction
    expect(intentRes.profile.bankBalance).toBe(profile.bankBalance);
    expect(intentRes.profile.empireExpansion?.internationalIntentLog).toHaveLength(1);
  });

  it('persists all expansion cities, operations log, branches, shops, and staff assignments across saveGame and loadSavedGame', () => {
    const start = makeRichTestPlayer();
    const alexandria = getCitiesForCountry('egypt')[1];

    const expanded = executeCityExpansion(start, {
      operationId: 'op-save-roundtrip-1',
      cityId: alexandria.id,
      kind: 'shop',
      shopType: 'groceries',
      customName: 'أسواق الإسكندرية الذهبية',
      paymentMethod: 'cash',
    });
    expect(expanded.ok).toBe(true);
    if (!expanded.ok) return;

    const saveStatus = saveGame(expanded.profile, expanded.profile.id);
    expect(saveStatus).toEqual({ ok: true });

    const loaded = loadSavedGame(expanded.profile.id);
    expect(loaded).not.toBeNull();
    expect(loaded!.bankBalance).toBe(expanded.profile.bankBalance);
    expect(loaded!.shops).toHaveLength(1);
    expect(loaded!.shops?.[0]?.name).toBe('أسواق الإسكندرية الذهبية');
    expect(loaded!.empireExpansion?.processedOperationIds).toContain('op-save-roundtrip-1');
    expect(loaded!.empireExpansion?.facilityCities[expanded.data.facilityId]).toBe(alexandria.id);
    expect(COUNTRY_EXPANSION_GATEWAY.isRuntimeExecutionEnabled).toBe(false);
  });
});
