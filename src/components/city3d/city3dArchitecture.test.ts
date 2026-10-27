/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  classifyIndustryToFacility,
  resolvePlotVisualStage,
  CITY_WORLD_REGISTRY,
  DISTRICT_VISUAL_THEMES,
} from './cityWorldData';
import {
  createCityMaterialPalette,
  disposeCityMaterialPalette,
} from './cityMaterials';
import {
  buildEmptyPlotMesh,
  buildPaperworkSurveyMesh,
  buildSiteClearingMesh,
  buildActiveConstructionMesh,
  buildHQMesh,
  buildBankMesh,
  buildFactoryMesh,
  buildStoreMesh,
  buildWarehouseMesh,
  buildBranchMesh,
  buildTechHubMesh,
  buildAgroFarmMesh,
} from './cityMeshBuilders';

describe('City 3D World & Architecture Data Model', () => {
  it('correctly classifies industries into visual facility categories', () => {
    expect(classifyIndustryToFacility('petroleum')).toBe('factory');
    expect(classifyIndustryToFacility('manufacturing')).toBe('factory');
    expect(classifyIndustryToFacility('steel')).toBe('factory');

    expect(classifyIndustryToFacility('banking')).toBe('central_bank');
    expect(classifyIndustryToFacility('finance')).toBe('central_bank');

    expect(classifyIndustryToFacility('retail')).toBe('store');
    expect(classifyIndustryToFacility('trade')).toBe('store');

    expect(classifyIndustryToFacility('logistics')).toBe('warehouse');
    expect(classifyIndustryToFacility('shipping')).toBe('warehouse');

    expect(classifyIndustryToFacility('telecom')).toBe('regional_branch');
    expect(classifyIndustryToFacility('services')).toBe('regional_branch');

    expect(classifyIndustryToFacility('electronics')).toBe('tech_hub');
    expect(classifyIndustryToFacility('software')).toBe('tech_hub');

    expect(classifyIndustryToFacility('agriculture')).toBe('agricultural_farm');
    expect(classifyIndustryToFacility('food')).toBe('agricultural_farm');
  });

  it('resolves visual construction stages with appropriate thresholds', () => {
    expect(resolvePlotVisualStage('empty_for_sale')).toBe('empty_plot');
    expect(resolvePlotVisualStage('locked')).toBe('locked');
    expect(resolvePlotVisualStage('paperwork')).toBe('paperwork_survey');
    expect(resolvePlotVisualStage('clearing')).toBe('site_clearing');

    // Early construction (< 25%) displays site clearing/excavation
    expect(resolvePlotVisualStage('constructing', 10)).toBe('site_clearing');
    // Active construction (>= 25%) displays crane & scaffolding
    expect(resolvePlotVisualStage('constructing', 50)).toBe('active_construction');

    expect(resolvePlotVisualStage('developed')).toBe('completed');
    expect(resolvePlotVisualStage('completed')).toBe('completed');
  });

  it('provides extensible multi-city and district metadata', () => {
    const cairo = CITY_WORLD_REGISTRY['cairo_central'];
    expect(cairo).toBeDefined();
    expect(cairo.districts.length).toBeGreaterThanOrEqual(4);
    expect(cairo.districts.some((d) => d.id === 'district_downtown')).toBe(true);
    expect(cairo.districts.some((d) => d.id === 'district_industrial')).toBe(true);
    expect(cairo.districts.some((d) => d.id === 'district_logistics')).toBe(true);
    expect(cairo.districts.some((d) => d.id === 'district_innovation')).toBe(true);

    expect(DISTRICT_VISUAL_THEMES['district_downtown'].accentColor).toBe('#f59e0b');
  });
});

describe('City 3D Procedural Mesh Builders', () => {
  const palette = createCityMaterialPalette(true, true);

  it('builds multi-part empty plot mesh', () => {
    const plot = buildEmptyPlotMesh(12, 12, 'empty_plot', 5000, palette, true);
    expect(plot).toBeInstanceOf(THREE.Group);
    expect(plot.children.length).toBeGreaterThan(0);
  });

  it('builds paperwork survey stage mesh', () => {
    const survey = buildPaperworkSurveyMesh(12, 12, palette, true);
    expect(survey).toBeInstanceOf(THREE.Group);
    expect(survey.children.length).toBeGreaterThan(0);
  });

  it('builds site clearing stage mesh with earthmover and dirt mounds', () => {
    const clearing = buildSiteClearingMesh(12, 12, palette, true);
    expect(clearing).toBeInstanceOf(THREE.Group);
    expect(clearing.children.length).toBeGreaterThan(0);
  });

  it('builds active construction stage mesh with tower crane and scaffolding', () => {
    const construction = buildActiveConstructionMesh(12, 12, palette, true);
    expect(construction).toBeInstanceOf(THREE.Group);
    expect(construction.children.length).toBeGreaterThan(0);
  });

  it('builds scalable Imperial HQ across all 5 tiers', () => {
    for (let lvl = 1; lvl <= 5; lvl++) {
      const hq = buildHQMesh(lvl, palette, true);
      expect(hq).toBeInstanceOf(THREE.Group);
      expect(hq.children.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('builds central bank with classical columns and pediment', () => {
    const bank = buildBankMesh(palette, true);
    expect(bank).toBeInstanceOf(THREE.Group);
    expect(bank.children.length).toBeGreaterThanOrEqual(6);
  });

  it('builds factory with dual smokestacks and smoke emitter positions', () => {
    const factory = buildFactoryMesh(palette, true);
    expect(factory.group).toBeInstanceOf(THREE.Group);
    expect(factory.smokePositions.length).toBe(2);
  });

  it('builds store, warehouse, branch, tech hub, and agro farm models', () => {
    const store = buildStoreMesh(palette, true);
    expect(store).toBeInstanceOf(THREE.Group);

    const warehouse = buildWarehouseMesh(palette, true);
    expect(warehouse).toBeInstanceOf(THREE.Group);

    const branch = buildBranchMesh(palette, true);
    expect(branch).toBeInstanceOf(THREE.Group);

    const techHub = buildTechHubMesh(palette, true);
    expect(techHub).toBeInstanceOf(THREE.Group);

    const agroFarm = buildAgroFarmMesh(palette, true);
    expect(agroFarm).toBeInstanceOf(THREE.Group);
  });

  it('disposes materials palette cleanly without throwing', () => {
    expect(() => disposeCityMaterialPalette(palette)).not.toThrow();
  });
});
