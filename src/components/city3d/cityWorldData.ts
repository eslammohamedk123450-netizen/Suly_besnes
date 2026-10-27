/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PlayerProfile } from '../../domain/player';
import type { IndustryId } from '../../domain/countries';
import type { SectionId } from '../../domain/navigation';

/**
 * Visual classification of city facilities and functional zones.
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
  | 'agricultural_farm'
  | 'stock_exchange'
  | 'maritime_port'
  | 'megaprojects'
  | 'territory_citadel'
  | 'cartel_bastion'
  | 'auction_arena'
  | 'luxury_palace'
  | 'diamond_vault'
  | 'lucky_rotunda'
  | 'civic_monument';

export type LandmarkId =
  | 'hq'
  | 'bank'
  | 'stock_exchange'
  | 'tech_tree'
  | 'incubator'
  | 'maritime'
  | 'megaprojects'
  | 'territory'
  | 'cartel'
  | 'auctions'
  | 'factory'
  | 'warehouse_hub'
  | 'staff_academy'
  | 'audit_tower'
  | 'contracts_pavilion'
  | 'tasks_monument'
  | 'luxury_club'
  | 'diamond_store'
  | 'lucky_wheel'
  | 'prestige_consulate';

export interface LandmarkSystemDefinition {
  id: LandmarkId;
  titleAr: string;
  badgeAr: string;
  districtId: string;
  icon: string;
  accentColor: string;
  badgeBgColor?: string;
  coordinates: { x: number; z: number };
  labelHeight: number;
  sectionId?: SectionId;
  descriptionAr: string;
}

export type VisualConstructionStage =
  | 'empty_plot'
  | 'paperwork_survey'
  | 'site_clearing'
  | 'active_construction'
  | 'completed'
  | 'locked';

export interface DistrictVisualTheme {
  primaryGroundColor: string;
  roadColor: string;
  curbColor: string;
  accentColor: string;
}

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

export const DISTRICT_VISUAL_THEMES: Record<string, DistrictVisualTheme> = {
  district_downtown: {
    primaryGroundColor: '#0a0f1d',
    roadColor: '#1e293b',
    curbColor: '#d97706',
    accentColor: '#f59e0b',
  },
  district_tech_valley: {
    primaryGroundColor: '#070c18',
    roadColor: '#1e1b4b',
    curbColor: '#7c3aed',
    accentColor: '#a855f7',
  },
  district_government: {
    primaryGroundColor: '#090e1a',
    roadColor: '#172554',
    curbColor: '#2563eb',
    accentColor: '#60a5fa',
  },
  district_maritime_industrial: {
    primaryGroundColor: '#08101e',
    roadColor: '#162234',
    curbColor: '#0284c7',
    accentColor: '#38bdf8',
  },
  district_trade_commerce: {
    primaryGroundColor: '#091217',
    roadColor: '#132e29',
    curbColor: '#059669',
    accentColor: '#10b981',
  },
  district_luxury_coast: {
    primaryGroundColor: '#0f172a',
    roadColor: '#1e293b',
    curbColor: '#ec4899',
    accentColor: '#f472b6',
  },
};

/**
 * Registry of all 20 Landmark Systems mapped directly to 3D world locations.
 */
export const ALL_CITY_LANDMARKS: LandmarkSystemDefinition[] = [
  // 1. Imperial Headquarters
  {
    id: 'hq',
    titleAr: 'المقر الإمبراطوري',
    badgeAr: 'الإدارة العليا 👑',
    districtId: 'district_downtown',
    icon: '👑',
    accentColor: '#f59e0b',
    badgeBgColor: 'rgba(245, 158, 11, 0.25)',
    coordinates: { x: 0, z: 0 },
    labelHeight: 34,
    descriptionAr: 'المقر الرئيسي للإمبراطورية لإدارة فروع الشركات وتطوير رتبة الإمبراطورية.',
  },

  // 2. Central Sovereign Bank
  {
    id: 'bank',
    titleAr: 'البنك المركزي والسيادي',
    badgeAr: 'التمويل والسندات 🏦',
    districtId: 'district_downtown',
    icon: '🏦',
    accentColor: '#38bdf8',
    badgeBgColor: 'rgba(56, 189, 248, 0.25)',
    coordinates: { x: -24, z: 12 },
    labelHeight: 18,
    sectionId: 'bank',
    descriptionAr: 'البنك المركزي لإدارة الودائع، القروض، والفوائد المركبة وسندات الخزانة.',
  },

  // 3. Stock Exchange
  {
    id: 'stock_exchange',
    titleAr: 'بورصة الأوراق المالية',
    badgeAr: 'الأسهم والاستثمار 📈',
    districtId: 'district_downtown',
    icon: '📈',
    accentColor: '#10b981',
    badgeBgColor: 'rgba(16, 185, 129, 0.25)',
    coordinates: { x: 24, z: 12 },
    labelHeight: 20,
    sectionId: 'investments',
    descriptionAr: 'سوق المال والطرح العام الأولي (IPO) وتداول أسهم الشركات والمضاربة اليومية.',
  },

  // 4. Financial Audit Tower
  {
    id: 'audit_tower',
    titleAr: 'برج الرقابة المالية',
    badgeAr: 'التقارير والمحاسبة 📊',
    districtId: 'district_downtown',
    icon: '📊',
    accentColor: '#fbbf24',
    badgeBgColor: 'rgba(251, 191, 36, 0.25)',
    coordinates: { x: -24, z: -12 },
    labelHeight: 22,
    sectionId: 'reports',
    descriptionAr: 'مكتب المحاسبة والتدقيق الشامل لكشوفات الأرباح، التدفقات النقدية والضرائب.',
  },

  // 5. HR Staff Academy
  {
    id: 'staff_academy',
    titleAr: 'أكاديمية الكوادر والموظفين',
    badgeAr: 'الموارد البشرية 👥',
    districtId: 'district_downtown',
    icon: '👥',
    accentColor: '#a78bfa',
    badgeBgColor: 'rgba(167, 139, 250, 0.25)',
    coordinates: { x: 24, z: -12 },
    labelHeight: 22,
    sectionId: 'staff',
    descriptionAr: 'إدارة وتوظيف الكفاءات، المديرون التنفيذيون، المحاسبون والمحامون.',
  },

  // 6. Tech Tree R&D Hub
  {
    id: 'tech_tree',
    titleAr: 'مركز الأبحاث والتكنولوجيا',
    badgeAr: 'الأتمتة والـ R&D 🧬',
    districtId: 'district_tech_valley',
    icon: '🔬',
    accentColor: '#c084fc',
    badgeBgColor: 'rgba(192, 132, 252, 0.25)',
    coordinates: { x: -52, z: -45 },
    labelHeight: 20,
    sectionId: 'tech_tree',
    descriptionAr: 'مختبرات الأبحاث وشجرة التكنولوجيا لتطوير خطوط الأتمتة والذكاء الاصطناعي.',
  },

  // 7. VC Startup Incubator
  {
    id: 'incubator',
    titleAr: 'حاضنة الشركات الناشئة',
    badgeAr: 'استثمار جريء VC 🦄',
    districtId: 'district_tech_valley',
    icon: '🚀',
    accentColor: '#ec4899',
    badgeBgColor: 'rgba(236, 72, 153, 0.25)',
    coordinates: { x: -20, z: -52 },
    labelHeight: 25,
    sectionId: 'incubator',
    descriptionAr: 'تمويل الشركات الناشئة وجولات التمويل الاستثماري وتحقيق أرباح خيالية من الـ Unicorns.',
  },

  // 8. Diamond Vault
  {
    id: 'diamond_store',
    titleAr: 'خزينة الماس الملكية',
    badgeAr: 'متجر الماس والامتيازات 💎',
    districtId: 'district_tech_valley',
    icon: '💎',
    accentColor: '#38bdf8',
    badgeBgColor: 'rgba(56, 189, 248, 0.25)',
    coordinates: { x: -52, z: -18 },
    labelHeight: 18,
    sectionId: 'store',
    descriptionAr: 'خزينة الماس لشراء باقات الماس، بطاقات التسريع، وحزم النخبة الإمبراطورية.',
  },

  // 9. Megaprojects Ministry
  {
    id: 'megaprojects',
    titleAr: 'وزارة المشاريع القومية',
    badgeAr: 'المناقصات ونفوذ الدولة 🏛️',
    districtId: 'district_government',
    icon: '🏛️',
    accentColor: '#3b82f6',
    badgeBgColor: 'rgba(59, 130, 246, 0.25)',
    coordinates: { x: 52, z: -45 },
    labelHeight: 22,
    sectionId: 'megaprojects',
    descriptionAr: 'المناقصات الحكومية الكبرى، محطات الطاقة وسدود وموانئ الدولة مع تخفيضات ضريبية.',
  },

  // 10. Territory Citadel
  {
    id: 'territory',
    titleAr: 'قلعة النفوذ الإقليمي',
    badgeAr: 'السيطرة والتوسع الجغرافي 🗺️',
    districtId: 'district_government',
    icon: '🗺️',
    accentColor: '#f97316',
    badgeBgColor: 'rgba(249, 115, 22, 0.25)',
    coordinates: { x: 20, z: -52 },
    labelHeight: 20,
    sectionId: 'territory',
    descriptionAr: 'خريطة السيطرة الإقليمية، النفوذ التجاري في المحافظات، وتحصيل العوائد الجغرافية.',
  },

  // 11. Cartel Bastion
  {
    id: 'cartel',
    titleAr: 'معقل الكارتيل والتحالفات',
    badgeAr: 'حروب الأسعار والتكتلات ⚔️',
    districtId: 'district_government',
    icon: '⚔️',
    accentColor: '#ef4444',
    badgeBgColor: 'rgba(239, 68, 68, 0.25)',
    coordinates: { x: 52, z: -18 },
    labelHeight: 20,
    sectionId: 'cartel',
    descriptionAr: 'تكتلات الكارتيل التجارية، التحالفات بين كبار التجار، وغارات الأسعار التنافسية.',
  },

  // 12. Maritime Port
  {
    id: 'maritime',
    titleAr: 'الميناء الملاحي والأسطول',
    badgeAr: 'التجارة البحرية الدولية 🚢',
    districtId: 'district_maritime_industrial',
    icon: '🚢',
    accentColor: '#0284c7',
    badgeBgColor: 'rgba(2, 132, 199, 0.25)',
    coordinates: { x: 74, z: 32 },
    labelHeight: 20,
    sectionId: 'maritime',
    descriptionAr: 'أساطيل الشحن البحري، خطوط التجارة الملاحية العالمية، وتصدير البضائع للموانئ الدولية.',
  },

  // 13. Mega Factory Complex
  {
    id: 'factory',
    titleAr: 'مجمع المصانع والإنتاج',
    badgeAr: 'خطوط الإنتاج والتصنيع 🏭',
    districtId: 'district_maritime_industrial',
    icon: '🏭',
    accentColor: '#f97316',
    badgeBgColor: 'rgba(249, 115, 22, 0.25)',
    coordinates: { x: 45, z: 52 },
    labelHeight: 20,
    sectionId: 'production',
    descriptionAr: 'مجمع المصانع الكبرى لتشغيل خطوط التصنيع، صيانة المعدات، ومضاعفة الإنتاجية.',
  },

  // 14. Logistics & Warehouse Hub
  {
    id: 'warehouse_hub',
    titleAr: 'مركز الخدمات اللوجستية',
    badgeAr: 'المستودعات وسوق السلع 📦',
    districtId: 'district_maritime_industrial',
    icon: '📦',
    accentColor: '#10b981',
    badgeBgColor: 'rgba(16, 185, 129, 0.25)',
    coordinates: { x: 45, z: 18 },
    labelHeight: 18,
    sectionId: 'inventory',
    descriptionAr: 'تخزين المواد الخام، بيع المنتجات الجاهزة، وإدارة شحنات البضائع والتوريد السريع.',
  },

  // 15. Grand Auction Arena
  {
    id: 'auctions',
    titleAr: 'دار المزادات الإمبراطورية',
    badgeAr: 'المزادات الحية والأصول ⚖️',
    districtId: 'district_trade_commerce',
    icon: '⚖️',
    accentColor: '#eab308',
    badgeBgColor: 'rgba(234, 179, 8, 0.25)',
    coordinates: { x: -52, z: 22 },
    labelHeight: 20,
    sectionId: 'auctions',
    descriptionAr: 'المزادات الحية لاقتناص الأراضي النادرة، الشركات المتعثرة، والصفقات الذهبية.',
  },

  // 16. International Contracts Pavilion
  {
    id: 'contracts_pavilion',
    titleAr: 'مقر العقود والاتفاقيات',
    badgeAr: 'عقود التوريد والعملاء 💼',
    districtId: 'district_trade_commerce',
    icon: '💼',
    accentColor: '#06b6d4',
    badgeBgColor: 'rgba(6, 182, 212, 0.25)',
    coordinates: { x: -52, z: 54 },
    labelHeight: 18,
    sectionId: 'contracts',
    descriptionAr: 'إبرام عقود التوريد للشركات الكبرى، كسب ثقة السوق وبناء السمعة التجارية الدولية.',
  },

  // 17. Lucky Wheel Casino
  {
    id: 'lucky_wheel',
    titleAr: 'كازينو عجلة الحظ اليومية',
    badgeAr: 'عجلة الحظ والجوائز 🎡',
    districtId: 'district_trade_commerce',
    icon: '🎡',
    accentColor: '#f43f5e',
    badgeBgColor: 'rgba(244, 63, 94, 0.25)',
    coordinates: { x: -20, z: 48 },
    labelHeight: 18,
    descriptionAr: 'عجلة الحظ الدوارة اليومية للفوز بالماس، النقد، والبطاقات السحرية.',
  },

  // 18. Missions & Hall of Fame Monument
  {
    id: 'tasks_monument',
    titleAr: 'صرح المهام والشرف',
    badgeAr: 'المهام والإنجازات 🏆',
    districtId: 'district_trade_commerce',
    icon: '🏆',
    accentColor: '#eab308',
    badgeBgColor: 'rgba(234, 179, 8, 0.25)',
    coordinates: { x: 0, z: 52 },
    labelHeight: 20,
    sectionId: 'tasks',
    descriptionAr: 'سجل المهام اليومية، التحديات الاقتصادية، وشارات الشرف للمليارديرات.',
  },

  // 19. Luxury Waterfront Palace & Marina
  {
    id: 'luxury_club',
    titleAr: 'نادي المليارديرات والرفاهية',
    badgeAr: 'الهيبة واليخوت الفارهة 🛥️',
    districtId: 'district_luxury_coast',
    icon: '🛥️',
    accentColor: '#ec4899',
    badgeBgColor: 'rgba(236, 72, 153, 0.25)',
    coordinates: { x: -74, z: 32 },
    labelHeight: 20,
    sectionId: 'luxury',
    descriptionAr: 'أصول الهيبة والرفاهية، السيارات الفارهة، اليخوت الخاصة، وقصور النخبة.',
  },

  // 20. Prestige Consulate
  {
    id: 'prestige_consulate',
    titleAr: 'قنصلية التوسع الدولي',
    badgeAr: 'إعادة الهيكلة والهيبة 🌐',
    districtId: 'district_downtown',
    icon: '🌐',
    accentColor: '#8b5cf6',
    badgeBgColor: 'rgba(139, 92, 246, 0.25)',
    coordinates: { x: 0, z: -28 },
    labelHeight: 18,
    descriptionAr: 'إعادة الهيكلة الإمبراطورية (Prestige) لفتح قارات وأسواق عالمية ومضاعفة الأرباح.',
  },
];

export const CITY_WORLD_CONFIG = {
  worldRadius: 130,
  groundSize: 320,
  districts: [
    {
      id: 'district_downtown',
      name: 'حي المال والأعمال والسيادة',
      code: 'DT',
      theme: DISTRICT_VISUAL_THEMES.district_downtown,
      centerCoordinates: { x: 0, z: 0 },
      boundaryRadius: 36,
      recommendedCategory: 'headquarters' as CityFacilityCategory,
      descriptionAr: 'المركز التجاري والسيادي الرئيسي للإمبراطورية يضم المقر، البورصة، والبنك المركزي.',
    },
    {
      id: 'district_tech_valley',
      name: 'وادي التكنولوجيا ورأس المال الجريء',
      code: 'TECH',
      theme: DISTRICT_VISUAL_THEMES.district_tech_valley,
      centerCoordinates: { x: -40, z: -40 },
      boundaryRadius: 38,
      recommendedCategory: 'tech_hub' as CityFacilityCategory,
      descriptionAr: 'حاضنات الأعمال المتقدمة ومختبرات البحث والأتمتة وخزينة الماس.',
    },
    {
      id: 'district_government',
      name: 'المنطقة السيادية والحكومية',
      code: 'GOV',
      theme: DISTRICT_VISUAL_THEMES.district_government,
      centerCoordinates: { x: 40, z: -40 },
      boundaryRadius: 38,
      recommendedCategory: 'megaprojects' as CityFacilityCategory,
      descriptionAr: 'المشاريع القومية العملاقة، قلاع النفوذ الإقليمي، وتحالفات الكارتيل الكبرى.',
    },
    {
      id: 'district_maritime_industrial',
      name: 'الميناء البحري والمجمع الصناعي',
      code: 'IND',
      theme: DISTRICT_VISUAL_THEMES.district_maritime_industrial,
      centerCoordinates: { x: 55, z: 35 },
      boundaryRadius: 42,
      recommendedCategory: 'maritime_port' as CityFacilityCategory,
      descriptionAr: 'الميناء الملاحي العملاق، أساطيل الشحن، مجمع المصانع، والمستودعات المركزية.',
    },
    {
      id: 'district_trade_commerce',
      name: 'حي التجارة الحرة والمزادات',
      code: 'TRADE',
      theme: DISTRICT_VISUAL_THEMES.district_trade_commerce,
      centerCoordinates: { x: -40, z: 40 },
      boundaryRadius: 40,
      recommendedCategory: 'auction_arena' as CityFacilityCategory,
      descriptionAr: 'دار المزادات الحية، صفقات العقود الدولية، كازينو عجلة الحظ، وصرح الإنجازات.',
    },
    {
      id: 'district_luxury_coast',
      name: 'ساحل الرفاهية ونادي المليارديرات',
      code: 'LUX',
      theme: DISTRICT_VISUAL_THEMES.district_luxury_coast,
      centerCoordinates: { x: -65, z: 30 },
      boundaryRadius: 35,
      recommendedCategory: 'luxury_palace' as CityFacilityCategory,
      descriptionAr: 'شواطئ النخبة، اليخوت الفارهة، والقصور الخاصة بنقاط الهيبة الملكية.',
    },
  ],
};

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
