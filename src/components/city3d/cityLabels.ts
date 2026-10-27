/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface BuildingLabelConfig {
  titleAr: string;
  badgeAr?: string;
  icon?: string;
  accentColor: string;
  badgeBgColor?: string;
}

const labelTextureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Creates or retrieves a cached high-resolution procedural billboard sprite
 * with crisp Arabic typography and an iconic status badge.
 */
export function createBuildingLabelSprite(config: BuildingLabelConfig): THREE.Sprite {
  const cacheKey = `${config.titleAr}_${config.accentColor}_${config.badgeAr || ''}`;
  let texture = labelTextureCache.get(cacheKey);

  if (!texture && typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 144;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Clear
      ctx.clearRect(0, 0, 512, 144);

      // Card outer bounds
      const x = 12;
      const y = 14;
      const w = 488;
      const h = 116;
      const r = 24;

      // Glow shadow
      ctx.save();
      ctx.shadowColor = config.accentColor;
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 4;

      // Dark translucent glassmorphic pill background
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();

      ctx.fillStyle = 'rgba(7, 13, 27, 0.94)';
      ctx.fill();
      ctx.restore();

      // Border stroke
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();

      ctx.lineWidth = 3.5;
      ctx.strokeStyle = config.accentColor;
      ctx.stroke();

      // Top glossy highlight reflection
      const grad = ctx.createLinearGradient(0, y, 0, y + 40);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Draw Icon badge on right side (RTL layout)
      const iconBoxSize = 72;
      const iconX = x + w - iconBoxSize - 18;
      const iconY = y + (h - iconBoxSize) / 2;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(iconX, iconY, iconBoxSize, iconBoxSize, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Icon emoji / symbol
      ctx.font = '36px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.icon || '🏛️', iconX + iconBoxSize / 2, iconY + iconBoxSize / 2 + 2);

      // Arabic Main Title Text
      ctx.font = 'bold 36px "Cairo", system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText(config.titleAr, iconX - 16, y + 20);

      // Subtitle / System Tag Badge
      if (config.badgeAr) {
        const badgeText = config.badgeAr;
        ctx.font = 'bold 20px "Cairo", system-ui, -apple-system, sans-serif';
        const badgeWidth = ctx.measureText(badgeText).width + 24;
        const badgeHeight = 32;
        const badgeX = iconX - 16 - badgeWidth;
        const badgeY = y + 68;

        ctx.fillStyle = config.badgeBgColor || 'rgba(245, 158, 11, 0.25)';
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 10);
        ctx.fill();

        ctx.strokeStyle = config.accentColor;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = config.accentColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(badgeText, badgeX + badgeWidth / 2, badgeY + badgeHeight / 2 + 1);
      }
    }

    texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    labelTextureCache.set(cacheKey, texture);
  }

  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: true,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(mat);
  // Aspect ratio is 512 / 144 ≈ 3.55
  sprite.scale.set(7.5, 2.1, 1);
  return sprite;
}
