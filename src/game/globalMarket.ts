import { findCountry, type CountryId } from '../domain/countries';
import type {
  CommodityGrade,
  GlobalPaymentTerm,
  GlobalShippingMode,
} from '../domain/futureSystems';
import type { PlayerProfile } from '../domain/player';
import {
  MATERIAL_CATALOG,
  PRODUCT_CATALOG,
  findMaterial,
  findRecipeForIndustry,
} from './catalog';
import { getCountryScenario } from './countryScenarios';
import { getMarketPriceProgression } from './economyBalance';

export type CommoditySectorId = 'all' | 'my-factories' | 'energy' | 'metals' | 'agri' | 'tech-chem';

export interface BulkDiscountTier {
  minQty: number;
  discountPct: number;
}

export interface GlobalMarketOffer {
  id: string;
  materialId: string;
  sellerName: string;
  supplierId: string;
  originCountry: string;
  originPort: string;
  originFlag: string;
  sector: Exclude<CommoditySectorId, 'all' | 'my-factories'>;
  grade: CommodityGrade;
  qualityScore: number;
  unitPrice: number;
  floorPrice: number;
  negotiable: boolean;
  confidence: 'high' | 'medium' | 'low';
  availableStock: number;
  minOrderQty: number;
  isLocalFreeZone: boolean;
  seaDiscountRate: number;
  seaTransitDays: 1 | 2;
  customsTariffRate: number;
  bulkTiers: readonly BulkDiscountTier[];
}

export interface CommodityBenchmark {
  materialId: string;
  name: string;
  unit: string;
  sector: Exclude<CommoditySectorId, 'all' | 'my-factories'>;
  spotPrice: number;
  previousPrice: number;
  changePercent: number;
  trend: 'up' | 'down' | 'steady';
  history: number[];
  supplyStatus: 'shortage' | 'balanced' | 'surplus';
  supplyLabel: string;
  countryAdvantagePct: number;
  hasEventShock: boolean;
}

export interface ImportQuoteBreakdown {
  quantity: number;
  shippingMode: GlobalShippingMode;
  paymentTerm: GlobalPaymentTerm;
  baseUnitPrice: number;
  bulkDiscountPct: number;
  trustDiscountPct: number;
  shippingModeUnitPrice: number;
  merchandiseSubtotal: number;
  freightCost: number;
  fleetDiscountSaved: number;
  customsDuty: number;
  insuranceCost: number;
  totalLandedCost: number;
  effectiveUnitCost: number;
  upfrontCashDue: number;
  deferredBalanceDue: number;
  transitDays: number;
  arrivesOnDay: number;
}

export interface GlobalExportBid {
  id: string;
  buyerId: string;
  buyerName: string;
  destinationPort: string;
  destinationFlag: string;
  productId: string;
  productName: string;
  unit: string;
  minQuantity: number;
  maxQuantity: number;
  unitPrice: number;
  localReferencePrice: number;
  premiumPct: number;
  exportClearanceRate: number;
  minimumQuality: number;
  reputationReward: number;
  incotermLabel: string;
}

export interface ForwardContractTemplate {
  id: string;
  materialId: string;
  materialName: string;
  unit: string;
  supplierId: string;
  supplierName: string;
  originHub: string;
  spotUnitPrice: number;
  lockedUnitPrice: number;
  savingsPct: number;
  dailyQuota: number;
  durationDays: number;
  totalContractUnits: number;
  marginDeposit: number;
  qualityScore: number;
}

export interface CounterOfferResult {
  accepted: boolean;
  unitPrice?: number;
  counterPrice?: number;
  acceptanceChancePct: number;
  message: string;
}

interface GlobalOriginMeta {
  sector: Exclude<CommoditySectorId, 'all' | 'my-factories'>;
  certSupplierId: string;
  certSupplierName: string;
  certCountry: string;
  certPort: string;
  certFlag: string;
  bulkSupplierId: string;
  bulkSupplierName: string;
  bulkCountry: string;
  bulkPort: string;
  bulkFlag: string;
  seaTransitDays: 1 | 2;
}

const COMMODITY_ORIGIN_META: Record<string, GlobalOriginMeta> = {
  'crude-oil': {
    sector: 'energy',
    certSupplierId: 'sup-arabian-tankers',
    certSupplierName: 'الشركة العربية لناقلات الخام المعتمد',
    certCountry: 'الخليج العربي',
    certPort: 'رأس تنورة / الفجيرة',
    certFlag: '🛢️',
    bulkSupplierId: 'sup-brent-spot',
    bulkSupplierName: 'تجمع تصفية ناقلات بحر الشمال',
    bulkCountry: 'المملكة المتحدة',
    bulkPort: 'ميناء أبردين النفطي',
    bulkFlag: '🇬🇧',
    seaTransitDays: 1,
  },
  'natural-gas': {
    sector: 'energy',
    certSupplierId: 'sup-lng-gulf',
    certSupplierName: 'مؤسسة الخليج للغاز المسال LNG',
    certCountry: 'قطر',
    certPort: 'ميناء راس لفان الصناعي',
    certFlag: '🇶🇦',
    bulkSupplierId: 'sup-sabine-lng',
    bulkSupplierName: 'محطة سابين باس لتصدير الغاز',
    bulkCountry: 'الولايات المتحدة',
    bulkPort: 'ميناء هيوستن · تكساس',
    bulkFlag: '🇺🇸',
    seaTransitDays: 2,
  },
  fuel: {
    sector: 'energy',
    certSupplierId: 'sup-rotterdam-refinery',
    certSupplierName: 'مجمع مصافي روتردام الدولية',
    certCountry: 'هولندا',
    certPort: 'ميناء روتردام الأوروبي',
    certFlag: '🇪🇺',
    bulkSupplierId: 'sup-jurong-bunkers',
    bulkSupplierName: 'توريدات جورونغ للوقود التجاري',
    bulkCountry: 'سنغافورة',
    bulkPort: 'مضيق سنغافورة الملاحي',
    bulkFlag: '🇸🇬',
    seaTransitDays: 1,
  },
  water: {
    sector: 'agri',
    certSupplierId: 'sup-desal-tech',
    certSupplierName: 'الشركة الإقليمية للتحلية والمعالجة النقية',
    certCountry: 'الإمارات',
    certPort: 'محطات جبل علي والفجيرة',
    certFlag: '🇦🇪',
    bulkSupplierId: 'sup-med-utility',
    bulkSupplierName: 'شبكة إمداد الحوض المتوسط الصناعية',
    bulkCountry: 'مصر',
    bulkPort: 'مجمع شرق بورسعيد',
    bulkFlag: '🇪🇬',
    seaTransitDays: 1,
  },
  chemicals: {
    sector: 'tech-chem',
    certSupplierId: 'sup-rhine-chem',
    certSupplierName: 'كونسورتيوم راينلاند للكيماويات الدقيقة',
    certCountry: 'ألمانيا',
    certPort: 'ميناء هامبورغ الصناعي',
    certFlag: '🇩🇪',
    bulkSupplierId: 'sup-jubail-petrochem',
    bulkSupplierName: 'اتحاد الجبيل للبتروكيماويات الأساسية',
    bulkCountry: 'السعودية',
    bulkPort: 'ميناء الملك فهد الصناعي',
    bulkFlag: '🇸🇦',
    seaTransitDays: 1,
  },
  grain: {
    sector: 'agri',
    certSupplierId: 'sup-midwest-grain',
    certSupplierName: 'تحالف صوامع الحبوب المعتمدة الدولية',
    certCountry: 'الولايات المتحدة',
    certPort: 'ميناء نيو أورلينز للحبوب',
    certFlag: '🇺🇸',
    bulkSupplierId: 'sup-blacksea-agro',
    bulkSupplierName: 'توريدات البحر الأسود للحاصلات السائبة',
    bulkCountry: 'حوض البحر الأسود',
    bulkPort: 'رصيف الصادرات الزراعية',
    bulkFlag: '🌾',
    seaTransitDays: 1,
  },
  steel: {
    sector: 'metals',
    certSupplierId: 'sup-ruhr-steel',
    certSupplierName: 'اتحاد الرور للصلب الهندسي المعتمد',
    certCountry: 'ألمانيا',
    certPort: 'مجمع دويسبورغ النهري',
    certFlag: '🇩🇪',
    bulkSupplierId: 'sup-baoshan-metals',
    bulkSupplierName: 'مجموعة الشرق الأقصى للفولاذ التجاري',
    bulkCountry: 'آسيا',
    bulkPort: 'ميناء بوسان / شنغهاي',
    bulkFlag: '🚢',
    seaTransitDays: 2,
  },
  cement: {
    sector: 'metals',
    certSupplierId: 'sup-med-cement',
    certSupplierName: 'المجموعة المتوسطية للكلنكر والأسمنت المقاوم',
    certCountry: 'مصر',
    certPort: 'ميناء السخنة / دمياط',
    certFlag: '🇪🇬',
    bulkSupplierId: 'sup-gulf-clinker',
    bulkSupplierName: 'فائض أرصفة التعمير الإقليمية',
    bulkCountry: 'الخليج',
    bulkPort: 'ميناء الشويخ / رأس الخير',
    bulkFlag: '🏗️',
    seaTransitDays: 1,
  },
  silicon: {
    sector: 'tech-chem',
    certSupplierId: 'sup-tokyo-wafer',
    certSupplierName: 'شركة طوكيو - تايبيه لرقائق السيليكون النقية',
    certCountry: 'اليابان',
    certPort: 'ميناء يوكوهاما التكنولوجي',
    certFlag: '🇯🇵',
    bulkSupplierId: 'sup-shenzhen-semi',
    bulkSupplierName: 'سوق فائض أشباه الموصلات الآسيوي',
    bulkCountry: 'شرق آسيا',
    bulkPort: 'منطقة شنتشن الحرة',
    bulkFlag: '🔬',
    seaTransitDays: 2,
  },
  components: {
    sector: 'metals',
    certSupplierId: 'sup-nippon-precision',
    certSupplierName: 'مجموعة نيبون وبافاريا للهندسة الدقيقة',
    certCountry: 'اليابان / ألمانيا',
    certPort: 'ميناء كوبي الصناعي',
    certFlag: '🇯🇵',
    bulkSupplierId: 'sup-global-parts',
    bulkSupplierName: 'تصفية مستودعات المعدات الصناعية',
    bulkCountry: 'المملكة المتحدة',
    bulkPort: 'ميناء فيليكستو التجاري',
    bulkFlag: '🇬🇧',
    seaTransitDays: 2,
  },
  packaging: {
    sector: 'agri',
    certSupplierId: 'sup-euro-pack',
    certSupplierName: 'المؤسسة الأوروبية للتغليف الغذائي الآمن',
    certCountry: 'ألمانيا',
    certPort: 'ميناء بريمرهافن',
    certFlag: '🇩🇪',
    bulkSupplierId: 'sup-asia-pack-bulk',
    bulkSupplierName: 'تجمع مصانع التغليف التجاري بالجملة',
    bulkCountry: 'الإمارات',
    bulkPort: 'منطقة جبل علي الحرة JAFZA',
    bulkFlag: '🇦🇪',
    seaTransitDays: 1,
  },
};

interface CountryTradeProfile {
  advantagedMaterials: readonly string[];
  advantageDiscountPct: number;
  baseCustomsTariffRate: number;
  seaFreightMultiplier: number;
  exportHubBonusPct: number;
}

const COUNTRY_TRADE_PROFILES: Record<CountryId, CountryTradeProfile> = {
  egypt: {
    advantagedMaterials: ['grain', 'cement', 'water', 'packaging'],
    advantageDiscountPct: 8,
    baseCustomsTariffRate: 0.05,
    seaFreightMultiplier: 0.78, // Suez Canal strategic transit advantage
    exportHubBonusPct: 5,
  },
  saudi: {
    advantagedMaterials: ['crude-oil', 'natural-gas', 'fuel', 'chemicals'],
    advantageDiscountPct: 12,
    baseCustomsTariffRate: 0.04,
    seaFreightMultiplier: 0.88,
    exportHubBonusPct: 6,
  },
  uae: {
    advantagedMaterials: ['fuel', 'packaging', 'water', 'crude-oil'],
    advantageDiscountPct: 9,
    baseCustomsTariffRate: 0.01, // JAFZA / global free-zone hub
    seaFreightMultiplier: 0.75,
    exportHubBonusPct: 8,
  },
  usa: {
    advantagedMaterials: ['grain', 'silicon', 'natural-gas', 'components'],
    advantageDiscountPct: 10,
    baseCustomsTariffRate: 0.04,
    seaFreightMultiplier: 0.9,
    exportHubBonusPct: 7,
  },
  kuwait: {
    advantagedMaterials: ['crude-oil', 'fuel', 'natural-gas', 'chemicals'],
    advantageDiscountPct: 12,
    baseCustomsTariffRate: 0.04,
    seaFreightMultiplier: 0.86,
    exportHubBonusPct: 5,
  },
  qatar: {
    advantagedMaterials: ['natural-gas', 'crude-oil', 'fuel', 'chemicals'],
    advantageDiscountPct: 13,
    baseCustomsTariffRate: 0.03,
    seaFreightMultiplier: 0.85,
    exportHubBonusPct: 6,
  },
  uk: {
    advantagedMaterials: ['components', 'chemicals', 'packaging'],
    advantageDiscountPct: 8,
    baseCustomsTariffRate: 0.02, // Maritime financial center
    seaFreightMultiplier: 0.82,
    exportHubBonusPct: 7,
  },
  germany: {
    advantagedMaterials: ['steel', 'components', 'chemicals'],
    advantageDiscountPct: 11,
    baseCustomsTariffRate: 0.03,
    seaFreightMultiplier: 0.86,
    exportHubBonusPct: 9,
  },
  japan: {
    advantagedMaterials: ['silicon', 'components', 'steel'],
    advantageDiscountPct: 12,
    baseCustomsTariffRate: 0.03,
    seaFreightMultiplier: 0.84,
    exportHubBonusPct: 9,
  },
  jordan: {
    advantagedMaterials: ['chemicals', 'water', 'packaging', 'cement'],
    advantageDiscountPct: 8,
    baseCustomsTariffRate: 0.025, // ASEZA free-zone strategic tariff
    seaFreightMultiplier: 0.82, // Red Sea Aqaba port
    exportHubBonusPct: 7,
  },
};

const BULK_TIERS_STANDARD: readonly BulkDiscountTier[] = [
  { minQty: 20, discountPct: 4 },
  { minQty: 50, discountPct: 8 },
  { minQty: 100, discountPct: 12 },
];

const BULK_TIERS_SURPLUS: readonly BulkDiscountTier[] = [
  { minQty: 15, discountPct: 5 },
  { minQty: 40, discountPct: 10 },
  { minQty: 80, discountPct: 15 },
];

function seededHash(value: string): number {
  let result = 2_166_136_261;
  for (let i = 0; i < value.length; i += 1) {
    result ^= value.charCodeAt(i);
    result = Math.imul(result, 16_777_619);
  }
  return result >>> 0;
}

export function getCountryTradeProfile(countryId: CountryId): CountryTradeProfile {
  return COUNTRY_TRADE_PROFILES[countryId] ?? COUNTRY_TRADE_PROFILES.egypt;
}

export function getOwnedMaritimeFleetCount(profileId: string): number {
  try {
    const raw = globalThis.localStorage?.getItem(`suly_mega_expansion_v2_${profileId}`);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { maritime?: { ownedVesselIds?: unknown[] } };
    return Array.isArray(parsed?.maritime?.ownedVesselIds) ? parsed.maritime.ownedVesselIds.length : 0;
  } catch {
    return 0;
  }
}

export function getMaterialSpotBenchmarkAtDay(
  profile: PlayerProfile,
  materialId: string,
  day: number,
): number {
  const material = findMaterial(materialId);
  if (!material) return 10;
  const tradeProfile = getCountryTradeProfile(profile.countryId);
  const advantageFactor = tradeProfile.advantagedMaterials.includes(materialId)
    ? 1 - tradeProfile.advantageDiscountPct / 100
    : 1;

  const waveSeed = seededHash(`spot:${materialId}:${day}`);
  const dailySwingPct = ((waveSeed % 19) - 9) / 100; // -9% to +9%

  const eventMultiplier = (profile.events ?? [])
    .filter(
      (ev) =>
        ev.materialId === materialId &&
        ev.day <= day &&
        (ev.effectExpiresOnDay ?? ev.day) >= day &&
        typeof ev.materialPriceMultiplier === 'number',
    )
    .reduce((acc, ev) => acc * (ev.materialPriceMultiplier ?? 1), 1);

  return Math.max(2, Math.round(material.pricePerUnit * advantageFactor * (1 + dailySwingPct) * eventMultiplier));
}

export function getCommodityBenchmarks(profile: PlayerProfile): CommodityBenchmark[] {
  const tradeProfile = getCountryTradeProfile(profile.countryId);
  return MATERIAL_CATALOG.map((material) => {
    const history: number[] = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const targetDay = Math.max(1, profile.day - offset);
      history.push(getMaterialSpotBenchmarkAtDay(profile, material.id, targetDay));
    }
    const spotPrice = history[history.length - 1];
    const previousPrice = history.length >= 2 ? history[history.length - 2] : material.pricePerUnit;
    const rawChange = previousPrice > 0 ? ((spotPrice - previousPrice) / previousPrice) * 100 : 0;
    const changePercent = Math.round(rawChange * 10) / 10;
    const trend: CommodityBenchmark['trend'] =
      changePercent >= 2 ? 'up' : changePercent <= -2 ? 'down' : 'steady';

    const hasEventShock = (profile.events ?? []).some(
      (ev) =>
        ev.materialId === material.id &&
        ev.day <= profile.day &&
        (ev.effectExpiresOnDay ?? ev.day) >= profile.day &&
        (ev.materialPriceMultiplier ?? 1) > 1.05,
    );

    const supplyStatus: CommodityBenchmark['supplyStatus'] = hasEventShock || changePercent >= 4
      ? 'shortage'
      : changePercent <= -3
        ? 'surplus'
        : 'balanced';

    const supplyLabel =
      supplyStatus === 'shortage'
        ? 'شحّ إمدادات عالمي'
        : supplyStatus === 'surplus'
          ? 'فائض معروض بالموانئ'
          : 'توازن عرض وطلب';

    const meta = COMMODITY_ORIGIN_META[material.id] ?? COMMODITY_ORIGIN_META.grain;
    const countryAdvantagePct = tradeProfile.advantagedMaterials.includes(material.id)
      ? tradeProfile.advantageDiscountPct
      : 0;

    return {
      materialId: material.id,
      name: material.name,
      unit: material.unit,
      sector: meta.sector,
      spotPrice,
      previousPrice,
      changePercent,
      trend,
      history,
      supplyStatus,
      supplyLabel,
      countryAdvantagePct,
      hasEventShock,
    };
  });
}

export function getPlayerFactoryMaterialIds(profile: PlayerProfile): Set<string> {
  const ids = new Set<string>();
  for (const company of profile.companies ?? []) {
    const recipe = findRecipeForIndustry(company.industryId);
    if (recipe) {
      for (const input of recipe.inputs) {
        ids.add(input.materialId);
      }
    }
  }
  return ids;
}

export function getSupplierTrustScore(profile: PlayerProfile, supplierId: string): number {
  return Math.max(0, Math.min(100, Math.round(profile.supplierTrust?.[supplierId] ?? 0)));
}

export function getSupplierTierLabel(trustScore: number): string {
  if (trustScore >= 50) return 'شريك استراتيجي (اعتماد مستندي متاح)';
  if (trustScore >= 25) return 'شريك معتمد (خصم ولاء 3%)';
  return 'تاجر دولي مسجّل';
}

export function getGlobalMarketOffers(profile: PlayerProfile): GlobalMarketOffer[] {
  const country = findCountry(profile.countryId);
  const scenario = getCountryScenario(profile.countryId);
  const tradeProfile = getCountryTradeProfile(profile.countryId);
  const countryName = country?.name ?? 'السوق المحلي';
  const countryFlag = country?.flag ?? '🌐';

  return MATERIAL_CATALOG.flatMap((material, materialIndex) => {
    const meta = COMMODITY_ORIGIN_META[material.id] ?? COMMODITY_ORIGIN_META.grain;
    const spotBenchmark = getMaterialSpotBenchmarkAtDay(profile, material.id, profile.day);

    // 3 realistic global tiers per commodity:
    // 0: Local Free-Zone Spot Hub (DDP, Grade B 88%, instant 0-day, 0% customs, negotiable)
    // 1: International Certified Exporter (Grade A+ 97%, boosts factory output quality +6%, fixed or narrow negotiation)
    // 2: Global Port Surplus / Bulk Lot (Grade C 78%, steepest discounts & sea-freight savings, highly negotiable)
    return ([0, 1, 2] as const).map((offerIndex): GlobalMarketOffer => {
      if (offerIndex === 0) {
        const unitPrice = Math.max(1, Math.round(spotBenchmark * 1.0));
        const negotiable = (profile.day + materialIndex) % 3 !== 2;
        return {
          id: `global-${material.id}-day-${profile.day}-offer-0`,
          materialId: material.id,
          sellerName: `المنطقة الحرة · ${scenario.economicProfile.portHub} (${countryName})`,
          supplierId: `sup-local-freezone-${profile.countryId}`,
          originCountry: countryName,
          originPort: scenario.economicProfile.portHub,
          originFlag: countryFlag,
          sector: meta.sector,
          grade: 'B',
          qualityScore: 88,
          unitPrice,
          floorPrice: negotiable ? Math.max(1, Math.round(unitPrice * 0.9)) : unitPrice,
          negotiable,
          confidence: 'medium',
          availableStock: Math.min(material.storageLimit, 250 + ((seededHash(`${material.id}:${profile.day}:0`) % 5) * 50)),
          minOrderQty: 1,
          isLocalFreeZone: true,
          seaDiscountRate: 0.12,
          seaTransitDays: 1,
          customsTariffRate: 0,
          bulkTiers: BULK_TIERS_STANDARD,
        };
      }

      if (offerIndex === 1) {
        const unitPrice = Math.max(2, Math.round(spotBenchmark * 1.14));
        const negotiable = (profile.day + materialIndex) % 2 === 0;
        return {
          id: `global-${material.id}-day-${profile.day}-offer-1`,
          materialId: material.id,
          sellerName: meta.certSupplierName,
          supplierId: meta.certSupplierId,
          originCountry: meta.certCountry,
          originPort: meta.certPort,
          originFlag: meta.certFlag,
          sector: meta.sector,
          grade: 'A+',
          qualityScore: 97,
          unitPrice,
          floorPrice: negotiable ? Math.max(1, Math.round(unitPrice * 0.93)) : unitPrice,
          negotiable,
          confidence: 'high',
          availableStock: Math.min(material.storageLimit, 180 + ((seededHash(`${material.id}:${profile.day}:1`) % 4) * 40)),
          minOrderQty: 1,
          isLocalFreeZone: false,
          seaDiscountRate: 0.18,
          seaTransitDays: meta.seaTransitDays,
          customsTariffRate: tradeProfile.baseCustomsTariffRate,
          bulkTiers: BULK_TIERS_STANDARD,
        };
      }

      const unitPrice = Math.max(1, Math.round(spotBenchmark * 0.9));
      return {
        id: `global-${material.id}-day-${profile.day}-offer-2`,
        materialId: material.id,
        sellerName: meta.bulkSupplierName,
        supplierId: meta.bulkSupplierId,
        originCountry: meta.bulkCountry,
        originPort: meta.bulkPort,
        originFlag: meta.bulkFlag,
        sector: meta.sector,
        grade: 'C',
        qualityScore: 78,
        unitPrice,
        floorPrice: Math.max(1, Math.round(unitPrice * 0.85)),
        negotiable: true,
        confidence: 'low',
        availableStock: material.storageLimit,
        minOrderQty: 1,
        isLocalFreeZone: false,
        seaDiscountRate: 0.22,
        seaTransitDays: meta.seaTransitDays,
        customsTariffRate: tradeProfile.baseCustomsTariffRate,
        bulkTiers: BULK_TIERS_SURPLUS,
      };
    });
  });
}

export function resolveGlobalMarketOffer(
  profile: PlayerProfile,
  offerId: string,
): GlobalMarketOffer | undefined {
  return getGlobalMarketOffers(profile).find((offer) => offer.id === offerId);
}

export function calculateImportQuote(
  profile: PlayerProfile,
  offer: GlobalMarketOffer,
  quantity: number,
  options?: {
    negotiatedUnitPrice?: number;
    shippingMode?: GlobalShippingMode;
    paymentTerm?: GlobalPaymentTerm;
    fleetCount?: number;
  },
): ImportQuoteBreakdown {
  const safeQty = Math.max(1, Math.floor(quantity || 1));
  const shippingMode: GlobalShippingMode = options?.shippingMode ?? 'spot-ddp';
  const paymentTerm: GlobalPaymentTerm = options?.paymentTerm ?? 'cash-spot';
  const baseUnitPrice = options?.negotiatedUnitPrice ?? offer.unitPrice;
  const tradeProfile = getCountryTradeProfile(profile.countryId);

  // Bulk discount tier
  let bulkDiscountPct = 0;
  for (const tier of offer.bulkTiers) {
    if (safeQty >= tier.minQty) {
      bulkDiscountPct = tier.discountPct;
    }
  }

  // Supplier loyalty discount
  const trustScore = getSupplierTrustScore(profile, offer.supplierId);
  const trustDiscountPct = trustScore >= 50 ? 5 : trustScore >= 25 ? 3 : 0;

  // Shipping mode unit price adjustment
  const modeMultiplier =
    shippingMode === 'sea-cif'
      ? 1 - offer.seaDiscountRate
      : shippingMode === 'air-express'
        ? 1.08
        : 1;

  // Note: If default spot-ddp with small qty and 0 trust, keep exact baseUnitPrice so legacy callers/tests match 1:1
  const combinedDiscountMultiplier = (1 - bulkDiscountPct / 100) * (1 - trustDiscountPct / 100);
  const shippingModeUnitPrice =
    shippingMode === 'spot-ddp' && bulkDiscountPct === 0 && trustDiscountPct === 0
      ? baseUnitPrice
      : Math.max(1, Math.round(baseUnitPrice * modeMultiplier * combinedDiscountMultiplier));

  const merchandiseSubtotal = safeQty * shippingModeUnitPrice;

  // Freight & Fleet discount
  const fleetCount = options?.fleetCount ?? getOwnedMaritimeFleetCount(profile.id);
  const fleetReductionFactor = Math.max(0.2, 1 - fleetCount * 0.35);

  let rawFreight = 0;
  if (shippingMode === 'sea-cif') {
    rawFreight = Math.max(12, Math.round(merchandiseSubtotal * 0.04 * tradeProfile.seaFreightMultiplier));
  } else if (shippingMode === 'air-express') {
    rawFreight = Math.max(35, Math.round(merchandiseSubtotal * 0.14));
  }
  const freightCost = shippingMode === 'sea-cif' ? Math.round(rawFreight * fleetReductionFactor) : rawFreight;
  const fleetDiscountSaved = Math.max(0, rawFreight - freightCost);

  // Customs & Marine Insurance (Spot DDP Free-Zone is already customs-cleared so 0 extra fees)
  const customsDuty =
    shippingMode === 'spot-ddp' || offer.isLocalFreeZone
      ? 0
      : Math.round(merchandiseSubtotal * offer.customsTariffRate);
  const insuranceCost =
    shippingMode === 'spot-ddp' ? 0 : Math.max(5, Math.round(merchandiseSubtotal * 0.01));

  const totalLandedCost = merchandiseSubtotal + freightCost + customsDuty + insuranceCost;
  const effectiveUnitCost = Math.round((totalLandedCost / safeQty) * 100) / 100;

  const canUseLC =
    paymentTerm === 'lc-net2' &&
    shippingMode === 'sea-cif' &&
    (trustScore >= 40 || (profile.reputation ?? 50) >= 65);

  const upfrontCashDue = canUseLC ? Math.max(1, Math.round(totalLandedCost * 0.3)) : totalLandedCost;
  const deferredBalanceDue = canUseLC ? Math.max(0, totalLandedCost - upfrontCashDue) : 0;

  const transitDays = shippingMode === 'sea-cif' ? offer.seaTransitDays : 0;

  return {
    quantity: safeQty,
    shippingMode,
    paymentTerm: canUseLC ? 'lc-net2' : 'cash-spot',
    baseUnitPrice,
    bulkDiscountPct,
    trustDiscountPct,
    shippingModeUnitPrice,
    merchandiseSubtotal,
    freightCost,
    fleetDiscountSaved,
    customsDuty,
    insuranceCost,
    totalLandedCost,
    effectiveUnitCost,
    upfrontCashDue,
    deferredBalanceDue,
    transitDays,
    arrivesOnDay: profile.day + transitDays,
  };
}

export function negotiateGlobalMarketOffer(
  profile: PlayerProfile,
  offerId: string,
): { accepted: boolean; unitPrice?: number; message: string } {
  const offer = resolveGlobalMarketOffer(profile, offerId);
  if (!offer) return { accepted: false, message: 'العرض لم يعد متاحًا في دورة السوق الحالية.' };
  if (!offer.negotiable) {
    return {
      accepted: false,
      unitPrice: offer.unitPrice,
      message: `عرض ${offer.sellerName} مسعّر ببورصة عالمية ثابتة ولا يقبل التفاوض.`,
    };
  }
  const trustBonus = getSupplierTrustScore(profile, offer.supplierId) >= 25;
  const accepted = trustBonus || (profile.day + offer.id.length) % 5 !== 0;
  if (!accepted) {
    return {
      accepted: false,
      unitPrice: offer.unitPrice,
      message: `رفض ${offer.sellerName} خفض السعر لهذه الكمية؛ ارفع حجم الطلبية أو اقبل السعر المعلن.`,
    };
  }
  const negotiatedPrice = offer.floorPrice;
  return {
    accepted: true,
    unitPrice: negotiatedPrice,
    message: `وافق ${offer.sellerName} على سعر تفضيلي ${negotiatedPrice.toLocaleString('ar-EG')} $ لكل ${findMaterial(offer.materialId)?.unit ?? 'وحدة'}.`,
  };
}

export function proposeGlobalCounterOffer(
  profile: PlayerProfile,
  offerId: string,
  quantity: number,
  proposedUnitPrice: number,
): CounterOfferResult {
  const offer = resolveGlobalMarketOffer(profile, offerId);
  if (!offer) {
    return { accepted: false, acceptanceChancePct: 0, message: 'انتهت صلاحية عرض المورد في هذه الجلسة.' };
  }
  if (!offer.negotiable) {
    return {
      accepted: false,
      unitPrice: offer.unitPrice,
      acceptanceChancePct: 0,
      message: `عرض ${offer.sellerName} مرتبط بسعر مرجعي ثابت؛ جرّب التفاوض مع مورد المنطقة الحرة أو مورد الفائض.`,
    };
  }

  const safeQty = Math.max(1, Math.floor(quantity || 1));
  const cleanProposed = Math.max(1, Math.round(proposedUnitPrice));
  const trustScore = getSupplierTrustScore(profile, offer.supplierId);
  const reputation = profile.reputation ?? 50;

  // Volume & Trust unlock a deeper floor than single-click negotiation
  const volumeFlex = safeQty >= 80 ? 0.06 : safeQty >= 35 ? 0.04 : safeQty >= 15 ? 0.02 : 0;
  const trustFlex = trustScore >= 50 ? 0.04 : trustScore >= 25 ? 0.02 : 0;
  const dynamicFloor = Math.max(1, Math.round(offer.floorPrice * (1 - volumeFlex - trustFlex)));

  if (cleanProposed >= offer.unitPrice) {
    return {
      accepted: true,
      unitPrice: offer.unitPrice,
      acceptanceChancePct: 100,
      message: `تم اعتماد السعر الفوري ${offer.unitPrice.toLocaleString('ar-EG')} $ للوحدة مباشرة.`,
    };
  }

  if (cleanProposed < dynamicFloor) {
    return {
      accepted: false,
      counterPrice: dynamicFloor,
      acceptanceChancePct: 15,
      message: `السعر المقترح (${cleanProposed.toLocaleString('ar-EG')} $) أقل من تكلفة التصدير؛ المورد يعرض حدّه الأدنى عند ${dynamicFloor.toLocaleString('ar-EG')} $ لهذه الكمية.`,
    };
  }

  const spreadRatio =
    offer.unitPrice === dynamicFloor
      ? 1
      : (cleanProposed - dynamicFloor) / Math.max(1, offer.unitPrice - dynamicFloor);
  const chancePct = Math.min(98, Math.max(45, Math.round(50 + spreadRatio * 35 + (reputation - 50) * 0.25 + trustScore * 0.2)));
  const roll = seededHash(`${profile.id}:${offer.id}:${safeQty}:${cleanProposed}:${profile.day}`) % 100;

  if (roll < chancePct) {
    return {
      accepted: true,
      unitPrice: cleanProposed,
      acceptanceChancePct: chancePct,
      message: `نجحت المفاوضات التجارية! اعتمد ${offer.sellerName} سعرك المقترح ${cleanProposed.toLocaleString('ar-EG')} $ للوحدة لكمية ${safeQty.toLocaleString('ar-EG')}.`,
    };
  }

  const midCounter = Math.max(dynamicFloor, Math.round((cleanProposed + offer.unitPrice) / 2));
  return {
    accepted: true,
    unitPrice: midCounter,
    counterPrice: midCounter,
    acceptanceChancePct: chancePct,
    message: `قدّم ${offer.sellerName} تسوية وسطية نهائية بسعر ${midCounter.toLocaleString('ar-EG')} $ للوحدة وتم تثبيتها لصفقتك.`,
  };
}

const GLOBAL_EXPORT_BUYERS = [
  { id: 'exp-rotterdam', name: 'بورصة روتردام للتوزيع الأوروبي', port: 'ميناء روتردام · هولندا', flag: '🇪🇺', minQual: 88, mult: 1.18, minQty: 6, maxQty: 60, incoterm: 'CIF Rotterdam' },
  { id: 'exp-singapore', name: 'مركز سنغافورة للتجارة الآسيوية', port: 'ميناء سنغافورة الدولي', flag: '🇸🇬', minQual: 84, mult: 1.14, minQty: 5, maxQty: 75, incoterm: 'FOB Container' },
  { id: 'exp-jebelali', name: 'شبكة إعادة التصدير الإقليمية', port: 'ميناء جبل علي · دبي', flag: '🇦🇪', minQual: 78, mult: 1.09, minQty: 4, maxQty: 80, incoterm: 'EXW / FOB' },
  { id: 'exp-hamburg', name: 'اتحاد المستوردين الصناعيين · هامبورغ', port: 'ميناء هامبورغ · ألمانيا', flag: '🇩🇪', minQual: 90, mult: 1.24, minQty: 8, maxQty: 50, incoterm: 'DDP Europe' },
  { id: 'exp-newyork', name: 'مجموعة الساحل الشرقي للاستيراد', port: 'ميناء نيويورك ونيوجيرسي', flag: '🇺🇸', minQual: 85, mult: 1.16, minQty: 6, maxQty: 65, incoterm: 'CIF Atlantic' },
  { id: 'exp-yokohama', name: 'شركة يوكوهاما للتوريد المتقدم', port: 'ميناء يوكوهاما · اليابان', flag: '🇯🇵', minQual: 91, mult: 1.26, minQty: 6, maxQty: 45, incoterm: 'CIF Pacific' },
] as const;

export function getGlobalExportBids(profile: PlayerProfile): GlobalExportBid[] {
  const tradeProfile = getCountryTradeProfile(profile.countryId);
  const ownedProductIds = (profile.companies ?? [])
    .map((c) => findRecipeForIndustry(c.industryId)?.productId)
    .filter((id): id is string => Boolean(id));

  // Build 6 daily export bids, guaranteeing the first slots cover the player's owned products
  const selectedProducts = [0, 1, 2, 3, 4, 5].map((slot) => {
    if (slot < ownedProductIds.length) {
      const owned = PRODUCT_CATALOG.find((p) => p.id === ownedProductIds[slot]);
      if (owned) return owned;
    }
    const idx = seededHash(`export-prod:${profile.id}:${profile.day}:${slot}`) % PRODUCT_CATALOG.length;
    return PRODUCT_CATALOG[idx];
  });

  // Also ensure if player has finished products in inventory, at least one bid matches each stocked product
  const stockedProductIds = (profile.inventory ?? [])
    .map((lot) => PRODUCT_CATALOG.find((p) => p.id === lot.materialOrProductId))
    .filter((p): p is (typeof PRODUCT_CATALOG)[number] => Boolean(p));

  stockedProductIds.forEach((prod, i) => {
    if (!selectedProducts.some((p) => p.id === prod.id) && i < selectedProducts.length) {
      selectedProducts[selectedProducts.length - 1 - i] = prod;
    }
  });

  return selectedProducts.map((product, slot) => {
    const buyer =
      slot === 0
        ? GLOBAL_EXPORT_BUYERS[2] // Accessible 78% quality regional re-export hub on slot 0 so early factories (86% quality) can export right away
        : GLOBAL_EXPORT_BUYERS[seededHash(`export-buyer:${profile.day}:${slot}:${product.id}`) % GLOBAL_EXPORT_BUYERS.length];

    const localRef = Math.max(1, Math.round(product.baseSellPrice * getMarketPriceProgression(profile.day)));
    const exportBonusMultiplier = 1 + tradeProfile.exportHubBonusPct / 100;
    const wave = 1 + (((seededHash(`exp-wave:${product.id}:${profile.day}:${slot}`) % 13) - 5) / 100);
    const unitPrice = Math.max(localRef, Math.round(localRef * buyer.mult * exportBonusMultiplier * wave));
    const premiumPct = Math.max(0, Math.round(((unitPrice - localRef) / Math.max(1, localRef)) * 100));

    return {
      id: `export-bid-${profile.day}-${slot}-${product.id}`,
      buyerId: buyer.id,
      buyerName: buyer.name,
      destinationPort: buyer.port,
      destinationFlag: buyer.flag,
      productId: product.id,
      productName: product.name,
      unit: product.unit,
      minQuantity: buyer.minQty,
      maxQuantity: buyer.maxQty,
      unitPrice,
      localReferencePrice: localRef,
      premiumPct,
      exportClearanceRate: 0.02, // 2% export port clearance instead of high domestic sales tax
      minimumQuality: buyer.minQual,
      reputationReward: buyer.minQual >= 90 ? 4 : 2,
      incotermLabel: buyer.incoterm,
    };
  });
}

export function getForwardContractTemplates(profile: PlayerProfile): ForwardContractTemplate[] {
  const factoryMatIds = getPlayerFactoryMaterialIds(profile);
  const prioritized = [
    ...MATERIAL_CATALOG.filter((m) => factoryMatIds.has(m.id)),
    ...MATERIAL_CATALOG.filter((m) => !factoryMatIds.has(m.id)),
  ].slice(0, 6);

  return prioritized.map((material) => {
    const meta = COMMODITY_ORIGIN_META[material.id] ?? COMMODITY_ORIGIN_META.grain;
    const spotUnitPrice = getMaterialSpotBenchmarkAtDay(profile, material.id, profile.day);
    const lockedUnitPrice = Math.max(1, Math.round(spotUnitPrice * 0.92)); // 8% below current spot, immune to future inflation
    const dailyQuota = 25;
    const durationDays = 4;
    const totalContractUnits = dailyQuota * durationDays;
    const marginDeposit = Math.max(25, Math.round(totalContractUnits * lockedUnitPrice * 0.15));

    return {
      id: `fwd-${material.id}-day-${profile.day}`,
      materialId: material.id,
      materialName: material.name,
      unit: material.unit,
      supplierId: meta.certSupplierId,
      supplierName: meta.certSupplierName,
      originHub: `${meta.certPort} · ${meta.certCountry}`,
      spotUnitPrice,
      lockedUnitPrice,
      savingsPct: Math.max(5, Math.round(((spotUnitPrice - lockedUnitPrice) / Math.max(1, spotUnitPrice)) * 100)),
      dailyQuota,
      durationDays,
      totalContractUnits,
      marginDeposit,
      qualityScore: 94,
    };
  });
}
