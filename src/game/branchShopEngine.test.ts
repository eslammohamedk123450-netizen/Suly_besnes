/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createNewPlayer } from '../domain/player';
import { findCountry } from '../domain/countries';
import {
  establishBranch,
  upgradeBranch,
  establishRetailShop,
  upgradeRetailShop,
  linkShopToFactory,
  transferStockToShop,
  sellFromRetailShop,
  getBranchAndShopReports,
} from './branchShopEngine';
import { normalizeSavedProfile } from '../storage/saveRepository';

describe('Branch and Retail Shop Engine', () => {
  let profile = createNewPlayer(findCountry('egypt')!, 'المستثمر الذهبي');

  beforeEach(() => {
    profile = createNewPlayer(findCountry('egypt')!, 'المستثمر الذهبي');
    // Setup healthy bank balance and level
    profile.bankBalance = 150_000;
    profile.level = 3;
    profile.diamonds = 50;

    // Give player an owned commercial plot
    profile.lands.push({
      id: 'comm-land-1',
      label: 'أرض تجارية بوسط البلد',
      areaSquareMeters: 500,
      purchasePrice: 6000,
      acquiredAt: new Date().toISOString(),
      acquiredOnDay: 1,
      availableForCompanyOnDay: 1,
      landType: 'commercial',
      plotId: 'plot-comm-1',
    });

    profile.lands.push({
      id: 'comm-land-2',
      label: 'أرض بوليفارد المتاجر',
      areaSquareMeters: 450,
      purchasePrice: 6500,
      acquiredAt: new Date().toISOString(),
      acquiredOnDay: 1,
      availableForCompanyOnDay: 1,
      landType: 'commercial',
      plotId: 'plot-comm-2',
    });
  });

  describe('Company Branches', () => {
    it('rejects branch creation if parent company does not exist', () => {
      const res = establishBranch(profile, 'non-existent-company', 'plot-comm-1', 'فرع القاهرة');
      expect(res.ok).toBe(false);
      expect(res.message).toContain('الشركة الأم المحددة غير موجودة');
    });

    it('rejects branch creation if player level is below requirement', () => {
      profile.level = 1;
      const parentCompany = profile.companies[0];
      const res = establishBranch(profile, parentCompany.id, 'plot-comm-1', 'فرع القاهرة');
      expect(res.ok).toBe(false);
      expect(res.message).toContain('المستوى');
    });

    it('rejects branch creation if bank balance is insufficient', () => {
      profile.bankBalance = 500;
      const parentCompany = profile.companies[0];
      const res = establishBranch(profile, parentCompany.id, 'plot-comm-1', 'فرع القاهرة');
      expect(res.ok).toBe(false);
      expect(res.message).toContain('لا تكفي الأموال');
    });

    it('successfully establishes a company branch and registers construction', () => {
      const parentCompany = profile.companies[0];
      const initialCash = profile.bankBalance;
      const res = establishBranch(profile, parentCompany.id, 'plot-comm-1', 'فرع الإسكندرية');

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data.branchId).toBeDefined();
        expect(res.data.plotId).toBe('plot-comm-1');
        expect(res.profile.branches?.length).toBe(1);

        const branch = res.profile.branches![0];
        expect(branch.name).toBe('فرع الإسكندرية');
        expect(branch.companyId).toBe(parentCompany.id);
        expect(branch.level).toBe(1);
        expect(branch.status).toBe('constructing');

        // Cash deducted and construction registered
        expect(res.profile.bankBalance).toBeLessThan(initialCash);
        expect(res.profile.cityConstructions?.['plot-comm-1']).toBeDefined();
      }
    });

    it('upgrades a company branch level and improves efficiency bonus', () => {
      const parentCompany = profile.companies[0];
      const estRes = establishBranch(profile, parentCompany.id, 'plot-comm-1', 'فرع الإسكندرية');
      expect(estRes.ok).toBe(true);
      if (!estRes.ok) return;

      const branchId = estRes.data.branchId;
      const upRes = upgradeBranch(estRes.profile, branchId, 'cash');
      expect(upRes.ok).toBe(true);
      if (upRes.ok) {
        expect(upRes.data.newLevel).toBe(2);
        const upgraded = upRes.profile.branches?.find((b) => b.id === branchId);
        expect(upgraded?.level).toBe(2);
        expect(upgraded?.revenueBonusRate).toBeGreaterThan(0.08);
      }
    });
  });

  describe('Retail Shops', () => {
    it('rejects shop creation on an unowned land plot', () => {
      const res = establishRetailShop(profile, 'groceries', 'plot-unowned-99', 'سوبرماركت التحرير');
      expect(res.ok).toBe(false);
      expect(res.message).toContain('شراء الأرض أولاً');
    });

    it('successfully creates a retail shop of type groceries', () => {
      const initialCash = profile.bankBalance;
      const res = establishRetailShop(
        profile,
        'groceries',
        'plot-comm-1',
        'سوبرماركت البركة',
        profile.companies[0].id
      );

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.profile.shops?.length).toBe(1);
        const shop = res.profile.shops![0];
        expect(shop.shopType).toBe('groceries');
        expect(shop.shelfCapacity).toBe(200);
        expect(shop.inventory).toEqual([]);
        expect(res.profile.bankBalance).toBeLessThan(initialCash);
      }
    });

    it('upgrades retail shop and doubles shelf capacity', () => {
      const estRes = establishRetailShop(profile, 'groceries', 'plot-comm-1', 'سوبرماركت البركة');
      expect(estRes.ok).toBe(true);
      if (!estRes.ok) return;

      const shopId = estRes.data.shopId;
      const upRes = upgradeRetailShop(estRes.profile, shopId, 'cash');
      expect(upRes.ok).toBe(true);
      if (upRes.ok) {
        expect(upRes.data.newLevel).toBe(2);
        expect(upRes.data.newCapacity).toBe(400); // 200 base * 2
      }
    });

    it('links retail shop to a compatible factory', () => {
      const estRes = establishRetailShop(profile, 'groceries', 'plot-comm-1', 'سوبرماركت البركة');
      expect(estRes.ok).toBe(true);
      if (!estRes.ok) return;

      // inherited factory is food industry -> compatible with groceries
      const foodFactory = profile.companies[0];
      const linkRes = linkShopToFactory(estRes.profile, estRes.data.shopId, foodFactory.id);
      expect(linkRes.ok).toBe(true);
      if (linkRes.ok) {
        const linkedShop = linkRes.profile.shops?.find((s) => s.id === estRes.data.shopId);
        expect(linkedShop?.linkedFactoryIds).toContain(foodFactory.id);
      }
    });
  });

  describe('Inventory Transfer and Retail Sales', () => {
    it('transfers stock from warehouse to shop shelves with strict capacity checks', () => {
      // 1. Establish shop
      const estRes = establishRetailShop(profile, 'groceries', 'plot-comm-1', 'سوبرماركت الأمل');
      expect(estRes.ok).toBe(true);
      if (!estRes.ok) return;

      const shopId = estRes.data.shopId;
      let currentProf = estRes.profile;

      // 2. Put 50 food packs in warehouse
      currentProf.inventory = [
        {
          id: 'lot-food-1',
          materialOrProductId: 'food-pack',
          quantity: 50,
          unit: 'عبوة',
          unitCost: 30,
        },
      ];

      // 3. Transfer 20 packs to shop
      const transferRes = transferStockToShop(currentProf, shopId, 'food-pack', 20);
      expect(transferRes.ok).toBe(true);
      if (transferRes.ok) {
        // Warehouse inventory decremented
        const warehouseLot = transferRes.profile.inventory.find((i) => i.materialOrProductId === 'food-pack');
        expect(warehouseLot?.quantity).toBe(30);

        // Shop shelf inventory has 20 packs
        const shop = transferRes.profile.shops?.find((s) => s.id === shopId);
        expect(shop?.inventory.length).toBe(1);
        expect(shop?.inventory[0].quantity).toBe(20);
        expect(shop?.inventory[0].retailPrice).toBeGreaterThan(shop?.inventory[0].unitCost || 0);
      }

      // 4. Cannot transfer more than available in warehouse
      const overTransfer = transferStockToShop(transferRes.profile, shopId, 'food-pack', 999);
      expect(overTransfer.ok).toBe(false);
      expect(overTransfer.message).toContain('غير كافٍ');
    });

    it('sells goods from shop shelves to retail customers and records profit & ledger', () => {
      const estRes = establishRetailShop(profile, 'groceries', 'plot-comm-1', 'سوبرماركت النيل');
      expect(estRes.ok).toBe(true);
      if (!estRes.ok) return;

      const shopId = estRes.data.shopId;
      let currentProf = estRes.profile;

      // Make shop active for sales test
      currentProf.shops = currentProf.shops!.map((s) =>
        s.id === shopId ? { ...s, status: 'active' } : s
      );

      // Add shelf stock directly
      currentProf.shops[0].inventory = [
        {
          productId: 'food-pack',
          productName: 'عبوات غذائية',
          quantity: 25,
          unit: 'عبوة',
          unitCost: 30,
          retailPrice: 65,
          totalSold: 0,
          totalRevenue: 0,
        },
      ];

      const initialBank = currentProf.bankBalance;
      const initialNetProfit = currentProf.finances.netProfit;

      // Sell 10 packs
      const saleRes = sellFromRetailShop(currentProf, shopId, 'food-pack', 10);
      expect(saleRes.ok).toBe(true);
      if (saleRes.ok) {
        expect(saleRes.data.grossRevenue).toBe(650); // 10 * 65
        expect(saleRes.data.costOfGoods).toBe(300); // 10 * 30
        expect(saleRes.data.netProfit).toBeGreaterThan(0);

        // Bank balance increased
        expect(saleRes.profile.bankBalance).toBeGreaterThan(initialBank);

        // Shop shelf stock decremented to 15
        const shop = saleRes.profile.shops?.find((s) => s.id === shopId);
        expect(shop?.inventory[0].quantity).toBe(15);
        expect(shop?.performance.totalSalesRevenue).toBe(650);
        expect(shop?.performance.totalUnitsSold).toBe(10);

        // Finances updated
        expect(saleRes.profile.finances.netProfit).toBeGreaterThan(initialNetProfit);
      }
    });

    it('generates scannable analytical reports comparing branches and shops', () => {
      const estBranch = establishBranch(profile, profile.companies[0].id, 'plot-comm-1', 'فرع الشرق');
      const estShop = establishRetailShop(estBranch.profile, 'detergents', 'plot-comm-2', 'متجر المنظفات');

      const reports = getBranchAndShopReports(estShop.profile);
      expect(reports.totalBranches).toBe(1);
      expect(reports.totalShops).toBe(1);
      expect(reports.bestPerformingShop?.name).toBe('متجر المنظفات');
    });
  });

  describe('Persistence and Serialization', () => {
    it('normalizes and preserves branches and shops in save repository', () => {
      const estBranch = establishBranch(profile, profile.companies[0].id, 'plot-comm-1', 'فرع الإسكندرية');
      const estShop = establishRetailShop(estBranch.profile, 'electronics', 'plot-comm-2', 'معرض التكنولوجيا');

      const rawJson = JSON.parse(JSON.stringify(estShop.profile));
      const loaded = normalizeSavedProfile(rawJson);

      expect(loaded).not.toBeNull();
      expect(loaded?.branches?.length).toBe(1);
      expect(loaded?.branches?.[0].name).toBe('فرع الإسكندرية');
      expect(loaded?.shops?.length).toBe(1);
      expect(loaded?.shops?.[0].name).toBe('معرض التكنولوجيا');
      expect(loaded?.shops?.[0].shopType).toBe('electronics');
    });
  });
});
