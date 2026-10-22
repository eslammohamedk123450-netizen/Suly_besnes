import { findCountry, type IndustryId } from '../domain/countries';
import type { PlayerAsset, PlayerCompany, PlayerLand, PlayerProfile } from '../domain/player';
import type { DepositRecord, FinanceLedgerEntry, GameEventRecord, InventoryLot, InvestmentRecord, LoanRecord, StaffContract, StaffRole } from '../domain/futureSystems';
import {
  AUCTION_CATALOG,
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
  companyId: string;
  productId: string;
  batches: number;
  outputQuantity: number;
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
  event: { title: string; cashImpact: number };
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

const DAY_MS = 86_400_000;

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
  return {
    ...profile,
    tasks: TASK_CATALOG.map((task) => existing.get(task.id) ?? { taskId: task.id, claimed: false }),
  };
}

function conditionMet(profile: PlayerProfile, condition: (typeof TASK_CATALOG)[number]['condition']): boolean {
  switch (condition) {
    case 'own-land': return profile.lands.length > 0;
    case 'own-company': return profile.companies.length > 0;
    case 'buy-material': return profile.ledger.some((entry) => entry.note.startsWith('شراء '));
    case 'run-production': return profile.ledger.some((entry) => entry.note.startsWith('تشغيل '));
    case 'sell-product': return profile.sales.length > 0;
    case 'make-investment': return profile.investments.length > 0;
    case 'reach-day-3': return profile.day >= 3;
  }
}

function ensureEgypt(profile: PlayerProfile): GameResult<never> | null {
  return profile.countryId === 'egypt' && findCountry(profile.countryId)
    ? null
    : failure(profile, 'wrong-country', 'هذه الجولة متاحة لمصر فقط.');
}

export function placeBid(profile: PlayerProfile, listingId: string, amount: number): GameResult<AuctionOutcome> {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount <= 0) return failure(profile, 'invalid-input', 'قيمة العرض يجب أن تكون مبلغًا صحيحًا موجبًا.');
  const listing = AUCTION_CATALOG.find((entry) => entry.id === listingId && entry.status === 'open');
  if (!listing) return failure(profile, 'not-found', 'المزاد غير موجود أو مغلق.');
  if (profile.lands.some((land) => land.id === listing.id) || profile.assets.some((asset) => asset.id === listing.id)
    || profile.ledger.some((entry) => entry.note.includes(listing.label))) return failure(profile, 'already-owned', 'لقد فزت بهذا المزاد بالفعل.');
  if (amount < listing.minimumBid) return failure(profile, 'invalid-input', 'يجب أن يساوي العرض الحد الأدنى للمزاد أو يتجاوزه.');

  const listingIndex = AUCTION_CATALOG.findIndex((entry) => entry.id === listingId);
  const highestBotBid = listing.minimumBid + listing.bidIncrement * (2 + Math.max(0, listingIndex));
  const botBids = [
    { bidderId: `${listing.id}-bot-a`, amount: listing.minimumBid + listing.bidIncrement },
    { bidderId: `${listing.id}-bot-b`, amount: highestBotBid },
  ];
  if (amount <= highestBotBid) {
    return failure(profile, 'auction-lost', `خسر عرضك المزاد؛ أعلى عرض آلي كان ${highestBotBid.toLocaleString('ar-EG')} ج.م.`);
  }
  if (profile.bankBalance < amount) return failure(profile, 'insufficient-funds', 'لا يكفي رصيدك لتسديد العرض الفائز.');

  const acquiredAt = timestampFor(profile);
  if (listing.lotType === 'factory') {
    const company = profile.companies[0];
    if (!company) return failure(profile, 'condition-not-met', 'أسس شركة أولًا حتى تربط بها خط الإنتاج الفائز بالمزاد.');
    const bonus = listing.energyCapacityBonus ?? 40;
    const companyId = company.id;
    const assetId = listing.id;
    const asset: PlayerAsset = { id: assetId, label: `مصنع إضافي: ${listing.label}`, value: amount, acquiredAt };
    const companies = profile.companies.map((item) => item.id === companyId
      ? { ...item, energyCapacity: (item.energyCapacity ?? 0) + bonus, energyUnits: (item.energyUnits ?? 0) + bonus }
      : item);
    const nextProfile = addLedger(
      { ...profile, assets: [...profile.assets, asset], companies },
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
    if ((existing?.quantity ?? 0) + quantity > material.storageLimit) return failure(profile, 'storage-limit', 'سعة المخزن لا تكفي لاستلام الشحنة الفائزة.');
    const inventoryLotId = existing?.id ?? nextId(profile, 'inventory', profile.inventory.length);
    const unitCost = amount / quantity;
    const inventory = existing
      ? profile.inventory.map((lot) => lot.id === existing.id ? { ...lot, quantity: lot.quantity + quantity, unitCost: (lot.quantity * lot.unitCost + amount) / (lot.quantity + quantity) } : lot)
      : [...profile.inventory, { id: inventoryLotId, materialOrProductId: material.id, quantity, unit: material.unit, unitCost }];
    const nextProfile = addLedger(
      { ...profile, inventory },
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
    landType: listing.landType,
  };
  const nextProfile = addLedger(
    { ...profile, lands: [...profile.lands, land] },
    [ledgerEntry(profile, 'asset', amount, `شراء أرض بالمزاد: ${listing.label}`, 0)],
    profile.bankBalance - amount,
  );
  return success(syncTasks(nextProfile), 'تم الفوز بالمزاد وتسجيل الأرض دون خصم عروض خاسرة.', {
    listingId,
    winner: 'player',
    winningAmount: amount,
    botBids,
    landId: land.id,
  });
}

export function buyMaterial(profile: PlayerProfile, materialId: string, quantity: number): GameResult<{ materialId: string; quantity: number; totalCost: number }> {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  const material = findMaterial(materialId);
  if (!material) return failure(profile, 'not-found', 'المادة الخام غير موجودة في الكتالوج.');
  if (!isPositiveInteger(quantity)) return failure(profile, 'invalid-input', 'الكمية يجب أن تكون عددًا صحيحًا موجبًا.');
  const existing = profile.inventory.find((lot) => lot.materialOrProductId === materialId);
  const currentQuantity = existing?.quantity ?? 0;
  if (currentQuantity + quantity > material.storageLimit) return failure(profile, 'storage-limit', 'تتجاوز الكمية سعة التخزين لهذه المادة.');
  const totalCost = quantity * material.pricePerUnit;
  if (profile.bankBalance < totalCost) return failure(profile, 'insufficient-funds', 'لا يكفي رصيدك لشراء هذه الكمية.');

  const inventory = existing
    ? profile.inventory.map((lot) => lot.materialOrProductId === materialId
      ? { ...lot, quantity: lot.quantity + quantity, unitCost: (lot.quantity * lot.unitCost + totalCost) / (lot.quantity + quantity) }
      : lot)
    : [...profile.inventory, { id: nextId(profile, 'inventory', profile.inventory.length), materialOrProductId: materialId, quantity, unit: material.unit, unitCost: material.pricePerUnit }];
  const nextProfile = addLedger(
    { ...profile, inventory },
    [ledgerEntry(profile, 'asset', totalCost, `شراء ${quantity} ${material.unit} من ${material.name}`, 0)],
    profile.bankBalance - totalCost,
  );
  return success(syncTasks(nextProfile), `تم شراء ${quantity} ${material.name} وتخزينها.`, { materialId, quantity, totalCost });
}

export function foundCompany(profile: PlayerProfile, industryId: IndustryId, landId: string, name: string): GameResult<{ companyId: string; totalCost: number }> {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  const industry = findIndustry(industryId);
  const country = findCountry(profile.countryId);
  if (!industry || !country) return failure(profile, 'not-found', 'القطاع أو الدولة غير موجود.');
  const land = profile.lands.find((item) => item.id === landId);
  if (!land) return failure(profile, 'land-required', 'تحتاج إلى أرض مملوكة لتأسيس الشركة.');
  if (profile.companies.some((company) => company.landId === landId)) return failure(profile, 'land-in-use', 'الأرض مرتبطة بشركة أخرى بالفعل.');
  if (land.landType && land.landType !== industry.requiredLandType) return failure(profile, 'wrong-land-type', 'نوع الأرض لا يناسب هذا القطاع.');
  const companyName = name.trim();
  if (!companyName) return failure(profile, 'invalid-input', 'أدخل اسمًا للشركة.');
  const setupFee = country.economy.companySetupFee ?? industry.setupFee;
  const licenseFee = country.economy.licenseFeesByIndustry[industryId] ?? industry.licenseFee;
  const totalCost = setupFee + licenseFee;
  if (profile.bankBalance < totalCost) return failure(profile, 'insufficient-funds', 'لا يكفي رصيدك لرسوم التأسيس والترخيص.');

  const companyId = nextId(profile, 'company', profile.companies.length);
  const licenseId = nextId(profile, 'license', profile.licenses.length);
  const company: PlayerCompany = {
    id: companyId,
    name: companyName,
    industryId,
    countryId: profile.countryId,
    foundedAt: timestampFor(profile),
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
    profile.bankBalance - totalCost,
  );
  return success(syncTasks(nextProfile), `تم تأسيس ${companyName} وترخيصها.`, { companyId, totalCost });
}

export function runProduction(profile: PlayerProfile, companyId: string, batches: number): GameResult<ProductionOutcome> {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  if (!isPositiveInteger(batches)) return failure(profile, 'invalid-input', 'عدد دفعات الإنتاج يجب أن يكون عددًا صحيحًا موجبًا.');
  const company = profile.companies.find((item) => item.id === companyId);
  if (!company) return failure(profile, 'not-found', 'الشركة غير موجودة.');
  const recipe = findRecipeForIndustry(company.industryId);
  if (!recipe) return failure(profile, 'not-found', 'لا توجد وصفة لهذا القطاع.');
  const energyAvailable = company.energyUnits ?? 0;
  if (energyAvailable < batches * recipe.energyUnits) return failure(profile, 'insufficient-energy', 'الطاقة المتاحة لا تكفي لهذه الدفعات.');
  for (const input of recipe.inputs) {
    const lot = profile.inventory.find((item) => item.materialOrProductId === input.materialId);
    if (!lot || lot.quantity < input.quantity * batches) return failure(profile, 'insufficient-materials', 'المواد الخام لا تكفي لهذه الدفعات.');
  }
  const energyCost = batches * recipe.energyCost;
  if (profile.bankBalance < energyCost) return failure(profile, 'insufficient-funds', 'لا يكفي الرصيد لتكلفة تشغيل الطاقة.');
  const materialCost = recipe.inputs.reduce((sum, input) => {
    const lot = profile.inventory.find((item) => item.materialOrProductId === input.materialId);
    return sum + input.quantity * batches * (lot?.unitCost ?? 0);
  }, 0);

  let inventory = profile.inventory.map((lot) => {
    const input = recipe.inputs.find((item) => item.materialId === lot.materialOrProductId);
    return input ? { ...lot, quantity: lot.quantity - input.quantity * batches } : lot;
  }).filter((lot) => lot.quantity > 0);
  const outputQuantity = batches * recipe.outputQuantity;
  const outputLot = inventory.find((lot) => lot.materialOrProductId === recipe.productId);
  const outputUnitCost = materialCost / outputQuantity;
  inventory = outputLot
    ? inventory.map((lot) => lot.materialOrProductId === recipe.productId
      ? { ...lot, quantity: lot.quantity + outputQuantity, unitCost: (lot.quantity * lot.unitCost + outputQuantity * outputUnitCost) / (lot.quantity + outputQuantity) }
      : lot)
    : [...inventory, { id: nextId(profile, 'inventory', inventory.length), materialOrProductId: recipe.productId, quantity: outputQuantity, unit: recipe.outputUnit, unitCost: outputUnitCost }];
  const companies = profile.companies.map((item) => item.id === companyId ? { ...item, energyUnits: energyAvailable - batches * recipe.energyUnits } : item);
  const nextProfile = addLedger(
    { ...profile, inventory, companies },
    [ledgerEntry(profile, 'expense', energyCost, `تشغيل ${batches} دفعة من ${recipe.productName}`, 0)],
    profile.bankBalance - energyCost,
  );
  return success(syncTasks(nextProfile), `تم إنتاج ${outputQuantity} من ${recipe.productName}.`, { companyId, productId: recipe.productId, batches, outputQuantity });
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
  const grossRevenue = quantity * marketQuote.currentPrice;
  const taxRate = findCountry(profile.countryId)?.economy.taxRate ?? 0;
  const tax = Math.round(grossRevenue * taxRate);
  const costOfGoods = Math.round(lot.unitCost * quantity);
  const nextInventory = profile.inventory.map((item) => item.materialOrProductId === productId ? { ...item, quantity: item.quantity - quantity } : item).filter((item) => item.quantity > 0);
  const sale = { id: nextId(profile, 'sale', profile.sales.length), productId, quantity, unitPrice: marketQuote.currentPrice, grossRevenue, tax, soldAt: timestampFor(profile) };
  const nextProfile = addLedger(
    { ...profile, inventory: nextInventory, sales: [...profile.sales, sale] },
    [
      ledgerEntry(profile, 'revenue', grossRevenue, `بيع ${quantity} من ${product.name}`, 0),
      ledgerEntry(profile, 'expense', tax, 'ضريبة مبيعات محاكاة', 1),
      ledgerEntry(profile, 'expense', costOfGoods, `تكلفة البضاعة المباعة: ${product.name}`, 2),
    ],
    profile.bankBalance + grossRevenue - tax,
  );
  return success(syncTasks(nextProfile), `تم بيع ${quantity} من ${product.name} بسعر سوق ${marketQuote.currentPrice.toLocaleString('ar-EG')} ج.م للوحدة بعد احتساب الضريبة والتكلفة.`, { productId, quantity, grossRevenue, tax, costOfGoods, netRevenue: grossRevenue - tax - costOfGoods });
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
  return success(nextProfile, `اشتريت ${grams.toFixed(1)} غرام ذهب بسعر محاكاة ${GOLD_PRICE_PER_GRAM} ج.م للغرام.`, { grams, cashAmount: amount, pricePerGram: GOLD_PRICE_PER_GRAM });
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
  const managedCompanyIds = new Set(profile.staff.filter((member) => member.status === 'active' && member.role === 'manager' && member.companyId).map((member) => member.companyId));
  const operatingCost = profile.companies.reduce((sum, company) => sum + (company.operatingCostPerDay ?? 0) * (managedCompanyIds.has(company.id) ? 0.92 : 1), 0) * multiplier;
  const maturingInvestments = profile.investments
    .filter((investment) => investment.status === 'active' && investment.maturityDay <= day)
    .map((investment) => ({ id: investment.id, name: findInvestment(investment.investmentTypeId)?.name ?? investment.investmentTypeId }));
  const eventTemplates = [
    { title: 'طلب محلي مرتفع', cashImpact: 18_000 },
    { title: 'ارتفاع لوجستي مؤقت', cashImpact: -14_000 },
    { title: 'يوم استقرار اقتصادي', cashImpact: 0 },
  ];
  const event = eventTemplates[(day - 1) % eventTemplates.length];
  const availableEnergy = profile.companies.reduce((sum, company) => sum + (company.energyUnits ?? 0), 0);
  return { day, operatingCost, existingPayables: profile.payables, maturingInvestments, event, availableEnergy, energyPaused: profile.payables > 0 };
}

const STAFF_ROLE_OPTIONS: Record<StaffRole, { label: string; dailySalary: number; companyRequired: boolean }> = {
  manager: { label: 'مدير شركة', dailySalary: 7_000, companyRequired: true },
  accountant: { label: 'محاسب', dailySalary: 4_500, companyRequired: false },
  lawyer: { label: 'محامٍ', dailySalary: 4_000, companyRequired: false },
  hr: { label: 'مدير موارد بشرية', dailySalary: 3_500, companyRequired: false },
};

export function hireStaff(profile: PlayerProfile, role: StaffRole, name: string, companyId?: string): GameResult<StaffContract> {
  const option = STAFF_ROLE_OPTIONS[role];
  if (!option || name.trim().length < 2) return failure(profile, 'invalid-input', 'أدخل اسمًا صحيحًا واختر دورًا معروفًا.');
  if (option.companyRequired && !profile.companies.some((company) => company.id === companyId)) return failure(profile, 'not-found', 'المدير يجب أن يرتبط بشركة موجودة.');
  if (role === 'manager' && profile.staff.some((member) => member.status === 'active' && member.role === 'manager' && member.companyId === companyId)) return failure(profile, 'invalid-input', 'هذه الشركة لديها مدير نشط بالفعل.');
  if (profile.bankBalance < option.dailySalary) return failure(profile, 'insufficient-funds', 'لا يكفي الرصيد لتوقيع عقد الموظف ودفع يوم التعاقد.');
  const staff: StaffContract = { id: nextId(profile, 'staff', profile.staff.length), role, name: name.trim(), companyId, dailySalary: option.dailySalary, hiredOnDay: profile.day, nextPayDay: profile.day + 1, status: 'active' };
  const nextProfile = addLedger(
    { ...profile, staff: [...profile.staff, staff] },
    [ledgerEntry(profile, 'expense', option.dailySalary, `توقيع عقد ${option.label}: ${staff.name}`, 0)],
    profile.bankBalance - option.dailySalary,
  );
  return success(nextProfile, `تم تعيين ${staff.name} بوظيفة ${option.label}؛ أول راتب دوري في اليوم التالي.`, staff);
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
  if (!Number.isInteger(amount) || amount < 50_000) return failure(profile, 'invalid-input', 'الحد الأدنى للوديعة 50,000 جنيه محاكاة.');
  if (amount > profile.bankBalance) return failure(profile, 'insufficient-funds', 'لا يكفي الرصيد لإنشاء هذه الوديعة.');
  const deposit: DepositRecord = { id: nextId(profile, 'deposit', profile.banking.deposits.length), principal: amount, annualRate: option.annualRate, startedOnDay: profile.day, maturityDay: profile.day + durationDays, status: 'active' };
  const nextProfile = addLedger(
    { ...profile, banking: { ...profile.banking, deposits: [...profile.banking.deposits, deposit] } },
    [ledgerEntry(profile, 'asset', amount, `إيداع وديعة لمدة ${durationDays} أيام`, 0)],
    profile.bankBalance - amount,
  );
  return success(nextProfile, `تم إنشاء وديعة محاكاة تستحق في اليوم ${deposit.maturityDay}.`, deposit);
}

export function withdrawDeposit(profile: PlayerProfile, depositId: string): GameResult<{ depositId: string; amount: number; interest: number }> {
  const deposit = profile.banking.deposits.find((item) => item.id === depositId);
  if (!deposit) return failure(profile, 'not-found', 'الوديعة غير موجودة.');
  if (deposit.status !== 'active') return failure(profile, 'invalid-input', 'هذه الوديعة تمت تسويتها من قبل.');
  if (profile.day < deposit.maturityDay) return failure(profile, 'deposit-not-mature', `تستحق الوديعة في اليوم ${deposit.maturityDay}.`);
  const interest = Math.round(deposit.principal * deposit.annualRate * (deposit.maturityDay - deposit.startedOnDay) / 30);
  const amount = deposit.principal + interest;
  const updatedDeposit = { ...deposit, status: 'paid' as const, settledAmount: amount };
  const nextProfile = addLedger(
    { ...profile, banking: { ...profile.banking, deposits: profile.banking.deposits.map((item) => item.id === depositId ? updatedDeposit : item) } },
    [ledgerEntry(profile, 'revenue', interest, `فائدة وديعة محاكاة ${deposit.id}`, 0), ledgerEntry(profile, 'settlement', deposit.principal, `استرداد أصل الوديعة ${deposit.id}`, 1)],
    profile.bankBalance + amount,
  );
  return success(nextProfile, `تم استرداد الوديعة مع فائدة محاكاة ${interest.toLocaleString('ar-EG')} ج.م.`, { depositId, amount, interest });
}

function collateralValue(profile: PlayerProfile, collateralType: LoanRecord['collateralType'], collateralId: string): number {
  if (collateralType === 'land') return profile.lands.find((land) => land.id === collateralId)?.purchasePrice ?? 0;
  const company = profile.companies.find((item) => item.id === collateralId);
  const industry = company ? findIndustry(company.industryId) : undefined;
  const country = company ? findCountry(company.countryId) : undefined;
  return company && industry ? industry.setupFee + (country?.economy.licenseFeesByIndustry[company.industryId] ?? industry.licenseFee) + 100_000 : 0;
}

export function takeLoan(profile: PlayerProfile, collateralType: LoanRecord['collateralType'], collateralId: string, amount: number, termDays: number): GameResult<LoanRecord> {
  const collateralAmount = collateralValue(profile, collateralType, collateralId);
  if (collateralAmount <= 0) return failure(profile, 'not-found', 'الضمان غير موجود أو غير مؤهل للتمويل.');
  if (profile.banking.loans.some((loan) => loan.status === 'active' && loan.collateralType === collateralType && loan.collateralId === collateralId)) return failure(profile, 'collateral-in-use', 'هذا الضمان مرتبط بقرض قائم بالفعل.');
  if (![7, 14, 30].includes(termDays)) return failure(profile, 'invalid-input', 'مدة القرض المتاحة 7 أو 14 أو 30 يومًا.');
  const maximumLoan = Math.floor(collateralAmount * 0.6);
  if (!Number.isInteger(amount) || amount < 25_000 || amount > maximumLoan) return failure(profile, 'invalid-input', `الحد الأقصى لهذا الضمان ${maximumLoan.toLocaleString('ar-EG')} ج.م محاكاة.`);
  const annualRate = termDays === 7 ? 0.18 : termDays === 14 ? 0.22 : 0.28;
  const totalRepayment = Math.round(amount * (1 + annualRate * termDays / 30));
  const loan: LoanRecord = { id: nextId(profile, 'loan', profile.banking.loans.length), collateralType, collateralId, principal: amount, totalRepayment, annualRate, startedOnDay: profile.day, termDays, nextPaymentDay: profile.day + 1, installmentAmount: Math.ceil(totalRepayment / termDays), remainingBalance: totalRepayment, status: 'active' };
  const nextProfile = addLedger(
    { ...profile, banking: { ...profile.banking, loans: [...profile.banking.loans, loan] } },
    [ledgerEntry(profile, 'liability', amount, `صرف قرض بضمان ${collateralType === 'land' ? 'أرض' : 'شركة'}`, 0)],
    profile.bankBalance + amount,
  );
  return success(nextProfile, `تم صرف قرض محاكاة بقيمة ${amount.toLocaleString('ar-EG')} ج.م؛ يبدأ القسط في اليوم التالي.`, loan);
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
  const loans = profile.banking.loans.map((loan) => {
    if (loan.status !== 'active' || loan.nextPaymentDay > nextDay) return loan;
    const due = Math.min(loan.remainingBalance, loan.installmentAmount);
    const paid = Math.min(balance, due);
    balance -= paid;
    const unpaid = due - paid;
    const interestShare = Math.min(due, Math.max(0, loan.totalRepayment - loan.principal) / loan.termDays);
    const principalShare = due - interestShare;
    if (interestShare > 0) entries.push(ledgerEntry(profile, 'expense', Math.round(interestShare), `فائدة قسط القرض ${loan.id}`, entries.length));
    if (principalShare > 0 && paid > 0) entries.push(ledgerEntry(profile, 'settlement', Math.min(paid, Math.round(principalShare)), `سداد أصل قسط القرض ${loan.id}`, entries.length));
    if (unpaid > 0) {
      payables += unpaid;
      entries.push(ledgerEntry(profile, 'liability', unpaid, `قسط قرض غير مسدد ${loan.id}`, entries.length));
    }
    const remainingBalance = Math.max(0, loan.remainingBalance - due);
    return { ...loan, remainingBalance, nextPaymentDay: nextDay + 1, status: remainingBalance === 0 ? 'paid' as const : 'active' as const };
  });
  const staff = profile.staff.map((employee) => {
    if (employee.status !== 'active' || employee.nextPayDay > nextDay) return employee;
    const paid = Math.min(balance, employee.dailySalary);
    balance -= paid;
    entries.push(ledgerEntry(profile, 'expense', employee.dailySalary, `راتب ${employee.role}: ${employee.name}`, entries.length));
    if (paid < employee.dailySalary) {
      const unpaid = employee.dailySalary - paid;
      payables += unpaid;
      entries.push(ledgerEntry(profile, 'liability', unpaid, `راتب غير مسدد: ${employee.name}`, entries.length));
    }
    return { ...employee, nextPayDay: nextDay + 1 };
  });
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
    const payout = Math.round(investment.principal * (hadLoss ? 1 - (definition?.riskRate ?? 0) : 1 + investment.expectedReturnRate));
    investmentPayout += payout;
    balance += payout;
    const difference = payout - investment.principal;
    if (difference > 0) entries.push(ledgerEntry(profile, 'revenue', difference, `تسوية استثمار رابح ${investment.id}`, entries.length));
    if (difference < 0) entries.push(ledgerEntry(profile, 'expense', Math.abs(difference), `خسارة محاكاة في الاستثمار ${investment.id}`, entries.length));
    return { ...investment, status: hadLoss ? 'loss' as const : 'paid' as const, settledAmount: payout };
  });

  let eventImpact = briefing.event.cashImpact;
  if (briefing.event.cashImpact > 0) {
    balance += briefing.event.cashImpact;
    entries.push(ledgerEntry(profile, 'revenue', briefing.event.cashImpact, briefing.event.title, entries.length));
  } else if (briefing.event.cashImpact < 0) {
    const eventCost = Math.abs(briefing.event.cashImpact);
    const paidEventCost = Math.min(balance, eventCost);
    balance -= paidEventCost;
    eventImpact = -paidEventCost;
    entries.push(ledgerEntry(profile, 'expense', eventCost, briefing.event.title, entries.length));
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
  const energyPaused = payables > 0;
  const companies = profile.companies.map((company) => {
    const industry = findIndustry(company.industryId);
    const capacity = company.energyCapacity ?? industry?.energyCapacity ?? 0;
    const supply = industry?.dailyEnergySupply ?? capacity;
    return { ...company, energyUnits: energyPaused ? 0 : Math.min(capacity, (company.energyUnits ?? 0) + supply) };
  });
  const event: GameEventRecord = { id: `event-${nextDay}`, day: nextDay, title: briefing.event.title, cashImpact: eventImpact, occurredAt: now };
  const nextProfile = addLedger(
    { ...profile, day: nextDay, companies, investments, banking: { ...profile.banking, loans }, staff, events: [...profile.events, event], payables },
    entries,
    balance,
  );
  const message = payables > 0
    ? `مرّ اليوم ${nextDay}، لكن بقيت التزامات غير مسددة بقيمة ${Math.round(payables).toLocaleString('ar-EG')} ج.م؛ أُوقفت الطاقة مؤقتًا حتى السداد.`
    : `مرّ اليوم ${nextDay} وعولجت المصروفات والأحداث والاستثمارات.`;
  return success(syncTasks(nextProfile), message, { day: nextDay, operatingCost, paidOperatingCost, payables, investmentPayout, event });
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
