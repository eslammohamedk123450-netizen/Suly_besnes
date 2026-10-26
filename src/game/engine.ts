import { findCountry, type IndustryId } from '../domain/countries';
import { type PlayerAsset, type PlayerCompany, type PlayerLand, type PlayerProfile, getDefaultAutomationDirectives } from '../domain/player';
import type { AuctionBidRecord, BusinessContract, DepositRecord, DepositTranche, FinanceLedgerEntry, ForwardSupplyContract, GameEventRecord, GlobalPaymentTerm, GlobalShipmentRecord, GlobalShippingMode, InventoryLot, InvestmentRecord, LoanRecord, ProductSale, ProductionOrder, StaffContract, StaffRole, AchievementRecord, AutomationDirectives } from '../domain/futureSystems';
import {
  DIRECT_COMPANY_CATALOG,
  DIRECT_LAND_CATALOG,
  getDirectCompaniesForCountry,
  getDirectLandsForCountry,
  GOLD_PRICE_PER_GRAM,
  findIndustry,
  findInvestment,
  findMaterial,
  findRecipeForIndustry,
  PRODUCT_CATALOG,
  RECIPE_CATALOG,
  TASK_CATALOG,
} from './catalog';
import { getMarketQuote } from './market';
import { isAuctionOpen, resolveAuctionListing } from './auctions';
import { getInvestmentPayoutRate, getOperatingCostProgression } from './economyBalance';
import { GAME_DAY_MS } from './time';
import { getContractOffers } from './contracts';
import { getSynergyOperatingMultiplier, getSynergyProductionMultiplier } from './synergy';
import {
  calculateImportQuote,
  getForwardContractTemplates,
  getGlobalExportBids,
  resolveGlobalMarketOffer,
} from './globalMarket';
import { getEconomicEventTemplate, type EconomicEventTemplate } from './economicEvents';
import { SPEED_CARD_DIAMOND_COSTS, SPEED_CARD_LABELS, type SpeedCardKind } from '../domain/accountFeatures';
import { getWarehouseCapacity, getWarehouseItemCapacity, getWarehouseMaterialQuantity, getWarehouseUsage, normalizeWarehouseLevel, removeWarehouseMaterials, WAREHOUSE_UPGRADE_REQUIREMENTS } from './warehouse';
import { getCashPriceForDiamondPrice, getDiscountedDiamondPrice, type PurchasePaymentMethod } from './purchasePricing';
import { claimLoginReward, claimSeasonChallenge, chooseSeasonEvent, LOGIN_REWARDS } from './season';
import { listPlayerAssetForAuction, settlePlayerAssetAuction, cancelPlayerAssetAuction } from './dynamicAuctions';
import { claimStarterMission } from './onboarding';

export type GameErrorCode =
  | 'invalid-input'
  | 'wrong-country'
  | 'not-found'
  | 'insufficient-funds'
  | 'insufficient-materials'
  | 'insufficient-energy'
  | 'land-required'
  | 'land-in-use'
  | 'wrong-land-type'
  | 'already-owned'
  | 'auction-lost'
  | 'storage-limit'
  | 'market-limit'
  | 'collateral-in-use'
  | 'deposit-not-mature'
  | 'factory-maintenance'
  | 'production-not-cancellable'
  | 'already-claimed'
  | 'condition-not-met';

export interface AuctionOutcome {
  listingId: string;
  winner: 'player' | 'bot';
  winningAmount: number;
  botBids: readonly { bidderId: string; amount: number }[];
  landId?: string;
  assetId?: string;
  inventoryLotId?: string;
  companyId?: string;
}

export interface ProductionOutcome {
  orderId: string;
  companyId: string;
  productId: string;
  batches: number;
  outputQuantity: number;
  completesOnDay: number;
}

export interface SaleOutcome {
  productId: string;
  quantity: number;
  grossRevenue: number;
  tax: number;
  costOfGoods: number;
  netRevenue: number;
}

export interface DayOutcome {
  day: number;
  operatingCost: number;
  paidOperatingCost: number;
  payables: number;
  investmentPayout: number;
  event: GameEventRecord;
}
export interface DayBriefing {
  day: number;
  operatingCost: number;
  existingPayables: number;
  maturingInvestments: readonly { id: string; name: string }[];
  event: EconomicEventTemplate;
  availableEnergy: number;
  energyPaused: boolean;
}

export interface InvestmentOutcome {
  investmentId: string;
  maturityDay: number;
  returnRate: number;
}

export interface GoldTradeOutcome {
  grams: number;
  cashAmount: number;
  pricePerGram: number;
}

export interface TaskOutcome {
  taskId: string;
  reward: number;
}

export type GameResult<T = undefined> =
  | { ok: true; profile: PlayerProfile; message: string; data: T }
  | { ok: false; profile: PlayerProfile; message: string; reason: GameErrorCode };

const DAY_MS = GAME_DAY_MS;

function timestampFor(profile: PlayerProfile): string {
  const base = Date.parse(profile.createdAt);
  return new Date((Number.isFinite(base) ? base : 0) + Math.max(0, profile.day - 1) * DAY_MS).toISOString();
}

function nextId(profile: PlayerProfile, prefix: string, collectionLength: number): string {
  return `${prefix}-${profile.day}-${collectionLength + 1}`;
}

function success<T>(profile: PlayerProfile, message: string, data: T): GameResult<T> {
  return { ok: true, profile, message, data };
}

function failure<T>(profile: PlayerProfile, reason: GameErrorCode, message: string): GameResult<T> {
  return { ok: false, profile, reason, message };
}

function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

interface PurchaseDebit {
  bankBalance: number;
  diamonds: number;
  diamondsSpent: number;
}

function resolvePurchaseDebit(
  profile: PlayerProfile,
  cashPrice: number,
  paymentMethod: PurchasePaymentMethod = 'cash',
  fixedDiamondPrice?: number,
): PurchaseDebit | { message: string } {
  if (paymentMethod !== 'cash' && paymentMethod !== 'diamonds') return { message: 'وسيلة الدفع غير صالحة.' };
  if (!Number.isFinite(cashPrice) || cashPrice <= 0) return { message: 'سعر الشراء غير صالح.' };
  if (paymentMethod === 'cash') {
    if (profile.bankBalance < cashPrice) return { message: 'لا يكفي رصيد البنك لإتمام عملية الشراء.' };
    return { bankBalance: profile.bankBalance - cashPrice, diamonds: profile.diamonds, diamondsSpent: 0 };
  }
  const diamondsSpent = fixedDiamondPrice ?? getDiscountedDiamondPrice(cashPrice);
  if (!Number.isInteger(diamondsSpent) || diamondsSpent < 1) return { message: 'قيمة السلعة أقل من حد الدفع بماسة كاملة؛ اختر الدفع نقدًا.' };
  if (profile.diamonds < diamondsSpent) return { message: `لا يكفي رصيد الماس؛ تحتاج إلى ${diamondsSpent} ماسة.` };
  return { bankBalance: profile.bankBalance, diamonds: profile.diamonds - diamondsSpent, diamondsSpent };
}

function unpaidSalaryTotal(profile: PlayerProfile): number {
  return profile.staff.filter((employee) => employee.status === 'active').reduce((sum, employee) => sum + (employee.unpaidSalary ?? 0), 0);
}

function addLedger(
  profile: PlayerProfile,
  entries: readonly FinanceLedgerEntry[],
  bankBalance: number,
  extra: Partial<PlayerProfile> = {},
): PlayerProfile {
  const currentPayables = Math.max(0, extra.payables ?? profile.payables);
  const cashInflow = Math.max(0, bankBalance - profile.bankBalance);
  const automaticSettlement = Math.min(currentPayables, cashInflow);
  const settlementEntries = automaticSettlement > 0
    ? [ledgerEntry(profile, 'settlement', automaticSettlement, 'سداد التزامات من إيراد حديث', entries.length)]
    : [];
  const ledger = [...(profile.ledger ?? []), ...entries, ...settlementEntries];
  const totalRevenue = ledger.filter((entry) => entry.category === 'revenue').reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpenses = ledger.filter((entry) => entry.category === 'expense').reduce((sum, entry) => sum + entry.amount, 0);
  return {
    ...profile,
    ...extra,
    bankBalance: Math.max(0, bankBalance - automaticSettlement),
    payables: currentPayables - automaticSettlement,
    ledger,
    finances: { netProfit: totalRevenue - totalExpenses, totalRevenue, totalExpenses },
  };
}

function ledgerEntry(
  profile: PlayerProfile,
  category: FinanceLedgerEntry['category'],
  amount: number,
  note: string,
  index: number,
): FinanceLedgerEntry {
  return { id: nextId(profile, 'ledger', (profile.ledger ?? []).length + index), category, amount, countryId: profile.countryId, occurredAt: timestampFor(profile), note };
}

function syncTasks(profile: PlayerProfile): PlayerProfile {
  const existing = new Map((profile.tasks ?? []).map((task) => [task.taskId, task]));
  const automaticBadges = [
    profile.companies.length > 0 ? 'شارة المؤسس' : null,
    profile.productionOrders.length > 0 ? 'مشغّل مصنع' : null,
    profile.sales.length >= 3 ? 'صائد السوق' : null,
    profile.staff.filter((member) => member.status === 'active').length >= 2 ? 'قائد فريق' : null,
    profile.investments.length > 0 || profile.banking.deposits.length > 0 ? 'عين على المستقبل' : null,
  ].filter((badge): badge is string => Boolean(badge));
  return {
    ...profile,
    tasks: TASK_CATALOG.map((task) => existing.get(task.id) ?? { taskId: task.id, claimed: false }),
    badges: [...new Set([...(profile.badges ?? []), ...automaticBadges])],
  };
}

function conditionMet(profile: PlayerProfile, condition: (typeof TASK_CATALOG)[number]['condition']): boolean {
  switch (condition) {
    case 'own-land': return profile.lands.length > 0;
    case 'own-company': return profile.companies.length > 0;
    case 'buy-material': return profile.ledger.some((entry) => entry.note.startsWith('شراء '));
    case 'run-production': return profile.productionOrders.length > 0;
    case 'sell-product': return profile.sales.length > 0;
    case 'make-investment': return profile.investments.length > 0;
    case 'reach-day-3': return profile.day >= 3;
  }
}

function ensureEgypt(profile: PlayerProfile): GameResult<never> | null {
  return findCountry(profile.countryId)
    ? null
    : failure(profile, 'wrong-country', 'الدولة المختارة غير صالحة.');
}

export function placeBid(profile: PlayerProfile, listingId: string, amount: number, targetCompanyId?: string): GameResult<AuctionOutcome> {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount <= 0) return failure(profile, 'invalid-input', 'قيمة العرض يجب أن تكون مبلغًا صحيحًا موجبًا.');
  const listing = resolveAuctionListing(profile, listingId);
  if (listing && !isAuctionOpen(profile, listing)) return failure(profile, 'not-found', 'المزاد غير موجود أو مغلق.');
  if (!listing) return failure(profile, 'not-found', 'المزاد غير موجود أو مغلق.');
  if (profile.lands.some((land) => land.id === listing.id) || profile.assets.some((asset) => asset.id === listing.id)
    || profile.ledger.some((entry) => entry.note.includes(listing.label))) return failure(profile, 'already-owned', 'لقد فزت بهذا المزاد بالفعل.');
  if (amount < listing.minimumBid) return failure(profile, 'invalid-input', 'يجب أن يساوي العرض الحد الأدنى للمزاد أو يتجاوزه.');

  // يبدأ المنافس الآلي بعرض واحد؛ غرفة المزاد تعرض الزيادات الحية قبل اعتماد فوز اللاعب.
  const highestBotBid = listing.minimumBid + listing.bidIncrement * 2;
  const botBids = [
    { bidderId: `${listing.id}-bot-a`, amount: listing.minimumBid + listing.bidIncrement },
    { bidderId: `${listing.id}-bot-b`, amount: highestBotBid },
  ];
  if (amount <= highestBotBid) {
    return failure(profile, 'auction-lost', `خسر عرضك المزاد؛ أعلى عرض منافس كان ${highestBotBid.toLocaleString('ar-EG')} $.`);
  }
  if (profile.bankBalance < amount) return failure(profile, 'insufficient-funds', 'لا يكفي رصيدك لتسديد العرض الفائز.');
  const auctionHistory: AuctionBidRecord[] = [
    ...profile.auctionHistory,
    ...botBids.map((bid, index) => ({ id: `${listing.id}-bot-${profile.auctionHistory.length + index}`, listingId, bidder: 'bot' as const, bidderId: bid.bidderId, amount: bid.amount, day: profile.day, occurredAt: timestampFor(profile) })),
    { id: `${listing.id}-player-${profile.auctionHistory.length}`, listingId, bidder: 'player' as const, bidderId: profile.id, amount, day: profile.day, occurredAt: timestampFor(profile) },
  ];

  const acquiredAt = timestampFor(profile);
  if (listing.lotType === 'factory') {
    const company = profile.companies.find((item) => item.id === targetCompanyId) ?? profile.companies[0];
    if (!company) return failure(profile, 'condition-not-met', 'أسس شركة أولًا حتى تربط بها خط الإنتاج الفائز بالمزاد.');
    const bonus = listing.energyCapacityBonus ?? 40;
    const companyId = company.id;
    const assetId = listing.id;
    const asset: PlayerAsset = { id: assetId, label: `مصنع إضافي: ${listing.label}`, value: amount, acquiredAt };
    const companies = profile.companies.map((item) => item.id === companyId
      ? { ...item, energyCapacity: (item.energyCapacity ?? 0) + bonus, energyUnits: (item.energyUnits ?? 0) + bonus }
      : item);
    const nextProfile = addLedger(
      { ...profile, assets: [...profile.assets, asset], companies, auctionHistory },
      [ledgerEntry(profile, 'asset', amount, `شراء مصنع بالمزاد: ${listing.label}`, 0)],
      profile.bankBalance - amount,
    );
    return success(syncTasks(nextProfile), `فزت بخط الإنتاج وربطته بشركة ${company.name}.`, { listingId, winner: 'player', winningAmount: amount, botBids, assetId, companyId });
  }
  if (listing.lotType === 'raw-material') {
    const material = findMaterial(listing.materialId ?? '');
    const quantity = listing.quantity ?? 0;
    if (!material || !isPositiveInteger(quantity)) return failure(profile, 'not-found', 'بيانات شحنة المزاد غير مكتملة.');
    const existing = profile.inventory.find((lot) => lot.materialOrProductId === material.id);
    const level = normalizeWarehouseLevel(profile.warehouseLevel);
    const itemLimit = getWarehouseItemCapacity(material.id, level) ?? material.storageLimit;
    const warehouseUsage = getWarehouseUsage(profile.inventory, profile.productionOrders);
    const warehouseCapacity = getWarehouseCapacity(level);
    if ((existing?.quantity ?? 0) + quantity > itemLimit || warehouseUsage.materials + quantity > warehouseCapacity.materials) return failure(profile, 'storage-limit', 'سعة المخزن لا تكفي لاستلام الشحنة الفائزة؛ طوّر المخزن أو أفرغ مساحة.');
    const inventoryLotId = existing?.id ?? nextId(profile, 'inventory', profile.inventory.length);
    const unitCost = amount / quantity;
    const inventory = existing
      ? profile.inventory.map((lot) => lot.id === existing.id ? { ...lot, quantity: lot.quantity + quantity, unitCost: (lot.quantity * lot.unitCost + amount) / (lot.quantity + quantity) } : lot)
      : [...profile.inventory, { id: inventoryLotId, materialOrProductId: material.id, quantity, unit: material.unit, unitCost }];
    const nextProfile = addLedger(
      { ...profile, inventory, auctionHistory },
      [ledgerEntry(profile, 'asset', amount, `شراء ${quantity} ${material.unit} من ${material.name} بالمزاد: ${listing.label}`, 0)],
      profile.bankBalance - amount,
    );
    return success(syncTasks(nextProfile), `فزت بشحنة ${quantity} ${material.unit} من ${material.name} وأُضيفت إلى المخزن.`, { listingId, winner: 'player', winningAmount: amount, botBids, inventoryLotId });
  }
  const land: PlayerLand = {
    id: listing.id,
    label: listing.label,
    areaSquareMeters: listing.areaSquareMeters,
    purchasePrice: amount,
    acquiredAt,
    acquiredOnDay: profile.day,
    availableForCompanyOnDay: profile.day + 1,
    landType: listing.landType,
  };
  const nextProfile = addLedger(
    { ...profile, lands: [...profile.lands, land], auctionHistory },
    [ledgerEntry(profile, 'asset', amount, `شراء أرض بالمزاد: ${listing.label}`, 0)],
    profile.bankBalance - amount,
  );
  return success(syncTasks(nextProfile), `تم الفوز بالمزاد. بدأ إنهاء عقود نقل الملكية؛ ستكون الأرض متاحة بعد يوم داخل اللعبة، في اليوم ${profile.day + 1}. تحلَّ بالصبر.`, {
    listingId,
    winner: 'player',
    winningAmount: amount,
    botBids,
    landId: land.id,
  });
}

export function buyDirectLand(profile: PlayerProfile, listingId: string, paymentMethod: PurchasePaymentMethod = 'cash'): GameResult<{ landId: string; price: number; diamondsSpent: number }> {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  const countryLands = getDirectLandsForCountry(profile.countryId);
  const listing = countryLands.find((entry) => entry.id === listingId) || DIRECT_LAND_CATALOG.find((entry) => entry.id === listingId);
  if (!listing) return failure(profile, 'not-found', 'عرض الأرض غير موجود.');
  if (profile.lands.some((land) => land.id === listing.id)) return failure(profile, 'already-owned', 'تم شراء هذه الأرض بالفعل.');
  const price = listing.price;
  const payment = resolvePurchaseDebit(profile, price, paymentMethod);
  if ('message' in payment) return failure(profile, 'insufficient-funds', payment.message);
  const land: PlayerLand = { id: listing.id, label: listing.label, areaSquareMeters: listing.areaSquareMeters, purchasePrice: price, acquiredAt: timestampFor(profile), acquiredOnDay: profile.day, availableForCompanyOnDay: profile.day + 1, landType: listing.landType };
  const nextProfile = addLedger(
    { ...profile, lands: [...profile.lands, land] },
    [ledgerEntry(profile, 'asset', price, `شراء أرض مباشر: ${listing.label}`, 0)],
    payment.bankBalance,
    { diamonds: payment.diamonds },
  );
  return success(syncTasks(nextProfile), `تم شراء ${listing.label} ${paymentMethod === 'diamonds' ? `مقابل ${payment.diamondsSpent} ماسة` : 'نقدًا'}. بدأ إنهاء عقود نقل الملكية؛ ستكون الأرض متاحة بعد يوم داخل اللعبة، في اليوم ${profile.day + 1}. تحلَّ بالصبر.`, { landId: land.id, price, diamondsSpent: payment.diamondsSpent });
}

export function buyDirectCompany(profile: PlayerProfile, listingId: string, paymentMethod: PurchasePaymentMethod = 'cash'): GameResult<{ companyId: string; landId: string; price: number; diamondsSpent: number }> {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  const countryCompanies = getDirectCompaniesForCountry(profile.countryId);
  const listing = countryCompanies.find((entry) => entry.id === listingId) || DIRECT_COMPANY_CATALOG.find((entry) => entry.id === listingId);
  const industry = listing ? findIndustry(listing.industryId) : undefined;
  if (!listing || !industry) return failure(profile, 'not-found', 'عرض الشركة غير موجود.');
  if (profile.companies.some((company) => company.id === listing.id)) return failure(profile, 'already-owned', 'تم شراء هذه الشركة بالفعل.');
  const price = listing.price;
  const payment = resolvePurchaseDebit(profile, price, paymentMethod);
  if ('message' in payment) return failure(profile, 'insufficient-funds', payment.message);
  const landId = `${listing.id}-land`;
  const licenseId = `${listing.id}-license`;
  const land: PlayerLand = { id: landId, label: `${listing.name} · أرض الشركة`, areaSquareMeters: listing.areaSquareMeters, purchasePrice: Math.floor(price * 0.45), acquiredAt: timestampFor(profile), acquiredOnDay: profile.day, availableForCompanyOnDay: profile.day + 1, landType: listing.landType };
  const company: PlayerCompany = { id: listing.id, name: listing.name, industryId: listing.industryId, countryId: profile.countryId, foundedAt: timestampFor(profile), operationalFromDay: profile.day + 1, landId, licenseIds: [licenseId], energyUnits: industry.energyCapacity, energyCapacity: industry.energyCapacity, operatingCostPerDay: industry.dailyOperatingCost };
  const license = { id: licenseId, countryId: profile.countryId, industryId: listing.industryId, feePaid: Math.floor(price * 0.15), issuedAt: timestampFor(profile) };
  const nextProfile = addLedger(
    { ...profile, lands: [...profile.lands, land], companies: [...profile.companies, company], licenses: [...profile.licenses, license] },
    [ledgerEntry(profile, 'asset', price, `شراء شركة مباشر: ${listing.name}`, 0)],
    payment.bankBalance,
    { diamonds: payment.diamonds },
  );
  return success(syncTasks(nextProfile), `تم شراء ${listing.name} ${paymentMethod === 'diamonds' ? `مقابل ${payment.diamondsSpent} ماسة` : 'نقدًا'}. يجري إنهاء عقود نقل الملكية، ويبدأ التشغيل بعد يوم داخل اللعبة في اليوم ${profile.day + 1}. تحلَّ بالصبر.`, { companyId: company.id, landId, price, diamondsSpent: payment.diamondsSpent });
}

export function sellLand(profile: PlayerProfile, landId: string): GameResult<{ landId: string; payout: number }> {
  const land = profile.lands.find((item) => item.id === landId);
  if (!land) return failure(profile, 'not-found', 'الأرض غير موجودة.');
  if (profile.companies.some((company) => company.landId === landId)) return failure(profile, 'condition-not-met', 'لا يمكن بيع أرض مرتبطة بشركة. بع الشركة أو انقلها أولًا.');
  const payout = Math.floor(land.purchasePrice * 0.5);
  const nextProfile = addLedger({ ...profile, lands: profile.lands.filter((item) => item.id !== landId) }, [ledgerEntry(profile, 'revenue', payout, `بيع أرض: ${land.label} بنصف القيمة`, 0)], profile.bankBalance + payout);
  return success(nextProfile, `تم بيع ${land.label} واسترداد 50% من قيمتها.`, { landId, payout });
}

export function upgradeLand(profile: PlayerProfile, landId: string, paymentMethod: PurchasePaymentMethod = 'cash'): GameResult<{ landId: string; level: number; cost: number; diamondsSpent: number }> {
  const land = profile.lands.find((item) => item.id === landId);
  if (!land) return failure(profile, 'not-found', 'الأرض غير موجودة.');
  const level = land.upgradeLevel ?? 1;
  if (level >= 5) return failure(profile, 'condition-not-met', 'وصلت الأرض إلى أعلى مستوى تطوير.');
  const cost = Math.round(80_000 * Math.pow(1.55, level - 1));
  const payment = resolvePurchaseDebit(profile, cost, paymentMethod);
  if ('message' in payment) return failure(profile, 'insufficient-funds', payment.message);
  const upgraded = { ...land, upgradeLevel: level + 1, areaSquareMeters: Math.round(land.areaSquareMeters * 1.1), purchasePrice: land.purchasePrice + cost };
  const nextProfile = addLedger({ ...profile, lands: profile.lands.map((item) => item.id === landId ? upgraded : item) }, [ledgerEntry(profile, 'expense', cost, `تطوير أرض ${land.label} إلى المستوى ${level + 1}`, 0)], payment.bankBalance, { diamonds: payment.diamonds });
  return success(nextProfile, `تم تطوير ${land.label} إلى المستوى ${level + 1} ${paymentMethod === 'diamonds' ? `مقابل ${payment.diamondsSpent} ماسة` : 'نقدًا'}.`, { landId, level: level + 1, cost, diamondsSpent: payment.diamondsSpent });
}

export function sellCompany(profile: PlayerProfile, companyId: string): GameResult<{ companyId: string; payout: number }> {
  const company = profile.companies.find((item) => item.id === companyId);
  if (!company) return failure(profile, 'not-found', 'الشركة غير موجودة.');
  if (profile.productionOrders.some((order) => order.companyId === companyId && order.status === 'active')) return failure(profile, 'condition-not-met', 'أوقف أو أكمل أوامر الإنتاج قبل بيع الشركة.');
  if (profile.staff.some((member) => member.companyId === companyId && member.status === 'active')) return failure(profile, 'condition-not-met', 'أنه عقود موظفي الشركة قبل بيعها.');
  const industry = findIndustry(company.industryId);
  const land = company.landId ? profile.lands.find((item) => item.id === company.landId) : undefined;
  const value = (industry?.setupFee ?? 0) + (industry?.licenseFee ?? 0) + (land?.purchasePrice ?? 0);
  const payout = Math.floor(value * 0.5);
  const nextProfile = addLedger({ ...profile, companies: profile.companies.filter((item) => item.id !== companyId), lands: land ? profile.lands.filter((item) => item.id !== land.id) : profile.lands, licenses: profile.licenses.filter((license) => !company.licenseIds?.includes(license.id)) }, [ledgerEntry(profile, 'revenue', payout, `بيع شركة: ${company.name} بنصف القيمة`, 0)], profile.bankBalance + payout);
  return success(nextProfile, `تم بيع ${company.name} واسترداد 50% من قيمة الشركة وأرضها.`, { companyId, payout });
}

export function sellAsset(profile: PlayerProfile, assetId: string): GameResult<{ assetId: string; payout: number }> {
  const asset = profile.assets.find((item) => item.id === assetId);
  if (!asset) return failure(profile, 'not-found', 'الأصل غير موجود.');
  const payout = Math.floor(asset.value * 0.5);
  const nextProfile = addLedger({ ...profile, assets: profile.assets.filter((item) => item.id !== assetId) }, [ledgerEntry(profile, 'revenue', payout, `بيع أصل: ${asset.label} بنصف القيمة`, 0)], profile.bankBalance + payout);
  return success(nextProfile, `تم بيع ${asset.label} واسترداد 50% من قيمته.`, { assetId, payout });
}

export function buyMaterial(profile: PlayerProfile, _materialId: string, _quantity: number): GameResult<{ materialId: string; quantity: number; totalCost: number }> {
  return failure(profile, 'condition-not-met', 'الشراء المباشر للمواد الخام غير متاح. استخدم عروض السوق أو المزاد.');
}

export interface GlobalTradePurchaseOptions {
  shippingMode?: GlobalShippingMode;
  paymentTerm?: GlobalPaymentTerm;
  fleetCount?: number;
}

export function buyGlobalMaterial(
  profile: PlayerProfile,
  offerId: string,
  quantity: number,
  negotiatedUnitPrice?: number,
  paymentMethod: PurchasePaymentMethod = 'cash',
  tradeOptions?: GlobalTradePurchaseOptions,
): GameResult<{ materialId: string; quantity: number; totalCost: number; unitPrice: number; diamondsSpent: number; inTransit?: boolean; arrivesOnDay?: number }> {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  if (!isPositiveInteger(quantity)) return failure(profile, 'invalid-input', 'الكمية يجب أن تكون عددًا صحيحًا موجبًا.');
  const offer = resolveGlobalMarketOffer(profile, offerId);
  const material = offer ? findMaterial(offer.materialId) : undefined;
  if (!offer || !material) return failure(profile, 'not-found', 'عرض السوق العالمي لم يعد متاحًا.');
  const minAllowedFloor = Math.max(1, Math.round(offer.floorPrice * 0.88));
  const unitPrice = negotiatedUnitPrice ?? offer.unitPrice;
  if (!Number.isInteger(unitPrice) || unitPrice < minAllowedFloor || unitPrice > offer.unitPrice || (!offer.negotiable && unitPrice !== offer.unitPrice)) {
    return failure(profile, 'invalid-input', 'السعر لا يطابق شروط العرض أو التفاوض.');
  }

  const shippingMode: GlobalShippingMode = tradeOptions?.shippingMode ?? 'spot-ddp';
  const quote = calculateImportQuote(profile, offer, quantity, {
    negotiatedUnitPrice: unitPrice,
    shippingMode,
    paymentTerm: tradeOptions?.paymentTerm ?? 'cash-spot',
    fleetCount: tradeOptions?.fleetCount,
  });

  const existing = profile.inventory.find((lot) => lot.materialOrProductId === material.id);
  const level = normalizeWarehouseLevel(profile.warehouseLevel);
  const itemLimit = getWarehouseItemCapacity(material.id, level) ?? material.storageLimit;
  const warehouseUsage = getWarehouseUsage(profile.inventory, profile.productionOrders);
  const warehouseCapacity = getWarehouseCapacity(level);
  const inTransitMatQty = (profile.globalShipments ?? [])
    .filter((s) => s.status === 'in-transit' && s.direction === 'import')
    .reduce((sum, s) => sum + s.quantity, 0);
  const inTransitSameItem = (profile.globalShipments ?? [])
    .filter((s) => s.status === 'in-transit' && s.direction === 'import' && s.itemId === material.id)
    .reduce((sum, s) => sum + s.quantity, 0);

  if (
    (existing?.quantity ?? 0) + inTransitSameItem + quantity > itemLimit ||
    warehouseUsage.materials + inTransitMatQty + quantity > warehouseCapacity.materials
  ) {
    const availItem = itemLimit - (existing?.quantity ?? 0) - inTransitSameItem;
    const availTotal = warehouseCapacity.materials - warehouseUsage.materials - inTransitMatQty;
    return failure(
      profile,
      'storage-limit',
      `لا تتسع سعة المخزن للكمية المطلوبة. المتاح ${Math.max(0, Math.min(availItem, availTotal))} ${material.unit}.`,
    );
  }

  const chargeAmount = paymentMethod === 'diamonds' ? quote.totalLandedCost : quote.upfrontCashDue;
  const payment = resolvePurchaseDebit(profile, chargeAmount, paymentMethod);
  if ('message' in payment) return failure(profile, 'insufficient-funds', payment.message);

  const prevTrust = profile.supplierTrust?.[offer.supplierId] ?? 0;
  const nextSupplierTrust = {
    ...(profile.supplierTrust ?? {}),
    [offer.supplierId]: Math.min(100, prevTrust + (quantity >= 25 ? 16 : 10)),
  };

  if (shippingMode === 'sea-cif') {
    const shipmentId = nextId(profile, 'shipment', (profile.globalShipments ?? []).length);
    const shipment: GlobalShipmentRecord = {
      id: shipmentId,
      direction: 'import',
      itemId: material.id,
      itemName: material.name,
      quantity,
      unit: material.unit,
      unitCostOrPrice: quote.effectiveUnitCost,
      freightCost: quote.freightCost,
      customsDuty: quote.customsDuty + quote.insuranceCost,
      shippingMode: 'sea-cif',
      originOrDestination: `${offer.originFlag} ${offer.originPort} · ${offer.originCountry}`,
      partnerName: offer.sellerName,
      qualityScore: offer.qualityScore,
      orderedOnDay: profile.day,
      arrivesOnDay: quote.arrivesOnDay,
      deferredBalanceDue: paymentMethod === 'diamonds' ? 0 : quote.deferredBalanceDue,
      status: 'in-transit',
    };
    const entries: FinanceLedgerEntry[] = [
      ledgerEntry(
        profile,
        'asset',
        chargeAmount,
        `استيراد بحري CIF (${quantity} ${material.unit} ${material.name}) من ${offer.originPort}`,
        0,
      ),
    ];
    const nextProfile = addLedger(
      {
        ...profile,
        globalShipments: [...(profile.globalShipments ?? []), shipment],
        supplierTrust: nextSupplierTrust,
      },
      entries,
      payment.bankBalance,
      { diamonds: payment.diamonds },
    );
    const lcNote =
      shipment.deferredBalanceDue > 0
        ? ` بنظام الاعتماد المستندي (سُدد 30% والباقي ${shipment.deferredBalanceDue.toLocaleString('ar-EG')} $ عند الوصول)`
        : '';
    return success(
      syncTasks(nextProfile),
      `أبحرت شحنة ${quantity} ${material.unit} من ${material.name} (${offer.originPort})${lcNote}؛ تصل للميناء في اليوم ${shipment.arrivesOnDay}.`,
      {
        materialId: material.id,
        quantity,
        totalCost: quote.totalLandedCost,
        unitPrice: quote.effectiveUnitCost,
        diamondsSpent: payment.diamondsSpent,
        inTransit: true,
        arrivesOnDay: shipment.arrivesOnDay,
      },
    );
  }

  const landedTotal = quote.totalLandedCost;
  const landedUnitCost = landedTotal / quantity;
  const inventory = existing
    ? profile.inventory.map((lot) =>
        lot.materialOrProductId === material.id
          ? {
              ...lot,
              quantity: lot.quantity + quantity,
              unitCost: (lot.quantity * lot.unitCost + landedTotal) / (lot.quantity + quantity),
              qualityScore: Math.round(
                (((lot.qualityScore ?? 88) * lot.quantity + offer.qualityScore * quantity) /
                  (lot.quantity + quantity)) *
                  10,
              ) / 10,
            }
          : lot,
      )
    : [
        ...profile.inventory,
        {
          id: nextId(profile, 'inventory', profile.inventory.length),
          materialOrProductId: material.id,
          quantity,
          unit: material.unit,
          unitCost: landedUnitCost,
          qualityScore: offer.qualityScore,
        },
      ];

  const entries: FinanceLedgerEntry[] = [
    ledgerEntry(
      profile,
      'asset',
      landedTotal,
      shippingMode === 'air-express'
        ? `استيراد جوي سريع (${quantity} ${material.unit} ${material.name}) من ${offer.originPort}`
        : `شراء عالمي ${quantity} ${material.unit} من ${offer.sellerName}`,
      0,
    ),
  ];

  const nextProfile = addLedger(
    { ...profile, inventory, supplierTrust: nextSupplierTrust },
    entries,
    payment.bankBalance,
    { diamonds: payment.diamonds },
  );
  return success(
    syncTasks(nextProfile),
    `تم قبول عرض ${offer.sellerName} واستلام ${quantity} ${material.name} (درجة ${offer.grade}) في المخزن ${paymentMethod === 'diamonds' ? `مقابل ${payment.diamondsSpent} ماسة` : 'نقدًا'}.`,
    {
      materialId: material.id,
      quantity,
      totalCost: landedTotal,
      unitPrice: landedUnitCost,
      diamondsSpent: payment.diamondsSpent,
      inTransit: false,
      arrivesOnDay: profile.day,
    },
  );
}

export function exportGlobalProduct(
  profile: PlayerProfile,
  bidId: string,
  quantity: number,
): GameResult<{ productId: string; quantity: number; netProceeds: number; reputationEarned: number }> {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  if (!isPositiveInteger(quantity)) {
    return failure(profile, 'invalid-input', 'كمية التصدير يجب أن تكون عددًا صحيحًا موجبًا.');
  }
  const bid = getGlobalExportBids(profile).find((item) => item.id === bidId);
  if (!bid) {
    return failure(profile, 'not-found', 'انتهت صلاحية طلب التصدير الدولي؛ راجع دفتر الطلبات المحدث.');
  }
  if (quantity < bid.minQuantity || quantity > bid.maxQuantity) {
    return failure(
      profile,
      'market-limit',
      `حجم الحاوية المطلوب لدى ${bid.buyerName} يتراوح بين ${bid.minQuantity} و${bid.maxQuantity} ${bid.unit}.`,
    );
  }
  const lot = profile.inventory.find((item) => item.materialOrProductId === bid.productId);
  if (!lot || lot.quantity < quantity) {
    return failure(profile, 'insufficient-materials', `لا تملك ${quantity} ${bid.unit} من ${bid.productName} في المخزن للتصدير.`);
  }
  const actualQuality = lot.qualityScore ?? 88;
  if (actualQuality < bid.minimumQuality) {
    return failure(
      profile,
      'condition-not-met',
      `جودة الشحنة الحالية (${Math.round(actualQuality)}%) أقل من معيار الاستيراد الدولي لدى ${bid.destinationPort} (${bid.minimumQuality}%). استخدم خامات Grade A+ أو عيّن مديراً لرفع الجودة.`,
    );
  }

  const grossRevenue = quantity * bid.unitPrice;
  const clearanceFee = Math.round(grossRevenue * bid.exportClearanceRate);
  const costOfGoods = Math.round(lot.unitCost * quantity);
  const netProceeds = grossRevenue - clearanceFee;

  const nextInventory = profile.inventory.flatMap((item) =>
    item.id !== lot.id
      ? [item]
      : item.quantity === quantity
        ? []
        : [{ ...item, quantity: item.quantity - quantity }],
  );

  const sale: ProductSale = {
    id: nextId(profile, 'sale', profile.sales.length),
    productId: bid.productId,
    quantity,
    unitPrice: bid.unitPrice,
    grossRevenue,
    tax: clearanceFee,
    costOfGoods,
    soldOnDay: profile.day,
    soldAt: timestampFor(profile),
  };

  const exportShipment: GlobalShipmentRecord = {
    id: nextId(profile, 'shipment', (profile.globalShipments ?? []).length),
    direction: 'export',
    itemId: bid.productId,
    itemName: bid.productName,
    quantity,
    unit: bid.unit,
    unitCostOrPrice: bid.unitPrice,
    freightCost: 0,
    customsDuty: clearanceFee,
    shippingMode: 'spot-ddp',
    originOrDestination: `${bid.destinationFlag} ${bid.destinationPort}`,
    partnerName: bid.buyerName,
    qualityScore: actualQuality,
    orderedOnDay: profile.day,
    arrivesOnDay: profile.day,
    deferredBalanceDue: 0,
    status: 'delivered',
  };

  const nextReputation = Math.min(100, (profile.reputation ?? 50) + bid.reputationReward);
  const nextProfile = addLedger(
    {
      ...profile,
      inventory: nextInventory,
      sales: [...profile.sales, sale],
      reputation: nextReputation,
      globalShipments: [...(profile.globalShipments ?? []).slice(-60), exportShipment],
    },
    [
      ledgerEntry(profile, 'revenue', grossRevenue, `تصدير دولي (${bid.incotermLabel}) إلى ${bid.destinationPort}: ${quantity} ${bid.productName}`, 0),
      ...(clearanceFee > 0 ? [ledgerEntry(profile, 'expense', clearanceFee, `رسوم تخليص وشحن تصديري (${bid.destinationPort})`, 1)] : []),
      ...(costOfGoods > 0 ? [ledgerEntry(profile, 'expense', costOfGoods, `تكلفة البضاعة المصدرة: ${bid.productName}`, 2)] : []),
    ],
    profile.bankBalance + netProceeds,
  );

  return success(
    syncTasks(nextProfile),
    `تم تصدير حاوية ${quantity} ${bid.unit} من ${bid.productName} إلى ${bid.destinationPort} بصافي عائد ${netProceeds.toLocaleString('ar-EG')} $ (+${bid.reputationReward} سمعة دولية).`,
    { productId: bid.productId, quantity, netProceeds, reputationEarned: bid.reputationReward },
  );
}

export function signForwardContract(
  profile: PlayerProfile,
  templateId: string,
): GameResult<ForwardSupplyContract> {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  const template = getForwardContractTemplates(profile).find((item) => item.id === templateId);
  if (!template) {
    return failure(profile, 'not-found', 'عقد التحوط الآجل غير متاح في هذه الجلسة.');
  }
  const activeCount = (profile.forwardContracts ?? []).filter((c) => c.status === 'active').length;
  if (activeCount >= 4) {
    return failure(profile, 'condition-not-met', 'لا يمكنك الاحتفاظ بأكثر من 4 عقود توريد آجلة نشطة في نفس الوقت.');
  }
  if ((profile.forwardContracts ?? []).some((c) => c.status === 'active' && c.materialId === template.materialId)) {
    return failure(profile, 'already-owned', `لديك عقد توريد آجل نشط بالفعل لمادة ${template.materialName}.`);
  }
  if (profile.bankBalance < template.marginDeposit) {
    return failure(
      profile,
      'insufficient-funds',
      `تحتاج إلى ${template.marginDeposit.toLocaleString('ar-EG')} $ كهامش تأمين (15%) لتثبيت سعر ${template.materialName}.`,
    );
  }

  const contract: ForwardSupplyContract = {
    id: nextId(profile, 'fwd', (profile.forwardContracts ?? []).length),
    materialId: template.materialId,
    materialName: template.materialName,
    supplierName: template.supplierName,
    originHub: template.originHub,
    lockedUnitPrice: template.lockedUnitPrice,
    dailyQuota: template.dailyQuota,
    remainingQuota: template.totalContractUnits,
    marginPaid: template.marginDeposit,
    startedOnDay: profile.day,
    expiresOnDay: profile.day + template.durationDays,
    qualityScore: template.qualityScore,
    status: 'active',
  };

  const prevTrust = profile.supplierTrust?.[template.supplierId] ?? 0;
  const nextProfile = addLedger(
    {
      ...profile,
      forwardContracts: [...(profile.forwardContracts ?? []), contract],
      supplierTrust: {
        ...(profile.supplierTrust ?? {}),
        [template.supplierId]: Math.min(100, prevTrust + 15),
      },
    },
    [
      ledgerEntry(
        profile,
        'asset',
        template.marginDeposit,
        `هامش تأمين عقد توريد آجل (15%) · ${template.materialName} بسعر مثبت ${template.lockedUnitPrice} $`,
        0,
      ),
    ],
    profile.bankBalance - template.marginDeposit,
  );

  return success(
    nextProfile,
    `تم توقيع عقد التوريد الآجل لمادة ${template.materialName} بسعر مثبت ${template.lockedUnitPrice.toLocaleString('ar-EG')} $ حتى اليوم ${contract.expiresOnDay}.`,
    contract,
  );
}

export function drawFromForwardContract(
  profile: PlayerProfile,
  contractId: string,
  quantity: number,
): GameResult<{ contractId: string; materialId: string; quantity: number; cashPaid: number }> {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  if (!isPositiveInteger(quantity)) {
    return failure(profile, 'invalid-input', 'الكمية المسحوبة يجب أن تكون عددًا صحيحًا موجبًا.');
  }
  const contract = (profile.forwardContracts ?? []).find((c) => c.id === contractId && c.status === 'active');
  if (!contract) {
    return failure(profile, 'not-found', 'العقد الآجل غير موجود أو انتهت صلاحيته.');
  }
  if (profile.day > contract.expiresOnDay) {
    return failure(profile, 'condition-not-met', 'انتهت صلاحية هذا العقد الآجل.');
  }
  if (quantity > contract.remainingQuota) {
    return failure(
      profile,
      'market-limit',
      `الرصيد المتبقي في العقد الآجل هو ${contract.remainingQuota} وحدة فقط.`,
    );
  }
  const material = findMaterial(contract.materialId);
  if (!material) return failure(profile, 'not-found', 'المادة الخام غير معروفة.');

  const existing = profile.inventory.find((lot) => lot.materialOrProductId === material.id);
  const level = normalizeWarehouseLevel(profile.warehouseLevel);
  const itemLimit = getWarehouseItemCapacity(material.id, level) ?? material.storageLimit;
  const warehouseUsage = getWarehouseUsage(profile.inventory, profile.productionOrders);
  const warehouseCapacity = getWarehouseCapacity(level);
  if ((existing?.quantity ?? 0) + quantity > itemLimit || warehouseUsage.materials + quantity > warehouseCapacity.materials) {
    return failure(profile, 'storage-limit', 'سعة المخزن لا تكفي لاستلام الدفعة المسحوبة من العقد الآجل.');
  }

  // 15% was already paid as margin deposit upon signing; player pays the remaining 85% upon delivery
  const settlementDue = Math.max(1, Math.round(quantity * contract.lockedUnitPrice * 0.85));
  if (profile.bankBalance < settlementDue) {
    return failure(
      profile,
      'insufficient-funds',
      `تحتاج إلى ${settlementDue.toLocaleString('ar-EG')} $ لتسوية 85% المتبقية من قيمة الدفعة المسحوبة.`,
    );
  }

  const totalLotValue = quantity * contract.lockedUnitPrice;
  const inventory = existing
    ? profile.inventory.map((lot) =>
        lot.materialOrProductId === material.id
          ? {
              ...lot,
              quantity: lot.quantity + quantity,
              unitCost: (lot.quantity * lot.unitCost + totalLotValue) / (lot.quantity + quantity),
              qualityScore: Math.round(
                (((lot.qualityScore ?? 88) * lot.quantity + contract.qualityScore * quantity) /
                  (lot.quantity + quantity)) *
                  10,
              ) / 10,
            }
          : lot,
      )
    : [
        ...profile.inventory,
        {
          id: nextId(profile, 'inventory', profile.inventory.length),
          materialOrProductId: material.id,
          quantity,
          unit: material.unit,
          unitCost: contract.lockedUnitPrice,
          qualityScore: contract.qualityScore,
        },
      ];

  const remainingQuota = contract.remainingQuota - quantity;
  const updatedContracts = (profile.forwardContracts ?? []).map((c) =>
    c.id === contract.id
      ? { ...c, remainingQuota, status: remainingQuota === 0 ? ('completed' as const) : ('active' as const) }
      : c,
  );

  const nextProfile = addLedger(
    { ...profile, inventory, forwardContracts: updatedContracts },
    [
      ledgerEntry(
        profile,
        'asset',
        settlementDue,
        `سحب ${quantity} ${material.unit} ${material.name} من عقد التحوط الآجل بسعر مثبت ${contract.lockedUnitPrice} $`,
        0,
      ),
    ],
    profile.bankBalance - settlementDue,
  );

  return success(
    syncTasks(nextProfile),
    `تم استلام ${quantity} ${material.unit} من ${material.name} بالسعر المثبت (${contract.lockedUnitPrice} $ / ${material.unit}).`,
    { contractId: contract.id, materialId: material.id, quantity, cashPaid: settlementDue },
  );
}

export function upgradeWarehouse(profile: PlayerProfile, paymentMethod: PurchasePaymentMethod = 'cash'): GameResult<{ level: number; cost: number; diamondsSpent: number; capacity: ReturnType<typeof getWarehouseCapacity> }> {
  const currentLevel = normalizeWarehouseLevel(profile.warehouseLevel);
  const nextLevel = currentLevel + 1;
  const requirement = WAREHOUSE_UPGRADE_REQUIREMENTS[nextLevel];
  if (!requirement) return failure(profile, 'condition-not-met', 'وصل المخزن إلى أعلى مستوى تطوير.');
  const payment = resolvePurchaseDebit(profile, requirement.cash, paymentMethod);
  if ('message' in payment) return failure(profile, 'insufficient-funds', `تحتاج إلى ${requirement.cash.toLocaleString('ar-EG')} $ أو ما يعادلها بالماس لتطوير المخزن. ${payment.message}`);
  const missing = Object.entries(requirement.materials).filter(([materialId, quantity]) => getWarehouseMaterialQuantity(profile, materialId) < quantity);
  if (missing.length > 0) {
    const labels = missing.map(([materialId, quantity]) => {
      const material = findMaterial(materialId);
      const owned = getWarehouseMaterialQuantity(profile, materialId);
      return `${material?.name ?? materialId}: ${Math.max(0, quantity - owned)} ${material?.unit ?? 'وحدة'}`;
    });
    return failure(profile, 'insufficient-materials', `مواد تطوير المخزن غير مكتملة: ${labels.join('، ')}.`);
  }
  const inventory = removeWarehouseMaterials(profile, requirement.materials);
  const materialValue = Object.entries(requirement.materials).reduce((sum, [materialId, quantity]) => sum + quantity * (findMaterial(materialId)?.pricePerUnit ?? 0), 0);
  const entries = [
    ledgerEntry(profile, 'expense', requirement.cash, `تطوير المخزن إلى المستوى ${nextLevel}`, 0),
    ...(materialValue > 0 ? [ledgerEntry(profile, 'expense', materialValue, 'مواد خام مستهلكة في تطوير المخزن', 1)] : []),
  ];
  const capacity = getWarehouseCapacity(nextLevel);
  const nextProfile = addLedger({ ...profile, inventory, warehouseLevel: nextLevel }, entries, payment.bankBalance, { diamonds: payment.diamonds });
  return success(nextProfile, `تم تطوير المخزن إلى المستوى ${nextLevel} ${paymentMethod === 'diamonds' ? `مقابل ${payment.diamondsSpent} ماسة` : 'نقدًا'}. سعة الخامات ${capacity.materials.toLocaleString('ar-EG')} وحدة وسعة المنتجات ${capacity.products.toLocaleString('ar-EG')} وحدة.`, { level: nextLevel, cost: requirement.cash, diamondsSpent: payment.diamondsSpent, capacity });
}

export function foundCompany(profile: PlayerProfile, industryId: IndustryId, landId: string, name: string, paymentMethod: PurchasePaymentMethod = 'cash'): GameResult<{ companyId: string; totalCost: number; diamondsSpent: number }> {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  const industry = findIndustry(industryId);
  const country = findCountry(profile.countryId);
  if (!industry || !country) return failure(profile, 'not-found', 'القطاع أو الدولة غير موجود.');
  const land = profile.lands.find((item) => item.id === landId);
  if (!land) return failure(profile, 'land-required', 'تحتاج إلى أرض مملوكة لتأسيس الشركة.');
  if ((land.availableForCompanyOnDay ?? land.acquiredOnDay ?? 1) > profile.day) return failure(profile, 'condition-not-met', `الأرض قيد إنهاء عقود نقل الملكية، وستتاح للتأسيس في اليوم ${land.availableForCompanyOnDay}.`);
  if (profile.companies.some((company) => company.landId === landId)) return failure(profile, 'land-in-use', 'الأرض مرتبطة بشركة أخرى بالفعل.');
  if (land.landType && land.landType !== industry.requiredLandType) return failure(profile, 'wrong-land-type', 'نوع الأرض لا يناسب هذا القطاع.');
  const companyName = name.trim();
  if (!companyName) return failure(profile, 'invalid-input', 'أدخل اسمًا للشركة.');
  const setupFee = country.economy.companySetupFee ?? industry.setupFee;
  const licenseFee = country.economy.licenseFeesByIndustry[industryId] ?? industry.licenseFee;
  const totalCost = setupFee + licenseFee;
  const payment = resolvePurchaseDebit(profile, totalCost, paymentMethod);
  if ('message' in payment) return failure(profile, 'insufficient-funds', `لا يكفي رصيدك لرسوم التأسيس والترخيص. ${payment.message}`);

  const companyId = nextId(profile, 'company', profile.companies.length);
  const licenseId = nextId(profile, 'license', profile.licenses.length);
  const company: PlayerCompany = {
    id: companyId,
    name: companyName,
    industryId,
    countryId: profile.countryId,
    foundedAt: timestampFor(profile),
    foundedOnDay: profile.day,
    landId,
    licenseIds: [licenseId],
    energyUnits: industry.energyCapacity,
    energyCapacity: industry.energyCapacity,
    operatingCostPerDay: industry.dailyOperatingCost,
  };
  const license = { id: licenseId, countryId: profile.countryId, industryId, feePaid: licenseFee, issuedAt: timestampFor(profile) };
  const nextProfile = addLedger(
    { ...profile, companies: [...profile.companies, company], licenses: [...profile.licenses, license] },
    [
      ledgerEntry(profile, 'expense', setupFee, `رسوم تأسيس شركة ${companyName}`, 0),
      ledgerEntry(profile, 'expense', licenseFee, `ترخيص قطاع ${industry.name}`, 1),
    ],
    payment.bankBalance,
    { diamonds: payment.diamonds },
  );
  return success(syncTasks(nextProfile), `تم تأسيس ${companyName} وترخيصها ${paymentMethod === 'diamonds' ? `مقابل ${payment.diamondsSpent} ماسة` : 'نقدًا'}.`, { companyId, totalCost, diamondsSpent: payment.diamondsSpent });
}

export function upgradeCompany(profile: PlayerProfile, companyId: string, paymentMethod: PurchasePaymentMethod = 'cash'): GameResult<{ companyId: string; level: number; cost: number; diamondsSpent: number }> {
  const company = profile.companies.find((item) => item.id === companyId);
  if (!company) return failure(profile, 'not-found', 'الشركة غير موجودة.');
  const level = company.upgradeLevel ?? 1;
  if (level >= 5) return failure(profile, 'condition-not-met', 'وصلت هذه الشركة إلى أعلى مستوى تطوير.');
  const completedBatches = profile.productionOrders
    .filter((order) => order.companyId === companyId && order.status === 'completed')
    .reduce((sum, order) => sum + order.batches, 0);
  const requiredBatches = level * 2;
  if (completedBatches < requiredBatches) return failure(profile, 'condition-not-met', `تحتاج إلى إكمال ${requiredBatches} دفعات إنتاج قبل الوصول إلى المستوى ${level + 1}. أكملت ${completedBatches}.`);
  const cost = Math.round(120_000 * Math.pow(1.55, level - 1));
  const payment = resolvePurchaseDebit(profile, cost, paymentMethod);
  if ('message' in payment) return failure(profile, 'insufficient-funds', `تحتاج إلى ${cost.toLocaleString('ar-EG')} $ أو ما يعادلها بالماس لتطوير الشركة. ${payment.message}`);
  const capacityBonus = 20 * level;
  const companies = profile.companies.map((item) => item.id === companyId
    ? { ...item, upgradeLevel: level + 1, energyCapacity: (item.energyCapacity ?? 0) + capacityBonus, energyUnits: (item.energyUnits ?? 0) + capacityBonus, maintenanceCondition: 100 }
    : item);
  const nextProfile = addLedger({ ...profile, companies }, [ledgerEntry(profile, 'expense', cost, `تطوير ${company.name} إلى المستوى ${level + 1}`, 0)], payment.bankBalance, { diamonds: payment.diamonds });
  return success(nextProfile, `تم تطوير ${company.name} إلى المستوى ${level + 1} ${paymentMethod === 'diamonds' ? `مقابل ${payment.diamondsSpent} ماسة` : 'نقدًا'} وزادت طاقتها.`, { companyId, level: level + 1, cost, diamondsSpent: payment.diamondsSpent });
}

export function runProduction(profile: PlayerProfile, companyId: string, batches: number): GameResult<ProductionOutcome> {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  if (!isPositiveInteger(batches)) return failure(profile, 'invalid-input', 'عدد دفعات الإنتاج يجب أن يكون عددًا صحيحًا موجبًا.');
  const company = profile.companies.find((item) => item.id === companyId);
  if (!company) return failure(profile, 'not-found', 'الشركة غير موجودة.');
  if ((company.operationalFromDay ?? 1) > profile.day) return failure(profile, 'condition-not-met', `يجري إنهاء عقود نقل الملكية؛ يبدأ تشغيل الشركة في اليوم ${company.operationalFromDay}.`);
  const recipe = findRecipeForIndustry(company.industryId);
  if (!recipe) return failure(profile, 'not-found', 'لا توجد وصفة لهذا القطاع.');
  const product = PRODUCT_CATALOG.find((item) => item.id === recipe.productId);
  if (!product) return failure(profile, 'not-found', 'المنتج الناتج غير موجود في الكتالوج.');
  const maintenanceCondition = company.maintenanceCondition ?? 100;
  if (maintenanceCondition < 25) return failure(profile, 'factory-maintenance', 'المصنع متعطل ويحتاج إلى صيانة قبل بدء أمر جديد.');
  const energyAvailable = company.energyUnits ?? 0;
  if (energyAvailable < batches * recipe.energyUnits) return failure(profile, 'insufficient-energy', 'الطاقة المتاحة لا تكفي لهذه الدفعات.');
  for (const input of recipe.inputs) {
    const lot = profile.inventory.find((item) => item.materialOrProductId === input.materialId);
    if (!lot || lot.quantity < input.quantity * batches) return failure(profile, 'insufficient-materials', 'المواد الخام لا تكفي لهذه الدفعات.');
  }
  const energyCost = batches * recipe.energyCost;
  const maintenanceCost = Math.round((company.operatingCostPerDay ?? 0) * 0.15 * getOperatingCostProgression(profile.day));
  if (profile.bankBalance < energyCost + maintenanceCost) return failure(profile, 'insufficient-funds', 'لا يكفي الرصيد لتكلفة الطاقة والصيانة لهذا الأمر.');
  const materialCost = recipe.inputs.reduce((sum, input) => {
    const lot = profile.inventory.find((item) => item.materialOrProductId === input.materialId);
    return sum + input.quantity * batches * (lot?.unitCost ?? 0);
  }, 0);
  const currentProductQuantity = profile.inventory.find((lot) => lot.materialOrProductId === product.id)?.quantity ?? 0;
  const plannedProductQuantity = profile.productionOrders
    .filter((order) => order.status === 'active' && order.productId === product.id)
    .reduce((sum, order) => sum + order.outputQuantity, 0);
  const outputQuantity = Math.max(recipe.outputQuantity, Math.round(batches * recipe.outputQuantity * getSynergyProductionMultiplier(profile)));
  const warehouseLevel = normalizeWarehouseLevel(profile.warehouseLevel);
  const itemProductLimit = getWarehouseItemCapacity(product.id, warehouseLevel) ?? product.storageLimit;
  const warehouseUsage = getWarehouseUsage(profile.inventory, profile.productionOrders);
  const warehouseCapacity = getWarehouseCapacity(warehouseLevel);
  if (currentProductQuantity + plannedProductQuantity + outputQuantity > itemProductLimit || warehouseUsage.products + outputQuantity > warehouseCapacity.products) {
    const itemAvailable = itemProductLimit - currentProductQuantity - plannedProductQuantity;
    const totalAvailable = warehouseCapacity.products - warehouseUsage.products;
    return failure(profile, 'storage-limit', `سعة المخزن لا تكفي للإنتاج المخطط؛ المتاح لهذا المنتج ${Math.max(0, itemAvailable)} ${product.unit}، والسعة الكلية المتبقية ${Math.max(0, totalAvailable)} وحدة.`);
  }

  const inventory = profile.inventory.map((lot) => {
    const input = recipe.inputs.find((item) => item.materialId === lot.materialOrProductId);
    return input ? { ...lot, quantity: lot.quantity - input.quantity * batches } : lot;
  }).filter((lot) => lot.quantity > 0);
  const companies = profile.companies.map((item) => item.id === companyId ? { ...item, energyUnits: energyAvailable - batches * recipe.energyUnits } : item);
  const manager = profile.staff.find((member) => member.status === 'active' && member.role === 'manager' && member.companyId === companyId);
  const managerLevel = staffLevel(manager);
  const foreman = profile.staff.find((member) => member.status === 'active' && member.role === 'foreman' && member.companyId === companyId);
  const foremanLevel = staffLevel(foreman);
  const baseDays = Math.ceil(batches / 3);
  const timeReduction = (manager ? 1 : 0) + (foreman && batches >= 2 ? 1 : 0);
  const durationDays = Math.min(3, Math.max(1, baseDays - timeReduction));
  const inputQualities = recipe.inputs.map((input) => {
    const lot = profile.inventory.find((item) => item.materialOrProductId === input.materialId);
    return lot?.qualityScore ?? 88;
  });
  const avgInputQuality =
    inputQualities.length > 0
      ? inputQualities.reduce((sum, q) => sum + q, 0) / inputQualities.length
      : 88;
  const materialQualityDelta = Math.round((avgInputQuality - 88) * 0.7);
  const marketForecast = getMarketQuote(profile, recipe.productId, profile.day + durationDays);
  const foremanQualityBonus = foreman ? 5 + (foremanLevel - 1) * 2 : 0;
  const qualityScore = Math.max(70, Math.min(100, 86 + materialQualityDelta + (manager ? 10 + (managerLevel - 1) * 3 : 0) + foremanQualityBonus - (maintenanceCondition < 60 ? 10 : 0)));
  const materialWasteDiscount = foreman ? 0.05 + (foremanLevel - 1) * 0.025 : 0;
  const effectiveMaterialCost = Math.round(materialCost * (1 - materialWasteDiscount));
  const expectedUnitCost = (effectiveMaterialCost + energyCost + maintenanceCost) / outputQuantity;
  const nextMaintenanceCondition = Math.max(0, maintenanceCondition - Math.max(8, Math.ceil(batches / 2)));
  const order: ProductionOrder = { id: nextId(profile, 'production', profile.productionOrders.length), companyId, productId: recipe.productId, productName: recipe.productName, batches, outputQuantity, outputUnit: recipe.outputUnit, materialCost: effectiveMaterialCost, energyCost, expectedUnitCost, demandForecast: marketForecast?.demandUnits ?? 0, qualityScore, maintenanceCost, startedOnDay: profile.day, completesOnDay: profile.day + durationDays, status: 'active' };
  const companiesWithMaintenance = companies.map((item) => item.id === companyId ? { ...item, maintenanceCondition: nextMaintenanceCondition } : item);
  const nextProfile = addLedger(
    { ...profile, inventory, companies: companiesWithMaintenance, productionOrders: [...profile.productionOrders, order] },
    [ledgerEntry(profile, 'expense', energyCost, `حجز طاقة لأمر إنتاج ${recipe.productName}`, 0), ledgerEntry(profile, 'expense', maintenanceCost, `صيانة وقائية لأمر إنتاج ${recipe.productName}`, 1), ledgerEntry(profile, 'asset', effectiveMaterialCost, `حجز مواد لأمر إنتاج ${recipe.productName}${foreman ? ' (مع وفورات رئيس العمال)' : ''}`, 2)],
    profile.bankBalance - energyCost - maintenanceCost,
  );
  return success(syncTasks(nextProfile), `بدأ أمر إنتاج ${recipe.productName} ويكتمل في اليوم ${order.completesOnDay}.`, { orderId: order.id, companyId, productId: recipe.productId, batches, outputQuantity, completesOnDay: order.completesOnDay });
}

export function autoSupplyAndProduce(profile: PlayerProfile, companyId: string, batches: number): GameResult<ProductionOutcome> {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  if (!isPositiveInteger(batches)) return failure(profile, 'invalid-input', 'عدد دفعات الإنتاج يجب أن يكون عددًا صحيحًا موجبًا.');
  const company = profile.companies.find((item) => item.id === companyId);
  if (!company) return failure(profile, 'not-found', 'الشركة غير موجودة.');
  if ((company.operationalFromDay ?? 1) > profile.day) return failure(profile, 'condition-not-met', `يجري إنهاء عقود نقل الملكية؛ يبدأ تشغيل الشركة في اليوم ${company.operationalFromDay}.`);
  const recipe = findRecipeForIndustry(company.industryId);
  if (!recipe) return failure(profile, 'not-found', 'لا توجد وصفة لهذا القطاع.');

  let missingCost = 0;
  const purchases: { materialId: string; quantity: number; unitPrice: number; cost: number; name: string }[] = [];
  for (const input of recipe.inputs) {
    const lot = profile.inventory.find((item) => item.materialOrProductId === input.materialId);
    const needed = input.quantity * batches;
    const owned = lot?.quantity ?? 0;
    if (owned < needed) {
      const missing = needed - owned;
      const mat = findMaterial(input.materialId);
      const unitPrice = mat?.pricePerUnit ?? 100;
      const cost = missing * unitPrice;
      missingCost += cost;
      purchases.push({ materialId: input.materialId, quantity: missing, unitPrice, cost, name: mat?.name ?? input.materialId });
    }
  }

  const energyCost = batches * recipe.energyCost;
  const maintenanceCost = Math.round((company.operatingCostPerDay ?? 0) * 0.15 * getOperatingCostProgression(profile.day));
  const totalFundsNeeded = missingCost + energyCost + maintenanceCost;

  if (profile.bankBalance < totalFundsNeeded) {
    return failure(profile, 'insufficient-funds', `تحتاج إلى ${totalFundsNeeded.toLocaleString('ar-EG')} $ لتأمين الخامات المطلوبة والطاقة والصيانة.`);
  }

  if (purchases.length > 0) {
    const level = normalizeWarehouseLevel(profile.warehouseLevel);
    const warehouseCapacity = getWarehouseCapacity(level);
    const warehouseUsage = getWarehouseUsage(profile.inventory, profile.productionOrders);
    const totalNewMaterials = purchases.reduce((sum, p) => sum + p.quantity, 0);
    if (warehouseUsage.materials + totalNewMaterials > warehouseCapacity.materials) {
      return failure(profile, 'storage-limit', `سعة تخزين المواد الخام في المخزن لا تكفي لاستيعاب الخامات الناقصة (${totalNewMaterials} وحدة).`);
    }
  }

  let updatedInventory = [...profile.inventory];
  const ledgerEntries: FinanceLedgerEntry[] = [];
  for (const p of purchases) {
    const existing = updatedInventory.find((lot) => lot.materialOrProductId === p.materialId);
    if (existing) {
      const newQuantity = existing.quantity + p.quantity;
      const newUnitCost = (existing.quantity * existing.unitCost + p.cost) / newQuantity;
      updatedInventory = updatedInventory.map((lot) => lot.materialOrProductId === p.materialId ? { ...lot, quantity: newQuantity, unitCost: newUnitCost } : lot);
    } else {
      updatedInventory.push({
        id: nextId(profile, 'inventory', updatedInventory.length),
        materialOrProductId: p.materialId,
        quantity: p.quantity,
        unit: findMaterial(p.materialId)?.unit ?? 'وحدة',
        unitCost: p.unitPrice,
      });
    }
    ledgerEntries.push(ledgerEntry(profile, 'expense', p.cost, `شراء خامات تشغيل فورية: ${p.name} (${p.quantity} وحدة)`, ledgerEntries.length));
  }

  const suppliedProfile = purchases.length > 0
    ? addLedger(
        { ...profile, inventory: updatedInventory },
        ledgerEntries,
        profile.bankBalance - missingCost,
      )
    : profile;

  const productionResult = runProduction(suppliedProfile, companyId, batches);
  if (!productionResult.ok) return productionResult;

  const supplyMsg = purchases.length > 0
    ? `تم تأمين الخامات الناقصة بقيمة ${missingCost.toLocaleString('ar-EG')} $ و`
    : '';
  return {
    ...productionResult,
    message: `${supplyMsg}${productionResult.message}`,
  };
}

export function serviceCompany(profile: PlayerProfile, companyId: string): GameResult<{ companyId: string; cost: number }> {
  const company = profile.companies.find((item) => item.id === companyId);
  if (!company) return failure(profile, 'not-found', 'الشركة غير موجودة.');
  const cost = Math.max(5_000, Math.round((company.operatingCostPerDay ?? 0) * 0.4 * getOperatingCostProgression(profile.day)));
  if (profile.bankBalance < cost) return failure(profile, 'insufficient-funds', 'لا يكفي الرصيد لإجراء صيانة المصنع.');
  const nextProfile = addLedger(
    { ...profile, companies: profile.companies.map((item) => item.id === companyId ? { ...item, maintenanceCondition: 100 } : item) },
    [ledgerEntry(profile, 'expense', cost, `صيانة كاملة للمصنع: ${company.name}`, 0)],
    profile.bankBalance - cost,
  );
  return success(nextProfile, `تمت صيانة ${company.name} وعادت كفاءة المصنع إلى 100%.`, { companyId, cost });
}

export function cancelProductionOrder(profile: PlayerProfile, orderId: string): GameResult<{ orderId: string; refund: number }> {
  const order = profile.productionOrders.find((item) => item.id === orderId);
  if (!order) return failure(profile, 'not-found', 'أمر الإنتاج غير موجود.');
  if (order.status !== 'active') return failure(profile, 'production-not-cancellable', 'لا يمكن إلغاء أمر مكتمل أو ملغى.');
  const refund = Math.round(order.materialCost * 0.7);
  const unrecoveredMaterialCost = Math.max(0, order.materialCost - refund);
  const nextProfile = addLedger(
    { ...profile, productionOrders: profile.productionOrders.map((item) => item.id === orderId ? { ...item, status: 'cancelled' as const } : item) },
    [ledgerEntry(profile, 'settlement', refund, `استرداد 70% من حجز أمر الإنتاج ${order.productName}`, 0), ...(unrecoveredMaterialCost > 0 ? [ledgerEntry(profile, 'expense', unrecoveredMaterialCost, `خسارة مواد غير مستردة لأمر ${order.productName}`, 1)] : [])],
    profile.bankBalance + refund,
  );
  return success(nextProfile, `تم إلغاء الأمر واسترداد ${refund.toLocaleString('ar-EG')} $ من الحجز.`, { orderId, refund });
}

export function useProductionSpeedCard(profile: PlayerProfile, orderId: string, kind: SpeedCardKind): GameResult<{ orderId: string; kind: SpeedCardKind; completesOnDay: number }> {
  const card = profile.speedCards.find((item) => item.kind === kind && item.quantity > 0);
  if (!card) return failure(profile, 'insufficient-funds', 'لا تملك هذه البطاقة في مخزونك.');
  if (kind === 'capacity-boost' || kind.startsWith('day-speed-')) return failure(profile, 'invalid-input', 'هذه البطاقة ليست مخصصة لأوامر الإنتاج.');
  const order = profile.productionOrders.find((item) => item.id === orderId);
  if (!order || order.status !== 'active') return failure(profile, 'not-found', 'أمر الإنتاج غير نشط أو غير موجود.');
  const remainingDays = Math.max(1, order.completesOnDay - profile.day);
  const reduction = kind === 'production-instant' ? remainingDays : Math.max(1, Math.ceil(remainingDays * (kind === 'production-50' ? 0.5 : 0.25)));
  const completesOnDay = Math.max(profile.day, order.completesOnDay - reduction);
  const speedCards = profile.speedCards.map((item) => item.kind === kind ? { ...item, quantity: item.quantity - 1 } : item).filter((item) => item.quantity > 0);
  const productionOrders = profile.productionOrders.map((item) => item.id === orderId ? { ...item, completesOnDay } : item);
  return success({ ...profile, speedCards, productionOrders }, `تم استخدام بطاقة التسريع؛ يكتمل الأمر في اليوم ${completesOnDay}.`, { orderId, kind, completesOnDay });
}

export function useDaySpeedCard(profile: PlayerProfile, kind: SpeedCardKind): GameResult<{ kind: SpeedCardKind; multiplier: 2 | 3 }> {
  if (kind !== 'day-speed-2x' && kind !== 'day-speed-3x') return failure(profile, 'invalid-input', 'اختر بطاقة تسريع اليوم ×2 أو ×3.');
  if (profile.activeDaySpeedMultiplier > 1) return failure(profile, 'condition-not-met', 'بطاقة تسريع اليوم مستخدمة بالفعل؛ يمكنك تفعيل بطاقة جديدة بعد انتقال اليوم.');
  const card = profile.speedCards.find((item) => item.kind === kind && item.quantity > 0);
  if (!card) return failure(profile, 'insufficient-funds', 'لا تملك هذه البطاقة في مخزونك.');
  const multiplier = kind === 'day-speed-2x' ? 2 : 3;
  const speedCards = profile.speedCards.map((item) => item.kind === kind ? { ...item, quantity: item.quantity - 1 } : item).filter((item) => item.quantity > 0);
  return success({ ...profile, speedCards, activeDaySpeedMultiplier: multiplier }, `تم تفعيل بطاقة ×${multiplier} لهذا اليوم؛ سيصبح اليوم أسرع.`, { kind, multiplier });
}

export function buySpeedCard(profile: PlayerProfile, kind: SpeedCardKind, quantity: number, paymentMethod: PurchasePaymentMethod = 'diamonds'): GameResult<{ kind: SpeedCardKind; quantity: number; diamondsSpent: number; cashSpent: number }> {
  if (!isPositiveInteger(quantity)) return failure(profile, 'invalid-input', 'عدد البطاقات يجب أن يكون عددًا صحيحًا موجبًا.');
  const cost = SPEED_CARD_DIAMOND_COSTS[kind];
  if (!cost) return failure(profile, 'not-found', 'نوع بطاقة السرعة غير معروف.');
  const diamondsSpent = cost * quantity;
  const cashPrice = getCashPriceForDiamondPrice(diamondsSpent);
  const payment = resolvePurchaseDebit(profile, cashPrice, paymentMethod, diamondsSpent);
  if ('message' in payment) return failure(profile, 'insufficient-funds', payment.message);
  const existing = profile.speedCards.find((card) => card.kind === kind);
  const speedCards = existing
    ? profile.speedCards.map((card) => card.kind === kind ? { ...card, quantity: card.quantity + quantity } : card)
    : [...profile.speedCards, { kind, quantity }];
  const updated = { ...profile, speedCards };
  const nextProfile = paymentMethod === 'cash'
    ? addLedger(updated, [ledgerEntry(profile, 'expense', cashPrice, `شراء ${quantity} بطاقة ${SPEED_CARD_LABELS[kind]} نقدًا`, 0)], payment.bankBalance, { diamonds: payment.diamonds })
    : { ...updated, diamonds: payment.diamonds };
  return success(nextProfile, `تم شراء ${quantity} بطاقة ${paymentMethod === 'diamonds' ? `باستخدام ${diamondsSpent} ماسة` : `مقابل ${cashPrice.toLocaleString('ar-EG')} $`}.`, { kind, quantity, diamondsSpent: payment.diamondsSpent, cashSpent: paymentMethod === 'cash' ? cashPrice : 0 });
}

export function sellProduct(profile: PlayerProfile, productId: string, quantity: number): GameResult<SaleOutcome> {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  const product = PRODUCT_CATALOG.find((item) => item.id === productId);
  if (!product) return failure(profile, 'not-found', 'المنتج غير موجود في الكتالوج.');
  if (!isPositiveInteger(quantity)) return failure(profile, 'invalid-input', 'الكمية يجب أن تكون عددًا صحيحًا موجبًا.');
  const lot = profile.inventory.find((item) => item.materialOrProductId === productId);
  if (!lot || lot.quantity < quantity) return failure(profile, 'insufficient-materials', 'لا تملك هذه الكمية من المنتج.');
  const marketQuote = getMarketQuote(profile, productId);
  if (!marketQuote) return failure(profile, 'not-found', 'لا يوجد عرض سوق لهذا المنتج اليوم.');
  if (quantity > marketQuote.demandUnits) return failure(profile, 'market-limit', `الطلب المتاح اليوم ${marketQuote.demandUnits} وحدة فقط؛ خفّض الكمية أو انتظر يومًا آخر.`);
  const qualityMultiplier = lot.qualityScore === undefined ? 1 : 0.85 + lot.qualityScore / 100 * 0.15;
  const grossRevenue = Math.round(quantity * marketQuote.currentPrice * qualityMultiplier);
  const accountant = profile.staff.find((member) => member.status === 'active' && member.role === 'accountant');
  const taxRate = (findCountry(profile.countryId)?.economy.taxRate ?? 0) * (accountant ? Math.max(0.82, 0.9 - (staffLevel(accountant) - 1) * 0.02) : 1);
  const tax = Math.round(grossRevenue * taxRate);
  const costOfGoods = Math.round(lot.unitCost * quantity);
  const nextInventory = profile.inventory.map((item) => item.materialOrProductId === productId ? { ...item, quantity: item.quantity - quantity } : item).filter((item) => item.quantity > 0);
  const sale: ProductSale = { id: nextId(profile, 'sale', profile.sales.length), productId, quantity, unitPrice: marketQuote.currentPrice, grossRevenue, tax, costOfGoods, soldOnDay: profile.day, soldAt: timestampFor(profile) };
  const nextProfile = addLedger(
    { ...profile, inventory: nextInventory, sales: [...profile.sales, sale] },
    [
      ledgerEntry(profile, 'revenue', grossRevenue, `بيع ${quantity} من ${product.name}`, 0),
      ledgerEntry(profile, 'expense', tax, 'ضريبة مبيعات محاكاة', 1),
      ledgerEntry(profile, 'expense', costOfGoods, `تكلفة البضاعة المباعة: ${product.name}`, 2),
    ],
    profile.bankBalance + grossRevenue - tax,
  );
  return success(syncTasks(nextProfile), `تم بيع ${quantity} من ${product.name} بسعر سوق ${marketQuote.currentPrice.toLocaleString('ar-EG')} $ للوحدة بعد احتساب الضريبة والتكلفة.`, { productId, quantity, grossRevenue, tax, costOfGoods, netRevenue: grossRevenue - tax - costOfGoods });
}

const GOLD_SELL_SPREAD_RATE = 0.03;

function isPositiveTenth(value: number): boolean {
  return Number.isFinite(value) && value > 0 && Math.abs(value * 10 - Math.round(value * 10)) < 1e-8;
}

export function buyGold(profile: PlayerProfile, grams: number): GameResult<GoldTradeOutcome> {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  if (!isPositiveTenth(grams)) return failure(profile, 'invalid-input', 'أدخل كمية ذهب موجبة بخطوة 0.1 غرام.');
  const amount = Math.round(grams * GOLD_PRICE_PER_GRAM);
  if (profile.bankBalance < amount) return failure(profile, 'insufficient-funds', 'لا يكفي رصيد البنك لشراء هذه الكمية من الذهب.');
  const nextProfile = addLedger(
    profile,
    [ledgerEntry(profile, 'asset', amount, `شراء ${grams.toFixed(1)} غرام ذهب بسعر محاكاة`, 0)],
    profile.bankBalance - amount,
    { goldGrams: Math.round((profile.goldGrams + grams) * 10) / 10, goldCostBasis: profile.goldCostBasis + amount },
  );
  return success(nextProfile, `اشتريت ${grams.toFixed(1)} غرام ذهب بسعر محاكاة ${GOLD_PRICE_PER_GRAM} $ للغرام.`, { grams, cashAmount: amount, pricePerGram: GOLD_PRICE_PER_GRAM });
}

const DIAMONDS_PER_GOLD_GRAM = 0.5;
export function buyGoldWithDiamonds(profile: PlayerProfile, grams: number): GameResult<GoldTradeOutcome> {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  if (!isPositiveTenth(grams)) return failure(profile, 'invalid-input', 'أدخل كمية ذهب موجبة بخطوة 0.1 غرام.');
  const diamonds = grams * DIAMONDS_PER_GOLD_GRAM;
  if (!Number.isInteger(diamonds)) return failure(profile, 'invalid-input', 'شراء الذهب بالماس متاح بزيادة 2 غرام لكل ماسة كاملة.');
  if (profile.diamonds < diamonds) return failure(profile, 'insufficient-funds', 'لا يكفي رصيد الماس لشراء هذه الكمية من الذهب.');
  const goldCost = Math.round(grams * GOLD_PRICE_PER_GRAM);
  const nextProfile = addLedger(
    profile,
    [ledgerEntry(profile, 'asset', goldCost, `شراء ${grams.toFixed(1)} غرام ذهب مقابل ${diamonds} ماسة`, 0)],
    profile.bankBalance,
    {
      diamonds: profile.diamonds - diamonds,
      goldGrams: Math.round((profile.goldGrams + grams) * 10) / 10,
      goldCostBasis: profile.goldCostBasis + goldCost,
    },
  );
  return success(nextProfile, `تم شراء ${grams.toFixed(1)} غرام ذهب مقابل ${diamonds} ماسة.`, { grams, cashAmount: diamonds, pricePerGram: DIAMONDS_PER_GOLD_GRAM });
}

export function sellGold(profile: PlayerProfile, grams: number): GameResult<GoldTradeOutcome> {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  if (!isPositiveTenth(grams)) return failure(profile, 'invalid-input', 'أدخل كمية ذهب موجبة بخطوة 0.1 غرام.');
  if (grams > profile.goldGrams) return failure(profile, 'insufficient-materials', 'لا تملك هذه الكمية من الذهب.');
  const proceeds = Math.round(grams * GOLD_PRICE_PER_GRAM * (1 - GOLD_SELL_SPREAD_RATE));
  const bookValue = grams === profile.goldGrams
    ? profile.goldCostBasis
    : Math.round(profile.goldCostBasis * grams / profile.goldGrams);
  const realizedDifference = proceeds - bookValue;
  const entries = [ledgerEntry(profile, 'asset', bookValue, `استبعاد القيمة الدفترية لـ ${grams.toFixed(1)} غرام ذهب مباع`, 0)];
  if (realizedDifference > 0) entries.push(ledgerEntry(profile, 'revenue', realizedDifference, 'ربح محاكاة من بيع الذهب', entries.length));
  if (realizedDifference < 0) entries.push(ledgerEntry(profile, 'expense', Math.abs(realizedDifference), 'فارق تداول الذهب داخل اللعبة', entries.length));
  const nextProfile = addLedger(
    profile,
    entries,
    profile.bankBalance + proceeds,
    {
      goldGrams: Math.round((profile.goldGrams - grams) * 10) / 10,
      goldCostBasis: Math.max(0, profile.goldCostBasis - bookValue),
    },
  );
  return success(nextProfile, `بعت ${grams.toFixed(1)} غرام ذهب بسعر محاكاة بعد فارق تداول 3%.`, { grams, cashAmount: proceeds, pricePerGram: GOLD_PRICE_PER_GRAM });
}

export function getDayBriefing(profile: PlayerProfile): DayBriefing {
  const day = profile.day + 1;
  const multiplier = findCountry(profile.countryId)?.economy.operatingCostMultiplier ?? 1;
  const operatingCost = profile.companies.reduce((sum, company) => {
    const manager = profile.staff.find((member) => member.status === 'active' && member.role === 'manager' && member.companyId === company.id);
    const managerDiscount = manager ? Math.min(0.18, 0.08 + (staffLevel(manager) - 1) * 0.025) : 0;
    return sum + (company.operatingCostPerDay ?? 0) * (1 - managerDiscount);
  }, 0) * multiplier * getOperatingCostProgression(profile.day) * getSynergyOperatingMultiplier(profile);
  const maturingInvestments = profile.investments
    .filter((investment) => investment.status === 'active' && investment.maturityDay <= day)
    .map((investment) => ({ id: investment.id, name: findInvestment(investment.investmentTypeId)?.name ?? investment.investmentTypeId }));
  const event = getEconomicEventTemplate(day, profile.countryId);
  const availableEnergy = profile.companies.reduce((sum, company) => sum + (company.energyUnits ?? 0), 0);
  const outstandingSalary = unpaidSalaryTotal(profile);
  return { day, operatingCost, existingPayables: profile.payables + outstandingSalary, maturingInvestments, event, availableEnergy, energyPaused: profile.payables > 0 || outstandingSalary > 0 };
}

export const STAFF_ROLE_OPTIONS: Record<StaffRole, {
  label: string;
  dailySalary: number;
  companyRequired: boolean;
  department: 'executive' | 'operations' | 'finance' | 'legal';
  description: string;
  perks: string[];
}> = {
  manager: {
    label: 'مدير شركة',
    dailySalary: 7_000,
    companyRequired: true,
    department: 'operations',
    description: 'إدارة تشغيلية مخصصة للشركة لتسريع دورات الإنتاج ورفع جودة المنتج النهائي.',
    perks: ['تسريع زمن الإنتاج بمقدار يوم كامل', 'زيادة نقاط الجودة (+10 نقاط)', 'تقليل استهلاك الطاقة'],
  },
  foreman: {
    label: 'رئيس عمال الإنتاج',
    dailySalary: 3_200,
    companyRequired: true,
    department: 'operations',
    description: 'ملاحظة ومراقبة خطوط المصنع لتقليل هدر الخامات وزيادة كفاءة وجودة الدفعات.',
    perks: ['تقليل هدر المواد الخام بنسبة 5% - 15%', 'رفع جودة المنتجات (+5 إلى +13 نقطة)', 'تسريع إنجاز الدفعات الكبيرة'],
  },
  accountant: {
    label: 'محاسب قانوني معتمد',
    dailySalary: 4_500,
    companyRequired: false,
    department: 'finance',
    description: 'تدقيق القيود والدفاتر لخفض الضرائب الرسمية وتفادي غرامات الفحص المفاجئة.',
    perks: ['خفض ضرائب المبيعات بنسبة 15% - 40%', 'حماية من غرامات الفحص الضريبي بنسبة تصل 60%', 'فتح لوحة التقارير المالية الذكية'],
  },
  lawyer: {
    label: 'مستشار قانوني وعقود',
    dailySalary: 4_000,
    companyRequired: false,
    department: 'legal',
    description: 'صياغة العقود التجارية الكبرى وتوفير حماية قانونية ضد صدمات القرارات الحكومية.',
    perks: ['زيادة أرباح وعلاوات العقود بنسبة 10% - 30%', 'حماية السيولة من صدمات البنك المركزي والقرارات', 'تخفيض تكاليف التراخيص والنزاعات'],
  },
  cfo: {
    label: 'مدير مالي تنفيذي (CFO)',
    dailySalary: 9_500,
    companyRequired: false,
    department: 'executive',
    description: 'إدارة السيولة النقدية والمحفظة المصرفية وتحسين فوائد القروض والودائع.',
    perks: ['زيادة عوائد الودائع البنكية بنسبة تصل إلى +35%', 'خفض الفوائد التراكمية للقروض بنسبة 20%', 'لوحة تدفقات نقدية ذكية وتنبيهات سيولة استباقية'],
  },
  general_manager: {
    label: 'مدير تنفيذي مفوض (CEO)',
    dailySalary: 12_000,
    companyRequired: false,
    department: 'executive',
    description: 'تفويض الإدارة اليومية: أتمتة سداد الرواتب في موعدها وإعادة شراء الخامات آلياً.',
    perks: ['أتمتة سداد الرواتب لتفادي تعطل المصانع وتوقف الطاقة', 'أتمتة إعادة تموين الخامات الناقصة بحسب الحد الأدنى المحدد', 'إشراف شامل على خطة النمو اليومية'],
  },
  operations_director: {
    label: 'مدير تشغيل المصانع (COO)',
    dailySalary: 10_000,
    companyRequired: false,
    department: 'executive',
    description: 'التشغيل الذاتي المتواصل لكافة المصانع وخطوط الإنتاج دون توقف.',
    perks: ['بدء دورات إنتاج جديدة فور اكتمال السابقة تلقائياً', 'تشغيل دفعات الإنتاج الأوفلاين أثناء غياب اللاعب', 'تحسين كفاءة استخدام الآلات والصيانة الوقائية'],
  },
  hr: {
    label: 'مدير الموارد البشرية',
    dailySalary: 3_500,
    companyRequired: false,
    department: 'operations',
    description: 'استقطاب الكفاءات وتخفيض تكاليف استقدام وتوقيع عقود الموظفين الجدد.',
    perks: ['خصم حتى 32% من تكلفة تعيين أي موظف جديد', 'رفع سرعة اكتساب الموظفين للخبرة', 'تحسين استقرار الفريق والولاء'],
  },
};

const MAX_STAFF_LEVEL = 5;
const STAFF_EXPERIENCE_PER_LEVEL = 100;

export function staffLevel(employee: StaffContract | undefined): number {
  return Math.max(1, Math.min(MAX_STAFF_LEVEL, Math.floor(employee?.level ?? 1)));
}

export function staffExperience(employee: StaffContract | undefined): number {
  return Math.max(0, Math.min(STAFF_EXPERIENCE_PER_LEVEL - 1, Math.floor(employee?.experience ?? 0)));
}

export function getStaffUpgradeCost(employee: StaffContract): number {
  return Math.round(employee.dailySalary * (2 + staffLevel(employee)));
}

function developStaff(employee: StaffContract): StaffContract {
  let level = staffLevel(employee);
  let experience = staffExperience(employee) + (employee.role === 'manager' || employee.role === 'foreman' ? 12 : 10);
  while (level < MAX_STAFF_LEVEL && experience >= STAFF_EXPERIENCE_PER_LEVEL) {
    experience -= STAFF_EXPERIENCE_PER_LEVEL;
    level += 1;
  }
  return { ...employee, level, experience };
}

export function hireStaff(profile: PlayerProfile, role: StaffRole, name: string, companyId?: string): GameResult<StaffContract> {
  const option = STAFF_ROLE_OPTIONS[role];
  if (!option || name.trim().length < 2) return failure(profile, 'invalid-input', 'أدخل اسمًا صحيحًا واختر دورًا معروفًا.');
  if (option.companyRequired && !profile.companies.some((company) => company.id === companyId)) {
    return failure(profile, 'not-found', `${option.label} يجب أن يرتبط بشركة موجودة.`);
  }
  if ((role === 'manager' || role === 'foreman') && profile.staff.some((member) => member.status === 'active' && member.role === role && member.companyId === companyId)) {
    return failure(profile, 'invalid-input', `هذه الشركة لديها ${option.label} نشط بالفعل.`);
  }
  if (['cfo', 'general_manager', 'operations_director', 'hr', 'accountant', 'lawyer'].includes(role) && profile.staff.some((m) => m.status === 'active' && m.role === role)) {
    return failure(profile, 'already-owned', `لديك بالفعل ${option.label} في قيادة إمبراطوريتك.`);
  }
  const hr = profile.staff.find((member) => member.status === 'active' && member.role === 'hr');
  const contractCost = Math.round(option.dailySalary * (hr ? Math.max(0.68, 0.8 - (staffLevel(hr) - 1) * 0.03) : 1));
  if (profile.bankBalance < contractCost) return failure(profile, 'insufficient-funds', 'لا يكفي الرصيد لتوقيع عقد الموظف ودفع يوم التعاقد.');
  const staff: StaffContract = { id: nextId(profile, 'staff', profile.staff.length), role, name: name.trim(), companyId, dailySalary: option.dailySalary, level: 1, experience: 0, hiredOnDay: profile.day, nextPayDay: profile.day + 1, status: 'active' };
  const nextProfile = addLedger(
    { ...profile, staff: [...profile.staff, staff] },
    [ledgerEntry(profile, 'expense', contractCost, `توقيع عقد ${option.label}: ${staff.name}`, 0)],
    profile.bankBalance - contractCost,
  );
  return success(nextProfile, `تم تعيين ${staff.name} بوظيفة ${option.label}؛ أول راتب دوري في اليوم التالي.`, staff);
}

export function upgradeStaff(profile: PlayerProfile, staffId: string): GameResult<StaffContract> {
  const employee = profile.staff.find((member) => member.id === staffId && member.status === 'active');
  if (!employee) return failure(profile, 'not-found', 'عقد الموظف غير موجود أو غير نشط.');
  const level = staffLevel(employee);
  if (level >= MAX_STAFF_LEVEL) return failure(profile, 'condition-not-met', 'وصل الموظف إلى أعلى مستوى متاح.');
  const cost = getStaffUpgradeCost(employee);
  if (profile.bankBalance < cost) return failure(profile, 'insufficient-funds', `تحتاج إلى ${cost.toLocaleString('ar-EG')} $ لترقية ${employee.name}.`);
  const updated = { ...employee, level: level + 1, experience: staffExperience(employee) };
  const nextProfile = addLedger(
    { ...profile, staff: profile.staff.map((member) => member.id === staffId ? updated : member) },
    [ledgerEntry(profile, 'expense', cost, `ترقية الموظف ${employee.name} إلى المستوى ${level + 1}`, 0)],
    profile.bankBalance - cost,
  );
  return success(nextProfile, `تمت ترقية ${employee.name} إلى المستوى ${level + 1}.`, updated);
}

export function payStaffSalary(profile: PlayerProfile, staffId: string): GameResult<{ staffId: string; amount: number }> {
  const employee = profile.staff.find((member) => member.id === staffId && member.status === 'active');
  if (!employee) return failure(profile, 'not-found', 'عقد الموظف غير موجود أو غير نشط.');
  const amount = employee.unpaidSalary ?? 0;
  if (amount <= 0) return failure(profile, 'condition-not-met', 'لا يوجد راتب مستحق لهذا الموظف حاليًا.');
  if (profile.bankBalance < amount) return failure(profile, 'insufficient-funds', `تحتاج إلى ${amount.toLocaleString('ar-EG')} $ لدفع راتب ${employee.name}.`);
  const nextProfile = addLedger(
    { ...profile, staff: profile.staff.map((member) => member.id === staffId ? { ...member, unpaidSalary: 0, nextPayDay: profile.day + 1 } : member) },
    [ledgerEntry(profile, 'settlement', amount, `سداد راتب مستحق: ${employee.name}`, 0)],
    profile.bankBalance - amount,
  );
  return success(nextProfile, `تم دفع ${amount.toLocaleString('ar-EG')} $ للموظف ${employee.name}.`, { staffId, amount });
}

export function terminateStaff(profile: PlayerProfile, staffId: string): GameResult<StaffContract> {
  const employee = profile.staff.find((member) => member.id === staffId && member.status === 'active');
  if (!employee) return failure(profile, 'not-found', 'عقد الموظف غير موجود أو تم إنهاؤه.');
  const updated = { ...employee, status: 'terminated' as const };
  return success({ ...profile, staff: profile.staff.map((member) => member.id === staffId ? updated : member) }, `تم إنهاء عقد ${employee.name}.`, updated);
}

const DEPOSIT_OPTIONS = [
  { durationDays: 3, annualRate: 0.05 },
  { durationDays: 7, annualRate: 0.08 },
  { durationDays: 14, annualRate: 0.12 },
] as const;

export function createDeposit(profile: PlayerProfile, amount: number, durationDays: number): GameResult<DepositRecord> {
  const option = DEPOSIT_OPTIONS.find((item) => item.durationDays === durationDays);
  if (!option) return failure(profile, 'invalid-input', 'مدة الوديعة غير متاحة. اختر 3 أو 7 أو 14 يومًا.');
  if (profile.banking.deposits.filter((deposit) => deposit.status === 'active').length >= 5) return failure(profile, 'condition-not-met', 'وصلت إلى الحد الأقصى: 5 ودائع نشطة. ادمج الودائع أو استرد وديعة مستحقة أولًا.');
  if (!Number.isInteger(amount) || amount < 50_000) return failure(profile, 'invalid-input', 'الحد الأدنى للوديعة 50,000 جنيه محاكاة.');
  if (amount > profile.bankBalance) return failure(profile, 'insufficient-funds', 'لا يكفي الرصيد لإنشاء هذه الوديعة.');
  const cfo = profile.staff.find((member) => member.status === 'active' && member.role === 'cfo');
  const cfoRateBonus = cfo ? 0.02 + (staffLevel(cfo) - 1) * 0.006 : 0;
  const deposit: DepositRecord = { id: nextId(profile, 'deposit', profile.banking.deposits.length), principal: amount, annualRate: option.annualRate + cfoRateBonus, startedOnDay: profile.day, maturityDay: profile.day + durationDays, status: 'active' };
  const nextProfile = addLedger(
    { ...profile, banking: { ...profile.banking, deposits: [...profile.banking.deposits, deposit] } },
    [ledgerEntry(profile, 'asset', amount, `إيداع وديعة لمدة ${durationDays} أيام${cfo ? ' (مع عوائد إضافية من المدير المالي)' : ''}`, 0)],
    profile.bankBalance - amount,
  );
  return success(nextProfile, `تم إنشاء وديعة محاكاة تستحق في اليوم ${deposit.maturityDay}${cfo ? ' بمعدل فائدة معزز بفضل المدير المالي' : ''}.`, deposit);
}

function activeDepositTranches(deposit: DepositRecord): DepositTranche[] {
  if (deposit.tranches) return deposit.tranches.filter((tranche) => tranche.status === 'active');
  return deposit.status === 'active' ? [{ id: deposit.id, principal: deposit.principal, annualRate: deposit.annualRate, startedOnDay: deposit.startedOnDay, maturityDay: deposit.maturityDay, status: 'active' }] : [];
}

export function getDepositExpectedInterest(deposit: DepositRecord): number {
  return activeDepositTranches(deposit).reduce((sum, tranche) => sum + Math.round(tranche.principal * tranche.annualRate * (tranche.maturityDay - tranche.startedOnDay) / 30), 0);
}

export function hasMaturedDepositTranche(deposit: DepositRecord, day: number): boolean {
  return activeDepositTranches(deposit).some((tranche) => day >= tranche.maturityDay);
}

export function getDepositMaturityRange(deposit: DepositRecord): { firstDay: number; lastDay: number } {
  const tranches = activeDepositTranches(deposit);
  if (tranches.length === 0) return { firstDay: deposit.maturityDay, lastDay: deposit.maturityDay };
  return { firstDay: Math.min(...tranches.map((tranche) => tranche.maturityDay)), lastDay: Math.max(...tranches.map((tranche) => tranche.maturityDay)) };
}

export function mergeDeposits(profile: PlayerProfile, depositIds: string[]): GameResult<DepositRecord> {
  if (!Array.isArray(depositIds) || depositIds.some((id) => typeof id !== 'string')) return failure(profile, 'invalid-input', 'قائمة الودائع المختارة غير صالحة.');
  const ids = [...new Set(depositIds)];
  if (ids.length < 2) return failure(profile, 'invalid-input', 'اختر وديعتين نشطتين على الأقل لدمجهما.');
  const deposits = ids.map((id) => profile.banking.deposits.find((deposit) => deposit.id === id));
  if (deposits.some((deposit) => !deposit || deposit.status !== 'active')) return failure(profile, 'not-found', 'تأكد من اختيار ودائع نشطة موجودة.');
  const selected = deposits as DepositRecord[];
  const tranches = selected.flatMap(activeDepositTranches);
  if (tranches.length < 2) return failure(profile, 'invalid-input', 'لا توجد أجزاء نشطة كافية لدمجها.');
  const principal = tranches.reduce((sum, tranche) => sum + tranche.principal, 0);
  const annualRate = principal > 0 ? tranches.reduce((sum, tranche) => sum + tranche.principal * tranche.annualRate, 0) / principal : 0;
  const deposit: DepositRecord = {
    id: nextId(profile, 'deposit', profile.banking.deposits.length),
    principal,
    annualRate,
    startedOnDay: Math.min(...tranches.map((tranche) => tranche.startedOnDay)),
    maturityDay: Math.max(...tranches.map((tranche) => tranche.maturityDay)),
    status: 'active',
    tranches,
  };
  const mergedIds = new Set(ids);
  const history = profile.banking.deposits.map((item) => mergedIds.has(item.id) ? { ...item, status: 'merged' as const, mergedIntoId: deposit.id } : item);
  const nextProfile = { ...profile, banking: { ...profile.banking, deposits: [...history, deposit] } };
  return success(nextProfile, `تم دمج ${ids.length} ودائع في وديعة واحدة مع الحفاظ على عائد وموعد استحقاق كل جزء.`, deposit);
}

export function withdrawDeposit(profile: PlayerProfile, depositId: string): GameResult<{ depositId: string; amount: number; interest: number }> {
  const deposit = profile.banking.deposits.find((item) => item.id === depositId);
  if (!deposit) return failure(profile, 'not-found', 'الوديعة غير موجودة.');
  if (deposit.status !== 'active') return failure(profile, 'invalid-input', 'هذه الوديعة تمت تسويتها من قبل.');
  const activeTranches = activeDepositTranches(deposit);
  const maturedTranches = activeTranches.filter((tranche) => profile.day >= tranche.maturityDay);
  if (maturedTranches.length === 0) return failure(profile, 'deposit-not-mature', `تستحق الوديعة في اليوم ${Math.min(...activeTranches.map((tranche) => tranche.maturityDay))}.`);
  const principal = maturedTranches.reduce((sum, tranche) => sum + tranche.principal, 0);
  const interest = maturedTranches.reduce((sum, tranche) => sum + Math.round(tranche.principal * tranche.annualRate * (tranche.maturityDay - tranche.startedOnDay) / 30), 0);
  const amount = principal + interest;
  let updatedDeposit: DepositRecord;
  if (deposit.tranches) {
    const maturedIds = new Set(maturedTranches.map((tranche) => tranche.id));
    const tranches = deposit.tranches.map((tranche) => maturedIds.has(tranche.id) ? { ...tranche, status: 'paid' as const, settledAmount: tranche.principal + Math.round(tranche.principal * tranche.annualRate * (tranche.maturityDay - tranche.startedOnDay) / 30) } : tranche);
    const remaining = tranches.filter((tranche) => tranche.status === 'active');
    const remainingPrincipal = remaining.reduce((sum, tranche) => sum + tranche.principal, 0);
    const remainingRate = remainingPrincipal > 0 ? remaining.reduce((sum, tranche) => sum + tranche.principal * tranche.annualRate, 0) / remainingPrincipal : deposit.annualRate;
    updatedDeposit = { ...deposit, principal: remainingPrincipal, annualRate: remainingRate, startedOnDay: remaining.length ? Math.min(...remaining.map((tranche) => tranche.startedOnDay)) : deposit.startedOnDay, maturityDay: remaining.length ? Math.max(...remaining.map((tranche) => tranche.maturityDay)) : deposit.maturityDay, status: remaining.length ? 'active' : 'paid', settledAmount: (deposit.settledAmount ?? 0) + amount, tranches };
  } else {
    updatedDeposit = { ...deposit, status: 'paid', settledAmount: amount };
  }
  const nextProfile = addLedger(
    { ...profile, banking: { ...profile.banking, deposits: profile.banking.deposits.map((item) => item.id === depositId ? updatedDeposit : item) } },
    [ledgerEntry(profile, 'revenue', interest, `فائدة وديعة محاكاة ${deposit.id}`, 0), ledgerEntry(profile, 'settlement', principal, `استرداد أصل الوديعة ${deposit.id}`, 1)],
    profile.bankBalance + amount,
  );
  return success(nextProfile, `تم استرداد المستحق من الوديعة مع فائدة ${interest.toLocaleString('ar-EG')} $.`, { depositId, amount, interest });
}

function collateralValue(profile: PlayerProfile, collateralType: LoanRecord['collateralType'], collateralId: string): number {
  if (collateralType === 'land') return profile.lands.find((land) => land.id === collateralId)?.purchasePrice ?? 0;
  const company = profile.companies.find((item) => item.id === collateralId);
  const industry = company ? findIndustry(company.industryId) : undefined;
  const country = company ? findCountry(company.countryId) : undefined;
  return company && industry ? industry.setupFee + (country?.economy.licenseFeesByIndustry[company.industryId] ?? industry.licenseFee) + 100_000 : 0;
}

export function takeLoan(profile: PlayerProfile, collateralType: LoanRecord['collateralType'], collateralId: string, amount: number, termDays: number): GameResult<LoanRecord> {
  if (profile.banking.loans.filter((loan) => loan.status === 'active').length >= 3) return failure(profile, 'condition-not-met', 'وصلت إلى الحد الأقصى: 3 قروض نشطة. سدّد قرضًا قائمًا أولًا.');
  const collateralAmount = collateralValue(profile, collateralType, collateralId);
  if (collateralAmount <= 0) return failure(profile, 'not-found', 'الضمان غير موجود أو غير مؤهل للتمويل.');
  if (profile.banking.loans.some((loan) => loan.status === 'active' && loan.collateralType === collateralType && loan.collateralId === collateralId)) return failure(profile, 'collateral-in-use', 'هذا الضمان مرتبط بقرض قائم بالفعل.');
  if (![7, 14, 30].includes(termDays)) return failure(profile, 'invalid-input', 'مدة القرض المتاحة 7 أو 14 أو 30 يومًا.');
  const maximumLoan = Math.floor(collateralAmount * 0.6);
  if (!Number.isInteger(amount) || amount < 25_000 || amount > maximumLoan) return failure(profile, 'invalid-input', `الحد الأقصى لهذا الضمان ${maximumLoan.toLocaleString('ar-EG')} $ محاكاة.`);
  const annualRate = termDays === 7 ? 0.18 : termDays === 14 ? 0.22 : 0.28;
  const totalRepayment = Math.round(amount * (1 + annualRate * termDays / 30));
  const loan: LoanRecord = { id: nextId(profile, 'loan', profile.banking.loans.length), collateralType, collateralId, principal: amount, totalRepayment, annualRate, startedOnDay: profile.day, termDays, nextPaymentDay: profile.day + 1, installmentAmount: Math.ceil(totalRepayment / termDays), remainingBalance: totalRepayment, status: 'active' };
  const nextProfile = addLedger(
    { ...profile, banking: { ...profile.banking, loans: [...profile.banking.loans, loan] } },
    [ledgerEntry(profile, 'liability', amount, `صرف قرض بضمان ${collateralType === 'land' ? 'أرض' : 'شركة'}`, 0)],
    profile.bankBalance + amount,
  );
  return success(nextProfile, `تم صرف قرض محاكاة بقيمة ${amount.toLocaleString('ar-EG')} $؛ يبدأ القسط في اليوم التالي.`, loan);
}

export function repayLoan(profile: PlayerProfile, loanId: string, installments: number | 'all'): GameResult<LoanRecord> {
  const loan = profile.banking.loans.find((item) => item.id === loanId && item.status === 'active');
  if (!loan) return failure(profile, 'not-found', 'القرض غير موجود أو تمت تسويته بالفعل.');
  const count = installments === 'all' ? Math.ceil(loan.remainingBalance / loan.installmentAmount) : installments;
  if (!Number.isInteger(count) || count < 1) return failure(profile, 'invalid-input', 'اختر قسطًا واحدًا على الأقل.');
  const amount = installments === 'all' ? loan.remainingBalance : Math.min(loan.remainingBalance, loan.installmentAmount * count);
  if (profile.bankBalance < amount) return failure(profile, 'insufficient-funds', 'لا يكفي الرصيد لتسديد هذه الدفعة.');
  const remainingBalance = Math.max(0, loan.remainingBalance - amount);
  const updatedLoan = { ...loan, remainingBalance, nextPaymentDay: loan.nextPaymentDay + count, status: remainingBalance === 0 ? 'paid' as const : loan.status };
  const nextProfile = addLedger(
    { ...profile, banking: { ...profile.banking, loans: profile.banking.loans.map((item) => item.id === loanId ? updatedLoan : item) } },
    [ledgerEntry(profile, 'settlement', amount, `سداد ${installments === 'all' ? 'كامل' : `${count} أقساط`} من القرض ${loanId}`, 0)],
    profile.bankBalance - amount,
  );
  return success(nextProfile, remainingBalance === 0 ? 'تم سداد القرض بالكامل وإغلاقه.' : `تم سداد ${count} أقساط دفعة واحدة. المتبقي ${remainingBalance.toLocaleString('ar-EG')} $.`, updatedLoan);
}

export function createInvestment(profile: PlayerProfile, investmentId: string, amount: number): GameResult<InvestmentOutcome> {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  const definition = findInvestment(investmentId);
  if (!definition) return failure(profile, 'not-found', 'خيار الاستثمار غير موجود.');
  if (!Number.isInteger(amount) || amount < definition.minimumAmount || amount > definition.maximumAmount) return failure(profile, 'invalid-input', 'المبلغ خارج نطاق الاستثمار المسموح.');
  if (profile.bankBalance < amount) return failure(profile, 'insufficient-funds', 'لا يكفي رصيدك لإنشاء الاستثمار.');
  const investment: InvestmentRecord = {
    id: nextId(profile, 'investment', profile.investments.length),
    investmentTypeId: investmentId,
    principal: amount,
    expectedReturnRate: definition.returnRate,
    startedOnDay: profile.day,
    maturityDay: profile.day + definition.durationDays,
    status: 'active',
  };
  const nextProfile = addLedger(
    { ...profile, investments: [...profile.investments, investment] },
    [ledgerEntry(profile, 'asset', amount, `إنشاء استثمار ${definition.name}`, 0)],
    profile.bankBalance - amount,
  );
  return success(syncTasks(nextProfile), `تم إنشاء الاستثمار ويستحق في اليوم ${investment.maturityDay}.`, { investmentId: investment.id, maturityDay: investment.maturityDay, returnRate: definition.returnRate });
}

export function advanceDay(profile: PlayerProfile): GameResult<DayOutcome> {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  const briefing = getDayBriefing(profile);
  const nextDay = briefing.day;
  const now = timestampFor({ ...profile, day: nextDay });
  const operatingCost = briefing.operatingCost;
  const entries: FinanceLedgerEntry[] = [];
  let balance = profile.bankBalance;
  let payables = profile.payables;
  const paidPriorPayables = Math.min(balance, payables);
  if (paidPriorPayables > 0) {
    balance -= paidPriorPayables;
    payables -= paidPriorPayables;
    entries.push(ledgerEntry(profile, 'settlement', paidPriorPayables, 'سداد التزامات سابقة', entries.length));
  }
  const cfo = profile.staff.find((member) => member.status === 'active' && member.role === 'cfo');
  const cfoLevel = staffLevel(cfo);
  const loans = profile.banking.loans.map((loan) => {
    if (loan.status !== 'active' || loan.nextPaymentDay > nextDay) return loan;
    const due = Math.min(loan.remainingBalance, loan.installmentAmount);
    const paid = Math.min(balance, due);
    balance -= paid;
    const unpaid = due - paid;
    const rawInterestShare = Math.min(due, Math.max(0, loan.totalRepayment - loan.principal) / loan.termDays);
    const interestDiscount = cfo ? Math.min(0.35, 0.15 + (cfoLevel - 1) * 0.04) : 0;
    const interestShare = Math.round(rawInterestShare * (1 - interestDiscount));
    const principalShare = due - interestShare;
    if (interestShare > 0) entries.push(ledgerEntry(profile, 'expense', Math.round(interestShare), `فائدة قسط القرض ${loan.id}${cfo ? ' (مخفضة بفضل CFO)' : ''}`, entries.length));
    if (principalShare > 0 && paid > 0) entries.push(ledgerEntry(profile, 'settlement', Math.min(paid, Math.round(principalShare)), `سداد أصل قسط القرض ${loan.id}`, entries.length));
    if (unpaid > 0) {
      payables += unpaid;
      entries.push(ledgerEntry(profile, 'liability', unpaid, `قسط قرض غير مسدد ${loan.id}`, entries.length));
    }
    const remainingBalance = Math.max(0, loan.remainingBalance - due);
    return { ...loan, remainingBalance, nextPaymentDay: nextDay + 1, status: remainingBalance === 0 ? 'paid' as const : 'active' as const };
  });
  const rawStaff = profile.staff.map((employee) => {
    if (employee.status !== 'active') return employee;
    const developed = developStaff(employee);
    if (employee.nextPayDay > nextDay) return developed;
    const dueDays = Math.max(1, nextDay - employee.nextPayDay + 1);
    return { ...developed, nextPayDay: nextDay + 1, unpaidSalary: (employee.unpaidSalary ?? 0) + employee.dailySalary * dueDays };
  });
  const salaryAccrued = rawStaff.reduce((sum, employee) => {
    const previous = profile.staff.find((item) => item.id === employee.id);
    return sum + Math.max(0, (employee.unpaidSalary ?? 0) - (previous?.unpaidSalary ?? 0));
  }, 0);
  if (salaryAccrued > 0) {
    entries.push(ledgerEntry(profile, 'expense', salaryAccrued, 'رواتب مستحقة عن اليوم', entries.length));
    entries.push(ledgerEntry(profile, 'liability', salaryAccrued, 'التزام رواتب غير مسدد', entries.length));
  }

  // Directive 1: Executive Director auto-pays salaries if authorized
  const directives: AutomationDirectives = profile.automationDirectives ?? getDefaultAutomationDirectives();
  const generalManager = profile.staff.find((m) => m.status === 'active' && m.role === 'general_manager');
  let staff = rawStaff;
  if (generalManager && directives.autoPaySalaries) {
    const totalDue = staff.reduce((sum, e) => sum + (e.unpaidSalary ?? 0), 0);
    if (totalDue > 0 && balance >= totalDue) {
      balance -= totalDue;
      staff = staff.map((e) => ({ ...e, unpaidSalary: 0 }));
      entries.push(ledgerEntry(profile, 'settlement', totalDue, `سداد رواتب تلقائي بتفويض المدير التنفيذي: ${generalManager.name}`, entries.length));
    }
  }
  let inventory = [...profile.inventory];
  const newlyCompletedProductionIds: string[] = [];
  const productionOrders = profile.productionOrders.map((order) => {
    if (order.status !== 'active' || order.completesOnDay > nextDay) return order;
    newlyCompletedProductionIds.push(order.id);
    const unitCost = order.materialCost / order.outputQuantity;
    const existingLot = inventory.find((lot) => lot.materialOrProductId === order.productId);
    inventory = existingLot
      ? inventory.map((lot) => lot.materialOrProductId === order.productId
        ? { ...lot, quantity: lot.quantity + order.outputQuantity, unitCost: (lot.quantity * lot.unitCost + order.outputQuantity * unitCost) / (lot.quantity + order.outputQuantity), qualityScore: ((lot.qualityScore ?? 90) * lot.quantity + order.qualityScore * order.outputQuantity) / (lot.quantity + order.outputQuantity) }
        : lot)
      : [...inventory, { id: nextId(profile, 'inventory', inventory.length), materialOrProductId: order.productId, quantity: order.outputQuantity, unit: order.outputUnit, unitCost, qualityScore: order.qualityScore }];
    entries.push(ledgerEntry(profile, 'asset', order.materialCost, `اكتمل أمر إنتاج ${order.productName}`, entries.length));
    return { ...order, status: 'completed' as const };
  });

  // Settle arriving international CIF shipments & forward contracts
  const warehouseLevel = normalizeWarehouseLevel(profile.warehouseLevel);
  const warehouseCapacity = getWarehouseCapacity(warehouseLevel);
  const globalShipments = (profile.globalShipments ?? []).map((shipment) => {
    if (shipment.status !== 'in-transit' || shipment.direction !== 'import' || shipment.arrivesOnDay > nextDay) {
      return shipment;
    }
    const itemLimit = getWarehouseItemCapacity(shipment.itemId, warehouseLevel) ?? (findMaterial(shipment.itemId)?.storageLimit ?? 1_000);
    const existingLot = inventory.find((lot) => lot.materialOrProductId === shipment.itemId);
    const currentMaterialsUsed = getWarehouseUsage(inventory, productionOrders).materials;
    if ((existingLot?.quantity ?? 0) + shipment.quantity > itemLimit || currentMaterialsUsed + shipment.quantity > warehouseCapacity.materials) {
      return { ...shipment, arrivesOnDay: nextDay + 1 };
    }
    const shipmentValue = Math.round(shipment.quantity * shipment.unitCostOrPrice);
    inventory = existingLot
      ? inventory.map((lot) =>
          lot.materialOrProductId === shipment.itemId
            ? {
                ...lot,
                quantity: lot.quantity + shipment.quantity,
                unitCost: (lot.quantity * lot.unitCost + shipmentValue) / (lot.quantity + shipment.quantity),
                qualityScore: Math.round(
                  (((lot.qualityScore ?? 88) * lot.quantity + shipment.qualityScore * shipment.quantity) /
                    (lot.quantity + shipment.quantity)) *
                    10,
                ) / 10,
              }
            : lot,
        )
      : [
          ...inventory,
          {
            id: nextId(profile, 'inventory', inventory.length),
            materialOrProductId: shipment.itemId,
            quantity: shipment.quantity,
            unit: shipment.unit,
            unitCost: shipment.unitCostOrPrice,
            qualityScore: shipment.qualityScore,
          },
        ];

    if (shipment.deferredBalanceDue > 0) {
      const paidLC = Math.min(balance, shipment.deferredBalanceDue);
      balance -= paidLC;
      const unpaidLC = shipment.deferredBalanceDue - paidLC;
      if (paidLC > 0) {
        entries.push(ledgerEntry(profile, 'asset', paidLC, `تسوية اعتماد مستندي لوصول شحنة ${shipment.itemName}`, entries.length));
      }
      if (unpaidLC > 0) {
        payables += unpaidLC;
        entries.push(ledgerEntry(profile, 'liability', unpaidLC, `متبقي اعتماد مستندي غير مسدد لشحنة ${shipment.itemName}`, entries.length));
      }
    }
    return { ...shipment, deferredBalanceDue: 0, status: 'delivered' as const };
  });

  const forwardContracts = (profile.forwardContracts ?? []).map((fw) =>
    fw.status === 'active' && fw.expiresOnDay < nextDay
      ? { ...fw, status: 'expired' as const }
      : fw,
  );
  const paidOperatingCost = Math.min(balance, operatingCost);
  balance -= paidOperatingCost;
  if (operatingCost > 0) entries.push(ledgerEntry(profile, 'expense', operatingCost, 'مصروفات التشغيل اليومية المستحقة', entries.length));
  const unpaidOperatingCost = operatingCost - paidOperatingCost;
  if (unpaidOperatingCost > 0) {
    payables += unpaidOperatingCost;
    entries.push(ledgerEntry(profile, 'liability', unpaidOperatingCost, 'مستحقات تشغيل غير مسددة', entries.length));
  }

  let investmentPayout = 0;
  const investments = profile.investments.map((investment, index) => {
    if (investment.status !== 'active' || investment.maturityDay > nextDay) return investment;
    const definition = findInvestment(investment.investmentTypeId);
    const riskRoll = (nextDay * 7_919 + (index + 1) * 104_729) % 10_000;
    const riskThreshold = Math.round((definition?.riskRate ?? 0) * 10_000);
    const hadLoss = Boolean(definition && riskThreshold > 0 && riskRoll < riskThreshold);
    const payoutRate = getInvestmentPayoutRate(investment.expectedReturnRate, definition?.durationDays ?? 1);
    const payout = Math.round(investment.principal * (hadLoss ? 1 - (definition?.riskRate ?? 0) : 1 + payoutRate));
    investmentPayout += payout;
    balance += payout;
    const difference = payout - investment.principal;
    if (difference > 0) entries.push(ledgerEntry(profile, 'revenue', difference, `تسوية استثمار رابح ${investment.id}`, entries.length));
    if (difference < 0) entries.push(ledgerEntry(profile, 'expense', Math.abs(difference), `خسارة محاكاة في الاستثمار ${investment.id}`, entries.length));
    return { ...investment, status: hadLoss ? 'loss' as const : 'paid' as const, settledAmount: payout };
  });

  const ownsEventIndustry = !briefing.event.industryId
    || profile.companies.some((company) => company.industryId === briefing.event.industryId);
  let eventImpact = ownsEventIndustry ? briefing.event.cashImpact : 0;
  if (ownsEventIndustry && briefing.event.cashImpact > 0) {
    balance += briefing.event.cashImpact;
    entries.push(ledgerEntry(profile, 'revenue', briefing.event.cashImpact, briefing.event.title, entries.length));
  } else if (ownsEventIndustry && briefing.event.cashImpact < 0) {
    const lawyer = profile.staff.find((member) => member.status === 'active' && member.role === 'lawyer');
    const accountant = profile.staff.find((member) => member.status === 'active' && member.role === 'accountant');
    const lawyerFactor = lawyer ? Math.max(0.70, 0.85 - (staffLevel(lawyer) - 1) * 0.03) : 1;
    const accountantFactor = accountant ? Math.max(0.55, 0.75 - (staffLevel(accountant) - 1) * 0.05) : 1;
    const combinedFactor = Math.min(lawyerFactor, accountantFactor);
    const eventCost = Math.round(Math.abs(briefing.event.cashImpact) * combinedFactor);
    const paidEventCost = Math.min(balance, eventCost);
    balance -= paidEventCost;
    eventImpact = -paidEventCost;
    entries.push(ledgerEntry(profile, 'expense', eventCost, `${briefing.event.title}${combinedFactor < 1 ? ' (مع حماية المستشار/المحاسب)' : ''}`, entries.length));
    if (paidEventCost < eventCost) {
      const unpaidEventCost = eventCost - paidEventCost;
      payables += unpaidEventCost;
      entries.push(ledgerEntry(profile, 'liability', unpaidEventCost, 'التزام حدث اقتصادي غير مسدد', entries.length));
    }
  }
  const paidAtClose = Math.min(balance, payables);
  if (paidAtClose > 0) {
    balance -= paidAtClose;
    payables -= paidAtClose;
    entries.push(ledgerEntry(profile, 'settlement', paidAtClose, 'سداد التزامات من سيولة اليوم', entries.length));
  }
  const outstandingSalary = unpaidSalaryTotal({ ...profile, staff });
  const energyPaused = payables > 0 || outstandingSalary > 0;
  const companies = profile.companies.map((company) => {
    const industry = findIndustry(company.industryId);
    const capacity = company.energyCapacity ?? industry?.energyCapacity ?? 0;
    const supply = industry?.dailyEnergySupply ?? capacity;
    return { ...company, energyUnits: energyPaused ? 0 : Math.min(capacity, (company.energyUnits ?? 0) + supply) };
  });

  // Directive 2: Executive Director auto-purchases raw materials when stock is below threshold
  if (generalManager && directives.autoPurchaseMaterials && balance > 5_000) {
    const targetThreshold = directives.autoPurchaseThreshold || 50;
    const budgetLimit = directives.autoPurchaseBudget || 50_000;
    let spentOnMaterials = 0;

    for (const company of companies) {
      const recipe = findRecipeForIndustry(company.industryId);
      if (!recipe) continue;
      for (const input of recipe.inputs) {
        const lot = inventory.find((item) => item.materialOrProductId === input.materialId);
        const currentQty = lot?.quantity ?? 0;
        if (currentQty < targetThreshold) {
          const needed = targetThreshold - currentQty;
          const mat = findMaterial(input.materialId);
          const unitPrice = mat?.pricePerUnit ?? 100;
          const purchaseCost = needed * unitPrice;
          if (spentOnMaterials + purchaseCost <= budgetLimit && balance >= purchaseCost) {
            const warehouseUsage = getWarehouseUsage(inventory, productionOrders);
            const warehouseCap = getWarehouseCapacity(warehouseLevel);
            if (warehouseUsage.materials + needed <= warehouseCap.materials) {
              balance -= purchaseCost;
              spentOnMaterials += purchaseCost;
              const existingIdx = inventory.findIndex((item) => item.materialOrProductId === input.materialId);
              if (existingIdx >= 0) {
                const prev = inventory[existingIdx];
                const newQty = prev.quantity + needed;
                const newUnitCost = (prev.quantity * prev.unitCost + purchaseCost) / newQty;
                inventory[existingIdx] = { ...prev, quantity: newQty, unitCost: newUnitCost };
              } else {
                inventory.push({
                  id: nextId(profile, 'inventory', inventory.length),
                  materialOrProductId: input.materialId,
                  quantity: needed,
                  unit: mat?.unit ?? 'وحدة',
                  unitCost: unitPrice,
                  qualityScore: 90,
                });
              }
              entries.push(ledgerEntry(profile, 'expense', purchaseCost, `تموين خامات آلي بتفويض المدير التنفيذي: ${mat?.name ?? input.materialId} (${needed} وحدة)`, entries.length));
            }
          }
        }
      }
    }
  }

  // Directive 3: Operations Director continuous auto-production
  const operationsDirector = profile.staff.find((member) => member.status === 'active' && member.role === 'operations_director');
  if (operationsDirector && directives.autoRunProduction && !energyPaused) {
    for (let i = 0; i < companies.length; i++) {
      const company = companies[i];
      if (directives.autoProduceCompanyIds && directives.autoProduceCompanyIds.length > 0 && !directives.autoProduceCompanyIds.includes(company.id)) {
        continue;
      }
      const hasActiveOrder = productionOrders.some((order) => order.companyId === company.id && order.status === 'active');
      if (!hasActiveOrder && (company.maintenanceCondition ?? 100) >= 30) {
        const recipe = findRecipeForIndustry(company.industryId);
        if (recipe) {
          const batches = 1;
          const energyAvailable = company.energyUnits ?? 0;
          const energyCost = batches * recipe.energyCost;
          const maintenanceCost = Math.round((company.operatingCostPerDay ?? 0) * 0.15 * getOperatingCostProgression(nextDay));

          let hasMaterials = true;
          for (const input of recipe.inputs) {
            const lot = inventory.find((item) => item.materialOrProductId === input.materialId);
            if (!lot || lot.quantity < input.quantity * batches) {
              hasMaterials = false;
              break;
            }
          }

          if (hasMaterials && energyAvailable >= batches * recipe.energyUnits && balance >= energyCost + maintenanceCost) {
            inventory = inventory.map((lot) => {
              const input = recipe.inputs.find((item) => item.materialId === lot.materialOrProductId);
              return input ? { ...lot, quantity: lot.quantity - input.quantity * batches } : lot;
            }).filter((lot) => lot.quantity > 0);

            balance -= (energyCost + maintenanceCost);
            companies[i] = {
              ...company,
              energyUnits: energyAvailable - batches * recipe.energyUnits,
              maintenanceCondition: Math.max(0, (company.maintenanceCondition ?? 100) - 8),
            };

            const outputQuantity = Math.max(recipe.outputQuantity, Math.round(batches * recipe.outputQuantity * getSynergyProductionMultiplier(profile)));
            const autoOrder: ProductionOrder = {
              id: nextId(profile, 'production', productionOrders.length),
              companyId: company.id,
              productId: recipe.productId,
              productName: recipe.productName,
              batches,
              outputQuantity,
              outputUnit: recipe.outputUnit,
              materialCost: 0,
              energyCost,
              expectedUnitCost: (energyCost + maintenanceCost) / outputQuantity,
              demandForecast: 25,
              qualityScore: 92,
              maintenanceCost,
              startedOnDay: nextDay,
              completesOnDay: nextDay + 1,
              status: 'active',
            };
            productionOrders.push(autoOrder);
            entries.push(ledgerEntry(profile, 'expense', energyCost + maintenanceCost, `تشغيل خط إنتاج آلي بإشراف مدير التشغيل: ${recipe.productName}`, entries.length));
          }
        }
      }
    }
  }
  const expiredContracts = (profile.contracts ?? []).filter((contract) => contract.status === 'active' && contract.deadlineDay < nextDay);
  const contracts = (profile.contracts ?? []).map((contract) => contract.status === 'active' && contract.deadlineDay < nextDay
    ? { ...contract, status: 'failed' as const, failedOnDay: nextDay }
    : contract);
  const reputation = Math.max(0, Math.min(100, (profile.reputation ?? 50) - expiredContracts.length * 6));
  if (expiredContracts.length > 0) entries.push(ledgerEntry(profile, 'expense', expiredContracts.length * 2_000, 'غرامات عقود متأخرة', entries.length));
  const event: GameEventRecord = {
    id: `event-${nextDay}`,
    day: nextDay,
    title: expiredContracts.length > 0 ? `${briefing.event.title} · تأخر عقد` : briefing.event.title,
    description: briefing.event.description,
    cashImpact: eventImpact,
    ...(briefing.event.industryId ? { industryId: briefing.event.industryId } : {}),
    ...(briefing.event.materialId ? { materialId: briefing.event.materialId } : {}),
    ...(briefing.event.productId ? { productId: briefing.event.productId } : {}),
    ...(briefing.event.materialPriceMultiplier !== undefined ? { materialPriceMultiplier: briefing.event.materialPriceMultiplier } : {}),
    ...(briefing.event.demandMultiplier !== undefined ? { demandMultiplier: briefing.event.demandMultiplier } : {}),
    ...(briefing.event.durationDays ? { effectExpiresOnDay: nextDay + briefing.event.durationDays - 1 } : {}),
    occurredAt: now,
  };
  const nextProfile = addLedger(
    {
      ...profile,
      day: nextDay,
      activeDaySpeedMultiplier: 1,
      companies,
      investments,
      banking: { ...profile.banking, loans },
      staff,
      productionOrders,
      inventory,
      unreadProductionOrderIds: [...new Set([...(profile.unreadProductionOrderIds ?? []), ...newlyCompletedProductionIds])].slice(-500),
      events: [...profile.events, event],
      payables,
      contracts,
      reputation,
      ...(profile.globalShipments !== undefined ? { globalShipments } : {}),
      ...(profile.forwardContracts !== undefined ? { forwardContracts } : {}),
    },
    entries,
    balance,
  );
  const totalOutstanding = payables + outstandingSalary;
  const message = totalOutstanding > 0
    ? `مرّ اليوم ${nextDay}، لكن بقيت التزامات ورواتب غير مسددة بقيمة ${Math.round(totalOutstanding).toLocaleString('ar-EG')} $؛ أُوقفت الطاقة مؤقتًا حتى السداد.`
    : `مرّ اليوم ${nextDay} وعولجت المصروفات والأحداث والاستثمارات.`;
  return success(syncTasks(nextProfile), message, { day: nextDay, operatingCost, paidOperatingCost, payables, investmentPayout, event });
}

function awardAchievements(profile: PlayerProfile): { achievements: AchievementRecord[]; bonus: number } {
  const current = profile.achievements ?? [];
  const rules = [
    { id: 'first-contract', title: 'أول صفقة موثوقة', earned: (item: PlayerProfile) => item.contracts.some((contract) => contract.status === 'completed') },
    { id: 'trusted-partner', title: 'شريك موثوق', earned: (item: PlayerProfile) => item.reputation >= 75 },
    { id: 'contract-master', title: 'سيد العقود', earned: (item: PlayerProfile) => item.contracts.filter((contract) => contract.status === 'completed').length >= 5 },
    { id: 'industrialist', title: 'صناعي صاعد', earned: (item: PlayerProfile) => item.companies.length >= 3 },
  ];
  const additions = rules.filter((rule) => rule.earned(profile) && !current.some((achievement) => achievement.id === rule.id)).map((rule) => ({ id: rule.id, title: rule.title, earnedAtDay: profile.day }));
  return { achievements: [...current, ...additions], bonus: additions.length * 10_000 };
}

export function acceptContract(profile: PlayerProfile, offerId: string): GameResult<BusinessContract> {
  const offer = getContractOffers(profile).find((item) => item.id === offerId);
  if (!offer) return failure(profile, 'not-found', 'انتهت صلاحية هذا العقد؛ افتح لوحة العقود لرؤية عروض اليوم.');
  const previousContract = (profile.contracts ?? []).find((contract) => contract.id === offerId);
  if (previousContract?.status === 'active') return failure(profile, 'already-owned', 'هذا العقد مقبول بالفعل.');
  if (previousContract?.status === 'completed') return failure(profile, 'already-owned', 'تم تنفيذ هذا العرض من قبل ولا يمكن تكراره.');
  if (previousContract?.status === 'failed') return failure(profile, 'already-owned', 'انتهى هذا العرض بعد فشله ولا يمكن إعادة استخدامه.');
  if ((profile.contracts ?? []).filter((contract) => contract.status === 'active').length >= 3) return failure(profile, 'condition-not-met', 'لا يمكنك إدارة أكثر من ثلاثة عقود نشطة في وقت واحد.');
  const { description: _offerDescription, ...contractOffer } = offer;
  const contract: BusinessContract = { ...contractOffer, status: 'active', acceptedOnDay: profile.day };
  return success({ ...profile, contracts: [...(profile.contracts ?? []), contract] }, `تم قبول عقد ${contract.clientName} حتى اليوم ${contract.deadlineDay}.`, contract);
}

export function deliverContract(profile: PlayerProfile, contractId: string): GameResult<BusinessContract> {
  const contract = (profile.contracts ?? []).find((item) => item.id === contractId && item.status === 'active');
  if (!contract) return failure(profile, 'not-found', 'العقد غير موجود أو تمت تسويته.');
  if (profile.day > contract.deadlineDay) return failure(profile, 'condition-not-met', 'انتهت مهلة العقد؛ انتظر ترحيل اليوم لتسجيل فشله.');
  const lot = profile.inventory.find((item) => item.materialOrProductId === contract.productId && item.quantity >= contract.quantity);
  if (!lot) return failure(profile, 'insufficient-materials', `تحتاج إلى ${contract.quantity} وحدة من ${contract.productName} قبل التسليم.`);
  const minimumQuality = contract.minimumQuality ?? 0;
  const actualQuality = lot.qualityScore ?? 90;
  if (actualQuality < minimumQuality) return failure(profile, 'condition-not-met', `جودة المنتج ${Math.round(actualQuality)}%، بينما يشترط العميل ${minimumQuality}% على الأقل.`);
  const nextInventory = profile.inventory.flatMap((item) => item.id !== lot.id ? [item] : item.quantity === contract.quantity ? [] : [{ ...item, quantity: item.quantity - contract.quantity }]);
  const grossRevenue = contract.quantity * contract.unitPrice;
  const accountant = profile.staff.find((member) => member.status === 'active' && member.role === 'accountant');
  const accountantLevel = staffLevel(accountant);
  const taxReduction = accountant ? Math.min(0.45, 0.18 + (accountantLevel - 1) * 0.05) : 0;
  const taxRate = (findCountry(profile.countryId)?.economy.taxRate ?? 0) * (1 - taxReduction);
  const tax = Math.round(grossRevenue * taxRate);
  const costOfGoods = Math.round(lot.unitCost * contract.quantity);
  const sale: ProductSale = { id: nextId(profile, 'sale', profile.sales.length), productId: contract.productId, quantity: contract.quantity, unitPrice: contract.unitPrice, grossRevenue, tax, costOfGoods, soldOnDay: profile.day, contractId: contract.id, soldAt: timestampFor(profile) };
  const lawyer = profile.staff.find((member) => member.status === 'active' && member.role === 'lawyer');
  const lawyerLevel = staffLevel(lawyer);
  const lawyerBonusMult = lawyer ? 1 + (0.10 + (lawyerLevel - 1) * 0.04) : 1;
  const contractReward = Math.round(contract.reward * lawyerBonusMult);
  const revenue = grossRevenue + contractReward;
  const completed: BusinessContract = { ...contract, reward: contractReward, status: 'completed', completedOnDay: profile.day };
  const contracts = (profile.contracts ?? []).map((item) => item.id === contract.id ? completed : item);
  const base = { ...profile, inventory: nextInventory, sales: [...profile.sales, sale], contracts, reputation: Math.min(100, (profile.reputation ?? 50) + contract.reputationReward) };
  const achievements = awardAchievements(base);
  const nextProfile = addLedger(
    { ...base, achievements: achievements.achievements },
    [
      ledgerEntry(profile, 'revenue', grossRevenue, `بيع عقد ${contract.clientName} · ${contract.productName}`, 0),
      ledgerEntry(profile, 'revenue', contractReward, `علاوة عقد ${contract.clientName}${lawyer ? ' (مع علاوة صياغة المحامي)' : ''}`, 1),
      ledgerEntry(profile, 'expense', tax, `ضريبة مبيعات محاكاة على العقد${accountant ? ' (مخفضة بفضل المحاسب)' : ''}`, 2),
      ledgerEntry(profile, 'expense', costOfGoods, `تكلفة البضاعة المباعة بعقد: ${contract.productName}`, 3),
      ...(achievements.bonus > 0 ? [ledgerEntry(profile, 'revenue', achievements.bonus, 'مكافأة إنجازات العقود', 4)] : []),
    ],
    profile.bankBalance + revenue - tax + achievements.bonus,
  );
  return success(syncTasks(nextProfile), `تم تسليم العقد بنجاح. الإيراد ${grossRevenue.toLocaleString('ar-EG')} $ والعلاوة ${contractReward.toLocaleString('ar-EG')} $ بعد احتساب الضريبة والتكلفة.`, completed);
}

export function negotiateContract(profile: PlayerProfile, contractId: string, mode: 'price' | 'deadline' | 'quality'): GameResult<BusinessContract> {
  const contract = (profile.contracts ?? []).find((item) => item.id === contractId && item.status === 'active');
  if (!contract) return failure(profile, 'not-found', 'العقد غير موجود أو تمت تسويته.');
  if (contract.negotiated) return failure(profile, 'already-owned', 'تم التفاوض على هذا العقد من قبل.');
  const lawyer = profile.staff.find((member) => member.status === 'active' && member.role === 'lawyer');
  const priceMult = lawyer ? 1.12 : 1.08;
  const deadlinePenalty = lawyer ? 0.98 : 0.95;
  const changes = mode === 'price'
    ? { unitPrice: Math.round(contract.unitPrice * priceMult), negotiationNote: `رفع السعر ${lawyer ? '12%' : '8%'} بحماية وخبرة المستشار القانوني.` }
    : mode === 'deadline'
      ? { deadlineDay: contract.deadlineDay + 1, reward: Math.round(contract.reward * deadlinePenalty), negotiationNote: `تمديد يوم واحد مع صياغة قانونية متوازنة.` }
      : { minimumQuality: Math.max(0, (contract.minimumQuality ?? 90) - (lawyer ? 7 : 5)), reward: Math.round(contract.reward * 0.94), negotiationNote: 'خفض اشتراطات الجودة بمرونة تعاقدية.' };
  const updated = { ...contract, ...changes, negotiated: true };
  return success({ ...profile, contracts: profile.contracts.map((item) => item.id === contractId ? updated : item) }, `تم التفاوض: ${updated.negotiationNote}`, updated);
}

export function claimTask(profile: PlayerProfile, taskId: string): GameResult<TaskOutcome> {
  const task = TASK_CATALOG.find((item) => item.id === taskId);
  if (!task) return failure(profile, 'not-found', 'المهمة غير موجودة.');
  const current = (profile.tasks ?? []).find((item) => item.taskId === taskId);
  if (current?.claimed || profile.completedTaskIds.includes(taskId)) return failure(profile, 'already-claimed', 'تم تحصيل مكافأة هذه المهمة من قبل.');
  if (!conditionMet(profile, task.condition)) return failure(profile, 'condition-not-met', 'لم يتحقق شرط المهمة بعد.');
  const tasks = [...(profile.tasks ?? []).filter((item) => item.taskId !== taskId), { taskId, claimed: true, claimedAt: timestampFor(profile) }];
  const nextProfile = addLedger(
    { ...profile, tasks, completedTaskIds: [...profile.completedTaskIds, taskId] },
    [ledgerEntry(profile, 'revenue', task.reward, `مكافأة المهمة: ${task.title}`, 0)],
    profile.bankBalance + task.reward,
  );
  return success(nextProfile, `تم تحصيل مكافأة مهمة «${task.title}» مرة واحدة.`, { taskId, reward: task.reward });
}

/** Compatibility aliases for callers that prefer verb-first names. */
export const bidOnLand = placeBid;
export const purchaseMaterial = buyMaterial;
export const foundBusiness = foundCompany;
export const produce = runProduction;
export const sell = sellProduct;
export const invest = createInvestment;
export const passDay = advanceDay;

export function updateNotificationState(profile: PlayerProfile, action: unknown, notificationIds: unknown): GameResult<{ action: 'read' | 'dismiss'; notificationIds: string[] }> {
  if (action !== 'read' && action !== 'dismiss') return failure(profile, 'invalid-input', 'إجراء التنبيه غير صالح.');
  if (!Array.isArray(notificationIds) || notificationIds.length === 0 || notificationIds.length > 20) return failure(profile, 'invalid-input', 'اختر تنبيهًا واحدًا على الأقل.');
  const ids = [...new Set(notificationIds.filter((id): id is string => typeof id === 'string' && id.trim().length > 0 && id.length <= 512))];
  if (ids.length === 0 || ids.length !== notificationIds.length) return failure(profile, 'invalid-input', 'قائمة التنبيهات غير صالحة.');
  const readIds = new Set(profile.readNotificationIds ?? []);
  const dismissedIds = new Set(profile.dismissedNotificationIds ?? []);
  for (const id of ids) (action === 'read' ? readIds : dismissedIds).add(id);
  const productionIds = new Set(ids.flatMap((id) => id.startsWith('production-completed:') ? id.slice('production-completed:'.length).split(',').filter(Boolean) : []));
  const nextProfile: PlayerProfile = {
    ...profile,
    readNotificationIds: [...readIds].slice(-500),
    dismissedNotificationIds: [...dismissedIds].slice(-500),
    unreadProductionOrderIds: (profile.unreadProductionOrderIds ?? []).filter((id) => !productionIds.has(id)),
  };
  return success(nextProfile, action === 'read' ? 'تم تعليم التنبيه كمقروء.' : 'تم إخفاء التنبيه.', { action, notificationIds: ids });
}

export function updateAutomationDirectives(
  profile: PlayerProfile,
  directives: Partial<AutomationDirectives>,
): GameResult<AutomationDirectives> {
  const current = profile.automationDirectives ?? getDefaultAutomationDirectives();
  const updated: AutomationDirectives = {
    ...current,
    ...directives,
  };
  const nextProfile: PlayerProfile = {
    ...profile,
    automationDirectives: updated,
  };
  return success(nextProfile, 'تم حفظ تفويضات الإدارة المؤتمتة بنجاح.', updated);
}

/** Serializable intent sent by authenticated clients; it deliberately contains no profile/save data. */
export type GameCommand =
  | { name: 'place_bid'; args: { listingId: string; amount: number; targetCompanyId?: string } }
  | { name: 'buy_direct_land'; args: { listingId: string; paymentMethod?: PurchasePaymentMethod } }
  | { name: 'buy_direct_company'; args: { listingId: string; paymentMethod?: PurchasePaymentMethod } }
  | { name: 'sell_land'; args: { landId: string } }
  | { name: 'upgrade_land'; args: { landId: string; paymentMethod?: PurchasePaymentMethod } }
  | { name: 'sell_company'; args: { companyId: string } }
  | { name: 'sell_asset'; args: { assetId: string } }
  | { name: 'buy_material'; args: { materialId: string; quantity: number } }
  | { name: 'buy_global_material'; args: { offerId: string; quantity: number; negotiatedUnitPrice?: number; paymentMethod?: PurchasePaymentMethod; shippingMode?: GlobalShippingMode; paymentTerm?: GlobalPaymentTerm; fleetCount?: number } }
  | { name: 'export_global_product'; args: { bidId: string; quantity: number } }
  | { name: 'sign_forward_contract'; args: { templateId: string } }
  | { name: 'draw_forward_contract'; args: { contractId: string; quantity: number } }
  | { name: 'found_company'; args: { industryId: IndustryId; landId: string; name: string; paymentMethod?: PurchasePaymentMethod } }
  | { name: 'upgrade_company'; args: { companyId: string; paymentMethod?: PurchasePaymentMethod } }
  | { name: 'run_production'; args: { companyId: string; batches: number } }
  | { name: 'auto_supply_and_produce'; args: { companyId: string; batches: number } }
  | { name: 'service_company'; args: { companyId: string } }
  | { name: 'cancel_production'; args: { orderId: string } }
  | { name: 'use_speed_card'; args: { orderId: string; kind: SpeedCardKind } }
  | { name: 'use_day_speed_card'; args: { kind: SpeedCardKind } }
  | { name: 'buy_speed_card'; args: { kind: SpeedCardKind; quantity: number; paymentMethod?: PurchasePaymentMethod } }
  | { name: 'upgrade_warehouse'; args: { paymentMethod?: PurchasePaymentMethod } }
  | { name: 'sell_product'; args: { productId: string; quantity: number } }
  | { name: 'buy_gold'; args: { grams: number } }
  | { name: 'buy_gold_with_diamonds'; args: { grams: number } }
  | { name: 'sell_gold'; args: { grams: number } }
  | { name: 'hire_staff'; args: { role: StaffRole; name: string; companyId?: string } }
  | { name: 'upgrade_staff'; args: { staffId: string } }
  | { name: 'pay_staff_salary'; args: { staffId: string } }
  | { name: 'terminate_staff'; args: { staffId: string } }
  | { name: 'update_automation_directives'; args: { directives: Partial<AutomationDirectives> } }
  | { name: 'create_deposit'; args: { amount: number; durationDays: number } }
  | { name: 'merge_deposits'; args: { depositIds: string[] } }
  | { name: 'withdraw_deposit'; args: { depositId: string } }
  | { name: 'take_loan'; args: { collateralType: LoanRecord['collateralType']; collateralId: string; amount: number; termDays: number } }
  | { name: 'repay_loan'; args: { loanId: string; installments: number | 'all' } }
  | { name: 'create_investment'; args: { investmentId: string; amount: number } }
  | { name: 'advance_day'; args: {} }
  | { name: 'accept_contract'; args: { offerId: string } }
  | { name: 'deliver_contract'; args: { contractId: string } }
  | { name: 'negotiate_contract'; args: { contractId: string; mode: 'price' | 'deadline' | 'quality' } }
  | { name: 'claim_task'; args: { taskId: string } }
  | { name: 'claim_season_challenge'; args: { challengeId: string } }
  | { name: 'claim_login_reward'; args: { rewardId: (typeof LOGIN_REWARDS)[number]['id'] } }
  | { name: 'choose_season_event'; args: { choiceId: string } }
  | { name: 'update_notification_state'; args: { action: 'read' | 'dismiss'; notificationIds: string[] } }
  | { name: 'list_player_asset'; args: { assetType: 'land' | 'company'; assetId: string; startingBid: number } }
  | { name: 'settle_player_auction'; args: { listingId: string; customWinningAmount?: number; customBuyerName?: string } }
  | { name: 'cancel_player_auction'; args: { listingId: string } }
  | { name: 'claim_starter_mission'; args: { missionId: string } };

export type GameCommandHandler = (command: GameCommand, fallback: (profile: PlayerProfile) => GameResult<unknown>) => void | Promise<void>;

/** Execute a client intent against an already-authoritative profile. Never accepts a profile as input. */
export function executeGameCommand(profile: PlayerProfile, command: GameCommand): GameResult<unknown> {
  switch (command.name) {
    case 'place_bid': return placeBid(profile, command.args.listingId, command.args.amount, command.args.targetCompanyId);
    case 'buy_direct_land': return buyDirectLand(profile, command.args.listingId, command.args.paymentMethod);
    case 'buy_direct_company': return buyDirectCompany(profile, command.args.listingId, command.args.paymentMethod);
    case 'sell_land': return sellLand(profile, command.args.landId);
    case 'upgrade_land': return upgradeLand(profile, command.args.landId, command.args.paymentMethod);
    case 'sell_company': return sellCompany(profile, command.args.companyId);
    case 'sell_asset': return sellAsset(profile, command.args.assetId);
    case 'buy_material': return buyMaterial(profile, command.args.materialId, command.args.quantity);
    case 'buy_global_material': return buyGlobalMaterial(profile, command.args.offerId, command.args.quantity, command.args.negotiatedUnitPrice, command.args.paymentMethod, { shippingMode: command.args.shippingMode, paymentTerm: command.args.paymentTerm, fleetCount: command.args.fleetCount });
    case 'export_global_product': return exportGlobalProduct(profile, command.args.bidId, command.args.quantity);
    case 'sign_forward_contract': return signForwardContract(profile, command.args.templateId);
    case 'draw_forward_contract': return drawFromForwardContract(profile, command.args.contractId, command.args.quantity);
    case 'found_company': return foundCompany(profile, command.args.industryId, command.args.landId, command.args.name, command.args.paymentMethod);
    case 'upgrade_company': return upgradeCompany(profile, command.args.companyId, command.args.paymentMethod);
    case 'run_production': return runProduction(profile, command.args.companyId, command.args.batches);
    case 'auto_supply_and_produce': return autoSupplyAndProduce(profile, command.args.companyId, command.args.batches);
    case 'service_company': return serviceCompany(profile, command.args.companyId);
    case 'cancel_production': return cancelProductionOrder(profile, command.args.orderId);
    case 'use_speed_card': return useProductionSpeedCard(profile, command.args.orderId, command.args.kind);
    case 'use_day_speed_card': return useDaySpeedCard(profile, command.args.kind);
    case 'buy_speed_card': return buySpeedCard(profile, command.args.kind, command.args.quantity, command.args.paymentMethod);
    case 'upgrade_warehouse': return upgradeWarehouse(profile, command.args.paymentMethod);
    case 'sell_product': return sellProduct(profile, command.args.productId, command.args.quantity);
    case 'buy_gold': return buyGold(profile, command.args.grams);
    case 'buy_gold_with_diamonds': return buyGoldWithDiamonds(profile, command.args.grams);
    case 'sell_gold': return sellGold(profile, command.args.grams);
    case 'hire_staff': return hireStaff(profile, command.args.role, command.args.name, command.args.companyId);
    case 'upgrade_staff': return upgradeStaff(profile, command.args.staffId);
    case 'pay_staff_salary': return payStaffSalary(profile, command.args.staffId);
    case 'terminate_staff': return terminateStaff(profile, command.args.staffId);
    case 'update_automation_directives': return updateAutomationDirectives(profile, command.args.directives);
    case 'create_deposit': return createDeposit(profile, command.args.amount, command.args.durationDays);
    case 'merge_deposits': return mergeDeposits(profile, command.args.depositIds);
    case 'withdraw_deposit': return withdrawDeposit(profile, command.args.depositId);
    case 'take_loan': return takeLoan(profile, command.args.collateralType, command.args.collateralId, command.args.amount, command.args.termDays);
    case 'repay_loan': return repayLoan(profile, command.args.loanId, command.args.installments);
    case 'create_investment': return createInvestment(profile, command.args.investmentId, command.args.amount);
    case 'advance_day': return advanceDay(profile);
    case 'accept_contract': return acceptContract(profile, command.args.offerId);
    case 'deliver_contract': return deliverContract(profile, command.args.contractId);
    case 'negotiate_contract': return negotiateContract(profile, command.args.contractId, command.args.mode);
    case 'claim_task': return claimTask(profile, command.args.taskId);
    case 'claim_season_challenge': return claimSeasonChallenge(profile, command.args.challengeId);
    case 'claim_login_reward': return claimLoginReward(profile, command.args.rewardId);
    case 'choose_season_event': return chooseSeasonEvent(profile, command.args.choiceId);
    case 'update_notification_state': return updateNotificationState(profile, command.args.action, command.args.notificationIds);
    case 'list_player_asset': return listPlayerAssetForAuction(profile, command.args.assetType, command.args.assetId, command.args.startingBid);
    case 'settle_player_auction': return settlePlayerAssetAuction(profile, command.args.listingId, command.args.customWinningAmount, command.args.customBuyerName);
    case 'cancel_player_auction': return cancelPlayerAssetAuction(profile, command.args.listingId);
    case 'claim_starter_mission': return claimStarterMission(profile, command.args.missionId);
  }
}

export {
  listPlayerAssetForAuction,
  settlePlayerAssetAuction,
  cancelPlayerAssetAuction,
  executeSellPlayerAsset,
} from './dynamicAuctions';

export {
  claimStarterMission,
  getStarterMissions,
  getCompletedStarterMissions,
  getCurrentStarterMissionStage,
  STARTER_MISSION_SPECS,
} from './onboarding';
