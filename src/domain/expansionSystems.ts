export interface TerritoryRegion {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
  totalMarketValue: number;
  unlockedLevel: number;
  hubsCount: number;
  playerMarketShare: number; // 0 - 100
  hourlyTaxYield: number; // Passive revenue per hour
  unlocked: boolean;
  conquestCost: number;
  hubUpgradeCost: number;
  regionBonusTitle: string;
  regionBonusDescription: string;
}

export interface TechNode {
  id: string;
  title: string;
  description: string;
  category: 'automation' | 'logistics' | 'marketing' | 'finance';
  icon: string;
  costMoney: number;
  costDiamonds: number;
  prerequisites: string[];
  boostDescription: string;
  boostType: 'auto_collect' | 'production_speed' | 'cost_reduction' | 'revenue_multiplier' | 'stock_yield';
  boostValue: number; // e.g. 0.15 for 15%
}

export interface LuxuryAsset {
  id: string;
  name: string;
  category: 'hypercar' | 'private_jet' | 'yacht' | 'mansion' | 'art_watches';
  categoryLabel: string;
  icon: string;
  price: number;
  prestigePoints: number;
  dailyMaintenance: number;
  description: string;
  vipPerk: string;
  imageColor: string;
}

export interface PlayerIPOState {
  isPublic: boolean;
  ticker: string;
  sharesTotal: number;
  playerShares: number;
  publicShares: number;
  sharePrice: number;
  dividendRatePercent: number; // 0 to 50
  totalDividendsPaid: number;
  marketCap: number;
  shareholdersCount: number;
  companyRating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB';
}

export interface RivalStockCompany {
  id: string;
  name: string;
  ticker: string;
  sector: string;
  logo: string;
  sharePrice: number;
  dailyChange: number;
  playerSharesOwned: number;
  totalShares: number;
  dividendYieldPercent: number;
  marketCap: number;
  description: string;
}

export interface EconomicDilemmaOption {
  id: string;
  label: string;
  description: string;
  moneyChange: number;
  reputationChange: number;
  diamondsReward?: number;
  marketShareChange?: number;
  riskPercent?: number;
  riskOutcomeText?: string;
}

export interface EconomicDilemmaEvent {
  id: string;
  title: string;
  category: 'crisis' | 'opportunity' | 'scandal' | 'market_shift';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  icon: string;
  options: EconomicDilemmaOption[];
}
