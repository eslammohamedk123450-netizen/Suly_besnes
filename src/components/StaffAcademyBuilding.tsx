import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './StaffAcademyBuilding.css';

interface StaffAcademyBuildingProps {
  level: number;
  activeStaffCount: number;
}

const STAGES = [
  { title: 'المقر التأسيسي', detail: 'بوابة الأكاديمية ومقرّ الكوادر' },
  { title: 'برج المواهب', detail: 'مصعد زجاجي وطابق إضافي' },
  { title: 'مركز القيادة', detail: 'تاج مضيء وأبراج إرشاد' },
  { title: 'المجمع التنفيذي', detail: 'حدائق علوية وشرفات مضاءة' },
  { title: 'أكاديمية النخبة', detail: 'قمة الإمبراطورية ومركز HR' },
] as const;

const clampLevel = (value: number) => Math.max(1, Math.min(5, Math.floor(value || 1)));

type MaterialOptions = {
  color: number;
  metalness?: number;
  roughness?: number;
  emissive?: number;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
};

function makeMaterial(options: MaterialOptions) {
  return new THREE.MeshStandardMaterial({
    color: options.color,
    metalness: options.metalness ?? 0.35,
    roughness: options.roughness ?? 0.42,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 0,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
  });
}

function addBox(
  parent: THREE.Group,
  size: [number, number, number],
  position: [number, number, number],
  material: THREE.Material,
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  parent.add(mesh);
  return mesh;
}

function makeHrBadgeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const context = canvas.getContext('2d');
  if (!context) return null;

  const gradient = context.createLinearGradient(0, 0, 512, 192);
  gradient.addColorStop(0, '#10284a');
  gradient.addColorStop(1, '#071324');
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#f5cc66';
  context.lineWidth = 8;
  context.strokeRect(5, 5, 502, 182);
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = '#f8d77e';
  context.font = '800 88px Arial, sans-serif';
  context.fillText('HR', 256, 78);
  context.fillStyle = '#dceaff';
  context.font = '700 28px Arial, sans-serif';
  context.fillText('ACADEMY', 256, 151);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 2;
  return texture;
}

function addPlant(parent: THREE.Group, x: number, z: number, scale = 1, surfaceY = 0.23) {
  const planter = makeMaterial({ color: 0x182a43, metalness: 0.55, roughness: 0.38 });
  addBox(parent, [0.42 * scale, 0.16 * scale, 0.4 * scale], [x, surfaceY + 0.08 * scale, z], planter);

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025 * scale, 0.04 * scale, 0.27 * scale, 5),
    makeMaterial({ color: 0x9b7138, roughness: 0.72 }),
  );
  stem.position.set(x, surfaceY + 0.28 * scale, z);
  parent.add(stem);

  const leaves = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.19 * scale, 0),
    makeMaterial({ color: 0x40b88b, roughness: 0.62 }),
  );
  leaves.position.set(x, surfaceY + 0.48 * scale, z);
  parent.add(leaves);
}

function addBuildingModel(root: THREE.Group, requestedLevel: number) {
  const level = clampLevel(requestedLevel);
  const body = new THREE.Group();
  root.add(body);

  const navy = makeMaterial({ color: 0x102a4d, metalness: 0.48, roughness: 0.36 });
  const deepNavy = makeMaterial({ color: 0x0a172b, metalness: 0.42, roughness: 0.44 });
  const glass = makeMaterial({
    color: 0x2b7fd0,
    metalness: 0.65,
    roughness: 0.2,
    emissive: 0x07336b,
    emissiveIntensity: 0.42,
  });
  const gold = makeMaterial({
    color: 0xf4c85d,
    metalness: 0.78,
    roughness: 0.24,
    emissive: 0x6b4210,
    emissiveIntensity: 0.2,
  });
  const cyanGlow = makeMaterial({
    color: 0x55dfff,
    metalness: 0.52,
    roughness: 0.2,
    emissive: 0x13a9ff,
    emissiveIntensity: 1.25,
  });

  // Floating architectural plinth, paving, and the illuminated perimeter from the references.
  addBox(body, [4.6, 0.22, 3.35], [0, 0.03, 0], deepNavy);
  addBox(body, [4.42, 0.07, 3.18], [0, 0.17, 0], makeMaterial({ color: 0x203a5d, metalness: 0.54, roughness: 0.36 }));
  addBox(body, [4.72, 0.045, 3.46], [0, 0.16, 0], gold);
  addBox(body, [1.2, 0.035, 0.86], [0, 0.23, 1.02], makeMaterial({ color: 0x607792, metalness: 0.38, roughness: 0.48 }));

  const floorsByLevel = [2, 3, 4, 6, 7];
  const floorCount = floorsByLevel[level - 1];
  const floorHeight = 0.56;
  const firstFloorY = 0.52;
  const bodyDepth = 2.3;
  let topY = firstFloorY;

  for (let floor = 0; floor < floorCount; floor += 1) {
    const width = 3.02 - floor * 0.028;
    const depth = bodyDepth - floor * 0.018;
    const centerY = firstFloorY + floor * floorHeight;
    const frontZ = depth / 2 + 0.045;
    topY = centerY + floorHeight / 2;

    addBox(body, [width, floorHeight - 0.045, depth], [0, centerY, 0], floor === 0 ? deepNavy : navy);
    addBox(body, [width + 0.12, 0.055, depth + 0.12], [0, centerY - floorHeight / 2 + 0.025, 0], gold);
    addBox(body, [width + 0.17, 0.035, depth + 0.16], [0, centerY + floorHeight / 2 - 0.025, 0], cyanGlow);

    const windowWidth = (width - 0.42) / 5;
    for (let window = 0; window < 5; window += 1) {
      const x = -width / 2 + 0.21 + windowWidth * window + windowWidth / 2;
      addBox(body, [windowWidth - 0.055, 0.32, 0.045], [x, centerY, frontZ], glass);
      addBox(body, [0.025, 0.36, 0.06], [x - windowWidth / 2, centerY, frontZ + 0.014], makeMaterial({ color: 0xa9c9e2, metalness: 0.48, roughness: 0.3 }));
    }

    // Side glazing keeps the model legible from the isometric camera angle.
    addBox(body, [0.045, 0.31, depth - 0.3], [width / 2 + 0.025, centerY, 0], glass);
    addBox(body, [0.045, 0.31, depth - 0.3], [-width / 2 - 0.025, centerY, 0], glass);
  }

  // The ground-floor entrance remains a distinct architectural focal point at every rank.
  const entranceY = firstFloorY - 0.02;
  addBox(body, [0.66, 0.4, 0.07], [0, entranceY, bodyDepth / 2 + 0.095], cyanGlow);
  addBox(body, [0.49, 0.31, 0.075], [0, entranceY, bodyDepth / 2 + 0.14], makeMaterial({ color: 0x164c77, metalness: 0.58, roughness: 0.22, emissive: 0x0a3154, emissiveIntensity: 0.55 }));

  const plaqueY = Math.min(topY - 0.42, 1.55);
  addBox(body, [1.45, 0.58, 0.09], [0, plaqueY, bodyDepth / 2 + 0.13], gold);
  addBox(body, [1.35, 0.49, 0.1], [0, plaqueY, bodyDepth / 2 + 0.19], deepNavy);
  const badgeTexture = makeHrBadgeTexture();
  if (badgeTexture) {
    const badge = new THREE.Mesh(
      new THREE.PlaneGeometry(1.21, 0.43),
      new THREE.MeshBasicMaterial({ map: badgeTexture, transparent: false, toneMapped: false }),
    );
    badge.position.set(0, plaqueY, bodyDepth / 2 + 0.25);
    body.add(badge);
  }

  // Each promotion milestone visibly adds a new building system, not merely a number change.
  if (level >= 2) {
    const shaftHeight = floorCount * floorHeight + 0.25;
    addBox(body, [0.32, shaftHeight, 0.18], [-1.22, shaftHeight / 2 + 0.24, bodyDepth / 2 + 0.015], deepNavy);
    addBox(body, [0.07, shaftHeight - 0.18, 0.035], [-1.22, shaftHeight / 2 + 0.24, bodyDepth / 2 + 0.12], cyanGlow);
    addBox(body, [0.09, shaftHeight - 0.18, 0.035], [-1.12, shaftHeight / 2 + 0.24, bodyDepth / 2 + 0.12], gold);
  }

  if (level >= 3) {
    addBox(body, [1.05, 0.16, 0.78], [0, topY + 0.12, 0], gold);
    const spirePositions: [number, number][] = [[-1.16, -0.78], [1.16, -0.78], [-1.16, 0.78], [1.16, 0.78]];
    for (const [x, z] of spirePositions) {
      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.72, 5), gold);
      spire.position.set(x, topY + 0.49, z);
      body.add(spire);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 6), cyanGlow);
      tip.position.set(x, topY + 0.88, z);
      body.add(tip);
    }
  }

  if (level >= 4) {
    const roofY = topY;
    for (const [x, z] of [[-0.82, -0.5], [0.82, -0.5], [-0.82, 0.5], [0.82, 0.5]] as [number, number][]) {
      addPlant(body, x, z, 0.9, roofY);
    }
  }

  if (level >= 5) {
    addBox(body, [0.86, 0.38, 0.72], [0, topY + 0.35, 0], navy);
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.06, 0.85, 8), gold);
    antenna.position.set(0, topY + 0.98, 0);
    body.add(antenna);
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), cyanGlow);
    beacon.position.set(0, topY + 1.43, 0);
    body.add(beacon);
    const crownRing = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.035, 6, 28), gold);
    crownRing.rotation.x = Math.PI / 2;
    crownRing.position.set(0, topY + 0.66, 0);
    body.add(crownRing);
  }

  // Low-poly landscape and warm path lights ground the tower in a miniature campus.
  addPlant(body, -1.8, 1.18, 1.08);
  addPlant(body, 1.8, 1.18, 1.08);
  addPlant(body, -1.75, -1.08, 0.88);
  addPlant(body, 1.75, -1.08, 0.88);

  for (let light = 0; light < 8; light += 1) {
    const x = -1.85 + light * 0.53;
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), gold);
    lamp.position.set(x, 0.27, 1.53);
    body.add(lamp);
  }
}

function disposeGroup(group: THREE.Group) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  group.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    const meshMaterials = Array.isArray(object.material) ? object.material : [object.material];
    meshMaterials.forEach((material) => {
      materials.add(material);
      const map = (material as THREE.MeshStandardMaterial).map;
      if (map) map.dispose();
    });
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  group.clear();
}

export function StaffAcademyBuilding({ level, activeStaffCount }: StaffAcademyBuildingProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const buildingRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const safeLevel = clampLevel(level);
  const stage = STAGES[safeLevel - 1];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch {
      setWebglSupported(false);
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 80);
    camera.position.set(7.8, 7.2, 10.5);
    camera.lookAt(0, 2.35, 0);
    cameraRef.current = camera;

    scene.add(new THREE.HemisphereLight(0xb8dcff, 0x10182a, 2.1));
    const keyLight = new THREE.DirectionalLight(0xffe1a1, 2.8);
    keyLight.position.set(5, 9, 7);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x37bdf8, 1.7);
    rimLight.position.set(-5, 4, -3);
    scene.add(rimLight);

    const model = new THREE.Group();
    model.position.y = -0.24;
    scene.add(model);
    buildingRef.current = model;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.round(bounds.width));
      const height = Math.max(1, Math.round(bounds.height));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clock = new THREE.Clock();
    let frameId = 0;
    let lastRenderAt = 0;
    const renderFrame = (timestamp: number) => {
      if (timestamp - lastRenderAt >= 33) {
        if (!reduceMotion && buildingRef.current) {
          buildingRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.16) * 0.045;
        }
        renderer.render(scene, camera);
        lastRenderAt = timestamp;
      }
      frameId = window.requestAnimationFrame(renderFrame);
    };
    renderFrame(0);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      if (buildingRef.current) disposeGroup(buildingRef.current);
      buildingRef.current = null;
      cameraRef.current = null;
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!buildingRef.current) return;
    disposeGroup(buildingRef.current);
    addBuildingModel(buildingRef.current, safeLevel);
    const floors = [2, 3, 4, 6, 7][safeLevel - 1];
    if (cameraRef.current && floors) {
      cameraRef.current.position.set(7.35, 4.8 + (floors - 2) * 0.57, 8.1 + (floors - 2) * 0.74);
      cameraRef.current.lookAt(0, 0.98 + (floors - 2) * 0.36, 0);
    }
  }, [safeLevel]);

  return (
    <section className="staff-academy" dir="rtl" aria-labelledby="staff-academy-title">
      <div className="staff-academy__header">
        <div>
          <span className="staff-academy__eyebrow">منظومة التطور المهني</span>
          <h2 id="staff-academy-title">مبنى أكاديمية الموارد البشرية</h2>
          <p>كل ترقية ترفع كفاءة الفريق وتضيف مرحلة جديدة إلى مجمّع الكوادر.</p>
        </div>
        <div className="staff-academy__rank" aria-label={`مستوى المبنى ${safeLevel} من 5`}>
          <span>المستوى</span>
          <strong>{safeLevel}<small> / 5</small></strong>
        </div>
      </div>

      <div className="staff-academy__scene">
        {webglSupported ? (
          <canvas
            ref={canvasRef}
            className="staff-academy__canvas"
            role="img"
            aria-label={`مجسم ثلاثي الأبعاد لمبنى أكاديمية الموارد البشرية، ${stage.title}، المستوى ${safeLevel} من خمسة`}
          />
        ) : (
          <div className="staff-academy__fallback" role="status">
            <span>HR</span>
            <strong>عرض المجسّم الثلاثي الأبعاد غير مدعوم في هذا المتصفح.</strong>
          </div>
        )}
        <div className="staff-academy__caption">
          <span className="staff-academy__stage">{stage.title}</span>
          <span>{stage.detail}</span>
        </div>
      </div>

      <div className="staff-academy__footer">
        <span>{activeStaffCount} كادر نشط</span>
        <div className="staff-academy__milestones" aria-label={`مراحل المبنى: المستوى ${safeLevel} من 5`}>
          {STAGES.map((item, index) => (
            <span
              key={item.title}
              className={index < safeLevel ? 'is-reached' : ''}
              title={item.title}
              aria-hidden="true"
            />
          ))}
        </div>
        <span>تتحدد المرحلة بأعلى ترقية نشطة</span>
      </div>
    </section>
  );
}
