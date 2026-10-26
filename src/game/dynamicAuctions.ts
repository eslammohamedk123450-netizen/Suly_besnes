import type { PlayerProfile, PlayerLand, PlayerCompany, PlayerAsset } from '../domain/player';
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

export interface AssetValuationResult {
  purchaseCost: number;
  fairValue: number;
  instantSellPrice: number;
  recommendedStartingBid: number;
  minStartingBid: number;
  maxStartingBid: number;
  maxAllowedBid: number;
  name: string;
  specs: string;
}

/**
 * Calculates authoritative economic valuation for an asset based on actual property attributes,
 * condition, upgrades, and market baseline.
 */
export function calculatePlayerAssetValuation(
  assetType: 'land' | 'company' | 'asset',
  item: PlayerLand | PlayerCompany | PlayerAsset,
): AssetValuationResult {
  if (assetType === 'land') {
    const land = item as PlayerLand;
    const purchaseCost = Math.max(10_000, land.purchasePrice || 50_000);
    const area = land.areaSquareMeters || 1000;
    const perSqm = land.landType === 'commercial' ? 50 : land.landType === 'industrial' ? 30 : 15;
    const areaMarketBase = area * perSqm;
    const levelMultiplier = 1 + ((land.upgradeLevel ?? 1) - 1) * 0.15;
    const baseline = Math.max(purchaseCost, areaMarketBase);
    const fairValue = Math.round(baseline * levelMultiplier);
    const instantSellPrice = Math.round(fairValue * 0.88);
    const recommendedStartingBid = Math.round(fairValue * 0.90);
    const minStartingBid = Math.round(fairValue * 0.60);
    const maxStartingBid = Math.round(fairValue * 1.20);
    const maxAllowedBid = Math.round(fairValue * 1.65);

    return {
      purchaseCost,
      fairValue,
      instantSellPrice,
      recommendedStartingBid,
      minStartingBid,
      maxStartingBid,
      maxAllowedBid,
      name: land.label,
      specs: `${area.toLocaleString()} م² · ${land.landType === 'industrial' ? 'صناعية' : land.landType === 'agricultural' ? 'زراعية' : 'تجارية'}`,
    };
  } else if (assetType === 'company') {
    const company = item as PlayerCompany;
    const baseEquipValue = (company.energyCapacity ?? 100) * 500 + (company.operatingCostPerDay ?? 1000) * 100;
    const upgradeLevel = company.upgradeLevel ?? 1;
    const upgradeBonus = 1 + (upgradeLevel - 1) * 0.25;
    const purchaseCost = Math.round(baseEquipValue * upgradeBonus);
    const condition = Math.max(0.2, (company.maintenanceCondition ?? 100) / 100);
    const fairValue = Math.max(30_000, Math.round(purchaseCost * (0.5 + 0.5 * condition)));
    const instantSellPrice = Math.round(fairValue * 0.88);
    const recommendedStartingBid = Math.round(fairValue * 0.90);
    const minStartingBid = Math.round(fairValue * 0.60);
    const maxStartingBid = Math.round(fairValue * 1.20);
    const maxAllowedBid = Math.round(fairValue * 1.65);

    return {
      purchaseCost,
      fairValue,
      instantSellPrice,
      recommendedStartingBid,
      minStartingBid,
      maxStartingBid,
      maxAllowedBid,
      name: company.name,
      specs: `كفاءة ${company.maintenanceCondition ?? 100}% · طاقة ${company.energyCapacity ?? 100} وحدة`,
    };
  } else {
    const asset = item as PlayerAsset;
    const purchaseCost = Math.max(5_000, asset.value || 10_000);
    const fairValue = purchaseCost;
    const instantSellPrice = Math.round(fairValue * 0.88);
    const recommendedStartingBid = Math.round(fairValue * 0.90);
    const minStartingBid = Math.round(fairValue * 0.60);
    const maxStartingBid = Math.round(fairValue * 1.20);
    const maxAllowedBid = Math.round(fairValue * 1.65);

    return {
      purchaseCost,
      fairValue,
      instantSellPrice,
      recommendedStartingBid,
      minStartingBid,
      maxStartingBid,
      maxAllowedBid,
      name: asset.label,
      specs: `أصل تجاري مسجل بقيمة ${fairValue.toLocaleString()} $`,
    };
  }
}

export interface PlayerAuctionSimulation {
  outcomeType: 'no_bids' | 'single_bidder' | 'moderate' | 'competitive' | 'rare_surge';
  outcome?: 'no_bids' | 'single_bidder' | 'moderate' | 'competitive' | 'rare_surge';
  outcomeLabel: string;
  surgeMultiplier: number;
  finalPrice: number;
  finalBid: number;
  winningInvestor?: RivalInvestor;
  isSold: boolean;
  bidsList: {
    investor: RivalInvestor;
    amount: number;
    timestamp: number;
    note: string;
  }[];
}

/**
 * Simulates realistic market competition with diverse, non-guaranteed outcomes:
 * 1. No bids (10% - or 35% if overpriced) -> Unsold, returns to player
 * 2. Single bidder (20%) -> Closes at starting bid (can be below fair value if seller started low)
 * 3. Moderate competition (40%) -> Modest rise (+4% to +10%)
 * 4. Competitive round (20%) -> Good competition (+10% to +25%)
 * 5. Rare surge (10%) -> Sovereign / whale interest (+30% to +55%), strictly clamped to economic ceiling.
 */
export function simulatePlayerAssetAuction(
  valuationInput: AssetValuationResult | number,
  startingBid: number,
): PlayerAuctionSimulation {
  const valuation: AssetValuationResult = typeof valuationInput === 'number'
    ? {
        purchaseCost: valuationInput,
        fairValue: valuationInput,
        instantSellPrice: Math.round(valuationInput * 0.88),
        recommendedStartingBid: Math.round(valuationInput * 0.9),
        minStartingBid: Math.round(valuationInput * 0.6),
        maxStartingBid: Math.round(valuationInput * 1.2),
        maxAllowedBid: Math.round(valuationInput * 1.65),
        name: 'أصل تجاري',
        specs: '',
      }
    : valuationInput;

  const isOverpriced = startingBid > valuation.fairValue * 1.12;
  const roll = Math.random() * 100;

  let outcomeType: PlayerAuctionSimulation['outcomeType'] = 'moderate';
  let outcomeLabel = '✅ مزاد اعتيادي ومزايدات متزنة';
  let profitPercent = 0.08;
  let isSold = true;

  if (isOverpriced) {
    if (roll < 40) {
      outcomeType = 'no_bids';
      outcomeLabel = '❌ انتهت الجلسة دون أي عروض؛ اعتبر المشترون سعر البداية مبالغاً فيه.';
      isSold = false;
    } else if (roll < 75) {
      outcomeType = 'single_bidder';
      outcomeLabel = '👤 تقدم مزايد وحيد بسعر البداية دون وجود منافسة.';
      profitPercent = 0;
    } else {
      outcomeType = 'moderate';
      outcomeLabel = '⚖️ منافسة محدودة بسعر قريب من الافتتاح.';
      profitPercent = 0.03;
    }
  } else {
    if (roll < 30) {
      outcomeType = 'single_bidder';
      outcomeLabel = '👤 مزايد وحيد قَبِل سعر البداية دون منافسين.';
      profitPercent = 0;
    } else if (roll < 70) {
      outcomeType = 'moderate';
      outcomeLabel = '✅ منافسة متزنة بين مجموعتين استثماريتين (+5% إلى +12%).';
      profitPercent = 0.05 + Math.random() * 0.07;
    } else if (roll < 90) {
      outcomeType = 'competitive';
      outcomeLabel = '⚡ مزاد تنافسي قوي بين كبار المستثمرين (+15% إلى +25%).';
      profitPercent = 0.15 + Math.random() * 0.10;
    } else {
      outcomeType = 'rare_surge';
      outcomeLabel = '🔥 طفرة مزاد نادرة وتنافس مستثمر سيادي (+30% إلى +55%).';
      profitPercent = 0.30 + Math.random() * 0.25;
    }
  }

  if (!isSold) {
    return {
      outcomeType: 'no_bids',
      outcome: 'no_bids',
      outcomeLabel,
      surgeMultiplier: 0,
      finalPrice: 0,
      finalBid: 0,
      winningInvestor: undefined,
      isSold: false,
      bidsList: [],
    };
  }

  // Calculate raw final price based on outcome
  let rawFinalPrice = startingBid;
  if (outcomeType === 'single_bidder') {
    rawFinalPrice = startingBid;
  } else if (outcomeType === 'moderate') {
    rawFinalPrice = Math.round(startingBid * (1 + profitPercent));
  } else if (outcomeType === 'competitive') {
    rawFinalPrice = Math.round(Math.max(startingBid * 1.05, valuation.fairValue * (1 + profitPercent)));
  } else if (outcomeType === 'rare_surge') {
    rawFinalPrice = Math.round(Math.max(startingBid * 1.10, valuation.fairValue * (1 + profitPercent)));
  }

  // STRICT ECONOMIC CEILING: Cannot exceed maxAllowedBid under ANY circumstances
  const finalPrice = Math.max(startingBid, Math.min(valuation.maxAllowedBid, rawFinalPrice));

  const winningInvestor = outcomeType === 'rare_surge'
    ? (RIVAL_INVESTORS.find((i) => i.biddingStyle === 'whale') || RIVAL_INVESTORS[5])
    : getRandomInvestor();

  const bidsCount = outcomeType === 'single_bidder' ? 1
    : outcomeType === 'moderate' ? 3
    : outcomeType === 'competitive' ? 5
    : 6;

  const bidsList: PlayerAuctionSimulation['bidsList'] = [];
  const now = Date.now();

  if (bidsCount === 1) {
    bidsList.push({
      investor: winningInvestor,
      amount: finalPrice,
      timestamp: now + 2000,
      note: 'عرض افتتاح وحيد قبل إغلاق الجلسة',
    });
  } else {
    let currentAmount = startingBid;
    const priceStep = Math.max(500, Math.round((finalPrice - startingBid) / bidsCount));
    const competitors = [winningInvestor, getRandomInvestor(winningInvestor.id)];

    for (let i = 0; i < bidsCount; i++) {
      const isFinal = i === bidsCount - 1;
      const investor = isFinal ? winningInvestor : competitors[i % competitors.length];
      currentAmount = isFinal ? finalPrice : Math.min(finalPrice - 500, currentAmount + priceStep);
      // Ensure bid does not exceed investor budget ceiling
      const investorBudgetCap = Math.round(investor.maxBudgetMultiplier * valuation.fairValue);
      const safeAmount = Math.min(investorBudgetCap, Math.min(valuation.maxAllowedBid, currentAmount));

      bidsList.push({
        investor,
        amount: safeAmount,
        timestamp: now + (i + 1) * 1800,
        note: isFinal ? (outcomeType === 'rare_surge' ? 'عرض حاسم قياسي عند سقف المزاد!' : 'أعلى عرض فائز بالجلسة') : 'رفع المزايدة',
      });
    }
  }

  return {
    outcomeType,
    outcome: outcomeType,
    outcomeLabel,
    surgeMultiplier: profitPercent,
    finalPrice,
    finalBid: finalPrice,
    winningInvestor,
    isSold: true,
    bidsList,
  };
}

/**
 * Creates an independent player auction listing for an owned asset with strict economic limits.
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

  if (isLand && profile.companies.some((c) => c.landId === assetId)) {
    return {
      ok: false,
      profile,
      reason: 'condition-not-met',
      message: 'لا يمكن طرح أرض مرتبطة بشركة قائمة في المزاد. انقل الشركة أو تصرّف بها أولاً.',
    };
  }

  if (!isLand && profile.productionOrders.some((o) => o.companyId === assetId && o.status === 'active')) {
    return {
      ok: false,
      profile,
      reason: 'condition-not-met',
      message: 'يرجى إكمال أوامر الإنتاج الجارية قبل طرح الشركة في المزاد.',
    };
  }

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
  const effectiveStartingBid = startingBid > 0 ? startingBid : valuation.recommendedStartingBid;

  // Strict check: Starting bid cannot be below 60% or above 120% of fair value
  if (effectiveStartingBid < valuation.minStartingBid || effectiveStartingBid > valuation.maxStartingBid) {
    return {
      ok: false,
      profile,
      reason: 'invalid-input',
      message: `سعر افتتاح المزاد (${effectiveStartingBid.toLocaleString()} $) غير مقبول؛ يجب أن يكون بين ${valuation.minStartingBid.toLocaleString()} $ و ${valuation.maxStartingBid.toLocaleString()} $ بناءً على التقييم المرجعي للأصل (${valuation.fairValue.toLocaleString()} $).`,
    };
  }

  const sim = simulatePlayerAssetAuction(valuation, effectiveStartingBid);
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
    originalValue: valuation.purchaseCost,
    fairMarketValue: valuation.fairValue,
    instantSellPrice: valuation.instantSellPrice,
    maxAllowedBid: valuation.maxAllowedBid,
    startingBid: effectiveStartingBid,
    currentBid: sim.finalPrice,
    status: 'active',
    leadingBidderName: sim.winningInvestor?.name ?? (sim.isSold ? 'مستثمر مجهول' : 'لا يوجد مزايدين'),
    leadingBidderType: sim.winningInvestor?.type ?? 'سوق المزايدات',
    winningBidderName: sim.winningInvestor?.name,
    totalBidsCount: sim.bidsList.length,
    outcomeType: sim.outcomeType,
    outcomeReason: sim.outcomeLabel,
    closesAtMs: Date.now() + 300_000,
    listedAt: nowIso,
    listedOnDay: profile.day,
    bidsHistory,
  };

  const nextProfile: PlayerProfile = {
    ...profile,
    playerAuctions: [newListing, ...(profile.playerAuctions ?? [])],
  };

  const feedback = sim.isSold
    ? `تم طرح [${valuation.name}] بنجاح في سوق المزادات العلنية بسعر افتتاحي ${effectiveStartingBid.toLocaleString()} $ (التقييم: ${valuation.fairValue.toLocaleString()} $).`
    : `طُرح [${valuation.name}] في المزاد ولكن لم يتقدم أي مشترٍ في هذه الجولة. الأصل متاح في محفظتك.`;

  return {
    ok: true,
    profile: nextProfile,
    message: feedback,
    data: newListing,
  };
}

/**
 * Settles a player auction with server-grade economic ceiling verification,
 * preventing arbitrary price inflation exploits and guaranteeing deduplication.
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

  if (listing.status === 'sold') {
    return {
      ok: false,
      profile,
      reason: 'condition-not-met',
      message: 'تم إتمام بيع هذا الأصل وتحصيل قيمته مسبقاً ولا يمكن تكرار البيع.',
    };
  }

  if (listing.status === 'unsold') {
    return {
      ok: false,
      profile,
      reason: 'condition-not-met',
      message: 'انتهت جلسة المزاد دون مشترين مؤهلين؛ لا يمكن تنفيذ البيع.',
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

  // AUTHORITATIVE ECONOMIC VALIDATION: Compute valuation directly from player state
  const valuation = calculatePlayerAssetValuation(listing.assetType, ownedItem);
  const maxAllowedCeiling = valuation.maxAllowedBid;

  const requestedAmount = customWinningAmount && customWinningAmount > 0
    ? customWinningAmount
    : listing.currentBid;

  // HARD DEFENSE AGAINST PRICE INFLATION EXPLOIT:
  // If requested amount exceeds economic ceiling (e.g. 100k land trying to settle for 95 million),
  // STRICTLY REJECT the transaction and do not credit balance!
  if (requestedAmount > maxAllowedCeiling) {
    return {
      ok: false,
      profile,
      reason: 'invalid-input',
      message: `تم رفض الصفقة: السعر المطلوب (${requestedAmount.toLocaleString()} $) يتجاوز السقف الاقتصادي الأعلى المسموح به للأصل (${maxAllowedCeiling.toLocaleString()} $ بناءً على تقييم ${valuation.fairValue.toLocaleString()} $). تم منع تضخم الأسعار.`,
    };
  }

  if (requestedAmount <= 0) {
    return {
      ok: false,
      profile,
      reason: 'invalid-input',
      message: 'سعر بيع المزاد يجب أن يكون قيمة موجبة معتمدة.',
    };
  }

  const payout = requestedAmount;
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
    note: `بيع [${listing.assetName}] بالمزاد العلني إلى [${buyerName}] بسعر ${payout.toLocaleString()} $ (التقييم: ${valuation.fairValue.toLocaleString()} $)`,
  };

  const updatedListing: PlayerAuctionListing = {
    ...listing,
    status: 'sold',
    soldAt: nowIso,
    soldOnDay: profile.day,
    winningBidderName: buyerName,
    finalSalePrice: payout,
    profitDifference: payout - valuation.purchaseCost,
    profitPercent: valuation.purchaseCost > 0 ? Math.round(((payout - valuation.purchaseCost) / valuation.purchaseCost) * 100) : 0,
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
 * Immediate direct sale of a player asset at instant sell price (~88% of fair value)
 * for instant liquidity without waiting for auction.
 */
export function instantSellPlayerAsset(
  profile: PlayerProfile,
  assetType: 'land' | 'company' | 'asset',
  assetId: string,
): GameResult<{ payout: number; assetName: string }> {
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
      message: 'تم بيع هذا الأصل مسبقاً ولا يمكن بيعه مجدداً.',
    };
  }

  if (isLand && profile.companies.some((c) => c.landId === assetId)) {
    return {
      ok: false,
      profile,
      reason: 'condition-not-met',
      message: 'لا يمكن بيع أرض مرتبطة بشركة قائمة. انقل الشركة أو تصرّف بها أولاً.',
    };
  }

  const valuation = calculatePlayerAssetValuation(assetType, item);
  const payout = valuation.instantSellPrice;
  const nowIso = new Date().toISOString();

  const updatedLands = isLand ? profile.lands.filter((l) => l.id !== assetId) : profile.lands;
  const updatedCompanies = isCompany ? profile.companies.filter((c) => c.id !== assetId) : profile.companies;
  const updatedAssets = (!isLand && !isCompany) ? profile.assets.filter((a) => a.id !== assetId) : profile.assets;

  const ledgerEntry: FinanceLedgerEntry = {
    id: `instant-sale-${assetId}-${Date.now()}`,
    category: 'revenue',
    amount: payout,
    countryId: profile.countryId,
    occurredAt: nowIso,
    note: `بيع فوري مباشر لـ [${valuation.name}] بسعر تسييل ${payout.toLocaleString()} $ (القيمة المرجعية: ${valuation.fairValue.toLocaleString()} $)`,
  };

  const updatedSoldAssetIds = Array.from(new Set([...(profile.soldAssetIds ?? []), assetId]));

  const nextProfile: PlayerProfile = {
    ...profile,
    bankBalance: profile.bankBalance + payout,
    assets: updatedAssets,
    lands: updatedLands,
    companies: updatedCompanies,
    soldAssetIds: updatedSoldAssetIds,
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
    message: `تم البيع الفوري لـ [${valuation.name}] بمبلغ ${payout.toLocaleString()} $ نقدًا.`,
    data: { payout, assetName: valuation.name },
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

  if (listing.status !== 'active' && listing.status !== 'unsold') {
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
  salePrice?: number,
  buyerName?: string,
): { ok: boolean; updatedProfile: PlayerProfile; ledgerEntry: FinanceLedgerEntry } {
  const item = assetType === 'land'
    ? profile.lands.find((l) => l.id === assetId)
    : assetType === 'company'
    ? profile.companies.find((c) => c.id === assetId)
    : profile.assets.find((a) => a.id === assetId);

  if (!item) {
    return {
      ok: false,
      updatedProfile: profile,
      ledgerEntry: {
        id: `auction-noop-${Date.now()}`,
        category: 'revenue',
        amount: 0,
        countryId: profile.countryId,
        occurredAt: new Date().toISOString(),
        note: 'الأصل غير موجود في المحفظة.',
      },
    };
  }

  // Use instantSell for direct execution without auction delay
  const instantRes = instantSellPlayerAsset(profile, assetType, assetId);
  if (!instantRes.ok) {
    return {
      ok: false,
      updatedProfile: profile,
      ledgerEntry: {
        id: `auction-noop-${Date.now()}`,
        category: 'revenue',
        amount: 0,
        countryId: profile.countryId,
        occurredAt: new Date().toISOString(),
        note: instantRes.message,
      },
    };
  }

  const entry = instantRes.profile.ledger[0] || {
    id: `instant-sale-${assetId}`,
    category: 'revenue' as const,
    amount: instantRes.data?.payout ?? 0,
    countryId: profile.countryId,
    occurredAt: new Date().toISOString(),
    note: `بيع [${instantRes.data?.assetName}]`,
  };

  return { ok: true, updatedProfile: instantRes.profile, ledgerEntry: entry };
}
