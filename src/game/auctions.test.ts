import { describe, expect, it, beforeEach, vi } from 'vitest';
import { getAuctionListings, getAuctionCloseAt, isAuctionOpen } from './auctions';
import {
  listPlayerAssetForAuction,
  settlePlayerAssetAuction,
  cancelPlayerAssetAuction,
  executeSellPlayerAsset,
  calculatePlayerAssetValuation,
  simulatePlayerAssetAuction,
  instantSellPlayerAsset,
} from './dynamicAuctions';
import { saveGame, loadSavedGame } from '../storage/saveRepository';
import { createNewPlayer } from '../domain/player';
import { findCountry } from '../domain/countries';

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

const newTestProfile = () => createNewPlayer(findCountry('egypt')!, 'اختبار المزاد', new Date());

describe('daily auction cycles', () => {
  it('creates a fresh listing id and close time for each game day', () => {
    const dayOne = newTestProfile();
    const dayTwo = { ...dayOne, day: 2 };
    const first = getAuctionListings(dayOne).find((listing) => listing.id.startsWith('land-'));
    const second = getAuctionListings(dayTwo).find((listing) => listing.id.startsWith('land-'));

    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(first?.id).not.toBe(second?.id);
    expect(first?.closesAt).not.toBe(second?.closesAt);
  });

  it('keeps the current cycle open until its saved close time', () => {
    const profile = newTestProfile();
    const listing = getAuctionListings(profile)[0];

    expect(getAuctionCloseAt(profile, listing)).toBe(listing.closesAt);
    expect(isAuctionOpen(profile, listing)).toBe(true);
  });
});

describe('player asset auction listing and anti-duplication system', () => {
  it('creates an independent auction listing and settles sale payout strictly once without duplication', () => {
    let profile = newTestProfile();
    const initialBalance = 100_000;
    profile.bankBalance = initialBalance;

    // Add an asset worth 1,000,000
    const landOne = {
      id: 'land-million-1',
      label: 'أرض تجارية فاخرة',
      areaSquareMeters: 5000,
      purchasePrice: 1_000_000,
      acquiredAt: new Date().toISOString(),
      acquiredOnDay: 1,
      landType: 'commercial' as const,
    };
    profile.lands.push(landOne);

    // 1. List the asset in auction
    const listRes = listPlayerAssetForAuction(profile, 'land', 'land-million-1', 1_000_000);
    expect(listRes.ok).toBe(true);
    if (!listRes.ok || !listRes.data) return;

    profile = listRes.profile;
    const listing = listRes.data;
    expect(listing.id).toMatch(/^pauc-/);
    expect(listing.status).toBe('active');
    expect(listing.bidsHistory.length).toBeGreaterThan(0);
    expect(listing.currentBid).toBeGreaterThanOrEqual(1_000_000);
    expect(profile.playerAuctions?.length).toBe(1);

    const saleAmount = listing.currentBid;

    // 2. Settle the auction
    const settleRes = settlePlayerAssetAuction(profile, listing.id);
    expect(settleRes.ok).toBe(true);
    if (!settleRes.ok || !settleRes.data) return;

    profile = settleRes.profile;
    expect(settleRes.data.payout).toBe(saleAmount);
    expect(profile.bankBalance).toBe(initialBalance + saleAmount);
    expect(profile.lands.some((l) => l.id === 'land-million-1')).toBe(false);
    expect(profile.playerAuctions?.find((l) => l.id === listing.id)?.status).toBe('sold');
    expect(profile.soldAssetIds).toContain('land-million-1');
    expect(profile.processedAuctionSaleIds).toContain(listing.id);

    // 3. Attempt duplicate settlement on same listing -> MUST FAIL and NOT credit balance
    const dupSettleRes = settlePlayerAssetAuction(profile, listing.id);
    expect(dupSettleRes.ok).toBe(false);
    expect(profile.bankBalance).toBe(initialBalance + saleAmount);

    // 4. Attempt direct sell on the already sold asset -> MUST FAIL and NOT credit balance
    const dupDirectSell = executeSellPlayerAsset(profile, 'land', 'land-million-1', 1_000_000);
    expect(dupDirectSell.ok).toBe(false);
    expect(profile.bankBalance).toBe(initialBalance + saleAmount);

    // 5. List a second asset (e.g. worth 500,000)
    const landTwo = {
      id: 'land-second-2',
      label: 'أرض زراعية خصبة',
      areaSquareMeters: 2500,
      purchasePrice: 500_000,
      acquiredAt: new Date().toISOString(),
      acquiredOnDay: 2,
      landType: 'agricultural' as const,
    };
    profile.lands.push(landTwo);

    const listRes2 = listPlayerAssetForAuction(profile, 'land', 'land-second-2', 500_000);
    expect(listRes2.ok).toBe(true);
    if (!listRes2.ok || !listRes2.data) return;

    profile = listRes2.profile;
    const listing2 = listRes2.data;
    expect(listing2.id).not.toBe(listing.id);
    expect(listing2.status).toBe('active');
    // Ensure previous listing is still sold
    expect(profile.playerAuctions?.find((l) => l.id === listing.id)?.status).toBe('sold');

    // Balance must STILL be initialBalance + saleAmount (no extra payout from listing)
    expect(profile.bankBalance).toBe(initialBalance + saleAmount);

    // Settle second listing
    const saleAmount2 = listing2.currentBid;
    const settleRes2 = settlePlayerAssetAuction(profile, listing2.id);
    expect(settleRes2.ok).toBe(true);
    if (!settleRes2.ok || !settleRes2.data) return;

    profile = settleRes2.profile;
    expect(profile.bankBalance).toBe(initialBalance + saleAmount + saleAmount2);

    // Settle again MUST FAIL
    const dupSettleRes2 = settlePlayerAssetAuction(profile, listing2.id);
    expect(dupSettleRes2.ok).toBe(false);
    expect(profile.bankBalance).toBe(initialBalance + saleAmount + saleAmount2);
  });

  it('persists state correctly across save and load without allowing re-settlement or duplicated payouts', () => {
    let profile = newTestProfile();
    profile.bankBalance = 50_000;

    const testAsset = {
      id: 'asset-rare-gem-1',
      label: 'مجوهرات نادرة',
      value: 1_000_000,
      acquiredAt: new Date().toISOString(),
    };
    profile.assets.push(testAsset);

    const listRes = listPlayerAssetForAuction(profile, 'asset', 'asset-rare-gem-1', 1_000_000);
    expect(listRes.ok).toBe(true);
    if (!listRes.ok || !listRes.data) return;

    profile = listRes.profile;
    const listingId = listRes.data.id;
    const finalBid = listRes.data.currentBid;

    const settleRes = settlePlayerAssetAuction(profile, listingId);
    expect(settleRes.ok).toBe(true);
    if (!settleRes.ok || !settleRes.data) return;

    profile = settleRes.profile;
    const expectedBalance = 50_000 + finalBid;
    expect(profile.bankBalance).toBe(expectedBalance);

    // Save game
    const saveRes = saveGame(profile);
    expect(saveRes.ok).toBe(true);

    // Reload game
    const loaded = loadSavedGame(profile.accountCode);
    expect(loaded).toBeDefined();
    expect(loaded?.bankBalance).toBe(expectedBalance);
    expect(loaded?.soldAssetIds).toContain('asset-rare-gem-1');
    expect(loaded?.processedAuctionSaleIds).toContain(listingId);
    expect(loaded?.playerAuctions?.find((l) => l.id === listingId)?.status).toBe('sold');

    // Try to settle on loaded profile -> MUST FAIL
    if (loaded) {
      const retrySettle = settlePlayerAssetAuction(loaded, listingId);
      expect(retrySettle.ok).toBe(false);
      expect(loaded.bankBalance).toBe(expectedBalance);
    }
  });

  it('allows cancelling an active listing safely without losing the asset or duplicating payout', () => {
    let profile = newTestProfile();
    profile.bankBalance = 100_000;

    const land = {
      id: 'land-cancel-test',
      label: 'أرض للمزاد الملغي',
      areaSquareMeters: 1000,
      purchasePrice: 200_000,
      acquiredAt: new Date().toISOString(),
      acquiredOnDay: 1,
      landType: 'industrial' as const,
    };
    profile.lands.push(land);

    const listRes = listPlayerAssetForAuction(profile, 'land', 'land-cancel-test', 200_000);
    expect(listRes.ok).toBe(true);
    if (!listRes.ok || !listRes.data) return;

    profile = listRes.profile;
    const cancelRes = cancelPlayerAssetAuction(profile, listRes.data.id);
    expect(cancelRes.ok).toBe(true);
    if (!cancelRes.ok || !cancelRes.data) return;

    profile = cancelRes.profile;

    // Asset still exists in player lands
    expect(profile.lands.some((l) => l.id === 'land-cancel-test')).toBe(true);
    // Listing marked cancelled
    expect(profile.playerAuctions?.find((l) => l.id === listRes.data.id)?.status).toBe('cancelled');
    // Balance not changed
    expect(profile.bankBalance).toBe(100_000);

    // Cannot settle a cancelled auction
    const trySettle = settlePlayerAssetAuction(profile, listRes.data.id);
    expect(trySettle.ok).toBe(false);
    expect(profile.bankBalance).toBe(100_000);
  });
});

describe('economic valuation and anti-inflation auction tests (100k vs 95M exploit prevention)', () => {
  it('1. GUARANTEES a 100,000 $ asset CANNOT sell for 95,000,000 $ and rejects exploit settlement', () => {
    let profile = newTestProfile();
    const testLand = {
      id: 'land-100k-exploit',
      label: 'أرض 100 ألف دولار',
      areaSquareMeters: 1000,
      purchasePrice: 100_000,
      acquiredAt: new Date().toISOString(),
      acquiredOnDay: 1,
      landType: 'commercial' as const,
    };
    profile.lands.push(testLand);

    const valuation = calculatePlayerAssetValuation('land', testLand);
    expect(valuation.purchaseCost).toBe(100_000);
    expect(valuation.fairValue).toBe(100_000);
    // Max economic ceiling is capped at 165% of fair value (165,000), never 95,000,000!
    expect(valuation.maxAllowedBid).toBeLessThan(200_000);
    expect(valuation.maxAllowedBid).toBeGreaterThan(100_000);

    // List the asset
    const listRes = listPlayerAssetForAuction(profile, 'land', 'land-100k-exploit', valuation.recommendedStartingBid);
    expect(listRes.ok).toBe(true);
    if (!listRes.ok || !listRes.data) return;
    profile = listRes.profile;

    // Simulation check: Run 50 auction simulations, NONE must ever exceed maxAllowedBid
    for (let i = 0; i < 50; i++) {
      const sim = simulatePlayerAssetAuction(valuation.fairValue, valuation.recommendedStartingBid);
      expect(sim.finalBid).toBeLessThanOrEqual(valuation.maxAllowedBid);
      expect(sim.finalBid).not.toBe(95_000_000);
      for (const bid of sim.bidsList) {
        expect(bid.amount).toBeLessThanOrEqual(valuation.maxAllowedBid);
      }
    }

    // Exploit attempt: A modified client tries to settle with customWinningAmount = 95,000,000
    const exploitSettle = settlePlayerAssetAuction(
      profile,
      listRes.data.id,
      95_000_000,
      'هاكر غير مصرح',
    );
    // MUST BE REJECTED!
    expect(exploitSettle.ok).toBe(false);
    if (!exploitSettle.ok) {
      expect(exploitSettle.reason).toBe('invalid-input');
      expect(exploitSettle.message).toContain('يتجاوز السقف الاقتصادي');
    }
    // Profile balance must NOT be inflated
    expect(profile.bankBalance).not.toBeGreaterThanOrEqual(95_000_000);
  });

  it('2. Unsold scenario: correctly handles zero bids without fake sales', () => {
    let profile = newTestProfile();
    const testLand = {
      id: 'land-unsold-test',
      label: 'أرض معروضة بسعر مبالغ فيه',
      areaSquareMeters: 1000,
      purchasePrice: 50_000,
      acquiredAt: new Date().toISOString(),
      acquiredOnDay: 1,
      landType: 'industrial' as const,
    };
    profile.lands.push(testLand);

    const valuation = calculatePlayerAssetValuation('land', testLand);
    const listRes = listPlayerAssetForAuction(profile, 'land', 'land-unsold-test', valuation.maxStartingBid);
    expect(listRes.ok).toBe(true);
    if (!listRes.ok || !listRes.data) return;
    profile = listRes.profile;

    // Cancelling an unsold listing safely restores the asset
    const cancelRes = cancelPlayerAssetAuction(profile, listRes.data.id);
    expect(cancelRes.ok).toBe(true);
    if (!cancelRes.ok) return;
    profile = cancelRes.profile;

    expect(profile.lands.some((l) => l.id === 'land-unsold-test')).toBe(true);
    expect(profile.soldAssetIds ?? []).not.toContain('land-unsold-test');
  });

  it('3. Single bidder & varied simulation scenarios behave within economic boundaries', () => {
    const fairValue = 200_000;
    const startingBid = 190_000;

    let sawNoBids = false;
    let sawBids = false;

    for (let i = 0; i < 60; i++) {
      const sim = simulatePlayerAssetAuction(fairValue, startingBid);
      if (sim.outcome === 'no_bids') {
        sawNoBids = true;
        expect(sim.bidsList.length).toBe(0);
        expect(sim.finalBid).toBe(0);
      } else {
        sawBids = true;
        expect(sim.bidsList.length).toBeGreaterThanOrEqual(1);
        expect(sim.finalBid).toBeGreaterThanOrEqual(startingBid);
        expect(sim.finalBid).toBeLessThanOrEqual(Math.round(fairValue * 1.65));
      }
    }
    expect(sawBids).toBe(true);
  });

  it('4. Instant sell direct liquidation executes at 88% fair value', () => {
    let profile = newTestProfile();
    profile.bankBalance = 10_000;

    const testLand = {
      id: 'land-instant-sell',
      label: 'أرض للتسييل الفوري',
      areaSquareMeters: 2000,
      purchasePrice: 100_000,
      acquiredAt: new Date().toISOString(),
      acquiredOnDay: 1,
      landType: 'commercial' as const,
    };
    profile.lands.push(testLand);

    const valuation = calculatePlayerAssetValuation('land', testLand);
    expect(valuation.instantSellPrice).toBe(Math.round(valuation.fairValue * 0.88));

    const instantRes = instantSellPlayerAsset(profile, 'land', 'land-instant-sell');
    expect(instantRes.ok).toBe(true);
    if (!instantRes.ok) return;

    profile = instantRes.profile;
    expect(profile.lands.some((l) => l.id === 'land-instant-sell')).toBe(false);
    expect(profile.soldAssetIds).toContain('land-instant-sell');
    expect(profile.bankBalance).toBe(10_000 + valuation.instantSellPrice);

    // Cannot instant sell twice
    const dupRes = instantSellPlayerAsset(profile, 'land', 'land-instant-sell');
    expect(dupRes.ok).toBe(false);
  });
});

