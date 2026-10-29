/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { createRealisticWaterMaterial, createFountainWaterMaterial } from './cityWaterShader';

/**
 * Procedural texture cache to avoid memory leaks and reduce draw calls
 */
export type TimeOfDay = 'sunset' | 'night' | 'day';

export function resolveTimeOfDay(time?: TimeOfDay | boolean): TimeOfDay {
  if (typeof time === 'boolean') {
    return time ? 'night' : 'day';
  }
  return time ?? 'sunset';
}

let asphaltTexture: THREE.CanvasTexture | null = null;
let sidewalkTexture: THREE.CanvasTexture | null = null;
let golfGrassTexture: THREE.CanvasTexture | null = null;
let solarTexture: THREE.CanvasTexture | null = null;
let cautionTexture: THREE.CanvasTexture | null = null;
let officeWindowTextures: { day: THREE.CanvasTexture | null; night: THREE.CanvasTexture | null; sunset: THREE.CanvasTexture | null } = {
  day: null,
  night: null,
  sunset: null,
};
let paverTexture: THREE.CanvasTexture | null = null;
let containerTexture: THREE.CanvasTexture | null = null;
let groundTextures: { day: THREE.CanvasTexture | null; night: THREE.CanvasTexture | null; sunset: THREE.CanvasTexture | null } = {
  day: null,
  night: null,
  sunset: null,
};
let skyTextures: { day: THREE.CanvasTexture | null; night: THREE.CanvasTexture | null; sunset: THREE.CanvasTexture | null } = {
  day: null,
  night: null,
  sunset: null,
};

/**
 * Creates procedural high-rise office window facade texture with illuminated offices
 */
/**
 * Creates high-detail procedural turf / parkland terrain texture
 * Gives the entire tycoon city a vibrant, lush, inviting foundation
 */
export function getOrCreateGroundTexture(timeOfDay?: TimeOfDay | boolean): THREE.Texture {
  const mode = resolveTimeOfDay(timeOfDay);
  if (groundTextures[mode]) return groundTextures[mode]!;

  if (typeof document === 'undefined') {
    const data = mode === 'night' 
      ? new Uint8Array([7, 21, 33, 255]) 
      : mode === 'sunset' 
        ? new Uint8Array([22, 38, 28, 255]) 
        : new Uint8Array([34, 197, 94, 255]);
    const tex = new THREE.DataTexture(data, 1, 1);
    tex.needsUpdate = true;
    return tex;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    if (mode === 'night') {
      ctx.fillStyle = '#06111d';
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = '#0e2438';
      ctx.lineWidth = 1.5;
      for (let x = 0; x < 512; x += 64) {
        for (let y = 0; y < 512; y += 64) {
          ctx.strokeRect(x, y, 64, 64);
        }
      }
    } else if (mode === 'sunset') {
      // Warm twilight lawn with rich amber/golden hour grass cast
      ctx.fillStyle = '#143122';
      ctx.fillRect(0, 0, 512, 512);

      // Alternating twilight lawn bands
      ctx.fillStyle = '#10271b';
      for (let y = 0; y < 512; y += 64) {
        ctx.fillRect(0, y, 512, 32);
      }

      // Warm sunset stipples
      for (let i = 0; i < 1500; i++) {
        const x = Math.floor(Math.random() * 512);
        const y = Math.floor(Math.random() * 512);
        const isWarm = Math.random() > 0.5;
        ctx.fillStyle = isWarm ? 'rgba(251, 191, 36, 0.16)' : 'rgba(16, 75, 42, 0.35)';
        ctx.fillRect(x, y, 2, 2);
      }

      // Subtle warm grid borders
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.08)';
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
    } else {
      // Luxury golf-course style manicured lawn with rich dark green fairway mowing stripes
      ctx.fillStyle = '#15803d'; // Deep lush emerald fairway green
      ctx.fillRect(0, 0, 512, 512);

      // Alternating dark green mowing bands (classic championship golf course look)
      ctx.fillStyle = '#14532d';
      for (let y = 0; y < 512; y += 64) {
        ctx.fillRect(0, y, 512, 32);
      }

      // High-density fine grass blade stipples for velvety organic depth
      for (let i = 0; i < 2200; i++) {
        const x = Math.floor(Math.random() * 512);
        const y = Math.floor(Math.random() * 512);
        const isLight = Math.random() > 0.5;
        ctx.fillStyle = isLight ? 'rgba(74, 222, 128, 0.28)' : 'rgba(5, 46, 22, 0.45)';
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

export function getOrCreateOfficeWindowTexture(timeOfDay?: TimeOfDay | boolean): THREE.Texture {
  const mode = resolveTimeOfDay(timeOfDay);
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
    ctx.fillStyle = '#090f1d';
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

        let isLit = false;
        if (mode === 'night') {
          // At night, ~75% of offices are illuminated with glowing warm yellow/amber interior lights
          isLit = (r * 5 + c * 3) % 4 !== 0;
        } else if (mode === 'sunset') {
          // At sunset, twilight transition with ~55% of offices turned on
          isLit = (r * 3 + c * 2) % 3 !== 0;
        } else {
          // Daytime, only 20%
          isLit = (r + c) % 5 === 0;
        }

        if (isLit) {
          if (mode === 'night') {
            // Radiant warm yellow golden glow as specifically requested:
            // "في الليل، أضف إضاءة داخلية للمباني (Emissive Materials) بحيث تظهر النوافذ مضيئة باللون الأصفر الدافئ"
            const warmYellowShades = [
              'rgba(254, 240, 138, 0.96)', // warm bright yellow
              'rgba(253, 224, 71, 0.94)',  // vibrant golden yellow
              'rgba(251, 191, 36, 0.92)',  // warm gold
              'rgba(245, 158, 11, 0.88)',  // rich amber
            ];
            const chosen = warmYellowShades[(r * 7 + c) % warmYellowShades.length];
            ctx.fillStyle = chosen;
            ctx.fillRect(x, y, w, h);

            // Subtle interior office desk/lamp silhouette
            ctx.fillStyle = 'rgba(25, 18, 10, 0.28)';
            ctx.fillRect(x, y + h * 0.58, w, h * 0.42);
          } else if (mode === 'sunset') {
            // Warm sunset amber glow
            const sunsetShades = [
              'rgba(254, 243, 199, 0.92)',
              'rgba(253, 186, 116, 0.90)',
              'rgba(251, 146, 60, 0.88)',
              'rgba(245, 158, 11, 0.86)',
            ];
            const chosen = sunsetShades[(r * 5 + c) % sunsetShades.length];
            ctx.fillStyle = chosen;
            ctx.fillRect(x, y, w, h);

            ctx.fillStyle = 'rgba(25, 15, 30, 0.3)';
            ctx.fillRect(x, y + h * 0.6, w, h * 0.4);
          } else {
            // Daytime sky blue office glass reflection
            ctx.fillStyle = 'rgba(186, 230, 253, 0.82)';
            ctx.fillRect(x, y, w, h);
          }

          // Window interior bevel highlight
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, w, h);
        } else {
          // Dark reflective unlit glass
          ctx.fillStyle = mode === 'night' ? 'rgba(7, 12, 24, 0.96)' : 'rgba(15, 23, 42, 0.94)';
          ctx.fillRect(x, y, w, h);

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, w, h);
        }
      }
    }

    // Floor division horizontal architectural bands
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
 * Lightweight equirectangular sky backdrop for Sunset, Night, and Day.
 * Gives the procedural city a cinematic atmosphere without external assets.
 */
export function getOrCreateSkyTexture(timeOfDay?: TimeOfDay | boolean): THREE.Texture {
  const mode = resolveTimeOfDay(timeOfDay);
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
    if (mode === 'sunset') {
      // Magnificent sunset: Deep purple/indigo zenith -> rich violet -> magenta -> vibrant sunset orange -> warm amber gold -> horizon glow
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1e1b4b');    // Deep twilight indigo
      gradient.addColorStop(0.24, '#4c1d95'); // Imperial purple
      gradient.addColorStop(0.46, '#7e22ce'); // Rich dusk violet
      gradient.addColorStop(0.66, '#c026d3'); // Radiant magenta
      gradient.addColorStop(0.79, '#ea580c'); // Warm sunset orange
      gradient.addColorStop(0.91, '#f59e0b'); // Amber gold horizon
      gradient.addColorStop(1.0, '#fbbf24');  // Luminous golden horizon glow
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Sunset sun disc low on the western horizon
      const sunX = canvas.width * 0.72;
      const sunY = canvas.height * 0.78;
      const sunRadius = 65;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, sunRadius * 2.8);
      sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
      sunGlow.addColorStop(0.28, 'rgba(251, 191, 36, 0.85)');
      sunGlow.addColorStop(0.58, 'rgba(234, 88, 12, 0.55)');
      sunGlow.addColorStop(1, 'rgba(192, 38, 211, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius * 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Golden rim-lit sunset clouds
      const sunsetClouds = [
        [0.15, 0.58, 120, 26, 'rgba(249, 115, 22, 0.45)'],
        [0.24, 0.52, 90, 22, 'rgba(192, 38, 211, 0.35)'],
        [0.45, 0.62, 140, 28, 'rgba(251, 146, 60, 0.50)'],
        [0.55, 0.56, 100, 24, 'rgba(217, 70, 239, 0.32)'],
        [0.78, 0.68, 160, 32, 'rgba(254, 215, 170, 0.58)'],
        [0.86, 0.64, 110, 26, 'rgba(245, 158, 11, 0.48)'],
      ];
      sunsetClouds.forEach(([cx, cy, rx, ry, color]) => {
        ctx.fillStyle = color as string;
        ctx.beginPath();
        ctx.ellipse((cx as number) * canvas.width, (cy as number) * canvas.height, rx as number, ry as number, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (mode === 'night') {
      // Midnight velvet sky with glowing crescent moon and twinkling stars
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#020617');
      gradient.addColorStop(0.38, '#060f26');
      gradient.addColorStop(0.70, '#0b1632');
      gradient.addColorStop(0.88, '#0f1d3e');
      gradient.addColorStop(1.0, '#081124');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Moon halo & crescent
      const moonX = canvas.width * 0.28;
      const moonY = canvas.height * 0.26;
      const moonGlow = ctx.createRadialGradient(moonX, moonY, 12, moonX, moonY, 75);
      moonGlow.addColorStop(0, 'rgba(224, 242, 254, 0.90)');
      moonGlow.addColorStop(0.35, 'rgba(186, 230, 253, 0.35)');
      moonGlow.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 75, 0, Math.PI * 2);
      ctx.fill();

      // Crescent moon shape
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#060f26';
      ctx.beginPath();
      ctx.arc(moonX + 6, moonY - 3, 14, 0, Math.PI * 2);
      ctx.fill();

      // Twinkling stars
      const stars = [
        [0.05, 0.10], [0.12, 0.16], [0.18, 0.08], [0.22, 0.22], [0.35, 0.12],
        [0.42, 0.18], [0.48, 0.09], [0.55, 0.25], [0.62, 0.14], [0.68, 0.07],
        [0.74, 0.21], [0.81, 0.11], [0.88, 0.18], [0.93, 0.09], [0.97, 0.24],
        [0.15, 0.32], [0.38, 0.35], [0.52, 0.38], [0.67, 0.34], [0.84, 0.31]
      ];
      stars.forEach(([x, y], idx) => {
        ctx.fillStyle = idx % 3 === 0 ? 'rgba(254, 240, 138, 0.95)' : 'rgba(224, 242, 254, 0.85)';
        ctx.beginPath();
        ctx.arc(x * canvas.width, y * canvas.height, idx % 4 === 0 ? 2.2 : 1.4, 0, Math.PI * 2);
        ctx.fill();
      });
    } else {
      // Radiant, sunny Mediterranean sky:
      // Vibrant Azure -> Cerulean Blue -> Soft Sunny Blue -> Golden Horizon Glow
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0284c7');     // Rich deep azure zenith
      gradient.addColorStop(0.35, '#38bdf8');  // Cheerful sky blue
      gradient.addColorStop(0.68, '#7dd3fc');  // Soft sunny blue
      gradient.addColorStop(0.88, '#bae6fd');  // Bright horizon glow
      gradient.addColorStop(1.0, '#f0f9ff');   // Luminous warm horizon light (Zero grey!)
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

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
 * Creates procedural realistic asphalt texture with dark bitumen, aggregate stones, and tire-track grain
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
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // 1. Dark bitumen slate base
    ctx.fillStyle = '#1c2430';
    ctx.fillRect(0, 0, 256, 256);

    // 2. Subtle directional rolling wear (tire tracks)
    const tireGrad = ctx.createLinearGradient(0, 0, 256, 0);
    tireGrad.addColorStop(0, 'rgba(15, 23, 42, 0.4)');
    tireGrad.addColorStop(0.25, 'rgba(30, 41, 59, 0.1)');
    tireGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.5)');
    tireGrad.addColorStop(0.75, 'rgba(30, 41, 59, 0.1)');
    tireGrad.addColorStop(1, 'rgba(15, 23, 42, 0.4)');
    ctx.fillStyle = tireGrad;
    ctx.fillRect(0, 0, 256, 256);

    // 3. Realistic aggregate mineral stones (basalt, granite, quartz flecks)
    for (let i = 0; i < 3500; i++) {
      const x = Math.floor(Math.random() * 256);
      const y = Math.floor(Math.random() * 256);
      const rand = Math.random();
      if (rand > 0.85) {
        // Light quartz aggregate fleck
        ctx.fillStyle = 'rgba(203, 213, 225, 0.35)';
        ctx.fillRect(x, y, 1, 1);
      } else if (rand > 0.45) {
        // Dark basalt aggregate pebble
        ctx.fillStyle = 'rgba(15, 20, 28, 0.45)';
        ctx.fillRect(x, y, 2, 2);
      } else {
        // Medium mineral stone
        ctx.fillStyle = 'rgba(71, 85, 105, 0.3)';
        ctx.fillRect(x, y, 1, 2);
      }
    }

    // 4. Micro-surface road pores
    ctx.fillStyle = 'rgba(2, 6, 23, 0.35)';
    for (let j = 0; j < 800; j++) {
      const px = Math.floor(Math.random() * 256);
      const py = Math.floor(Math.random() * 256);
      ctx.fillRect(px, py, 1, 1);
    }
  }

  asphaltTexture = new THREE.CanvasTexture(canvas);
  asphaltTexture.wrapS = THREE.RepeatWrapping;
  asphaltTexture.wrapT = THREE.RepeatWrapping;
  asphaltTexture.repeat.set(6, 6);
  asphaltTexture.colorSpace = THREE.SRGBColorSpace;
  asphaltTexture.anisotropy = maxAnisotropy;
  return asphaltTexture;
}

/**
 * Creates procedural realistic sidewalk paver texture with beveled rectangular flagstones
 */
export function getOrCreateSidewalkTexture(): THREE.Texture {
  if (sidewalkTexture) return sidewalkTexture;

  if (typeof document === 'undefined') {
    const data = new Uint8Array([226, 232, 240, 255]);
    const tex = new THREE.DataTexture(data, 1, 1);
    tex.needsUpdate = true;
    return tex;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Architectural concrete paver base
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, 256, 256);

    const blockW = 32;
    const blockH = 16;
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;

    // Running bond interlocking pavers
    for (let y = 0; y < 256; y += blockH) {
      const rowIdx = Math.floor(y / blockH);
      const xOffset = (rowIdx % 2) * (blockW / 2);
      for (let x = -blockW; x < 256 + blockW; x += blockW) {
        ctx.strokeRect(x + xOffset, y, blockW, blockH);
        // Bevel shade highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fillRect(x + xOffset + 1, y + 1, blockW - 2, 2);
        // Stone tone variation
        const toneVar = Math.sin((x + xOffset) * 0.1 + y * 0.2);
        ctx.fillStyle = toneVar > 0 ? 'rgba(241, 245, 249, 0.4)' : 'rgba(203, 213, 225, 0.35)';
        ctx.fillRect(x + xOffset + 1, y + 2, blockW - 2, blockH - 3);
      }
    }

    // Fine concrete sand texture
    for (let i = 0; i < 1200; i++) {
      const sx = Math.floor(Math.random() * 256);
      const sy = Math.floor(Math.random() * 256);
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.3)' : 'rgba(100, 116, 139, 0.25)';
      ctx.fillRect(sx, sy, 1, 1);
    }
  }

  sidewalkTexture = new THREE.CanvasTexture(canvas);
  sidewalkTexture.wrapS = THREE.RepeatWrapping;
  sidewalkTexture.wrapT = THREE.RepeatWrapping;
  sidewalkTexture.repeat.set(4, 4);
  sidewalkTexture.colorSpace = THREE.SRGBColorSpace;
  return sidewalkTexture;
}

/**
 * Creates procedural dark green championship golf course grass texture
 */
export function getOrCreateGolfGrassTexture(): THREE.Texture {
  if (golfGrassTexture) return golfGrassTexture;

  if (typeof document === 'undefined') {
    const data = new Uint8Array([21, 128, 61, 255]);
    const tex = new THREE.DataTexture(data, 1, 1);
    tex.needsUpdate = true;
    return tex;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Deep championship green base
    ctx.fillStyle = '#14532d';
    ctx.fillRect(0, 0, 256, 256);

    // Fairway mowing stripes
    ctx.fillStyle = '#15803d';
    for (let y = 0; y < 256; y += 32) {
      ctx.fillRect(0, y, 256, 16);
    }

    // Dense organic grass blade flecks
    for (let i = 0; i < 2400; i++) {
      const gx = Math.floor(Math.random() * 256);
      const gy = Math.floor(Math.random() * 256);
      const r = Math.random();
      if (r > 0.6) {
        ctx.fillStyle = 'rgba(74, 222, 128, 0.35)'; // Fresh blade highlight
      } else if (r > 0.25) {
        ctx.fillStyle = 'rgba(5, 46, 22, 0.45)'; // Deep shadow
      } else {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
      }
      ctx.fillRect(gx, gy, 1, 2);
    }
  }

  golfGrassTexture = new THREE.CanvasTexture(canvas);
  golfGrassTexture.wrapS = THREE.RepeatWrapping;
  golfGrassTexture.wrapT = THREE.RepeatWrapping;
  golfGrassTexture.repeat.set(8, 8);
  golfGrassTexture.colorSpace = THREE.SRGBColorSpace;
  return golfGrassTexture;
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
  waterSurface: THREE.Material;
  sulyBrandMat: THREE.MeshStandardMaterial;
  ankhReliefMat: THREE.MeshStandardMaterial;
  royalNavyMat: THREE.MeshStandardMaterial;
  warmAmberLitGlass: THREE.MeshStandardMaterial;

  // High-Reflection Skyscraper Obsidian Glass & Mirror Glass (Environment Map Reflection)
  blackObsidianGlass: THREE.MeshStandardMaterial;
  skyReflectiveCurtainGlass: THREE.MeshStandardMaterial;

  // Supercars (Ferrari, Lamborghini), Yachts & Luxury Props
  ferrariRed: THREE.MeshStandardMaterial;
  lamborghiniGreen: THREE.MeshStandardMaterial;
  lamborghiniOrange: THREE.MeshStandardMaterial;
  carbonFiber: THREE.MeshStandardMaterial;
  yachtHullWhite: THREE.MeshStandardMaterial;
  teakWood: THREE.MeshStandardMaterial;
  rolexGreenMarble: THREE.MeshStandardMaterial;
  emeraldGlow: THREE.MeshBasicMaterial;
  bronzeStatue: THREE.MeshStandardMaterial;
  fountainWaterDancing: THREE.MeshStandardMaterial;

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
  harborWater: THREE.Material;
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
  timeOfDay: TimeOfDay | boolean = 'sunset',
  isSoftwareGl = false
): CityMaterialPalette {
  const mode = resolveTimeOfDay(timeOfDay);
  const isNightMode = mode === 'night';
  const cautionTex = getOrCreateCautionTexture();
  const asphaltTex = getOrCreateAsphaltTexture(isSoftwareGl ? 1 : 4);
  const officeWindowTex = getOrCreateOfficeWindowTexture(mode);
  const sidewalkTex = getOrCreateSidewalkTexture();
  const golfGrassTex = getOrCreateGolfGrassTexture();
  const paverTex = getOrCreatePaverTexture();

  return {
    ground: new THREE.MeshStandardMaterial({
      map: getOrCreateGroundTexture(mode),
      color: mode === 'night' ? '#0a2316' : mode === 'sunset' ? '#142d1f' : '#ffffff',
      roughness: 0.85,
      metalness: 0.04,
    }),
    asphalt: new THREE.MeshStandardMaterial({
      map: asphaltTex,
      color: mode === 'night' ? '#111827' : mode === 'sunset' ? '#1e2430' : '#2b3544',
      roughness: 0.84,
      metalness: 0.12,
    }),
    sidewalk: new THREE.MeshStandardMaterial({
      map: sidewalkTex,
      color: mode === 'night' ? '#1e293b' : mode === 'sunset' ? '#292524' : '#f8fafc',
      roughness: 0.65,
      metalness: 0.08,
    }),
    plazaPaver: new THREE.MeshStandardMaterial({
      map: paverTex,
      color: mode === 'night' ? '#1e293b' : mode === 'sunset' ? '#fed7aa' : '#ffffff',
      roughness: 0.58,
      metalness: 0.1,
    }),
    curbGold: new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      roughness: 0.28,
      metalness: 0.85,
    }),
    roadLine: new THREE.MeshBasicMaterial({
      color: '#facc15', // Vivid Highway Yellow with painted bead sheen
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
      color: mode === 'night' ? '#070f1e' : mode === 'sunset' ? '#0f172a' : '#1e293b',
      roughness: 0.3,
      metalness: 0.7,
    }),
    slateStructure: new THREE.MeshStandardMaterial({
      color: mode === 'night' ? '#111827' : mode === 'sunset' ? '#1e293b' : '#334155',
      roughness: 0.45,
      metalness: 0.5,
    }),
    curtainGlass: new THREE.MeshStandardMaterial({
      color: mode === 'night' ? '#081628' : mode === 'sunset' ? '#172554' : '#7dd3fc',
      roughness: 0.05,
      metalness: 0.92,
      envMapIntensity: 2.2,
      transparent: true,
      opacity: 0.88,
      emissive: mode === 'night'
        ? new THREE.Color('#f59e0b')
        : mode === 'sunset'
          ? new THREE.Color('#ea580c')
          : new THREE.Color('#000000'),
      emissiveIntensity: mode === 'night' ? 0.45 : mode === 'sunset' ? 0.35 : 0,
    }),
    blackObsidianGlass: new THREE.MeshStandardMaterial({
      color: mode === 'night' ? '#040711' : mode === 'sunset' ? '#080d1a' : '#0a1020',
      roughness: 0.04,
      metalness: 0.96,
      envMapIntensity: 2.5,
    }),
    skyReflectiveCurtainGlass: new THREE.MeshStandardMaterial({
      color: mode === 'night' ? '#081426' : mode === 'sunset' ? '#132144' : '#60a5fa',
      roughness: 0.05,
      metalness: 0.92,
      envMapIntensity: 2.2,
      transparent: true,
      opacity: 0.92,
    }),
    ferrariRed: new THREE.MeshStandardMaterial({
      color: '#dc2626',
      roughness: 0.1,
      metalness: 0.88,
      envMapIntensity: 1.8,
    }),
    lamborghiniGreen: new THREE.MeshStandardMaterial({
      color: '#84cc16',
      roughness: 0.08,
      metalness: 0.9,
      envMapIntensity: 1.8,
    }),
    lamborghiniOrange: new THREE.MeshStandardMaterial({
      color: '#ea580c',
      roughness: 0.08,
      metalness: 0.9,
      envMapIntensity: 1.8,
    }),
    carbonFiber: new THREE.MeshStandardMaterial({
      color: '#18181b',
      roughness: 0.35,
      metalness: 0.85,
    }),
    yachtHullWhite: new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.08,
      metalness: 0.75,
      envMapIntensity: 1.6,
    }),
    teakWood: new THREE.MeshStandardMaterial({
      color: '#a16207',
      roughness: 0.65,
      metalness: 0.05,
    }),
    rolexGreenMarble: new THREE.MeshStandardMaterial({
      color: '#064e3b',
      roughness: 0.15,
      metalness: 0.6,
      envMapIntensity: 1.5,
    }),
    emeraldGlow: new THREE.MeshBasicMaterial({
      color: '#10b981',
    }),
    bronzeStatue: new THREE.MeshStandardMaterial({
      color: '#b45309',
      roughness: 0.28,
      metalness: 0.92,
      envMapIntensity: 1.9,
    }),
    fountainWaterDancing: new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      roughness: 0.05,
      metalness: 0.8,
      transparent: true,
      opacity: 0.82,
    }),
    litGlassNight: new THREE.MeshStandardMaterial({
      color: mode === 'night' ? '#fef08a' : mode === 'sunset' ? '#fed7aa' : '#bae6fd',
      emissive: mode === 'night'
        ? new THREE.Color('#f59e0b')
        : mode === 'sunset'
          ? new THREE.Color('#ea580c')
          : new THREE.Color('#000000'),
      emissiveIntensity: mode === 'night' ? 1.2 : mode === 'sunset' ? 0.75 : 0,
      roughness: 0.18,
      metalness: 0.72,
    }),
    officeWindowsLit: new THREE.MeshStandardMaterial({
      map: officeWindowTex,
      emissiveMap: officeWindowTex,
      emissive: mode === 'night'
        ? new THREE.Color('#f59e0b') // Warm yellow-gold emissive at night
        : mode === 'sunset'
          ? new THREE.Color('#ea580c') // Warm sunset amber emissive at sunset
          : new THREE.Color('#0284c7'),
      emissiveIntensity: mode === 'night' ? 1.5 : mode === 'sunset' ? 1.1 : 0.25,
      roughness: 0.18,
      metalness: 0.75,
    }),
    facadeConcrete: new THREE.MeshStandardMaterial({
      color: mode === 'night' ? '#1e293b' : mode === 'sunset' ? '#334155' : '#e2e8f0',
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
      emissive: new THREE.Color('#f59e0b'),
      emissiveIntensity: mode === 'night' ? 1.6 : mode === 'sunset' ? 1.2 : 0.45,
    }),
    waterSurface: createFountainWaterMaterial(isNightMode),

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
    harborWater: createRealisticWaterMaterial(isNightMode),
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
      color: '#15803d',
      roughness: 0.6,
      metalness: 0.04,
    }),
    foliageDarkGreen: new THREE.MeshStandardMaterial({
      color: '#14532d',
      roughness: 0.6,
      metalness: 0.04,
    }),
    grassLawn: new THREE.MeshStandardMaterial({
      map: golfGrassTex,
      color: isNightMode ? '#0f3d23' : '#15803d',
      roughness: 0.88,
      metalness: 0.02,
    }),
    treeTrunk: new THREE.MeshStandardMaterial({
      color: '#451a03',
      roughness: 0.92,
      metalness: 0.08,
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
