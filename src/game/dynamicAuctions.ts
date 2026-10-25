import type { PlayerProfile, PlayerLand, PlayerCompany } from '../domain/player';
import type { FinanceLedgerEntry } from '../domain/futureSystems';

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
  assetType: 'land' | 'company',
  item: PlayerLand | PlayerCompany,
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
  } else {
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
 * Executes the sale of a player asset in the auction and updates profile
 */
export function executeSellPlayerAsset(
  profile: PlayerProfile,
  assetType: 'land' | 'company',
  assetId: string,
  salePrice: number,
  buyerName: string,
): { updatedProfile: PlayerProfile; ledgerEntry: FinanceLedgerEntry } {
  let assetName = 'أصل استثماري';
  let updatedLands = profile.lands;
  let updatedCompanies = profile.companies;

  if (assetType === 'land') {
    const target = profile.lands.find((l) => l.id === assetId);
    assetName = target?.label || 'أرض استثمارية';
    updatedLands = profile.lands.filter((l) => l.id !== assetId);
  } else {
    const target = profile.companies.find((c) => c.id === assetId);
    assetName = target?.name || 'منشأة صناعية';
    updatedCompanies = profile.companies.filter((c) => c.id !== assetId);
  }

  const nowIso = new Date().toISOString();
  const entry: FinanceLedgerEntry = {
    id: `auction-sale-${Date.now()}`,
    category: 'revenue',
    amount: salePrice,
    countryId: profile.countryId,
    occurredAt: nowIso,
    note: `بيع [${assetName}] بالمزاد العلني إلى [${buyerName}] بسعر ${salePrice.toLocaleString()} $`,
  };

  const updatedProfile: PlayerProfile = {
    ...profile,
    bankBalance: profile.bankBalance + salePrice,
    lands: updatedLands,
    companies: updatedCompanies,
    finances: {
      ...profile.finances,
      totalRevenue: (profile.finances?.totalRevenue ?? 0) + salePrice,
      netProfit: (profile.finances?.netProfit ?? 0) + salePrice,
    },
    ledger: [entry, ...(profile.ledger || [])],
  };

  return { updatedProfile, ledgerEntry: entry };
}
