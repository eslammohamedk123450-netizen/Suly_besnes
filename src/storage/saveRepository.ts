import { findCountry, type CountryId, type IndustryId } from '../domain/countries';
import type { PlayerAsset, PlayerCompany, PlayerLand, PlayerProfile } from '../domain/player';
import type { AchievementRecord, AuctionBidRecord, BusinessContract, DepositRecord, FinanceLedgerEntry, InventoryLot, InvestmentRecord, LicenseRecord, LoanRecord, OnboardingProgress, ProductSale, ProductionOrder, StaffContract, TaskProgress } from '../domain/futureSystems';
import { findIndustry, GOLD_PRICE_PER_GRAM } from '../game/catalog';
import { normalizeAccountFeatures } from '../domain/accountFeatures';

const SAVE_KEY = 'business-empire.save.v1';
const SAVE_VERSION = 6;

function saveKey(accountId?: string): string {
  return accountId ? `${SAVE_KEY}.${accountId}` : SAVE_KEY;
}
const INDUSTRY_IDS = new Set<string>([
  'petroleum', 'electricity', 'gas', 'water', 'detergents', 'food', 'construction', 'electronics', 'transport',
]);

interface SaveEnvelope {
  version: number;
  savedAt: string;
  profile: PlayerProfile;
}

export type StorageResult = { ok: true } | { ok: false; reason: 'unavailable' | 'invalid' };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isFiniteNonNegative(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isDateString(value: unknown): value is string {
  return isNonEmptyString(value) && Number.isFinite(Date.parse(value));
}

function isAsset(value: unknown): value is PlayerAsset {
  if (!isRecord(value)) return false;
  return isNonEmptyString(value.id) && isNonEmptyString(value.label) && isFiniteNonNegative(value.value) && isDateString(value.acquiredAt);
}

function isLand(value: unknown): value is PlayerLand {
  if (!isRecord(value)) return false;
  return isNonEmptyString(value.id)
    && isNonEmptyString(value.label)
    && isFiniteNonNegative(value.areaSquareMeters)
    && isFiniteNonNegative(value.purchasePrice)
    && isDateString(value.acquiredAt)
    && (value.acquiredOnDay === undefined || (Number.isInteger(value.acquiredOnDay) && (value.acquiredOnDay as number) >= 1))
    && (value.availableForCompanyOnDay === undefined || (Number.isInteger(value.availableForCompanyOnDay) && (value.availableForCompanyOnDay as number) >= 1))
    && (value.landType === undefined || value.landType === 'industrial' || value.landType === 'agricultural' || value.landType === 'commercial');
}

function isCompany(value: unknown): value is PlayerCompany {
  if (!isRecord(value)) return false;
  return isNonEmptyString(value.id)
    && isNonEmptyString(value.name)
    && typeof value.industryId === 'string'
    && INDUSTRY_IDS.has(value.industryId)
    && typeof value.countryId === 'string'
    && findCountry(value.countryId) !== undefined
    && isDateString(value.foundedAt)
    && (value.foundedOnDay === undefined || (Number.isInteger(value.foundedOnDay) && (value.foundedOnDay as number) >= 1))
    && (value.operationalFromDay === undefined || (Number.isInteger(value.operationalFromDay) && (value.operationalFromDay as number) >= 1))
    && (value.landId === undefined || isNonEmptyString(value.landId))
    && (value.licenseIds === undefined || (Array.isArray(value.licenseIds) && value.licenseIds.every(isNonEmptyString)))
    && (value.energyUnits === undefined || isFiniteNonNegative(value.energyUnits))
    && (value.energyCapacity === undefined || isFiniteNonNegative(value.energyCapacity))
    && (value.operatingCostPerDay === undefined || isFiniteNonNegative(value.operatingCostPerDay))
    && (value.maintenanceCondition === undefined || (isFiniteNonNegative(value.maintenanceCondition) && value.maintenanceCondition <= 100));
}

function isInventoryLot(value: unknown): value is InventoryLot {
  return isRecord(value) && isNonEmptyString(value.id) && isNonEmptyString(value.materialOrProductId)
    && isFiniteNonNegative(value.quantity) && isNonEmptyString(value.unit) && isFiniteNonNegative(value.unitCost)
    && (value.qualityScore === undefined || (isFiniteNonNegative(value.qualityScore) && value.qualityScore <= 100));
}

function isLicense(value: unknown): value is LicenseRecord {
  return isRecord(value) && isNonEmptyString(value.id) && typeof value.countryId === 'string'
    && findCountry(value.countryId) !== undefined && typeof value.industryId === 'string'
    && INDUSTRY_IDS.has(value.industryId) && isFiniteNonNegative(value.feePaid) && isDateString(value.issuedAt);
}

function isInvestment(value: unknown): value is InvestmentRecord {
  return isRecord(value) && isNonEmptyString(value.id) && isNonEmptyString(value.investmentTypeId)
    && isFiniteNonNegative(value.principal) && isFiniteNonNegative(value.expectedReturnRate)
    && typeof value.startedOnDay === 'number' && Number.isInteger(value.startedOnDay) && value.startedOnDay >= 1
    && typeof value.maturityDay === 'number' && Number.isInteger(value.maturityDay) && value.maturityDay >= value.startedOnDay
    && (value.status === 'active' || value.status === 'paid' || value.status === 'loss');
}

function isDepositTranche(value: unknown): boolean {
  return isRecord(value) && isNonEmptyString(value.id) && isFiniteNonNegative(value.principal)
    && isFiniteNonNegative(value.annualRate) && Number.isInteger(value.startedOnDay) && (value.startedOnDay as number) >= 1
    && Number.isInteger(value.maturityDay) && (value.maturityDay as number) >= (value.startedOnDay as number)
    && (value.status === 'active' || value.status === 'paid' || value.status === 'withdrawn')
    && (value.settledAmount === undefined || isFiniteNonNegative(value.settledAmount));
}

function isDeposit(value: unknown): value is DepositRecord {
  return isRecord(value) && isNonEmptyString(value.id) && isFiniteNonNegative(value.principal)
    && isFiniteNonNegative(value.annualRate) && Number.isInteger(value.startedOnDay) && (value.startedOnDay as number) >= 1
    && Number.isInteger(value.maturityDay) && (value.maturityDay as number) >= (value.startedOnDay as number)
    && (value.status === 'active' || value.status === 'paid' || value.status === 'withdrawn' || value.status === 'merged')
    && (value.settledAmount === undefined || isFiniteNonNegative(value.settledAmount))
    && (value.mergedIntoId === undefined || isNonEmptyString(value.mergedIntoId))
    && (value.status !== 'merged' || isNonEmptyString(value.mergedIntoId))
    && (value.tranches === undefined || (Array.isArray(value.tranches) && value.tranches.length > 0 && value.tranches.length <= 250 && value.tranches.every(isDepositTranche)));
}

function isLoan(value: unknown): value is LoanRecord {
  return isRecord(value) && isNonEmptyString(value.id) && (value.collateralType === 'land' || value.collateralType === 'company')
    && isNonEmptyString(value.collateralId) && isFiniteNonNegative(value.principal) && isFiniteNonNegative(value.totalRepayment)
    && isFiniteNonNegative(value.annualRate) && Number.isInteger(value.startedOnDay) && (value.startedOnDay as number) >= 1
    && Number.isInteger(value.termDays) && (value.termDays as number) > 0 && Number.isInteger(value.nextPaymentDay)
    && isFiniteNonNegative(value.installmentAmount) && isFiniteNonNegative(value.remainingBalance)
    && (value.status === 'active' || value.status === 'paid' || value.status === 'defaulted');
}

function isStaffContract(value: unknown): value is StaffContract {
  return isRecord(value) && isNonEmptyString(value.id) && isNonEmptyString(value.name)
    && (value.role === 'manager' || value.role === 'accountant' || value.role === 'lawyer' || value.role === 'hr')
    && (value.companyId === undefined || isNonEmptyString(value.companyId)) && isFiniteNonNegative(value.dailySalary)
    && Number.isInteger(value.hiredOnDay) && (value.hiredOnDay as number) >= 1
    && Number.isInteger(value.nextPayDay) && (value.nextPayDay as number) >= (value.hiredOnDay as number)
    && (value.status === 'active' || value.status === 'terminated');
}

function isProductionOrder(value: unknown): value is ProductionOrder {
  return isRecord(value) && isNonEmptyString(value.id) && isNonEmptyString(value.companyId) && isNonEmptyString(value.productId)
    && isNonEmptyString(value.productName) && Number.isInteger(value.batches) && (value.batches as number) > 0
    && Number.isInteger(value.outputQuantity) && (value.outputQuantity as number) > 0 && isNonEmptyString(value.outputUnit)
    && isFiniteNonNegative(value.materialCost) && isFiniteNonNegative(value.energyCost) && isFiniteNonNegative(value.expectedUnitCost)
    && isFiniteNonNegative(value.demandForecast) && value.demandForecast <= 1_000_000 && isFiniteNonNegative(value.qualityScore) && value.qualityScore <= 100
    && isFiniteNonNegative(value.maintenanceCost)
    && Number.isInteger(value.startedOnDay) && (value.startedOnDay as number) >= 1
    && Number.isInteger(value.completesOnDay) && (value.completesOnDay as number) >= (value.startedOnDay as number)
    && (value.status === 'active' || value.status === 'completed' || value.status === 'cancelled');
}

function isAuctionBidRecord(value: unknown): value is AuctionBidRecord {
  return isRecord(value) && isNonEmptyString(value.id) && isNonEmptyString(value.listingId)
    && (value.bidder === 'player' || value.bidder === 'bot') && isNonEmptyString(value.bidderId)
    && isFiniteNonNegative(value.amount) && Number.isInteger(value.day) && (value.day as number) >= 1 && isDateString(value.occurredAt);
}

function isSale(value: unknown): value is ProductSale {
  return isRecord(value) && isNonEmptyString(value.id) && isNonEmptyString(value.productId)
    && isFiniteNonNegative(value.quantity) && isFiniteNonNegative(value.unitPrice)
    && isFiniteNonNegative(value.grossRevenue) && isFiniteNonNegative(value.tax) && isDateString(value.soldAt);
}

function isLedgerEntry(value: unknown): value is FinanceLedgerEntry {
  return isRecord(value) && isNonEmptyString(value.id)
    && (value.category === 'revenue' || value.category === 'expense' || value.category === 'asset' || value.category === 'liability' || value.category === 'settlement')
    && isFiniteNonNegative(value.amount) && typeof value.countryId === 'string'
    && findCountry(value.countryId) !== undefined && isDateString(value.occurredAt) && isNonEmptyString(value.note);
}

function isTaskProgress(value: unknown): value is TaskProgress {
  return isRecord(value) && isNonEmptyString(value.taskId) && typeof value.claimed === 'boolean'
    && (value.claimedAt === undefined || isDateString(value.claimedAt));
}

function isBusinessContract(value: unknown): value is BusinessContract {
  return isRecord(value) && isNonEmptyString(value.id) && isNonEmptyString(value.clientName) && isNonEmptyString(value.productId)
    && isNonEmptyString(value.productName) && isFiniteNonNegative(value.quantity) && isFiniteNonNegative(value.unitPrice)
    && isFiniteNonNegative(value.reward) && isFiniteNonNegative(value.reputationReward) && Number.isInteger(value.deadlineDay)
    && Number.isInteger(value.acceptedOnDay) && (value.status === 'active' || value.status === 'completed' || value.status === 'failed');
}

function isAchievement(value: unknown): value is AchievementRecord {
  return isRecord(value) && isNonEmptyString(value.id) && isNonEmptyString(value.title)
    && Number.isInteger(value.earnedAtDay) && (value.earnedAtDay as number) >= 1;
}

function isOnboardingProgress(value: unknown): value is OnboardingProgress {
  return isRecord(value) && typeof value.introCompleted === 'boolean' && Number.isInteger(value.chapter)
    && (value.chapter as number) >= 0 && Array.isArray(value.seenGuides) && value.seenGuides.every(isNonEmptyString);
}

function inferLandType(label: string): PlayerLand['landType'] | undefined {
  const normalized = label.toLocaleLowerCase();
  if (normalized.includes('زراع') || normalized.includes('farm') || normalized.includes('agric')) return 'agricultural';
  if (normalized.includes('تجار') || normalized.includes('commercial')) return 'commercial';
  if (normalized.includes('صناع') || normalized.includes('industrial') || normalized.includes('مصنع')) return 'industrial';
  return undefined;
}

function sumCategory(entries: readonly FinanceLedgerEntry[], category: FinanceLedgerEntry['category']): number {
  return entries.filter((entry) => entry.category === category).reduce((sum, entry) => sum + entry.amount, 0);
}

function isLegacyProfile(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value) || !isRecord(value.finances)) return false;
  const finances = value.finances;
  return isNonEmptyString(value.id)
    && isNonEmptyString(value.name)
    && typeof value.level === 'number' && Number.isInteger(value.level) && value.level >= 1
    && typeof value.countryId === 'string' && findCountry(value.countryId) !== undefined
    && isDateString(value.createdAt)
    && isFiniteNonNegative(value.bankBalance)
    && isFiniteNonNegative(value.goldGrams)
    && (value.goldCostBasis === undefined || isFiniteNonNegative(value.goldCostBasis))
    && (value.payables === undefined || isFiniteNonNegative(value.payables))
    && Array.isArray(value.assets) && value.assets.every(isAsset)
    && Array.isArray(value.lands) && value.lands.every(isLand)
    && Array.isArray(value.companies) && value.companies.every(isCompany)
    && Number.isFinite(finances.netProfit)
    && (finances.totalRevenue === undefined || isFiniteNonNegative(finances.totalRevenue))
    && (finances.totalExpenses === undefined || isFiniteNonNegative(finances.totalExpenses));
}

/** Converts older profiles into one canonical shape without dropping ownership or financial history. */
function migrateProfile(value: unknown): PlayerProfile | null {
  if (!isLegacyProfile(value)) return null;
  const rawFinances = value.finances as { netProfit: number; totalRevenue?: number; totalExpenses?: number };
  const countryId = value.countryId as CountryId;
  const createdAt = value.createdAt as string;
  const day = typeof value.day === 'number' && Number.isInteger(value.day) && value.day >= 1 ? value.day : 1;
  const originalLands = value.lands as PlayerLand[];
  const originalCompanies = value.companies as PlayerCompany[];
  const lands = originalLands.map((land) => ({
    ...land,
    availableForCompanyOnDay: Number.isInteger(land.availableForCompanyOnDay)
      ? land.availableForCompanyOnDay
      : (Number.isInteger(land.acquiredOnDay) ? land.acquiredOnDay! : day),
  }));
  const assignedLandIds = new Set<string>();
  const companies = originalCompanies.map((company) => {
    const industry = findIndustry(company.industryId);
    const energyCapacity = isFiniteNonNegative(company.energyCapacity) && company.energyCapacity > 0
      ? company.energyCapacity
      : industry?.energyCapacity ?? 0;
    const normalizedCompany: PlayerCompany = {
      ...company,
      licenseIds: Array.isArray(company.licenseIds) && company.licenseIds.every(isNonEmptyString) ? company.licenseIds : [],
      energyCapacity,
      energyUnits: isFiniteNonNegative(company.energyUnits)
        ? Math.min(company.energyUnits, energyCapacity)
        : Math.min(energyCapacity, industry?.dailyEnergySupply ?? 0),
      operatingCostPerDay: isFiniteNonNegative(company.operatingCostPerDay) && company.operatingCostPerDay > 0
        ? company.operatingCostPerDay
        : industry?.dailyOperatingCost ?? 0,
      maintenanceCondition: isFiniteNonNegative(company.maintenanceCondition) ? Math.min(100, company.maintenanceCondition) : 100,
      ...(Number.isInteger(company.operationalFromDay) ? { operationalFromDay: company.operationalFromDay } : {}),
    };
    const explicitLand = normalizedCompany.landId ? lands.find((land) => land.id === normalizedCompany.landId && !assignedLandIds.has(land.id)) : undefined;
    const linkedLand = explicitLand ?? (!normalizedCompany.landId ? lands.find((land) => !assignedLandIds.has(land.id)) : undefined);
    if (!linkedLand) return normalizedCompany;
    assignedLandIds.add(linkedLand.id);
    linkedLand.landType ??= findIndustry(company.industryId)?.requiredLandType ?? inferLandType(linkedLand.label) ?? 'industrial';
    return { ...normalizedCompany, landId: linkedLand.id };
  });
  for (const land of lands) land.landType ??= inferLandType(land.label) ?? 'industrial';

  const existingLedger = Array.isArray(value.ledger) && value.ledger.every(isLedgerEntry) ? value.ledger : [];
  let ledger = existingLedger;
  if (ledger.length === 0) {
    const priorRevenue = rawFinances.totalRevenue ?? Math.max(0, rawFinances.netProfit);
    const priorExpenses = rawFinances.totalExpenses ?? Math.max(0, -rawFinances.netProfit);
    const migratedEntries: FinanceLedgerEntry[] = [];
    if (priorRevenue > 0) migratedEntries.push({ id: `legacy-revenue-${value.id as string}`, category: 'revenue', amount: priorRevenue, countryId, occurredAt: createdAt, note: 'إيرادات مرحّلة من ملف الحفظ السابق' });
    if (priorExpenses > 0) migratedEntries.push({ id: `legacy-expenses-${value.id as string}`, category: 'expense', amount: priorExpenses, countryId, occurredAt: createdAt, note: 'مصروفات مرحّلة من ملف الحفظ السابق' });
    const difference = rawFinances.netProfit - (priorRevenue - priorExpenses);
    if (difference > 0) migratedEntries.push({ id: `legacy-adjustment-${value.id as string}`, category: 'revenue', amount: difference, countryId, occurredAt: createdAt, note: 'تسوية صافي الأرباح المرحّل' });
    if (difference < 0) migratedEntries.push({ id: `legacy-adjustment-${value.id as string}`, category: 'expense', amount: Math.abs(difference), countryId, occurredAt: createdAt, note: 'تسوية صافي الأرباح المرحّل' });
    ledger = migratedEntries;
  }
  const totalRevenue = sumCategory(ledger, 'revenue');
  const totalExpenses = sumCategory(ledger, 'expense');
  const rawBanking = isRecord(value.banking) ? value.banking : {};
  const banking = {
    deposits: Array.isArray(rawBanking.deposits) && rawBanking.deposits.every(isDeposit) ? rawBanking.deposits : [],
    loans: Array.isArray(rawBanking.loans) && rawBanking.loans.every(isLoan) ? rawBanking.loans : [],
  };
  const staff = Array.isArray(value.staff) && value.staff.every(isStaffContract) ? value.staff : [];
  const productionOrders = Array.isArray(value.productionOrders) && value.productionOrders.every(isProductionOrder) ? value.productionOrders : [];
  const auctionHistory = Array.isArray(value.auctionHistory) && value.auctionHistory.every(isAuctionBidRecord) ? value.auctionHistory : [];
  const redeemedCodeIds = Array.isArray(value.redeemedCodeIds) && value.redeemedCodeIds.every(isNonEmptyString) ? value.redeemedCodeIds : [];

  return normalizeAccountFeatures({
    id: value.id as string,
    accountCode: typeof value.accountCode === 'string' ? value.accountCode : '',
    name: value.name as string,
    level: value.level as number,
    countryId,
    createdAt,
    bankBalance: value.bankBalance as number,
    payables: isFiniteNonNegative(value.payables) ? value.payables : 0,
    goldGrams: value.goldGrams as number,
    goldCostBasis: isFiniteNonNegative(value.goldCostBasis) ? value.goldCostBasis : (value.goldGrams as number) * GOLD_PRICE_PER_GRAM,
    diamonds: isFiniteNonNegative(value.diamonds) ? Math.floor(value.diamonds) : 0,
    speedCards: Array.isArray(value.speedCards) ? value.speedCards as PlayerProfile['speedCards'] : [],
    badges: Array.isArray(value.badges) ? value.badges.filter(isNonEmptyString) : [],
    assets: value.assets as PlayerAsset[],
    lands,
    companies,
    finances: { netProfit: totalRevenue - totalExpenses, totalRevenue, totalExpenses },
    day,
    warehouseLevel: Number.isInteger(value.warehouseLevel) && (value.warehouseLevel as number) >= 1 && (value.warehouseLevel as number) <= 5 ? value.warehouseLevel as number : 1,
    activeDaySpeedMultiplier: value.activeDaySpeedMultiplier === 2 || value.activeDaySpeedMultiplier === 3 ? value.activeDaySpeedMultiplier : 1,
    inventory: Array.isArray(value.inventory) && value.inventory.every(isInventoryLot) ? value.inventory : [],
    licenses: Array.isArray(value.licenses) && value.licenses.every(isLicense) ? value.licenses : [],
    investments: Array.isArray(value.investments) && value.investments.every(isInvestment) ? value.investments : [],
    banking,
    staff,
    productionOrders,
    auctionHistory,
    redeemedCodeIds,
    sales: Array.isArray(value.sales) && value.sales.every(isSale) ? value.sales : [],
    ledger,
    events: Array.isArray(value.events) ? value.events as PlayerProfile['events'] : [],
    tasks: Array.isArray(value.tasks) && value.tasks.every(isTaskProgress) ? value.tasks : [],
    completedTaskIds: Array.isArray(value.completedTaskIds) && value.completedTaskIds.every(isNonEmptyString) ? value.completedTaskIds : [],
    readNotificationIds: Array.isArray(value.readNotificationIds) ? value.readNotificationIds.filter(isNonEmptyString).slice(-500) : [],
    dismissedNotificationIds: Array.isArray(value.dismissedNotificationIds) ? value.dismissedNotificationIds.filter(isNonEmptyString).slice(-500) : [],
    unreadProductionOrderIds: Array.isArray(value.unreadProductionOrderIds) ? value.unreadProductionOrderIds.filter(isNonEmptyString).slice(-500) : [],
    reputation: isFiniteNonNegative(value.reputation) ? Math.min(100, value.reputation as number) : 50,
    contracts: Array.isArray(value.contracts) && value.contracts.every(isBusinessContract) ? value.contracts : [],
    achievements: Array.isArray(value.achievements) && value.achievements.every(isAchievement) ? value.achievements : [],
    onboarding: isOnboardingProgress(value.onboarding) ? value.onboarding : { introCompleted: true, chapter: 1, seenGuides: [] },
  }, typeof value.accountCode === 'string' ? value.accountCode : value.id as string);
}

function isProfile(value: unknown): value is PlayerProfile {
  return migrateProfile(value) !== null;
}
export function normalizeSavedProfile(value: unknown): PlayerProfile | null {
  const profile = migrateProfile(value);
  return profile && isProfile(profile) ? profile : null;
}
export function loadSavedGame(accountId?: string): PlayerProfile | null {
  try {
    const raw = globalThis.localStorage?.getItem(saveKey(accountId)) ?? (accountId ? globalThis.localStorage?.getItem(SAVE_KEY) : null);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || !Array.from({ length: SAVE_VERSION }, (_, index) => index + 1).includes(value.version as number) || !isDateString(value.savedAt)) return null;
    const profile = normalizeSavedProfile(value.profile);
    if (!profile) return null;
    if (value.version !== SAVE_VERSION || JSON.stringify(value.profile) !== JSON.stringify(profile)) saveGame(profile, accountId);
    return profile;
  } catch {
    return null;
  }
}

export function saveGame(profile: PlayerProfile, accountId?: string): StorageResult {
  const canonical = migrateProfile(profile);
  if (!canonical || !isProfile(canonical)) return { ok: false, reason: 'invalid' };
  try {
    const envelope: SaveEnvelope = { version: SAVE_VERSION, savedAt: new Date().toISOString(), profile: canonical };
    globalThis.localStorage.setItem(saveKey(accountId), JSON.stringify(envelope));
    return { ok: true };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}
