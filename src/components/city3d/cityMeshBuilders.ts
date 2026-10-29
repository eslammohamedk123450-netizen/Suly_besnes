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

let bankNameplateMaterial: THREE.MeshBasicMaterial | null = null;

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
 * Creates the signature upward-curving golden horn/acroteria finial
 * seen at the four roof corners of every level in the reference design.
 */
function createCornerHornFinial(palette: CityMaterialPalette, scale = 1.0): THREE.Group {
  const finial = new THREE.Group();

  // Base plinth
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.35 * scale, 0.25 * scale, 0.35 * scale), palette.imperialGold);
  base.position.y = 0.125 * scale;
  finial.add(base);

  // Curved horn body curving up and out
  const hornGeo = new THREE.ConeGeometry(0.2 * scale, 1.1 * scale, 8);
  const horn = new THREE.Mesh(hornGeo, palette.imperialGold);
  horn.position.set(0.12 * scale, 0.7 * scale, 0.12 * scale);
  horn.rotation.z = -0.35;
  horn.rotation.x = 0.35;
  finial.add(horn);

  // Tip golden sphere ball
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.1 * scale, 8, 8), palette.imperialGold);
  tip.position.set(0.28 * scale, 1.25 * scale, 0.28 * scale);
  finial.add(tip);

  return finial;
}

/**
 * Creates the ornate Egyptian Sun-Disc Corona (قرص الشمس المجنح الذهبي)
 * with radiant sunburst rays, flanking horns, and perimeter lotus cresting.
 */
function createEgyptianSunCorona(
  roofW: number,
  roofD: number,
  palette: CityMaterialPalette,
  tier: 3 | 4 | 5
): THREE.Group {
  const corona = new THREE.Group();

  // 1. Perimeter golden crenellations / lotus acroteria balustrade around all 4 edges
  const finialSpacing = 0.9;
  const numX = Math.floor(roofW / finialSpacing);
  const numZ = Math.floor(roofD / finialSpacing);

  for (let ix = -numX / 2; ix <= numX / 2; ix++) {
    [-roofD / 2, roofD / 2].forEach((pz) => {
      const crenel = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.7, 4), palette.imperialGold);
      crenel.rotation.y = Math.PI / 4;
      crenel.position.set(ix * finialSpacing, 0.35, pz);
      corona.add(crenel);
    });
  }

  for (let iz = -numZ / 2; iz <= numZ / 2; iz++) {
    [-roofW / 2, roofW / 2].forEach((px) => {
      const crenel = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.7, 4), palette.imperialGold);
      crenel.rotation.y = Math.PI / 4;
      crenel.position.set(px, 0.35, iz * finialSpacing);
      corona.add(crenel);
    });
  }

  // 2. Corner Upward Horn Finials
  const halfW = roofW / 2;
  const halfD = roofD / 2;
  [
    [-halfW, -halfD, -1, -1],
    [halfW, -halfD, 1, -1],
    [-halfW, halfD, -1, 1],
    [halfW, halfD, 1, 1],
  ].forEach(([cx, cz, dirX, dirZ]) => {
    const cornerHorn = createCornerHornFinial(palette, tier === 5 ? 1.4 : tier === 4 ? 1.2 : 1.0);
    cornerHorn.position.set(cx, 0, cz);
    cornerHorn.rotation.y = Math.atan2(dirX, dirZ);
    corona.add(cornerHorn);
  });

  // 3. Central Golden Sun-Disc Monument with radiating sunburst rays
  const sunGroup = new THREE.Group();
  sunGroup.position.set(0, 0.4, 0);

  // Central Sun Orb
  const sunRadius = tier === 5 ? 1.3 : tier === 4 ? 1.1 : 0.9;
  const sunOrb = new THREE.Mesh(
    new THREE.SphereGeometry(sunRadius, 18, 18),
    palette.imperialGold
  );
  sunOrb.position.y = sunRadius + 0.3;
  sunGroup.add(sunOrb);

  // Concentric Golden Halo Ring
  const haloGeo = new THREE.RingGeometry(sunRadius * 1.3, sunRadius * 1.55, 32);
  const halo = new THREE.Mesh(haloGeo, palette.imperialGold);
  halo.position.y = sunRadius + 0.3;
  sunGroup.add(halo);

  // Radiant Golden Sunburst Rays
  const rayCount = tier === 5 ? 16 : 12;
  for (let r = 0; r < rayCount; r++) {
    const angle = (r * Math.PI * 2) / rayCount;
    const rayLength = (r % 2 === 0 ? 1.6 : 1.1) * (tier === 5 ? 1.3 : 1.0);
    const ray = new THREE.Mesh(new THREE.ConeGeometry(0.15, rayLength, 6), palette.imperialGold);
    ray.position.set(
      Math.cos(angle) * (sunRadius + rayLength / 2),
      sunRadius + 0.3 + Math.sin(angle) * (sunRadius + rayLength / 2),
      0
    );
    ray.rotation.z = angle - Math.PI / 2;
    sunGroup.add(ray);
  }

  // Flanking Royal Horns / Uraeus Wings
  [-1, 1].forEach((dir) => {
    const horn = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.35, 2.2, 8), palette.imperialGold);
    horn.rotation.z = dir * 0.7;
    horn.position.set(dir * (sunRadius + 1.2), sunRadius + 0.4, 0);
    sunGroup.add(horn);

    const tipBall = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), palette.imperialGold);
    tipBall.position.set(dir * (sunRadius + 2.0), sunRadius + 1.2, 0);
    sunGroup.add(tipBall);
  });

  corona.add(sunGroup);
  return corona;
}

/**
 * Returns the exact structural height of the HQ building for any level
 */
export function getHQHeight(level: number): number {
  switch (level) {
    case 1:
      return 6.5;
    case 2:
      return 19.5;
    case 3:
      return 30.5;
    case 4:
      return 40.5;
    case 5:
    default:
      return 51.5;
  }
}

/**
 * 5. IMPERIAL HEADQUARTERS TOWER (5 Levels of Grandeur)
 * Meticulously modeled to mirror the exact architectural progression:
 * Level 1: 2-story royal navy classical villa with columns, SULY sign, and corner horn finials.
 * Level 2: 8-story navy skyscraper with colonnade, corner bay windows, and SULY logo plate.
 * Level 3: 14-story grand skyscraper with Ankh relief piers and Egyptian sun-disc crown.
 * Level 4: 20-story opulent golden skyscraper with rich golden fluted mullions and dual sun-disc corona.
 * Level 5: 26+ story sovereign imperial skyscraper with supreme golden corona, uraeus horns, and illuminated ribbon glass.
 */
export function buildHQMesh(
  level: number,
  palette: CityMaterialPalette,
  isSoftwareGl: boolean
): THREE.Group {
  const hq = new THREE.Group();

  // Tier 0: Grand Marble Plaza with Gold Curbs
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

  // =========================================================================
  // LEVEL 1: Classical 2-Story Royal Navy Villa
  // =========================================================================
  if (level === 1) {
    const bW = 7.6;
    const bD = 7.6;
    const bH = 5.6;

    // Main Navy Stone Structure Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(bW, bH, bD), palette.royalNavyMat);
    body.position.y = 0.45 + bH / 2;
    body.castShadow = !isSoftwareGl;
    hq.add(body);

    // White marble foundation plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(bW + 0.4, 0.4, bD + 0.4), palette.whiteMarble);
    plinth.position.y = 0.65;
    hq.add(plinth);

    // Middle horizontal gold belt dividing 1st & 2nd floors
    const belt = new THREE.Mesh(new THREE.BoxGeometry(bW + 0.25, 0.2, bD + 0.25), palette.imperialGold);
    belt.position.y = 3.25;
    hq.add(belt);

    // Front Entrance Portico with twin fluted columns
    const portico = new THREE.Group();
    portico.position.set(0, 0.45, bD / 2);

    // Twin Marble Columns with gold capitals
    [-1.2, 1.2].forEach((cx) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 2.6, 12), palette.whiteMarble);
      col.position.set(cx, 1.3, 0.6);
      portico.add(col);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.18, 0.55), palette.imperialGold);
      cap.position.set(cx, 2.65, 0.6);
      portico.add(cap);
    });

    // Golden "SULY" Entablature Lintel Sign
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.65, 0.4), palette.sulyBrandMat);
    signBoard.position.set(0, 2.9, 0.6);
    portico.add(signBoard);

    // Double Glass Entrance Doors
    const door = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.2, 0.15), palette.warmAmberLitGlass);
    door.position.set(0, 1.1, 0.08);
    portico.add(door);

    hq.add(portico);

    // Symmetrical Framed Windows on 2 Floors
    const windowRows = [1.8, 4.4];
    windowRows.forEach((wy) => {
      // Front windows flanking entrance
      [-2.4, 2.4].forEach((wx) => {
        // Gold window frame
        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 0.15), palette.imperialGold);
        frame.position.set(wx, wy, bD / 2 + 0.06);
        hq.add(frame);

        // Glowing glass
        const glass = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.1, 0.16), palette.warmAmberLitGlass);
        glass.position.set(wx, wy, bD / 2 + 0.07);
        hq.add(glass);
      });

      // Side windows
      [-2.2, 2.2].forEach((wz) => {
        [-bW / 2 - 0.06, bW / 2 + 0.06].forEach((wx) => {
          const frame = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.4, 1.2), palette.imperialGold);
          frame.position.set(wx, wy, wz);
          hq.add(frame);

          const glass = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.1, 0.9), palette.warmAmberLitGlass);
          glass.position.set(wx, wy, wz);
          hq.add(glass);
        });
      });
    });

    // Rooftop Parapet with Golden Cornice
    const roofY = 0.45 + bH;
    const roofCornice = new THREE.Mesh(new THREE.BoxGeometry(bW + 0.35, 0.35, bD + 0.35), palette.imperialGold);
    roofCornice.position.y = roofY + 0.175;
    hq.add(roofCornice);

    const roofParapet = new THREE.Mesh(new THREE.BoxGeometry(bW, 0.5, bD), palette.royalNavyMat);
    roofParapet.position.y = roofY + 0.5;
    hq.add(roofParapet);

    // Flat Navy Roof Slab
    const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(bW - 0.6, 0.15, bD - 0.6), palette.royalNavyMat);
    roofSlab.position.y = roofY + 0.35;
    hq.add(roofSlab);

    // 4 Upward Curving Golden Corner Horn Finials (Exact match to reference photo!)
    const halfW = bW / 2;
    const halfD = bD / 2;
    [
      [-halfW, -halfD, -1, -1],
      [halfW, -halfD, 1, -1],
      [-halfW, halfD, -1, 1],
      [halfW, halfD, 1, 1],
    ].forEach(([cx, cz, dirX, dirZ]) => {
      const horn = createCornerHornFinial(palette, 1.0);
      horn.position.set(cx, roofY + 0.5, cz);
      horn.rotation.y = Math.atan2(dirX, dirZ);
      hq.add(horn);
    });

    return hq;
  }

  // =========================================================================
  // LEVELS 2 TO 5: Skyscraper Proportions with Distinct Upgrades
  // =========================================================================
  const tW = 8.2;
  const tD = 8.2;

  // Determine height and floor tiers by level
  let shaftHeight = 11.0; // Level 2: 8 floors (~18m total)
  if (level === 3) shaftHeight = 20.0; // Level 3: 14 floors (~28m total)
  if (level === 4) shaftHeight = 30.0; // Level 4: 20 floors (~38m total)
  if (level >= 5) shaftHeight = 40.0; // Level 5: 26+ floors (~49m total)

  // 1. Double-Height Grand Colonnade Base (Ground Floor)
  const baseH = 4.0;
  const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(tW + 0.8, baseH, tD + 0.8), palette.royalNavyMat);
  baseMesh.position.y = 0.45 + baseH / 2;
  baseMesh.castShadow = !isSoftwareGl;
  hq.add(baseMesh);

  // Corner Navy Piers with Golden Ankh Relief Panels
  const pierW = 1.6;
  [
    [-(tW / 2 + 0.3), -(tD / 2 + 0.3)],
    [(tW / 2 + 0.3), -(tD / 2 + 0.3)],
    [-(tW / 2 + 0.3), (tD / 2 + 0.3)],
    [(tW / 2 + 0.3), (tD / 2 + 0.3)],
  ].forEach(([px, pz]) => {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(pierW, baseH + 0.1, pierW), palette.royalNavyMat);
    pier.position.set(px, 0.45 + baseH / 2, pz);
    hq.add(pier);

    // Front/Side Golden Ankh Relief Plaque
    const ankhPlaque = new THREE.Mesh(new THREE.BoxGeometry(0.8, baseH - 0.6, 0.1), palette.ankhReliefMat);
    ankhPlaque.position.set(px, 0.45 + baseH / 2, pz + (pz > 0 ? pierW / 2 + 0.06 : -pierW / 2 - 0.06));
    hq.add(ankhPlaque);
  });

  // Base Colonnade Columns (Fluted White Marble with Gold Capitals, or all Gold for Level 4)
  const colMat = level === 4 ? palette.imperialGold : palette.whiteMarble;
  const colPositions = [-2.0, 0, 2.0];
  colPositions.forEach((cx) => {
    // Front colonnade columns
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, baseH - 0.4, 12), colMat);
    col.position.set(cx, 0.45 + (baseH - 0.4) / 2, tD / 2 + 0.45);
    hq.add(col);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.22, 0.65), palette.imperialGold);
    cap.position.set(cx, 0.45 + baseH - 0.3, tD / 2 + 0.45);
    hq.add(cap);

    // Rear colonnade columns
    const colRear = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, baseH - 0.4, 12), colMat);
    colRear.position.set(cx, 0.45 + (baseH - 0.4) / 2, -tD / 2 - 0.45);
    hq.add(colRear);
  });

  // Grand Golden Entrance Portal
  const portalDoor = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.0, 0.25), palette.warmAmberLitGlass);
  portalDoor.position.set(0, 0.45 + 1.5, tD / 2 + 0.4);
  hq.add(portalDoor);

  // Cantilevered Gilded Cornice dividing base from tower shaft
  const baseCornice = new THREE.Mesh(new THREE.BoxGeometry(tW + 1.2, 0.4, tD + 1.2), palette.imperialGold);
  baseCornice.position.y = 0.45 + baseH + 0.2;
  hq.add(baseCornice);

  // 2. Tower Shaft (Glass curtain walls with warm interior lighting)
  const shaftY = 0.45 + baseH + 0.4;
  const shaftMat = level === 4 ? palette.warmAmberLitGlass : palette.officeWindowsLit;
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(tW - 0.2, shaftHeight, tD - 0.2), shaftMat);
  shaft.position.y = shaftY + shaftHeight / 2;
  shaft.castShadow = !isSoftwareGl;
  hq.add(shaft);

  // Vertical Pier Columns (Royal Navy blue for 2, 3, 5; Brilliant Gold for Level 4)
  const pierMat = level === 4 ? palette.imperialGold : palette.royalNavyMat;
  const cornerCoords = [
    [-tW / 2 + 0.4, -tD / 2 + 0.4],
    [tW / 2 - 0.4, -tD / 2 + 0.4],
    [-tW / 2 + 0.4, tD / 2 - 0.4],
    [tW / 2 - 0.4, tD / 2 - 0.4],
  ];

  cornerCoords.forEach(([cx, cz]) => {
    const vPier = new THREE.Mesh(new THREE.BoxGeometry(1.2, shaftHeight, 1.2), pierMat);
    vPier.position.set(cx, shaftY + shaftHeight / 2, cz);
    vPier.castShadow = !isSoftwareGl;
    hq.add(vPier);

    // Continuous vertical Ankh Relief Rib on corner piers for levels 3, 4, 5
    if (level >= 3) {
      const ankhRib = new THREE.Mesh(new THREE.BoxGeometry(0.55, shaftHeight, 0.1), palette.ankhReliefMat);
      ankhRib.position.set(cx, shaftY + shaftHeight / 2, cz + (cz > 0 ? 0.65 : -0.65));
      hq.add(ankhRib);
    }
  });

  // Horizontal Floor Trims (Gilded spandrel beams across the facade)
  const floorHeight = 1.8;
  const numFloors = Math.floor(shaftHeight / floorHeight);
  for (let f = 1; f < numFloors; f++) {
    const fy = shaftY + f * floorHeight;
    const floorSpandrel = new THREE.Mesh(
      new THREE.BoxGeometry(tW + 0.05, 0.2, tD + 0.05),
      palette.imperialGold
    );
    floorSpandrel.position.y = fy;
    hq.add(floorSpandrel);
  }

  // 3. Iconic "SULY TECHNOLOGIES" Gilded Signboards with Winged Solar Disk
  const signHeights: number[] = [];
  if (level === 2) {
    signHeights.push(shaftY + shaftHeight - 2.2);
  } else if (level === 3) {
    signHeights.push(shaftY + shaftHeight * 0.45);
    signHeights.push(shaftY + shaftHeight - 2.5);
  } else if (level === 4) {
    signHeights.push(shaftY + shaftHeight * 0.35);
    signHeights.push(shaftY + shaftHeight * 0.7);
    signHeights.push(shaftY + shaftHeight - 2.6);
  } else {
    // Level 5
    signHeights.push(shaftY + shaftHeight * 0.3);
    signHeights.push(shaftY + shaftHeight * 0.6);
    signHeights.push(shaftY + shaftHeight - 2.8);
  }

  signHeights.forEach((sy) => {
    // Front brand plaque
    const signFront = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.8, 0.2), palette.sulyBrandMat);
    signFront.position.set(0, sy, tD / 2 + 0.02);
    hq.add(signFront);

    // Side brand plaque
    const signSide = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.8, 3.6), palette.sulyBrandMat);
    signSide.position.set(tW / 2 + 0.02, sy, 0);
    hq.add(signSide);
  });

  // Vertical Illuminated Edge Light Strips (Level 5 royal glow)
  if (level >= 5) {
    cornerCoords.forEach(([cx, cz]) => {
      const neonStrip = new THREE.Mesh(new THREE.BoxGeometry(0.12, shaftHeight, 0.12), palette.neonGold);
      neonStrip.position.set(cx + (cx > 0 ? 0.62 : -0.62), shaftY + shaftHeight / 2, cz + (cz > 0 ? 0.62 : -0.62));
      hq.add(neonStrip);
    });
  }

  // 4. Rooftop Structure & Iconic Crown
  const roofStartY = shaftY + shaftHeight;

  // Golden Main Roof Cornice
  const roofCornice = new THREE.Mesh(new THREE.BoxGeometry(tW + 0.6, 0.4, tD + 0.6), palette.imperialGold);
  roofCornice.position.y = roofStartY + 0.2;
  hq.add(roofCornice);

  // Setback Penthouse Deck
  const deckW = tW - 0.8;
  const deckD = tD - 0.8;
  const deckH = 1.4;
  const roofDeck = new THREE.Mesh(new THREE.BoxGeometry(deckW, deckH, deckD), palette.royalNavyMat);
  roofDeck.position.y = roofStartY + 0.4 + deckH / 2;
  hq.add(roofDeck);

  // LEVEL 2 ROOFTOP: Setback deck with 4 upward curving corner horn finials & gold balustrade
  if (level === 2) {
    const rY = roofStartY + 0.4 + deckH;
    const halfDW = deckW / 2;
    const halfDD = deckD / 2;

    // Golden perimeter balustrade
    const balustrade = new THREE.Mesh(new THREE.BoxGeometry(deckW + 0.2, 0.4, deckD + 0.2), palette.imperialGold);
    balustrade.position.y = rY + 0.2;
    hq.add(balustrade);

    // 4 Corner Horn Finials
    [
      [-halfDW, -halfDD, -1, -1],
      [halfDW, -halfDD, 1, -1],
      [-halfDW, halfDD, -1, 1],
      [halfDW, halfDD, 1, 1],
    ].forEach(([cx, cz, dirX, dirZ]) => {
      const horn = createCornerHornFinial(palette, 1.1);
      horn.position.set(cx, rY + 0.4, cz);
      horn.rotation.y = Math.atan2(dirX, dirZ);
      hq.add(horn);
    });

    // Central executive golden pyramid peak
    const peak = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.2, 4), palette.imperialGold);
    peak.rotation.y = Math.PI / 4;
    peak.position.y = rY + 1.1;
    hq.add(peak);
  }

  // LEVELS 3, 4, 5: Egyptian Sun-Disc Corona (Matching reference picture)
  if (level >= 3) {
    const coronaTier = (level === 5 ? 5 : level === 4 ? 4 : 3) as 3 | 4 | 5;
    const corona = createEgyptianSunCorona(deckW, deckD, palette, coronaTier);
    corona.position.y = roofStartY + 0.4 + deckH;
    hq.add(corona);
  }

  return hq;
}

/**
 * 6. CENTRAL SOVEREIGN INVESTMENT BANK
 */
export function buildBankMesh(palette: CityMaterialPalette, isSoftwareGl: boolean): THREE.Group {
  const bank = new THREE.Group();

  // Broad, layered podium and polished entrance approach.
  const lowerPlinth = new THREE.Mesh(new THREE.BoxGeometry(25.8, 0.55, 18.2), palette.whiteMarble);
  lowerPlinth.position.y = 0.28;
  lowerPlinth.receiveShadow = !isSoftwareGl;
  bank.add(lowerPlinth);

  const goldPlinthLine = new THREE.Mesh(new THREE.BoxGeometry(25.95, 0.09, 18.32), palette.brushedGold);
  goldPlinthLine.position.y = 0.1;
  bank.add(goldPlinthLine);

  const upperPlinth = new THREE.Mesh(new THREE.BoxGeometry(24.9, 0.36, 17.4), palette.whiteMarble);
  upperPlinth.position.y = 0.69;
  bank.add(upperPlinth);

  for (let step = 0; step < 5; step++) {
    const stair = new THREE.Mesh(
      new THREE.BoxGeometry(7.6 + step * 0.45, 0.16, 0.68),
      palette.whiteMarble
    );
    stair.position.set(0, 0.16 + step * 0.16, 8.9 + (4 - step) * 0.48);
    stair.receiveShadow = !isSoftwareGl;
    bank.add(stair);
  }

  // 6. Two-storey navy-and-glass bank hall; its front is oriented toward +Z.
  const bankBody = new THREE.Mesh(new THREE.BoxGeometry(24, 7.0, 15.0), palette.navyStructure);
  bankBody.position.y = 4.15;
  bankBody.castShadow = !isSoftwareGl;
  bankBody.receiveShadow = !isSoftwareGl;
  bank.add(bankBody);

  const glassFacade = palette.curtainGlass;
  const frontXs = [-9.6, -6.4, -3.2, 3.2, 6.4, 9.6];
  const windowRows = [2.25, 5.05];
  const frontWindowGeo = new THREE.BoxGeometry(2.55, 2.15, 0.1);
  const frontWindowCount = frontXs.length * windowRows.length;
  const frontWindows = new THREE.InstancedMesh(frontWindowGeo, glassFacade, frontWindowCount);
  const instance = new THREE.Object3D();
  let windowIndex = 0;
  windowRows.forEach((y) => {
    frontXs.forEach((x) => {
      instance.position.set(x, y, 7.58);
      instance.rotation.set(0, 0, 0);
      instance.scale.set(1, 1, 1);
      instance.updateMatrix();
      frontWindows.setMatrixAt(windowIndex++, instance.matrix);
    });
  });
  frontWindows.instanceMatrix.needsUpdate = true;
  bank.add(frontWindows);

  const rearWindowGeo = new THREE.BoxGeometry(2.55, 2.15, 0.1);
  const rearWindows = new THREE.InstancedMesh(rearWindowGeo, glassFacade, frontWindowCount);
  windowIndex = 0;
  windowRows.forEach((y) => {
    frontXs.forEach((x) => {
      instance.position.set(x, y, -7.58);
      instance.rotation.set(0, Math.PI, 0);
      instance.scale.set(1, 1, 1);
      instance.updateMatrix();
      rearWindows.setMatrixAt(windowIndex++, instance.matrix);
    });
  });
  rearWindows.instanceMatrix.needsUpdate = true;
  bank.add(rearWindows);

  const sideWindowGeo = new THREE.BoxGeometry(2.2, 2.15, 0.1);
  const sideWindowCount = 4 * windowRows.length;
  [-1, 1].forEach((side) => {
    const sideWindows = new THREE.InstancedMesh(sideWindowGeo, glassFacade, sideWindowCount);
    let sideIndex = 0;
    windowRows.forEach((y) => {
      [-4.8, -1.6, 1.6, 4.8].forEach((z) => {
        instance.position.set(side * 12.08, y, z);
        instance.rotation.set(0, Math.PI / 2, 0);
        instance.scale.set(1, 1, 1);
        instance.updateMatrix();
        sideWindows.setMatrixAt(sideIndex++, instance.matrix);
      });
    });
    sideWindows.instanceMatrix.needsUpdate = true;
    bank.add(sideWindows);
  });

  // Fine gold horizontal belts and the continuous navy roof cornice.
  [0.98, 3.62, 6.55].forEach((y) => {
    const frontTrim = new THREE.Mesh(new THREE.BoxGeometry(24.7, 0.1, 0.14), palette.imperialGold);
    frontTrim.position.set(0, y, 7.64);
    bank.add(frontTrim);
    const rearTrim = new THREE.Mesh(new THREE.BoxGeometry(24.7, 0.1, 0.14), palette.imperialGold);
    rearTrim.position.set(0, y, -7.64);
    bank.add(rearTrim);
    [-1, 1].forEach((side) => {
      const sideTrim = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 15.0), palette.imperialGold);
      sideTrim.position.set(side * 12.08, y, 0);
      bank.add(sideTrim);
    });
  });

  const roofCornice = new THREE.Mesh(new THREE.BoxGeometry(24.7, 0.24, 15.72), palette.whiteMarble);
  roofCornice.position.y = 7.62;
  bank.add(roofCornice);

  const frontPilasterXs = [-11.2, -7.45, -3.72, 3.72, 7.45, 11.2];
  const pilasterGeo = new THREE.BoxGeometry(0.72, 6.35, 0.78);
  const pilasters = new THREE.InstancedMesh(pilasterGeo, palette.royalNavyMat, frontPilasterXs.length);
  frontPilasterXs.forEach((x, index) => {
    instance.position.set(x, 4.0, 7.82);
    instance.rotation.set(0, 0, 0);
    instance.scale.set(1, 1, 1);
    instance.updateMatrix();
    pilasters.setMatrixAt(index, instance.matrix);
  });
  pilasters.instanceMatrix.needsUpdate = true;
  pilasters.castShadow = !isSoftwareGl;
  bank.add(pilasters);

  // Gold reveals frame the blue piers, matching the reference's repeated vertical rhythm.
  const goldRevealGeo = new THREE.BoxGeometry(0.075, 5.95, 0.84);
  const reveals = new THREE.InstancedMesh(goldRevealGeo, palette.brushedGold, frontPilasterXs.length * 2);
  let revealIndex = 0;
  frontPilasterXs.forEach((x) => {
    [-0.34, 0.34].forEach((offset) => {
      instance.position.set(x + offset, 4.0, 7.87);
      instance.rotation.set(0, 0, 0);
      instance.scale.set(1, 1, 1);
      instance.updateMatrix();
      reveals.setMatrixAt(revealIndex++, instance.matrix);
    });
  });
  reveals.instanceMatrix.needsUpdate = true;
  bank.add(reveals);

  // Lotus-like capitals: a shared low-poly leaf shape instanced across the frontage.
  const petalShape = new THREE.Shape();
  petalShape.moveTo(0, 0);
  petalShape.quadraticCurveTo(-0.18, 0.28, 0, 0.68);
  petalShape.quadraticCurveTo(0.18, 0.28, 0, 0);
  const petalGeo = new THREE.ShapeGeometry(petalShape, 6);
  const capitalPetals = new THREE.InstancedMesh(
    petalGeo,
    palette.imperialGold,
    frontPilasterXs.length * 5
  );
  let petalIndex = 0;
  frontPilasterXs.forEach((x) => {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.38, 0.42, 8), palette.imperialGold);
    cap.position.set(x, 6.88, 8.0);
    bank.add(cap);
    const capAbacus = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.16, 1.02), palette.brushedGold);
    capAbacus.position.set(x, 7.14, 8.0);
    bank.add(capAbacus);

    [-0.86, -0.43, 0, 0.43, 0.86].forEach((angle) => {
      instance.position.set(x + Math.sin(angle) * 0.24, 6.78, 8.43);
      instance.rotation.set(0, 0, angle);
      instance.scale.set(0.9, 0.82, 1);
      instance.updateMatrix();
      capitalPetals.setMatrixAt(petalIndex++, instance.matrix);
    });

    const baseRing = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.22, 1.0), palette.brushedGold);
    baseRing.position.set(x, 1.0, 8.0);
    bank.add(baseRing);
  });
  capitalPetals.instanceMatrix.needsUpdate = true;
  bank.add(capitalPetals);

  // Repeating crown/rosette reliefs in the upper fascia.
  const rosetteGeo = new THREE.OctahedronGeometry(0.22, 0);
  const rosettes = new THREE.InstancedMesh(rosetteGeo, palette.imperialGold, 11);
  for (let index = 0; index < 11; index++) {
    const x = -10 + index * 2;
    instance.position.set(x, 7.42, 8.12);
    instance.rotation.set(0, Math.PI / 4, 0);
    instance.scale.set(1.15, 1.2, 0.5);
    instance.updateMatrix();
    rosettes.setMatrixAt(index, instance.matrix);
  }
  rosettes.instanceMatrix.needsUpdate = true;
  bank.add(rosettes);

  // Central glazed entrance with gold mullions and a bilingual Suly nameplate.
  const entryFrame = new THREE.Mesh(new THREE.BoxGeometry(4.1, 3.55, 0.32), palette.brushedGold);
  entryFrame.position.set(0, 2.3, 7.98);
  bank.add(entryFrame);
  const entryGlass = new THREE.Mesh(new THREE.BoxGeometry(3.72, 3.25, 0.12), palette.curtainGlass);
  entryGlass.position.set(0, 2.3, 8.18);
  bank.add(entryGlass);
  const doorSplit = new THREE.Mesh(new THREE.BoxGeometry(0.075, 3.18, 0.08), palette.imperialGold);
  doorSplit.position.set(0, 2.3, 8.27);
  bank.add(doorSplit);
  [-0.35, 0.35].forEach((x) => {
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.58, 0.08), palette.imperialGold);
    handle.position.set(x, 2.18, 8.29);
    bank.add(handle);
  });

  const signFrame = new THREE.Mesh(new THREE.BoxGeometry(8.5, 1.66, 0.32), palette.brushedGold);
  signFrame.position.set(0, 5.2, 8.08);
  bank.add(signFrame);
  const signBacking = new THREE.Mesh(new THREE.BoxGeometry(8.24, 1.42, 0.16), palette.royalNavyMat);
  signBacking.position.set(0, 5.2, 8.29);
  bank.add(signBacking);

  if (!bankNameplateMaterial && typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 240;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = '#102244';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = '#c89b45';
      context.lineWidth = 12;
      context.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);
      context.fillStyle = '#f4d58a';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.direction = 'ltr';
      context.font = 'bold 68px Georgia, serif';
      context.fillText('Suly Islamic Bank', 512, 82);
      context.direction = 'rtl';
      context.font = 'bold 42px Arial, sans-serif';
      context.fillText('بنك Suly الإسلامي', 512, 166);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      bankNameplateMaterial = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
    }
  }
  if (bankNameplateMaterial) {
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(7.95, 1.28), bankNameplateMaterial);
    sign.position.set(0, 5.2, 8.39);
    bank.add(sign);
  }

  // Rear elevation echoes the blue central panel and balanced glass wings in the reference.
  const rearPanel = new THREE.Mesh(new THREE.BoxGeometry(8.0, 5.5, 0.34), palette.royalNavyMat);
  rearPanel.position.set(0, 4.2, -7.72);
  bank.add(rearPanel);
  [0.95, 3.55, 6.55].forEach((y) => {
    const rearTrim = new THREE.Mesh(new THREE.BoxGeometry(24.4, 0.1, 0.2), palette.imperialGold);
    rearTrim.position.set(0, y, -7.91);
    bank.add(rearTrim);
  });

  // 7. Roof terraces, parapets and raised service wings visible from above and from the sides.
  const roofDeck = new THREE.Mesh(new THREE.BoxGeometry(25.0, 0.36, 16.0), palette.whiteMarble);
  roofDeck.position.set(0, 7.83, 0);
  bank.add(roofDeck);
  [-8.0, 8.0].forEach((x) => {
    const rooftopWing = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.5, 8.8), palette.whiteMarble);
    rooftopWing.position.set(x, 8.72, -1.15);
    bank.add(rooftopWing);
    const wingCoping = new THREE.Mesh(new THREE.BoxGeometry(4.55, 0.16, 8.95), palette.brushedGold);
    wingCoping.position.set(x, 9.52, -1.15);
    bank.add(wingCoping);
  });

  const domeDrum = new THREE.Mesh(new THREE.BoxGeometry(12.5, 2.35, 10.4), palette.royalNavyMat);
  domeDrum.position.set(0, 9.12, -0.15);
  domeDrum.castShadow = !isSoftwareGl;
  bank.add(domeDrum);
  [8.0, 10.2].forEach((y) => {
    const drumBelt = new THREE.Mesh(new THREE.BoxGeometry(12.9, 0.12, 10.8), palette.imperialGold);
    drumBelt.position.set(0, y, -0.15);
    bank.add(drumBelt);
  });

  const drumWindows = new THREE.InstancedMesh(new THREE.BoxGeometry(1.08, 1.2, 0.12), palette.curtainGlass, 12);
  for (let index = 0; index < 6; index++) {
    [-1, 1].forEach((side) => {
      instance.position.set(-5 + index * 2, 9.05, side * 5.43 - 0.15);
      instance.rotation.set(0, side < 0 ? Math.PI : 0, 0);
      instance.scale.set(1, 1, 1);
      instance.updateMatrix();
      drumWindows.setMatrixAt(index * 2 + (side < 0 ? 1 : 0), instance.matrix);
    });
  }
  drumWindows.instanceMatrix.needsUpdate = true;
  bank.add(drumWindows);

  const domeBase = new THREE.Mesh(new THREE.CylinderGeometry(5.75, 5.9, 0.48, 32), palette.imperialGold);
  domeBase.position.set(0, 10.37, -0.15);
  bank.add(domeBase);
  const domeRing = new THREE.Mesh(new THREE.TorusGeometry(5.66, 0.12, 6, 40), palette.brushedGold);
  domeRing.rotation.x = Math.PI / 2;
  domeRing.position.set(0, 10.62, -0.15);
  bank.add(domeRing);

  const domeRadius = 5.55;
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(domeRadius, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2),
    palette.imperialGold
  );
  dome.position.set(0, 10.62, -0.15);
  dome.castShadow = !isSoftwareGl;
  bank.add(dome);

  for (let rib = 0; rib < 16; rib++) {
    const phi = (rib * Math.PI * 2) / 16;
    const points: THREE.Vector3[] = [];
    for (let segment = 0; segment <= 12; segment++) {
      const theta = Math.PI / 2 - (segment / 12) * (Math.PI / 2 - 0.035);
      points.push(
        new THREE.Vector3(
          Math.sin(theta) * domeRadius * Math.cos(phi),
          10.62 + Math.cos(theta) * domeRadius,
          -0.15 + Math.sin(theta) * domeRadius * Math.sin(phi)
        )
      );
    }
    const ribCurve = new THREE.CatmullRomCurve3(points);
    const ribMesh = new THREE.Mesh(
      new THREE.TubeGeometry(ribCurve, 20, 0.045, 5, false),
      palette.brushedGold
    );
    bank.add(ribMesh);
  }

  [Math.PI / 3, Math.PI / 6].forEach((theta) => {
    const horizontalRadius = domeRadius * Math.sin(theta);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(horizontalRadius, 0.055, 5, 40),
      palette.brushedGold
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 10.62 + domeRadius * Math.cos(theta), -0.15);
    bank.add(ring);
  });

  // Three-tiered golden finial and pointed crescent-shaped spire.
  const finialBase = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.86, 0.18, 16), palette.brushedGold);
  finialBase.position.set(0, 16.2, -0.15);
  bank.add(finialBase);
  const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.62, 0.92, 12), palette.imperialGold);
  lantern.position.set(0, 16.72, -0.15);
  bank.add(lantern);
  const lanternCap = new THREE.Mesh(new THREE.ConeGeometry(0.58, 0.82, 12), palette.imperialGold);
  lanternCap.position.set(0, 17.55, -0.15);
  bank.add(lanternCap);
  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.25, 1.35, 10), palette.brushedGold);
  spire.position.set(0, 18.58, -0.15);
  bank.add(spire);
  const spireTip = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.72, 8), palette.imperialGold);
  spireTip.position.set(0, 19.58, -0.15);
  bank.add(spireTip);

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

/**
 * 13. Wall Street Stock Exchange & Financial Investments Atrium (بورصة الأوراق المالية)
 */
export function buildStockExchangeMesh(palette: CityMaterialPalette, isSoftwareGl: boolean): THREE.Group {
  const group = new THREE.Group();

  // Foundation & Plaza Slab
  const slab = new THREE.Mesh(new THREE.BoxGeometry(11, 0.4, 9), palette.whiteMarble);
  slab.position.y = 0.2;
  slab.receiveShadow = !isSoftwareGl;
  group.add(slab);

  // Stepped Grand Entrance Stairs
  for (let s = 0; s < 4; s++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(7 - s * 0.4, 0.16, 2 - s * 0.3), palette.whiteMarble);
    step.position.set(0, 0.08 + s * 0.16, 4.6 + s * 0.2);
    group.add(step);
  }

  // Neoclassical Columned Glass Atrium
  const atriumBody = new THREE.Mesh(new THREE.BoxGeometry(9.6, 6.2, 7.6), palette.curtainGlass);
  atriumBody.position.y = 3.5;
  atriumBody.castShadow = !isSoftwareGl;
  group.add(atriumBody);

  // Interior Golden Bull Monument
  const bullPedestal = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 1.2), palette.whiteMarble);
  bullPedestal.position.set(0, 0.8, 2.2);
  group.add(bullPedestal);

  const goldenBull = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.1, 5), palette.imperialGold);
  goldenBull.rotation.z = Math.PI / 2;
  goldenBull.position.set(0, 1.6, 2.2);
  group.add(goldenBull);

  // Front Corinthian Fluted Columns
  for (let c = -3; c <= 3; c += 1.5) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 6.2, 12), palette.whiteMarble);
    col.position.set(c, 3.5, 3.8);
    col.castShadow = !isSoftwareGl;
    group.add(col);
  }

  // Triangular Classical Pediment Frieze
  const pediment = new THREE.Mesh(new THREE.ConeGeometry(5.2, 1.8, 4), palette.whiteMarble);
  pediment.rotation.y = Math.PI / 4;
  pediment.position.set(0, 7.3, 3.2);
  group.add(pediment);

  // Green / Red Dynamic LED Ticker Tape Band
  const tickerBar = new THREE.Mesh(new THREE.BoxGeometry(9.7, 0.6, 0.15), palette.neonGreen);
  tickerBar.position.set(0, 6.3, 3.85);
  group.add(tickerBar);

  // Rooftop Satellite Communication Array
  const dishPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.5, 8), palette.industrialSteel);
  dishPole.position.set(2.8, 7.6, -1.8);
  group.add(dishPole);

  const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.2, 0.2, 14), palette.chromeMetal);
  dish.rotation.x = Math.PI / 3;
  dish.position.set(2.8, 8.8, -1.8);
  group.add(dish);

  return group;
}

/**
 * 14. Tech Tree R&D Innovation Bio-Cyber Dome (مركز الأبحاث والتكنولوجيا)
 */
export function buildTechTreeMesh(
  palette: CityMaterialPalette,
  isSoftwareGl: boolean,
  level = 1
): THREE.Group {
  const group = new THREE.Group();
  const visualLevel = Math.max(1, Math.min(8, Math.round(level)));

  // Tech Base Platform
  const baseSlab = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 7, 0.4, 24), palette.slateStructure);
  baseSlab.position.y = 0.2;
  group.add(baseSlab);

  // Glowing Cyan Outer Concentric Data Ring
  const dataRing = new THREE.Mesh(new THREE.RingGeometry(6.6, 7.1, 32), palette.neonCyan);
  dataRing.rotation.x = -Math.PI / 2;
  dataRing.position.y = 0.22;
  group.add(dataRing);

  // Each research level adds another illuminated orbital ring to the campus.
  for (let ringLevel = 2; ringLevel <= visualLevel; ringLevel += 1) {
    const orbitalRing = new THREE.Mesh(
      new THREE.RingGeometry(7.1 + ringLevel * 0.3, 7.16 + ringLevel * 0.3, 32),
      ringLevel % 2 === 0 ? palette.neonPurple : palette.neonCyan
    );
    orbitalRing.rotation.x = -Math.PI / 2;
    orbitalRing.position.y = 0.24 + ringLevel * 0.015;
    group.add(orbitalRing);
  }

  // Main Geodesic Glass Research Dome
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(4.35 + visualLevel * 0.12, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    palette.curtainGlass
  );
  dome.position.y = 0.4;
  dome.castShadow = !isSoftwareGl;
  group.add(dome);

  // Glass greenhouse ribs make the upgrade silhouette visibly richer.
  for (let rib = 0; rib < Math.min(8, 3 + visualLevel); rib += 1) {
    const ribRing = new THREE.Mesh(
      new THREE.TorusGeometry(4.42 + visualLevel * 0.12, 0.045, 6, 24),
      palette.industrialSteel
    );
    ribRing.rotation.x = Math.PI / 2;
    ribRing.rotation.y = (rib * Math.PI) / Math.min(8, 3 + visualLevel);
    ribRing.position.y = 0.45 + rib * 0.05;
    group.add(ribRing);
  }

  // Central Quantum Supercomputing Core Cylinder inside Dome
  const quantumCore = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05 + visualLevel * 0.04, 1.2 + visualLevel * 0.05, 4.2 + visualLevel * 0.35, 16),
    palette.neonPurple
  );
  quantumCore.position.y = 2.3 + visualLevel * 0.2;
  group.add(quantumCore);

  // Outer Cantilevered Research Pods
  const podCount = Math.min(8, 2 + visualLevel);
  for (let p = 0; p < podCount; p++) {
    const angle = (p * Math.PI * 2) / podCount;
    const px = Math.cos(angle) * (4.4 + visualLevel * 0.08);
    const pz = Math.sin(angle) * (4.4 + visualLevel * 0.08);

    const pod = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 2.2), palette.whiteMarble);
    pod.position.set(px, 1.1, pz);
    pod.lookAt(0, 1.1, 0);
    group.add(pod);

    // Glowing pod strip
    const strip = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.2, 2.22), palette.neonCyan);
    strip.position.set(px, 1.1, pz);
    strip.lookAt(0, 1.1, 0);
    group.add(strip);
  }

  // Spire with rotating radar disc
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 4.5, 8), palette.chromeMetal);
  spire.position.y = 6.6;
  group.add(spire);

  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 10), palette.neonCyan);
  beacon.position.y = 9.0;
  group.add(beacon);

  return group;
}

/**
 * 15. VC Unicorns Startup Incubator Spiral Tower (حاضنة الشركات الناشئة)
 */
export function buildStartupIncubatorMesh(palette: CityMaterialPalette, isSoftwareGl: boolean): THREE.Group {
  const group = new THREE.Group();

  // Base Podium
  const podium = new THREE.Mesh(new THREE.BoxGeometry(8, 0.4, 8), palette.slateStructure);
  podium.position.y = 0.2;
  group.add(podium);

  // Twisted / Crystalline Floor Plates Stack
  const floorCount = 10;
  for (let f = 0; f < floorCount; f++) {
    const scale = 1 - (f * 0.05);
    const floorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(5 * scale, 1.1, 5 * scale),
      f % 2 === 0 ? palette.curtainGlass : palette.officeWindowsLit
    );
    floorMesh.position.y = 0.95 + f * 1.25;
    floorMesh.rotation.y = f * 0.14; // Architectural twist
    floorMesh.castShadow = !isSoftwareGl;
    group.add(floorMesh);

    // Outer edge neon strip
    const edgeStrip = new THREE.Mesh(new THREE.BoxGeometry(5.08 * scale, 0.12, 5.08 * scale), palette.neonPurple);
    edgeStrip.position.y = 1.48 + f * 1.25;
    edgeStrip.rotation.y = f * 0.14;
    group.add(edgeStrip);
  }

  // Rooftop Launchpad with Rocket Hologram
  const roofY = 0.95 + floorCount * 1.25;
  const launchpad = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.3, 16), palette.whiteMarble);
  launchpad.position.y = roofY;
  group.add(launchpad);

  // Futuristic Rocket Hologram
  const rocketBody = new THREE.Mesh(new THREE.ConeGeometry(0.6, 2.4, 8), palette.neonPurple);
  rocketBody.position.y = roofY + 1.4;
  group.add(rocketBody);

  const boosterGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.5, 0.6, 8), palette.neonGold);
  boosterGlow.position.y = roofY + 0.3;
  group.add(boosterGlow);

  return group;
}

/**
 * 16. Maritime Harbor & International Fleet Terminal (الميناء الملاحي والأسطول)
 */
export function buildMaritimePortMesh(palette: CityMaterialPalette, isSoftwareGl: boolean): THREE.Group {
  const group = new THREE.Group();
  group.name = 'suly_container_port_terminal';

  // The land yard is deliberately kept west of the x=65 service road so it
  // does not overlap the existing factory or logistics warehouse.
  const yardSlab = new THREE.Mesh(new THREE.BoxGeometry(8.1, 0.42, 54), palette.slateStructure);
  yardSlab.position.set(-17.05, 0.21, 3);
  yardSlab.receiveShadow = !isSoftwareGl;
  group.add(yardSlab);
  const yardApron = new THREE.Mesh(new THREE.BoxGeometry(7.85, 0.04, 53.7), palette.plazaPaver);
  yardApron.position.set(-17.05, 0.44, 3);
  yardApron.receiveShadow = !isSoftwareGl;
  group.add(yardApron);

  // Quay sits east of the seawall; its deck forms a continuous berth for ships.
  const quay = new THREE.Mesh(new THREE.BoxGeometry(14, 0.4, 56), palette.slateStructure);
  quay.position.set(3.5, 0.2, 3);
  quay.receiveShadow = !isSoftwareGl;
  group.add(quay);
  const quayTop = new THREE.Mesh(new THREE.BoxGeometry(13.7, 0.05, 55.7), palette.plazaPaver);
  quayTop.position.set(3.5, 0.425, 3);
  group.add(quayTop);

  // Port access apron continues the existing east-west road through the seawall opening.
  const accessRamp = new THREE.Mesh(new THREE.BoxGeometry(10, 0.16, 7.6), palette.asphalt);
  accessRamp.position.set(-8, 0.25, 3);
  accessRamp.rotation.z = Math.atan2(0.28, 10);
  accessRamp.name = 'port_access_ramp';
  group.add(accessRamp);
  const accessRoad = new THREE.Mesh(new THREE.BoxGeometry(13, 0.12, 7.6), palette.asphalt);
  accessRoad.position.set(3.5, 0.51, 3);
  accessRoad.name = 'port_access_road';
  accessRoad.receiveShadow = !isSoftwareGl;
  group.add(accessRoad);
  const accessCenterLine = new THREE.Mesh(new THREE.BoxGeometry(12, 0.025, 0.14), palette.roadLine);
  accessCenterLine.position.set(3.5, 0.58, 3);
  group.add(accessCenterLine);

  // Shipping containers use four InstancedMeshes instead of dozens of draw calls.
  const yardContainerGeometry = new THREE.BoxGeometry(3.6, 2, 5.2);
  const containerMaterials = [palette.containerBlue, palette.containerRed, palette.containerYellow, palette.containerGreen];
  const containerPositions: THREE.Vector3[][] = containerMaterials.map(() => []);
  const containerRows = [-20, -12, -4, 12, 20, 26];
  const containerColumns = [-18.5, -14.5];
  containerRows.forEach((z, row) => {
    containerColumns.forEach((x, column) => {
      const levels = 1 + ((row + column) % 3 === 0 ? 1 : 0) + ((row * 2 + column) % 7 === 0 ? 1 : 0);
      for (let level = 0; level < levels; level++) {
        const materialIndex = (row + column + level) % containerMaterials.length;
        containerPositions[materialIndex].push(new THREE.Vector3(x, 0.46 + 1 + level * 2.03, z));
      }
    });
  });
  const containerTransform = new THREE.Object3D();
  containerPositions.forEach((positions, materialIndex) => {
    if (positions.length === 0) return;
    const stacks = new THREE.InstancedMesh(yardContainerGeometry, containerMaterials[materialIndex], positions.length);
    stacks.name = `port_yard_containers_${materialIndex}`;
    stacks.castShadow = !isSoftwareGl;
    stacks.receiveShadow = true;
    positions.forEach((position, index) => {
      containerTransform.position.copy(position);
      containerTransform.rotation.set(0, 0, 0);
      containerTransform.scale.set(1, 1, 1);
      containerTransform.updateMatrix();
      stacks.setMatrixAt(index, containerTransform.matrix);
    });
    stacks.instanceMatrix.needsUpdate = true;
    group.add(stacks);
  });

  // Safety-striped quay edge bollards leave the access lane open.
  const bollardGeometry = new THREE.CylinderGeometry(0.18, 0.24, 0.75, 8);
  for (let z = -22; z <= 28; z += 6) {
    if (Math.abs(z - 3) < 6) continue;
    const bollard = new THREE.Mesh(bollardGeometry, palette.craneSteel);
    bollard.position.set(10, 0.76, z);
    bollard.castShadow = !isSoftwareGl;
    group.add(bollard);
  }

  // Four ship-to-shore gantry cranes with A-frame legs, long booms, cabins and hooks.
  const addBrace = (parent: THREE.Group, x1: number, y1: number, x2: number, y2: number, z: number) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const brace = new THREE.Mesh(
      new THREE.BoxGeometry(Math.hypot(dx, dy), 0.28, 0.28),
      palette.craneSteel,
    );
    brace.position.set((x1 + x2) / 2, (y1 + y2) / 2, z);
    brace.rotation.z = Math.atan2(dy, dx);
    parent.add(brace);
  };

  const cranePositions = [-17, -8, 12, 22];
  cranePositions.forEach((z, craneIndex) => {
    const crane = new THREE.Group();
    crane.name = `port_gantry_crane_${craneIndex + 1}`;
    crane.position.set(5, 0, z);

    const legGeometry = new THREE.BoxGeometry(0.72, 10.4, 0.78);
    [[-4, -1.8], [-4, 1.8], [4, -1.8], [4, 1.8]].forEach(([x, legZ]) => {
      const leg = new THREE.Mesh(legGeometry, palette.constructionYellow);
      leg.position.set(x, 5.35, legZ);
      leg.castShadow = !isSoftwareGl;
      crane.add(leg);
    });

    const portalBeam = new THREE.Mesh(new THREE.BoxGeometry(9, 0.85, 0.95), palette.constructionYellow);
    portalBeam.position.set(0, 10.5, 0);
    crane.add(portalBeam);
    [-4, 4].forEach((x) => {
      const crossTie = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.58, 4.4), palette.craneSteel);
      crossTie.position.set(x, 9.7, 0);
      crane.add(crossTie);
    });

    // Main boom reaches from the berth out above the ship lane.
    const boom = new THREE.Mesh(new THREE.BoxGeometry(28, 0.58, 0.88), palette.constructionYellow);
    boom.position.set(9, 11.25, 0);
    boom.castShadow = !isSoftwareGl;
    crane.add(boom);
    const counterJib = new THREE.Mesh(new THREE.BoxGeometry(7, 0.65, 0.9), palette.constructionYellow);
    counterJib.position.set(-4.8, 11.2, 0);
    crane.add(counterJib);
    [-1.8, 1.8].forEach((braceZ) => {
      addBrace(crane, -4, 1, 0, 9.8, braceZ);
      addBrace(crane, 4, 1, 0, 9.8, braceZ);
    });

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 2.2), palette.whiteMarble);
    cabin.position.set(2, 8.9, 0);
    crane.add(cabin);
    const cabinGlass = new THREE.Mesh(new THREE.BoxGeometry(2.42, 0.82, 0.08), palette.curtainGlass);
    cabinGlass.position.set(2, 9.05, 1.14);
    crane.add(cabinGlass);

    const trolley = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 1.35), palette.craneSteel);
    trolley.position.set(16, 10.85, 0);
    crane.add(trolley);
    const hoistCable = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 4.8, 6), palette.navyStructure);
    hoistCable.position.set(16, 8.1, 0);
    crane.add(hoistCable);
    if (craneIndex === 1) {
      const suspendedContainer = new THREE.Mesh(new THREE.BoxGeometry(3.1, 1.45, 4.4), palette.containerYellow);
      suspendedContainer.position.set(16, 5.1, 0);
      crane.add(suspendedContainer);
    }

    group.add(crane);
  });

  // Two low-profile container vessels sit outside the quay with clear water between them.
  const addCargoShip = (name: string, x: number, z: number, width: number, length: number, colorIndex: number) => {
    const ship = new THREE.Group();
    ship.name = name;
    ship.position.set(x, 0, z);

    const hull = new THREE.Mesh(new THREE.BoxGeometry(width, 1.8, length), palette.navyStructure);
    hull.position.y = 0.95;
    hull.castShadow = !isSoftwareGl;
    ship.add(hull);
    const waterline = new THREE.Mesh(new THREE.BoxGeometry(width + 0.1, 0.24, length - 1), palette.safetyOrange);
    waterline.position.y = 0.42;
    ship.add(waterline);
    const bow = new THREE.Mesh(new THREE.ConeGeometry(width * 0.58, 3.4, 4), palette.navyStructure);
    bow.rotation.x = Math.PI / 2;
    bow.rotation.y = Math.PI / 4;
    bow.position.set(0, 0.95, length / 2 + 1.45);
    ship.add(bow);

    const bridgeZ = -length * 0.3;
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(width * 0.72, 3.7, 4.4), palette.whiteMarble);
    bridge.position.set(0, 3.45, bridgeZ);
    ship.add(bridge);
    const bridgeWindows = new THREE.Mesh(new THREE.BoxGeometry(width * 0.7, 0.8, 0.08), palette.curtainGlass);
    bridgeWindows.position.set(0, 4.05, bridgeZ + 2.25);
    ship.add(bridgeWindows);
    const funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.6, 1.8, 8), palette.containerRed);
    funnel.position.set(width * 0.2, 5.35, bridgeZ - 0.4);
    ship.add(funnel);

    const shipContainerMaterials = [palette.containerRed, palette.containerBlue, palette.containerYellow, palette.containerGreen];
    const rows = length > 21 ? [-2, 3.5, 9] : [-1, 5, 10];
    rows.forEach((rowZ, row) => {
      [-1, 1].forEach((side, column) => {
        const container = new THREE.Mesh(
          new THREE.BoxGeometry(width * 0.34, 1.65, 4.8),
          shipContainerMaterials[(row + column + colorIndex) % shipContainerMaterials.length],
        );
        container.position.set(side * width * 0.2, 2.7, rowZ);
        ship.add(container);
      });
    });
    group.add(ship);
  };

  addCargoShip('port_cargo_ship_main', 23, -8, 8.4, 24, 0);
  addCargoShip('port_cargo_ship_outer', 43, 10, 7.2, 20, 2);

  // A striped harbor lighthouse anchors the southern tip of the quay.
  const lighthouseX = 9;
  const lighthouseZ = -24;
  const lighthouseBase = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.45, 8.5, 14), palette.whiteMarble);
  lighthouseBase.position.set(lighthouseX, 4.65, lighthouseZ);
  lighthouseBase.castShadow = !isSoftwareGl;
  group.add(lighthouseBase);
  [3.1, 6.3].forEach((y) => {
    const band = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.27, 0.52, 14), palette.safetyOrange);
    band.position.set(lighthouseX, y, lighthouseZ);
    group.add(band);
  });
  const lightLantern = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1.2, 12), palette.curtainGlass);
  lightLantern.position.set(lighthouseX, 9.5, lighthouseZ);
  group.add(lightLantern);
  const lightDome = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.9, 12), palette.copperAccent);
  lightDome.position.set(lighthouseX, 10.55, lighthouseZ);
  group.add(lightDome);
  const beaconLight = new THREE.Mesh(new THREE.SphereGeometry(0.38, 8, 8), palette.beaconGlow);
  beaconLight.position.set(lighthouseX, 9.5, lighthouseZ);
  group.add(beaconLight);

  // Buoys mark the open channel without filling the water around the vessels.
  [-12, 8, 28].forEach((z, index) => {
    const buoy = new THREE.Group();
    buoy.name = `harbor_channel_buoy_${index + 1}`;
    buoy.position.set(31, 0, z);
    const float = new THREE.Mesh(new THREE.SphereGeometry(0.62, 8, 6), index % 2 ? palette.constructionYellow : palette.safetyOrange);
    float.position.y = 0.48;
    buoy.add(float);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 1.1, 6), palette.whiteMarble);
    mast.position.y = 1.24;
    buoy.add(mast);
    group.add(buoy);
  });

  return group;
}

/**
 * 17. Government Megaprojects & State Tenders Ministry (وزارة المشاريع القومية)
 */
export function buildMegaprojectsMinistryMesh(palette: CityMaterialPalette, isSoftwareGl: boolean): THREE.Group {
  const group = new THREE.Group();

  // Grand Granite Plaza Slab
  const slab = new THREE.Mesh(new THREE.BoxGeometry(12, 0.5, 10), palette.slateStructure);
  slab.position.y = 0.25;
  group.add(slab);

  // Stepped Brutalist Ministry Wings
  const centerBody = new THREE.Mesh(new THREE.BoxGeometry(10, 5.5, 7.5), palette.facadeConcrete);
  centerBody.position.y = 3.25;
  centerBody.castShadow = !isSoftwareGl;
  group.add(centerBody);

  // Stepped Ziggurat / Pyramid Crown
  for (let z = 0; z < 3; z++) {
    const tier = new THREE.Mesh(new THREE.BoxGeometry(8 - z * 1.8, 0.8, 5.5 - z * 1.4), palette.whiteMarble);
    tier.position.y = 6.4 + z * 0.8;
    group.add(tier);
  }

  // Golden Sovereign Crest Emblem on Facade
  const crest = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.15, 16), palette.imperialGold);
  crest.rotation.x = Math.PI / 2;
  crest.position.set(0, 4.5, 3.82);
  group.add(crest);

  // Colonnade Portico
  for (let c = -4; c <= 4; c += 2) {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.55, 4.8, 0.55), palette.whiteMarble);
    col.position.set(c, 2.7, 3.9);
    group.add(col);
  }

  // Twin Flag Poles with Golden Eagles
  [-3.8, 3.8].forEach((fx) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 6.5, 8), palette.imperialGold);
    pole.position.set(fx, 3.5, 4.6);
    group.add(pole);

    const flag = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.04), palette.containerRed);
    flag.position.set(fx + 0.65, 5.8, 4.6);
    group.add(flag);
  });

  return group;
}

/**
 * 18. Territory Conquest & Regional Dominion Citadel (قلعة النفوذ والسيطرة)
 */
export function buildTerritoryCitadelMesh(
  palette: CityMaterialPalette,
  isSoftwareGl: boolean,
  level = 1
): THREE.Group {
  const group = new THREE.Group();
  const visualLevel = Math.max(1, Math.min(5, Math.round(level)));

  // Pentagonal Armored Fortress Base
  const baseFort = new THREE.Mesh(
    new THREE.CylinderGeometry(5.4 + visualLevel * 0.2, 6.1 + visualLevel * 0.25, 2.4 + visualLevel * 0.35, 5),
    palette.navyStructure
  );
  baseFort.position.y = 1.2 + visualLevel * 0.18;
  baseFort.castShadow = !isSoftwareGl;
  group.add(baseFort);

  // Higher levels add a glowing defensive moat around the citadel.
  if (visualLevel >= 2) {
    const moat = new THREE.Mesh(
      new THREE.RingGeometry(6.35 + visualLevel * 0.2, 7.05 + visualLevel * 0.25, 5),
      palette.neonCyan
    );
    moat.rotation.x = -Math.PI / 2;
    moat.position.y = 0.18;
    group.add(moat);
  }

  // Fortified Upper Ramparts
  const ramparts = new THREE.Mesh(
    new THREE.CylinderGeometry(4.1 + visualLevel * 0.15, 4.5 + visualLevel * 0.18, 1.8 + visualLevel * 0.25, 5),
    palette.slateStructure
  );
  ramparts.position.y = 3.3 + visualLevel * 0.55;
  group.add(ramparts);

  if (visualLevel >= 3) {
    const innerWall = new THREE.Mesh(
      new THREE.TorusGeometry(4.65 + visualLevel * 0.15, 0.22, 6, 5),
      palette.imperialGold
    );
    innerWall.rotation.x = Math.PI / 2;
    innerWall.position.y = 4.25 + visualLevel * 0.45;
    group.add(innerWall);
  }

  // Corner Defense Turret Towers
  const turretCount = Math.min(9, 4 + visualLevel);
  for (let t = 0; t < turretCount; t++) {
    const angle = (t * Math.PI * 2) / turretCount;
    const tx = Math.cos(angle) * (4.9 + visualLevel * 0.25);
    const tz = Math.sin(angle) * (4.9 + visualLevel * 0.25);

    const turret = new THREE.Mesh(
      new THREE.CylinderGeometry(0.72 + visualLevel * 0.04, 0.84 + visualLevel * 0.05, 3.8 + visualLevel * 0.55, 8),
      palette.navyStructure
    );
    turret.position.set(tx, 1.9 + visualLevel * 0.35, tz);
    group.add(turret);

    const turretCap = new THREE.Mesh(new THREE.ConeGeometry(0.88 + visualLevel * 0.06, 1.0 + visualLevel * 0.12, 8), palette.imperialGold);
    turretCap.position.set(tx, 4.55 + visualLevel * 0.72, tz);
    group.add(turretCap);
  }

  // Central Radar Radome Dome
  const radome = new THREE.Mesh(new THREE.SphereGeometry(1.25 + visualLevel * 0.15, 14, 14), palette.whiteMarble);
  radome.position.set(0, 5.5 + visualLevel * 0.85, 0);
  group.add(radome);

  // Holographic Wireframe Globe Ring
  const holoGlobe = new THREE.Mesh(new THREE.RingGeometry(2.0 + visualLevel * 0.18, 2.25 + visualLevel * 0.18, 24), palette.neonGold);
  holoGlobe.rotation.x = Math.PI / 4;
  holoGlobe.position.set(0, 6.35 + visualLevel * 0.85, 0);
  group.add(holoGlobe);

  if (visualLevel >= 4) {
    const commandSpire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.3, 3.2 + visualLevel * 0.4, 8),
      palette.imperialGold
    );
    commandSpire.position.y = 8.0 + visualLevel * 0.55;
    group.add(commandSpire);
    const commandBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.38, 10, 10), palette.neonGold);
    commandBeacon.position.y = 9.8 + visualLevel * 0.55;
    group.add(commandBeacon);
  }

  return group;
}

/**
 * 19. Trade Cartel & Syndicate Bastion (معقل الكارتيل والتحالفات)
 * Renders the 8 architectural levels matching the user's photos with golden domes,
 * coastal island cliff, cantilevered waterfall pool, marina, helicopter & supercars.
 */
export { buildCartelBastionMesh } from './cartelStronghold3D';

/**
 * 20. Grand Dynamic Auction Arena (دار المزادات الإمبراطورية الكبرى)
 */
export function buildAuctionArenaMesh(palette: CityMaterialPalette, isSoftwareGl: boolean): THREE.Group {
  const group = new THREE.Group();

  // Tiered Colosseum Amphitheater Base
  const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 7, 1.6, 24), palette.whiteMarble);
  tier1.position.y = 0.8;
  group.add(tier1);

  const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.8, 1.8, 24), palette.whiteMarble);
  tier2.position.y = 2.4;
  group.add(tier2);

  const tier3 = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.6, 1.6, 24), palette.whiteMarble);
  tier3.position.y = 4.0;
  group.add(tier3);

  // Central Sunken Bidding Stage with Glass Roof Dome
  const arenaDome = new THREE.Mesh(new THREE.SphereGeometry(2.8, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), palette.curtainGlass);
  arenaDome.position.y = 4.8;
  group.add(arenaDome);

  // Golden Auction Gavel Monument atop Arena
  const gavelBase = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.5, 12), palette.imperialGold);
  gavelBase.position.y = 7.8;
  group.add(gavelBase);

  const gavelHead = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.6, 10), palette.imperialGold);
  gavelHead.rotation.z = Math.PI / 2;
  gavelHead.position.set(0, 8.4, 0);
  group.add(gavelHead);

  const gavelHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.2, 8), palette.copperAccent);
  gavelHandle.position.set(0, 7.8, 0);
  group.add(gavelHandle);

  // 4 Entrance Arches
  for (let a = 0; a < 4; a++) {
    const angle = (a * Math.PI * 2) / 4;
    const ax = Math.cos(angle) * 6.2;
    const az = Math.sin(angle) * 6.2;

    const arch = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.4, 1.2), palette.imperialGold);
    arch.position.set(ax, 1.2, az);
    arch.lookAt(0, 1.2, 0);
    group.add(arch);
  }

  return group;
}

/**
 * 21. Central Logistics, Warehouses & Raw Materials Hub (مركز الخدمات اللوجستية)
 */
export function buildLogisticsHubMesh(palette: CityMaterialPalette, isSoftwareGl: boolean): THREE.Group {
  const group = new THREE.Group();

  // Concrete Paved Yard
  const yard = new THREE.Mesh(new THREE.BoxGeometry(13, 0.4, 11), palette.asphalt);
  yard.position.y = 0.2;
  group.add(yard);

  // Large Distribution Warehouse Hall
  const mainHall = new THREE.Mesh(new THREE.BoxGeometry(9.5, 4.2, 7.5), palette.industrialSteel);
  mainHall.position.set(-1, 2.3, -1);
  mainHall.castShadow = !isSoftwareGl;
  group.add(mainHall);

  // Sawtooth Skylight Roof
  for (let s = -3; s <= 3; s += 2) {
    const roofSaw = new THREE.Mesh(new THREE.ConeGeometry(1.4, 1.2, 3), palette.corrugatedMetal);
    roofSaw.rotation.z = Math.PI / 2;
    roofSaw.position.set(s - 1, 4.8, -1);
    group.add(roofSaw);
  }

  // 3 Roll-up Cargo Loading Bays
  for (let b = -2.4; b <= 2.4; b += 2.4) {
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 0.15), palette.constructionCaution);
    door.position.set(b - 1, 1.3, 2.8);
    group.add(door);
  }

  // Parked Semi-Truck with Cargo Trailer
  const truck = new THREE.Group();
  truck.position.set(4, 0.4, 2);

  // Cabin
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.4, 1.4), palette.containerBlue);
  cabin.position.set(0, 0.9, 2);
  truck.add(cabin);

  // Trailer
  const trailer = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 3.8), palette.whiteMarble);
  trailer.position.set(0, 1.1, -0.8);
  truck.add(trailer);

  // Wheels
  [-0.8, 0.8].forEach((wx) => {
    [0.4, 2, -1.8, -2.4].forEach((wz) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.25, 8), palette.tireRubber);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.3, wz);
      truck.add(wheel);
    });
  });
  group.add(truck);

  return group;
}

/**
 * 22. HR Management Academy & Talent Tower (أكاديمية الكوادر والموظفين)
 */
export function buildHRAcademyMesh(palette: CityMaterialPalette, isSoftwareGl: boolean): THREE.Group {
  const group = new THREE.Group();

  // Podium
  const podium = new THREE.Mesh(new THREE.BoxGeometry(8, 0.4, 8), palette.whiteMarble);
  podium.position.y = 0.2;
  group.add(podium);

  // Dual Corporate Skyscraper Towers linked by Sky-Bridge
  [-2.2, 2.2].forEach((tx, idx) => {
    const towerH = idx === 0 ? 9.5 : 11.5;
    const tower = new THREE.Mesh(new THREE.BoxGeometry(3, towerH, 3.8), palette.officeWindowsLit);
    tower.position.set(tx, towerH / 2 + 0.4, 0);
    tower.castShadow = !isSoftwareGl;
    group.add(tower);
  });

  // Glass Skybridge connecting towers
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 1.8), palette.curtainGlass);
  bridge.position.set(0, 6.8, 0);
  group.add(bridge);

  // Rooftop Executive Helipad with "H"
  const helipad = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.2, 16), palette.asphalt);
  helipad.position.set(2.2, 12.1, 0);
  group.add(helipad);

  const heliBorder = new THREE.Mesh(new THREE.RingGeometry(1.3, 1.5, 24), palette.neonGold);
  heliBorder.rotation.x = -Math.PI / 2;
  heliBorder.position.set(2.2, 12.22, 0);
  group.add(heliBorder);

  return group;
}

/**
 * 23. Financial Audit & Analytics Tower (برج الرقابة المالية)
 */
export function buildAuditTowerMesh(palette: CityMaterialPalette, isSoftwareGl: boolean): THREE.Group {
  const group = new THREE.Group();

  // Base
  const base = new THREE.Mesh(new THREE.BoxGeometry(8, 0.4, 8), palette.slateStructure);
  base.position.y = 0.2;
  group.add(base);

  // Stepped Modern Tower
  const tiers = [
    { w: 5.8, d: 5.8, h: 4.5, y: 2.65 },
    { w: 4.6, d: 4.6, h: 3.8, y: 6.8 },
    { w: 3.4, d: 3.4, h: 3.2, y: 10.3 },
  ];

  tiers.forEach((t) => {
    const block = new THREE.Mesh(new THREE.BoxGeometry(t.w, t.h, t.d), palette.curtainGlass);
    block.position.y = t.y;
    block.castShadow = !isSoftwareGl;
    group.add(block);
  });

  // Glowing 3D Bar Chart Sculpture rising on front terrace
  const chartHeights = [1.2, 2.2, 3.4, 4.6];
  chartHeights.forEach((ch, idx) => {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.4, ch, 0.4), palette.neonGold);
    bar.position.set(-1.2 + idx * 0.8, 4.9 + ch / 2, 2.2);
    group.add(bar);
  });

  // High Frequency Spire
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, 3.6, 8), palette.imperialGold);
  spire.position.y = 13.7;
  group.add(spire);

  return group;
}

/**
 * 24. International Contracts & Trade Pavilion (مقر العقود والاتفاقيات)
 */
export function buildContractsPavilionMesh(palette: CityMaterialPalette, isSoftwareGl: boolean): THREE.Group {
  const group = new THREE.Group();

  // Reflective Plaza Slab
  const plaza = new THREE.Mesh(new THREE.BoxGeometry(11, 0.35, 9), palette.whiteMarble);
  plaza.position.y = 0.175;
  group.add(plaza);

  // Sweeping Tensile Curved Pavilion Roof
  const pavilionBody = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.8, 3.2, 16), palette.curtainGlass);
  pavilionBody.position.y = 1.95;
  group.add(pavilionBody);

  const canopyRoof = new THREE.Mesh(new THREE.ConeGeometry(5.6, 1.8, 16), palette.whiteMarble);
  canopyRoof.position.y = 4.3;
  group.add(canopyRoof);

  // Golden Compass Rose Seal
  const seal = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.5, 16), palette.imperialGold);
  seal.rotation.x = -Math.PI / 2;
  seal.position.y = 0.36;
  group.add(seal);

  // Avenue of 4 Flags
  for (let f = -3; f <= 3; f += 2) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 4.2, 8), palette.chromeMetal);
    pole.position.set(f, 2.1, 3.8);
    group.add(pole);

    const flagColors = [palette.containerBlue, palette.containerRed, palette.containerGreen, palette.containerYellow];
    const flag = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.03), flagColors[(f + 3) / 2 % 4]);
    flag.position.set(f + 0.42, 3.8, 3.8);
    group.add(flag);
  }

  return group;
}

/**
 * 25. Missions, Daily Quests & Hall of Fame Monument (صرح المهام والشرف)
 */
export function buildTasksMonumentMesh(palette: CityMaterialPalette, isSoftwareGl: boolean): THREE.Group {
  const group = new THREE.Group();

  // Monumental Pedestal Slab
  const pedestal = new THREE.Mesh(new THREE.BoxGeometry(9, 0.5, 7), palette.whiteMarble);
  pedestal.position.y = 0.25;
  group.add(pedestal);

  // Grand Triumphal Archway
  [-2.2, 2.2].forEach((px) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 6.2, 2.4), palette.whiteMarble);
    pillar.position.set(px, 3.35, 0);
    pillar.castShadow = !isSoftwareGl;
    group.add(pillar);
  });

  const archBeam = new THREE.Mesh(new THREE.BoxGeometry(6.6, 1.8, 2.6), palette.whiteMarble);
  archBeam.position.set(0, 6.8, 0);
  group.add(archBeam);

  const crownAttic = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.9, 2.2), palette.imperialGold);
  crownAttic.position.set(0, 8.1, 0);
  group.add(crownAttic);

  // Floating Glowing Quest Diamond Star in archway
  const questCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.95, 0), palette.neonGold);
  questCrystal.position.set(0, 3.8, 0);
  group.add(questCrystal);

  // Twin Victory Obelisks flanking the arch
  [-3.8, 3.8].forEach((ox) => {
    const obelisk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.55, 5.5, 4), palette.whiteMarble);
    obelisk.rotation.y = Math.PI / 4;
    obelisk.position.set(ox, 3.0, 1.6);
    group.add(obelisk);

    const obeliskCap = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.6, 4), palette.imperialGold);
    obeliskCap.rotation.y = Math.PI / 4;
    obeliskCap.position.set(ox, 6.0, 1.6);
    group.add(obeliskCap);
  });

  return group;
}

/**
 * 26. Luxury Waterfront Palace, Marina & Prestige Club (نادي المليارديرات والرفاهية)
 */
export function buildLuxuryClubMesh(palette: CityMaterialPalette, isSoftwareGl: boolean): THREE.Group {
  const group = new THREE.Group();

  // Grand Palace Terrace Slab
  const terrace = new THREE.Mesh(new THREE.BoxGeometry(14, 0.4, 11), palette.whiteMarble);
  terrace.position.y = 0.2;
  group.add(terrace);

  // Modern Luxury Villa Palace with Cantilevered Terraces
  const groundFloor = new THREE.Mesh(new THREE.BoxGeometry(8, 2.8, 6.5), palette.whiteMarble);
  groundFloor.position.set(-2, 1.6, -1.5);
  groundFloor.castShadow = !isSoftwareGl;
  group.add(groundFloor);

  const upperFloor = new THREE.Mesh(new THREE.BoxGeometry(7, 2.6, 5.5), palette.curtainGlass);
  upperFloor.position.set(-1.5, 4.3, -1.2);
  group.add(upperFloor);

  const roofCanopy = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.3, 6.4), palette.whiteMarble);
  roofCanopy.position.set(-1.5, 5.75, -1.2);
  group.add(roofCanopy);

  // Turquoise Infinity Swimming Pool
  const poolBorder = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.35, 3.6), palette.whiteMarble);
  poolBorder.position.set(3.8, 0.35, 1.8);
  group.add(poolBorder);

  const poolWater = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.2, 3.2), palette.poolTurquoise);
  poolWater.position.set(3.8, 0.4, 1.8);
  group.add(poolWater);

  // Sun Loungers by the pool
  for (let l = 0; l < 3; l++) {
    const lounger = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 1.1), palette.imperialGold);
    lounger.position.set(2.4 + l * 0.9, 0.45, 0.2);
    group.add(lounger);
  }

  // Moored Luxury Yacht at side dock
  const yachtGroup = new THREE.Group();
  yachtGroup.position.set(5.8, 0.3, -2.5);

  const yachtHull = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 5.5), palette.whiteMarble);
  yachtHull.position.y = 0.45;
  yachtGroup.add(yachtHull);

  const yachtCabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 2.6), palette.curtainGlass);
  yachtCabin.position.set(0, 1.25, -0.4);
  yachtGroup.add(yachtCabin);

  group.add(yachtGroup);

  // Palm Trees on lawn
  [[-5.2, 2.8], [-5.2, -3.2]].forEach(([px, pz]) => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 3.4, 7), palette.treeTrunk);
    trunk.position.set(px, 1.7, pz);
    group.add(trunk);

    const fronds = new THREE.Mesh(new THREE.ConeGeometry(1.6, 1.1, 7), palette.foliageGreen);
    fronds.position.set(px, 3.6, pz);
    group.add(fronds);
  });

  return group;
}

/**
 * 27. Royal Diamond Vault & Premium Store (خزينة الماس الملكية)
 */
export function buildDiamondVaultMesh(palette: CityMaterialPalette, isSoftwareGl: boolean): THREE.Group {
  const group = new THREE.Group();

  // Octagonal Sanctuary Dais
  const dais = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 5.4, 0.6, 8), palette.imperialGold);
  dais.position.y = 0.3;
  group.add(dais);

  // 4 Curved Golden Pillars supporting crystal canopy
  for (let p = 0; p < 4; p++) {
    const angle = (p * Math.PI * 2) / 4;
    const px = Math.cos(angle) * 3.4;
    const pz = Math.sin(angle) * 3.4;

    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 5.8, 8), palette.imperialGold);
    pillar.position.set(px, 3.2, pz);
    group.add(pillar);
  }

  // Floating Giant Faceted Radiant Diamond
  const diamondGeo = new THREE.OctahedronGeometry(2.1, 0);
  const diamondMesh = new THREE.Mesh(diamondGeo, palette.neonCyan);
  diamondMesh.position.set(0, 4.2, 0);
  group.add(diamondMesh);

  // Orbiting Golden Halo Ring
  const ringGeo = new THREE.RingGeometry(2.8, 3.2, 32);
  const ringMesh = new THREE.Mesh(ringGeo, palette.neonGold);
  ringMesh.rotation.x = Math.PI / 3;
  ringMesh.position.set(0, 4.2, 0);
  group.add(ringMesh);

  return group;
}

/**
 * 28. Daily Lucky Wheel Rotunda Casino (كازينو عجلة الحظ اليومية)
 */
export function buildLuckyWheelRotundaMesh(palette: CityMaterialPalette, isSoftwareGl: boolean): THREE.Group {
  const group = new THREE.Group();

  // Circular Festive Base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.8, 0.4, 24), palette.whiteMarble);
  base.position.y = 0.2;
  group.add(base);

  // Festive Rotunda Pavilion
  const pavilion = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 3.4, 16), palette.whiteMarble);
  pavilion.position.y = 2.1;
  group.add(pavilion);

  // Circus / Casino Striped Roof Cone
  const roof = new THREE.Mesh(new THREE.ConeGeometry(5.2, 2.2, 16), palette.containerRed);
  roof.position.y = 4.8;
  group.add(roof);

  // Giant Vertical Spinning Prize Wheel mounted in front
  const wheelStand = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 3.2, 8), palette.imperialGold);
  wheelStand.position.set(0, 1.8, 4.5);
  group.add(wheelStand);

  // Prize Wheel Disc
  const wheelDisc = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, 0.2, 16), palette.imperialGold);
  wheelDisc.rotation.x = Math.PI / 2;
  wheelDisc.position.set(0, 3.2, 4.5);
  group.add(wheelDisc);

  // Neon glowing perimeter bulbs
  const perimeterRing = new THREE.Mesh(new THREE.RingGeometry(1.8, 2.05, 20), palette.neonGold);
  perimeterRing.position.set(0, 3.2, 4.62);
  group.add(perimeterRing);

  // Central Star
  const wheelCenter = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), palette.neonCyan);
  wheelCenter.position.set(0, 3.2, 4.75);
  group.add(wheelCenter);

  return group;
}

/**
 * 29. Sovereign Prestige & Global Expansion Consulate (قنصلية التوسع الدولي)
 */
export function buildPrestigeConsulateMesh(palette: CityMaterialPalette, isSoftwareGl: boolean): THREE.Group {
  const group = new THREE.Group();

  // Granite Pedestal
  const slab = new THREE.Mesh(new THREE.BoxGeometry(9, 0.4, 7), palette.whiteMarble);
  slab.position.y = 0.2;
  group.add(slab);

  // Classical Consulate Palace Body
  const palace = new THREE.Mesh(new THREE.BoxGeometry(7.6, 4.2, 5.4), palette.facadeConcrete);
  palace.position.y = 2.5;
  palace.castShadow = !isSoftwareGl;
  group.add(palace);

  // Golden Classical Dome with Lantern
  const dome = new THREE.Mesh(new THREE.SphereGeometry(2.4, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), palette.imperialGold);
  dome.position.y = 4.6;
  group.add(dome);

  const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.1, 8), palette.imperialGold);
  lantern.position.y = 7.3;
  group.add(lantern);

  // Diplomatic Black Limousine parked out front
  const limo = new THREE.Group();
  limo.position.set(0, 0.4, 3.8);

  const limoBody = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.7, 3.8), palette.obsidianFortress);
  limoBody.position.y = 0.45;
  limo.add(limoBody);

  const limoCabin = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.55, 2.2), palette.carGlass);
  limoCabin.position.set(0, 0.95, -0.2);
  limo.add(limoCabin);

  group.add(limo);

  return group;
}
