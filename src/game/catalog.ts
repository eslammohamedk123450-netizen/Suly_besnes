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

export interface TaskCatalogEntry {
  id: string;
  title: string;
  description: string;
  condition: TaskCondition;
  reward: number;
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
  { id: 'task-first-land', title: 'أول ملكية', description: 'امتلك قطعة أرض استثمارية واحدة.', condition: 'own-land', reward: 500 },
  { id: 'task-first-company', title: 'تأسيس الإمبراطورية', description: 'أسس شركتك الأولى.', condition: 'own-company', reward: 700 },
  { id: 'task-first-material', title: 'المخزن الأول', description: 'اشترِ دفعة مواد خام.', condition: 'buy-material', reward: 200 },
  { id: 'task-first-production', title: 'خط الإنتاج', description: 'شغّل دفعة إنتاج بنجاح.', condition: 'run-production', reward: 600 },
  { id: 'task-first-sale', title: 'أول صفقة بيع', description: 'بع منتجًا تملكه في السوق.', condition: 'sell-product', reward: 400 },
  { id: 'task-first-investment', title: 'تنويع رأس المال', description: 'أنشئ استثمارًا عائديًا.', condition: 'make-investment', reward: 400 },
  { id: 'task-day-three', title: 'ثلاثة أيام', description: 'مرّر ثلاثة أيام من المحاكاة بنجاح.', condition: 'reach-day-3', reward: 800 },
];

export const INVESTMENT_CATALOG: readonly InvestmentCatalogEntry[] = [
  { id: 'treasury-note', name: 'سند الخزينة الحكومي', minimumAmount: 1_000, maximumAmount: 10_000, durationDays: 3, returnRate: 0.08, riskRate: 0 },
  { id: 'warehouse-fund', name: 'صندوق الاستثمار اللوجستي', minimumAmount: 2_000, maximumAmount: 15_000, durationDays: 5, returnRate: 0.18, riskRate: 0.08 },
];

// Country-Specific Real Locations and Names
export const COUNTRY_REAL_ASSETS: Record<CountryId, {
  starterLand: string;
  directLands: readonly { id: string; label: string; landType: 'industrial' | 'agricultural' | 'commercial'; areaSquareMeters: number; price: number }[];
  directCompanies: readonly { id: string; name: string; industryId: IndustryId; landType: 'industrial' | 'agricultural' | 'commercial'; areaSquareMeters: number; price: number }[];
  auctions: readonly { id: string; lotType: 'land' | 'factory' | 'raw-material'; label: string; landType: 'industrial' | 'agricultural' | 'commercial'; areaSquareMeters: number; minimumBid: number; bidIncrement: number; closesAt: string; status: 'open' | 'closed'; materialId?: string; quantity?: number; energyCapacityBonus?: number }[];
}> = {
  egypt: {
    starterLand: 'أرض المنطقة الصناعية الأولى · العاشر من رمضان',
    directLands: [
      { id: 'starter-village-land', label: 'أرض المنطقة الصناعية الأولى · العاشر من رمضان', landType: 'agricultural', areaSquareMeters: 520, price: 3_600 },
      { id: 'direct-land-port-said', label: 'مجمع بورسعيد اللوجستي الحرة', landType: 'commercial', areaSquareMeters: 420, price: 5_700 },
      { id: 'direct-land-minya-farm', label: 'أرض مزارع وادي النطرون الخصبة', landType: 'agricultural', areaSquareMeters: 900, price: 4_800 },
      { id: 'direct-land-sokhna-industrial', label: 'موقع العين السخنة للبتروكيماويات', landType: 'industrial', areaSquareMeters: 520, price: 7_200 },
    ],
    directCompanies: [
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
      { id: 'starter-village-land', label: 'أرض المدينة الصناعية الثانية · الرياض', landType: 'agricultural', areaSquareMeters: 520, price: 3_600 },
      { id: 'direct-land-port-said', label: 'مجمع ميناء الملك عبدالعزيز اللوجستي · الدمام', landType: 'commercial', areaSquareMeters: 420, price: 5_700 },
      { id: 'direct-land-minya-farm', label: 'مزرعة واحة الخرج النموذجية للإنتاج', landType: 'agricultural', areaSquareMeters: 900, price: 4_800 },
      { id: 'direct-land-sokhna-industrial', label: 'موقع الجبيل الصناعي للبتروكيماويات', landType: 'industrial', areaSquareMeters: 520, price: 7_200 },
    ],
    directCompanies: [
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
      { id: 'starter-village-land', label: 'مجمع منطقة جبل علي الحرة (JAFZA) · دبي', landType: 'agricultural', areaSquareMeters: 520, price: 3_600 },
      { id: 'direct-land-port-said', label: 'مجمع كيزاد اللوجستي التجاري · أبوظبي', landType: 'commercial', areaSquareMeters: 420, price: 5_700 },
      { id: 'direct-land-minya-farm', label: 'مزارع واحة العين والذيد الخضراء', landType: 'agricultural', areaSquareMeters: 900, price: 4_800 },
      { id: 'direct-land-sokhna-industrial', label: 'موقع الرويس الصناعي للبتروكيماويات', landType: 'industrial', areaSquareMeters: 520, price: 7_200 },
    ],
    directCompanies: [
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
      { id: 'starter-village-land', label: 'مجمع كوينز الصناعي واللوجستي · نيويورك', landType: 'agricultural', areaSquareMeters: 520, price: 3_600 },
      { id: 'direct-land-port-said', label: 'ميناء شيكاغو التجاري واللوجستي', landType: 'commercial', areaSquareMeters: 420, price: 5_700 },
      { id: 'direct-land-minya-farm', label: 'مزارع الوادي الأوسط بكاليفورنيا (Central Valley)', landType: 'agricultural', areaSquareMeters: 900, price: 4_800 },
      { id: 'direct-land-sokhna-industrial', label: 'مجمع هيوستن للطاقة والبتروكيماويات · تكساس', landType: 'industrial', areaSquareMeters: 520, price: 7_200 },
    ],
    directCompanies: [
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
      { id: 'starter-village-land', label: 'أرض منطقة الشويخ الصناعية · العاصمة', landType: 'agricultural', areaSquareMeters: 520, price: 3_600 },
      { id: 'direct-land-port-said', label: 'مجمع منطقة الصليبية اللوجستي التجاري', landType: 'commercial', areaSquareMeters: 420, price: 5_700 },
      { id: 'direct-land-minya-farm', label: 'مزارع منطقة الوفرة الإنتاجية الخصبة', landType: 'agricultural', areaSquareMeters: 900, price: 4_800 },
      { id: 'direct-land-sokhna-industrial', label: 'موقع ميناء الأحمدي للبتروكيماويات', landType: 'industrial', areaSquareMeters: 520, price: 7_200 },
    ],
    directCompanies: [
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
      { id: 'starter-village-land', label: 'أرض المنطقة الصناعية الجديدة · الدوحة', landType: 'agricultural', areaSquareMeters: 520, price: 3_600 },
      { id: 'direct-land-port-said', label: 'مجمع ميناء حمد اللوجستي الدولي', landType: 'commercial', areaSquareMeters: 420, price: 5_700 },
      { id: 'direct-land-minya-farm', label: 'مزارع الشمال القطرية الإنتاجية', landType: 'agricultural', areaSquareMeters: 900, price: 4_800 },
      { id: 'direct-land-sokhna-industrial', label: 'مدينة رأس لفان الصناعية للغاز والطاقة', landType: 'industrial', areaSquareMeters: 520, price: 7_200 },
    ],
    directCompanies: [
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
      { id: 'starter-village-land', label: 'مجمع مانشستر الصناعي (Trafford Park)', landType: 'agricultural', areaSquareMeters: 520, price: 3_600 },
      { id: 'direct-land-port-said', label: 'حوض ليفربول التجاري اللوجستي الدولي', landType: 'commercial', areaSquareMeters: 420, price: 5_700 },
      { id: 'direct-land-minya-farm', label: 'مزارع يوركشاير الزراعية الخصبة', landType: 'agricultural', areaSquareMeters: 900, price: 4_800 },
      { id: 'direct-land-sokhna-industrial', label: 'مجمع أبردين للبتروكيماويات وطاقة البحر', landType: 'industrial', areaSquareMeters: 520, price: 7_200 },
    ],
    directCompanies: [
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
      { id: 'starter-village-land', label: 'حزام الرور الصناعي الحديث · دوسلدورف', landType: 'agricultural', areaSquareMeters: 520, price: 3_600 },
      { id: 'direct-land-port-said', label: 'مجمع ميناء هامبورغ اللوجستي التجاري', landType: 'commercial', areaSquareMeters: 420, price: 5_700 },
      { id: 'direct-land-minya-farm', label: 'مزارع بافاريا الزراعية الإنتاجية', landType: 'agricultural', areaSquareMeters: 900, price: 4_800 },
      { id: 'direct-land-sokhna-industrial', label: 'مجمع لودفيغسهافن للصناعات الكيماوية', landType: 'industrial', areaSquareMeters: 520, price: 7_200 },
    ],
    directCompanies: [
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
      { id: 'starter-village-land', label: 'مجمع يوكوهاما البحري الصناعي · خليج طوكيو', landType: 'agricultural', areaSquareMeters: 520, price: 3_600 },
      { id: 'direct-land-port-said', label: 'ميناء ناغويا اللوجستي التجاري الدولي', landType: 'commercial', areaSquareMeters: 420, price: 5_700 },
      { id: 'direct-land-minya-farm', label: 'مزارع هوكايدو الزراعية الخصبة', landType: 'agricultural', areaSquareMeters: 900, price: 4_800 },
      { id: 'direct-land-sokhna-industrial', label: 'مجمع أوساكا لتكرير الطاقة والصناعات الثقيلة', landType: 'industrial', areaSquareMeters: 520, price: 7_200 },
    ],
    directCompanies: [
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
      { id: 'direct-land-jordan-sahab', label: 'أرض مدينة سحاب الصناعية', landType: 'industrial', areaSquareMeters: 520, price: 3_600 },
      { id: 'direct-land-jordan-aqaba', label: 'مجمع منطقة العقبة اللوجستية الخاصة', landType: 'commercial', areaSquareMeters: 420, price: 5_700 },
      { id: 'direct-land-jordan-shuna', label: 'أرض مزارع وادي الأردن والشونة', landType: 'agricultural', areaSquareMeters: 900, price: 4_800 },
      { id: 'direct-land-jordan-zarqa', label: 'موقع الهاشمية الصناعي للتعدين والكيماويات · الزرقاء', landType: 'industrial', areaSquareMeters: 520, price: 7_200 },
    ],
    directCompanies: [
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
