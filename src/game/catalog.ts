import type { IndustryId } from '../domain/countries';
import type { AuctionListing } from '../domain/futureSystems';

export interface IndustryCatalogEntry {
  id: IndustryId;
  name: string;
  requiredLandType: 'industrial' | 'agricultural' | 'commercial';
  setupFee: number;
  licenseFee: number;
  dailyOperatingCost: number;
  energyCapacity: number;
  dailyEnergySupply: number;
}

export interface MaterialCatalogEntry {
  id: string;
  name: string;
  unit: string;
  pricePerUnit: number;
  storageLimit: number;
}

export interface RecipeInput {
  materialId: string;
  quantity: number;
}

export interface RecipeCatalogEntry {
  id: string;
  industryId: IndustryId;
  productId: string;
  productName: string;
  outputQuantity: number;
  outputUnit: string;
  inputs: readonly RecipeInput[];
  energyUnits: number;
  energyCost: number;
  baseSellPrice: number;
}

export interface ProductCatalogEntry {
  id: string;
  name: string;
  unit: string;
  baseSellPrice: number;
}

export interface InvestmentCatalogEntry {
  id: string;
  name: string;
  minimumAmount: number;
  maximumAmount: number;
  durationDays: number;
  returnRate: number;
  riskRate: number;
}

export interface DirectLandListing {
  id: string;
  label: string;
  landType: 'industrial' | 'agricultural' | 'commercial';
  areaSquareMeters: number;
  price: number;
}

export interface DirectCompanyListing {
  id: string;
  name: string;
  industryId: IndustryId;
  landType: 'industrial' | 'agricultural' | 'commercial';
  areaSquareMeters: number;
  price: number;
}

export type TaskCondition =
  | 'own-land'
  | 'own-company'
  | 'buy-material'
  | 'run-production'
  | 'sell-product'
  | 'make-investment'
  | 'reach-day-3';

export interface TaskCatalogEntry {
  id: string;
  title: string;
  description: string;
  condition: TaskCondition;
  reward: number;
}

export const INDUSTRY_CATALOG: readonly IndustryCatalogEntry[] = [
  { id: 'petroleum', name: 'البترول', requiredLandType: 'industrial', setupFee: 75_000, licenseFee: 140_000, dailyOperatingCost: 18_000, energyCapacity: 80, dailyEnergySupply: 42 },
  { id: 'electricity', name: 'الكهرباء', requiredLandType: 'industrial', setupFee: 75_000, licenseFee: 105_000, dailyOperatingCost: 16_000, energyCapacity: 100, dailyEnergySupply: 55 },
  { id: 'gas', name: 'الغاز', requiredLandType: 'industrial', setupFee: 75_000, licenseFee: 120_000, dailyOperatingCost: 15_000, energyCapacity: 80, dailyEnergySupply: 46 },
  { id: 'water', name: 'المياه', requiredLandType: 'industrial', setupFee: 75_000, licenseFee: 90_000, dailyOperatingCost: 11_000, energyCapacity: 70, dailyEnergySupply: 40 },
  { id: 'detergents', name: 'المنظفات', requiredLandType: 'industrial', setupFee: 75_000, licenseFee: 55_000, dailyOperatingCost: 7_000, energyCapacity: 60, dailyEnergySupply: 36 },
  { id: 'food', name: 'الأغذية', requiredLandType: 'agricultural', setupFee: 75_000, licenseFee: 45_000, dailyOperatingCost: 6_000, energyCapacity: 60, dailyEnergySupply: 34 },
  { id: 'construction', name: 'مواد البناء', requiredLandType: 'industrial', setupFee: 75_000, licenseFee: 65_000, dailyOperatingCost: 9_000, energyCapacity: 75, dailyEnergySupply: 40 },
  { id: 'electronics', name: 'الإلكترونيات', requiredLandType: 'commercial', setupFee: 75_000, licenseFee: 85_000, dailyOperatingCost: 10_000, energyCapacity: 75, dailyEnergySupply: 40 },
  { id: 'transport', name: 'النقل', requiredLandType: 'commercial', setupFee: 75_000, licenseFee: 50_000, dailyOperatingCost: 8_000, energyCapacity: 70, dailyEnergySupply: 42 },
];

export const MATERIAL_CATALOG: readonly MaterialCatalogEntry[] = [
  { id: 'crude-oil', name: 'خام النفط', unit: 'برميل', pricePerUnit: 4_000, storageLimit: 500 },
  { id: 'natural-gas', name: 'الغاز الطبيعي', unit: 'وحدة', pricePerUnit: 3_000, storageLimit: 500 },
  { id: 'water', name: 'مياه معالجة', unit: 'وحدة', pricePerUnit: 250, storageLimit: 2_000 },
  { id: 'chemicals', name: 'مركبات كيميائية', unit: 'كجم', pricePerUnit: 1_200, storageLimit: 800 },
  { id: 'grain', name: 'حبوب', unit: 'كجم', pricePerUnit: 500, storageLimit: 1_000 },
  { id: 'steel', name: 'فولاذ', unit: 'طن', pricePerUnit: 8_000, storageLimit: 400 },
  { id: 'cement', name: 'أسمنت', unit: 'طن', pricePerUnit: 2_000, storageLimit: 800 },
  { id: 'silicon', name: 'رقائق سيليكون', unit: 'وحدة', pricePerUnit: 10_000, storageLimit: 250 },
  { id: 'fuel', name: 'وقود تشغيل', unit: 'وحدة', pricePerUnit: 2_500, storageLimit: 500 },
  { id: 'components', name: 'مكونات ميكانيكية', unit: 'وحدة', pricePerUnit: 6_000, storageLimit: 300 },
  { id: 'packaging', name: 'مواد تغليف', unit: 'وحدة', pricePerUnit: 350, storageLimit: 1_000 },
];

export const PRODUCT_CATALOG: readonly ProductCatalogEntry[] = [
  { id: 'refined-fuel', name: 'وقود مكرر', unit: 'وحدة', baseSellPrice: 14_000 },
  { id: 'power-units', name: 'وحدات كهرباء', unit: 'وحدة', baseSellPrice: 3_000 },
  { id: 'bottled-gas', name: 'غاز معبأ', unit: 'وحدة', baseSellPrice: 10_000 },
  { id: 'clean-water', name: 'مياه نظيفة', unit: 'وحدة', baseSellPrice: 2_000 },
  { id: 'detergent', name: 'منظفات', unit: 'عبوة', baseSellPrice: 4_000 },
  { id: 'food-pack', name: 'عبوات غذائية', unit: 'عبوة', baseSellPrice: 2_500 },
  { id: 'building-blocks', name: 'مواد بناء', unit: 'وحدة', baseSellPrice: 16_000 },
  { id: 'electronics', name: 'أجهزة إلكترونية', unit: 'جهاز', baseSellPrice: 45_000 },
  { id: 'freight-service', name: 'خدمات نقل', unit: 'رحلة', baseSellPrice: 22_000 },
];

export const RECIPE_CATALOG: readonly RecipeCatalogEntry[] = [
  { id: 'recipe-petroleum', industryId: 'petroleum', productId: 'refined-fuel', productName: 'وقود مكرر', outputQuantity: 4, outputUnit: 'وحدة', inputs: [{ materialId: 'crude-oil', quantity: 5 }], energyUnits: 10, energyCost: 1_500, baseSellPrice: 14_000 },
  { id: 'recipe-electricity', industryId: 'electricity', productId: 'power-units', productName: 'وحدات كهرباء', outputQuantity: 12, outputUnit: 'وحدة', inputs: [{ materialId: 'fuel', quantity: 2 }], energyUnits: 18, energyCost: 1_000, baseSellPrice: 3_000 },
  { id: 'recipe-gas', industryId: 'gas', productId: 'bottled-gas', productName: 'غاز معبأ', outputQuantity: 3, outputUnit: 'وحدة', inputs: [{ materialId: 'natural-gas', quantity: 4 }], energyUnits: 8, energyCost: 1_200, baseSellPrice: 10_000 },
  { id: 'recipe-water', industryId: 'water', productId: 'clean-water', productName: 'مياه نظيفة', outputQuantity: 12, outputUnit: 'وحدة', inputs: [{ materialId: 'water', quantity: 8 }], energyUnits: 6, energyCost: 700, baseSellPrice: 2_000 },
  { id: 'recipe-detergents', industryId: 'detergents', productId: 'detergent', productName: 'منظفات', outputQuantity: 5, outputUnit: 'عبوة', inputs: [{ materialId: 'chemicals', quantity: 2 }, { materialId: 'water', quantity: 2 }], energyUnits: 5, energyCost: 600, baseSellPrice: 4_000 },
  { id: 'recipe-food', industryId: 'food', productId: 'food-pack', productName: 'عبوات غذائية', outputQuantity: 8, outputUnit: 'عبوة', inputs: [{ materialId: 'grain', quantity: 4 }, { materialId: 'packaging', quantity: 1 }], energyUnits: 6, energyCost: 550, baseSellPrice: 2_500 },
  { id: 'recipe-construction', industryId: 'construction', productId: 'building-blocks', productName: 'مواد بناء', outputQuantity: 4, outputUnit: 'وحدة', inputs: [{ materialId: 'steel', quantity: 2 }, { materialId: 'cement', quantity: 4 }], energyUnits: 10, energyCost: 1_000, baseSellPrice: 16_000 },
  { id: 'recipe-electronics', industryId: 'electronics', productId: 'electronics', productName: 'أجهزة إلكترونية', outputQuantity: 1, outputUnit: 'جهاز', inputs: [{ materialId: 'silicon', quantity: 1 }, { materialId: 'components', quantity: 2 }], energyUnits: 12, energyCost: 1_400, baseSellPrice: 45_000 },
  { id: 'recipe-transport', industryId: 'transport', productId: 'freight-service', productName: 'خدمات نقل', outputQuantity: 2, outputUnit: 'رحلة', inputs: [{ materialId: 'fuel', quantity: 3 }, { materialId: 'components', quantity: 1 }], energyUnits: 14, energyCost: 900, baseSellPrice: 22_000 },
];

export const AUCTION_CATALOG: readonly AuctionListing[] = [
  { id: 'land-cairo-industrial', countryId: 'egypt', lotType: 'land', label: 'قطعة القاهرة الصناعية', landType: 'industrial', areaSquareMeters: 400, minimumBid: 160_000, bidIncrement: 10_000, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
  { id: 'land-alexandria-farm', countryId: 'egypt', lotType: 'land', label: 'أرض الإسكندرية الزراعية', landType: 'agricultural', areaSquareMeters: 650, minimumBid: 135_000, bidIncrement: 10_000, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
  { id: 'land-suez-commerce', countryId: 'egypt', lotType: 'land', label: 'موقع السويس التجاري', landType: 'commercial', areaSquareMeters: 300, minimumBid: 210_000, bidIncrement: 15_000, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
  { id: 'factory-petroleum-expansion', countryId: 'egypt', lotType: 'factory', label: 'خط تكرير إضافي', landType: 'industrial', areaSquareMeters: 0, minimumBid: 240_000, bidIncrement: 20_000, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', energyCapacityBonus: 40 },
  { id: 'bulk-crude-oil', countryId: 'egypt', lotType: 'raw-material', label: 'شحنة خام نفط كبيرة', landType: 'industrial', areaSquareMeters: 0, minimumBid: 30_000, bidIncrement: 4_000, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', materialId: 'crude-oil', quantity: 15 },
];

export const DIRECT_LAND_CATALOG: readonly DirectLandListing[] = [
  { id: 'direct-land-port-said', label: 'أرض بورسعيد اللوجستية', landType: 'commercial', areaSquareMeters: 420, price: 285_000 },
  { id: 'direct-land-minya-farm', label: 'مزرعة المنيا الإنتاجية', landType: 'agricultural', areaSquareMeters: 900, price: 240_000 },
  { id: 'direct-land-sokhna-industrial', label: 'موقع العين السخنة الصناعي', landType: 'industrial', areaSquareMeters: 520, price: 360_000 },
];

export const DIRECT_COMPANY_CATALOG: readonly DirectCompanyListing[] = [
  { id: 'direct-company-food', name: 'شركة النيل للمنتجات الغذائية', industryId: 'food', landType: 'agricultural', areaSquareMeters: 650, price: 430_000 },
  { id: 'direct-company-logistics', name: 'شركة الممرات اللوجستية', industryId: 'transport', landType: 'commercial', areaSquareMeters: 500, price: 520_000 },
  { id: 'direct-company-energy', name: 'شركة طاقة المستقبل', industryId: 'electricity', landType: 'industrial', areaSquareMeters: 600, price: 680_000 },
];

export const INVESTMENT_CATALOG: readonly InvestmentCatalogEntry[] = [
  { id: 'treasury-note', name: 'سند الخزينة المحلي', minimumAmount: 50_000, maximumAmount: 500_000, durationDays: 3, returnRate: 0.08, riskRate: 0 },
  { id: 'warehouse-fund', name: 'صندوق توسعة المخازن', minimumAmount: 100_000, maximumAmount: 400_000, durationDays: 5, returnRate: 0.18, riskRate: 0.08 },
];

/** Fixed, fictional in-game valuation in Egyptian pounds; never fetch a real market quote. */
export const GOLD_PRICE_PER_GRAM = 6_000;

export const TASK_CATALOG: readonly TaskCatalogEntry[] = [
  { id: 'task-first-land', title: 'أول ملكية', description: 'امتلك قطعة أرض واحدة.', condition: 'own-land', reward: 25_000 },
  { id: 'task-first-company', title: 'تأسيس الإمبراطورية', description: 'أسس شركتك الأولى.', condition: 'own-company', reward: 35_000 },
  { id: 'task-first-material', title: 'المخزن الأول', description: 'اشترِ مادة خام.', condition: 'buy-material', reward: 10_000 },
  { id: 'task-first-production', title: 'خط الإنتاج', description: 'شغّل دفعة إنتاج.', condition: 'run-production', reward: 30_000 },
  { id: 'task-first-sale', title: 'أول عملية بيع', description: 'بع منتجًا تملكه.', condition: 'sell-product', reward: 20_000 },
  { id: 'task-first-investment', title: 'تنويع رأس المال', description: 'أنشئ استثمارًا.', condition: 'make-investment', reward: 20_000 },
  { id: 'task-day-three', title: 'ثلاثة أيام', description: 'مرّر ثلاثة أيام في العالم.', condition: 'reach-day-3', reward: 40_000 },
];

export function findIndustry(industryId: IndustryId): IndustryCatalogEntry | undefined {
  return INDUSTRY_CATALOG.find((entry) => entry.id === industryId);
}

export function findMaterial(materialId: string): MaterialCatalogEntry | undefined {
  return MATERIAL_CATALOG.find((entry) => entry.id === materialId);
}

export function findRecipeForIndustry(industryId: IndustryId): RecipeCatalogEntry | undefined {
  return RECIPE_CATALOG.find((entry) => entry.industryId === industryId);
}

export function findRecipeForProduct(productId: string): RecipeCatalogEntry | undefined {
  return RECIPE_CATALOG.find((entry) => entry.productId === productId);
}

export function findInvestment(investmentId: string): InvestmentCatalogEntry | undefined {
  return INVESTMENT_CATALOG.find((entry) => entry.id === investmentId);
}
