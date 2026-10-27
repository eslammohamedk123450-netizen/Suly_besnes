/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { PlayerProfile } from '../../domain/player';
import {
  resolveCityGrid,
  loadCityConstructions,
  type CityPlotDefinition,
  type CityConstructionState,
} from '../../game/cityGridSystem';
import { playSound } from '../../game/soundEffects';
import {
  createCityMaterialPalette,
  disposeCityMaterialPalette,
  type CityMaterialPalette,
} from './cityMaterials';
import {
  buildEmptyPlotMesh,
  buildPaperworkSurveyMesh,
  buildSiteClearingMesh,
  buildActiveConstructionMesh,
  buildHQMesh,
  buildBankMesh,
  buildFactoryMesh,
  buildStoreMesh,
  buildWarehouseMesh,
  buildBranchMesh,
  buildTechHubMesh,
  buildAgroFarmMesh,
} from './cityMeshBuilders';
import { buildCityRoadNetwork, type TrafficVehicle } from './cityRoadNetwork';
import { CityTouchController } from './cityTouchControls';
import {
  classifyIndustryToFacility,
  resolvePlotVisualStage,
} from './cityWorldData';

export type SelectedItem =
  | { type: 'landmark'; id: 'hq' | 'bank' | 'factory' }
  | { type: 'plot'; plot: ReturnType<typeof resolveCityGrid>['plots'][number] };

interface CityCanvasProps {
  profile: PlayerProfile;
  selectedItem: SelectedItem | null;
  onSelectItem: (item: SelectedItem | null) => void;
  isNightMode?: boolean;
  cameraPreset?: 'center' | 'hq' | 'bank' | 'factory' | 'plots' | null;
  onResetPreset?: () => void;
}

export const CityCanvas: React.FC<CityCanvasProps> = ({
  profile,
  selectedItem,
  onSelectItem,
  isNightMode = true,
  cameraPreset,
  onResetPreset,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef(selectedItem);
  selectedItemRef.current = selectedItem;
  const onSelectItemRef = useRef(onSelectItem);
  onSelectItemRef.current = onSelectItem;

  // Camera targets for smooth frame-rate independent exponential damping
  const cameraTargetPos = useRef(new THREE.Vector3(0, 34, 45));
  const cameraLookAtPos = useRef(new THREE.Vector3(0, 0, 4));

  // Touch controller instance ref
  const touchControllerRef = useRef<CityTouchController | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 540;

    // Detect software GL to optimize rendering budget on low-end / headless devices
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 1. Scene setup with horizon fog matching night/day atmosphere
    const scene = new THREE.Scene();
    const skyColor = isNightMode ? '#070b14' : '#0f172a';
    const fogColor = isNightMode ? '#090d18' : '#1e293b';
    scene.background = new THREE.Color(skyColor);
    scene.fog = new THREE.FogExp2(fogColor, 0.008);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 320);
    camera.position.set(0, 36, 48);
    camera.lookAt(0, 0, 4);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Procedural Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Lighting Rig (Warm Key, Cool Sky Fill, Rim Lighting)
    const hemiLight = new THREE.HemisphereLight(
      isNightMode ? '#38bdf8' : '#e0f2fe',
      isNightMode ? '#090d18' : '#1e293b',
      isNightMode ? 0.75 : 1.15
    );
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight('#fef08a', isNightMode ? 1.5 : 2.2);
    dirLight.position.set(35, 55, 35);
    dirLight.castShadow = !isSoftwareGl;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 140;
    const shadowD = 55;
    dirLight.shadow.camera.left = -shadowD;
    dirLight.shadow.camera.right = shadowD;
    dirLight.shadow.camera.top = shadowD;
    dirLight.shadow.camera.bottom = -shadowD;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // Accent atmospheric point lights
    const hqPointLight = new THREE.PointLight('#f59e0b', 2.8, 50);
    hqPointLight.position.set(0, 18, 0);
    scene.add(hqPointLight);

    const bankPointLight = new THREE.PointLight('#38bdf8', 1.9, 32);
    bankPointLight.position.set(-18, 10, 8);
    scene.add(bankPointLight);

    const factoryPointLight = new THREE.PointLight('#fb923c', 2.1, 35);
    factoryPointLight.position.set(18, 10, 8);
    scene.add(factoryPointLight);

    // 6. Materials Palette
    const palette: CityMaterialPalette = createCityMaterialPalette(isNightMode, isSoftwareGl);

    // 7. Ground Plane
    const groundGeo = new THREE.PlaneGeometry(180, 180);
    const ground = new THREE.Mesh(groundGeo, palette.ground);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = !isSoftwareGl;
    scene.add(ground);

    // 8. Modular Road Grid & Traffic
    const roadNetwork = buildCityRoadNetwork(palette, isSoftwareGl, isNightMode);
    scene.add(roadNetwork.group);
    const trafficVehicles: TrafficVehicle[] = roadNetwork.vehicles;

    // 9. Clickable Targets Map
    const clickableObjects = new Map<THREE.Object3D, SelectedItem>();
    const registerClickable = (meshOrGroup: THREE.Object3D, item: SelectedItem) => {
      clickableObjects.set(meshOrGroup, item);
      meshOrGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          clickableObjects.set(child, item);
        }
      });
    };

    // 10. Smoke Particles for Industrial Stacks
    const smokeParticles: THREE.Mesh[] = [];
    const smokeGeo = new THREE.SphereGeometry(0.35, 6, 6);
    const smokeMat = new THREE.MeshBasicMaterial({
      color: '#94a3b8',
      transparent: true,
      opacity: 0.35,
    });

    // -------------------------------------------------------------
    // BUILD CENTRAL IMPERIAL LANDMARKS
    // -------------------------------------------------------------
    const gridData = resolveCityGrid(profile, loadCityConstructions(profile));
    const hqLevel = gridData.hqLevel;

    // A. IMPERIAL HEADQUARTERS
    const hqMesh = buildHQMesh(hqLevel, palette, isSoftwareGl);
    hqMesh.position.set(0, 0, 0);
    scene.add(hqMesh);
    registerClickable(hqMesh, { type: 'landmark', id: 'hq' });

    // Rotating Crown Halo on HQ
    const crownRingGeo = new THREE.RingGeometry(2.4, 2.7, 24);
    const crownRing = new THREE.Mesh(crownRingGeo, palette.plotHoloRing);
    crownRing.rotation.x = Math.PI / 2;
    crownRing.position.y = 10 + hqLevel * 5.6;
    hqMesh.add(crownRing);

    // B. CENTRAL SOVEREIGN BANK
    const bankMesh = buildBankMesh(palette, isSoftwareGl);
    bankMesh.position.set(-18, 0, 8);
    scene.add(bankMesh);
    registerClickable(bankMesh, { type: 'landmark', id: 'bank' });

    // C. FLAGSHIP MANUFACTURING COMPLEX
    const factoryResult = buildFactoryMesh(palette, isSoftwareGl);
    factoryResult.group.position.set(18, 0, 8);
    scene.add(factoryResult.group);
    registerClickable(factoryResult.group, { type: 'landmark', id: 'factory' });

    // Spawn smoke particles above factory stacks
    factoryResult.smokePositions.forEach((pos) => {
      for (let s = 0; s < 4; s++) {
        const sm = new THREE.Mesh(smokeGeo, smokeMat);
        sm.position.set(18 + pos.x, pos.y + s * 0.8, 8 + pos.z);
        scene.add(sm);
        smokeParticles.push(sm);
      }
    });

    // -------------------------------------------------------------
    // BUILD CITY PLOTS WITH VISUAL STAGES
    // -------------------------------------------------------------
    gridData.plots.forEach((plot) => {
      const plotGroup = new THREE.Group();
      plotGroup.position.set(plot.gridX, 0, plot.gridZ);

      // Determine visual construction stage
      let progressPercent: number | undefined;
      if (plot.construction) {
        const elapsed = Date.now() - plot.construction.startedAt;
        progressPercent = Math.min(100, Math.floor((elapsed / plot.construction.durationMs) * 100));
      }

      const visualStage = resolvePlotVisualStage(plot.status, progressPercent);

      if (visualStage === 'empty_plot' || visualStage === 'locked') {
        const emptyMesh = buildEmptyPlotMesh(
          plot.width,
          plot.depth,
          visualStage,
          plot.defaultPrice,
          palette,
          isSoftwareGl
        );
        plotGroup.add(emptyMesh);
      } else if (visualStage === 'paperwork_survey') {
        const surveyMesh = buildPaperworkSurveyMesh(plot.width, plot.depth, palette, isSoftwareGl);
        plotGroup.add(surveyMesh);
      } else if (visualStage === 'site_clearing') {
        const clearingMesh = buildSiteClearingMesh(plot.width, plot.depth, palette, isSoftwareGl);
        plotGroup.add(clearingMesh);
      } else if (visualStage === 'active_construction') {
        const constructionMesh = buildActiveConstructionMesh(
          plot.width,
          plot.depth,
          palette,
          isSoftwareGl
        );
        plotGroup.add(constructionMesh);
      } else {
        // COMPLETED FACILITY: Company, Branch office, or Retail shop
        let completedFacilityMesh: THREE.Group;

        if (plot.branch) {
          completedFacilityMesh = buildBranchMesh(palette, isSoftwareGl);
          completedFacilityMesh.scale.set(0.9, 0.9, 0.9);
        } else if (plot.shop) {
          completedFacilityMesh = buildStoreMesh(palette, isSoftwareGl);
          completedFacilityMesh.scale.set(0.9, 0.9, 0.9);
        } else {
          const category = classifyIndustryToFacility(plot.company?.industryId);

          switch (category) {
            case 'factory': {
              const res = buildFactoryMesh(palette, isSoftwareGl);
              res.group.scale.set(0.75, 0.75, 0.75);
              completedFacilityMesh = res.group;
              break;
            }
            case 'store': {
              completedFacilityMesh = buildStoreMesh(palette, isSoftwareGl);
              completedFacilityMesh.scale.set(0.85, 0.85, 0.85);
              break;
            }
            case 'warehouse': {
              completedFacilityMesh = buildWarehouseMesh(palette, isSoftwareGl);
              completedFacilityMesh.scale.set(0.8, 0.8, 0.8);
              break;
            }
            case 'tech_hub': {
              completedFacilityMesh = buildTechHubMesh(palette, isSoftwareGl);
              completedFacilityMesh.scale.set(0.8, 0.8, 0.8);
              break;
            }
            case 'central_bank': {
              completedFacilityMesh = buildBankMesh(palette, isSoftwareGl);
              completedFacilityMesh.scale.set(0.75, 0.75, 0.75);
              break;
            }
            case 'agricultural_farm': {
              completedFacilityMesh = buildAgroFarmMesh(palette, isSoftwareGl);
              completedFacilityMesh.scale.set(0.8, 0.8, 0.8);
              break;
            }
            case 'regional_branch':
            default: {
              completedFacilityMesh = buildBranchMesh(palette, isSoftwareGl);
              completedFacilityMesh.scale.set(0.85, 0.85, 0.85);
              break;
            }
          }
        }

        plotGroup.add(completedFacilityMesh);
      }

      scene.add(plotGroup);
      registerClickable(plotGroup, { type: 'plot', plot });
    });

    // 11. Selection Indicator Halo
    const selectionHaloGeo = new THREE.RingGeometry(3.2, 3.6, 32);
    const selectionHalo = new THREE.Mesh(selectionHaloGeo, palette.plotHoloRing);
    selectionHalo.rotation.x = -Math.PI / 2;
    selectionHalo.position.y = 0.35;
    selectionHalo.visible = false;
    scene.add(selectionHalo);

    // 12. Touch & Mouse Interaction Controller
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleTapRaycast = (normX: number, normY: number) => {
      mouse.x = normX;
      mouse.y = normY;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);
      let hitItem: SelectedItem | null = null;

      for (const hit of intersects) {
        let curr: THREE.Object3D | null = hit.object;
        while (curr && curr !== scene) {
          if (clickableObjects.has(curr)) {
            hitItem = clickableObjects.get(curr)!;
            break;
          }
          curr = curr.parent;
        }
        if (hitItem) break;
      }

      if (hitItem) {
        playSound('click');
        onSelectItemRef.current(hitItem);
      } else {
        onSelectItemRef.current(null);
      }
    };

    const touchCtrl = new CityTouchController({
      domElement: renderer.domElement,
      camera,
      cameraTargetPos,
      cameraLookAtPos,
      onTapRaycast: handleTapRaycast,
    });
    touchControllerRef.current = touchCtrl;

    // Window Resize Handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // -------------------------------------------------------------
    // RENDER LOOP with frame-rate independent exponential damping
    // -------------------------------------------------------------
    let animationFrameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const dt = Math.min(clock.getDelta(), 0.1);

      // Smooth camera position damping (frame-rate independent)
      camera.position.x = THREE.MathUtils.damp(camera.position.x, cameraTargetPos.current.x, 7.5, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, cameraTargetPos.current.y, 7.5, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, cameraTargetPos.current.z, 7.5, dt);

      // Smooth camera target orientation
      camera.lookAt(cameraLookAtPos.current);

      // Update mobile touch inertia
      touchCtrl.updateInertia(dt);

      // Animate smoke particles rising from stacks
      smokeParticles.forEach((smoke, idx) => {
        smoke.position.y += dt * 0.65;
        smoke.scale.multiplyScalar(1 + dt * 0.12);
        if (smoke.position.y > 15.2) {
          smoke.position.y = 9.8 + (idx % 4) * 0.6;
          smoke.scale.set(1, 1, 1);
        }
      });

      // Animate road traffic
      trafficVehicles.forEach((v) => {
        if (v.axis === 'z') {
          v.mesh.position.z += v.dir * v.speed;
          if (v.mesh.position.z > v.max || v.mesh.position.z < v.min) {
            v.dir = (v.dir * -1) as 1 | -1;
            v.mesh.rotation.y += Math.PI;
          }
        } else {
          v.mesh.position.x += v.dir * v.speed;
          if (v.mesh.position.x > v.max || v.mesh.position.x < v.min) {
            v.dir = (v.dir * -1) as 1 | -1;
            v.mesh.rotation.y += Math.PI;
          }
        }
      });

      // Subtle rotation on HQ beacon ring
      crownRing.rotation.z += dt * 0.45;

      // Update Selection Indicator position
      const currentSelected = selectedItemRef.current;
      if (currentSelected) {
        selectionHalo.visible = true;
        if (currentSelected.type === 'landmark') {
          if (currentSelected.id === 'hq') selectionHalo.position.set(0, 0.35, 0);
          else if (currentSelected.id === 'bank') selectionHalo.position.set(-18, 0.35, 8);
          else if (currentSelected.id === 'factory') selectionHalo.position.set(18, 0.35, 8);
        } else if (currentSelected.type === 'plot') {
          selectionHalo.position.set(
            currentSelected.plot.gridX,
            0.35,
            currentSelected.plot.gridZ
          );
        }
        selectionHalo.rotation.z += dt * 1.5;
      } else {
        selectionHalo.visible = false;
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Clean unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onResize);
      touchCtrl.dispose();
      touchControllerRef.current = null;

      renderer.dispose();
      disposeCityMaterialPalette(palette);
      groundGeo.dispose();
      smokeGeo.dispose();
      smokeMat.dispose();
      selectionHaloGeo.dispose();
      crownRingGeo.dispose();

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [profile, isNightMode]);

  // Handle camera presets changes smoothly
  useEffect(() => {
    if (!cameraPreset) return;
    if (cameraPreset === 'center') {
      cameraTargetPos.current.set(0, 34, 45);
      cameraLookAtPos.current.set(0, 0, 4);
    } else if (cameraPreset === 'hq') {
      cameraTargetPos.current.set(0, 18, 22);
      cameraLookAtPos.current.set(0, 8, 0);
    } else if (cameraPreset === 'bank') {
      cameraTargetPos.current.set(-18, 14, 25);
      cameraLookAtPos.current.set(-18, 3, 8);
    } else if (cameraPreset === 'factory') {
      cameraTargetPos.current.set(18, 14, 25);
      cameraLookAtPos.current.set(18, 3, 8);
    } else if (cameraPreset === 'plots') {
      cameraTargetPos.current.set(24, 26, -5);
      cameraLookAtPos.current.set(25, 0, -18);
    }
    if (onResetPreset) onResetPreset();
  }, [cameraPreset, onResetPreset]);

  // Expose quick zoom & rotation helpers for mobile overlay buttons
  const handleZoomIn = () => touchControllerRef.current?.zoomStep('in');
  const handleZoomOut = () => touchControllerRef.current?.zoomStep('out');
  const handleRotateLeft = () => touchControllerRef.current?.rotateAroundLookAt(0.35);
  const handleRotateRight = () => touchControllerRef.current?.rotateAroundLookAt(-0.35);
  const handleResetNorth = () => touchControllerRef.current?.resetToNorth();

  return (
    <div className="relative w-full h-[520px] md:h-[620px] rounded-2xl overflow-hidden shadow-2xl border border-amber-500/30 bg-slate-950 select-none">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Minimal Touch Navigation Helpers (Bottom-Right, non-intrusive) */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-10">
        <button
          onClick={handleZoomIn}
          className="w-7 h-7 rounded-lg bg-slate-900/90 border border-amber-500/40 text-amber-400 font-bold text-sm flex items-center justify-center hover:bg-slate-800 transition-colors shadow-md active:scale-95"
          title="تكبير الخريطة"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="w-7 h-7 rounded-lg bg-slate-900/90 border border-amber-500/40 text-amber-400 font-bold text-sm flex items-center justify-center hover:bg-slate-800 transition-colors shadow-md active:scale-95"
          title="تصغير الخريطة"
          aria-label="Zoom out"
        >
          -
        </button>
        <button
          onClick={handleRotateLeft}
          className="w-7 h-7 rounded-lg bg-slate-900/90 border border-amber-500/40 text-amber-400 font-bold text-xs flex items-center justify-center hover:bg-slate-800 transition-colors shadow-md active:scale-95"
          title="تدوير لليسار"
          aria-label="Rotate left"
        >
          ↺
        </button>
        <button
          onClick={handleRotateRight}
          className="w-7 h-7 rounded-lg bg-slate-900/90 border border-amber-500/40 text-amber-400 font-bold text-xs flex items-center justify-center hover:bg-slate-800 transition-colors shadow-md active:scale-95"
          title="تدوير لليمين"
          aria-label="Rotate right"
        >
          ↻
        </button>
        <button
          onClick={handleResetNorth}
          className="px-2 h-7 rounded-lg bg-slate-900/90 border border-amber-500/40 text-amber-400 font-bold text-[11px] flex items-center gap-0.5 hover:bg-slate-800 transition-colors shadow-md active:scale-95"
          title="إعادة توجيه الشمال"
        >
          <span>🧭</span>
        </button>
      </div>
    </div>
  );
};
