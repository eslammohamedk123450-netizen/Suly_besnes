import type { PlayerProfile } from '../domain/player';

export type PolicyType = 
  | 'rate_hike' 
  | 'rate_cut' 
  | 'quantitative_easing' 
  | 'supply_shock' 
  | 'export_boom' 
  | 'stability';

export interface CentralBankShock {
  id: string;
  title: string;
  policyType: PolicyType;
  officialStatement: string;
  newsHeadline: string;
  interestRate: number; // e.g. 18.5%
  inflationRate: number; // e.g. 21.0%
  stockIndexChange: number; // e.g. +14.2% or -8.5%
  depositYieldMultiplier: number;
  loanCostMultiplier: number;
  stockMarketMultiplier: number;
  rawMaterialMultiplier: number;
  goldPriceMultiplier: number;
  badge: string;
  color: string;
}

export const CENTRAL_BANK_SHOCKS: readonly CentralBankShock[] = [
  {
    id: 'shock_rate_hike',
    title: 'قرار البنك المركزي: رفع الفائدة لكبح جماح التضخم',
    policyType: 'rate_hike',
    officialStatement: 'قررت لجنة السياسة النقدية رفع أسعار الفائدة الأساسية بمقدار 300 نقطة أساس لحماية مدخرات المواطنين وجذب السيولة النقدية للبنوك.',
    newsHeadline: '🔴 عاجل: المركزي يرفع الفائدة.. عوائد الودائع تقفز وأسواق الدين تشهد إقبالاً تاريخياً',
    interestRate: 21.5,
    inflationRate: 18.2,
    stockIndexChange: -6.8,
    depositYieldMultiplier: 1.6, // Higher returns on bank deposits
    loanCostMultiplier: 1.35, // More expensive loan debt
    stockMarketMultiplier: 0.88, // Stock pull-back
    rawMaterialMultiplier: 0.95,
    goldPriceMultiplier: 1.05,
    badge: '🏛️ رفع الفائدة القياسي',
    color: 'emerald',
  },
  {
    id: 'shock_rate_cut',
    title: 'قرار البنك المركزي: خفض الفائدة وتنشيط الاستثمار المباشر',
    policyType: 'rate_cut',
    officialStatement: 'في خطوة تحفيزية لدعم الصناعة وتسهيل الائتمان الاستثماري، تعلن لجنة السياسة النقدية خفض الفائدة لتشجيع تأسيس المصانع والشراء العقاري.',
    newsHeadline: '🟢 عاجل: البنك المركزي يخفض الفائدة.. موجة صعود حادة في البورصة وانتعاش أسعار الأراضي والمصانع',
    interestRate: 11.0,
    inflationRate: 9.4,
    stockIndexChange: 18.5,
    depositYieldMultiplier: 0.75,
    loanCostMultiplier: 0.7, // Cheap debt financing
    stockMarketMultiplier: 1.25, // Strong stock rally
    rawMaterialMultiplier: 1.1,
    goldPriceMultiplier: 0.95,
    badge: '📈 التحفيز النقدي والتيسير',
    color: 'amber',
  },
  {
    id: 'shock_qe_liquidity',
    title: 'طفرة السيولة والتيسير الكمي: انخفاض القوة الشرائية وارتفاع الذهب',
    policyType: 'quantitative_easing',
    officialStatement: 'ضخ حزم ائتمانية كبرى في السوق لتمويل المشاريع الاستراتيجية ومساندة سلاسل التوريد المحلية في مواجهة الضغوط الخارجية.',
    newsHeadline: '🟡 طفرة في أسعار الذهب والمعادن الثمينة مع زيادة المعروض النقدي والسلع الصناعية',
    interestRate: 14.0,
    inflationRate: 26.5,
    stockIndexChange: 12.0,
    depositYieldMultiplier: 1.0,
    loanCostMultiplier: 1.05,
    stockMarketMultiplier: 1.15,
    rawMaterialMultiplier: 1.35, // Raw material prices soar
    goldPriceMultiplier: 1.25, // Gold price leaps
    badge: '🪙 التيسير وطفرة الذهب',
    color: 'yellow',
  },
  {
    id: 'shock_supply_crisis',
    title: 'أزمة سلاسل الإمداد العالمية: قفزة تاريخية في أسعار الخامات',
    policyType: 'supply_shock',
    officialStatement: 'اضطرابات في خطوط الشحن البحري الدولية ترفع تكلفة الفولاذ والرقائق والوقود. ننصح المصانع بالاعتماد على المخزون الاحتياطي.',
    newsHeadline: '⚡ ندرة في المعروض العالمي من المواد الخام.. أرباح استثنائية لأصحاب المخازن والمستودعات',
    interestRate: 15.5,
    inflationRate: 22.0,
    stockIndexChange: 4.5,
    depositYieldMultiplier: 1.1,
    loanCostMultiplier: 1.15,
    stockMarketMultiplier: 1.05,
    rawMaterialMultiplier: 1.5, // 50% price surge on raw materials
    goldPriceMultiplier: 1.12,
    badge: '🚢 صدمة سلاسل الإمداد',
    color: 'cyan',
  },
  {
    id: 'shock_export_boom',
    title: 'اتفاقية التجارة الحرة وطفرة عقود التصدير الوطنية',
    policyType: 'export_boom',
    officialStatement: 'توقيع اتفاقيات إقليمية تفتح أسواق الخليج وأوروبا أمام المنتجات المصنعة محلياً بدون جمارك وبحوافز مالية للمصدرين.',
    newsHeadline: '🌍 تدفقات نقدية قياسية بالعملات الصعبة وأرباح مضاعفة لجميع عقود توريد السلع المصنعة',
    interestRate: 13.0,
    inflationRate: 12.0,
    stockIndexChange: 22.0,
    depositYieldMultiplier: 1.2,
    loanCostMultiplier: 0.85,
    stockMarketMultiplier: 1.3,
    rawMaterialMultiplier: 1.15,
    goldPriceMultiplier: 1.0,
    badge: '🏆 طفرة الصادرات الكبرى',
    color: 'purple',
  },
  {
    id: 'shock_stability',
    title: 'استقرار نقدي متوازن ومؤشرات نمو مستدامة',
    policyType: 'stability',
    officialStatement: 'توازن عام في حركة العرض والطلب مع ثبات أسعار الصرف واستقرار معدلات الفائدة والنمو الصناعي المطرد.',
    newsHeadline: '⚖️ البنك المركزي يؤكد استقرار السياسة النقدية واستمرار نمو قطاعات التصنيع والتجارة',
    interestRate: 14.5,
    inflationRate: 11.5,
    stockIndexChange: 2.5,
    depositYieldMultiplier: 1.0,
    loanCostMultiplier: 1.0,
    stockMarketMultiplier: 1.0,
    rawMaterialMultiplier: 1.0,
    goldPriceMultiplier: 1.0,
    badge: '⚖️ الاستقرار والنمو المستدام',
    color: 'blue',
  },
];

/**
 * Returns the current active Central Bank shock based on the player day.
 */
export function getCurrentCentralBankShock(day: number): CentralBankShock {
  const index = Math.max(0, Math.floor(day / 3)) % CENTRAL_BANK_SHOCKS.length;
  return CENTRAL_BANK_SHOCKS[index];
}

/**
 * Calculates effective dynamic deposit rate (standard is 12%).
 */
export function getEffectiveDepositRate(profile: PlayerProfile): number {
  const shock = getCurrentCentralBankShock(profile.day);
  const baseRate = 0.12;
  return Number((baseRate * shock.depositYieldMultiplier).toFixed(3));
}

/**
 * Calculates effective dynamic loan interest (standard is 10%).
 */
export function getEffectiveLoanRate(profile: PlayerProfile): number {
  const shock = getCurrentCentralBankShock(profile.day);
  const baseRate = 0.10;
  return Number((baseRate * shock.loanCostMultiplier).toFixed(3));
}
