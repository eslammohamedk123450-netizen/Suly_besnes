import { describe, expect, it, beforeEach, vi } from 'vitest';
import { COUNTRIES } from '../domain/countries';
import { createNewPlayer } from '../domain/player';
import type { PlayerProfile } from '../domain/player';
import {
  getPlayerProgress,
  getSectionUnlockHint,
  getUnlockedSectionIds,
  getStarterMissions,
  getCompletedStarterMissions,
  getCurrentStarterMissionStage,
  claimStarterMission,
} from './onboarding';
import { saveGame, loadSavedGame } from '../storage/saveRepository';

class MemoryStorage implements Storage {
  private readonly store = new Map<string, string>();
  get length(): number { return this.store.size; }
  clear(): void { this.store.clear(); }
  getItem(key: string): string | null { return this.store.get(key) ?? null; }
  key(index: number): string | null { return Array.from(this.store.keys())[index] ?? null; }
  removeItem(key: string): void { this.store.delete(key); }
  setItem(key: string, value: string): void { this.store.set(key, String(value)); }
}

beforeEach(() => {
  vi.stubGlobal('localStorage', new MemoryStorage());
});

function newStartedProfile(): PlayerProfile {
  const profile = createNewPlayer(COUNTRIES[0], 'مستثمر');
  profile.onboarding.introCompleted = true;
  return profile;
}

describe('progress-based unlocks', () => {
  it('does not unlock advanced systems merely because many days passed', () => {
    const profile = newStartedProfile();
    profile.day = 50;
    const unlocked = getUnlockedSectionIds(profile);

    expect(unlocked).toContain('auctions');
    expect(unlocked).toContain('tasks');
    expect(unlocked).not.toContain('contracts');
    expect(unlocked).not.toContain('bank');
    expect(getSectionUnlockHint(profile, 'contracts')).not.toContain('اليوم');
  });

  it('unlocks production with a company, contracts after production and a sale, and bank after a contract', () => {
    const profile = newStartedProfile();
    profile.companies = [];
    expect(getUnlockedSectionIds(profile)).not.toContain('production');

    profile.companies.push({ id: 'company-1' } as PlayerProfile['companies'][number]);
    let unlocked = getUnlockedSectionIds(profile);
    expect(unlocked).toContain('production');
    expect(unlocked).toContain('inventory');
    expect(unlocked).not.toContain('contracts');

    profile.productionOrders.push({ id: 'order-1', status: 'completed' } as PlayerProfile['productionOrders'][number]);
    profile.sales.push({ id: 'sale-1', productId: 'product-1', quantity: 1, unitPrice: 10, grossRevenue: 10, tax: 0, soldAt: '2026-01-01T00:00:00.000Z' });
    unlocked = getUnlockedSectionIds(profile);
    expect(unlocked).toContain('contracts');
    expect(unlocked).not.toContain('bank');
  });

  it('unlocks banking after a completed contract and investments after a second contract or level 5', () => {
    const profile = newStartedProfile();
    profile.productionOrders.push({ id: 'order-1', status: 'completed' } as PlayerProfile['productionOrders'][number]);
    profile.sales.push({ id: 'sale-1', productId: 'product-1', quantity: 1, unitPrice: 10, grossRevenue: 10, tax: 0, soldAt: '2026-01-01T00:00:00.000Z' });
    profile.contracts.push({
      id: 'contract-1', clientName: 'عميل', clientType: 'budget', productId: 'product-1', productName: 'منتج', quantity: 1,
      unitPrice: 10, reward: 10, reputationReward: 1, deadlineDay: 3, acceptedOnDay: 1, completedOnDay: 2, status: 'completed',
    });

    const progress = getPlayerProgress(profile);
    let unlocked = getUnlockedSectionIds(profile);
    expect(progress.level).toBeGreaterThanOrEqual(2);
    expect(progress.totalExperience).toBeGreaterThan(0);
    expect(unlocked).toContain('bank');
    expect(unlocked).toContain('obligations');
    expect(unlocked).not.toContain('investments');

    profile.companies.push({ id: 'company-2' } as PlayerProfile['companies'][number]);
    profile.contracts.push({
      id: 'contract-2', clientName: 'عميل ٢', clientType: 'bulk', productId: 'product-1', productName: 'منتج', quantity: 2,
      unitPrice: 10, reward: 10, reputationReward: 1, deadlineDay: 4, acceptedOnDay: 2, completedOnDay: 3, status: 'completed',
    });
    unlocked = getUnlockedSectionIds(profile);
    expect(unlocked).toContain('investments');
  });

  it('reaches management systems through level or repeated business accomplishments, not day count', () => {
    const profile = newStartedProfile();
    profile.completedTaskIds = Array.from({ length: 30 }, (_, index) => `task-${index}`);
    profile.day = 1;
    expect(getPlayerProgress(profile).level).toBeGreaterThanOrEqual(5);
    expect(getUnlockedSectionIds(profile)).toContain('staff');
    expect(getUnlockedSectionIds(profile)).toContain('reports');
  });
});

describe('starter missions multi-stage progression and reward safety', () => {
  it('divides missions into sequential stages, claims rewards strictly once, and moves claimed missions to history', () => {
    let profile = newStartedProfile();
    const initialBank = profile.bankBalance;
    const initialDiamonds = profile.diamonds;

    // Initially at Stage 1
    expect(getCurrentStarterMissionStage(profile)).toBe(1);

    // Fulfill repair condition for first mission
    if (profile.companies[0]) {
      profile.companies[0].maintenanceCondition = 100;
    }

    const stage1Missions = getStarterMissions(profile);
    expect(stage1Missions.length).toBeGreaterThan(0);
    expect(stage1Missions.every((m) => m.stage === 1)).toBe(true);

    const firstMission = stage1Missions[0];
    expect(firstMission.completed).toBe(true);

    // Claim the first mission
    const claimRes = claimStarterMission(profile, firstMission.id);
    expect(claimRes.ok).toBe(true);
    if (!claimRes.ok) return;

    profile = claimRes.profile;

    // Check balances increased strictly by reward
    expect(profile.bankBalance).toBe(initialBank + firstMission.cashReward);
    expect(profile.diamonds).toBe(initialDiamonds + firstMission.diamondReward);

    // First mission is now absent from active missions and present in completed history
    const activeAfterClaim = getStarterMissions(profile);
    expect(activeAfterClaim.some((m) => m.id === firstMission.id)).toBe(false);

    const completed = getCompletedStarterMissions(profile);
    expect(completed.some((m) => m.id === firstMission.id)).toBe(true);

    // Attempting to claim again must fail with 'already-claimed' and NOT add rewards
    const duplicateClaim = claimStarterMission(profile, firstMission.id);
    expect(duplicateClaim.ok).toBe(false);
    expect(profile.bankBalance).toBe(initialBank + firstMission.cashReward);
    expect(profile.diamonds).toBe(initialDiamonds + firstMission.diamondReward);

    // Fulfill remaining Stage 1 requirements: production and contract
    profile.productionOrders.push({
      id: 'po-test-1',
      companyId: profile.companies[0]?.id || 'comp-1',
      productId: 'food-pack',
      productName: 'وجبات غذائية',
      batches: 1,
      outputQuantity: 100,
      outputUnit: 'طرد',
      materialCost: 500,
      energyCost: 100,
      expectedUnitCost: 6,
      demandForecast: 1000,
      qualityScore: 90,
      maintenanceCost: 50,
      startedOnDay: 1,
      completesOnDay: 1,
      status: 'completed',
    });
    profile.contracts.push({
      id: 'contract-test-1',
      clientName: 'متاجر الأمل',
      productId: 'food-pack',
      productName: 'وجبات غذائية',
      quantity: 100,
      unitPrice: 10,
      reward: 1000,
      reputationReward: 5,
      deadlineDay: 5,
      acceptedOnDay: 1,
      status: 'completed',
    });

    for (const mission of getStarterMissions(profile)) {
      if (mission.completed) {
        const res = claimStarterMission(profile, mission.id);
        if (res.ok) {
          profile = res.profile;
        }
      }
    }

    // Now should advance to Stage 2
    expect(getCurrentStarterMissionStage(profile)).toBe(2);

    const stage2Missions = getStarterMissions(profile);
    expect(stage2Missions.length).toBeGreaterThan(0);
    expect(stage2Missions.every((m) => m.stage === 2)).toBe(true);

    // Save and reload, verify state preservation
    const saveRes = saveGame(profile);
    expect(saveRes.ok).toBe(true);

    const loaded = loadSavedGame(profile.accountCode);
    expect(loaded).toBeDefined();
    if (loaded) {
      expect(getCurrentStarterMissionStage(loaded)).toBe(2);
      expect(getCompletedStarterMissions(loaded).some((m) => m.id === firstMission.id)).toBe(true);
      expect(getStarterMissions(loaded).some((m) => m.id === firstMission.id)).toBe(false);
    }
  });
});

