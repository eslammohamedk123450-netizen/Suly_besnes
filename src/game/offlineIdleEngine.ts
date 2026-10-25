import type { PlayerProfile } from '../domain/player';
import type { InventoryLot, FinanceLedgerEntry } from '../domain/futureSystems';
import { getWarehouseCapacity, getWarehouseUsage, normalizeWarehouseLevel } from './warehouse';

export interface OfflineProducedGood {
  productId: string;
  name: string;
  quantity: number;
  icon: string;
  value: number;
}

export interface OfflineIdleReport {
  elapsedSeconds: number;
  elapsedHours: number;
  goodsProduced: OfflineProducedGood[];
  passiveDividends: number;
  bankInterestEarned: number;
  operatingExpensesDeducted: number;
  netCashChange: number;
  urgentObligationsCount: number;
  isTampered: boolean;
  tamperMessage?: string;
  calculatedAt: string;
}

const STORAGE_KEY_PREFIX = 'suly_offline_last_active_';
const MAX_IDLE_SECONDS = 24 * 60 * 60; // Max 24 hours of idle accrual
const MIN_IDLE_SECONDS = 60; // 1 minute minimum to trigger modal

/**
 * Records the current heartbeat timestamp for the active profile.
 */
export function recordOfflineHeartbeat(profileId: string): void {
  try {
    const now = Date.now();
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${profileId}`, now.toString());
  } catch (e) {
    console.error('Failed to record heartbeat', e);
  }
}

/**
 * Calculates offline progress and returns the report.
 * If simulatedSeconds is provided, overrides the time delta for testing or manual trigger.
 */
export function calculateOfflineIdleProgress(
  profile: PlayerProfile,
  simulatedSeconds?: number
): OfflineIdleReport | null {
  const key = `${STORAGE_KEY_PREFIX}${profile.id}`;
  const now = Date.now();
  let elapsedSeconds = 0;
  let isTampered = false;
  let tamperMessage: string | undefined;

  if (typeof simulatedSeconds === 'number' && simulatedSeconds > 0) {
    elapsedSeconds = Math.min(simulatedSeconds, MAX_IDLE_SECONDS);
  } else {
    const storedStr = localStorage.getItem(key);
    if (!storedStr) {
      // First run or no record, save current and return null
      recordOfflineHeartbeat(profile.id);
      return null;
    }

    const storedTimestamp = parseInt(storedStr, 10);
    if (isNaN(storedTimestamp)) {
      recordOfflineHeartbeat(profile.id);
      return null;
    }

    // Anti-clock tampering: if stored timestamp is in the future compared to now
    if (storedTimestamp > now + 30000) {
      // Clock moved backwards
      isTampered = true;
      tamperMessage = 'تم رصد تغيير في ساعة الجهاز. تم تجميد أرباح الغياب لحماية التوازن المالي.';
      elapsedSeconds = 0;
    } else {
      elapsedSeconds = Math.floor((now - storedTimestamp) / 1000);
      if (elapsedSeconds > MAX_IDLE_SECONDS) {
        // Capped at 24 hours
        elapsedSeconds = MAX_IDLE_SECONDS;
      }
    }
  }

  if (elapsedSeconds < MIN_IDLE_SECONDS && !isTampered) {
    return null;
  }

  const elapsedHours = Number((elapsedSeconds / 3600).toFixed(1));
  const activeFractionOfDays = elapsedSeconds / (24 * 3600);

  // 1. Calculate Factory Production
  const goodsProduced: OfflineProducedGood[] = [];
  const warehouseLvl = normalizeWarehouseLevel(profile.warehouseLevel || 1);
  const totalProductCap = getWarehouseCapacity(warehouseLvl).products;
  const currentUsage = getWarehouseUsage(profile.inventory || [], profile.productionOrders || []).products;
  let availableWarehouseSpace = Math.max(0, totalProductCap - currentUsage);

  const activeCompanies = profile.companies.filter((c) => (c.maintenanceCondition ?? 100) > 20);

  for (const company of activeCompanies) {
    if (availableWarehouseSpace <= 0) break;

    // Rate based on level and maintenance condition
    const level = company.upgradeLevel || 1;
    const conditionFactor = (company.maintenanceCondition ?? 100) / 100;
    const unitsPerHour = Math.max(1, Math.round(level * 3 * conditionFactor));
    const potentialUnits = Math.floor(unitsPerHour * elapsedHours);
    const actualUnits = Math.min(potentialUnits, availableWarehouseSpace, 300);

    if (actualUnits > 0) {
      availableWarehouseSpace -= actualUnits;
      
      let pId = 'product_pack';
      let pName = 'عبوات إنتاج مصنعي';
      let pIcon = '📦';
      let unitVal = 350;

      if (company.industryId === 'food') {
        pId = 'food-pack';
        pName = 'كراتين أغذية معلبة';
        pIcon = '🥫';
        unitVal = 280;
      } else if (company.industryId === 'construction') {
        pId = 'construction_mats';
        pName = 'مواد بناء وحديد تسليح';
        pIcon = '🏗️';
        unitVal = 620;
      } else if (company.industryId === 'electronics') {
        pId = 'electronics';
        pName = 'أجهزة وأنظمة إلكترونية';
        pIcon = '📱';
        unitVal = 1200;
      } else if (company.industryId === 'petroleum') {
        pId = 'refined_fuel';
        pName = 'وقود ومشتقات بترولية';
        pIcon = '⛽';
        unitVal = 950;
      }

      goodsProduced.push({
        productId: pId,
        name: pName,
        quantity: actualUnits,
        icon: pIcon,
        value: actualUnits * unitVal,
      });
    }
  }

  // 2. Bank Interest Earned from Deposits
  const totalDeposits = (profile.banking?.deposits || []).reduce((sum, d) => sum + (d.principal || 0), 0);
  const annualInterestRate = 0.12; // 12% standard annual return
  const dailyInterest = (totalDeposits * annualInterestRate) / 365;
  const bankInterestEarned = Math.round(dailyInterest * activeFractionOfDays);

  // 3. Passive Dividends from Stocks & Investments
  const activeInvestmentsTotal = (profile.investments || []).reduce((sum, inv) => sum + (inv.principal || 0), 0);
  const passiveDividends = Math.round((activeInvestmentsTotal * 0.15 * activeFractionOfDays) / 365);

  // 4. Operating Expenses & Salaries
  const staffCount = profile.staff?.length || 2;
  const dailyWages = staffCount * 1200;
  const companyMaintenance = profile.companies.length * 800;
  const operatingExpensesDeducted = Math.round((dailyWages + companyMaintenance) * activeFractionOfDays);

  // 5. Total Net Cash Change
  const totalGrossGain = bankInterestEarned + passiveDividends;
  const netCashChange = totalGrossGain - operatingExpensesDeducted;

  // 6. Urgent obligations count (loans maturing soon)
  const urgentObligationsCount = (profile.banking?.loans || []).filter(
    (l) => l.status === 'active' && (l.nextPaymentDay - profile.day) <= 2
  ).length;

  return {
    elapsedSeconds,
    elapsedHours,
    goodsProduced,
    passiveDividends,
    bankInterestEarned,
    operatingExpensesDeducted,
    netCashChange,
    urgentObligationsCount,
    isTampered,
    tamperMessage,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Applies the calculated offline report into the player's profile state.
 */
export function applyOfflineReportToProfile(
  profile: PlayerProfile,
  report: OfflineIdleReport
): PlayerProfile {
  // Update timestamp to now
  recordOfflineHeartbeat(profile.id);

  if (report.isTampered) {
    return profile;
  }

  let updatedBalance = Math.max(0, profile.bankBalance + report.netCashChange);

  // Add inventory goods
  const updatedInventory: InventoryLot[] = [...(profile.inventory || [])];
  for (const good of report.goodsProduced) {
    const existingIndex = updatedInventory.findIndex((i) => i.materialOrProductId === good.productId);
    if (existingIndex >= 0) {
      updatedInventory[existingIndex] = {
        ...updatedInventory[existingIndex],
        quantity: updatedInventory[existingIndex].quantity + good.quantity,
      };
    } else {
      updatedInventory.push({
        id: `lot_${Date.now()}_${good.productId}`,
        materialOrProductId: good.productId,
        quantity: good.quantity,
        unit: 'وحدة',
        unitCost: Math.round(good.value / Math.max(1, good.quantity)),
      });
    }
  }

  // Add ledger entry
  const newLedgerItem: FinanceLedgerEntry = {
    id: `idle_${Date.now()}`,
    countryId: profile.countryId,
    category: report.netCashChange >= 0 ? 'revenue' : 'expense',
    amount: Math.abs(report.netCashChange),
    occurredAt: new Date().toISOString(),
    note: `عوائد غياب المدير التنفيذي (${report.elapsedHours} ساعة) - إنتاج واستثمارات`,
  };

  const updatedLedger = [newLedgerItem, ...(profile.ledger || [])].slice(0, 50);

  return {
    ...profile,
    bankBalance: updatedBalance,
    inventory: updatedInventory,
    ledger: updatedLedger,
  };
}
