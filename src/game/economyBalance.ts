export const ECONOMY_BALANCE = {
  operatingCostGrowthPerDay: 0.0015,
  operatingCostGrowthCap: 0.35,
  marketPriceGrowthPerDay: 0.0008,
  marketPriceGrowthCap: 0.25,
} as const;

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
