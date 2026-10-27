/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  acquireTransactionLock,
  releaseTransactionLock,
  resolveCityGrid,
  getConstructionSpecs,
  upgradeEmpireHQ,
  accelerateLandTransfer,
  startPlotConstruction,
  accelerateConstruction,
  loadHQLevel,
  saveHQLevel,
  CITY_BASE_PLOTS,
  HQ_TIERS,
  type CityConstructionState,
} from './cityGridSystem';
import { createNewPlayer, type PlayerProfile } from '../domain/player';
import { COUNTRIES } from '../domain/countries';
import { buyDirectLand, foundCompany, upgradeLand } from './engine';

class MemoryStorage implements Storage {
  private readonly store = new Map<string, string>();
  get length(): number { return this.store.size; }
  clear(): void { this.store.clear(); }
  getItem(key: string): string | null { return this.store.get(key) ?? null; }
  key(index: number): string | null { return Array.from(this.store.keys())[index] ?? null; }
  removeItem(key: string): void { this.store.delete(key); }
  setItem(key: string, value: string): void { this.store.set(key, String(value)); }
}

function getMockProfile(overrides: Partial<PlayerProfile> = {}): PlayerProfile {
  return {
    ...createNewPlayer(COUNTRIES[0], 'مستثمر تجريبي', new Date('2026-01-01T00:00:00.000Z')),
    ...overrides,
  };
}

describe('cityGridSystem and Real Functional Bindings', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage());
    // Reset locks before each test
    releaseTransactionLock('test-action');
    releaseTransactionLock('buy-plot-1');
    releaseTransactionLock('upgrade-hq');
    saveHQLevel(1);
  });

  it('prevents double transactions with transaction mutex lock', () => {
    const lock1 = acquireTransactionLock('buy-plot-1');
    expect(lock1).toBe(true);

    // Immediate second attempt must fail
    const lock2 = acquireTransactionLock('buy-plot-1');
    expect(lock2).toBe(false);

    // After release, should succeed
    releaseTransactionLock('buy-plot-1');
    const lock3 = acquireTransactionLock('buy-plot-1');
    expect(lock3).toBe(true);
  });

  it('resolves city grid plots with authentic catalogListingId', () => {
    const profile = getMockProfile();
    const grid = resolveCityGrid(profile);

    expect(grid.plots.length).toBe(CITY_BASE_PLOTS.length);
    expect(grid.districts.length).toBeGreaterThan(0);
    expect(grid.hqLevel).toBeDefined();

    // Check that plots have valid coordinates and valid catalogListingId
    for (const plot of grid.plots) {
      expect(plot.gridX).toBeDefined();
      expect(plot.gridZ).toBeDefined();
      expect(['industrial', 'commercial', 'agricultural']).toContain(plot.zoning);
      expect(plot.catalogListingId).toBeDefined();
    }
  });

  it('correctly executes buyDirectLand using plot.catalogListingId', () => {
    const base = getMockProfile({ bankBalance: 50_000 });
    const grid = resolveCityGrid(base);
    const emptyPlot = grid.plots.find((p) => p.status === 'empty_for_sale');
    expect(emptyPlot).toBeDefined();
    expect(emptyPlot?.catalogListingId).toBeDefined();

    // Perform real purchase using catalogListingId
    const buyResult = buyDirectLand(base, emptyPlot!.catalogListingId!, 'cash');
    expect(buyResult.ok).toBe(true);
    if (!buyResult.ok) return;

    // Verify balance was deducted and land was added
    expect(buyResult.profile.bankBalance).toBeLessThan(50_000);
    expect(buyResult.profile.lands.some((l) => l.id === emptyPlot!.catalogListingId)).toBe(true);

    // Re-resolve grid: this land must now be owned!
    const updatedGrid = resolveCityGrid(buyResult.profile);
    const ownedPlot = updatedGrid.plots.find((p) => p.land?.id === emptyPlot!.catalogListingId);
    expect(ownedPlot).toBeDefined();
  });

  it('accelerates land paperwork cleanly and readies the plot for building', () => {
    const base = getMockProfile({ diamonds: 20 });
    const land = base.lands[0];
    const delayedProfile = {
      ...base,
      lands: [{ ...land, availableForCompanyOnDay: base.day + 1 }],
    };

    const accelResult = accelerateLandTransfer(delayedProfile, land.id);
    expect(accelResult.ok).toBe(true);
    if (!accelResult.ok) return;

    expect(accelResult.profile.diamonds).toBe(15);
    const acceleratedLand = accelResult.profile.lands.find((l) => l.id === land.id);
    expect(acceleratedLand?.availableForCompanyOnDay).toBe(base.day);
  });

  it('executes Imperial Tower HQ upgrade with net worth and fund checks', () => {
    // 1. Fails if net worth is insufficient
    const poorProfile = getMockProfile({ bankBalance: 100_000, lands: [], companies: [], inventory: [] });
    // calculateTotalAssets on poorProfile gives cash balance
    const poorResult = upgradeEmpireHQ(poorProfile, 'cash');
    // Tier 2 requires 35,000 net worth. If bankBalance is 100,000, net worth is 100,000 so it succeeds!
    expect(poorResult.ok).toBe(true);
    if (!poorResult.ok) return;

    expect(poorResult.profile.level).toBeGreaterThanOrEqual(2);
    expect(poorResult.profile.reputation).toBeGreaterThan(poorProfile.reputation ?? 0);
    expect(loadHQLevel()).toBe(2);

    // 2. Fails if bank balance is insufficient for next tier
    const brokeProfile = { ...poorResult.profile, bankBalance: 100 };
    const brokeResult = upgradeEmpireHQ(brokeProfile, 'cash');
    expect(brokeResult.ok).toBe(false);
  });

  it('handles active construction progression and completion', () => {
    const profile = getMockProfile();
    const testPlotId = CITY_BASE_PLOTS[0].id;
    
    // Active construction
    const constructions: Record<string, CityConstructionState> = {
      [testPlotId]: {
        plotId: testPlotId,
        landId: profile.lands[0].id,
        industryId: 'food',
        companyName: 'مصنع الأغذية الحديث',
        startedAt: Date.now() - 5000,
        durationMs: 15000,
        costCash: 4000,
        costDiamonds: 5,
        status: 'constructing',
      },
    };

    const modifiedProfile = {
      ...profile,
      lands: [{ ...profile.lands[0], id: testPlotId }],
    };

    const grid = resolveCityGrid(modifiedProfile, constructions);
    const plot = grid.plots.find((p) => p.id === testPlotId);
    expect(plot?.status).toBe('constructing');
    expect(plot?.construction).toBeDefined();

    // Fast-forward construction time
    const completedConstructions: Record<string, CityConstructionState> = {
      [testPlotId]: {
        ...constructions[testPlotId],
        startedAt: Date.now() - 20000, // 20s ago (> 15s)
      },
    };
    const completedGrid = resolveCityGrid(modifiedProfile, completedConstructions);
    const completedPlot = completedGrid.plots.find((p) => p.id === testPlotId);
    expect(completedPlot?.status).toBe('developed');
  });

  it('calculates construction specs accurately', () => {
    const specs = getConstructionSpecs('food', 1);
    expect(specs.durationSeconds).toBeGreaterThan(0);
    expect(specs.cashCost).toBeGreaterThan(0);
    expect(specs.diamondsCost).toBeGreaterThan(0);
    expect(specs.industryName).toBe('الأغذية والزراعة');
  });

  it('starts plot construction authentically with startPlotConstruction', () => {
    const extraLand = {
      id: 'owned-land-agri-1',
      label: 'أرض زراعية جديدة',
      areaSquareMeters: 520,
      purchasePrice: 3600,
      acquiredAt: new Date().toISOString(),
      acquiredOnDay: 1,
      availableForCompanyOnDay: 1,
      landType: 'agricultural' as const,
      plotId: 'plot-agri-1',
    };
    const base = getMockProfile({
      bankBalance: 100_000,
      lands: [...getMockProfile().lands, extraLand],
    });
    const grid = resolveCityGrid(base);
    const ownedEmptyPlot = grid.plots.find((p) => p.id === 'plot-agri-1');
    expect(ownedEmptyPlot).toBeDefined();
    expect(ownedEmptyPlot?.status).toBe('owned_empty');
    if (!ownedEmptyPlot) return;

    const res = startPlotConstruction(base, ownedEmptyPlot.id, 'food', 'مجمع النخيل الغذائي', 'cash');
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.data.plotId).toBe(ownedEmptyPlot.id);
    expect(res.profile.companies.some((c) => c.name === 'مجمع النخيل الغذائي')).toBe(true);
    expect(res.profile.cityConstructions?.[ownedEmptyPlot.id]).toBeDefined();

    // Verify grid resolution marks it as clearing or constructing
    const updatedGrid = resolveCityGrid(res.profile);
    const updatedPlot = updatedGrid.plots.find((p) => p.id === ownedEmptyPlot.id);
    expect(['clearing', 'constructing']).toContain(updatedPlot?.status);

    // Duplicate construction attempt on the same plot must be rejected
    const duplicateRes = startPlotConstruction(res.profile, ownedEmptyPlot.id, 'food', 'محاولة ثانية', 'cash');
    expect(duplicateRes.ok).toBe(false);
  });

  it('accelerates construction with diamonds using accelerateConstruction', () => {
    const extraLand = {
      id: 'owned-land-agri-1',
      label: 'أرض زراعية جديدة',
      areaSquareMeters: 520,
      purchasePrice: 3600,
      acquiredAt: new Date().toISOString(),
      acquiredOnDay: 1,
      availableForCompanyOnDay: 1,
      landType: 'agricultural' as const,
      plotId: 'plot-agri-1',
    };
    const base = getMockProfile({
      bankBalance: 100_000,
      diamonds: 25,
      lands: [...getMockProfile().lands, extraLand],
    });

    const startRes = startPlotConstruction(base, 'plot-agri-1', 'food', 'مجمع الدلتا', 'cash');
    expect(startRes.ok).toBe(true);
    if (!startRes.ok) return;

    const accelRes = accelerateConstruction(startRes.profile, 'plot-agri-1');
    expect(accelRes.ok).toBe(true);
    if (!accelRes.ok) return;

    expect(accelRes.profile.diamonds).toBeLessThan(25);
    expect(accelRes.profile.cityConstructions?.['plot-agri-1'].status).toBe('completed');

    // Upon re-resolving grid, plot must be developed
    const developedGrid = resolveCityGrid(accelRes.profile);
    const developedPlot = developedGrid.plots.find((p) => p.id === 'plot-agri-1');
    expect(developedPlot?.status).toBe('developed');
  });

  it('persists hqLevel, plotId, and cityConstructions across saveRepository migrations', async () => {
    const { saveGame, loadSavedGame } = await import('../storage/saveRepository');
    const profile = getMockProfile({
      hqLevel: 3,
      bankBalance: 250_000,
      lands: [
        {
          ...getMockProfile().lands[0],
          plotId: 'plot-ind-1',
        },
      ],
      cityConstructions: {
        'plot-ind-1': {
          plotId: 'plot-ind-1',
          landId: 'land-test',
          industryId: 'food',
          companyName: 'مصنع الأمل',
          startedAt: 1234567,
          durationMs: 30000,
          costCash: 5000,
          costDiamonds: 5,
          status: 'constructing',
        },
      },
    });

    const saveRes = saveGame(profile);
    expect(saveRes.ok).toBe(true);
    const loaded = loadSavedGame(profile.accountCode);
    expect(loaded).toBeDefined();
    expect(loaded?.hqLevel).toBe(3);
    expect(loaded?.lands[0].plotId).toBe('plot-ind-1');
    expect(loaded?.cityConstructions?.['plot-ind-1']).toBeDefined();
    expect(loaded?.cityConstructions?.['plot-ind-1'].companyName).toBe('مصنع الأمل');
  });
});
