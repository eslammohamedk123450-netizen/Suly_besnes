import type { CountryId, CurrencyCode, IndustryId } from './countries';
import type { RetailShopType } from './branchAndShop';
import type { StaffRole } from './futureSystems';

export type EmpireFacilityKind = 'company' | 'branch' | 'shop' | 'land';

export type FacilityOperationalState = 'active' | 'halted' | 'constructing';

export type CityExpansionFacilityKind = 'branch' | 'factory' | 'shop';

export interface CityDefinition {
  id: string;
  countryId: CountryId;
  name: string;
  regionLabel: string;
  isHomeHub?: boolean;
  supportedLandTypes: readonly ('industrial' | 'agricultural' | 'commercial')[];
  landBaseCost: number;
  defaultAreaSqm: number;
  setupMultiplier: number;
  operatingMultiplier: number;
  demandBonusRate: number;
  requiredLevel: number;
  maxFacilities: number;
}

export interface EmpireExpansionOperationRecord {
  operationId: string;
  kind: CityExpansionFacilityKind;
  cityId: string;
  cityName: string;
  countryId: CountryId;
  facilityId: string;
  facilityName: string;
  landId: string;
  amountPaidCash: number;
  diamondsSpent: number;
  paymentMethod: 'cash' | 'diamonds';
  day: number;
  occurredAt: string;
}

export interface InternationalExpansionIntent {
  intentId: string;
  targetCountryId: CountryId;
  targetCityId: string;
  activityKind: CityExpansionFacilityKind;
  industryId?: IndustryId;
  shopType?: RetailShopType;
  estimatedTotalUsd: number;
  estimatedTotalTargetLocal: number;
  targetCurrencyCode: CurrencyCode;
  registeredOnDay: number;
  registeredAt: string;
  gatewayStatus: 'incomplete_multi_currency_runtime';
}

export interface EmpireExpansionState {
  /** Maps facilityId or landId -> cityId */
  facilityCities: Record<string, string>;
  /** Maps staffId -> facilityId (companyId, branchId, or shopId) for unified assignment without duplicating payroll */
  facilityStaffAssignments: Record<string, string>;
  /** Idempotency registry of executed expansion operation IDs (prevents duplicate charges on repeated clicks) */
  processedOperationIds: string[];
  /** Immutable audit trail of city expansion operations */
  operationsLog: EmpireExpansionOperationRecord[];
  /** Non-financial dossier log for future cross-border expansion gateway */
  internationalIntentLog: InternationalExpansionIntent[];
}

export interface UnifiedEmpireFacility {
  id: string;
  kind: EmpireFacilityKind;
  name: string;
  subtitle: string;
  countryId: CountryId;
  cityId: string;
  cityName: string;
  operationalState: FacilityOperationalState;
  stateLabel: string;
  haltReasons: string[];
  level: number;
  dailyOperatingCost: number;
  assignedStaffIds: string[];
  assignedStaffNames: string[];
  linkedLandId?: string;
  parentCompanyId?: string;
  industryId?: IndustryId;
  shopType?: RetailShopType;
  maintenanceCondition?: number;
  energyUnits?: number;
  energyCapacity?: number;
  shelfOccupancy?: { used: number; capacity: number };
  readyOnDay?: number;
}

export interface ExpansionRequirementCheck {
  id: string;
  label: string;
  met: boolean;
  detail: string;
}

export interface CityExpansionRequest {
  operationId: string;
  cityId: string;
  kind: CityExpansionFacilityKind;
  customName?: string;
  paymentMethod?: 'cash' | 'diamonds';
  parentCompanyId?: string;
  industryId?: IndustryId;
  shopType?: RetailShopType;
}

export interface CityExpansionPreview {
  city: CityDefinition;
  kind: CityExpansionFacilityKind;
  facilityLabel: string;
  landCost: number;
  setupCost: number;
  licenseFee: number;
  requiresNewLicense: boolean;
  totalCashCost: number;
  diamondCost: number;
  dailyOperatingCost: number;
  remainingBalanceAfterCash: number;
  requirements: ExpansionRequirementCheck[];
  allRequirementsMet: boolean;
  canAffordSelectedPayment: boolean;
}

export interface FacilityFinancialRow {
  facilityId: string;
  facilityName: string;
  kind: 'company' | 'branch' | 'shop';
  cityName: string;
  operationalState: FacilityOperationalState;
  revenue: number;
  expenses: number;
  netProfit: number;
  dailyOperatingCommitment: number;
  dailyStaffPayroll: number;
  activitySummary: string;
}

export interface EmpireAdminReport {
  facilities: FacilityFinancialRow[];
  facilitiesSubtotal: {
    revenue: number;
    expenses: number;
    netProfit: number;
  };
  unallocatedTreasury: {
    revenue: number;
    expenses: number;
    netProfit: number;
    description: string;
  };
  grandTotal: {
    revenue: number;
    expenses: number;
    netProfit: number;
    reconciledWithLedger: boolean;
  };
  dailyCommitments: {
    facilitiesOperating: number;
    staffPayroll: number;
    totalDailyBurn: number;
  };
}

export type EmpireAlertCategory = 'inventory' | 'production' | 'finance';
export type EmpireAlertSeverity = 'critical' | 'warning' | 'info';

export interface EmpireOperationalAlert {
  id: string;
  category: EmpireAlertCategory;
  severity: EmpireAlertSeverity;
  title: string;
  detail: string;
  facilityId?: string;
  facilityName?: string;
  recommendedActionLabel: string;
  targetSection:
    | 'inventory'
    | 'production'
    | 'companies'
    | 'obligations'
    | 'bank'
    | 'staff'
    | 'contracts'
    | 'empire';
}

export interface CountryExpansionGatewayContract {
  readonly gatewayId: 'suly-cross-border-expansion-v1';
  readonly isRuntimeExecutionEnabled: false;
  readonly status: 'incomplete_multi_currency_runtime';
  readonly statusLabelAr: string;
  readonly architecturalReasonAr: string;
  readonly missingEngineCapabilities: readonly {
    code: string;
    title: string;
    description: string;
  }[];
  readonly supportedPreparationFeatures: readonly string[];
}

export interface CountryExpansionAssessment {
  homeCountryId: CountryId;
  targetCountryId: CountryId;
  targetCity: CityDefinition;
  activityKind: CityExpansionFacilityKind;
  industryId?: IndustryId;
  shopType?: RetailShopType;
  taxRatePercent: number;
  customsRatePercent: number;
  operatingCostMultiplier: number;
  exchangeRateUsdToTarget: number;
  exchangeRateUsdToHome: number;
  costsInUsd: {
    landCost: number;
    setupFee: number;
    sovereignLicenseFee: number;
    customsReserve: number;
    totalInitialCapitalUsd: number;
    estimatedDailyOperatingUsd: number;
  };
  costsInTargetCurrency: {
    currencyCode: CurrencyCode;
    currencySymbol: string;
    currencyName: string;
    totalInitialCapitalLocal: number;
    estimatedDailyOperatingLocal: number;
  };
  costsInHomeCurrency: {
    currencyCode: CurrencyCode;
    currencySymbol: string;
    totalInitialCapitalHome: number;
  };
  readinessChecks: ExpansionRequirementCheck[];
  allReadinessChecksMet: boolean;
  gateway: CountryExpansionGatewayContract;
}

export interface StaffAssignmentTargetOption {
  targetId: string;
  targetName: string;
  kind: 'company' | 'branch' | 'shop' | 'hq';
  cityName: string;
  acceptedRoles: readonly StaffRole[];
}

export function getDefaultEmpireExpansionState(): EmpireExpansionState {
  return {
    facilityCities: {},
    facilityStaffAssignments: {},
    processedOperationIds: [],
    operationsLog: [],
    internationalIntentLog: [],
  };
}

function buildCountryCities(
  countryId: CountryId,
  specs: readonly [
    { id: string; name: string; region: string; landCost: number; mult: number; bonus: number; lvl: number },
    { id: string; name: string; region: string; landCost: number; mult: number; bonus: number; lvl: number },
    { id: string; name: string; region: string; landCost: number; mult: number; bonus: number; lvl: number },
    { id: string; name: string; region: string; landCost: number; mult: number; bonus: number; lvl: number },
    { id: string; name: string; region: string; landCost: number; mult: number; bonus: number; lvl: number },
  ],
): readonly CityDefinition[] {
  return specs.map((item, idx) => ({
    id: `${countryId}-${item.id}`,
    countryId,
    name: item.name,
    regionLabel: item.region,
    isHomeHub: idx === 0,
    supportedLandTypes: ['industrial', 'agricultural', 'commercial'] as const,
    landBaseCost: item.landCost,
    defaultAreaSqm: idx === 0 ? 1200 : 1000 + idx * 250,
    setupMultiplier: item.mult,
    operatingMultiplier: Number((0.95 + idx * 0.05).toFixed(2)),
    demandBonusRate: item.bonus,
    requiredLevel: item.lvl,
    maxFacilities: idx === 0 ? 10 : 6,
  }));
}

export const COUNTRY_CITIES_CATALOG: Record<CountryId, readonly CityDefinition[]> = {
  egypt: buildCountryCities('egypt', [
    { id: 'ramadan10', name: 'العاشر من رمضان والقاهرة', region: 'العاصمة والظهير الصناعي', landCost: 6500, mult: 1.0, bonus: 0.08, lvl: 1 },
    { id: 'alexandria', name: 'الإسكندرية وبرج العرب', region: 'ساحل البحر المتوسط والموانئ', landCost: 7800, mult: 1.08, bonus: 0.11, lvl: 1 },
    { id: 'suez', name: 'السويس والعين السخنة', region: 'محور قناة السويس الاقتصادي', landCost: 9200, mult: 1.15, bonus: 0.14, lvl: 2 },
    { id: 'mansoura', name: 'المنصورة ودمياط الجديدة', region: 'دلتا النيل والتجارة', landCost: 7000, mult: 1.04, bonus: 0.10, lvl: 2 },
    { id: 'aswan', name: 'أسوان وصعيد مصر', region: 'بوابة الجنوب والطاقة', landCost: 6200, mult: 0.96, bonus: 0.09, lvl: 3 },
  ]),
  saudi: buildCountryCities('saudi', [
    { id: 'riyadh', name: 'الرياض وسدير الصناعية', region: 'قلب المملكة المالي', landCost: 8200, mult: 1.0, bonus: 0.10, lvl: 1 },
    { id: 'jeddah', name: 'جدة ورابغ', region: 'بوابة البحر الأحمر التجارية', landCost: 9000, mult: 1.10, bonus: 0.12, lvl: 1 },
    { id: 'jubail', name: 'الجبيل والدمام', region: 'المنطقة الشرقية والبتروكيماويات', landCost: 10500, mult: 1.18, bonus: 0.15, lvl: 2 },
    { id: 'medina', name: 'المدينة المنورة وينبع', region: 'المحور الغربي الصناعي', landCost: 8400, mult: 1.06, bonus: 0.11, lvl: 2 },
    { id: 'neom', name: 'تبوك ونيوم اللوجستية', region: 'مدن المستقبل الشمالية', landCost: 12000, mult: 1.25, bonus: 0.18, lvl: 3 },
  ]),
  uae: buildCountryCities('uae', [
    { id: 'dubai', name: 'دبي وجبل علي JAFZA', region: 'المركز التجاري والملاحي', landCost: 9500, mult: 1.0, bonus: 0.12, lvl: 1 },
    { id: 'abudhabi', name: 'أبوظبي وكيزاد KIZAD', region: 'العاصمة والصناعات الثقيلة', landCost: 10800, mult: 1.12, bonus: 0.14, lvl: 1 },
    { id: 'sharjah', name: 'الشارقة والحمرية الحرة', region: 'الحزام الصناعي الأوسط', landCost: 7900, mult: 0.98, bonus: 0.10, lvl: 2 },
    { id: 'rak', name: 'رأس الخيمة الصناعية', region: 'مواد البناء والتصدير', landCost: 7400, mult: 0.95, bonus: 0.09, lvl: 2 },
    { id: 'fujairah', name: 'الفجيرة الساحلية', region: 'ميناء بحر العرب للطاقة', landCost: 8600, mult: 1.05, bonus: 0.12, lvl: 3 },
  ]),
  usa: buildCountryCities('usa', [
    { id: 'newyork', name: 'نيويورك ونيوجيرسي', region: 'الساحل الشرقي المالي', landCost: 11000, mult: 1.0, bonus: 0.12, lvl: 1 },
    { id: 'houston', name: 'هيوستن وتكساس', region: 'حزام الطاقة والصناعات', landCost: 9600, mult: 1.05, bonus: 0.13, lvl: 1 },
    { id: 'chicago', name: 'شيكاغو والغرب الأوسط', region: 'عقدة الشحن والغذاء', landCost: 8900, mult: 1.02, bonus: 0.11, lvl: 2 },
    { id: 'losangeles', name: 'لوس أنجلوس وكاليفورنيا', region: 'موانئ المحيط الهادئ والتقنية', landCost: 12500, mult: 1.20, bonus: 0.16, lvl: 2 },
    { id: 'seattle', name: 'سياتل والشمال الغربي', region: 'مركز الابتكار واللوجستيات', landCost: 10800, mult: 1.14, bonus: 0.14, lvl: 3 },
  ]),
  kuwait: buildCountryCities('kuwait', [
    { id: 'shuwaikh', name: 'الشويخ ومدينة الكويت', region: 'العاصمة والميناء التجاري', landCost: 8000, mult: 1.0, bonus: 0.10, lvl: 1 },
    { id: 'ahmadi', name: 'الأحمدي والشعيبة', region: 'المجمع النفطي والصناعي', landCost: 9200, mult: 1.10, bonus: 0.13, lvl: 1 },
    { id: 'subhan', name: 'صبحان الصناعية', region: 'الصناعات الغذائية والدوائية', landCost: 8500, mult: 1.05, bonus: 0.11, lvl: 2 },
    { id: 'jahra', name: 'الجهراء وأمغرة', region: 'المستودعات والتحويلات', landCost: 7300, mult: 0.97, bonus: 0.09, lvl: 2 },
    { id: 'abdali', name: 'العبدلي والوفرة', region: 'الأمن الغذائي والعبور الشمالي', landCost: 7600, mult: 1.02, bonus: 0.10, lvl: 3 },
  ]),
  qatar: buildCountryCities('qatar', [
    { id: 'doha', name: 'الدوحة والمنطقة الصناعية', region: 'العاصمة والتجارة المركزية', landCost: 8600, mult: 1.0, bonus: 0.11, lvl: 1 },
    { id: 'mesaieed', name: 'مسيعيد الصناعية', region: 'البتروكيماويات والمعادن', landCost: 9800, mult: 1.12, bonus: 0.14, lvl: 1 },
    { id: 'raslaffan', name: 'رأس لفان للطاقة', region: 'الغاز المسال والتصدير', landCost: 11200, mult: 1.20, bonus: 0.16, lvl: 2 },
    { id: 'wakrah', name: 'الوكرة وميناء حمد', region: 'البوابة اللوجستية البحرية', landCost: 8900, mult: 1.06, bonus: 0.12, lvl: 2 },
    { id: 'lusail', name: 'لوسيل التجارية', region: 'الأعمال والتجزئة الحديثة', landCost: 10400, mult: 1.15, bonus: 0.15, lvl: 3 },
  ]),
  uk: buildCountryCities('uk', [
    { id: 'manchester', name: 'مانشستر وترافورد بارك', region: 'القلب الصناعي الشمالي', landCost: 9200, mult: 1.0, bonus: 0.10, lvl: 1 },
    { id: 'london', name: 'لندن وتايمز غيتواي', region: 'العاصمة المالية والتجزئة', landCost: 12000, mult: 1.22, bonus: 0.16, lvl: 1 },
    { id: 'birmingham', name: 'برمنغهام وميدلاندز', region: 'محور التصنيع والهندسة', landCost: 8800, mult: 1.04, bonus: 0.11, lvl: 2 },
    { id: 'liverpool', name: 'ليفربول الملاحية', region: 'ميناء الأطلسي والشحن', landCost: 8500, mult: 1.02, bonus: 0.11, lvl: 2 },
    { id: 'edinburgh', name: 'إدنبرة وغلاسكو', region: 'اسكتلندا والطاقة المتجددة', landCost: 9400, mult: 1.08, bonus: 0.13, lvl: 3 },
  ]),
  germany: buildCountryCities('germany', [
    { id: 'ruhr', name: 'دوسلدورف وحزام الرور', region: 'المركز الصناعي الثقيل', landCost: 9600, mult: 1.0, bonus: 0.11, lvl: 1 },
    { id: 'hamburg', name: 'هامبورغ الملاحية', region: 'أكبر موانئ الشمال الأوروبي', landCost: 10400, mult: 1.10, bonus: 0.13, lvl: 1 },
    { id: 'munich', name: 'ميونخ وبافاريا', region: 'التقنية الدقيقة والإلكترونيات', landCost: 11500, mult: 1.18, bonus: 0.15, lvl: 2 },
    { id: 'frankfurt', name: 'فرانكفورت والراين', region: 'العقدة المصرفية واللوجستية', landCost: 10900, mult: 1.14, bonus: 0.14, lvl: 2 },
    { id: 'berlin', name: 'برلين وبراندنبورغ', region: 'العاصمة والتجزئة الكبرى', landCost: 9900, mult: 1.07, bonus: 0.12, lvl: 3 },
  ]),
  japan: buildCountryCities('japan', [
    { id: 'yokohama', name: 'يوكوهاما وخليج طوكيو', region: 'العاصمة الصناعية والملاحية', landCost: 10500, mult: 1.0, bonus: 0.12, lvl: 1 },
    { id: 'osaka', name: 'أوساكا وكانساي', region: 'التجارة والصناعات الاستهلاكية', landCost: 9800, mult: 1.06, bonus: 0.12, lvl: 1 },
    { id: 'nagoya', name: 'ناغويا وتوكاي', region: 'عاصمة الآلات والمعدات الدقيقة', landCost: 10200, mult: 1.10, bonus: 0.14, lvl: 2 },
    { id: 'fukuoka', name: 'فوكوكا وكيوشو', region: 'بوابة أشباه الموصلات الآسيوية', landCost: 9100, mult: 1.02, bonus: 0.11, lvl: 2 },
    { id: 'sapporo', name: 'سابورو وهوكايدو', region: 'الزراعة والصناعات الغذائية', landCost: 8400, mult: 0.96, bonus: 0.10, lvl: 3 },
  ]),
  jordan: buildCountryCities('jordan', [
    { id: 'sahab', name: 'عمّان ومدينة سحاب الصناعية', region: 'العاصمة والظهير الصناعي', landCost: 6400, mult: 1.0, bonus: 0.09, lvl: 1 },
    { id: 'aqaba', name: 'العقبة الاقتصادية الخاصة', region: 'المنفذ البحري والمنطقة الحرة', landCost: 7800, mult: 1.08, bonus: 0.13, lvl: 1 },
    { id: 'zarqa', name: 'الزرقاء والمنطقة الحرة', region: 'التكرير والتبادل التجاري', landCost: 6800, mult: 1.02, bonus: 0.10, lvl: 2 },
    { id: 'irbid', name: 'إربد ومدينة الحسن الصناعية', region: 'الشمال والتصدير الصناعي', landCost: 6600, mult: 1.00, bonus: 0.10, lvl: 2 },
    { id: 'mafraq', name: 'المفرق التنموية', region: 'عقدة الربط البري الإقليمي', landCost: 6000, mult: 0.95, bonus: 0.09, lvl: 3 },
  ]),
  palestine: buildCountryCities('palestine', [
    { id: 'bethlehem', name: 'بيت لحم الصناعية', region: 'المنطقة الصناعية النموذجية', landCost: 6000, mult: 1.0, bonus: 0.09, lvl: 1 },
    { id: 'ramallah', name: 'رام الله والبيرة', region: 'المركز الإداري والتجاري', landCost: 7200, mult: 1.08, bonus: 0.12, lvl: 1 },
    { id: 'hebron', name: 'الخليل الصناعية', region: 'معقل الصناعات الوطنية والحرف', landCost: 6800, mult: 1.04, bonus: 0.11, lvl: 2 },
    { id: 'nablus', name: 'نابلس والشمال', region: 'الصناعات الغذائية والمنظفات', landCost: 6500, mult: 1.02, bonus: 0.10, lvl: 2 },
    { id: 'jericho', name: 'أريحا الزراعية الصناعية', region: 'الأغوار والتصنيع الزراعي', landCost: 5900, mult: 0.96, bonus: 0.09, lvl: 3 },
  ]),
  china: buildCountryCities('china', [
    { id: 'shanghai', name: 'شنغهاي وبودونغ', region: 'العاصمة المالية والملاحية', landCost: 9800, mult: 1.0, bonus: 0.12, lvl: 1 },
    { id: 'shenzhen', name: 'شنتشن ودلتا اللؤلؤ', region: 'مصنع الإلكترونيات العالمي', landCost: 10600, mult: 1.12, bonus: 0.15, lvl: 1 },
    { id: 'guangzhou', name: 'غوانغجو التجارية', region: 'عقدة التصدير وسلاسل التوريد', landCost: 9000, mult: 1.04, bonus: 0.12, lvl: 2 },
    { id: 'chengdu', name: 'تشنغدو الغربية', region: 'المركز الصناعي الداخلي', landCost: 7800, mult: 0.96, bonus: 0.10, lvl: 2 },
    { id: 'tianjin', name: 'تيانجين وبكين', region: 'الميناء الشمالي والصناعات الثقيلة', landCost: 9400, mult: 1.08, bonus: 0.13, lvl: 3 },
  ]),
  spain: buildCountryCities('spain', [
    { id: 'barcelona', name: 'برشلونة وزونا فرانكا', region: 'ميناء المتوسط والصناعة', landCost: 8900, mult: 1.0, bonus: 0.11, lvl: 1 },
    { id: 'madrid', name: 'مدريد اللوجستية', region: 'العاصمة والتوزيع المركزي', landCost: 9600, mult: 1.08, bonus: 0.13, lvl: 1 },
    { id: 'valencia', name: 'فالنسيا الساحلية', region: 'الشحن البحري والغذاء', landCost: 8200, mult: 1.02, bonus: 0.11, lvl: 2 },
    { id: 'bilbao', name: 'بلباو وإقليم الباسك', region: 'الصلب والطاقة والهندسة', landCost: 8700, mult: 1.05, bonus: 0.12, lvl: 2 },
    { id: 'seville', name: 'إشبيلية والأندلس', region: 'الزراعة والطاقة الشمسية', landCost: 7600, mult: 0.97, bonus: 0.10, lvl: 3 },
  ]),
  russia: buildCountryCities('russia', [
    { id: 'moscow', name: 'موسكو الإقليم الصناعي', region: 'العاصمة والمركز المالي', landCost: 8500, mult: 1.0, bonus: 0.10, lvl: 1 },
    { id: 'stpetersburg', name: 'سانت بطرسبرغ البحرية', region: 'نافذة البلطيق الملاحية', landCost: 8800, mult: 1.05, bonus: 0.12, lvl: 1 },
    { id: 'kazan', name: 'قازان وتتارستان', region: 'البتروكيماويات والتصنيع', landCost: 7900, mult: 1.00, bonus: 0.11, lvl: 2 },
    { id: 'yekaterinburg', name: 'يكاترينبورغ والأورال', region: 'التعدين والمعادن الثقيلة', landCost: 8100, mult: 1.03, bonus: 0.11, lvl: 2 },
    { id: 'novosibirsk', name: 'نوفوسيبيرسك وسيبيريا', region: 'محور الطاقة والعبور الشرقي', landCost: 7400, mult: 0.96, bonus: 0.10, lvl: 3 },
  ]),
};

export function getCitiesForCountry(countryId: CountryId): readonly CityDefinition[] {
  return COUNTRY_CITIES_CATALOG[countryId] ?? COUNTRY_CITIES_CATALOG.egypt;
}

export function findCityById(cityId: string): CityDefinition | undefined {
  for (const cities of Object.values(COUNTRY_CITIES_CATALOG)) {
    const found = cities.find((c) => c.id === cityId);
    if (found) return found;
  }
  return undefined;
}
