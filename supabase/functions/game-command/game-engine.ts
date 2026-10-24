// src/domain/countries.ts
var COUNTRIES = [
  {
    id: "egypt",
    name: "\u0645\u0635\u0631",
    flag: "\u{1F1EA}\u{1F1EC}",
    currency: { code: "EGP", symbol: "\u062C.\u0645", name: "\u0627\u0644\u062C\u0646\u064A\u0647 \u0627\u0644\u0645\u0635\u0631\u064A" },
    startingBalance: 1e6,
    economy: {
      exchangeRateToEgp: 1,
      companySetupFee: 75e3,
      licenseFeesByIndustry: {
        petroleum: 14e4,
        electricity: 105e3,
        gas: 12e4,
        water: 9e4,
        detergents: 55e3,
        food: 45e3,
        construction: 65e3,
        electronics: 85e3,
        transport: 5e4
      },
      taxRate: 0.12,
      customsRate: 0,
      operatingCostMultiplier: 1
    }
  }
];
function findCountry(countryId) {
  return COUNTRIES.find((country) => country.id === countryId);
}

// src/game/catalog.ts
var INDUSTRY_CATALOG = [
  { id: "petroleum", name: "\u0627\u0644\u0628\u062A\u0631\u0648\u0644", requiredLandType: "industrial", setupFee: 75e3, licenseFee: 14e4, dailyOperatingCost: 18e3, energyCapacity: 80, dailyEnergySupply: 42 },
  { id: "electricity", name: "\u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621", requiredLandType: "industrial", setupFee: 75e3, licenseFee: 105e3, dailyOperatingCost: 16e3, energyCapacity: 100, dailyEnergySupply: 55 },
  { id: "gas", name: "\u0627\u0644\u063A\u0627\u0632", requiredLandType: "industrial", setupFee: 75e3, licenseFee: 12e4, dailyOperatingCost: 15e3, energyCapacity: 80, dailyEnergySupply: 46 },
  { id: "water", name: "\u0627\u0644\u0645\u064A\u0627\u0647", requiredLandType: "industrial", setupFee: 75e3, licenseFee: 9e4, dailyOperatingCost: 11e3, energyCapacity: 70, dailyEnergySupply: 40 },
  { id: "detergents", name: "\u0627\u0644\u0645\u0646\u0638\u0641\u0627\u062A", requiredLandType: "industrial", setupFee: 75e3, licenseFee: 55e3, dailyOperatingCost: 7e3, energyCapacity: 60, dailyEnergySupply: 36 },
  { id: "food", name: "\u0627\u0644\u0623\u063A\u0630\u064A\u0629", requiredLandType: "agricultural", setupFee: 75e3, licenseFee: 45e3, dailyOperatingCost: 6e3, energyCapacity: 60, dailyEnergySupply: 34 },
  { id: "construction", name: "\u0645\u0648\u0627\u062F \u0627\u0644\u0628\u0646\u0627\u0621", requiredLandType: "industrial", setupFee: 75e3, licenseFee: 65e3, dailyOperatingCost: 9e3, energyCapacity: 75, dailyEnergySupply: 40 },
  { id: "electronics", name: "\u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A", requiredLandType: "commercial", setupFee: 75e3, licenseFee: 85e3, dailyOperatingCost: 1e4, energyCapacity: 75, dailyEnergySupply: 40 },
  { id: "transport", name: "\u0627\u0644\u0646\u0642\u0644", requiredLandType: "commercial", setupFee: 75e3, licenseFee: 5e4, dailyOperatingCost: 8e3, energyCapacity: 70, dailyEnergySupply: 42 }
];
var MATERIAL_CATALOG = [
  { id: "crude-oil", name: "\u062E\u0627\u0645 \u0627\u0644\u0646\u0641\u0637", unit: "\u0628\u0631\u0645\u064A\u0644", pricePerUnit: 4e3, storageLimit: 500 },
  { id: "natural-gas", name: "\u0627\u0644\u063A\u0627\u0632 \u0627\u0644\u0637\u0628\u064A\u0639\u064A", unit: "\u0648\u062D\u062F\u0629", pricePerUnit: 3e3, storageLimit: 500 },
  { id: "water", name: "\u0645\u064A\u0627\u0647 \u0645\u0639\u0627\u0644\u062C\u0629", unit: "\u0648\u062D\u062F\u0629", pricePerUnit: 250, storageLimit: 2e3 },
  { id: "chemicals", name: "\u0645\u0631\u0643\u0628\u0627\u062A \u0643\u064A\u0645\u064A\u0627\u0626\u064A\u0629", unit: "\u0643\u062C\u0645", pricePerUnit: 1200, storageLimit: 800 },
  { id: "grain", name: "\u062D\u0628\u0648\u0628", unit: "\u0643\u062C\u0645", pricePerUnit: 500, storageLimit: 1e3 },
  { id: "steel", name: "\u0641\u0648\u0644\u0627\u0630", unit: "\u0637\u0646", pricePerUnit: 8e3, storageLimit: 400 },
  { id: "cement", name: "\u0623\u0633\u0645\u0646\u062A", unit: "\u0637\u0646", pricePerUnit: 2e3, storageLimit: 800 },
  { id: "silicon", name: "\u0631\u0642\u0627\u0626\u0642 \u0633\u064A\u0644\u064A\u0643\u0648\u0646", unit: "\u0648\u062D\u062F\u0629", pricePerUnit: 1e4, storageLimit: 250 },
  { id: "fuel", name: "\u0648\u0642\u0648\u062F \u062A\u0634\u063A\u064A\u0644", unit: "\u0648\u062D\u062F\u0629", pricePerUnit: 2500, storageLimit: 500 },
  { id: "components", name: "\u0645\u0643\u0648\u0646\u0627\u062A \u0645\u064A\u0643\u0627\u0646\u064A\u0643\u064A\u0629", unit: "\u0648\u062D\u062F\u0629", pricePerUnit: 6e3, storageLimit: 300 },
  { id: "packaging", name: "\u0645\u0648\u0627\u062F \u062A\u063A\u0644\u064A\u0641", unit: "\u0648\u062D\u062F\u0629", pricePerUnit: 350, storageLimit: 1e3 }
];
var PRODUCT_CATALOG = [
  { id: "refined-fuel", name: "\u0648\u0642\u0648\u062F \u0645\u0643\u0631\u0631", unit: "\u0648\u062D\u062F\u0629", baseSellPrice: 14e3, storageLimit: 500 },
  { id: "power-units", name: "\u0648\u062D\u062F\u0627\u062A \u0643\u0647\u0631\u0628\u0627\u0621", unit: "\u0648\u062D\u062F\u0629", baseSellPrice: 3e3, storageLimit: 1e3 },
  { id: "bottled-gas", name: "\u063A\u0627\u0632 \u0645\u0639\u0628\u0623", unit: "\u0648\u062D\u062F\u0629", baseSellPrice: 1e4, storageLimit: 500 },
  { id: "clean-water", name: "\u0645\u064A\u0627\u0647 \u0646\u0638\u064A\u0641\u0629", unit: "\u0648\u062D\u062F\u0629", baseSellPrice: 2e3, storageLimit: 2e3 },
  { id: "detergent", name: "\u0645\u0646\u0638\u0641\u0627\u062A", unit: "\u0639\u0628\u0648\u0629", baseSellPrice: 4e3, storageLimit: 800 },
  { id: "food-pack", name: "\u0639\u0628\u0648\u0627\u062A \u063A\u0630\u0627\u0626\u064A\u0629", unit: "\u0639\u0628\u0648\u0629", baseSellPrice: 2500, storageLimit: 1e3 },
  { id: "building-blocks", name: "\u0645\u0648\u0627\u062F \u0628\u0646\u0627\u0621", unit: "\u0648\u062D\u062F\u0629", baseSellPrice: 16e3, storageLimit: 500 },
  { id: "electronics", name: "\u0623\u062C\u0647\u0632\u0629 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629", unit: "\u062C\u0647\u0627\u0632", baseSellPrice: 45e3, storageLimit: 250 },
  { id: "freight-service", name: "\u062E\u062F\u0645\u0627\u062A \u0646\u0642\u0644", unit: "\u0631\u062D\u0644\u0629", baseSellPrice: 22e3, storageLimit: 300 }
];
var RECIPE_CATALOG = [
  { id: "recipe-petroleum", industryId: "petroleum", productId: "refined-fuel", productName: "\u0648\u0642\u0648\u062F \u0645\u0643\u0631\u0631", outputQuantity: 4, outputUnit: "\u0648\u062D\u062F\u0629", inputs: [{ materialId: "crude-oil", quantity: 5 }], energyUnits: 10, energyCost: 1500, baseSellPrice: 14e3 },
  { id: "recipe-electricity", industryId: "electricity", productId: "power-units", productName: "\u0648\u062D\u062F\u0627\u062A \u0643\u0647\u0631\u0628\u0627\u0621", outputQuantity: 12, outputUnit: "\u0648\u062D\u062F\u0629", inputs: [{ materialId: "fuel", quantity: 2 }], energyUnits: 18, energyCost: 1e3, baseSellPrice: 3e3 },
  { id: "recipe-gas", industryId: "gas", productId: "bottled-gas", productName: "\u063A\u0627\u0632 \u0645\u0639\u0628\u0623", outputQuantity: 3, outputUnit: "\u0648\u062D\u062F\u0629", inputs: [{ materialId: "natural-gas", quantity: 4 }], energyUnits: 8, energyCost: 1200, baseSellPrice: 1e4 },
  { id: "recipe-water", industryId: "water", productId: "clean-water", productName: "\u0645\u064A\u0627\u0647 \u0646\u0638\u064A\u0641\u0629", outputQuantity: 12, outputUnit: "\u0648\u062D\u062F\u0629", inputs: [{ materialId: "water", quantity: 8 }], energyUnits: 6, energyCost: 700, baseSellPrice: 2e3 },
  { id: "recipe-detergents", industryId: "detergents", productId: "detergent", productName: "\u0645\u0646\u0638\u0641\u0627\u062A", outputQuantity: 5, outputUnit: "\u0639\u0628\u0648\u0629", inputs: [{ materialId: "chemicals", quantity: 2 }, { materialId: "water", quantity: 2 }], energyUnits: 5, energyCost: 600, baseSellPrice: 4e3 },
  { id: "recipe-food", industryId: "food", productId: "food-pack", productName: "\u0639\u0628\u0648\u0627\u062A \u063A\u0630\u0627\u0626\u064A\u0629", outputQuantity: 8, outputUnit: "\u0639\u0628\u0648\u0629", inputs: [{ materialId: "grain", quantity: 4 }, { materialId: "packaging", quantity: 1 }], energyUnits: 6, energyCost: 550, baseSellPrice: 2500 },
  { id: "recipe-construction", industryId: "construction", productId: "building-blocks", productName: "\u0645\u0648\u0627\u062F \u0628\u0646\u0627\u0621", outputQuantity: 4, outputUnit: "\u0648\u062D\u062F\u0629", inputs: [{ materialId: "steel", quantity: 2 }, { materialId: "cement", quantity: 4 }], energyUnits: 10, energyCost: 1e3, baseSellPrice: 16e3 },
  { id: "recipe-electronics", industryId: "electronics", productId: "electronics", productName: "\u0623\u062C\u0647\u0632\u0629 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629", outputQuantity: 1, outputUnit: "\u062C\u0647\u0627\u0632", inputs: [{ materialId: "silicon", quantity: 1 }, { materialId: "components", quantity: 2 }], energyUnits: 12, energyCost: 1400, baseSellPrice: 45e3 },
  { id: "recipe-transport", industryId: "transport", productId: "freight-service", productName: "\u062E\u062F\u0645\u0627\u062A \u0646\u0642\u0644", outputQuantity: 2, outputUnit: "\u0631\u062D\u0644\u0629", inputs: [{ materialId: "fuel", quantity: 3 }, { materialId: "components", quantity: 1 }], energyUnits: 14, energyCost: 900, baseSellPrice: 22e3 }
];
var AUCTION_CATALOG = [
  { id: "land-cairo-industrial", countryId: "egypt", lotType: "land", label: "\u0642\u0637\u0639\u0629 \u0627\u0644\u0642\u0627\u0647\u0631\u0629 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629", landType: "industrial", areaSquareMeters: 400, minimumBid: 16e4, bidIncrement: 1e4, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
  { id: "land-alexandria-farm", countryId: "egypt", lotType: "land", label: "\u0623\u0631\u0636 \u0627\u0644\u0625\u0633\u0643\u0646\u062F\u0631\u064A\u0629 \u0627\u0644\u0632\u0631\u0627\u0639\u064A\u0629", landType: "agricultural", areaSquareMeters: 650, minimumBid: 135e3, bidIncrement: 1e4, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
  { id: "land-suez-commerce", countryId: "egypt", lotType: "land", label: "\u0645\u0648\u0642\u0639 \u0627\u0644\u0633\u0648\u064A\u0633 \u0627\u0644\u062A\u062C\u0627\u0631\u064A", landType: "commercial", areaSquareMeters: 300, minimumBid: 21e4, bidIncrement: 15e3, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
  { id: "factory-petroleum-expansion", countryId: "egypt", lotType: "factory", label: "\u062E\u0637 \u062A\u0643\u0631\u064A\u0631 \u0625\u0636\u0627\u0641\u064A", landType: "industrial", areaSquareMeters: 0, minimumBid: 24e4, bidIncrement: 2e4, closesAt: "2099-12-31T00:00:00.000Z", status: "open", energyCapacityBonus: 40 },
  { id: "bulk-crude-oil", countryId: "egypt", lotType: "raw-material", label: "\u0634\u062D\u0646\u0629 \u062E\u0627\u0645 \u0646\u0641\u0637 \u0643\u0628\u064A\u0631\u0629", landType: "industrial", areaSquareMeters: 0, minimumBid: 3e4, bidIncrement: 4e3, closesAt: "2099-12-31T00:00:00.000Z", status: "open", materialId: "crude-oil", quantity: 15 }
];
var DIRECT_LAND_CATALOG = [
  { id: "starter-village-land", label: "\u0623\u0631\u0636 \u0642\u0631\u064A\u0629 \u0627\u0644\u0646\u062E\u064A\u0644 \xB7 \u0639\u0631\u0636 \u0648\u062C\u064A\u0647 \u0627\u0644\u0642\u0631\u064A\u0629", landType: "agricultural", areaSquareMeters: 520, price: 18e4 },
  { id: "direct-land-port-said", label: "\u0623\u0631\u0636 \u0628\u0648\u0631\u0633\u0639\u064A\u062F \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0629", landType: "commercial", areaSquareMeters: 420, price: 285e3 },
  { id: "direct-land-minya-farm", label: "\u0645\u0632\u0631\u0639\u0629 \u0627\u0644\u0645\u0646\u064A\u0627 \u0627\u0644\u0625\u0646\u062A\u0627\u062C\u064A\u0629", landType: "agricultural", areaSquareMeters: 900, price: 24e4 },
  { id: "direct-land-sokhna-industrial", label: "\u0645\u0648\u0642\u0639 \u0627\u0644\u0639\u064A\u0646 \u0627\u0644\u0633\u062E\u0646\u0629 \u0627\u0644\u0635\u0646\u0627\u0639\u064A", landType: "industrial", areaSquareMeters: 520, price: 36e4 }
];
var DIRECT_COMPANY_CATALOG = [
  { id: "direct-company-food", name: "\u0634\u0631\u0643\u0629 \u0627\u0644\u0646\u064A\u0644 \u0644\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629", industryId: "food", landType: "agricultural", areaSquareMeters: 650, price: 43e4 },
  { id: "direct-company-logistics", name: "\u0634\u0631\u0643\u0629 \u0627\u0644\u0645\u0645\u0631\u0627\u062A \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0629", industryId: "transport", landType: "commercial", areaSquareMeters: 500, price: 52e4 },
  { id: "direct-company-energy", name: "\u0634\u0631\u0643\u0629 \u0637\u0627\u0642\u0629 \u0627\u0644\u0645\u0633\u062A\u0642\u0628\u0644", industryId: "electricity", landType: "industrial", areaSquareMeters: 600, price: 68e4 }
];
var INVESTMENT_CATALOG = [
  { id: "treasury-note", name: "\u0633\u0646\u062F \u0627\u0644\u062E\u0632\u064A\u0646\u0629 \u0627\u0644\u0645\u062D\u0644\u064A", minimumAmount: 5e4, maximumAmount: 5e5, durationDays: 3, returnRate: 0.08, riskRate: 0 },
  { id: "warehouse-fund", name: "\u0635\u0646\u062F\u0648\u0642 \u062A\u0648\u0633\u0639\u0629 \u0627\u0644\u0645\u062E\u0627\u0632\u0646", minimumAmount: 1e5, maximumAmount: 4e5, durationDays: 5, returnRate: 0.18, riskRate: 0.08 }
];
var GOLD_PRICE_PER_GRAM = 6e3;
var TASK_CATALOG = [
  { id: "task-first-land", title: "\u0623\u0648\u0644 \u0645\u0644\u0643\u064A\u0629", description: "\u0627\u0645\u062A\u0644\u0643 \u0642\u0637\u0639\u0629 \u0623\u0631\u0636 \u0648\u0627\u062D\u062F\u0629.", condition: "own-land", reward: 25e3 },
  { id: "task-first-company", title: "\u062A\u0623\u0633\u064A\u0633 \u0627\u0644\u0625\u0645\u0628\u0631\u0627\u0637\u0648\u0631\u064A\u0629", description: "\u0623\u0633\u0633 \u0634\u0631\u0643\u062A\u0643 \u0627\u0644\u0623\u0648\u0644\u0649.", condition: "own-company", reward: 35e3 },
  { id: "task-first-material", title: "\u0627\u0644\u0645\u062E\u0632\u0646 \u0627\u0644\u0623\u0648\u0644", description: "\u0627\u0634\u062A\u0631\u0650 \u0645\u0627\u062F\u0629 \u062E\u0627\u0645.", condition: "buy-material", reward: 1e4 },
  { id: "task-first-production", title: "\u062E\u0637 \u0627\u0644\u0625\u0646\u062A\u0627\u062C", description: "\u0634\u063A\u0651\u0644 \u062F\u0641\u0639\u0629 \u0625\u0646\u062A\u0627\u062C.", condition: "run-production", reward: 3e4 },
  { id: "task-first-sale", title: "\u0623\u0648\u0644 \u0639\u0645\u0644\u064A\u0629 \u0628\u064A\u0639", description: "\u0628\u0639 \u0645\u0646\u062A\u062C\u064B\u0627 \u062A\u0645\u0644\u0643\u0647.", condition: "sell-product", reward: 2e4 },
  { id: "task-first-investment", title: "\u062A\u0646\u0648\u064A\u0639 \u0631\u0623\u0633 \u0627\u0644\u0645\u0627\u0644", description: "\u0623\u0646\u0634\u0626 \u0627\u0633\u062A\u062B\u0645\u0627\u0631\u064B\u0627.", condition: "make-investment", reward: 2e4 },
  { id: "task-day-three", title: "\u062B\u0644\u0627\u062B\u0629 \u0623\u064A\u0627\u0645", description: "\u0645\u0631\u0651\u0631 \u062B\u0644\u0627\u062B\u0629 \u0623\u064A\u0627\u0645 \u0641\u064A \u0627\u0644\u0639\u0627\u0644\u0645.", condition: "reach-day-3", reward: 4e4 }
];
function findIndustry(industryId) {
  return INDUSTRY_CATALOG.find((entry) => entry.id === industryId);
}
function findMaterial(materialId) {
  return MATERIAL_CATALOG.find((entry) => entry.id === materialId);
}
function findRecipeForIndustry(industryId) {
  return RECIPE_CATALOG.find((entry) => entry.industryId === industryId);
}
function findInvestment(investmentId) {
  return INVESTMENT_CATALOG.find((entry) => entry.id === investmentId);
}

// src/game/economyBalance.ts
var ECONOMY_BALANCE = {
  operatingCostGrowthPerDay: 15e-4,
  operatingCostGrowthCap: 0.35,
  marketPriceGrowthPerDay: 8e-4,
  marketPriceGrowthCap: 0.25
};
function getOperatingCostProgression(day) {
  return 1 + Math.min(ECONOMY_BALANCE.operatingCostGrowthCap, Math.max(0, day - 1) * ECONOMY_BALANCE.operatingCostGrowthPerDay);
}
function getMarketPriceProgression(day) {
  return 1 + Math.min(ECONOMY_BALANCE.marketPriceGrowthCap, Math.max(0, day - 1) * ECONOMY_BALANCE.marketPriceGrowthPerDay);
}
function getInvestmentPayoutRate(returnRate, durationDays) {
  return returnRate * durationDays / 30;
}

// src/game/market.ts
function seededValue(seed) {
  let hash2 = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash2 ^= seed.charCodeAt(index);
    hash2 = Math.imul(hash2, 16777619);
  }
  return hash2 >>> 0;
}
function getMarketQuote(profile, productId, day = profile.day) {
  const product = PRODUCT_CATALOG.find((item) => item.id === productId);
  if (!product) return null;
  const productIndex = PRODUCT_CATALOG.findIndex((item) => item.id === productId);
  const seed = seededValue(`${profile.id}:${productId}:${day}`);
  const priceShift = seed % 31 - 15;
  const demandShift = Math.floor(seed / 31) % 11 - 5;
  const baseDemand = 16 + productIndex * 5 % 13;
  const eventDemandMultiplier = profile.events.filter((event) => event.productId === productId && event.day <= day && (event.effectExpiresOnDay ?? event.day) >= day && typeof event.demandMultiplier === "number").reduce((multiplier, event) => multiplier * (event.demandMultiplier ?? 1), 1);
  const currentPrice = Math.max(1, Math.round(product.baseSellPrice * getMarketPriceProgression(day) * (1 + priceShift / 100)));
  const trend = priceShift >= 6 ? "up" : priceShift <= -6 ? "down" : "steady";
  return {
    productId,
    demandUnits: Math.max(4, Math.round((baseDemand + demandShift) * eventDemandMultiplier)),
    currentPrice,
    basePrice: product.baseSellPrice,
    trend,
    trendLabel: trend === "up" ? "\u0637\u0644\u0628 \u0645\u0631\u062A\u0641\u0639" : trend === "down" ? "\u0633\u0648\u0642 \u0647\u0627\u062F\u0626" : "\u0633\u0648\u0642 \u0645\u0633\u062A\u0642\u0631"
  };
}

// src/game/time.ts
var GAME_DAY_MS = 24 * 60 * 1e3;

// src/game/auctions.ts
var AUCTION_CYCLE_DAYS = 1;
function getAuctionCloseAt(profile, listing) {
  const parsedStart = Date.parse(profile.createdAt);
  const worldStart = Number.isFinite(parsedStart) ? parsedStart : Date.now();
  return listing.closesAt || new Date(worldStart + AUCTION_CYCLE_DAYS * GAME_DAY_MS).toISOString();
}
function wasWon(profile, listingId) {
  return profile.lands.some((land) => land.id === listingId || land.id.startsWith(`${listingId}-renewed-`)) || profile.assets.some((asset) => asset.id === listingId || asset.id.startsWith(`${listingId}-renewed-`)) || profile.auctionHistory.some((bid) => bid.listingId.startsWith(listingId) && bid.bidder === "player");
}
function getAuctionListings(profile) {
  const worldStart = Number.isFinite(Date.parse(profile.createdAt)) ? Date.parse(profile.createdAt) : Date.now();
  const closesAt = new Date(worldStart + (profile.day + AUCTION_CYCLE_DAYS) * GAME_DAY_MS).toISOString();
  const regular = AUCTION_CATALOG.map((base) => ({
    ...base,
    id: `${base.id}-day-${profile.day}`,
    label: `${base.label} \xB7 \u062F\u0648\u0631\u0629 \u0627\u0644\u064A\u0648\u0645 ${profile.day}`,
    closesAt,
    status: "open"
  })).filter((listing) => !wasWon(profile, listing.id));
  const rareId = `season-rare-${profile.day}`;
  const rare = {
    id: rareId,
    countryId: "egypt",
    lotType: "factory",
    label: `\u0645\u0632\u0627\u062F \u0627\u0644\u0645\u0648\u0633\u0645 \u0627\u0644\u0646\u0627\u062F\u0631 \xB7 \u062A\u0648\u0633\u0639\u0629 \u0627\u0644\u064A\u0648\u0645 ${profile.day}`,
    landType: "industrial",
    areaSquareMeters: 0,
    minimumBid: 45e4 + profile.day % 3 * 25e3,
    bidIncrement: 25e3,
    closesAt,
    status: "open",
    energyCapacityBonus: 90
  };
  return profile.auctionHistory.some((bid) => bid.listingId === rareId && bid.bidder === "player") ? regular : [...regular, rare];
}
function resolveAuctionListing(profile, listingId) {
  return getAuctionListings(profile).find((listing) => listing.id === listingId);
}
function isAuctionOpen(profile, listing) {
  return listing.status === "open" && Date.now() < Date.parse(getAuctionCloseAt(profile, listing));
}

// src/game/contracts.ts
var CLIENTS = [
  { name: "\u0645\u062A\u062C\u0631 \u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u0627\u0642\u062A\u0635\u0627\u062F\u064A", type: "budget", multiplier: 0.92, description: "\u064A\u0631\u0643\u0651\u0632 \u0639\u0644\u0649 \u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u0645\u0646\u062E\u0641\u0636 \u0648\u0627\u0644\u062A\u0648\u0631\u064A\u062F \u0627\u0644\u0645\u0646\u062A\u0638\u0645." },
  { name: "\u0645\u0624\u0633\u0633\u0629 \u0627\u0644\u062C\u0648\u062F\u0629 \u0627\u0644\u0623\u0648\u0644\u0649", type: "quality", multiplier: 1.18, description: "\u064A\u062F\u0641\u0639 \u0623\u0643\u062B\u0631 \u0644\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0630\u0627\u062A \u0627\u0644\u062C\u0648\u062F\u0629 \u0627\u0644\u0639\u0627\u0644\u064A\u0629." },
  { name: "\u0634\u0631\u0643\u0629 \u0627\u0644\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0643\u0628\u0631\u0649", type: "bulk", multiplier: 1.04, description: "\u064A\u0637\u0644\u0628 \u0643\u0645\u064A\u0627\u062A \u0643\u0628\u064A\u0631\u0629 \u0645\u0642\u0627\u0628\u0644 \u0645\u0643\u0627\u0641\u0623\u0629 \u062D\u062C\u0645." },
  { name: "\u0639\u0645\u064A\u0644 \u0627\u0644\u062A\u0648\u0631\u064A\u062F \u0627\u0644\u0639\u0627\u062C\u0644", type: "urgent", multiplier: 1.28, description: "\u0645\u0647\u0644\u0629 \u0642\u0635\u064A\u0631\u0629 \u0648\u0645\u0643\u0627\u0641\u0623\u0629 \u0645\u0631\u062A\u0641\u0639\u0629 \u0644\u0644\u0645\u0633\u062A\u0639\u062F." }
];
function hash(value) {
  let result = 2166136261;
  for (const character of value) result = Math.imul(result ^ character.charCodeAt(0), 16777619);
  return result >>> 0;
}
function getContractOffers(profile) {
  return [0, 1, 2].map((slot) => {
    const index = hash(`${profile.id}:${profile.day}:${slot}`) % PRODUCT_CATALOG.length;
    const product = PRODUCT_CATALOG[index];
    const client = CLIENTS[hash(`${profile.id}:${profile.day}:client:${slot}`) % CLIENTS.length];
    const quote = getMarketQuote(profile, product.id) ?? { currentPrice: product.baseSellPrice, demandUnits: 12 };
    const quantity = client.type === "bulk" ? 18 + hash(`${profile.day}:${slot}`) % 12 : 5 + hash(`${profile.day}:qty:${slot}`) % 8;
    const deadline = profile.day + (client.type === "urgent" ? 1 : client.type === "bulk" ? 4 : 3);
    const unitPrice = Math.max(1, Math.round(quote.currentPrice * client.multiplier));
    return {
      id: `contract-${profile.day}-${slot}`,
      clientName: client.name,
      clientType: client.type,
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice,
      reward: Math.round(unitPrice * quantity * 0.12),
      reputationReward: client.type === "urgent" ? 8 : 5,
      minimumQuality: client.type === "quality" ? 92 : void 0,
      deadlineDay: deadline,
      description: client.description
    };
  });
}

// src/game/synergy.ts
function getSynergyBonuses(profile) {
  const companies = profile.companies;
  const has = (industryId) => companies.filter((company) => company.industryId === industryId);
  const bonuses = [];
  const food = has("food");
  const transport = has("transport");
  const production = companies.filter((company) => !["transport", "food"].includes(company.industryId));
  if (food.length > 0 && transport.length > 0) bonuses.push({ id: "supply-chain", title: "\u0633\u0644\u0633\u0644\u0629 \u0627\u0644\u063A\u0630\u0627\u0621 \u0648\u0627\u0644\u0646\u0642\u0644", description: "\u0631\u0628\u0637 \u0627\u0644\u0623\u063A\u0630\u064A\u0629 \u0628\u0627\u0644\u0646\u0642\u0644 \u064A\u062E\u0641\u0636 \u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u062A\u0634\u063A\u064A\u0644 8% \u0648\u064A\u062D\u0633\u0646 \u0643\u0641\u0627\u0621\u0629 \u0627\u0644\u0625\u0646\u062A\u0627\u062C 5%.", companyIds: [...food, ...transport].map((company) => company.id), costMultiplier: 0.92, productionMultiplier: 1.05 });
  if (transport.length > 0 && production.length > 0) bonuses.push({ id: "industrial-logistics", title: "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0625\u0646\u062A\u0627\u062C", description: "\u0634\u0631\u0643\u0629 \u0627\u0644\u0646\u0642\u0644 \u062A\u062E\u062F\u0645 \u062E\u0637\u0648\u0637 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0648\u062A\u062E\u0641\u0636 \u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A 6%.", companyIds: [...transport, ...production].map((company) => company.id), costMultiplier: 0.94, productionMultiplier: 1 });
  if (companies.length >= 2 && profile.inventory.some((lot) => lot.quantity > 0)) bonuses.push({ id: "shared-warehouse", title: "\u0645\u062E\u0632\u0646 \u0645\u0634\u062A\u0631\u0643", description: "\u062A\u0639\u062F\u062F \u0627\u0644\u0634\u0631\u0643\u0627\u062A \u0645\u0639 \u0645\u062E\u0632\u0648\u0646 \u0642\u0627\u0626\u0645 \u064A\u0642\u0644\u0644 \u0645\u0635\u0631\u0648\u0641 \u0627\u0644\u062A\u0634\u063A\u064A\u0644 3%.", companyIds: companies.map((company) => company.id), costMultiplier: 0.97, productionMultiplier: 1 });
  return bonuses;
}
function getSynergyOperatingMultiplier(profile) {
  return getSynergyBonuses(profile).reduce((multiplier, bonus) => multiplier * bonus.costMultiplier, 1);
}
function getSynergyProductionMultiplier(profile) {
  return getSynergyBonuses(profile).reduce((multiplier, bonus) => multiplier * bonus.productionMultiplier, 1);
}

// src/game/globalMarket.ts
var SELLERS = ["\u0645\u0648\u0627\u0646\u0626 \u0627\u0644\u0645\u062A\u0648\u0633\u0637", "\u0634\u0628\u0643\u0629 \u0627\u0644\u0646\u064A\u0644 \u0644\u0644\u062A\u0648\u0631\u064A\u062F", "\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u0634\u0631\u0642", "\u062A\u062D\u0627\u0644\u0641 \u0627\u0644\u0645\u0635\u0627\u0646\u0639"];
var PRICE_FACTORS = [0.92, 1, 1.12];
function getGlobalMarketOffers(profile) {
  return MATERIAL_CATALOG.flatMap((material, materialIndex) => [0, 1, 2].map((offerIndex) => {
    const factor = PRICE_FACTORS[(offerIndex + profile.day + materialIndex) % PRICE_FACTORS.length];
    const eventPriceMultiplier = profile.events.filter((event) => event.materialId === material.id && event.day <= profile.day && (event.effectExpiresOnDay ?? event.day) >= profile.day && typeof event.materialPriceMultiplier === "number").reduce((multiplier, event) => multiplier * (event.materialPriceMultiplier ?? 1), 1);
    const unitPrice = Math.max(1, Math.round(material.pricePerUnit * factor * eventPriceMultiplier));
    const negotiable = (offerIndex + profile.day + materialIndex) % 3 !== 1;
    return {
      id: `global-${material.id}-day-${profile.day}-offer-${offerIndex}`,
      materialId: material.id,
      sellerName: SELLERS[(materialIndex + offerIndex + profile.day) % SELLERS.length],
      unitPrice,
      floorPrice: negotiable ? Math.max(1, Math.round(unitPrice * 0.9)) : unitPrice,
      negotiable,
      confidence: offerIndex === 1 ? "high" : offerIndex === 0 ? "medium" : "low"
    };
  }));
}
function resolveGlobalMarketOffer(profile, offerId) {
  return getGlobalMarketOffers(profile).find((offer) => offer.id === offerId);
}

// src/game/economicEvents.ts
var ECONOMIC_EVENT_TEMPLATES = [
  { title: "\u0637\u0644\u0628 \u0645\u062D\u0644\u064A \u0645\u0631\u062A\u0641\u0639", description: "\u064A\u0632\u062F\u0627\u062F \u0627\u0644\u0637\u0644\u0628 \u0627\u0644\u064A\u0648\u0645\u064A \u0639\u0644\u0649 \u0639\u0628\u0648\u0627\u062A \u0627\u0644\u0623\u063A\u0630\u064A\u0629 \u0628\u0646\u0633\u0628\u0629 \u0662\u0660\u066A \u0644\u0645\u062F\u0629 \u0663 \u0623\u064A\u0627\u0645.", cashImpact: 18e3, industryId: "food", productId: "food-pack", demandMultiplier: 1.2, durationDays: 3 },
  { title: "\u0627\u0631\u062A\u0641\u0627\u0639 \u0644\u0648\u062C\u0633\u062A\u064A \u0645\u0624\u0642\u062A", description: "\u064A\u0631\u062A\u0641\u0639 \u0633\u0639\u0631 \u0648\u0642\u0648\u062F \u0627\u0644\u062A\u0634\u063A\u064A\u0644 \u0628\u0646\u0633\u0628\u0629 \u0661\u0660\u066A \u0644\u0645\u062F\u0629 \u064A\u0648\u0645\u064A\u0646 \u0628\u0633\u0628\u0628 \u0636\u063A\u0637 \u0627\u0644\u0646\u0642\u0644.", cashImpact: -14e3, industryId: "transport", materialId: "fuel", materialPriceMultiplier: 1.1, durationDays: 2 },
  { title: "\u064A\u0648\u0645 \u0627\u0633\u062A\u0642\u0631\u0627\u0631 \u0627\u0642\u062A\u0635\u0627\u062F\u064A", description: "\u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0648\u0627\u0644\u0637\u0644\u0628 \u0645\u0633\u062A\u0642\u0631\u0627\u0646 \u0627\u0644\u064A\u0648\u0645\u060C \u0648\u0644\u0627 \u064A\u0648\u062C\u062F \u0623\u062B\u0631 \u0633\u0648\u0642\u064A \u0625\u0636\u0627\u0641\u064A.", cashImpact: 0 },
  { title: "\u0645\u0646\u062D\u0629 \u062F\u0639\u0645 \u0644\u0644\u0645\u0635\u0627\u0646\u0639 \u0627\u0644\u0635\u063A\u064A\u0631\u0629", description: "\u062F\u0639\u0645 \u0645\u0627\u0644\u064A \u0645\u062E\u0635\u0635 \u0644\u0634\u0631\u0643\u0627\u062A \u0627\u0644\u0623\u063A\u0630\u064A\u0629 \u0627\u0644\u0635\u063A\u064A\u0631\u0629.", cashImpact: 26e3, industryId: "food" },
  { title: "\u0646\u0642\u0635 \u0645\u0624\u0642\u062A \u0641\u064A \u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u062E\u0627\u0645", description: "\u064A\u0642\u0644 \u0627\u0644\u0645\u0639\u0631\u0648\u0636 \u0645\u0646 \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u060C \u0641\u064A\u0631\u062A\u0641\u0639 \u0633\u0639\u0631\u0647 \u0628\u0646\u0633\u0628\u0629 \u0662\u0665\u066A \u0644\u0645\u062F\u0629 \u0664 \u0623\u064A\u0627\u0645.", cashImpact: -22e3, industryId: "construction", materialId: "steel", materialPriceMultiplier: 1.25, durationDays: 4 },
  { title: "\u0641\u0631\u0635\u0629 \u062A\u0635\u062F\u064A\u0631 \u0627\u0633\u062A\u062B\u0646\u0627\u0626\u064A\u0629", description: "\u064A\u0631\u062A\u0641\u0639 \u0627\u0644\u0637\u0644\u0628 \u0639\u0644\u0649 \u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629 \u0628\u0646\u0633\u0628\u0629 \u0662\u0660\u066A \u0644\u0645\u062F\u0629 \u0663 \u0623\u064A\u0627\u0645.", cashImpact: 34e3, industryId: "electronics", productId: "electronics", demandMultiplier: 1.2, durationDays: 3 },
  { title: "\u0641\u062D\u0635 \u062A\u0646\u0638\u064A\u0645\u064A \u0648\u062A\u0643\u0627\u0644\u064A\u0641 \u0627\u0645\u062A\u062B\u0627\u0644", description: "\u062A\u0643\u0627\u0644\u064A\u0641 \u0627\u0645\u062A\u062B\u0627\u0644 \u0625\u0636\u0627\u0641\u064A\u0629 \u0639\u0644\u0649 \u0642\u0637\u0627\u0639 \u0627\u0644\u0628\u062A\u0631\u0648\u0644.", cashImpact: -18e3, industryId: "petroleum" },
  { title: "\u0645\u0648\u0633\u0645 \u062A\u062C\u0627\u0631\u064A \u0642\u0648\u064A", description: "\u0645\u0648\u0633\u0645 \u0628\u064A\u0639 \u0642\u0648\u064A \u064A\u0631\u0641\u0639 \u0627\u0644\u0637\u0644\u0628 \u0639\u0644\u0649 \u0639\u0628\u0648\u0627\u062A \u0627\u0644\u0623\u063A\u0630\u064A\u0629 \u0628\u0646\u0633\u0628\u0629 \u0662\u0665\u066A \u0644\u0645\u062F\u0629 \u0665 \u0623\u064A\u0627\u0645.", cashImpact: 42e3, industryId: "food", productId: "food-pack", demandMultiplier: 1.25, durationDays: 5 }
];
function getEconomicEventTemplate(day) {
  const index = Math.max(0, Math.floor(day) - 1) % ECONOMIC_EVENT_TEMPLATES.length;
  return ECONOMIC_EVENT_TEMPLATES[index];
}

// src/domain/accountFeatures.ts
var SPEED_CARD_LABELS = {
  "production-25": "\u062A\u0633\u0631\u064A\u0639 \u0627\u0644\u0625\u0646\u062A\u0627\u062C 25%",
  "production-50": "\u062A\u0633\u0631\u064A\u0639 \u0627\u0644\u0625\u0646\u062A\u0627\u062C 50%",
  "production-instant": "\u0625\u0643\u0645\u0627\u0644 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0641\u0648\u0631\u064B\u0627",
  "capacity-boost": "\u0632\u064A\u0627\u062F\u0629 \u0627\u0644\u0633\u0639\u0629 \u0627\u0644\u0645\u0624\u0642\u062A\u0629",
  "day-speed-2x": "\u062A\u0633\u0631\u064A\u0639 \u0627\u0644\u064A\u0648\u0645 \xD72",
  "day-speed-3x": "\u062A\u0633\u0631\u064A\u0639 \u0627\u0644\u064A\u0648\u0645 \xD73"
};
var SPEED_CARD_DIAMOND_COSTS = {
  "production-25": 12,
  "production-50": 24,
  "production-instant": 60,
  "capacity-boost": 36,
  "day-speed-2x": 30,
  "day-speed-3x": 60
};

// src/game/warehouse.ts
var CAPACITIES = [
  { materials: 0, products: 0 },
  { materials: 8050, products: 6850 },
  { materials: 1e4, products: 9e3 },
  { materials: 13500, products: 12e3 },
  { materials: 18e3, products: 16e3 },
  { materials: 24e3, products: 22e3 }
];
var WAREHOUSE_UPGRADE_REQUIREMENTS = {
  2: { cash: 4e4, materials: { steel: 2, cement: 5 } },
  3: { cash: 9e4, materials: { steel: 8, cement: 16, components: 2 } },
  4: { cash: 18e4, materials: { steel: 20, cement: 45, components: 8 } },
  5: { cash: 35e4, materials: { steel: 50, cement: 100, components: 25 } }
};
function normalizeWarehouseLevel(level) {
  return typeof level === "number" && Number.isInteger(level) && level >= 1 && level <= 5 ? level : 1;
}
function getWarehouseCapacity(level) {
  return CAPACITIES[normalizeWarehouseLevel(level)];
}
function getWarehouseItemCapacity(itemId, level) {
  const multiplier = 1 + (normalizeWarehouseLevel(level) - 1) * 0.5;
  const item = MATERIAL_CATALOG.find((entry) => entry.id === itemId) ?? PRODUCT_CATALOG.find((entry) => entry.id === itemId);
  return item ? Math.floor(item.storageLimit * multiplier) : void 0;
}
function getWarehouseUsage(inventory, productionOrders) {
  const materials = new Set(MATERIAL_CATALOG.map((item) => item.id));
  const products = new Set(PRODUCT_CATALOG.map((item) => item.id));
  const materialUsage = inventory.reduce((sum, lot) => sum + (materials.has(lot.materialOrProductId) ? lot.quantity : 0), 0);
  const storedProducts = inventory.reduce((sum, lot) => sum + (products.has(lot.materialOrProductId) ? lot.quantity : 0), 0);
  const reservedProducts = productionOrders.reduce((sum, order) => sum + (order.status === "active" ? order.outputQuantity : 0), 0);
  return { materials: materialUsage, products: storedProducts + reservedProducts };
}
function getWarehouseMaterialQuantity(profile, materialId) {
  return profile.inventory.filter((lot) => lot.materialOrProductId === materialId).reduce((sum, lot) => sum + lot.quantity, 0);
}
function removeWarehouseMaterials(profile, requirements) {
  const remaining = new Map(Object.entries(requirements));
  const updated = profile.inventory.map((lot) => {
    const needed = remaining.get(lot.materialOrProductId) ?? 0;
    if (needed <= 0) return lot;
    const removed = Math.min(needed, lot.quantity);
    remaining.set(lot.materialOrProductId, needed - removed);
    return { ...lot, quantity: lot.quantity - removed };
  });
  return updated.filter((lot) => lot.quantity > 0);
}

// src/game/purchasePricing.ts
var DIAMOND_VALUE_EGP = 12e3;
var DIAMOND_PURCHASE_DISCOUNT_RATE = 0.01;
function getDiscountedDiamondPrice(cashPrice) {
  if (!Number.isFinite(cashPrice) || cashPrice <= 0) return 0;
  return Math.floor(cashPrice * (1 - DIAMOND_PURCHASE_DISCOUNT_RATE) / DIAMOND_VALUE_EGP);
}
function getCashPriceForDiamondPrice(diamondPrice) {
  if (!Number.isFinite(diamondPrice) || diamondPrice <= 0) return 0;
  return Math.ceil(diamondPrice * DIAMOND_VALUE_EGP / (1 - DIAMOND_PURCHASE_DISCOUNT_RATE));
}

// src/game/season.ts
var SEASON_LENGTH_DAYS = 30;
var SEASON_ID_PREFIX = "expansion-season-";
function happenedOnDay(day, profile, occurredAt) {
  if (day !== void 0) return day === profile.day;
  if (!occurredAt) return false;
  const createdAt = Date.parse(profile.createdAt);
  const eventAt = Date.parse(occurredAt);
  return Number.isFinite(createdAt) && Number.isFinite(eventAt) && Math.max(1, Math.floor((eventAt - createdAt) / 864e5) + 1) === profile.day;
}
function startedInSeason(day, season) {
  return day !== void 0 && day >= season.startedOnDay && day <= season.endsOnDay;
}
var SEASON_CHALLENGES = [
  { id: "daily-empire", kind: "daily", title: "\u062D\u0631\u0651\u0643 \u0627\u0644\u0625\u0645\u0628\u0631\u0627\u0637\u0648\u0631\u064A\u0629", description: "\u0627\u0645\u062A\u0644\u0643 \u0634\u0631\u0643\u0629 \u0623\u0648 \u0623\u0631\u0636\u064B\u0627 \u0644\u062A\u062B\u0628\u062A \u0623\u0646 \u0627\u0644\u0625\u0645\u0628\u0631\u0627\u0637\u0648\u0631\u064A\u0629 \u062A\u062A\u062D\u0631\u0643.", points: 10, reward: 1e4, available: (profile) => profile.companies.some((item) => happenedOnDay(item.foundedOnDay, profile, item.foundedAt)) || profile.lands.some((item) => happenedOnDay(item.acquiredOnDay, profile, item.acquiredAt)) },
  { id: "daily-market", kind: "daily", title: "\u0646\u0628\u0636 \u0627\u0644\u0633\u0648\u0642", description: "\u0646\u0641\u0651\u0630 \u0639\u0645\u0644\u064A\u0629 \u0628\u064A\u0639 \u0648\u0627\u062D\u062F\u0629 \u0641\u064A \u0627\u0644\u0633\u0648\u0642.", points: 15, reward: 15e3, available: (profile) => profile.sales.some((item) => happenedOnDay(item.soldOnDay, profile, item.soldAt)) },
  { id: "daily-auction", kind: "daily", title: "\u0635\u0648\u062A \u0627\u0644\u0645\u0637\u0631\u0642\u0629", description: "\u0634\u0627\u0631\u0643 \u0641\u064A \u0645\u0632\u0627\u062F \u0648\u0627\u062D\u062F \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.", points: 15, reward: 15e3, available: (profile) => profile.auctionHistory.some((item) => item.bidder === "player" && item.day === profile.day) },
  { id: "weekly-builder", kind: "weekly", title: "\u0645\u0648\u0633\u0651\u0639 \u0627\u0644\u0623\u0639\u0645\u0627\u0644", description: "\u0623\u0633\u0633 \u0634\u0631\u0643\u062A\u064A\u0646 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 \u062E\u0644\u0627\u0644 \u0627\u0644\u0645\u0648\u0633\u0645.", points: 45, reward: 45e3, available: (profile, season) => profile.companies.filter((item) => startedInSeason(item.foundedOnDay, season)).length >= 2 },
  { id: "weekly-operator", kind: "weekly", title: "\u0642\u0627\u0626\u062F \u0627\u0644\u062A\u0634\u063A\u064A\u0644", description: "\u0634\u063A\u0651\u0644 \u0623\u0645\u0631 \u0625\u0646\u062A\u0627\u062C \u0648\u0627\u062D\u062F \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.", points: 35, reward: 35e3, available: (profile, season) => profile.productionOrders.some((item) => startedInSeason(item.startedOnDay, season)) },
  { id: "weekly-investor", kind: "weekly", title: "\u0639\u064A\u0646 \u0639\u0644\u0649 \u0627\u0644\u0645\u0633\u062A\u0642\u0628\u0644", description: "\u0623\u0646\u0634\u0626 \u0627\u0633\u062A\u062B\u0645\u0627\u0631\u064B\u0627 \u0623\u0648 \u0648\u062F\u064A\u0639\u0629 \u0645\u062D\u0627\u0643\u0627\u0629.", points: 30, reward: 3e4, available: (profile, season) => profile.investments.some((item) => startedInSeason(item.startedOnDay, season)) || profile.banking.deposits.some((item) => startedInSeason(item.startedOnDay, season)) }
];
var LOGIN_REWARDS = [
  { id: "cash", title: "\u0633\u064A\u0648\u0644\u0629 \u0641\u0648\u0631\u064A\u0629", description: "25,000 \u062C\u0646\u064A\u0647 \u0645\u062D\u0627\u0643\u0627\u0629", points: 5 },
  { id: "gold", title: "\u0630\u0647\u0628 \u0644\u0644\u0645\u062D\u0641\u0638\u0629", description: "0.5 \u063A\u0631\u0627\u0645 \u0630\u0647\u0628 \u0645\u062D\u0627\u0643\u0627\u0629", points: 5 },
  { id: "diamonds", title: "\u0645\u0627\u0633 \u0627\u0644\u0625\u0645\u0628\u0631\u0627\u0637\u0648\u0631\u064A\u0629", description: "8 \u0645\u0627\u0633\u0627\u062A \u0645\u062C\u0627\u0646\u064A\u0629 \u0644\u0644\u0628\u0637\u0627\u0642\u0627\u062A", points: 5 }
];
function getSeasonId(day) {
  return `${SEASON_ID_PREFIX}${Math.floor(Math.max(0, day - 1) / SEASON_LENGTH_DAYS) + 1}`;
}
function activeSeason(profile) {
  const seasonId = getSeasonId(profile.day);
  const start = Math.floor(Math.max(0, profile.day - 1) / SEASON_LENGTH_DAYS) * SEASON_LENGTH_DAYS + 1;
  const current = profile.season;
  if (current?.seasonId === seasonId) return current;
  return { seasonId, startedOnDay: start, endsOnDay: start + SEASON_LENGTH_DAYS - 1, points: 0, claimedChallengeKeys: [] };
}
function getSeasonSnapshot(profile) {
  const season = activeSeason(profile);
  const challenges = SEASON_CHALLENGES.map((challenge) => {
    const key = `${profile.day}:${challenge.id}`;
    const claimed = challenge.kind === "daily" ? season.claimedChallengeKeys.includes(key) : season.claimedChallengeKeys.includes(challenge.id);
    return { ...challenge, claimed, available: !claimed && challenge.available(profile, season) };
  });
  const nextReward = Math.min(100, 100 - season.points % 100);
  return { season, challenges, nextReward, progressPercent: Math.min(100, season.points % 100), loginRewardClaimed: season.claimedLoginRewardDay === profile.day };
}
function withLedger(profile, amount, note, extra = {}) {
  const entry = { id: `season-${profile.day}-${(profile.ledger ?? []).length + 1}`, category: "revenue", amount, countryId: profile.countryId, occurredAt: (/* @__PURE__ */ new Date()).toISOString(), note };
  const ledger = [...profile.ledger, entry];
  const totalRevenue = ledger.filter((item) => item.category === "revenue").reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = ledger.filter((item) => item.category === "expense").reduce((sum, item) => sum + item.amount, 0);
  return { ...profile, ...extra, bankBalance: profile.bankBalance + amount, ledger, finances: { netProfit: totalRevenue - totalExpenses, totalRevenue, totalExpenses } };
}
function claimSeasonChallenge(profile, challengeId) {
  const snapshot = getSeasonSnapshot(profile);
  const challenge = snapshot.challenges.find((item) => item.id === challengeId);
  if (!challenge) return { ok: false, profile, reason: "not-found", message: "\u062A\u062D\u062F\u064A \u0627\u0644\u0645\u0648\u0633\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F." };
  if (challenge.claimed) return { ok: false, profile, reason: "already-claimed", message: "\u062A\u0645 \u062A\u062D\u0635\u064A\u0644 \u0647\u0630\u0627 \u0627\u0644\u062A\u062D\u062F\u064A \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0641\u062A\u0631\u0629." };
  if (!challenge.available) return { ok: false, profile, reason: "condition-not-met", message: "\u0644\u0645 \u064A\u062A\u062D\u0642\u0642 \u0634\u0631\u0637 \u0627\u0644\u062A\u062D\u062F\u064A \u0628\u0639\u062F." };
  const key = challenge.kind === "daily" ? `${profile.day}:${challenge.id}` : challenge.id;
  const season = { ...snapshot.season, points: snapshot.season.points + challenge.points, claimedChallengeKeys: [...snapshot.season.claimedChallengeKeys, key] };
  const nextProfile = withLedger(profile, challenge.reward, `\u0645\u0643\u0627\u0641\u0623\u0629 \u0645\u0648\u0633\u0645 \u0627\u0644\u062A\u0648\u0633\u0639: ${challenge.title}`, { season });
  return { ok: true, profile: nextProfile, message: `\u0623\u062D\u0633\u0646\u062A! \u062D\u0635\u0644\u062A \u0639\u0644\u0649 ${challenge.points} \u0646\u0642\u0637\u0629 \u0648${challenge.reward.toLocaleString("ar-EG")} \u062C.\u0645 \u0645\u0646 \u0627\u0644\u0645\u0648\u0633\u0645.`, data: { challengeId, points: challenge.points } };
}
function claimLoginReward(profile, rewardId) {
  const snapshot = getSeasonSnapshot(profile);
  if (snapshot.loginRewardClaimed) return { ok: false, profile, reason: "already-claimed", message: "\u0627\u0633\u062A\u0644\u0645\u062A \u0645\u0643\u0627\u0641\u0623\u0629 \u0627\u0644\u062F\u062E\u0648\u0644 \u0627\u0644\u064A\u0648\u0645." };
  const reward = LOGIN_REWARDS.find((item) => item.id === rewardId);
  if (!reward) return { ok: false, profile, reason: "not-found", message: "\u0645\u0643\u0627\u0641\u0623\u0629 \u0627\u0644\u062F\u062E\u0648\u0644 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629." };
  const season = { ...snapshot.season, points: snapshot.season.points + reward.points, claimedLoginRewardDay: profile.day };
  if (rewardId === "gold") {
    const nextProfile2 = withLedger(profile, 0, "\u0645\u0643\u0627\u0641\u0623\u0629 \u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0648\u0633\u0645: 0.5 \u063A\u0631\u0627\u0645 \u0630\u0647\u0628", { season, goldGrams: Math.round((profile.goldGrams + 0.5) * 10) / 10, goldCostBasis: profile.goldCostBasis + 3e3 });
    return { ok: true, profile: nextProfile2, message: "\u062A\u0645\u062A \u0625\u0636\u0627\u0641\u0629 0.5 \u063A\u0631\u0627\u0645 \u0630\u0647\u0628 \u0645\u062D\u0627\u0643\u0627\u0629 \u0625\u0644\u0649 \u0645\u062D\u0641\u0638\u062A\u0643.", data: { rewardId } };
  }
  if (rewardId === "diamonds") {
    const nextProfile2 = withLedger(profile, 0, "\u0645\u0643\u0627\u0641\u0623\u0629 \u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0648\u0633\u0645: 8 \u0645\u0627\u0633\u0627\u062A", { season, diamonds: profile.diamonds + 8 });
    return { ok: true, profile: nextProfile2, message: "\u062A\u0645\u062A \u0625\u0636\u0627\u0641\u0629 8 \u0645\u0627\u0633\u0627\u062A \u0645\u062C\u0627\u0646\u064A\u0629 \u0625\u0644\u0649 \u062D\u0633\u0627\u0628\u0643.", data: { rewardId } };
  }
  const nextProfile = withLedger(profile, 25e3, "\u0645\u0643\u0627\u0641\u0623\u0629 \u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0648\u0633\u0645: \u0633\u064A\u0648\u0644\u0629 \u0641\u0648\u0631\u064A\u0629", { season });
  return { ok: true, profile: nextProfile, message: "\u062A\u0645\u062A \u0625\u0636\u0627\u0641\u0629 25,000 \u062C.\u0645 \u0645\u062D\u0627\u0643\u0627\u0629 \u0625\u0644\u0649 \u0631\u0635\u064A\u062F\u0643.", data: { rewardId } };
}
var SEASON_EVENTS = [
  { title: "\u0641\u0631\u0635\u0629 \u062A\u0648\u0631\u064A\u062F \u0639\u0627\u062C\u0644\u0629", description: "\u0648\u0635\u0644 \u0637\u0644\u0628 \u0643\u0628\u064A\u0631 \u0645\u0646 \u0627\u0644\u0633\u0648\u0642\u060C \u0644\u0643\u0646 \u0627\u0644\u0642\u0631\u0627\u0631 \u064A\u062D\u062A\u0627\u062C \u0633\u0631\u0639\u0629.", choices: [{ id: "safe", label: "\u0628\u064A\u0639 \u0645\u0646 \u0627\u0644\u0645\u062E\u0632\u0648\u0646", description: "12,000 \u062C.\u0645 \u06485 \u0646\u0642\u0627\u0637", reward: 12e3, points: 5 }, { id: "bold", label: "\u0627\u0642\u0628\u0644 \u0627\u0644\u0637\u0644\u0628 \u0627\u0644\u0643\u0628\u064A\u0631", description: "24,000 \u062C.\u0645 \u064810 \u0646\u0642\u0627\u0637", reward: 24e3, points: 10 }] },
  { title: "\u0645\u0648\u0642\u0639 \u062A\u0648\u0633\u0639\u0629 \u062C\u062F\u064A\u062F", description: "\u0638\u0647\u0631 \u0645\u0648\u0642\u0639 \u0645\u0646\u0627\u0633\u0628 \u0642\u0631\u0628 \u0645\u0646\u0634\u0622\u062A\u0643 \u0648\u064A\u0645\u0643\u0646 \u0627\u0633\u062A\u063A\u0644\u0627\u0644\u0647 \u0627\u0644\u064A\u0648\u0645.", choices: [{ id: "reserve", label: "\u0627\u062D\u062C\u0632 \u0627\u0644\u0645\u0648\u0642\u0639", description: "18,000 \u062C.\u0645 \u06488 \u0646\u0642\u0627\u0637", reward: 18e3, points: 8 }, { id: "wait", label: "\u0627\u0646\u062A\u0638\u0631 \u0641\u0631\u0635\u0629 \u0623\u0641\u0636\u0644", description: "8,000 \u062C.\u0645 \u06484 \u0646\u0642\u0627\u0637", reward: 8e3, points: 4 }] },
  { title: "\u0645\u0646\u0627\u0641\u0633 \u064A\u0636\u063A\u0637 \u0627\u0644\u0633\u0648\u0642", description: "\u062E\u0641\u0636 \u0645\u0646\u0627\u0641\u0633 \u0623\u0633\u0639\u0627\u0631\u0647\u060C \u0648\u064A\u0645\u0643\u0646\u0643 \u0627\u0644\u0631\u062F \u0628\u0647\u062F\u0648\u0621 \u0623\u0648 \u0628\u0627\u0644\u0645\u062E\u0627\u0637\u0631\u0629.", choices: [{ id: "steady", label: "\u062D\u0627\u0641\u0638 \u0639\u0644\u0649 \u0627\u0644\u0633\u0639\u0631", description: "10,000 \u062C.\u0645 \u06485 \u0646\u0642\u0627\u0637", reward: 1e4, points: 5 }, { id: "compete", label: "\u0646\u0627\u0641\u0633 \u0628\u0642\u0648\u0629", description: "22,000 \u062C.\u0645 \u06489 \u0646\u0642\u0627\u0637", reward: 22e3, points: 9 }] }
];
function getSeasonEventSnapshot(profile) {
  const season = getSeasonSnapshot(profile);
  const event = SEASON_EVENTS[(profile.day - 1) % SEASON_EVENTS.length];
  return { event, claimed: season.season.claimedChallengeKeys.includes(`event:${profile.day}`) };
}
function chooseSeasonEvent(profile, choiceId) {
  const snapshot = getSeasonEventSnapshot(profile);
  if (snapshot.claimed) return { ok: false, profile, reason: "already-claimed", message: "\u0627\u062A\u062E\u0630\u062A \u0642\u0631\u0627\u0631 \u062D\u062F\u062B \u0627\u0644\u064A\u0648\u0645 \u0628\u0627\u0644\u0641\u0639\u0644." };
  const choice = snapshot.event.choices.find((item) => item.id === choiceId);
  if (!choice) return { ok: false, profile, reason: "not-found", message: "\u062E\u064A\u0627\u0631 \u0627\u0644\u062D\u062F\u062B \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F." };
  const currentSeason = getSeasonSnapshot(profile).season;
  const season = { ...currentSeason, points: currentSeason.points + choice.points, claimedChallengeKeys: [...currentSeason.claimedChallengeKeys, `event:${profile.day}`] };
  const nextProfile = withLedger(profile, choice.reward, `\u0642\u0631\u0627\u0631 \u0645\u0648\u0633\u0645 \u0627\u0644\u062A\u0648\u0633\u0639: ${snapshot.event.title} \xB7 ${choice.label}`, { season });
  return { ok: true, profile: nextProfile, message: `\u062A\u0645 \u062A\u0646\u0641\u064A\u0630 \u0627\u0644\u0642\u0631\u0627\u0631 \u0648\u062D\u0635\u0644\u062A \u0639\u0644\u0649 ${choice.reward.toLocaleString("ar-EG")} \u062C.\u0645 \u0648${choice.points} \u0646\u0642\u0627\u0637 \u0645\u0648\u0633\u0645.`, data: { choiceId } };
}

// src/game/engine.ts
var DAY_MS = GAME_DAY_MS;
function timestampFor(profile) {
  const base = Date.parse(profile.createdAt);
  return new Date((Number.isFinite(base) ? base : 0) + Math.max(0, profile.day - 1) * DAY_MS).toISOString();
}
function nextId(profile, prefix, collectionLength) {
  return `${prefix}-${profile.day}-${collectionLength + 1}`;
}
function success(profile, message, data) {
  return { ok: true, profile, message, data };
}
function failure(profile, reason, message) {
  return { ok: false, profile, reason, message };
}
function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}
function resolvePurchaseDebit(profile, cashPrice, paymentMethod = "cash", fixedDiamondPrice) {
  if (paymentMethod !== "cash" && paymentMethod !== "diamonds") return { message: "\u0648\u0633\u064A\u0644\u0629 \u0627\u0644\u062F\u0641\u0639 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629." };
  if (!Number.isFinite(cashPrice) || cashPrice <= 0) return { message: "\u0633\u0639\u0631 \u0627\u0644\u0634\u0631\u0627\u0621 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D." };
  if (paymentMethod === "cash") {
    if (profile.bankBalance < cashPrice) return { message: "\u0644\u0627 \u064A\u0643\u0641\u064A \u0631\u0635\u064A\u062F \u0627\u0644\u0628\u0646\u0643 \u0644\u0625\u062A\u0645\u0627\u0645 \u0639\u0645\u0644\u064A\u0629 \u0627\u0644\u0634\u0631\u0627\u0621." };
    return { bankBalance: profile.bankBalance - cashPrice, diamonds: profile.diamonds, diamondsSpent: 0 };
  }
  const diamondsSpent = fixedDiamondPrice ?? getDiscountedDiamondPrice(cashPrice);
  if (!Number.isInteger(diamondsSpent) || diamondsSpent < 1) return { message: "\u0642\u064A\u0645\u0629 \u0627\u0644\u0633\u0644\u0639\u0629 \u0623\u0642\u0644 \u0645\u0646 \u062D\u062F \u0627\u0644\u062F\u0641\u0639 \u0628\u0645\u0627\u0633\u0629 \u0643\u0627\u0645\u0644\u0629\u061B \u0627\u062E\u062A\u0631 \u0627\u0644\u062F\u0641\u0639 \u0646\u0642\u062F\u064B\u0627." };
  if (profile.diamonds < diamondsSpent) return { message: `\u0644\u0627 \u064A\u0643\u0641\u064A \u0631\u0635\u064A\u062F \u0627\u0644\u0645\u0627\u0633\u061B \u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 ${diamondsSpent} \u0645\u0627\u0633\u0629.` };
  return { bankBalance: profile.bankBalance, diamonds: profile.diamonds - diamondsSpent, diamondsSpent };
}
function unpaidSalaryTotal(profile) {
  return profile.staff.filter((employee) => employee.status === "active").reduce((sum, employee) => sum + (employee.unpaidSalary ?? 0), 0);
}
function addLedger(profile, entries, bankBalance, extra = {}) {
  const currentPayables = Math.max(0, extra.payables ?? profile.payables);
  const cashInflow = Math.max(0, bankBalance - profile.bankBalance);
  const automaticSettlement = Math.min(currentPayables, cashInflow);
  const settlementEntries = automaticSettlement > 0 ? [ledgerEntry(profile, "settlement", automaticSettlement, "\u0633\u062F\u0627\u062F \u0627\u0644\u062A\u0632\u0627\u0645\u0627\u062A \u0645\u0646 \u0625\u064A\u0631\u0627\u062F \u062D\u062F\u064A\u062B", entries.length)] : [];
  const ledger = [...profile.ledger ?? [], ...entries, ...settlementEntries];
  const totalRevenue = ledger.filter((entry) => entry.category === "revenue").reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpenses = ledger.filter((entry) => entry.category === "expense").reduce((sum, entry) => sum + entry.amount, 0);
  return {
    ...profile,
    ...extra,
    bankBalance: Math.max(0, bankBalance - automaticSettlement),
    payables: currentPayables - automaticSettlement,
    ledger,
    finances: { netProfit: totalRevenue - totalExpenses, totalRevenue, totalExpenses }
  };
}
function ledgerEntry(profile, category, amount, note, index) {
  return { id: nextId(profile, "ledger", (profile.ledger ?? []).length + index), category, amount, countryId: profile.countryId, occurredAt: timestampFor(profile), note };
}
function syncTasks(profile) {
  const existing = new Map((profile.tasks ?? []).map((task) => [task.taskId, task]));
  const automaticBadges = [
    profile.companies.length > 0 ? "\u0634\u0627\u0631\u0629 \u0627\u0644\u0645\u0624\u0633\u0633" : null,
    profile.productionOrders.length > 0 ? "\u0645\u0634\u063A\u0651\u0644 \u0645\u0635\u0646\u0639" : null,
    profile.sales.length >= 3 ? "\u0635\u0627\u0626\u062F \u0627\u0644\u0633\u0648\u0642" : null,
    profile.staff.filter((member) => member.status === "active").length >= 2 ? "\u0642\u0627\u0626\u062F \u0641\u0631\u064A\u0642" : null,
    profile.investments.length > 0 || profile.banking.deposits.length > 0 ? "\u0639\u064A\u0646 \u0639\u0644\u0649 \u0627\u0644\u0645\u0633\u062A\u0642\u0628\u0644" : null
  ].filter((badge) => Boolean(badge));
  return {
    ...profile,
    tasks: TASK_CATALOG.map((task) => existing.get(task.id) ?? { taskId: task.id, claimed: false }),
    badges: [.../* @__PURE__ */ new Set([...profile.badges ?? [], ...automaticBadges])]
  };
}
function conditionMet(profile, condition) {
  switch (condition) {
    case "own-land":
      return profile.lands.length > 0;
    case "own-company":
      return profile.companies.length > 0;
    case "buy-material":
      return profile.ledger.some((entry) => entry.note.startsWith("\u0634\u0631\u0627\u0621 "));
    case "run-production":
      return profile.productionOrders.length > 0;
    case "sell-product":
      return profile.sales.length > 0;
    case "make-investment":
      return profile.investments.length > 0;
    case "reach-day-3":
      return profile.day >= 3;
  }
}
function ensureEgypt(profile) {
  return profile.countryId === "egypt" && findCountry(profile.countryId) ? null : failure(profile, "wrong-country", "\u0647\u0630\u0647 \u0627\u0644\u062C\u0648\u0644\u0629 \u0645\u062A\u0627\u062D\u0629 \u0644\u0645\u0635\u0631 \u0641\u0642\u0637.");
}
function placeBid(profile, listingId, amount, targetCompanyId) {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount <= 0) return failure(profile, "invalid-input", "\u0642\u064A\u0645\u0629 \u0627\u0644\u0639\u0631\u0636 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0645\u0628\u0644\u063A\u064B\u0627 \u0635\u062D\u064A\u062D\u064B\u0627 \u0645\u0648\u062C\u0628\u064B\u0627.");
  const listing = resolveAuctionListing(profile, listingId);
  if (listing && !isAuctionOpen(profile, listing)) return failure(profile, "not-found", "\u0627\u0644\u0645\u0632\u0627\u062F \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u0645\u063A\u0644\u0642.");
  if (!listing) return failure(profile, "not-found", "\u0627\u0644\u0645\u0632\u0627\u062F \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u0645\u063A\u0644\u0642.");
  if (profile.lands.some((land2) => land2.id === listing.id) || profile.assets.some((asset) => asset.id === listing.id) || profile.ledger.some((entry) => entry.note.includes(listing.label))) return failure(profile, "already-owned", "\u0644\u0642\u062F \u0641\u0632\u062A \u0628\u0647\u0630\u0627 \u0627\u0644\u0645\u0632\u0627\u062F \u0628\u0627\u0644\u0641\u0639\u0644.");
  if (amount < listing.minimumBid) return failure(profile, "invalid-input", "\u064A\u062C\u0628 \u0623\u0646 \u064A\u0633\u0627\u0648\u064A \u0627\u0644\u0639\u0631\u0636 \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u062F\u0646\u0649 \u0644\u0644\u0645\u0632\u0627\u062F \u0623\u0648 \u064A\u062A\u062C\u0627\u0648\u0632\u0647.");
  const highestBotBid = listing.minimumBid + listing.bidIncrement;
  const botBids = [
    { bidderId: `${listing.id}-bot-a`, amount: listing.minimumBid + listing.bidIncrement },
    { bidderId: `${listing.id}-bot-b`, amount: highestBotBid }
  ];
  if (amount <= highestBotBid) {
    return failure(profile, "auction-lost", `\u062E\u0633\u0631 \u0639\u0631\u0636\u0643 \u0627\u0644\u0645\u0632\u0627\u062F\u061B \u0623\u0639\u0644\u0649 \u0639\u0631\u0636 \u0645\u0646\u0627\u0641\u0633 \u0643\u0627\u0646 ${highestBotBid.toLocaleString("ar-EG")} \u062C.\u0645.`);
  }
  if (profile.bankBalance < amount) return failure(profile, "insufficient-funds", "\u0644\u0627 \u064A\u0643\u0641\u064A \u0631\u0635\u064A\u062F\u0643 \u0644\u062A\u0633\u062F\u064A\u062F \u0627\u0644\u0639\u0631\u0636 \u0627\u0644\u0641\u0627\u0626\u0632.");
  const auctionHistory = [
    ...profile.auctionHistory,
    ...botBids.map((bid, index) => ({ id: `${listing.id}-bot-${profile.auctionHistory.length + index}`, listingId, bidder: "bot", bidderId: bid.bidderId, amount: bid.amount, day: profile.day, occurredAt: timestampFor(profile) })),
    { id: `${listing.id}-player-${profile.auctionHistory.length}`, listingId, bidder: "player", bidderId: profile.id, amount, day: profile.day, occurredAt: timestampFor(profile) }
  ];
  const acquiredAt = timestampFor(profile);
  if (listing.lotType === "factory") {
    const company = profile.companies.find((item) => item.id === targetCompanyId) ?? profile.companies[0];
    if (!company) return failure(profile, "condition-not-met", "\u0623\u0633\u0633 \u0634\u0631\u0643\u0629 \u0623\u0648\u0644\u064B\u0627 \u062D\u062A\u0649 \u062A\u0631\u0628\u0637 \u0628\u0647\u0627 \u062E\u0637 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0627\u0644\u0641\u0627\u0626\u0632 \u0628\u0627\u0644\u0645\u0632\u0627\u062F.");
    const bonus = listing.energyCapacityBonus ?? 40;
    const companyId = company.id;
    const assetId = listing.id;
    const asset = { id: assetId, label: `\u0645\u0635\u0646\u0639 \u0625\u0636\u0627\u0641\u064A: ${listing.label}`, value: amount, acquiredAt };
    const companies = profile.companies.map((item) => item.id === companyId ? { ...item, energyCapacity: (item.energyCapacity ?? 0) + bonus, energyUnits: (item.energyUnits ?? 0) + bonus } : item);
    const nextProfile2 = addLedger(
      { ...profile, assets: [...profile.assets, asset], companies, auctionHistory },
      [ledgerEntry(profile, "asset", amount, `\u0634\u0631\u0627\u0621 \u0645\u0635\u0646\u0639 \u0628\u0627\u0644\u0645\u0632\u0627\u062F: ${listing.label}`, 0)],
      profile.bankBalance - amount
    );
    return success(syncTasks(nextProfile2), `\u0641\u0632\u062A \u0628\u062E\u0637 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0648\u0631\u0628\u0637\u062A\u0647 \u0628\u0634\u0631\u0643\u0629 ${company.name}.`, { listingId, winner: "player", winningAmount: amount, botBids, assetId, companyId });
  }
  if (listing.lotType === "raw-material") {
    const material = findMaterial(listing.materialId ?? "");
    const quantity = listing.quantity ?? 0;
    if (!material || !isPositiveInteger(quantity)) return failure(profile, "not-found", "\u0628\u064A\u0627\u0646\u0627\u062A \u0634\u062D\u0646\u0629 \u0627\u0644\u0645\u0632\u0627\u062F \u063A\u064A\u0631 \u0645\u0643\u062A\u0645\u0644\u0629.");
    const existing = profile.inventory.find((lot) => lot.materialOrProductId === material.id);
    const level = normalizeWarehouseLevel(profile.warehouseLevel);
    const itemLimit = getWarehouseItemCapacity(material.id, level) ?? material.storageLimit;
    const warehouseUsage = getWarehouseUsage(profile.inventory, profile.productionOrders);
    const warehouseCapacity = getWarehouseCapacity(level);
    if ((existing?.quantity ?? 0) + quantity > itemLimit || warehouseUsage.materials + quantity > warehouseCapacity.materials) return failure(profile, "storage-limit", "\u0633\u0639\u0629 \u0627\u0644\u0645\u062E\u0632\u0646 \u0644\u0627 \u062A\u0643\u0641\u064A \u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0634\u062D\u0646\u0629 \u0627\u0644\u0641\u0627\u0626\u0632\u0629\u061B \u0637\u0648\u0651\u0631 \u0627\u0644\u0645\u062E\u0632\u0646 \u0623\u0648 \u0623\u0641\u0631\u063A \u0645\u0633\u0627\u062D\u0629.");
    const inventoryLotId = existing?.id ?? nextId(profile, "inventory", profile.inventory.length);
    const unitCost = amount / quantity;
    const inventory = existing ? profile.inventory.map((lot) => lot.id === existing.id ? { ...lot, quantity: lot.quantity + quantity, unitCost: (lot.quantity * lot.unitCost + amount) / (lot.quantity + quantity) } : lot) : [...profile.inventory, { id: inventoryLotId, materialOrProductId: material.id, quantity, unit: material.unit, unitCost }];
    const nextProfile2 = addLedger(
      { ...profile, inventory, auctionHistory },
      [ledgerEntry(profile, "asset", amount, `\u0634\u0631\u0627\u0621 ${quantity} ${material.unit} \u0645\u0646 ${material.name} \u0628\u0627\u0644\u0645\u0632\u0627\u062F: ${listing.label}`, 0)],
      profile.bankBalance - amount
    );
    return success(syncTasks(nextProfile2), `\u0641\u0632\u062A \u0628\u0634\u062D\u0646\u0629 ${quantity} ${material.unit} \u0645\u0646 ${material.name} \u0648\u0623\u064F\u0636\u064A\u0641\u062A \u0625\u0644\u0649 \u0627\u0644\u0645\u062E\u0632\u0646.`, { listingId, winner: "player", winningAmount: amount, botBids, inventoryLotId });
  }
  const land = {
    id: listing.id,
    label: listing.label,
    areaSquareMeters: listing.areaSquareMeters,
    purchasePrice: amount,
    acquiredAt,
    acquiredOnDay: profile.day,
    availableForCompanyOnDay: profile.day + 1,
    landType: listing.landType
  };
  const nextProfile = addLedger(
    { ...profile, lands: [...profile.lands, land], auctionHistory },
    [ledgerEntry(profile, "asset", amount, `\u0634\u0631\u0627\u0621 \u0623\u0631\u0636 \u0628\u0627\u0644\u0645\u0632\u0627\u062F: ${listing.label}`, 0)],
    profile.bankBalance - amount
  );
  return success(syncTasks(nextProfile), `\u062A\u0645 \u0627\u0644\u0641\u0648\u0632 \u0628\u0627\u0644\u0645\u0632\u0627\u062F. \u0628\u062F\u0623 \u0625\u0646\u0647\u0627\u0621 \u0639\u0642\u0648\u062F \u0646\u0642\u0644 \u0627\u0644\u0645\u0644\u0643\u064A\u0629\u061B \u0633\u062A\u0643\u0648\u0646 \u0627\u0644\u0623\u0631\u0636 \u0645\u062A\u0627\u062D\u0629 \u0628\u0639\u062F \u064A\u0648\u0645 \u062F\u0627\u062E\u0644 \u0627\u0644\u0644\u0639\u0628\u0629\u060C \u0641\u064A \u0627\u0644\u064A\u0648\u0645 ${profile.day + 1}. \u062A\u062D\u0644\u0651\u064E \u0628\u0627\u0644\u0635\u0628\u0631.`, {
    listingId,
    winner: "player",
    winningAmount: amount,
    botBids,
    landId: land.id
  });
}
function buyDirectLand(profile, listingId, paymentMethod = "cash") {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  const listing = DIRECT_LAND_CATALOG.find((entry) => entry.id === listingId);
  if (!listing) return failure(profile, "not-found", "\u0639\u0631\u0636 \u0627\u0644\u0623\u0631\u0636 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F.");
  if (profile.lands.some((land2) => land2.id === listing.id)) return failure(profile, "already-owned", "\u062A\u0645 \u0634\u0631\u0627\u0621 \u0647\u0630\u0647 \u0627\u0644\u0623\u0631\u0636 \u0628\u0627\u0644\u0641\u0639\u0644.");
  const payment = resolvePurchaseDebit(profile, listing.price, paymentMethod);
  if ("message" in payment) return failure(profile, "insufficient-funds", payment.message);
  const land = { id: listing.id, label: listing.label, areaSquareMeters: listing.areaSquareMeters, purchasePrice: listing.price, acquiredAt: timestampFor(profile), acquiredOnDay: profile.day, availableForCompanyOnDay: profile.day + 1, landType: listing.landType };
  const nextProfile = addLedger(
    { ...profile, lands: [...profile.lands, land] },
    [ledgerEntry(profile, "asset", listing.price, `\u0634\u0631\u0627\u0621 \u0623\u0631\u0636 \u0645\u0628\u0627\u0634\u0631: ${listing.label}`, 0)],
    payment.bankBalance,
    { diamonds: payment.diamonds }
  );
  return success(syncTasks(nextProfile), `\u062A\u0645 \u0634\u0631\u0627\u0621 ${listing.label} ${paymentMethod === "diamonds" ? `\u0645\u0642\u0627\u0628\u0644 ${payment.diamondsSpent} \u0645\u0627\u0633\u0629` : "\u0646\u0642\u062F\u064B\u0627"}. \u0628\u062F\u0623 \u0625\u0646\u0647\u0627\u0621 \u0639\u0642\u0648\u062F \u0646\u0642\u0644 \u0627\u0644\u0645\u0644\u0643\u064A\u0629\u061B \u0633\u062A\u0643\u0648\u0646 \u0627\u0644\u0623\u0631\u0636 \u0645\u062A\u0627\u062D\u0629 \u0628\u0639\u062F \u064A\u0648\u0645 \u062F\u0627\u062E\u0644 \u0627\u0644\u0644\u0639\u0628\u0629\u060C \u0641\u064A \u0627\u0644\u064A\u0648\u0645 ${profile.day + 1}. \u062A\u062D\u0644\u0651\u064E \u0628\u0627\u0644\u0635\u0628\u0631.`, { landId: land.id, price: listing.price, diamondsSpent: payment.diamondsSpent });
}
function buyDirectCompany(profile, listingId, paymentMethod = "cash") {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  const listing = DIRECT_COMPANY_CATALOG.find((entry) => entry.id === listingId);
  const industry = listing ? findIndustry(listing.industryId) : void 0;
  if (!listing || !industry) return failure(profile, "not-found", "\u0639\u0631\u0636 \u0627\u0644\u0634\u0631\u0643\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F.");
  if (profile.companies.some((company2) => company2.id === listing.id)) return failure(profile, "already-owned", "\u062A\u0645 \u0634\u0631\u0627\u0621 \u0647\u0630\u0647 \u0627\u0644\u0634\u0631\u0643\u0629 \u0628\u0627\u0644\u0641\u0639\u0644.");
  const payment = resolvePurchaseDebit(profile, listing.price, paymentMethod);
  if ("message" in payment) return failure(profile, "insufficient-funds", payment.message);
  const landId = `${listing.id}-land`;
  const licenseId = `${listing.id}-license`;
  const land = { id: landId, label: `${listing.name} \xB7 \u0623\u0631\u0636 \u0627\u0644\u0634\u0631\u0643\u0629`, areaSquareMeters: listing.areaSquareMeters, purchasePrice: Math.floor(listing.price * 0.45), acquiredAt: timestampFor(profile), acquiredOnDay: profile.day, availableForCompanyOnDay: profile.day + 1, landType: listing.landType };
  const company = { id: listing.id, name: listing.name, industryId: listing.industryId, countryId: profile.countryId, foundedAt: timestampFor(profile), operationalFromDay: profile.day + 1, landId, licenseIds: [licenseId], energyUnits: industry.energyCapacity, energyCapacity: industry.energyCapacity, operatingCostPerDay: industry.dailyOperatingCost };
  const license = { id: licenseId, countryId: profile.countryId, industryId: listing.industryId, feePaid: Math.floor(listing.price * 0.15), issuedAt: timestampFor(profile) };
  const nextProfile = addLedger(
    { ...profile, lands: [...profile.lands, land], companies: [...profile.companies, company], licenses: [...profile.licenses, license] },
    [ledgerEntry(profile, "asset", listing.price, `\u0634\u0631\u0627\u0621 \u0634\u0631\u0643\u0629 \u0645\u0628\u0627\u0634\u0631: ${listing.name}`, 0)],
    payment.bankBalance,
    { diamonds: payment.diamonds }
  );
  return success(syncTasks(nextProfile), `\u062A\u0645 \u0634\u0631\u0627\u0621 ${listing.name} ${paymentMethod === "diamonds" ? `\u0645\u0642\u0627\u0628\u0644 ${payment.diamondsSpent} \u0645\u0627\u0633\u0629` : "\u0646\u0642\u062F\u064B\u0627"}. \u064A\u062C\u0631\u064A \u0625\u0646\u0647\u0627\u0621 \u0639\u0642\u0648\u062F \u0646\u0642\u0644 \u0627\u0644\u0645\u0644\u0643\u064A\u0629\u060C \u0648\u064A\u0628\u062F\u0623 \u0627\u0644\u062A\u0634\u063A\u064A\u0644 \u0628\u0639\u062F \u064A\u0648\u0645 \u062F\u0627\u062E\u0644 \u0627\u0644\u0644\u0639\u0628\u0629 \u0641\u064A \u0627\u0644\u064A\u0648\u0645 ${profile.day + 1}. \u062A\u062D\u0644\u0651\u064E \u0628\u0627\u0644\u0635\u0628\u0631.`, { companyId: company.id, landId, price: listing.price, diamondsSpent: payment.diamondsSpent });
}
function sellLand(profile, landId) {
  const land = profile.lands.find((item) => item.id === landId);
  if (!land) return failure(profile, "not-found", "\u0627\u0644\u0623\u0631\u0636 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629.");
  if (profile.companies.some((company) => company.landId === landId)) return failure(profile, "condition-not-met", "\u0644\u0627 \u064A\u0645\u0643\u0646 \u0628\u064A\u0639 \u0623\u0631\u0636 \u0645\u0631\u062A\u0628\u0637\u0629 \u0628\u0634\u0631\u0643\u0629. \u0628\u0639 \u0627\u0644\u0634\u0631\u0643\u0629 \u0623\u0648 \u0627\u0646\u0642\u0644\u0647\u0627 \u0623\u0648\u0644\u064B\u0627.");
  const payout = Math.floor(land.purchasePrice * 0.5);
  const nextProfile = addLedger({ ...profile, lands: profile.lands.filter((item) => item.id !== landId) }, [ledgerEntry(profile, "revenue", payout, `\u0628\u064A\u0639 \u0623\u0631\u0636: ${land.label} \u0628\u0646\u0635\u0641 \u0627\u0644\u0642\u064A\u0645\u0629`, 0)], profile.bankBalance + payout);
  return success(nextProfile, `\u062A\u0645 \u0628\u064A\u0639 ${land.label} \u0648\u0627\u0633\u062A\u0631\u062F\u0627\u062F 50% \u0645\u0646 \u0642\u064A\u0645\u062A\u0647\u0627.`, { landId, payout });
}
function upgradeLand(profile, landId, paymentMethod = "cash") {
  const land = profile.lands.find((item) => item.id === landId);
  if (!land) return failure(profile, "not-found", "\u0627\u0644\u0623\u0631\u0636 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629.");
  const level = land.upgradeLevel ?? 1;
  if (level >= 5) return failure(profile, "condition-not-met", "\u0648\u0635\u0644\u062A \u0627\u0644\u0623\u0631\u0636 \u0625\u0644\u0649 \u0623\u0639\u0644\u0649 \u0645\u0633\u062A\u0648\u0649 \u062A\u0637\u0648\u064A\u0631.");
  const cost = Math.round(8e4 * Math.pow(1.55, level - 1));
  const payment = resolvePurchaseDebit(profile, cost, paymentMethod);
  if ("message" in payment) return failure(profile, "insufficient-funds", payment.message);
  const upgraded = { ...land, upgradeLevel: level + 1, areaSquareMeters: Math.round(land.areaSquareMeters * 1.1), purchasePrice: land.purchasePrice + cost };
  const nextProfile = addLedger({ ...profile, lands: profile.lands.map((item) => item.id === landId ? upgraded : item) }, [ledgerEntry(profile, "expense", cost, `\u062A\u0637\u0648\u064A\u0631 \u0623\u0631\u0636 ${land.label} \u0625\u0644\u0649 \u0627\u0644\u0645\u0633\u062A\u0648\u0649 ${level + 1}`, 0)], payment.bankBalance, { diamonds: payment.diamonds });
  return success(nextProfile, `\u062A\u0645 \u062A\u0637\u0648\u064A\u0631 ${land.label} \u0625\u0644\u0649 \u0627\u0644\u0645\u0633\u062A\u0648\u0649 ${level + 1} ${paymentMethod === "diamonds" ? `\u0645\u0642\u0627\u0628\u0644 ${payment.diamondsSpent} \u0645\u0627\u0633\u0629` : "\u0646\u0642\u062F\u064B\u0627"}.`, { landId, level: level + 1, cost, diamondsSpent: payment.diamondsSpent });
}
function sellCompany(profile, companyId) {
  const company = profile.companies.find((item) => item.id === companyId);
  if (!company) return failure(profile, "not-found", "\u0627\u0644\u0634\u0631\u0643\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629.");
  if (profile.productionOrders.some((order) => order.companyId === companyId && order.status === "active")) return failure(profile, "condition-not-met", "\u0623\u0648\u0642\u0641 \u0623\u0648 \u0623\u0643\u0645\u0644 \u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0642\u0628\u0644 \u0628\u064A\u0639 \u0627\u0644\u0634\u0631\u0643\u0629.");
  if (profile.staff.some((member) => member.companyId === companyId && member.status === "active")) return failure(profile, "condition-not-met", "\u0623\u0646\u0647 \u0639\u0642\u0648\u062F \u0645\u0648\u0638\u0641\u064A \u0627\u0644\u0634\u0631\u0643\u0629 \u0642\u0628\u0644 \u0628\u064A\u0639\u0647\u0627.");
  const industry = findIndustry(company.industryId);
  const land = company.landId ? profile.lands.find((item) => item.id === company.landId) : void 0;
  const value = (industry?.setupFee ?? 0) + (industry?.licenseFee ?? 0) + (land?.purchasePrice ?? 0);
  const payout = Math.floor(value * 0.5);
  const nextProfile = addLedger({ ...profile, companies: profile.companies.filter((item) => item.id !== companyId), lands: land ? profile.lands.filter((item) => item.id !== land.id) : profile.lands, licenses: profile.licenses.filter((license) => !company.licenseIds?.includes(license.id)) }, [ledgerEntry(profile, "revenue", payout, `\u0628\u064A\u0639 \u0634\u0631\u0643\u0629: ${company.name} \u0628\u0646\u0635\u0641 \u0627\u0644\u0642\u064A\u0645\u0629`, 0)], profile.bankBalance + payout);
  return success(nextProfile, `\u062A\u0645 \u0628\u064A\u0639 ${company.name} \u0648\u0627\u0633\u062A\u0631\u062F\u0627\u062F 50% \u0645\u0646 \u0642\u064A\u0645\u0629 \u0627\u0644\u0634\u0631\u0643\u0629 \u0648\u0623\u0631\u0636\u0647\u0627.`, { companyId, payout });
}
function sellAsset(profile, assetId) {
  const asset = profile.assets.find((item) => item.id === assetId);
  if (!asset) return failure(profile, "not-found", "\u0627\u0644\u0623\u0635\u0644 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F.");
  const payout = Math.floor(asset.value * 0.5);
  const nextProfile = addLedger({ ...profile, assets: profile.assets.filter((item) => item.id !== assetId) }, [ledgerEntry(profile, "revenue", payout, `\u0628\u064A\u0639 \u0623\u0635\u0644: ${asset.label} \u0628\u0646\u0635\u0641 \u0627\u0644\u0642\u064A\u0645\u0629`, 0)], profile.bankBalance + payout);
  return success(nextProfile, `\u062A\u0645 \u0628\u064A\u0639 ${asset.label} \u0648\u0627\u0633\u062A\u0631\u062F\u0627\u062F 50% \u0645\u0646 \u0642\u064A\u0645\u062A\u0647.`, { assetId, payout });
}
function buyMaterial(profile, _materialId, _quantity) {
  return failure(profile, "condition-not-met", "\u0627\u0644\u0634\u0631\u0627\u0621 \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0644\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u062E\u0627\u0645 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D. \u0627\u0633\u062A\u062E\u062F\u0645 \u0639\u0631\u0648\u0636 \u0627\u0644\u0633\u0648\u0642 \u0623\u0648 \u0627\u0644\u0645\u0632\u0627\u062F.");
}
function buyGlobalMaterial(profile, offerId, quantity, negotiatedUnitPrice, paymentMethod = "cash") {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  if (!isPositiveInteger(quantity)) return failure(profile, "invalid-input", "\u0627\u0644\u0643\u0645\u064A\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0639\u062F\u062F\u064B\u0627 \u0635\u062D\u064A\u062D\u064B\u0627 \u0645\u0648\u062C\u0628\u064B\u0627.");
  const offer = resolveGlobalMarketOffer(profile, offerId);
  const material = offer ? findMaterial(offer.materialId) : void 0;
  if (!offer || !material) return failure(profile, "not-found", "\u0639\u0631\u0636 \u0627\u0644\u0633\u0648\u0642 \u0627\u0644\u0639\u0627\u0644\u0645\u064A \u0644\u0645 \u064A\u0639\u062F \u0645\u062A\u0627\u062D\u064B\u0627.");
  const unitPrice = negotiatedUnitPrice ?? offer.unitPrice;
  if (!Number.isInteger(unitPrice) || unitPrice < offer.floorPrice || unitPrice > offer.unitPrice || !offer.negotiable && unitPrice !== offer.unitPrice) {
    return failure(profile, "invalid-input", "\u0627\u0644\u0633\u0639\u0631 \u0644\u0627 \u064A\u0637\u0627\u0628\u0642 \u0634\u0631\u0648\u0637 \u0627\u0644\u0639\u0631\u0636 \u0623\u0648 \u0627\u0644\u062A\u0641\u0627\u0648\u0636.");
  }
  const totalCost = quantity * unitPrice;
  const payment = resolvePurchaseDebit(profile, totalCost, paymentMethod);
  if ("message" in payment) return failure(profile, "insufficient-funds", payment.message);
  const existing = profile.inventory.find((lot) => lot.materialOrProductId === material.id);
  const level = normalizeWarehouseLevel(profile.warehouseLevel);
  const itemLimit = getWarehouseItemCapacity(material.id, level) ?? material.storageLimit;
  const warehouseUsage = getWarehouseUsage(profile.inventory, profile.productionOrders);
  const warehouseCapacity = getWarehouseCapacity(level);
  if ((existing?.quantity ?? 0) + quantity > itemLimit || warehouseUsage.materials + quantity > warehouseCapacity.materials) return failure(profile, "storage-limit", `\u0644\u0627 \u062A\u062A\u0633\u0639 \u0633\u0639\u0629 \u0627\u0644\u0645\u062E\u0632\u0646 \u0644\u0644\u0643\u0645\u064A\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629. \u0627\u0644\u0645\u062A\u0627\u062D ${Math.max(0, Math.min(itemLimit - (existing?.quantity ?? 0), warehouseCapacity.materials - warehouseUsage.materials))} ${material.unit}.`);
  const inventory = existing ? profile.inventory.map((lot) => lot.materialOrProductId === material.id ? { ...lot, quantity: lot.quantity + quantity, unitCost: (lot.quantity * lot.unitCost + totalCost) / (lot.quantity + quantity) } : lot) : [...profile.inventory, { id: nextId(profile, "inventory", profile.inventory.length), materialOrProductId: material.id, quantity, unit: material.unit, unitCost: unitPrice }];
  const nextProfile = addLedger(
    { ...profile, inventory },
    [ledgerEntry(profile, "asset", totalCost, `\u0634\u0631\u0627\u0621 \u0639\u0627\u0644\u0645\u064A ${quantity} ${material.unit} \u0645\u0646 ${offer.sellerName}`, 0)],
    payment.bankBalance,
    { diamonds: payment.diamonds }
  );
  return success(syncTasks(nextProfile), `\u062A\u0645 \u0642\u0628\u0648\u0644 \u0639\u0631\u0636 ${offer.sellerName} \u0648\u0634\u0631\u0627\u0621 ${quantity} ${material.name} \u0648\u0625\u0636\u0627\u0641\u062A\u0647\u0627 \u0625\u0644\u0649 \u0627\u0644\u0645\u062E\u0632\u0646 ${paymentMethod === "diamonds" ? `\u0645\u0642\u0627\u0628\u0644 ${payment.diamondsSpent} \u0645\u0627\u0633\u0629` : "\u0646\u0642\u062F\u064B\u0627"}.`, { materialId: material.id, quantity, totalCost, unitPrice, diamondsSpent: payment.diamondsSpent });
}
function upgradeWarehouse(profile, paymentMethod = "cash") {
  const currentLevel = normalizeWarehouseLevel(profile.warehouseLevel);
  const nextLevel = currentLevel + 1;
  const requirement = WAREHOUSE_UPGRADE_REQUIREMENTS[nextLevel];
  if (!requirement) return failure(profile, "condition-not-met", "\u0648\u0635\u0644 \u0627\u0644\u0645\u062E\u0632\u0646 \u0625\u0644\u0649 \u0623\u0639\u0644\u0649 \u0645\u0633\u062A\u0648\u0649 \u062A\u0637\u0648\u064A\u0631.");
  const payment = resolvePurchaseDebit(profile, requirement.cash, paymentMethod);
  if ("message" in payment) return failure(profile, "insufficient-funds", `\u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 ${requirement.cash.toLocaleString("ar-EG")} \u062C.\u0645 \u0623\u0648 \u0645\u0627 \u064A\u0639\u0627\u062F\u0644\u0647\u0627 \u0628\u0627\u0644\u0645\u0627\u0633 \u0644\u062A\u0637\u0648\u064A\u0631 \u0627\u0644\u0645\u062E\u0632\u0646. ${payment.message}`);
  const missing = Object.entries(requirement.materials).filter(([materialId, quantity]) => getWarehouseMaterialQuantity(profile, materialId) < quantity);
  if (missing.length > 0) {
    const labels = missing.map(([materialId, quantity]) => {
      const material = findMaterial(materialId);
      const owned = getWarehouseMaterialQuantity(profile, materialId);
      return `${material?.name ?? materialId}: ${Math.max(0, quantity - owned)} ${material?.unit ?? "\u0648\u062D\u062F\u0629"}`;
    });
    return failure(profile, "insufficient-materials", `\u0645\u0648\u0627\u062F \u062A\u0637\u0648\u064A\u0631 \u0627\u0644\u0645\u062E\u0632\u0646 \u063A\u064A\u0631 \u0645\u0643\u062A\u0645\u0644\u0629: ${labels.join("\u060C ")}.`);
  }
  const inventory = removeWarehouseMaterials(profile, requirement.materials);
  const materialValue = Object.entries(requirement.materials).reduce((sum, [materialId, quantity]) => sum + quantity * (findMaterial(materialId)?.pricePerUnit ?? 0), 0);
  const entries = [
    ledgerEntry(profile, "expense", requirement.cash, `\u062A\u0637\u0648\u064A\u0631 \u0627\u0644\u0645\u062E\u0632\u0646 \u0625\u0644\u0649 \u0627\u0644\u0645\u0633\u062A\u0648\u0649 ${nextLevel}`, 0),
    ...materialValue > 0 ? [ledgerEntry(profile, "expense", materialValue, "\u0645\u0648\u0627\u062F \u062E\u0627\u0645 \u0645\u0633\u062A\u0647\u0644\u0643\u0629 \u0641\u064A \u062A\u0637\u0648\u064A\u0631 \u0627\u0644\u0645\u062E\u0632\u0646", 1)] : []
  ];
  const capacity = getWarehouseCapacity(nextLevel);
  const nextProfile = addLedger({ ...profile, inventory, warehouseLevel: nextLevel }, entries, payment.bankBalance, { diamonds: payment.diamonds });
  return success(nextProfile, `\u062A\u0645 \u062A\u0637\u0648\u064A\u0631 \u0627\u0644\u0645\u062E\u0632\u0646 \u0625\u0644\u0649 \u0627\u0644\u0645\u0633\u062A\u0648\u0649 ${nextLevel} ${paymentMethod === "diamonds" ? `\u0645\u0642\u0627\u0628\u0644 ${payment.diamondsSpent} \u0645\u0627\u0633\u0629` : "\u0646\u0642\u062F\u064B\u0627"}. \u0633\u0639\u0629 \u0627\u0644\u062E\u0627\u0645\u0627\u062A ${capacity.materials.toLocaleString("ar-EG")} \u0648\u062D\u062F\u0629 \u0648\u0633\u0639\u0629 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A ${capacity.products.toLocaleString("ar-EG")} \u0648\u062D\u062F\u0629.`, { level: nextLevel, cost: requirement.cash, diamondsSpent: payment.diamondsSpent, capacity });
}
function foundCompany(profile, industryId, landId, name, paymentMethod = "cash") {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  const industry = findIndustry(industryId);
  const country = findCountry(profile.countryId);
  if (!industry || !country) return failure(profile, "not-found", "\u0627\u0644\u0642\u0637\u0627\u0639 \u0623\u0648 \u0627\u0644\u062F\u0648\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F.");
  const land = profile.lands.find((item) => item.id === landId);
  if (!land) return failure(profile, "land-required", "\u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u0623\u0631\u0636 \u0645\u0645\u0644\u0648\u0643\u0629 \u0644\u062A\u0623\u0633\u064A\u0633 \u0627\u0644\u0634\u0631\u0643\u0629.");
  if ((land.availableForCompanyOnDay ?? land.acquiredOnDay ?? 1) > profile.day) return failure(profile, "condition-not-met", `\u0627\u0644\u0623\u0631\u0636 \u0642\u064A\u062F \u0625\u0646\u0647\u0627\u0621 \u0639\u0642\u0648\u062F \u0646\u0642\u0644 \u0627\u0644\u0645\u0644\u0643\u064A\u0629\u060C \u0648\u0633\u062A\u062A\u0627\u062D \u0644\u0644\u062A\u0623\u0633\u064A\u0633 \u0641\u064A \u0627\u0644\u064A\u0648\u0645 ${land.availableForCompanyOnDay}.`);
  if (profile.companies.some((company2) => company2.landId === landId)) return failure(profile, "land-in-use", "\u0627\u0644\u0623\u0631\u0636 \u0645\u0631\u062A\u0628\u0637\u0629 \u0628\u0634\u0631\u0643\u0629 \u0623\u062E\u0631\u0649 \u0628\u0627\u0644\u0641\u0639\u0644.");
  if (land.landType && land.landType !== industry.requiredLandType) return failure(profile, "wrong-land-type", "\u0646\u0648\u0639 \u0627\u0644\u0623\u0631\u0636 \u0644\u0627 \u064A\u0646\u0627\u0633\u0628 \u0647\u0630\u0627 \u0627\u0644\u0642\u0637\u0627\u0639.");
  const companyName = name.trim();
  if (!companyName) return failure(profile, "invalid-input", "\u0623\u062F\u062E\u0644 \u0627\u0633\u0645\u064B\u0627 \u0644\u0644\u0634\u0631\u0643\u0629.");
  const setupFee = country.economy.companySetupFee ?? industry.setupFee;
  const licenseFee = country.economy.licenseFeesByIndustry[industryId] ?? industry.licenseFee;
  const totalCost = setupFee + licenseFee;
  const payment = resolvePurchaseDebit(profile, totalCost, paymentMethod);
  if ("message" in payment) return failure(profile, "insufficient-funds", `\u0644\u0627 \u064A\u0643\u0641\u064A \u0631\u0635\u064A\u062F\u0643 \u0644\u0631\u0633\u0648\u0645 \u0627\u0644\u062A\u0623\u0633\u064A\u0633 \u0648\u0627\u0644\u062A\u0631\u062E\u064A\u0635. ${payment.message}`);
  const companyId = nextId(profile, "company", profile.companies.length);
  const licenseId = nextId(profile, "license", profile.licenses.length);
  const company = {
    id: companyId,
    name: companyName,
    industryId,
    countryId: profile.countryId,
    foundedAt: timestampFor(profile),
    foundedOnDay: profile.day,
    landId,
    licenseIds: [licenseId],
    energyUnits: industry.energyCapacity,
    energyCapacity: industry.energyCapacity,
    operatingCostPerDay: industry.dailyOperatingCost
  };
  const license = { id: licenseId, countryId: profile.countryId, industryId, feePaid: licenseFee, issuedAt: timestampFor(profile) };
  const nextProfile = addLedger(
    { ...profile, companies: [...profile.companies, company], licenses: [...profile.licenses, license] },
    [
      ledgerEntry(profile, "expense", setupFee, `\u0631\u0633\u0648\u0645 \u062A\u0623\u0633\u064A\u0633 \u0634\u0631\u0643\u0629 ${companyName}`, 0),
      ledgerEntry(profile, "expense", licenseFee, `\u062A\u0631\u062E\u064A\u0635 \u0642\u0637\u0627\u0639 ${industry.name}`, 1)
    ],
    payment.bankBalance,
    { diamonds: payment.diamonds }
  );
  return success(syncTasks(nextProfile), `\u062A\u0645 \u062A\u0623\u0633\u064A\u0633 ${companyName} \u0648\u062A\u0631\u062E\u064A\u0635\u0647\u0627 ${paymentMethod === "diamonds" ? `\u0645\u0642\u0627\u0628\u0644 ${payment.diamondsSpent} \u0645\u0627\u0633\u0629` : "\u0646\u0642\u062F\u064B\u0627"}.`, { companyId, totalCost, diamondsSpent: payment.diamondsSpent });
}
function upgradeCompany(profile, companyId, paymentMethod = "cash") {
  const company = profile.companies.find((item) => item.id === companyId);
  if (!company) return failure(profile, "not-found", "\u0627\u0644\u0634\u0631\u0643\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629.");
  const level = company.upgradeLevel ?? 1;
  if (level >= 5) return failure(profile, "condition-not-met", "\u0648\u0635\u0644\u062A \u0647\u0630\u0647 \u0627\u0644\u0634\u0631\u0643\u0629 \u0625\u0644\u0649 \u0623\u0639\u0644\u0649 \u0645\u0633\u062A\u0648\u0649 \u062A\u0637\u0648\u064A\u0631.");
  const completedBatches = profile.productionOrders.filter((order) => order.companyId === companyId && order.status === "completed").reduce((sum, order) => sum + order.batches, 0);
  const requiredBatches = level * 2;
  if (completedBatches < requiredBatches) return failure(profile, "condition-not-met", `\u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u0625\u0643\u0645\u0627\u0644 ${requiredBatches} \u062F\u0641\u0639\u0627\u062A \u0625\u0646\u062A\u0627\u062C \u0642\u0628\u0644 \u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0627\u0644\u0645\u0633\u062A\u0648\u0649 ${level + 1}. \u0623\u0643\u0645\u0644\u062A ${completedBatches}.`);
  const cost = Math.round(12e4 * Math.pow(1.55, level - 1));
  const payment = resolvePurchaseDebit(profile, cost, paymentMethod);
  if ("message" in payment) return failure(profile, "insufficient-funds", `\u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 ${cost.toLocaleString("ar-EG")} \u062C.\u0645 \u0623\u0648 \u0645\u0627 \u064A\u0639\u0627\u062F\u0644\u0647\u0627 \u0628\u0627\u0644\u0645\u0627\u0633 \u0644\u062A\u0637\u0648\u064A\u0631 \u0627\u0644\u0634\u0631\u0643\u0629. ${payment.message}`);
  const capacityBonus = 20 * level;
  const companies = profile.companies.map((item) => item.id === companyId ? { ...item, upgradeLevel: level + 1, energyCapacity: (item.energyCapacity ?? 0) + capacityBonus, energyUnits: (item.energyUnits ?? 0) + capacityBonus, maintenanceCondition: 100 } : item);
  const nextProfile = addLedger({ ...profile, companies }, [ledgerEntry(profile, "expense", cost, `\u062A\u0637\u0648\u064A\u0631 ${company.name} \u0625\u0644\u0649 \u0627\u0644\u0645\u0633\u062A\u0648\u0649 ${level + 1}`, 0)], payment.bankBalance, { diamonds: payment.diamonds });
  return success(nextProfile, `\u062A\u0645 \u062A\u0637\u0648\u064A\u0631 ${company.name} \u0625\u0644\u0649 \u0627\u0644\u0645\u0633\u062A\u0648\u0649 ${level + 1} ${paymentMethod === "diamonds" ? `\u0645\u0642\u0627\u0628\u0644 ${payment.diamondsSpent} \u0645\u0627\u0633\u0629` : "\u0646\u0642\u062F\u064B\u0627"} \u0648\u0632\u0627\u062F\u062A \u0637\u0627\u0642\u062A\u0647\u0627.`, { companyId, level: level + 1, cost, diamondsSpent: payment.diamondsSpent });
}
function runProduction(profile, companyId, batches) {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  if (!isPositiveInteger(batches)) return failure(profile, "invalid-input", "\u0639\u062F\u062F \u062F\u0641\u0639\u0627\u062A \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0639\u062F\u062F\u064B\u0627 \u0635\u062D\u064A\u062D\u064B\u0627 \u0645\u0648\u062C\u0628\u064B\u0627.");
  const company = profile.companies.find((item) => item.id === companyId);
  if (!company) return failure(profile, "not-found", "\u0627\u0644\u0634\u0631\u0643\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629.");
  if ((company.operationalFromDay ?? 1) > profile.day) return failure(profile, "condition-not-met", `\u064A\u062C\u0631\u064A \u0625\u0646\u0647\u0627\u0621 \u0639\u0642\u0648\u062F \u0646\u0642\u0644 \u0627\u0644\u0645\u0644\u0643\u064A\u0629\u061B \u064A\u0628\u062F\u0623 \u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0634\u0631\u0643\u0629 \u0641\u064A \u0627\u0644\u064A\u0648\u0645 ${company.operationalFromDay}.`);
  const recipe = findRecipeForIndustry(company.industryId);
  if (!recipe) return failure(profile, "not-found", "\u0644\u0627 \u062A\u0648\u062C\u062F \u0648\u0635\u0641\u0629 \u0644\u0647\u0630\u0627 \u0627\u0644\u0642\u0637\u0627\u0639.");
  const product = PRODUCT_CATALOG.find((item) => item.id === recipe.productId);
  if (!product) return failure(profile, "not-found", "\u0627\u0644\u0645\u0646\u062A\u062C \u0627\u0644\u0646\u0627\u062A\u062C \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0641\u064A \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C.");
  const maintenanceCondition = company.maintenanceCondition ?? 100;
  if (maintenanceCondition < 25) return failure(profile, "factory-maintenance", "\u0627\u0644\u0645\u0635\u0646\u0639 \u0645\u062A\u0639\u0637\u0644 \u0648\u064A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u0635\u064A\u0627\u0646\u0629 \u0642\u0628\u0644 \u0628\u062F\u0621 \u0623\u0645\u0631 \u062C\u062F\u064A\u062F.");
  const energyAvailable = company.energyUnits ?? 0;
  if (energyAvailable < batches * recipe.energyUnits) return failure(profile, "insufficient-energy", "\u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0645\u062A\u0627\u062D\u0629 \u0644\u0627 \u062A\u0643\u0641\u064A \u0644\u0647\u0630\u0647 \u0627\u0644\u062F\u0641\u0639\u0627\u062A.");
  for (const input of recipe.inputs) {
    const lot = profile.inventory.find((item) => item.materialOrProductId === input.materialId);
    if (!lot || lot.quantity < input.quantity * batches) return failure(profile, "insufficient-materials", "\u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u062E\u0627\u0645 \u0644\u0627 \u062A\u0643\u0641\u064A \u0644\u0647\u0630\u0647 \u0627\u0644\u062F\u0641\u0639\u0627\u062A.");
  }
  const energyCost = batches * recipe.energyCost;
  const maintenanceCost = Math.round((company.operatingCostPerDay ?? 0) * 0.15 * getOperatingCostProgression(profile.day));
  if (profile.bankBalance < energyCost + maintenanceCost) return failure(profile, "insufficient-funds", "\u0644\u0627 \u064A\u0643\u0641\u064A \u0627\u0644\u0631\u0635\u064A\u062F \u0644\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0637\u0627\u0642\u0629 \u0648\u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0644\u0647\u0630\u0627 \u0627\u0644\u0623\u0645\u0631.");
  const materialCost = recipe.inputs.reduce((sum, input) => {
    const lot = profile.inventory.find((item) => item.materialOrProductId === input.materialId);
    return sum + input.quantity * batches * (lot?.unitCost ?? 0);
  }, 0);
  const currentProductQuantity = profile.inventory.find((lot) => lot.materialOrProductId === product.id)?.quantity ?? 0;
  const plannedProductQuantity = profile.productionOrders.filter((order2) => order2.status === "active" && order2.productId === product.id).reduce((sum, order2) => sum + order2.outputQuantity, 0);
  const outputQuantity = Math.max(recipe.outputQuantity, Math.round(batches * recipe.outputQuantity * getSynergyProductionMultiplier(profile)));
  const warehouseLevel = normalizeWarehouseLevel(profile.warehouseLevel);
  const itemProductLimit = getWarehouseItemCapacity(product.id, warehouseLevel) ?? product.storageLimit;
  const warehouseUsage = getWarehouseUsage(profile.inventory, profile.productionOrders);
  const warehouseCapacity = getWarehouseCapacity(warehouseLevel);
  if (currentProductQuantity + plannedProductQuantity + outputQuantity > itemProductLimit || warehouseUsage.products + outputQuantity > warehouseCapacity.products) {
    const itemAvailable = itemProductLimit - currentProductQuantity - plannedProductQuantity;
    const totalAvailable = warehouseCapacity.products - warehouseUsage.products;
    return failure(profile, "storage-limit", `\u0633\u0639\u0629 \u0627\u0644\u0645\u062E\u0632\u0646 \u0644\u0627 \u062A\u0643\u0641\u064A \u0644\u0644\u0625\u0646\u062A\u0627\u062C \u0627\u0644\u0645\u062E\u0637\u0637\u061B \u0627\u0644\u0645\u062A\u0627\u062D \u0644\u0647\u0630\u0627 \u0627\u0644\u0645\u0646\u062A\u062C ${Math.max(0, itemAvailable)} ${product.unit}\u060C \u0648\u0627\u0644\u0633\u0639\u0629 \u0627\u0644\u0643\u0644\u064A\u0629 \u0627\u0644\u0645\u062A\u0628\u0642\u064A\u0629 ${Math.max(0, totalAvailable)} \u0648\u062D\u062F\u0629.`);
  }
  const inventory = profile.inventory.map((lot) => {
    const input = recipe.inputs.find((item) => item.materialId === lot.materialOrProductId);
    return input ? { ...lot, quantity: lot.quantity - input.quantity * batches } : lot;
  }).filter((lot) => lot.quantity > 0);
  const companies = profile.companies.map((item) => item.id === companyId ? { ...item, energyUnits: energyAvailable - batches * recipe.energyUnits } : item);
  const hasManager = profile.staff.some((member) => member.status === "active" && member.role === "manager" && member.companyId === companyId);
  const durationDays = Math.min(3, Math.max(1, Math.ceil(batches / 3) - (hasManager ? 1 : 0)));
  const marketForecast = getMarketQuote(profile, recipe.productId, profile.day + durationDays);
  const qualityScore = Math.max(70, Math.min(100, 86 + (hasManager ? 10 : 0) - (maintenanceCondition < 60 ? 10 : 0)));
  const expectedUnitCost = (materialCost + energyCost + maintenanceCost) / outputQuantity;
  const nextMaintenanceCondition = Math.max(0, maintenanceCondition - Math.max(8, Math.ceil(batches / 2)));
  const order = { id: nextId(profile, "production", profile.productionOrders.length), companyId, productId: recipe.productId, productName: recipe.productName, batches, outputQuantity, outputUnit: recipe.outputUnit, materialCost, energyCost, expectedUnitCost, demandForecast: marketForecast?.demandUnits ?? 0, qualityScore, maintenanceCost, startedOnDay: profile.day, completesOnDay: profile.day + durationDays, status: "active" };
  const companiesWithMaintenance = companies.map((item) => item.id === companyId ? { ...item, maintenanceCondition: nextMaintenanceCondition } : item);
  const nextProfile = addLedger(
    { ...profile, inventory, companies: companiesWithMaintenance, productionOrders: [...profile.productionOrders, order] },
    [ledgerEntry(profile, "expense", energyCost, `\u062D\u062C\u0632 \u0637\u0627\u0642\u0629 \u0644\u0623\u0645\u0631 \u0625\u0646\u062A\u0627\u062C ${recipe.productName}`, 0), ledgerEntry(profile, "expense", maintenanceCost, `\u0635\u064A\u0627\u0646\u0629 \u0648\u0642\u0627\u0626\u064A\u0629 \u0644\u0623\u0645\u0631 \u0625\u0646\u062A\u0627\u062C ${recipe.productName}`, 1), ledgerEntry(profile, "asset", materialCost, `\u062D\u062C\u0632 \u0645\u0648\u0627\u062F \u0644\u0623\u0645\u0631 \u0625\u0646\u062A\u0627\u062C ${recipe.productName}`, 2)],
    profile.bankBalance - energyCost - maintenanceCost
  );
  return success(syncTasks(nextProfile), `\u0628\u062F\u0623 \u0623\u0645\u0631 \u0625\u0646\u062A\u0627\u062C ${recipe.productName} \u0648\u064A\u0643\u062A\u0645\u0644 \u0641\u064A \u0627\u0644\u064A\u0648\u0645 ${order.completesOnDay}.`, { orderId: order.id, companyId, productId: recipe.productId, batches, outputQuantity, completesOnDay: order.completesOnDay });
}
function serviceCompany(profile, companyId) {
  const company = profile.companies.find((item) => item.id === companyId);
  if (!company) return failure(profile, "not-found", "\u0627\u0644\u0634\u0631\u0643\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629.");
  const cost = Math.max(5e3, Math.round((company.operatingCostPerDay ?? 0) * 0.4 * getOperatingCostProgression(profile.day)));
  if (profile.bankBalance < cost) return failure(profile, "insufficient-funds", "\u0644\u0627 \u064A\u0643\u0641\u064A \u0627\u0644\u0631\u0635\u064A\u062F \u0644\u0625\u062C\u0631\u0627\u0621 \u0635\u064A\u0627\u0646\u0629 \u0627\u0644\u0645\u0635\u0646\u0639.");
  const nextProfile = addLedger(
    { ...profile, companies: profile.companies.map((item) => item.id === companyId ? { ...item, maintenanceCondition: 100 } : item) },
    [ledgerEntry(profile, "expense", cost, `\u0635\u064A\u0627\u0646\u0629 \u0643\u0627\u0645\u0644\u0629 \u0644\u0644\u0645\u0635\u0646\u0639: ${company.name}`, 0)],
    profile.bankBalance - cost
  );
  return success(nextProfile, `\u062A\u0645\u062A \u0635\u064A\u0627\u0646\u0629 ${company.name} \u0648\u0639\u0627\u062F\u062A \u0643\u0641\u0627\u0621\u0629 \u0627\u0644\u0645\u0635\u0646\u0639 \u0625\u0644\u0649 100%.`, { companyId, cost });
}
function cancelProductionOrder(profile, orderId) {
  const order = profile.productionOrders.find((item) => item.id === orderId);
  if (!order) return failure(profile, "not-found", "\u0623\u0645\u0631 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F.");
  if (order.status !== "active") return failure(profile, "production-not-cancellable", "\u0644\u0627 \u064A\u0645\u0643\u0646 \u0625\u0644\u063A\u0627\u0621 \u0623\u0645\u0631 \u0645\u0643\u062A\u0645\u0644 \u0623\u0648 \u0645\u0644\u063A\u0649.");
  const refund = Math.round(order.materialCost * 0.7);
  const unrecoveredMaterialCost = Math.max(0, order.materialCost - refund);
  const nextProfile = addLedger(
    { ...profile, productionOrders: profile.productionOrders.map((item) => item.id === orderId ? { ...item, status: "cancelled" } : item) },
    [ledgerEntry(profile, "settlement", refund, `\u0627\u0633\u062A\u0631\u062F\u0627\u062F 70% \u0645\u0646 \u062D\u062C\u0632 \u0623\u0645\u0631 \u0627\u0644\u0625\u0646\u062A\u0627\u062C ${order.productName}`, 0), ...unrecoveredMaterialCost > 0 ? [ledgerEntry(profile, "expense", unrecoveredMaterialCost, `\u062E\u0633\u0627\u0631\u0629 \u0645\u0648\u0627\u062F \u063A\u064A\u0631 \u0645\u0633\u062A\u0631\u062F\u0629 \u0644\u0623\u0645\u0631 ${order.productName}`, 1)] : []],
    profile.bankBalance + refund
  );
  return success(nextProfile, `\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0623\u0645\u0631 \u0648\u0627\u0633\u062A\u0631\u062F\u0627\u062F ${refund.toLocaleString("ar-EG")} \u062C.\u0645 \u0645\u0646 \u0627\u0644\u062D\u062C\u0632.`, { orderId, refund });
}
function useProductionSpeedCard(profile, orderId, kind) {
  const card = profile.speedCards.find((item) => item.kind === kind && item.quantity > 0);
  if (!card) return failure(profile, "insufficient-funds", "\u0644\u0627 \u062A\u0645\u0644\u0643 \u0647\u0630\u0647 \u0627\u0644\u0628\u0637\u0627\u0642\u0629 \u0641\u064A \u0645\u062E\u0632\u0648\u0646\u0643.");
  if (kind === "capacity-boost" || kind.startsWith("day-speed-")) return failure(profile, "invalid-input", "\u0647\u0630\u0647 \u0627\u0644\u0628\u0637\u0627\u0642\u0629 \u0644\u064A\u0633\u062A \u0645\u062E\u0635\u0635\u0629 \u0644\u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u0625\u0646\u062A\u0627\u062C.");
  const order = profile.productionOrders.find((item) => item.id === orderId);
  if (!order || order.status !== "active") return failure(profile, "not-found", "\u0623\u0645\u0631 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u063A\u064A\u0631 \u0646\u0634\u0637 \u0623\u0648 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F.");
  const remainingDays = Math.max(1, order.completesOnDay - profile.day);
  const reduction = kind === "production-instant" ? remainingDays : Math.max(1, Math.ceil(remainingDays * (kind === "production-50" ? 0.5 : 0.25)));
  const completesOnDay = Math.max(profile.day, order.completesOnDay - reduction);
  const speedCards = profile.speedCards.map((item) => item.kind === kind ? { ...item, quantity: item.quantity - 1 } : item).filter((item) => item.quantity > 0);
  const productionOrders = profile.productionOrders.map((item) => item.id === orderId ? { ...item, completesOnDay } : item);
  return success({ ...profile, speedCards, productionOrders }, `\u062A\u0645 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u062A\u0633\u0631\u064A\u0639\u061B \u064A\u0643\u062A\u0645\u0644 \u0627\u0644\u0623\u0645\u0631 \u0641\u064A \u0627\u0644\u064A\u0648\u0645 ${completesOnDay}.`, { orderId, kind, completesOnDay });
}
function useDaySpeedCard(profile, kind) {
  if (kind !== "day-speed-2x" && kind !== "day-speed-3x") return failure(profile, "invalid-input", "\u0627\u062E\u062A\u0631 \u0628\u0637\u0627\u0642\u0629 \u062A\u0633\u0631\u064A\u0639 \u0627\u0644\u064A\u0648\u0645 \xD72 \u0623\u0648 \xD73.");
  if (profile.activeDaySpeedMultiplier > 1) return failure(profile, "condition-not-met", "\u0628\u0637\u0627\u0642\u0629 \u062A\u0633\u0631\u064A\u0639 \u0627\u0644\u064A\u0648\u0645 \u0645\u0633\u062A\u062E\u062F\u0645\u0629 \u0628\u0627\u0644\u0641\u0639\u0644\u061B \u064A\u0645\u0643\u0646\u0643 \u062A\u0641\u0639\u064A\u0644 \u0628\u0637\u0627\u0642\u0629 \u062C\u062F\u064A\u062F\u0629 \u0628\u0639\u062F \u0627\u0646\u062A\u0642\u0627\u0644 \u0627\u0644\u064A\u0648\u0645.");
  const card = profile.speedCards.find((item) => item.kind === kind && item.quantity > 0);
  if (!card) return failure(profile, "insufficient-funds", "\u0644\u0627 \u062A\u0645\u0644\u0643 \u0647\u0630\u0647 \u0627\u0644\u0628\u0637\u0627\u0642\u0629 \u0641\u064A \u0645\u062E\u0632\u0648\u0646\u0643.");
  const multiplier = kind === "day-speed-2x" ? 2 : 3;
  const speedCards = profile.speedCards.map((item) => item.kind === kind ? { ...item, quantity: item.quantity - 1 } : item).filter((item) => item.quantity > 0);
  return success({ ...profile, speedCards, activeDaySpeedMultiplier: multiplier }, `\u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0628\u0637\u0627\u0642\u0629 \xD7${multiplier} \u0644\u0647\u0630\u0627 \u0627\u0644\u064A\u0648\u0645\u061B \u0633\u064A\u0635\u0628\u062D \u0627\u0644\u064A\u0648\u0645 \u0623\u0633\u0631\u0639.`, { kind, multiplier });
}
function buySpeedCard(profile, kind, quantity, paymentMethod = "diamonds") {
  if (!isPositiveInteger(quantity)) return failure(profile, "invalid-input", "\u0639\u062F\u062F \u0627\u0644\u0628\u0637\u0627\u0642\u0627\u062A \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0639\u062F\u062F\u064B\u0627 \u0635\u062D\u064A\u062D\u064B\u0627 \u0645\u0648\u062C\u0628\u064B\u0627.");
  const cost = SPEED_CARD_DIAMOND_COSTS[kind];
  if (!cost) return failure(profile, "not-found", "\u0646\u0648\u0639 \u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0633\u0631\u0639\u0629 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641.");
  const diamondsSpent = cost * quantity;
  const cashPrice = getCashPriceForDiamondPrice(diamondsSpent);
  const payment = resolvePurchaseDebit(profile, cashPrice, paymentMethod, diamondsSpent);
  if ("message" in payment) return failure(profile, "insufficient-funds", payment.message);
  const existing = profile.speedCards.find((card) => card.kind === kind);
  const speedCards = existing ? profile.speedCards.map((card) => card.kind === kind ? { ...card, quantity: card.quantity + quantity } : card) : [...profile.speedCards, { kind, quantity }];
  const updated = { ...profile, speedCards };
  const nextProfile = paymentMethod === "cash" ? addLedger(updated, [ledgerEntry(profile, "expense", cashPrice, `\u0634\u0631\u0627\u0621 ${quantity} \u0628\u0637\u0627\u0642\u0629 ${SPEED_CARD_LABELS[kind]} \u0646\u0642\u062F\u064B\u0627`, 0)], payment.bankBalance, { diamonds: payment.diamonds }) : { ...updated, diamonds: payment.diamonds };
  return success(nextProfile, `\u062A\u0645 \u0634\u0631\u0627\u0621 ${quantity} \u0628\u0637\u0627\u0642\u0629 ${paymentMethod === "diamonds" ? `\u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 ${diamondsSpent} \u0645\u0627\u0633\u0629` : `\u0645\u0642\u0627\u0628\u0644 ${cashPrice.toLocaleString("ar-EG")} \u062C.\u0645`}.`, { kind, quantity, diamondsSpent: payment.diamondsSpent, cashSpent: paymentMethod === "cash" ? cashPrice : 0 });
}
function sellProduct(profile, productId, quantity) {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  const product = PRODUCT_CATALOG.find((item) => item.id === productId);
  if (!product) return failure(profile, "not-found", "\u0627\u0644\u0645\u0646\u062A\u062C \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0641\u064A \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C.");
  if (!isPositiveInteger(quantity)) return failure(profile, "invalid-input", "\u0627\u0644\u0643\u0645\u064A\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0639\u062F\u062F\u064B\u0627 \u0635\u062D\u064A\u062D\u064B\u0627 \u0645\u0648\u062C\u0628\u064B\u0627.");
  const lot = profile.inventory.find((item) => item.materialOrProductId === productId);
  if (!lot || lot.quantity < quantity) return failure(profile, "insufficient-materials", "\u0644\u0627 \u062A\u0645\u0644\u0643 \u0647\u0630\u0647 \u0627\u0644\u0643\u0645\u064A\u0629 \u0645\u0646 \u0627\u0644\u0645\u0646\u062A\u062C.");
  const marketQuote = getMarketQuote(profile, productId);
  if (!marketQuote) return failure(profile, "not-found", "\u0644\u0627 \u064A\u0648\u062C\u062F \u0639\u0631\u0636 \u0633\u0648\u0642 \u0644\u0647\u0630\u0627 \u0627\u0644\u0645\u0646\u062A\u062C \u0627\u0644\u064A\u0648\u0645.");
  if (quantity > marketQuote.demandUnits) return failure(profile, "market-limit", `\u0627\u0644\u0637\u0644\u0628 \u0627\u0644\u0645\u062A\u0627\u062D \u0627\u0644\u064A\u0648\u0645 ${marketQuote.demandUnits} \u0648\u062D\u062F\u0629 \u0641\u0642\u0637\u061B \u062E\u0641\u0651\u0636 \u0627\u0644\u0643\u0645\u064A\u0629 \u0623\u0648 \u0627\u0646\u062A\u0638\u0631 \u064A\u0648\u0645\u064B\u0627 \u0622\u062E\u0631.`);
  const qualityMultiplier = lot.qualityScore === void 0 ? 1 : 0.85 + lot.qualityScore / 100 * 0.15;
  const grossRevenue = Math.round(quantity * marketQuote.currentPrice * qualityMultiplier);
  const accountant = profile.staff.find((member) => member.status === "active" && member.role === "accountant");
  const taxRate = (findCountry(profile.countryId)?.economy.taxRate ?? 0) * (accountant ? Math.max(0.82, 0.9 - (staffLevel(accountant) - 1) * 0.02) : 1);
  const tax = Math.round(grossRevenue * taxRate);
  const costOfGoods = Math.round(lot.unitCost * quantity);
  const nextInventory = profile.inventory.map((item) => item.materialOrProductId === productId ? { ...item, quantity: item.quantity - quantity } : item).filter((item) => item.quantity > 0);
  const sale = { id: nextId(profile, "sale", profile.sales.length), productId, quantity, unitPrice: marketQuote.currentPrice, grossRevenue, tax, costOfGoods, soldOnDay: profile.day, soldAt: timestampFor(profile) };
  const nextProfile = addLedger(
    { ...profile, inventory: nextInventory, sales: [...profile.sales, sale] },
    [
      ledgerEntry(profile, "revenue", grossRevenue, `\u0628\u064A\u0639 ${quantity} \u0645\u0646 ${product.name}`, 0),
      ledgerEntry(profile, "expense", tax, "\u0636\u0631\u064A\u0628\u0629 \u0645\u0628\u064A\u0639\u0627\u062A \u0645\u062D\u0627\u0643\u0627\u0629", 1),
      ledgerEntry(profile, "expense", costOfGoods, `\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0627\u0644\u0645\u0628\u0627\u0639\u0629: ${product.name}`, 2)
    ],
    profile.bankBalance + grossRevenue - tax
  );
  return success(syncTasks(nextProfile), `\u062A\u0645 \u0628\u064A\u0639 ${quantity} \u0645\u0646 ${product.name} \u0628\u0633\u0639\u0631 \u0633\u0648\u0642 ${marketQuote.currentPrice.toLocaleString("ar-EG")} \u062C.\u0645 \u0644\u0644\u0648\u062D\u062F\u0629 \u0628\u0639\u062F \u0627\u062D\u062A\u0633\u0627\u0628 \u0627\u0644\u0636\u0631\u064A\u0628\u0629 \u0648\u0627\u0644\u062A\u0643\u0644\u0641\u0629.`, { productId, quantity, grossRevenue, tax, costOfGoods, netRevenue: grossRevenue - tax - costOfGoods });
}
var GOLD_SELL_SPREAD_RATE = 0.03;
function isPositiveTenth(value) {
  return Number.isFinite(value) && value > 0 && Math.abs(value * 10 - Math.round(value * 10)) < 1e-8;
}
function buyGold(profile, grams) {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  if (!isPositiveTenth(grams)) return failure(profile, "invalid-input", "\u0623\u062F\u062E\u0644 \u0643\u0645\u064A\u0629 \u0630\u0647\u0628 \u0645\u0648\u062C\u0628\u0629 \u0628\u062E\u0637\u0648\u0629 0.1 \u063A\u0631\u0627\u0645.");
  const amount = Math.round(grams * GOLD_PRICE_PER_GRAM);
  if (profile.bankBalance < amount) return failure(profile, "insufficient-funds", "\u0644\u0627 \u064A\u0643\u0641\u064A \u0631\u0635\u064A\u062F \u0627\u0644\u0628\u0646\u0643 \u0644\u0634\u0631\u0627\u0621 \u0647\u0630\u0647 \u0627\u0644\u0643\u0645\u064A\u0629 \u0645\u0646 \u0627\u0644\u0630\u0647\u0628.");
  const nextProfile = addLedger(
    profile,
    [ledgerEntry(profile, "asset", amount, `\u0634\u0631\u0627\u0621 ${grams.toFixed(1)} \u063A\u0631\u0627\u0645 \u0630\u0647\u0628 \u0628\u0633\u0639\u0631 \u0645\u062D\u0627\u0643\u0627\u0629`, 0)],
    profile.bankBalance - amount,
    { goldGrams: Math.round((profile.goldGrams + grams) * 10) / 10, goldCostBasis: profile.goldCostBasis + amount }
  );
  return success(nextProfile, `\u0627\u0634\u062A\u0631\u064A\u062A ${grams.toFixed(1)} \u063A\u0631\u0627\u0645 \u0630\u0647\u0628 \u0628\u0633\u0639\u0631 \u0645\u062D\u0627\u0643\u0627\u0629 ${GOLD_PRICE_PER_GRAM} \u062C.\u0645 \u0644\u0644\u063A\u0631\u0627\u0645.`, { grams, cashAmount: amount, pricePerGram: GOLD_PRICE_PER_GRAM });
}
var DIAMONDS_PER_GOLD_GRAM = 0.5;
function buyGoldWithDiamonds(profile, grams) {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  if (!isPositiveTenth(grams)) return failure(profile, "invalid-input", "\u0623\u062F\u062E\u0644 \u0643\u0645\u064A\u0629 \u0630\u0647\u0628 \u0645\u0648\u062C\u0628\u0629 \u0628\u062E\u0637\u0648\u0629 0.1 \u063A\u0631\u0627\u0645.");
  const diamonds = grams * DIAMONDS_PER_GOLD_GRAM;
  if (!Number.isInteger(diamonds)) return failure(profile, "invalid-input", "\u0634\u0631\u0627\u0621 \u0627\u0644\u0630\u0647\u0628 \u0628\u0627\u0644\u0645\u0627\u0633 \u0645\u062A\u0627\u062D \u0628\u0632\u064A\u0627\u062F\u0629 2 \u063A\u0631\u0627\u0645 \u0644\u0643\u0644 \u0645\u0627\u0633\u0629 \u0643\u0627\u0645\u0644\u0629.");
  if (profile.diamonds < diamonds) return failure(profile, "insufficient-funds", "\u0644\u0627 \u064A\u0643\u0641\u064A \u0631\u0635\u064A\u062F \u0627\u0644\u0645\u0627\u0633 \u0644\u0634\u0631\u0627\u0621 \u0647\u0630\u0647 \u0627\u0644\u0643\u0645\u064A\u0629 \u0645\u0646 \u0627\u0644\u0630\u0647\u0628.");
  const goldCost = Math.round(grams * GOLD_PRICE_PER_GRAM);
  const nextProfile = addLedger(
    profile,
    [ledgerEntry(profile, "asset", goldCost, `\u0634\u0631\u0627\u0621 ${grams.toFixed(1)} \u063A\u0631\u0627\u0645 \u0630\u0647\u0628 \u0645\u0642\u0627\u0628\u0644 ${diamonds} \u0645\u0627\u0633\u0629`, 0)],
    profile.bankBalance,
    {
      diamonds: profile.diamonds - diamonds,
      goldGrams: Math.round((profile.goldGrams + grams) * 10) / 10,
      goldCostBasis: profile.goldCostBasis + goldCost
    }
  );
  return success(nextProfile, `\u062A\u0645 \u0634\u0631\u0627\u0621 ${grams.toFixed(1)} \u063A\u0631\u0627\u0645 \u0630\u0647\u0628 \u0645\u0642\u0627\u0628\u0644 ${diamonds} \u0645\u0627\u0633\u0629.`, { grams, cashAmount: diamonds, pricePerGram: DIAMONDS_PER_GOLD_GRAM });
}
function sellGold(profile, grams) {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  if (!isPositiveTenth(grams)) return failure(profile, "invalid-input", "\u0623\u062F\u062E\u0644 \u0643\u0645\u064A\u0629 \u0630\u0647\u0628 \u0645\u0648\u062C\u0628\u0629 \u0628\u062E\u0637\u0648\u0629 0.1 \u063A\u0631\u0627\u0645.");
  if (grams > profile.goldGrams) return failure(profile, "insufficient-materials", "\u0644\u0627 \u062A\u0645\u0644\u0643 \u0647\u0630\u0647 \u0627\u0644\u0643\u0645\u064A\u0629 \u0645\u0646 \u0627\u0644\u0630\u0647\u0628.");
  const proceeds = Math.round(grams * GOLD_PRICE_PER_GRAM * (1 - GOLD_SELL_SPREAD_RATE));
  const bookValue = grams === profile.goldGrams ? profile.goldCostBasis : Math.round(profile.goldCostBasis * grams / profile.goldGrams);
  const realizedDifference = proceeds - bookValue;
  const entries = [ledgerEntry(profile, "asset", bookValue, `\u0627\u0633\u062A\u0628\u0639\u0627\u062F \u0627\u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u062F\u0641\u062A\u0631\u064A\u0629 \u0644\u0640 ${grams.toFixed(1)} \u063A\u0631\u0627\u0645 \u0630\u0647\u0628 \u0645\u0628\u0627\u0639`, 0)];
  if (realizedDifference > 0) entries.push(ledgerEntry(profile, "revenue", realizedDifference, "\u0631\u0628\u062D \u0645\u062D\u0627\u0643\u0627\u0629 \u0645\u0646 \u0628\u064A\u0639 \u0627\u0644\u0630\u0647\u0628", entries.length));
  if (realizedDifference < 0) entries.push(ledgerEntry(profile, "expense", Math.abs(realizedDifference), "\u0641\u0627\u0631\u0642 \u062A\u062F\u0627\u0648\u0644 \u0627\u0644\u0630\u0647\u0628 \u062F\u0627\u062E\u0644 \u0627\u0644\u0644\u0639\u0628\u0629", entries.length));
  const nextProfile = addLedger(
    profile,
    entries,
    profile.bankBalance + proceeds,
    {
      goldGrams: Math.round((profile.goldGrams - grams) * 10) / 10,
      goldCostBasis: Math.max(0, profile.goldCostBasis - bookValue)
    }
  );
  return success(nextProfile, `\u0628\u0639\u062A ${grams.toFixed(1)} \u063A\u0631\u0627\u0645 \u0630\u0647\u0628 \u0628\u0633\u0639\u0631 \u0645\u062D\u0627\u0643\u0627\u0629 \u0628\u0639\u062F \u0641\u0627\u0631\u0642 \u062A\u062F\u0627\u0648\u0644 3%.`, { grams, cashAmount: proceeds, pricePerGram: GOLD_PRICE_PER_GRAM });
}
function getDayBriefing(profile) {
  const day = profile.day + 1;
  const multiplier = findCountry(profile.countryId)?.economy.operatingCostMultiplier ?? 1;
  const operatingCost = profile.companies.reduce((sum, company) => {
    const manager = profile.staff.find((member) => member.status === "active" && member.role === "manager" && member.companyId === company.id);
    const managerDiscount = manager ? Math.min(0.18, 0.08 + (staffLevel(manager) - 1) * 0.025) : 0;
    return sum + (company.operatingCostPerDay ?? 0) * (1 - managerDiscount);
  }, 0) * multiplier * getOperatingCostProgression(profile.day) * getSynergyOperatingMultiplier(profile);
  const maturingInvestments = profile.investments.filter((investment) => investment.status === "active" && investment.maturityDay <= day).map((investment) => ({ id: investment.id, name: findInvestment(investment.investmentTypeId)?.name ?? investment.investmentTypeId }));
  const event = getEconomicEventTemplate(day);
  const availableEnergy = profile.companies.reduce((sum, company) => sum + (company.energyUnits ?? 0), 0);
  const outstandingSalary = unpaidSalaryTotal(profile);
  return { day, operatingCost, existingPayables: profile.payables + outstandingSalary, maturingInvestments, event, availableEnergy, energyPaused: profile.payables > 0 || outstandingSalary > 0 };
}
var STAFF_ROLE_OPTIONS = {
  manager: { label: "\u0645\u062F\u064A\u0631 \u0634\u0631\u0643\u0629", dailySalary: 7e3, companyRequired: true },
  accountant: { label: "\u0645\u062D\u0627\u0633\u0628", dailySalary: 4500, companyRequired: false },
  lawyer: { label: "\u0645\u062D\u0627\u0645\u064D", dailySalary: 4e3, companyRequired: false },
  hr: { label: "\u0645\u062F\u064A\u0631 \u0645\u0648\u0627\u0631\u062F \u0628\u0634\u0631\u064A\u0629", dailySalary: 3500, companyRequired: false }
};
const MAX_STAFF_LEVEL = 5;
const STAFF_EXPERIENCE_PER_LEVEL = 100;
function staffLevel(employee) {
  return Math.max(1, Math.min(MAX_STAFF_LEVEL, Math.floor(employee?.level ?? 1)));
}
function staffExperience(employee) {
  return Math.max(0, Math.min(STAFF_EXPERIENCE_PER_LEVEL - 1, Math.floor(employee?.experience ?? 0)));
}
function getStaffUpgradeCost(employee) {
  return Math.round(employee.dailySalary * (2 + staffLevel(employee)));
}
function developStaff(employee) {
  let level = staffLevel(employee);
  let experience = staffExperience(employee) + (employee.role === "manager" ? 12 : 10);
  while (level < MAX_STAFF_LEVEL && experience >= STAFF_EXPERIENCE_PER_LEVEL) {
    experience -= STAFF_EXPERIENCE_PER_LEVEL;
    level += 1;
  }
  return { ...employee, level, experience };
}
function hireStaff(profile, role, name, companyId) {
  const option = STAFF_ROLE_OPTIONS[role];
  if (!option || name.trim().length < 2) return failure(profile, "invalid-input", "\u0623\u062F\u062E\u0644 \u0627\u0633\u0645\u064B\u0627 \u0635\u062D\u064A\u062D\u064B\u0627 \u0648\u0627\u062E\u062A\u0631 \u062F\u0648\u0631\u064B\u0627 \u0645\u0639\u0631\u0648\u0641\u064B\u0627.");
  if (option.companyRequired && !profile.companies.some((company) => company.id === companyId)) return failure(profile, "not-found", "\u0627\u0644\u0645\u062F\u064A\u0631 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0631\u062A\u0628\u0637 \u0628\u0634\u0631\u0643\u0629 \u0645\u0648\u062C\u0648\u062F\u0629.");
  if (role === "manager" && profile.staff.some((member) => member.status === "active" && member.role === "manager" && member.companyId === companyId)) return failure(profile, "invalid-input", "\u0647\u0630\u0647 \u0627\u0644\u0634\u0631\u0643\u0629 \u0644\u062F\u064A\u0647\u0627 \u0645\u062F\u064A\u0631 \u0646\u0634\u0637 \u0628\u0627\u0644\u0641\u0639\u0644.");
  const hr = profile.staff.find((member) => member.status === "active" && member.role === "hr");
  const contractCost = Math.round(option.dailySalary * (hr ? Math.max(0.68, 0.8 - (staffLevel(hr) - 1) * 0.03) : 1));
  if (profile.bankBalance < contractCost) return failure(profile, "insufficient-funds", "\u0644\u0627 \u064A\u0643\u0641\u064A \u0627\u0644\u0631\u0635\u064A\u062F \u0644\u062A\u0648\u0642\u064A\u0639 \u0639\u0642\u062F \u0627\u0644\u0645\u0648\u0638\u0641 \u0648\u062F\u0641\u0639 \u064A\u0648\u0645 \u0627\u0644\u062A\u0639\u0627\u0642\u062F.");
  const staff = { id: nextId(profile, "staff", profile.staff.length), role, name: name.trim(), companyId, dailySalary: option.dailySalary, level: 1, experience: 0, hiredOnDay: profile.day, nextPayDay: profile.day + 1, status: "active" };
  const nextProfile = addLedger(
    { ...profile, staff: [...profile.staff, staff] },
    [ledgerEntry(profile, "expense", contractCost, `\u062A\u0648\u0642\u064A\u0639 \u0639\u0642\u062F ${option.label}: ${staff.name}`, 0)],
    profile.bankBalance - contractCost
  );
  return success(nextProfile, `\u062A\u0645 \u062A\u0639\u064A\u064A\u0646 ${staff.name} \u0628\u0648\u0638\u064A\u0641\u0629 ${option.label}\u061B \u0623\u0648\u0644 \u0631\u0627\u062A\u0628 \u062F\u0648\u0631\u064A \u0641\u064A \u0627\u0644\u064A\u0648\u0645 \u0627\u0644\u062A\u0627\u0644\u064A.`, staff);
}
function upgradeStaff(profile, staffId) {
  const employee = profile.staff.find((member) => member.id === staffId && member.status === "active");
  if (!employee) return failure(profile, "not-found", "عقد الموظف غير موجود أو غير نشط.");
  const level = staffLevel(employee);
  if (level >= MAX_STAFF_LEVEL) return failure(profile, "condition-not-met", "وصل الموظف إلى أعلى مستوى متاح.");
  const cost = getStaffUpgradeCost(employee);
  if (profile.bankBalance < cost) return failure(profile, "insufficient-funds", `تحتاج إلى ${cost.toLocaleString("ar-EG")} ج.م لترقية ${employee.name}.`);
  const updated = { ...employee, level: level + 1, experience: staffExperience(employee) };
  const nextProfile = addLedger(
    { ...profile, staff: profile.staff.map((member) => member.id === staffId ? updated : member) },
    [ledgerEntry(profile, "expense", cost, `ترقية الموظف ${employee.name} إلى المستوى ${level + 1}`, 0)],
    profile.bankBalance - cost
  );
  return success(nextProfile, `تمت ترقية ${employee.name} إلى المستوى ${level + 1}.`, updated);
}
function payStaffSalary(profile, staffId) {
  const employee = profile.staff.find((member) => member.id === staffId && member.status === "active");
  if (!employee) return failure(profile, "not-found", "\u0639\u0642\u062F \u0627\u0644\u0645\u0648\u0638\u0641 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u063A\u064A\u0631 \u0646\u0634\u0637.");
  const amount = employee.unpaidSalary ?? 0;
  if (amount <= 0) return failure(profile, "condition-not-met", "\u0644\u0627 \u064A\u0648\u062C\u062F \u0631\u0627\u062A\u0628 \u0645\u0633\u062A\u062D\u0642 \u0644\u0647\u0630\u0627 \u0627\u0644\u0645\u0648\u0638\u0641 \u062D\u0627\u0644\u064A\u064B\u0627.");
  if (profile.bankBalance < amount) return failure(profile, "insufficient-funds", `\u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 ${amount.toLocaleString("ar-EG")} \u062C.\u0645 \u0644\u062F\u0641\u0639 \u0631\u0627\u062A\u0628 ${employee.name}.`);
  const nextProfile = addLedger(
    { ...profile, staff: profile.staff.map((member) => member.id === staffId ? { ...member, unpaidSalary: 0, nextPayDay: profile.day + 1 } : member) },
    [ledgerEntry(profile, "settlement", amount, `\u0633\u062F\u0627\u062F \u0631\u0627\u062A\u0628 \u0645\u0633\u062A\u062D\u0642: ${employee.name}`, 0)],
    profile.bankBalance - amount
  );
  return success(nextProfile, `\u062A\u0645 \u062F\u0641\u0639 ${amount.toLocaleString("ar-EG")} \u062C.\u0645 \u0644\u0644\u0645\u0648\u0638\u0641 ${employee.name}.`, { staffId, amount });
}
function terminateStaff(profile, staffId) {
  const employee = profile.staff.find((member) => member.id === staffId && member.status === "active");
  if (!employee) return failure(profile, "not-found", "\u0639\u0642\u062F \u0627\u0644\u0645\u0648\u0638\u0641 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u062A\u0645 \u0625\u0646\u0647\u0627\u0624\u0647.");
  const updated = { ...employee, status: "terminated" };
  return success({ ...profile, staff: profile.staff.map((member) => member.id === staffId ? updated : member) }, `\u062A\u0645 \u0625\u0646\u0647\u0627\u0621 \u0639\u0642\u062F ${employee.name}.`, updated);
}
var DEPOSIT_OPTIONS = [
  { durationDays: 3, annualRate: 0.05 },
  { durationDays: 7, annualRate: 0.08 },
  { durationDays: 14, annualRate: 0.12 }
];
function createDeposit(profile, amount, durationDays) {
  const option = DEPOSIT_OPTIONS.find((item) => item.durationDays === durationDays);
  if (!option) return failure(profile, "invalid-input", "\u0645\u062F\u0629 \u0627\u0644\u0648\u062F\u064A\u0639\u0629 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629. \u0627\u062E\u062A\u0631 3 \u0623\u0648 7 \u0623\u0648 14 \u064A\u0648\u0645\u064B\u0627.");
  if (profile.banking.deposits.filter((deposit2) => deposit2.status === "active").length >= 5) return failure(profile, "condition-not-met", "\u0648\u0635\u0644\u062A \u0625\u0644\u0649 \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649: 5 \u0648\u062F\u0627\u0626\u0639 \u0646\u0634\u0637\u0629. \u0627\u062F\u0645\u062C \u0627\u0644\u0648\u062F\u0627\u0626\u0639 \u0623\u0648 \u0627\u0633\u062A\u0631\u062F \u0648\u062F\u064A\u0639\u0629 \u0645\u0633\u062A\u062D\u0642\u0629 \u0623\u0648\u0644\u064B\u0627.");
  if (!Number.isInteger(amount) || amount < 5e4) return failure(profile, "invalid-input", "\u0627\u0644\u062D\u062F \u0627\u0644\u0623\u062F\u0646\u0649 \u0644\u0644\u0648\u062F\u064A\u0639\u0629 50,000 \u062C\u0646\u064A\u0647 \u0645\u062D\u0627\u0643\u0627\u0629.");
  if (amount > profile.bankBalance) return failure(profile, "insufficient-funds", "\u0644\u0627 \u064A\u0643\u0641\u064A \u0627\u0644\u0631\u0635\u064A\u062F \u0644\u0625\u0646\u0634\u0627\u0621 \u0647\u0630\u0647 \u0627\u0644\u0648\u062F\u064A\u0639\u0629.");
  const deposit = { id: nextId(profile, "deposit", profile.banking.deposits.length), principal: amount, annualRate: option.annualRate, startedOnDay: profile.day, maturityDay: profile.day + durationDays, status: "active" };
  const nextProfile = addLedger(
    { ...profile, banking: { ...profile.banking, deposits: [...profile.banking.deposits, deposit] } },
    [ledgerEntry(profile, "asset", amount, `\u0625\u064A\u062F\u0627\u0639 \u0648\u062F\u064A\u0639\u0629 \u0644\u0645\u062F\u0629 ${durationDays} \u0623\u064A\u0627\u0645`, 0)],
    profile.bankBalance - amount
  );
  return success(nextProfile, `\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0648\u062F\u064A\u0639\u0629 \u0645\u062D\u0627\u0643\u0627\u0629 \u062A\u0633\u062A\u062D\u0642 \u0641\u064A \u0627\u0644\u064A\u0648\u0645 ${deposit.maturityDay}.`, deposit);
}
function activeDepositTranches(deposit) {
  if (deposit.tranches) return deposit.tranches.filter((tranche) => tranche.status === "active");
  return deposit.status === "active" ? [{ id: deposit.id, principal: deposit.principal, annualRate: deposit.annualRate, startedOnDay: deposit.startedOnDay, maturityDay: deposit.maturityDay, status: "active" }] : [];
}
function getDepositExpectedInterest(deposit) {
  return activeDepositTranches(deposit).reduce((sum, tranche) => sum + Math.round(tranche.principal * tranche.annualRate * (tranche.maturityDay - tranche.startedOnDay) / 30), 0);
}
function hasMaturedDepositTranche(deposit, day) {
  return activeDepositTranches(deposit).some((tranche) => day >= tranche.maturityDay);
}
function getDepositMaturityRange(deposit) {
  const tranches = activeDepositTranches(deposit);
  if (tranches.length === 0) return { firstDay: deposit.maturityDay, lastDay: deposit.maturityDay };
  return { firstDay: Math.min(...tranches.map((tranche) => tranche.maturityDay)), lastDay: Math.max(...tranches.map((tranche) => tranche.maturityDay)) };
}
function mergeDeposits(profile, depositIds) {
  if (!Array.isArray(depositIds) || depositIds.some((id) => typeof id !== "string")) return failure(profile, "invalid-input", "\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0648\u062F\u0627\u0626\u0639 \u0627\u0644\u0645\u062E\u062A\u0627\u0631\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629.");
  const ids = [...new Set(depositIds)];
  if (ids.length < 2) return failure(profile, "invalid-input", "\u0627\u062E\u062A\u0631 \u0648\u062F\u064A\u0639\u062A\u064A\u0646 \u0646\u0634\u0637\u062A\u064A\u0646 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 \u0644\u062F\u0645\u062C\u0647\u0645\u0627.");
  const deposits = ids.map((id) => profile.banking.deposits.find((deposit2) => deposit2.id === id));
  if (deposits.some((deposit2) => !deposit2 || deposit2.status !== "active")) return failure(profile, "not-found", "\u062A\u0623\u0643\u062F \u0645\u0646 \u0627\u062E\u062A\u064A\u0627\u0631 \u0648\u062F\u0627\u0626\u0639 \u0646\u0634\u0637\u0629 \u0645\u0648\u062C\u0648\u062F\u0629.");
  const selected = deposits;
  const tranches = selected.flatMap(activeDepositTranches);
  if (tranches.length < 2) return failure(profile, "invalid-input", "\u0644\u0627 \u062A\u0648\u062C\u062F \u0623\u062C\u0632\u0627\u0621 \u0646\u0634\u0637\u0629 \u0643\u0627\u0641\u064A\u0629 \u0644\u062F\u0645\u062C\u0647\u0627.");
  const principal = tranches.reduce((sum, tranche) => sum + tranche.principal, 0);
  const annualRate = principal > 0 ? tranches.reduce((sum, tranche) => sum + tranche.principal * tranche.annualRate, 0) / principal : 0;
  const deposit = {
    id: nextId(profile, "deposit", profile.banking.deposits.length),
    principal,
    annualRate,
    startedOnDay: Math.min(...tranches.map((tranche) => tranche.startedOnDay)),
    maturityDay: Math.max(...tranches.map((tranche) => tranche.maturityDay)),
    status: "active",
    tranches
  };
  const mergedIds = new Set(ids);
  const history = profile.banking.deposits.map((item) => mergedIds.has(item.id) ? { ...item, status: "merged", mergedIntoId: deposit.id } : item);
  const nextProfile = { ...profile, banking: { ...profile.banking, deposits: [...history, deposit] } };
  return success(nextProfile, `\u062A\u0645 \u062F\u0645\u062C ${ids.length} \u0648\u062F\u0627\u0626\u0639 \u0641\u064A \u0648\u062F\u064A\u0639\u0629 \u0648\u0627\u062D\u062F\u0629 \u0645\u0639 \u0627\u0644\u062D\u0641\u0627\u0638 \u0639\u0644\u0649 \u0639\u0627\u0626\u062F \u0648\u0645\u0648\u0639\u062F \u0627\u0633\u062A\u062D\u0642\u0627\u0642 \u0643\u0644 \u062C\u0632\u0621.`, deposit);
}
function withdrawDeposit(profile, depositId) {
  const deposit = profile.banking.deposits.find((item) => item.id === depositId);
  if (!deposit) return failure(profile, "not-found", "\u0627\u0644\u0648\u062F\u064A\u0639\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629.");
  if (deposit.status !== "active") return failure(profile, "invalid-input", "\u0647\u0630\u0647 \u0627\u0644\u0648\u062F\u064A\u0639\u0629 \u062A\u0645\u062A \u062A\u0633\u0648\u064A\u062A\u0647\u0627 \u0645\u0646 \u0642\u0628\u0644.");
  const activeTranches = activeDepositTranches(deposit);
  const maturedTranches = activeTranches.filter((tranche) => profile.day >= tranche.maturityDay);
  if (maturedTranches.length === 0) return failure(profile, "deposit-not-mature", `\u062A\u0633\u062A\u062D\u0642 \u0627\u0644\u0648\u062F\u064A\u0639\u0629 \u0641\u064A \u0627\u0644\u064A\u0648\u0645 ${Math.min(...activeTranches.map((tranche) => tranche.maturityDay))}.`);
  const principal = maturedTranches.reduce((sum, tranche) => sum + tranche.principal, 0);
  const interest = maturedTranches.reduce((sum, tranche) => sum + Math.round(tranche.principal * tranche.annualRate * (tranche.maturityDay - tranche.startedOnDay) / 30), 0);
  const amount = principal + interest;
  let updatedDeposit;
  if (deposit.tranches) {
    const maturedIds = new Set(maturedTranches.map((tranche) => tranche.id));
    const tranches = deposit.tranches.map((tranche) => maturedIds.has(tranche.id) ? { ...tranche, status: "paid", settledAmount: tranche.principal + Math.round(tranche.principal * tranche.annualRate * (tranche.maturityDay - tranche.startedOnDay) / 30) } : tranche);
    const remaining = tranches.filter((tranche) => tranche.status === "active");
    const remainingPrincipal = remaining.reduce((sum, tranche) => sum + tranche.principal, 0);
    const remainingRate = remainingPrincipal > 0 ? remaining.reduce((sum, tranche) => sum + tranche.principal * tranche.annualRate, 0) / remainingPrincipal : deposit.annualRate;
    updatedDeposit = { ...deposit, principal: remainingPrincipal, annualRate: remainingRate, startedOnDay: remaining.length ? Math.min(...remaining.map((tranche) => tranche.startedOnDay)) : deposit.startedOnDay, maturityDay: remaining.length ? Math.max(...remaining.map((tranche) => tranche.maturityDay)) : deposit.maturityDay, status: remaining.length ? "active" : "paid", settledAmount: (deposit.settledAmount ?? 0) + amount, tranches };
  } else {
    updatedDeposit = { ...deposit, status: "paid", settledAmount: amount };
  }
  const nextProfile = addLedger(
    { ...profile, banking: { ...profile.banking, deposits: profile.banking.deposits.map((item) => item.id === depositId ? updatedDeposit : item) } },
    [ledgerEntry(profile, "revenue", interest, `\u0641\u0627\u0626\u062F\u0629 \u0648\u062F\u064A\u0639\u0629 \u0645\u062D\u0627\u0643\u0627\u0629 ${deposit.id}`, 0), ledgerEntry(profile, "settlement", principal, `\u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0623\u0635\u0644 \u0627\u0644\u0648\u062F\u064A\u0639\u0629 ${deposit.id}`, 1)],
    profile.bankBalance + amount
  );
  return success(nextProfile, `\u062A\u0645 \u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0627\u0644\u0645\u0633\u062A\u062D\u0642 \u0645\u0646 \u0627\u0644\u0648\u062F\u064A\u0639\u0629 \u0645\u0639 \u0641\u0627\u0626\u062F\u0629 ${interest.toLocaleString("ar-EG")} \u062C.\u0645.`, { depositId, amount, interest });
}
function collateralValue(profile, collateralType, collateralId) {
  if (collateralType === "land") return profile.lands.find((land) => land.id === collateralId)?.purchasePrice ?? 0;
  const company = profile.companies.find((item) => item.id === collateralId);
  const industry = company ? findIndustry(company.industryId) : void 0;
  const country = company ? findCountry(company.countryId) : void 0;
  return company && industry ? industry.setupFee + (country?.economy.licenseFeesByIndustry[company.industryId] ?? industry.licenseFee) + 1e5 : 0;
}
function takeLoan(profile, collateralType, collateralId, amount, termDays) {
  if (profile.banking.loans.filter((loan2) => loan2.status === "active").length >= 3) return failure(profile, "condition-not-met", "\u0648\u0635\u0644\u062A \u0625\u0644\u0649 \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649: 3 \u0642\u0631\u0648\u0636 \u0646\u0634\u0637\u0629. \u0633\u062F\u0651\u062F \u0642\u0631\u0636\u064B\u0627 \u0642\u0627\u0626\u0645\u064B\u0627 \u0623\u0648\u0644\u064B\u0627.");
  const collateralAmount = collateralValue(profile, collateralType, collateralId);
  if (collateralAmount <= 0) return failure(profile, "not-found", "\u0627\u0644\u0636\u0645\u0627\u0646 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u063A\u064A\u0631 \u0645\u0624\u0647\u0644 \u0644\u0644\u062A\u0645\u0648\u064A\u0644.");
  if (profile.banking.loans.some((loan2) => loan2.status === "active" && loan2.collateralType === collateralType && loan2.collateralId === collateralId)) return failure(profile, "collateral-in-use", "\u0647\u0630\u0627 \u0627\u0644\u0636\u0645\u0627\u0646 \u0645\u0631\u062A\u0628\u0637 \u0628\u0642\u0631\u0636 \u0642\u0627\u0626\u0645 \u0628\u0627\u0644\u0641\u0639\u0644.");
  if (![7, 14, 30].includes(termDays)) return failure(profile, "invalid-input", "\u0645\u062F\u0629 \u0627\u0644\u0642\u0631\u0636 \u0627\u0644\u0645\u062A\u0627\u062D\u0629 7 \u0623\u0648 14 \u0623\u0648 30 \u064A\u0648\u0645\u064B\u0627.");
  const maximumLoan = Math.floor(collateralAmount * 0.6);
  if (!Number.isInteger(amount) || amount < 25e3 || amount > maximumLoan) return failure(profile, "invalid-input", `\u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 \u0644\u0647\u0630\u0627 \u0627\u0644\u0636\u0645\u0627\u0646 ${maximumLoan.toLocaleString("ar-EG")} \u062C.\u0645 \u0645\u062D\u0627\u0643\u0627\u0629.`);
  const annualRate = termDays === 7 ? 0.18 : termDays === 14 ? 0.22 : 0.28;
  const totalRepayment = Math.round(amount * (1 + annualRate * termDays / 30));
  const loan = { id: nextId(profile, "loan", profile.banking.loans.length), collateralType, collateralId, principal: amount, totalRepayment, annualRate, startedOnDay: profile.day, termDays, nextPaymentDay: profile.day + 1, installmentAmount: Math.ceil(totalRepayment / termDays), remainingBalance: totalRepayment, status: "active" };
  const nextProfile = addLedger(
    { ...profile, banking: { ...profile.banking, loans: [...profile.banking.loans, loan] } },
    [ledgerEntry(profile, "liability", amount, `\u0635\u0631\u0641 \u0642\u0631\u0636 \u0628\u0636\u0645\u0627\u0646 ${collateralType === "land" ? "\u0623\u0631\u0636" : "\u0634\u0631\u0643\u0629"}`, 0)],
    profile.bankBalance + amount
  );
  return success(nextProfile, `\u062A\u0645 \u0635\u0631\u0641 \u0642\u0631\u0636 \u0645\u062D\u0627\u0643\u0627\u0629 \u0628\u0642\u064A\u0645\u0629 ${amount.toLocaleString("ar-EG")} \u062C.\u0645\u061B \u064A\u0628\u062F\u0623 \u0627\u0644\u0642\u0633\u0637 \u0641\u064A \u0627\u0644\u064A\u0648\u0645 \u0627\u0644\u062A\u0627\u0644\u064A.`, loan);
}
function repayLoan(profile, loanId, installments) {
  const loan = profile.banking.loans.find((item) => item.id === loanId && item.status === "active");
  if (!loan) return failure(profile, "not-found", "\u0627\u0644\u0642\u0631\u0636 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u062A\u0645\u062A \u062A\u0633\u0648\u064A\u062A\u0647 \u0628\u0627\u0644\u0641\u0639\u0644.");
  const count = installments === "all" ? Math.ceil(loan.remainingBalance / loan.installmentAmount) : installments;
  if (!Number.isInteger(count) || count < 1) return failure(profile, "invalid-input", "\u0627\u062E\u062A\u0631 \u0642\u0633\u0637\u064B\u0627 \u0648\u0627\u062D\u062F\u064B\u0627 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.");
  const amount = installments === "all" ? loan.remainingBalance : Math.min(loan.remainingBalance, loan.installmentAmount * count);
  if (profile.bankBalance < amount) return failure(profile, "insufficient-funds", "\u0644\u0627 \u064A\u0643\u0641\u064A \u0627\u0644\u0631\u0635\u064A\u062F \u0644\u062A\u0633\u062F\u064A\u062F \u0647\u0630\u0647 \u0627\u0644\u062F\u0641\u0639\u0629.");
  const remainingBalance = Math.max(0, loan.remainingBalance - amount);
  const updatedLoan = { ...loan, remainingBalance, nextPaymentDay: loan.nextPaymentDay + count, status: remainingBalance === 0 ? "paid" : loan.status };
  const nextProfile = addLedger(
    { ...profile, banking: { ...profile.banking, loans: profile.banking.loans.map((item) => item.id === loanId ? updatedLoan : item) } },
    [ledgerEntry(profile, "settlement", amount, `\u0633\u062F\u0627\u062F ${installments === "all" ? "\u0643\u0627\u0645\u0644" : `${count} \u0623\u0642\u0633\u0627\u0637`} \u0645\u0646 \u0627\u0644\u0642\u0631\u0636 ${loanId}`, 0)],
    profile.bankBalance - amount
  );
  return success(nextProfile, remainingBalance === 0 ? "\u062A\u0645 \u0633\u062F\u0627\u062F \u0627\u0644\u0642\u0631\u0636 \u0628\u0627\u0644\u0643\u0627\u0645\u0644 \u0648\u0625\u063A\u0644\u0627\u0642\u0647." : `\u062A\u0645 \u0633\u062F\u0627\u062F ${count} \u0623\u0642\u0633\u0627\u0637 \u062F\u0641\u0639\u0629 \u0648\u0627\u062D\u062F\u0629. \u0627\u0644\u0645\u062A\u0628\u0642\u064A ${remainingBalance.toLocaleString("ar-EG")} \u062C.\u0645.`, updatedLoan);
}
function createInvestment(profile, investmentId, amount) {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  const definition = findInvestment(investmentId);
  if (!definition) return failure(profile, "not-found", "\u062E\u064A\u0627\u0631 \u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F.");
  if (!Number.isInteger(amount) || amount < definition.minimumAmount || amount > definition.maximumAmount) return failure(profile, "invalid-input", "\u0627\u0644\u0645\u0628\u0644\u063A \u062E\u0627\u0631\u062C \u0646\u0637\u0627\u0642 \u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631 \u0627\u0644\u0645\u0633\u0645\u0648\u062D.");
  if (profile.bankBalance < amount) return failure(profile, "insufficient-funds", "\u0644\u0627 \u064A\u0643\u0641\u064A \u0631\u0635\u064A\u062F\u0643 \u0644\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631.");
  const investment = {
    id: nextId(profile, "investment", profile.investments.length),
    investmentTypeId: investmentId,
    principal: amount,
    expectedReturnRate: definition.returnRate,
    startedOnDay: profile.day,
    maturityDay: profile.day + definition.durationDays,
    status: "active"
  };
  const nextProfile = addLedger(
    { ...profile, investments: [...profile.investments, investment] },
    [ledgerEntry(profile, "asset", amount, `\u0625\u0646\u0634\u0627\u0621 \u0627\u0633\u062A\u062B\u0645\u0627\u0631 ${definition.name}`, 0)],
    profile.bankBalance - amount
  );
  return success(syncTasks(nextProfile), `\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631 \u0648\u064A\u0633\u062A\u062D\u0642 \u0641\u064A \u0627\u0644\u064A\u0648\u0645 ${investment.maturityDay}.`, { investmentId: investment.id, maturityDay: investment.maturityDay, returnRate: definition.returnRate });
}
function advanceDay(profile) {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  const briefing = getDayBriefing(profile);
  const nextDay = briefing.day;
  const now = timestampFor({ ...profile, day: nextDay });
  const operatingCost = briefing.operatingCost;
  const entries = [];
  let balance = profile.bankBalance;
  let payables = profile.payables;
  const paidPriorPayables = Math.min(balance, payables);
  if (paidPriorPayables > 0) {
    balance -= paidPriorPayables;
    payables -= paidPriorPayables;
    entries.push(ledgerEntry(profile, "settlement", paidPriorPayables, "\u0633\u062F\u0627\u062F \u0627\u0644\u062A\u0632\u0627\u0645\u0627\u062A \u0633\u0627\u0628\u0642\u0629", entries.length));
  }
  const loans = profile.banking.loans.map((loan) => {
    if (loan.status !== "active" || loan.nextPaymentDay > nextDay) return loan;
    const due = Math.min(loan.remainingBalance, loan.installmentAmount);
    const paid = Math.min(balance, due);
    balance -= paid;
    const unpaid = due - paid;
    const interestShare = Math.min(due, Math.max(0, loan.totalRepayment - loan.principal) / loan.termDays);
    const principalShare = due - interestShare;
    if (interestShare > 0) entries.push(ledgerEntry(profile, "expense", Math.round(interestShare), `\u0641\u0627\u0626\u062F\u0629 \u0642\u0633\u0637 \u0627\u0644\u0642\u0631\u0636 ${loan.id}`, entries.length));
    if (principalShare > 0 && paid > 0) entries.push(ledgerEntry(profile, "settlement", Math.min(paid, Math.round(principalShare)), `\u0633\u062F\u0627\u062F \u0623\u0635\u0644 \u0642\u0633\u0637 \u0627\u0644\u0642\u0631\u0636 ${loan.id}`, entries.length));
    if (unpaid > 0) {
      payables += unpaid;
      entries.push(ledgerEntry(profile, "liability", unpaid, `\u0642\u0633\u0637 \u0642\u0631\u0636 \u063A\u064A\u0631 \u0645\u0633\u062F\u062F ${loan.id}`, entries.length));
    }
    const remainingBalance = Math.max(0, loan.remainingBalance - due);
    return { ...loan, remainingBalance, nextPaymentDay: nextDay + 1, status: remainingBalance === 0 ? "paid" : "active" };
  });
  const staff = profile.staff.map((employee) => {
    if (employee.status !== "active") return employee;
    const developed = developStaff(employee);
    if (employee.nextPayDay > nextDay) return developed;
    const dueDays = Math.max(1, nextDay - employee.nextPayDay + 1);
    return { ...developed, nextPayDay: nextDay + 1, unpaidSalary: (employee.unpaidSalary ?? 0) + employee.dailySalary * dueDays };
  });
  const salaryAccrued = staff.reduce((sum, employee) => {
    const previous = profile.staff.find((item) => item.id === employee.id);
    return sum + Math.max(0, (employee.unpaidSalary ?? 0) - (previous?.unpaidSalary ?? 0));
  }, 0);
  if (salaryAccrued > 0) {
    entries.push(ledgerEntry(profile, "expense", salaryAccrued, "\u0631\u0648\u0627\u062A\u0628 \u0645\u0633\u062A\u062D\u0642\u0629 \u0639\u0646 \u0627\u0644\u064A\u0648\u0645", entries.length));
    entries.push(ledgerEntry(profile, "liability", salaryAccrued, "\u0627\u0644\u062A\u0632\u0627\u0645 \u0631\u0648\u0627\u062A\u0628 \u063A\u064A\u0631 \u0645\u0633\u062F\u062F", entries.length));
  }
  let inventory = [...profile.inventory];
  const newlyCompletedProductionIds = [];
  const productionOrders = profile.productionOrders.map((order) => {
    if (order.status !== "active" || order.completesOnDay > nextDay) return order;
    newlyCompletedProductionIds.push(order.id);
    const unitCost = order.materialCost / order.outputQuantity;
    const existingLot = inventory.find((lot) => lot.materialOrProductId === order.productId);
    inventory = existingLot ? inventory.map((lot) => lot.materialOrProductId === order.productId ? { ...lot, quantity: lot.quantity + order.outputQuantity, unitCost: (lot.quantity * lot.unitCost + order.outputQuantity * unitCost) / (lot.quantity + order.outputQuantity), qualityScore: ((lot.qualityScore ?? 90) * lot.quantity + order.qualityScore * order.outputQuantity) / (lot.quantity + order.outputQuantity) } : lot) : [...inventory, { id: nextId(profile, "inventory", inventory.length), materialOrProductId: order.productId, quantity: order.outputQuantity, unit: order.outputUnit, unitCost, qualityScore: order.qualityScore }];
    entries.push(ledgerEntry(profile, "asset", order.materialCost, `\u0627\u0643\u062A\u0645\u0644 \u0623\u0645\u0631 \u0625\u0646\u062A\u0627\u062C ${order.productName}`, entries.length));
    return { ...order, status: "completed" };
  });
  const paidOperatingCost = Math.min(balance, operatingCost);
  balance -= paidOperatingCost;
  if (operatingCost > 0) entries.push(ledgerEntry(profile, "expense", operatingCost, "\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u064A\u0648\u0645\u064A\u0629 \u0627\u0644\u0645\u0633\u062A\u062D\u0642\u0629", entries.length));
  const unpaidOperatingCost = operatingCost - paidOperatingCost;
  if (unpaidOperatingCost > 0) {
    payables += unpaidOperatingCost;
    entries.push(ledgerEntry(profile, "liability", unpaidOperatingCost, "\u0645\u0633\u062A\u062D\u0642\u0627\u062A \u062A\u0634\u063A\u064A\u0644 \u063A\u064A\u0631 \u0645\u0633\u062F\u062F\u0629", entries.length));
  }
  let investmentPayout = 0;
  const investments = profile.investments.map((investment, index) => {
    if (investment.status !== "active" || investment.maturityDay > nextDay) return investment;
    const definition = findInvestment(investment.investmentTypeId);
    const riskRoll = (nextDay * 7919 + (index + 1) * 104729) % 1e4;
    const riskThreshold = Math.round((definition?.riskRate ?? 0) * 1e4);
    const hadLoss = Boolean(definition && riskThreshold > 0 && riskRoll < riskThreshold);
    const payoutRate = getInvestmentPayoutRate(investment.expectedReturnRate, definition?.durationDays ?? 1);
    const payout = Math.round(investment.principal * (hadLoss ? 1 - (definition?.riskRate ?? 0) : 1 + payoutRate));
    investmentPayout += payout;
    balance += payout;
    const difference = payout - investment.principal;
    if (difference > 0) entries.push(ledgerEntry(profile, "revenue", difference, `\u062A\u0633\u0648\u064A\u0629 \u0627\u0633\u062A\u062B\u0645\u0627\u0631 \u0631\u0627\u0628\u062D ${investment.id}`, entries.length));
    if (difference < 0) entries.push(ledgerEntry(profile, "expense", Math.abs(difference), `\u062E\u0633\u0627\u0631\u0629 \u0645\u062D\u0627\u0643\u0627\u0629 \u0641\u064A \u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631 ${investment.id}`, entries.length));
    return { ...investment, status: hadLoss ? "loss" : "paid", settledAmount: payout };
  });
  let eventImpact = briefing.event.cashImpact;
  if (briefing.event.cashImpact > 0) {
    balance += briefing.event.cashImpact;
    entries.push(ledgerEntry(profile, "revenue", briefing.event.cashImpact, briefing.event.title, entries.length));
  } else if (briefing.event.cashImpact < 0) {
    const lawyer = profile.staff.find((member) => member.status === "active" && member.role === "lawyer");
    const eventCost = Math.round(Math.abs(briefing.event.cashImpact) * (lawyer ? Math.max(0.73, 0.85 - (staffLevel(lawyer) - 1) * 0.03) : 1));
    const paidEventCost = Math.min(balance, eventCost);
    balance -= paidEventCost;
    eventImpact = -paidEventCost;
    entries.push(ledgerEntry(profile, "expense", eventCost, briefing.event.title, entries.length));
    if (paidEventCost < eventCost) {
      const unpaidEventCost = eventCost - paidEventCost;
      payables += unpaidEventCost;
      entries.push(ledgerEntry(profile, "liability", unpaidEventCost, "\u0627\u0644\u062A\u0632\u0627\u0645 \u062D\u062F\u062B \u0627\u0642\u062A\u0635\u0627\u062F\u064A \u063A\u064A\u0631 \u0645\u0633\u062F\u062F", entries.length));
    }
  }
  const paidAtClose = Math.min(balance, payables);
  if (paidAtClose > 0) {
    balance -= paidAtClose;
    payables -= paidAtClose;
    entries.push(ledgerEntry(profile, "settlement", paidAtClose, "\u0633\u062F\u0627\u062F \u0627\u0644\u062A\u0632\u0627\u0645\u0627\u062A \u0645\u0646 \u0633\u064A\u0648\u0644\u0629 \u0627\u0644\u064A\u0648\u0645", entries.length));
  }
  const outstandingSalary = unpaidSalaryTotal({ ...profile, staff });
  const energyPaused = payables > 0 || outstandingSalary > 0;
  const companies = profile.companies.map((company) => {
    const industry = findIndustry(company.industryId);
    const capacity = company.energyCapacity ?? industry?.energyCapacity ?? 0;
    const supply = industry?.dailyEnergySupply ?? capacity;
    return { ...company, energyUnits: energyPaused ? 0 : Math.min(capacity, (company.energyUnits ?? 0) + supply) };
  });
  const expiredContracts = (profile.contracts ?? []).filter((contract) => contract.status === "active" && contract.deadlineDay < nextDay);
  const contracts = (profile.contracts ?? []).map((contract) => contract.status === "active" && contract.deadlineDay < nextDay ? { ...contract, status: "failed", failedOnDay: nextDay } : contract);
  const reputation = Math.max(0, Math.min(100, (profile.reputation ?? 50) - expiredContracts.length * 6));
  if (expiredContracts.length > 0) entries.push(ledgerEntry(profile, "expense", expiredContracts.length * 2e3, "\u063A\u0631\u0627\u0645\u0627\u062A \u0639\u0642\u0648\u062F \u0645\u062A\u0623\u062E\u0631\u0629", entries.length));
  const event = {
    id: `event-${nextDay}`,
    day: nextDay,
    title: expiredContracts.length > 0 ? `${briefing.event.title} \xB7 \u062A\u0623\u062E\u0631 \u0639\u0642\u062F` : briefing.event.title,
    description: briefing.event.description,
    cashImpact: eventImpact,
    ...briefing.event.industryId ? { industryId: briefing.event.industryId } : {},
    ...briefing.event.materialId ? { materialId: briefing.event.materialId } : {},
    ...briefing.event.productId ? { productId: briefing.event.productId } : {},
    ...briefing.event.materialPriceMultiplier !== void 0 ? { materialPriceMultiplier: briefing.event.materialPriceMultiplier } : {},
    ...briefing.event.demandMultiplier !== void 0 ? { demandMultiplier: briefing.event.demandMultiplier } : {},
    ...briefing.event.durationDays ? { effectExpiresOnDay: nextDay + briefing.event.durationDays - 1 } : {},
    occurredAt: now
  };
  const nextProfile = addLedger(
    { ...profile, day: nextDay, activeDaySpeedMultiplier: 1, companies, investments, banking: { ...profile.banking, loans }, staff, productionOrders, inventory, unreadProductionOrderIds: [.../* @__PURE__ */ new Set([...profile.unreadProductionOrderIds ?? [], ...newlyCompletedProductionIds])].slice(-500), events: [...profile.events, event], payables, contracts, reputation },
    entries,
    balance
  );
  const totalOutstanding = payables + outstandingSalary;
  const message = totalOutstanding > 0 ? `\u0645\u0631\u0651 \u0627\u0644\u064A\u0648\u0645 ${nextDay}\u060C \u0644\u0643\u0646 \u0628\u0642\u064A\u062A \u0627\u0644\u062A\u0632\u0627\u0645\u0627\u062A \u0648\u0631\u0648\u0627\u062A\u0628 \u063A\u064A\u0631 \u0645\u0633\u062F\u062F\u0629 \u0628\u0642\u064A\u0645\u0629 ${Math.round(totalOutstanding).toLocaleString("ar-EG")} \u062C.\u0645\u061B \u0623\u064F\u0648\u0642\u0641\u062A \u0627\u0644\u0637\u0627\u0642\u0629 \u0645\u0624\u0642\u062A\u064B\u0627 \u062D\u062A\u0649 \u0627\u0644\u0633\u062F\u0627\u062F.` : `\u0645\u0631\u0651 \u0627\u0644\u064A\u0648\u0645 ${nextDay} \u0648\u0639\u0648\u0644\u062C\u062A \u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0648\u0627\u0644\u0623\u062D\u062F\u0627\u062B \u0648\u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631\u0627\u062A.`;
  return success(syncTasks(nextProfile), message, { day: nextDay, operatingCost, paidOperatingCost, payables, investmentPayout, event });
}
function awardAchievements(profile) {
  const current = profile.achievements ?? [];
  const rules = [
    { id: "first-contract", title: "\u0623\u0648\u0644 \u0635\u0641\u0642\u0629 \u0645\u0648\u062B\u0648\u0642\u0629", earned: (item) => item.contracts.some((contract) => contract.status === "completed") },
    { id: "trusted-partner", title: "\u0634\u0631\u064A\u0643 \u0645\u0648\u062B\u0648\u0642", earned: (item) => item.reputation >= 75 },
    { id: "contract-master", title: "\u0633\u064A\u062F \u0627\u0644\u0639\u0642\u0648\u062F", earned: (item) => item.contracts.filter((contract) => contract.status === "completed").length >= 5 },
    { id: "industrialist", title: "\u0635\u0646\u0627\u0639\u064A \u0635\u0627\u0639\u062F", earned: (item) => item.companies.length >= 3 }
  ];
  const additions = rules.filter((rule) => rule.earned(profile) && !current.some((achievement) => achievement.id === rule.id)).map((rule) => ({ id: rule.id, title: rule.title, earnedAtDay: profile.day }));
  return { achievements: [...current, ...additions], bonus: additions.length * 1e4 };
}
function acceptContract(profile, offerId) {
  const offer = getContractOffers(profile).find((item) => item.id === offerId);
  if (!offer) return failure(profile, "not-found", "\u0627\u0646\u062A\u0647\u062A \u0635\u0644\u0627\u062D\u064A\u0629 \u0647\u0630\u0627 \u0627\u0644\u0639\u0642\u062F\u061B \u0627\u0641\u062A\u062D \u0644\u0648\u062D\u0629 \u0627\u0644\u0639\u0642\u0648\u062F \u0644\u0631\u0624\u064A\u0629 \u0639\u0631\u0648\u0636 \u0627\u0644\u064A\u0648\u0645.");
  const previousContract = (profile.contracts ?? []).find((contract2) => contract2.id === offerId);
  if (previousContract?.status === "active") return failure(profile, "already-owned", "\u0647\u0630\u0627 \u0627\u0644\u0639\u0642\u062F \u0645\u0642\u0628\u0648\u0644 \u0628\u0627\u0644\u0641\u0639\u0644.");
  if (previousContract?.status === "completed") return failure(profile, "already-owned", "\u062A\u0645 \u062A\u0646\u0641\u064A\u0630 \u0647\u0630\u0627 \u0627\u0644\u0639\u0631\u0636 \u0645\u0646 \u0642\u0628\u0644 \u0648\u0644\u0627 \u064A\u0645\u0643\u0646 \u062A\u0643\u0631\u0627\u0631\u0647.");
  if (previousContract?.status === "failed") return failure(profile, "already-owned", "\u0627\u0646\u062A\u0647\u0649 \u0647\u0630\u0627 \u0627\u0644\u0639\u0631\u0636 \u0628\u0639\u062F \u0641\u0634\u0644\u0647 \u0648\u0644\u0627 \u064A\u0645\u0643\u0646 \u0625\u0639\u0627\u062F\u0629 \u0627\u0633\u062A\u062E\u062F\u0627\u0645\u0647.");
  if ((profile.contracts ?? []).filter((contract2) => contract2.status === "active").length >= 3) return failure(profile, "condition-not-met", "\u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u0625\u062F\u0627\u0631\u0629 \u0623\u0643\u062B\u0631 \u0645\u0646 \u062B\u0644\u0627\u062B\u0629 \u0639\u0642\u0648\u062F \u0646\u0634\u0637\u0629 \u0641\u064A \u0648\u0642\u062A \u0648\u0627\u062D\u062F.");
  const contract = { ...offer, status: "active", acceptedOnDay: profile.day };
  return success({ ...profile, contracts: [...profile.contracts ?? [], contract] }, `\u062A\u0645 \u0642\u0628\u0648\u0644 \u0639\u0642\u062F ${contract.clientName} \u062D\u062A\u0649 \u0627\u0644\u064A\u0648\u0645 ${contract.deadlineDay}.`, contract);
}
function deliverContract(profile, contractId) {
  const contract = (profile.contracts ?? []).find((item) => item.id === contractId && item.status === "active");
  if (!contract) return failure(profile, "not-found", "\u0627\u0644\u0639\u0642\u062F \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u062A\u0645\u062A \u062A\u0633\u0648\u064A\u062A\u0647.");
  if (profile.day > contract.deadlineDay) return failure(profile, "condition-not-met", "\u0627\u0646\u062A\u0647\u062A \u0645\u0647\u0644\u0629 \u0627\u0644\u0639\u0642\u062F\u061B \u0627\u0646\u062A\u0638\u0631 \u062A\u0631\u062D\u064A\u0644 \u0627\u0644\u064A\u0648\u0645 \u0644\u062A\u0633\u062C\u064A\u0644 \u0641\u0634\u0644\u0647.");
  const lot = profile.inventory.find((item) => item.materialOrProductId === contract.productId && item.quantity >= contract.quantity);
  if (!lot) return failure(profile, "insufficient-materials", `\u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 ${contract.quantity} \u0648\u062D\u062F\u0629 \u0645\u0646 ${contract.productName} \u0642\u0628\u0644 \u0627\u0644\u062A\u0633\u0644\u064A\u0645.`);
  const minimumQuality = contract.minimumQuality ?? 0;
  const actualQuality = lot.qualityScore ?? 90;
  if (actualQuality < minimumQuality) return failure(profile, "condition-not-met", `\u062C\u0648\u062F\u0629 \u0627\u0644\u0645\u0646\u062A\u062C ${Math.round(actualQuality)}%\u060C \u0628\u064A\u0646\u0645\u0627 \u064A\u0634\u062A\u0631\u0637 \u0627\u0644\u0639\u0645\u064A\u0644 ${minimumQuality}% \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.`);
  const nextInventory = profile.inventory.flatMap((item) => item.id !== lot.id ? [item] : item.quantity === contract.quantity ? [] : [{ ...item, quantity: item.quantity - contract.quantity }]);
  const grossRevenue = contract.quantity * contract.unitPrice;
  const hasAccountant = profile.staff.some((member) => member.status === "active" && member.role === "accountant");
  const taxRate = (findCountry(profile.countryId)?.economy.taxRate ?? 0) * (hasAccountant ? 0.9 : 1);
  const tax = Math.round(grossRevenue * taxRate);
  const costOfGoods = Math.round(lot.unitCost * contract.quantity);
  const sale = { id: nextId(profile, "sale", profile.sales.length), productId: contract.productId, quantity: contract.quantity, unitPrice: contract.unitPrice, grossRevenue, tax, costOfGoods, soldOnDay: profile.day, contractId: contract.id, soldAt: timestampFor(profile) };
  const revenue = grossRevenue + contract.reward;
  const completed = { ...contract, status: "completed", completedOnDay: profile.day };
  const contracts = (profile.contracts ?? []).map((item) => item.id === contract.id ? completed : item);
  const base = { ...profile, inventory: nextInventory, sales: [...profile.sales, sale], contracts, reputation: Math.min(100, (profile.reputation ?? 50) + contract.reputationReward) };
  const achievements = awardAchievements(base);
  const nextProfile = addLedger(
    { ...base, achievements: achievements.achievements },
    [
      ledgerEntry(profile, "revenue", grossRevenue, `\u0628\u064A\u0639 \u0639\u0642\u062F ${contract.clientName} \xB7 ${contract.productName}`, 0),
      ledgerEntry(profile, "revenue", contract.reward, `\u0639\u0644\u0627\u0648\u0629 \u0639\u0642\u062F ${contract.clientName}`, 1),
      ledgerEntry(profile, "expense", tax, "\u0636\u0631\u064A\u0628\u0629 \u0645\u0628\u064A\u0639\u0627\u062A \u0645\u062D\u0627\u0643\u0627\u0629 \u0639\u0644\u0649 \u0627\u0644\u0639\u0642\u062F", 2),
      ledgerEntry(profile, "expense", costOfGoods, `\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0627\u0644\u0645\u0628\u0627\u0639\u0629 \u0628\u0639\u0642\u062F: ${contract.productName}`, 3),
      ...achievements.bonus > 0 ? [ledgerEntry(profile, "revenue", achievements.bonus, "\u0645\u0643\u0627\u0641\u0623\u0629 \u0625\u0646\u062C\u0627\u0632\u0627\u062A \u0627\u0644\u0639\u0642\u0648\u062F", 4)] : []
    ],
    profile.bankBalance + revenue - tax + achievements.bonus
  );
  return success(syncTasks(nextProfile), `\u062A\u0645 \u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0639\u0642\u062F \u0628\u0646\u062C\u0627\u062D. \u0627\u0644\u0625\u064A\u0631\u0627\u062F ${grossRevenue.toLocaleString("ar-EG")} \u062C.\u0645 \u0648\u0627\u0644\u0639\u0644\u0627\u0648\u0629 ${contract.reward.toLocaleString("ar-EG")} \u062C.\u0645 \u0628\u0639\u062F \u0627\u062D\u062A\u0633\u0627\u0628 \u0627\u0644\u0636\u0631\u064A\u0628\u0629 \u0648\u0627\u0644\u062A\u0643\u0644\u0641\u0629.`, completed);
}
function negotiateContract(profile, contractId, mode) {
  const contract = (profile.contracts ?? []).find((item) => item.id === contractId && item.status === "active");
  if (!contract) return failure(profile, "not-found", "\u0627\u0644\u0639\u0642\u062F \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u062A\u0645\u062A \u062A\u0633\u0648\u064A\u062A\u0647.");
  if (contract.negotiated) return failure(profile, "already-owned", "\u062A\u0645 \u0627\u0644\u062A\u0641\u0627\u0648\u0636 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0639\u0642\u062F \u0645\u0646 \u0642\u0628\u0644.");
  const changes = mode === "price" ? { unitPrice: Math.round(contract.unitPrice * 1.08), negotiationNote: "\u0631\u0641\u0639 \u0627\u0644\u0633\u0639\u0631 8% \u0645\u0642\u0627\u0628\u0644 \u0642\u0628\u0648\u0644 \u0627\u0644\u0639\u0645\u064A\u0644 \u0628\u0645\u0647\u0644\u0629 \u0648\u0634\u0631\u0648\u0637 \u0627\u0644\u0639\u0642\u062F \u0646\u0641\u0633\u0647\u0627." } : mode === "deadline" ? { deadlineDay: contract.deadlineDay + 1, reward: Math.round(contract.reward * 0.95), negotiationNote: "\u062A\u0645\u062F\u064A\u062F \u064A\u0648\u0645 \u0648\u0627\u062D\u062F \u0645\u0642\u0627\u0628\u0644 \u062E\u0641\u0636 \u0639\u0644\u0627\u0648\u0629 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 5%." } : { minimumQuality: Math.max(0, (contract.minimumQuality ?? 90) - 5), reward: Math.round(contract.reward * 0.92), negotiationNote: "\u062E\u0641\u0636 \u0627\u0644\u062C\u0648\u062F\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 5 \u0646\u0642\u0627\u0637 \u0645\u0642\u0627\u0628\u0644 \u062E\u0641\u0636 \u0627\u0644\u0639\u0644\u0627\u0648\u0629 8%." };
  const updated = { ...contract, ...changes, negotiated: true };
  return success({ ...profile, contracts: profile.contracts.map((item) => item.id === contractId ? updated : item) }, `\u062A\u0645 \u0627\u0644\u062A\u0641\u0627\u0648\u0636: ${updated.negotiationNote}`, updated);
}
function claimTask(profile, taskId) {
  const task = TASK_CATALOG.find((item) => item.id === taskId);
  if (!task) return failure(profile, "not-found", "\u0627\u0644\u0645\u0647\u0645\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629.");
  const current = (profile.tasks ?? []).find((item) => item.taskId === taskId);
  if (current?.claimed || profile.completedTaskIds.includes(taskId)) return failure(profile, "already-claimed", "\u062A\u0645 \u062A\u062D\u0635\u064A\u0644 \u0645\u0643\u0627\u0641\u0623\u0629 \u0647\u0630\u0647 \u0627\u0644\u0645\u0647\u0645\u0629 \u0645\u0646 \u0642\u0628\u0644.");
  if (!conditionMet(profile, task.condition)) return failure(profile, "condition-not-met", "\u0644\u0645 \u064A\u062A\u062D\u0642\u0642 \u0634\u0631\u0637 \u0627\u0644\u0645\u0647\u0645\u0629 \u0628\u0639\u062F.");
  const tasks = [...(profile.tasks ?? []).filter((item) => item.taskId !== taskId), { taskId, claimed: true, claimedAt: timestampFor(profile) }];
  const nextProfile = addLedger(
    { ...profile, tasks, completedTaskIds: [...profile.completedTaskIds, taskId] },
    [ledgerEntry(profile, "revenue", task.reward, `\u0645\u0643\u0627\u0641\u0623\u0629 \u0627\u0644\u0645\u0647\u0645\u0629: ${task.title}`, 0)],
    profile.bankBalance + task.reward
  );
  return success(nextProfile, `\u062A\u0645 \u062A\u062D\u0635\u064A\u0644 \u0645\u0643\u0627\u0641\u0623\u0629 \u0645\u0647\u0645\u0629 \xAB${task.title}\xBB \u0645\u0631\u0629 \u0648\u0627\u062D\u062F\u0629.`, { taskId, reward: task.reward });
}
var bidOnLand = placeBid;
var purchaseMaterial = buyMaterial;
var foundBusiness = foundCompany;
var produce = runProduction;
var sell = sellProduct;
var invest = createInvestment;
var passDay = advanceDay;
function updateNotificationState(profile, action, notificationIds) {
  if (action !== "read" && action !== "dismiss") return failure(profile, "invalid-input", "\u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u062A\u0646\u0628\u064A\u0647 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D.");
  if (!Array.isArray(notificationIds) || notificationIds.length === 0 || notificationIds.length > 20) return failure(profile, "invalid-input", "\u0627\u062E\u062A\u0631 \u062A\u0646\u0628\u064A\u0647\u064B\u0627 \u0648\u0627\u062D\u062F\u064B\u0627 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.");
  const ids = [...new Set(notificationIds.filter((id) => typeof id === "string" && id.trim().length > 0 && id.length <= 512))];
  if (ids.length === 0 || ids.length !== notificationIds.length) return failure(profile, "invalid-input", "\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u062A\u0646\u0628\u064A\u0647\u0627\u062A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629.");
  const readIds = new Set(profile.readNotificationIds ?? []);
  const dismissedIds = new Set(profile.dismissedNotificationIds ?? []);
  for (const id of ids) (action === "read" ? readIds : dismissedIds).add(id);
  const productionIds = new Set(ids.flatMap((id) => id.startsWith("production-completed:") ? id.slice("production-completed:".length).split(",").filter(Boolean) : []));
  const nextProfile = {
    ...profile,
    readNotificationIds: [...readIds].slice(-500),
    dismissedNotificationIds: [...dismissedIds].slice(-500),
    unreadProductionOrderIds: (profile.unreadProductionOrderIds ?? []).filter((id) => !productionIds.has(id))
  };
  return success(nextProfile, action === "read" ? "\u062A\u0645 \u062A\u0639\u0644\u064A\u0645 \u0627\u0644\u062A\u0646\u0628\u064A\u0647 \u0643\u0645\u0642\u0631\u0648\u0621." : "\u062A\u0645 \u0625\u062E\u0641\u0627\u0621 \u0627\u0644\u062A\u0646\u0628\u064A\u0647.", { action, notificationIds: ids });
}
function executeGameCommand(profile, command) {
  switch (command.name) {
    case "place_bid":
      return placeBid(profile, command.args.listingId, command.args.amount, command.args.targetCompanyId);
    case "buy_direct_land":
      return buyDirectLand(profile, command.args.listingId, command.args.paymentMethod);
    case "buy_direct_company":
      return buyDirectCompany(profile, command.args.listingId, command.args.paymentMethod);
    case "sell_land":
      return sellLand(profile, command.args.landId);
    case "upgrade_land":
      return upgradeLand(profile, command.args.landId, command.args.paymentMethod);
    case "sell_company":
      return sellCompany(profile, command.args.companyId);
    case "sell_asset":
      return sellAsset(profile, command.args.assetId);
    case "buy_material":
      return buyMaterial(profile, command.args.materialId, command.args.quantity);
    case "buy_global_material":
      return buyGlobalMaterial(profile, command.args.offerId, command.args.quantity, command.args.negotiatedUnitPrice, command.args.paymentMethod);
    case "found_company":
      return foundCompany(profile, command.args.industryId, command.args.landId, command.args.name, command.args.paymentMethod);
    case "upgrade_company":
      return upgradeCompany(profile, command.args.companyId, command.args.paymentMethod);
    case "run_production":
      return runProduction(profile, command.args.companyId, command.args.batches);
    case "service_company":
      return serviceCompany(profile, command.args.companyId);
    case "cancel_production":
      return cancelProductionOrder(profile, command.args.orderId);
    case "use_speed_card":
      return useProductionSpeedCard(profile, command.args.orderId, command.args.kind);
    case "use_day_speed_card":
      return useDaySpeedCard(profile, command.args.kind);
    case "buy_speed_card":
      return buySpeedCard(profile, command.args.kind, command.args.quantity, command.args.paymentMethod);
    case "upgrade_warehouse":
      return upgradeWarehouse(profile, command.args.paymentMethod);
    case "sell_product":
      return sellProduct(profile, command.args.productId, command.args.quantity);
    case "buy_gold":
      return buyGold(profile, command.args.grams);
    case "buy_gold_with_diamonds":
      return buyGoldWithDiamonds(profile, command.args.grams);
    case "sell_gold":
      return sellGold(profile, command.args.grams);
    case "hire_staff":
      return hireStaff(profile, command.args.role, command.args.name, command.args.companyId);
    case "upgrade_staff":
      return upgradeStaff(profile, command.args.staffId);
    case "pay_staff_salary":
      return payStaffSalary(profile, command.args.staffId);
    case "terminate_staff":
      return terminateStaff(profile, command.args.staffId);
    case "create_deposit":
      return createDeposit(profile, command.args.amount, command.args.durationDays);
    case "merge_deposits":
      return mergeDeposits(profile, command.args.depositIds);
    case "withdraw_deposit":
      return withdrawDeposit(profile, command.args.depositId);
    case "take_loan":
      return takeLoan(profile, command.args.collateralType, command.args.collateralId, command.args.amount, command.args.termDays);
    case "repay_loan":
      return repayLoan(profile, command.args.loanId, command.args.installments);
    case "create_investment":
      return createInvestment(profile, command.args.investmentId, command.args.amount);
    case "advance_day":
      return advanceDay(profile);
    case "accept_contract":
      return acceptContract(profile, command.args.offerId);
    case "deliver_contract":
      return deliverContract(profile, command.args.contractId);
    case "negotiate_contract":
      return negotiateContract(profile, command.args.contractId, command.args.mode);
    case "claim_task":
      return claimTask(profile, command.args.taskId);
    case "claim_season_challenge":
      return claimSeasonChallenge(profile, command.args.challengeId);
    case "claim_login_reward":
      return claimLoginReward(profile, command.args.rewardId);
    case "choose_season_event":
      return chooseSeasonEvent(profile, command.args.choiceId);
    case "update_notification_state":
      return updateNotificationState(profile, command.args.action, command.args.notificationIds);
  }
}
export {
  acceptContract,
  advanceDay,
  bidOnLand,
  buyDirectCompany,
  buyDirectLand,
  buyGlobalMaterial,
  buyGold,
  buyGoldWithDiamonds,
  buyMaterial,
  buySpeedCard,
  cancelProductionOrder,
  claimTask,
  createDeposit,
  createInvestment,
  deliverContract,
  executeGameCommand,
  foundBusiness,
  foundCompany,
  getDayBriefing,
  getDepositExpectedInterest,
  getDepositMaturityRange,
  hasMaturedDepositTranche,
  hireStaff,
  invest,
  mergeDeposits,
  negotiateContract,
  passDay,
  payStaffSalary,
  placeBid,
  produce,
  purchaseMaterial,
  repayLoan,
  runProduction,
  sell,
  sellAsset,
  sellCompany,
  sellGold,
  sellLand,
  sellProduct,
  serviceCompany,
  takeLoan,
  terminateStaff,
  updateNotificationState,
  upgradeCompany,
  upgradeLand,
  upgradeWarehouse,
  useDaySpeedCard,
  useProductionSpeedCard,
  withdrawDeposit
};
