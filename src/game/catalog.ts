import type { CountryId, IndustryId } from '../domain/countries';
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
  storageLimit: number;
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

export type TaskPath = 'operations' | 'trade' | 'management' | 'finance' | 'expansion' | 'mastery';

export interface TaskCatalogEntry {
  id: string;
  title: string;
  description: string;
  condition: TaskCondition;
  reward: number;
  path: TaskPath;
  actionSection: string;
  progressTarget: number;
}

export const INDUSTRY_CATALOG: readonly IndustryCatalogEntry[] = [
  { id: 'petroleum', name: 'البترول والطاقة', requiredLandType: 'industrial', setupFee: 2_000, licenseFee: 3_500, dailyOperatingCost: 360, energyCapacity: 80, dailyEnergySupply: 42 },
  { id: 'electricity', name: 'الكهرباء', requiredLandType: 'industrial', setupFee: 2_000, licenseFee: 2_600, dailyOperatingCost: 320, energyCapacity: 100, dailyEnergySupply: 55 },
  { id: 'gas', name: 'الغاز الطبيعي', requiredLandType: 'industrial', setupFee: 2_000, licenseFee: 3_000, dailyOperatingCost: 300, energyCapacity: 80, dailyEnergySupply: 46 },
  { id: 'water', name: 'المياه', requiredLandType: 'industrial', setupFee: 2_000, licenseFee: 2_200, dailyOperatingCost: 220, energyCapacity: 70, dailyEnergySupply: 40 },
  { id: 'detergents', name: 'المنظفات والكيماويات', requiredLandType: 'industrial', setupFee: 2_000, licenseFee: 1_400, dailyOperatingCost: 140, energyCapacity: 60, dailyEnergySupply: 36 },
  { id: 'food', name: 'الأغذية والزراعة', requiredLandType: 'agricultural', setupFee: 2_000, licenseFee: 1_200, dailyOperatingCost: 120, energyCapacity: 60, dailyEnergySupply: 34 },
  { id: 'construction', name: 'مواد البناء والتعمير', requiredLandType: 'industrial', setupFee: 2_000, licenseFee: 1_800, dailyOperatingCost: 180, energyCapacity: 75, dailyEnergySupply: 40 },
  { id: 'electronics', name: 'الإلكترونيات والتقنية', requiredLandType: 'commercial', setupFee: 2_000, licenseFee: 2_400, dailyOperatingCost: 200, energyCapacity: 75, dailyEnergySupply: 40 },
  { id: 'transport', name: 'النقل واللوجستيات', requiredLandType: 'commercial', setupFee: 2_000, licenseFee: 1_500, dailyOperatingCost: 160, energyCapacity: 70, dailyEnergySupply: 42 },
];

export const MATERIAL_CATALOG: readonly MaterialCatalogEntry[] = [
  { id: 'crude-oil', name: 'خام النفط', unit: 'برميل', pricePerUnit: 80, storageLimit: 500 },
  { id: 'natural-gas', name: 'الغاز الطبيعي', unit: 'وحدة', pricePerUnit: 60, storageLimit: 500 },
  { id: 'water', name: 'مياه معالجة', unit: 'وحدة', pricePerUnit: 5, storageLimit: 2_000 },
  { id: 'chemicals', name: 'مركبات كيميائية', unit: 'كجم', pricePerUnit: 24, storageLimit: 800 },
  { id: 'grain', name: 'حبوب زراعية', unit: 'كجم', pricePerUnit: 10, storageLimit: 1_000 },
  { id: 'steel', name: 'فولاذ صناعي', unit: 'طن', pricePerUnit: 160, storageLimit: 400 },
  { id: 'cement', name: 'أسمنت', unit: 'طن', pricePerUnit: 40, storageLimit: 800 },
  { id: 'silicon', name: 'رقائق سيليكون', unit: 'وحدة', pricePerUnit: 200, storageLimit: 250 },
  { id: 'fuel', name: 'وقود تشغيل', unit: 'وحدة', pricePerUnit: 50, storageLimit: 500 },
  { id: 'components', name: 'مكونات ميكانيكية', unit: 'وحدة', pricePerUnit: 120, storageLimit: 300 },
  { id: 'packaging', name: 'مواد تغليف', unit: 'وحدة', pricePerUnit: 7, storageLimit: 1_000 },
];

export const PRODUCT_CATALOG: readonly ProductCatalogEntry[] = [
  { id: 'refined-fuel', name: 'وقود مكرر', unit: 'وحدة', baseSellPrice: 280, storageLimit: 500 },
  { id: 'power-units', name: 'وحدات كهرباء', unit: 'وحدة', baseSellPrice: 60, storageLimit: 1_000 },
  { id: 'bottled-gas', name: 'غاز معبأ', unit: 'وحدة', baseSellPrice: 200, storageLimit: 500 },
  { id: 'clean-water', name: 'مياه نظيفة', unit: 'وحدة', baseSellPrice: 40, storageLimit: 2_000 },
  { id: 'detergent', name: 'منظفات تجارية', unit: 'عبوة', baseSellPrice: 80, storageLimit: 800 },
  { id: 'food-pack', name: 'عبوات غذائية', unit: 'عبوة', baseSellPrice: 50, storageLimit: 1_000 },
  { id: 'building-blocks', name: 'مواد بناء مجهزة', unit: 'وحدة', baseSellPrice: 320, storageLimit: 500 },
  { id: 'electronics', name: 'أجهزة إلكترونية', unit: 'جهاز', baseSellPrice: 900, storageLimit: 250 },
  { id: 'freight-service', name: 'خدمات نقل بحري/بري', unit: 'رحلة', baseSellPrice: 440, storageLimit: 300 },
];

export const RECIPE_CATALOG: readonly RecipeCatalogEntry[] = [
  { id: 'recipe-petroleum', industryId: 'petroleum', productId: 'refined-fuel', productName: 'وقود مكرر', outputQuantity: 4, outputUnit: 'وحدة', inputs: [{ materialId: 'crude-oil', quantity: 5 }], energyUnits: 10, energyCost: 30, baseSellPrice: 280 },
  { id: 'recipe-electricity', industryId: 'electricity', productId: 'power-units', productName: 'وحدات كهرباء', outputQuantity: 12, outputUnit: 'وحدة', inputs: [{ materialId: 'fuel', quantity: 2 }], energyUnits: 18, energyCost: 20, baseSellPrice: 60 },
  { id: 'recipe-gas', industryId: 'gas', productId: 'bottled-gas', productName: 'غاز معبأ', outputQuantity: 3, outputUnit: 'وحدة', inputs: [{ materialId: 'natural-gas', quantity: 4 }], energyUnits: 8, energyCost: 24, baseSellPrice: 200 },
  { id: 'recipe-water', industryId: 'water', productId: 'clean-water', productName: 'مياه نظيفة', outputQuantity: 12, outputUnit: 'وحدة', inputs: [{ materialId: 'water', quantity: 8 }], energyUnits: 6, energyCost: 14, baseSellPrice: 40 },
  { id: 'recipe-detergents', industryId: 'detergents', productId: 'detergent', productName: 'منظفات تجارية', outputQuantity: 5, outputUnit: 'عبوة', inputs: [{ materialId: 'chemicals', quantity: 2 }, { materialId: 'water', quantity: 2 }], energyUnits: 5, energyCost: 12, baseSellPrice: 80 },
  { id: 'recipe-food', industryId: 'food', productId: 'food-pack', productName: 'عبوات غذائية', outputQuantity: 8, outputUnit: 'عبوة', inputs: [{ materialId: 'grain', quantity: 4 }, { materialId: 'packaging', quantity: 1 }], energyUnits: 6, energyCost: 11, baseSellPrice: 50 },
  { id: 'recipe-construction', industryId: 'construction', productId: 'building-blocks', productName: 'مواد بناء مجهزة', outputQuantity: 4, outputUnit: 'وحدة', inputs: [{ materialId: 'steel', quantity: 2 }, { materialId: 'cement', quantity: 4 }], energyUnits: 10, energyCost: 20, baseSellPrice: 320 },
  { id: 'recipe-electronics', industryId: 'electronics', productId: 'electronics', productName: 'أجهزة إلكترونية', outputQuantity: 1, outputUnit: 'جهاز', inputs: [{ materialId: 'silicon', quantity: 1 }, { materialId: 'components', quantity: 2 }], energyUnits: 12, energyCost: 28, baseSellPrice: 900 },
  { id: 'recipe-transport', industryId: 'transport', productId: 'freight-service', productName: 'خدمات نقل بحري/بري', outputQuantity: 2, outputUnit: 'رحلة', inputs: [{ materialId: 'fuel', quantity: 3 }, { materialId: 'components', quantity: 1 }], energyUnits: 14, energyCost: 18, baseSellPrice: 440 },
];

/** Gold price fixed at exactly $110 USD per gram */
export const GOLD_PRICE_PER_GRAM = 110;

export const TASK_CATALOG: readonly TaskCatalogEntry[] = [
  { id: 'task-first-land', title: 'أول ملكية', description: 'امتلك قطعة أرض استثمارية واحدة.', condition: 'own-land', reward: 500, path: 'expansion', actionSection: 'lands', progressTarget: 1 },
  { id: 'task-first-company', title: 'تأسيس الإمبراطورية', description: 'أسس شركتك الأولى.', condition: 'own-company', reward: 700, path: 'expansion', actionSection: 'companies', progressTarget: 1 },
  { id: 'task-first-material', title: 'المخزن الأول', description: 'اشترِ دفعة مواد خام.', condition: 'buy-material', reward: 200, path: 'trade', actionSection: 'inventory', progressTarget: 1 },
  { id: 'task-first-production', title: 'خط الإنتاج', description: 'شغّل دفعة إنتاج بنجاح.', condition: 'run-production', reward: 600, path: 'operations', actionSection: 'production', progressTarget: 1 },
  { id: 'task-first-sale', title: 'أول صفقة بيع', description: 'بع منتجًا تملكه في السوق.', condition: 'sell-product', reward: 400, path: 'trade', actionSection: 'contracts', progressTarget: 1 },
  { id: 'task-first-investment', title: 'تنويع رأس المال', description: 'أنشئ استثمارًا عائديًا.', condition: 'make-investment', reward: 400, path: 'finance', actionSection: 'investments', progressTarget: 1 },
  { id: 'task-day-three', title: 'ثلاثة أيام', description: 'مرّر ثلاثة أيام من المحاكاة بنجاح.', condition: 'reach-day-3', reward: 800, path: 'mastery', actionSection: 'reports', progressTarget: 3 },
];

export const INVESTMENT_CATALOG: readonly InvestmentCatalogEntry[] = [
  { id: 'treasury-note', name: 'سند الخزينة الحكومي', minimumAmount: 1_000, maximumAmount: 10_000, durationDays: 3, returnRate: 0.08, riskRate: 0 },
  { id: 'warehouse-fund', name: 'صندوق الاستثمار اللوجستي', minimumAmount: 2_000, maximumAmount: 15_000, durationDays: 5, returnRate: 0.18, riskRate: 0.08 },
];

// Country-specific real locations and company names. Prices are gameplay placeholders, not market quotes.
export const COUNTRY_REAL_ASSETS: Record<CountryId, {
  starterLand: string;
  directLands: readonly { id: string; label: string; landType: 'industrial' | 'agricultural' | 'commercial'; areaSquareMeters: number; price: number }[];
  directCompanies: readonly { id: string; name: string; industryId: IndustryId; landType: 'industrial' | 'agricultural' | 'commercial'; areaSquareMeters: number; price: number }[];
  auctions: readonly { id: string; lotType: 'land' | 'factory' | 'raw-material'; label: string; landType: 'industrial' | 'agricultural' | 'commercial'; areaSquareMeters: number; minimumBid: number; bidIncrement: number; closesAt: string; status: 'open' | 'closed'; materialId?: string; quantity?: number; energyCapacityBonus?: number }[];
}> = {
  egypt: {
    starterLand: 'أرض المنطقة الصناعية الأولى · العاشر من رمضان',
    directLands: [
      { id: 'real-land-egypt-1', label: 'منطقة العين السخنة الصناعية · المنطقة الاقتصادية لقناة السويس', landType: 'industrial', areaSquareMeters: 500, price: 6200 },
      { id: 'real-land-egypt-2', label: 'المنطقة الصناعية بشرق بورسعيد · SCZONE', landType: 'industrial', areaSquareMeters: 520, price: 6500 },
      { id: 'real-land-egypt-3', label: 'منطقة غرب القنطرة الصناعية · SCZONE', landType: 'commercial', areaSquareMeters: 420, price: 5300 },
      { id: 'starter-village-land', label: 'أرض المنطقة الصناعية الأولى · العاشر من رمضان', landType: 'agricultural', areaSquareMeters: 520, price: 3_600 },
      { id: 'direct-land-port-said', label: 'مجمع بورسعيد اللوجستي الحرة', landType: 'commercial', areaSquareMeters: 420, price: 5_700 },
      { id: 'direct-land-minya-farm', label: 'أرض مزارع وادي النطرون الخصبة', landType: 'agricultural', areaSquareMeters: 900, price: 4_800 },
      { id: 'direct-land-sokhna-industrial', label: 'موقع العين السخنة للبتروكيماويات', landType: 'industrial', areaSquareMeters: 520, price: 7_200 },
    ],
    directCompanies: [
      { id: 'real-company-egypt-1', name: 'Elsewedy Electric', industryId: 'electricity', landType: 'industrial', areaSquareMeters: 650, price: 17500 },
      { id: 'real-company-egypt-2', name: 'Telecom Egypt', industryId: 'electronics', landType: 'commercial', areaSquareMeters: 500, price: 20000 },
      { id: 'direct-company-food', name: 'شركة النيل للتصنيع الغذائي', industryId: 'food', landType: 'agricultural', areaSquareMeters: 650, price: 8_600 },
      { id: 'direct-company-logistics', name: 'شركة قناة السويس للخدمات اللوجستية', industryId: 'transport', landType: 'commercial', areaSquareMeters: 500, price: 10_400 },
      { id: 'direct-company-energy', name: 'مجمع مصر لتوليد وتوزيع الطاقة', industryId: 'electricity', landType: 'industrial', areaSquareMeters: 600, price: 13_600 },
    ],
    auctions: [
      { id: 'land-cairo-industrial', lotType: 'land', label: 'قطعة مدينة بدر الصناعية', landType: 'industrial', areaSquareMeters: 400, minimumBid: 3_200, bidIncrement: 200, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'land-alexandria-farm', lotType: 'land', label: 'أرض برج العرب الزراعية المروية', landType: 'agricultural', areaSquareMeters: 650, minimumBid: 2_700, bidIncrement: 200, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'land-suez-commerce', lotType: 'land', label: 'موقع السويس التجاري المطل على القناة', landType: 'commercial', areaSquareMeters: 300, minimumBid: 4_200, bidIncrement: 300, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'factory-petroleum-expansion', lotType: 'factory', label: 'خط تكرير إضافي بمجمع السخنة', landType: 'industrial', areaSquareMeters: 0, minimumBid: 4_800, bidIncrement: 400, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', energyCapacityBonus: 40 },
      { id: 'bulk-crude-oil', lotType: 'raw-material', label: 'شحنة خام نفط كبرى من حقل بلاعيم', landType: 'industrial', areaSquareMeters: 0, minimumBid: 600, bidIncrement: 80, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', materialId: 'crude-oil', quantity: 15 },
    ],
  },
  saudi: {
    starterLand: 'أرض المدينة الصناعية الثانية · الرياض',
    directLands: [
      { id: 'real-land-saudi-1', label: 'مدينة الجبيل الصناعية', landType: 'industrial', areaSquareMeters: 520, price: 7100 },
      { id: 'real-land-saudi-2', label: 'مدينة ينبع الصناعية', landType: 'industrial', areaSquareMeters: 500, price: 6800 },
      { id: 'real-land-saudi-3', label: 'ميناء جدة الإسلامي', landType: 'commercial', areaSquareMeters: 420, price: 5900 },
      { id: 'starter-village-land', label: 'أرض المدينة الصناعية الثانية · الرياض', landType: 'agricultural', areaSquareMeters: 520, price: 3_600 },
      { id: 'direct-land-port-said', label: 'مجمع ميناء الملك عبدالعزيز اللوجستي · الدمام', landType: 'commercial', areaSquareMeters: 420, price: 5_700 },
      { id: 'direct-land-minya-farm', label: 'مزرعة واحة الخرج النموذجية للإنتاج', landType: 'agricultural', areaSquareMeters: 900, price: 4_800 },
      { id: 'direct-land-sokhna-industrial', label: 'موقع الجبيل الصناعي للبتروكيماويات', landType: 'industrial', areaSquareMeters: 520, price: 7_200 },
    ],
    directCompanies: [
      { id: 'real-company-saudi-1', name: 'Saudi Aramco', industryId: 'petroleum', landType: 'industrial', areaSquareMeters: 650, price: 17500 },
      { id: 'real-company-saudi-2', name: 'SABIC', industryId: 'detergents', landType: 'industrial', areaSquareMeters: 650, price: 20000 },
      { id: 'direct-company-food', name: 'شركة نجد للتصنيع الغذائي والتموين', industryId: 'food', landType: 'agricultural', areaSquareMeters: 650, price: 8_600 },
      { id: 'direct-company-logistics', name: 'شركة سهم اللوجستية لنقل وشحن البضائع', industryId: 'transport', landType: 'commercial', areaSquareMeters: 500, price: 10_400 },
      { id: 'direct-company-energy', name: 'شركة كهرباء وطاقة الشرقية', industryId: 'electricity', landType: 'industrial', areaSquareMeters: 600, price: 13_600 },
    ],
    auctions: [
      { id: 'land-cairo-industrial', lotType: 'land', label: 'قطعة مدينة سدير للصناعة والأعمال', landType: 'industrial', areaSquareMeters: 400, minimumBid: 3_200, bidIncrement: 200, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'land-alexandria-farm', lotType: 'land', label: 'أرض مزارع واحة الأحساء', landType: 'agricultural', areaSquareMeters: 650, minimumBid: 2_700, bidIncrement: 200, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'land-suez-commerce', lotType: 'land', label: 'موقع ميناء جدة الإسلامي التجاري', landType: 'commercial', areaSquareMeters: 300, minimumBid: 4_200, bidIncrement: 300, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'factory-petroleum-expansion', lotType: 'factory', label: 'خط معالجة وتكرير إضافي بالجبيل', landType: 'industrial', areaSquareMeters: 0, minimumBid: 4_800, bidIncrement: 400, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', energyCapacityBonus: 40 },
      { id: 'bulk-crude-oil', lotType: 'raw-material', label: 'شحنة خام نفط قياسية من حقل الغوار', landType: 'industrial', areaSquareMeters: 0, minimumBid: 600, bidIncrement: 80, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', materialId: 'crude-oil', quantity: 15 },
    ],
  },
  uae: {
    starterLand: 'مجمع منطقة جبل علي الحرة (JAFZA) · دبي',
    directLands: [
      { id: 'real-land-uae-1', label: 'جافزا · المنطقة الحرة بجبل علي', landType: 'industrial', areaSquareMeters: 520, price: 7300 },
      { id: 'real-land-uae-2', label: 'مدينة خليفة الصناعية · كيزاد', landType: 'industrial', areaSquareMeters: 500, price: 7000 },
      { id: 'real-land-uae-3', label: 'مركز دبي المالي العالمي DIFC', landType: 'commercial', areaSquareMeters: 380, price: 8200 },
      { id: 'starter-village-land', label: 'مجمع منطقة جبل علي الحرة (JAFZA) · دبي', landType: 'agricultural', areaSquareMeters: 520, price: 3_600 },
      { id: 'direct-land-port-said', label: 'مجمع كيزاد اللوجستي التجاري · أبوظبي', landType: 'commercial', areaSquareMeters: 420, price: 5_700 },
      { id: 'direct-land-minya-farm', label: 'مزارع واحة العين والذيد الخضراء', landType: 'agricultural', areaSquareMeters: 900, price: 4_800 },
      { id: 'direct-land-sokhna-industrial', label: 'موقع الرويس الصناعي للبتروكيماويات', landType: 'industrial', areaSquareMeters: 520, price: 7_200 },
    ],
    directCompanies: [
      { id: 'real-company-uae-1', name: 'ADNOC', industryId: 'petroleum', landType: 'industrial', areaSquareMeters: 650, price: 17500 },
      { id: 'real-company-uae-2', name: 'DP World', industryId: 'transport', landType: 'commercial', areaSquareMeters: 500, price: 20000 },
      { id: 'direct-company-food', name: 'شركة دبي للأغذية والضيافة', industryId: 'food', landType: 'agricultural', areaSquareMeters: 650, price: 8_600 },
      { id: 'direct-company-logistics', name: 'شركة موانئ الإمارات اللوجستية', industryId: 'transport', landType: 'commercial', areaSquareMeters: 500, price: 10_400 },
      { id: 'direct-company-energy', name: 'شركة شمس لتوليد الطاقة النظيفة', industryId: 'electricity', landType: 'industrial', areaSquareMeters: 600, price: 13_600 },
    ],
    auctions: [
      { id: 'land-cairo-industrial', lotType: 'land', label: 'قطعة واحة دبي للسيليكون للتكنولوجيا', landType: 'industrial', areaSquareMeters: 400, minimumBid: 3_200, bidIncrement: 200, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'land-alexandria-farm', lotType: 'land', label: 'أرض مزارع ليوا النموذجية', landType: 'agricultural', areaSquareMeters: 650, minimumBid: 2_700, bidIncrement: 200, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'land-suez-commerce', lotType: 'land', label: 'موقع جزيرة المارية التجاري المالي', landType: 'commercial', areaSquareMeters: 300, minimumBid: 4_200, bidIncrement: 300, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'factory-petroleum-expansion', lotType: 'factory', label: 'توسعة خط تكرير بمجمع الرويس', landType: 'industrial', areaSquareMeters: 0, minimumBid: 4_800, bidIncrement: 400, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', energyCapacityBonus: 40 },
      { id: 'bulk-crude-oil', lotType: 'raw-material', label: 'شحنة خام نفط كبرى من حقل زاكوم', landType: 'industrial', areaSquareMeters: 0, minimumBid: 600, bidIncrement: 80, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', materialId: 'crude-oil', quantity: 15 },
    ],
  },
  usa: {
    starterLand: 'مجمع كوينز الصناعي واللوجستي · نيويورك',
    directLands: [
      { id: 'real-land-usa-1', label: 'وادي السيليكون · كاليفورنيا', landType: 'commercial', areaSquareMeters: 400, price: 8500 },
      { id: 'real-land-usa-2', label: 'ممر قناة هيوستن الصناعي · تكساس', landType: 'industrial', areaSquareMeters: 600, price: 7200 },
      { id: 'real-land-usa-3', label: 'منطقة ميناء لوس أنجلوس اللوجستية', landType: 'commercial', areaSquareMeters: 450, price: 6900 },
      { id: 'starter-village-land', label: 'مجمع كوينز الصناعي واللوجستي · نيويورك', landType: 'agricultural', areaSquareMeters: 520, price: 3_600 },
      { id: 'direct-land-port-said', label: 'ميناء شيكاغو التجاري واللوجستي', landType: 'commercial', areaSquareMeters: 420, price: 5_700 },
      { id: 'direct-land-minya-farm', label: 'مزارع الوادي الأوسط بكاليفورنيا (Central Valley)', landType: 'agricultural', areaSquareMeters: 900, price: 4_800 },
      { id: 'direct-land-sokhna-industrial', label: 'مجمع هيوستن للطاقة والبتروكيماويات · تكساس', landType: 'industrial', areaSquareMeters: 520, price: 7_200 },
    ],
    directCompanies: [
      { id: 'real-company-usa-1', name: 'Apple Inc.', industryId: 'electronics', landType: 'commercial', areaSquareMeters: 500, price: 17500 },
      { id: 'real-company-usa-2', name: 'Walmart Inc.', industryId: 'food', landType: 'commercial', areaSquareMeters: 500, price: 20000 },
      { id: 'direct-company-food', name: 'شركة مانهاتن للتصنيع والسلع الاستهلاكية', industryId: 'food', landType: 'agricultural', areaSquareMeters: 650, price: 8_600 },
      { id: 'direct-company-logistics', name: 'شركة أمريكان فريت للشحن وسلاسل الإمداد', industryId: 'transport', landType: 'commercial', areaSquareMeters: 500, price: 10_400 },
      { id: 'direct-company-energy', name: 'شركة هيوستن للكهرباء والطاقة المتجددة', industryId: 'electricity', landType: 'industrial', areaSquareMeters: 600, price: 13_600 },
    ],
    auctions: [
      { id: 'land-cairo-industrial', lotType: 'land', label: 'قطعة وادي السيليكون التكنولوجية · سان خوسيه', landType: 'industrial', areaSquareMeters: 400, minimumBid: 3_200, bidIncrement: 200, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'land-alexandria-farm', lotType: 'land', label: 'أرض مزارع آيوا للحبوب والذرة', landType: 'agricultural', areaSquareMeters: 650, minimumBid: 2_700, bidIncrement: 200, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'land-suez-commerce', lotType: 'land', label: 'موقع ميامي التجاري البحري الدولي', landType: 'commercial', areaSquareMeters: 300, minimumBid: 4_200, bidIncrement: 300, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'factory-petroleum-expansion', lotType: 'factory', label: 'خط معالجة وتكرير إضافي بحوض بيرميان', landType: 'industrial', areaSquareMeters: 0, minimumBid: 4_800, bidIncrement: 400, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', energyCapacityBonus: 40 },
      { id: 'bulk-crude-oil', lotType: 'raw-material', label: 'شحنة خام نفط غرب تكساس (WTI)', landType: 'industrial', areaSquareMeters: 0, minimumBid: 600, bidIncrement: 80, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', materialId: 'crude-oil', quantity: 15 },
    ],
  },
  kuwait: {
    starterLand: 'أرض منطقة الشويخ الصناعية · العاصمة',
    directLands: [
      { id: 'real-land-kuwait-1', label: 'منطقة الشويخ الصناعية', landType: 'industrial', areaSquareMeters: 500, price: 6100 },
      { id: 'real-land-kuwait-2', label: 'منطقة الشعيبة الصناعية', landType: 'industrial', areaSquareMeters: 520, price: 6500 },
      { id: 'real-land-kuwait-3', label: 'ميناء الشويخ التجاري', landType: 'commercial', areaSquareMeters: 420, price: 5700 },
      { id: 'starter-village-land', label: 'أرض منطقة الشويخ الصناعية · العاصمة', landType: 'agricultural', areaSquareMeters: 520, price: 3_600 },
      { id: 'direct-land-port-said', label: 'مجمع منطقة الصليبية اللوجستي التجاري', landType: 'commercial', areaSquareMeters: 420, price: 5_700 },
      { id: 'direct-land-minya-farm', label: 'مزارع منطقة الوفرة الإنتاجية الخصبة', landType: 'agricultural', areaSquareMeters: 900, price: 4_800 },
      { id: 'direct-land-sokhna-industrial', label: 'موقع ميناء الأحمدي للبتروكيماويات', landType: 'industrial', areaSquareMeters: 520, price: 7_200 },
    ],
    directCompanies: [
      { id: 'real-company-kuwait-1', name: 'Kuwait Petroleum Corporation', industryId: 'petroleum', landType: 'industrial', areaSquareMeters: 650, price: 17500 },
      { id: 'real-company-kuwait-2', name: 'Kuwait National Petroleum Company', industryId: 'petroleum', landType: 'industrial', areaSquareMeters: 650, price: 20000 },
      { id: 'direct-company-food', name: 'شركة الديرة للصناعات الغذائية والتجهيز', industryId: 'food', landType: 'agricultural', areaSquareMeters: 650, price: 8_600 },
      { id: 'direct-company-logistics', name: 'شركة بوبيان للنقل والشحن البري والبحري', industryId: 'transport', landType: 'commercial', areaSquareMeters: 500, price: 10_400 },
      { id: 'direct-company-energy', name: 'شركة كويت إنرجي لتوليد الطاقة', industryId: 'electricity', landType: 'industrial', areaSquareMeters: 600, price: 13_600 },
    ],
    auctions: [
      { id: 'land-cairo-industrial', lotType: 'land', label: 'قطعة منطقة صبحان الصناعية الحديثة', landType: 'industrial', areaSquareMeters: 400, minimumBid: 3_200, bidIncrement: 200, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'land-alexandria-farm', lotType: 'land', label: 'أرض مزارع العبدلي الزراعية', landType: 'agricultural', areaSquareMeters: 650, minimumBid: 2_700, bidIncrement: 200, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'land-suez-commerce', lotType: 'land', label: 'موقع العاصمة التجاري في منطقة شرق', landType: 'commercial', areaSquareMeters: 300, minimumBid: 4_200, bidIncrement: 300, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'factory-petroleum-expansion', lotType: 'factory', label: 'توسعة خط تكرير مصفاة ميناء عبدالله', landType: 'industrial', areaSquareMeters: 0, minimumBid: 4_800, bidIncrement: 400, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', energyCapacityBonus: 40 },
      { id: 'bulk-crude-oil', lotType: 'raw-material', label: 'شحنة خام نفط كويتية من حقل برقان', landType: 'industrial', areaSquareMeters: 0, minimumBid: 600, bidIncrement: 80, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', materialId: 'crude-oil', quantity: 15 },
    ],
  },
  qatar: {
    starterLand: 'أرض المنطقة الصناعية الجديدة · الدوحة',
    directLands: [
      { id: 'real-land-qatar-1', label: 'مدينة مسيعيد الصناعية', landType: 'industrial', areaSquareMeters: 520, price: 7000 },
      { id: 'real-land-qatar-2', label: 'مدينة رأس لفان الصناعية', landType: 'industrial', areaSquareMeters: 550, price: 7400 },
      { id: 'real-land-qatar-3', label: 'منطقة راس بوفنطاس الحرة', landType: 'commercial', areaSquareMeters: 420, price: 6600 },
      { id: 'starter-village-land', label: 'أرض المنطقة الصناعية الجديدة · الدوحة', landType: 'agricultural', areaSquareMeters: 520, price: 3_600 },
      { id: 'direct-land-port-said', label: 'مجمع ميناء حمد اللوجستي الدولي', landType: 'commercial', areaSquareMeters: 420, price: 5_700 },
      { id: 'direct-land-minya-farm', label: 'مزارع الشمال القطرية الإنتاجية', landType: 'agricultural', areaSquareMeters: 900, price: 4_800 },
      { id: 'direct-land-sokhna-industrial', label: 'مدينة رأس لفان الصناعية للغاز والطاقة', landType: 'industrial', areaSquareMeters: 520, price: 7_200 },
    ],
    directCompanies: [
      { id: 'real-company-qatar-1', name: 'QatarEnergy', industryId: 'gas', landType: 'industrial', areaSquareMeters: 650, price: 17500 },
      { id: 'real-company-qatar-2', name: 'Ooredoo Qatar', industryId: 'electronics', landType: 'commercial', areaSquareMeters: 500, price: 20000 },
      { id: 'direct-company-food', name: 'شركة الدوحة للإنتاج الغذائي والتعبئة', industryId: 'food', landType: 'agricultural', areaSquareMeters: 650, price: 8_600 },
      { id: 'direct-company-logistics', name: 'شركة ملاحة قطر للشحن اللوجستي', industryId: 'transport', landType: 'commercial', areaSquareMeters: 500, price: 10_400 },
      { id: 'direct-company-energy', name: 'شركة قطر للطاقة وتوزيع الكهرباء', industryId: 'electricity', landType: 'industrial', areaSquareMeters: 600, price: 13_600 },
    ],
    auctions: [
      { id: 'land-cairo-industrial', lotType: 'land', label: 'قطعة لؤلؤة قطر التجارية الفاخرة', landType: 'industrial', areaSquareMeters: 400, minimumBid: 3_200, bidIncrement: 200, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'land-alexandria-farm', lotType: 'land', label: 'أرض الشحانية الزراعية الخضراء', landType: 'agricultural', areaSquareMeters: 650, minimumBid: 2_700, bidIncrement: 200, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'land-suez-commerce', lotType: 'land', label: 'موقع روضة الخيل التجاري الحيوي', landType: 'commercial', areaSquareMeters: 300, minimumBid: 4_200, bidIncrement: 300, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'factory-petroleum-expansion', lotType: 'factory', label: 'توسعة خط معالجة الغاز برأس لفان', landType: 'industrial', areaSquareMeters: 0, minimumBid: 4_800, bidIncrement: 400, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', energyCapacityBonus: 40 },
      { id: 'bulk-crude-oil', lotType: 'raw-material', label: 'شحنة مكثفات وغاز من حقل الشمال القطري', landType: 'industrial', areaSquareMeters: 0, minimumBid: 600, bidIncrement: 80, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', materialId: 'crude-oil', quantity: 15 },
    ],
  },
  uk: {
    starterLand: 'مجمع مانشستر الصناعي (Trafford Park)',
    directLands: [
      { id: 'real-land-uk-1', label: 'كاناري وارف · لندن', landType: 'commercial', areaSquareMeters: 350, price: 8800 },
      { id: 'real-land-uk-2', label: 'ميناء فيليكستو اللوجستي', landType: 'commercial', areaSquareMeters: 450, price: 7200 },
      { id: 'real-land-uk-3', label: 'لندن غيتواي · ميناء ومنطقة لوجستية', landType: 'industrial', areaSquareMeters: 520, price: 7600 },
      { id: 'starter-village-land', label: 'مجمع مانشستر الصناعي (Trafford Park)', landType: 'agricultural', areaSquareMeters: 520, price: 3_600 },
      { id: 'direct-land-port-said', label: 'حوض ليفربول التجاري اللوجستي الدولي', landType: 'commercial', areaSquareMeters: 420, price: 5_700 },
      { id: 'direct-land-minya-farm', label: 'مزارع يوركشاير الزراعية الخصبة', landType: 'agricultural', areaSquareMeters: 900, price: 4_800 },
      { id: 'direct-land-sokhna-industrial', label: 'مجمع أبردين للبتروكيماويات وطاقة البحر', landType: 'industrial', areaSquareMeters: 520, price: 7_200 },
    ],
    directCompanies: [
      { id: 'real-company-uk-1', name: 'Unilever', industryId: 'food', landType: 'industrial', areaSquareMeters: 650, price: 17500 },
      { id: 'real-company-uk-2', name: 'Rolls-Royce', industryId: 'transport', landType: 'industrial', areaSquareMeters: 650, price: 20000 },
      { id: 'direct-company-food', name: 'شركة التايمز للصناعات الغذائية الحديثة', industryId: 'food', landType: 'agricultural', areaSquareMeters: 650, price: 8_600 },
      { id: 'direct-company-logistics', name: 'شركة الشحن الملكية البريطانية', industryId: 'transport', landType: 'commercial', areaSquareMeters: 500, price: 10_400 },
      { id: 'direct-company-energy', name: 'شركة بريتيش باور للطاقة وتوليد الكهرباء', industryId: 'electricity', landType: 'industrial', areaSquareMeters: 600, price: 13_600 },
    ],
    auctions: [
      { id: 'land-cairo-industrial', lotType: 'land', label: 'قطعة حي كاناري وارف المالي بلندن', landType: 'industrial', areaSquareMeters: 400, minimumBid: 3_200, bidIncrement: 200, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'land-alexandria-farm', lotType: 'land', label: 'أرض كينت الزراعية الإنتاجية (حديقة إنجلترا)', landType: 'agricultural', areaSquareMeters: 650, minimumBid: 2_700, bidIncrement: 200, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'land-suez-commerce', lotType: 'land', label: 'موقع ساوثهامبتون التجاري اللوجستي', landType: 'commercial', areaSquareMeters: 300, minimumBid: 4_200, bidIncrement: 300, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'factory-petroleum-expansion', lotType: 'factory', label: 'توسعة خط تكرير بحر الشمال (Brent)', landType: 'industrial', areaSquareMeters: 0, minimumBid: 4_800, bidIncrement: 400, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', energyCapacityBonus: 40 },
      { id: 'bulk-crude-oil', lotType: 'raw-material', label: 'شحنة خام نفط برنت بريطانية', landType: 'industrial', areaSquareMeters: 0, minimumBid: 600, bidIncrement: 80, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', materialId: 'crude-oil', quantity: 15 },
    ],
  },
  germany: {
    starterLand: 'حزام الرور الصناعي الحديث · دوسلدورف',
    directLands: [
      { id: 'real-land-germany-1', label: 'موقع بويته الصناعي · ميناء هامبورغ', landType: 'industrial', areaSquareMeters: 520, price: 7100 },
      { id: 'real-land-germany-2', label: 'بيلبروك-روتنبورغسورت · هامبورغ', landType: 'industrial', areaSquareMeters: 500, price: 6800 },
      { id: 'real-land-germany-3', label: 'منطقة الأعمال أليرمويه · هامبورغ', landType: 'commercial', areaSquareMeters: 420, price: 6200 },
      { id: 'starter-village-land', label: 'حزام الرور الصناعي الحديث · دوسلدورف', landType: 'agricultural', areaSquareMeters: 520, price: 3_600 },
      { id: 'direct-land-port-said', label: 'مجمع ميناء هامبورغ اللوجستي التجاري', landType: 'commercial', areaSquareMeters: 420, price: 5_700 },
      { id: 'direct-land-minya-farm', label: 'مزارع بافاريا الزراعية الإنتاجية', landType: 'agricultural', areaSquareMeters: 900, price: 4_800 },
      { id: 'direct-land-sokhna-industrial', label: 'مجمع لودفيغسهافن للصناعات الكيماوية', landType: 'industrial', areaSquareMeters: 520, price: 7_200 },
    ],
    directCompanies: [
      { id: 'real-company-germany-1', name: 'Siemens AG', industryId: 'electronics', landType: 'industrial', areaSquareMeters: 650, price: 17500 },
      { id: 'real-company-germany-2', name: 'BMW Group', industryId: 'transport', landType: 'industrial', areaSquareMeters: 650, price: 20000 },
      { id: 'direct-company-food', name: 'شركة بافاريا للمنتجات الغذائية', industryId: 'food', landType: 'agricultural', areaSquareMeters: 650, price: 8_600 },
      { id: 'direct-company-logistics', name: 'شركة دويتشه للشحن وسلاسل التوريد', industryId: 'transport', landType: 'commercial', areaSquareMeters: 500, price: 10_400 },
      { id: 'direct-company-energy', name: 'شركة راين-إلكتريك لتوليد الطاقة', industryId: 'electricity', landType: 'industrial', areaSquareMeters: 600, price: 13_600 },
    ],
    auctions: [
      { id: 'land-cairo-industrial', lotType: 'land', label: 'قطعة شتوتغارت الصناعية التقنية', landType: 'industrial', areaSquareMeters: 400, minimumBid: 3_200, bidIncrement: 200, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'land-alexandria-farm', lotType: 'land', label: 'أرض براندنبورغ الزراعية الممتدة', landType: 'agricultural', areaSquareMeters: 650, minimumBid: 2_700, bidIncrement: 200, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'land-suez-commerce', lotType: 'land', label: 'موقع حي المال بفرانكفورت (Bankenviertel)', landType: 'commercial', areaSquareMeters: 300, minimumBid: 4_200, bidIncrement: 300, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'factory-petroleum-expansion', lotType: 'factory', label: 'خط معالجة وتكرير إضافي بمجمع شفييدت', landType: 'industrial', areaSquareMeters: 0, minimumBid: 4_800, bidIncrement: 400, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', energyCapacityBonus: 40 },
      { id: 'bulk-crude-oil', lotType: 'raw-material', label: 'شحنة خام نفط ألمانية مكررة عالية الجودة', landType: 'industrial', areaSquareMeters: 0, minimumBid: 600, bidIncrement: 80, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', materialId: 'crude-oil', quantity: 15 },
    ],
  },
  japan: {
    starterLand: 'مجمع يوكوهاما البحري الصناعي · خليج طوكيو',
    directLands: [
      { id: 'real-land-japan-1', label: 'ميناء يوكوهاما ومنطقته الصناعية', landType: 'industrial', areaSquareMeters: 520, price: 7100 },
      { id: 'real-land-japan-2', label: 'ميناء ناغويا والمنطقة اللوجستية', landType: 'commercial', areaSquareMeters: 450, price: 6900 },
      { id: 'real-land-japan-3', label: 'مركز ماكوهاري للأعمال · تشيبا', landType: 'commercial', areaSquareMeters: 400, price: 6700 },
      { id: 'starter-village-land', label: 'مجمع يوكوهاما البحري الصناعي · خليج طوكيو', landType: 'agricultural', areaSquareMeters: 520, price: 3_600 },
      { id: 'direct-land-port-said', label: 'ميناء ناغويا اللوجستي التجاري الدولي', landType: 'commercial', areaSquareMeters: 420, price: 5_700 },
      { id: 'direct-land-minya-farm', label: 'مزارع هوكايدو الزراعية الخصبة', landType: 'agricultural', areaSquareMeters: 900, price: 4_800 },
      { id: 'direct-land-sokhna-industrial', label: 'مجمع أوساكا لتكرير الطاقة والصناعات الثقيلة', landType: 'industrial', areaSquareMeters: 520, price: 7_200 },
    ],
    directCompanies: [
      { id: 'real-company-japan-1', name: 'Toyota Motor Corporation', industryId: 'transport', landType: 'industrial', areaSquareMeters: 650, price: 17500 },
      { id: 'real-company-japan-2', name: 'Sony Group Corporation', industryId: 'electronics', landType: 'commercial', areaSquareMeters: 500, price: 20000 },
      { id: 'direct-company-food', name: 'شركة طوكيو للتصنيع الغذائي', industryId: 'food', landType: 'agricultural', areaSquareMeters: 650, price: 8_600 },
      { id: 'direct-company-logistics', name: 'شركة نيبون للنقل السريع والشحن الدولي', industryId: 'transport', landType: 'commercial', areaSquareMeters: 500, price: 10_400 },
      { id: 'direct-company-energy', name: 'شركة كانساي إلكتريك للطاقة وتوليد الكهرباء', industryId: 'electricity', landType: 'industrial', areaSquareMeters: 600, price: 13_600 },
    ],
    auctions: [
      { id: 'land-cairo-industrial', lotType: 'land', label: 'قطعة فوكوكا للابتكار والأتمتة', landType: 'industrial', areaSquareMeters: 400, minimumBid: 3_200, bidIncrement: 200, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'land-alexandria-farm', lotType: 'land', label: 'أرض ناغانو الزراعية النموذجية', landType: 'agricultural', areaSquareMeters: 650, minimumBid: 2_700, bidIncrement: 200, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'land-suez-commerce', lotType: 'land', label: 'موقع حي شينجوكو التجاري بطوكيو', landType: 'commercial', areaSquareMeters: 300, minimumBid: 4_200, bidIncrement: 300, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'factory-petroleum-expansion', lotType: 'factory', label: 'توسعة خط تكرير بمجمع كاناغاوا', landType: 'industrial', areaSquareMeters: 0, minimumBid: 4_800, bidIncrement: 400, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', energyCapacityBonus: 40 },
      { id: 'bulk-crude-oil', lotType: 'raw-material', label: 'شحنة خام نفط مستوردة فائقة النقاوة', landType: 'industrial', areaSquareMeters: 0, minimumBid: 600, bidIncrement: 80, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', materialId: 'crude-oil', quantity: 15 },
    ],
  },
  jordan: {
    starterLand: 'أرض مدينة الملك عبدالله الثاني الصناعية · سحاب',
    directLands: [
      { id: 'real-land-jordan-1', label: 'منطقة العقبة الاقتصادية الخاصة', landType: 'commercial', areaSquareMeters: 450, price: 6500 },
      { id: 'real-land-jordan-2', label: 'مدينة الملك عبدالله الثاني الصناعية · سحاب', landType: 'industrial', areaSquareMeters: 520, price: 6200 },
      { id: 'real-land-jordan-3', label: 'مدينة الزرقاء الصناعية', landType: 'industrial', areaSquareMeters: 500, price: 5900 },
      { id: 'direct-land-jordan-sahab', label: 'أرض مدينة سحاب الصناعية', landType: 'industrial', areaSquareMeters: 520, price: 3_600 },
      { id: 'direct-land-jordan-aqaba', label: 'مجمع منطقة العقبة اللوجستية الخاصة', landType: 'commercial', areaSquareMeters: 420, price: 5_700 },
      { id: 'direct-land-jordan-shuna', label: 'أرض مزارع وادي الأردن والشونة', landType: 'agricultural', areaSquareMeters: 900, price: 4_800 },
      { id: 'direct-land-jordan-zarqa', label: 'موقع الهاشمية الصناعي للتعدين والكيماويات · الزرقاء', landType: 'industrial', areaSquareMeters: 520, price: 7_200 },
    ],
    directCompanies: [
      { id: 'real-company-jordan-1', name: 'Jordan Petroleum Refinery Company', industryId: 'petroleum', landType: 'industrial', areaSquareMeters: 650, price: 17500 },
      { id: 'real-company-jordan-2', name: 'Royal Jordanian', industryId: 'transport', landType: 'commercial', areaSquareMeters: 500, price: 20000 },
      { id: 'direct-company-jordan-food', name: 'شركة البتراء للصناعات الغذائية', industryId: 'food', landType: 'industrial', areaSquareMeters: 650, price: 8_600 },
      { id: 'direct-company-jordan-logistics', name: 'شركة العقبة لخطوط الشحن والترانزيت', industryId: 'transport', landType: 'commercial', areaSquareMeters: 500, price: 10_400 },
      { id: 'direct-company-jordan-energy', name: 'شركة شمس معان لتوليد الطاقة النظيفة', industryId: 'electricity', landType: 'industrial', areaSquareMeters: 600, price: 13_600 },
    ],
    auctions: [
      { id: 'auction-jordan-muwaqqar', lotType: 'land', label: 'قطعة توسعة مدينة الموقر الصناعية', landType: 'industrial', areaSquareMeters: 400, minimumBid: 3_200, bidIncrement: 200, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'auction-jordan-aghur', lotType: 'land', label: 'أرض مزارع الأغوار الجنوبية المروية', landType: 'agricultural', areaSquareMeters: 650, minimumBid: 2_700, bidIncrement: 200, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'auction-jordan-aqaba-beach', lotType: 'land', label: 'موقع الشاطئ الجنوبي التجاري · العقبة', landType: 'commercial', areaSquareMeters: 300, minimumBid: 4_200, bidIncrement: 300, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'auction-jordan-potash-refinery', lotType: 'factory', label: 'خط معالجة وتكرير إضافي بمجمع الصافي للبوتاس', landType: 'industrial', areaSquareMeters: 0, minimumBid: 4_800, bidIncrement: 400, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', energyCapacityBonus: 40 },
      { id: 'auction-jordan-phosphate-bulk', lotType: 'raw-material', label: 'شحنة خامات تعدين وبوتاس من مناجم الشيدية', landType: 'industrial', areaSquareMeters: 0, minimumBid: 600, bidIncrement: 80, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', materialId: 'chemicals', quantity: 15 },
    ],
  },
  palestine: {
    starterLand: 'منطقة بيت لحم الصناعية · بيت لحم',
    directLands: [
      { id: 'real-land-palestine-1', label: 'حديقة أريحا الزراعية الصناعية', landType: 'agricultural', areaSquareMeters: 700, price: 4800 },
      { id: 'real-land-palestine-2', label: 'المنطقة الصناعية في جنين', landType: 'industrial', areaSquareMeters: 500, price: 5700 },
      { id: 'real-land-palestine-3', label: 'المنطقة الصناعية في بيت لحم', landType: 'industrial', areaSquareMeters: 480, price: 5600 },
      { id: 'direct-land-palestine-bethlehem', label: 'قطعة صناعية في منطقة بيت لحم الصناعية', landType: 'industrial', areaSquareMeters: 520, price: 3_600 },
      { id: 'direct-land-palestine-gaza', label: 'موقع تجاري في مدينة غزة', landType: 'commercial', areaSquareMeters: 420, price: 5_700 },
      { id: 'direct-land-palestine-jericho', label: 'أرض زراعية في أريحا والأغوار', landType: 'agricultural', areaSquareMeters: 900, price: 4_800 },
      { id: 'direct-land-palestine-jenin', label: 'قطعة إنتاجية في منطقة جنين الصناعية', landType: 'industrial', areaSquareMeters: 520, price: 7_200 },
    ],
    directCompanies: [
      { id: 'real-company-palestine-1', name: 'Palestine Telecommunications Company (Paltel)', industryId: 'electronics', landType: 'commercial', areaSquareMeters: 500, price: 17500 },
      { id: 'real-company-palestine-2', name: 'Palestine Development and Investment Company (PADICO)', industryId: 'construction', landType: 'commercial', areaSquareMeters: 500, price: 20000 },
      { id: 'direct-company-palestine-food', name: 'شركة سنابل فلسطين للصناعات الغذائية', industryId: 'food', landType: 'agricultural', areaSquareMeters: 650, price: 8_600 },
      { id: 'direct-company-palestine-logistics', name: 'شركة دروب فلسطين للخدمات اللوجستية', industryId: 'transport', landType: 'commercial', areaSquareMeters: 500, price: 10_400 },
      { id: 'direct-company-palestine-energy', name: 'شركة شمس فلسطين للطاقة', industryId: 'electricity', landType: 'industrial', areaSquareMeters: 600, price: 13_600 },
    ],
    auctions: [
      { id: 'auction-palestine-bethlehem', lotType: 'land', label: 'قطعة توسعة في منطقة بيت لحم الصناعية', landType: 'industrial', areaSquareMeters: 400, minimumBid: 3_200, bidIncrement: 200, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'auction-palestine-jericho', lotType: 'land', label: 'أرض زراعية في أريحا والأغوار', landType: 'agricultural', areaSquareMeters: 650, minimumBid: 2_700, bidIncrement: 200, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'auction-palestine-ramallah', lotType: 'land', label: 'موقع تجاري في مركز رام الله', landType: 'commercial', areaSquareMeters: 300, minimumBid: 4_200, bidIncrement: 300, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'auction-palestine-jenin', lotType: 'factory', label: 'خط إنتاج إضافي في منطقة جنين الصناعية', landType: 'industrial', areaSquareMeters: 0, minimumBid: 4_800, bidIncrement: 400, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', energyCapacityBonus: 40 },
      { id: 'auction-palestine-grain', lotType: 'raw-material', label: 'شحنة حبوب محلية من الأغوار', landType: 'agricultural', areaSquareMeters: 0, minimumBid: 600, bidIncrement: 80, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', materialId: 'grain', quantity: 15 },
    ],
  },
  china: {
    starterLand: 'منطقة شنغهاي الصناعية · شنغهاي',
    directLands: [
      { id: 'real-land-china-1', label: 'مدينة تشانغجيانغ للعلوم · شنغهاي', landType: 'commercial', areaSquareMeters: 420, price: 7900 },
      { id: 'real-land-china-2', label: 'المنطقة الاقتصادية الخاصة في شنتشن', landType: 'industrial', areaSquareMeters: 520, price: 7600 },
      { id: 'real-land-china-3', label: 'ميناء شنغهاي والمنطقة اللوجستية', landType: 'commercial', areaSquareMeters: 500, price: 7400 },
      { id: 'direct-land-china-bethlehem', label: 'قطعة صناعية في منطقة شنغهاي الصناعية', landType: 'industrial', areaSquareMeters: 520, price: 3_600 },
      { id: 'direct-land-china-gaza', label: 'موقع تجاري في مدينة شنتشن', landType: 'commercial', areaSquareMeters: 420, price: 5_700 },
      { id: 'direct-land-china-jericho', label: 'أرض زراعية في سيتشوان', landType: 'agricultural', areaSquareMeters: 900, price: 4_800 },
      { id: 'direct-land-china-jenin', label: 'قطعة إنتاجية في منطقة سوتشو الصناعية', landType: 'industrial', areaSquareMeters: 520, price: 7_200 },
    ],
    directCompanies: [
      { id: 'real-company-china-1', name: 'Alibaba Group', industryId: 'electronics', landType: 'commercial', areaSquareMeters: 500, price: 17500 },
      { id: 'real-company-china-2', name: 'BYD', industryId: 'transport', landType: 'industrial', areaSquareMeters: 650, price: 20000 },
      { id: 'direct-company-china-food', name: 'شركة سنابل الصين للصناعات الغذائية', industryId: 'food', landType: 'agricultural', areaSquareMeters: 650, price: 8_600 },
      { id: 'direct-company-china-logistics', name: 'شركة دروب الصين للخدمات اللوجستية', industryId: 'transport', landType: 'commercial', areaSquareMeters: 500, price: 10_400 },
      { id: 'direct-company-china-energy', name: 'شركة شمس الصين للطاقة', industryId: 'electricity', landType: 'industrial', areaSquareMeters: 600, price: 13_600 },
    ],
    auctions: [
      { id: 'auction-china-bethlehem', lotType: 'land', label: 'قطعة توسعة في منطقة شنغهاي الصناعية', landType: 'industrial', areaSquareMeters: 400, minimumBid: 3_200, bidIncrement: 200, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'auction-china-jericho', lotType: 'land', label: 'أرض زراعية في سيتشوان', landType: 'agricultural', areaSquareMeters: 650, minimumBid: 2_700, bidIncrement: 200, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'auction-china-ramallah', lotType: 'land', label: 'موقع تجاري في مركز بكين', landType: 'commercial', areaSquareMeters: 300, minimumBid: 4_200, bidIncrement: 300, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'auction-china-jenin', lotType: 'factory', label: 'خط إنتاج إضافي في منطقة سوتشو الصناعية', landType: 'industrial', areaSquareMeters: 0, minimumBid: 4_800, bidIncrement: 400, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', energyCapacityBonus: 40 },
      { id: 'auction-china-grain', lotType: 'raw-material', label: 'شحنة حبوب محلية من الأغوار', landType: 'agricultural', areaSquareMeters: 0, minimumBid: 600, bidIncrement: 80, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', materialId: 'grain', quantity: 15 },
    ],
  },
  spain: {
    starterLand: 'منطقة برشلونة الصناعية · برشلونة',
    directLands: [
      { id: 'real-land-spain-1', label: 'المنطقة الحرة · زونا فرانكا · برشلونة', landType: 'industrial', areaSquareMeters: 520, price: 7200 },
      { id: 'real-land-spain-2', label: 'ميناء فالنسيا والمنطقة اللوجستية', landType: 'commercial', areaSquareMeters: 460, price: 6900 },
      { id: 'real-land-spain-3', label: 'منطقة البيوت الزجاجية الزراعية · ألميريا', landType: 'agricultural', areaSquareMeters: 800, price: 5200 },
      { id: 'direct-land-spain-bethlehem', label: 'قطعة صناعية في منطقة برشلونة الصناعية', landType: 'industrial', areaSquareMeters: 520, price: 3_600 },
      { id: 'direct-land-spain-gaza', label: 'موقع تجاري في مدينة فالنسيا', landType: 'commercial', areaSquareMeters: 420, price: 5_700 },
      { id: 'direct-land-spain-jericho', label: 'أرض زراعية في الأندلس', landType: 'agricultural', areaSquareMeters: 900, price: 4_800 },
      { id: 'direct-land-spain-jenin', label: 'قطعة إنتاجية في منطقة مدريد الصناعية', landType: 'industrial', areaSquareMeters: 520, price: 7_200 },
    ],
    directCompanies: [
      { id: 'real-company-spain-1', name: 'Iberdrola', industryId: 'electricity', landType: 'industrial', areaSquareMeters: 650, price: 17500 },
      { id: 'real-company-spain-2', name: 'Repsol', industryId: 'petroleum', landType: 'industrial', areaSquareMeters: 650, price: 20000 },
      { id: 'direct-company-spain-food', name: 'شركة سنابل إسبانيا للصناعات الغذائية', industryId: 'food', landType: 'agricultural', areaSquareMeters: 650, price: 8_600 },
      { id: 'direct-company-spain-logistics', name: 'شركة دروب إسبانيا للخدمات اللوجستية', industryId: 'transport', landType: 'commercial', areaSquareMeters: 500, price: 10_400 },
      { id: 'direct-company-spain-energy', name: 'شركة شمس إسبانيا للطاقة', industryId: 'electricity', landType: 'industrial', areaSquareMeters: 600, price: 13_600 },
    ],
    auctions: [
      { id: 'auction-spain-bethlehem', lotType: 'land', label: 'قطعة توسعة في منطقة برشلونة الصناعية', landType: 'industrial', areaSquareMeters: 400, minimumBid: 3_200, bidIncrement: 200, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'auction-spain-jericho', lotType: 'land', label: 'أرض زراعية في الأندلس', landType: 'agricultural', areaSquareMeters: 650, minimumBid: 2_700, bidIncrement: 200, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'auction-spain-ramallah', lotType: 'land', label: 'موقع تجاري في مركز إشبيلية', landType: 'commercial', areaSquareMeters: 300, minimumBid: 4_200, bidIncrement: 300, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'auction-spain-jenin', lotType: 'factory', label: 'خط إنتاج إضافي في منطقة مدريد الصناعية', landType: 'industrial', areaSquareMeters: 0, minimumBid: 4_800, bidIncrement: 400, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', energyCapacityBonus: 40 },
      { id: 'auction-spain-grain', lotType: 'raw-material', label: 'شحنة حبوب محلية من الأغوار', landType: 'agricultural', areaSquareMeters: 0, minimumBid: 600, bidIncrement: 80, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', materialId: 'grain', quantity: 15 },
    ],
  },
  russia: {
    starterLand: 'منطقة موسكو الصناعية · موسكو',
    directLands: [
      { id: 'real-land-russia-1', label: 'مركز موسكو الدولي للأعمال · موسكو سيتي', landType: 'commercial', areaSquareMeters: 400, price: 8200 },
      { id: 'real-land-russia-2', label: 'منطقة كراسنودار الزراعية · كوبان', landType: 'agricultural', areaSquareMeters: 900, price: 5100 },
      { id: 'real-land-russia-3', label: 'ميناء نوفوروسيسك التجاري', landType: 'commercial', areaSquareMeters: 500, price: 7100 },
      { id: 'direct-land-russia-bethlehem', label: 'قطعة صناعية في منطقة موسكو الصناعية', landType: 'industrial', areaSquareMeters: 520, price: 3_600 },
      { id: 'direct-land-russia-gaza', label: 'موقع تجاري في مدينة سانت بطرسبرغ', landType: 'commercial', areaSquareMeters: 420, price: 5_700 },
      { id: 'direct-land-russia-jericho', label: 'أرض زراعية في كراسنودار', landType: 'agricultural', areaSquareMeters: 900, price: 4_800 },
      { id: 'direct-land-russia-jenin', label: 'قطعة إنتاجية في منطقة الأورال الصناعية', landType: 'industrial', areaSquareMeters: 520, price: 7_200 },
    ],
    directCompanies: [
      { id: 'real-company-russia-1', name: 'Gazprom', industryId: 'gas', landType: 'industrial', areaSquareMeters: 650, price: 17500 },
      { id: 'real-company-russia-2', name: 'LUKOIL', industryId: 'petroleum', landType: 'industrial', areaSquareMeters: 650, price: 20000 },
      { id: 'direct-company-russia-food', name: 'شركة سنابل روسيا للصناعات الغذائية', industryId: 'food', landType: 'agricultural', areaSquareMeters: 650, price: 8_600 },
      { id: 'direct-company-russia-logistics', name: 'شركة دروب روسيا للخدمات اللوجستية', industryId: 'transport', landType: 'commercial', areaSquareMeters: 500, price: 10_400 },
      { id: 'direct-company-russia-energy', name: 'شركة شمس روسيا للطاقة', industryId: 'electricity', landType: 'industrial', areaSquareMeters: 600, price: 13_600 },
    ],
    auctions: [
      { id: 'auction-russia-bethlehem', lotType: 'land', label: 'قطعة توسعة في منطقة موسكو الصناعية', landType: 'industrial', areaSquareMeters: 400, minimumBid: 3_200, bidIncrement: 200, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'auction-russia-jericho', lotType: 'land', label: 'أرض زراعية في كراسنودار', landType: 'agricultural', areaSquareMeters: 650, minimumBid: 2_700, bidIncrement: 200, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'auction-russia-ramallah', lotType: 'land', label: 'موقع تجاري في مركز قازان', landType: 'commercial', areaSquareMeters: 300, minimumBid: 4_200, bidIncrement: 300, closesAt: '2099-12-31T00:00:00.000Z', status: 'open' },
      { id: 'auction-russia-jenin', lotType: 'factory', label: 'خط إنتاج إضافي في منطقة الأورال الصناعية', landType: 'industrial', areaSquareMeters: 0, minimumBid: 4_800, bidIncrement: 400, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', energyCapacityBonus: 40 },
      { id: 'auction-russia-grain', lotType: 'raw-material', label: 'شحنة حبوب محلية من الأغوار', landType: 'agricultural', areaSquareMeters: 0, minimumBid: 600, bidIncrement: 80, closesAt: '2099-12-31T00:00:00.000Z', status: 'open', materialId: 'grain', quantity: 15 },
    ],
  },
};

export function getDirectLandsForCountry(countryId?: CountryId): readonly DirectLandListing[] {
  const cId = countryId || 'egypt';
  return COUNTRY_REAL_ASSETS[cId]?.directLands || COUNTRY_REAL_ASSETS.egypt.directLands;
}

export function getDirectCompaniesForCountry(countryId?: CountryId): readonly DirectCompanyListing[] {
  const cId = countryId || 'egypt';
  return COUNTRY_REAL_ASSETS[cId]?.directCompanies || COUNTRY_REAL_ASSETS.egypt.directCompanies;
}

export function getAuctionsForCountry(countryId?: CountryId): readonly AuctionListing[] {
  const cId = countryId || 'egypt';
  return (COUNTRY_REAL_ASSETS[cId]?.auctions || COUNTRY_REAL_ASSETS.egypt.auctions).map((a) => ({
    ...a,
    countryId: cId,
  }));
}

// Fallback constant exports for backwards compatibility
export const DIRECT_LAND_CATALOG = COUNTRY_REAL_ASSETS.egypt.directLands;
export const DIRECT_COMPANY_CATALOG = COUNTRY_REAL_ASSETS.egypt.directCompanies;
export const AUCTION_CATALOG = COUNTRY_REAL_ASSETS.egypt.auctions.map((a) => ({ ...a, countryId: 'egypt' as CountryId }));

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
