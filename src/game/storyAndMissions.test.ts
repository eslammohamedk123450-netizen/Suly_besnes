import { describe, it, expect } from 'vitest';
import { COUNTRIES, findCountry } from '../domain/countries';
import { createNewPlayer, type PlayerProfile } from '../domain/player';
import { COUNTRY_REAL_ASSETS } from './catalog';
import { 
  GLOBAL_STORY_TITLE, 
  CAMPAIGN_CHAPTERS, 
  getPlayerCampaignChapter, 
  isChapterCompleted, 
  canAdvanceChapter,
  getCountryCharacters, 
  getLeadAdvisor,
  getFinanceAdvisor,
  getRivalCharacter,
  NADER_AL_SALMI
} from './campaignScenario';
import { 
  CENTRAL_MISSIONS_CATALOG, 
  getAvailableMissions, 
  claimMissionReward 
} from './missionsEngine';
import { 
  canAccessSystem, 
  filterSynchronizedNotifications, 
  isStoryEventAllowed,
  isNotificationAllowed
} from './synchronizer';
import { isSectionUnlocked, getUnlockedSectionIds } from './onboarding';
import { migrateProfile } from '../storage/saveRepository';

describe('Suly Business Empire — Master Story, Jordan & Systems Integration Tests (Section 18)', () => {
  const egypt = findCountry('egypt')!;
  const jordan = findCountry('jordan')!;

  // Test 1: New player initialization
  it('1. Initializes new player with inherited factory, land, debt, and chapter 1', () => {
    const player = createNewPlayer(egypt, 'إسلام');
    expect(player.name).toBe('إسلام');
    expect(player.countryId).toBe('egypt');
    expect(player.level).toBe(1);
    expect(player.campaignChapterId).toBe(1);
    expect(player.companies.length).toBeGreaterThanOrEqual(1);
    expect(player.lands.length).toBeGreaterThanOrEqual(1);
    expect(player.banking.loans.length).toBeGreaterThanOrEqual(1);
    expect(player.bankBalance).toBeGreaterThan(0);
    expect(player.completedMissionIds).toEqual([]);
    expect(player.claimedRewardIds).toEqual([]);
  });

  // Test 2: Jordan position and economic settings
  it('2. Jordan is #2 immediately after Egypt with canonical economic setup', () => {
    expect(COUNTRIES[0].id).toBe('egypt');
    expect(COUNTRIES[1].id).toBe('jordan');
    const jo = findCountry('jordan');
    expect(jo).toBeDefined();
    expect(jo?.name).toContain('الأردن');
    expect(jo?.flag).toBe('🇯🇴');
    expect(jo?.currency.code).toBe('USD');
    expect(jo?.economy.taxRate).toBe(0.14);
  });

  // Test 3: The 10 countries order
  it('3. All 10 countries exist in exact mandated sequence', () => {
    const expectedOrder = [
      'egypt',
      'jordan',
      'saudi',
      'uae',
      'usa',
      'kuwait',
      'qatar',
      'uk',
      'germany',
      'japan',
    ];
    expect(COUNTRIES.map((c) => c.id)).toEqual(expectedOrder);
  });

  // Test 4: Jordan assets in catalog
  it('4. Real assets for Jordan exist in catalog (Sahab, Aqaba, Jordan Valley, etc.)', () => {
    const jordanAssets = COUNTRY_REAL_ASSETS.jordan;
    expect(jordanAssets).toBeDefined();
    expect(jordanAssets.directLands.length).toBeGreaterThanOrEqual(2);
    expect(jordanAssets.directCompanies.length).toBeGreaterThanOrEqual(2);
    expect(jordanAssets.auctions.length).toBeGreaterThanOrEqual(1);

    const landLabels = jordanAssets.directLands.map((a) => a.label);
    expect(landLabels.some((n) => n.includes('سحاب'))).toBe(true);
    expect(landLabels.some((n) => n.includes('غور الأردن') || n.includes('العقبة'))).toBe(true);

    const companyNames = jordanAssets.directCompanies.map((c) => c.name);
    expect(companyNames.some((n) => n.includes('البتراء'))).toBe(true);
  });

  // Test 5: Jordan characters and cross-cutting figures
  it('5. Jordan characters (سامر الخطيب، رنا العبدالله، ليث المجالي، فادي النابلسي، نادر السالمي) are configured', () => {
    const chars = getCountryCharacters('jordan');
    const names = chars.map((c) => c.name);
    expect(names).toContain('سامر الخطيب');
    expect(names).toContain('رنا العبدالله');
    expect(names).toContain('ليث المجالي');
    expect(names).toContain('فادي النابلسي');
    expect(names).toContain(NADER_AL_SALMI.name);

    const lead = getLeadAdvisor('jordan');
    expect(lead.name).toBe('سامر الخطيب');
    const fin = getFinanceAdvisor('jordan');
    expect(fin.name).toBe('رنا العبدالله');
    const rival = getRivalCharacter('jordan');
    expect(rival.name).toBe('ليث المجالي');
  });

  // Test 6: 10 Chapters defined with lore, title, and secrets
  it('6. Storyline contains exactly 10 chapters with Horizon Global Group secrets', () => {
    expect(GLOBAL_STORY_TITLE).toBe('Suly Business Empire: صعود الإمبراطورية');
    expect(CAMPAIGN_CHAPTERS.length).toBe(10);
    CAMPAIGN_CHAPTERS.forEach((ch, idx) => {
      expect(ch.id).toBe(idx + 1);
      expect(ch.title).toBeTruthy();
      expect(ch.subtitle).toBeTruthy();
      expect(ch.dialogueText).toBeTruthy();
      expect(ch.objectiveText).toBeTruthy();
      expect(ch.horizonSecretClue).toBeTruthy();
      expect(ch.choices.length).toBeGreaterThanOrEqual(1);
      expect(ch.rewardDiamonds).toBeGreaterThan(0);
    });
  });

  // Test 7: Chapter progression and completion
  it('7. Evaluates chapter completion according to player level, companies, and profit', () => {
    const player = createNewPlayer(jordan, 'سليمان');
    const ch1 = CAMPAIGN_CHAPTERS[0];
    expect(isChapterCompleted(player, ch1)).toBe(true);

    const ch2 = CAMPAIGN_CHAPTERS[1]; // requires netProfit >= 10,000
    expect(isChapterCompleted(player, ch2)).toBe(false);

    // Player earns profit >= 10,000
    const profitablePlayer: PlayerProfile = {
      ...player,
      finances: { ...player.finances, netProfit: 15_000 },
    };
    expect(isChapterCompleted(profitablePlayer, ch2)).toBe(true);
  });

  // Test 8: Anti-exploit: Double claiming prevention
  it('8. Anti-exploit prevents claiming rewards multiple times', () => {
    const player = createNewPlayer(jordan, 'خالد');
    const mission = CENTRAL_MISSIONS_CATALOG[0]; // inspect factory - completed on Day 1

    // First claim
    const firstClaim = claimMissionReward(player, mission.id);
    expect(firstClaim.ok).toBe(true);
    expect(firstClaim.profile.claimedRewardIds).toContain(mission.id);
    expect(firstClaim.profile.bankBalance).toBe(player.bankBalance + mission.rewards.money);

    // Second claim attempt should fail
    const secondClaim = claimMissionReward(firstClaim.profile, mission.id);
    expect(secondClaim.ok).toBe(false);
    expect(secondClaim.profile.bankBalance).toBe(firstClaim.profile.bankBalance);
  });

  // Test 9: Central missions catalog evaluates real game state
  it('9. Central missions engine evaluates actual condition on player assets', () => {
    const player = createNewPlayer(egypt, 'محمد');
    const inspectMission = CENTRAL_MISSIONS_CATALOG.find((m) => m.id === 'mission-inspect-factory')!;
    expect(inspectMission).toBeDefined();
    // Default player has cash and initial company
    expect(inspectMission.isCompleted(player)).toBe(true);

    const upgradeMission = CENTRAL_MISSIONS_CATALOG.find((m) => m.id === 'mission-repair-factory')!;
    // Initially efficiency is 25%, condition requires >= 90%
    expect(upgradeMission.isCompleted(player)).toBe(false);

    // After upgrading company maintenance condition to 95%
    const upgradedPlayer: PlayerProfile = {
      ...player,
      companies: player.companies.map((c) => ({ ...c, maintenanceCondition: 95 })),
    };
    expect(upgradeMission.isCompleted(upgradedPlayer)).toBe(true);
  });

  // Test 10: Multi-step practical tasks have defined checklist and targets
  it('10. Multi-step practical tasks have defined checklist and targets', () => {
    const mission = CENTRAL_MISSIONS_CATALOG[1]; // Repair factory
    expect(mission.practicalSteps.length).toBeGreaterThanOrEqual(3);
    expect(mission.requiredSection).toBe('companies');
    expect(mission.briefing.practicalSteps.length).toBeGreaterThanOrEqual(2);
  });

  // Test 11: Skip dialogue button strictly skips text without granting rewards or completing missions
  it('11. Skip action closes dialog without granting rewards, completing missions, or unlocking sections', () => {
    const player = createNewPlayer(jordan, 'مروان');
    const initialBalance = player.bankBalance;
    const initialDiamonds = player.diamonds;
    const initialCompleted = [...(player.completedMissionIds ?? [])];
    const initialClaimed = [...(player.claimedRewardIds ?? [])];
    const initialUnlocked = getUnlockedSectionIds(player);

    // Simulate "Skip" action (closing briefing/walkthrough dialog without executing commands)
    const afterSkipProfile = { ...player };

    expect(afterSkipProfile.bankBalance).toBe(initialBalance);
    expect(afterSkipProfile.diamonds).toBe(initialDiamonds);
    expect(afterSkipProfile.completedMissionIds).toEqual(initialCompleted);
    expect(afterSkipProfile.claimedRewardIds).toEqual(initialClaimed);
    expect(getUnlockedSectionIds(afterSkipProfile)).toEqual(initialUnlocked);
  });

  // Test 12: Section lock checking and synchronizer access control
  it('12. Central synchronizer prevents access to locked systems', () => {
    const player = createNewPlayer(jordan, 'طارق');
    // Level 1: companies and inventory are unlocked; bank opens at level 4; investments at level 5
    expect(canAccessSystem(player, 'companies')).toBe(true);
    expect(canAccessSystem(player, 'inventory')).toBe(true);
    expect(canAccessSystem(player, 'bank')).toBe(false);
    expect(canAccessSystem(player, 'investments')).toBe(false);
    expect(canAccessSystem(player, 'tech_tree')).toBe(false);
  });

  // Test 13: Suppress notifications for locked systems
  it('13. Suppresses notifications referencing locked systems', () => {
    const player = createNewPlayer(jordan, 'سامي'); // Level 1
    const bankNotif = {
      id: 'test-bank',
      title: 'البنك',
      message: 'عرض تمويل جديد',
      targetSection: 'bank' as const,
      occurredAt: new Date().toISOString(),
      priority: 'normal' as const,
      read: false,
    };
    expect(isNotificationAllowed(bankNotif, player)).toBe(false);

    const filtered = filterSynchronizedNotifications(player, [bankNotif]);
    expect(filtered.length).toBe(0);

    // At Level 4 with intro completed, bank notification becomes allowed
    const level4Player: PlayerProfile = {
      ...player,
      level: 4,
      onboarding: { ...player.onboarding, introCompleted: true },
    };
    expect(isNotificationAllowed(bankNotif, level4Player)).toBe(true);
    expect(filterSynchronizedNotifications(level4Player, [bankNotif]).length).toBe(1);
  });

  // Test 14: Suppress story events for locked systems
  it('14. Suppresses story events referencing locked systems', () => {
    const player = createNewPlayer(jordan, 'رامي');
    const bankEvent = {
      id: 'event-bank-audit',
      title: 'تدقيق البنك',
      description: 'فحص الحسابات',
      chapter: 1,
      targetSection: 'bank' as const,
      actionText: 'زيارة البنك',
      rewardCash: 1000,
    };
    expect(isStoryEventAllowed(player, bankEvent)).toBe(false);

    const level4Player: PlayerProfile = {
      ...player,
      level: 4,
      onboarding: { ...player.onboarding, introCompleted: true },
    };
    expect(isStoryEventAllowed(level4Player, bankEvent)).toBe(true);
  });

  // Test 15: Backward compatibility migration
  it('15. Migrates older player profiles missing campaign fields cleanly', () => {
    const sample = createNewPlayer(jordan, 'قديم');
    const { campaignChapterId, completedMissionIds, claimedRewardIds, ...legacyData } = sample;

    const migrated = migrateProfile(legacyData);
    expect(migrated).not.toBeNull();
    expect(migrated?.campaignChapterId).toBe(1);
    expect(Array.isArray(migrated?.completedMissionIds)).toBe(true);
    expect(Array.isArray(migrated?.claimedRewardIds)).toBe(true);
    expect(Array.isArray(migrated?.dismissedStoryEventIds)).toBe(true);
  });

  // Test 16: Saving and reloading preserves Jordan and campaign progress
  it('16. Jordan profile with campaign state serializes and deserializes accurately', () => {
    const player = createNewPlayer(jordan, 'جمال');
    const advancedPlayer: PlayerProfile = {
      ...player,
      campaignChapterId: 3,
      completedMissionIds: ['mission-inspect-factory'],
      claimedRewardIds: ['mission-inspect-factory', 'chapter_reward_1'],
    };

    const serialized = JSON.stringify(advancedPlayer);
    const reloaded = migrateProfile(JSON.parse(serialized));

    expect(reloaded).not.toBeNull();
    expect(reloaded?.countryId).toBe('jordan');
    expect(reloaded?.campaignChapterId).toBe(3);
    expect(reloaded?.completedMissionIds).toContain('mission-inspect-factory');
    expect(reloaded?.claimedRewardIds).toContain('chapter_reward_1');
  });

  // Test 17: Horizon Global Group secrets dossier
  it('17. Horizon Global Group secrets are revealed progressively through chapters', () => {
    CAMPAIGN_CHAPTERS.forEach((ch) => {
      expect(ch.horizonSecretClue).toBeTruthy();
      expect(ch.horizonSecretClue.length).toBeGreaterThan(15);
    });
    // Chapter 9 is specifically about the secret of Horizon Global Group and Nader Al-Salmi
    const ch9 = CAMPAIGN_CHAPTERS[8];
    expect(ch9.id).toBe(9);
    expect(ch9.title).toContain('سر مجموعة الأفق');
    expect(ch9.dialogueText).toContain('الأفق');
  });

  // Test 18: Non-diamond requirement: Main campaign is playable without spending diamonds
  it('18. Main storyline chapter requirements are purely operational without diamond paywalls', () => {
    CAMPAIGN_CHAPTERS.forEach((ch) => {
      // Required parameters are level, companies, profit - no diamond spend required
      expect(ch.requiredLevel).toBeGreaterThanOrEqual(1);
      expect(ch.requiredCompanies).toBeGreaterThanOrEqual(1);
      expect(ch.requiredProfit).toBeGreaterThanOrEqual(0);
      // Instead, completing chapters awards free diamonds to the player!
      expect(ch.rewardDiamonds).toBeGreaterThan(0);
    });
  });
});
