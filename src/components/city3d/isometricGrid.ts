import * as THREE from 'three';

export const ISO_TILE_SIZE = 4;

export interface IsoCell {
  q: number;
  r: number;
}

/** Convert world X/Z coordinates into a diamond-grid cell. */
export function worldToIsoCell(x: number, z: number, tileSize = ISO_TILE_SIZE): IsoCell {
  const half = tileSize / 2;
  return {
    q: Math.round((x / half + z / half) / 2),
    r: Math.round((z / half - x / half) / 2),
  };
}

/** Convert a diamond-grid cell back to its world X/Z anchor. */
export function isoCellToWorld(cell: IsoCell, tileSize = ISO_TILE_SIZE): { x: number; z: number } {
  const half = tileSize / 2;
  return {
    x: (cell.q - cell.r) * half,
    z: (cell.q + cell.r) * half,
  };
}

export function snapWorldToIsoGrid(x: number, z: number, tileSize = ISO_TILE_SIZE): { x: number; z: number; cell: IsoCell } {
  const cell = worldToIsoCell(x, z, tileSize);
  return { ...isoCellToWorld(cell, tileSize), cell };
}

export function clampIsoCell(cell: IsoCell, bounds: { minQ: number; maxQ: number; minR: number; maxR: number }): IsoCell {
  return {
    q: THREE.MathUtils.clamp(cell.q, bounds.minQ, bounds.maxQ),
    r: THREE.MathUtils.clamp(cell.r, bounds.minR, bounds.maxR),
  };
}

/** Transparent soft ellipse that grounds a 3D building without a flat sticker look. */
export function createSoftDropShadow(width: number, depth: number, color = '#020617'): THREE.Mesh {
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1, 32),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    })
  );
  shadow.name = 'soft_drop_shadow';
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.055;
  shadow.scale.set(Math.max(1, width / 2), Math.max(1, depth / 2), 1);
  shadow.renderOrder = 1;
  return shadow;
}

/** Transparent sprites and labels need a stable camera-facing depth order. */
export function updateIsometricDepthSorting(objects: THREE.Object3D[]): void {
  objects.forEach((object) => {
    const world = new THREE.Vector3();
    object.getWorldPosition(world);
    object.renderOrder = Math.round((world.z * 100) + (world.y * 0.1));
  });
}
