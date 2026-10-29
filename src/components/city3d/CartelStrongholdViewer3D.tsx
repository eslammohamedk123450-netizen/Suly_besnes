/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createCityMaterialPalette } from './cityMaterials';
import { buildCartelBastionMesh, CARTEL_STRONGHOLD_LEVELS } from './cartelStronghold3D';
import { RotateCcw, Sun, Moon, Sparkles, ZoomIn, ZoomOut, Play, Pause } from 'lucide-react';

interface CartelStrongholdViewer3DProps {
  level: number;
  onLevelChange?: (lvl: number) => void;
  height?: string | number;
}

export const CartelStrongholdViewer3D: React.FC<CartelStrongholdViewer3DProps> = ({
  level,
  onLevelChange,
  height = '340px',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeLevel, setActiveLevel] = useState<number>(Math.max(1, Math.min(8, level)));
  const [timeMode, setTimeMode] = useState<'day' | 'sunset' | 'night'>('day');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Sync with prop when prop changes
  useEffect(() => {
    setActiveLevel(Math.max(1, Math.min(8, level)));
  }, [level]);

  const levelInfo = CARTEL_STRONGHOLD_LEVELS.find((l) => l.level === activeLevel) ?? CARTEL_STRONGHOLD_LEVELS[0];

  const currentLevelRef = useRef(activeLevel);
  currentLevelRef.current = activeLevel;

  const timeModeRef = useRef(timeMode);
  timeModeRef.current = timeMode;

  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const width = container.clientWidth || 400;
    const heightPx = typeof height === 'number' ? height : container.clientHeight || 340;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(42, width / heightPx, 0.1, 150);
    // Isometric aerial camera position looking down at the coastal palace
    const defaultDist = 26;
    let cameraAngle = Math.PI / 4;
    let cameraPitch = 0.55;
    let cameraDist = defaultDist;

    const updateCameraPos = () => {
      camera.position.x = Math.sin(cameraAngle) * Math.cos(cameraPitch) * cameraDist;
      camera.position.y = Math.sin(cameraPitch) * cameraDist;
      camera.position.z = Math.cos(cameraAngle) * Math.cos(cameraPitch) * cameraDist;
      camera.lookAt(0, 3.5, 0);
    };
    updateCameraPos();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    }
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    dirLight.position.set(20, 35, 18);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x7dd3fc, 0.45);
    fillLight.position.set(-15, 18, -15);
    scene.add(fillLight);

    // Apply lighting mode
    const applyLighting = (mode: 'day' | 'sunset' | 'night') => {
      if (mode === 'day') {
        scene.background = new THREE.Color('#0c192c');
        ambientLight.color.set('#ffffff');
        ambientLight.intensity = 0.85;
        dirLight.color.set('#fffbeb');
        dirLight.intensity = 1.6;
        fillLight.color.set('#38bdf8');
        fillLight.intensity = 0.5;
      } else if (mode === 'sunset') {
        scene.background = new THREE.Color('#2a1215');
        ambientLight.color.set('#fed7aa');
        ambientLight.intensity = 0.6;
        dirLight.color.set('#f97316');
        dirLight.intensity = 2.0;
        fillLight.color.set('#a855f7');
        fillLight.intensity = 0.65;
      } else {
        // Night
        scene.background = new THREE.Color('#030712');
        ambientLight.color.set('#1e293b');
        ambientLight.intensity = 0.4;
        dirLight.color.set('#60a5fa');
        dirLight.intensity = 0.8;
        fillLight.color.set('#c084fc');
        fillLight.intensity = 0.5;
      }
    };
    applyLighting(timeModeRef.current);

    // Model group container
    let modelGroup: THREE.Group | null = null;
    let rotorMesh: THREE.Object3D | null = null;

    const rebuildModel = (lvl: number, isNight: boolean) => {
      if (modelGroup) {
        scene.remove(modelGroup);
        modelGroup.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry?.dispose();
          }
        });
      }
      const palette = createCityMaterialPalette(isNight, false);
      modelGroup = buildCartelBastionMesh(palette, false, lvl);
      // Re-center model
      modelGroup.position.set(0, -1, 0);
      scene.add(modelGroup);

      // Find rotor for animation
      rotorMesh = null;
      modelGroup.traverse((c) => {
        if (c.name === 'cartelHelicopterRotor') {
          rotorMesh = c;
        }
      });
    };

    rebuildModel(currentLevelRef.current, timeModeRef.current === 'night');

    // Drag / Touch Controls
    let prevMouseX = 0;
    let prevMouseY = 0;
    let isMouseDown = false;

    const onPointerDown = (e: PointerEvent) => {
      isMouseDown = true;
      setIsDragging(true);
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      renderer.domElement.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isMouseDown) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      cameraAngle -= dx * 0.008;
      cameraPitch = Math.max(0.15, Math.min(1.2, cameraPitch + dy * 0.006));
      updateCameraPos();
    };

    const onPointerUp = (e: PointerEvent) => {
      isMouseDown = false;
      setIsDragging(false);
      try {
        renderer.domElement.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraDist = Math.max(12, Math.min(42, cameraDist + e.deltaY * 0.025));
      updateCameraPos();
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointercancel', onPointerUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newW = entry.contentRect.width;
        const newH = entry.contentRect.height;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation loop
    let animId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      animId = requestAnimationFrame(animate);
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Auto rotation
      if (autoRotateRef.current && !isMouseDown) {
        cameraAngle += dt * 0.22;
        updateCameraPos();
      }

      // Helicopter rotor spin
      if (rotorMesh) {
        rotorMesh.rotation.y += dt * 22;
      }

      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    // Store callbacks for prop updates
    const domEl = renderer.domElement;
    (domEl as unknown as { __rebuildModel: typeof rebuildModel; __setLighting: typeof applyLighting; __zoom: (d: number) => void; __reset: () => void }).__rebuildModel = rebuildModel;
    (domEl as unknown as { __setLighting: typeof applyLighting }).__setLighting = applyLighting;
    (domEl as unknown as { __zoom: (d: number) => void }).__zoom = (delta: number) => {
      cameraDist = Math.max(12, Math.min(42, cameraDist + delta));
      updateCameraPos();
    };
    (domEl as unknown as { __reset: () => void }).__reset = () => {
      cameraDist = defaultDist;
      cameraAngle = Math.PI / 4;
      cameraPitch = 0.55;
      updateCameraPos();
    };

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      domEl.removeEventListener('pointerdown', onPointerDown);
      domEl.removeEventListener('pointermove', onPointerMove);
      domEl.removeEventListener('pointerup', onPointerUp);
      domEl.removeEventListener('pointercancel', onPointerUp);
      domEl.removeEventListener('wheel', onWheel);
      renderer.dispose();
      scene.clear();
      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }
    };
  }, [height]);

  // Handle active level change
  const handleSelectLevel = (lvl: number) => {
    setActiveLevel(lvl);
    onLevelChange?.(lvl);
    const domEl = mountRef.current?.querySelector('canvas') as unknown as {
      __rebuildModel?: (lvl: number, isNight: boolean) => void;
    };
    if (domEl?.__rebuildModel) {
      domEl.__rebuildModel(lvl, timeMode === 'night');
    }
  };

  const handleTimeMode = (mode: 'day' | 'sunset' | 'night') => {
    setTimeMode(mode);
    const domEl = mountRef.current?.querySelector('canvas') as unknown as {
      __setLighting?: (mode: 'day' | 'sunset' | 'night') => void;
      __rebuildModel?: (lvl: number, isNight: boolean) => void;
    };
    if (domEl?.__setLighting) {
      domEl.__setLighting(mode);
    }
    if (domEl?.__rebuildModel) {
      domEl.__rebuildModel(activeLevel, mode === 'night');
    }
  };

  const handleZoom = (delta: number) => {
    const domEl = mountRef.current?.querySelector('canvas') as unknown as {
      __zoom?: (delta: number) => void;
    };
    domEl?.__zoom?.(delta);
  };

  const handleResetCamera = () => {
    const domEl = mountRef.current?.querySelector('canvas') as unknown as {
      __reset?: () => void;
    };
    domEl?.__reset?.();
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl flex flex-col select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border-b border-amber-500/20 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>مجسم 3D للمبنى</span>
          </span>
          <span className="text-xs font-black text-amber-100">{levelInfo.nameAr}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-amber-500/30">
            مستوى {activeLevel}
          </span>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleTimeMode('day')}
            title="إضاءة نهارية مشمسة"
            className={`p-1.5 rounded-lg border text-xs transition-all ${
              timeMode === 'day'
                ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleTimeMode('sunset')}
            title="إضاءة الغروب الذهبي"
            className={`p-1.5 rounded-lg border text-xs transition-all ${
              timeMode === 'sunset'
                ? 'bg-orange-500 text-white border-orange-400 font-bold shadow'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            🌅
          </button>
          <button
            onClick={() => handleTimeMode('night')}
            title="إضاءة ليلية ملكية"
            className={`p-1.5 rounded-lg border text-xs transition-all ${
              timeMode === 'night'
                ? 'bg-indigo-600 text-white border-indigo-400 font-bold shadow'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <div className="h-4 w-px bg-slate-700 mx-0.5" />
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title={autoRotate ? 'إيقاف الدوران التلقائي' : 'تشغيل الدوران التلقائي'}
            className={`p-1.5 rounded-lg border text-xs ${
              autoRotate ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleResetCamera}
            title="إعادة ضبط زاوية الرؤية"
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Area */}
      <div
        style={{ height }}
        className="w-full relative cursor-grab active:cursor-grabbing bg-slate-950 overflow-hidden"
      >
        {/* Dedicated 3D Canvas Mount Point without React children */}
        <div ref={mountRef} className="absolute inset-0 w-full h-full" />

        {/* Floating Zoom & Interaction Badge */}
        <div className="absolute bottom-3 left-3 z-10 flex flex-col gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 backdrop-blur-md">
          <button
            onClick={() => handleZoom(-3)}
            title="تكبير"
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(3)}
            title="تصغير"
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Floating Feature Tags */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 pointer-events-none text-right">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-amber-200 border border-amber-500/30 backdrop-blur-sm">
            🕌 {levelInfo.totalDomes} قباب ذهبية
          </span>
          {levelInfo.hasWaterfall && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-200 border border-cyan-400/40 backdrop-blur-sm">
              🌊 شلال مائي هادر على الجرف
            </span>
          )}
          {levelInfo.hasHelipad && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-200 border border-emerald-400/40 backdrop-blur-sm">
              🚁 مهبط مروحيات تنفيذي
            </span>
          )}
          {levelInfo.hasYachtHarbor && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-950/80 text-sky-200 border border-sky-400/40 backdrop-blur-sm">
              🛥️ مرسى ويخوت سياحية
            </span>
          )}
        </div>

        {/* Drag Hint */}
        {isDragging ? null : (
          <div className="absolute bottom-3 right-3 z-10 pointer-events-none text-[10px] text-slate-400 bg-black/50 px-2 py-1 rounded-lg border border-slate-800 backdrop-blur-sm">
            اسحب للتدوير 360° | حرك العجلة للتقريب
          </div>
        )}
      </div>

      {/* Level Selection Pill Row */}
      <div className="p-2.5 bg-slate-900 border-t border-slate-800">
        <div className="text-[11px] font-bold text-slate-400 mb-1.5 flex items-center justify-between">
          <span>اختر المستوى لمعاينة مجسمه 3D وصورته المطابقة:</span>
          <span className="text-amber-400 font-mono text-[10px]">مستوى {activeLevel} من 8</span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {CARTEL_STRONGHOLD_LEVELS.map((info) => {
            const isSelected = info.level === activeLevel;
            return (
              <button
                key={info.level}
                onClick={() => handleSelectLevel(info.level)}
                className={`flex flex-col items-center p-1.5 rounded-xl border transition-all text-center ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/20 text-amber-200 ring-2 ring-amber-400/40'
                    : 'border-slate-800 bg-slate-950/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-1 border border-slate-800">
                  <img
                    src={info.imageSrc}
                    alt={info.nameAr}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[8px] font-black text-white py-0.5">
                    Lv.{info.level}
                  </span>
                </div>
                <span className="text-[9px] font-bold truncate max-w-full">{info.nameAr}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
