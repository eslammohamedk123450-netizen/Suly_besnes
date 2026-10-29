/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import type { CityMaterialPalette } from './cityMaterials';

/**
 * Procedural luxury palm frond geometry with curved natural drape
 */
function createCurvedFrondGeometry(length = 3.6, width = 0.7): THREE.BufferGeometry {
  const segments = 8;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    // Arching downward curve (parabolic drape due to gravity)
    const y = Math.sin(t * Math.PI * 0.75) * 0.8 - t * t * 1.2;
    const z = t * length;
    // Frond tapers: starts narrow, widens in middle, tapers to point at tip
    const currentW = Math.sin(t * Math.PI) * width * 0.5;

    // Left vertex
    positions.push(-currentW, y, z);
    uvs.push(0, t);

    // Right vertex
    positions.push(currentW, y, z);
    uvs.push(1, t);

    if (i < segments) {
      const base = i * 2;
      indices.push(base, base + 1, base + 2);
      indices.push(base + 1, base + 3, base + 2);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds a realistic luxury royal date palm tree (نخيل فاخر)
 * Features:
 * - Natural curving fibrous trunk with bark segment rings
 * - Drooping realistic arched fronds with feathered leaf curves
 * - Golden-amber date bunches hanging from the crown
 */
export function buildLuxuryPalmTree(
  palette: CityMaterialPalette,
  isSoftwareGl: boolean,
  scale = 1.0,
  leanAngle = 0.08
): THREE.Group {
  const palm = new THREE.Group();
  palm.scale.set(scale, scale, scale);

  // 1. Root flare and marble planter collar
  const baseFlange = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.48, 0.35, 10),
    palette.treeTrunk
  );
  baseFlange.position.y = 0.175;
  palm.add(baseFlange);

  // 2. Multi-segment natural curving trunk
  const trunkSegments = 8;
  let currentY = 0.35;
  let currentX = 0;
  let currentZ = 0;

  for (let i = 0; i < trunkSegments; i++) {
    const t = i / trunkSegments;
    const rBottom = 0.34 - t * 0.12;
    const rTop = 0.34 - (t + 1 / trunkSegments) * 0.12;
    const segH = 0.65;

    const segGeo = new THREE.CylinderGeometry(rTop, rBottom, segH, 9);
    const segMesh = new THREE.Mesh(segGeo, palette.treeTrunk);

    // Organic lean
    currentX += Math.sin(i * 0.4) * leanAngle * 0.4;
    currentZ += leanAngle * 0.35;

    segMesh.position.set(currentX, currentY + segH / 2, currentZ);
    segMesh.rotation.z = Math.sin(i * 0.5) * 0.04;
    segMesh.rotation.x = -leanAngle * 0.15;
    segMesh.castShadow = !isSoftwareGl;
    palm.add(segMesh);

    // Bark ring ridge collar
    const collarGeo = new THREE.TorusGeometry(rTop + 0.03, 0.03, 6, 12);
    const collar = new THREE.Mesh(collarGeo, palette.treeTrunk);
    collar.rotation.x = Math.PI / 2;
    collar.position.set(currentX, currentY + segH, currentZ);
    palm.add(collar);

    currentY += segH;
  }

  // 3. Green crown shaft
  const crownShaftGeo = new THREE.CylinderGeometry(0.24, 0.22, 0.9, 8);
  const crownShaft = new THREE.Mesh(crownShaftGeo, palette.foliageDarkGreen);
  crownShaft.position.set(currentX, currentY + 0.45, currentZ);
  palm.add(crownShaft);
  currentY += 0.85;

  // 4. Golden-Amber Date Clusters (عراجين البلح الذهبي)
  const dateMaterial = new THREE.MeshStandardMaterial({
    color: '#d97706', // Rich amber date color
    roughness: 0.35,
    metalness: 0.1,
  });

  const clusterAngles = [0.4, 1.8, 3.4, 4.9];
  clusterAngles.forEach((cAngle) => {
    const cluster = new THREE.Group();
    const clusterDist = 0.38;
    cluster.position.set(
      currentX + Math.cos(cAngle) * clusterDist,
      currentY - 0.2,
      currentZ + Math.sin(cAngle) * clusterDist
    );

    // Stalk
    const stalkGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.5, 5);
    const stalk = new THREE.Mesh(stalkGeo, palette.treeTrunk);
    stalk.position.y = -0.15;
    cluster.add(stalk);

    // Bunches of dates
    const dateBunchGeo = new THREE.DodecahedronGeometry(0.28, 0);
    const dateBunch = new THREE.Mesh(dateBunchGeo, dateMaterial);
    dateBunch.position.y = -0.4;
    dateBunch.scale.set(0.9, 1.4, 0.9);
    cluster.add(dateBunch);

    palm.add(cluster);
  });

  // 5. Tiered Natural Arched Palm Fronds (سِعف النخيل الفاخر)
  const frondGeo = createCurvedFrondGeometry(3.8, 0.9);
  const upperFrondGeo = createCurvedFrondGeometry(3.0, 0.8);

  // Lower ring of drooping fronds
  const frondCount = 12;
  for (let i = 0; i < frondCount; i++) {
    const angle = (i * Math.PI * 2) / frondCount + (i % 2 === 0 ? 0.05 : -0.05);
    const frondMesh = new THREE.Mesh(frondGeo, palette.foliageGreen);
    frondMesh.position.set(currentX, currentY, currentZ);
    frondMesh.rotation.y = angle;
    frondMesh.rotation.x = 0.25 + (i % 3) * 0.08; // Natural tilt downward
    frondMesh.castShadow = !isSoftwareGl;
    palm.add(frondMesh);
  }

  // Upper ring of younger, greener fronds
  const upperFrondCount = 8;
  for (let j = 0; j < upperFrondCount; j++) {
    const angle = (j * Math.PI * 2) / upperFrondCount + 0.35;
    const frondMesh = new THREE.Mesh(upperFrondGeo, palette.foliageDarkGreen);
    frondMesh.position.set(currentX, currentY + 0.2, currentZ);
    frondMesh.rotation.y = angle;
    frondMesh.rotation.x = -0.15 + (j % 2) * 0.06;
    frondMesh.castShadow = !isSoftwareGl;
    palm.add(frondMesh);
  }

  return palm;
}

/**
 * Builds high-fidelity luxury flower beds (أحواض زهور فاخرة)
 * Replaces old box/cube foliage with sculpted stone curbs, rich topsoil, and blooming floral arrays
 */
export function buildFlowerBed(
  palette: CityMaterialPalette,
  isSoftwareGl: boolean,
  width = 3.6,
  depth = 3.6,
  shape: 'round' | 'rect' = 'round'
): THREE.Group {
  const bed = new THREE.Group();

  // Dark organic topsoil material
  const richSoilMat = new THREE.MeshStandardMaterial({
    color: '#1c1917', // Dark fertile loam
    roughness: 0.95,
    metalness: 0.02,
  });

  // Flower blossom materials (roses, marigolds, purple petunias, bougainvillea)
  const roseMat = new THREE.MeshStandardMaterial({
    color: '#e11d48', // Vibrant crimson rose
    roughness: 0.4,
    metalness: 0.05,
  });

  const marigoldMat = new THREE.MeshStandardMaterial({
    color: '#f59e0b', // Golden amber marigold
    roughness: 0.4,
    metalness: 0.05,
  });

  const purplePetuniaMat = new THREE.MeshStandardMaterial({
    color: '#a855f7', // Royal purple petunia
    roughness: 0.4,
    metalness: 0.05,
  });

  const pinkBougainvilleaMat = new THREE.MeshStandardMaterial({
    color: '#ec4899', // Bright hot pink
    roughness: 0.4,
    metalness: 0.05,
  });

  const flowerPalette = [roseMat, marigoldMat, purplePetuniaMat, pinkBougainvilleaMat];

  if (shape === 'round') {
    const radius = width / 2;
    // Marble retaining curb
    const curb = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius + 0.22, 0.4, 16),
      palette.whiteMarble
    );
    curb.position.y = 0.2;
    curb.castShadow = !isSoftwareGl;
    bed.add(curb);

    // Gold trim band
    const goldTrim = new THREE.Mesh(
      new THREE.TorusGeometry(radius + 0.12, 0.035, 6, 16),
      palette.imperialGold
    );
    goldTrim.rotation.x = Math.PI / 2;
    goldTrim.position.y = 0.38;
    bed.add(goldTrim);

    // Mounded topsoil
    const soil = new THREE.Mesh(
      new THREE.CylinderGeometry(radius - 0.08, radius - 0.08, 0.35, 16),
      richSoilMat
    );
    soil.position.y = 0.22;
    bed.add(soil);

    // Blooming flower clusters in concentric arrangements
    const blossomGeo = new THREE.DodecahedronGeometry(0.18, 0);
    const stemGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.3, 5);

    const plantCount = 14;
    for (let i = 0; i < plantCount; i++) {
      const angle = (i * Math.PI * 2) / plantCount;
      const dist = (radius - 0.4) * (0.45 + (i % 2) * 0.45);
      const px = Math.cos(angle) * dist;
      const pz = Math.sin(angle) * dist;

      // Stem & leafy base
      const stem = new THREE.Mesh(stemGeo, palette.foliageGreen);
      stem.position.set(px, 0.48, pz);
      bed.add(stem);

      // Blossom
      const blossomMat = flowerPalette[i % flowerPalette.length];
      const blossom = new THREE.Mesh(blossomGeo, blossomMat);
      blossom.position.set(px, 0.62, pz);
      blossom.scale.set(1.2, 0.9, 1.2);
      bed.add(blossom);
    }
  } else {
    // Rectangular planter bed
    const curbGeo = new THREE.BoxGeometry(width, 0.4, depth);
    const curb = new THREE.Mesh(curbGeo, palette.whiteMarble);
    curb.position.y = 0.2;
    curb.castShadow = !isSoftwareGl;
    bed.add(curb);

    const soilGeo = new THREE.BoxGeometry(width - 0.4, 0.35, depth - 0.4);
    const soil = new THREE.Mesh(soilGeo, richSoilMat);
    soil.position.y = 0.22;
    bed.add(soil);

    // Multi-color flowering array
    const blossomGeo = new THREE.DodecahedronGeometry(0.16, 0);
    const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.28, 5);

    for (let ix = -1; ix <= 1; ix++) {
      for (let iz = -1; iz <= 1; iz++) {
        const px = ix * (width * 0.26);
        const pz = iz * (depth * 0.26);

        const stem = new THREE.Mesh(stemGeo, palette.foliageGreen);
        stem.position.set(px, 0.46, pz);
        bed.add(stem);

        const blossomMat = flowerPalette[(Math.abs(ix * 3 + iz)) % flowerPalette.length];
        const blossom = new THREE.Mesh(blossomGeo, blossomMat);
        blossom.position.set(px, 0.58, pz);
        bed.add(blossom);
      }
    }
  }

  return bed;
}

/**
 * Builds a lush golf-green turf island (مساحات عشب أخضر داكن مثل ملاعب الجولف)
 */
export function buildGolfGreenTurfIsland(
  palette: CityMaterialPalette,
  isSoftwareGl: boolean,
  width = 12,
  depth = 8
): THREE.Group {
  const island = new THREE.Group();

  // Curving golf green mound
  const turfGeo = new THREE.BoxGeometry(width, 0.2, depth);
  const turf = new THREE.Mesh(turfGeo, palette.grassLawn);
  turf.position.y = 0.1;
  turf.receiveShadow = !isSoftwareGl;
  island.add(turf);

  // Mowing striping effect (alternating grass tone borders)
  const stripeCount = Math.floor(depth / 1.6);
  const stripeMat = palette.foliageDarkGreen;

  for (let s = 0; s < stripeCount; s += 2) {
    const sz = -depth / 2 + (s + 0.5) * 1.6;
    const stripeGeo = new THREE.BoxGeometry(width - 0.2, 0.02, 1.4);
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.set(0, 0.21, sz);
    island.add(stripe);
  }

  // Stone edging
  const curbGeo = new THREE.BoxGeometry(width + 0.3, 0.24, depth + 0.3);
  const curb = new THREE.Mesh(curbGeo, palette.whiteMarble);
  curb.position.y = 0.08;
  island.add(curb);

  return island;
}
