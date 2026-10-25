import { describe, expect, it } from 'vitest';
import { getWarehouseCapacity, getWarehouseItemCapacity, getWarehouseUsage, normalizeWarehouseLevel, WAREHOUSE_UPGRADE_REQUIREMENTS } from './warehouse';

describe('warehouse progression', () => {
  it('starts at the legacy catalog capacity and expands both stock categories by level', () => {
    expect(getWarehouseCapacity(1)).toEqual({ materials: 8_050, products: 6_850 });
    expect(getWarehouseCapacity(2)).toEqual({ materials: 10_000, products: 9_000 });
    expect(getWarehouseItemCapacity('steel', 2)).toBe(600);
    expect(getWarehouseCapacity(0)).toEqual(getWarehouseCapacity(1));
  });

  it('keeps early upgrades approachable and raises their costs and materials later', () => {
    expect(WAREHOUSE_UPGRADE_REQUIREMENTS[2].cash).toBeLessThan(WAREHOUSE_UPGRADE_REQUIREMENTS[3].cash);
    expect(WAREHOUSE_UPGRADE_REQUIREMENTS[2].materials.steel).toBeLessThan(WAREHOUSE_UPGRADE_REQUIREMENTS[4].materials.steel);
    expect(WAREHOUSE_UPGRADE_REQUIREMENTS[5].materials.components).toBeGreaterThan(WAREHOUSE_UPGRADE_REQUIREMENTS[3].materials.components);
  });

  it('counts active production reservations as product storage usage', () => {
    const usage = getWarehouseUsage(
      [{ id: 'lot-1', materialOrProductId: 'steel', quantity: 10, unit: 'طن', unitCost: 1 }, { id: 'lot-2', materialOrProductId: 'food-pack', quantity: 20, unit: 'عبوة', unitCost: 1 }],
      [{ id: 'order-1', companyId: 'company-1', productId: 'food-pack', productName: 'غذاء', batches: 1, outputQuantity: 8, outputUnit: 'عبوة', materialCost: 1, energyCost: 1, expectedUnitCost: 1, demandForecast: 1, qualityScore: 90, maintenanceCost: 0, startedOnDay: 1, completesOnDay: 2, status: 'active' }],
    );
    expect(usage).toEqual({ materials: 10, products: 28 });
  });

  it('normalizes invalid warehouse levels to the first level', () => {
    expect(normalizeWarehouseLevel(99)).toBe(1);
    expect(normalizeWarehouseLevel(3)).toBe(3);
  });
});
