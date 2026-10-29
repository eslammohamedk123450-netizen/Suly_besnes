/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import type { CityMaterialPalette } from './cityMaterials';
import { CITY_WORLD_CONFIG } from './cityWorldData';

export interface PowerGridSystem {
  group: THREE.Group;
  update: (elapsedTime: number, selectedCoords: { x: number; z: number } | null) => void;
  selectionOpticsGroup: THREE.Group;
}

/**
 * Builds the subterranean power grid and interactive fiber-optic conduits
 */
export function buildCityPowerGrid(
  palette: CityMaterialPalette,
  isSoftwareGl: boolean,
  isNightMode: boolean
): PowerGridSystem {
  const group = new THREE.Group();
  group.name = 'city_power_grid_system';

  // 1. Subterranean Power Conduits (كابلات طاقة مضيئة تحت الأرض)
  // These lie in conduit trenches along the main avenues beneath street level
  const conduitMat = new THREE.MeshBasicMaterial({
    color: isNightMode ? '#38bdf8' : '#0284c7',
    transparent: true,
    opacity: 0.85,
  });

  const conduitGlowMat = new THREE.MeshBasicMaterial({
    color: isNightMode ? '#7dd3fc' : '#38bdf8',
    transparent: true,
    opacity: 0.5,
  });

  const subConduitsGroup = new THREE.Group();
  subConduitsGroup.name = 'subterranean_conduits';

  // North-South Main Conduits (under Central Grand Avenue & ring roads)
  const nsAvenueXPositions = [-65, -35, 0, 35, 65];
  const conduitRadius = 0.12;
  const avenueLength = 250;

  nsAvenueXPositions.forEach((posX) => {
    // Twin subterranean power conduits
    [-1.2, 1.2].forEach((offset) => {
      const geo = new THREE.CylinderGeometry(conduitRadius, conduitRadius, avenueLength, 6);
      const conduit = new THREE.Mesh(geo, conduitMat);
      conduit.position.set(posX + offset, 0.01, 0); // Sits flush in road expansion channel
      subConduitsGroup.add(conduit);

      // Expansion joint cover / subtle grating
      const coverGeo = new THREE.BoxGeometry(0.32, 0.02, avenueLength);
      const cover = new THREE.Mesh(coverGeo, palette.asphalt);
      cover.position.set(posX + offset, 0.02, 0);
      subConduitsGroup.add(cover);
    });
  });

  // East-West Cross Conduits
  const ewAvenueZPositions = [-65, -35, 0, 35, 65];
  const ewAvenueLength = CITY_WORLD_CONFIG.coastlineX * 2;

  ewAvenueZPositions.forEach((posZ) => {
    [-1.2, 1.2].forEach((offset) => {
      const geo = new THREE.CylinderGeometry(conduitRadius, conduitRadius, ewAvenueLength, 6);
      const conduit = new THREE.Mesh(geo, conduitMat);
      conduit.rotation.z = Math.PI / 2;
      conduit.position.set(0, 0.01, posZ + offset);
      subConduitsGroup.add(conduit);
    });
  });

  // Utility Substation Nodes at Intersections with glowing core
  const substationGeo = new THREE.CylinderGeometry(0.55, 0.65, 0.12, 12);
  const substationMat = new THREE.MeshStandardMaterial({
    color: '#0f172a',
    roughness: 0.3,
    metalness: 0.8,
  });

  nsAvenueXPositions.forEach((x) => {
    ewAvenueZPositions.forEach((z) => {
      const sub = new THREE.Mesh(substationGeo, substationMat);
      sub.position.set(x, 0.06, z);
      subConduitsGroup.add(sub);

      // Glowing central power core node
      const core = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.14, 12),
        conduitGlowMat
      );
      core.position.set(x, 0.07, z);
      subConduitsGroup.add(core);
    });
  });

  group.add(subConduitsGroup);

  // 2. Interactive Selection Fiber Optics (مسارات مضيئة تظهر فقط عند التحديد)
  // When an item is selected, glowing golden & cyan fiber optic conduits route from HQ (0,0) to selected coords
  const selectionOpticsGroup = new THREE.Group();
  selectionOpticsGroup.name = 'selection_fiber_optics';
  selectionOpticsGroup.visible = false;

  // Fiber Optic Line Materials
  const fiberGoldMat = new THREE.MeshBasicMaterial({
    color: '#fbbf24', // Brilliant imperial gold
    transparent: true,
    opacity: 0.95,
  });

  const fiberCyanMat = new THREE.MeshBasicMaterial({
    color: '#38bdf8', // Vibrant fiber optic cyan
    transparent: true,
    opacity: 0.95,
  });

  // Energy Pulse Spheres that travel along the fiber optics
  const pulses: THREE.Mesh[] = [];
  const pulseGeo = new THREE.SphereGeometry(0.32, 8, 8);
  const pulseMat = new THREE.MeshBasicMaterial({
    color: '#ffffff',
  });

  for (let i = 0; i < 6; i++) {
    const pulse = new THREE.Mesh(pulseGeo, pulseMat);
    selectionOpticsGroup.add(pulse);
    pulses.push(pulse);
  }

  // Active fiber optic mesh holders
  let activeSegments: THREE.Mesh[] = [];

  const update = (elapsedTime: number, selectedCoords: { x: number; z: number } | null) => {
    // Pulse subterranean conduits opacity subtly
    const conduitPulse = 0.75 + Math.sin(elapsedTime * 3.0) * 0.2;
    conduitMat.opacity = conduitPulse;
    conduitGlowMat.opacity = conduitPulse * 0.7;

    // Handle interactive fiber optics on selection
    if (!selectedCoords) {
      selectionOpticsGroup.visible = false;
      return;
    }

    selectionOpticsGroup.visible = true;

    // Remove previous segments
    activeSegments.forEach((seg) => {
      selectionOpticsGroup.remove(seg);
      seg.geometry.dispose();
    });
    activeSegments = [];

    const startX = 0; // HQ at city center
    const startZ = 0;
    const endX = selectedCoords.x;
    const endZ = selectedCoords.z;

    // Orthogonal Manhattan routing along city grid
    const points: THREE.Vector3[] = [
      new THREE.Vector3(startX, 0.25, startZ),
      new THREE.Vector3(endX, 0.25, startZ),
      new THREE.Vector3(endX, 0.25, endZ),
    ];

    // Build glowing fiber optic tube
    const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.05);
    const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.16, 8, false);
    const fiberMesh = new THREE.Mesh(tubeGeo, (Math.floor(elapsedTime * 2) % 2 === 0) ? fiberGoldMat : fiberCyanMat);
    selectionOpticsGroup.add(fiberMesh);
    activeSegments.push(fiberMesh);

    // Glowing outer halo tube
    const haloGeo = new THREE.TubeGeometry(curve, 32, 0.32, 8, false);
    const haloMat = new THREE.MeshBasicMaterial({
      color: '#facc15',
      transparent: true,
      opacity: 0.35,
      side: THREE.BackSide,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    selectionOpticsGroup.add(haloMesh);
    activeSegments.push(haloMesh);

    // Animate energy pulses along the curve
    pulses.forEach((p, idx) => {
      const t = (elapsedTime * 0.8 + idx * (1.0 / pulses.length)) % 1.0;
      const pt = curve.getPointAt(t);
      p.position.copy(pt);
      p.position.y += 0.08;
      const s = 0.8 + Math.sin(elapsedTime * 8.0 + idx) * 0.3;
      p.scale.set(s, s, s);
    });
  };

  group.add(selectionOpticsGroup);

  return {
    group,
    update,
    selectionOpticsGroup,
  };
}
