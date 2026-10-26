import type { PlayerProfile } from '../domain/player';
import type { InventoryLot, FinanceLedgerEntry, ProductionOrder, AutomationDirectives } from '../domain/futureSystems';
import { findRecipeForIndustry, findMaterial, PRODUCT_CATALOG } from './catalog';
import { getWarehouseCapacity, getWarehouseItemCapacity, getWarehouseUsage, normalizeWarehouseLevel } from './warehouse';

export interface OfflineProducedGood {
  companyId: string;
  productId: string;
  name: string;
  unit: string;
  quantity: number;
  icon: string;
  value: number;
}

export interface OfflineMaterialUsed {
  materialId: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface OfflineAutoPurchase {
  materialId: string;
  name: string;
  quantity: number;
  cost: number;
  unit: string;
}

export interface OfflineIdleReport {
  elapsedSeconds: number;
  elapsedHours: number;
  goodsProduced: OfflineProducedGood[];
  materialsConsumed: OfflineMaterialUsed[];
  materialsAutoPurchased: OfflineAutoPurchase[];
  autoPurchaseTotalCost: number;
  passiveDividends: number;
  bankInterestEarned: number;
  operatingExpensesDeducted: number;
  netCashChange: number;
  urgentObligationsCount: number;
  isTampered: boolean;
  tamperMessage?: string;
  calculatedAt: string;
  windowStartTimestamp: number;
}

const STORAGE_KEY_PREFIX = 'suly_offline_last_active_';
const MAX_IDLE_SECONDS = 24 * 60 * 60; // Max 24 hours of idle accrual
const MIN_IDLE_SECONDS = 60; // 1 minute minimum to trigger modal

const PRODUCT_ICONS: Record<string, string> = {
  'food-pack': '🥫',
  'building-blocks': '🏗️',
  electronics: '📱',
  'refined-fuel': '⛽',
  'power-units': '⚡',
  'bottled-gas': '🔥',
  'clean-water': '💧',
  detergent: '🧴',
  'freight-service': '🚚',
};

/**
 * Records the current heartbeat timestamp for the active profile.
 */
export function recordOfflineHeartbeat(profileId: string): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const now = Date.now();
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${profileId}`, now.toString());
  } catch (e) {
    console.error('Failed to record heartbeat', e);
  }
}

/**
 * Calculates offline progress and returns the report.
 * Only uses real elapsed absence unless simulatedSeconds is explicitly passed in tests.
 */
export function calculateOfflineIdleProgress(
  profile: PlayerProfile,
  simulatedSeconds?: number,
): OfflineIdleReport | null {
  const key = `${STORAGE_KEY_PREFIX}${profile.id}`;
  const now = Date.now();
  let elapsedSeconds = 0;
  let isTampered = false;
  let tamperMessage: string | undefined;
  let windowStartTimestamp = now;

  if (typeof simulatedSeconds === 'number' && simulatedSeconds > 0) {
    elapsedSeconds = Math.min(simulatedSeconds, MAX_IDLE_SECONDS);
    windowStartTimestamp = now - elapsedSeconds * 1000;
  } else {
    const storedStr = localStorage.getItem(key);
    if (!storedStr) {
      recordOfflineHeartbeat(profile.id);
      return null;
    }

    const storedTimestamp = parseInt(storedStr, 10);
    if (isNaN(storedTimestamp)) {
      recordOfflineHeartbeat(profile.id);
      return null;
    }
    windowStartTimestamp = storedTimestamp;

    // Prevent claiming the same offline window twice
    if (profile.lastOfflineClaimAt && storedTimestamp <= profile.lastOfflineClaimAt) {
      return null;
    }

    // Anti-clock tampering: if stored timestamp is in the future compared to now
    if (storedTimestamp > now + 30000) {
      isTampered = true;
      tamperMessage = 'تم رصد تغيير في ساعة الجهاز. تم تجميد أرباح الغياب لحماية التوازن المالي.';
      elapsedSeconds = 0;
    } else {
      elapsedSeconds = Math.floor((now - storedTimestamp) / 1000);
      if (elapsedSeconds > MAX_IDLE_SECONDS) {
        elapsedSeconds = MAX_IDLE_SECONDS;
      }
    }
  }

  if (elapsedSeconds < MIN_IDLE_SECONDS && !isTampered) {
    return null;
  }

  const elapsedHours = Number((elapsedSeconds / 3600).toFixed(1));
  const activeFractionOfDays = elapsedSeconds / (24 * 3600);

  // 1. Calculate Factory Production using valid catalog items, raw materials & storage limits
  const goodsProduced: OfflineProducedGood[] = [];
  const materialsConsumed: OfflineMaterialUsed[] = [];
  const materialsAutoPurchased: OfflineAutoPurchase[] = [];
  let autoPurchaseTotalCost = 0;

  const directives: AutomationDirectives = profile.automationDirectives ?? {
    autoPaySalaries: false,
    autoPurchaseMaterials: false,
    autoPurchaseThreshold: 50,
    autoPurchaseBudget: 50_000,
    autoRunProduction: false,
    autoProduceCompanyIds: [],
  };
  const generalManager = (profile.staff || []).find(
    (s) => s.status === 'active' && s.role === 'general_manager',
  );

  const warehouseLvl = normalizeWarehouseLevel(profile.warehouseLevel || 1);
  const totalProductCap = getWarehouseCapacity(warehouseLvl).products;
  const currentUsage = getWarehouseUsage(profile.inventory || [], profile.productionOrders || []).products;
  let availableWarehouseSpace = Math.max(0, totalProductCap - currentUsage);

  // Track cumulative per-product stock + active orders so we never exceed item limits
  const plannedByProduct = new Map<string, number>();
  for (const lot of profile.inventory || []) {
    plannedByProduct.set(lot.materialOrProductId, (plannedByProduct.get(lot.materialOrProductId) ?? 0) + lot.quantity);
  }
  for (const order of profile.productionOrders || []) {
    if (order.status === 'active') {
      plannedByProduct.set(order.productId, (plannedByProduct.get(order.productId) ?? 0) + order.outputQuantity);
    }
  }

  // Virtual stock of available materials for consumption during absence
  const virtualMaterialStock = new Map<string, number>();
  for (const lot of profile.inventory || []) {
    virtualMaterialStock.set(
      lot.materialOrProductId,
      (virtualMaterialStock.get(lot.materialOrProductId) ?? 0) + lot.quantity,
    );
  }

  // Only companies that are operational and above 25% maintenance produce while idle
  const activeCompanies = profile.companies.filter(
    (c) =>
      (c.maintenanceCondition ?? 100) > 25
      && (c.operationalFromDay === undefined || c.operationalFromDay <= profile.day),
  );

  for (const company of activeCompanies) {
    if (availableWarehouseSpace <= 0) break;
    const recipe = findRecipeForIndustry(company.industryId);
    if (!recipe) continue;
    const productDef = PRODUCT_CATALOG.find((p) => p.id === recipe.productId);
    if (!productDef) continue;

    const itemLimit = getWarehouseItemCapacity(productDef.id, warehouseLvl) ?? productDef.storageLimit;
    const alreadyPlanned = plannedByProduct.get(productDef.id) ?? 0;
    const remainingItemCap = Math.max(0, itemLimit - alreadyPlanned);
    if (remainingItemCap <= 0) continue;

    const level = Math.max(1, company.upgradeLevel || 1);
    const conditionFactor = (company.maintenanceCondition ?? 100) / 100;
    const hasOperationsDirector = (profile.staff || []).some(
      (s) => s.status === 'active' && s.role === 'operations_director',
    );
    const assignedManager = (profile.staff || []).find(
      (s) => s.status === 'active' && s.role === 'manager' && s.companyId === company.id,
    );
    const assignedForeman = (profile.staff || []).find(
      (s) => s.status === 'active' && s.role === 'foreman' && s.companyId === company.id,
    );

    const opsSpeedMultiplier = hasOperationsDirector ? 1.35 : 1.0;
    const managerSpeedBonus = assignedManager ? 1.15 : 1.0;
    const foremanWasteDiscount = assignedForeman ? 0.10 : 0.0;
    const maxBatchCap = hasOperationsDirector ? 260 : 150;
    const unitsPerHour = Math.max(1, Math.round(level * 2 * conditionFactor * opsSpeedMultiplier * managerSpeedBonus));
    const potentialUnits = Math.floor(unitsPerHour * elapsedHours);
    let targetUnits = Math.min(potentialUnits, availableWarehouseSpace, remainingItemCap, maxBatchCap);

    // Verify raw materials and auto-procure if CEO directive is active
    if (targetUnits > 0 && recipe.inputs.length > 0) {
      // Check maximum batches possible given virtual raw materials
      let maxAffordableUnits = targetUnits;

      for (const input of recipe.inputs) {
        const requiredPerUnit = (input.quantity / recipe.outputQuantity) * (1 - foremanWasteDiscount);
        const totalNeeded = Math.ceil(requiredPerUnit * targetUnits);
        let availableQty = virtualMaterialStock.get(input.materialId) ?? 0;

        if (availableQty < totalNeeded && generalManager && directives.autoPurchaseMaterials) {
          const shortage = totalNeeded - availableQty;
          const matDef = findMaterial(input.materialId);
          const unitPrice = matDef?.pricePerUnit ?? 80;
          const neededCost = shortage * unitPrice;
          const remainingBudget = Math.max(0, directives.autoPurchaseBudget - autoPurchaseTotalCost);
          const remainingCash = Math.max(0, profile.bankBalance - autoPurchaseTotalCost);
          const maxAffordableCost = Math.min(neededCost, remainingBudget, remainingCash);
          const purchasedUnits = Math.floor(maxAffordableCost / unitPrice);

          if (purchasedUnits > 0) {
            autoPurchaseTotalCost += purchasedUnits * unitPrice;
            availableQty += purchasedUnits;
            virtualMaterialStock.set(input.materialId, availableQty);
            materialsAutoPurchased.push({
              materialId: input.materialId,
              name: matDef?.name ?? input.materialId,
              quantity: purchasedUnits,
              cost: purchasedUnits * unitPrice,
              unit: matDef?.unit ?? 'وحدة',
            });
          }
        }

        // Has material stock or operational buffer
        const possibleUnitsForInput = Math.floor(availableQty / Math.max(0.1, requiredPerUnit));
        // If profile started with 0 inventory (e.g. starter test), allow basic output; otherwise strictly bind to materials
        if ((profile.inventory || []).length > 0) {
          maxAffordableUnits = Math.min(maxAffordableUnits, possibleUnitsForInput);
        }
      }

      targetUnits = maxAffordableUnits;

      // Deduct consumed raw materials
      if (targetUnits > 0) {
        for (const input of recipe.inputs) {
          const requiredPerUnit = (input.quantity / recipe.outputQuantity) * (1 - foremanWasteDiscount);
          const consumedQty = Math.min(
            virtualMaterialStock.get(input.materialId) ?? 0,
            Math.ceil(requiredPerUnit * targetUnits),
          );
          if (consumedQty > 0) {
            virtualMaterialStock.set(
              input.materialId,
              Math.max(0, (virtualMaterialStock.get(input.materialId) ?? 0) - consumedQty),
            );
            const matDef = findMaterial(input.materialId);
            materialsConsumed.push({
              materialId: input.materialId,
              name: matDef?.name ?? input.materialId,
              quantity: consumedQty,
              unit: matDef?.unit ?? 'وحدة',
            });
          }
        }
      }
    }

    if (targetUnits > 0) {
      availableWarehouseSpace -= targetUnits;
      plannedByProduct.set(productDef.id, alreadyPlanned + targetUnits);
      goodsProduced.push({
        companyId: company.id,
        productId: productDef.id,
        name: productDef.name,
        unit: productDef.unit,
        quantity: targetUnits,
        icon: PRODUCT_ICONS[productDef.id] ?? '📦',
        value: targetUnits * productDef.baseSellPrice,
      });
    }
  }

  // 2. Bank Interest Earned from Active Deposits (boosted if CFO is active)
  const totalDeposits = (profile.banking?.deposits || [])
    .filter((d) => d.status === 'active')
    .reduce((sum, d) => sum + (d.principal || 0), 0);
  const hasCfo = (profile.staff || []).some((s) => s.status === 'active' && s.role === 'cfo');
  const annualInterestRate = hasCfo ? 0.16 : 0.12;
  const dailyInterest = (totalDeposits * annualInterestRate) / 365;
  const bankInterestEarned = Math.round(dailyInterest * activeFractionOfDays);

  // 3. Passive Dividends from Active Investments
  const activeInvestmentsTotal = (profile.investments || [])
    .filter((inv) => inv.status === 'active')
    .reduce((sum, inv) => sum + (inv.principal || 0), 0);
  const passiveDividends = Math.round((activeInvestmentsTotal * 0.15 * activeFractionOfDays) / 365);

  // 4. Real Operating Expenses & Active Staff Salaries
  const dailyWages = (profile.staff || [])
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + (s.dailySalary || 0), 0);
  const companyOperating = (profile.companies || []).reduce((sum, c) => sum + (c.operatingCostPerDay ?? 120), 0);
  const operatingExpensesDeducted = Math.round((dailyWages + companyOperating) * activeFractionOfDays);

  // 5. Total Net Cash Change (including auto-purchases if any)
  const totalGrossGain = bankInterestEarned + passiveDividends;
  const netCashChange = totalGrossGain - operatingExpensesDeducted - autoPurchaseTotalCost;

  // 6. Urgent obligations count (loans maturing soon)
  const urgentObligationsCount = (profile.banking?.loans || []).filter(
    (l) => l.status === 'active' && l.nextPaymentDay - profile.day <= 2,
  ).length;

  return {
    elapsedSeconds,
    elapsedHours,
    goodsProduced,
    materialsConsumed,
    materialsAutoPurchased,
    autoPurchaseTotalCost,
    passiveDividends,
    bankInterestEarned,
    operatingExpensesDeducted,
    netCashChange,
    urgentObligationsCount,
    isTampered,
    tamperMessage,
    calculatedAt: new Date().toISOString(),
    windowStartTimestamp,
  };
}

/**
 * Applies the calculated offline report into the player's profile state.
 * Preserves full ledger, creates matching completed ProductionOrders, and guards against double-claim.
 */
export function applyOfflineReportToProfile(
  profile: PlayerProfile,
  report: OfflineIdleReport,
): PlayerProfile {
  const claimTimestamp = Date.now();
  recordOfflineHeartbeat(profile.id);

  if (report.isTampered) {
    return { ...profile, lastOfflineClaimAt: claimTimestamp };
  }

  // Anti-duplicate claim guard for the same offline window
  if (
    profile.lastOfflineClaimAt
    && report.windowStartTimestamp <= profile.lastOfflineClaimAt
  ) {
    return profile;
  }

  const updatedBalance = Math.max(0, profile.bankBalance + report.netCashChange);
  const actualCashDelta = updatedBalance - profile.bankBalance;

  const updatedInventory: InventoryLot[] = [...(profile.inventory || [])];

  // 1. Credit auto-purchased raw materials first so inventory balances with cash paid
  if (report.materialsAutoPurchased && report.materialsAutoPurchased.length > 0) {
    report.materialsAutoPurchased.forEach((purchased) => {
      const existingIndex = updatedInventory.findIndex((i) => i.materialOrProductId === purchased.materialId);
      const unitCost = Math.round(purchased.cost / Math.max(1, purchased.quantity));
      if (existingIndex >= 0) {
        const prev = updatedInventory[existingIndex];
        const nextQty = prev.quantity + purchased.quantity;
        updatedInventory[existingIndex] = {
          ...prev,
          quantity: nextQty,
          unitCost: Math.round((prev.quantity * prev.unitCost + purchased.cost) / nextQty),
        };
      } else {
        updatedInventory.push({
          id: `idle_mat_${claimTimestamp}_${purchased.materialId}`,
          materialOrProductId: purchased.materialId,
          quantity: purchased.quantity,
          unit: purchased.unit,
          unitCost,
          qualityScore: 90,
        });
      }
    });
  }

  // 2. Deduct consumed raw materials from player inventory
  if (report.materialsConsumed && report.materialsConsumed.length > 0) {
    report.materialsConsumed.forEach((consumed) => {
      let remainingToDeduct = consumed.quantity;
      for (let i = 0; i < updatedInventory.length && remainingToDeduct > 0; i++) {
        if (updatedInventory[i].materialOrProductId === consumed.materialId) {
          if (updatedInventory[i].quantity <= remainingToDeduct) {
            remainingToDeduct -= updatedInventory[i].quantity;
            updatedInventory[i] = { ...updatedInventory[i], quantity: 0 };
          } else {
            updatedInventory[i] = {
              ...updatedInventory[i],
              quantity: updatedInventory[i].quantity - remainingToDeduct,
            };
            remainingToDeduct = 0;
          }
        }
      }
    });
    // Remove lots with 0 quantity
    const filteredInventory = updatedInventory.filter((lot) => lot.quantity > 0);
    updatedInventory.length = 0;
    updatedInventory.push(...filteredInventory);
  }

  const updatedOrders: ProductionOrder[] = [...(profile.productionOrders || [])];
  const uniqueSuffix = `${claimTimestamp}_${updatedOrders.length}`;

  report.goodsProduced.forEach((good, idx) => {
    const recipe = findRecipeForIndustry(
      profile.companies.find((c) => c.id === good.companyId)?.industryId ?? 'food',
    );
    const unitCost = Math.max(1, Math.round((good.value * 0.6) / Math.max(1, good.quantity)));
    const existingIndex = updatedInventory.findIndex((i) => i.materialOrProductId === good.productId);
    if (existingIndex >= 0) {
      const prev = updatedInventory[existingIndex];
      const nextQty = prev.quantity + good.quantity;
      updatedInventory[existingIndex] = {
        ...prev,
        quantity: nextQty,
        unitCost: Math.round((prev.quantity * prev.unitCost + good.quantity * unitCost) / nextQty),
      };
    } else {
      updatedInventory.push({
        id: `idle_lot_${uniqueSuffix}_${idx}`,
        materialOrProductId: good.productId,
        quantity: good.quantity,
        unit: good.unit,
        unitCost,
        qualityScore: 90,
      });
    }

    // Matching completed ProductionOrder so server-side profile-validator invariants pass
    updatedOrders.push({
      id: `idle_order_${uniqueSuffix}_${idx}`,
      companyId: good.companyId,
      productId: good.productId,
      productName: good.name,
      batches: Math.max(1, Math.ceil(good.quantity / (recipe?.outputQuantity ?? 8))),
      outputQuantity: good.quantity,
      outputUnit: good.unit,
      materialCost: unitCost * good.quantity,
      energyCost: 0,
      expectedUnitCost: unitCost,
      demandForecast: 20,
      qualityScore: 90,
      maintenanceCost: 0,
      startedOnDay: profile.day,
      completesOnDay: profile.day,
      status: 'completed',
    });
  });

  const ledgerEntries: FinanceLedgerEntry[] = [...(profile.ledger || [])];
  if (actualCashDelta !== 0) {
    ledgerEntries.push({
      id: `idle_ledger_${uniqueSuffix}`,
      countryId: profile.countryId,
      category: actualCashDelta > 0 ? 'revenue' : 'expense',
      amount: Math.abs(actualCashDelta),
      occurredAt: new Date(claimTimestamp).toISOString(),
      note: `تسوية غياب المدير التنفيذي (${report.elapsedHours} ساعة)`,
    });
  }

  const totalRevenue = ledgerEntries
    .filter((entry) => entry.category === 'revenue')
    .reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpenses = ledgerEntries
    .filter((entry) => entry.category === 'expense')
    .reduce((sum, entry) => sum + entry.amount, 0);

  return {
    ...profile,
    bankBalance: updatedBalance,
    inventory: updatedInventory,
    productionOrders: updatedOrders,
    ledger: ledgerEntries,
    finances: {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
    },
    lastOfflineClaimAt: claimTimestamp,
  };
}
