/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

/**
 * Procedural texture cache to avoid memory leaks and reduce draw calls
 */
let asphaltTexture: THREE.CanvasTexture | null = null;
let groundGridTexture: { day: THREE.CanvasTexture | null; night: THREE.CanvasTexture | null } = {
  day: null,
  night: null,
};
let solarTexture: THREE.CanvasTexture | null = null;
let cautionTexture: THREE.CanvasTexture | null = null;
let officeWindowTextures: { day: THREE.CanvasTexture | null; night: THREE.CanvasTexture | null } = {
  day: null,
  night: null,
};
let paverTexture: THREE.CanvasTexture | null = null;
let containerTexture: THREE.CanvasTexture | null = null;
let dockConcreteTexture: THREE.CanvasTexture | null = null;
let sandTexture: THREE.CanvasTexture | null = null;
let coastRockTexture: THREE.CanvasTexture | null = null;
let waterNormalTexture: THREE.CanvasTexture | null = null;
let skyTextures: {
  day: THREE.CanvasTexture | null;
  sunset: THREE.CanvasTexture | null;
  night: THREE.CanvasTexture | null;
} = {
  day: null,
  sunset: null,
  night: null,
};

/**
 * Creates procedural high-rise office window facade texture with illuminated offices
 */
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
/**
 * Lightweight equirectangular sky backdrop with atmospheric scattering gradients.
 * Simulates Sunset, Clear Day, and Night horizons with realistic atmospheric tones.
 */
export function getOrCreateSkyTexture(
  modeInput: 'day' | 'sunset' | 'night' | boolean = 'night'
): THREE.Texture {
  const mode: 'day' | 'sunset' | 'night' =
    typeof modeInput === 'boolean'
      ? (modeInput ? 'night' : 'day')
      : modeInput;

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
    if (mode === 'sunset') {
      // Atmospheric scattering sunset: deep violet zenith -> rich terracotta -> warm golden horizon
      gradient.addColorStop(0, '#1e1b4b');    // Deep twilight violet-indigo at zenith
      gradient.addColorStop(0.38, '#4a1525'); // Dusky burgundy mid-sky
      gradient.addColorStop(0.58, '#9a3412'); // Rich terracotta orange
      gradient.addColorStop(0.74, '#ea580c'); // Vivid sunset amber
      gradient.addColorStop(0.86, '#f59e0b'); // Golden horizon scatter
      gradient.addColorStop(0.95, '#fef08a'); // Brilliant sun glow at coastline
      gradient.addColorStop(1.0, '#78350f');  // Ground horizon haze
    } else if (mode === 'day') {
      // Atmospheric clear day with Rayleigh scattering
      gradient.addColorStop(0, '#0284c7');    // Deep atmospheric sky blue at zenith
      gradient.addColorStop(0.42, '#38bdf8'); // Bright clear cerulean mid-sky
      gradient.addColorStop(0.72, '#7dd3fc'); // Soft sky blue
      gradient.addColorStop(0.88, '#bae6fd'); // Rayleigh scattering haze near horizon
      gradient.addColorStop(1.0, '#e0f2fe');  // Sunlit horizon blend
    } else {
      // Midnight luxury night
      gradient.addColorStop(0, '#020617');
      gradient.addColorStop(0.48, '#0b1630');
      gradient.addColorStop(0.76, '#172554');
      gradient.addColorStop(1, '#0f172a');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (mode === 'night') {
      const stars = [
        [0.12, 0.18], [0.24, 0.31], [0.38, 0.14], [0.51, 0.25],
        [0.67, 0.12], [0.78, 0.29], [0.9, 0.17], [0.58, 0.38],
        [0.15, 0.42], [0.33, 0.22], [0.82, 0.38], [0.44, 0.09],
      ];
      ctx.fillStyle = 'rgba(255, 248, 210, 0.85)';
      stars.forEach(([x, y], index) => {
        ctx.beginPath();
        ctx.arc(x * canvas.width, y * canvas.height, index % 3 === 0 ? 2 : 1.2, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (mode === 'sunset') {
      // Glowing setting sun disc at the eastern sea horizon
      const sunX = canvas.width * 0.72;
      const sunY = canvas.height * 0.86;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 6, sunX, sunY, 140);
      sunGlow.addColorStop(0, 'rgba(255, 255, 240, 0.95)');
      sunGlow.addColorStop(0.18, 'rgba(254, 215, 170, 0.85)');
      sunGlow.addColorStop(0.45, 'rgba(249, 115, 22, 0.45)');
      sunGlow.addColorStop(1, 'rgba(234, 88, 12, 0)');
      ctx.fillStyle = sunGlow;
      ctx.fillRect(sunX - 150, sunY - 150, 300, 300);

      // Distant atmospheric cirrus bands
      ctx.fillStyle = 'rgba(254, 202, 202, 0.18)';
      ctx.fillRect(0, canvas.height * 0.52, canvas.width, canvas.height * 0.08);
      ctx.fillStyle = 'rgba(253, 186, 116, 0.15)';
      ctx.fillRect(0, canvas.height * 0.65, canvas.width, canvas.height * 0.06);
    } else {
      // Clear day sun halo & light cumulus haze
      const sunX = canvas.width * 0.68;
      const sunY = canvas.height * 0.32;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, 180);
      sunGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      sunGlow.addColorStop(0.25, 'rgba(254, 240, 138, 0.55)');
      sunGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = sunGlow;
      ctx.fillRect(sunX - 200, sunY - 200, 400, 400);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.fillRect(0, canvas.height * 0.62, canvas.width, canvas.height * 0.12);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  skyTextures[mode] = texture;
  return texture;
}

/**
 * Procedural water normal map generator.
 * Creates multi-octave harmonic wave normals to simulate realistic ripples and swell,
 * allowing specular reflections and envMap highlights to shimmer dynamically across the water.
 */
export function getOrCreateWaterNormalTexture(): THREE.CanvasTexture {
  if (waterNormalTexture) return waterNormalTexture;

  if (typeof document === 'undefined') {
    const data = new Uint8Array([128, 128, 255, 255]);
    const tex = new THREE.DataTexture(data, 1, 1);
    tex.needsUpdate = true;
    return tex as unknown as THREE.CanvasTexture;
  }

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    const data = new Uint8Array([128, 128, 255, 255]);
    const tex = new THREE.DataTexture(data, 1, 1);
    tex.needsUpdate = true;
    return tex as unknown as THREE.CanvasTexture;
  }

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  // Synthesize wave height field from multiple harmonic directions
  const heights = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    const v = (y / size) * Math.PI * 8;
    for (let x = 0; x < size; x++) {
      const u = (x / size) * Math.PI * 8;

      // Octave 1: Primary deep water swell
      let h = Math.sin(u * 1.2 + v * 0.8) * 0.45;
      h += Math.cos(u * 0.9 - v * 1.4) * 0.38;

      // Octave 2: Cross sea waves
      h += Math.sin((u + v) * 2.4) * 0.22;
      h += Math.cos((u * 1.8 - v * 2.1)) * 0.18;

      // Octave 3: High-frequency capillary ripples
      h += Math.sin(u * 4.6 + v * 3.2) * 0.12;
      h += Math.cos(u * 3.8 - v * 5.4) * 0.08;

      heights[y * size + x] = h;
    }
  }

  // Derive normal map vectors via central differences
  const bumpStrength = 4.2;
  for (let y = 0; y < size; y++) {
    const yU = (y - 1 + size) % size;
    const yD = (y + 1) % size;
    for (let x = 0; x < size; x++) {
      const xL = (x - 1 + size) % size;
      const xR = (x + 1) % size;

      const dX = (heights[y * size + xR] - heights[y * size + xL]) * bumpStrength;
      const dY = (heights[yD * size + x] - heights[yU * size + x]) * bumpStrength;

      // Normal (-dX, -dY, 1.0) normalized to tangent space
      const len = Math.sqrt(dX * dX + dY * dY + 1.0);
      const nx = -dX / len;
      const ny = -dY / len;
      const nz = 1.0 / len;

      const idx = (y * size + x) * 4;
      data[idx] = Math.floor((nx * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  waterNormalTexture = texture;
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
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 128, 128);

    const tileSize = 16;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;

    for (let x = 0; x <= 128; x += tileSize) {
      for (let y = 0; y <= 128; y += tileSize) {
        ctx.strokeRect(x, y, tileSize, tileSize);
        // Subtle color variance between stones
        const variance = Math.floor((Math.sin(x * 12 + y * 7) + 1) * 12);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.03 + variance * 0.005})`;
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
 * Creates procedural asphalt texture with subtle road noise, dark aggregate, and paving grid lines
 */
export function getOrCreateAsphaltTexture(maxAnisotropy = 4): THREE.Texture {
  if (asphaltTexture) return asphaltTexture;

  if (typeof document === 'undefined') {
    const data = new Uint8Array([15, 23, 42, 255]);
    const tex = new THREE.DataTexture(data, 1, 1);
    tex.needsUpdate = true;
    return tex;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Darker asphalt base
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(0, 0, 256, 256);

    // Subtle road grid and expansion joints so roads don't look like a plain flat plane
    const gridSize = 64;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= 256; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
    for (let y = 0; y <= 256; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }

    // Dense asphalt grain and aggregate speckles
    for (let i = 0; i < 900; i++) {
      const x = Math.floor(Math.random() * 256);
      const y = Math.floor(Math.random() * 256);
      const isLighter = Math.random() > 0.6;
      const gray = isLighter ? 35 + Math.floor(Math.random() * 25) : 10;
      ctx.fillStyle = `rgba(${gray}, ${gray + 2}, ${gray + 8}, ${0.15 + Math.random() * 0.25})`;
      const sz = Math.random() > 0.85 ? 2 : 1;
      ctx.fillRect(x, y, sz, sz);
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
 * Creates procedural terrain ground texture with a subtle district coordinate grid
 */
export function getOrCreateGroundGridTexture(isNightMode = true, maxAnisotropy = 4): THREE.Texture {
  const mode = isNightMode ? 'night' : 'day';
  if (groundGridTexture[mode]) return groundGridTexture[mode]!;

  if (typeof document === 'undefined') {
    const data = new Uint8Array([11, 18, 32, 255]);
    const tex = new THREE.DataTexture(data, 1, 1);
    tex.needsUpdate = true;
    return tex;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = isNightMode ? '#070c18' : '#1e2837';
    ctx.fillRect(0, 0, 256, 256);

    // Subtle coordinate grid so terrain doesn't look like a plain flat plane
    const step = 32;
    ctx.strokeStyle = isNightMode ? 'rgba(56, 189, 248, 0.04)' : 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 256; i += step) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(256, i);
      ctx.stroke();
    }

    // Surface stone & soil noise
    for (let i = 0; i < 600; i++) {
      const rx = Math.floor(Math.random() * 256);
      const ry = Math.floor(Math.random() * 256);
      ctx.fillStyle = isNightMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(rx, ry, 1, 1);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(16, 16);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  groundGridTexture[mode] = tex;
  return tex;
}

/**
 * Creates dark grey textured concrete/asphalt for port docks and maritime piers
 */
export function getOrCreateDockConcreteTexture(maxAnisotropy = 4): THREE.Texture {
  if (dockConcreteTexture) return dockConcreteTexture;

  if (typeof document === 'undefined') {
    const data = new Uint8Array([35, 43, 54, 255]);
    const tex = new THREE.DataTexture(data, 1, 1);
    tex.needsUpdate = true;
    return tex;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Dark grey concrete/asphalt base
    ctx.fillStyle = '#232b36';
    ctx.fillRect(0, 0, 256, 256);

    // Subtle concrete panel grid / expansion joints
    ctx.strokeStyle = '#181f28';
    ctx.lineWidth = 1.5;
    const slabSize = 64;
    for (let x = 0; x <= 256; x += slabSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
    for (let y = 0; y <= 256; y += slabSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }

    // Heavy concrete/asphalt aggregate noise and speckles
    for (let i = 0; i < 900; i++) {
      const rx = Math.floor(Math.random() * 256);
      const ry = Math.floor(Math.random() * 256);
      const isLight = Math.random() > 0.6;
      ctx.fillStyle = isLight ? 'rgba(80, 95, 115, 0.35)' : 'rgba(15, 20, 28, 0.45)';
      const size = Math.random() > 0.8 ? 2 : 1;
      ctx.fillRect(rx, ry, size, size);
    }

    // Slight oil/water tire wear marking
    ctx.fillStyle = 'rgba(18, 24, 32, 0.18)';
    ctx.fillRect(40, 0, 30, 256);
    ctx.fillRect(170, 0, 30, 256);
  }

  dockConcreteTexture = new THREE.CanvasTexture(canvas);
  dockConcreteTexture.wrapS = THREE.RepeatWrapping;
  dockConcreteTexture.wrapT = THREE.RepeatWrapping;
  dockConcreteTexture.repeat.set(4, 4);
  dockConcreteTexture.colorSpace = THREE.SRGBColorSpace;
  dockConcreteTexture.anisotropy = maxAnisotropy;
  return dockConcreteTexture;
}

/**
 * Creates warm procedural sandy beach texture with micro grain
 */
export function getOrCreateSandTexture(): THREE.Texture {
  if (sandTexture) return sandTexture;

  if (typeof document === 'undefined') {
    const data = new Uint8Array([218, 184, 136, 255]);
    const tex = new THREE.DataTexture(data, 1, 1);
    tex.needsUpdate = true;
    return tex;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#dfbd8c';
    ctx.fillRect(0, 0, 128, 128);

    // Warm sand grain variation
    for (let i = 0; i < 600; i++) {
      const x = Math.floor(Math.random() * 128);
      const y = Math.floor(Math.random() * 128);
      const isLight = Math.random() > 0.5;
      ctx.fillStyle = isLight ? 'rgba(255, 243, 205, 0.35)' : 'rgba(180, 140, 90, 0.3)';
      ctx.fillRect(x, y, 1, 1);
    }
  }

  sandTexture = new THREE.CanvasTexture(canvas);
  sandTexture.wrapS = THREE.RepeatWrapping;
  sandTexture.wrapT = THREE.RepeatWrapping;
  sandTexture.repeat.set(6, 6);
  sandTexture.colorSpace = THREE.SRGBColorSpace;
  return sandTexture;
}

/**
 * Creates coastal rock and granite striation texture
 */
export function getOrCreateCoastRockTexture(): THREE.Texture {
  if (coastRockTexture) return coastRockTexture;

  if (typeof document === 'undefined') {
    const data = new Uint8Array([71, 85, 105, 255]);
    const tex = new THREE.DataTexture(data, 1, 1);
    tex.needsUpdate = true;
    return tex;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, 128, 128);

    // Layered granite striations
    for (let y = 0; y < 128; y += 4) {
      ctx.fillStyle = (y % 8 === 0) ? 'rgba(30, 41, 59, 0.4)' : 'rgba(100, 116, 139, 0.25)';
      ctx.fillRect(0, y, 128, 2);
    }

    for (let i = 0; i < 400; i++) {
      const x = Math.floor(Math.random() * 128);
      const y = Math.floor(Math.random() * 128);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.fillRect(x, y, 1, 1);
    }
  }

  coastRockTexture = new THREE.CanvasTexture(canvas);
  coastRockTexture.wrapS = THREE.RepeatWrapping;
  coastRockTexture.wrapT = THREE.RepeatWrapping;
  coastRockTexture.repeat.set(4, 4);
  coastRockTexture.colorSpace = THREE.SRGBColorSpace;
  return coastRockTexture;
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
  curtainGlass: THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial;
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
  // Luxury & City Life Materials
  ferrariRed: THREE.MeshStandardMaterial;
  lamborghiniGreen: THREE.MeshStandardMaterial;
  lamborghiniOrange: THREE.MeshStandardMaterial;
  carbonFiber: THREE.MeshStandardMaterial;
  blackObsidianGlass: THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial;
  yachtHullWhite: THREE.MeshStandardMaterial;
  teakWood: THREE.MeshStandardMaterial;
  skyReflectiveCurtainGlass: THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial;
  fountainWaterDancing: THREE.MeshStandardMaterial;
  bronzeStatue: THREE.MeshStandardMaterial;
  rolexGreenMarble: THREE.MeshStandardMaterial;
  emeraldGlow: THREE.MeshBasicMaterial;

  // Coastline & Port Materials (الساحل والميناء)
  dockConcrete: THREE.MeshStandardMaterial;
  craneYellowMetallic: THREE.MeshStandardMaterial;
  craneSteelMetallic: THREE.MeshStandardMaterial;
  sandyBeach: THREE.MeshStandardMaterial;
  rockyCoastline: THREE.MeshStandardMaterial;
}

export function createCityMaterialPalette(
  isNightMode: boolean,
  isSoftwareGl: boolean,
  timeOfDayInput: 'day' | 'sunset' | 'night' = isNightMode ? 'night' : 'day'
): CityMaterialPalette {
  const timeOfDay = timeOfDayInput;
  const cautionTex = getOrCreateCautionTexture();
  const asphaltTex = getOrCreateAsphaltTexture(isSoftwareGl ? 1 : 4);
  const dockConcreteTex = getOrCreateDockConcreteTexture(isSoftwareGl ? 1 : 4);
  const sandTex = getOrCreateSandTexture();
  const coastRockTex = getOrCreateCoastRockTexture();
  const officeWindowTex = getOrCreateOfficeWindowTexture(isNightMode);
  const paverTex = getOrCreatePaverTexture();
  const waterNormalTex = getOrCreateWaterNormalTexture();

  return {
    ground: new THREE.MeshStandardMaterial({
      map: getOrCreateGroundGridTexture(isNightMode, isSoftwareGl ? 1 : 4),
      color: isNightMode ? '#080d1a' : '#273449',
      roughness: 0.88,
      metalness: 0.08,
    }),
    asphalt: new THREE.MeshStandardMaterial({
      map: asphaltTex,
      color: isNightMode ? '#0a0f1d' : '#1e293b',
      roughness: 0.8,
      metalness: 0.15,
    }),
    sidewalk: new THREE.MeshStandardMaterial({
      color: isNightMode ? '#202b3f' : '#64748b',
      roughness: 0.68,
      metalness: 0.18,
    }),
    plazaPaver: new THREE.MeshStandardMaterial({
      map: paverTex,
      color: isNightMode ? '#283449' : '#94a3b8',
      roughness: 0.58,
      metalness: 0.24,
    }),
    curbGold: new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.2,
      metalness: 1.0,
    }),
    roadLine: new THREE.MeshBasicMaterial({
      color: '#f59e0b',
    }),
    roadZebra: new THREE.MeshBasicMaterial({
      color: '#f8fafc',
    }),

    // Luxury Empire theme & Golden Dome PBR
    imperialGold: new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 1.0,
      roughness: 0.2,
    }),
    brushedGold: new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.25,
      metalness: 0.95,
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
    curtainGlass: new THREE.MeshPhysicalMaterial({
      color: isNightMode ? 0x0f172a : 0x7dd3fc,
      transmission: 0.9,
      roughness: 0.1,
      metalness: 0.1,
      ior: 1.5,
      transparent: true,
      opacity: 1.0,
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
      color: isNightMode ? '#334155' : '#64748b',
      roughness: 0.85,
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
      color: timeOfDay === 'night' ? '#061a30' : timeOfDay === 'sunset' ? '#0b2445' : '#0a345e',
      roughness: 0.08,
      metalness: 0.2,
      normalMap: waterNormalTex,
      normalScale: new THREE.Vector2(0.35, 0.35),
      transparent: true,
      opacity: 0.9,
      envMapIntensity: 1.25,
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
      color: timeOfDay === 'night' ? '#041528' : timeOfDay === 'sunset' ? '#091e38' : '#072a4d',
      roughness: 0.1,
      metalness: 0.22,
      normalMap: waterNormalTex,
      normalScale: new THREE.Vector2(0.45, 0.45),
      transparent: true,
      opacity: 0.92,
      envMapIntensity: 1.35,
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
      roughness: 0.18,
      metalness: 0.88,
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
      roughness: 0.7,
      metalness: 0.1,
    }),
    foliageDarkGreen: new THREE.MeshStandardMaterial({
      color: '#166534',
      roughness: 0.7,
      metalness: 0.1,
    }),
    grassLawn: new THREE.MeshStandardMaterial({
      color: '#15803d',
      roughness: 0.85,
      metalness: 0.05,
    }),
    treeTrunk: new THREE.MeshStandardMaterial({
      color: '#78350f',
      roughness: 0.9,
      metalness: 0.1,
    }),
    ferrariRed: new THREE.MeshStandardMaterial({
      color: '#dc2626',
      roughness: 0.2,
      metalness: 0.8,
    }),
    lamborghiniGreen: new THREE.MeshStandardMaterial({
      color: '#84cc16',
      roughness: 0.2,
      metalness: 0.85,
    }),
    lamborghiniOrange: new THREE.MeshStandardMaterial({
      color: '#f97316',
      roughness: 0.2,
      metalness: 0.85,
    }),
    carbonFiber: new THREE.MeshStandardMaterial({
      color: '#18181b',
      roughness: 0.4,
      metalness: 0.5,
    }),
    blackObsidianGlass: new THREE.MeshPhysicalMaterial({
      color: 0x09090b,
      transmission: 0.9,
      roughness: 0.1,
      metalness: 0.1,
      ior: 1.5,
      transparent: true,
      opacity: 1.0,
    }),
    yachtHullWhite: new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.25,
      metalness: 0.2,
    }),
    teakWood: new THREE.MeshStandardMaterial({
      color: '#92400e',
      roughness: 0.65,
      metalness: 0.05,
    }),
    skyReflectiveCurtainGlass: new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transmission: 0.9,
      roughness: 0.1,
      metalness: 0.1,
      ior: 1.5,
      transparent: true,
      opacity: 1.0,
    }),
    fountainWaterDancing: new THREE.MeshStandardMaterial({
      color: '#06b6d4',
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.8,
    }),
    bronzeStatue: new THREE.MeshStandardMaterial({
      color: '#b45309',
      roughness: 0.4,
      metalness: 0.8,
    }),
    rolexGreenMarble: new THREE.MeshStandardMaterial({
      color: '#064e3b',
      roughness: 0.3,
      metalness: 0.3,
    }),
    emeraldGlow: new THREE.MeshBasicMaterial({ color: '#10b981' }),

    // Coastline & Port Materials (الساحل والميناء)
    dockConcrete: new THREE.MeshStandardMaterial({
      map: dockConcreteTex,
      color: isNightMode ? '#1e2530' : '#333b47',
      roughness: 0.68,
      metalness: 0.28,
    }),
    craneYellowMetallic: new THREE.MeshStandardMaterial({
      color: '#facc15',
      roughness: 0.16,
      metalness: 0.88,
    }),
    craneSteelMetallic: new THREE.MeshStandardMaterial({
      color: '#94a3b8',
      roughness: 0.2,
      metalness: 0.92,
    }),
    sandyBeach: new THREE.MeshStandardMaterial({
      map: sandTex,
      color: isNightMode ? '#5e4e37' : '#dfbd8c',
      roughness: 0.94,
      metalness: 0.02,
    }),
    rockyCoastline: new THREE.MeshStandardMaterial({
      map: coastRockTex,
      color: isNightMode ? '#1e293b' : '#475569',
      roughness: 0.82,
      metalness: 0.22,
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
