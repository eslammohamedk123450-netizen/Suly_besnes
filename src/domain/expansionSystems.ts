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

// -------------------------------------------------------------
// 1. Cartels & Alliances
// -------------------------------------------------------------
export interface CartelAlliance {
  id: string;
  name: string;
  badge: string;
  description: string;
  categoryLabel: string;
  totalPower: number;
  memberCount: number;
  dailyDues: number;
  joinCost: number;
  perkTitle: string;
  perkDescription: string;
  revenueBonusPercent: number;
  materialCostDiscountPercent: number;
}

export interface PlayerCartelState {
  joinedCartelId: string | null;
  userRank: 'leader' | 'senior' | 'member' | 'none';
  contributedFunds: number;
  activeAgreement: string | null;
  warVictoryCount: number;
  strongholdLevel?: number;
}

// -------------------------------------------------------------
// 2. Global Maritime Trade & Supply Chain
// -------------------------------------------------------------
export interface TradeVessel {
  id: string;
  name: string;
  type: 'cargo' | 'tanker' | 'lng' | 'freight';
  typeLabel: string;
  icon: string;
  price: number;
  capacityContainers: number;
  speedVoyageHours: number;
  baseProfitPerVoyage: number;
}

export interface TradeRoute {
  id: string;
  name: string;
  destination: string;
  distanceKm: number;
  riskPercent: number; // piracy / weather risk
  profitMultiplier: number;
  requiredVesselType: 'cargo' | 'tanker' | 'lng' | 'freight' | 'any';
  icon: string;
}

export interface ActiveVoyage {
  id: string;
  vesselId: string;
  vesselName: string;
  routeId: string;
  routeName: string;
  startTime: number; // timestamp
  durationMs: number;
  expectedProfit: number;
  claimed: boolean;
}

export interface MaritimeFleetState {
  ownedVesselIds: string[];
  activeVoyages: ActiveVoyage[];
  securityLevel: number; // anti-piracy 1 to 5
  portConcessions: number; // 0 to 5
}

// -------------------------------------------------------------
// 3. Government Megaprojects & Political Influence
// -------------------------------------------------------------
export interface MegaprojectTender {
  id: string;
  title: string;
  sector: string;
  icon: string;
  totalBudget: number;
  requiredInfluenceLevel: number;
  milestonesCount: number;
  completedMilestones: number;
  payoutPerMilestone: number;
  description: string;
  sponsorMinistry: string;
}

export interface PoliticalLobbyState {
  influenceLevel: number; // 1 to 10
  influencePoints: number;
  taxExemptionActive: boolean;
  activeTenderIds: string[];
  totalGovernmentPayouts: number;
}

// -------------------------------------------------------------
// 4. Venture Capital & Startup Incubator
// -------------------------------------------------------------
export interface StartupDeal {
  id: string;
  name: string;
  tagline: string;
  sector: 'ai' | 'fintech' | 'biotech' | 'cleantech' | 'drones';
  sectorLabel: string;
  icon: string;
  stage: 'seed' | 'series_a' | 'series_b' | 'unicorn';
  currentValuation: number;
  investmentCost: number;
  equityPercent: number;
  monthlyGrowthRate: number; // percentage
  exitMultiple: number; // e.g. 5x - 15x
}

export interface PlayerVCState {
  incubatorLevel: number;
  investedStartupIds: string[];
  startupValuations: Record<string, number>; // startupId -> updated valuation
  totalExitsProfit: number;
}

// Combined Expansion V2 Storage State
export interface MegaExpansionState {
  cartel: PlayerCartelState;
  maritime: MaritimeFleetState;
  political: PoliticalLobbyState;
  vc: PlayerVCState;
}
