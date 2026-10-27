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
  loadHQLevel,
  type CityPlotDefinition,
  type CityConstructionState,
} from '../../game/cityGridSystem';
import { playSound } from '../../game/soundEffects';

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

  // Camera targets for smooth damping
  const cameraTargetPos = useRef(new THREE.Vector3(0, 32, 42));
  const cameraLookAtPos = useRef(new THREE.Vector3(0, 0, 4));

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 500;

    // Detect software GL to optimize rendering budget on low-end devices
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

    // 1. Scene
    const scene = new THREE.Scene();
    const skyColor = isNightMode ? '#070b14' : '#1e293b';
    const fogColor = isNightMode ? '#0a0f1d' : '#1e293b';
    scene.background = new THREE.Color(skyColor);
    scene.fog = new THREE.FogExp2(fogColor, 0.009);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 300);
    camera.position.set(0, 34, 45);
    camera.lookAt(0, 0, 4);

    // 3. Renderer
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

    // 4. Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Lighting
    const hemiLight = new THREE.HemisphereLight(
      isNightMode ? '#38bdf8' : '#e0f2fe',
      isNightMode ? '#0f172a' : '#1e293b',
      isNightMode ? 0.7 : 1.1
    );
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight('#fef08a', isNightMode ? 1.4 : 2.0);
    dirLight.position.set(30, 50, 30);
    dirLight.castShadow = !isSoftwareGl;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 120;
    const shadowD = 50;
    dirLight.shadow.camera.left = -shadowD;
    dirLight.shadow.camera.right = shadowD;
    dirLight.shadow.camera.top = shadowD;
    dirLight.shadow.camera.bottom = -shadowD;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // Warm city point light around Imperial Tower
    const hqLight = new THREE.PointLight('#f59e0b', 2.5, 45);
    hqLight.position.set(0, 16, 0);
    scene.add(hqLight);

    // Bank amber point light
    const bankLight = new THREE.PointLight('#38bdf8', 1.8, 30);
    bankLight.position.set(-18, 10, 8);
    scene.add(bankLight);

    // Factory warm point light
    const factoryLight = new THREE.PointLight('#fb923c', 2.0, 35);
    factoryLight.position.set(18, 10, 8);
    scene.add(factoryLight);

    // 6. Ground & City Base Grid
    const groundGeo = new THREE.PlaneGeometry(160, 160);
    const groundMat = new THREE.MeshStandardMaterial({
      color: isNightMode ? '#0a0e17' : '#111827',
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = !isSoftwareGl;
    scene.add(ground);

    // Procedural asphalt roads and sidewalks
    const roadMat = new THREE.MeshStandardMaterial({
      color: '#1e293b',
      roughness: 0.8,
      metalness: 0.2,
    });
    const sidewalkMat = new THREE.MeshStandardMaterial({
      color: '#334155',
      roughness: 0.6,
      metalness: 0.2,
    });
    const roadMarkMat = new THREE.MeshBasicMaterial({ color: '#f59e0b' });

    // Main central avenue (Z axis)
    const mainAvenue = new THREE.Mesh(new THREE.BoxGeometry(8, 0.08, 140), roadMat);
    mainAvenue.position.set(0, 0.04, 0);
    scene.add(mainAvenue);

    // Cross Boulevard (X axis)
    const crossBoulevard = new THREE.Mesh(new THREE.BoxGeometry(140, 0.08, 8), roadMat);
    crossBoulevard.position.set(0, 0.04, 0);
    scene.add(crossBoulevard);

    // Outer ring road
    const outerRoadN = new THREE.Mesh(new THREE.BoxGeometry(140, 0.08, 6), roadMat);
    outerRoadN.position.set(0, 0.04, -22);
    scene.add(outerRoadN);

    const outerRoadS = new THREE.Mesh(new THREE.BoxGeometry(140, 0.08, 6), roadMat);
    outerRoadS.position.set(0, 0.04, 16);
    scene.add(outerRoadS);

    // Road markings
    for (let z = -60; z <= 60; z += 6) {
      if (Math.abs(z) > 4) {
        const mark = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 2.5), roadMarkMat);
        mark.position.set(0, 0.09, z);
        scene.add(mark);
      }
    }

    // 7. Clickable Objects Map
    const clickableObjects = new Map<THREE.Object3D, SelectedItem>();

    // Helper: Register click target
    const registerClickable = (meshOrGroup: THREE.Object3D, item: SelectedItem) => {
      clickableObjects.set(meshOrGroup, item);
      meshOrGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          clickableObjects.set(child, item);
        }
      });
    };

    // -------------------------------------------------------------
    // BUILDINGS PROCEDURAL ASSEMBLE (3-12 parts per Three.js standard)
    // -------------------------------------------------------------

    // A. IMPERIAL TOWER (المقر الرئيسي)
    const hqGroup = new THREE.Group();
    hqGroup.position.set(0, 0, 0);

    // Part 1: Podium base with gold trim
    const podiumGeo = new THREE.BoxGeometry(10, 1.2, 10);
    const podiumMat = new THREE.MeshStandardMaterial({
      color: '#1e293b',
      roughness: 0.3,
      metalness: 0.7,
    });
    const podium = new THREE.Mesh(podiumGeo, podiumMat);
    podium.position.y = 0.6;
    podium.castShadow = !isSoftwareGl;
    podium.receiveShadow = !isSoftwareGl;
    hqGroup.add(podium);

    // Part 2: Gold plaza trim
    const trimGeo = new THREE.BoxGeometry(10.6, 0.2, 10.6);
    const goldMat = new THREE.MeshStandardMaterial({
      color: '#d97706',
      roughness: 0.2,
      metalness: 0.9,
    });
    const trim = new THREE.Mesh(trimGeo, goldMat);
    trim.position.y = 1.2;
    hqGroup.add(trim);

    const hqLevel = loadHQLevel(profile);

    // Part 3: Lower tower tier (Level 1+)
    const tier1Geo = new THREE.BoxGeometry(7, 10, 7);
    const glassMat = new THREE.MeshStandardMaterial({
      color: '#0284c7',
      roughness: 0.15,
      metalness: 0.85,
    });
    const tier1 = new THREE.Mesh(tier1Geo, glassMat);
    tier1.position.y = 6.2;
    tier1.castShadow = !isSoftwareGl;
    hqGroup.add(tier1);

    if (hqLevel === 1) {
      const capGeo = new THREE.BoxGeometry(7.4, 0.6, 7.4);
      const cap = new THREE.Mesh(capGeo, goldMat);
      cap.position.y = 11.5;
      hqGroup.add(cap);
    }

    // Part 4: Mid tower tier (Level 2+)
    if (hqLevel >= 2) {
      const tier2Geo = new THREE.BoxGeometry(5.2, 8, 5.2);
      const tier2 = new THREE.Mesh(tier2Geo, glassMat);
      tier2.position.y = 15.2;
      tier2.castShadow = !isSoftwareGl;
      hqGroup.add(tier2);

      if (hqLevel === 2) {
        const capGeo = new THREE.BoxGeometry(5.6, 0.6, 5.6);
        const cap = new THREE.Mesh(capGeo, goldMat);
        cap.position.y = 19.5;
        hqGroup.add(cap);
      }
    }

    // Part 5: Top luxury penthouse (Level 3+)
    if (hqLevel >= 3) {
      const tier3Geo = new THREE.BoxGeometry(3.6, 5, 3.6);
      const tier3 = new THREE.Mesh(tier3Geo, glassMat);
      tier3.position.y = 21.7;
      tier3.castShadow = !isSoftwareGl;
      hqGroup.add(tier3);

      if (hqLevel === 3) {
        const capGeo = new THREE.BoxGeometry(4.0, 0.5, 4.0);
        const cap = new THREE.Mesh(capGeo, goldMat);
        cap.position.y = 24.4;
        hqGroup.add(cap);
      }
    }

    // Part 6: Spire & Crown beacon (Level 4+)
    if (hqLevel >= 4) {
      const spireGeo = new THREE.CylinderGeometry(0.1, 0.6, 5, 8);
      const spire = new THREE.Mesh(spireGeo, goldMat);
      spire.position.y = 26.7;
      hqGroup.add(spire);

      const beaconGeo = new THREE.SphereGeometry(0.5, 12, 12);
      const beaconMat = new THREE.MeshBasicMaterial({ color: '#fbbf24' });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = 29.2;
      hqGroup.add(beacon);
    }

    // Part 7: Floating Crown / Logo holographic badge (Level 5)
    let crownRing: THREE.Mesh | null = null;
    if (hqLevel >= 5) {
      const crownRingGeo = new THREE.TorusGeometry(1.2, 0.15, 16, 32);
      crownRing = new THREE.Mesh(crownRingGeo, goldMat);
      crownRing.position.y = 31.5;
      crownRing.rotation.x = Math.PI / 2;
      hqGroup.add(crownRing);
    }

    scene.add(hqGroup);
    registerClickable(hqGroup, { type: 'landmark', id: 'hq' });

    // B. CENTRAL INVESTMENT BANK (البنك المركزي)
    const bankGroup = new THREE.Group();
    bankGroup.position.set(-18, 0, 8);

    // Part 1: Marble base steps
    const bankBaseGeo = new THREE.BoxGeometry(9, 0.8, 8);
    const bankBaseMat = new THREE.MeshStandardMaterial({
      color: '#e2e8f0',
      roughness: 0.4,
      metalness: 0.3,
    });
    const bankBase = new THREE.Mesh(bankBaseGeo, bankBaseMat);
    bankBase.position.y = 0.4;
    bankBase.castShadow = !isSoftwareGl;
    bankGroup.add(bankBase);

    // Part 2: Main bank hall
    const bankHallGeo = new THREE.BoxGeometry(7.5, 4.5, 6.5);
    const bankHall = new THREE.Mesh(bankHallGeo, bankBaseMat);
    bankHall.position.y = 3.0;
    bankHall.castShadow = !isSoftwareGl;
    bankGroup.add(bankHall);

    // Part 3: Classical Front Columns (4 columns)
    const colGeo = new THREE.CylinderGeometry(0.35, 0.35, 4.2, 12);
    for (let c = -2.5; c <= 2.5; c += 1.66) {
      const col = new THREE.Mesh(colGeo, bankBaseMat);
      col.position.set(c, 2.9, 3.4);
      col.castShadow = !isSoftwareGl;
      bankGroup.add(col);
    }

    // Part 4: Pediment roof (triangle prism)
    const pedimentGeo = new THREE.ConeGeometry(5.2, 2.2, 4);
    const pediment = new THREE.Mesh(pedimentGeo, goldMat);
    pediment.position.set(0, 6.4, 0.2);
    pediment.rotation.y = Math.PI / 4;
    bankGroup.add(pediment);

    // Part 5: Gold bank vault emblem
    const emblemGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 16);
    const emblem = new THREE.Mesh(emblemGeo, goldMat);
    emblem.position.set(0, 4.2, 3.4);
    emblem.rotation.x = Math.PI / 2;
    bankGroup.add(emblem);

    scene.add(bankGroup);
    registerClickable(bankGroup, { type: 'landmark', id: 'bank' });

    // C. INDUSTRIAL COMPLEX / MAIN FACTORY (مجمع المصانع)
    const factoryGroup = new THREE.Group();
    factoryGroup.position.set(18, 0, 8);

    // Part 1: Industrial Floor
    const factBaseGeo = new THREE.BoxGeometry(10, 0.6, 9);
    const factBaseMat = new THREE.MeshStandardMaterial({
      color: '#334155',
      roughness: 0.8,
      metalness: 0.3,
    });
    const factBase = new THREE.Mesh(factBaseGeo, factBaseMat);
    factBase.position.y = 0.3;
    factoryGroup.add(factBase);

    // Part 2: Factory main hangar with sawtooth roof vibe
    const hangarGeo = new THREE.BoxGeometry(8, 4.2, 6);
    const hangarMat = new THREE.MeshStandardMaterial({
      color: '#475569',
      roughness: 0.6,
      metalness: 0.4,
    });
    const hangar = new THREE.Mesh(hangarGeo, hangarMat);
    hangar.position.y = 2.7;
    hangar.castShadow = !isSoftwareGl;
    factoryGroup.add(hangar);

    // Part 3 & 4: Dual Chimneys
    const chimneyGeo = new THREE.CylinderGeometry(0.5, 0.65, 6.5, 12);
    const chimneyMat = new THREE.MeshStandardMaterial({
      color: '#b91c1c',
      roughness: 0.7,
      metalness: 0.2,
    });
    const chimney1 = new THREE.Mesh(chimneyGeo, chimneyMat);
    chimney1.position.set(-2.4, 5.8, -1.8);
    factoryGroup.add(chimney1);

    const chimney2 = new THREE.Mesh(chimneyGeo, chimneyMat);
    chimney2.position.set(-0.8, 5.8, -1.8);
    factoryGroup.add(chimney2);

    // Animated Smoke particles from chimneys
    const smokeParticles: THREE.Mesh[] = [];
    const smokeMat = new THREE.MeshBasicMaterial({
      color: '#cbd5e1',
      transparent: true,
      opacity: 0.35,
    });
    for (let s = 0; s < 4; s++) {
      const smoke = new THREE.Mesh(new THREE.SphereGeometry(0.3 + s * 0.1, 8, 8), smokeMat);
      smoke.position.set(-1.6 + (s % 2) * 1.6, 9.2 + s * 0.9, -1.8);
      factoryGroup.add(smoke);
      smokeParticles.push(smoke);
    }

    // Part 5: Storage tank silo
    const siloGeo = new THREE.CylinderGeometry(1.2, 1.2, 4.5, 16);
    const siloMat = new THREE.MeshStandardMaterial({
      color: '#94a3b8',
      roughness: 0.3,
      metalness: 0.8,
    });
    const silo = new THREE.Mesh(siloGeo, siloMat);
    silo.position.set(2.8, 2.55, 1.8);
    factoryGroup.add(silo);

    scene.add(factoryGroup);
    registerClickable(factoryGroup, { type: 'landmark', id: 'factory' });

    // D. DYNAMIC CITY PLOTS (Grid mapping from player profile)
    const constructions = loadCityConstructions(profile);
    const cityData = resolveCityGrid(profile, constructions);

    const plotMeshes: THREE.Group[] = [];

    cityData.plots.forEach((plot) => {
      const plotGroup = new THREE.Group();
      plotGroup.position.set(plot.gridX, 0, plot.gridZ);

      // Plot ground slab
      let slabColor = '#1e293b';
      if (plot.zoning === 'industrial') slabColor = '#1e293b';
      else if (plot.zoning === 'commercial') slabColor = '#0f172a';
      else if (plot.zoning === 'agricultural') slabColor = '#064e3b';

      const slabMat = new THREE.MeshStandardMaterial({
        color: slabColor,
        roughness: 0.85,
        metalness: 0.15,
      });
      const slab = new THREE.Mesh(new THREE.BoxGeometry(plot.width, 0.4, plot.depth), slabMat);
      slab.position.y = 0.2;
      slab.receiveShadow = !isSoftwareGl;
      plotGroup.add(slab);

      // Plot border highlight
      const borderMat = new THREE.MeshBasicMaterial({
        color:
          plot.status === 'developed'
            ? '#10b981'
            : plot.status === 'constructing' || plot.status === 'clearing'
            ? '#f59e0b'
            : plot.status === 'owned_empty'
            ? '#38bdf8'
            : '#64748b',
        wireframe: false,
      });
      const borderBox = new THREE.Mesh(new THREE.BoxGeometry(plot.width + 0.2, 0.08, plot.depth + 0.2), borderMat);
      borderBox.position.y = 0.42;
      plotGroup.add(borderBox);

      // Content based on status
      if (plot.status === 'empty_for_sale' || plot.status === 'locked') {
        // Empty plot for sale / locked
        const signGeo = new THREE.CylinderGeometry(0.1, 0.1, 2.2, 8);
        const signPostMat = new THREE.MeshStandardMaterial({ color: '#64748b', metalness: 0.5 });
        const signPost = new THREE.Mesh(signGeo, signPostMat);
        signPost.position.set(0, 1.1, 0);
        plotGroup.add(signPost);

        const boardGeo = new THREE.BoxGeometry(2.4, 1.4, 0.15);
        const boardMat = new THREE.MeshStandardMaterial({
          color: plot.status === 'locked' ? '#dc2626' : '#d97706',
          metalness: 0.4,
          roughness: 0.4,
        });
        const board = new THREE.Mesh(boardGeo, boardMat);
        board.position.set(0, 2.4, 0);
        plotGroup.add(board);

        // Little floating halo
        const haloGeo = new THREE.RingGeometry(1.5, 1.8, 16);
        const haloMat = new THREE.MeshBasicMaterial({
          color: plot.status === 'locked' ? '#ef4444' : '#fbbf24',
          side: THREE.DoubleSide,
        });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.position.set(0, 0.46, 0);
        halo.rotation.x = Math.PI / 2;
        plotGroup.add(halo);
      } else if (plot.status === 'clearing' || plot.status === 'constructing') {
        // Construction site with yellow crane & scaffolding
        // 1. Excavation dirt mound
        const moundGeo = new THREE.ConeGeometry(2.2, 0.9, 8);
        const dirtMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9 });
        const mound = new THREE.Mesh(moundGeo, dirtMat);
        mound.position.set(-2, 0.6, 2);
        plotGroup.add(mound);

        // 2. Yellow tower crane
        const craneGroup = new THREE.Group();
        craneGroup.position.set(2, 0, -2);

        const mastGeo = new THREE.BoxGeometry(0.6, 8, 0.6);
        const yellowMat = new THREE.MeshStandardMaterial({
          color: '#eab308',
          metalness: 0.8,
          roughness: 0.2,
        });
        const mast = new THREE.Mesh(mastGeo, yellowMat);
        mast.position.y = 4;
        craneGroup.add(mast);

        const boomGeo = new THREE.BoxGeometry(6, 0.4, 0.4);
        const boom = new THREE.Mesh(boomGeo, yellowMat);
        boom.position.set(1.5, 8, 0);
        craneGroup.add(boom);

        plotGroup.add(craneGroup);

        // 3. Scaffolding wireframe structure
        const scafGeo = new THREE.BoxGeometry(4.5, 3.8, 4.5);
        const scafMat = new THREE.MeshBasicMaterial({
          color: '#f59e0b',
          wireframe: true,
        });
        const scaf = new THREE.Mesh(scafGeo, scafMat);
        scaf.position.set(-0.5, 2.1, -0.5);
        plotGroup.add(scaf);
      } else if (plot.status === 'developed') {
        const bGroup = new THREE.Group();

        if (plot.branch) {
          // --- COMPANY BRANCH OFFICE BUILDING ---
          // 1. Lower Corporate Lobby
          const lobbyGeo = new THREE.BoxGeometry(6, 2.4, 6);
          const lobbyMat = new THREE.MeshStandardMaterial({
            color: '#0f172a',
            roughness: 0.2,
            metalness: 0.8,
          });
          const lobby = new THREE.Mesh(lobbyGeo, lobbyMat);
          lobby.position.y = 1.4;
          bGroup.add(lobby);

          // 2. Mid Tower Glass Floors
          const towerGeo = new THREE.BoxGeometry(4.8, 4.2, 4.8);
          const towerMat = new THREE.MeshStandardMaterial({
            color: '#1e293b',
            roughness: 0.1,
            metalness: 0.9,
          });
          const tower = new THREE.Mesh(towerGeo, towerMat);
          tower.position.y = 4.7;
          bGroup.add(tower);

          // 3. Golden Crown Parapet & Brand Pylon
          const crownGeo = new THREE.BoxGeometry(5.2, 0.4, 5.2);
          const crownMat = new THREE.MeshStandardMaterial({
            color: '#f59e0b',
            metalness: 0.85,
            roughness: 0.2,
          });
          const crown = new THREE.Mesh(crownGeo, crownMat);
          crown.position.y = 6.9;
          bGroup.add(crown);

          // 4. Glowing Brand Beacon / Emblem
          const beaconGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.2, 12);
          const beaconMat = new THREE.MeshBasicMaterial({ color: '#fbbf24' });
          const beacon = new THREE.Mesh(beaconGeo, beaconMat);
          beacon.position.y = 7.7;
          bGroup.add(beacon);

          // 5. Entrance Gold Canopy
          const canopyGeo = new THREE.BoxGeometry(2.6, 0.2, 1.4);
          const canopyMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.8 });
          const canopy = new THREE.Mesh(canopyGeo, canopyMat);
          canopy.position.set(0, 1.8, 3.2);
          bGroup.add(canopy);
        } else if (plot.shop) {
          // --- RETAIL STORE / COMMERCIAL SHOP ---
          const shopType = plot.shop.shopType;
          let themeColor = '#10b981'; // groceries default
          if (shopType === 'detergents') themeColor = '#06b6d4';
          else if (shopType === 'electronics') themeColor = '#8b5cf6';
          else if (shopType === 'building_materials') themeColor = '#f59e0b';

          // 1. Storefront Main Body
          const shopBodyGeo = new THREE.BoxGeometry(5.6, 3.2, 5);
          const shopBodyMat = new THREE.MeshStandardMaterial({
            color: '#1e293b',
            roughness: 0.4,
            metalness: 0.4,
          });
          const shopBody = new THREE.Mesh(shopBodyGeo, shopBodyMat);
          shopBody.position.y = 1.8;
          bGroup.add(shopBody);

          // 2. Front Large Glass Display Windows
          const glassGeo = new THREE.BoxGeometry(4.6, 1.8, 0.2);
          const glassMat = new THREE.MeshStandardMaterial({
            color: '#38bdf8',
            roughness: 0.1,
            metalness: 0.7,
            transparent: true,
            opacity: 0.85,
          });
          const glass = new THREE.Mesh(glassGeo, glassMat);
          glass.position.set(0, 1.4, 2.52);
          bGroup.add(glass);

          // 3. Thematic Colored Store Awning / Canopy
          const awningGeo = new THREE.BoxGeometry(4.8, 0.35, 1.5);
          const awningMat = new THREE.MeshStandardMaterial({
            color: themeColor,
            roughness: 0.3,
            metalness: 0.3,
          });
          const awning = new THREE.Mesh(awningGeo, awningMat);
          awning.rotation.x = 0.2;
          awning.position.set(0, 2.5, 3.0);
          bGroup.add(awning);

          // 4. Shop Signage Billboard Header
          const signGeo = new THREE.BoxGeometry(4.2, 0.7, 0.25);
          const signMat = new THREE.MeshStandardMaterial({
            color: '#0f172a',
            roughness: 0.3,
          });
          const sign = new THREE.Mesh(signGeo, signMat);
          sign.position.set(0, 3.1, 2.55);
          bGroup.add(sign);

          // Sign glowing trim matching shop theme
          const signTrimGeo = new THREE.BoxGeometry(4.3, 0.1, 0.3);
          const signTrimMat = new THREE.MeshBasicMaterial({ color: themeColor });
          const signTrim = new THREE.Mesh(signTrimGeo, signTrimMat);
          signTrim.position.set(0, 3.48, 2.55);
          bGroup.add(signTrim);
        } else {
          // --- FACTORY / INDUSTRIAL / COMMERCIAL PREMISES ---
          const ind = plot.company?.industryId;

          if (ind === 'petroleum' || ind === 'gas') {
            // Refinery columns & tanks
            const t1 = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 4.5, 16), new THREE.MeshStandardMaterial({ color: '#64748b', metalness: 0.8 }));
            t1.position.set(-2, 2.45, 0);
            bGroup.add(t1);

            const t2 = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 7, 12), new THREE.MeshStandardMaterial({ color: '#d97706', metalness: 0.6 }));
            t2.position.set(2, 3.7, 0);
            bGroup.add(t2);
          } else if (ind === 'food') {
            // Modern agricultural glass greenhouse & silo
            const gh = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 2.8, 16, 1, false, 0, Math.PI), new THREE.MeshStandardMaterial({ color: '#10b981', roughness: 0.2, metalness: 0.3, transparent: true, opacity: 0.85 }));
            gh.rotation.z = Math.PI / 2;
            gh.position.set(-1, 2.0, 0);
            bGroup.add(gh);

            const silo = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 5.5, 16), new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.8 }));
            silo.position.set(2.5, 2.95, 1);
            bGroup.add(silo);
          } else if (ind === 'electronics') {
            // Futuristic tech hub with glowing windows
            const main = new THREE.Mesh(new THREE.BoxGeometry(5.5, 5, 5), new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.3, metalness: 0.8 }));
            main.position.y = 2.7;
            bGroup.add(main);

            const neonTrim = new THREE.Mesh(new THREE.BoxGeometry(5.7, 0.3, 5.2), new THREE.MeshBasicMaterial({ color: '#38bdf8' }));
            neonTrim.position.y = 5.3;
            bGroup.add(neonTrim);
          } else {
            // Modern Commercial / Manufacturing building
            const body = new THREE.Mesh(new THREE.BoxGeometry(5, 4.2, 5), new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.5, metalness: 0.5 }));
            body.position.y = 2.3;
            bGroup.add(body);

            const roof = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.4, 5.4), new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.8 }));
            roof.position.y = 4.6;
            bGroup.add(roof);
          }
        }

        plotGroup.add(bGroup);
      }

      scene.add(plotGroup);
      plotMeshes.push(plotGroup);
      registerClickable(plotGroup, { type: 'plot', plot });
    });

    // E. CITY LIFE (Cars driving on roads & trees)
    // Instanced Trees
    const treeTrunkGeo = new THREE.CylinderGeometry(0.18, 0.22, 1.6, 6);
    const treeFoliageGeo = new THREE.ConeGeometry(0.9, 2.4, 7);
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.6 });

    const treePositions = [
      [-6, 0.8, -6], [-6, 0.8, 6], [6, 0.8, -6], [6, 0.8, 6],
      [-10, 0.8, -10], [10, 0.8, -10], [-10, 0.8, 10], [10, 0.8, 10],
      [-26, 0.8, 0], [26, 0.8, 0], [0, 0.8, -26], [0, 0.8, 20],
    ];

    treePositions.forEach(([tx, ty, tz]) => {
      const tree = new THREE.Group();
      tree.position.set(tx, ty, tz);
      const trunk = new THREE.Mesh(treeTrunkGeo, trunkMat);
      trunk.position.y = 0;
      tree.add(trunk);
      const leaves = new THREE.Mesh(treeFoliageGeo, foliageMat);
      leaves.position.y = 1.4;
      tree.add(leaves);
      scene.add(tree);
    });

    // Animated cars
    interface CarEntity {
      mesh: THREE.Mesh;
      axis: 'x' | 'z';
      dir: 1 | -1;
      speed: number;
      min: number;
      max: number;
    }
    const cars: CarEntity[] = [];
    const carColors = ['#f59e0b', '#38bdf8', '#ef4444', '#10b981'];

    for (let i = 0; i < 4; i++) {
      const carMat = new THREE.MeshStandardMaterial({
        color: carColors[i % carColors.length],
        metalness: 0.7,
        roughness: 0.3,
      });
      const car = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 0.9), carMat);
      if (i % 2 === 0) {
        car.position.set(i === 0 ? 1.5 : -1.5, 0.45, -30 + i * 20);
        car.rotation.y = i === 0 ? 0 : Math.PI;
        cars.push({
          mesh: car,
          axis: 'z',
          dir: i === 0 ? 1 : -1,
          speed: 0.15 + Math.random() * 0.1,
          min: -50,
          max: 50,
        });
      } else {
        car.position.set(-30 + i * 20, 0.45, i === 1 ? 1.5 : -1.5);
        car.rotation.y = i === 1 ? Math.PI / 2 : -Math.PI / 2;
        cars.push({
          mesh: car,
          axis: 'x',
          dir: i === 1 ? 1 : -1,
          speed: 0.15 + Math.random() * 0.1,
          min: -50,
          max: 50,
        });
      }
      scene.add(car);
    }

    // -------------------------------------------------------------
    // TOUCH & MOUSE CONTROLS (Fluid panning, rotation, and zooming)
    // -------------------------------------------------------------
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let isDragging = false;
    let isPinching = false;
    let startX = 0;
    let startY = 0;
    let pinchStartDist = 0;
    let dragThresholdPassed = false;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      dragThresholdPassed = false;
      if ('touches' in e) {
        if (e.touches.length === 1) {
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
          isPinching = true;
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          pinchStartDist = Math.hypot(dx, dy);
        }
      } else {
        startX = e.clientX;
        startY = e.clientY;
      }
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;

      if ('touches' in e && e.touches.length === 2 && isPinching) {
        // Pinch zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const delta = pinchStartDist - dist;
        pinchStartDist = dist;

        cameraTargetPos.current.y = THREE.MathUtils.clamp(
          cameraTargetPos.current.y + delta * 0.08,
          12,
          75
        );
        cameraTargetPos.current.z = THREE.MathUtils.clamp(
          cameraTargetPos.current.z + delta * 0.1,
          15,
          95
        );
        dragThresholdPassed = true;
        return;
      }

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - startX;
      const deltaY = clientY - startY;

      if (Math.hypot(deltaX, deltaY) > 5) {
        dragThresholdPassed = true;
      }

      // Check if rotating (right click or ctrl or two fingers)
      const isRotating =
        ('button' in e && (e.button === 2 || (e.button === 0 && e.ctrlKey))) ||
        ('touches' in e && e.touches.length >= 2);

      if (isRotating) {
        // Rotate camera around lookAt point
        const angle = -deltaX * 0.008;
        const offset = new THREE.Vector3().subVectors(cameraTargetPos.current, cameraLookAtPos.current);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        cameraTargetPos.current.copy(cameraLookAtPos.current).add(offset);
      } else {
        // Pan camera
        const panFactor = (cameraTargetPos.current.y / 35) * 0.045;
        cameraTargetPos.current.x -= deltaX * panFactor;
        cameraTargetPos.current.z -= deltaY * panFactor;
        cameraLookAtPos.current.x -= deltaX * panFactor;
        cameraLookAtPos.current.z -= deltaY * panFactor;

        // Clamp camera within city limits
        cameraTargetPos.current.x = THREE.MathUtils.clamp(cameraTargetPos.current.x, -55, 55);
        cameraTargetPos.current.z = THREE.MathUtils.clamp(cameraTargetPos.current.z, -30, 85);
        cameraLookAtPos.current.x = THREE.MathUtils.clamp(cameraLookAtPos.current.x, -55, 55);
        cameraLookAtPos.current.z = THREE.MathUtils.clamp(cameraLookAtPos.current.z, -45, 50);
      }

      startX = clientX;
      startY = clientY;
    };

    const onPointerUp = (e: MouseEvent | TouchEvent) => {
      if (!dragThresholdPassed) {
        // Perform Raycast Click / Tap
        const rect = renderer.domElement.getBoundingClientRect();
        const clientX =
          'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
        const clientY =
          'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;

        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

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
          // Deselect
          onSelectItemRef.current(null);
        }
      }

      isDragging = false;
      isPinching = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.04;
      cameraTargetPos.current.y = THREE.MathUtils.clamp(
        cameraTargetPos.current.y + zoomDelta,
        12,
        75
      );
      cameraTargetPos.current.z = THREE.MathUtils.clamp(
        cameraTargetPos.current.z + zoomDelta * 1.2,
        15,
        95
      );
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('contextmenu', (e) => e.preventDefault());

    // Window resize
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
      const dt = clock.getDelta();

      // Smooth camera position damping
      camera.position.x = THREE.MathUtils.damp(camera.position.x, cameraTargetPos.current.x, 7, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, cameraTargetPos.current.y, 7, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, cameraTargetPos.current.z, 7, dt);

      // Smooth camera lookAt point
      camera.lookAt(cameraLookAtPos.current);

      // Animate smoke particles
      smokeParticles.forEach((smoke, idx) => {
        smoke.position.y += dt * 0.45;
        smoke.scale.multiplyScalar(1 + dt * 0.08);
        if (smoke.position.y > 13.5) {
          smoke.position.y = 9.2 + idx * 0.9;
          smoke.scale.set(1, 1, 1);
        }
      });

      // Animate cars
      cars.forEach((c) => {
        if (c.axis === 'z') {
          c.mesh.position.z += c.dir * c.speed;
          if (c.mesh.position.z > c.max || c.mesh.position.z < c.min) {
            c.dir = (c.dir * -1) as 1 | -1;
            c.mesh.rotation.y += Math.PI;
          }
        } else {
          c.mesh.position.x += c.dir * c.speed;
          if (c.mesh.position.x > c.max || c.mesh.position.x < c.min) {
            c.dir = (c.dir * -1) as 1 | -1;
            c.mesh.rotation.y += Math.PI;
          }
        }
      });

      // Subtle rotation on HQ halo beacon
      if (crownRing) {
        crownRing.rotation.z += dt * 0.5;
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onResize);
      dom.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      dom.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      dom.removeEventListener('wheel', onWheel);

      renderer.dispose();
      groundGeo.dispose();
      groundMat.dispose();
      if (dom && dom.parentNode) {
        dom.parentNode.removeChild(dom);
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

  return (
    <div className="relative w-full h-[520px] md:h-[620px] rounded-2xl overflow-hidden shadow-2xl border border-amber-500/30 bg-slate-950">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
