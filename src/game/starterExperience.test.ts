import { describe, expect, it, beforeEach, vi } from 'vitest';
import { runProduction, sellProduct, advanceDay } from './engine';
import { getLuckyWheelTier, getLuckySpinState, selectWeightedPrize } from './luckyWheelService';
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

const newTestProfile = () => createNewPlayer(findCountry('egypt')!, 'مطور سولي', new Date());

describe('starter onboarding and production experience', () => {
  it('10. Starter production batch completes in 1 day and delivers products to inventory for instant learning', () => {
    let profile = newTestProfile();
    profile.bankBalance = 50_000;
    const company = profile.companies[0];
    expect(company).toBeDefined();

    // Player starts with 0 completed production orders and stocks raw materials
    expect(profile.productionOrders.length).toBe(0);

    profile.inventory = [
      { id: 'inv-grain', materialOrProductId: 'grain', quantity: 20, unit: 'كجم', unitCost: 10, qualityScore: 90 },
      { id: 'inv-pack', materialOrProductId: 'packaging', quantity: 10, unit: 'وحدة', unitCost: 7, qualityScore: 90 },
    ];

    // First production run starts active and completes in 1 day
    const result = runProduction(profile, company.id, 1);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    profile = result.profile;
    expect(profile.productionOrders.length).toBe(1);
    const order = profile.productionOrders[0];
    expect(order.status).toBe('active');
    expect(order.completesOnDay).toBe(profile.day + 1);

    // Fast 1-day progress to complete order
    const nextDayRes = advanceDay(profile);
    expect(nextDayRes.ok).toBe(true);
    if (!nextDayRes.ok) return;
    profile = nextDayRes.profile;

    expect(profile.productionOrders[0].status).toBe('completed');
    const producedLot = profile.inventory.find((lot) => lot.materialOrProductId === order.productId);
    expect(producedLot).toBeDefined();
    expect(producedLot?.quantity).toBeGreaterThan(0);
  });

  it('11. Selling first products in the market tracks gross revenue, tax, cost of goods, and net profit', () => {
    let profile = newTestProfile();
    profile.bankBalance = 20_000;
    profile.inventory = [
      { id: 'inv-grain', materialOrProductId: 'grain', quantity: 20, unit: 'كجم', unitCost: 10, qualityScore: 90 },
      { id: 'inv-pack', materialOrProductId: 'packaging', quantity: 10, unit: 'وحدة', unitCost: 7, qualityScore: 90 },
    ];

    // Run first production to get goods
    const prodRes = runProduction(profile, profile.companies[0].id, 1);
    expect(prodRes.ok).toBe(true);
    if (!prodRes.ok) return;
    profile = prodRes.profile;

    const nextDay = advanceDay(profile);
    expect(nextDay.ok).toBe(true);
    if (!nextDay.ok) return;
    profile = nextDay.profile;

    const lot = profile.inventory.find((l) => l.materialOrProductId === prodRes.data.productId);
    expect(lot).toBeDefined();
    const qtyToSell = Math.min(lot?.quantity ?? 1, 5);

    const initialBank = profile.bankBalance;
    const saleRes = sellProduct(profile, lot!.materialOrProductId, qtyToSell);
    expect(saleRes.ok).toBe(true);
    if (!saleRes.ok) return;

    profile = saleRes.profile;

    // Check sale record
    expect(profile.sales.length).toBe(1);
    const sale = profile.sales[0];
    expect(sale.quantity).toBe(qtyToSell);
    expect(sale.grossRevenue).toBeGreaterThan(0);
    expect(sale.costOfGoods).toBeGreaterThan(0);
    expect(sale.tax).toBeGreaterThanOrEqual(0);

    // Bank balance increased by net proceeds
    const netProceeds = sale.grossRevenue - sale.tax;
    expect(profile.bankBalance).toBe(initialBank + netProceeds);
  });

  it('12. Lucky wheel 5-tier system configures increasing rewards, decreasing cooldowns, and transparent odds', () => {
    // Check all 5 tiers
    for (let level = 1; level <= 5; level++) {
      const tier = getLuckyWheelTier(level);
      expect(tier.level).toBe(level);
      expect(tier.prizes.length).toBe(8);

      // Verify odds sum to 100%
      const totalOdds = tier.prizes.reduce((sum, p) => sum + p.chancePercent, 0);
      expect(totalOdds).toBe(100);

      // Cooldown decreases as level increases (50 -> 45 -> 40 -> 35 -> 30)
      expect(tier.cooldownMinutes).toBe(55 - level * 5);

      // Test prize selection
      const prize = selectWeightedPrize(tier.prizes);
      expect(prize).toBeDefined();
      expect(prize.amount).toBeGreaterThan(0);
    }

    // Cooldown state check
    const state = getLuckySpinState(undefined, 1);
    expect(state.isFree).toBe(true);
    expect(state.tier.level).toBe(1);

    const state5 = getLuckySpinState(Date.now() - 31 * 60 * 1000, 5);
    expect(state5.isFree).toBe(true); // 31 mins elapsed >= 30 mins cooldown for Level 5
  });
});
