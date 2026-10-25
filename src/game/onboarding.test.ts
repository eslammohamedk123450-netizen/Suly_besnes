import { describe, expect, it } from 'vitest';
import { COUNTRIES } from '../domain/countries';
import { createNewPlayer } from '../domain/player';
import type { PlayerProfile } from '../domain/player';
import { getPlayerProgress, getSectionUnlockHint, getUnlockedSectionIds } from './onboarding';

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

  it('unlocks production after the first company, then contracts after production and a sale', () => {
    const profile = newStartedProfile();
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

  it('unlocks finance after a completed contract and derives level from accomplishments', () => {
    const profile = newStartedProfile();
    profile.companies.push({ id: 'company-1' } as PlayerProfile['companies'][number]);
    profile.productionOrders.push({ id: 'order-1', status: 'completed' } as PlayerProfile['productionOrders'][number]);
    profile.sales.push({ id: 'sale-1', productId: 'product-1', quantity: 1, unitPrice: 10, grossRevenue: 10, tax: 0, soldAt: '2026-01-01T00:00:00.000Z' });
    profile.contracts.push({
      id: 'contract-1', clientName: 'عميل', clientType: 'budget', productId: 'product-1', productName: 'منتج', quantity: 1,
      unitPrice: 10, reward: 10, reputationReward: 1, deadlineDay: 3, acceptedOnDay: 1, completedOnDay: 2, status: 'completed',
    });

    const progress = getPlayerProgress(profile);
    const unlocked = getUnlockedSectionIds(profile);
    expect(progress.level).toBeGreaterThanOrEqual(2);
    expect(progress.totalExperience).toBeGreaterThan(0);
    expect(unlocked).toContain('bank');
    expect(unlocked).toContain('investments');
    expect(unlocked).toContain('obligations');
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
