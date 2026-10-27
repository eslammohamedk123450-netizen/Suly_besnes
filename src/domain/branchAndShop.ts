/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { IndustryId } from './countries';

export type RetailShopType = 'groceries' | 'detergents' | 'electronics' | 'building_materials';

export interface RetailShopItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  retailPrice: number;
  totalSold: number;
  totalRevenue: number;
}

export interface RetailShop {
  id: string; // Unique permanent ID, e.g. 'shop-1718000000000'
  name: string; // e.g. "سوبرماركت النيل الذهبي"
  shopType: RetailShopType;
  companyId?: string; // Optional link to parent company
  parentCompanyName?: string;
  plotId: string; // 3D city plot slot
  landId: string; // Associated land parcel ID
  level: number; // 1 to 5
  status: 'active' | 'constructing' | 'maintenance' | 'closed';
  shelfCapacity: number; // e.g., level 1 = 150 units, level 2 = 300, etc.
  inventory: RetailShopItem[]; // Goods on store shelves ready for retail customers
  linkedFactoryIds: string[]; // Factories supplying this retail store
  establishedOnDay: number;
  establishedAt: string;
  dailyOperatingCost: number;
  performance: {
    totalSalesRevenue: number;
    totalCostOfGoods: number;
    totalProfit: number;
    totalUnitsSold: number;
  };
}

export interface CompanyBranch {
  id: string; // Unique permanent ID, e.g. 'branch-comp-1'
  companyId: string; // Required link to parent company
  parentCompanyName: string;
  name: string; // e.g. "فرع وسط البلد - شركة مصر للتصنيع"
  industryId: IndustryId;
  plotId: string; // 3D city plot slot
  landId: string; // Associated land parcel ID
  level: number; // 1 to 5
  status: 'active' | 'constructing' | 'maintenance' | 'closed';
  establishedOnDay: number;
  establishedAt: string;
  dailyOperatingCost: number;
  revenueBonusRate: number; // e.g. 0.10 (+10% boost to parent company or production efficiency)
  managerStaffId?: string;
  performance: {
    totalRevenue: number;
    totalExpenses: number;
    totalOrdersServed: number;
  };
}

export interface RetailShopTypeSpec {
  type: RetailShopType;
  title: string;
  description: string;
  iconName: string;
  setupCost: number;
  diamondsCost: number;
  requiredPlayerLevel: number;
  compatibleIndustries: readonly IndustryId[];
  compatibleProductIds: readonly string[];
  themeColor: string;
  accentColor: string;
  shelfBaseCapacity: number;
  retailMarkup: number; // e.g. 1.25 (+25% over base wholesale price)
}

export const RETAIL_SHOP_SPECS: readonly RetailShopTypeSpec[] = [
  {
    type: 'groceries',
    title: 'سوبرماركت وتموينات غذائية',
    description: 'منفذ بيع تجزئة متخصص في بيع السلع والعبوات الغذائية والمياه النظيفة للمواطنين.',
    iconName: 'ShoppingBag',
    setupCost: 8500,
    diamondsCost: 6,
    requiredPlayerLevel: 1,
    compatibleIndustries: ['food', 'water'],
    compatibleProductIds: ['food-pack', 'clean-water'],
    themeColor: '#10b981',
    accentColor: '#059669',
    shelfBaseCapacity: 200,
    retailMarkup: 1.25,
  },
  {
    type: 'detergents',
    title: 'متجر المنظفات ومستحضرات العناية',
    description: 'متجر تجزئة لبيع المنظفات المنزلية والصناعية ومستلزمات النظافة والتعقيم.',
    iconName: 'Sparkles',
    setupCost: 9200,
    diamondsCost: 7,
    requiredPlayerLevel: 1,
    compatibleIndustries: ['detergents'],
    compatibleProductIds: ['detergent'],
    themeColor: '#06b6d4',
    accentColor: '#0891b2',
    shelfBaseCapacity: 180,
    retailMarkup: 1.28,
  },
  {
    type: 'electronics',
    title: 'معرض الإلكترونيات والأجهزة الذكية',
    description: 'صالة عرض فاخرة لبيع الحواسيب، الأجهزة الإلكترونية الاستهلاكية ومعدات التقنية.',
    iconName: 'Cpu',
    setupCost: 18000,
    diamondsCost: 12,
    requiredPlayerLevel: 2,
    compatibleIndustries: ['electronics'],
    compatibleProductIds: ['electronics'],
    themeColor: '#8b5cf6',
    accentColor: '#7c3aed',
    shelfBaseCapacity: 100,
    retailMarkup: 1.35,
  },
  {
    type: 'building_materials',
    title: 'معرض ومستودع مواد البناء والتجهيزات',
    description: 'مركز توزيع ومبيعات تجزئة لأسمنت، حديد، بلوكات مواد البناء الجاهزة لشركات المقاولات.',
    iconName: 'Hammer',
    setupCost: 14000,
    diamondsCost: 10,
    requiredPlayerLevel: 2,
    compatibleIndustries: ['construction'],
    compatibleProductIds: ['building-blocks'],
    themeColor: '#f59e0b',
    accentColor: '#d97706',
    shelfBaseCapacity: 150,
    retailMarkup: 1.26,
  },
];

export function findShopSpec(type: RetailShopType): RetailShopTypeSpec | undefined {
  return RETAIL_SHOP_SPECS.find((spec) => spec.type === type);
}

export function getBranchSpecs(level: number): {
  setupCost: number;
  diamondsCost: number;
  dailyOperatingCost: number;
  bonusRate: number;
  requiredPlayerLevel: number;
} {
  const safeLvl = Math.max(1, Math.min(5, level));
  return {
    setupCost: 10000 + safeLvl * 5000,
    diamondsCost: 8 + safeLvl * 3,
    dailyOperatingCost: 150 + safeLvl * 75,
    bonusRate: safeLvl * 0.08, // +8% per level
    requiredPlayerLevel: safeLvl,
  };
}
