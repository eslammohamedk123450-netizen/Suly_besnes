/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PlayerProfile } from '../domain/player';
import { calculateTotalAssets } from '../domain/player';
import type { CountryId, IndustryId } from '../domain/countries';
import { getDirectLandsForCountry, findIndustry, INDUSTRY_CATALOG, type DirectLandListing } from './catalog';
import type { PurchasePaymentMethod } from './purchasePricing';
import {
  type GameResult,
  resolvePurchaseDebit,
  addLedger,
  ledgerEntry,
  success,
  failure,
  timestampFor,
  syncTasks,
} from './engine';

export type PlotStatus = 'empty_for_sale' | 'owned_empty' | 'paperwork' | 'clearing' | 'constructing' | 'developed' | 'locked';
export type LandZoning = 'industrial' | 'commercial' | 'agricultural';

export interface CityPlotDefinition {
  id: string; // Internal 3D plot slot e.g., 'plot-ind-1'
  gridX: number; // 3D world coordinates
  gridZ: number;
  width: number;
  depth: number;
  zoning: LandZoning;
  districtId: string;
  districtName: string;
  defaultPrice: number;
  areaSquareMeters: number;
  requiredLevel: number;
  label: string;
  catalogListingId?: string; // Real catalog ID (e.g. 'real-land-egypt-1') for authentic buyDirectLand
  associatedLandId?: string;
  associatedCompanyId?: string;
}

export interface CityConstructionState {
  plotId: string;
  landId: string;
  industryId: IndustryId;
  companyName: string;
  startedAt: number; // Date.now()
  durationMs: number; // e.g. 15_000 (15 seconds)
  costCash: number;
  costDiamonds: number;
  status: 'clearing' | 'constructing' | 'completed';
}

export interface CityDistrict {
  id: string;
  name: string;
  description: string;
  requiredLevel: number;
  isUnlocked: boolean;
  accentColor: string;
}

export interface HQTierSpec {
  level: number;
  title: string;
  costCash: number;
  costDiamonds: number;
  requiredNetWorth: number;
  reputationBonus: number;
  xpReward: number;
  description: string;
  perks: string[];
}

export const HQ_TIERS: readonly HQTierSpec[] = [
  {
    level: 1,
    title: 'مقر القيادة التأسيسي',
    costCash: 0,
    costDiamonds: 0,
    requiredNetWorth: 0,
    reputationBonus: 10,
    xpReward: 50,
    description: 'المقر التأسيسي الأولي لإطلاق أعمال واستثمارات الإمبراطورية.',
    perks: ['إدارة المنشآت الأساسية', 'الوصول إلى البنك المركزي'],
  },
  {
    level: 2,
    title: 'برج الإدارة التنفيذية والعمليات',
    costCash: 25_000,
    costDiamonds: 15,
    requiredNetWorth: 35_000,
    reputationBonus: 50,
    xpReward: 250,
    description: 'برج متطور من 4 طوابق لإدارة سلاسل الإمداد ومتابعة الفروع.',
    perks: ['فتح المنطقة اللوجستية والميناء', 'زيادة طاقة المصانع +10%'],
  },
  {
    level: 3,
    title: 'مجمع المقر الإمبراطوري المتكامل',
    costCash: 75_000,
    costDiamonds: 35,
    requiredNetWorth: 100_000,
    reputationBonus: 120,
    xpReward: 600,
    description: 'صرح مالي وإداري ذو واجهات زجاجية وإضاءات ذهبية دائمة.',
    perks: ['خصم 15% على فوائد القروض', 'تسريع الإنتاج اليومي +15%'],
  },
  {
    level: 4,
    title: 'ناطحة السحاب المالية العالمية',
    costCash: 200_000,
    costDiamonds: 70,
    requiredNetWorth: 300_000,
    reputationBonus: 300,
    xpReward: 1200,
    description: 'برج ناطحة سحاب فائقة الارتفاع يضم مكاتب الاستثمار الدولي.',
    perks: ['فتح وادي التكنولوجيا والابتكار', 'عقود توريد دولية استثنائية'],
  },
  {
    level: 5,
    title: 'الصرح السيادي لإمبراطورية الأعمال',
    costCash: 500_000,
    costDiamonds: 150,
    requiredNetWorth: 800_000,
    reputationBonus: 700,
    xpReward: 3000,
    description: 'أعلى وأفخم برج في العاصمة، يعكس الهيمنة الاقتصادية الكاملة.',
    perks: ['حصانة ائتمانية كاملة', 'أرباح استثمارية مضاعفة +25%'],
  },
];

export const CITY_DISTRICTS: readonly CityDistrict[] = [
  {
    id: 'district_downtown',
    name: 'حي الأعمال الإمبراطوري (Downtown)',
    description: 'قلب المدينة المالي والتجاري يضم المقر الرئيسي والبنك والأبراج الاستثمارية.',
    requiredLevel: 1,
    isUnlocked: true,
    accentColor: '#f59e0b',
  },
  {
    id: 'district_industrial',
    name: 'المنطقة الصناعية الكبرى',
    description: 'مجمعات التصنيع وسلاسل الإمداد ومحطات الطاقة والمخازن اللوجستية.',
    requiredLevel: 1,
    isUnlocked: true,
    accentColor: '#0ea5e9',
  },
  {
    id: 'district_logistics',
    name: 'الميناء والمنطقة الحرة اللوجستية',
    description: 'مراكز التوزيع، التجارة الدولية، وخطوط الشحن الملاحي والتصدير.',
    requiredLevel: 2,
    isUnlocked: false,
    accentColor: '#10b981',
  },
  {
    id: 'district_innovation',
    name: 'وادي التكنولوجيا والشركات الناشئة',
    description: 'حاضنات الأعمال المتقدمة، مراكز الأبحاث، والذكاء الاصطناعي.',
    requiredLevel: 4,
    isUnlocked: false,
    accentColor: '#8b5cf6',
  },
];

/**
 * 3D Grid Layout coordinates for plots around the city center
 */
export const CITY_BASE_PLOTS: readonly CityPlotDefinition[] = [
  // Industrial sector (North-East)
  {
    id: 'plot-ind-1',
    gridX: 20,
    gridZ: -14,
    width: 12,
    depth: 12,
    zoning: 'industrial',
    districtId: 'district_industrial',
    districtName: 'المنطقة الصناعية الكبرى',
    defaultPrice: 6200,
    areaSquareMeters: 500,
    requiredLevel: 1,
    label: 'موقع صناعي متقدم · قطاع أ',
  },
  {
    id: 'plot-ind-2',
    gridX: 35,
    gridZ: -14,
    width: 12,
    depth: 12,
    zoning: 'industrial',
    districtId: 'district_industrial',
    districtName: 'المنطقة الصناعية الكبرى',
    defaultPrice: 6500,
    areaSquareMeters: 520,
    requiredLevel: 1,
    label: 'موقع صناعي ثقيل · قطاع ب',
  },
  {
    id: 'plot-ind-3',
    gridX: 20,
    gridZ: -30,
    width: 12,
    depth: 12,
    zoning: 'industrial',
    districtId: 'district_industrial',
    districtName: 'المنطقة الصناعية الكبرى',
    defaultPrice: 7200,
    areaSquareMeters: 520,
    requiredLevel: 2,
    label: 'مجمع الطاقة والبتروكيماويات',
  },
  // Commercial & Tech sector (North-West)
  {
    id: 'plot-comm-1',
    gridX: -20,
    gridZ: -14,
    width: 12,
    depth: 12,
    zoning: 'commercial',
    districtId: 'district_downtown',
    districtName: 'حي الأعمال الإمبراطوري',
    defaultPrice: 5300,
    areaSquareMeters: 420,
    requiredLevel: 1,
    label: 'برج تجاري وخدمات مالية',
  },
  {
    id: 'plot-comm-2',
    gridX: -35,
    gridZ: -14,
    width: 12,
    depth: 12,
    zoning: 'commercial',
    districtId: 'district_downtown',
    districtName: 'حي الأعمال الإمبراطوري',
    defaultPrice: 5700,
    areaSquareMeters: 450,
    requiredLevel: 2,
    label: 'مجمع تجاري ومقرات شركات',
  },
  {
    id: 'plot-comm-3',
    gridX: -20,
    gridZ: -30,
    width: 12,
    depth: 12,
    zoning: 'commercial',
    districtId: 'district_innovation',
    districtName: 'وادي التكنولوجيا',
    defaultPrice: 8500,
    areaSquareMeters: 480,
    requiredLevel: 4,
    label: 'حاضنة التكنولوجيا والابتكار',
  },
  // Agricultural & Resources sector (South-West)
  {
    id: 'plot-agri-1',
    gridX: -20,
    gridZ: 24,
    width: 12,
    depth: 12,
    zoning: 'agricultural',
    districtId: 'district_industrial',
    districtName: 'مزارع الوادي الخصيب',
    defaultPrice: 3600,
    areaSquareMeters: 520,
    requiredLevel: 1,
    label: 'أرض زراعية وصناعات غذائية',
  },
  {
    id: 'plot-agri-2',
    gridX: -35,
    gridZ: 24,
    width: 12,
    depth: 12,
    zoning: 'agricultural',
    districtId: 'district_industrial',
    districtName: 'مزارع الوادي الخصيب',
    defaultPrice: 4800,
    areaSquareMeters: 900,
    requiredLevel: 2,
    label: 'مزارع استصلاح واستثمار زراعي',
  },
  // Logistics & Distribution (South-East)
  {
    id: 'plot-log-1',
    gridX: 20,
    gridZ: 24,
    width: 12,
    depth: 12,
    zoning: 'commercial',
    districtId: 'district_logistics',
    districtName: 'الميناء والمنطقة اللوجستية',
    defaultPrice: 5700,
    areaSquareMeters: 420,
    requiredLevel: 2,
    label: 'مجمع النقل والتخزين اللوجستي',
  },
  {
    id: 'plot-log-2',
    gridX: 35,
    gridZ: 24,
    width: 12,
    depth: 12,
    zoning: 'commercial',
    districtId: 'district_logistics',
    districtName: 'الميناء والمنطقة اللوجستية',
    defaultPrice: 7900,
    areaSquareMeters: 550,
    requiredLevel: 3,
    label: 'مركز الشحن والتوزيع الإقليمي',
  },
];

const STORAGE_KEY_CONSTRUCTIONS = 'suly_city_constructions_v1';
const STORAGE_KEY_HQ_LEVEL = 'suly_city_hq_level_v1';
const TRANSACTION_LOCK_TIMEOUT_MS = 2000;

// In-memory transaction mutex to strictly prevent double-spending or rapid-tap issues
const transactionLocks = new Map<string, number>();

export function acquireTransactionLock(actionKey: string): boolean {
  const now = Date.now();
  const lastTime = transactionLocks.get(actionKey) ?? 0;
  if (now - lastTime < TRANSACTION_LOCK_TIMEOUT_MS) {
    return false; // Still locked
  }
  transactionLocks.set(actionKey, now);
  return true;
}

export function releaseTransactionLock(actionKey: string): void {
  transactionLocks.delete(actionKey);
}

/**
 * Loads active construction jobs from local storage
 */
export function loadCityConstructions(): Record<string, CityConstructionState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONSTRUCTIONS);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, CityConstructionState>;
  } catch {
    return {};
  }
}

/**
 * Saves active construction jobs to local storage
 */
export function saveCityConstructions(constructions: Record<string, CityConstructionState>): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONSTRUCTIONS, JSON.stringify(constructions));
  } catch {
    // Local storage error fallback
  }
}

let memoryHQLevel = 1;

/**
 * Loads the Imperial Tower HQ level from persistent storage
 */
export function loadHQLevel(profile?: PlayerProfile): number {
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_HQ_LEVEL);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 5) return parsed;
      }
    } catch {
      // fallback
    }
  }
  if (memoryHQLevel > 1) return memoryHQLevel;
  // Derive naturally from player level if not explicitly upgraded
  if (profile) {
    if (profile.level >= 10) return 4;
    if (profile.level >= 6) return 3;
    if (profile.level >= 3) return 2;
  }
  return 1;
}

/**
 * Saves the Imperial Tower HQ level
 */
export function saveHQLevel(level: number): void {
  memoryHQLevel = level;
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_HQ_LEVEL, String(level));
    } catch {
      // fallback
    }
  }
}

/**
 * Authoritative upgrade function for the Imperial Tower HQ.
 * Checks player net worth and bank balance, deducts cost once, awards reputation and XP.
 */
export function upgradeEmpireHQ(
  profile: PlayerProfile,
  paymentMethod: PurchasePaymentMethod = 'cash'
): GameResult<{ level: number; cost: number; diamondsSpent: number }> {
  const currentHQLevel = loadHQLevel(profile);
  const nextHQLevel = currentHQLevel + 1;
  const targetSpec = HQ_TIERS.find((t) => t.level === nextHQLevel);

  if (!targetSpec) {
    return failure(profile, 'condition-not-met', 'وصل المقر الإمبراطوري إلى أعلى مستوى تطوير حالياً.');
  }

  // Check required net worth
  const totalAssets = calculateTotalAssets(profile);
  if (totalAssets < targetSpec.requiredNetWorth) {
    return failure(
      profile,
      'condition-not-met',
      `يتطلب تطوير المقر إلى المستوى ${nextHQLevel} وصول ثروة الإمبراطورية إلى ${targetSpec.requiredNetWorth.toLocaleString('ar-EG')} $. (ثروتك الحالية: ${totalAssets.toLocaleString('ar-EG')} $)`
    );
  }

  // Resolve debit
  const cost = targetSpec.costCash;
  const payment = resolvePurchaseDebit(profile, cost, paymentMethod);
  if ('message' in payment) {
    return failure(profile, 'insufficient-funds', `لا تكفي الأموال لتطوير المقر. ${payment.message}`);
  }

  // Save new HQ level
  saveHQLevel(nextHQLevel);

  // Add ledger entry and update profile level & reputation
  const nextProfile = addLedger(
    {
      ...profile,
      level: Math.max(profile.level, nextHQLevel),
      reputation: (profile.reputation ?? 0) + targetSpec.reputationBonus,
    },
    [ledgerEntry(profile, 'expense', cost, `تطوير البرج الإمبراطوري إلى المستوى ${nextHQLevel} (${targetSpec.title})`, 0)],
    payment.bankBalance,
    { diamonds: payment.diamonds }
  );

  return success(
    syncTasks(nextProfile),
    `تمت ترقية البرج الإمبراطوري بنجاح إلى المستوى ${nextHQLevel}: ${targetSpec.title}! حصلت على +${targetSpec.reputationBonus} نقطة سمعة تجارية.`,
    { level: nextHQLevel, cost, diamondsSpent: payment.diamondsSpent }
  );
}

/**
 * Accelerate land paperwork so it becomes immediately ready for founding companies
 */
export function accelerateLandTransfer(
  profile: PlayerProfile,
  landId: string
): GameResult<{ landId: string }> {
  const land = profile.lands.find((l) => l.id === landId);
  if (!land) return failure(profile, 'not-found', 'الأرض غير موجودة.');

  const diamondsCost = 5;
  if (profile.diamonds < diamondsCost) {
    return failure(profile, 'insufficient-funds', `تحتاج إلى ${diamondsCost} ماسات لإنهاء عقود نقل الملكية فوراً.`);
  }

  const updatedLands = profile.lands.map((l) =>
    l.id === landId
      ? { ...l, availableForCompanyOnDay: profile.day }
      : l
  );

  const nextProfile = {
    ...profile,
    diamonds: profile.diamonds - diamondsCost,
    lands: updatedLands,
  };

  return success(
    syncTasks(nextProfile),
    `تم إنهاء عقود نقل الملكية لـ ${land.label} فوراً وتسليم الموقع جاهزاً للبناء!`,
    { landId }
  );
}

/**
 * Maps player lands and companies cleanly to 3D city plots.
 * Matches unowned plots to real direct catalog listings so buyDirectLand works authentically.
 */
export function resolveCityGrid(
  profile: PlayerProfile,
  constructions: Record<string, CityConstructionState> = loadCityConstructions()
): {
  plots: Array<
    CityPlotDefinition & {
      status: PlotStatus;
      land?: PlayerProfile['lands'][number];
      company?: PlayerProfile['companies'][number];
      construction?: CityConstructionState;
    }
  >;
  districts: CityDistrict[];
  hqLevel: number;
} {
  const directLands = getDirectLandsForCountry(profile.countryId);
  const now = Date.now();
  const hqLevel = loadHQLevel(profile);

  // Determine districts unlock based on player level and HQ level
  const districts = CITY_DISTRICTS.map((d) => ({
    ...d,
    isUnlocked: profile.level >= d.requiredLevel || hqLevel >= d.requiredLevel,
  }));

  const playerLands = profile.lands ?? [];
  const playerCompanies = profile.companies ?? [];

  // Match each base plot to player lands or unowned direct lands
  const mappedPlots = CITY_BASE_PLOTS.map((basePlot, index) => {
    // 1. Check if player owns a land already matched to this slot ID or assigned sequentially
    let matchedLand = playerLands.find((l) => l.id === basePlot.id);
    if (!matchedLand && index < playerLands.length) {
      const candidateLand = playerLands[index];
      const isClaimedByOther = CITY_BASE_PLOTS.slice(0, index).some((p) => p.id === candidateLand.id);
      if (!isClaimedByOther) {
        matchedLand = candidateLand;
      }
    }

    // 2. Select an unowned direct land listing from the country catalog for empty plots
    const unownedCatalogLands = directLands.filter(
      (dl) => !playerLands.some((pl) => pl.id === dl.id)
    );
    const catalogListing =
      unownedCatalogLands[index % Math.max(1, unownedCatalogLands.length)] ||
      directLands[index % directLands.length];

    const effectiveCatalogId = catalogListing?.id;
    const effectiveLabel = matchedLand?.label ?? catalogListing?.label ?? basePlot.label;
    const effectivePrice = catalogListing?.price ?? basePlot.defaultPrice;
    const effectiveArea = matchedLand?.areaSquareMeters ?? catalogListing?.areaSquareMeters ?? basePlot.areaSquareMeters;
    const effectiveZoning = (matchedLand?.landType ?? catalogListing?.landType ?? basePlot.zoning) as LandZoning;

    let status: PlotStatus = 'empty_for_sale';
    let company: PlayerProfile['companies'][number] | undefined;
    let construction = constructions[basePlot.id];

    if (matchedLand) {
      company = playerCompanies.find((c) => c.landId === matchedLand!.id);

      if (construction) {
        const elapsed = now - construction.startedAt;
        if (elapsed >= construction.durationMs) {
          status = 'developed';
        } else if (elapsed < construction.durationMs * 0.3) {
          status = 'clearing';
        } else {
          status = 'constructing';
        }
      } else if (company) {
        status = 'developed';
      } else {
        // Check if land is still in paperwork
        const readyDay = matchedLand.availableForCompanyOnDay ?? matchedLand.acquiredOnDay ?? profile.day;
        if (readyDay > profile.day) {
          status = 'paperwork';
        } else {
          status = 'owned_empty';
        }
      }
    } else {
      const district = districts.find((d) => d.id === basePlot.districtId);
      if (district && !district.isUnlocked) {
        status = 'locked';
      } else {
        status = 'empty_for_sale';
      }
    }

    return {
      ...basePlot,
      label: effectiveLabel,
      defaultPrice: effectivePrice,
      areaSquareMeters: effectiveArea,
      zoning: effectiveZoning,
      catalogListingId: effectiveCatalogId,
      status,
      land: matchedLand,
      company,
      construction,
    };
  });

  return { plots: mappedPlots, districts, hqLevel };
}

/**
 * Calculates building construction costs and duration based on industry type and player level
 */
export function getConstructionSpecs(industryId: IndustryId, playerLevel: number): {
  durationSeconds: number;
  cashCost: number;
  diamondsCost: number;
  industryName: string;
} {
  const industry = findIndustry(industryId);
  const baseCost = industry?.setupFee ?? 5000;
  const durationSeconds = Math.max(10, Math.min(60, 15 + Math.floor(baseCost / 1000)));
  const diamondsCost = Math.max(5, Math.ceil(durationSeconds / 4));

  return {
    durationSeconds,
    cashCost: baseCost,
    diamondsCost,
    industryName: industry?.name ?? 'منشأة صناعية',
  };
}
