import type { CountryDefinition, CountryId, IndustryId } from './countries';
import type { CompanyBranch, RetailShop } from './branchAndShop';
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
  GlobalShipmentRecord,
  ForwardSupplyContract,
  PlayerAuctionListing,
  AutomationDirectives,
} from './futureSystems';
import type { SpeedCardStack } from './accountFeatures';
import { FREE_AVATAR_IDS, DEFAULT_AVATAR_ID } from './avatars';
import { STARTING_DIAMONDS_BALANCE, STARTING_GOLD_BALANCE } from '../game/economyBalance';

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
  plotId?: string;
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
  lastSpinTimestamp?: number;
  lastSpinDay?: number;
  avatarId?: string;
  unlockedAvatarIds?: string[];
  bio?: string;
  renameCountThisWeek?: number;
  lastRenameWeekTimestamp?: number;
  cartelStrongholdLevel?: number;
  lastOfflineClaimAt?: number;
  globalShipments?: GlobalShipmentRecord[];
  forwardContracts?: ForwardSupplyContract[];
  supplierTrust?: Record<string, number>;
  playerAuctions?: PlayerAuctionListing[];
  soldAssetIds?: string[];
  processedAuctionSaleIds?: string[];
  processedBotOfferIds?: string[];
  completedMissionIds?: string[];
  claimedRewardIds?: string[];
  dismissedStoryEventIds?: string[];
  automationDirectives?: AutomationDirectives;
  luckyWheelLevel?: number;
  fastStarterProductionUsed?: boolean;
  hqLevel?: number;
  cityConstructions?: Record<string, any>;
  branches?: CompanyBranch[];
  shops?: RetailShop[];
}

export function getDefaultAutomationDirectives(): AutomationDirectives {
  return {
    autoPaySalaries: false,
    autoPurchaseMaterials: false,
    autoPurchaseThreshold: 50,
    autoPurchaseBudget: 50_000,
    autoRunProduction: false,
    autoProduceCompanyIds: [],
  };
}

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `player-${Date.now()}`;
}

export function createNewPlayer(
  country: CountryDefinition,
  playerName: string,
  now: Date = new Date(),
  avatarId?: string,
): PlayerProfile {
  const createdAt = now.toISOString();

  const initialCash = country.startingBalance ?? STARTING_GOLD_BALANCE;
  const initialLoanPrincipal = 2_000;
  const initialLoanRepay = 2_100;
  const initialLandValue = 7_000;
  const initialOperatingCost = 80;

  const countryLandNames: Record<string, string> = {
    egypt: 'أرض مجمع العاشر من رمضان الصناعي (ميراث مهدد)',
    saudi: 'أرض المدينة الصناعية الثانية بالرياض (ميراث مهدد)',
    uae: 'أرض منطقة جبل علي الحرة JAFZA بدبي (ميراث مهدد)',
    usa: 'أرض مجمع كوينز الصناعي واللوجستي · نيويورك (ميراث مهدد)',
    kuwait: 'أرض منطقة الشويخ الصناعية · العاصمة (ميراث مهدد)',
    qatar: 'أرض المنطقة الصناعية الجديدة بالدوحة (ميراث مهدد)',
    uk: 'أرض مجمع ترافورد بارك الصناعي · مانشستر (ميراث مهدد)',
    germany: 'أرض حزام الرور الصناعي · دوسلدورف (ميراث مهدد)',
    japan: 'أرض مجمع يوكوهاما البحري الصناعي · خليج طوكيو (ميراث مهدد)',
    jordan: 'أرض مدينة سحاب الصناعية · عمان (ميراث مهدد)',
    palestine: 'أرض منطقة بيت لحم الصناعية · فلسطين',
    china: 'أرض منطقة بودونغ الصناعية · شنغهاي',
    spain: 'أرض زونا فرانكا الصناعية · برشلونة',
    russia: 'أرض المنطقة الصناعية · موسكو',
  };

  const countryCompanyNames: Record<string, string> = {
    egypt: 'مصنع الأغذية النموذجي · العاشر من رمضان',
    saudi: 'مصنع نجد للأغذية والتموين · الرياض',
    uae: 'مصنع دبي للأغذية والضيافة · جبل علي',
    usa: 'مصنع مانهاتن للسلع الغذائية · نيويورك',
    kuwait: 'مصنع الديرة للمنتجات الغذائية · الشويخ',
    qatar: 'مصنع الدوحة للتعبئة والمنتجات الغذائية',
    uk: 'مصنع التايمز للصناعات الغذائية · مانشستر',
    germany: 'مصنع بافاريا للصناعات الغذائية · الرور',
    japan: 'مصنع طوكيو للمنتجات الغذائية · يوكوهاما',
    jordan: 'مصنع عمّان للأغذية والتموين · سحاب',
    palestine: 'مصنع فلسطين للأغذية والتموين · بيت لحم',
  };

  const countryBankNames: Record<string, string> = {
    egypt: 'بنك مصر',
    saudi: 'مصرف الراجحي',
    uae: 'بنك الإمارات دبي الوطني',
    usa: 'جي بي مورغان تشيس',
    kuwait: 'بنك الكويت الوطني',
    qatar: 'بنك قطر الوطني QNB',
    uk: 'بنك باركليز',
    germany: 'دويتشه بنك',
    japan: 'ميتسوبيشي يو إف جيه',
    jordan: 'البنك العربي',
    palestine: 'بنك فلسطين',
  };

  const landLabel = countryLandNames[country.id] || `أرض المنطقة الصناعية - ${country.name}`;
  const companyName = countryCompanyNames[country.id] || `مصنع المنتجات الغذائية (${country.name})`;
  const bankName = countryBankNames[country.id] || 'البنك التجاري الدولي';

  // Initial collapsing land
  const inheritedLand: PlayerLand = {
    id: 'inherited-factory-land',
    label: landLabel,
    areaSquareMeters: 1200,
    purchasePrice: initialLandValue,
    acquiredAt: createdAt,
    acquiredOnDay: 1,
    availableForCompanyOnDay: 1,
    landType: 'industrial',
    upgradeLevel: 1,
    plotId: 'plot-ind-1',
  };

  // Initial collapsing company
  const inheritedCompany: PlayerCompany = {
    id: 'inherited-food-company',
    name: companyName,
    industryId: 'food',
    countryId: country.id,
    foundedAt: createdAt,
    foundedOnDay: 1,
    operationalFromDay: 1,
    landId: 'inherited-factory-land',
    licenseIds: ['lic-food-inherited'],
    energyUnits: 25,
    energyCapacity: 50,
    operatingCostPerDay: initialOperatingCost,
    maintenanceCondition: 25, // 25% condition - broken machines needing repair!
    upgradeLevel: 1,
  };

  // Initial urgent bank loan due on Day 7
  const initialBankLoan: LoanRecord = {
    id: `loan-emergency-${country.id}`,
    collateralType: 'company',
    collateralId: 'inherited-food-company',
    principal: initialLoanPrincipal,
    totalRepayment: initialLoanRepay,
    annualRate: 0.12,
    startedOnDay: 1,
    termDays: 7,
    nextPaymentDay: 7,
    installmentAmount: initialLoanRepay,
    remainingBalance: initialLoanRepay,
    status: 'active',
  };

  return {
    id: createId(),
    accountCode: '',
    name: playerName.trim() || 'المستثمر الصاعد',
    level: 1,
    countryId: country.id,
    createdAt,
    bankBalance: initialCash,
    payables: 0,
    goldGrams: 0,
    goldCostBasis: 0,
    diamonds: STARTING_DIAMONDS_BALANCE,
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
        feePaid: 1_200,
        issuedAt: createdAt,
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
        category: 'revenue',
        amount: initialCash,
        countryId: country.id,
        occurredAt: createdAt,
        note: `سيولة الطوارئ المسلّمة من مدخرات الوالدة بالخزينة ($)`,
      },
      {
        id: createId(),
        category: 'liability',
        amount: initialLoanRepay,
        countryId: country.id,
        occurredAt: createdAt,
        note: `قيد مديونية موروثة: مهلة سماح قضائية 7 أيام لقرض ${bankName} (${initialLoanRepay}$)`,
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
    onboarding: {
      introCompleted: false,
      chapter: 1,
      seenGuides: [],
      countryIntroSeen: false,
      walkthroughCompleted: false,
      walkthroughSkipped: false,
      walkthroughStepId: 'service_equipment',
      seenQuestBriefings: [],
      claimedStoryQuestIds: [],
      claimedCampaignChapters: [],
      campaignChapterId: 1,
    },
    season: { seasonId: 'expansion-season-1', startedOnDay: 1, endsOnDay: 30, points: 0, claimedChallengeKeys: [] },
    avatarId: avatarId && FREE_AVATAR_IDS.includes(avatarId) ? avatarId : DEFAULT_AVATAR_ID,
    unlockedAvatarIds: [...FREE_AVATAR_IDS],
    bio: 'ابنِ إمبراطوريتك الاستثمارية بعزيمة لا تلين ورؤية لا تعرف المستحيل.',
    renameCountThisWeek: 0,
    lastRenameWeekTimestamp: now.getTime(),
    completedMissionIds: [],
    claimedRewardIds: [],
    dismissedStoryEventIds: [],
    automationDirectives: getDefaultAutomationDirectives(),
    hqLevel: 1,
    cityConstructions: {},
    branches: [],
    shops: [],
  };
}

export function calculateTotalAssets(profile: PlayerProfile): number {
  const liquidCash = profile.bankBalance || 0;
  const movableAssets = (profile.assets ?? []).reduce((sum, asset) => sum + (asset.value || 0), 0);

  const occupiedLandIds = new Set([
    ...(profile.companies ?? []).map((c) => c.landId).filter(Boolean),
    ...(profile.branches ?? []).map((b) => b.landId).filter(Boolean),
    ...(profile.shops ?? []).map((s) => s.landId).filter(Boolean),
  ]);
  const unlinkedLands = (profile.lands ?? []).filter((l) => !occupiedLandIds.has(l.id));
  const landAssets = unlinkedLands.reduce(
    (sum, land) => sum + Math.round((land.purchasePrice || 0) * (1 + ((land.upgradeLevel ?? 1) * 0.15))),
    0,
  );

  const companiesTotalValue = (profile.companies ?? []).reduce((sum, company) => {
    const linkedLand = company.landId ? profile.lands.find((l) => l.id === company.landId) : undefined;
    const landValue = linkedLand
      ? Math.round((linkedLand.purchasePrice || 0) * (1 + ((linkedLand.upgradeLevel ?? 1) * 0.15)))
      : 0;
    const baseEquipment = ((company.operatingCostPerDay ?? 120) * 100) + ((company.energyCapacity ?? 80) * 450);
    const upgradeLevel = Math.max(1, company.upgradeLevel ?? 1);
    const upgradeInvestments = (upgradeLevel - 1) * 22_000;
    const condition = Math.max(0, Math.min(100, company.maintenanceCondition ?? 100));
    const conditionFactor = condition / 100;
    const conditionDiscount = Math.round((baseEquipment + upgradeInvestments) * (1 - conditionFactor));
    const bookValue = landValue + baseEquipment + upgradeInvestments;
    return sum + Math.max(15_000, Math.round(bookValue - conditionDiscount));
  }, 0);

  const branchesTotalValue = (profile.branches ?? []).reduce((sum, branch) => {
    return sum + (12_000 * Math.max(1, branch.level || 1));
  }, 0);

  const shopsTotalValue = (profile.shops ?? []).reduce((sum, shop) => {
    const shelfInventoryVal = (shop.inventory ?? []).reduce(
      (acc, item) => acc + (item.quantity || 0) * (item.unitCost || 0),
      0
    );
    return sum + (10_000 * Math.max(1, shop.level || 1)) + shelfInventoryVal;
  }, 0);

  const inventoryAssets = (profile.inventory ?? []).reduce((sum, lot) => sum + (lot.quantity || 0) * (lot.unitCost || 0), 0);
  const activeInvestments = (profile.investments ?? [])
    .filter((investment) => investment.status === 'active')
    .reduce((sum, investment) => sum + (investment.principal || 0), 0);
  const activeDeposits = (profile.banking?.deposits ?? [])
    .filter((d) => d.status === 'active')
    .reduce((sum, d) => sum + (d.principal || 0), 0);
  const goldValue = Math.round((profile.goldGrams || 0) * 85);

  return (
    liquidCash +
    movableAssets +
    landAssets +
    companiesTotalValue +
    branchesTotalValue +
    shopsTotalValue +
    inventoryAssets +
    activeInvestments +
    activeDeposits +
    goldValue
  );
}

export function calculateNetWorth(profile: PlayerProfile): number {
  const grossAssets = calculateTotalAssets(profile);
  const payables = profile.payables || 0;
  const unpaidSalaries = (profile.staff ?? [])
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + (s.unpaidSalary || 0), 0);
  const activeLoans = (profile.banking?.loans ?? [])
    .filter((l) => l.status === 'active')
    .reduce((sum, l) => sum + (l.remainingBalance || 0), 0);
  const totalLiabilities = payables + unpaidSalaries + activeLoans;
  return Math.max(0, grossAssets - totalLiabilities);
}
