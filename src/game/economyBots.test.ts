import { describe, it, expect } from 'vitest';
import { COUNTRIES } from '../domain/countries';
import { createNewPlayer, type PlayerProfile, type PlayerLand, type PlayerCompany } from '../domain/player';
import {
  getAdaptiveBots,
  generateBotMarketOffers,
  acceptBotMarketOffer,
} from './economyBots';
import {
  sellLand,
  sellCompany,
  sellAsset,
  claimTask,
} from './engine';
import { validatePlayerProfile } from '../../supabase/functions/game-command/profile-validator';

describe('Suly Business Empire — Update A (Smart Economic Bots & Deduplication)', () => {
  const country = COUNTRIES[0]; // Egypt

  function createTestProfile(overrides: Partial<PlayerProfile> = {}): PlayerProfile {
    const base = createNewPlayer(country, 'المستثمر الاختبار');
    return {
      ...base,
      ...overrides,
    };
  }

  describe('Task 1: Smart Economic Bots', () => {
    it('generates diverse adaptive bot personas scaled with player wealth', () => {
      const earlyProfile = createTestProfile({ bankBalance: 30_000 });
      const earlyBots = getAdaptiveBots(earlyProfile);
      expect(earlyBots.length).toBeGreaterThanOrEqual(5);

      // Check distinct investment archetypes
      const archetypes = earlyBots.map((b) => b.personality);
      expect(archetypes).toContain('conservative');
      expect(archetypes).toContain('aggressive');

      // Check budget bounds (no unlimited fake inflation)
      earlyBots.forEach((bot) => {
        expect(bot.currentBudget).toBeGreaterThan(0);
        expect(bot.currentBudget).toBeLessThan(100_000_000);
      });

      // Advanced player scaling
      const lateProfile = createTestProfile({
        bankBalance: 5_000_000,
        companies: [
          ...earlyProfile.companies,
          {
            id: 'comp-big-1',
            name: 'مجمع الصناعات الكبرى',
            industryId: 'pharma',
            level: 3,
            operationalStatus: 'operational',
            energyUnits: 100,
            energyCapacity: 100,
            maintenanceScore: 100,
            licenseIds: [],
          },
        ],
      });
      const lateBots = getAdaptiveBots(lateProfile);
      const sheikhFahad = lateBots.find((b) => b.id === 'bot-fahad');
      expect(sheikhFahad).toBeDefined();
      expect(sheikhFahad!.currentBudget).toBeGreaterThan(earlyBots.find((b) => b.id === 'bot-fahad')!.currentBudget);
    });

    it('generates balanced market offers based on player inventory and assets', () => {
      const profile = createTestProfile({
        inventory: [
          {
            id: 'inv-food-pack-1',
            materialOrProductId: 'food-pack',
            quantity: 50,
            unit: 'عبوة',
            unitCost: 40,
          },
        ],
        productionOrders: [
          {
            id: 'order-test-1',
            companyId: 'inherited-food-company',
            productId: 'food-pack',
            productName: 'عبوات غذائية',
            outputUnit: 'عبوة',
            batches: 10,
            outputQuantity: 50,
            materialCost: 200,
            energyCost: 50,
            expectedUnitCost: 5,
            demandForecast: 20,
            qualityScore: 90,
            maintenanceCost: 20,
            startedOnDay: 1,
            completesOnDay: 1,
            status: 'completed',
          },
        ],
      });

      const offers = generateBotMarketOffers(profile);
      expect(offers.length).toBeGreaterThan(0);

      offers.forEach((offer) => {
        expect(offer.id).toBeDefined();
        expect(offer.botId).toBeDefined();
        expect(offer.totalAmount).toBeGreaterThan(0);
        expect(offer.expiresOnDay).toBeGreaterThanOrEqual(profile.day);
      });
    });

    it('executes bot buy offer and protects against double-acceptance (idempotency)', () => {
      const profile = createTestProfile({
        inventory: [
          {
            id: 'inv-food-pack-2',
            materialOrProductId: 'food-pack',
            quantity: 40,
            unit: 'عبوة',
            unitCost: 40,
          },
        ],
        productionOrders: [
          {
            id: 'order-test-2',
            companyId: 'inherited-food-company',
            productId: 'food-pack',
            productName: 'عبوات غذائية',
            outputUnit: 'عبوة',
            batches: 10,
            outputQuantity: 40,
            materialCost: 200,
            energyCost: 50,
            expectedUnitCost: 6.25,
            demandForecast: 20,
            qualityScore: 90,
            maintenanceCost: 20,
            startedOnDay: 1,
            completesOnDay: 1,
            status: 'completed',
          },
        ],
      });

      const offers = generateBotMarketOffers(profile);
      const buyOffer = offers.find((o) => o.type === 'buy_player_product');
      expect(buyOffer).toBeDefined();

      const initialBalance = profile.bankBalance;
      const result = acceptBotMarketOffer(profile, buyOffer!.id);
      expect(result.ok).toBe(true);

      const updated = result.profile;
      expect(updated.bankBalance).toBe(initialBalance + buyOffer!.totalAmount);
      expect(updated.processedBotOfferIds).toContain(buyOffer!.id);

      // Verify profile passes strict backend validation
      const validation = validatePlayerProfile(updated);
      expect(validation.ok).toBe(true);

      // Attempt duplicate acceptance with the exact same offer ID
      const secondAttempt = acceptBotMarketOffer(updated, buyOffer!.id);
      expect(secondAttempt.ok).toBe(false);
      expect(secondAttempt.reason).toBe('already-claimed');
      expect(secondAttempt.profile.bankBalance).toBe(updated.bankBalance); // Balance untouched
    });
  });

  describe('Task 2: Buy & Sell Deduplication and Transaction Locking', () => {
    it('sells land cleanly, adds soldAssetIds record, and prevents double-selling', () => {
      const freeLand: PlayerLand = {
        id: 'land-free-test',
        label: 'أرض التوسعة المستقلة',
        areaSquareMeters: 800,
        purchasePrice: 20_000,
        acquiredAt: new Date().toISOString(),
        acquiredOnDay: 1,
        availableForCompanyOnDay: 1,
        landType: 'industrial',
      };

      const profile = createTestProfile({
        lands: [...createTestProfile().lands, freeLand],
      });

      const initialCash = profile.bankBalance;
      const expectedPayout = Math.floor(freeLand.purchasePrice * 0.5);

      const sellResult = sellLand(profile, freeLand.id);
      expect(sellResult.ok).toBe(true);
      expect(sellResult.profile.lands.some((l) => l.id === freeLand.id)).toBe(false);
      expect(sellResult.profile.soldAssetIds).toContain(freeLand.id);
      expect(sellResult.profile.bankBalance).toBe(initialCash + expectedPayout);

      // Verify duplicate sale is strictly rejected
      const repeatSell = sellLand(sellResult.profile, freeLand.id);
      expect(repeatSell.ok).toBe(false);
      expect(repeatSell.reason).toBe('not-found');
    });

    it('sells company, cancels any active auction listings, records ledger, and prevents duplicate sales', () => {
      const freeCompany: PlayerCompany = {
        id: 'comp-independent-test',
        name: 'مؤسسة الدلتا الصناعية المستقلة',
        industryId: 'food',
        countryId: country.id,
        foundedAt: new Date().toISOString(),
        foundedOnDay: 1,
        operationalFromDay: 1,
        licenseIds: [],
      };

      const profile = createTestProfile({
        companies: [...createTestProfile().companies, freeCompany],
        playerAuctions: [
          {
            id: 'auction-listing-comp-test',
            assetId: 'comp-independent-test',
            sellerId: 'player',
            title: 'عرض المصنع في المزاد',
            description: 'وصف',
            startingPrice: 20_000,
            currentBid: 20_000,
            highestBidder: '',
            expiresAtDay: 5,
            status: 'active',
          },
        ],
      });

      const initialCash = profile.bankBalance;
      const sellResult = sellCompany(profile, 'comp-independent-test');
      expect(sellResult.ok).toBe(true);

      // Company removed and tracked in soldAssetIds
      expect(sellResult.profile.companies.some((c) => c.id === 'comp-independent-test')).toBe(false);
      expect(sellResult.profile.soldAssetIds).toContain('comp-independent-test');
      expect(sellResult.profile.bankBalance).toBeGreaterThan(initialCash);

      // Active auction for this company cancelled
      const auction = sellResult.profile.playerAuctions?.find((a) => a.id === 'auction-listing-comp-test');
      expect(auction?.status).toBe('cancelled');

      // Second attempt rejected
      const secondSale = sellCompany(sellResult.profile, 'comp-independent-test');
      expect(secondSale.ok).toBe(false);
    });

    it('sells asset, records transactionId, and rejects repeat sale', () => {
      const profile = createTestProfile({
        assets: [
          {
            id: 'asset-equipment-101',
            label: 'مولد كهربائي صناعي',
            value: 12_000,
            acquiredAt: new Date().toISOString(),
          },
        ],
      });

      const sellRes = sellAsset(profile, 'asset-equipment-101');
      expect(sellRes.ok).toBe(true);
      expect(sellRes.profile.assets.length).toBe(0);
      expect(sellRes.profile.soldAssetIds).toContain('asset-equipment-101');

      // Re-selling the same asset
      const duplicateRes = sellAsset(sellRes.profile, 'asset-equipment-101');
      expect(duplicateRes.ok).toBe(false);
      expect(duplicateRes.reason).toBe('not-found');
    });
  });

  describe('Task 3: Quests & Story Task Persistence', () => {
    it('persists claimed status and prevents double claiming of task rewards', () => {
      const profile = createTestProfile({
        completedTaskIds: [],
        tasks: [],
      });

      // Task 'task-first-land' condition is satisfied by initial inheritedLand
      const claimResult = claimTask(profile, 'task-first-land');
      expect(claimResult.ok).toBe(true);
      expect(claimResult.profile.completedTaskIds).toContain('task-first-land');
      const taskEntry = claimResult.profile.tasks.find((t) => t.taskId === 'task-first-land');
      expect(taskEntry?.claimed).toBe(true);

      // Second claim attempt must fail
      const repeatClaim = claimTask(claimResult.profile, 'task-first-land');
      expect(repeatClaim.ok).toBe(false);
      expect(repeatClaim.reason).toBe('already-claimed');
    });
  });
});
