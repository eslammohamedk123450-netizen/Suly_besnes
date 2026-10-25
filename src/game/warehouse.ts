import type { InventoryLot } from '../domain/futureSystems';
import type { PlayerProfile } from '../domain/player';
import { MATERIAL_CATALOG, PRODUCT_CATALOG } from './catalog';

export interface WarehouseCapacity {
  materials: number;
  products: number;
}

export interface WarehouseUpgradeRequirement {
  cash: number;
  materials: Readonly<Record<string, number>>;
}

const CAPACITIES: readonly WarehouseCapacity[] = [
  { materials: 0, products: 0 },
  { materials: 8_050, products: 6_850 },
  { materials: 10_000, products: 9_000 },
  { materials: 13_500, products: 12_000 },
  { materials: 18_000, products: 16_000 },
  { materials: 24_000, products: 22_000 },
];

/** Requirements are keyed by the level being installed; early upgrades are intentionally affordable. */
export const WAREHOUSE_UPGRADE_REQUIREMENTS: Readonly<Record<number, WarehouseUpgradeRequirement>> = {
  2: { cash: 40_000, materials: { steel: 2, cement: 5 } },
  3: { cash: 90_000, materials: { steel: 8, cement: 16, components: 2 } },
  4: { cash: 180_000, materials: { steel: 20, cement: 45, components: 8 } },
  5: { cash: 350_000, materials: { steel: 50, cement: 100, components: 25 } },
};

export function normalizeWarehouseLevel(level: unknown): number {
  return typeof level === 'number' && Number.isInteger(level) && level >= 1 && level <= 5 ? level : 1;
}

export function getWarehouseCapacity(level: number): WarehouseCapacity {
  return CAPACITIES[normalizeWarehouseLevel(level)];
}

export function getWarehouseItemCapacity(itemId: string, level: number): number | undefined {
  const multiplier = 1 + (normalizeWarehouseLevel(level) - 1) * 0.5;
  const item = MATERIAL_CATALOG.find((entry) => entry.id === itemId) ?? PRODUCT_CATALOG.find((entry) => entry.id === itemId);
  return item ? Math.floor(item.storageLimit * multiplier) : undefined;
}

export function getWarehouseUsage(inventory: readonly InventoryLot[], productionOrders: PlayerProfile['productionOrders']): WarehouseCapacity {
  const materials = new Set(MATERIAL_CATALOG.map((item) => item.id));
  const products = new Set(PRODUCT_CATALOG.map((item) => item.id));
  const materialUsage = inventory.reduce((sum, lot) => sum + (materials.has(lot.materialOrProductId) ? lot.quantity : 0), 0);
  const storedProducts = inventory.reduce((sum, lot) => sum + (products.has(lot.materialOrProductId) ? lot.quantity : 0), 0);
  const reservedProducts = productionOrders.reduce((sum, order) => sum + (order.status === 'active' ? order.outputQuantity : 0), 0);
  return { materials: materialUsage, products: storedProducts + reservedProducts };
}

export function getWarehouseMaterialQuantity(profile: PlayerProfile, materialId: string): number {
  return profile.inventory.filter((lot) => lot.materialOrProductId === materialId).reduce((sum, lot) => sum + lot.quantity, 0);
}

export function removeWarehouseMaterials(profile: PlayerProfile, requirements: Readonly<Record<string, number>>): InventoryLot[] {
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
