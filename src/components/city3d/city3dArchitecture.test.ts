/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  classifyIndustryToFacility,
  resolvePlotVisualStage,
  CITY_WORLD_CONFIG,
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
  buildMaritimePortMesh,
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

  it('provides consistent world, harbor, and district metadata', () => {
    expect(CITY_WORLD_CONFIG.worldRadius).toBeGreaterThan(130);
    expect(CITY_WORLD_CONFIG.coastlineX).toBeGreaterThanOrEqual(70);
    expect(CITY_WORLD_CONFIG.harborWaterSize.width).toBeGreaterThan(100);
    expect(CITY_WORLD_CONFIG.harborWaterSize.depth).toBeGreaterThan(180);
    expect(CITY_WORLD_CONFIG.districts.length).toBeGreaterThanOrEqual(6);
    expect(CITY_WORLD_CONFIG.districts.some((d) => d.id === 'district_downtown')).toBe(true);
    expect(CITY_WORLD_CONFIG.districts.some((d) => d.id === 'district_maritime_industrial')).toBe(true);
    expect(CITY_WORLD_CONFIG.districts.some((d) => d.id === 'district_tech_valley')).toBe(true);
    expect(CITY_WORLD_CONFIG.districts.some((d) => d.id === 'district_luxury_coast')).toBe(true);
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

  it('builds the Suly Islamic Bank with its glass facade, gold dome, and multi-view footprint', () => {
    const bank = buildBankMesh(palette, true);
    expect(bank).toBeInstanceOf(THREE.Group);
    expect(bank.children.length).toBeGreaterThan(40);
    bank.updateMatrixWorld(true);
    const size = new THREE.Box3().setFromObject(bank).getSize(new THREE.Vector3());
    expect(size.x).toBeGreaterThan(25);
    expect(size.y).toBeGreaterThan(19);
    expect(size.z).toBeGreaterThan(20);
  });

  it('builds a widened container terminal with cranes, ships, and instanced yard cargo', () => {
    const port = buildMaritimePortMesh(palette, true);
    expect(port).toBeInstanceOf(THREE.Group);
    expect(port.getObjectByName('port_gantry_crane_4')).toBeDefined();
    expect(port.getObjectByName('port_cargo_ship_main')).toBeDefined();
    expect(port.getObjectByName('port_cargo_ship_outer')).toBeDefined();
    expect(port.getObjectByName('port_access_road')).toBeDefined();
    expect(port.getObjectByName('port_yard_containers_0')).toBeInstanceOf(THREE.InstancedMesh);

    port.updateMatrixWorld(true);
    const size = new THREE.Box3().setFromObject(port).getSize(new THREE.Vector3());
    expect(size.x).toBeGreaterThan(60);
    expect(size.y).toBeGreaterThan(11);
    expect(size.z).toBeGreaterThan(50);
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

  it('builds city road network with multi-lane grid and animated traffic', async () => {
    const { buildCityRoadNetwork } = await import('./cityRoadNetwork');
    const roadNetwork = buildCityRoadNetwork(palette, true, true);
    expect(roadNetwork.group).toBeInstanceOf(THREE.Group);
    expect(roadNetwork.group.children.length).toBeGreaterThan(10);
    expect(roadNetwork.vehicles.length).toBeGreaterThanOrEqual(4);

    roadNetwork.vehicles.forEach((v) => {
      expect(['x', 'z']).toContain(v.axis);
      expect([1, -1]).toContain(v.dir);
      expect(v.speed).toBeGreaterThan(0);
      expect(v.mesh).toBeInstanceOf(THREE.Group);
    });

    const water = roadNetwork.group.getObjectByName('expanded_harbor_water') as THREE.Mesh<THREE.PlaneGeometry>;
    const seawall = roadNetwork.group.getObjectByName('harbor_seawall_sections') as THREE.InstancedMesh;
    expect(water.geometry.parameters.width).toBe(CITY_WORLD_CONFIG.harborWaterSize.width);
    expect(water.position.x - CITY_WORLD_CONFIG.harborWaterSize.width / 2).toBe(CITY_WORLD_CONFIG.coastlineX);
    expect(seawall.count).toBeLessThan(seawall.instanceMatrix.count);
    expect(roadNetwork.vehicles.filter((v) => v.axis === 'x').every((v) =>
      v.min === -CITY_WORLD_CONFIG.coastlineX && v.max === CITY_WORLD_CONFIG.coastlineX
    )).toBe(true);
  });

  it('disposes materials palette cleanly without throwing', () => {
    expect(() => disposeCityMaterialPalette(palette)).not.toThrow();
  });
});
