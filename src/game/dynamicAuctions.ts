import type { PlayerAsset, PlayerProfile, PlayerLand, PlayerCompany } from '../domain/player';
import type { FinanceLedgerEntry, PlayerAuctionListing, PlayerAuctionBid } from '../domain/futureSystems';
import type { GameResult } from './engine';

export interface RivalInvestor {
  id: string;
  name: string;
  title: string;
  type: 'صندوق استثماري' | 'مجموعة قابضة' | 'مستثمر استراتيجي' | 'ملياردير' | 'بنك استثماري';
  avatarColor: string;
  biddingStyle: 'conservative' | 'balanced' | 'aggressive' | 'whale';
  maxBudgetMultiplier: number;
}

export const RIVAL_INVESTORS: readonly RivalInvestor[] = [
  { id: 'inv-1', name: 'مجموعة الحسام للاستثمار', title: 'تكتل مالي قابض', type: 'مجموعة قابضة', avatarColor: '#3b82f6', biddingStyle: 'aggressive', maxBudgetMultiplier: 1.45 },
  { id: 'inv-2', name: 'مؤسسة الشروق القابضة', title: 'مؤسسة تطوير صناعي', type: 'مجموعة قابضة', avatarColor: '#10b981', biddingStyle: 'balanced', maxBudgetMultiplier: 1.25 },
  { id: 'inv-3', name: 'المستثمر طارق الصايغ', title: 'رائد أعمال عقاري', type: 'مستثمر استراتيجي', avatarColor: '#f59e0b', biddingStyle: 'conservative', maxBudgetMultiplier: 1.15 },
  { id: 'inv-4', name: 'شركة الإنماء للتطوير', title: 'شركة استثمار عقاري', type: 'صندوق استثماري', avatarColor: '#6366f1', biddingStyle: 'balanced', maxBudgetMultiplier: 1.30 },
  { id: 'inv-5', name: 'صندوق الأفق للنمو', title: 'صندوق استثمار مباشر', type: 'صندوق استثماري', avatarColor: '#8b5cf6', biddingStyle: 'aggressive', maxBudgetMultiplier: 1.40 },
  { id: 'inv-6', name: 'الشيخ فهد الناصر', title: 'مستثمر ومصرفي دولي', type: 'ملياردير', avatarColor: '#ec4899', biddingStyle: 'whale', maxBudgetMultiplier: 1.85 },
  { id: 'inv-7', name: 'مجموعة القحطاني القابضة', title: 'مجموعة صناعية وتجارية', type: 'مجموعة قابضة', avatarColor: '#14b8a6', biddingStyle: 'aggressive', maxBudgetMultiplier: 1.50 },
  { id: 'inv-8', name: 'شركة الواحة كابيتال', title: 'إدارة أصول وصناديق', type: 'صندوق استثماري', avatarColor: '#06b6d4', biddingStyle: 'balanced', maxBudgetMultiplier: 1.28 },
  { id: 'inv-9', name: 'مؤسسة اليمامة العقارية', title: 'تطوير أراضٍ ومرافق', type: 'مستثمر استراتيجي', avatarColor: '#84cc16', biddingStyle: 'conservative', maxBudgetMultiplier: 1.18 },
  { id: 'inv-10', name: 'صندوق المشرق السيادي', title: 'محفظة أصول سيادية', type: 'صندوق استثماري', avatarColor: '#eab308', biddingStyle: 'whale', maxBudgetMultiplier: 1.75 },
  { id: 'inv-11', name: 'شركة الروابي للتنمية', title: 'مشاريع زراعية وصناعية', type: 'مستثمر استراتيجي', avatarColor: '#22c55e', biddingStyle: 'balanced', maxBudgetMultiplier: 1.22 },
  { id: 'inv-12', name: 'المستثمر خالد التميمي', title: 'شريك استثماري إقليمي', type: 'مستثمر استراتيجي', avatarColor: '#f97316', biddingStyle: 'aggressive', maxBudgetMultiplier: 1.38 },
  { id: 'inv-13', name: 'مجموعة الفرسان الاستثمارية', title: 'تكتل مالي واستثماري', type: 'مجموعة قابضة', avatarColor: '#a855f7', biddingStyle: 'balanced', maxBudgetMultiplier: 1.32 },
  { id: 'inv-14', name: 'شركة الأندلس للأصول', title: 'تصفية وشراء أصول كبرى', type: 'صندوق استثماري', avatarColor: '#0ea5e9', biddingStyle: 'aggressive', maxBudgetMultiplier: 1.42 },
  { id: 'inv-15', name: 'المصرفي عبد الرحمن الهلالي', title: 'مستشار مالي ومستثمر', type: 'مستثمر استراتيجي', avatarColor: '#d97706', biddingStyle: 'conservative', maxBudgetMultiplier: 1.16 },
  { id: 'inv-16', name: 'مجموعة تبارك القابضة', title: 'مشاريع وبنية تحتية', type: 'مجموعة قابضة', avatarColor: '#2563eb', biddingStyle: 'balanced', maxBudgetMultiplier: 1.27 },
  { id: 'inv-17', name: 'شركة الشرق الأوسط للاستحواذ', title: 'صفقات واستحواذ شركات', type: 'صندوق استثماري', avatarColor: '#4f46e5', biddingStyle: 'aggressive', maxBudgetMultiplier: 1.55 },
  { id: 'inv-18', name: 'صندوق فينيكس للاستثمار المباشر', title: 'صندوق أسهم خاصة', type: 'صندوق استثماري', avatarColor: '#7c3aed', biddingStyle: 'whale', maxBudgetMultiplier: 1.80 },
  { id: 'inv-19', name: 'سيدة الأعمال نجلاء المهيدب', title: 'مستثمرة في الطاقة والتقنية', type: 'ملياردير', avatarColor: '#db2777', biddingStyle: 'whale', maxBudgetMultiplier: 1.70 },
  { id: 'inv-20', name: 'شركة النخيل العقارية', title: 'تطوير مناطق ومدن', type: 'مستثمر استراتيجي', avatarColor: '#059669', biddingStyle: 'balanced', maxBudgetMultiplier: 1.24 },
  { id: 'inv-21', name: 'مؤسسة السلام المالية', title: 'حلول تمويل واستثمار', type: 'بنك استثماري', avatarColor: '#0284c7', biddingStyle: 'conservative', maxBudgetMultiplier: 1.14 },
  { id: 'inv-22', name: 'المستثمر عمر الجابري', title: 'تاجر ومطور لوجستي', type: 'مستثمر استراتيجي', avatarColor: '#d946ef', biddingStyle: 'balanced', maxBudgetMultiplier: 1.26 },
  { id: 'inv-23', name: 'مجموعة الزهور الصناعية', title: 'مصانع ومجمعات إنتاج', type: 'مجموعة قابضة', avatarColor: '#16a34a', biddingStyle: 'aggressive', maxBudgetMultiplier: 1.35 },
  { id: 'inv-24', name: 'شركة أطلس القابضة', title: 'استثمارات متنوعة دولية', type: 'مجموعة قابضة', avatarColor: '#475569', biddingStyle: 'balanced', maxBudgetMultiplier: 1.30 },
  { id: 'inv-25', name: 'صندوق دار التمويل', title: 'محافظ ائتمان وأصول متعثرة', type: 'صندوق استثماري', avatarColor: '#ca8a04', biddingStyle: 'conservative', maxBudgetMultiplier: 1.17 },
  { id: 'inv-26', name: 'المستثمر بدر العتيبي', title: 'مضارب ومستثمر عقاري', type: 'مستثمر استراتيجي', avatarColor: '#ea580c', biddingStyle: 'aggressive', maxBudgetMultiplier: 1.48 },
  { id: 'inv-27', name: 'مجموعة الصفوة المالية', title: 'إدارة ثروات عائلية', type: 'مجموعة قابضة', avatarColor: '#9333ea', biddingStyle: 'balanced', maxBudgetMultiplier: 1.34 },
  { id: 'inv-28', name: 'شركة البيرق الاستثمارية', title: 'توسعات صناعية وموانئ', type: 'صندوق استثماري', avatarColor: '#0d9488', biddingStyle: 'aggressive', maxBudgetMultiplier: 1.46 },
  { id: 'inv-29', name: 'المهندس إبراهيم الدسوقي', title: 'مطور صناعي وخبير تعدين', type: 'مستثمر استراتيجي', avatarColor: '#65a30d', biddingStyle: 'conservative', maxBudgetMultiplier: 1.20 },
  { id: 'inv-30', name: 'مؤسسة المجد للأصول والتصفية', title: 'صفقات تصفية استثنائية', type: 'بنك استثماري', avatarColor: '#e11d48', biddingStyle: 'whale', maxBudgetMultiplier: 1.65 },
];

export const AUCTION_AUTHORITIES = [
  'تصفية قضائية معلنة',
  'بنك استثماري دائن',
  'بيع استثماري خاص',
  'نزاع ورثة وإعادة هيكلة أصول',
  'هيئة المجتمعات العمرانية والتطوير',
  'جهاز حماية المنافسة ومنع الاحتكار',
] as const;

export interface LiveAuctionItem {
  id: string;
  title: string;
  authority: string;
  lotType: 'land' | 'factory' | 'raw-material';
  landType?: 'industrial' | 'agricultural' | 'commercial';
  areaSquareMeters?: number;
  materialId?: string;
  materialName?: string;
  quantity?: number;
  energyCapacityBonus?: number;
  location: string;
  startingBid: number;
  currentBid: number;
  bidIncrement: number;
  leadingInvestor: RivalInvestor;
  totalBidsCount: number;
  closesAtMs: number;
  isSpecialSurge?: boolean;
  description: string;
}

export function getRandomInvestor(excludeId?: string): RivalInvestor {
  const candidates = excludeId ? RIVAL_INVESTORS.filter((i) => i.id !== excludeId) : RIVAL_INVESTORS;
  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx] || RIVAL_INVESTORS[0];
}

export function generateLiveAuctions(profile: PlayerProfile): LiveAuctionItem[] {
  const day = profile.day;
  const seed = day * 1337 + 42;
  const now = Date.now();

  const baseItems: LiveAuctionItem[] = [
    {
      id: `auction-distressed-land-${day}`,
      title: 'أرض مجمع لوجستي مفرزة بالكامل (مزاد تصفية)',
      authority: AUCTION_AUTHORITIES[0],
      lotType: 'land',
      landType: 'industrial',
      areaSquareMeters: 4500,
      location: 'المنطقة الصناعية الكبرى · قطاع الشحن',
      startingBid: 85_000,
      currentBid: 98_000,
      bidIncrement: 3_000,
      leadingInvestor: RIVAL_INVESTORS[0],
      totalBidsCount: 4,
      closesAtMs: now + 480_000, // 8 mins
      description: 'أرض صناعية مجهزة برخصة فورية للبناء وموصولة بكافة خطوط الكهرباء والمياه الرئيسية.',
    },
    {
      id: `auction-factory-power-${day}`,
      title: 'محطة توربينات طاقة إضافية 120 ك.واط',
      authority: AUCTION_AUTHORITIES[1],
      lotType: 'factory',
      energyCapacityBonus: 120,
      location: 'مجمع الطاقة النظيفة · مصفاة العاصمة',
      startingBid: 140_000,
      currentBid: 165_000,
      bidIncrement: 5_000,
      leadingInvestor: RIVAL_INVESTORS[4],
      totalBidsCount: 6,
      closesAtMs: now + 720_000, // 12 mins
      description: 'وحدات توليد طاقة صناعية جاهزة للتركيب ترفع القدرة التشغيلية لأي مصنع فورا.',
    },
    {
      id: `auction-steel-batch-${day}`,
      title: 'شحنة فولاذ وحديد تسليح ثقيل (500 طن)',
      authority: AUCTION_AUTHORITIES[3],
      lotType: 'raw-material',
      materialId: 'steel',
      materialName: 'فولاذ صناعي',
      quantity: 500,
      location: 'أرصفة ميناء الاستيراد البحري',
      startingBid: 60_000,
      currentBid: 72_000,
      bidIncrement: 2_500,
      leadingInvestor: RIVAL_INVESTORS[2],
      totalBidsCount: 5,
      closesAtMs: now + 300_000, // 5 mins
      description: 'شحنة محجوزة جمركياً معروضة بأسعار أقل من السوق لدعم تشغيل المصانع المتقدمة.',
    },
    {
      id: `auction-agri-land-${day}`,
      title: 'مزرعة نخيل ومحاصيل نموذجية بمساحة 15,000 م²',
      authority: AUCTION_AUTHORITIES[4],
      lotType: 'land',
      landType: 'agricultural',
      areaSquareMeters: 15000,
      location: 'حزام الدلتا الخصب · القطاع الزراعي',
      startingBid: 120_000,
      currentBid: 145_000,
      bidIncrement: 4_000,
      leadingInvestor: RIVAL_INVESTORS[10],
      totalBidsCount: 7,
      closesAtMs: now + 900_000, // 15 mins
      description: 'أرض زراعية خصبة مزودة بآبار مياه ارتوازية جاهزة للزراعة وتوفير خامات الأغذية.',
    },
  ];

  // Dynamic rare surge auction if day > 2
  if (day >= 2) {
    baseItems.push({
      id: `auction-rare-surge-${day}`,
      title: 'مجمع أبراج تجارية معفى من الضرائب (فرصة سيادية)',
      authority: AUCTION_AUTHORITIES[5],
      lotType: 'land',
      landType: 'commercial',
      areaSquareMeters: 8000,
      location: 'مركز المال والأعمال الدولي',
      startingBid: 280_000,
      currentBid: 340_000,
      bidIncrement: 10_000,
      leadingInvestor: RIVAL_INVESTORS[5], // Sheikh Fahad
      totalBidsCount: 9,
      closesAtMs: now + 600_000, // 10 mins
      isSpecialSurge: true,
      description: 'موقع استراتيجي نادر بتصريح استثماري مباشر مع إعفاءات ضريبية سيادية لمدة 3 سنوات.',
    });
  }

  return baseItems;
}

/**
 * Calculates fair starting value for a player asset to put in auction
 */
export function calculatePlayerAssetValuation(
  assetType: 'land' | 'company' | 'asset',
  item: PlayerLand | PlayerCompany | PlayerAsset,
): { fairValue: number; recommendedStartingBid: number; name: string; specs: string } {
  if (assetType === 'land') {
    const land = item as PlayerLand;
    const baseValue = land.purchasePrice || 50_000;
    const upgradeBonus = (land.upgradeLevel ?? 1) * 0.15;
    const fairValue = Math.round(baseValue * (1 + upgradeBonus));
    const recommendedStartingBid = Math.round(fairValue * 0.95);
    return {
      fairValue,
      recommendedStartingBid,
      name: land.label,
      specs: `${(land.areaSquareMeters || 1000).toLocaleString()} م² · ${land.landType === 'industrial' ? 'صناعية' : land.landType === 'agricultural' ? 'زراعية' : 'تجارية'}`,
    };
  } else if (assetType === 'company') {
    const company = item as PlayerCompany;
    const baseValue = (company.operatingCostPerDay ?? 1000) * 120 + (company.energyCapacity ?? 100) * 500;
    const condition = (company.maintenanceCondition ?? 100) / 100;
    const fairValue = Math.max(30_000, Math.round(baseValue * condition));
    const recommendedStartingBid = Math.round(fairValue * 0.95);
    return {
      fairValue,
      recommendedStartingBid,
      name: company.name,
      specs: `كفاءة ${company.maintenanceCondition ?? 100}% · طاقة ${company.energyCapacity ?? 100} وحدة`,
    };
  } else {
    const asset = item as PlayerAsset;
    const fairValue = asset.value || 10_000;
    const recommendedStartingBid = Math.round(fairValue * 0.95);
    return {
      fairValue,
      recommendedStartingBid,
      name: asset.label,
      specs: `أصل تجاري مسجل بقيمة ${fairValue.toLocaleString()} $`,
    };
  }
}

export interface PlayerAuctionSimulation {
  outcomeType: 'normal' | 'medium' | 'surge';
  outcomeLabel: string;
  surgeMultiplier: number;
  finalPrice: number;
  winningInvestor: RivalInvestor;
  bidsList: {
    investor: RivalInvestor;
    amount: number;
    timestamp: number;
    note: string;
  }[];
}

/**
 * Pre-computes realistic auction competition according to the confirmed distribution:
 * - 65% Normal (+5% to +15%)
 * - 25% Medium (+18% to +35%)
 * - 10% Rare Surge (+50% to +85%)
 */
export function simulatePlayerAssetAuction(fairValue: number, startingBid: number): PlayerAuctionSimulation {
  const roll = Math.random() * 100;
  let outcomeType: 'normal' | 'medium' | 'surge' = 'normal';
  let profitPercent = 0.08;
  let outcomeLabel = 'ربح مزايدة طبيعي (+10%)';

  if (roll < 10) {
    outcomeType = 'surge';
    profitPercent = 0.50 + Math.random() * 0.35; // 50% to 85%
    outcomeLabel = '🔥 طفرة مزاد استثنائية! تنافس مليارديرات وتدافع استثماري';
  } else if (roll < 35) {
    outcomeType = 'medium';
    profitPercent = 0.18 + Math.random() * 0.17; // 18% to 35%
    outcomeLabel = '⚡ مزاد تنافسي قوي بين مجموعتين استثماريتين';
  } else {
    outcomeType = 'normal';
    profitPercent = 0.05 + Math.random() * 0.10; // 5% to 15%
    outcomeLabel = '✅ مزاد اعتيادي ومزايدات متزنة';
  }

  const finalPrice = Math.round(Math.max(startingBid * 1.05, fairValue * (1 + profitPercent)));
  const winningInvestor = outcomeType === 'surge'
    ? (RIVAL_INVESTORS.find((i) => i.biddingStyle === 'whale') || RIVAL_INVESTORS[5])
    : getRandomInvestor();

  // Generate 4-7 progressive bids leading to the final price
  const bidsCount = outcomeType === 'surge' ? 7 : outcomeType === 'medium' ? 5 : 4;
  const bidsList: PlayerAuctionSimulation['bidsList'] = [];
  let currentAmount = startingBid;
  const priceStep = Math.max(1000, Math.round((finalPrice - startingBid) / bidsCount));

  const competingInvestors: RivalInvestor[] = [];
  while (competingInvestors.length < Math.min(3, bidsCount)) {
    const inv = getRandomInvestor();
    if (!competingInvestors.some((x) => x.id === inv.id)) {
      competingInvestors.push(inv);
    }
  }

  const now = Date.now();
  for (let i = 0; i < bidsCount; i++) {
    const isFinal = i === bidsCount - 1;
    const investor = isFinal ? winningInvestor : competingInvestors[i % competingInvestors.length];
    currentAmount = isFinal ? finalPrice : Math.round(currentAmount + priceStep * (0.8 + Math.random() * 0.4));
    bidsList.push({
      investor,
      amount: currentAmount,
      timestamp: now + (i + 1) * 2000,
      note: isFinal
        ? (outcomeType === 'surge' ? 'عرض نهائي حاسم بسعر قياسي!' : 'أعلى عرض مسجل بالجلسة')
        : 'رفع سعر المزايدة',
    });
  }

  return {
    outcomeType,
    outcomeLabel,
    surgeMultiplier: profitPercent,
    finalPrice,
    winningInvestor,
    bidsList,
  };
}

/**
 * Creates an independent player auction listing for an owned asset
 */
export function listPlayerAssetForAuction(
  profile: PlayerProfile,
  assetType: 'land' | 'company' | 'asset',
  assetId: string,
  startingBid: number,
): GameResult<PlayerAuctionListing> {
  const isLand = assetType === 'land';
  const isCompany = assetType === 'company';
  const item = isLand
    ? profile.lands.find((l) => l.id === assetId)
    : isCompany
    ? profile.companies.find((c) => c.id === assetId)
    : profile.assets.find((a) => a.id === assetId);

  if (!item) {
    return {
      ok: false,
      profile,
      reason: 'not-found',
      message: 'الأصل المطلوب غير موجود في محفظتك الاستثمارية.',
    };
  }

  if (profile.soldAssetIds?.includes(assetId)) {
    return {
      ok: false,
      profile,
      reason: 'already-owned',
      message: 'هذا الأصل تم بيعه مسبقاً ولا يمكن طرحه مرة أخرى.',
    };
  }

  // Check if land is tied to an active company
  if (isLand && profile.companies.some((c) => c.landId === assetId)) {
    return {
      ok: false,
      profile,
      reason: 'condition-not-met',
      message: 'لا يمكن طرح أرض مرتبطة بشركة قائمة في المزاد. انقل الشركة أو تصرّف بها أولاً.',
    };
  }

  // Check if company has active production orders
  if (!isLand && profile.productionOrders.some((o) => o.companyId === assetId && o.status === 'active')) {
    return {
      ok: false,
      profile,
      reason: 'condition-not-met',
      message: 'يرجى إكمال أوامر الإنتاج الجارية قبل طرح الشركة في المزاد.',
    };
  }

  // Check if asset is already in an active auction
  const existingActiveAuction = (profile.playerAuctions ?? []).find(
    (a) => a.assetId === assetId && a.status === 'active',
  );
  if (existingActiveAuction) {
    return {
      ok: false,
      profile,
      reason: 'already-owned',
      message: 'هذا الأصل معروض بالفعل في جلسة مزاد نشطة حالياً.',
    };
  }

  const valuation = calculatePlayerAssetValuation(assetType, item);
  const effectiveStartingBid = Math.max(1_000, startingBid > 0 ? startingBid : valuation.recommendedStartingBid);
  const sim = simulatePlayerAssetAuction(valuation.fairValue, effectiveStartingBid);

  const uniqueListingId = `pauc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const nowIso = new Date().toISOString();

  const bidsHistory: PlayerAuctionBid[] = sim.bidsList.map((bid) => ({
    investorId: bid.investor.id,
    investorName: bid.investor.name,
    investorType: bid.investor.type,
    avatarColor: bid.investor.avatarColor,
    amount: bid.amount,
    timestamp: bid.timestamp,
    note: bid.note,
  }));

  const newListing: PlayerAuctionListing = {
    id: uniqueListingId,
    assetType,
    assetId,
    assetName: valuation.name,
    assetSpecs: valuation.specs,
    originalValue: valuation.fairValue,
    startingBid: effectiveStartingBid,
    currentBid: sim.finalPrice,
    status: 'active',
    leadingBidderName: sim.winningInvestor.name,
    leadingBidderType: sim.winningInvestor.type,
    totalBidsCount: sim.bidsList.length,
    closesAtMs: Date.now() + 300_000, // 5 minutes
    listedAt: nowIso,
    listedOnDay: profile.day,
    bidsHistory,
  };

  const nextProfile: PlayerProfile = {
    ...profile,
    playerAuctions: [newListing, ...(profile.playerAuctions ?? [])],
  };

  return {
    ok: true,
    profile: nextProfile,
    message: `تم طرح [${valuation.name}] بنجاح في سوق المزادات العلنية بسعر افتتاحي ${effectiveStartingBid.toLocaleString()} $.`,
    data: newListing,
  };
}

/**
 * Settles a player auction, executing the sale and crediting funds EXACTLY ONCE.
 */
export function settlePlayerAssetAuction(
  profile: PlayerProfile,
  listingId: string,
  customWinningAmount?: number,
  customBuyerName?: string,
): GameResult<{ listing: PlayerAuctionListing; payout: number }> {
  const listing = (profile.playerAuctions ?? []).find((l) => l.id === listingId);

  if (!listing) {
    return {
      ok: false,
      profile,
      reason: 'not-found',
      message: 'عرض المزاد غير موجود أو تم إلغاؤه.',
    };
  }

  // Guard against re-settling already sold listings
  if (listing.status === 'sold') {
    return {
      ok: false,
      profile,
      reason: 'condition-not-met',
      message: 'تم إتمام بيع هذا الأصل وتحصيل قيمته مسبقاً ولا يمكن تكرار البيع.',
    };
  }

  if (listing.status !== 'active') {
    return {
      ok: false,
      profile,
      reason: 'condition-not-met',
      message: 'جلسة المزاد غير نشطة أو تم إلغاؤها.',
    };
  }

  // Transaction deduplication check
  if ((profile.processedAuctionSaleIds ?? []).includes(listingId)) {
    return {
      ok: false,
      profile,
      reason: 'already-owned',
      message: 'تم تسجيل تحصيل أرباح هذا المزاد مسبقاً.',
    };
  }

  // Asset deduplication check
  if ((profile.soldAssetIds ?? []).includes(listing.assetId)) {
    return {
      ok: false,
      profile,
      reason: 'already-owned',
      message: 'هذا الأصل مباع بالفعل ولا يمكن تحصيل ثمنه مرة أخرى.',
    };
  }

  // Verify asset ownership in lands, companies, or assets
  const isLand = listing.assetType === 'land';
  const isCompany = listing.assetType === 'company';
  const ownedItem = isLand
    ? profile.lands.find((l) => l.id === listing.assetId)
    : isCompany
    ? profile.companies.find((c) => c.id === listing.assetId)
    : profile.assets.find((a) => a.id === listing.assetId);

  if (!ownedItem) {
    return {
      ok: false,
      profile,
      reason: 'not-found',
      message: 'الأصل غير موجود في ملكيتك الحالية.',
    };
  }

  const payout = customWinningAmount && customWinningAmount > 0 ? customWinningAmount : listing.currentBid;
  const buyerName = customBuyerName || listing.leadingBidderName || 'المستثمر الفائز';
  const nowIso = new Date().toISOString();

  const updatedLands = isLand ? profile.lands.filter((l) => l.id !== listing.assetId) : profile.lands;
  const updatedCompanies = isCompany ? profile.companies.filter((c) => c.id !== listing.assetId) : profile.companies;
  const updatedAssets = (!isLand && !isCompany) ? profile.assets.filter((a) => a.id !== listing.assetId) : profile.assets;

  const ledgerEntry: FinanceLedgerEntry = {
    id: `auction-sale-${listing.id}`,
    category: 'revenue',
    amount: payout,
    countryId: profile.countryId,
    occurredAt: nowIso,
    note: `بيع [${listing.assetName}] بالمزاد العلني إلى [${buyerName}] بسعر ${payout.toLocaleString()} $`,
  };

  const updatedListing: PlayerAuctionListing = {
    ...listing,
    status: 'sold',
    soldAt: nowIso,
    soldOnDay: profile.day,
    winningBidderName: buyerName,
    finalSalePrice: payout,
    profitDifference: payout - listing.originalValue,
    profitPercent: listing.originalValue > 0 ? Math.round(((payout - listing.originalValue) / listing.originalValue) * 100) : 0,
  };

  const updatedPlayerAuctions = (profile.playerAuctions ?? []).map((l) =>
    l.id === listingId ? updatedListing : l,
  );

  const updatedSoldAssetIds = Array.from(new Set([...(profile.soldAssetIds ?? []), listing.assetId]));
  const updatedProcessedSaleIds = Array.from(new Set([...(profile.processedAuctionSaleIds ?? []), listing.id]));

  const nextProfile: PlayerProfile = {
    ...profile,
    bankBalance: profile.bankBalance + payout,
    assets: updatedAssets,
    lands: updatedLands,
    companies: updatedCompanies,
    playerAuctions: updatedPlayerAuctions,
    soldAssetIds: updatedSoldAssetIds,
    processedAuctionSaleIds: updatedProcessedSaleIds,
    finances: {
      ...profile.finances,
      totalRevenue: (profile.finances?.totalRevenue ?? 0) + payout,
      netProfit: (profile.finances?.netProfit ?? 0) + payout,
    },
    ledger: [ledgerEntry, ...(profile.ledger || [])],
  };

  return {
    ok: true,
    profile: nextProfile,
    message: `تهانينا! تم بيع [${listing.assetName}] إلى [${buyerName}] بسعر ${payout.toLocaleString()} $ واستلام المبلغ مرة واحدة فقط.`,
    data: { listing: updatedListing, payout },
  };
}

/**
 * Cancels an active player auction listing and restores asset
 */
export function cancelPlayerAssetAuction(
  profile: PlayerProfile,
  listingId: string,
): GameResult<{ listingId: string }> {
  const listing = (profile.playerAuctions ?? []).find((l) => l.id === listingId);

  if (!listing) {
    return {
      ok: false,
      profile,
      reason: 'not-found',
      message: 'عرض المزاد غير موجود.',
    };
  }

  if (listing.status !== 'active') {
    return {
      ok: false,
      profile,
      reason: 'condition-not-met',
      message: 'لا يمكن إلغاء مزاد منتهٍ أو ملغى مسبقاً.',
    };
  }

  const updatedPlayerAuctions = (profile.playerAuctions ?? []).map((l) =>
    l.id === listingId ? { ...l, status: 'cancelled' as const } : l,
  );

  return {
    ok: true,
    profile: {
      ...profile,
      playerAuctions: updatedPlayerAuctions,
    },
    message: `تم إلغاء عرض المزاد لـ [${listing.assetName}] واستعادة الأصل لمحفظتك.`,
    data: { listingId },
  };
}

/**
 * Backward compatibility helper that securely delegates to list & settle logic
 */
export function executeSellPlayerAsset(
  profile: PlayerProfile,
  assetType: 'land' | 'company' | 'asset',
  assetId: string,
  salePrice: number,
  buyerName: string,
): { ok: boolean; updatedProfile: PlayerProfile; ledgerEntry: FinanceLedgerEntry } {
  // Check if an active listing already exists for this asset
  let existingListing = (profile.playerAuctions ?? []).find(
    (l) => l.assetId === assetId && l.status === 'active',
  );

  let workingProfile = profile;
  if (!existingListing) {
    const listRes = listPlayerAssetForAuction(profile, assetType, assetId, Math.round(salePrice * 0.9));
    if (!listRes.ok) {
      return {
        ok: false,
        updatedProfile: profile,
        ledgerEntry: {
          id: `auction-noop-${Date.now()}`,
          category: 'revenue',
          amount: 0,
          countryId: profile.countryId,
          occurredAt: new Date().toISOString(),
          note: listRes.message,
        },
      };
    }
    workingProfile = listRes.profile;
    existingListing = listRes.data;
  }

  const settleRes = settlePlayerAssetAuction(workingProfile, existingListing.id, salePrice, buyerName);
  if (!settleRes.ok) {
    return {
      ok: false,
      updatedProfile: profile,
      ledgerEntry: {
        id: `auction-noop-${Date.now()}`,
        category: 'revenue',
        amount: 0,
        countryId: profile.countryId,
        occurredAt: new Date().toISOString(),
        note: settleRes.message,
      },
    };
  }

  const entry = settleRes.profile.ledger[0] || {
    id: `auction-sale-${existingListing.id}`,
    category: 'revenue' as const,
    amount: salePrice,
    countryId: profile.countryId,
    occurredAt: new Date().toISOString(),
    note: `بيع [${existingListing.assetName}] بالمزاد العلني`,
  };

  return { ok: true, updatedProfile: settleRes.profile, ledgerEntry: entry };
}
