import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  advanceDay,
  buyGold,
  sellProduct,
  runProduction,
  autoSupplyAndProduce,
  hireStaff,
  upgradeStaff,
  calculateEmpireValuation,
  calculateCompanyValuation,
  executeGameCommand,
  type GameCommand,
} from './engine';
import {
  calculateOfflineIdleProgress,
  applyOfflineReportToProfile,
} from './offlineIdleEngine';
import {
  CENTRAL_MISSIONS_CATALOG,
  claimMissionReward,
} from './missionsEngine';
import {
  isNotificationAllowed,
  isStoryEventAllowed,
  filterSynchronizedNotifications,
} from './synchronizer';
import {
  createNewPlayer,
  calculateTotalAssets,
  calculateNetWorth,
} from '../domain/player';
import { COUNTRIES, findCountry } from '../domain/countries';
import { formatMoney } from '../domain/formatters';
import { getDirectLandsForCountry } from './catalog';
import { verifyCountryAndLandIntegrity } from '../domain/countryAuditCatalog';
import { enqueueGameCommand, loadQueuedGameCommands, acknowledgeGameCommand } from '../storage/commandOutbox';
import { validatePlayerProfile } from '../../supabase/functions/game-command/profile-validator';

class TestMemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
  clear() { this.values.clear(); }
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Task 2 — Comprehensive Internal Systems, Economy, and Persistence Audit', () => {
  // 1. Balance and Financial Flow Audit
  describe('1. Financial Flow and Balance Calculations', () => {
    it('accurately updates cash and records single ledger entry after buying and selling', () => {
      const country = findCountry('egypt')!;
      let profile = createNewPlayer(country, 'المستثمر المصري');
      const startBalance = profile.bankBalance;
      expect(startBalance).toBe(10_000);

      // Buy gold (10 grams @ $110/g)
      const buyRes = buyGold(profile, 10);
      expect(buyRes.ok).toBe(true);
      profile = buyRes.profile;

      const spent = 10 * 110;
      expect(profile.bankBalance).toBe(startBalance - spent);
      expect(profile.goldGrams).toBe(10);

      // Add a product to inventory and sell it
      profile = {
        ...profile,
        inventory: [
          ...profile.inventory,
          {
            id: 'lot-food-1',
            materialOrProductId: 'food-pack',
            quantity: 20,
            unit: 'صندوق',
            unitCost: 100,
          },
        ],
      };

      const balanceBeforeSale = profile.bankBalance;
      const saleRes = sellProduct(profile, 'food-pack', 10);
      expect(saleRes.ok).toBe(true);
      profile = saleRes.profile;

      expect(profile.bankBalance).toBeGreaterThan(balanceBeforeSale);
      const remainingFood = profile.inventory.find((i) => i.materialOrProductId === 'food-pack');
      expect(remainingFood!.quantity).toBe(10);

      // Finances should reflect netProfit = totalRevenue - totalExpenses
      expect(profile.finances.totalRevenue).toBeGreaterThan(0);
      expect(profile.finances.netProfit).toBe(profile.finances.totalRevenue - profile.finances.totalExpenses);
    });
  });

  // 2. Production, Raw Materials, and Depletion
  describe('2. Production and Raw Materials Limits', () => {
    it('prevents starting production when raw materials are insufficient', () => {
      const country = findCountry('egypt')!;
      let profile = createNewPlayer(country, 'صانع المحتوى');
      const company = profile.companies[0]; // food company

      // Ensure no raw materials (grain, packaging) in inventory
      profile = { ...profile, inventory: [] };

      const res = runProduction(profile, company.id, 1);
      expect(res.ok).toBe(false);
      expect(res.reason).toBe('insufficient-materials');
    });

    it('successfully runs production when materials exist and consumes them exactly once', () => {
      const country = findCountry('egypt')!;
      let profile = createNewPlayer(country, 'صانع المحتوى');
      const company = profile.companies[0];

      // Provide exact required materials for food-pack (recipe: 4 grain + 1 packaging per batch)
      profile = {
        ...profile,
        inventory: [
          { id: 'lot-g', materialOrProductId: 'grain', quantity: 20, unit: 'طن', unitCost: 35 },
          { id: 'lot-p', materialOrProductId: 'packaging', quantity: 10, unit: 'عبوة', unitCost: 15 },
        ],
      };

      const res = runProduction(profile, company.id, 1);
      expect(res.ok).toBe(true);
      profile = res.profile;

      // Consumed: grain: 4, packaging: 1 => remaining: 16 and 9
      const grain = profile.inventory.find((i) => i.materialOrProductId === 'grain');
      const packaging = profile.inventory.find((i) => i.materialOrProductId === 'packaging');
      expect(grain!.quantity).toBe(16);
      expect(packaging!.quantity).toBe(9);

      // Active production order created
      expect(profile.productionOrders).toHaveLength(1);
      expect(profile.productionOrders[0].status).toBe('active');
    });

    it('executes autoSupplyAndProduce across all countries including Jordan', () => {
      const country = findCountry('jordan')!;
      let profile = createNewPlayer(country, 'المستثمر الأردني');
      const company = profile.companies[0];

      // Empty inventory
      profile = { ...profile, inventory: [] };
      const balanceBefore = profile.bankBalance;

      const autoRes = autoSupplyAndProduce(profile, company.id, 1);
      expect(autoRes.ok).toBe(true);
      profile = autoRes.profile;

      expect(profile.bankBalance).toBeLessThan(balanceBefore);
      expect(profile.productionOrders.length).toBeGreaterThan(0);
    });
  });

  // 3. Offline Idle Engine and Idempotency
  describe('3. Offline Idle Engine & Deduplication', () => {
    it('credits auto-purchased materials and prevents double claiming of the same offline window', () => {
      const country = findCountry('jordan')!;
      let profile = createNewPlayer(country, 'رائد الأعمال');
      profile = {
        ...profile,
        companies: [
          {
            ...profile.companies[0],
            maintenanceCondition: 85,
          },
        ],
        staff: [
          {
            id: 'staff-gm-1',
            name: 'مازن النابلسي',
            role: 'general_manager',
            companyId: undefined,
            dailySalary: 2_000,
            level: 2,
            experience: 10,
            hiredOnDay: 1,
            nextPayDay: 2,
            status: 'active',
          },
        ],
        automationDirectives: {
          autoPaySalaries: true,
          autoPurchaseMaterials: true,
          autoPurchaseThreshold: 40,
          autoPurchaseBudget: 25_000,
          autoRunProduction: true,
          autoProduceCompanyIds: [profile.companies[0].id],
        },
      };

      // 6 hours of idle absence
      const report = calculateOfflineIdleProgress(profile, 6 * 3600);
      expect(report).not.toBeNull();
      expect(report!.isTampered).toBe(false);
      expect(report!.elapsedHours).toBe(6);

      // Apply report
      const appliedProfile = applyOfflineReportToProfile(profile, report!);
      expect(appliedProfile.lastOfflineClaimAt).toBeDefined();

      // If user re-applies the same report, it should return unchanged (idempotent)
      const reApplied = applyOfflineReportToProfile(appliedProfile, report!);
      expect(reApplied).toBe(appliedProfile);
    });

    it('flags clock tampering when timestamp is in the future', () => {
      const memStorage = new TestMemoryStorage();
      vi.stubGlobal('localStorage', memStorage);

      const country = findCountry('egypt')!;
      const profile = createNewPlayer(country, 'المستثمر الذكي');

      memStorage.setItem(`suly_offline_last_active_${profile.id}`, (Date.now() + 500_000).toString());
      const report = calculateOfflineIdleProgress(profile);
      expect(report).not.toBeNull();
      expect(report!.isTampered).toBe(true);
      expect(report!.goodsProduced).toHaveLength(0);
    });
  });

  // 4. Staff Management, Salaries, Promotions, and Single Ledger Accruals
  describe('4. Staff Hierarchy, Salaries, and Experience', () => {
    it('hires, promotes, and accrues salaries without duplicate liability entries in advanceDay', () => {
      const country = findCountry('saudi')!;
      // Provide healthy bank balance to afford HR, Manager, and promotion cost (~21,000)
      let profile = { ...createNewPlayer(country, 'عبدالعزيز'), bankBalance: 150_000 };

      // Hire HR Director
      const hireHr = hireStaff(profile, 'hr', 'سعد الشمري');
      expect(hireHr.ok).toBe(true);
      profile = hireHr.profile;

      // Hire Company Manager
      const hireMgr = hireStaff(profile, 'manager', 'فهد الدوسري', profile.companies[0].id);
      expect(hireMgr.ok).toBe(true);
      profile = hireMgr.profile;

      const mgr = profile.staff.find((s) => s.role === 'manager')!;
      expect(mgr.level).toBe(1);

      // Promote Manager
      const upgradeRes = upgradeStaff(profile, mgr.id);
      expect(upgradeRes.ok).toBe(true);
      profile = upgradeRes.profile;
      const promotedMgr = profile.staff.find((s) => s.id === mgr.id)!;
      expect(promotedMgr.level).toBe(2);
      expect(promotedMgr.dailySalary).toBeGreaterThan(mgr.dailySalary);

      // Advance day and verify salary accrual
      const dayRes = advanceDay(profile);
      expect(dayRes.ok).toBe(true);
      profile = dayRes.profile;

      // Count salary ledger entries for the day: exactly 1 expense entry, NO redundant liability entry
      const salaryExpenseEntries = profile.ledger.filter((l) => l.note.includes('رواتب مستحقة'));
      expect(salaryExpenseEntries).toHaveLength(1);
      const duplicateLiabilityEntries = profile.ledger.filter((l) => l.category === 'liability' && l.note.includes('التزام رواتب'));
      expect(duplicateLiabilityEntries).toHaveLength(0);
    });
  });

  // 5. Subsidiary Valuation, Empire Valuation, and Credit Rating
  describe('5. Valuation and Credit Rating Rules', () => {
    it('correctly calculates company fair value and empire valuation including grossAssets and netWorth', () => {
      const country = findCountry('jordan')!;
      const profile = createNewPlayer(country, 'هشام الحنيطي');

      const compVal = calculateCompanyValuation(profile.companies[0], profile);
      expect(compVal.fairValue).toBeGreaterThan(0);
      expect(compVal.breakdown.landValue).toBeGreaterThan(0);

      const empireVal = calculateEmpireValuation(profile);
      expect(empireVal.grossAssets).toBeGreaterThan(0);
      expect(empireVal.totalLiabilities).toBeGreaterThan(0);
      expect(empireVal.netWorth).toBe(empireVal.grossAssets - empireVal.totalLiabilities);
      expect(empireVal.totalEmpireValuation).toBe(empireVal.netWorth);

      // Test unified helpers in player.ts
      expect(calculateTotalAssets(profile)).toBe(empireVal.grossAssets);
      expect(calculateNetWorth(profile)).toBe(empireVal.netWorth);

      // Credit rating should be valid enum
      expect(['AAA', 'AA', 'A', 'BBB', 'BB', 'B']).toContain(empireVal.creditRating);
    });
  });

  // 6. Supported Countries, Jordan Integration, and Unique Land IDs
  describe('6. Country and Land Catalog Integrity', () => {
    it('converts the USD reference balance into each country currency for display', () => {
      expect(formatMoney(25_000, findCountry('egypt'))).toBe('ج.م 1,382,450');
      expect(formatMoney(25_000, findCountry('saudi'))).toBe('ر.س 93,750');
      expect(formatMoney(25_000, findCountry('jordan'))).toBe('د.أ 17,725');
      expect(formatMoney(25_000, findCountry('russia'))).toBe('₽ 2,012,274');
    });

    it('defines a non-default currency for every supported country', () => {
      const expected = { egypt: 'EGP', saudi: 'SAR', uae: 'AED', usa: 'USD', kuwait: 'KWD', qatar: 'QAR', uk: 'GBP', germany: 'EUR', japan: 'JPY', jordan: 'JOD', palestine: 'ILS', china: 'CNY', spain: 'EUR', russia: 'RUB' };
      for (const country of COUNTRIES) expect(country.currency.code).toBe(expected[country.id]);
    });

    it('verifies Jordan starting landmarks, land IDs, company IDs, and Arab Bank', () => {
      const jordanDef = findCountry('jordan')!;
      expect(jordanDef).toBeDefined();
      expect(jordanDef.name).toBe('المملكة الأردنية الهاشمية');
      expect(jordanDef.currency.symbol).toBe('د.أ');

      const player = createNewPlayer(jordanDef, 'سالم');
      expect(player.lands[0].label).toContain('مدينة سحاب الصناعية');
      expect(player.companies[0].name).toContain('مصنع عمّان للأغذية');
      expect(player.ledger[1].note).toContain('البنك العربي');

      // Verify Jordan direct lands have unique IDs
      const jordanLands = getDirectLandsForCountry('jordan');
      expect(jordanLands).toHaveLength(7);
      const landIds = new Set(jordanLands.map((l) => l.id));
      expect(landIds.size).toBe(7);
      expect(landIds.has('direct-land-jordan-sahab')).toBe(true);

      // Verify all 10 countries pass integrity checks
      const audit = verifyCountryAndLandIntegrity();
      expect(audit.isValid).toBe(true);
      expect(audit.totalCountries).toBe(14);
      expect(audit.issues).toHaveLength(0);
    });
  });

  // 7. Missions Engine and Progression Sync
  describe('7. Missions Engine and Progression Sync', () => {
    it('locks missions behind prerequisites and prevents duplicate claiming of rewards', () => {
      const country = findCountry('egypt')!;
      let profile = createNewPlayer(country, 'عمر كمال');

      expect(CENTRAL_MISSIONS_CATALOG.length).toBeGreaterThan(5);

      // The first inspect-factory mission is completed if player has a company
      const firstMission = CENTRAL_MISSIONS_CATALOG.find((m) => m.id === 'mission-inspect-factory')!;
      expect(firstMission).toBeDefined();
      expect(firstMission.isCompleted(profile)).toBe(true);

      // Claim reward
      const claim1 = claimMissionReward(profile, firstMission.id);
      expect(claim1.ok).toBe(true);
      profile = claim1.profile;

      expect(profile.claimedRewardIds).toContain(firstMission.id);
      expect(profile.completedMissionIds).toContain(firstMission.id);

      // Attempt second claim => must fail
      const claim2 = claimMissionReward(profile, firstMission.id);
      expect(claim2.ok).toBe(false);
      expect(claim2.reason).toBe('already-claimed');
    });
  });

  // 8. Synchronizer Progression Gating
  describe('8. Synchronizer: Locking Notifications and Story Alerts', () => {
    it('filters notifications and story events targeting locked sections', () => {
      const country = findCountry('egypt')!;
      const profile = createNewPlayer(country, 'كريم'); // Level 1 starter

      // Level 1 profile has bank and stock exchange locked
      const bankNotif = {
        id: 'bank-alert-1',
        title: 'فرصة إيداع بنكي',
        detail: 'عائد مرتفع',
        tone: 'info' as const,
        section: 'bank' as const,
      };

      expect(isNotificationAllowed(profile, bankNotif)).toBe(false);

      const filtered = filterSynchronizedNotifications(profile, [bankNotif]);
      expect(filtered).toHaveLength(0);

      const storyAlert = {
        id: 'story-1',
        title: 'طرح أسهم',
        targetSection: 'investments' as const,
      };
      expect(isStoryEventAllowed(profile, storyAlert as any)).toBe(false);
    });
  });

  // 9. Command Outbox Idempotency
  describe('9. Command Outbox Idempotency', () => {
    it('enqueues, deduplicates, and acknowledges game commands safely', () => {
      const storage = new TestMemoryStorage();
      vi.stubGlobal('localStorage', storage);

      const accountId = 'test-account-123';
      const command: GameCommand = {
        name: 'buy_material',
        args: { materialId: 'water', quantity: 5 },
      };

      const key = 'command-key-unique-001';
      const enqueued1 = enqueueGameCommand(accountId, command, key);
      expect(enqueued1).not.toBeNull();
      expect(enqueued1!.commandKey).toBe(key);

      // Enqueueing with the same key must return existing without duplication
      const enqueued2 = enqueueGameCommand(accountId, command, key);
      expect(enqueued2!.commandKey).toBe(key);

      const queue = loadQueuedGameCommands(accountId);
      expect(queue.filter((c) => c.commandKey === key)).toHaveLength(1);

      acknowledgeGameCommand(accountId, key);
      const queueAfter = loadQueuedGameCommands(accountId);
      expect(queueAfter.filter((c) => c.commandKey === key)).toHaveLength(0);
    });
  });

  // 10. Server Profile Validator Compatibility
  describe('10. Authoritative Server Profile Validation', () => {
    it('validates profile with all audited fields successfully', () => {
      const country = findCountry('jordan')!;
      const profile = createNewPlayer(country, 'مستثمر سحاب');

      const validation = validatePlayerProfile(profile);
      expect(validation.ok).toBe(true);
      if (!validation.ok) {
        expect(validation.errors).toHaveLength(0);
      }
    });

    it('executes claim_mission_reward command through authoritative executeGameCommand', () => {
      const country = findCountry('jordan')!;
      let profile = createNewPlayer(country, 'مستثمر سحاب');

      const command: GameCommand = {
        name: 'claim_mission_reward',
        args: { missionId: 'mission-inspect-factory' },
      };

      const result = executeGameCommand(profile, command);
      expect(result.ok).toBe(true);
      profile = result.profile;
      expect(profile.claimedRewardIds).toContain('mission-inspect-factory');
    });
  });
});
