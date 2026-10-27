/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
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
  getOrCreateSkyTexture,
  type CityMaterialPalette,
} from './cityMaterials';
import {
  buildEmptyPlotMesh,
  buildPaperworkSurveyMesh,
  buildSiteClearingMesh,
  buildActiveConstructionMesh,
  getHQHeight,
  buildHQMesh,
  buildBankMesh,
  buildFactoryMesh,
  buildStoreMesh,
  buildWarehouseMesh,
  buildBranchMesh,
  buildTechHubMesh,
  buildAgroFarmMesh,
  buildStockExchangeMesh,
  buildTechTreeMesh,
  buildStartupIncubatorMesh,
  buildMaritimePortMesh,
  buildMegaprojectsMinistryMesh,
  buildTerritoryCitadelMesh,
  buildCartelBastionMesh,
  buildAuctionArenaMesh,
  buildLogisticsHubMesh,
  buildHRAcademyMesh,
  buildAuditTowerMesh,
  buildContractsPavilionMesh,
  buildTasksMonumentMesh,
  buildLuxuryClubMesh,
  buildDiamondVaultMesh,
  buildLuckyWheelRotundaMesh,
  buildPrestigeConsulateMesh,
} from './cityMeshBuilders';
import { buildCityRoadNetwork, type TrafficVehicle } from './cityRoadNetwork';
import { CityTouchController } from './cityTouchControls';
import {
  classifyIndustryToFacility,
  resolvePlotVisualStage,
  ALL_CITY_LANDMARKS,
  CITY_WORLD_CONFIG,
  type LandmarkId,
  type LandmarkSystemDefinition,
} from './cityWorldData';
import { createBuildingLabelSprite } from './cityLabels';

export type SelectedItem =
  | { type: 'landmark'; id: LandmarkId }
  | { type: 'plot'; plot: ReturnType<typeof resolveCityGrid>['plots'][number] };

export type CityCameraPreset =
  | 'center'
  | 'hq'
  | 'bank'
  | 'stock_exchange'
  | 'factory'
  | 'tech'
  | 'maritime'
  | 'gov'
  | 'trade'
  | 'luxury'
  | 'plots'
  | null;

interface CityCanvasProps {
  profile: PlayerProfile;
  selectedItem: SelectedItem | null;
  onSelectItem: (item: SelectedItem | null) => void;
  isNightMode?: boolean;
  cameraPreset?: CityCameraPreset;
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
  const cameraTargetPos = useRef(new THREE.Vector3(0, 42, 60));
  const cameraLookAtPos = useRef(new THREE.Vector3(0, 0, 5));

  // Touch controller instance ref
  const touchControllerRef = useRef<CityTouchController | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 560;

    // Detect software GL to optimize rendering budget
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
    const isMobileDevice = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
    const isLowPowerDevice = isSoftwareGl || isMobileDevice;
    const devicePixelRatio = Math.min(window.devicePixelRatio || 1, isLowPowerDevice ? 1.25 : 1.75);

    // 1. Scene setup with expanded atmospheric horizon fog
    const scene = new THREE.Scene();
    const fogColor = isNightMode ? '#0b1630' : '#64748b';
    scene.background = getOrCreateSkyTexture(isNightMode);
    scene.fog = new THREE.FogExp2(fogColor, isNightMode ? 0.003 : 0.0026);

    // 2. Camera with expanded view frustum for enlarged city
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 600);
    camera.position.set(0, 48, 70);
    camera.lookAt(0, 0, 5);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isLowPowerDevice,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isLowPowerDevice;
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
      isNightMode ? 0.8 : 1.2
    );
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight('#fef08a', isNightMode ? 1.6 : 2.4);
    dirLight.position.set(50, 80, 50);
    dirLight.castShadow = !isLowPowerDevice;
    dirLight.shadow.mapSize.width = isLowPowerDevice ? 512 : 1024;
    dirLight.shadow.mapSize.height = isLowPowerDevice ? 512 : 1024;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 250;
    const shadowD = 90;
    dirLight.shadow.camera.left = -shadowD;
    dirLight.shadow.camera.right = shadowD;
    dirLight.shadow.camera.top = shadowD;
    dirLight.shadow.camera.bottom = -shadowD;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // District accent point lights
    const hqPointLight = new THREE.PointLight('#f59e0b', 2.8, 60);
    hqPointLight.position.set(0, 20, 0);
    scene.add(hqPointLight);

    const techPointLight = new THREE.PointLight('#c084fc', 2.4, 50);
    techPointLight.position.set(-45, 16, -45);
    scene.add(techPointLight);

    const maritimePointLight = new THREE.PointLight('#0284c7', 2.4, 55);
    maritimePointLight.position.set(70, 16, 32);
    scene.add(maritimePointLight);

    const tradePointLight = new THREE.PointLight('#10b981', 2.2, 50);
    tradePointLight.position.set(-45, 16, 35);
    scene.add(tradePointLight);

    // 6. Materials Palette
    const palette: CityMaterialPalette = createCityMaterialPalette(isNightMode, isLowPowerDevice);

    // 7. Mainland footprint; the eastern harbor water extends beyond this plane.
    const groundGeo = new THREE.PlaneGeometry(CITY_WORLD_CONFIG.groundSize, CITY_WORLD_CONFIG.groundSize);
    const ground = new THREE.Mesh(groundGeo, palette.ground);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = !isLowPowerDevice;
    scene.add(ground);

    // 8. Modular Road Grid & Traffic
    const roadNetwork = buildCityRoadNetwork(palette, isLowPowerDevice, isNightMode);
    scene.add(roadNetwork.group);
    const trafficVehicles: TrafficVehicle[] = roadNetwork.vehicles;

    // 9. Clickable Targets Map
    const clickableObjects = new Map<THREE.Object3D, SelectedItem>();
    const registerClickable = (meshOrGroup: THREE.Object3D, item: SelectedItem) => {
      clickableObjects.set(meshOrGroup, item);
      meshOrGroup.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Sprite) {
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
    // BUILD ALL 20 SYSTEM LANDMARKS & 3D LABELS
    // -------------------------------------------------------------
    const gridData = resolveCityGrid(profile, loadCityConstructions(profile));
    const hqLevel = gridData.hqLevel;

    // References for dynamic animated objects in the render loop
    let crownRingMesh: THREE.Mesh | null = null;
    let luckyWheelDiscMesh: THREE.Object3D | null = null;
    let diamondCrystalMesh: THREE.Object3D | null = null;

    ALL_CITY_LANDMARKS.forEach((def) => {
      let landmarkMesh: THREE.Group | null = null;

      switch (def.id) {
        case 'hq': {
          landmarkMesh = buildHQMesh(hqLevel, palette, isLowPowerDevice);
          // Rotating Crown Halo on HQ (aligned above the Egyptian Sun Corona)
          const hqActualH = getHQHeight(hqLevel);
          const crownRingGeo = new THREE.RingGeometry(3.6, 4.0, 32);
          const crownRing = new THREE.Mesh(crownRingGeo, palette.plotHoloRing);
          crownRing.rotation.x = Math.PI / 2;
          crownRing.position.y = hqActualH + 0.8;
          landmarkMesh.add(crownRing);
          crownRingMesh = crownRing;
          break;
        }
        case 'bank':
          landmarkMesh = buildBankMesh(palette, isLowPowerDevice);
          break;
        case 'stock_exchange':
          landmarkMesh = buildStockExchangeMesh(palette, isLowPowerDevice);
          break;
        case 'audit_tower':
          landmarkMesh = buildAuditTowerMesh(palette, isLowPowerDevice);
          break;
        case 'staff_academy':
          landmarkMesh = buildHRAcademyMesh(palette, isLowPowerDevice);
          break;
        case 'tech_tree':
          landmarkMesh = buildTechTreeMesh(palette, isLowPowerDevice);
          break;
        case 'incubator':
          landmarkMesh = buildStartupIncubatorMesh(palette, isLowPowerDevice);
          break;
        case 'diamond_store':
          landmarkMesh = buildDiamondVaultMesh(palette, isLowPowerDevice);
          // Grab diamond crystal for rotating
          landmarkMesh.traverse((c) => {
            if (c instanceof THREE.Mesh && c.geometry instanceof THREE.OctahedronGeometry) {
              diamondCrystalMesh = c;
            }
          });
          break;
        case 'megaprojects':
          landmarkMesh = buildMegaprojectsMinistryMesh(palette, isLowPowerDevice);
          break;
        case 'territory':
          landmarkMesh = buildTerritoryCitadelMesh(palette, isLowPowerDevice);
          break;
        case 'cartel':
          landmarkMesh = buildCartelBastionMesh(palette, isLowPowerDevice);
          break;
        case 'maritime':
          landmarkMesh = buildMaritimePortMesh(palette, isLowPowerDevice);
          break;
        case 'factory': {
          const factoryResult = buildFactoryMesh(palette, isLowPowerDevice);
          landmarkMesh = factoryResult.group;
          factoryResult.smokePositions.forEach((pos) => {
            for (let s = 0; s < 4; s++) {
              const sm = new THREE.Mesh(smokeGeo, smokeMat);
              sm.position.set(def.coordinates.x + pos.x, pos.y + s * 0.8, def.coordinates.z + pos.z);
              scene.add(sm);
              smokeParticles.push(sm);
            }
          });
          break;
        }
        case 'warehouse_hub':
          landmarkMesh = buildLogisticsHubMesh(palette, isLowPowerDevice);
          break;
        case 'auctions':
          landmarkMesh = buildAuctionArenaMesh(palette, isLowPowerDevice);
          break;
        case 'contracts_pavilion':
          landmarkMesh = buildContractsPavilionMesh(palette, isLowPowerDevice);
          break;
        case 'lucky_wheel':
          landmarkMesh = buildLuckyWheelRotundaMesh(palette, isLowPowerDevice);
          landmarkMesh.traverse((c) => {
            if (c instanceof THREE.Mesh && c.geometry instanceof THREE.CylinderGeometry && c.position.z > 4) {
              luckyWheelDiscMesh = c;
            }
          });
          break;
        case 'tasks_monument':
          landmarkMesh = buildTasksMonumentMesh(palette, isLowPowerDevice);
          break;
        case 'luxury_club':
          landmarkMesh = buildLuxuryClubMesh(palette, isLowPowerDevice);
          break;
        case 'prestige_consulate':
          landmarkMesh = buildPrestigeConsulateMesh(palette, isLowPowerDevice);
          break;
        default:
          break;
      }

      if (landmarkMesh) {
        landmarkMesh.position.set(def.coordinates.x, 0, def.coordinates.z);
        scene.add(landmarkMesh);
        registerClickable(landmarkMesh, { type: 'landmark', id: def.id });

        // Build & attach 3D camera-facing Arabic Nameplate Sprite above building
        const labelSprite = createBuildingLabelSprite({
          titleAr: def.titleAr,
          badgeAr: def.badgeAr,
          icon: def.icon,
          accentColor: def.accentColor,
          badgeBgColor: def.badgeBgColor,
        });
        const actualLabelY = def.id === 'hq' ? getHQHeight(hqLevel) + 3.2 : def.labelHeight;
        labelSprite.position.set(def.coordinates.x, actualLabelY, def.coordinates.z);
        scene.add(labelSprite);
        registerClickable(labelSprite, { type: 'landmark', id: def.id });
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
          isLowPowerDevice
        );
        plotGroup.add(emptyMesh);
      } else if (visualStage === 'paperwork_survey') {
        const surveyMesh = buildPaperworkSurveyMesh(plot.width, plot.depth, palette, isLowPowerDevice);
        plotGroup.add(surveyMesh);
      } else if (visualStage === 'site_clearing') {
        const clearingMesh = buildSiteClearingMesh(plot.width, plot.depth, palette, isLowPowerDevice);
        plotGroup.add(clearingMesh);
      } else if (visualStage === 'active_construction') {
        const constructionMesh = buildActiveConstructionMesh(
          plot.width,
          plot.depth,
          palette,
          isLowPowerDevice
        );
        plotGroup.add(constructionMesh);
      } else {
        // COMPLETED FACILITY: Company, Branch office, or Retail shop
        let completedFacilityMesh: THREE.Group;

        if (plot.branch) {
          completedFacilityMesh = buildBranchMesh(palette, isLowPowerDevice);
          completedFacilityMesh.scale.set(0.9, 0.9, 0.9);
        } else if (plot.shop) {
          completedFacilityMesh = buildStoreMesh(palette, isLowPowerDevice);
          completedFacilityMesh.scale.set(0.9, 0.9, 0.9);
        } else {
          const category = classifyIndustryToFacility(plot.company?.industryId);

          switch (category) {
            case 'factory': {
              const res = buildFactoryMesh(palette, isLowPowerDevice);
              res.group.scale.set(0.75, 0.75, 0.75);
              completedFacilityMesh = res.group;
              break;
            }
            case 'store': {
              completedFacilityMesh = buildStoreMesh(palette, isLowPowerDevice);
              completedFacilityMesh.scale.set(0.85, 0.85, 0.85);
              break;
            }
            case 'warehouse': {
              completedFacilityMesh = buildWarehouseMesh(palette, isLowPowerDevice);
              completedFacilityMesh.scale.set(0.8, 0.8, 0.8);
              break;
            }
            case 'tech_hub': {
              completedFacilityMesh = buildTechHubMesh(palette, isLowPowerDevice);
              completedFacilityMesh.scale.set(0.8, 0.8, 0.8);
              break;
            }
            case 'central_bank': {
              completedFacilityMesh = buildBankMesh(palette, isLowPowerDevice);
              completedFacilityMesh.scale.set(0.75, 0.75, 0.75);
              break;
            }
            case 'agricultural_farm': {
              completedFacilityMesh = buildAgroFarmMesh(palette, isLowPowerDevice);
              completedFacilityMesh.scale.set(0.8, 0.8, 0.8);
              break;
            }
            case 'regional_branch':
            default: {
              completedFacilityMesh = buildBranchMesh(palette, isLowPowerDevice);
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
    const selectionHaloGeo = new THREE.RingGeometry(3.6, 4.1, 32);
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

    // ResizeObserver handles mobile browser chrome/orientation changes more
    // reliably than window.resize alone.
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);
    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(onResize)
      : null;
    resizeObserver?.observe(container);

    // -------------------------------------------------------------
    // RENDER LOOP with frame-rate independent exponential damping
    // -------------------------------------------------------------
    let animationFrameId = 0;
    let frameQueued = false;
    let isPaused = document.hidden;
    const clock = new THREE.Clock();
    let scheduleFrame: () => void;

    const onVisibilityChange = () => {
      isPaused = document.hidden;
      if (!isPaused) {
        clock.getDelta();
        scheduleFrame();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const intersectionObserver = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(([entry]) => {
        isPaused = !entry.isIntersecting || document.hidden;
        if (!isPaused) scheduleFrame();
      }, { threshold: 0.01 })
      : null;
    intersectionObserver?.observe(container);

    const animate = () => {
      frameQueued = false;
      if (isPaused) return;
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();

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
      if (crownRingMesh) {
        crownRingMesh.rotation.z += dt * 0.45;
      }

      // Animate lucky prize wheel
      if (luckyWheelDiscMesh) {
        luckyWheelDiscMesh.rotation.z += dt * 0.6;
      }

      // Animate floating rotating diamond
      if (diamondCrystalMesh) {
        diamondCrystalMesh.rotation.y += dt * 0.8;
        diamondCrystalMesh.position.y = 4.2 + Math.sin(elapsedTime * 2) * 0.25;
      }

      // Update Selection Indicator position
      const currentSelected = selectedItemRef.current;
      if (currentSelected) {
        selectionHalo.visible = true;
        if (currentSelected.type === 'landmark') {
          const foundDef = ALL_CITY_LANDMARKS.find((l) => l.id === currentSelected.id);
          if (foundDef) {
            selectionHalo.position.set(foundDef.coordinates.x, 0.35, foundDef.coordinates.z);
          }
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
      scheduleFrame();
    };

    scheduleFrame = () => {
      if (!isPaused && !frameQueued) {
        frameQueued = true;
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    scheduleFrame();

    // Clean unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onResize);
      resizeObserver?.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      intersectionObserver?.disconnect();
      touchCtrl.dispose();
      touchControllerRef.current = null;

      renderer.dispose();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
      });
      if (scene.environment) scene.environment.dispose();
      disposeCityMaterialPalette(palette);
      groundGeo.dispose();
      smokeGeo.dispose();
      smokeMat.dispose();
      selectionHaloGeo.dispose();

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [profile, isNightMode]);

  // Handle camera presets changes smoothly
  useEffect(() => {
    if (!cameraPreset) return;
    switch (cameraPreset) {
      case 'center':
      case 'hq':
        cameraTargetPos.current.set(0, 36, 44);
        cameraLookAtPos.current.set(0, 4, 0);
        break;
      case 'bank':
        cameraTargetPos.current.set(-24, 20, 32);
        cameraLookAtPos.current.set(-24, 4, 12);
        break;
      case 'stock_exchange':
        cameraTargetPos.current.set(24, 20, 32);
        cameraLookAtPos.current.set(24, 4, 12);
        break;
      case 'factory':
        cameraTargetPos.current.set(45, 22, 70);
        cameraLookAtPos.current.set(45, 4, 52);
        break;
      case 'tech':
        cameraTargetPos.current.set(-45, 28, -25);
        cameraLookAtPos.current.set(-45, 6, -45);
        break;
      case 'maritime':
        cameraTargetPos.current.set(65, 42, 83);
        cameraLookAtPos.current.set(80, 4, 32);
        break;
      case 'gov':
        cameraTargetPos.current.set(45, 28, -25);
        cameraLookAtPos.current.set(45, 6, -45);
        break;
      case 'trade':
        cameraTargetPos.current.set(-45, 26, 42);
        cameraLookAtPos.current.set(-45, 4, 32);
        break;
      case 'luxury':
        cameraTargetPos.current.set(-74, 24, 52);
        cameraLookAtPos.current.set(-74, 4, 32);
        break;
      case 'plots':
        cameraTargetPos.current.set(16, 26, -5);
        cameraLookAtPos.current.set(16, 0, -18);
        break;
      default:
        break;
    }
    if (onResetPreset) onResetPreset();
  }, [cameraPreset, onResetPreset]);

  // Pan to clicked landmark automatically
  useEffect(() => {
    if (selectedItem?.type === 'landmark') {
      const def = ALL_CITY_LANDMARKS.find((l) => l.id === selectedItem.id);
      if (def) {
        cameraTargetPos.current.set(def.coordinates.x, 22, def.coordinates.z + 24);
        cameraLookAtPos.current.set(def.coordinates.x, 3, def.coordinates.z);
      }
    } else if (selectedItem?.type === 'plot') {
      cameraTargetPos.current.set(selectedItem.plot.gridX, 18, selectedItem.plot.gridZ + 18);
      cameraLookAtPos.current.set(selectedItem.plot.gridX, 1, selectedItem.plot.gridZ);
    }
  }, [selectedItem]);

  // Expose quick zoom & rotation helpers for mobile overlay buttons
  const handleZoomIn = () => touchControllerRef.current?.zoomStep('in');
  const handleZoomOut = () => touchControllerRef.current?.zoomStep('out');
  const handleRotateLeft = () => touchControllerRef.current?.rotateAroundLookAt(0.35);
  const handleRotateRight = () => touchControllerRef.current?.rotateAroundLookAt(-0.35);
  const handleResetNorth = () => touchControllerRef.current?.resetToNorth();

  return (
    <div className="relative w-full h-[520px] md:h-[620px] rounded-2xl overflow-hidden shadow-2xl border border-amber-500/30 bg-slate-950 select-none">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />

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

export default CityCanvas;
