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
let officeWindowTextures: { day: THREE.CanvasTexture | null; night: THREE.CanvasTexture | null } = {
  day: null,
  night: null,
};
let paverTexture: THREE.CanvasTexture | null = null;
let containerTexture: THREE.CanvasTexture | null = null;
let groundTextures: { day: THREE.CanvasTexture | null; night: THREE.CanvasTexture | null } = {
  day: null,
  night: null,
};
let skyTextures: { day: THREE.CanvasTexture | null; night: THREE.CanvasTexture | null } = {
  day: null,
  night: null,
};

/**
 * Creates procedural high-rise office window facade texture with illuminated offices
 */
/**
 * Creates high-detail procedural turf / parkland terrain texture
 * Gives the entire tycoon city a vibrant, lush, inviting foundation
 */
export function getOrCreateGroundTexture(isNightMode = false): THREE.Texture {
  const mode = isNightMode ? 'night' : 'day';
  if (groundTextures[mode]) return groundTextures[mode]!;

  if (typeof document === 'undefined') {
    const data = isNightMode ? new Uint8Array([7, 21, 33, 255]) : new Uint8Array([34, 197, 94, 255]);
    const tex = new THREE.DataTexture(data, 1, 1);
    tex.needsUpdate = true;
    return tex;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    if (isNightMode) {
      ctx.fillStyle = '#071521';
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = '#0e2438';
      ctx.lineWidth = 2;
      for (let x = 0; x < 512; x += 64) {
        for (let y = 0; y < 512; y += 64) {
          ctx.strokeRect(x, y, 64, 64);
        }
      }
    } else {
      // Vibrant, cheerful tycoon lawn parkland with alternating mowed grass bands
      ctx.fillStyle = '#22c55e'; // Vibrant fresh grass
      ctx.fillRect(0, 0, 512, 512);

      // Alternating lawn stripes (classic stadium/park manicured look)
      ctx.fillStyle = '#16a34a';
      for (let y = 0; y < 512; y += 64) {
        ctx.fillRect(0, y, 512, 32);
      }

      // Subtle fine grass stipples for depth
      for (let i = 0; i < 1500; i++) {
        const x = Math.floor(Math.random() * 512);
        const y = Math.floor(Math.random() * 512);
        const isLight = Math.random() > 0.5;
        ctx.fillStyle = isLight ? 'rgba(134, 239, 172, 0.45)' : 'rgba(21, 128, 61, 0.35)';
        ctx.fillRect(x, y, 2, 2);
      }

      // Very soft grid border to give player sense of city scale
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 512; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }
      for (let y = 0; y < 512; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(24, 24);
  texture.colorSpace = THREE.SRGBColorSpace;
  groundTextures[mode] = texture;
  return texture;
}

export function getOrCreateOfficeWindowTexture(isNightMode = true): THREE.Texture {
  const mode = isNightMode ? 'night' : 'day';
  if (officeWindowTextures[mode]) return officeWindowTextures[mode]!;

  if (typeof document === 'undefined') {
    const data = new Uint8Array([14, 165, 233, 255]);
    const tex = new THREE.DataTexture(data, 1, 1);
    tex.needsUpdate = true;
    return tex;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Dark mullion background
    ctx.fillStyle = '#0b1329';
    ctx.fillRect(0, 0, 256, 256);

    const cols = 8;
    const rows = 8;
    const cellW = 256 / cols;
    const cellH = 256 / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cellW + 3;
        const y = r * cellH + 3;
        const w = cellW - 6;
        const h = cellH - 6;

        const isLit = isNightMode && (r + c * 3) % 3 !== 0;
        if (isLit) {
          // Warm executive office glow or cool cyan LED glow
          const warm = (r * 7 + c) % 2 === 0;
          ctx.fillStyle = warm ? 'rgba(254, 240, 138, 0.85)' : 'rgba(56, 189, 248, 0.75)';
          ctx.fillRect(x, y, w, h);

          // Subtle horizontal blind / office desk shadow
          ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
          ctx.fillRect(x, y + h * 0.6, w, h * 0.4);
        } else {
          // Dark reflective glass
          ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
          ctx.fillRect(x, y, w, h);
        }

        // Window pane interior bevel
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
      }
    }

    // Floor division horizontal bands
    ctx.fillStyle = '#1e293b';
    for (let r = 0; r <= rows; r++) {
      ctx.fillRect(0, r * cellH - 1, 256, 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  officeWindowTextures[mode] = texture;
  return texture;
}

/**
 * Lightweight equirectangular sky backdrop. It gives the procedural city a
 * cinematic horizon without adding an HDR download or another runtime asset.
 */
export function getOrCreateSkyTexture(isNightMode = true): THREE.Texture {
  const mode = isNightMode ? 'night' : 'day';
  if (skyTextures[mode]) return skyTextures[mode]!;

  if (typeof document === 'undefined') {
    const data = new Uint8Array([7, 11, 20, 255]);
    const tex = new THREE.DataTexture(data, 1, 1);
    tex.needsUpdate = true;
    return tex;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    if (isNightMode) {
      gradient.addColorStop(0, '#020617');
      gradient.addColorStop(0.48, '#0b1630');
      gradient.addColorStop(0.76, '#172554');
      gradient.addColorStop(1, '#0f172a');
    } else {
      // Radiant, sunny Mediterranean sky:
      // Vibrant Azure -> Cerulean Blue -> Soft Sunny Blue -> Golden Horizon Glow
      gradient.addColorStop(0, '#0284c7');     // Rich deep azure zenith
      gradient.addColorStop(0.35, '#38bdf8');  // Cheerful sky blue
      gradient.addColorStop(0.68, '#7dd3fc');  // Soft sunny blue
      gradient.addColorStop(0.88, '#bae6fd');  // Bright horizon glow
      gradient.addColorStop(1.0, '#f0f9ff');   // Luminous warm horizon light (Zero grey!)
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (isNightMode) {
      const stars = [
        [0.08, 0.12], [0.12, 0.18], [0.19, 0.08], [0.24, 0.31], [0.31, 0.22],
        [0.38, 0.14], [0.45, 0.28], [0.51, 0.25], [0.58, 0.38], [0.63, 0.19],
        [0.67, 0.12], [0.72, 0.33], [0.78, 0.29], [0.85, 0.11], [0.9, 0.17],
      ];
      ctx.fillStyle = 'rgba(255, 248, 210, 0.85)';
      stars.forEach(([x, y], index) => {
        ctx.beginPath();
        ctx.arc(x * canvas.width, y * canvas.height, index % 4 === 0 ? 2.5 : 1.5, 0, Math.PI * 2);
        ctx.fill();
      });
    } else {
      // Cheerful fluffy clouds across the upper horizon
      const clouds = [
        [0.08, 0.40, 70, 22], [0.12, 0.38, 55, 25],
        [0.28, 0.45, 90, 26], [0.33, 0.42, 65, 28],
        [0.55, 0.38, 110, 30], [0.60, 0.35, 75, 28],
        [0.78, 0.44, 85, 24], [0.82, 0.42, 60, 22],
        [0.94, 0.41, 70, 20],
      ];
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      clouds.forEach(([cx, cy, rx, ry]) => {
        ctx.beginPath();
        ctx.ellipse(cx * canvas.width, cy * canvas.height, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      // Soft bright haze layer near the bottom
      const haze = ctx.createLinearGradient(0, canvas.height * 0.75, 0, canvas.height);
      haze.addColorStop(0, 'rgba(255, 255, 255, 0)');
      haze.addColorStop(1, 'rgba(255, 255, 255, 0.45)');
      ctx.fillStyle = haze;
      ctx.fillRect(0, canvas.height * 0.75, canvas.width, canvas.height * 0.25);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  skyTextures[mode] = texture;
  return texture;
}

/**
 * Creates procedural plaza paver / cobblestone tile texture
 */
export function getOrCreatePaverTexture(): THREE.Texture {
  if (paverTexture) return paverTexture;

  if (typeof document === 'undefined') {
    const data = new Uint8Array([51, 65, 85, 255]);
    const tex = new THREE.DataTexture(data, 1, 1);
    tex.needsUpdate = true;
    return tex;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Warm limestone travertine paver stones
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 128, 128);

    const tileSize = 16;
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.2;

    for (let x = 0; x <= 128; x += tileSize) {
      for (let y = 0; y <= 128; y += tileSize) {
        ctx.strokeRect(x, y, tileSize, tileSize);
        // Subtle warm sun-baked limestone tint variance
        const variance = Math.floor((Math.sin(x * 12 + y * 7) + 1) * 10);
        ctx.fillStyle = `rgba(254, 243, 199, ${0.15 + variance * 0.015})`;
        ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
      }
    }
  }

  paverTexture = new THREE.CanvasTexture(canvas);
  paverTexture.wrapS = THREE.RepeatWrapping;
  paverTexture.wrapT = THREE.RepeatWrapping;
  paverTexture.repeat.set(4, 4);
  paverTexture.colorSpace = THREE.SRGBColorSpace;
  return paverTexture;
}

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

let sulyBrandTexture: THREE.CanvasTexture | null = null;
export function getOrCreateSulyBrandTexture(): THREE.Texture {
  if (sulyBrandTexture) return sulyBrandTexture;
  if (typeof document === 'undefined') {
    const data = new Uint8Array([18, 35, 71, 255]);
    const tex = new THREE.DataTexture(data, 1, 1);
    tex.needsUpdate = true;
    return tex;
  }
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0f1d38';
    ctx.fillRect(0, 0, 512, 256);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 8;
    ctx.strokeRect(12, 12, 488, 232);

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, 468, 212);

    [[22, 22], [490, 22], [22, 234], [490, 234]].forEach(([cx, cy]) => {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.font = 'bold 78px "Times New Roman", "Cinzel", "Cairo", serif';
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SULY', 256, 95);

    ctx.font = 'bold 22px "Arial", "Cairo", sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('TECHNOLOGIES', 256, 145);

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(256, 185, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(256 - 16, 185);
    ctx.quadraticCurveTo(256 - 80, 175, 256 - 150, 180);
    ctx.quadraticCurveTo(256 - 80, 195, 256 - 16, 192);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(256 + 16, 185);
    ctx.quadraticCurveTo(256 + 80, 175, 256 + 150, 180);
    ctx.quadraticCurveTo(256 + 80, 195, 256 + 16, 192);
    ctx.fill();
  }
  sulyBrandTexture = new THREE.CanvasTexture(canvas);
  sulyBrandTexture.colorSpace = THREE.SRGBColorSpace;
  return sulyBrandTexture;
}

let ankhReliefTexture: THREE.CanvasTexture | null = null;
export function getOrCreateAnkhReliefTexture(): THREE.Texture {
  if (ankhReliefTexture) return ankhReliefTexture;
  if (typeof document === 'undefined') {
    const data = new Uint8Array([18, 35, 71, 255]);
    const tex = new THREE.DataTexture(data, 1, 1);
    tex.needsUpdate = true;
    return tex;
  }
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0f1d38';
    ctx.fillRect(0, 0, 128, 512);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 116, 500);

    ctx.font = 'bold 54px serif';
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let y = 60; y < 500; y += 100) {
      ctx.fillText('☥', 64, y);
    }
  }
  ankhReliefTexture = new THREE.CanvasTexture(canvas);
  ankhReliefTexture.wrapS = THREE.RepeatWrapping;
  ankhReliefTexture.wrapT = THREE.RepeatWrapping;
  ankhReliefTexture.colorSpace = THREE.SRGBColorSpace;
  return ankhReliefTexture;
}

/**
 * Reusable material registry to eliminate per-object allocations and GPU state churn
 */
export interface CityMaterialPalette {
  // Ground & Roads
  ground: THREE.MeshStandardMaterial;
  asphalt: THREE.MeshStandardMaterial;
  sidewalk: THREE.MeshStandardMaterial;
  plazaPaver: THREE.MeshStandardMaterial;
  curbGold: THREE.MeshStandardMaterial;
  roadLine: THREE.MeshBasicMaterial;
  roadZebra: THREE.MeshBasicMaterial;

  // Architectural Luxury Theme (Navy & Gold)
  imperialGold: THREE.MeshStandardMaterial;
  brushedGold: THREE.MeshStandardMaterial;
  navyStructure: THREE.MeshStandardMaterial;
  slateStructure: THREE.MeshStandardMaterial;
  curtainGlass: THREE.MeshStandardMaterial;
  litGlassNight: THREE.MeshStandardMaterial;
  officeWindowsLit: THREE.MeshStandardMaterial;
  facadeConcrete: THREE.MeshStandardMaterial;
  chromeMetal: THREE.MeshStandardMaterial;
  waterSurface: THREE.MeshStandardMaterial;
  sulyBrandMat: THREE.MeshStandardMaterial;
  ankhReliefMat: THREE.MeshStandardMaterial;
  royalNavyMat: THREE.MeshStandardMaterial;
  warmAmberLitGlass: THREE.MeshStandardMaterial;

  // Commercial & Industrial Materials
  industrialSteel: THREE.MeshStandardMaterial;
  corrugatedMetal: THREE.MeshStandardMaterial;
  industrialBrick: THREE.MeshStandardMaterial;
  copperAccent: THREE.MeshStandardMaterial;
  whiteMarble: THREE.MeshStandardMaterial;
  neonCyan: THREE.MeshBasicMaterial;
  neonPurple: THREE.MeshBasicMaterial;
  neonGreen: THREE.MeshBasicMaterial;
  neonGold: THREE.MeshBasicMaterial;
  neonRed: THREE.MeshBasicMaterial;
  obsidianFortress: THREE.MeshStandardMaterial;
  harborWater: THREE.MeshStandardMaterial;
  poolTurquoise: THREE.MeshStandardMaterial;
  containerRed: THREE.MeshStandardMaterial;
  containerBlue: THREE.MeshStandardMaterial;
  containerGreen: THREE.MeshStandardMaterial;
  containerYellow: THREE.MeshStandardMaterial;
  beaconGlow: THREE.MeshBasicMaterial;

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
  tireRubber: THREE.MeshStandardMaterial;
  carHeadlight: THREE.MeshBasicMaterial;
  carTaillight: THREE.MeshBasicMaterial;
  amberIndicator: THREE.MeshBasicMaterial;
  foliageGreen: THREE.MeshStandardMaterial;
  foliageDarkGreen: THREE.MeshStandardMaterial;
  grassLawn: THREE.MeshStandardMaterial;
  treeTrunk: THREE.MeshStandardMaterial;
}

export function createCityMaterialPalette(
  isNightMode: boolean,
  isSoftwareGl: boolean
): CityMaterialPalette {
  const cautionTex = getOrCreateCautionTexture();
  const asphaltTex = getOrCreateAsphaltTexture(isSoftwareGl ? 1 : 4);
  const officeWindowTex = getOrCreateOfficeWindowTexture(isNightMode);
  const paverTex = getOrCreatePaverTexture();

  return {
    ground: new THREE.MeshStandardMaterial({
      map: getOrCreateGroundTexture(isNightMode),
      color: isNightMode ? '#071521' : '#ffffff',
      roughness: 0.85,
      metalness: 0.04,
    }),
    asphalt: new THREE.MeshStandardMaterial({
      map: asphaltTex,
      color: isNightMode ? '#0f172a' : '#1e293b',
      roughness: 0.72,
      metalness: 0.16,
    }),
    sidewalk: new THREE.MeshStandardMaterial({
      color: isNightMode ? '#1e293b' : '#f1f5f9',
      roughness: 0.58,
      metalness: 0.1,
    }),
    plazaPaver: new THREE.MeshStandardMaterial({
      map: paverTex,
      color: isNightMode ? '#1e293b' : '#ffffff',
      roughness: 0.55,
      metalness: 0.12,
    }),
    curbGold: new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      roughness: 0.25,
      metalness: 0.88,
    }),
    roadLine: new THREE.MeshBasicMaterial({
      color: '#f59e0b',
    }),
    roadZebra: new THREE.MeshBasicMaterial({
      color: '#f8fafc',
    }),

    // Luxury Empire theme
    imperialGold: new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      roughness: 0.22,
      metalness: 0.92,
    }),
    brushedGold: new THREE.MeshStandardMaterial({
      color: '#d97706',
      roughness: 0.32,
      metalness: 0.86,
    }),
    navyStructure: new THREE.MeshStandardMaterial({
      color: isNightMode ? '#091225' : '#1e293b',
      roughness: 0.3,
      metalness: 0.7,
    }),
    slateStructure: new THREE.MeshStandardMaterial({
      color: isNightMode ? '#1e293b' : '#334155',
      roughness: 0.45,
      metalness: 0.5,
    }),
    curtainGlass: new THREE.MeshStandardMaterial({
      color: isNightMode ? '#075985' : '#7dd3fc',
      roughness: 0.12,
      metalness: 0.86,
      transparent: true,
      opacity: 0.88,
    }),
    litGlassNight: new THREE.MeshStandardMaterial({
      color: isNightMode ? '#38bdf8' : '#bae6fd',
      emissive: isNightMode ? new THREE.Color('#0369a1') : new THREE.Color('#000000'),
      emissiveIntensity: isNightMode ? 0.28 : 0,
      roughness: 0.18,
      metalness: 0.72,
    }),
    officeWindowsLit: new THREE.MeshStandardMaterial({
      map: officeWindowTex,
      emissiveMap: officeWindowTex,
      emissive: isNightMode ? new THREE.Color('#ffffff') : new THREE.Color('#38bdf8'),
      emissiveIntensity: isNightMode ? 0.85 : 0.25,
      roughness: 0.2,
      metalness: 0.75,
    }),
    facadeConcrete: new THREE.MeshStandardMaterial({
      color: isNightMode ? '#334155' : '#e2e8f0',
      roughness: 0.75,
      metalness: 0.1,
    }),
    chromeMetal: new THREE.MeshStandardMaterial({
      color: '#f1f5f9',
      roughness: 0.1,
      metalness: 0.95,
    }),
    sulyBrandMat: new THREE.MeshStandardMaterial({
      map: getOrCreateSulyBrandTexture(),
      roughness: 0.25,
      metalness: 0.8,
    }),
    ankhReliefMat: new THREE.MeshStandardMaterial({
      map: getOrCreateAnkhReliefTexture(),
      roughness: 0.3,
      metalness: 0.7,
    }),
    royalNavyMat: new THREE.MeshStandardMaterial({
      color: '#102244',
      roughness: 0.35,
      metalness: 0.35,
    }),
    warmAmberLitGlass: new THREE.MeshStandardMaterial({
      color: '#fef08a',
      roughness: 0.1,
      metalness: 0.2,
      emissive: '#f59e0b',
      emissiveIntensity: isNightMode ? 0.9 : 0.45,
    }),
    waterSurface: new THREE.MeshStandardMaterial({
      color: '#06b6d4',
      emissive: new THREE.Color('#0284c7'),
      emissiveIntensity: isNightMode ? 0.35 : 0.08,
      roughness: 0.08,
      metalness: 0.6,
      transparent: true,
      opacity: 0.88,
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
      roughness: 0.2,
      metalness: 0.25,
    }),
    neonCyan: new THREE.MeshBasicMaterial({
      color: '#00f0ff',
    }),
    neonPurple: new THREE.MeshBasicMaterial({
      color: '#a855f7',
    }),
    neonGreen: new THREE.MeshBasicMaterial({
      color: '#10b981',
    }),
    neonGold: new THREE.MeshBasicMaterial({
      color: '#f59e0b',
    }),
    neonRed: new THREE.MeshBasicMaterial({
      color: '#ef4444',
    }),
    obsidianFortress: new THREE.MeshStandardMaterial({
      color: '#0f172a',
      roughness: 0.25,
      metalness: 0.85,
    }),
    harborWater: new THREE.MeshStandardMaterial({
      color: '#0369a1',
      roughness: 0.1,
      metalness: 0.6,
      transparent: true,
      opacity: 0.88,
    }),
    poolTurquoise: new THREE.MeshStandardMaterial({
      color: '#06b6d4',
      roughness: 0.05,
      metalness: 0.4,
      transparent: true,
      opacity: 0.85,
    }),
    containerRed: new THREE.MeshStandardMaterial({
      color: '#dc2626',
      roughness: 0.45,
      metalness: 0.6,
    }),
    containerBlue: new THREE.MeshStandardMaterial({
      color: '#2563eb',
      roughness: 0.45,
      metalness: 0.6,
    }),
    containerGreen: new THREE.MeshStandardMaterial({
      color: '#16a34a',
      roughness: 0.45,
      metalness: 0.6,
    }),
    containerYellow: new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      roughness: 0.45,
      metalness: 0.6,
    }),
    beaconGlow: new THREE.MeshBasicMaterial({
      color: '#fef08a',
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
      new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.2, metalness: 0.8 }), // Luxury Gold
      new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.2, metalness: 0.8 }), // Sapphire Blue
      new THREE.MeshStandardMaterial({ color: '#059669', roughness: 0.2, metalness: 0.8 }), // Emerald
      new THREE.MeshStandardMaterial({ color: '#e11d48', roughness: 0.2, metalness: 0.8 }), // Crimson
      new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.15, metalness: 0.85 }), // Pearl White
      new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.1, metalness: 0.9 }), // Obsidian Black
      new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.3, metalness: 0.5 }), // Taxi Yellow
    ],
    carGlass: new THREE.MeshStandardMaterial({
      color: '#0f172a',
      roughness: 0.05,
      metalness: 0.95,
      transparent: true,
      opacity: 0.85,
    }),
    tireRubber: new THREE.MeshStandardMaterial({
      color: '#18181b',
      roughness: 0.9,
      metalness: 0.05,
    }),
    carHeadlight: new THREE.MeshBasicMaterial({ color: '#fef08a' }),
    carTaillight: new THREE.MeshBasicMaterial({ color: '#ef4444' }),
    amberIndicator: new THREE.MeshBasicMaterial({ color: '#f59e0b' }),
    foliageGreen: new THREE.MeshStandardMaterial({
      color: '#22c55e',
      roughness: 0.65,
      metalness: 0.05,
    }),
    foliageDarkGreen: new THREE.MeshStandardMaterial({
      color: '#16a34a',
      roughness: 0.65,
      metalness: 0.05,
    }),
    grassLawn: new THREE.MeshStandardMaterial({
      color: '#22c55e',
      roughness: 0.85,
      metalness: 0.05,
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
