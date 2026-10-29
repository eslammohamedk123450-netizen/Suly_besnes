/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import type { PlayerProfile } from '../../domain/player';
import {
  resolveCityGrid,
  loadCityConstructions,
  type CityPlotDefinition,
  type CityConstructionState,
} from '../../game/cityGridSystem';
import { playSound } from '../../game/soundEffects';
import { playCash } from '../../soundManager';
import { buildDancingFountain } from './cityLifeAssets';
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
import { getCartelStrongholdLevel } from './cartelStronghold3D';
import { buildCityRoadNetwork, type TrafficVehicle } from './cityRoadNetwork';
import {
  CityTouchController,
  CITY_CAMERA_LIMITS,
  focusCityCamera,
} from './cityTouchControls';
import {
  classifyIndustryToFacility,
  resolvePlotVisualStage,
  ALL_CITY_LANDMARKS,
  CITY_WORLD_CONFIG,
  type LandmarkId,
  type LandmarkSystemDefinition,
} from './cityWorldData';
import { createBuildingLabelSprite } from './cityLabels';
import './CityCanvas.css';

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

const LANDMARK_MAP = new Map(ALL_CITY_LANDMARKS.map((l) => [l.id, l]));

export type GraphicsQualityMode = 'performance' | 'balanced' | 'high';

interface CityCanvasProps {
  profile: PlayerProfile;
  selectedItem: SelectedItem | null;
  onSelectItem: (item: SelectedItem | null) => void;
  isNightMode?: boolean;
  timeOfDay?: 'day' | 'sunset' | 'night';
  cameraPreset?: CityCameraPreset;
  onResetPreset?: () => void;
  cameraSpeed?: number;
  graphicsQuality?: GraphicsQualityMode;
}

export const CityCanvas: React.FC<CityCanvasProps> = ({
  profile,
  selectedItem,
  onSelectItem,
  isNightMode = false,
  timeOfDay: timeOfDayProp,
  cameraPreset,
  onResetPreset,
  cameraSpeed = 1,
  graphicsQuality,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef(profile);
  profileRef.current = profile;
  const floatingOverlayRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef(selectedItem);
  selectedItemRef.current = selectedItem;
  const onSelectItemRef = useRef(onSelectItem);
  onSelectItemRef.current = onSelectItem;

  // Memoize stable city layout key so balance/income ticks NEVER destroy and recreate the 3D scene
  const cityLayoutKey = useMemo(() => {
    const companies = (profile.companies ?? []).map((c) => `${c.id}:${c.upgradeLevel}`).join(',');
    const lands = (profile.lands ?? []).length;
    const constructions = Object.keys(loadCityConstructions(profile) ?? {}).length;
    const level = profile.level ?? 1;
    const cartelLevel = getCartelStrongholdLevel(profile);
    return `${level}-${cartelLevel}-${lands}-${companies}-${constructions}`;
  }, [profile.companies, profile.lands, profile.level, profile.cartelStrongholdLevel]);

  // Fixed-height camera rail: only the city focus and zoom level can change.
  const cameraTargetPos = useRef(new THREE.Vector3(
    0,
    CITY_CAMERA_LIMITS.cameraHeight,
    CITY_CAMERA_LIMITS.headingOffsetZ
  ));
  const cameraLookAtPos = useRef(new THREE.Vector3(0, CITY_CAMERA_LIMITS.lookAtHeight, 0));
  const cameraCurrentLookAtPos = useRef(new THREE.Vector3(0, CITY_CAMERA_LIMITS.lookAtHeight, 0));
  const cameraTargetFov = useRef(CITY_CAMERA_LIMITS.defaultFov);

  // Touch controller instance ref
  const touchControllerRef = useRef<CityTouchController | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    let sceneIsActive = true;
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
    const isPerformance = graphicsQuality === 'performance' || (graphicsQuality === undefined && isMobileDevice);
    const isBalanced = graphicsQuality === 'balanced';
    const isLowPowerDevice = isSoftwareGl || isPerformance;
    const devicePixelRatio = Math.min(
      window.devicePixelRatio || 1,
      isPerformance ? 1.0 : isBalanced ? 1.2 : 1.5
    );

    const timeOfDay = timeOfDayProp || (isNightMode ? 'night' : 'sunset');

    // Helper to enforce shadows across all meshes as requested in prompt:
    // "Iterate through all building meshes, tree meshes, and vehicle meshes and set mesh.castShadow = true."
    const applyShadowProperties = (object: THREE.Object3D) => {
      if (!enableShadows) return;
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // If it's a wireframe or hologram ring or sky, don't cast shadow
          if (
            child.name?.includes('atmospheric_sky') ||
            child.name?.includes('plotHoloRing') ||
            child.name?.includes('selectionHalo')
          ) {
            return;
          }
          if (child.name?.includes('expanded_harbor_water') || child.name?.includes('water')) {
            child.receiveShadow = true;
            return;
          }
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    };

    // 1. Scene setup with expanded atmospheric horizon fog
    const scene = new THREE.Scene();
    const fogColor =
      timeOfDay === 'sunset' ? '#4a1525' : (timeOfDay === 'night' ? '#0b1630' : '#bae6fd');
    scene.background = getOrCreateSkyTexture(timeOfDay);
    scene.fog = new THREE.FogExp2(
      fogColor,
      timeOfDay === 'sunset' ? 0.0028 : (timeOfDay === 'night' ? 0.003 : 0.0024)
    );

    // 1b. Atmospheric scattering Sky object (Three.js Sky example object)
    const sky = new Sky();
    sky.name = 'atmospheric_sky';
    sky.scale.setScalar(450000);
    scene.add(sky);

    const skyUniforms = sky.material.uniforms;
    skyUniforms['turbidity'].value = timeOfDay === 'sunset' ? 10 : 8;
    skyUniforms['rayleigh'].value =
      timeOfDay === 'sunset' ? 4.2 : (timeOfDay === 'night' ? 0.4 : 1.8);
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = timeOfDay === 'sunset' ? 0.82 : 0.7;

    const sunElevation =
      timeOfDay === 'sunset' ? 2.8 : (timeOfDay === 'night' ? -10 : 48);
    const sunAzimuth = 180;
    const sunPhi = THREE.MathUtils.degToRad(90 - sunElevation);
    const sunTheta = THREE.MathUtils.degToRad(sunAzimuth);
    const sunDirection = new THREE.Vector3().setFromSphericalCoords(1, sunPhi, sunTheta);
    skyUniforms['sunPosition'].value.copy(sunDirection);

    // 2. Camera with expanded view frustum for enlarged city
    const camera = new THREE.PerspectiveCamera(cameraTargetFov.current, width / height, 0.5, 600);
    cameraCurrentLookAtPos.current.copy(cameraLookAtPos.current);
    camera.position.copy(cameraTargetPos.current);
    camera.lookAt(cameraCurrentLookAtPos.current);

    // 3. WebGL Renderer with performance optimizations
    const enableShadows = !isPerformance && !isSoftwareGl;
    const renderer = new THREE.WebGLRenderer({
      antialias: !isPerformance && !isLowPowerDevice,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = timeOfDay === 'sunset' ? 1.25 : 1.15;
    renderer.shadowMap.enabled = enableShadows;
    renderer.shadowMap.type = isBalanced ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 3b. Cinematic Post-Processing Pipeline (EffectComposer, Bloom, SSAO, ACES Filmic Tone Mapping)
    let composer: EffectComposer | null = null;
    let ssaoPass: SSAOPass | null = null;
    let bloomPass: UnrealBloomPass | null = null;
    let outputPass: OutputPass | null = null;

    if (!isPerformance) {
      try {
        composer = new EffectComposer(renderer);

        // Render base scene pass
        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);

        // SSAOPass: creates realistic soft shadows in corners and crevices (e.g., between buildings and ground)
        try {
          ssaoPass = new SSAOPass(scene, camera, width, height);
          ssaoPass.kernelRadius = 16;
          ssaoPass.minDistance = 0.005;
          ssaoPass.maxDistance = 0.15;
          ssaoPass.output = SSAOPass.OUTPUT.Default;
          composer.addPass(ssaoPass);
        } catch (err) {
          console.warn('SSAOPass could not be initialized:', err);
        }

        // UnrealBloomPass with low threshold (0.8) and medium strength (0.5)
        // Makes golden dome, lit windows, and glowing elements glow beautifully
        bloomPass = new UnrealBloomPass(
          new THREE.Vector2(width, height),
          0.5, // strength (medium)
          0.4, // radius
          0.8  // threshold (low)
        );
        composer.addPass(bloomPass);

        // OutputPass ensures ACESFilmic tone mapping and sRGB color grading
        outputPass = new OutputPass();
        composer.addPass(outputPass);
      } catch (e) {
        console.warn('EffectComposer initialization error:', e);
        composer = null;
      }
    }

    // 4. Procedural Studio Environment & Sky Reflection
    let skyEnvMap: THREE.Texture | null = null;
    if (!isPerformance) {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const skyTexture = getOrCreateSkyTexture(timeOfDay);
      skyEnvMap = pmremGenerator.fromEquirectangular(skyTexture).texture;
      scene.environment = skyEnvMap;
      pmremGenerator.dispose();
    }

    // 5. Lighting Rig (Warm Key, Cool Sky Fill, Rim Lighting)
    const hemiSky =
      timeOfDay === 'sunset' ? '#fed7aa' : (timeOfDay === 'night' ? '#38bdf8' : '#e0f2fe');
    const hemiGround =
      timeOfDay === 'sunset' ? '#431407' : (timeOfDay === 'night' ? '#090d18' : '#1e293b');
    const hemiLight = new THREE.HemisphereLight(
      hemiSky,
      hemiGround,
      timeOfDay === 'sunset' ? 0.95 : (timeOfDay === 'night' ? 0.7 : 1.1)
    );
    scene.add(hemiLight);

    // Prompt requirement 4: "Add a HemisphereLight or AmbientLight with a low intensity so the shadowed areas are not completely pitch black."
    const ambientLight = new THREE.AmbientLight(
      timeOfDay === 'sunset' ? '#7c2d12' : (timeOfDay === 'night' ? '#1e293b' : '#64748b'),
      timeOfDay === 'sunset' ? 0.38 : (timeOfDay === 'night' ? 0.3 : 0.35)
    );
    scene.add(ambientLight);

    // Prompt requirement 1: "Change the DirectionalLight (Sun) to cast shadows. Enable castShadow on the light, and configure the shadow map size (e.g., 2048) for better resolution."
    const sunColor =
      timeOfDay === 'sunset' ? '#ffedd5' : (timeOfDay === 'night' ? '#93c5fd' : '#fffbeb');
    const dirLight = new THREE.DirectionalLight(
      sunColor,
      timeOfDay === 'sunset' ? 2.8 : (timeOfDay === 'night' ? 1.4 : 2.5)
    );
    dirLight.position.set(
      timeOfDay === 'sunset' ? 65 : 55,
      timeOfDay === 'sunset' ? 45 : 95,
      timeOfDay === 'sunset' ? 70 : 55
    );
    dirLight.castShadow = enableShadows;
    if (enableShadows) {
      const shadowRes = isBalanced ? 1024 : 2048; // Requirement: 2048 shadow map size
      dirLight.shadow.mapSize.width = shadowRes;
      dirLight.shadow.mapSize.height = shadowRes;
      dirLight.shadow.camera.near = 10;
      dirLight.shadow.camera.far = 320;
      const shadowD = 115;
      dirLight.shadow.camera.left = -shadowD;
      dirLight.shadow.camera.right = shadowD;
      dirLight.shadow.camera.top = shadowD;
      dirLight.shadow.camera.bottom = -shadowD;
      dirLight.shadow.bias = -0.0004;
      dirLight.shadow.normalBias = 0.02;
    }
    scene.add(dirLight);

    // District accent point lights (only active in balanced/high modes to eliminate fragment shader bottleneck)
    if (!isPerformance) {
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
    }

    // 6. Materials Palette
    const palette: CityMaterialPalette = createCityMaterialPalette(isNightMode, isLowPowerDevice, timeOfDay);
    if (skyEnvMap) {
      palette.harborWater.envMap = skyEnvMap;
      palette.waterSurface.envMap = skyEnvMap;
    }

    // 7. Mainland footprint; the eastern harbor water extends beyond this plane.
    const groundGeo = new THREE.PlaneGeometry(CITY_WORLD_CONFIG.groundSize, CITY_WORLD_CONFIG.groundSize);
    const ground = new THREE.Mesh(groundGeo, palette.ground);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = enableShadows;
    scene.add(ground);

    // 8. Modular Road Grid & Traffic
    const roadNetwork = buildCityRoadNetwork(palette, isLowPowerDevice, isNightMode);
    applyShadowProperties(roadNetwork.group);
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

    // Track building root groups for bounce animations and floating UI
    const landmarkMeshMap = new Map<LandmarkId, THREE.Group>();
    const plotMeshMap = new Map<string, THREE.Group>();

    // 10. Smoke Particle System above Factory/Industrial Area (using THREE.Points)
    const SMOKE_COUNT = isLowPowerDevice ? 100 : 180;
    const smokeGeo = new THREE.BufferGeometry();
    const smokePositions = new Float32Array(SMOKE_COUNT * 3);
    const smokeData: {
      baseX: number;
      baseY: number;
      baseZ: number;
      vx: number;
      vy: number;
      vz: number;
      life: number;
      maxLife: number;
    }[] = [];

    // Factory smokestacks coordinates (landmark factory at x: 45, z: 52)
    const factoryChimneys = [
      { x: 45 + 3.8, y: 9.4, z: 52 - 2.6 },
      { x: 45 + 5.2, y: 9.4, z: 52 - 2.6 },
    ];

    for (let i = 0; i < SMOKE_COUNT; i++) {
      const ch = factoryChimneys[i % factoryChimneys.length];
      const maxLife = 2.4 + Math.random() * 2.0;
      const life = Math.random() * maxLife;
      const vx = 0.18 + (Math.random() - 0.5) * 0.2;
      const vy = 1.6 + Math.random() * 0.8;
      const vz = 0.12 + (Math.random() - 0.5) * 0.2;
      smokeData.push({
        baseX: ch.x,
        baseY: ch.y,
        baseZ: ch.z,
        vx,
        vy,
        vz,
        life,
        maxLife,
      });
      smokePositions[i * 3] = ch.x + vx * life;
      smokePositions[i * 3 + 1] = ch.y + vy * life;
      smokePositions[i * 3 + 2] = ch.z + vz * life;
    }
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
    const smokePointsMat = new THREE.PointsMaterial({
      color: '#cbd5e1',
      size: isLowPowerDevice ? 1.6 : 2.4,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const smokePoints = new THREE.Points(smokeGeo, smokePointsMat);
    scene.add(smokePoints);

    // 11. Grand Musical Dancing Fountain in Central Civic Plaza
    const fountainAsset = buildDancingFountain(palette, isLowPowerDevice, 4.6);
    const fountainPos = new THREE.Vector3(-16, 0, 22);
    fountainAsset.group.position.copy(fountainPos);
    scene.add(fountainAsset.group);
    registerClickable(fountainAsset.group, { type: 'landmark', id: 'hq' });

    // Water Splash Particle System above Fountain (using THREE.Points)
    const FOUNTAIN_SPLASH_COUNT = isLowPowerDevice ? 120 : 200;
    const splashGeo = new THREE.BufferGeometry();
    const splashPositions = new Float32Array(FOUNTAIN_SPLASH_COUNT * 3);
    const splashData: {
      originX: number;
      originY: number;
      originZ: number;
      vx: number;
      vy: number;
      vz: number;
    }[] = [];

    const fountainCenter = { x: fountainPos.x, y: 1.35, z: fountainPos.z };
    for (let i = 0; i < FOUNTAIN_SPLASH_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spread = 0.3 + Math.random() * 1.5;
      const vy = 5.2 + Math.random() * 3.8;
      const vx = Math.cos(angle) * spread;
      const vz = Math.sin(angle) * spread;

      splashData.push({
        originX: fountainCenter.x,
        originY: fountainCenter.y,
        originZ: fountainCenter.z,
        vx,
        vy,
        vz,
      });

      const t = Math.random() * 0.7;
      splashPositions[i * 3] = fountainCenter.x + vx * t;
      splashPositions[i * 3 + 1] = Math.max(0.45, fountainCenter.y + vy * t - 0.5 * 14 * t * t);
      splashPositions[i * 3 + 2] = fountainCenter.z + vz * t;
    }
    splashGeo.setAttribute('position', new THREE.BufferAttribute(splashPositions, 3));
    const splashPointsMat = new THREE.PointsMaterial({
      color: '#38bdf8',
      size: isLowPowerDevice ? 1.1 : 1.6,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const splashPoints = new THREE.Points(splashGeo, splashPointsMat);
    scene.add(splashPoints);

    // -------------------------------------------------------------
    // BUILD ALL 20 SYSTEM LANDMARKS & 3D LABELS
    // -------------------------------------------------------------
    const gridData = resolveCityGrid(profile, loadCityConstructions(profile));
    const hqLevel = gridData.hqLevel;

    // References for dynamic animated objects in the render loop
    let crownRingMesh: THREE.Mesh | null = null;
    let luckyWheelDiscMesh: THREE.Object3D | null = null;
    let diamondCrystalMesh: THREE.Object3D | null = null;
    let cartelRotorMesh: THREE.Object3D | null = null;

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
        case 'stock_exchange': {
          landmarkMesh = buildStockExchangeMesh(palette, isLowPowerDevice);
          const proceduralFallback = landmarkMesh;
          new GLTFLoader().load(
            '/models/stock-exchange-level5.glb',
            (gltf) => {
              if (!sceneIsActive) return;
              const generatedModel = gltf.scene;
              const originalBounds = new THREE.Box3().setFromObject(generatedModel);
              const originalSize = originalBounds.getSize(new THREE.Vector3());
              if (originalSize.x <= 0 || originalSize.y <= 0 || originalSize.z <= 0) return;

              // Fit the level-five building to the city's landmark footprint.
              const scale = Math.min(15 / originalSize.x, 22 / originalSize.y, 14 / originalSize.z);
              generatedModel.scale.multiplyScalar(scale);
              const scaledBounds = new THREE.Box3().setFromObject(generatedModel);
              const center = scaledBounds.getCenter(new THREE.Vector3());
              generatedModel.position.set(
                def.coordinates.x - center.x,
                -scaledBounds.min.y,
                def.coordinates.z - center.z
              );
              generatedModel.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                  object.castShadow = !isLowPowerDevice;
                  object.receiveShadow = !isLowPowerDevice;
                }
              });

              proceduralFallback.visible = false;
              scene.add(generatedModel);
              registerClickable(generatedModel, { type: 'landmark', id: def.id });
            },
            undefined,
            () => {
              // Keep the procedural landmark visible if the optimized GLB is unavailable.
            }
          );
          break;
        }
        case 'audit_tower':
          landmarkMesh = buildAuditTowerMesh(palette, isLowPowerDevice);
          break;
        case 'staff_academy':
          landmarkMesh = buildHRAcademyMesh(palette, isLowPowerDevice);
          break;
        case 'tech_tree':
          landmarkMesh = buildTechTreeMesh(palette, isLowPowerDevice, profile.level ?? 1);
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
          landmarkMesh = buildTerritoryCitadelMesh(palette, isLowPowerDevice, profile.level ?? 1);
          break;
        case 'cartel': {
          const cartelLevel = getCartelStrongholdLevel(profile);
          landmarkMesh = buildCartelBastionMesh(palette, isLowPowerDevice, cartelLevel);
          landmarkMesh.traverse((c) => {
            if (c.name === 'cartelHelicopterRotor') {
              cartelRotorMesh = c;
            }
          });
          break;
        }
        case 'maritime':
          landmarkMesh = buildMaritimePortMesh(palette, isLowPowerDevice);
          break;
        case 'factory': {
          const factoryResult = buildFactoryMesh(palette, isLowPowerDevice);
          landmarkMesh = factoryResult.group;
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
        applyShadowProperties(landmarkMesh);
        landmarkMesh.position.set(def.coordinates.x, 0, def.coordinates.z);
        scene.add(landmarkMesh);
        landmarkMeshMap.set(def.id, landmarkMesh);
        registerClickable(landmarkMesh, { type: 'landmark', id: def.id });

        // Build & attach 3D camera-facing Arabic Nameplate Sprite above building
        const labelSprite = createBuildingLabelSprite({
          titleAr: def.titleAr,
          badgeAr: def.badgeAr,
          icon: def.icon,
          accentColor: def.accentColor,
          badgeBgColor: def.badgeBgColor,
        });
        const actualLabelY = def.id === 'hq'
          ? getHQHeight(hqLevel) + 3.2
          : def.id === 'stock_exchange'
            ? 25
            : def.labelHeight;
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

      applyShadowProperties(plotGroup);
      scene.add(plotGroup);
      plotMeshMap.set(plot.id, plotGroup);
      registerClickable(plotGroup, { type: 'plot', plot });
    });

    // 11. Selection Indicator Halo
    const selectionHaloGeo = new THREE.RingGeometry(3.6, 4.1, 32);
    const selectionHalo = new THREE.Mesh(selectionHaloGeo, palette.plotHoloRing);
    selectionHalo.rotation.x = -Math.PI / 2;
    selectionHalo.position.y = 0.35;
    selectionHalo.visible = false;
    scene.add(selectionHalo);

    // -------------------------------------------------------------
    // INTERACTIVE BUILDING BOUNCE & FLOATING UI SYSTEMS
    // -------------------------------------------------------------
    interface ActiveBounce {
      target: THREE.Object3D;
      baseScale: THREE.Vector3;
      startTime: number;
      duration: number;
    }
    const activeBounces: ActiveBounce[] = [];

    const triggerBuildingBounce = (target: THREE.Object3D) => {
      const existing = activeBounces.find((b) => b.target === target);
      if (existing) {
        target.scale.copy(existing.baseScale);
        existing.startTime = performance.now();
        return;
      }
      activeBounces.push({
        target,
        baseScale: target.scale.clone(),
        startTime: performance.now(),
        duration: 260,
      });
    };

    interface ActiveFloatingText {
      dom: HTMLDivElement;
      worldPos: THREE.Vector3;
      startTime: number;
      duration: number;
    }
    const activeFloatingTexts: ActiveFloatingText[] = [];

    const spawnFloatingMoneyText = (worldPos: THREE.Vector3, text: string = '+$100') => {
      if (!floatingOverlayRef.current) return;
      const el = document.createElement('div');
      el.className = 'floating-money-node';
      el.style.position = 'absolute';
      el.style.left = '0px';
      el.style.top = '0px';
      el.style.pointerEvents = 'none';
      el.style.willChange = 'transform, opacity';
      el.style.zIndex = '50';
      el.innerHTML = `
        <div style="display: flex; align-items: center; gap: 5px; font-weight: 900; font-size: 1.35rem; color: #fbbf24; text-shadow: 0 0 14px rgba(245,158,11,0.95), 0 2px 6px rgba(0,0,0,0.9); user-select: none; letter-spacing: 0.05em; font-family: ui-sans-serif, system-ui, sans-serif;">
          <span>💰</span><span>${text}</span>
        </div>
      `;
      floatingOverlayRef.current.appendChild(el);
      activeFloatingTexts.push({
        dom: el,
        worldPos: worldPos.clone(),
        startTime: performance.now(),
        duration: 1000,
      });
    };

    const onMoneyCollected = (e: Event) => {
      const ce = e as CustomEvent<{ pos?: THREE.Vector3; text?: string }>;
      const pos = ce.detail?.pos || cameraLookAtPos.current;
      const text = ce.detail?.text || '+$100';
      spawnFloatingMoneyText(pos, text);
    };
    window.addEventListener('suly:money-collected', onMoneyCollected);

    // 12. Touch & Mouse Interaction Controller
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleTapRaycast = (normX: number, normY: number) => {
      mouse.x = normX;
      mouse.y = normY;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);
      let hitItem: SelectedItem | null = null;
      let hitMesh: THREE.Object3D | null = null;

      for (const hit of intersects) {
        let curr: THREE.Object3D | null = hit.object;
        while (curr && curr !== scene) {
          if (clickableObjects.has(curr)) {
            hitItem = clickableObjects.get(curr)!;
            hitMesh = curr;
            break;
          }
          curr = curr.parent;
        }
        if (hitItem) break;
      }

      if (hitItem && hitMesh) {
        // Resolve root building mesh/group for bounce animation
        let buildingRoot: THREE.Object3D = hitMesh;
        if (hitItem.type === 'landmark') {
          buildingRoot = landmarkMeshMap.get(hitItem.id) || hitMesh;
        } else if (hitItem.type === 'plot') {
          buildingRoot = plotMeshMap.get(hitItem.plot.id) || hitMesh;
        }

        // 1. Quick bounce animation (scale up to 1.05 then back to 1.0)
        triggerBuildingBounce(buildingRoot);

        // 2. Trigger playCash() sound effect
        playCash();
        playSound('cash');

        // 3. Spawn Floating Text system (+ $100 in gold at building 3D coordinates, animates up and fades out over 1s)
        const worldPos = new THREE.Vector3();
        buildingRoot.getWorldPosition(worldPos);
        worldPos.y += hitItem.type === 'landmark' ? 12.0 : 6.0;
        spawnFloatingMoneyText(worldPos, '+$100');

        // Open building details if not already selected
        if (selectedItemRef.current === null) {
          onSelectItemRef.current(hitItem);
        }
      }
    };

    const touchCtrl = new CityTouchController({
      domElement: renderer.domElement,
      cameraTargetPos,
      cameraLookAtPos,
      cameraTargetFov,
      onTapRaycast: handleTapRaycast,
      speedMultiplier: cameraSpeed,
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
      if (composer) {
        composer.setSize(w, h);
      }
      if (ssaoPass) {
        ssaoPass.setSize(w, h);
      }
      if (bloomPass) {
        bloomPass.resolution.set(w, h);
      }
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

      const nextFov = THREE.MathUtils.damp(camera.fov, cameraTargetFov.current, 8, dt);
      if (Math.abs(nextFov - camera.fov) > 0.001) {
        camera.fov = nextFov;
        camera.updateProjectionMatrix();
      }

      // Move the aim point with the camera so district changes never orbit.
      cameraCurrentLookAtPos.current.x = THREE.MathUtils.damp(
        cameraCurrentLookAtPos.current.x,
        cameraLookAtPos.current.x,
        7.5,
        dt
      );
      cameraCurrentLookAtPos.current.y = THREE.MathUtils.damp(
        cameraCurrentLookAtPos.current.y,
        cameraLookAtPos.current.y,
        7.5,
        dt
      );
      cameraCurrentLookAtPos.current.z = THREE.MathUtils.damp(
        cameraCurrentLookAtPos.current.z,
        cameraLookAtPos.current.z,
        7.5,
        dt
      );
      camera.lookAt(cameraCurrentLookAtPos.current);

      // Update mobile touch inertia
      touchCtrl.updateInertia(dt);

      // 1. Update Road Traffic (Cars/Trucks move along road grid and reset when reaching the end of the road)
      const dtStep = Math.min(dt, 0.1) * 60;
      trafficVehicles.forEach((v) => {
        if (v.axis === 'z') {
          if (v.dir === 1) {
            v.mesh.position.z += v.speed * dtStep;
            if (v.mesh.position.z > v.max) {
              v.mesh.position.z = v.min;
            }
          } else {
            v.mesh.position.z -= v.speed * dtStep;
            if (v.mesh.position.z < v.min) {
              v.mesh.position.z = v.max;
            }
          }
        } else {
          if (v.dir === 1) {
            v.mesh.position.x += v.speed * dtStep;
            if (v.mesh.position.x > v.max) {
              v.mesh.position.x = v.min;
            }
          } else {
            v.mesh.position.x -= v.speed * dtStep;
            if (v.mesh.position.x < v.min) {
              v.mesh.position.x = v.max;
            }
          }
        }
      });

      // 2. Animate Factory Smoke Particles (using THREE.Points)
      for (let i = 0; i < SMOKE_COUNT; i++) {
        const p = smokeData[i];
        p.life += dt;
        if (p.life >= p.maxLife || smokePositions[i * 3 + 1] > 22) {
          p.life = 0;
          smokePositions[i * 3] = p.baseX + (Math.random() - 0.5) * 0.4;
          smokePositions[i * 3 + 1] = p.baseY;
          smokePositions[i * 3 + 2] = p.baseZ + (Math.random() - 0.5) * 0.4;
        } else {
          smokePositions[i * 3] += p.vx * dt;
          smokePositions[i * 3 + 1] += p.vy * dt;
          smokePositions[i * 3 + 2] += p.vz * dt;
        }
      }
      smokeGeo.attributes.position.needsUpdate = true;

      // 3. Animate Fountain Water Splash Particles (using THREE.Points)
      const splashGravity = 14.0;
      for (let i = 0; i < FOUNTAIN_SPLASH_COUNT; i++) {
        const p = splashData[i];
        p.vy -= splashGravity * dt;
        splashPositions[i * 3] += p.vx * dt;
        splashPositions[i * 3 + 1] += p.vy * dt;
        splashPositions[i * 3 + 2] += p.vz * dt;

        if (splashPositions[i * 3 + 1] <= 0.45) {
          splashPositions[i * 3] = p.originX + (Math.random() - 0.5) * 0.3;
          splashPositions[i * 3 + 1] = p.originY;
          splashPositions[i * 3 + 2] = p.originZ + (Math.random() - 0.5) * 0.3;
          const angle = Math.random() * Math.PI * 2;
          const spread = 0.4 + Math.random() * 1.5;
          p.vx = Math.cos(angle) * spread;
          p.vy = 5.2 + Math.random() * 4.0;
          p.vz = Math.sin(angle) * spread;
        }
      }
      splashGeo.attributes.position.needsUpdate = true;

      // 4. Animate Building Bounces (quick scale up to 1.05 and back to 1.0)
      const nowMs = performance.now();
      for (let i = activeBounces.length - 1; i >= 0; i--) {
        const b = activeBounces[i];
        const elapsed = nowMs - b.startTime;
        const progress = elapsed / b.duration;
        if (progress >= 1) {
          b.target.scale.copy(b.baseScale);
          activeBounces.splice(i, 1);
        } else {
          const bounceFactor = 1.0 + Math.sin(progress * Math.PI) * 0.05;
          b.target.scale.set(
            b.baseScale.x * bounceFactor,
            b.baseScale.y * bounceFactor,
            b.baseScale.z * bounceFactor
          );
        }
      }

      // 5. Project & Animate Floating Text UI (Moves up and fades out over 1s)
      if (container && floatingOverlayRef.current && activeFloatingTexts.length > 0) {
        const cWidth = container.clientWidth;
        const cHeight = container.clientHeight;
        const projVec = new THREE.Vector3();
        for (let i = activeFloatingTexts.length - 1; i >= 0; i--) {
          const item = activeFloatingTexts[i];
          const elapsed = nowMs - item.startTime;
          const progress = elapsed / item.duration;
          if (progress >= 1) {
            item.dom.remove();
            activeFloatingTexts.splice(i, 1);
          } else {
            projVec.copy(item.worldPos);
            projVec.project(camera);
            if (projVec.z > -1 && projVec.z < 1) {
              const screenX = (projVec.x * 0.5 + 0.5) * cWidth;
              const screenY = (-projVec.y * 0.5 + 0.5) * cHeight;
              const offsetY = progress * 65;
              const opacity = Math.max(0, 1 - progress);
              const scale = 1.0 + Math.sin(progress * Math.PI * 0.5) * 0.2;
              item.dom.style.transform = `translate3d(${screenX}px, ${screenY - offsetY}px, 0) translate(-50%, -50%) scale(${scale})`;
              item.dom.style.opacity = `${opacity}`;
              item.dom.style.display = 'block';
            } else {
              item.dom.style.display = 'none';
            }
          }
        }
      }

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

      // Animate cartel helicopter rotor
      if (cartelRotorMesh) {
        cartelRotorMesh.rotation.y += dt * 20.0;
      }

      // Animate water waves via normal map offset
      if (palette.harborWater.normalMap) {
        palette.harborWater.normalMap.offset.x = (elapsedTime * 0.016) % 1;
        palette.harborWater.normalMap.offset.y = (elapsedTime * 0.011) % 1;
      }
      if (palette.waterSurface.normalMap) {
        palette.waterSurface.normalMap.offset.x = (elapsedTime * 0.02) % 1;
        palette.waterSurface.normalMap.offset.y = (elapsedTime * 0.014) % 1;
      }

      // Update Selection Indicator position
      const currentSelected = selectedItemRef.current;
      if (currentSelected) {
        selectionHalo.visible = true;
        if (currentSelected.type === 'landmark') {
          const foundDef = LANDMARK_MAP.get(currentSelected.id);
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

      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
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
      sceneIsActive = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onResize);
      resizeObserver?.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      intersectionObserver?.disconnect();
      touchCtrl.dispose();
      touchControllerRef.current = null;

      if (composer) {
        composer.dispose();
      }
      if (ssaoPass) {
        ssaoPass.dispose();
      }
      if (bloomPass) {
        bloomPass.dispose();
      }
      if (outputPass) {
        outputPass.dispose();
      }

      renderer.dispose();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
      });
      if (scene.environment) scene.environment.dispose();
      disposeCityMaterialPalette(palette);
      window.removeEventListener('suly:money-collected', onMoneyCollected);
      activeFloatingTexts.forEach((t) => t.dom.remove());
      groundGeo.dispose();
      smokeGeo.dispose();
      smokePointsMat.dispose();
      splashGeo.dispose();
      splashPointsMat.dispose();
      selectionHaloGeo.dispose();

      if (renderer.domElement && renderer.domElement.parentNode && renderer.domElement.parentNode.contains(renderer.domElement)) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [cityLayoutKey, isNightMode, graphicsQuality, timeOfDayProp]);

  useEffect(() => {
    touchControllerRef.current?.setSpeed(cameraSpeed);
  }, [cameraSpeed]);

  // Move between districts without changing the fixed camera heading or height.
  useEffect(() => {
    if (!cameraPreset) return;
    // Clear momentum from the previous swipe before an explicit transition.
    // Otherwise the camera can continue drifting and land on another building.
    touchControllerRef.current?.cancelMotion();
    switch (cameraPreset) {
      case 'center':
      case 'hq':
        focusCityCamera(cameraTargetPos.current, cameraLookAtPos.current, 0, 0);
        break;
      case 'bank':
        focusCityCamera(cameraTargetPos.current, cameraLookAtPos.current, -24, 12);
        break;
      case 'stock_exchange':
        focusCityCamera(cameraTargetPos.current, cameraLookAtPos.current, 24, 12);
        break;
      case 'factory':
        focusCityCamera(cameraTargetPos.current, cameraLookAtPos.current, 45, 52);
        break;
      case 'tech':
        focusCityCamera(cameraTargetPos.current, cameraLookAtPos.current, -45, -45);
        break;
      case 'maritime':
        focusCityCamera(cameraTargetPos.current, cameraLookAtPos.current, 80, 32);
        break;
      case 'gov':
        focusCityCamera(cameraTargetPos.current, cameraLookAtPos.current, 45, -45);
        break;
      case 'trade':
        focusCityCamera(cameraTargetPos.current, cameraLookAtPos.current, -45, 32);
        break;
      case 'luxury':
        focusCityCamera(cameraTargetPos.current, cameraLookAtPos.current, -74, 32);
        break;
      case 'plots':
        focusCityCamera(cameraTargetPos.current, cameraLookAtPos.current, 16, -18);
        break;
      default:
        break;
    }
    if (onResetPreset) onResetPreset();
  }, [cameraPreset, onResetPreset]);

  // Pan to clicked landmark automatically and freeze/lock camera steady
  useEffect(() => {
    touchControllerRef.current?.cancelMotion();
    if (selectedItem) {
      touchControllerRef.current?.setLocked(true);
    } else {
      touchControllerRef.current?.setLocked(false);
    }

    if (selectedItem?.type === 'landmark') {
      const def = ALL_CITY_LANDMARKS.find((l) => l.id === selectedItem.id);
      if (def) {
        focusCityCamera(
          cameraTargetPos.current,
          cameraLookAtPos.current,
          def.coordinates.x,
          def.coordinates.z
        );
      }
    } else if (selectedItem?.type === 'plot') {
      focusCityCamera(
        cameraTargetPos.current,
        cameraLookAtPos.current,
        selectedItem.plot.gridX,
        selectedItem.plot.gridZ
      );
    }
  }, [selectedItem]);

  // Expose bounded zoom and a safe return-to-center control.
  const handleZoomIn = () => touchControllerRef.current?.zoomStep('in');
  const handleZoomOut = () => touchControllerRef.current?.zoomStep('out');
  const handleResetView = () => touchControllerRef.current?.resetView();

  return (
    <div className="city-canvas-shell relative w-full h-[calc(100dvh-4.5rem)] min-h-[520px] md:h-[calc(100dvh-5.5rem)] md:min-h-[620px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-amber-500/30 bg-slate-950 select-none">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />
      {/* Floating Gold UI Feedback Overlay */}
      <div ref={floatingOverlayRef} className="absolute inset-0 pointer-events-none overflow-hidden z-20" />

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
          onClick={handleResetView}
          className="px-2 h-7 rounded-lg bg-slate-900/90 border border-amber-500/40 text-amber-400 font-bold text-[11px] flex items-center gap-0.5 hover:bg-slate-800 transition-colors shadow-md active:scale-95"
          title="إعادة الكاميرا إلى مركز المدينة"
          aria-label="Reset camera view"
        >
          <span>⌂</span>
        </button>
      </div>
    </div>
  );
};

export default CityCanvas;
