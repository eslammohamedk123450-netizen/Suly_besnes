/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import type { CityMaterialPalette } from './cityMaterials';
import type { VisualConstructionStage, CityFacilityCategory } from './cityWorldData';

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
 * Empty Plot Builder (أرض فضاء مجهزة للبيع أو غير مملوكة)
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

  // 1. Foundation slab with subtle bevel
  const slabGeo = new THREE.BoxGeometry(width - 0.4, 0.25, depth - 0.4);
  const slab = new THREE.Mesh(slabGeo, palette.sidewalk);
  slab.position.y = 0.125;
  slab.receiveShadow = !isSoftwareGl;
  group.add(slab);

  // 2. Corner boundary markers
  const halfW = (width - 0.8) / 2;
  const halfD = (depth - 0.8) / 2;
  const cornerPositions = [
    [-halfW, -halfD],
    [halfW, -halfD],
    [-halfW, halfD],
    [halfW, halfD],
  ];

  cornerPositions.forEach(([cx, cz]) => {
    // Marker post
    const postGeo = new THREE.BoxGeometry(0.2, 0.8, 0.2);
    const post = new THREE.Mesh(postGeo, palette.curbGold);
    post.position.set(cx, 0.5, cz);
    group.add(post);

    // Glowing corner beacon
    const beaconGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const beacon = new THREE.Mesh(
      beaconGeo,
      status === 'locked' ? palette.plotSignLocked : palette.plotHoloRing
    );
    beacon.position.set(cx, 0.95, cz);
    group.add(beacon);
  });

  // 3. Central For Sale / Status Stand
  const standGroup = new THREE.Group();
  standGroup.position.set(0, 0.25, 0);

  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.0, 8), palette.industrialSteel);
  post.position.y = 1.0;
  standGroup.add(post);

  // Status board
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 1.2, 0.12),
    status === 'locked' ? palette.plotSignLocked : palette.plotSignBoard
  );
  board.position.y = 2.0;
  standGroup.add(board);

  // Gold frame around board
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.3, 0.08), palette.imperialGold);
  frame.position.y = 2.0;
  standGroup.add(frame);

  // Rotating ground halo
  const haloGeo = new THREE.RingGeometry(1.6, 1.9, 16);
  const halo = new THREE.Mesh(
    haloGeo,
    status === 'locked' ? palette.plotSignLocked : palette.plotHoloRing
  );
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = 0.28;
  group.add(halo);

  group.add(standGroup);
  return group;
}

/**
 * Paperwork & Land Survey Stage (مرحلة التخطيط والمسح الهندسي)
 */
export function buildPaperworkSurveyMesh(
  width: number,
  depth: number,
  palette: CityMaterialPalette,
  isSoftwareGl: boolean
): THREE.Group {
  const group = new THREE.Group();

  // 1. Plot ground
  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(width - 0.4, 0.25, depth - 0.4),
    palette.sidewalk
  );
  slab.position.y = 0.125;
  group.add(slab);

  // 2. Surveyor Tripod & Theodolite
  const tripodGroup = new THREE.Group();
  tripodGroup.position.set(0, 0.25, 0);

  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6),
      palette.constructionYellow
    );
    leg.position.set(Math.cos(angle) * 0.4, 0.8, Math.sin(angle) * 0.4);
    leg.rotation.z = Math.cos(angle) * 0.25;
    leg.rotation.x = -Math.sin(angle) * 0.25;
    tripodGroup.add(leg);
  }

  // Theodolite head
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 0.3), palette.safetyOrange);
  head.position.y = 1.65;
  tripodGroup.add(head);

  const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.45, 8), palette.imperialGold);
  scope.rotation.x = Math.PI / 2;
  scope.position.set(0, 1.75, 0);
  tripodGroup.add(scope);
  group.add(tripodGroup);

  // 3. Blueprint Planning Table
  const deskGroup = new THREE.Group();
  deskGroup.position.set(2.2, 0.25, 1.5);
  const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 1.0), palette.slateStructure);
  tableTop.position.y = 1.0;
  deskGroup.add(tableTop);

  const blueprint = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.02, 0.8), palette.plotSignPaperwork);
  blueprint.position.y = 1.06;
  deskGroup.add(blueprint);

  const legGeo = new THREE.BoxGeometry(0.08, 1.0, 0.08);
  [-0.65, 0.65].forEach((lx) => {
    [-0.35, 0.35].forEach((lz) => {
      const leg = new THREE.Mesh(legGeo, palette.industrialSteel);
      leg.position.set(lx, 0.5, lz);
      deskGroup.add(leg);
    });
  });
  group.add(deskGroup);

  // 4. Perimeter Caution Tape Posts
  const halfW = (width - 1.2) / 2;
  const halfD = (depth - 1.2) / 2;
  [-halfW, halfW].forEach((px) => {
    [-halfD, halfD].forEach((pz) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 6), palette.safetyOrange);
      post.position.set(px, 0.7, pz);
      group.add(post);
    });
  });

  return group;
}

/**
 * Site Clearing & Earth Excavation Stage (مرحلة تمهيد الأرض والحفر)
 */
export function buildSiteClearingMesh(
  width: number,
  depth: number,
  palette: CityMaterialPalette,
  isSoftwareGl: boolean
): THREE.Group {
  const group = new THREE.Group();

  // 1. Excavated Earth base
  const earthSlab = new THREE.Mesh(
    new THREE.BoxGeometry(width - 0.4, 0.35, depth - 0.4),
    palette.dirtExcavation
  );
  earthSlab.position.y = 0.175;
  group.add(earthSlab);

  // 2. Dirt Mounds
  const mound1 = new THREE.Mesh(new THREE.ConeGeometry(2.0, 1.2, 8), palette.dirtExcavation);
  mound1.position.set(-2.2, 0.8, 1.8);
  group.add(mound1);

  const mound2 = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.9, 7), palette.dirtExcavation);
  mound2.position.set(2.4, 0.65, -1.8);
  group.add(mound2);

  // 3. Compact Bulldozer / Earthmover Vehicle
  const dozerGroup = new THREE.Group();
  dozerGroup.position.set(0.5, 0.35, 0);

  // Treads
  const treadMat = palette.slateStructure;
  [-0.6, 0.6].forEach((tz) => {
    const tread = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 0.35), treadMat);
    tread.position.set(0, 0.2, tz);
    dozerGroup.add(tread);
  });

  // Body chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 1.1), palette.constructionYellow);
  chassis.position.set(0, 0.5, 0);
  dozerGroup.add(chassis);

  // Operator Cabin
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.8), palette.navyStructure);
  cab.position.set(-0.2, 1.05, 0);
  dozerGroup.add(cab);

  // Front Blade
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.65, 1.6), palette.craneSteel);
  blade.position.set(1.15, 0.35, 0);
  dozerGroup.add(blade);

  group.add(dozerGroup);

  // 4. Perimeter Safety Barrels
  const barrelPositions = [
    [-width / 2.5, depth / 2.6],
    [width / 2.5, depth / 2.6],
    [-width / 2.5, -depth / 2.6],
    [width / 2.5, -depth / 2.6],
  ];

  barrelPositions.forEach(([bx, bz]) => {
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.85, 8),
      palette.constructionCaution
    );
    barrel.position.set(bx, 0.6, bz);
    group.add(barrel);
  });

  return group;
}

/**
 * Active Structural Construction Stage (مرحلة الهيكل والرافعة البرجية والسقالات)
 */
export function buildActiveConstructionMesh(
  width: number,
  depth: number,
  palette: CityMaterialPalette,
  isSoftwareGl: boolean
): THREE.Group {
  const group = new THREE.Group();

  // 1. Concrete foundation slab
  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(width - 0.4, 0.35, depth - 0.4),
    palette.slateStructure
  );
  slab.position.y = 0.175;
  group.add(slab);

  // 2. Concrete core rising in the center
  const core = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.45, 4.2, depth * 0.45),
    palette.slateStructure
  );
  core.position.set(-0.5, 2.3, 0);
  core.castShadow = !isSoftwareGl;
  group.add(core);

  // Rebar columns protruding from top of core
  [-1.2, 0, 1.2].forEach((rx) => {
    [-1.2, 1.2].forEach((rz) => {
      const rebar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 1.2, 4),
        palette.craneSteel
      );
      rebar.position.set(-0.5 + rx, 4.8, rz);
      group.add(rebar);
    });
  });

  // 3. Scaffolding wireframe structure around the core
  const scaffold = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.65, 5.2, depth * 0.65),
    palette.scaffoldingWire
  );
  scaffold.position.set(-0.5, 2.8, 0);
  group.add(scaffold);

  // 4. Yellow Tower Crane with warning light
  const craneGroup = new THREE.Group();
  craneGroup.position.set(width * 0.32, 0.35, -depth * 0.32);

  // Mast (tower)
  const mast = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 9.5, 0.7),
    palette.constructionYellow
  );
  mast.position.y = 4.75;
  mast.castShadow = !isSoftwareGl;
  craneGroup.add(mast);

  // Cabin
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), palette.safetyOrange);
  cab.position.set(0.1, 9.6, 0);
  craneGroup.add(cab);

  // Horizontal Boom (Jib)
  const boom = new THREE.Mesh(
    new THREE.BoxGeometry(7.5, 0.45, 0.45),
    palette.constructionYellow
  );
  boom.position.set(2.0, 10.2, 0);
  craneGroup.add(boom);

  // Counterweight
  const counterweight = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.7, 0.6),
    palette.slateStructure
  );
  counterweight.position.set(-1.8, 10.2, 0);
  craneGroup.add(counterweight);

  // Red aviation warning strobe at crane apex
  const beacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 8, 8),
    palette.carTaillight
  );
  beacon.position.set(0, 10.7, 0);
  craneGroup.add(beacon);

  group.add(craneGroup);

  // 5. Pallets of construction supplies
  const pallet1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 1.2), palette.craneSteel);
  pallet1.position.set(-2.5, 0.7, 2.8);
  group.add(pallet1);

  const pallet2 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 1.4), palette.brushedGold);
  pallet2.position.set(-0.8, 0.6, 3.2);
  group.add(pallet2);

  return group;
}

/**
 * -------------------------------------------------------------
 * COMPLETED FACILITIES PROCEDURAL MODELS (3-12 parts)
 * -------------------------------------------------------------
 */

/**
 * IMPERIAL HEADQUARTERS (المقر الإمبراطوري) - Scales with HQ Level (1 to 5)
 */
export function buildHQMesh(
  level: number,
  palette: CityMaterialPalette,
  isSoftwareGl: boolean
): THREE.Group {
  const hq = new THREE.Group();

  // Part 1: Wide podium with grand plaza
  const podium = new THREE.Mesh(
    new THREE.BoxGeometry(11, 1.4, 11),
    palette.navyStructure
  );
  podium.position.y = 0.7;
  podium.castShadow = !isSoftwareGl;
  podium.receiveShadow = !isSoftwareGl;
  hq.add(podium);

  // Part 2: Gold perimeter trim
  const trim = new THREE.Mesh(
    new THREE.BoxGeometry(11.6, 0.25, 11.6),
    palette.imperialGold
  );
  trim.position.y = 1.45;
  hq.add(trim);

  // Part 3: Grand gold entryway portico
  const entrance = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 2.2, 1.2),
    palette.imperialGold
  );
  entrance.position.set(0, 1.6, 5.6);
  hq.add(entrance);

  // Level-specific skyscraper structure
  if (level <= 1) {
    // Level 1: Founding Pavilion (3 tiers)
    const tower1 = new THREE.Mesh(
      new THREE.BoxGeometry(7.5, 7.5, 7.5),
      palette.curtainGlass
    );
    tower1.position.y = 5.2;
    tower1.castShadow = !isSoftwareGl;
    hq.add(tower1);

    const roofDeck = new THREE.Mesh(
      new THREE.BoxGeometry(8.0, 0.4, 8.0),
      palette.imperialGold
    );
    roofDeck.position.y = 9.1;
    hq.add(roofDeck);

    const spire = new THREE.Mesh(
      new THREE.ConeGeometry(0.35, 3.0, 8),
      palette.imperialGold
    );
    spire.position.y = 10.7;
    hq.add(spire);
  } else if (level === 2) {
    // Level 2: Executive Operations Tower (4 tiers)
    const tier1 = new THREE.Mesh(new THREE.BoxGeometry(7.8, 8, 7.8), palette.curtainGlass);
    tier1.position.y = 5.4;
    hq.add(tier1);

    const band1 = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.4, 8.2), palette.imperialGold);
    band1.position.y = 9.5;
    hq.add(band1);

    const tier2 = new THREE.Mesh(new THREE.BoxGeometry(6.0, 6, 6.0), palette.curtainGlass);
    tier2.position.y = 12.6;
    hq.add(tier2);

    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.4, 4.0, 8), palette.imperialGold);
    spire.position.y = 17.6;
    hq.add(spire);
  } else if (level === 3) {
    // Level 3: Stepped Corporate Megatower
    const tier1 = new THREE.Mesh(new THREE.BoxGeometry(8, 9, 8), palette.curtainGlass);
    tier1.position.y = 6.0;
    hq.add(tier1);

    const skybridge = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.6, 8.6), palette.imperialGold);
    skybridge.position.y = 10.7;
    hq.add(skybridge);

    const tier2 = new THREE.Mesh(new THREE.BoxGeometry(6.2, 8, 6.2), palette.litGlassNight);
    tier2.position.y = 14.8;
    hq.add(tier2);

    const tier3 = new THREE.Mesh(new THREE.BoxGeometry(4.4, 5, 4.4), palette.curtainGlass);
    tier3.position.y = 21.4;
    hq.add(tier3);

    const crown = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.8, 1.5, 8), palette.imperialGold);
    crown.position.y = 24.6;
    hq.add(crown);

    const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.25, 5, 8), palette.imperialGold);
    needle.position.y = 27.6;
    hq.add(needle);
  } else if (level === 4) {
    // Level 4: Global Financial Skyscraper
    const tier1 = new THREE.Mesh(new THREE.BoxGeometry(8.2, 10, 8.2), palette.curtainGlass);
    tier1.position.y = 6.5;
    hq.add(tier1);

    const tier2 = new THREE.Mesh(new THREE.BoxGeometry(6.6, 9, 6.6), palette.litGlassNight);
    tier2.position.y = 16.1;
    hq.add(tier2);

    const tier3 = new THREE.Mesh(new THREE.BoxGeometry(4.8, 8, 4.8), palette.curtainGlass);
    tier3.position.y = 24.7;
    hq.add(tier3);

    // Helipad
    const helipad = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.3, 16), palette.slateStructure);
    helipad.position.y = 28.9;
    hq.add(helipad);

    const helipadRing = new THREE.Mesh(new THREE.RingGeometry(1.6, 1.9, 16), palette.imperialGold);
    helipadRing.rotation.x = -Math.PI / 2;
    helipadRing.position.y = 29.06;
    hq.add(helipadRing);

    const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.25, 7, 8), palette.imperialGold);
    needle.position.y = 32.8;
    hq.add(needle);
  } else {
    // Level 5: Sovereign Imperial Monolith (Apex)
    const tier1 = new THREE.Mesh(new THREE.BoxGeometry(8.6, 12, 8.6), palette.curtainGlass);
    tier1.position.y = 7.5;
    hq.add(tier1);

    const goldRibbon1 = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.6, 9.2), palette.imperialGold);
    goldRibbon1.position.y = 13.7;
    hq.add(goldRibbon1);

    const tier2 = new THREE.Mesh(new THREE.BoxGeometry(7.0, 11, 7.0), palette.litGlassNight);
    tier2.position.y = 19.3;
    hq.add(tier2);

    const goldRibbon2 = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.6, 7.6), palette.imperialGold);
    goldRibbon2.position.y = 25.0;
    hq.add(goldRibbon2);

    const tier3 = new THREE.Mesh(new THREE.BoxGeometry(5.2, 9, 5.2), palette.curtainGlass);
    tier3.position.y = 29.7;
    hq.add(tier3);

    // Sovereign Crown & Helipad
    const helipad = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.35, 16), palette.navyStructure);
    helipad.position.y = 34.4;
    hq.add(helipad);

    const helipadHolo = new THREE.Mesh(new THREE.RingGeometry(1.8, 2.2, 16), palette.imperialGold);
    helipadHolo.rotation.x = -Math.PI / 2;
    helipadHolo.position.y = 34.6;
    hq.add(helipadHolo);

    // Floating Sovereign Ring
    const sovereignRing = new THREE.Mesh(
      new THREE.TorusGeometry(3.6, 0.25, 12, 24),
      palette.imperialGold
    );
    sovereignRing.rotation.x = Math.PI / 2;
    sovereignRing.position.y = 36.2;
    hq.add(sovereignRing);

    const supremeSpire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.35, 9, 8),
      palette.imperialGold
    );
    supremeSpire.position.y = 39.5;
    hq.add(supremeSpire);
  }

  return hq;
}

/**
 * CENTRAL SOVEREIGN BANK (البنك المركزي والمؤسسة المالية)
 * Classical Neoclassical architecture: grand stairs, columns, pediment, dome
 */
export function buildBankMesh(
  palette: CityMaterialPalette,
  isSoftwareGl: boolean
): THREE.Group {
  const bank = new THREE.Group();

  // Part 1: Stepped marble podium
  const step1 = new THREE.Mesh(new THREE.BoxGeometry(11, 0.6, 9), palette.whiteMarble);
  step1.position.y = 0.3;
  bank.add(step1);

  const step2 = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.5, 8.2), palette.whiteMarble);
  step2.position.y = 0.8;
  bank.add(step2);

  // Part 2: Main Bank Treasury Hall
  const hall = new THREE.Mesh(new THREE.BoxGeometry(9.2, 4.2, 7.2), palette.navyStructure);
  hall.position.y = 3.1;
  hall.castShadow = !isSoftwareGl;
  bank.add(hall);

  // Part 3: Classical Corinthian/Ionic Columns (6 gold columns along front)
  const colGeo = new THREE.CylinderGeometry(0.24, 0.28, 4.0, 10);
  const colPositions = [-3.6, -2.2, -0.8, 0.8, 2.2, 3.6];
  colPositions.forEach((cx) => {
    const col = new THREE.Mesh(colGeo, palette.imperialGold);
    col.position.set(cx, 3.0, 3.75);
    col.castShadow = !isSoftwareGl;
    bank.add(col);
  });

  // Part 4: Classical Entablature beam over columns
  const beam = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.5, 1.4), palette.whiteMarble);
  beam.position.set(0, 5.25, 3.75);
  bank.add(beam);

  // Part 5: Triangular Gold Pediment
  const pediment = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 5.0, 1.8, 3), palette.imperialGold);
  pediment.rotation.z = Math.PI;
  pediment.rotation.y = Math.PI / 2;
  pediment.position.set(0, 6.2, 3.75);
  bank.add(pediment);

  // Part 6: Classical Neoclassical Dome with gold finial
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(2.4, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    palette.copperAccent
  );
  dome.position.set(0, 5.2, 0);
  bank.add(dome);

  const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.4, 8), palette.imperialGold);
  finial.position.set(0, 7.8, 0);
  bank.add(finial);

  return bank;
}

/**
 * FACTORY & INDUSTRIAL COMPLEX (المجمع الصناعي ومحطات الإنتاج)
 */
export function buildFactoryMesh(
  palette: CityMaterialPalette,
  isSoftwareGl: boolean
): { group: THREE.Group; smokePositions: THREE.Vector3[] } {
  const factory = new THREE.Group();
  const smokePositions: THREE.Vector3[] = [];

  // Part 1: Concrete industrial foundation
  const base = new THREE.Mesh(new THREE.BoxGeometry(11, 0.6, 9.5), palette.slateStructure);
  base.position.y = 0.3;
  factory.add(base);

  // Part 2: Main Heavy Production Hall with sawtooth roof
  const hall = new THREE.Mesh(new THREE.BoxGeometry(6.5, 4.2, 8.2), palette.industrialSteel);
  hall.position.set(-1.8, 2.5, 0);
  hall.castShadow = !isSoftwareGl;
  factory.add(hall);

  // Sawtooth roof wedges
  [-2.5, 0, 2.5].forEach((rz) => {
    const roofSection = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 1.3, 6.4, 3),
      palette.corrugatedMetal
    );
    roofSection.rotation.z = Math.PI / 2;
    roofSection.position.set(-1.8, 5.1, rz);
    factory.add(roofSection);
  });

  // Part 3: Dual Exhaust Smokestacks
  const stackGeo = new THREE.CylinderGeometry(0.45, 0.65, 7.0, 12);
  [-1.2, 1.2].forEach((sx) => {
    const stack = new THREE.Mesh(stackGeo, palette.industrialBrick);
    stack.position.set(-3.2 + sx, 5.5, -2.8);
    stack.castShadow = !isSoftwareGl;
    factory.add(stack);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.1, 8, 12), palette.imperialGold);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(-3.2 + sx, 9.0, -2.8);
    factory.add(rim);

    // Save smoke emitter position in world coords relative to factory
    smokePositions.push(new THREE.Vector3(-3.2 + sx, 9.2, -2.8));
  });

  // Part 4: Spherical Petrochemical Pressure Tank with support legs
  const sphereTank = new THREE.Mesh(
    new THREE.SphereGeometry(1.6, 12, 10),
    palette.curbGold
  );
  sphereTank.position.set(3.2, 2.8, 1.6);
  sphereTank.castShadow = !isSoftwareGl;
  factory.add(sphereTank);

  // Tank support ring
  const tankLegs = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.6, 2.2, 6, 1, true),
    palette.industrialSteel
  );
  tankLegs.position.set(3.2, 1.3, 1.6);
  factory.add(tankLegs);

  // Part 5: Secondary Warehouse bay with roll-up dock
  const bay = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.2, 4.0), palette.slateStructure);
  bay.position.set(3.2, 2.0, -2.2);
  factory.add(bay);

  const rollUpDoor = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.2, 2.4), palette.corrugatedMetal);
  rollUpDoor.position.set(4.96, 1.5, -2.2);
  factory.add(rollUpDoor);

  return { group: factory, smokePositions };
}

/**
 * RETAIL MEGAMALL & COMMERCIAL STORES (المتاجر والمولات التجارية)
 */
export function buildStoreMesh(
  palette: CityMaterialPalette,
  isSoftwareGl: boolean
): THREE.Group {
  const store = new THREE.Group();

  // Part 1: Wide shopping plaza foundation
  const base = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.4, 9), palette.sidewalk);
  base.position.y = 0.2;
  store.add(base);

  // Part 2: Main curved / modern shopping pavilion
  const main = new THREE.Mesh(new THREE.BoxGeometry(8.5, 4.0, 6.5), palette.navyStructure);
  main.position.set(0, 2.3, -0.6);
  main.castShadow = !isSoftwareGl;
  store.add(main);

  // Part 3: Illuminated glass front show window
  const windowFront = new THREE.Mesh(new THREE.BoxGeometry(7.8, 2.4, 0.2), palette.litGlassNight);
  windowFront.position.set(0, 1.7, 2.66);
  store.add(windowFront);

  // Part 4: Cantilevered Gold Marquee Canopy
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.35, 2.2), palette.imperialGold);
  canopy.position.set(0, 3.2, 3.4);
  store.add(canopy);

  // Part 5: Commercial marquee billboard on roof
  const billboard = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.6, 0.2), palette.imperialGold);
  billboard.position.set(0, 5.2, -0.6);
  store.add(billboard);

  return store;
}

/**
 * WAREHOUSE & LOGISTICS HUB (المستودعات ومراكز الشحن وسلاسل الإمداد)
 */
export function buildWarehouseMesh(
  palette: CityMaterialPalette,
  isSoftwareGl: boolean
): THREE.Group {
  const wh = new THREE.Group();

  // Part 1: Concrete apron
  const base = new THREE.Mesh(new THREE.BoxGeometry(11, 0.4, 9), palette.slateStructure);
  base.position.y = 0.2;
  wh.add(base);

  // Part 2: High-bay warehouse shed
  const shed = new THREE.Mesh(new THREE.BoxGeometry(9.2, 4.4, 6.8), palette.corrugatedMetal);
  shed.position.set(0, 2.5, -0.6);
  shed.castShadow = !isSoftwareGl;
  wh.add(shed);

  // Part 3: Roof monitor vents
  const vent = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.6, 1.8), palette.industrialSteel);
  vent.position.set(0, 4.9, -0.6);
  wh.add(vent);

  // Part 4: Dual Loading Docks
  [-2.2, 2.2].forEach((dx) => {
    const dockDoor = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.5, 0.15), palette.slateStructure);
    dockDoor.position.set(dx, 1.6, 2.8);
    wh.add(dockDoor);

    const bumper = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 0.4), palette.curbGold);
    bumper.position.set(dx, 0.45, 2.95);
    wh.add(bumper);
  });

  // Part 5: Stacked ISO Cargo Containers (Blue, Red, Gold)
  const c1 = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.2, 1.2), palette.curtainGlass);
  c1.position.set(-3.2, 0.8, 3.6);
  wh.add(c1);

  const c2 = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.2, 1.2), palette.imperialGold);
  c2.position.set(-3.2, 2.0, 3.6);
  wh.add(c2);

  return wh;
}

/**
 * REGIONAL BRANCH OFFICE (الفروع والمكاتب الإقليمية)
 */
export function buildBranchMesh(
  palette: CityMaterialPalette,
  isSoftwareGl: boolean
): THREE.Group {
  const branch = new THREE.Group();

  // Part 1: Base plinth
  const base = new THREE.Mesh(new THREE.BoxGeometry(9, 0.4, 8), palette.slateStructure);
  base.position.y = 0.2;
  branch.add(base);

  // Part 2: 4-story contemporary glass & steel office building
  const office = new THREE.Mesh(new THREE.BoxGeometry(7.2, 6.5, 6.2), palette.navyStructure);
  office.position.set(0, 3.6, 0);
  office.castShadow = !isSoftwareGl;
  branch.add(office);

  // Part 3: Exterior glass facade ribbons
  [2.2, 3.8, 5.4].forEach((fy) => {
    const glassRibbon = new THREE.Mesh(new THREE.BoxGeometry(7.35, 0.8, 6.35), palette.litGlassNight);
    glassRibbon.position.set(0, fy, 0);
    branch.add(glassRibbon);
  });

  // Part 4: Gold entrance canopy
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.25, 1.8), palette.imperialGold);
  canopy.position.set(0, 1.6, 3.8);
  branch.add(canopy);

  // Part 5: Rooftop communications antenna
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.0, 6), palette.imperialGold);
  antenna.position.set(2.2, 8.2, -1.8);
  branch.add(antenna);

  return branch;
}

/**
 * TECH & INNOVATION HUB (وادي التكنولوجيا والذكاء الاصطناعي)
 */
export function buildTechHubMesh(
  palette: CityMaterialPalette,
  isSoftwareGl: boolean
): THREE.Group {
  const tech = new THREE.Group();

  // Foundation
  const base = new THREE.Mesh(new THREE.BoxGeometry(10, 0.4, 9), palette.navyStructure);
  base.position.y = 0.2;
  tech.add(base);

  // Angular crystalline main hub
  const hub = new THREE.Mesh(new THREE.BoxGeometry(7.0, 5.5, 6.5), palette.curtainGlass);
  hub.position.set(0, 3.0, 0);
  hub.castShadow = !isSoftwareGl;
  tech.add(hub);

  // Glowing neon cyber-gold trim bands
  const band = new THREE.Mesh(new THREE.BoxGeometry(7.3, 0.3, 6.8), palette.imperialGold);
  band.position.set(0, 5.8, 0);
  tech.add(band);

  // Parabolic Satellite Dish
  const dish = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    palette.industrialSteel
  );
  dish.rotation.x = -Math.PI / 3;
  dish.position.set(-1.8, 6.8, -1.4);
  tech.add(dish);

  return tech;
}

/**
 * AGRICULTURAL & GREENHOUSE COMPLEX (الدفيئات والمجمعات الزراعية)
 */
export function buildAgroFarmMesh(
  palette: CityMaterialPalette,
  isSoftwareGl: boolean
): THREE.Group {
  const farm = new THREE.Group();

  // Base grass soil
  const base = new THREE.Mesh(new THREE.BoxGeometry(10, 0.35, 9), palette.foliageDarkGreen);
  base.position.y = 0.175;
  farm.add(base);

  // Translucent Arched Greenhouse
  const gh = new THREE.Mesh(
    new THREE.CylinderGeometry(2.4, 2.4, 5.5, 16, 1, false, 0, Math.PI),
    palette.curtainGlass
  );
  gh.rotation.z = Math.PI / 2;
  gh.position.set(-1.2, 1.8, 0);
  farm.add(gh);

  // Grain Storage Silo
  const silo = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 5.8, 16), palette.whiteMarble);
  silo.position.set(2.8, 3.1, 1.2);
  farm.add(silo);

  const dome = new THREE.Mesh(new THREE.SphereGeometry(1.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), palette.copperAccent);
  dome.position.set(2.8, 6.0, 1.2);
  farm.add(dome);

  return farm;
}
