/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PlayerProfile } from '../domain/player';
import type { IndustryId } from '../domain/countries';
import {
  type CompanyBranch,
  type RetailShop,
  type RetailShopType,
  type RetailShopItem,
  RETAIL_SHOP_SPECS,
  findShopSpec,
  getBranchSpecs,
} from '../domain/branchAndShop';
import { PRODUCT_CATALOG, findIndustry } from './catalog';
import {
  type GameResult,
  resolvePurchaseDebit,
  addLedger,
  ledgerEntry,
  success,
  failure,
  timestampFor,
  syncTasks,
} from './engine';
import {
  type CityConstructionState,
  loadCityConstructions,
  saveCityConstructions,
  acquireTransactionLock,
  releaseTransactionLock,
} from './cityGridSystem';
import type { PurchasePaymentMethod } from './purchasePricing';

function generateUniqueId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Establishes a new company branch for an existing parent company
 */
export function establishBranch(
  profile: PlayerProfile,
  companyId: string,
  plotId: string,
  branchName: string,
  paymentMethod: PurchasePaymentMethod = 'cash'
): GameResult<{ branchId: string; plotId: string; durationSeconds: number; cost: number }> {
  const lockKey = `branch-create-${plotId}`;
  if (!acquireTransactionLock(lockKey)) {
    return failure(profile, 'condition-not-met', 'تجري عملية تأسيس أخرى حالياً. يرجى الانتظار.');
  }

  try {
    const parentCompany = (profile.companies ?? []).find((c) => c.id === companyId);
    if (!parentCompany) {
      return failure(profile, 'not-found', 'الشركة الأم المحددة غير موجودة.');
    }

    const existingBranchOnPlot = (profile.branches ?? []).find((b) => b.plotId === plotId);
    const existingShopOnPlot = (profile.shops ?? []).find((s) => s.plotId === plotId);
    if (existingBranchOnPlot || existingShopOnPlot) {
      return failure(profile, 'condition-not-met', 'هذا الموقع مشغول بالفعل بفرع أو متجر آخر.');
    }

    const land = (profile.lands ?? []).find((l) => l.plotId === plotId || l.id === plotId);
    if (!land) {
      return failure(profile, 'land-required', 'يجب شراء هذه الأرض أولاً لتأسيس فرع عليها.');
    }

    const readyDay = land.availableForCompanyOnDay ?? land.acquiredOnDay ?? profile.day;
    if (readyDay > profile.day) {
      return failure(profile, 'condition-not-met', `الأرض ما زالت في مرحلة إنهاء عقود الملكية (ستكتمل في اليوم ${readyDay}).`);
    }

    const existingCompanyBranches = (profile.branches ?? []).filter((b) => b.companyId === companyId);
    const branchIndex = existingCompanyBranches.length + 1;

    const requiredLevel = Math.max(2, branchIndex + 1);
    if (profile.level < requiredLevel) {
      return failure(
        profile,
        'condition-not-met',
        `يتطلب فتح الفرع رقم ${branchIndex} وصول رتبة اللاعب إلى المستوى ${requiredLevel} (مستواك الحالي: ${profile.level}).`
      );
    }

    const specs = getBranchSpecs(branchIndex);
    const cost = specs.setupCost;
    const payment = resolvePurchaseDebit(profile, cost, paymentMethod);
    if ('message' in payment) {
      return failure(profile, 'insufficient-funds', `لا تكفي الأموال لتأسيس الفرع. ${payment.message}`);
    }

    const durationSeconds = 20;
    const branchId = generateUniqueId('branch');
    const finalBranchName = branchName.trim() || `فرع ${parentCompany.name} (${branchIndex})`;

    const newBranch: CompanyBranch = {
      id: branchId,
      companyId: parentCompany.id,
      parentCompanyName: parentCompany.name,
      name: finalBranchName,
      industryId: parentCompany.industryId,
      plotId,
      landId: land.id,
      level: 1,
      status: 'constructing',
      establishedOnDay: profile.day,
      establishedAt: timestampFor(profile),
      dailyOperatingCost: specs.dailyOperatingCost,
      revenueBonusRate: specs.bonusRate,
      performance: {
        totalRevenue: 0,
        totalExpenses: 0,
        totalOrdersServed: 0,
      },
    };

    const existingConstructions = loadCityConstructions(profile);
    const newJob: CityConstructionState = {
      plotId,
      landId: land.id,
      companyId: parentCompany.id,
      industryId: parentCompany.industryId,
      companyName: finalBranchName,
      startedAt: Date.now(),
      durationMs: durationSeconds * 1000,
      costCash: cost,
      costDiamonds: payment.diamondsSpent,
      status: 'clearing',
    };
    const updatedConstructions = { ...existingConstructions, [plotId]: newJob };
    saveCityConstructions(updatedConstructions, profile);

    const nextProfile = addLedger(
      {
        ...profile,
        branches: [...(profile.branches ?? []), newBranch],
        cityConstructions: updatedConstructions,
        reputation: (profile.reputation ?? 0) + 15,
      },
      [
        ledgerEntry(
          profile,
          'expense',
          cost,
          `تأسيس فرع جديد: ${finalBranchName} تابع لـ ${parentCompany.name}`,
          0
        ),
      ],
      payment.bankBalance,
      { diamonds: payment.diamonds }
    );

    return success(
      syncTasks(nextProfile),
      `تم تأسيس ${finalBranchName} بنجاح! بدأت أعمال البناء والتشييد وتكتمل خلال ${durationSeconds} ثانية.`,
      {
        branchId,
        plotId,
        durationSeconds,
        cost,
      }
    );
  } finally {
    releaseTransactionLock(lockKey);
  }
}

/**
 * Upgrades a company branch level
 */
export function upgradeBranch(
  profile: PlayerProfile,
  branchId: string,
  paymentMethod: PurchasePaymentMethod = 'cash'
): GameResult<{ branchId: string; newLevel: number; cost: number }> {
  const branch = (profile.branches ?? []).find((b) => b.id === branchId);
  if (!branch) return failure(profile, 'not-found', 'الفرع غير موجود.');

  if (branch.level >= 5) {
    return failure(profile, 'condition-not-met', 'وصل الفرع إلى الحد الأقصى للتطوير (المستوى 5).');
  }

  const nextLevel = branch.level + 1;
  const upgradeCost = 8000 * branch.level;
  const payment = resolvePurchaseDebit(profile, upgradeCost, paymentMethod);
  if ('message' in payment) {
    return failure(profile, 'insufficient-funds', `لا تكفي الأموال لترقية الفرع. ${payment.message}`);
  }

  const updatedBranches = (profile.branches ?? []).map((b) =>
    b.id === branchId
      ? {
          ...b,
          level: nextLevel,
          dailyOperatingCost: b.dailyOperatingCost + 60,
          revenueBonusRate: Number((b.revenueBonusRate + 0.08).toFixed(2)),
        }
      : b
  );

  const nextProfile = addLedger(
    {
      ...profile,
      branches: updatedBranches,
      reputation: (profile.reputation ?? 0) + 20,
    },
    [
      ledgerEntry(
        profile,
        'expense',
        upgradeCost,
        `ترقية الفرع: ${branch.name} إلى المستوى ${nextLevel}`,
        0
      ),
    ],
    payment.bankBalance,
    { diamonds: payment.diamonds }
  );

  return success(
    syncTasks(nextProfile),
    `تمت ترقية ${branch.name} بنجاح إلى المستوى ${nextLevel}! زادت كفاءة وعائدات الفرع.`,
    {
      branchId,
      newLevel: nextLevel,
      cost: upgradeCost,
    }
  );
}

/**
 * Establishes a new retail shop on an owned commercial plot
 */
export function establishRetailShop(
  profile: PlayerProfile,
  shopType: RetailShopType,
  plotId: string,
  shopName: string,
  companyId?: string,
  paymentMethod: PurchasePaymentMethod = 'cash'
): GameResult<{ shopId: string; plotId: string; durationSeconds: number; cost: number }> {
  const lockKey = `shop-create-${plotId}`;
  if (!acquireTransactionLock(lockKey)) {
    return failure(profile, 'condition-not-met', 'تجري عملية إنشاء متجر أخرى حالياً. يرجى الانتظار.');
  }

  try {
    const spec = findShopSpec(shopType);
    if (!spec) {
      return failure(profile, 'not-found', 'نوع المتجر التجاري غير صالح.');
    }

    if (profile.level < spec.requiredPlayerLevel) {
      return failure(
        profile,
        'condition-not-met',
        `يتطلب فتح هذا المتجر رتبة لاعب مستوى ${spec.requiredPlayerLevel} أو أعلى.`
      );
    }

    const existingBranchOnPlot = (profile.branches ?? []).find((b) => b.plotId === plotId);
    const existingShopOnPlot = (profile.shops ?? []).find((s) => s.plotId === plotId);
    if (existingBranchOnPlot || existingShopOnPlot) {
      return failure(profile, 'condition-not-met', 'هذا الموقع مشغول بالفعل بفرع أو متجر آخر.');
    }

    const land = (profile.lands ?? []).find((l) => l.plotId === plotId || l.id === plotId);
    if (!land) {
      return failure(profile, 'land-required', 'يجب شراء الأرض أولاً لتشييد المتجر التجاري عليها.');
    }

    const readyDay = land.availableForCompanyOnDay ?? land.acquiredOnDay ?? profile.day;
    if (readyDay > profile.day) {
      return failure(profile, 'condition-not-met', `الأرض ما زالت في مرحلة إنهاء عقود الملكية (ستكتمل في اليوم ${readyDay}).`);
    }

    let linkedCompany = undefined;
    if (companyId) {
      linkedCompany = (profile.companies ?? []).find((c) => c.id === companyId);
    }

    const cost = spec.setupCost;
    const payment = resolvePurchaseDebit(profile, cost, paymentMethod);
    if ('message' in payment) {
      return failure(profile, 'insufficient-funds', `لا تكفي الأموال لإنشاء المتجر. ${payment.message}`);
    }

    const durationSeconds = 18;
    const shopId = generateUniqueId('shop');
    const finalShopName = shopName.trim() || `${spec.title} - فرع المدينة`;

    const newShop: RetailShop = {
      id: shopId,
      name: finalShopName,
      shopType,
      companyId: linkedCompany?.id,
      parentCompanyName: linkedCompany?.name,
      plotId,
      landId: land.id,
      level: 1,
      status: 'constructing',
      shelfCapacity: spec.shelfBaseCapacity,
      inventory: [],
      linkedFactoryIds: linkedCompany ? [linkedCompany.id] : [],
      establishedOnDay: profile.day,
      establishedAt: timestampFor(profile),
      dailyOperatingCost: Math.round(cost * 0.015),
      performance: {
        totalSalesRevenue: 0,
        totalCostOfGoods: 0,
        totalProfit: 0,
        totalUnitsSold: 0,
      },
    };

    const existingConstructions = loadCityConstructions(profile);
    const newJob: CityConstructionState = {
      plotId,
      landId: land.id,
      companyId: linkedCompany?.id,
      industryId: spec.compatibleIndustries[0] || 'food',
      companyName: finalShopName,
      startedAt: Date.now(),
      durationMs: durationSeconds * 1000,
      costCash: cost,
      costDiamonds: payment.diamondsSpent,
      status: 'clearing',
    };
    const updatedConstructions = { ...existingConstructions, [plotId]: newJob };
    saveCityConstructions(updatedConstructions, profile);

    const nextProfile = addLedger(
      {
        ...profile,
        shops: [...(profile.shops ?? []), newShop],
        cityConstructions: updatedConstructions,
        reputation: (profile.reputation ?? 0) + 12,
      },
      [
        ledgerEntry(
          profile,
          'expense',
          cost,
          `إنشاء متجر تجاري: ${finalShopName} (${spec.title})`,
          0
        ),
      ],
      payment.bankBalance,
      { diamonds: payment.diamonds }
    );

    return success(
      syncTasks(nextProfile),
      `تم إنشاء ${finalShopName} بنجاح! بدأت أعمال التشييد وتكتمل خلال ${durationSeconds} ثانية.`,
      {
        shopId,
        plotId,
        durationSeconds,
        cost,
      }
    );
  } finally {
    releaseTransactionLock(lockKey);
  }
}

/**
 * Upgrades a retail shop level
 */
export function upgradeRetailShop(
  profile: PlayerProfile,
  shopId: string,
  paymentMethod: PurchasePaymentMethod = 'cash'
): GameResult<{ shopId: string; newLevel: number; newCapacity: number; cost: number }> {
  const shop = (profile.shops ?? []).find((s) => s.id === shopId);
  if (!shop) return failure(profile, 'not-found', 'المتجر غير موجود.');

  if (shop.level >= 5) {
    return failure(profile, 'condition-not-met', 'وصل المتجر إلى أقصى مستوى تطوير (المستوى 5).');
  }

  const spec = findShopSpec(shop.shopType);
  const baseCap = spec?.shelfBaseCapacity ?? 150;
  const nextLevel = shop.level + 1;
  const upgradeCost = 6500 * shop.level;

  const payment = resolvePurchaseDebit(profile, upgradeCost, paymentMethod);
  if ('message' in payment) {
    return failure(profile, 'insufficient-funds', `لا تكفي الأموال لترقية المتجر. ${payment.message}`);
  }

  const newCapacity = baseCap * nextLevel;
  const updatedShops = (profile.shops ?? []).map((s) =>
    s.id === shopId
      ? {
          ...s,
          level: nextLevel,
          shelfCapacity: newCapacity,
          dailyOperatingCost: Math.round(s.dailyOperatingCost * 1.3),
        }
      : s
  );

  const nextProfile = addLedger(
    {
      ...profile,
      shops: updatedShops,
      reputation: (profile.reputation ?? 0) + 15,
    },
    [
      ledgerEntry(
        profile,
        'expense',
        upgradeCost,
        `ترقية وتوسعة المتجر التجاري: ${shop.name} للمستوى ${nextLevel}`,
        0
      ),
    ],
    payment.bankBalance,
    { diamonds: payment.diamonds }
  );

  return success(
    syncTasks(nextProfile),
    `تمت ترقية ${shop.name} بنجاح إلى المستوى ${nextLevel}! زادت سعة الرفوف إلى ${newCapacity} وحدة.`,
    {
      shopId,
      newLevel: nextLevel,
      newCapacity,
      cost: upgradeCost,
    }
  );
}

/**
 * Links a retail shop to an existing factory for supply line
 */
export function linkShopToFactory(
  profile: PlayerProfile,
  shopId: string,
  factoryCompanyId: string
): GameResult<{ shopId: string; factoryId: string }> {
  const shop = (profile.shops ?? []).find((s) => s.id === shopId);
  if (!shop) return failure(profile, 'not-found', 'المتجر غير موجود.');

  const factory = (profile.companies ?? []).find((c) => c.id === factoryCompanyId);
  if (!factory) return failure(profile, 'not-found', 'المصنع المحدد غير موجود.');

  const spec = findShopSpec(shop.shopType);
  if (spec && !spec.compatibleIndustries.includes(factory.industryId)) {
    const industryInfo = findIndustry(factory.industryId);
    return failure(
      profile,
      'condition-not-met',
      `هذا المصنع (${industryInfo?.name ?? factory.industryId}) غير متوافق مع نشاط ${spec.title}.`
    );
  }

  if (shop.linkedFactoryIds.includes(factoryCompanyId)) {
    return failure(profile, 'already-owned', 'المتجر مرتبط بالفعل بهذا المصنع.');
  }

  const updatedShops = (profile.shops ?? []).map((s) =>
    s.id === shopId
      ? {
          ...s,
          linkedFactoryIds: [...s.linkedFactoryIds, factoryCompanyId],
          companyId: s.companyId || factoryCompanyId,
          parentCompanyName: s.parentCompanyName || factory.name,
        }
      : s
  );

  return success(
    { ...profile, shops: updatedShops },
    `تم ربط المتجر ${shop.name} بخط إمداد المصنع ${factory.name} بنجاح!`,
    { shopId, factoryId: factoryCompanyId }
  );
}

/**
 * Transfers product items from warehouse inventory (profile.inventory) to retail shop shelves (shop.inventory).
 */
export function transferStockToShop(
  profile: PlayerProfile,
  shopId: string,
  productId: string,
  quantity: number
): GameResult<{ shopId: string; productId: string; transferredQuantity: number }> {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return failure(profile, 'invalid-input', 'كمية النقل يجب أن تكون عدداً صحيحاً أكبر من الصفر.');
  }

  const shop = (profile.shops ?? []).find((s) => s.id === shopId);
  if (!shop) return failure(profile, 'not-found', 'المتجر غير موجود.');

  const spec = findShopSpec(shop.shopType);
  if (spec && !spec.compatibleProductIds.includes(productId)) {
    return failure(
      profile,
      'condition-not-met',
      `هذا المنتج غير مسموح ببيعه في ${spec.title}.`
    );
  }

  const warehouseLot = (profile.inventory ?? []).find(
    (item) => item.materialOrProductId === productId
  );
  if (!warehouseLot || warehouseLot.quantity < quantity) {
    const available = warehouseLot ? warehouseLot.quantity : 0;
    return failure(
      profile,
      'insufficient-materials',
      `المخزون المتاح في المستودع غير كافٍ. المتوفر حالياً: ${available} وحدة.`
    );
  }

  const currentShelfLoad = (shop.inventory ?? []).reduce(
    (acc, item) => acc + item.quantity,
    0
  );
  if (currentShelfLoad + quantity > shop.shelfCapacity) {
    const remainingSpace = Math.max(0, shop.shelfCapacity - currentShelfLoad);
    return failure(
      profile,
      'storage-limit',
      `سعة أرفف المتجر لا تكفي. المساحة الشاغرة: ${remainingSpace} وحدة فقط (السعة الكلية: ${shop.shelfCapacity}).`
    );
  }

  const productCatalogEntry = PRODUCT_CATALOG.find((p) => p.id === productId);
  const productName = productCatalogEntry?.name || productId;
  const unit = productCatalogEntry?.unit || warehouseLot.unit || 'وحدة';
  const unitCost = warehouseLot.unitCost;
  const retailPrice = Math.round((productCatalogEntry?.baseSellPrice || 100) * (spec?.retailMarkup || 1.25));

  const nextWarehouseInventory = profile.inventory
    .map((lot) =>
      lot.materialOrProductId === productId
        ? { ...lot, quantity: lot.quantity - quantity }
        : lot
    )
    .filter((lot) => lot.quantity > 0);

  const existingShelfItem = (shop.inventory ?? []).find((i) => i.productId === productId);
  let nextShopInventory: RetailShopItem[];

  if (existingShelfItem) {
    nextShopInventory = shop.inventory.map((i) =>
      i.productId === productId
        ? {
            ...i,
            quantity: i.quantity + quantity,
            unitCost: Math.round(((i.unitCost * i.quantity) + (unitCost * quantity)) / (i.quantity + quantity)),
            retailPrice,
          }
        : i
    );
  } else {
    nextShopInventory = [
      ...(shop.inventory ?? []),
      {
        productId,
        productName,
        quantity,
        unit,
        unitCost,
        retailPrice,
        totalSold: 0,
        totalRevenue: 0,
      },
    ];
  }

  const updatedShops = (profile.shops ?? []).map((s) =>
    s.id === shopId ? { ...s, inventory: nextShopInventory } : s
  );

  const nextProfile: PlayerProfile = {
    ...profile,
    inventory: nextWarehouseInventory,
    shops: updatedShops,
  };

  return success(
    nextProfile,
    `تم نقل ${quantity} ${unit} من (${productName}) إلى أرفف ${shop.name} بنجاح!`,
    {
      shopId,
      productId,
      transferredQuantity: quantity,
    }
  );
}

/**
 * Sells products directly from retail shop shelves to customers.
 */
export function sellFromRetailShop(
  profile: PlayerProfile,
  shopId: string,
  productId: string,
  quantity: number
): GameResult<{
  shopId: string;
  productId: string;
  quantity: number;
  grossRevenue: number;
  costOfGoods: number;
  tax: number;
  netProfit: number;
}> {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return failure(profile, 'invalid-input', 'كمية البيع يجب أن تكون عدداً صحيحاً أكبر من الصفر.');
  }

  const shop = (profile.shops ?? []).find((s) => s.id === shopId);
  if (!shop) return failure(profile, 'not-found', 'المتجر غير موجود.');

  if (shop.status === 'constructing') {
    return failure(profile, 'condition-not-met', 'المتجر ما زال قيد الإنشاء ولا يمكن بدء البيع بعد.');
  }

  const shelfItem = (shop.inventory ?? []).find((i) => i.productId === productId);
  if (!shelfItem || shelfItem.quantity < quantity) {
    const available = shelfItem ? shelfItem.quantity : 0;
    return failure(
      profile,
      'insufficient-materials',
      `الكمية المعروضة على أرفف المتجر غير كافية. المتوفر: ${available} وحدة.`
    );
  }

  const grossRevenue = Math.round(quantity * shelfItem.retailPrice);
  const costOfGoods = Math.round(quantity * shelfItem.unitCost);
  const taxRate = 0.08;
  const tax = Math.round(grossRevenue * taxRate);
  const netProfit = grossRevenue - costOfGoods - tax;

  const nextShopInventory = shop.inventory
    .map((item) =>
      item.productId === productId
        ? {
            ...item,
            quantity: item.quantity - quantity,
            totalSold: item.totalSold + quantity,
            totalRevenue: item.totalRevenue + grossRevenue,
          }
        : item
    )
    .filter((item) => item.quantity > 0);

  const updatedPerformance = {
    totalSalesRevenue: shop.performance.totalSalesRevenue + grossRevenue,
    totalCostOfGoods: shop.performance.totalCostOfGoods + costOfGoods,
    totalProfit: shop.performance.totalProfit + netProfit,
    totalUnitsSold: shop.performance.totalUnitsSold + quantity,
  };

  const updatedShops = (profile.shops ?? []).map((s) =>
    s.id === shopId
      ? {
          ...s,
          inventory: nextShopInventory,
          performance: updatedPerformance,
        }
      : s
  );

  const nextProfile = addLedger(
    {
      ...profile,
      shops: updatedShops,
      finances: {
        ...profile.finances,
        totalRevenue: profile.finances.totalRevenue + grossRevenue,
        totalExpenses: profile.finances.totalExpenses + costOfGoods + tax,
        netProfit: profile.finances.netProfit + netProfit,
      },
    },
    [
      ledgerEntry(
        profile,
        'revenue',
        grossRevenue,
        `مبيعات تجزئة: بيع ${quantity} ${shelfItem.unit} من ${shelfItem.productName} في ${shop.name}`,
        0
      ),
      ledgerEntry(profile, 'expense', tax, `ضريبة مبيعات تجزئة: ${shop.name}`, 1),
      ledgerEntry(profile, 'expense', costOfGoods, `تكلفة بضاعة مباعة: ${shelfItem.productName}`, 2),
    ],
    profile.bankBalance + grossRevenue - tax
  );

  return success(
    syncTasks(nextProfile),
    `تم بيع ${quantity} ${shelfItem.unit} من (${shelfItem.productName}) بنجاح! الإيراد: ${grossRevenue.toLocaleString('ar-EG')} $ (صافي الربح: ${netProfit.toLocaleString('ar-EG')} $).`,
    {
      shopId,
      productId,
      quantity,
      grossRevenue,
      costOfGoods,
      tax,
      netProfit,
    }
  );
}

/**
 * Returns scannable analytical reports comparing branches and shops
 */
export function getBranchAndShopReports(profile: PlayerProfile): {
  totalBranches: number;
  totalShops: number;
  totalRetailRevenue: number;
  totalUnitsSold: number;
  totalShelfInventoryValue: number;
  bestPerformingShop?: RetailShop;
  bestPerformingBranch?: CompanyBranch;
} {
  const branches = profile.branches ?? [];
  const shops = profile.shops ?? [];

  const totalRetailRevenue = shops.reduce(
    (acc, s) => acc + (s.performance?.totalSalesRevenue || 0),
    0
  );
  const totalUnitsSold = shops.reduce(
    (acc, s) => acc + (s.performance?.totalUnitsSold || 0),
    0
  );
  const totalShelfInventoryValue = shops.reduce(
    (acc, s) =>
      acc +
      (s.inventory ?? []).reduce(
        (sub, i) => sub + (i.quantity || 0) * (i.unitCost || 0),
        0
      ),
    0
  );

  let bestPerformingShop: RetailShop | undefined;
  let maxShopProfit = -1;
  for (const shop of shops) {
    if (shop.performance?.totalProfit > maxShopProfit) {
      maxShopProfit = shop.performance.totalProfit;
      bestPerformingShop = shop;
    }
  }

  let bestPerformingBranch: CompanyBranch | undefined;
  let maxBranchLevel = 0;
  for (const branch of branches) {
    if (branch.level > maxBranchLevel) {
      maxBranchLevel = branch.level;
      bestPerformingBranch = branch;
    }
  }

  return {
    totalBranches: branches.length,
    totalShops: shops.length,
    totalRetailRevenue,
    totalUnitsSold,
    totalShelfInventoryValue,
    bestPerformingShop,
    bestPerformingBranch,
  };
}
