const MAX_PROFILE_BYTES = 512 * 1024;
const MAX_PROFILE_NODES = 30_000;
const MAX_ARRAY_ITEMS = 5_000;
const MAX_STRING_LENGTH = 4_096;
const MAX_MONEY = 1_000_000_000_000;
const MAX_GAME_DAY = 1_000_000;
const MAX_LEVEL = 1_000;
const MAX_SEASON_POINTS = 1_000_000_000;
const MAX_ENERGY = 100_000;

const SUPPORTED_COUNTRY_IDS = new Set([
  'egypt', 'saudi', 'uae', 'usa', 'kuwait', 'qatar', 'uk', 'germany', 'japan',
]);

const OPTIONAL_PROFILE_KEYS = new Set([
  'season',
  'warehouseLevel',
  'activeDaySpeedMultiplier',
  'readNotificationIds',
  'dismissedNotificationIds',
  'unreadProductionOrderIds',
  'lastSpinTimestamp',
  'lastSpinDay',
  'avatarId',
  'unlockedAvatarIds',
  'bio',
  'renameCountThisWeek',
  'lastRenameWeekTimestamp',
  'lastOfflineClaimAt',
  'globalShipments',
  'forwardContracts',
  'supplierTrust',
]);

const PROFILE_KEYS = new Set([
  'id', 'accountCode', 'name', 'level', 'countryId', 'createdAt', 'bankBalance', 'payables',
  'goldGrams', 'goldCostBasis', 'diamonds', 'speedCards', 'badges', 'assets', 'lands', 'companies',
  'finances', 'day', 'warehouseLevel', 'activeDaySpeedMultiplier', 'inventory', 'licenses', 'investments', 'banking', 'staff', 'productionOrders',
  'auctionHistory', 'redeemedCodeIds', 'sales', 'ledger', 'events', 'tasks', 'completedTaskIds',
  'season', 'reputation', 'contracts', 'achievements', 'onboarding', 'readNotificationIds', 'dismissedNotificationIds', 'unreadProductionOrderIds',
  'lastSpinTimestamp', 'lastSpinDay', 'avatarId', 'unlockedAvatarIds', 'bio', 'renameCountThisWeek', 'lastRenameWeekTimestamp', 'lastOfflineClaimAt',
  'globalShipments', 'forwardContracts', 'supplierTrust',
]);

const REQUIRED_PROFILE_KEYS = [...PROFILE_KEYS].filter((key) => !OPTIONAL_PROFILE_KEYS.has(key));

const MATERIAL_CAPACITY: Record<string, number> = {
  'crude-oil': 500, 'natural-gas': 500, water: 2_000, chemicals: 800, grain: 1_000,
  steel: 400, cement: 800, silicon: 250, fuel: 500, components: 300, packaging: 1_000,
};
const PRODUCT_CAPACITY: Record<string, number> = {
  'refined-fuel': 500, 'power-units': 1_000, 'bottled-gas': 500, 'clean-water': 2_000,
  detergent: 800, 'food-pack': 1_000, 'building-blocks': 500, electronics: 250, 'freight-service': 300,
};
const WAREHOUSE_CAPACITY = [
  { materials: 0, products: 0 },
  { materials: 8_050, products: 6_850 },
  { materials: 10_000, products: 9_000 },
  { materials: 13_500, products: 12_000 },
  { materials: 18_000, products: 16_000 },
  { materials: 24_000, products: 22_000 },
];
const INDUSTRY_PRODUCT: Record<string, string> = {
  petroleum: 'refined-fuel', electricity: 'power-units', gas: 'bottled-gas', water: 'clean-water',
  detergents: 'detergent', food: 'food-pack', construction: 'building-blocks',
  electronics: 'electronics', transport: 'freight-service',
};
const FORBIDDEN_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

type JsonRecord = Record<string, unknown>;

export type PlayerProfileValidation =
  | { ok: true }
  | { ok: false; errors: string[] };

function isRecord(value: unknown): value is JsonRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function addError(errors: string[], message: string): void {
  if (errors.length < 30) errors.push(message);
}

function scanJson(value: unknown, path: string, depth: number, state: { nodes: number }, errors: string[]): void {
  state.nodes += 1;
  if (state.nodes > MAX_PROFILE_NODES) {
    addError(errors, 'profile_complexity_limit');
    return;
  }
  if (depth > 16) {
    addError(errors, `${path}:maximum_depth_exceeded`);
    return;
  }
  if (typeof value === 'string') {
    if (value.length > MAX_STRING_LENGTH) addError(errors, `${path}:string_too_large`);
    return;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) addError(errors, `${path}:non_finite_number`);
    return;
  }
  if (value === null || typeof value === 'boolean') return;
  if (Array.isArray(value)) {
    if (value.length > MAX_ARRAY_ITEMS) addError(errors, `${path}:too_many_items`);
    for (let index = 0; index < Math.min(value.length, MAX_ARRAY_ITEMS); index += 1) {
      scanJson(value[index], `${path}[${index}]`, depth + 1, state, errors);
    }
    return;
  }
  if (!isRecord(value)) {
    addError(errors, `${path}:unsupported_json_value`);
    return;
  }
  for (const [key, entry] of Object.entries(value)) {
    if (key.length > 64 || FORBIDDEN_KEYS.has(key)) addError(errors, `${path}:unexpected_key`);
    scanJson(entry, `${path}.${key}`, depth + 1, state, errors);
  }
}

function checkAllowedKeys(value: JsonRecord, allowed: readonly string[], path: string, errors: string[]): void {
  const keys = new Set(allowed);
  for (const key of Object.keys(value)) {
    if (!keys.has(key)) addError(errors, `${path}.${key}:unexpected_field`);
  }
}

function requireString(value: unknown, path: string, errors: string[], maxLength = 256): value is string {
  if (typeof value !== 'string' || value.trim().length === 0 || value.length > maxLength) {
    addError(errors, `${path}:invalid_string`);
    return false;
  }
  return true;
}

function requireNumber(
  value: unknown,
  path: string,
  errors: string[],
  options: { min?: number; max?: number; integer?: boolean } = {},
): value is number {
  const { min = 0, max = MAX_MONEY, integer = false } = options;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) {
    addError(errors, `${path}:invalid_number`);
    return false;
  }
  return true;
}

function requireArray(value: unknown, path: string, errors: string[]): unknown[] {
  if (!Array.isArray(value)) {
    addError(errors, `${path}:invalid_array`);
    return [];
  }
  if (value.length > MAX_ARRAY_ITEMS) addError(errors, `${path}:too_many_items`);
  return value.slice(0, MAX_ARRAY_ITEMS);
}

function requireRecord(value: unknown, path: string, errors: string[]): JsonRecord {
  if (!isRecord(value)) {
    addError(errors, `${path}:invalid_object`);
    return {};
  }
  return value;
}

function uniqueStrings(values: unknown[], path: string, errors: string[]): Set<string> {
  const seen = new Set<string>();
  values.forEach((value, index) => {
    if (!requireString(value, `${path}[${index}]`, errors, 256)) return;
    if (seen.has(value)) addError(errors, `${path}:duplicate_value`);
    seen.add(value);
  });
  return seen;
}

function validateEntityIds(values: unknown[], path: string, errors: string[], allowedKeys?: readonly string[]): Set<string> {
  const seen = new Set<string>();
  values.forEach((value, index) => {
    const item = requireRecord(value, `${path}[${index}]`, errors);
    if (allowedKeys) checkAllowedKeys(item, allowedKeys, `${path}[${index}]`, errors);
    const id = item.id;
    if (!requireString(id, `${path}[${index}].id`, errors, 128)) return;
    if (seen.has(id)) addError(errors, `${path}:duplicate_id`);
    seen.add(id);
  });
  return seen;
}

function validateTimestamp(value: unknown, path: string, errors: string[]): void {
  if (requireString(value, path, errors, 64) && !Number.isFinite(Date.parse(value))) {
    addError(errors, `${path}:invalid_timestamp`);
  }
}

export function validatePlayerProfile(profile: unknown, previousProfile?: unknown): PlayerProfileValidation {
  const errors: string[] = [];
  if (!isRecord(profile)) return { ok: false, errors: ['profile:invalid_object'] };

  try {
    const serialized = JSON.stringify(profile);
    if (new TextEncoder().encode(serialized).byteLength > MAX_PROFILE_BYTES) {
      return { ok: false, errors: ['profile:payload_too_large'] };
    }
  } catch {
    return { ok: false, errors: ['profile:serialization_failed'] };
  }

  scanJson(profile, 'profile', 0, { nodes: 0 }, errors);
  checkAllowedKeys(profile, [...PROFILE_KEYS], 'profile', errors);
  for (const key of REQUIRED_PROFILE_KEYS) {
    if (!(key in profile)) addError(errors, `profile.${key}:missing_field`);
  }

  requireString(profile.id, 'profile.id', errors, 128);
  if (typeof profile.accountCode !== 'string' || profile.accountCode.length > 64) addError(errors, 'profile.accountCode:invalid_string');
  requireString(profile.name, 'profile.name', errors, 120);
  if (typeof profile.countryId !== 'string' || !SUPPORTED_COUNTRY_IDS.has(profile.countryId)) {
    addError(errors, 'profile.countryId:unsupported_country');
  }
  validateTimestamp(profile.createdAt, 'profile.createdAt', errors);
  requireNumber(profile.level, 'profile.level', errors, { min: 1, max: MAX_LEVEL, integer: true });
  requireNumber(profile.day, 'profile.day', errors, { min: 1, max: MAX_GAME_DAY, integer: true });
  if (profile.warehouseLevel !== undefined) requireNumber(profile.warehouseLevel, 'profile.warehouseLevel', errors, { min: 1, max: 5, integer: true });
  if (profile.activeDaySpeedMultiplier !== undefined && ![1, 2, 3].includes(Number(profile.activeDaySpeedMultiplier))) addError(errors, 'profile.activeDaySpeedMultiplier:invalid_value');
  const warehouseLevel = typeof profile.warehouseLevel === 'number' && Number.isInteger(profile.warehouseLevel) && profile.warehouseLevel >= 1 && profile.warehouseLevel <= 5 ? profile.warehouseLevel : 1;
  const warehouseCapacity = WAREHOUSE_CAPACITY[warehouseLevel];
  const itemCapacityMultiplier = 1 + (warehouseLevel - 1) * 0.5;
  requireNumber(profile.bankBalance, 'profile.bankBalance', errors);
  requireNumber(profile.payables, 'profile.payables', errors);
  requireNumber(profile.goldGrams, 'profile.goldGrams', errors);
  requireNumber(profile.goldCostBasis, 'profile.goldCostBasis', errors);
  requireNumber(profile.diamonds, 'profile.diamonds', errors, { min: 0, max: MAX_MONEY, integer: true });
  requireNumber(profile.reputation, 'profile.reputation', errors, { min: 0, max: 100 });

  const finances = requireRecord(profile.finances, 'profile.finances', errors);
  checkAllowedKeys(finances, ['netProfit', 'totalRevenue', 'totalExpenses'], 'profile.finances', errors);
  requireNumber(finances.netProfit, 'profile.finances.netProfit', errors, { min: -MAX_MONEY, max: MAX_MONEY });
  requireNumber(finances.totalRevenue, 'profile.finances.totalRevenue', errors);
  requireNumber(finances.totalExpenses, 'profile.finances.totalExpenses', errors);

  const assets = requireArray(profile.assets, 'profile.assets', errors);
  const lands = requireArray(profile.lands, 'profile.lands', errors);
  const companies = requireArray(profile.companies, 'profile.companies', errors);
  const inventory = requireArray(profile.inventory, 'profile.inventory', errors);
  const productionOrders = requireArray(profile.productionOrders, 'profile.productionOrders', errors);
  const assetsIds = validateEntityIds(assets, 'profile.assets', errors, ['id', 'label', 'value', 'acquiredAt']);
  const landIds = validateEntityIds(lands, 'profile.lands', errors, ['id', 'label', 'areaSquareMeters', 'purchasePrice', 'acquiredAt', 'acquiredOnDay', 'availableForCompanyOnDay', 'landType', 'upgradeLevel']);
  const companyIds = validateEntityIds(companies, 'profile.companies', errors, ['id', 'name', 'industryId', 'countryId', 'foundedAt', 'foundedOnDay', 'operationalFromDay', 'landId', 'licenseIds', 'energyUnits', 'energyCapacity', 'operatingCostPerDay', 'maintenanceCondition', 'upgradeLevel']);
  const inventoryIds = validateEntityIds(inventory, 'profile.inventory', errors, ['id', 'materialOrProductId', 'quantity', 'unit', 'unitCost', 'qualityScore']);
  const orderIds = validateEntityIds(productionOrders, 'profile.productionOrders', errors, ['id', 'companyId', 'productId', 'productName', 'batches', 'outputQuantity', 'outputUnit', 'materialCost', 'energyCost', 'expectedUnitCost', 'demandForecast', 'qualityScore', 'maintenanceCost', 'startedOnDay', 'completesOnDay', 'status']);
  void assetsIds;
  void inventoryIds;
  void orderIds;

  const usedLandIds = new Set<string>();
  for (let index = 0; index < lands.length; index += 1) {
    const land = requireRecord(lands[index], `profile.lands[${index}]`, errors);
    requireString(land.label, `profile.lands[${index}].label`, errors, 256);
    requireNumber(land.areaSquareMeters, `profile.lands[${index}].areaSquareMeters`, errors, { min: 1, max: 10_000_000 });
    requireNumber(land.purchasePrice, `profile.lands[${index}].purchasePrice`, errors);
    validateTimestamp(land.acquiredAt, `profile.lands[${index}].acquiredAt`, errors);
    if (land.acquiredOnDay !== undefined) requireNumber(land.acquiredOnDay, `profile.lands[${index}].acquiredOnDay`, errors, { min: 1, max: MAX_GAME_DAY, integer: true });
    if (land.availableForCompanyOnDay !== undefined) requireNumber(land.availableForCompanyOnDay, `profile.lands[${index}].availableForCompanyOnDay`, errors, { min: 1, max: MAX_GAME_DAY, integer: true });
    if (land.landType !== undefined && !['industrial', 'agricultural', 'commercial'].includes(String(land.landType))) addError(errors, `profile.lands[${index}].landType:invalid_value`);
  }

  const completedOutputByProduct = new Map<string, number>();
  const activeOutputByProduct = new Map<string, number>();
  const companyById = new Map<string, JsonRecord>();
  for (let index = 0; index < companies.length; index += 1) {
    const company = requireRecord(companies[index], `profile.companies[${index}]`, errors);
    const companyId = typeof company.id === 'string' ? company.id : '';
    const industryId = typeof company.industryId === 'string' ? company.industryId : '';
    if (companyId) companyById.set(companyId, company);
    if (!(industryId in INDUSTRY_PRODUCT)) addError(errors, `profile.companies[${index}].industryId:unsupported_industry`);
    if (typeof company.landId !== 'string' || !landIds.has(company.landId)) {
      addError(errors, `profile.companies[${index}].landId:company_requires_owned_land`);
    } else if (usedLandIds.has(company.landId)) {
      addError(errors, `profile.companies[${index}].landId:land_already_assigned`);
    } else {
      usedLandIds.add(company.landId);
    }
    requireString(company.name, `profile.companies[${index}].name`, errors, 120);
    requireString(company.countryId, `profile.companies[${index}].countryId`, errors, 32);
    validateTimestamp(company.foundedAt, `profile.companies[${index}].foundedAt`, errors);
    if (company.foundedOnDay !== undefined) requireNumber(company.foundedOnDay, `profile.companies[${index}].foundedOnDay`, errors, { min: 1, max: MAX_GAME_DAY, integer: true });
    if (company.operationalFromDay !== undefined) requireNumber(company.operationalFromDay, `profile.companies[${index}].operationalFromDay`, errors, { min: 1, max: MAX_GAME_DAY, integer: true });
    if (company.energyCapacity !== undefined) requireNumber(company.energyCapacity, `profile.companies[${index}].energyCapacity`, errors, { min: 1, max: MAX_ENERGY });
    if (company.energyUnits !== undefined) {
      const energyIsValid = requireNumber(company.energyUnits, `profile.companies[${index}].energyUnits`, errors, { min: 0, max: MAX_ENERGY });
      if (energyIsValid && typeof company.energyUnits === 'number' && typeof company.energyCapacity === 'number' && company.energyUnits > company.energyCapacity) addError(errors, `profile.companies[${index}].energyUnits:exceeds_capacity`);
    }
    if (company.operatingCostPerDay !== undefined) requireNumber(company.operatingCostPerDay, `profile.companies[${index}].operatingCostPerDay`, errors);
    if (company.maintenanceCondition !== undefined) requireNumber(company.maintenanceCondition, `profile.companies[${index}].maintenanceCondition`, errors, { min: 0, max: 100 });
    if (company.upgradeLevel !== undefined) requireNumber(company.upgradeLevel, `profile.companies[${index}].upgradeLevel`, errors, { min: 0, max: MAX_LEVEL, integer: true });
    if (company.licenseIds !== undefined) uniqueStrings(requireArray(company.licenseIds, `profile.companies[${index}].licenseIds`, errors), `profile.companies[${index}].licenseIds`, errors);
  }

  for (let index = 0; index < inventory.length; index += 1) {
    const lot = requireRecord(inventory[index], `profile.inventory[${index}]`, errors);
    const itemId = typeof lot.materialOrProductId === 'string' ? lot.materialOrProductId : '';
    const quantityValid = requireNumber(lot.quantity, `profile.inventory[${index}].quantity`, errors, { min: Number.EPSILON, max: MAX_MONEY, integer: true });
    requireString(lot.unit, `profile.inventory[${index}].unit`, errors, 64);
    requireNumber(lot.unitCost, `profile.inventory[${index}].unitCost`, errors);
    if (lot.qualityScore !== undefined) requireNumber(lot.qualityScore, `profile.inventory[${index}].qualityScore`, errors, { min: 0, max: 100 });
    const baseLimit = MATERIAL_CAPACITY[itemId] ?? PRODUCT_CAPACITY[itemId];
    if (baseLimit === undefined) {
      addError(errors, `profile.inventory[${index}].materialOrProductId:unknown_catalog_item`);
    } else if (quantityValid && typeof lot.quantity === 'number' && lot.quantity > Math.floor(baseLimit * itemCapacityMultiplier)) {
      addError(errors, `profile.inventory[${index}].quantity:exceeds_storage_capacity`);
    }
    if (itemId in PRODUCT_CAPACITY && ![...completedOutputByProduct.keys()].includes(itemId)) {
      // Checked again after production orders are collected below.
    }
  }

  const inventoryByItem = new Map<string, number>();
  for (const entry of inventory) {
    const item = requireRecord(entry, 'profile.inventory', errors);
    if (typeof item.materialOrProductId === 'string' && typeof item.quantity === 'number') {
      inventoryByItem.set(item.materialOrProductId, (inventoryByItem.get(item.materialOrProductId) ?? 0) + item.quantity);
    }
  }

  for (let index = 0; index < productionOrders.length; index += 1) {
    const order = requireRecord(productionOrders[index], `profile.productionOrders[${index}]`, errors);
    const company = typeof order.companyId === 'string' ? companyById.get(order.companyId) : undefined;
    const productId = typeof order.productId === 'string' ? order.productId : '';
    const expectedProduct = company && typeof company.industryId === 'string' ? INDUSTRY_PRODUCT[company.industryId] : undefined;
    if (!company) addError(errors, `profile.productionOrders[${index}].companyId:unknown_company`);
    if (!(productId in PRODUCT_CAPACITY) || productId !== expectedProduct) addError(errors, `profile.productionOrders[${index}].productId:invalid_company_product`);
    requireString(order.productName, `profile.productionOrders[${index}].productName`, errors, 120);
    requireString(order.outputUnit, `profile.productionOrders[${index}].outputUnit`, errors, 64);
    requireNumber(order.batches, `profile.productionOrders[${index}].batches`, errors, { min: 1, max: MAX_MONEY, integer: true });
    const outputValid = requireNumber(order.outputQuantity, `profile.productionOrders[${index}].outputQuantity`, errors, { min: 1, max: MAX_MONEY, integer: true });
    requireNumber(order.materialCost, `profile.productionOrders[${index}].materialCost`, errors);
    requireNumber(order.energyCost, `profile.productionOrders[${index}].energyCost`, errors);
    requireNumber(order.expectedUnitCost, `profile.productionOrders[${index}].expectedUnitCost`, errors);
    requireNumber(order.demandForecast, `profile.productionOrders[${index}].demandForecast`, errors);
    requireNumber(order.qualityScore, `profile.productionOrders[${index}].qualityScore`, errors, { min: 0, max: 100 });
    requireNumber(order.maintenanceCost, `profile.productionOrders[${index}].maintenanceCost`, errors);
    requireNumber(order.startedOnDay, `profile.productionOrders[${index}].startedOnDay`, errors, { min: 1, max: MAX_GAME_DAY, integer: true });
    requireNumber(order.completesOnDay, `profile.productionOrders[${index}].completesOnDay`, errors, { min: 1, max: MAX_GAME_DAY, integer: true });
    if (typeof order.startedOnDay === 'number' && typeof order.completesOnDay === 'number' && order.completesOnDay < order.startedOnDay) addError(errors, `profile.productionOrders[${index}].completesOnDay:before_start`);
    if (!['active', 'completed', 'cancelled'].includes(String(order.status))) addError(errors, `profile.productionOrders[${index}].status:invalid_value`);
    if (outputValid && typeof order.outputQuantity === 'number' && typeof order.status === 'string' && typeof order.productId === 'string') {
      if (order.status === 'completed') completedOutputByProduct.set(order.productId, (completedOutputByProduct.get(order.productId) ?? 0) + order.outputQuantity);
      if (order.status === 'active') activeOutputByProduct.set(order.productId, (activeOutputByProduct.get(order.productId) ?? 0) + order.outputQuantity);
    }
  }

  for (const productId of new Set([...inventoryByItem.keys(), ...activeOutputByProduct.keys()])) {
    if (productId in PRODUCT_CAPACITY) {
      const quantity = inventoryByItem.get(productId) ?? 0;
      const produced = completedOutputByProduct.get(productId) ?? 0;
      if (quantity > 0 && produced <= 0) addError(errors, `profile.inventory.${productId}:product_without_completed_production`);
      const reserved = activeOutputByProduct.get(productId) ?? 0;
      if (quantity + reserved > Math.floor(PRODUCT_CAPACITY[productId] * itemCapacityMultiplier)) addError(errors, `profile.inventory.${productId}:planned_stock_exceeds_capacity`);
    }
  }
  const totalMaterialUsage = [...inventoryByItem].reduce((sum, [itemId, quantity]) => sum + (itemId in MATERIAL_CAPACITY ? quantity : 0), 0);
  const totalProductUsage = [...inventoryByItem].reduce((sum, [itemId, quantity]) => sum + (itemId in PRODUCT_CAPACITY ? quantity : 0), 0)
    + [...activeOutputByProduct.values()].reduce((sum, quantity) => sum + quantity, 0);
  if (totalMaterialUsage > warehouseCapacity.materials) addError(errors, 'profile.inventory:warehouse_material_capacity_exceeded');
  if (totalProductUsage > warehouseCapacity.products) addError(errors, 'profile.inventory:warehouse_product_capacity_exceeded');

  const assetValues = assets;
  for (let index = 0; index < assetValues.length; index += 1) {
    const asset = requireRecord(assetValues[index], `profile.assets[${index}]`, errors);
    requireString(asset.label, `profile.assets[${index}].label`, errors, 256);
    requireNumber(asset.value, `profile.assets[${index}].value`, errors);
    validateTimestamp(asset.acquiredAt, `profile.assets[${index}].acquiredAt`, errors);
  }

  const simpleIdArrays: Array<[string, unknown]> = [
    ['profile.badges', profile.badges],
    ['profile.redeemedCodeIds', profile.redeemedCodeIds],
    ['profile.completedTaskIds', profile.completedTaskIds],
    ['profile.readNotificationIds', profile.readNotificationIds ?? []],
    ['profile.dismissedNotificationIds', profile.dismissedNotificationIds ?? []],
    ['profile.unreadProductionOrderIds', profile.unreadProductionOrderIds ?? []],
  ];
  for (const [path, value] of simpleIdArrays) uniqueStrings(requireArray(value, path, errors), path, errors);

  const tasks = requireArray(profile.tasks, 'profile.tasks', errors);
  const taskIds = new Set<string>();
  tasks.forEach((value, index) => {
    const task = requireRecord(value, `profile.tasks[${index}]`, errors);
    checkAllowedKeys(task, ['taskId', 'claimed', 'claimedAt'], `profile.tasks[${index}]`, errors);
    const id = task.taskId;
    if (requireString(id, `profile.tasks[${index}].taskId`, errors, 128)) {
      if (taskIds.has(id)) addError(errors, 'profile.tasks:duplicate_id');
      taskIds.add(id);
    }
    if (typeof task.claimed !== 'boolean') addError(errors, `profile.tasks[${index}].claimed:invalid_boolean`);
    if (task.claimedAt !== undefined) validateTimestamp(task.claimedAt, `profile.tasks[${index}].claimedAt`, errors);
  });

  const speedCards = requireArray(profile.speedCards, 'profile.speedCards', errors);
  const speedKinds = new Set<string>();
  speedCards.forEach((value, index) => {
    const card = requireRecord(value, `profile.speedCards[${index}]`, errors);
    checkAllowedKeys(card, ['kind', 'quantity'], `profile.speedCards[${index}]`, errors);
    if (!['production-25', 'production-50', 'production-instant', 'capacity-boost', 'day-speed-2x', 'day-speed-3x'].includes(String(card.kind))) addError(errors, `profile.speedCards[${index}].kind:invalid_value`);
    if (typeof card.kind === 'string' && speedKinds.has(card.kind)) addError(errors, 'profile.speedCards:duplicate_kind');
    if (typeof card.kind === 'string') speedKinds.add(card.kind);
    requireNumber(card.quantity, `profile.speedCards[${index}].quantity`, errors, { min: 0, max: MAX_MONEY, integer: true });
  });

  const banking = requireRecord(profile.banking, 'profile.banking', errors);
  checkAllowedKeys(banking, ['deposits', 'loans'], 'profile.banking', errors);
  const nestedIdCollections: Array<[string, unknown, readonly string[]]> = [
    ['profile.banking.deposits', banking.deposits, ['id', 'principal', 'annualRate', 'startedOnDay', 'maturityDay', 'status', 'settledAmount', 'mergedIntoId', 'tranches']],
    ['profile.banking.loans', banking.loans, ['id', 'collateralType', 'collateralId', 'principal', 'totalRepayment', 'annualRate', 'startedOnDay', 'termDays', 'nextPaymentDay', 'installmentAmount', 'remainingBalance', 'status']],
    ['profile.licenses', profile.licenses, ['id', 'countryId', 'industryId', 'feePaid', 'issuedAt', 'expiresAt']],
    ['profile.investments', profile.investments, ['id', 'investmentTypeId', 'principal', 'expectedReturnRate', 'startedOnDay', 'maturityDay', 'status', 'settledAmount']],
    ['profile.staff', profile.staff, ['id', 'role', 'name', 'companyId', 'dailySalary', 'level', 'experience', 'hiredOnDay', 'nextPayDay', 'unpaidSalary', 'status']],
    ['profile.auctionHistory', profile.auctionHistory, ['id', 'listingId', 'bidder', 'bidderId', 'amount', 'day', 'occurredAt']],
    ['profile.sales', profile.sales, ['id', 'productId', 'quantity', 'unitPrice', 'grossRevenue', 'tax', 'costOfGoods', 'soldOnDay', 'contractId', 'soldAt']],
    ['profile.ledger', profile.ledger, ['id', 'category', 'amount', 'countryId', 'occurredAt', 'note']],
    ['profile.events', profile.events, ['id', 'day', 'title', 'description', 'cashImpact', 'occurredAt', 'industryId', 'materialId', 'productId', 'materialPriceMultiplier', 'demandMultiplier', 'effectExpiresOnDay']],
    ['profile.contracts', profile.contracts, ['id', 'clientName', 'clientType', 'productId', 'productName', 'quantity', 'unitPrice', 'reward', 'reputationReward', 'minimumQuality', 'deadlineDay', 'acceptedOnDay', 'status', 'completedOnDay', 'failedOnDay', 'negotiated', 'negotiationNote', 'description']],
    ['profile.achievements', profile.achievements, ['id', 'earnedAtDay', 'title']],
  ];
  const collectionIds = new Map<string, Set<string>>();
  for (const [path, value, allowed] of nestedIdCollections) {
    collectionIds.set(path, validateEntityIds(requireArray(value, path, errors), path, errors, allowed));
  }
  const eventRecords = requireArray(profile.events, 'profile.events', errors);
  eventRecords.forEach((value, index) => {
    if (!isRecord(value)) return;
    const path = `profile.events[${index}]`;
    if (value.description !== undefined) requireString(value.description, `${path}.description`, errors, 600);
    if (value.industryId !== undefined && (typeof value.industryId !== 'string' || !Object.hasOwn(INDUSTRY_PRODUCT, value.industryId))) addError(errors, `${path}.industryId:invalid_value`);
    if (value.materialId !== undefined && (typeof value.materialId !== 'string' || !Object.hasOwn(MATERIAL_CAPACITY, value.materialId))) addError(errors, `${path}.materialId:invalid_value`);
    if (value.productId !== undefined && (typeof value.productId !== 'string' || !Object.hasOwn(PRODUCT_CAPACITY, value.productId))) addError(errors, `${path}.productId:invalid_value`);
    if (value.materialPriceMultiplier !== undefined) requireNumber(value.materialPriceMultiplier, `${path}.materialPriceMultiplier`, errors, { min: 1, max: 3 });
    if (value.demandMultiplier !== undefined) requireNumber(value.demandMultiplier, `${path}.demandMultiplier`, errors, { min: 1, max: 3 });
    if (value.effectExpiresOnDay !== undefined) requireNumber(value.effectExpiresOnDay, `${path}.effectExpiresOnDay`, errors, { min: 1, max: MAX_GAME_DAY, integer: true });
    if ((value.materialPriceMultiplier !== undefined || value.demandMultiplier !== undefined) && value.effectExpiresOnDay === undefined) addError(errors, `${path}.effectExpiresOnDay:required_for_market_effect`);
  });
  const deposits = requireArray(banking.deposits, 'profile.banking.deposits', errors);
  deposits.forEach((value, index) => {
    if (!isRecord(value)) return;
    if (!['active', 'paid', 'withdrawn', 'merged'].includes(String(value.status))) addError(errors, `profile.banking.deposits[${index}].status:invalid_value`);
    if (value.mergedIntoId !== undefined) requireString(value.mergedIntoId, `profile.banking.deposits[${index}].mergedIntoId`, errors, 128);
    if (value.status === 'merged' && typeof value.mergedIntoId !== 'string') addError(errors, `profile.banking.deposits[${index}].mergedIntoId:required`);
    if (value.tranches === undefined) return;
    if (!Array.isArray(value.tranches) || value.tranches.length === 0 || value.tranches.length > 250) {
      addError(errors, `profile.banking.deposits[${index}].tranches:invalid_length`);
      return;
    }
    value.tranches.forEach((entry, trancheIndex) => {
      const path = `profile.banking.deposits[${index}].tranches[${trancheIndex}]`;
      const tranche = requireRecord(entry, path, errors);
      checkAllowedKeys(tranche, ['id', 'principal', 'annualRate', 'startedOnDay', 'maturityDay', 'status', 'settledAmount'], path, errors);
      requireString(tranche.id, `${path}.id`, errors, 128);
      requireNumber(tranche.principal, `${path}.principal`, errors, { min: 0, max: MAX_MONEY });
      requireNumber(tranche.annualRate, `${path}.annualRate`, errors, { min: 0, max: 10 });
      requireNumber(tranche.startedOnDay, `${path}.startedOnDay`, errors, { min: 1, max: MAX_GAME_DAY, integer: true });
      requireNumber(tranche.maturityDay, `${path}.maturityDay`, errors, { min: 1, max: MAX_GAME_DAY, integer: true });
      if (typeof tranche.startedOnDay === 'number' && typeof tranche.maturityDay === 'number' && tranche.maturityDay < tranche.startedOnDay) addError(errors, `${path}.maturityDay:before_start`);
      if (!['active', 'paid', 'withdrawn'].includes(String(tranche.status))) addError(errors, `${path}.status:invalid_value`);
      if (tranche.settledAmount !== undefined) requireNumber(tranche.settledAmount, `${path}.settledAmount`, errors, { min: 0, max: MAX_MONEY });
    });
  });
  const allIdGroups: Array<[string, unknown[]]> = [
    ['assets', assets], ['lands', lands], ['companies', companies], ['inventory', inventory],
    ['productionOrders', productionOrders],
    ...nestedIdCollections.map(([path, value]) => [path, requireArray(value, path, errors)] as [string, unknown[]]),
  ];
  const allIds = new Set<string>();
  for (const [path, values] of allIdGroups) {
    for (const value of values) {
      if (!isRecord(value) || typeof value.id !== 'string') continue;
      if (allIds.has(value.id)) addError(errors, `profile.${path}:duplicate_global_id`);
      allIds.add(value.id);
    }
  }
  void collectionIds;

  const onboarding = requireRecord(profile.onboarding, 'profile.onboarding', errors);
  checkAllowedKeys(
    onboarding,
    [
      'introCompleted',
      'chapter',
      'seenGuides',
      'countryIntroSeen',
      'walkthroughCompleted',
      'walkthroughSkipped',
      'walkthroughStepId',
      'seenQuestBriefings',
      'claimedStoryQuestIds',
      'claimedCampaignChapters',
      'campaignChapterId',
    ],
    'profile.onboarding',
    errors,
  );
  if (typeof onboarding.introCompleted !== 'boolean') addError(errors, 'profile.onboarding.introCompleted:invalid_boolean');
  requireNumber(onboarding.chapter, 'profile.onboarding.chapter', errors, { min: 0, max: 100, integer: true });
  uniqueStrings(requireArray(onboarding.seenGuides, 'profile.onboarding.seenGuides', errors), 'profile.onboarding.seenGuides', errors);
  if (onboarding.countryIntroSeen !== undefined && typeof onboarding.countryIntroSeen !== 'boolean') addError(errors, 'profile.onboarding.countryIntroSeen:invalid_boolean');
  if (onboarding.walkthroughCompleted !== undefined && typeof onboarding.walkthroughCompleted !== 'boolean') addError(errors, 'profile.onboarding.walkthroughCompleted:invalid_boolean');
  if (onboarding.walkthroughSkipped !== undefined && typeof onboarding.walkthroughSkipped !== 'boolean') addError(errors, 'profile.onboarding.walkthroughSkipped:invalid_boolean');
  if (onboarding.walkthroughStepId !== undefined) requireString(onboarding.walkthroughStepId, 'profile.onboarding.walkthroughStepId', errors, 128);
  if (onboarding.seenQuestBriefings !== undefined) uniqueStrings(requireArray(onboarding.seenQuestBriefings, 'profile.onboarding.seenQuestBriefings', errors), 'profile.onboarding.seenQuestBriefings', errors);
  if (onboarding.claimedStoryQuestIds !== undefined) uniqueStrings(requireArray(onboarding.claimedStoryQuestIds, 'profile.onboarding.claimedStoryQuestIds', errors), 'profile.onboarding.claimedStoryQuestIds', errors);
  if (onboarding.campaignChapterId !== undefined) requireNumber(onboarding.campaignChapterId, 'profile.onboarding.campaignChapterId', errors, { min: 1, max: 20, integer: true });
  if (onboarding.claimedCampaignChapters !== undefined) {
    const claimedCh = requireArray(onboarding.claimedCampaignChapters, 'profile.onboarding.claimedCampaignChapters', errors);
    claimedCh.forEach((ch, idx) => requireNumber(ch, `profile.onboarding.claimedCampaignChapters[${idx}]`, errors, { min: 1, max: 20, integer: true }));
  }

  if (profile.season !== undefined) {
    const season = requireRecord(profile.season, 'profile.season', errors);
    checkAllowedKeys(season, ['seasonId', 'startedOnDay', 'endsOnDay', 'points', 'claimedChallengeKeys', 'claimedLoginRewardDay'], 'profile.season', errors);
    requireString(season.seasonId, 'profile.season.seasonId', errors, 128);
    requireNumber(season.startedOnDay, 'profile.season.startedOnDay', errors, { min: 1, max: MAX_GAME_DAY, integer: true });
    requireNumber(season.endsOnDay, 'profile.season.endsOnDay', errors, { min: 1, max: MAX_GAME_DAY, integer: true });
    requireNumber(season.points, 'profile.season.points', errors, { min: 0, max: MAX_SEASON_POINTS, integer: true });
    uniqueStrings(requireArray(season.claimedChallengeKeys, 'profile.season.claimedChallengeKeys', errors), 'profile.season.claimedChallengeKeys', errors);
    if (season.claimedLoginRewardDay !== undefined) requireNumber(season.claimedLoginRewardDay, 'profile.season.claimedLoginRewardDay', errors, { min: 1, max: MAX_GAME_DAY, integer: true });
  }

  if (profile.globalShipments !== undefined) {
    const shipments = requireArray(profile.globalShipments, 'profile.globalShipments', errors);
    validateEntityIds(
      shipments,
      'profile.globalShipments',
      errors,
      ['id', 'direction', 'itemId', 'itemName', 'quantity', 'unit', 'unitCostOrPrice', 'freightCost', 'customsDuty', 'shippingMode', 'originOrDestination', 'partnerName', 'qualityScore', 'orderedOnDay', 'arrivesOnDay', 'deferredBalanceDue', 'status'],
    );
    shipments.forEach((entry, idx) => {
      const sh = requireRecord(entry, `profile.globalShipments[${idx}]`, errors);
      if (!['import', 'export'].includes(String(sh.direction))) addError(errors, `profile.globalShipments[${idx}].direction:invalid_value`);
      requireNumber(sh.quantity, `profile.globalShipments[${idx}].quantity`, errors, { min: 1, max: MAX_MONEY, integer: true });
      requireNumber(sh.unitCostOrPrice, `profile.globalShipments[${idx}].unitCostOrPrice`, errors, { min: 0, max: MAX_MONEY });
      requireNumber(sh.freightCost, `profile.globalShipments[${idx}].freightCost`, errors, { min: 0, max: MAX_MONEY });
      requireNumber(sh.customsDuty, `profile.globalShipments[${idx}].customsDuty`, errors, { min: 0, max: MAX_MONEY });
      if (!['spot-ddp', 'sea-cif', 'air-express'].includes(String(sh.shippingMode))) addError(errors, `profile.globalShipments[${idx}].shippingMode:invalid_value`);
      requireNumber(sh.qualityScore, `profile.globalShipments[${idx}].qualityScore`, errors, { min: 0, max: 100 });
      requireNumber(sh.orderedOnDay, `profile.globalShipments[${idx}].orderedOnDay`, errors, { min: 1, max: MAX_GAME_DAY, integer: true });
      requireNumber(sh.arrivesOnDay, `profile.globalShipments[${idx}].arrivesOnDay`, errors, { min: 1, max: MAX_GAME_DAY, integer: true });
      requireNumber(sh.deferredBalanceDue, `profile.globalShipments[${idx}].deferredBalanceDue`, errors, { min: 0, max: MAX_MONEY });
      if (!['in-transit', 'delivered'].includes(String(sh.status))) addError(errors, `profile.globalShipments[${idx}].status:invalid_value`);
    });
  }

  if (profile.forwardContracts !== undefined) {
    const forwards = requireArray(profile.forwardContracts, 'profile.forwardContracts', errors);
    validateEntityIds(
      forwards,
      'profile.forwardContracts',
      errors,
      ['id', 'materialId', 'materialName', 'supplierName', 'originHub', 'lockedUnitPrice', 'dailyQuota', 'remainingQuota', 'marginPaid', 'startedOnDay', 'expiresOnDay', 'qualityScore', 'status'],
    );
    forwards.forEach((entry, idx) => {
      const fw = requireRecord(entry, `profile.forwardContracts[${idx}]`, errors);
      requireNumber(fw.lockedUnitPrice, `profile.forwardContracts[${idx}].lockedUnitPrice`, errors, { min: 0, max: MAX_MONEY });
      requireNumber(fw.dailyQuota, `profile.forwardContracts[${idx}].dailyQuota`, errors, { min: 1, max: MAX_MONEY, integer: true });
      requireNumber(fw.remainingQuota, `profile.forwardContracts[${idx}].remainingQuota`, errors, { min: 0, max: MAX_MONEY, integer: true });
      requireNumber(fw.marginPaid, `profile.forwardContracts[${idx}].marginPaid`, errors, { min: 0, max: MAX_MONEY });
      requireNumber(fw.startedOnDay, `profile.forwardContracts[${idx}].startedOnDay`, errors, { min: 1, max: MAX_GAME_DAY, integer: true });
      requireNumber(fw.expiresOnDay, `profile.forwardContracts[${idx}].expiresOnDay`, errors, { min: 1, max: MAX_GAME_DAY, integer: true });
      requireNumber(fw.qualityScore, `profile.forwardContracts[${idx}].qualityScore`, errors, { min: 0, max: 100 });
      if (!['active', 'completed', 'expired'].includes(String(fw.status))) addError(errors, `profile.forwardContracts[${idx}].status:invalid_value`);
    });
  }

  if (profile.supplierTrust !== undefined) {
    const trustMap = requireRecord(profile.supplierTrust, 'profile.supplierTrust', errors);
    for (const [supplierKey, score] of Object.entries(trustMap)) {
      if (supplierKey.length > 128) addError(errors, 'profile.supplierTrust:key_too_long');
      requireNumber(score, `profile.supplierTrust.${supplierKey}`, errors, { min: 0, max: 100 });
    }
  }
  if (previousProfile !== undefined) {
    if (!isRecord(previousProfile) || typeof previousProfile.day !== 'number' || typeof profile.day !== 'number') {
      addError(errors, 'profile.day:cannot_validate_previous_day');
    } else if (profile.day < previousProfile.day) {
      addError(errors, 'profile.day:cannot_move_backward');
    }
    if (isRecord(previousProfile) && typeof previousProfile.id === 'string' && profile.id !== previousProfile.id) {
      addError(errors, 'profile.id:identity_changed');
    }
  }

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}
