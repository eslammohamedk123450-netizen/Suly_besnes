/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import type { CityMaterialPalette } from './cityMaterials';

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
}

/**
 * Builds the modular road grid, pedestrian sidewalks, medians, and street lamps
 */
export function buildCityRoadNetwork(
  palette: CityMaterialPalette,
  isSoftwareGl: boolean,
  isNightMode: boolean
): CityRoadNetworkResult {
  const roadGroup = new THREE.Group();
  const vehicles: TrafficVehicle[] = [];

  // 1. Central Grand Avenue (Z axis: North-South)
  const mainAvenueGeo = new THREE.BoxGeometry(8.5, 0.1, 150);
  const mainAvenue = new THREE.Mesh(mainAvenueGeo, palette.asphalt);
  mainAvenue.position.set(0, 0.05, 0);
  mainAvenue.receiveShadow = !isSoftwareGl;
  roadGroup.add(mainAvenue);

  // Sidewalks along Central Grand Avenue
  [-4.8, 4.8].forEach((sx) => {
    const sidewalk = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.18, 150),
      palette.sidewalk
    );
    sidewalk.position.set(sx, 0.09, 0);
    roadGroup.add(sidewalk);

    // Gold curb trim
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.22, 150), palette.curbGold);
    curb.position.set(sx + (sx > 0 ? -0.7 : 0.7), 0.11, 0);
    roadGroup.add(curb);
  });

  // 2. Cross Boulevard (X axis: East-West)
  const crossBoulevardGeo = new THREE.BoxGeometry(150, 0.1, 8.5);
  const crossBoulevard = new THREE.Mesh(crossBoulevardGeo, palette.asphalt);
  crossBoulevard.position.set(0, 0.05, 0);
  crossBoulevard.receiveShadow = !isSoftwareGl;
  roadGroup.add(crossBoulevard);

  [-4.8, 4.8].forEach((sz) => {
    const sidewalk = new THREE.Mesh(
      new THREE.BoxGeometry(150, 0.18, 1.4),
      palette.sidewalk
    );
    sidewalk.position.set(0, 0.09, sz);
    roadGroup.add(sidewalk);
  });

  // 3. Secondary Ring Roads (North & South avenues)
  [-22, 18].forEach((rz) => {
    const ringRoad = new THREE.Mesh(new THREE.BoxGeometry(150, 0.1, 6.5), palette.asphalt);
    ringRoad.position.set(0, 0.05, rz);
    roadGroup.add(ringRoad);
  });

  // Secondary Cross Streets (West & East avenues)
  [-28, 28].forEach((rx) => {
    const crossSt = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.1, 150), palette.asphalt);
    crossSt.position.set(rx, 0.05, 0);
    roadGroup.add(crossSt);
  });

  // 4. Road Lane Markings (Dashed gold/amber dividers)
  const dashGeo = new THREE.BoxGeometry(0.3, 0.12, 2.4);
  for (let z = -70; z <= 70; z += 6) {
    if (Math.abs(z) > 4) {
      const dashZ = new THREE.Mesh(dashGeo, palette.roadLine);
      dashZ.position.set(0, 0.11, z);
      roadGroup.add(dashZ);
    }
  }

  const dashCrossGeo = new THREE.BoxGeometry(2.4, 0.12, 0.3);
  for (let x = -70; x <= 70; x += 6) {
    if (Math.abs(x) > 4) {
      const dashX = new THREE.Mesh(dashCrossGeo, palette.roadLine);
      dashX.position.set(x, 0.11, 0);
      roadGroup.add(dashX);
    }
  }

  // 5. Modern Street Lamps with night glow
  const lampPostGeo = new THREE.CylinderGeometry(0.08, 0.1, 3.8, 6);
  const lampArmGeo = new THREE.BoxGeometry(0.9, 0.08, 0.08);
  const lampHeadGeo = new THREE.BoxGeometry(0.3, 0.12, 0.2);

  const lampPositions = [
    [-5.6, -14],
    [5.6, -14],
    [-5.6, 14],
    [5.6, 14],
    [-14, -5.6],
    [14, -5.6],
    [-14, 5.6],
    [14, 5.6],
    [-5.6, -35],
    [5.6, -35],
    [-28, -14],
    [28, -14],
  ];

  lampPositions.forEach(([lx, lz]) => {
    const lamp = new THREE.Group();
    lamp.position.set(lx, 0, lz);

    const post = new THREE.Mesh(lampPostGeo, palette.industrialSteel);
    post.position.y = 1.9;
    lamp.add(post);

    const arm = new THREE.Mesh(lampArmGeo, palette.industrialSteel);
    arm.position.set(lx > 0 ? -0.4 : 0.4, 3.75, 0);
    lamp.add(arm);

    const head = new THREE.Mesh(
      lampHeadGeo,
      isNightMode ? palette.carHeadlight : palette.industrialSteel
    );
    head.position.set(lx > 0 ? -0.8 : 0.8, 3.7, 0);
    lamp.add(head);

    roadGroup.add(lamp);
  });

  // 6. Landscaped Palm Trees & Planters
  const treeTrunkGeo = new THREE.CylinderGeometry(0.18, 0.24, 2.2, 6);
  const treeCrownGeo = new THREE.ConeGeometry(1.2, 2.4, 7);
  const planterGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.4, 8);

  const treeCoordinates = [
    [-6.5, -6.5],
    [6.5, -6.5],
    [-6.5, 6.5],
    [6.5, 6.5],
    [-12, -12],
    [12, -12],
    [-12, 12],
    [12, 12],
    [-32, -6.5],
    [32, -6.5],
    [-6.5, -45],
    [6.5, -45],
  ];

  treeCoordinates.forEach(([tx, tz]) => {
    const tree = new THREE.Group();
    tree.position.set(tx, 0, tz);

    const planter = new THREE.Mesh(planterGeo, palette.slateStructure);
    planter.position.y = 0.2;
    tree.add(planter);

    const trunk = new THREE.Mesh(treeTrunkGeo, palette.treeTrunk);
    trunk.position.y = 1.3;
    trunk.castShadow = !isSoftwareGl;
    tree.add(trunk);

    const leaves1 = new THREE.Mesh(treeCrownGeo, palette.foliageGreen);
    leaves1.position.y = 2.6;
    leaves1.castShadow = !isSoftwareGl;
    tree.add(leaves1);

    const leaves2 = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.8, 7), palette.foliageDarkGreen);
    leaves2.position.y = 3.6;
    tree.add(leaves2);

    roadGroup.add(tree);
  });

  // 7. Low-Poly Animated Traffic (Sedans, SUVs, Delivery Vans)
  const carColors = palette.carColors;
  for (let i = 0; i < 6; i++) {
    const carGroup = new THREE.Group();
    const colorMat = carColors[i % carColors.length];

    // Chassis body
    const isVan = i === 2 || i === 5;
    const bodyW = 1.4;
    const bodyH = isVan ? 1.0 : 0.65;
    const bodyL = isVan ? 2.8 : 2.2;

    const body = new THREE.Mesh(new THREE.BoxGeometry(bodyW, bodyH, bodyL), colorMat);
    body.position.y = bodyH / 2 + 0.2;
    body.castShadow = !isSoftwareGl;
    carGroup.add(body);

    // Cabin
    if (!isVan) {
      const cab = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 1.2), palette.carGlass);
      cab.position.set(0, 0.9, -0.1);
      carGroup.add(cab);
    }

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.15, 8);
    const wheelMat = palette.slateStructure;
    [-0.7, 0.7].forEach((wx) => {
      [-0.8, 0.8].forEach((wz) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.2, wz);
        carGroup.add(wheel);
      });
    });

    // Headlights and Taillights
    const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.12, 0.05), palette.carHeadlight);
    hl1.position.set(-0.45, 0.45, bodyL / 2 + 0.01);
    carGroup.add(hl1);

    const hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.12, 0.05), palette.carHeadlight);
    hl2.position.set(0.45, 0.45, bodyL / 2 + 0.01);
    carGroup.add(hl2);

    const tl1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.12, 0.05), palette.carTaillight);
    tl1.position.set(-0.45, 0.45, -bodyL / 2 - 0.01);
    carGroup.add(tl1);

    const tl2 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.12, 0.05), palette.carTaillight);
    tl2.position.set(0.45, 0.45, -bodyL / 2 - 0.01);
    carGroup.add(tl2);

    // Place on roads
    if (i < 3) {
      // Moving North-South along Z avenue
      const dir: 1 | -1 = i % 2 === 0 ? 1 : -1;
      const laneX = dir === 1 ? 2.0 : -2.0;
      carGroup.position.set(laneX, 0, -50 + i * 35);
      carGroup.rotation.y = dir === 1 ? 0 : Math.PI;

      vehicles.push({
        mesh: carGroup,
        axis: 'z',
        dir,
        speed: 0.14 + (i * 0.03),
        min: -65,
        max: 65,
        laneOffset: laneX,
      });
    } else {
      // Moving East-West along X boulevard
      const dir: 1 | -1 = i % 2 === 0 ? 1 : -1;
      const laneZ = dir === 1 ? 2.0 : -2.0;
      carGroup.position.set(-50 + (i - 3) * 35, 0, laneZ);
      carGroup.rotation.y = dir === 1 ? Math.PI / 2 : -Math.PI / 2;

      vehicles.push({
        mesh: carGroup,
        axis: 'x',
        dir,
        speed: 0.14 + ((i - 3) * 0.03),
        min: -65,
        max: 65,
        laneOffset: laneZ,
      });
    }

    roadGroup.add(carGroup);
  }

  return { group: roadGroup, vehicles };
}
