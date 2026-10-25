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
import type { SpeedCardStack } from './accountFeatures';

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
  /** Day on which the land entered the player's empire; optional for legacy saves. */
  acquiredOnDay?: number;
  /** Land acquired today is reserved until the next in-game day. */
  availableForCompanyOnDay?: number;
  landType?: 'industrial' | 'agricultural' | 'commercial';
  upgradeLevel?: number;
}

export interface PlayerCompany {
  id: string;
  name: string;
  industryId: IndustryId;
  countryId: CountryId;
  foundedAt: string;
  foundedOnDay?: number;
  /** Directly purchased companies begin operating after transfer paperwork completes. */
  operationalFromDay?: number;
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
  /** Public support/admin identifier; never contains the user's email. */
  accountCode: string;
  name: string;
  level: number;
  countryId: CountryId;
  createdAt: string;
  bankBalance: number;
  payables: number;
  goldGrams: number;
  goldCostBasis: number;
  diamonds: number;
  speedCards: SpeedCardStack[];
  badges: string[];
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
  warehouseLevel: number;
  activeDaySpeedMultiplier: 1 | 2 | 3;
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
  readNotificationIds: string[];
  dismissedNotificationIds: string[];
  unreadProductionOrderIds: string[];
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

  // Initial collapsing land (أرض مصنع العاشر من رمضان)
  const inheritedLand: PlayerLand = {
    id: 'inherited-factory-land',
    label: 'أرض مصنع العاشر القديم (ميراث مهدد)',
    areaSquareMeters: 1200,
    purchasePrice: 350000,
    acquiredAt: createdAt,
    acquiredOnDay: 1,
    availableForCompanyOnDay: 1,
    landType: 'industrial',
    upgradeLevel: 1,
  };

  // Initial collapsing company (مصنع سولي للأغذية المنهار - ماكينات معطلة)
  const inheritedCompany: PlayerCompany = {
    id: 'inherited-food-company',
    name: 'مصنع سولي للأغذية (قيد الإنقاذ)',
    industryId: 'food',
    countryId: country.id,
    foundedAt: createdAt,
    foundedOnDay: 1,
    operationalFromDay: 1,
    landId: 'inherited-factory-land',
    licenseIds: ['lic-food-inherited'],
    energyUnits: 25,
    energyCapacity: 50,
    operatingCostPerDay: 3500,
    maintenanceCondition: 25, // 25% condition - broken machines needing repair!
    upgradeLevel: 1,
  };

  // Initial urgent bank loan due on Day 7
  const initialBankLoan: LoanRecord = {
    id: 'loan-emergency-bank-misr',
    collateralType: 'company',
    collateralId: 'inherited-food-company',
    principal: 50000,
    totalRepayment: 52500,
    annualRate: 0.12,
    startedOnDay: 1,
    termDays: 7,
    nextPaymentDay: 7,
    installmentAmount: 52500,
    remainingBalance: 52500,
    status: 'active',
  };

  return {
    id: createId(),
    accountCode: '',
    name: playerName.trim() || 'المستثمر الصاعد',
    level: 1,
    countryId: country.id,
    createdAt,
    bankBalance: 120000, // 120,000 EGP emergency cash for turnaround
    payables: 0,
    goldGrams: 0,
    goldCostBasis: 0,
    diamonds: 10,
    speedCards: [],
    badges: ['طوق النجاة'],
    assets: [],
    lands: [inheritedLand],
    companies: [inheritedCompany],
    finances: { netProfit: 0, totalRevenue: 0, totalExpenses: 0 },
    day: 1,
    warehouseLevel: 1,
    activeDaySpeedMultiplier: 1,
    inventory: [],
    licenses: [
      {
        id: 'lic-food-inherited',
        industryId: 'food',
        countryId: country.id,
        name: 'ترخيص تصنيع مواد غذائية مهدد بالسحب',
        purchasedAt: createdAt,
        cost: 45000,
      },
    ],
    investments: [],
    banking: { deposits: [], loans: [initialBankLoan] },
    staff: [],
    productionOrders: [],
    auctionHistory: [],
    redeemedCodeIds: [],
    sales: [],
    ledger: [
      {
        id: createId(),
        day: 1,
        title: 'رصيد الطوارئ المتبقي بخزينة المصنع المنهار',
        category: 'revenue',
        amount: 120000,
        createdAt,
      },
      {
        id: createId(),
        day: 1,
        title: 'قيد مديونية: قسط البنك المستحق خلال 7 أيام',
        category: 'expense',
        amount: -52500,
        createdAt,
      },
    ],
    events: [],
    tasks: [],
    completedTaskIds: [],
    readNotificationIds: [],
    dismissedNotificationIds: [],
    unreadProductionOrderIds: [],
    reputation: 35,
    contracts: [],
    achievements: [],
    onboarding: { introCompleted: true, chapter: 1, seenGuides: [] },
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
