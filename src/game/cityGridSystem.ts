/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PlayerProfile } from '../domain/player';
import type { CountryId, IndustryId } from '../domain/countries';
import { getDirectLandsForCountry, findIndustry, INDUSTRY_CATALOG, type DirectLandListing } from './catalog';

export type PlotStatus = 'empty_for_sale' | 'owned_empty' | 'clearing' | 'constructing' | 'developed' | 'locked';
export type LandZoning = 'industrial' | 'commercial' | 'agricultural';

export interface CityPlotDefinition {
  id: string; // e.g., 'plot-1', 'plot-2', or matched to DirectLandListing.id
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

/**
 * Maps player lands and companies cleanly to 3D city plots.
 * Preserves 100% of existing profile data with backward compatibility.
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
} {
  const directLands = getDirectLandsForCountry(profile.countryId);
  const now = Date.now();

  // Determine districts unlock based on player level
  const districts = CITY_DISTRICTS.map((d) => ({
    ...d,
    isUnlocked: profile.level >= d.requiredLevel,
  }));

  const playerLands = profile.lands ?? [];
  const playerCompanies = profile.companies ?? [];

  // Match each base plot to player lands or direct lands
  const mappedPlots = CITY_BASE_PLOTS.map((basePlot, index) => {
    // Check if player owns a land assigned to this slot
    // Direct matching by ID, or assign sequentially to unassigned player lands
    let matchedLand = playerLands.find((l) => l.id === basePlot.id);
    if (!matchedLand && index < playerLands.length) {
      // Check if this player land is not already matched to another plot
      const candidateLand = playerLands[index];
      const isClaimedByOther = CITY_BASE_PLOTS.slice(0, index).some((p) => p.id === candidateLand.id);
      if (!isClaimedByOther) {
        matchedLand = candidateLand;
      }
    }

    // Check if matching direct land catalog listing exists to sync real price and label
    const directCatalogListing = directLands[index % directLands.length];
    const effectiveLabel = matchedLand?.label ?? directCatalogListing?.label ?? basePlot.label;
    const effectivePrice = directCatalogListing?.price ?? basePlot.defaultPrice;
    const effectiveArea = matchedLand?.areaSquareMeters ?? directCatalogListing?.areaSquareMeters ?? basePlot.areaSquareMeters;
    const effectiveZoning = (matchedLand?.landType ?? directCatalogListing?.landType ?? basePlot.zoning) as LandZoning;

    let status: PlotStatus = 'empty_for_sale';
    let company: PlayerProfile['companies'][number] | undefined;
    let construction = constructions[basePlot.id];

    if (matchedLand) {
      // Player owns this land!
      company = playerCompanies.find((c) => c.landId === matchedLand!.id);

      if (construction) {
        const elapsed = now - construction.startedAt;
        if (elapsed >= construction.durationMs) {
          // Construction finished!
          status = 'developed';
        } else if (elapsed < construction.durationMs * 0.3) {
          status = 'clearing';
        } else {
          status = 'constructing';
        }
      } else if (company) {
        status = 'developed';
      } else {
        status = 'owned_empty';
      }
    } else {
      // Unowned plot
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
      status,
      land: matchedLand,
      company,
      construction,
    };
  });

  return { plots: mappedPlots, districts };
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
