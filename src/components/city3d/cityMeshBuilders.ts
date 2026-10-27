/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import type { CityMaterialPalette } from './cityMaterials';

/**
 * Shared reusable geometries to minimize GC and memory footprint on mobile devices
 */
const sharedGeos = {
  boxUnit: new THREE.BoxGeometry(1, 1, 1),
  cylinderUnit: new THREE.CylinderGeometry(0.5, 0.5, 1, 12),
  coneUnit: new THREE.ConeGeometry(0.5, 1, 8),
  sphereUnit: new THREE.SphereGeometry(0.5, 12, 10),
};

/**
 * 1. Empty Plot Builder (أرض فضاء مجهزة للبيع أو غير مملوكة)
 */
export function buildEmptyPlotMesh(
  width: number,
  depth: number,
  status: string,
  price: number,
  palette: CityMaterialPalette,
  isSoftwareGl: boolean
): THREE.Group {
  const group = new THREE.Group();

  // 1. Foundation slab with plaza pavers and gold curb border
  const slabGeo = new THREE.BoxGeometry(width - 0.4, 0.28, depth - 0.4);
  const slab = new THREE.Mesh(slabGeo, palette.plazaPaver);
  slab.position.y = 0.14;
  slab.receiveShadow = !isSoftwareGl;
  group.add(slab);

  // Outer gold curb border
  const curbGeo = new THREE.BoxGeometry(width - 0.2, 0.08, depth - 0.2);
  const curb = new THREE.Mesh(curbGeo, palette.curbGold);
  curb.position.y = 0.04;
  group.add(curb);

  // 2. Corner boundary markers with glowing beacons
  const halfW = (width - 0.8) / 2;
  const halfD = (depth - 0.8) / 2;
  const cornerPositions = [
    [-halfW, -halfD],
    [halfW, -halfD],
    [-halfW, halfD],
    [halfW, halfD],
  ];

  cornerPositions.forEach(([cx, cz]) => {
    // Marble bollard post
    const postGeo = new THREE.BoxGeometry(0.24, 0.9, 0.24);
    const post = new THREE.Mesh(postGeo, palette.whiteMarble);
    post.position.set(cx, 0.55, cz);
    group.add(post);

    // Glowing corner beacon
    const beaconGeo = new THREE.SphereGeometry(0.14, 8, 8);
    const beacon = new THREE.Mesh(
      beaconGeo,
      status === 'locked' ? palette.plotSignLocked : palette.plotHoloRing
    );
    beacon.position.set(cx, 1.05, cz);
    group.add(beacon);
  });

  // 3. Central For Sale / Status Board
  const standGroup = new THREE.Group();
  standGroup.position.set(0, 0.28, 0);

  // Steel supporting twin poles
  [-0.8, 0.8].forEach((px) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8), palette.industrialSteel);
    pole.position.set(px, 1.1, 0);
    standGroup.add(pole);
  });

  // Main board body
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 1.3, 0.12),
    status === 'locked' ? palette.plotSignLocked : palette.plotSignBoard
  );
  board.position.y = 2.1;
  board.castShadow = !isSoftwareGl;
  standGroup.add(board);

  // Golden architectural frame & header crown
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.72, 1.42, 0.08), palette.imperialGold);
  frame.position.y = 2.1;
  standGroup.add(frame);

  const crownHeader = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.4, 4), palette.imperialGold);
  crownHeader.rotation.y = Math.PI / 4;
  crownHeader.position.set(0, 2.95, 0);
  standGroup.add(crownHeader);

  // Rotating holographic ground halo
  const haloGeo = new THREE.RingGeometry(1.8, 2.1, 24);
  const halo = new THREE.Mesh(
    haloGeo,
    status === 'locked' ? palette.plotSignLocked : palette.plotHoloRing
  );
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = 0.3;
  group.add(halo);

  group.add(standGroup);
  return group;
}

/**
 * 2. Paperwork & Land Survey Stage (مرحلة التخطيط والمسح الهندسي)
 */
export function buildPaperworkSurveyMesh(
  width: number,
  depth: number,
  palette: CityMaterialPalette,
  isSoftwareGl: boolean
): THREE.Group {
  const group = new THREE.Group();

  // Plot ground slab
  const slab = new THREE.Mesh(new THREE.BoxGeometry(width - 0.4, 0.25, depth - 0.4), palette.plazaPaver);
  slab.position.y = 0.125;
  group.add(slab);

  // Central Surveying Tripod & High-Tech Theodolite
  const tripodGroup = new THREE.Group();
  tripodGroup.position.set(0, 0.25, 0);

  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.05, 1.8, 6),
      palette.constructionYellow
    );
    leg.position.set(Math.cos(angle) * 0.45, 0.9, Math.sin(angle) * 0.45);
    leg.rotation.z = Math.cos(angle) * 0.28;
    leg.rotation.x = -Math.sin(angle) * 0.28;
    tripodGroup.add(leg);
  }

  // Theodolite body
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.35), palette.safetyOrange);
  head.position.y = 1.85;
  tripodGroup.add(head);

  // Optical telescope lens with glowing cyan crosshair
  const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.55, 8), palette.industrialSteel);
  scope.rotation.x = Math.PI / 2;
  scope.position.set(0, 1.95, 0);
  tripodGroup.add(scope);

  const lensGlass = new THREE.Mesh(new THREE.CircleGeometry(0.08, 8), palette.neonCyan);
  lensGlass.position.set(0, 1.95, 0.28);
  tripodGroup.add(lensGlass);

  group.add(tripodGroup);

  // Field Blueprint Table
  const tableGroup = new THREE.Group();
  tableGroup.position.set(2.4, 0.25, -2.0);

  const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 1.1), palette.whiteMarble);
  tableTop.position.y = 0.9;
  tableGroup.add(tableTop);

  // Blueprint sheet rolled out
  const blueprint = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.02, 0.8), palette.curtainGlass);
  blueprint.position.set(0, 0.95, 0);
  tableGroup.add(blueprint);

  // 4 Table legs
  [
    [-0.8, -0.45],
    [0.8, -0.45],
    [-0.8, 0.45],
    [0.8, 0.45],
  ].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6), palette.industrialSteel);
    leg.position.set(lx, 0.45, lz);
    tableGroup.add(leg);
  });

  group.add(tableGroup);

  // Survey flags at perimeter corners
  const halfW = (width - 1.2) / 2;
  const halfD = (depth - 1.2) / 2;
  [
    [-halfW, -halfD],
    [halfW, -halfD],
    [-halfW, halfD],
    [halfW, halfD],
  ].forEach(([fx, fz]) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 6), palette.industrialSteel);
    pole.position.set(fx, 0.8, fz);
    group.add(pole);

    const flag = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.02), palette.safetyOrange);
    flag.position.set(fx + 0.2, 1.45, fz);
    group.add(flag);
  });

  return group;
}

/**
 * 3. Site Clearing & Excavation Stage (مرحلة تمهيد الموقع والحفر)
 */
export function buildSiteClearingMesh(
  width: number,
  depth: number,
  palette: CityMaterialPalette,
  isSoftwareGl: boolean
): THREE.Group {
  const group = new THREE.Group();

  // Excavated dirt ground
  const pit = new THREE.Mesh(new THREE.BoxGeometry(width - 0.6, 0.35, depth - 0.6), palette.dirtExcavation);
  pit.position.y = 0.175;
  pit.receiveShadow = !isSoftwareGl;
  group.add(pit);

  // Piles of excavated earth and gravel
  const mounds = [
    [-2.8, -2.4, 2.2, 1.1],
    [2.8, -2.2, 1.8, 0.9],
    [-1.2, 2.6, 2.4, 1.2],
    [2.6, 2.4, 1.9, 0.95],
  ];

  mounds.forEach(([mx, mz, rad, h]) => {
    const mound = new THREE.Mesh(new THREE.ConeGeometry(rad, h, 8), palette.dirtExcavation);
    mound.position.set(mx, 0.35 + h / 2, mz);
    mound.castShadow = !isSoftwareGl;
    group.add(mound);
  });

  // Heavy Tracked Crawler Excavator (10+ distinct parts)
  const excavator = new THREE.Group();
  excavator.position.set(0, 0.35, 0);

  // Twin rubber crawler tracks
  [-0.65, 0.65].forEach((tx) => {
    const track = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.42, 2.0), palette.tireRubber);
    track.position.set(tx, 0.21, 0);
    excavator.add(track);

    const trackSprocket = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.34, 8), palette.industrialSteel);
    trackSprocket.rotation.z = Math.PI / 2;
    trackSprocket.position.set(tx, 0.21, 0.85);
    excavator.add(trackSprocket);
  });

  // Track carriage frame
  const carriage = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.2, 1.5), palette.industrialSteel);
  carriage.position.y = 0.35;
  excavator.add(carriage);

  // Rotating upper superstructure
  const cabBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.85, 1.6), palette.constructionYellow);
  cabBody.position.set(0, 0.85, 0);
  cabBody.castShadow = !isSoftwareGl;
  excavator.add(cabBody);

  // Operator glass cabin
  const cabGlass = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.75), palette.carGlass);
  cabGlass.position.set(0.3, 1.1, 0.35);
  excavator.add(cabGlass);

  // Counterweight block
  const counterweight = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.7, 0.45), palette.slateStructure);
  counterweight.position.set(0, 0.85, -0.65);
  excavator.add(counterweight);

  // Articulated boom, stick arm, and digging bucket
  const boom = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.8, 0.25), palette.constructionYellow);
  boom.position.set(-0.25, 1.7, 0.8);
  boom.rotation.x = -0.55;
  excavator.add(boom);

  const stick = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.4, 0.2), palette.constructionYellow);
  stick.position.set(-0.25, 2.2, 1.8);
  stick.rotation.x = 0.75;
  excavator.add(stick);

  const bucket = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.4, 0.45), palette.industrialSteel);
  bucket.position.set(-0.25, 1.4, 2.2);
  bucket.rotation.x = 0.4;
  excavator.add(bucket);

  group.add(excavator);

  // Perimeter Safety Cones with reflective stripes
  const halfPerimW = (width - 1.4) / 2;
  const halfPerimD = (depth - 1.4) / 2;
  const coneLocations = [
    [-halfPerimW, 0],
    [halfPerimW, 0],
    [0, -halfPerimD],
    [0, halfPerimD],
  ];

  coneLocations.forEach(([cx, cz]) => {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 8), palette.safetyOrange);
    cone.position.set(cx, 0.62, cz);
    group.add(cone);

    const base = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.05, 0.32), palette.slateStructure);
    base.position.set(cx, 0.37, cz);
    group.add(base);
  });

  return group;
}

/**
 * 4. Active Construction Stage (مرحلة التشييد مع رافعة برجية وسقالات)
 */
export function buildActiveConstructionMesh(
  width: number,
  depth: number,
  palette: CityMaterialPalette,
  isSoftwareGl: boolean
): THREE.Group {
  const group = new THREE.Group();

  // Cast Concrete Foundation Slab
  const slab = new THREE.Mesh(new THREE.BoxGeometry(width - 1.2, 0.6, depth - 1.2), palette.facadeConcrete);
  slab.position.y = 0.3;
  slab.receiveShadow = !isSoftwareGl;
  group.add(slab);

  // Protruding Steel Rebars & Reinforced Concrete Columns
  const rebarPositions = [
    [-3.2, -3.2],
    [3.2, -3.2],
    [-3.2, 3.2],
    [3.2, 3.2],
    [0, -3.2],
    [0, 3.2],
    [-3.2, 0],
    [3.2, 0],
  ];

  rebarPositions.forEach(([rx, rz]) => {
    // Concrete Column
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.65, 3.8, 0.65), palette.facadeConcrete);
    col.position.set(rx, 2.5, rz);
    col.castShadow = !isSoftwareGl;
    group.add(col);

    // Rebars sticking out of top
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const rebar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 4), palette.industrialSteel);
      rebar.position.set(rx + Math.cos(angle) * 0.18, 4.6, rz + Math.sin(angle) * 0.18);
      group.add(rebar);
    }
  });

  // Scaffolding Wireframe Cube enclosing core
  const scaf = new THREE.Mesh(new THREE.BoxGeometry(5.2, 5.0, 5.2), palette.scaffoldingWire);
  scaf.position.set(0, 3.1, 0);
  group.add(scaf);

  // Liebherr-Style Yellow Tower Crane (12+ distinct parts)
  const craneGroup = new THREE.Group();
  craneGroup.position.set(3.4, 0.6, -3.4);

  // Lattice Mast Tower
  const mast = new THREE.Mesh(new THREE.BoxGeometry(0.7, 12.0, 0.7), palette.constructionYellow);
  mast.position.y = 6.0;
  craneGroup.add(mast);

  // Slewing Unit & Operator Cab
  const slewUnit = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.6, 8), palette.craneSteel);
  slewUnit.position.y = 12.3;
  craneGroup.add(slewUnit);

  const operCab = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.75, 0.85), palette.carGlass);
  operCab.position.set(0.65, 12.4, 0.35);
  craneGroup.add(operCab);

  // Apex A-Frame Peak
  const apex = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.8, 4), palette.constructionYellow);
  apex.rotation.y = Math.PI / 4;
  apex.position.set(0, 13.5, 0);
  craneGroup.add(apex);

  // Main Jib Boom (stretching over construction site)
  const boom = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 11.0), palette.constructionYellow);
  boom.position.set(0, 12.7, 3.0);
  craneGroup.add(boom);

  // Counter-Jib with heavy concrete counterweights
  const counterJib = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 3.6), palette.constructionYellow);
  counterJib.position.set(0, 12.7, -2.8);
  craneGroup.add(counterJib);

  const counterWeights = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 1.4), palette.facadeConcrete);
  counterWeights.position.set(0, 12.9, -3.8);
  craneGroup.add(counterWeights);

  // Hoist Trolley, Cable, and Heavy Steel Hook
  const trolley = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.25, 0.55), palette.craneSteel);
  trolley.position.set(0, 12.4, 4.8);
  craneGroup.add(trolley);

  const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 4.5, 4), palette.industrialSteel);
  cable.position.set(0, 10.15, 4.8);
  craneGroup.add(cable);

  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.05, 8, 12), palette.imperialGold);
  hook.position.set(0, 7.8, 4.8);
  craneGroup.add(hook);

  group.add(craneGroup);

  // Site Construction Office Portakabin
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.3, 1.5), palette.whiteMarble);
  cabin.position.set(-3.2, 1.25, 3.2);
  cabin.castShadow = !isSoftwareGl;
  group.add(cabin);

  // Cabin door and window
  const cabinDoor = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.9, 0.02), palette.navyStructure);
  cabinDoor.position.set(-3.2, 1.05, 3.96);
  group.add(cabinDoor);

  return group;
}

/**
 * 5. IMPERIAL HEADQUARTERS TOWER (5 Levels of Grandeur)
 */
export function buildHQMesh(
  level: number,
  palette: CityMaterialPalette,
  isSoftwareGl: boolean
): THREE.Group {
  const hq = new THREE.Group();

  // Tier 0: Grand Marble Plaza with Gold Curbs & Fountain Basin
  const plazaBase = new THREE.Mesh(new THREE.BoxGeometry(16, 0.45, 16), palette.plazaPaver);
  plazaBase.position.y = 0.225;
  plazaBase.receiveShadow = !isSoftwareGl;
  hq.add(plazaBase);

  const plazaCurb = new THREE.Mesh(new THREE.BoxGeometry(16.4, 0.15, 16.4), palette.curbGold);
  plazaCurb.position.y = 0.075;
  hq.add(plazaCurb);

  // Front Water Fountain with cascading basin
  const fountainRing = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.6, 0.5, 16), palette.whiteMarble);
  fountainRing.position.set(0, 0.6, 5.8);
  hq.add(fountainRing);

  const fountainWater = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.4, 16), palette.waterSurface);
  fountainWater.position.set(0, 0.65, 5.8);
  hq.add(fountainWater);

  const jetSpire = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.2, 8), palette.imperialGold);
  jetSpire.position.set(0, 1.2, 5.8);
  hq.add(jetSpire);

  // Symmetrical Topiary Planters on Plaza
  [-5.8, 5.8].forEach((px) => {
    const planter = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.6, 1.4), palette.whiteMarble);
    planter.position.set(px, 0.6, 5.8);
    hq.add(planter);

    const bush = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), palette.foliageGreen);
    bush.position.set(px, 1.4, 5.8);
    bush.castShadow = !isSoftwareGl;
    hq.add(bush);
  });

  // Level 1: Grand 2-Story Atrium Lobby
  const lobbyH = 3.6;
  const lobbyW = 10.0;
  const lobbyD = 10.0;

  const lobby = new THREE.Mesh(new THREE.BoxGeometry(lobbyW, lobbyH, lobbyD), palette.navyStructure);
  lobby.position.y = 0.45 + lobbyH / 2;
  lobby.castShadow = !isSoftwareGl;
  hq.add(lobby);

  // Lobby Glass Facade with Illuminated Warm Interior
  const lobbyGlass = new THREE.Mesh(new THREE.BoxGeometry(lobbyW + 0.1, lobbyH - 0.6, lobbyD - 1.2), palette.curtainGlass);
  lobbyGlass.position.y = 0.45 + lobbyH / 2;
  hq.add(lobbyGlass);

  // Cantilevered Grand Entrance Canopy
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.25, 2.4), palette.imperialGold);
  canopy.position.set(0, 2.6, 5.8);
  hq.add(canopy);

  // Revolving Gold Doors
  const doorCylinder = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 1.8, 12), palette.imperialGold);
  doorCylinder.position.set(0, 1.35, 5.05);
  hq.add(doorCylinder);

  // TIER 1 TOWER SHAFT (Base Tower for all levels)
  const t1Height = 8.5;
  const t1Width = 8.4;
  const t1Depth = 8.4;

  const shaft1 = new THREE.Mesh(new THREE.BoxGeometry(t1Width, t1Height, t1Depth), palette.officeWindowsLit);
  shaft1.position.y = 4.05 + t1Height / 2;
  shaft1.castShadow = !isSoftwareGl;
  hq.add(shaft1);

  // Gold Vertical Architectural Mullions (Pillars)
  [-3.8, -1.3, 1.3, 3.8].forEach((mx) => {
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.25, t1Height + 0.4, 0.25), palette.imperialGold);
    mullion.position.set(mx, 4.05 + t1Height / 2, 4.25);
    hq.add(mullion);

    const mullionRear = new THREE.Mesh(new THREE.BoxGeometry(0.25, t1Height + 0.4, 0.25), palette.imperialGold);
    mullionRear.position.set(mx, 4.05 + t1Height / 2, -4.25);
    hq.add(mullionRear);
  });

  let currentY = 4.05 + t1Height;

  // TIER 2: Executive Expansion (Levels 2-5)
  if (level >= 2) {
    const t2Height = 7.0;
    const t2Width = 6.8;
    const t2Depth = 6.8;

    // Setback terrace balcony
    const terrace = new THREE.Mesh(new THREE.BoxGeometry(t1Width, 0.4, t1Depth), palette.imperialGold);
    terrace.position.y = currentY + 0.2;
    hq.add(terrace);

    const shaft2 = new THREE.Mesh(new THREE.BoxGeometry(t2Width, t2Height, t2Depth), palette.officeWindowsLit);
    shaft2.position.y = currentY + 0.4 + t2Height / 2;
    shaft2.castShadow = !isSoftwareGl;
    hq.add(shaft2);

    currentY += 0.4 + t2Height;
  }

  // TIER 3: Integrated Sovereign Complex (Levels 3-5)
  if (level >= 3) {
    const t3Height = 6.5;
    const t3Width = 5.4;
    const t3Depth = 5.4;

    const terrace2 = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.35, 6.6), palette.brushedGold);
    terrace2.position.y = currentY + 0.175;
    hq.add(terrace2);

    const shaft3 = new THREE.Mesh(new THREE.BoxGeometry(t3Width, t3Height, t3Depth), palette.officeWindowsLit);
    shaft3.position.y = currentY + 0.35 + t3Height / 2;
    shaft3.castShadow = !isSoftwareGl;
    hq.add(shaft3);

    currentY += 0.35 + t3Height;
  }

  // TIER 4: Continental Financial Spire (Levels 4-5)
  if (level >= 4) {
    const t4Height = 6.0;
    const t4Width = 4.2;
    const t4Depth = 4.2;

    const shaft4 = new THREE.Mesh(new THREE.BoxGeometry(t4Width, t4Height, t4Depth), palette.curtainGlass);
    shaft4.position.y = currentY + t4Height / 2;
    shaft4.castShadow = !isSoftwareGl;
    hq.add(shaft4);

    // Cantilevered Executive Boardroom Skybay
    const skybay = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.8, 4.8), palette.imperialGold);
    skybay.position.y = currentY + 3.8;
    hq.add(skybay);

    currentY += t4Height;
  }

  // TIER 5: World-Class Skyscraper Pinnacle & Helipad (Level 5)
  if (level >= 5) {
    // Rooftop Helipad with "H" Mark
    const helipad = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.6, 0.4, 18), palette.slateStructure);
    helipad.position.y = currentY + 0.2;
    hq.add(helipad);

    const helipadBorder = new THREE.Mesh(new THREE.RingGeometry(2.1, 2.3, 18), palette.imperialGold);
    helipadBorder.rotation.x = -Math.PI / 2;
    helipadBorder.position.y = currentY + 0.42;
    hq.add(helipadBorder);

    // Cantilevered Gold Crown Arch Spire
    const crown = new THREE.Mesh(new THREE.ConeGeometry(1.6, 4.8, 4), palette.imperialGold);
    crown.rotation.y = Math.PI / 4;
    crown.position.y = currentY + 2.8;
    hq.add(crown);

    // Soaring Communications Needle Antenna with Aviation Beacon
    const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.14, 5.5, 8), palette.chromeMetal);
    needle.position.y = currentY + 6.5;
    hq.add(needle);

    const aviationLight = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), palette.carTaillight);
    aviationLight.position.y = currentY + 9.25;
    hq.add(aviationLight);
  } else {
    // Base Roof Parapet & Spire for Levels 1-4
    const roofCap = new THREE.Mesh(new THREE.ConeGeometry(1.4, 3.2, 4), palette.imperialGold);
    roofCap.rotation.y = Math.PI / 4;
    roofCap.position.y = currentY + 1.6;
    hq.add(roofCap);

    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.1, 3.2, 8), palette.chromeMetal);
    antenna.position.y = currentY + 4.2;
    hq.add(antenna);
  }

  return hq;
}

/**
 * 6. CENTRAL SOVEREIGN INVESTMENT BANK
 */
export function buildBankMesh(palette: CityMaterialPalette, isSoftwareGl: boolean): THREE.Group {
  const bank = new THREE.Group();

  // 1. Broad Marble Stepped Podium
  const podium = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.9, 9.5), palette.whiteMarble);
  podium.position.y = 0.45;
  podium.receiveShadow = !isSoftwareGl;
  bank.add(podium);

  // Ceremonial Front Grand Stairs
  for (let s = 0; s < 4; s++) {
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(6.5 + s * 0.4, 0.18, 0.8),
      palette.whiteMarble
    );
    step.position.set(0, 0.09 + s * 0.18, 4.8 + (3 - s) * 0.4);
    bank.add(step);
  }

  // 2. Main Classical Banking Hall
  const hall = new THREE.Mesh(new THREE.BoxGeometry(9.5, 5.2, 7.5), palette.whiteMarble);
  hall.position.y = 3.4;
  hall.castShadow = !isSoftwareGl;
  bank.add(hall);

  // 3. Hexastyle Portico: 6 Fluted Classical Columns with Capitals & Bases
  const colSpacing = 1.4;
  for (let i = -2.5; i <= 2.5; i += 1.0) {
    const cx = i * colSpacing;

    // Fluted shaft
    const colShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 4.8, 12), palette.whiteMarble);
    colShaft.position.set(cx, 3.3, 3.9);
    colShaft.castShadow = !isSoftwareGl;
    bank.add(colShaft);

    // Golden Corinthian Capital
    const capital = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.34, 0.35, 10), palette.imperialGold);
    capital.position.set(cx, 5.75, 3.9);
    bank.add(capital);

    // Column Base Plinth
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.22, 0.72), palette.whiteMarble);
    base.position.set(cx, 0.95, 3.9);
    bank.add(base);
  }

  // 4. Triangular Classical Pediment with Imperial Gold Relief
  const pediment = new THREE.Mesh(new THREE.ConeGeometry(5.8, 2.6, 4), palette.whiteMarble);
  pediment.rotation.y = Math.PI / 4;
  pediment.position.set(0, 7.1, 2.2);
  bank.add(pediment);

  // Golden Relief Medallion in Pediment Tympanum
  const medallion = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.15, 16), palette.imperialGold);
  medallion.rotation.x = Math.PI / 2;
  medallion.position.set(0, 6.7, 4.15);
  bank.add(medallion);

  // 5. Majestic Golden Ribbed Dome with Balustrade Lantern
  const domeBase = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.9, 0.8, 16), palette.whiteMarble);
  domeBase.position.set(0, 6.3, 0);
  bank.add(domeBase);

  const dome = new THREE.Mesh(new THREE.SphereGeometry(2.6, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), palette.imperialGold);
  dome.position.set(0, 6.7, 0);
  bank.add(dome);

  // Dome Lantern Finial
  const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.2, 8), palette.imperialGold);
  lantern.position.set(0, 9.6, 0);
  bank.add(lantern);

  // 6. Armored Security Vault Wing & Live Financial LED Ticker
  const tickerScreen = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.38, 0.15), palette.neonCyan);
  tickerScreen.position.set(0, 1.6, 4.75);
  bank.add(tickerScreen);

  return bank;
}

/**
 * 7. FLAGSHIP MANUFACTURING & INDUSTRIAL COMPLEX
 */
export function buildFactoryMesh(
  palette: CityMaterialPalette,
  isSoftwareGl: boolean
): { group: THREE.Group; smokePositions: THREE.Vector3[] } {
  const factory = new THREE.Group();
  const smokePositions: THREE.Vector3[] = [];

  // 1. Heavy Industrial Floor Plinth
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(13.0, 0.5, 11.0), palette.slateStructure);
  plinth.position.y = 0.25;
  plinth.receiveShadow = !isSoftwareGl;
  factory.add(plinth);

  // Yellow Safety Perimeter Edge
  const safetyBorder = new THREE.Mesh(new THREE.BoxGeometry(13.3, 0.1, 11.3), palette.constructionCaution);
  safetyBorder.position.y = 0.05;
  factory.add(safetyBorder);

  // 2. Main Fabrication Hangar with Saw-Tooth Clerestory Roof
  const hangarW = 8.5;
  const hangarH = 4.8;
  const hangarD = 7.0;

  const hangar = new THREE.Mesh(new THREE.BoxGeometry(hangarW, hangarH, hangarD), palette.corrugatedMetal);
  hangar.position.set(-1.8, 0.5 + hangarH / 2, 0);
  hangar.castShadow = !isSoftwareGl;
  factory.add(hangar);

  // 3 Saw-Tooth Roof Ridges with North-Facing Glazing
  for (let r = 0; r < 3; r++) {
    const ridge = new THREE.Mesh(new THREE.ConeGeometry(1.6, 1.8, 3), palette.navyStructure);
    ridge.rotation.y = Math.PI / 2;
    ridge.rotation.z = 0.3;
    ridge.position.set(-4.2 + r * 2.5, 5.8, 0);
    factory.add(ridge);
  }

  // 3. Dual Industrial Smokestacks with Red & White Aviation Bands
  const stackPositions = [
    new THREE.Vector3(3.8, 0, -2.6),
    new THREE.Vector3(5.2, 0, -2.6),
  ];

  stackPositions.forEach((sp, idx) => {
    // Tapered tall chimney
    const chimneyH = 8.8;
    const chimney = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.75, chimneyH, 12),
      palette.industrialBrick
    );
    chimney.position.set(sp.x, 0.5 + chimneyH / 2, sp.z);
    chimney.castShadow = !isSoftwareGl;
    factory.add(chimney);

    // Warning Bands near top
    const band1 = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.56, 0.8, 12), palette.whiteMarble);
    band1.position.set(sp.x, 7.8, sp.z);
    factory.add(band1);

    const band2 = new THREE.Mesh(new THREE.CylinderGeometry(0.51, 0.53, 0.8, 12), palette.carTaillight);
    band2.position.set(sp.x, 8.8, sp.z);
    factory.add(band2);

    // Smoke emission coordinate
    smokePositions.push(new THREE.Vector3(sp.x, 9.4, sp.z));
  });

  // 4. Cylindrical Bulk Storage Silos with External Piping
  [-0.6, 1.6].forEach((sx) => {
    const silo = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 5.8, 14), palette.chromeMetal);
    silo.position.set(sx, 3.4, 3.5);
    silo.castShadow = !isSoftwareGl;
    factory.add(silo);

    const siloCap = new THREE.Mesh(new THREE.ConeGeometry(1.05, 0.6, 14), palette.brushedGold);
    siloCap.position.set(sx, 6.5, 3.5);
    factory.add(siloCap);
  });

  // Industrial Pipeline Conduits
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 5.4, 8), palette.copperAccent);
  pipe.rotation.z = Math.PI / 2;
  pipe.position.set(0.5, 4.2, 3.5);
  factory.add(pipe);

  // 5. Electrical Substation & High-Voltage Transformer
  const subStation = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.8, 2.0), palette.slateStructure);
  subStation.position.set(4.2, 1.4, 2.6);
  factory.add(subStation);

  for (let b = 0; b < 3; b++) {
    const bushing = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.7, 6), palette.copperAccent);
    bushing.position.set(3.6 + b * 0.6, 2.5, 2.6);
    factory.add(bushing);
  }

  // Roll-Up Overhead Truck Cargo Door
  const cargoDoor = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.6, 2.4), palette.industrialSteel);
  cargoDoor.position.set(2.46, 1.8, 0);
  factory.add(cargoDoor);

  return { group: factory, smokePositions };
}

/**
 * 8. COMMERCIAL RETAIL MALL & MEGA STORE
 */
export function buildStoreMesh(palette: CityMaterialPalette, isSoftwareGl: boolean): THREE.Group {
  const store = new THREE.Group();

  // 1. Paved Plaza Base
  const base = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.4, 9.5), palette.plazaPaver);
  base.position.y = 0.2;
  base.receiveShadow = !isSoftwareGl;
  store.add(base);

  // 2. Multistory Curved Glass Atrium Mall Structure
  const body = new THREE.Mesh(new THREE.BoxGeometry(8.5, 4.6, 7.2), palette.navyStructure);
  body.position.y = 2.5;
  body.castShadow = !isSoftwareGl;
  store.add(body);

  // Front Double-Height Glass Curtain Wall
  const glassFacade = new THREE.Mesh(new THREE.BoxGeometry(8.6, 3.6, 0.2), palette.curtainGlass);
  glassFacade.position.set(0, 2.2, 3.62);
  store.add(glassFacade);

  // 3. Cantilevered Gold Entrance Canopy & Revolving Doors
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.22, 1.8), palette.imperialGold);
  canopy.position.set(0, 2.4, 4.5);
  store.add(canopy);

  // 4. Massive Illuminated Digital Billboard Display Screen
  const billboard = new THREE.Mesh(new THREE.BoxGeometry(5.8, 1.4, 0.18), palette.neonCyan);
  billboard.position.set(0, 4.1, 3.65);
  store.add(billboard);

  // Billboard Gold Frame
  const bFrame = new THREE.Mesh(new THREE.BoxGeometry(6.0, 1.55, 0.12), palette.imperialGold);
  bFrame.position.set(0, 4.1, 3.64);
  store.add(bFrame);

  // 5. Rooftop HVAC Chiller Units and Ductwork
  [-1.8, 1.8].forEach((hx) => {
    const hvac = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 1.4), palette.industrialSteel);
    hvac.position.set(hx, 5.2, -1.0);
    store.add(hvac);

    const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.15, 8), palette.slateStructure);
    fan.position.set(hx, 5.72, -1.0);
    store.add(fan);
  });

  // 6. Sidewalk Promenade with Outdoor Café Parasols
  [-3.2, 3.2].forEach((cx) => {
    // Parasol Umbrella
    const umbrella = new THREE.Mesh(new THREE.ConeGeometry(0.9, 0.45, 8), palette.imperialGold);
    umbrella.position.set(cx, 1.8, 3.8);
    store.add(umbrella);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6), palette.industrialSteel);
    pole.position.set(cx, 1.1, 3.8);
    store.add(pole);

    // Café Table
    const table = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.05, 8), palette.whiteMarble);
    table.position.set(cx, 0.75, 3.8);
    store.add(table);
  });

  return store;
}

/**
 * 9. LOGISTICS CENTER & MULTI-BAY DISTRIBUTION HUB
 */
export function buildWarehouseMesh(palette: CityMaterialPalette, isSoftwareGl: boolean): THREE.Group {
  const warehouse = new THREE.Group();

  // 1. Concrete Truck Apron Foundation
  const foundation = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.45, 10.5), palette.facadeConcrete);
  foundation.position.y = 0.225;
  foundation.receiveShadow = !isSoftwareGl;
  warehouse.add(foundation);

  // 2. Main Distribution Hangar with Skylights
  const main = new THREE.Mesh(new THREE.BoxGeometry(9.6, 4.4, 6.8), palette.corrugatedMetal);
  main.position.set(0, 2.45, -1.2);
  main.castShadow = !isSoftwareGl;
  warehouse.add(main);

  // 3. 4 Raised Loading Dock Bays with Roll-Up Doors & Rubber Bumpers
  for (let b = -3; b <= 3; b += 2.0) {
    // Roll-up door
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.4, 0.15), palette.industrialSteel);
    door.position.set(b, 1.65, 2.22);
    warehouse.add(door);

    // Dock rubber bumper pad
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.22, 0.25), palette.tireRubber);
    bumper.position.set(b, 0.35, 2.3);
    warehouse.add(bumper);

    // Dock Bay Number Plate
    const numPlate = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.05), palette.amberIndicator);
    numPlate.position.set(b, 3.05, 2.22);
    warehouse.add(numPlate);
  }

  // 4. Stacked Intermodal Shipping Containers in Yard (Maersk Blue, Evergreen Green, Gold)
  const containerColors = [palette.curtainGlass, palette.foliageGreen, palette.imperialGold];

  const containerStacks = [
    { x: -3.8, y: 0.6, z: 3.4, rot: 0, col: 0 },
    { x: -3.8, y: 1.5, z: 3.4, rot: 0, col: 1 },
    { x: 3.8, y: 0.6, z: 3.4, rot: 0.08, col: 2 },
  ];

  containerStacks.forEach((c) => {
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.9, 2.6), containerColors[c.col]);
    box.position.set(c.x, c.y + 0.45, c.z);
    box.rotation.y = c.rot;
    box.castShadow = !isSoftwareGl;
    warehouse.add(box);
  });

  // 5. Heavy Floodlight Mast
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 6.2, 8), palette.industrialSteel);
  mast.position.set(4.8, 3.1, -4.0);
  warehouse.add(mast);

  const floodlight = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.3), palette.carHeadlight);
  floodlight.position.set(4.8, 6.1, -3.9);
  warehouse.add(floodlight);

  return warehouse;
}

/**
 * 10. PRESTIGE REGIONAL CORPORATE BRANCH
 */
export function buildBranchMesh(palette: CityMaterialPalette, isSoftwareGl: boolean): THREE.Group {
  const branch = new THREE.Group();

  // 1. Paved Plaza Base with Gold Trim
  const base = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.35, 8.5), palette.plazaPaver);
  base.position.y = 0.175;
  base.receiveShadow = !isSoftwareGl;
  branch.add(base);

  // 2. 5-Story Corporate Glass Cube with Vertical Bronze Sun Louvers
  const towerH = 5.8;
  const tower = new THREE.Mesh(new THREE.BoxGeometry(6.4, towerH, 6.4), palette.curtainGlass);
  tower.position.y = 0.35 + towerH / 2;
  tower.castShadow = !isSoftwareGl;
  branch.add(tower);

  // Vertical Architectural Louvers on Facade
  for (let l = -2.6; l <= 2.6; l += 0.85) {
    const louver = new THREE.Mesh(new THREE.BoxGeometry(0.12, towerH, 0.35), palette.imperialGold);
    louver.position.set(l, 0.35 + towerH / 2, 3.3);
    branch.add(louver);
  }

  // 3. Executive Rooftop Terrace Garden with Timber Pergola
  const roofTerrace = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.35, 6.6), palette.navyStructure);
  roofTerrace.position.y = 6.25;
  branch.add(roofTerrace);

  const pergola = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.4, 2.6), palette.copperAccent);
  pergola.position.set(0, 7.1, 0);
  branch.add(pergola);

  // Rooftop Shrub Planters
  [-2.2, 2.2].forEach((rx) => {
    const shrub = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), palette.foliageGreen);
    shrub.position.set(rx, 6.7, -2.2);
    branch.add(shrub);
  });

  // 4. Illuminated Corporate Brand Totem Pylon
  const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.8, 0.25), palette.imperialGold);
  pylon.position.set(-3.2, 1.4, 3.4);
  branch.add(pylon);

  const pylonLogo = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 12), palette.neonCyan);
  pylonLogo.rotation.x = Math.PI / 2;
  pylonLogo.position.set(-3.2, 2.3, 3.54);
  branch.add(pylonLogo);

  return branch;
}

/**
 * 11. SILICON OASIS TECH INNOVATION HUB
 */
export function buildTechHubMesh(palette: CityMaterialPalette, isSoftwareGl: boolean): THREE.Group {
  const hub = new THREE.Group();

  // 1. Cybernetic Ground Base with Cyan LED Grid Lines
  const base = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.35, 9.5), palette.navyStructure);
  base.position.y = 0.175;
  hub.add(base);

  const neonPerimeter = new THREE.Mesh(new THREE.BoxGeometry(9.7, 0.08, 9.7), palette.neonCyan);
  neonPerimeter.position.y = 0.08;
  hub.add(neonPerimeter);

  // 2. Asymmetric Twin Tech Towers connected by Aerial Skybridge
  const tower1 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 6.8, 4.2), palette.curtainGlass);
  tower1.position.set(-2.0, 3.75, 0);
  tower1.castShadow = !isSoftwareGl;
  hub.add(tower1);

  const tower2 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 5.4, 3.6), palette.curtainGlass);
  tower2.position.set(2.4, 3.05, 0);
  tower2.castShadow = !isSoftwareGl;
  hub.add(tower2);

  // Connecting Aerial Glass Skybridge
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.2, 1.6), palette.neonCyan);
  bridge.position.set(0.2, 4.4, 0);
  hub.add(bridge);

  // 3. Rooftop Parabolic Satellite Communications Array
  const dish = new THREE.Mesh(
    new THREE.SphereGeometry(1.1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 3),
    palette.whiteMarble
  );
  dish.rotation.x = -Math.PI / 3;
  dish.position.set(-2.0, 7.8, 0);
  hub.add(dish);

  const dishAntenna = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6), palette.chromeMetal);
  dishAntenna.position.set(-2.0, 8.4, 0.3);
  hub.add(dishAntenna);

  // 4. Glowing Holographic Disc hovering between towers
  const holoRing = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.1, 12, 24), palette.neonPurple);
  holoRing.rotation.x = Math.PI / 2;
  holoRing.position.set(0.2, 6.2, 0);
  hub.add(holoRing);

  return hub;
}

/**
 * 12. HIGH-TECH BIO-AGRO & FOOD PRODUCTION FACILITY
 */
export function buildAgroFarmMesh(palette: CityMaterialPalette, isSoftwareGl: boolean): THREE.Group {
  const farm = new THREE.Group();

  // 1. Manicured Soil & Crop Base
  const base = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.35, 9.5), palette.grassLawn);
  base.position.y = 0.175;
  base.receiveShadow = !isSoftwareGl;
  farm.add(base);

  // 2. Triple Barrel-Vaulted Hydroponic Greenhouses with Translucent Glass
  [-2.6, 0, 2.6].forEach((gx) => {
    const greenhouse = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.2, 5.8, 16, 1, false, 0, Math.PI),
      palette.curtainGlass
    );
    greenhouse.rotation.z = Math.PI / 2;
    greenhouse.rotation.y = Math.PI / 2;
    greenhouse.position.set(gx, 1.2, 0.8);
    greenhouse.castShadow = !isSoftwareGl;
    farm.add(greenhouse);

    // Interior Crop Rows visible through glass
    const crop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 5.2), palette.foliageGreen);
    crop.position.set(gx, 0.55, 0.8);
    farm.add(crop);
  });

  // 3. Fermentation Silos
  const silo = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 4.6, 14), palette.chromeMetal);
  silo.position.set(3.4, 2.6, -2.8);
  silo.castShadow = !isSoftwareGl;
  farm.add(silo);

  const siloCone = new THREE.Mesh(new THREE.ConeGeometry(1.15, 0.7, 14), palette.copperAccent);
  siloCone.position.set(3.4, 5.2, -2.8);
  farm.add(siloCone);

  // 4. Clean Energy Micro Wind Turbine with 3 Aerodynamic Blades
  const turbineTower = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 6.4, 8), palette.whiteMarble);
  turbineTower.position.set(-3.6, 3.5, -2.8);
  farm.add(turbineTower);

  const nacelle = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.35, 0.8), palette.whiteMarble);
  nacelle.position.set(-3.6, 6.7, -2.8);
  farm.add(nacelle);

  for (let b = 0; b < 3; b++) {
    const bladeAngle = (b * Math.PI * 2) / 3;
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.8, 0.04), palette.whiteMarble);
    blade.position.set(
      -3.6 + Math.cos(bladeAngle) * 0.9,
      6.7 + Math.sin(bladeAngle) * 0.9,
      -2.35
    );
    blade.rotation.z = bladeAngle;
    farm.add(blade);
  }

  return farm;
}
