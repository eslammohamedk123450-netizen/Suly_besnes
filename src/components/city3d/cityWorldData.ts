/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PlayerProfile } from '../../domain/player';
import type { IndustryId } from '../../domain/countries';

/**
 * Visual classification of city facilities and functional zones.
 * Prepared to scale for any current or future business type.
 */
export type CityFacilityCategory =
  | 'headquarters'
  | 'central_bank'
  | 'factory'
  | 'store'
  | 'warehouse'
  | 'regional_branch'
  | 'tech_hub'
  | 'energy_station'
  | 'agricultural_farm';

/**
 * Distinct visual construction stages for realistic city growth:
 * - empty_plot: Bare unpurchased / vacant land with markers and sign
 * - paperwork_survey: Licensed plot undergoing survey and architectural prep
 * - site_clearing: Earth excavation, dirt mounds, heavy machinery
 * - active_construction: Steel columns, scaffolding, yellow tower crane
 * - completed: Finished high-fidelity 3D building with operational night lights
 * - locked: District or plot not yet unlocked by player level
 */
export type VisualConstructionStage =
  | 'empty_plot'
  | 'paperwork_survey'
  | 'site_clearing'
  | 'active_construction'
  | 'completed'
  | 'locked';

/**
 * Visual styling theme for a district or city
 */
export interface DistrictVisualTheme {
  primaryGroundColor: string;
  roadColor: string;
  curbColor: string;
  accentColor: string;
  curbEmissive?: string;
}

/**
 * Extensible definition of a city district
 */
export interface ExtensibleDistrictDefinition {
  id: string;
  name: string;
  code: string;
  theme: DistrictVisualTheme;
  centerCoordinates: { x: number; z: number };
  boundaryRadius: number;
  recommendedCategory: CityFacilityCategory;
  descriptionAr: string;
}

/**
 * Extensible definition for multiple cities or regional business hubs
 * Allows future additions of Cairo, Alexandria, Riyadh, Dubai, etc.
 */
export interface CityWorldHubDefinition {
  id: string;
  nameAr: string;
  countryCode: string;
  worldRadius: number;
  districts: ExtensibleDistrictDefinition[];
  defaultCameraPosition: { x: number; y: number; z: number };
  defaultLookAt: { x: number; y: number; z: number };
}

/**
 * Built-in district visual themes
 */
export const DISTRICT_VISUAL_THEMES: Record<string, DistrictVisualTheme> = {
  district_downtown: {
    primaryGroundColor: '#0a0f1d',
    roadColor: '#1e293b',
    curbColor: '#d97706',
    accentColor: '#f59e0b',
  },
  district_industrial: {
    primaryGroundColor: '#090d16',
    roadColor: '#1a2232',
    curbColor: '#0284c7',
    accentColor: '#38bdf8',
  },
  district_logistics: {
    primaryGroundColor: '#080d17',
    roadColor: '#162234',
    curbColor: '#059669',
    accentColor: '#10b981',
  },
  district_innovation: {
    primaryGroundColor: '#070c18',
    roadColor: '#1e1b4b',
    curbColor: '#7c3aed',
    accentColor: '#a855f7',
  },
};

/**
 * Multi-city registry for future geographic expansion
 */
export const CITY_WORLD_REGISTRY: Record<string, CityWorldHubDefinition> = {
  cairo_central: {
    id: 'cairo_central',
    nameAr: 'العاصمة المركزية (القاهرة الكبرى)',
    countryCode: 'egypt',
    worldRadius: 80,
    defaultCameraPosition: { x: 0, y: 34, z: 45 },
    defaultLookAt: { x: 0, y: 0, z: 4 },
    districts: [
      {
        id: 'district_downtown',
        name: 'حي المال والأعمال الإمبراطوري',
        code: 'DT',
        theme: DISTRICT_VISUAL_THEMES.district_downtown,
        centerCoordinates: { x: 0, z: 0 },
        boundaryRadius: 30,
        recommendedCategory: 'headquarters',
        descriptionAr: 'المركز التجاري والسيادي الرئيسي للإمبراطورية يضم المقر والبنك والأبراج المالية.',
      },
      {
        id: 'district_industrial',
        name: 'المنطقة الصناعية والتصنيع',
        code: 'IND',
        theme: DISTRICT_VISUAL_THEMES.district_industrial,
        centerCoordinates: { x: 26, z: -20 },
        boundaryRadius: 30,
        recommendedCategory: 'factory',
        descriptionAr: 'مجمعات التصنيع وسلاسل الإمداد ومحطات الطاقة والمخازن.',
      },
      {
        id: 'district_logistics',
        name: 'المنطقة الحرة واللوجستية',
        code: 'LOG',
        theme: DISTRICT_VISUAL_THEMES.district_logistics,
        centerCoordinates: { x: -26, z: -20 },
        boundaryRadius: 28,
        recommendedCategory: 'warehouse',
        descriptionAr: 'مستودعات الشحن وخطوط التوزيع ومراكز التوريد والتجارة.',
      },
      {
        id: 'district_innovation',
        name: 'وادي التكنولوجيا والابتكار',
        code: 'TECH',
        theme: DISTRICT_VISUAL_THEMES.district_innovation,
        centerCoordinates: { x: 0, z: -35 },
        boundaryRadius: 25,
        recommendedCategory: 'tech_hub',
        descriptionAr: 'حاضنات الأعمال المتقدمة ومراكز التكنولوجيا والبرمجيات.',
      },
    ],
  },
};

/**
 * Maps an industry ID to its visual facility category for procedural modeling
 */
export function classifyIndustryToFacility(industryId?: IndustryId | string): CityFacilityCategory {
  if (!industryId) return 'store';

  switch (industryId) {
    case 'petroleum':
    case 'gas':
    case 'chemicals':
    case 'manufacturing':
    case 'textiles':
    case 'steel':
    case 'construction':
      return 'factory';

    case 'banking':
    case 'finance':
    case 'insurance':
    case 'investments':
      return 'central_bank';

    case 'retail':
    case 'automotive':
    case 'trade':
    case 'pharmacy':
      return 'store';

    case 'logistics':
    case 'shipping':
    case 'storage':
    case 'import_export':
      return 'warehouse';

    case 'consulting':
    case 'services':
    case 'telecom':
    case 'tourism':
      return 'regional_branch';

    case 'electronics':
    case 'software':
    case 'ai':
    case 'tech':
      return 'tech_hub';

    case 'energy':
    case 'solar':
    case 'mining':
      return 'energy_station';

    case 'food':
    case 'agriculture':
    case 'fisheries':
      return 'agricultural_farm';

    default:
      return 'regional_branch';
  }
}

/**
 * Resolves the visual construction stage for any plot
 */
export function resolvePlotVisualStage(
  plotStatus: string,
  progressPercentage?: number
): VisualConstructionStage {
  switch (plotStatus) {
    case 'empty_for_sale':
      return 'empty_plot';
    case 'locked':
      return 'locked';
    case 'paperwork':
      return 'paperwork_survey';
    case 'clearing':
      return 'site_clearing';
    case 'constructing':
      if (progressPercentage !== undefined && progressPercentage < 25) {
        return 'site_clearing';
      }
      return 'active_construction';
    case 'developed':
    case 'completed':
      return 'completed';
    case 'owned_empty':
    default:
      return 'paperwork_survey';
  }
}
