import type { FinanceLedgerEntry } from '../domain/futureSystems';
import type { PlayerProfile } from '../domain/player';

export const STARTING_GOLD_BALANCE = 10_000;
export const STARTING_DIAMONDS_BALANCE = 0;

export const BUILDING_UPGRADE_BASE_COSTS = {
  company: 2_000,
  land: 1_500,
  branch: 2_500,
  shop: 2_000,
  hq: 10_000,
} as const;

export const BUILDING_MAINTENANCE_COST = 10;
export const BUILDING_MAINTENANCE_INTERVAL_MS = 60_000;

export const ECONOMY_BALANCE = {
  operatingCostGrowthPerDay: 0.0015,
  operatingCostGrowthCap: 0.35,
  marketPriceGrowthPerDay: 0.0008,
  marketPriceGrowthCap: 0.25,
} as const;

/**
 * Exponential building upgrade cost formula:
 * cost = baseCost * Math.pow(1.5, currentLevel)
 */
export function calculateBuildingUpgradeCost(baseCost: number, currentLevel: number): number {
  const safeLevel = Math.max(0, currentLevel);
  return Math.round(baseCost * Math.pow(1.5, safeLevel));
}

export function getOwnedBuildingsCount(profile: PlayerProfile): number {
  return (
    (profile.companies?.length ?? 0) +
    (profile.branches?.length ?? 0) +
    (profile.shops?.length ?? 0)
  );
}

let maintenanceSequence = 0;

/**
 * Deducts periodic maintenance cost (default 10 gold per owned building every 60s)
 * from the player's balance and records a valid expense entry in the ledger.
 */
export function applyBuildingMaintenance(
  profile: PlayerProfile,
  costPerBuilding: number = BUILDING_MAINTENANCE_COST,
  now: Date = new Date()
): { profile: PlayerProfile; deducted: number; buildingCount: number } {
  const buildingCount = getOwnedBuildingsCount(profile);
  if (buildingCount <= 0 || profile.bankBalance <= 0 || costPerBuilding <= 0) {
    return { profile, deducted: 0, buildingCount };
  }

  const rawMaintenanceCost = Math.round(buildingCount * costPerBuilding);
  const deducted = Math.min(profile.bankBalance, rawMaintenanceCost);
  if (deducted <= 0) {
    return { profile, deducted: 0, buildingCount };
  }

  maintenanceSequence += 1;
  const entry: FinanceLedgerEntry = {
    id: `maint-${profile.day}-${(profile.ledger?.length ?? 0) + 1}-${now.getTime()}-${maintenanceSequence}`,
    category: 'expense',
    amount: deducted,
    countryId: profile.countryId,
    occurredAt: now.toISOString(),
    note: `مصاريف صيانة دورية للمباني (${buildingCount} مبنى)`,
  };

  const ledger = [...(profile.ledger ?? []), entry];
  const totalRevenue = ledger
    .filter((item) => item.category === 'revenue')
    .reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = ledger
    .filter((item) => item.category === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  const nextProfile: PlayerProfile = {
    ...profile,
    bankBalance: Math.max(0, profile.bankBalance - deducted),
    ledger,
    finances: {
      netProfit: totalRevenue - totalExpenses,
      totalRevenue,
      totalExpenses,
    },
  };

  return { profile: nextProfile, deducted, buildingCount };
}

export function getOperatingCostProgression(day: number): number {
  return 1 + Math.min(ECONOMY_BALANCE.operatingCostGrowthCap, Math.max(0, day - 1) * ECONOMY_BALANCE.operatingCostGrowthPerDay);
}

export function getMarketPriceProgression(day: number): number {
  return 1 + Math.min(ECONOMY_BALANCE.marketPriceGrowthCap, Math.max(0, day - 1) * ECONOMY_BALANCE.marketPriceGrowthPerDay);
}

/** Return rates are monthly simulation rates, prorated over the investment duration. */
export function getInvestmentPayoutRate(returnRate: number, durationDays: number): number {
  return returnRate * durationDays / 30;
}
