import type { CountryDefinition, CountryId, IndustryId } from './countries';
import type {
  FinanceLedgerEntry,
  AuctionBidRecord,
  GameEventRecord,
  InventoryLot,
  InvestmentRecord,
  DepositRecord,
  LoanRecord,
  StaffContract,
  LicenseRecord,
  ProductSale,
  ProductionOrder,
  TaskProgress,
  SeasonProgress,
  BusinessContract,
  AchievementRecord,
  OnboardingProgress,
} from './futureSystems';

export interface PlayerAsset {
  id: string;
  label: string;
  value: number;
  acquiredAt: string;
}

export interface PlayerLand {
  id: string;
  label: string;
  areaSquareMeters: number;
  purchasePrice: number;
  acquiredAt: string;
  landType?: 'industrial' | 'agricultural' | 'commercial';
}

export interface PlayerCompany {
  id: string;
  name: string;
  industryId: IndustryId;
  countryId: CountryId;
  foundedAt: string;
  foundedOnDay?: number;
  landId?: string;
  licenseIds?: string[];
  energyUnits?: number;
  energyCapacity?: number;
  operatingCostPerDay?: number;
  maintenanceCondition?: number;
  upgradeLevel?: number;
}

export interface PlayerProfile {
  id: string;
  name: string;
  level: number;
  countryId: CountryId;
  createdAt: string;
  bankBalance: number;
  payables: number;
  goldGrams: number;
  goldCostBasis: number;
  assets: PlayerAsset[];
  lands: PlayerLand[];
  companies: PlayerCompany[];
  finances: {
    netProfit: number;
    totalRevenue: number;
    totalExpenses: number;
  };
  /** Current simulation day. Day one is the day the world is created. */
  day: number;
  inventory: InventoryLot[];
  licenses: LicenseRecord[];
  investments: InvestmentRecord[];
  banking: {
    deposits: DepositRecord[];
    loans: LoanRecord[];
  };
  staff: StaffContract[];
  productionOrders: ProductionOrder[];
  auctionHistory: AuctionBidRecord[];
  redeemedCodeIds: string[];
  sales: ProductSale[];
  ledger: FinanceLedgerEntry[];
  events: GameEventRecord[];
  tasks: TaskProgress[];
  completedTaskIds: string[];
  season?: SeasonProgress;
  reputation: number;
  contracts: BusinessContract[];
  achievements: AchievementRecord[];
  onboarding: OnboardingProgress;
}

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `player-${Date.now()}`;
}

export function createNewPlayer(
  country: CountryDefinition,
  playerName: string,
  now: Date = new Date(),
): PlayerProfile {
  const createdAt = now.toISOString();
  return {
    id: createId(),
    name: playerName.trim() || 'المستثمر الجديد',
    level: 1,
    countryId: country.id,
    createdAt,
    bankBalance: country.startingBalance,
    payables: 0,
    goldGrams: 0,
    goldCostBasis: 0,
    assets: [],
    lands: [],
    companies: [],
    finances: { netProfit: 0, totalRevenue: 0, totalExpenses: 0 },
    day: 1,
    inventory: [],
    licenses: [],
    investments: [],
    banking: { deposits: [], loans: [] },
    staff: [],
    productionOrders: [],
    auctionHistory: [],
    redeemedCodeIds: [],
    sales: [],
    ledger: [],
    events: [],
    tasks: [],
    completedTaskIds: [],
    reputation: 50,
    contracts: [],
    achievements: [],
    onboarding: { introCompleted: false, chapter: 0, seenGuides: [] },
    season: { seasonId: 'expansion-season-1', startedOnDay: 1, endsOnDay: 30, points: 0, claimedChallengeKeys: [] },
  };
}

export function calculateTotalAssets(profile: PlayerProfile): number {
  const movableAssets = profile.assets.reduce((sum, asset) => sum + asset.value, 0);
  const landAssets = profile.lands.reduce((sum, land) => sum + land.purchasePrice, 0);
  const inventoryAssets = (profile.inventory ?? []).reduce((sum, lot) => sum + lot.quantity * lot.unitCost, 0);
  const activeInvestments = (profile.investments ?? [])
    .filter((investment) => investment.status === 'active')
    .reduce((sum, investment) => sum + investment.principal, 0);
  return profile.bankBalance + movableAssets + landAssets + inventoryAssets + activeInvestments + profile.goldCostBasis;
}
