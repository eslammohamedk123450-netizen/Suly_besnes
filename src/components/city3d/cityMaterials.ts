/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

/**
 * Procedural texture cache to avoid memory leaks and reduce draw calls
 */
let asphaltTexture: THREE.CanvasTexture | null = null;
let solarTexture: THREE.CanvasTexture | null = null;
let cautionTexture: THREE.CanvasTexture | null = null;
let windowGlowTexture: THREE.CanvasTexture | null = null;

/**
 * Creates procedural asphalt texture with subtle road noise
 */
export function getOrCreateAsphaltTexture(maxAnisotropy = 4): THREE.Texture {
  if (asphaltTexture) return asphaltTexture;

  if (typeof document === 'undefined') {
    const data = new Uint8Array([30, 41, 59, 255]);
    const tex = new THREE.DataTexture(data, 1, 1);
    tex.needsUpdate = true;
    return tex;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 128, 128);

    // Subtle grain
    for (let i = 0; i < 400; i++) {
      const x = Math.floor(Math.random() * 128);
      const y = Math.floor(Math.random() * 128);
      const shade = Math.random() > 0.5 ? 40 : 20;
      ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade + 10}, 0.25)`;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  asphaltTexture = new THREE.CanvasTexture(canvas);
  asphaltTexture.wrapS = THREE.RepeatWrapping;
  asphaltTexture.wrapT = THREE.RepeatWrapping;
  asphaltTexture.repeat.set(4, 4);
  asphaltTexture.colorSpace = THREE.SRGBColorSpace;
  asphaltTexture.anisotropy = maxAnisotropy;
  return asphaltTexture;
}

/**
 * Creates diagonal hazard / construction warning stripes
 */
export function getOrCreateCautionTexture(): THREE.Texture {
  if (cautionTexture) return cautionTexture;

  if (typeof document === 'undefined') {
    const data = new Uint8Array([234, 179, 8, 255]);
    const tex = new THREE.DataTexture(data, 1, 1);
    tex.needsUpdate = true;
    return tex;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#eab308';
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#18181b';

    ctx.beginPath();
    for (let i = -64; i < 128; i += 32) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 16, 0);
      ctx.lineTo(i + 16 + 64, 64);
      ctx.lineTo(i + 64, 64);
      ctx.closePath();
    }
    ctx.fill();
  }

  cautionTexture = new THREE.CanvasTexture(canvas);
  cautionTexture.wrapS = THREE.RepeatWrapping;
  cautionTexture.wrapT = THREE.RepeatWrapping;
  cautionTexture.colorSpace = THREE.SRGBColorSpace;
  return cautionTexture;
}

/**
 * Reusable material registry to eliminate per-object allocations and GPU state churn
 */
export interface CityMaterialPalette {
  // Ground & Roads
  ground: THREE.MeshStandardMaterial;
  asphalt: THREE.MeshStandardMaterial;
  sidewalk: THREE.MeshStandardMaterial;
  curbGold: THREE.MeshStandardMaterial;
  roadLine: THREE.MeshBasicMaterial;

  // Architectural Luxury Theme (Navy & Gold)
  imperialGold: THREE.MeshStandardMaterial;
  brushedGold: THREE.MeshStandardMaterial;
  navyStructure: THREE.MeshStandardMaterial;
  slateStructure: THREE.MeshStandardMaterial;
  curtainGlass: THREE.MeshStandardMaterial;
  litGlassNight: THREE.MeshStandardMaterial;

  // Commercial & Industrial Materials
  industrialSteel: THREE.MeshStandardMaterial;
  corrugatedMetal: THREE.MeshStandardMaterial;
  industrialBrick: THREE.MeshStandardMaterial;
  copperAccent: THREE.MeshStandardMaterial;
  whiteMarble: THREE.MeshStandardMaterial;

  // Construction Stages Materials
  constructionYellow: THREE.MeshStandardMaterial;
  craneSteel: THREE.MeshStandardMaterial;
  dirtExcavation: THREE.MeshStandardMaterial;
  safetyOrange: THREE.MeshStandardMaterial;
  scaffoldingWire: THREE.MeshBasicMaterial;
  constructionCaution: THREE.MeshStandardMaterial;

  // Plot Signage & Boundary Indicators
  plotBoundaryUnlocked: THREE.MeshBasicMaterial;
  plotBoundaryLocked: THREE.MeshBasicMaterial;
  plotSignBoard: THREE.MeshStandardMaterial;
  plotSignLocked: THREE.MeshStandardMaterial;
  plotSignPaperwork: THREE.MeshStandardMaterial;
  plotHoloRing: THREE.MeshBasicMaterial;

  // Vehicles & Vegetation
  carColors: THREE.MeshStandardMaterial[];
  carGlass: THREE.MeshStandardMaterial;
  carHeadlight: THREE.MeshBasicMaterial;
  carTaillight: THREE.MeshBasicMaterial;
  foliageGreen: THREE.MeshStandardMaterial;
  foliageDarkGreen: THREE.MeshStandardMaterial;
  treeTrunk: THREE.MeshStandardMaterial;
}

export function createCityMaterialPalette(
  isNightMode: boolean,
  isSoftwareGl: boolean
): CityMaterialPalette {
  const cautionTex = getOrCreateCautionTexture();

  return {
    ground: new THREE.MeshStandardMaterial({
      color: isNightMode ? '#080d1a' : '#0f172a',
      roughness: 0.95,
      metalness: 0.05,
    }),
    asphalt: new THREE.MeshStandardMaterial({
      color: isNightMode ? '#151d2e' : '#1e293b',
      roughness: 0.85,
      metalness: 0.2,
    }),
    sidewalk: new THREE.MeshStandardMaterial({
      color: isNightMode ? '#1e293b' : '#334155',
      roughness: 0.75,
      metalness: 0.15,
    }),
    curbGold: new THREE.MeshStandardMaterial({
      color: '#d97706',
      roughness: 0.3,
      metalness: 0.8,
    }),
    roadLine: new THREE.MeshBasicMaterial({
      color: '#f59e0b',
    }),

    // Luxury Empire theme
    imperialGold: new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      roughness: 0.18,
      metalness: 0.92,
    }),
    brushedGold: new THREE.MeshStandardMaterial({
      color: '#d97706',
      roughness: 0.28,
      metalness: 0.85,
    }),
    navyStructure: new THREE.MeshStandardMaterial({
      color: isNightMode ? '#0a1020' : '#0f172a',
      roughness: 0.35,
      metalness: 0.65,
    }),
    slateStructure: new THREE.MeshStandardMaterial({
      color: isNightMode ? '#1e293b' : '#334155',
      roughness: 0.45,
      metalness: 0.5,
    }),
    curtainGlass: new THREE.MeshStandardMaterial({
      color: isNightMode ? '#0284c7' : '#38bdf8',
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.88,
    }),
    litGlassNight: new THREE.MeshStandardMaterial({
      color: isNightMode ? '#38bdf8' : '#60a5fa',
      emissive: isNightMode ? new THREE.Color('#0284c7') : new THREE.Color('#000000'),
      emissiveIntensity: isNightMode ? 0.35 : 0,
      roughness: 0.15,
      metalness: 0.8,
    }),

    // Materials for industries
    industrialSteel: new THREE.MeshStandardMaterial({
      color: '#64748b',
      roughness: 0.3,
      metalness: 0.85,
    }),
    corrugatedMetal: new THREE.MeshStandardMaterial({
      color: '#475569',
      roughness: 0.5,
      metalness: 0.7,
    }),
    industrialBrick: new THREE.MeshStandardMaterial({
      color: '#991b1b',
      roughness: 0.9,
      metalness: 0.1,
    }),
    copperAccent: new THREE.MeshStandardMaterial({
      color: '#b45309',
      roughness: 0.3,
      metalness: 0.8,
    }),
    whiteMarble: new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.25,
      metalness: 0.2,
    }),

    // Construction stages
    constructionYellow: new THREE.MeshStandardMaterial({
      color: '#eab308',
      roughness: 0.35,
      metalness: 0.7,
    }),
    craneSteel: new THREE.MeshStandardMaterial({
      color: '#ca8a04',
      roughness: 0.4,
      metalness: 0.8,
    }),
    dirtExcavation: new THREE.MeshStandardMaterial({
      color: '#713f12',
      roughness: 0.95,
      metalness: 0.05,
    }),
    safetyOrange: new THREE.MeshStandardMaterial({
      color: '#ea580c',
      roughness: 0.4,
      metalness: 0.4,
    }),
    scaffoldingWire: new THREE.MeshBasicMaterial({
      color: '#f59e0b',
      wireframe: true,
    }),
    constructionCaution: new THREE.MeshStandardMaterial({
      map: cautionTex,
      roughness: 0.5,
      metalness: 0.2,
    }),

    // Plot signs
    plotBoundaryUnlocked: new THREE.MeshBasicMaterial({
      color: '#f59e0b',
      wireframe: true,
    }),
    plotBoundaryLocked: new THREE.MeshBasicMaterial({
      color: '#ef4444',
      wireframe: true,
    }),
    plotSignBoard: new THREE.MeshStandardMaterial({
      color: '#d97706',
      roughness: 0.3,
      metalness: 0.6,
    }),
    plotSignLocked: new THREE.MeshStandardMaterial({
      color: '#dc2626',
      roughness: 0.4,
      metalness: 0.4,
    }),
    plotSignPaperwork: new THREE.MeshStandardMaterial({
      color: '#0284c7',
      roughness: 0.4,
      metalness: 0.5,
    }),
    plotHoloRing: new THREE.MeshBasicMaterial({
      color: '#fbbf24',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    }),

    // Vehicles and greenery
    carColors: [
      new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.2, metalness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: '#38bdf8', roughness: 0.2, metalness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: '#10b981', roughness: 0.2, metalness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: '#e11d48', roughness: 0.2, metalness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.15, metalness: 0.85 }),
    ],
    carGlass: new THREE.MeshStandardMaterial({
      color: '#0f172a',
      roughness: 0.1,
      metalness: 0.9,
    }),
    carHeadlight: new THREE.MeshBasicMaterial({ color: '#fef08a' }),
    carTaillight: new THREE.MeshBasicMaterial({ color: '#ef4444' }),
    foliageGreen: new THREE.MeshStandardMaterial({
      color: '#15803d',
      roughness: 0.7,
      metalness: 0.1,
    }),
    foliageDarkGreen: new THREE.MeshStandardMaterial({
      color: '#166534',
      roughness: 0.7,
      metalness: 0.1,
    }),
    treeTrunk: new THREE.MeshStandardMaterial({
      color: '#78350f',
      roughness: 0.9,
      metalness: 0.1,
    }),
  };
}

export function disposeCityMaterialPalette(palette: CityMaterialPalette) {
  Object.values(palette).forEach((mat) => {
    if (Array.isArray(mat)) {
      mat.forEach((m) => m.dispose());
    } else if (mat && typeof mat.dispose === 'function') {
      mat.dispose();
    }
  });
}
