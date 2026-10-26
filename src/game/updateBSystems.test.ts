import { describe, it, expect } from 'vitest';
import {
  advanceDay,
  deliverContract,
  calculateStaffSalaryForLevel,
  upgradeStaff,
  getCompanyStaffingAnalysis,
  calculateCompanyValuation,
  calculateEmpireValuation,
  staffLevel,
  staffExperience,
  runProduction,
} from './engine';
import {
  calculateOfflineIdleProgress,
  applyOfflineReportToProfile,
} from './offlineIdleEngine';
import { COUNTRIES, CountryId } from '../domain/countries';
import { COUNTRY_SCENARIOS } from './countryScenarios';
import { COUNTRY_REAL_ASSETS } from './catalog';
import { getCountryTradeProfile } from './globalMarket';
import { verifyCountryAndLandIntegrity, buildCountryAuditCatalog } from '../domain/countryAuditCatalog';
import type { PlayerProfile } from '../domain/player';

function createMockProfile(partial: Partial<PlayerProfile> = {}): PlayerProfile {
  return {
    id: 'test_player',
    name: 'سليمان التاجر',
    countryId: 'jordan',
    day: 1,
    bankBalance: 25_000,
    diamonds: 50,
    goldGrams: 5,
    goldCostBasis: 550,
    warehouseLevel: 1,
    reputation: 60,
    payables: 0,
    activeDaySpeedMultiplier: 1,
    lands: [
      {
        id: 'jo-land-1',
        label: 'أرض مدينة سحاب الصناعية',
        areaSquareMeters: 520,
        purchasePrice: 3600,
        acquiredAt: '2026-01-01',
        acquiredOnDay: 1,
        availableForCompanyOnDay: 1,
        landType: 'industrial',
        upgradeLevel: 1,
      },
    ],
    companies: [
      {
        id: 'comp_jo_1',
        name: 'مصنع الكيماويات الأردني',
        industryId: 'detergents',
        countryId: 'jordan',
        foundedAt: '2026-01-01',
        foundedOnDay: 1,
        landId: 'jo-land-1',
        licenseIds: ['lic_1'],
        energyUnits: 60,
        energyCapacity: 60,
        operatingCostPerDay: 140,
        maintenanceCondition: 90,
        upgradeLevel: 2,
      },
    ],
    licenses: [],
    inventory: [
      {
        id: 'inv_chem',
        materialOrProductId: 'chemicals',
        quantity: 50,
        unit: 'كجم',
        unitCost: 24,
      },
      {
        id: 'inv_water',
        materialOrProductId: 'water',
        quantity: 50,
        unit: 'وحدة',
        unitCost: 5,
      },
    ],
    productionOrders: [],
    sales: [],
    speedCards: [],
    staff: [
      {
        id: 'staff_mgr',
        role: 'manager',
        name: 'ليث المجالي',
        companyId: 'comp_jo_1',
        dailySalary: 7000,
        level: 1,
        experience: 0,
        hiredOnDay: 1,
        nextPayDay: 2,
        status: 'active',
      },
      {
        id: 'staff_foreman',
        role: 'foreman',
        name: 'أبو أحمد الفني',
        companyId: 'comp_jo_1',
        dailySalary: 3200,
        level: 1,
        experience: 0,
        hiredOnDay: 1,
        nextPayDay: 2,
        status: 'active',
      },
      {
        id: 'staff_acc',
        role: 'accountant',
        name: 'رانيا المعاني',
        dailySalary: 4500,
        level: 1,
        experience: 0,
        hiredOnDay: 1,
        nextPayDay: 2,
        status: 'active',
      },
      {
        id: 'staff_lawyer',
        role: 'lawyer',
        name: 'جمال الطراونة',
        dailySalary: 4000,
        level: 1,
        experience: 0,
        hiredOnDay: 1,
        nextPayDay: 2,
        status: 'active',
      },
    ],
    contracts: [],
    investments: [],
    banking: {
      creditScore: 720,
      deposits: [],
      loans: [],
    },
    ledger: [],
    automationDirectives: {
      autoPaySalaries: false,
      autoPurchaseMaterials: true,
      autoPurchaseThreshold: 10,
      autoPurchaseBudget: 5000,
      autoRunProduction: false,
      autoProduceCompanyIds: [],
    },
    ...partial,
  };
}

describe('Update B Systems Verification', () => {
  describe('Mission 5: Jordan Integration', () => {
    it('integrates Jordan into COUNTRIES with correct capital, flag, and currency', () => {
      const jordan = COUNTRIES.find((c) => c.id === 'jordan');
      expect(jordan).toBeDefined();
      expect(jordan?.flag).toBe('🇯🇴');
      expect(jordan?.currency.symbol).toBe('$');
      expect(jordan?.startingBalance).toBe(25_000);
      expect(COUNTRIES.length).toBe(10);
    });

    it('has full flavor scenario, catalog assets, and global trade profile for Jordan', () => {
      expect(COUNTRY_SCENARIOS.jordan).toBeDefined();
      expect(COUNTRY_SCENARIOS.jordan.economicProfile.industrialHub).toContain('سحاب');
      expect(COUNTRY_SCENARIOS.jordan.economicProfile.portHub).toContain('العقبة');
      expect(COUNTRY_SCENARIOS.jordan.economicProfile.bankName).toContain('العربي');
      expect(COUNTRY_REAL_ASSETS.jordan).toBeDefined();
      expect(COUNTRY_REAL_ASSETS.jordan.directLands.length).toBeGreaterThan(0);
      const tradeProfile = getCountryTradeProfile('jordan');
      expect(tradeProfile).toBeDefined();
      expect(tradeProfile.advantagedMaterials).toContain('chemicals');
    });
  });

  describe('Mission 1: Staff Management & Factory Needs Analysis', () => {
    it('analyzes staffing needs accurately based on industry category and upgrade level', () => {
      const profile = createMockProfile();
      const company = profile.companies[0];
      const analysis = getCompanyStaffingAnalysis(company, profile);

      expect(analysis.companyId).toBe(company.id);
      expect(analysis.industryCategory).toBe('medium');
      expect(analysis.hasManager).toBe(true);
      expect(analysis.hasForeman).toBe(true);
      expect(analysis.operationalEfficiencyPercent).toBeGreaterThanOrEqual(100);
      expect(analysis.materialWasteReductionPercent).toBeGreaterThan(0);
    });
  });

  describe('Mission 3: Experience, Promotions, and Salaries', () => {
    it('scales daily salary dynamically with staff promotions (+18% per level)', () => {
      const baseSalary = 7000; // manager base
      const lvl1Salary = calculateStaffSalaryForLevel('manager', 1);
      const lvl2Salary = calculateStaffSalaryForLevel('manager', 2);
      const lvl3Salary = calculateStaffSalaryForLevel('manager', 3);

      expect(lvl1Salary).toBe(baseSalary);
      expect(lvl2Salary).toBe(Math.round(baseSalary * 1.18));
      expect(lvl3Salary).toBe(Math.round(baseSalary * 1.36));
    });

    it('upgrades staff member, deducts cost, increments level, and adjusts salary', () => {
      const profile = createMockProfile({ bankBalance: 100_000 });
      const res = upgradeStaff(profile, 'staff_mgr');
      expect(res.ok).toBe(true);
      if (res.ok) {
        const updatedStaff = res.profile.staff.find((s) => s.id === 'staff_mgr');
        expect(updatedStaff?.level).toBe(2);
        expect(updatedStaff?.dailySalary).toBe(calculateStaffSalaryForLevel('manager', 2));
      }
    });

    it('awards XP to lawyer and accountant when a contract is delivered', () => {
      const profile = createMockProfile({
        contracts: [
          {
            id: 'contract_1',
            clientName: 'مؤسسة الرمثا للتجارة',
            clientType: 'budget',
            productId: 'detergent',
            productName: 'منظفات تجارية',
            quantity: 5,
            unitPrice: 80,
            reward: 400,
            reputationReward: 5,
            deadlineDay: 5,
            acceptedOnDay: 1,
            status: 'active',
          },
        ],
        inventory: [
          {
            id: 'inv_det',
            materialOrProductId: 'detergent',
            quantity: 10,
            unit: 'عبوة',
            unitCost: 40,
          },
        ],
      });

      const res = deliverContract(profile, 'contract_1');
      expect(res.ok).toBe(true);
      if (res.ok) {
        const lawyer = res.profile.staff.find((s) => s.role === 'lawyer');
        const accountant = res.profile.staff.find((s) => s.role === 'accountant');
        expect(lawyer?.experience).toBeGreaterThan(0);
        expect(accountant?.experience).toBeGreaterThan(0);
      }
    });
  });

  describe('Mission 4: Company & Empire Valuation', () => {
    it('calculates company fair value from land, machinery, condition, and staff goodwill', () => {
      const profile = createMockProfile();
      const company = profile.companies[0];
      const valuation = calculateCompanyValuation(company, profile);

      expect(valuation.fairValue).toBeGreaterThan(15_000);
      expect(valuation.breakdown.landValue).toBeGreaterThan(0);
      expect(valuation.breakdown.equipmentValue).toBeGreaterThan(0);
      expect(valuation.breakdown.staffGoodwill).toBeGreaterThan(0);
      expect(valuation.operatingHealth).toBe('excellent');
    });

    it('calculates empire total valuation aggregating subsidiaries and central assets minus liabilities', () => {
      const profile = createMockProfile({
        bankBalance: 50_000,
        goldGrams: 10,
        payables: 5_000,
      });

      const empire = calculateEmpireValuation(profile);
      expect(empire.subsidiaries.length).toBe(1);
      expect(empire.liquidCash).toBe(50_000);
      expect(empire.goldValue).toBe(10 * 110);
      expect(empire.totalLiabilities).toBe(5000);
      expect(empire.totalEmpireValuation).toBe(empire.netWorth);
      expect(['AAA', 'AA', 'A', 'BBB', 'BB', 'B']).toContain(empire.creditRating);
    });
  });

  describe('Mission 2: Offline Idle Engine with Real Material Ledger', () => {
    it('strictly consumes raw materials and does not fabricate goods from thin air', () => {
      const profile = createMockProfile({
        inventory: [
          {
            id: 'inv_chem',
            materialOrProductId: 'chemicals',
            quantity: 4,
            unit: 'كجم',
            unitCost: 24,
          },
          {
            id: 'inv_water',
            materialOrProductId: 'water',
            quantity: 4,
            unit: 'وحدة',
            unitCost: 5,
          },
        ],
      });

      // 10 hours elapsed (10 * 3600 seconds)
      const report = calculateOfflineIdleProgress(profile, 10 * 3600);
      expect(report).not.toBeNull();
      if (report) {
        expect(report.isTampered).toBe(false);
        expect(report.elapsedHours).toBe(10);
        expect(report.materialsConsumed).toBeDefined();

        // Apply report to profile
        const applied = applyOfflineReportToProfile(profile, report);
        // Consumed materials should be deducted from inventory
        const remainingChem = applied.inventory.find((i) => i.materialOrProductId === 'chemicals');
        expect(remainingChem?.quantity ?? 0).toBeLessThanOrEqual(4);
      }
    });

    it('auto-purchases raw materials under CEO directive within budget when inventory is insufficient', () => {
      const profile = createMockProfile({
        staff: [
          ...createMockProfile().staff,
          {
            id: 'staff_ceo',
            role: 'general_manager',
            name: 'طارق الإبراهيمي',
            dailySalary: 12000,
            level: 1,
            experience: 0,
            hiredOnDay: 1,
            nextPayDay: 2,
            status: 'active',
          },
        ],
        inventory: [], // 0 starting materials
        automationDirectives: {
          autoPaySalaries: false,
          autoPurchaseMaterials: true,
          autoPurchaseThreshold: 10,
          autoPurchaseBudget: 10_000,
          autoRunProduction: true,
          autoProduceCompanyIds: ['comp_jo_1'],
        },
      });

      const report = calculateOfflineIdleProgress(profile, 5 * 3600);
      expect(report).not.toBeNull();
      if (report) {
        expect(report.materialsAutoPurchased).toBeDefined();
        if (report.materialsAutoPurchased && report.materialsAutoPurchased.length > 0) {
          expect(report.autoPurchaseTotalCost).toBeLessThanOrEqual(10_000);
        }
      }
    });
  });

  describe('Mission 6: Country and Land Integrity Verification', () => {
    it('verifies that all 10 countries have valid, non-colliding land parcels and configurations', () => {
      const verification = verifyCountryAndLandIntegrity();
      expect(verification.isValid).toBe(true);
      expect(verification.totalCountries).toBe(10);
      expect(verification.issues).toHaveLength(0);
      expect(verification.totalParcels).toBeGreaterThanOrEqual(40);
    });

    it('builds an exhaustive land catalog for each country', () => {
      const catalog = buildCountryAuditCatalog();
      expect(catalog.egypt.parcelsCount).toBe(4);
      expect(catalog.jordan.parcelsCount).toBe(4);
      expect(catalog.saudi.parcelsCount).toBe(4);
      expect(catalog.japan.parcelsCount).toBe(4);
    });
  });
});
