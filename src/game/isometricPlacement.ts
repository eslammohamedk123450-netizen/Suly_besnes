import { clampIsoCell, isoCellToWorld, type IsoCell, worldToIsoCell } from '../components/city3d/isometricGrid';

export type PlacementCategory = 'buildings' | 'roads' | 'nature' | 'services';

export interface PlacementBounds {
  minQ: number;
  maxQ: number;
  minR: number;
  maxR: number;
}

export interface PlacementFootprint {
  width: number;
  depth: number;
}

export interface PlacementItem {
  id: string;
  category: PlacementCategory;
  footprint: PlacementFootprint;
}

export interface PlacementPreview {
  cell: IsoCell;
  world: { x: number; z: number };
  valid: boolean;
  reason?: 'outside-map' | 'occupied';
}

export interface OccupiedCell {
  cell: IsoCell;
  footprint: PlacementFootprint;
}

export function footprintCells(origin: IsoCell, footprint: PlacementFootprint): IsoCell[] {
  const cells: IsoCell[] = [];
  for (let q = 0; q < footprint.width; q += 1) {
    for (let r = 0; r < footprint.depth; r += 1) {
      cells.push({ q: origin.q + q, r: origin.r + r });
    }
  }
  return cells;
}

function sameCell(a: IsoCell, b: IsoCell): boolean {
  return a.q === b.q && a.r === b.r;
}

function isInside(cell: IsoCell, bounds: PlacementBounds): boolean {
  return cell.q >= bounds.minQ && cell.q <= bounds.maxQ && cell.r >= bounds.minR && cell.r <= bounds.maxR;
}

export function canPlaceItem(
  item: PlacementItem,
  origin: IsoCell,
  occupied: OccupiedCell[],
  bounds: PlacementBounds,
): PlacementPreview {
  const cells = footprintCells(origin, item.footprint);
  if (cells.some((cell) => !isInside(cell, bounds))) {
    return { cell: origin, world: isoCellToWorld(origin), valid: false, reason: 'outside-map' };
  }

  const overlaps = occupied.some((existing) => {
    const existingCells = footprintCells(existing.cell, existing.footprint);
    return cells.some((cell) => existingCells.some((other) => sameCell(cell, other)));
  });
  if (overlaps) {
    return { cell: origin, world: isoCellToWorld(origin), valid: false, reason: 'occupied' };
  }

  return { cell: origin, world: isoCellToWorld(origin), valid: true };
}

export function previewPlacement(
  item: PlacementItem,
  worldX: number,
  worldZ: number,
  occupied: OccupiedCell[],
  bounds: PlacementBounds,
): PlacementPreview {
  const snapped = clampIsoCell(worldToIsoCell(worldX, worldZ), bounds);
  return canPlaceItem(item, snapped, occupied, bounds);
}

export function commitPlacement(
  item: PlacementItem,
  preview: PlacementPreview,
  occupied: OccupiedCell[],
): OccupiedCell[] {
  if (!preview.valid) return occupied;
  return [...occupied, { cell: preview.cell, footprint: item.footprint }];
}
