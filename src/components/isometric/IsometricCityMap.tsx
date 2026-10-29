import React, { useMemo, useRef, useState } from 'react';
import type { PlayerProfile } from '../../domain/player';
import { formatMoney } from '../../domain/formatters';
import { resolveCityGrid, type CityPlotDefinition } from '../../game/cityGridSystem';
import { ALL_CITY_LANDMARKS, type LandmarkId } from '../city3d/cityWorldData';
import type { SelectedItem, CityCameraPreset } from './cityMapTypes';
import './isometricCityMap.css';

interface IsometricCityMapProps {
  profile: PlayerProfile;
  selectedItem: SelectedItem | null;
  onSelectItem: (item: SelectedItem | null) => void;
  cameraPreset?: CityCameraPreset;
  onResetPreset?: () => void;
}

type MapPoint = { x: number; y: number };

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 680;
const SCALE = 6.6;
const ORIGIN = { x: 500, y: 300 };
const VISIBLE_LANDMARKS: LandmarkId[] = ['hq', 'bank', 'stock_exchange', 'factory', 'warehouse_hub', 'tech_tree', 'auctions', 'maritime'];

function project(x: number, z: number): MapPoint {
  return {
    x: ORIGIN.x + (x - z) * SCALE,
    y: ORIGIN.y + (x + z) * SCALE * 0.47,
  };
}

function plotCorners(plot: CityPlotDefinition): MapPoint[] {
  return [
    project(plot.gridX - plot.width / 2, plot.gridZ - plot.depth / 2),
    project(plot.gridX + plot.width / 2, plot.gridZ - plot.depth / 2),
    project(plot.gridX + plot.width / 2, plot.gridZ + plot.depth / 2),
    project(plot.gridX - plot.width / 2, plot.gridZ + plot.depth / 2),
  ];
}

function pointsString(points: MapPoint[]): string {
  return points.map((point) => `${point.x},${point.y}`).join(' ');
}

function centerOf(plot: CityPlotDefinition): MapPoint {
  return project(plot.gridX, plot.gridZ);
}

function statusLabel(status: string): string {
  if (status === 'empty_for_sale') return 'للبيع';
  if (status === 'owned_empty') return 'مملوكة';
  if (status === 'developed') return 'قيد التشغيل';
  if (status === 'constructing' || status === 'clearing') return 'قيد البناء';
  if (status === 'locked') return 'مقفلة';
  return 'مخطط';
}

function buildingColor(plot: ReturnType<typeof resolveCityGrid>['plots'][number]): string {
  if (!plot.company) return plot.status === 'empty_for_sale' ? '#b9d98a' : '#91b875';
  if (plot.zoning === 'industrial') return '#e9844b';
  if (plot.zoning === 'agricultural') return '#7bbf73';
  return '#5fa4cf';
}

function buildingHeight(plot: ReturnType<typeof resolveCityGrid>['plots'][number]): number {
  if (!plot.company) return 0;
  return plot.company.industryId === 'food' || plot.zoning === 'industrial' ? 56 : 42;
}

function BuildingGlyph({ plot, selected }: { plot: ReturnType<typeof resolveCityGrid>['plots'][number]; selected: boolean }) {
  const point = centerOf(plot);
  const height = buildingHeight(plot);
  const width = plot.company ? 52 : 42;
  const color = buildingColor(plot);
  const roof = `${point.x - width / 2},${point.y - height} ${point.x},${point.y - height - 18} ${point.x + width / 2},${point.y - height}`;
  return (
    <g className={`iso-building ${selected ? 'is-selected' : ''}`}>
      {plot.company ? (
        <>
          <polygon points={`${point.x - width / 2},${point.y} ${point.x - width / 2},${point.y - height} ${point.x},${point.y - height - 18} ${point.x},${point.y - 18}`} fill={color} />
          <polygon points={`${point.x},${point.y - 18} ${point.x},${point.y - height - 18} ${point.x + width / 2},${point.y - height} ${point.x + width / 2},${point.y}`} fill={color} opacity="0.78" />
          <polygon points={roof} fill="#f4c66e" opacity="0.92" />
          <path d={`M ${point.x - 16} ${point.y - height + 12} h 9 v 9 h -9 z M ${point.x + 4} ${point.y - height + 12} h 9 v 9 h -9 z M ${point.x - 16} ${point.y - height + 29} h 9 v 9 h -9 z M ${point.x + 4} ${point.y - height + 29} h 9 v 9 h -9 z`} fill="#e6f5f4" opacity="0.9" />
          <rect x={point.x - 5} y={point.y - 18} width="10" height="18" rx="2" fill="#553b42" />
        </>
      ) : (
        <>
          <polygon points={`${point.x - width / 2},${point.y} ${point.x - width / 2},${point.y - 4} ${point.x},${point.y - 18} ${point.x},${point.y - 14}`} fill="#d4b16a" opacity="0.7" />
          <polygon points={`${point.x},${point.y - 14} ${point.x},${point.y - 18} ${point.x + width / 2},${point.y - 4} ${point.x + width / 2},${point.y}`} fill="#b7904f" opacity="0.75" />
          <polygon points={roof} fill="#e9c878" opacity="0.95" />
          <path d={`M ${point.x - 13} ${point.y - 11} h 26`} stroke="#fff2bd" strokeWidth="2" strokeDasharray="4 4" opacity="0.8" />
        </>
      )}
      {selected && <ellipse cx={point.x} cy={point.y + 3} rx="42" ry="12" fill="none" stroke="#ffe08a" strokeWidth="3" strokeDasharray="6 4" />}
    </g>
  );
}

function LandmarkGlyph({ id, selected, onClick }: { id: LandmarkId; selected: boolean; onClick: () => void }) {
  const landmark = ALL_CITY_LANDMARKS.find((item) => item.id === id);
  if (!landmark) return null;
  const point = project(landmark.coordinates.x, landmark.coordinates.z);
  const isTall = id === 'hq' || id === 'bank' || id === 'stock_exchange';
  const width = id === 'hq' ? 72 : 52;
  const height = id === 'hq' ? 112 : isTall ? 72 : 48;
  return (
    <g className={`iso-landmark ${selected ? 'is-selected' : ''}`} onClick={onClick} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onClick(); }}>
      <ellipse cx={point.x} cy={point.y + 5} rx={width * 0.72} ry="13" fill="#152a34" opacity="0.3" />
      <polygon points={`${point.x - width / 2},${point.y} ${point.x - width / 2},${point.y - height} ${point.x},${point.y - height - 20} ${point.x},${point.y - 20}`} fill={landmark.accentColor} />
      <polygon points={`${point.x},${point.y - 20} ${point.x},${point.y - height - 20} ${point.x + width / 2},${point.y - height} ${point.x + width / 2},${point.y}`} fill={landmark.accentColor} opacity="0.72" />
      <polygon points={`${point.x - width / 2},${point.y - height} ${point.x},${point.y - height - 20} ${point.x + width / 2},${point.y - height}`} fill="#f9d98b" />
      <rect x={point.x - 9} y={point.y - height + 18} width="18" height="18" rx="3" fill="#eaf7ff" opacity="0.9" />
      <text x={point.x} y={point.y + 25} textAnchor="middle" className="landmark-label">{landmark.icon} {landmark.titleAr}</text>
    </g>
  );
}

export const IsometricCityMap: React.FC<IsometricCityMapProps> = ({ profile, selectedItem, onSelectItem, cameraPreset, onResetPreset }) => {
  const grid = useMemo(() => resolveCityGrid(profile), [profile]);
  const plots = grid.plots;
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);
  const suppressClickRef = useRef(false);
  const velocityRef = useRef({ x: 0, y: 0 });
  const activePlotId = selectedItem?.type === 'plot' ? selectedItem.plot.id : null;
  const activeLandmarkId = selectedItem?.type === 'landmark' ? selectedItem.id : null;
  const clampOffset = (next: { x: number; y: number }, zoomValue = zoom) => {
    const viewport = viewportRef.current;
    const viewportWidth = viewport?.clientWidth ?? MAP_WIDTH;
    const viewportHeight = viewport?.clientHeight ?? MAP_HEIGHT;
    const maxX = Math.max(0, (MAP_WIDTH * zoomValue - viewportWidth) / 2 + 120);
    const maxY = Math.max(0, (MAP_HEIGHT * zoomValue - viewportHeight) / 2 + 120);
    return {
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    };
  };
  React.useEffect(() => {
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.04, (now - previous) / 1000);
      previous = now;
      const velocity = velocityRef.current;
      if (Math.abs(velocity.x) > 0.05 || Math.abs(velocity.y) > 0.05) {
        setOffset((current) => clampOffset({
          x: current.x + velocity.x * dt,
          y: current.y + velocity.y * dt,
        }));
        const damping = Math.exp(-7.5 * dt);
        velocity.x *= damping;
        velocity.y *= damping;
        frame = requestAnimationFrame(tick);
      } else {
        velocity.x = 0;
        velocity.y = 0;
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [zoom]);

  const applyPreset = (preset?: CityCameraPreset) => {
    if (!preset || preset === 'center') {
      setOffset({ x: 0, y: 0 });
      setZoom(1);
      onResetPreset?.();
      return;
    }
    const target = preset === 'hq' ? { x: 0, z: 0 } : preset === 'bank' ? { x: -24, z: 12 } : preset === 'stock_exchange' ? { x: 24, z: 12 } : preset === 'tech' ? { x: -52, z: -45 } : preset === 'maritime' ? { x: 20, z: 24 } : { x: 0, z: 0 };
    const point = project(target.x, target.z);
    setOffset({ x: MAP_WIDTH / 2 - point.x, y: MAP_HEIGHT / 2 - point.y + 60 });
    setZoom(1.18);
  };
  React.useEffect(() => { applyPreset(cameraPreset); }, [cameraPreset]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    velocityRef.current = { x: 0, y: 0 };
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointersRef.current.size === 2) {
      const [first, second] = [...pointersRef.current.values()];
      pinchRef.current = { distance: Math.hypot(first.x - second.x, first.y - second.y), zoom };
      dragRef.current = null;
      return;
    }
    dragRef.current = { x: event.clientX, y: event.clientY, moved: false };
  };
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointersRef.current.has(event.pointerId)) {
      pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }
    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const [first, second] = [...pointersRef.current.values()];
      const distance = Math.max(1, Math.hypot(first.x - second.x, first.y - second.y));
      setZoom(Math.min(1.65, Math.max(0.72, pinchRef.current.zoom * (distance / pinchRef.current.distance))));
      suppressClickRef.current = true;
      return;
    }
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
    velocityRef.current = { x: dx * 18, y: dy * 18 };
    setOffset((current) => clampOffset({ x: current.x + dx, y: current.y + dy }));
    drag.x = event.clientX;
    drag.y = event.clientY;
  };
  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId);
    if (dragRef.current?.moved || pinchRef.current) suppressClickRef.current = true;
    if (pointersRef.current.size < 2) pinchRef.current = null;
    dragRef.current = null;
  };
  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    setZoom((current) => Math.min(1.65, Math.max(0.72, current + (event.deltaY > 0 ? -0.08 : 0.08))));
  };
  const selectPlot = (plot: ReturnType<typeof resolveCityGrid>['plots'][number]) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    onSelectItem({ type: 'plot', plot });
  };
  const selectLandmark = (id: LandmarkId) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    onSelectItem({ type: 'landmark', id });
  };

  return (
    <div className="isometric-map-shell" dir="rtl">
      <div className="isometric-map-toolbar">
        <div><strong>مدينة الأعمال</strong><span>خريطة تشغيلية 2.5D</span></div>
        <div className="isometric-map-actions">
          <button type="button" onClick={() => setZoom((value) => Math.min(1.65, value + 0.12))} aria-label="تكبير الخريطة">+</button>
          <button type="button" onClick={() => setZoom((value) => Math.max(0.72, value - 0.12))} aria-label="تصغير الخريطة">−</button>
          <button type="button" onClick={() => applyPreset('center')} aria-label="إعادة تمركز الخريطة">⌾</button>
        </div>
      </div>
      <div ref={viewportRef} className="isometric-map-viewport" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onWheel={handleWheel}>
        <svg className="isometric-map-canvas" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }} aria-label="خريطة مدينة الأعمال">
          <defs>
            <linearGradient id="isoGround" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#d9edb2" /><stop offset="1" stopColor="#9dcf86" /></linearGradient>
            <filter id="isoShadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#24434b" floodOpacity="0.24" /></filter>
          </defs>
          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="#b8dc9c" />
          <polygon points="0,120 500,0 1000,120 1000,560 500,680 0,560" fill="url(#isoGround)" />
          <g className="iso-road-layer">
            <path d="M -120 515 L 520 0" /><path d="M 260 680 L 930 105" /><path d="M 20 80 L 1030 590" /><path d="M -80 300 L 1040 305" /><path d="M 195 -40 L 815 720" />
            <path className="iso-road-marking" d="M -120 515 L 520 0 M 260 680 L 930 105 M 20 80 L 1030 590 M -80 300 L 1040 305 M 195 -40 L 815 720" />
          </g>
          <g className="iso-lot-layer">
            {plots.map((plot) => {
              const selected = activePlotId === plot.id;
              return <polygon key={plot.id} points={pointsString(plotCorners(plot))} className={`iso-plot ${plot.status === 'empty_for_sale' ? 'for-sale' : ''} ${selected ? 'is-selected' : ''}`} onClick={(event) => { event.stopPropagation(); selectPlot(plot); }} />;
            })}
          </g>
          <g filter="url(#isoShadow)">
            {plots.map((plot) => <g key={`building-${plot.id}`} onClick={(event) => { event.stopPropagation(); selectPlot(plot); }}><BuildingGlyph plot={plot} selected={activePlotId === plot.id} /></g>)}
            {VISIBLE_LANDMARKS.map((id) => <LandmarkGlyph key={id} id={id} selected={activeLandmarkId === id} onClick={() => selectLandmark(id)} />)}
          </g>
          <g className="iso-legend">
            <rect x="28" y="28" width="215" height="78" rx="16" fill="#102b37" opacity="0.93" />
            <text x="48" y="57" fill="#f4d58b" fontSize="15" fontWeight="800">خريطة الإمبراطورية</text>
            <text x="48" y="80" fill="#d7eee5" fontSize="11">{plots.filter((plot) => plot.status === 'empty_for_sale').length} أراضٍ متاحة · {profile.companies.length} منشآت</text>
            <text x="48" y="97" fill="#a9c8c1" fontSize="10">اسحب للتحريك · قرّب بإصبعين</text>
          </g>
        </svg>
      </div>
      <div className="isometric-map-footer">
        <span><i className="legend-dot available" /> أرض قابلة للشراء</span><span><i className="legend-dot owned" /> أرض مملوكة</span><span><i className="legend-dot building" /> منشأة تشغيلية</span>
        <span className="isometric-balance">السيولة: {formatMoney(profile.bankBalance, undefined)}</span>
      </div>
    </div>
  );
};

export default IsometricCityMap;
const MAP_GRID_SIZE = 40;
const MAP_WORLD_WIDTH = 1400;
const MAP_WORLD_HEIGHT = 875;
const MIN_MAP_ZOOM = 0.16;
const MAX_MAP_ZOOM = 2.2;

const MAP_BUILDINGS = [
  { id: 'hq', label: 'المقر الرئيسي', image: '/assets/buildings/hq.webp', col: 18, row: 18, cells: 9 },
  { id: 'shop', label: 'المركز التجاري', image: '/assets/buildings/shop.webp', col: 24, row: 22, cells: 8 },
  { id: 'factory', label: 'المنطقة الصناعية', image: '/assets/buildings/factory.webp', col: 32, row: 8, cells: 8 },
] as const;

const MAP_AIRPORT = { col: 28, row: 3 };
const MAP_PORT = { col: 7, row: 34 };
const MAIN_ROAD_INDEX = Math.floor(MAP_GRID_SIZE / 2);

function isFutureBuildingPlot(row: number, col: number): boolean {
  if (Math.abs(row - MAIN_ROAD_INDEX) <= 1 || Math.abs(col - MAIN_ROAD_INDEX) <= 1) return false;
  const reserved = [...MAP_BUILDINGS.map(({ row: buildingRow, col: buildingCol }) => ({ row: buildingRow, col: buildingCol })), MAP_AIRPORT, MAP_PORT];
  if (reserved.some((item) => Math.abs(row - item.row) <= 1 && Math.abs(col - item.col) <= 1)) return false;
  const nearHub = Math.abs(row - 18) <= 4 && Math.abs(col - 18) <= 4;
  const nearFactory = Math.abs(row - 8) <= 4 && Math.abs(col - 32) <= 4;
  return nearHub || nearFactory;
}

function toMapPercent(cellIndex: number): string {
  return `${((cellIndex + 0.5) / MAP_GRID_SIZE) * 100}%`;
}

function getMapFitZoom(): number {
  const width = window.visualViewport?.width ?? window.innerWidth;
  const height = window.visualViewport?.height ?? window.innerHeight;
  const fit = Math.min(width / MAP_WORLD_WIDTH, height / MAP_WORLD_HEIGHT);
  return Math.min(MAX_MAP_ZOOM, Math.max(MIN_MAP_ZOOM, fit * 0.94));
}

export const IsometricMapSkeleton: React.FC = () => {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const pointersRef = React.useRef(new Map<number, { x: number; y: number }>());
  const dragRef = React.useRef<{ x: number; y: number } | null>(null);
  const pinchRef = React.useRef<{ distance: number; zoom: number } | null>(null);
  const [zoom, setZoom] = React.useState(getMapFitZoom);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });

  const fitMap = React.useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const visualWidth = window.visualViewport?.width ?? viewport.clientWidth;
    const visualHeight = window.visualViewport?.height ?? viewport.clientHeight;
    const fit = Math.min(visualWidth / MAP_WORLD_WIDTH, visualHeight / MAP_WORLD_HEIGHT);
    setZoom(Math.min(MAX_MAP_ZOOM, Math.max(MIN_MAP_ZOOM, fit * 0.94)));
    setOffset({ x: 0, y: 0 });
  }, []);

  React.useEffect(() => {
    fitMap();
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(fitMap);
    observer?.observe(viewport);
    window.addEventListener('resize', fitMap);
    window.visualViewport?.addEventListener('resize', fitMap);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', fitMap);
      window.visualViewport?.removeEventListener('resize', fitMap);
    };
  }, [fitMap]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('.map-expansion-controls')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointersRef.current.size >= 2) {
      const [first, second] = [...pointersRef.current.values()];
      pinchRef.current = { distance: Math.hypot(first.x - second.x, first.y - second.y), zoom };
      dragRef.current = null;
      return;
    }
    dragRef.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointersRef.current.has(event.pointerId)) {
      pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }
    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const [first, second] = [...pointersRef.current.values()];
      const distance = Math.max(1, Math.hypot(first.x - second.x, first.y - second.y));
      setZoom(Math.min(MAX_MAP_ZOOM, Math.max(MIN_MAP_ZOOM, pinchRef.current.zoom * distance / pinchRef.current.distance)));
      return;
    }
    if (!dragRef.current) return;
    const dx = event.clientX - dragRef.current.x;
    const dy = event.clientY - dragRef.current.y;
    setOffset((current) => ({ x: current.x + dx, y: current.y + dy }));
    dragRef.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    dragRef.current = null;
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    setZoom((current) => Math.min(MAX_MAP_ZOOM, Math.max(MIN_MAP_ZOOM, current + (event.deltaY < 0 ? 0.08 : -0.08))));
  };

  return (
    <main className="map-skeleton" aria-label="خريطة إمبراطورية الأعمال">
      <div ref={viewportRef} className="map-expansion-viewport" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onWheel={handleWheel}>
        <div className="map-expansion-world" style={{ transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})` }}>
          <div className="map-expansion-grid" aria-label="شبكة 40 في 40، 1600 قطعة أرض">
            {Array.from({ length: MAP_GRID_SIZE * MAP_GRID_SIZE }, (_, index) => {
              const row = Math.floor(index / MAP_GRID_SIZE);
              const col = index % MAP_GRID_SIZE;
              return <span key={index} className={`map-expansion-cell${isFutureBuildingPlot(row, col) ? ' is-future-plot' : ''}`} />;
            })}
          </div>
          <div className="map-expansion-assets">
            {MAP_BUILDINGS.map((building) => (
              <figure key={building.id} className={`map-expansion-building building--${building.id}`} style={{ left: toMapPercent(building.col), top: toMapPercent(building.row), width: `${(building.cells / MAP_GRID_SIZE) * 100}%` }}>
                <img src={building.image} alt={building.label} draggable={false} />
                <figcaption>{building.label}</figcaption>
              </figure>
            ))}
            <div className="map-expansion-airport" style={{ left: toMapPercent(MAP_AIRPORT.col), top: toMapPercent(MAP_AIRPORT.row) }} aria-label="المطار في المنطقة الشمالية">
              <span className="airport-runway"><i /><i /><i /><i /><i /></span>
              <span className="airport-terminal">✈</span>
              <span className="map-expansion-label">المطار</span>
            </div>
            <div className="map-expansion-port" style={{ left: toMapPercent(MAP_PORT.col), top: toMapPercent(MAP_PORT.row) }} aria-label="الميناء في المنطقة الجنوبية">
              <span className="port-water" />
              <span className="port-pier" />
              <span className="port-crane" />
              <span className="map-expansion-label">الميناء</span>
            </div>
          </div>
        </div>
      </div>
      <nav className="map-expansion-controls" aria-label="أدوات عرض الخريطة" onPointerDown={(event) => event.stopPropagation()}>
        <span className="map-expansion-size">40 × 40 · 1,600 قطعة</span>
        <button type="button" aria-label="تكبير" onClick={() => setZoom((current) => Math.min(MAX_MAP_ZOOM, current + 0.14))}>+</button>
        <button type="button" aria-label="تصغير" onClick={() => setZoom((current) => Math.max(MIN_MAP_ZOOM, current - 0.14))}>−</button>
        <button type="button" aria-label="ملاءمة الخريطة للشاشة" onClick={fitMap}>⌂</button>
      </nav>
    </main>
  );
};
