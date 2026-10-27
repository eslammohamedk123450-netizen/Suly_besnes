/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  acquireTransactionLock,
  releaseTransactionLock,
  resolveCityGrid,
  getConstructionSpecs,
  CITY_BASE_PLOTS,
  type CityConstructionState,
} from './cityGridSystem';
import { createNewPlayer, type PlayerProfile } from '../domain/player';
import { COUNTRIES } from '../domain/countries';

function getMockProfile(overrides: Partial<PlayerProfile> = {}): PlayerProfile {
  return {
    ...createNewPlayer(COUNTRIES[0], 'مستثمر تجريبي', new Date('2026-01-01T00:00:00.000Z')),
    ...overrides,
  };
}

describe('cityGridSystem', () => {
  beforeEach(() => {
    // Reset locks before each test
    releaseTransactionLock('test-action');
    releaseTransactionLock('buy-plot-1');
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

  it('resolves city grid plots with initial player profile', () => {
    const profile = getMockProfile();
    const grid = resolveCityGrid(profile);

    expect(grid.plots.length).toBe(CITY_BASE_PLOTS.length);
    expect(grid.districts.length).toBeGreaterThan(0);

    // Check that plots have valid zoning and coordinates
    for (const plot of grid.plots) {
      expect(plot.gridX).toBeDefined();
      expect(plot.gridZ).toBeDefined();
      expect(['industrial', 'commercial', 'agricultural']).toContain(plot.zoning);
      expect(['empty_for_sale', 'owned_empty', 'clearing', 'constructing', 'developed', 'locked']).toContain(plot.status);
    }
  });

  it('correctly maps owned lands and companies to plots', () => {
    const profile = getMockProfile();
    
    // Initial profile already starts with starter land and starter company
    expect(profile.lands.length).toBeGreaterThan(0);
    expect(profile.companies.length).toBeGreaterThan(0);

    const grid = resolveCityGrid(profile);
    const developedPlot = grid.plots.find((p) => p.status === 'developed');
    expect(developedPlot).toBeDefined();
    expect(developedPlot?.company).toBeDefined();
  });

  it('handles active construction states correctly', () => {
    const profile = getMockProfile();
    const testPlotId = CITY_BASE_PLOTS[0].id;
    
    // Construction in progress
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

    // Make sure the plot has the land so it checks construction
    const modifiedProfile = {
      ...profile,
      lands: [{ ...profile.lands[0], id: testPlotId }],
    };

    const grid = resolveCityGrid(modifiedProfile, constructions);
    const plot = grid.plots.find((p) => p.id === testPlotId);
    expect(plot?.status).toBe('constructing');
    expect(plot?.construction).toBeDefined();
  });

  it('calculates construction specs accurately', () => {
    const specs = getConstructionSpecs('food', 1);
    expect(specs.durationSeconds).toBeGreaterThan(0);
    expect(specs.cashCost).toBeGreaterThan(0);
    expect(specs.diamondsCost).toBeGreaterThan(0);
    expect(specs.industryName).toBe('الأغذية والزراعة');
  });
});
