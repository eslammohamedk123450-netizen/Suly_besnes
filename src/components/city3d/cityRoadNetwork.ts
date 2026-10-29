/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import type { CityMaterialPalette } from './cityMaterials';
import { CITY_WORLD_CONFIG } from './cityWorldData';
import {
  buildLuxuryPalmTree,
  buildFlowerBed,
  buildGolfGreenTurfIsland,
} from './cityFoliageBuilders';
import {
  buildLamborghiniSupercar,
  buildFerrariSupercar,
  buildLuxurySuperyacht,
  buildSpeedboatYacht,
  buildDancingFountain,
  buildImperialGoldenEagleStatue,
  buildClassicalTitanStatue,
  type AnimatedYacht,
  type DancingFountainAssets,
} from './cityLifeAssets';

export interface TrafficVehicle {
  mesh: THREE.Group;
  axis: 'x' | 'z';
  dir: 1 | -1;
  speed: number;
  min: number;
  max: number;
  laneOffset: number;
}

export interface CityRoadNetworkResult {
  group: THREE.Group;
  vehicles: TrafficVehicle[];
  yachts: AnimatedYacht[];
  fountains: DancingFountainAssets[];
}

/**
 * Creates realistic rubber tires with chrome alloy rims
 */
function createWheel(palette: CityMaterialPalette, radius = 0.28, width = 0.18): THREE.Group {
  const wheelGroup = new THREE.Group();

  // Rubber tire
  const tireGeo = new THREE.CylinderGeometry(radius, radius, width, 14);
  const tire = new THREE.Mesh(tireGeo, palette.tireRubber);
  tire.rotation.z = Math.PI / 2;
  wheelGroup.add(tire);

  // Chrome alloy rim
  const rimGeo = new THREE.CylinderGeometry(radius * 0.65, radius * 0.65, width + 0.02, 10);
  const rim = new THREE.Mesh(rimGeo, palette.chromeMetal);
  rim.rotation.z = Math.PI / 2;
  wheelGroup.add(rim);

  // Center hub cap
  const hubGeo = new THREE.CylinderGeometry(radius * 0.25, radius * 0.25, width + 0.04, 8);
  const hub = new THREE.Mesh(hubGeo, palette.imperialGold);
  hub.rotation.z = Math.PI / 2;
  wheelGroup.add(hub);

  return wheelGroup;
}

/**
 * 1. Realistic Executive Luxury Sedan (8+ distinct parts)
 */
function buildRealisticSedan(
  palette: CityMaterialPalette,
  colorIndex: number,
  isSoftwareGl: boolean
): THREE.Group {
  const car = new THREE.Group();
  const colorMat = palette.carColors[colorIndex % palette.carColors.length];

  // Lower chassis
  const chassisGeo = new THREE.BoxGeometry(1.6, 0.45, 3.4);
  const chassis = new THREE.Mesh(chassisGeo, colorMat);
  chassis.position.y = 0.42;
  chassis.castShadow = !isSoftwareGl;
  car.add(chassis);

  // Aerodynamic hood & trunk taper
  const hoodGeo = new THREE.BoxGeometry(1.5, 0.22, 1.1);
  const hood = new THREE.Mesh(hoodGeo, colorMat);
  hood.position.set(0, 0.55, 1.05);
  car.add(hood);

  const trunkGeo = new THREE.BoxGeometry(1.5, 0.24, 0.85);
  const trunk = new THREE.Mesh(trunkGeo, colorMat);
  trunk.position.set(0, 0.56, -1.15);
  car.add(trunk);

  // Glass Cabin with pillars
  const cabinGeo = new THREE.BoxGeometry(1.35, 0.52, 1.6);
  const cabin = new THREE.Mesh(cabinGeo, palette.carGlass);
  cabin.position.set(0, 0.88, -0.1);
  car.add(cabin);

  // Roof panel
  const roofGeo = new THREE.BoxGeometry(1.3, 0.06, 1.4);
  const roof = new THREE.Mesh(roofGeo, colorMat);
  roof.position.set(0, 1.15, -0.1);
  car.add(roof);

  // Chrome front grille
  const grilleGeo = new THREE.BoxGeometry(0.9, 0.22, 0.06);
  const grille = new THREE.Mesh(grilleGeo, palette.chromeMetal);
  grille.position.set(0, 0.42, 1.72);
  car.add(grille);

  // Front LED Headlights
  [-0.55, 0.55].forEach((hx) => {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.06), palette.carHeadlight);
    hl.position.set(hx, 0.46, 1.72);
    car.add(hl);

    const ind = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.05), palette.amberIndicator);
    ind.position.set(hx > 0 ? hx + 0.18 : hx - 0.18, 0.46, 1.7);
    car.add(ind);
  });

  // Rear LED Taillights & chrome exhaust tips
  [-0.55, 0.55].forEach((tx) => {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.06), palette.carTaillight);
    tl.position.set(tx, 0.52, -1.72);
    car.add(tl);

    const exh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.15, 8), palette.chromeMetal);
    exh.rotation.x = Math.PI / 2;
    exh.position.set(tx * 0.7, 0.24, -1.72);
    car.add(exh);
  });

  // 4 Wheels
  const wheelW = 0.16;
  const wheelR = 0.28;
  const wheelX = 0.85;
  const wheelZ = 1.0;

  [
    [-wheelX, wheelZ],
    [wheelX, wheelZ],
    [-wheelX, -wheelZ],
    [wheelX, -wheelZ],
  ].forEach(([wx, wz]) => {
    const wheel = createWheel(palette, wheelR, wheelW);
    wheel.position.set(wx, wheelR, wz);
    car.add(wheel);
  });

  return car;
}

/**
 * 2. Heavy Logistics Semi-Trailer Truck (12+ distinct parts)
 */
function buildHeavyLogisticsTruck(palette: CityMaterialPalette, isSoftwareGl: boolean): THREE.Group {
  const truck = new THREE.Group();

  // A. Cab-over Tractor
  const cabBody = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.6, 2.0), palette.imperialGold);
  cabBody.position.set(0, 1.3, 2.2);
  cabBody.castShadow = !isSoftwareGl;
  truck.add(cabBody);

  // Cab aerodynamic roof deflector
  const deflector = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.7, 4), palette.navyStructure);
  deflector.rotation.y = Math.PI / 4;
  deflector.position.set(0, 2.3, 2.0);
  truck.add(deflector);

  // Panoramic windshield
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.7, 0.1), palette.carGlass);
  windshield.position.set(0, 1.5, 3.22);
  truck.add(windshield);

  // Massive chrome front grille & bumper
  const grille = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.7, 0.1), palette.chromeMetal);
  grille.position.set(0, 0.75, 3.22);
  truck.add(grille);

  const bumper = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.28, 0.25), palette.industrialSteel);
  bumper.position.set(0, 0.35, 3.25);
  truck.add(bumper);

  // Dual Truck Headlights
  [-0.75, 0.75].forEach((hx) => {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.16, 0.05), palette.carHeadlight);
    hl.position.set(hx, 0.4, 3.36);
    truck.add(hl);
  });

  // Vertical twin chrome exhaust stacks behind cab
  [-0.95, 0.95].forEach((ex) => {
    const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8), palette.chromeMetal);
    stack.position.set(ex, 2.0, 1.1);
    truck.add(stack);
  });

  // B. Trailer Flatbed Chassis
  const trailerBed = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.35, 6.2), palette.industrialSteel);
  trailerBed.position.set(0, 0.7, -1.8);
  trailerBed.castShadow = !isSoftwareGl;
  truck.add(trailerBed);

  // C. 40-foot Shipping Container (Maersk / Suly Logistics Blue)
  const container = new THREE.Mesh(new THREE.BoxGeometry(1.95, 1.9, 6.0), palette.curtainGlass);
  container.position.set(0, 1.85, -1.8);
  container.castShadow = !isSoftwareGl;
  truck.add(container);

  // Container gold frame and corner castings
  const contFrame = new THREE.Mesh(new THREE.BoxGeometry(2.02, 1.96, 6.06), palette.brushedGold);
  contFrame.position.set(0, 1.85, -1.8);
  contFrame.scale.set(1.01, 1.01, 0.98);
  truck.add(contFrame);

  // Rear container doors with locking rods
  const rodGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.7, 6);
  [-0.35, 0.35].forEach((rx) => {
    const rod = new THREE.Mesh(rodGeo, palette.chromeMetal);
    rod.position.set(rx, 1.85, -4.82);
    truck.add(rod);
  });

  // Rear truck taillights
  [-0.8, 0.8].forEach((tx) => {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.05), palette.carTaillight);
    tl.position.set(tx, 0.5, -4.85);
    truck.add(tl);
  });

  // Tractor & Trailer Heavy Wheels (Front steering axle + Tractor drive axle + Trailer tandem axles)
  const truckWheelR = 0.35;
  const truckWheelW = 0.22;
  const axlePositions = [
    [1.0, 2.2], // Front steering
    [1.0, 0.9], // Tractor drive
    [1.0, -3.4], // Trailer rear axle 1
    [1.0, -4.2], // Trailer rear axle 2
  ];

  axlePositions.forEach(([wx, wz]) => {
    [-wx, wx].forEach((sideX) => {
      const wheel = createWheel(palette, truckWheelR, truckWheelW);
      wheel.position.set(sideX, truckWheelR, wz);
      truck.add(wheel);
    });
  });

  return truck;
}

/**
 * 3. Modern Panoramic City Transit Bus (10+ distinct parts)
 */
function buildCityTransitBus(palette: CityMaterialPalette, isSoftwareGl: boolean): THREE.Group {
  const bus = new THREE.Group();

  // Aerodynamic Bus Hull
  const hull = new THREE.Mesh(new THREE.BoxGeometry(1.85, 1.7, 5.8), palette.navyStructure);
  hull.position.y = 1.15;
  hull.castShadow = !isSoftwareGl;
  bus.add(hull);

  // Gold Lower Accent Skirt
  const skirt = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.45, 5.82), palette.imperialGold);
  skirt.position.y = 0.5;
  bus.add(skirt);

  // Continuous Tinted Panoramic Window Ribbon
  const windowRibbon = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.75, 5.4), palette.carGlass);
  windowRibbon.position.set(0, 1.45, 0);
  bus.add(windowRibbon);

  // Front Windshield
  const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(1.75, 1.1, 0.1), palette.carGlass);
  frontGlass.position.set(0, 1.35, 2.92);
  bus.add(frontGlass);

  // LED Destination Matrix Banner ("SULY METRO EXPRESS")
  const matrix = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.22, 0.08), palette.amberIndicator);
  matrix.position.set(0, 1.88, 2.92);
  bus.add(matrix);

  // Roof Climate & Battery Pods
  const acPod1 = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.3, 1.8), palette.whiteMarble);
  acPod1.position.set(0, 2.12, 0.8);
  bus.add(acPod1);

  const acPod2 = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.25, 1.4), palette.whiteMarble);
  acPod2.position.set(0, 2.1, -1.2);
  bus.add(acPod2);

  // Dual Headlights & Taillights
  [-0.65, 0.65].forEach((hx) => {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.05), palette.carHeadlight);
    hl.position.set(hx, 0.45, 2.92);
    bus.add(hl);

    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.05), palette.carTaillight);
    tl.position.set(hx, 0.8, -2.92);
    bus.add(tl);
  });

  // 4 Bus Wheels with gold hubs
  const busWheelR = 0.33;
  const busWheelW = 0.2;
  [
    [-0.98, 1.7],
    [0.98, 1.7],
    [-0.98, -1.7],
    [0.98, -1.7],
  ].forEach(([wx, wz]) => {
    const wheel = createWheel(palette, busWheelR, busWheelW);
    wheel.position.set(wx, busWheelR, wz);
    bus.add(wheel);
  });

  return bus;
}

/**
 * 4. Realistic Yellow City Cab with roof sign and checkered trim
 */
function buildCityTaxi(palette: CityMaterialPalette, isSoftwareGl: boolean): THREE.Group {
  const taxi = buildRealisticSedan(palette, 6, isSoftwareGl); // Uses Taxi Yellow

  // Illuminated Taxi Roof Sign
  const signBase = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.15, 0.25), palette.amberIndicator);
  signBase.position.set(0, 1.25, 0);
  taxi.add(signBase);

  // Black checkered side decal bands
  [-0.82, 0.82].forEach((sx) => {
    const decal = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 1.8), palette.slateStructure);
    decal.position.set(sx, 0.65, 0);
    taxi.add(decal);
  });

  return taxi;
}

/**
 * 5. Rugged Executive Cyber SUV
 */
function buildCyberSUV(palette: CityMaterialPalette, isSoftwareGl: boolean): THREE.Group {
  const suv = new THREE.Group();

  // High-ground body
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.7, 3.5), palette.navyStructure);
  body.position.y = 0.65;
  body.castShadow = !isSoftwareGl;
  suv.add(body);

  // Upper Greenhouse Cabin
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.65, 2.1), palette.carGlass);
  cabin.position.set(0, 1.25, -0.2);
  suv.add(cabin);

  // Roof with luggage rails
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.08, 1.9), palette.navyStructure);
  roof.position.set(0, 1.58, -0.2);
  suv.add(roof);

  [-0.65, 0.65].forEach((rx) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 1.7), palette.imperialGold);
    rail.position.set(rx, 1.66, -0.2);
    suv.add(rail);
  });

  // Front Horizontal Cyber LED Lightbar
  const lightbar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.06), palette.carHeadlight);
  lightbar.position.set(0, 0.78, 1.76);
  suv.add(lightbar);

  // Rear Continuous Red Neon Lightbar
  const rearBar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.06), palette.carTaillight);
  rearBar.position.set(0, 0.85, -1.76);
  suv.add(rearBar);

  // Off-road Wheels
  const wheelR = 0.34;
  const wheelW = 0.22;
  [
    [-0.92, 1.05],
    [0.92, 1.05],
    [-0.92, -1.05],
    [0.92, -1.05],
  ].forEach(([wx, wz]) => {
    const wheel = createWheel(palette, wheelR, wheelW);
    wheel.position.set(wx, wheelR, wz);
    suv.add(wheel);
  });

  return suv;
}

/**
 * Builds the modular road grid, pedestrian sidewalks, medians, street lamps, and animated traffic
 */
export function buildCityRoadNetwork(
  palette: CityMaterialPalette,
  isSoftwareGl: boolean,
  timeOfDay: 'sunset' | 'night' | 'day' | boolean = 'sunset'
): CityRoadNetworkResult {
  const isNightOrSunset = typeof timeOfDay === 'boolean' 
    ? timeOfDay 
    : (timeOfDay === 'night' || timeOfDay === 'sunset');
  const roadGroup = new THREE.Group();
  const vehicles: TrafficVehicle[] = [];
  const coastlineX = CITY_WORLD_CONFIG.coastlineX;
  const eastWestRoadLength = coastlineX * 2;

  // 1. Central Grand Avenue (Z axis: North-South) - Expanded to 260 units
  const mainAvenueGeo = new THREE.BoxGeometry(9.6, 0.12, 260);
  const mainAvenue = new THREE.Mesh(mainAvenueGeo, palette.asphalt);
  mainAvenue.position.set(0, 0.06, 0);
  mainAvenue.receiveShadow = !isSoftwareGl;
  roadGroup.add(mainAvenue);

  // Sidewalks along Central Grand Avenue
  [-5.4, 5.4].forEach((sx) => {
    const sidewalk = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.22, 260),
      palette.plazaPaver
    );
    sidewalk.position.set(sx, 0.11, 0);
    sidewalk.receiveShadow = !isSoftwareGl;
    roadGroup.add(sidewalk);

    // Gold curb trim
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 260), palette.curbGold);
    curb.position.set(sx + (sx > 0 ? -0.8 : 0.8), 0.13, 0);
    roadGroup.add(curb);
  });

  // Double solid yellow highway lines along Central Grand Avenue
  [-0.14, 0.14].forEach((lx) => {
    const yellowLine = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 260), palette.roadLine);
    yellowLine.position.set(lx, 0.08, 0);
    roadGroup.add(yellowLine);
  });
  // Outer road shoulder demarcation lines
  [-4.4, 4.4].forEach((ex) => {
    const shoulderLine = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 260), palette.roadLine);
    shoulderLine.position.set(ex, 0.08, 0);
    roadGroup.add(shoulderLine);
  });

  // 2. Cross Boulevard (X axis: East-West) ends at the waterfront.
  const crossBoulevardGeo = new THREE.BoxGeometry(eastWestRoadLength, 0.12, 9.6);
  const crossBoulevard = new THREE.Mesh(crossBoulevardGeo, palette.asphalt);
  crossBoulevard.position.set(0, 0.06, 0);
  crossBoulevard.receiveShadow = !isSoftwareGl;
  roadGroup.add(crossBoulevard);

  [-5.4, 5.4].forEach((sz) => {
    const sidewalk = new THREE.Mesh(
      new THREE.BoxGeometry(eastWestRoadLength, 0.22, 1.6),
      palette.plazaPaver
    );
    sidewalk.position.set(0, 0.11, sz);
    roadGroup.add(sidewalk);

    const curb = new THREE.Mesh(new THREE.BoxGeometry(eastWestRoadLength, 0.26, 0.24), palette.curbGold);
    curb.position.set(0, 0.13, sz + (sz > 0 ? -0.8 : 0.8));
    roadGroup.add(curb);
  });

  // Double solid yellow highway lines along Cross Boulevard
  [-0.14, 0.14].forEach((lz) => {
    const yellowLine = new THREE.Mesh(new THREE.BoxGeometry(eastWestRoadLength, 0.14, 0.12), palette.roadLine);
    yellowLine.position.set(0, 0.08, lz);
    roadGroup.add(yellowLine);
  });
  [-4.4, 4.4].forEach((ez) => {
    const shoulderLine = new THREE.Mesh(new THREE.BoxGeometry(eastWestRoadLength, 0.14, 0.12), palette.roadLine);
    shoulderLine.position.set(0, 0.08, ez);
    roadGroup.add(shoulderLine);
  });

  // 3. Secondary Ring Roads (North & South avenues connecting all districts)
  [-65, -35, 35, 65].forEach((rz) => {
    const ringRoad = new THREE.Mesh(new THREE.BoxGeometry(eastWestRoadLength, 0.12, 7.2), palette.asphalt);
    ringRoad.position.set(0, 0.06, rz);
    roadGroup.add(ringRoad);
  });

  // Secondary Cross Streets (West & East avenues connecting all districts)
  [-65, -35, 35, 65].forEach((rx) => {
    const crossSt = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.12, 240), palette.asphalt);
    crossSt.position.set(rx, 0.06, 0);
    roadGroup.add(crossSt);
  });

  // 4. Expanded eastern sea with a segmented seawall and a deliberate port-road opening.
  const harborWaterGeo = new THREE.PlaneGeometry(
    CITY_WORLD_CONFIG.harborWaterSize.width,
    CITY_WORLD_CONFIG.harborWaterSize.depth,
    48,
    48
  );
  const harborWater = new THREE.Mesh(harborWaterGeo, palette.harborWater);
  harborWater.name = 'expanded_harbor_water';
  harborWater.rotation.x = -Math.PI / 2;
  harborWater.position.set(coastlineX + CITY_WORLD_CONFIG.harborWaterSize.width / 2, 0.04, 0);
  roadGroup.add(harborWater);

  // Instanced concrete wall sections leave a clear opening at the z=35 truck gate.
  const seawallSectionDepth = 10;
  const seawallSections = new THREE.InstancedMesh(
    new THREE.BoxGeometry(2.4, 0.6, seawallSectionDepth),
    palette.slateStructure,
    Math.ceil(CITY_WORLD_CONFIG.groundSize / seawallSectionDepth),
  );
  seawallSections.name = 'harbor_seawall_sections';
  const seawallTransform = new THREE.Object3D();
  let seawallCount = 0;
  const coastHalfDepth = CITY_WORLD_CONFIG.groundSize / 2;
  for (let z = -coastHalfDepth; z < coastHalfDepth; z += seawallSectionDepth) {
    const centerZ = z + seawallSectionDepth / 2;
    if (Math.abs(centerZ - CITY_WORLD_CONFIG.harborAccessZ) <= seawallSectionDepth / 2) continue;
    seawallTransform.position.set(coastlineX, 0.3, centerZ);
    seawallTransform.updateMatrix();
    seawallSections.setMatrixAt(seawallCount++, seawallTransform.matrix);
  }
  seawallSections.count = seawallCount;
  seawallSections.instanceMatrix.needsUpdate = true;
  roadGroup.add(seawallSections);

  // Low-profile breakwater boulders soften the hard coastline without adding draw calls.
  const breakwater = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.8, 0),
    palette.slateStructure,
    Math.ceil(CITY_WORLD_CONFIG.groundSize / 10),
  );
  breakwater.name = 'harbor_breakwater_rocks';
  const rockTransform = new THREE.Object3D();
  let rockCount = 0;
  for (let z = -coastHalfDepth + 5; z < coastHalfDepth; z += 10) {
    if (Math.abs(z - CITY_WORLD_CONFIG.harborAccessZ) <= 7) continue;
    rockTransform.position.set(coastlineX + 1.8, 0.1, z);
    rockTransform.rotation.set(0, (z * 0.07) % Math.PI, 0);
    rockTransform.scale.set(1.5, 0.55, 2.8);
    rockTransform.updateMatrix();
    breakwater.setMatrixAt(rockCount++, rockTransform.matrix);
  }
  breakwater.count = rockCount;
  breakwater.instanceMatrix.needsUpdate = true;
  roadGroup.add(breakwater);

  // 4. Pedestrian Crosswalks (Zebra crossings at intersections)
  const zebraWidth = 0.5;
  const zebraLength = 3.6;
  const zebraPositions = [
    { x: 0, z: -6.5, horizontal: true },
    { x: 0, z: 6.5, horizontal: true },
    { x: -6.5, z: 0, horizontal: false },
    { x: 6.5, z: 0, horizontal: false },
  ];

  zebraPositions.forEach(({ x, z, horizontal }) => {
    for (let i = -3; i <= 3; i++) {
      if (horizontal) {
        const stripe = new THREE.Mesh(
          new THREE.BoxGeometry(zebraWidth, 0.14, zebraLength),
          palette.roadZebra
        );
        stripe.position.set(x + i * 0.9, 0.12, z);
        roadGroup.add(stripe);
      } else {
        const stripe = new THREE.Mesh(
          new THREE.BoxGeometry(zebraLength, 0.14, zebraWidth),
          palette.roadZebra
        );
        stripe.position.set(x, 0.12, z + i * 0.9);
        roadGroup.add(stripe);
      }
    }
  });

  // 5. Road Lane Markings (Dashed gold/amber dividers)
  const dashGeo = new THREE.BoxGeometry(0.28, 0.14, 2.6);
  for (let z = -75; z <= 75; z += 6.5) {
    if (Math.abs(z) > 7) {
      const dashZ = new THREE.Mesh(dashGeo, palette.roadLine);
      dashZ.position.set(0, 0.12, z);
      roadGroup.add(dashZ);
    }
  }

  const dashCrossGeo = new THREE.BoxGeometry(2.6, 0.14, 0.28);
  for (let x = -75; x <= 75; x += 6.5) {
    if (Math.abs(x) > 7) {
      const dashX = new THREE.Mesh(dashCrossGeo, palette.roadLine);
      dashX.position.set(x, 0.12, 0);
      roadGroup.add(dashX);
    }
  }

  // 6. Modern Architectural Double-Arm Street Lamps with downlights
  const lampPositions = [
    [-6.2, -14],
    [6.2, -14],
    [-6.2, 14],
    [6.2, 14],
    [-14, -6.2],
    [14, -6.2],
    [-14, 6.2],
    [14, 6.2],
    [-6.2, -36],
    [6.2, -36],
    [-28, -14],
    [28, -14],
    [-28, 14],
    [28, 14],
  ];

  lampPositions.forEach(([lx, lz]) => {
    const lamp = new THREE.Group();
    lamp.position.set(lx, 0, lz);

    // Tapered Octagonal Steel Post
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 4.2, 8), palette.navyStructure);
    post.position.y = 2.1;
    lamp.add(post);

    // Decorative Gold Collar Base
    const baseCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.4, 8), palette.imperialGold);
    baseCollar.position.y = 0.2;
    lamp.add(baseCollar);

    // Cantilever Curved Lamp Arm
    const armX = lx > 0 ? -0.7 : 0.7;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.08), palette.navyStructure);
    arm.position.set(armX / 2, 4.15, 0);
    lamp.add(arm);

    // Downward Luminaire Lamp Head with Warm Glow
    const luminaire = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.14, 0.24),
      isNightOrSunset ? palette.carHeadlight : palette.chromeMetal
    );
    luminaire.position.set(armX, 4.08, 0);
    lamp.add(luminaire);

    roadGroup.add(lamp);
  });

  // 7. Landscaped Luxury Palm Trees, Blooming Flower Beds & Golf Green Islands
  const treeCoordinates = [
    [-7.2, -7.2],
    [7.2, -7.2],
    [-7.2, 7.2],
    [7.2, 7.2],
    [-14, -14],
    [14, -14],
    [-14, 14],
    [14, 14],
    [-34, -7.2],
    [34, -7.2],
    [-7.2, -48],
    [7.2, -48],
    [-7.2, 48],
    [7.2, 48],
    [52, -18],
    [52, 18],
  ];

  treeCoordinates.forEach(([tx, tz], idx) => {
    // Marble planter base
    const planter = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 0.45, 14), palette.whiteMarble);
    planter.position.set(tx, 0.225, tz);
    planter.castShadow = !isSoftwareGl;
    roadGroup.add(planter);

    const planterLawn = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.08, 14), palette.grassLawn);
    planterLawn.position.set(tx, 0.45, tz);
    roadGroup.add(planterLawn);

    // Realistic luxury royal palm with curved fronds & amber date bunches
    const palm = buildLuxuryPalmTree(
      palette,
      isSoftwareGl,
      0.95 + (idx % 3) * 0.1,
      0.06 + (idx % 4) * 0.02
    );
    palm.position.set(tx, 0.45, tz);
    palm.rotation.y = (idx * 1.3) % (Math.PI * 2);
    roadGroup.add(palm);
  });

  // Blooming floral beds (roses, marigolds, petunias) in sculpted stone planters
  const flowerBedCoordinates = [
    { x: -7.2, z: -20, shape: 'round' as const },
    { x: 7.2, z: -20, shape: 'round' as const },
    { x: -7.2, z: 20, shape: 'round' as const },
    { x: 7.2, z: 20, shape: 'round' as const },
    { x: -20, z: -7.2, shape: 'rect' as const },
    { x: 20, z: -7.2, shape: 'rect' as const },
    { x: -20, z: 7.2, shape: 'rect' as const },
    { x: 20, z: 7.2, shape: 'rect' as const },
    { x: 50, z: 0, shape: 'round' as const },
    { x: 50, z: -10, shape: 'round' as const },
    { x: 50, z: 10, shape: 'round' as const },
  ];

  flowerBedCoordinates.forEach(({ x, z, shape }) => {
    const flowerBed = buildFlowerBed(palette, isSoftwareGl, 3.2, 3.2, shape);
    flowerBed.position.set(x, 0, z);
    roadGroup.add(flowerBed);
  });

  // Lush golf turf islands with fairway mowing bands
  const turfIslandCoordinates = [
    { x: 0, z: -32, w: 9, d: 5 },
    { x: 0, z: 32, w: 9, d: 5 },
    { x: -32, z: 0, w: 5, d: 9 },
    { x: 32, z: 0, w: 5, d: 9 },
  ];

  turfIslandCoordinates.forEach(({ x, z, w, d }) => {
    const turfIsland = buildGolfGreenTurfIsland(palette, isSoftwareGl, w, d);
    turfIsland.position.set(x, 0, z);
    roadGroup.add(turfIsland);
  });

  const yachts: AnimatedYacht[] = [];
  const fountains: DancingFountainAssets[] = [];

  // 8. Animated High-Fidelity Traffic Fleet (Including Luxury Supercars: Ferrari & Lamborghini)
  const trafficFleet = [
    { type: 'ferrari', colorIdx: 0, axis: 'z' as const, dir: 1 as const, lane: 2.2, zStart: -25, speed: 0.24 },
    { type: 'lamborghini', colorIdx: 1, axis: 'x' as const, dir: 1 as const, lane: 2.2, zStart: -35, speed: 0.25 },
    { type: 'ferrari_yellow', colorIdx: 2, axis: 'x' as const, dir: -1 as const, lane: -2.2, zStart: 30, speed: 0.24 },
    { type: 'lamborghini_orange', colorIdx: 3, axis: 'z' as const, dir: -1 as const, lane: -2.2, zStart: 12, speed: 0.25 },
    { type: 'sedan', colorIdx: 0, axis: 'z' as const, dir: 1 as const, lane: 2.2, zStart: -65, speed: 0.16 },
    { type: 'truck', colorIdx: 1, axis: 'z' as const, dir: -1 as const, lane: -2.2, zStart: 55, speed: 0.12 },
    { type: 'bus', colorIdx: 2, axis: 'x' as const, dir: 1 as const, lane: 2.2, zStart: -60, speed: 0.13 },
    { type: 'taxi', colorIdx: 6, axis: 'x' as const, dir: -1 as const, lane: -2.2, zStart: 50, speed: 0.17 },
    { type: 'suv', colorIdx: 4, axis: 'z' as const, dir: 1 as const, lane: 2.2, zStart: 35, speed: 0.18 },
    { type: 'sedan', colorIdx: 3, axis: 'x' as const, dir: -1 as const, lane: -2.2, zStart: -15, speed: 0.16 },
  ];

  trafficFleet.forEach((v) => {
    let vehicleMesh: THREE.Group;

    if (v.type === 'lamborghini') {
      vehicleMesh = buildLamborghiniSupercar(palette, isSoftwareGl, 'green');
    } else if (v.type === 'lamborghini_orange') {
      vehicleMesh = buildLamborghiniSupercar(palette, isSoftwareGl, 'orange');
    } else if (v.type === 'ferrari') {
      vehicleMesh = buildFerrariSupercar(palette, isSoftwareGl, 'red');
    } else if (v.type === 'ferrari_yellow') {
      vehicleMesh = buildFerrariSupercar(palette, isSoftwareGl, 'yellow');
    } else if (v.type === 'truck') {
      vehicleMesh = buildHeavyLogisticsTruck(palette, isSoftwareGl);
    } else if (v.type === 'bus') {
      vehicleMesh = buildCityTransitBus(palette, isSoftwareGl);
    } else if (v.type === 'taxi') {
      vehicleMesh = buildCityTaxi(palette, isSoftwareGl);
    } else if (v.type === 'suv') {
      vehicleMesh = buildCyberSUV(palette, isSoftwareGl);
    } else {
      vehicleMesh = buildRealisticSedan(palette, v.colorIdx, isSoftwareGl);
    }

    if (v.axis === 'z') {
      vehicleMesh.position.set(v.lane, 0, v.zStart);
      vehicleMesh.rotation.y = v.dir === 1 ? 0 : Math.PI;
      vehicles.push({
        mesh: vehicleMesh,
        axis: 'z',
        dir: v.dir,
        speed: v.speed,
        min: -120,
        max: 120,
        laneOffset: v.lane,
      });
    } else {
      vehicleMesh.position.set(v.zStart, 0, v.lane);
      vehicleMesh.rotation.y = v.dir === 1 ? Math.PI / 2 : -Math.PI / 2;
      vehicles.push({
        mesh: vehicleMesh,
        axis: 'x',
        dir: v.dir,
        speed: v.speed,
        min: -coastlineX,
        max: coastlineX,
        laneOffset: v.lane,
      });
    }

    roadGroup.add(vehicleMesh);
  });

  // 9. Coastal Luxury Yacht Fleet cruising in the harbor waters
  const superyacht1 = buildLuxurySuperyacht(palette, isSoftwareGl);
  superyacht1.position.set(coastlineX + 32, 0.08, -35);
  superyacht1.rotation.y = 0;
  roadGroup.add(superyacht1);
  yachts.push({
    mesh: superyacht1,
    speed: 0.09,
    dir: 1,
    min: -95,
    max: 95,
    phase: 0,
  });

  const superyacht2 = buildLuxurySuperyacht(palette, isSoftwareGl);
  superyacht2.scale.set(0.85, 0.85, 0.85);
  superyacht2.position.set(coastlineX + 55, 0.08, 45);
  superyacht2.rotation.y = Math.PI;
  roadGroup.add(superyacht2);
  yachts.push({
    mesh: superyacht2,
    speed: 0.08,
    dir: -1,
    min: -90,
    max: 90,
    phase: Math.PI / 2,
  });

  const speedboat = buildSpeedboatYacht(palette, isSoftwareGl);
  speedboat.position.set(coastlineX + 18, 0.08, 10);
  speedboat.rotation.y = 0;
  roadGroup.add(speedboat);
  yachts.push({
    mesh: speedboat,
    speed: 0.16,
    dir: 1,
    min: -85,
    max: 85,
    phase: Math.PI,
  });

  // 10. Grand City Center Dancing Fountains
  const northFountain = buildDancingFountain(palette, isSoftwareGl, 3.6);
  northFountain.group.position.set(0, 0.08, -24);
  roadGroup.add(northFountain.group);
  fountains.push(northFountain);

  const southFountain = buildDancingFountain(palette, isSoftwareGl, 3.6);
  southFountain.group.position.set(0, 0.08, 24);
  roadGroup.add(southFountain.group);
  fountains.push(southFountain);

  // 11. Imperial Classical Statues in Boulevard Medians
  const eagleMonument = buildImperialGoldenEagleStatue(palette, isSoftwareGl);
  eagleMonument.position.set(-24, 0.08, 0);
  roadGroup.add(eagleMonument);

  const titanMonument = buildClassicalTitanStatue(palette, isSoftwareGl);
  titanMonument.position.set(24, 0.08, 0);
  roadGroup.add(titanMonument);

  // Ensure all roads, curbs, sidewalks, and street props receive and cast shadows
  roadGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.receiveShadow = !isSoftwareGl;
      if (child.name !== 'expanded_harbor_water' && !(child.material as THREE.Material)?.transparent) {
        child.castShadow = !isSoftwareGl;
      }
    }
  });

  return { group: roadGroup, vehicles, yachts, fountains };
}
