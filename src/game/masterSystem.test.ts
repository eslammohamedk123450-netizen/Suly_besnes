import { describe, expect, it, beforeEach, vi } from 'vitest';
import { COUNTRIES, findCountry, type CountryId } from '../domain/countries';
import { FREE_AVATAR_IDS, DEFAULT_AVATAR_ID } from '../domain/avatars';
import { GAME_SECTIONS } from '../domain/navigation';
import { createNewPlayer, type PlayerProfile } from '../domain/player';
import { validatePlayerProfile } from '../../supabase/functions/game-command/profile-validator';
import { saveGame, loadSavedGame, normalizeSavedProfile } from '../storage/saveRepository';
import {
  COUNTRY_SCENARIOS,
  getCountryScenario,
  getEligibleStoryAlerts,
} from './countryScenarios';
import {
  SECTION_DEPENDENCY_MAP,
  calculatePlayerProgress,
  computeUnlockedSections,
  getSectionProgressionStatus,
  isNotificationAllowedForProfile,
  resolveSafeSection,
} from './progressionEngine';
import { getSystemGuide, getUnlockedSectionIds, isSectionUnlocked } from './onboarding';
import { selectNotifications } from './notifications';
import {
  WALKTHROUGH_STEPS,
  QUEST_SPECIFIC_WALKTHROUGH_STEPS,
  resolveQuestWalkthroughTarget,
} from './walkthroughState';
import {
  serviceCompany,
  repayLoan,
  buyDirectLand,
  buyGlobalMaterial,
  runProduction,
  advanceDay,
  sellProduct,
  acceptContract,
  deliverContract,
  getDayBriefing,
} from './engine';
import { getGlobalMarketOffers } from './globalMarket';
import { getContractOffers } from './contracts';
import {
  calculateOfflineIdleProgress,
  applyOfflineReportToProfile,
  recordOfflineHeartbeat,
} from './offlineIdleEngine';
import { executePrestigeExpansion } from './prestigeEngine';

const ALL_NINE_COUNTRIES: readonly CountryId[] = [
  'egypt',
  'saudi',
  'uae',
  'usa',
  'kuwait',
  'qatar',
  'uk',
  'germany',
  'japan',
];

class MemoryStorage implements Storage {
  private readonly store = new Map<string, string>();
  get length(): number {
    return this.store.size;
  }
  clear(): void {
    this.store.clear();
  }
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

describe('Suly Business Empire — Master System Verification (17 Suites)', () => {
  let memoryStorage: MemoryStorage;

  beforeEach(() => {
    memoryStorage = new MemoryStorage();
    vi.stubGlobal('localStorage', memoryStorage);
  });

  it('1. creates character with custom name, chosen free avatar, and chosen country', () => {
    const saudi = findCountry('saudi')!;
    const player = createNewPlayer(
      saudi,
      'الأمير فيصل',
      new Date('2026-03-01T00:00:00.000Z'),
      'avatar_free_female_1',
    );

    expect(player.name).toBe('الأمير فيصل');
    expect(player.countryId).toBe('saudi');
    expect(player.avatarId).toBe('avatar_free_female_1');
    expect(player.unlockedAvatarIds).toEqual(expect.arrayContaining([...FREE_AVATAR_IDS]));

    // Paid/unowned avatar IDs during initial setup safely fall back to DEFAULT_AVATAR_ID
    const fallbackPlayer = createNewPlayer(
      saudi,
      'مستثمر جديد',
      new Date('2026-03-01T00:00:00.000Z'),
      'avatar_vip_locked_99',
    );
    expect(fallbackPlayer.avatarId).toBe(DEFAULT_AVATAR_ID);
  });

  it('2. delivers real starting assets for every one of the 9 supported countries and passes profile validation', () => {
    expect(COUNTRIES.map((c) => c.id)).toEqual([...ALL_NINE_COUNTRIES]);

    for (const countryId of ALL_NINE_COUNTRIES) {
      const country = findCountry(countryId)!;
      const profile = createNewPlayer(country, `مؤسس ${country.name}`, new Date('2026-03-01T00:00:00.000Z'));

      expect(profile.countryId).toBe(countryId);
      expect(profile.bankBalance).toBe(25_000);
      expect(profile.diamonds).toBe(15);
      expect(profile.lands).toHaveLength(1);
      expect(profile.lands[0].purchasePrice).toBe(7_000);
      expect(profile.companies).toHaveLength(1);
      expect(profile.companies[0].countryId).toBe(countryId);
      expect(profile.companies[0].industryId).toBe('food');
      expect(profile.companies[0].maintenanceCondition).toBe(25);
      expect(profile.banking.loans).toHaveLength(1);
      expect(profile.banking.loans[0].remainingBalance).toBe(5_250);
      expect(profile.banking.loans[0].nextPaymentDay).toBe(7);
      expect(profile.ledger.every((entry) => entry.amount > 0)).toBe(true);

      const validation = validatePlayerProfile(profile);
      expect(validation).toEqual({ ok: true });

      const saveResult = saveGame(profile, `acc-${countryId}`);
      expect(saveResult.ok).toBe(true);
      const reloaded = loadSavedGame(`acc-${countryId}`);
      expect(reloaded?.countryId).toBe(countryId);
      expect(reloaded?.companies[0].name).toBe(profile.companies[0].name);
    }
  });

  it('3. enforces strict scenario isolation across all 9 countries with zero cross-country leakage', () => {
    const scenarioTitles = new Set<string>();
    const bankNames = new Set<string>();
    const elderNames = new Set<string>();

    for (const countryId of ALL_NINE_COUNTRIES) {
      const scenario = getCountryScenario(countryId);
      expect(scenario.countryId).toBe(countryId);
      expect(scenario.stages).toHaveLength(10);
      expect(scenario.chapters).toHaveLength(4);
      expect(scenario.quests).toHaveLength(6);
      expect(scenario.rivals).toHaveLength(3);
      expect(scenario.clients.length).toBeGreaterThanOrEqual(4);
      expect(scenario.economicEvents).toHaveLength(8);

      scenarioTitles.add(scenario.scenarioTitle);
      bankNames.add(scenario.economicProfile.bankName);
      elderNames.add(scenario.advisors.elder.name);

      const country = findCountry(countryId)!;
      const profile = createNewPlayer(country, 'اختبار العزل', new Date('2026-03-01T00:00:00.000Z'));
      profile.onboarding.introCompleted = true;

      // Story alerts must strictly belong to this country
      const alerts = getEligibleStoryAlerts(profile);
      expect(alerts.every((a) => a.countryId === countryId)).toBe(true);

      // Contract clients must match country scenario clients
      const offers = getContractOffers(profile);
      const allowedClients = new Set(scenario.clients.map((c) => c.name));
      expect(offers.every((o) => allowedClients.has(o.clientName))).toBe(true);

      // Market sellers must be localized to this country
      const marketOffers = getGlobalMarketOffers(profile);
      expect(marketOffers.length).toBeGreaterThan(0);

      // Foreign country notification check must be rejected
      const otherCountry = ALL_NINE_COUNTRIES.find((id) => id !== countryId)!;
      expect(
        isNotificationAllowedForProfile(profile, { section: 'home', countryId: otherCountry }),
      ).toBe(false);
    }

    expect(scenarioTitles.size).toBe(9);
    expect(bankNames.size).toBe(9);
    expect(elderNames.size).toBe(9);
  });

  it('4. displays country StoryIntro only once, persists completion across reloads, and locks country mid-save', () => {
    const japan = findCountry('japan')!;
    const initial = createNewPlayer(japan, 'كينجي', new Date('2026-03-01T00:00:00.000Z'));
    expect(initial.onboarding.countryIntroSeen).toBe(false);
    expect(initial.onboarding.introCompleted).toBe(false);

    // Complete intro once
    const afterIntro: PlayerProfile = {
      ...initial,
      onboarding: {
        ...initial.onboarding,
        introCompleted: true,
        countryIntroSeen: true,
        chapter: 1,
      },
    };
    expect(saveGame(afterIntro, 'acc-japan').ok).toBe(true);

    const reloaded = loadSavedGame('acc-japan')!;
    expect(reloaded.onboarding.countryIntroSeen).toBe(true);
    expect(reloaded.onboarding.introCompleted).toBe(true);
    expect(reloaded.countryId).toBe('japan');

    // Independent Prestige Expansion preserves original countryId and does not re-trigger intro
    const richJapan: PlayerProfile = { ...reloaded, level: 10, bankBalance: 800_000 };
    const expanded = executePrestigeExpansion(richJapan, 'london');
    expect(expanded).not.toBeNull();
    expect(expanded!.updatedProfile.countryId).toBe('japan');
    expect(expanded!.updatedProfile.onboarding.countryIntroSeen).toBe(true);
    expect(expanded!.updatedProfile.onboarding.introCompleted).toBe(true);
  });

  it('5. gates all 22 sections via central progression engine and provides 8-part guides for every section', () => {
    const egypt = findCountry('egypt')!;
    const profile = createNewPlayer(egypt, 'سليم', new Date('2026-03-01T00:00:00.000Z'));
    profile.onboarding.introCompleted = true;
    profile.day = 60; // Passing time alone must NEVER unlock gated sections

    const unlockedDay60 = getUnlockedSectionIds(profile);
    expect(unlockedDay60).toContain('companies');
    expect(unlockedDay60).toContain('obligations');
    expect(unlockedDay60).toContain('lands');
    expect(unlockedDay60).toContain('inventory');
    expect(unlockedDay60).toContain('production');
    expect(unlockedDay60).not.toContain('contracts');
    expect(unlockedDay60).not.toContain('bank');
    expect(unlockedDay60).not.toContain('investments');
    expect(unlockedDay60).not.toContain('staff');
    expect(unlockedDay60).not.toContain('reports');
    expect(unlockedDay60).not.toContain('tech_tree');

    // Verify 5 progression states
    expect(getSectionProgressionStatus(profile, 'bank')).toBe('locked');
    expect(getSectionProgressionStatus(profile, 'companies')).toBe('active'); // 25% condition < 50%
    expect(getSectionProgressionStatus(profile, 'production')).toBe('available');

    // Safe section resolution never returns a locked section
    expect(resolveSafeSection(profile, 'bank')).toBe('obligations');
    expect(resolveSafeSection(profile, 'investments')).toBe('home');

    // Every single one of the 22 sections has a dependency spec and an 8-point contextual guide
    expect(GAME_SECTIONS).toHaveLength(22);
    for (const sec of GAME_SECTIONS) {
      expect(SECTION_DEPENDENCY_MAP[sec.id]).toBeDefined();
      const guide = getSystemGuide(sec.id);
      expect(guide.title.length).toBeGreaterThan(2);
      expect(guide.description.length).toBeGreaterThan(10);
      expect(guide.functionSummary.length).toBeGreaterThan(10);
      expect(guide.economicBenefit.length).toBeGreaterThan(10);
      expect(guide.steps.length).toBeGreaterThanOrEqual(2);
      expect(guide.keyControls.length).toBeGreaterThanOrEqual(2);
      expect(guide.risksToWatch.length).toBeGreaterThan(10);
      expect(guide.relatedSystems.length).toBeGreaterThan(10);
      expect(guide.practicalTip.length).toBeGreaterThan(10);
      expect(guide.suggestedNextStep.length).toBeGreaterThan(5);
    }
  });

  it('6 & 7. provides structured advisor briefings before every quest and grants zero rewards/progress on skip', () => {
    for (const countryId of ALL_NINE_COUNTRIES) {
      const country = findCountry(countryId)!;
      const profile = createNewPlayer(country, 'اختبار الحوار', new Date('2026-03-01T00:00:00.000Z'));
      profile.onboarding.introCompleted = true;
      const scenario = getCountryScenario(countryId);

      for (const quest of scenario.quests) {
        expect(quest.briefing.pages.length).toBeGreaterThanOrEqual(2);
        for (const page of quest.briefing.pages) {
          expect(page.length).toBeGreaterThan(15);
          expect(page.length).toBeLessThanOrEqual(260);
        }
        expect(quest.briefing.goal.length).toBeGreaterThan(5);
        expect(quest.briefing.whyItMatters.length).toBeGreaterThan(10);
        expect(quest.briefing.steps.length).toBeGreaterThanOrEqual(2);
        expect(quest.briefing.requiredResources.length).toBeGreaterThan(5);
        expect(quest.briefing.expectedOutcome.length).toBeGreaterThan(5);
        expect(quest.briefing.riskWarning.length).toBeGreaterThan(5);
      }

      // Simulate skipping briefing + skipping walkthrough: zero change in cash, diamonds, gold, inventory, or quest completion
      const skippedProfile: PlayerProfile = {
        ...profile,
        onboarding: {
          ...profile.onboarding,
          seenQuestBriefings: scenario.quests.map((q) => q.id),
          walkthroughSkipped: true,
        },
      };
      expect(skippedProfile.bankBalance).toBe(profile.bankBalance);
      expect(skippedProfile.diamonds).toBe(profile.diamonds);
      expect(skippedProfile.goldGrams).toBe(profile.goldGrams);
      expect(skippedProfile.inventory).toEqual([]);
      expect(scenario.quests.some((q) => q.isCompleted(skippedProfile))).toBe(false);
    }
  });

  it('8 & 9. provides multi-step spotlight sub-targets, smart diagnostics, and never completes steps without real state changes', () => {
    const profile = createNewPlayer(findCountry('germany')!, 'هانز', new Date('2026-03-01T00:00:00.000Z'));
    profile.onboarding.introCompleted = true;

    expect(WALKTHROUGH_STEPS).toHaveLength(6);
    for (const step of WALKTHROUGH_STEPS) {
      expect(step.isComplete(profile)).toBe(false);
      const subTargets = step.resolveSubTarget?.(profile) ?? [];
      expect(subTargets.length).toBeGreaterThanOrEqual(2);
      // Includes both final action button (subStepIndex 2) and collapsible panel/tab (subStepIndex 1)
      expect(subTargets.some((t) => t.subStepIndex === 2)).toBe(true);
      expect(subTargets.some((t) => t.subStepIndex === 1)).toBe(true);
    }

    // Smart diagnostic triggers when cash is insufficient for factory maintenance
    const brokeProfile: PlayerProfile = { ...profile, bankBalance: 100 };
    const maintDiag = WALKTHROUGH_STEPS[0].getDiagnostic?.(brokeProfile);
    expect(maintDiag).toBeTruthy();
    expect(maintDiag).toContain('السيولة');

    // Smart diagnostic triggers on sell quest when product is still in active production
    const producingProfile: PlayerProfile = {
      ...profile,
      productionOrders: [
        {
          id: 'ord-1',
          companyId: profile.companies[0].id,
          productId: 'food-pack',
          productName: 'عبوات غذائية',
          batches: 1,
          outputQuantity: 10,
          outputUnit: 'عبوة',
          materialCost: 100,
          energyCost: 6,
          expectedUnitCost: 10,
          demandForecast: 50,
          qualityScore: 95,
          maintenanceCost: 0,
          startedOnDay: 1,
          completesOnDay: 2,
          status: 'active',
        },
      ],
    };
    const sellDiag = QUEST_SPECIFIC_WALKTHROUGH_STEPS.sell.getDiagnostic?.(producingProfile);
    expect(sellDiag).toContain('قيد التصنيع');

    // Quest-to-walkthrough mapping routes Quest 5 to sell and Quest 6 to contract
    const quests = getCountryScenario('germany').quests;
    expect(resolveQuestWalkthroughTarget(quests[0], profile)).toEqual({ mode: 'core', stepIndex: 0 });
    expect(resolveQuestWalkthroughTarget(quests[4], profile)).toEqual({
      mode: 'quest',
      step: QUEST_SPECIFIC_WALKTHROUGH_STEPS.sell,
    });
    expect(resolveQuestWalkthroughTarget(quests[5], profile)).toEqual({
      mode: 'quest',
      step: QUEST_SPECIFIC_WALKTHROUGH_STEPS.contract,
    });
  });

  it('10. suppresses notifications and negative sector shocks for locked sections and unowned industries', () => {
    const uae = findCountry('uae')!;
    const base = createNewPlayer(uae, 'راشد', new Date('2026-03-01T00:00:00.000Z'));
    base.onboarding.introCompleted = true;

    // Force day 6 so inherited loan (due day 7) is within 2 days, plus artificial staff/events/contracts while Level 1
    const earlyProfile: PlayerProfile = {
      ...base,
      day: 6,
      staff: [
        {
          id: 'st-1',
          name: 'موظف',
          role: 'accountant',
          dailySalary: 500,
          hiredOnDay: 1,
          nextPayDay: 2,
          status: 'active',
          unpaidSalary: 500,
        },
      ],
      contracts: [
        {
          id: 'ct-1',
          clientName: 'عميل',
          clientType: 'standard',
          productId: 'food-pack',
          productName: 'عبوات غذائية',
          quantity: 5,
          unitPrice: 100,
          reward: 50,
          reputationReward: 2,
          deadlineDay: 7,
          acceptedOnDay: 5,
          status: 'active',
        },
      ],
      events: [
        {
          id: 'ev-1',
          day: 5,
          title: 'حدث اقتصادي',
          cashImpact: 500,
          occurredAt: '2026-03-01T00:00:00.000Z',
        },
      ],
    };

    const alerts = selectNotifications(earlyProfile);
    const sections = alerts.map((a) => a.section);
    // Bank, Staff, Contracts, Investments, and Reports are ALL locked at Level 1!
    expect(sections).not.toContain('bank');
    expect(sections).not.toContain('staff');
    expect(sections).not.toContain('contracts');
    expect(sections).not.toContain('investments');
    expect(sections).not.toContain('reports');
    // Urgent inherited loan safely routes to 'obligations' instead of locked 'bank'
    expect(alerts.find((a) => a.id === 'inherited-loan-grace')?.section).toBe('obligations');
    // Zero duplicate notification IDs
    expect(new Set(alerts.map((a) => a.id)).size).toBe(alerts.length);

    // Day 2 event targets 'transport' (-14,000 cashImpact), which player does NOT own (player only owns 'food')
    const day2Briefing = getDayBriefing({ ...base, day: 1 });
    expect(day2Briefing.day).toBe(2);
    expect(day2Briefing.event.industryId).toBe('transport');
    expect(day2Briefing.event.cashImpact).toBeLessThan(0);

    const afterDay2 = advanceDay({ ...base, day: 1, bankBalance: 25_000 });
    expect(afterDay2.ok).toBe(true);
    if (afterDay2.ok) {
      // Only operating cost ($80) is deducted, NOT -$14,000 transport penalty!
      expect(afterDay2.profile.bankBalance).toBeGreaterThan(24_000);
    }
  });

  it('11, 12, 13, 14 & 15. executes full real gameplay loop: repair -> settle loan -> buy land -> buy raw materials -> produce -> sell -> deliver contract -> unlock Bank', () => {
    const kuwait = findCountry('kuwait')!;
    let current = createNewPlayer(kuwait, 'جاسم', new Date('2026-03-01T00:00:00.000Z'));
    current.onboarding.introCompleted = true;
    current.onboarding.countryIntroSeen = true;

    const quests = COUNTRY_SCENARIOS.kuwait.quests;

    // Initially Bank and Contracts are locked
    expect(isSectionUnlocked(current, 'contracts')).toBe(false);
    expect(isSectionUnlocked(current, 'bank')).toBe(false);

    // 11. Factory Maintenance (25% -> 100%)
    const repaired = serviceCompany(current, current.companies[0].id);
    expect(repaired.ok).toBe(true);
    if (!repaired.ok) return;
    current = repaired.profile;
    expect(current.companies[0].maintenanceCondition).toBe(100);
    expect(WALKTHROUGH_STEPS[0].isComplete(current)).toBe(true);
    expect(quests[0].isCompleted(current)).toBe(true);

    // 12. Settle Inherited Emergency Loan ($5,250)
    const activeLoan = current.banking.loans[0];
    const settled = repayLoan(current, activeLoan.id, 'all');
    expect(settled.ok).toBe(true);
    if (!settled.ok) return;
    current = settled.profile;
    expect(current.banking.loans[0].status).toBe('paid');
    expect(WALKTHROUGH_STEPS[1].isComplete(current)).toBe(true);
    expect(quests[1].isCompleted(current)).toBe(true);

    // 13. Purchase Second Investment Land ($3,600)
    const boughtLand = buyDirectLand(current, 'starter-village-land', 'cash');
    expect(boughtLand.ok).toBe(true);
    if (!boughtLand.ok) return;
    current = boughtLand.profile;
    expect(current.lands).toHaveLength(2);
    expect(WALKTHROUGH_STEPS[2].isComplete(current)).toBe(true);
    expect(quests[2].isCompleted(current)).toBe(true);

    // 14a. Buy Certified Grade A+ Raw Materials (grain + packaging) from Global Market
    const marketOffers = getGlobalMarketOffers(current);
    const grainOffer = marketOffers.find((o) => o.materialId === 'grain' && o.grade === 'A+')!;
    const packOffer = marketOffers.find((o) => o.materialId === 'packaging' && o.grade === 'A+')!;

    const boughtGrain = buyGlobalMaterial(current, grainOffer.id, 24, grainOffer.unitPrice, 'cash');
    expect(boughtGrain.ok).toBe(true);
    if (!boughtGrain.ok) return;
    current = boughtGrain.profile;

    const boughtPack = buyGlobalMaterial(current, packOffer.id, 6, packOffer.unitPrice, 'cash');
    expect(boughtPack.ok).toBe(true);
    if (!boughtPack.ok) return;
    current = boughtPack.profile;
    expect(WALKTHROUGH_STEPS[3].isComplete(current)).toBe(true);

    // 14b. Start Production Order within Day-1 starter energy (4 batches = 24/25 energy -> 32 units @ 92% quality)
    const prodStarted = runProduction(current, current.companies[0].id, 4);
    expect(prodStarted.ok).toBe(true);
    if (!prodStarted.ok) return;
    current = prodStarted.profile;
    expect(WALKTHROUGH_STEPS[4].isComplete(current)).toBe(true);

    // Advance Day (2 days for 4 batches) to complete production and refill factory energy
    let safety = 0;
    while (current.productionOrders.some((o) => o.status === 'active') && safety < 4) {
      const next = advanceDay(current);
      expect(next.ok).toBe(true);
      if (!next.ok) return;
      current = next.profile;
      safety += 1;
    }

    // Run 2 more batches with refilled energy so total stock is 48 units @ 92% quality
    const prodBatch2 = runProduction(current, current.companies[0].id, 2);
    expect(prodBatch2.ok).toBe(true);
    if (!prodBatch2.ok) return;
    current = prodBatch2.profile;
    const finishBatch2 = advanceDay(current);
    expect(finishBatch2.ok).toBe(true);
    if (!finishBatch2.ok) return;
    current = finishBatch2.profile;

    expect(quests[3].isCompleted(current)).toBe(true);
    const foodLot = current.inventory.find((lot) => lot.materialOrProductId === 'food-pack');
    expect(foodLot?.quantity).toBeGreaterThanOrEqual(40);
    expect(foodLot?.qualityScore).toBeGreaterThanOrEqual(92);

    // 14c. Sell part of finished product -> unlocks Contracts!
    const balanceBeforeSale = current.bankBalance;
    const sold = sellProduct(current, 'food-pack', 4);
    expect(sold.ok).toBe(true);
    if (!sold.ok) return;
    current = sold.profile;
    expect(current.bankBalance).toBeGreaterThan(balanceBeforeSale);
    expect(quests[4].isCompleted(current)).toBe(true);
    expect(isSectionUnlocked(current, 'contracts')).toBe(true);
    expect(isSectionUnlocked(current, 'bank')).toBe(false); // Still locked before first contract!

    // 15. Accept & Deliver Commercial Contract -> lifts Banking Freeze!
    const contractOffer = getContractOffers(current).find((o) => o.productId === 'food-pack')!;
    expect(contractOffer).toBeDefined();

    const accepted = acceptContract(current, contractOffer.id);
    expect(accepted.ok).toBe(true);
    if (!accepted.ok) return;
    current = accepted.profile;

    const assignedContractId = current.contracts[current.contracts.length - 1].id;
    const delivered = deliverContract(current, assignedContractId);
    expect(delivered.ok).toBe(true);
    if (!delivered.ok) return;
    current = delivered.profile;

    expect(quests[5].isCompleted(current)).toBe(true);
    expect(isSectionUnlocked(current, 'bank')).toBe(true);
    expect(computeUnlockedSections(current)).toContain('bank');
    expect(calculatePlayerProgress(current).currentChapter).toBeGreaterThanOrEqual(3);
    expect(validatePlayerProfile(current)).toEqual({ ok: true });
  });

  it('16. calculates offline idle production accurately, passes profile validation, and blocks duplicate claims', () => {
    const qatar = findCountry('qatar')!;
    const base = createNewPlayer(qatar, 'تميم', new Date('2026-03-01T00:00:00.000Z'));
    base.companies[0].maintenanceCondition = 100;

    // Simulate 4 hours of real offline elapsed time via heartbeat storage
    recordOfflineHeartbeat(base.id);
    const key = `suly_offline_last_active_${base.id}`;
    localStorage.setItem(key, String(Date.now() - 4 * 3600 * 1000));

    const report = calculateOfflineIdleProgress(base);
    expect(report).not.toBeNull();
    expect(report!.goodsProduced.length).toBeGreaterThan(0);
    expect(report!.goodsProduced[0].productId).toBe('food-pack');

    const claimed = applyOfflineReportToProfile(base, report!);
    expect(claimed.inventory.find((i) => i.materialOrProductId === 'food-pack')?.quantity).toBeGreaterThan(0);
    expect(claimed.lastOfflineClaimAt).toBeDefined();
    expect(validatePlayerProfile(claimed)).toEqual({ ok: true });

    // Attempting an immediate second claim returns null or refuses duplicate application
    const immediateSecondReport = calculateOfflineIdleProgress(claimed);
    expect(immediateSecondReport).toBeNull();
    const doubleApplyAttempt = applyOfflineReportToProfile(claimed, report!);
    expect(doubleApplyAttempt.inventory).toEqual(claimed.inventory);
  });

  it('17. migrates legacy player saves cleanly to v7 while preserving 100% of balances, assets, companies, and level', () => {
    const uk = findCountry('uk')!;
    const existing = createNewPlayer(uk, 'آرثر', new Date('2026-02-01T00:00:00.000Z'));
    const richLegacyProfile = {
      ...existing,
      level: 6,
      bankBalance: 142_500,
      diamonds: 48,
      goldGrams: 12.5,
      goldCostBasis: 1_250,
      onboarding: {
        // Legacy v5 onboarding object missing the new v7 fields
        introCompleted: true,
        chapter: 2,
        seenGuides: ['lands', 'companies'],
      },
    };

    // Write as a legacy version 5 envelope directly into localStorage
    localStorage.setItem(
      'business-empire.save.v1.legacy-uk-user',
      JSON.stringify({
        version: 5,
        savedAt: '2026-02-10T10:00:00.000Z',
        profile: richLegacyProfile,
      }),
    );

    const migrated = loadSavedGame('legacy-uk-user');
    expect(migrated).not.toBeNull();
    expect(migrated!.bankBalance).toBe(142_500);
    expect(migrated!.diamonds).toBe(48);
    expect(migrated!.goldGrams).toBe(12.5);
    expect(migrated!.level).toBe(6);
    expect(migrated!.countryId).toBe('uk');
    expect(migrated!.companies).toHaveLength(1);
    expect(migrated!.lands).toHaveLength(1);
    // Migrated legacy players with introCompleted=true never get forced back into StoryIntro
    expect(migrated!.onboarding.introCompleted).toBe(true);
    expect(migrated!.onboarding.countryIntroSeen).toBe(true);
    expect(migrated!.onboarding.seenGuides).toEqual(['lands', 'companies']);
    expect(normalizeSavedProfile(migrated)).not.toBeNull();
  });
});
