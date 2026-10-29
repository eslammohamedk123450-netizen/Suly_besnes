/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import type { CityMaterialPalette } from './cityMaterials';
import type { PlayerProfile } from '../../domain/player';
import type { MegaExpansionState } from '../../domain/expansionSystems';

export interface CartelStrongholdLevelInfo {
  level: number;
  nameAr: string;
  subTitleAr: string;
  imageSrc: string;
  upgradeCost: number;
  requiredPlayerLevel: number;
  perksAr: string[];
  totalDomes: number;
  hasWaterfall: boolean;
  hasHelipad: boolean;
  hasYachtHarbor: boolean;
  descriptionAr: string;
}

export const CARTEL_STRONGHOLD_LEVELS: CartelStrongholdLevelInfo[] = [
  {
    level: 1,
    nameAr: 'تحالف ناشئ',
    subTitleAr: 'فيلا التحالف الساحلية (Alliance Villa - Level 1)',
    imageSrc: '/images/cartel-bastion/level-01.jpg',
    upgradeCost: 0,
    requiredPlayerLevel: 1,
    perksAr: ['تأسيس مقر التحالف الساحلي في جزيرة صخرية خاصة', 'حوض سباحة بانورامي ورصيف زوارق خشبي', '+10% زيادة إيرادات عمليات التحالف'],
    totalDomes: 2,
    hasWaterfall: false,
    hasHelipad: false,
    hasYachtHarbor: true,
    descriptionAr: 'مقر تأسيسي على جزيرة صخرية تضم فيلا كلاسيكية بقبة ذهبية مركزية ومسبح ساحلي ورصيف زوارق.',
  },
  {
    level: 2,
    nameAr: 'نادي صغير',
    subTitleAr: 'المعقل الفاخر المحصن (Luxury Alliance Outpost - Level 2)',
    imageSrc: '/images/cartel-bastion/level-02.jpg',
    upgradeCost: 750000,
    requiredPlayerLevel: 2,
    perksAr: ['أسوار حجرية محصنة وأبراج مراقبة بقباب ذهبية', 'مهبط طائرات هليكوبتر تنفيذي على السطح', 'مرسى زوارق سريعة إضافي', '+20% زيادة إيرادات التحالف'],
    totalDomes: 3,
    hasWaterfall: false,
    hasHelipad: true,
    hasYachtHarbor: true,
    descriptionAr: 'توسع المعقل إلى حصن ساحلي مسوّر مع باحة داخلية وقباب ذهبية متعددة ومهبط مروحيات.',
  },
  {
    level: 3,
    nameAr: 'قصر تحالف',
    subTitleAr: 'قصر التحالف الدبلوماسي (Alliance Palace - Level 3)',
    imageSrc: '/images/cartel-bastion/level-03.jpg',
    upgradeCost: 2000000,
    requiredPlayerLevel: 3,
    perksAr: ['3 قباب ملكية ذهبية وبوابة كارتيل فخمة', 'فسيفساء ساحة الشرف الملكية المنقوشة', 'أسطول سيارات دفع رباعي فارهة عند المدخل', '+35% زيادة إيرادات التحالف'],
    totalDomes: 5,
    hasWaterfall: false,
    hasHelipad: true,
    hasYachtHarbor: true,
    descriptionAr: 'قصر نيوكلاسيكي فخم يضم 3 قباب ذهبية شامخة وبرجين دفاعيين، وفسيفساء شعار التحالف.',
  },
  {
    level: 4,
    nameAr: 'قصر متوسط',
    subTitleAr: 'قصر التحالف بالشلال الصخري (Medium Alliance Palace - Level 4)',
    imageSrc: '/images/cartel-bastion/level-04.jpg',
    upgradeCost: 5000000,
    requiredPlayerLevel: 4,
    perksAr: ['مسبح إنفينيتي زجاجي مع شلال هادر يتدفق في مياه البحر', 'يخت سياحي فاره في المرسى الخاص', 'سيارة رياضية خارقة وسيارة دفع رباعي', '+55% زيادة إيرادات التحالف'],
    totalDomes: 7,
    hasWaterfall: true,
    hasHelipad: true,
    hasYachtHarbor: true,
    descriptionAr: 'مسبح إنفينيتي زجاجي معلق على الجرف يتدفق منه شلال مائي هائل إلى البحر، مع يخت خاص ومهبط مروحيات.',
  },
  {
    level: 5,
    nameAr: 'قصر كبير',
    subTitleAr: 'القصر الإمبراطوري الكبير (Grand Alliance Palace - Level 5)',
    imageSrc: '/images/cartel-bastion/level-05.jpg',
    upgradeCost: 12000000,
    requiredPlayerLevel: 5,
    perksAr: ['شلالات متدفقة مزدوجة تنحدر للبحر المفتوح', 'نافورة رخامية مركزية في باحة القصر', 'فيلات ضيافة VIP مستقلة على محيط الجرف', '+80% زيادة إيرادات التحالف'],
    totalDomes: 8,
    hasWaterfall: true,
    hasHelipad: true,
    hasYachtHarbor: true,
    descriptionAr: 'أجنحة قصر ممتدة على شكل U ونافورة ملكية وشلالات مزدوجة وفلل ضيوف خاصة على صخور الشاطئ.',
  },
  {
    level: 6,
    nameAr: 'قصر فخم',
    subTitleAr: 'الصرح الملكي الفاخر (Luxury Alliance Palace - Level 6)',
    imageSrc: '/images/cartel-bastion/level-06.jpg',
    upgradeCost: 25000000,
    requiredPlayerLevel: 6,
    perksAr: ['حدائق متاهة نباتية وكابانات VIP فاخرة', 'أسطول متكامل من اليخوت والقوارب السريعة', 'قباب ذهبية متعددة الطبقات وشرفات شمسية واسعة', '+110% زيادة إيرادات التحالف'],
    totalDomes: 10,
    hasWaterfall: true,
    hasHelipad: true,
    hasYachtHarbor: true,
    descriptionAr: 'صرح ملكي متكامل مع حدائق نباتية مشذبة وشرفات استجمام علوية ويخوت بحرية فارهة.',
  },
  {
    level: 7,
    nameAr: 'امبراطورية',
    subTitleAr: 'قلعة الإمبراطورية السيادية (Alliance Empire - Level 7)',
    imageSrc: '/images/cartel-bastion/level-07.jpg',
    upgradeCost: 60000000,
    requiredPlayerLevel: 7,
    perksAr: ['حصون سيادية وأبراج دفاعية مزينة بالشعارات الذهبية', 'مرسى بحري عميق لليخوت الملكية العملاقة', 'تخفيض 25% في تكلفة خامات السوق والمناقصات', '+150% زيادة إيرادات التحالف'],
    totalDomes: 12,
    hasWaterfall: true,
    hasHelipad: true,
    hasYachtHarbor: true,
    descriptionAr: 'قلعة سيادية محصنة تتسع لأسطول يخوت فارهة مع قباب ذهبية مهيبة وحماية أمنية مشددة.',
  },
  {
    level: 8,
    nameAr: 'معقل الكارتيل العالمي',
    subTitleAr: 'المعقل الأسطوري الأعلى (World Cartel Stronghold - MAX Level 8)',
    imageSrc: '/images/cartel-bastion/level-08.jpg',
    upgradeCost: 150000000,
    requiredPlayerLevel: 8,
    perksAr: ['أعلى تصنيف سيادي في عالم المال والسيطرة على الأسواق', 'قبة ذهبية أسطورية عملاقة مع أهلة إسلامية مذهبة', 'تحكم استراتيجي كامل في أسعار البورصة ومضاربات الكارتيل', '+200% مضاعفة أرباح عمليات الكارتيل'],
    totalDomes: 14,
    hasWaterfall: true,
    hasHelipad: true,
    hasYachtHarbor: true,
    descriptionAr: 'قمة الفخامة والقوة الاقتصادية: القصر الذهبي الأعظم مع شلالات ضخمة، أسطول يخوت، مروحية كارتيل، وبوابات ذهبية.',
  },
];

export function getCartelStrongholdLevel(
  profile?: PlayerProfile | null,
  expansion?: MegaExpansionState | null
): number {
  if (profile?.cartelStrongholdLevel && profile.cartelStrongholdLevel >= 1) {
    return Math.min(8, Math.max(1, profile.cartelStrongholdLevel));
  }
  if (expansion?.cartel?.strongholdLevel && expansion.cartel.strongholdLevel >= 1) {
    return Math.min(8, Math.max(1, expansion.cartel.strongholdLevel));
  }
  // Try reading from localStorage as fallback
  if (profile?.id) {
    try {
      const stored = localStorage.getItem(`cartel_stronghold_level_${profile.id}`);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 8) return parsed;
      }
    } catch {
      // Ignore
    }
  }
  // Natural progression tied to player level if not explicitly upgraded
  const pLevel = profile?.level ?? 1;
  return Math.min(8, Math.max(1, pLevel));
}

export function saveCartelStrongholdLevel(profileId: string, level: number): void {
  try {
    localStorage.setItem(`cartel_stronghold_level_${profileId}`, String(level));
  } catch {
    // Ignore
  }
}

// Cached textures for courtyard mosaic and water foam
const mosaicTextureCache = new Map<number, THREE.CanvasTexture>();

function getOrCreateCourtyardTexture(level: number): THREE.CanvasTexture {
  if (mosaicTextureCache.has(level)) {
    return mosaicTextureCache.get(level)!;
  }
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Base marble floor
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 512, 512);

    // Decorative geometric outer border
    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 12;
    ctx.strokeRect(20, 20, 472, 472);

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 4;
    ctx.strokeRect(36, 36, 440, 440);

    // Corner rosettes
    const corners = [
      [50, 50],
      [462, 50],
      [50, 462],
      [462, 462],
    ];
    corners.forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fillStyle = '#c5a059';
      ctx.fill();
    });

    // Central circular seal
    ctx.beginPath();
    ctx.arc(256, 256, 170, 0, Math.PI * 2);
    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(256, 256, 155, 0, Math.PI * 2);
    ctx.strokeStyle = '#0369a1';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Central text
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`ALLIANCE • LEVEL ${level}`, 256, 256);

    // Laurel wreath arc
    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(256, 256, 110, 0.4 * Math.PI, 1.6 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(256, 256, 110, -0.6 * Math.PI, 0.6 * Math.PI);
    ctx.stroke();

    // Golden stars
    for (let i = 0; i < Math.min(level, 8); i++) {
      const angle = (i / Math.min(level, 8)) * Math.PI * 2 - Math.PI / 2;
      const sx = 256 + Math.cos(angle) * 70;
      const sy = 256 + Math.sin(angle) * 70;
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(sx, sy, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  mosaicTextureCache.set(level, tex);
  return tex;
}

/**
 * Procedural 3D Model of "معقل الكارتيل والتحالف" (Cartel & Alliance Stronghold)
 * Built to visually match the user's 8 provided architectural photos:
 * - Level 1: Alliance Villa on rocky island with wooden dock & sailboat
 * - Level 2: Fortified Luxury Outpost with battlements & helipad
 * - Level 3: 3-dome Neoclassical Palace with courtyard mosaic & SUV
 * - Level 4: Cantilevered infinity pool with cascading cliff waterfall & luxury yacht
 * - Level 5: Grand Palace with courtyard fountain, double waterfalls & guest villas
 * - Level 6: Luxury Palace with hedge garden maze & extended marina fleet
 * - Level 7: High-security Empire Fortress with reinforced bastions
 * - Level 8: World Cartel Stronghold (MAX) - Colossal golden dome, dual waterfalls, mega-yacht & supercar fleet
 */
export function buildCartelBastionMesh(
  palette: CityMaterialPalette,
  isSoftwareGl: boolean,
  level = 1
): THREE.Group {
  const group = new THREE.Group();
  const visualLevel = Math.max(1, Math.min(8, Math.round(level)));

  // Custom materials for this architectural jewel
  const rockMaterial = new THREE.MeshStandardMaterial({
    color: '#8b7a66',
    roughness: 0.95,
    metalness: 0.05,
    flatShading: true,
  });

  const seaWaterMaterial = new THREE.MeshStandardMaterial({
    color: '#0284c7',
    roughness: 0.15,
    metalness: 0.45,
    transparent: true,
    opacity: 0.88,
  });

  const seaFoamMaterial = new THREE.MeshStandardMaterial({
    color: '#e0f2fe',
    roughness: 0.8,
    transparent: true,
    opacity: 0.75,
  });

  const woodDeckMaterial = new THREE.MeshStandardMaterial({
    color: '#925828',
    roughness: 0.7,
    metalness: 0.1,
  });

  const goldDomeMaterial = palette.imperialGold;
  const whiteMarbleMaterial = palette.whiteMarble;
  const glassMaterial = palette.curtainGlass;
  const poolMaterial = palette.poolTurquoise;

  // --------------------------------------------------------------------------
  // 1. SURROUNDING SEA WATER PLANE & ROCKY CLIFF ISLAND FOUNDATION
  // --------------------------------------------------------------------------
  const baseSize = 13 + visualLevel * 0.45;

  // Sea water disc
  const seaWaterGeo = new THREE.CylinderGeometry(baseSize * 1.35, baseSize * 1.35, 0.4, 32);
  const seaWater = new THREE.Mesh(seaWaterGeo, seaWaterMaterial);
  seaWater.position.y = 0.2;
  group.add(seaWater);

  // Sea water foam rim around cliff base
  const seaFoamGeo = new THREE.RingGeometry(baseSize * 0.82, baseSize * 0.98, 28);
  const seaFoam = new THREE.Mesh(seaFoamGeo, seaFoamMaterial);
  seaFoam.rotation.x = -Math.PI / 2;
  seaFoam.position.y = 0.42;
  group.add(seaFoam);

  // Rocky Island / Cliff Outcropping (Tiered rocky strata with crags)
  const cliffHeight = 3.2 + (visualLevel >= 4 ? 0.8 : 0);
  const rockTiers = 3;
  for (let t = 0; t < rockTiers; t++) {
    const tierR = baseSize * (0.88 - t * 0.04);
    const tierGeo = new THREE.CylinderGeometry(tierR * 0.96, tierR, cliffHeight / rockTiers, 14);
    const tierMesh = new THREE.Mesh(tierGeo, rockMaterial);
    tierMesh.position.y = 0.4 + (t + 0.5) * (cliffHeight / rockTiers);
    tierMesh.rotation.y = (t * Math.PI) / 6;
    tierMesh.castShadow = !isSoftwareGl;
    tierMesh.receiveShadow = true;
    group.add(tierMesh);
  }

  // Island Plateau Surface (White marble foundation terrace)
  const plateauY = 0.4 + cliffHeight;
  const terraceGeo = new THREE.BoxGeometry(baseSize * 1.22, 0.5, baseSize * 1.15);
  const terrace = new THREE.Mesh(terraceGeo, whiteMarbleMaterial);
  terrace.position.y = plateauY;
  terrace.receiveShadow = true;
  group.add(terrace);

  // --------------------------------------------------------------------------
  // 2. FORTRESS DEFENSIVE PERIMETER WALLS & CORNER TOWERS
  // --------------------------------------------------------------------------
  const wallH = 1.6 + visualLevel * 0.12;
  const halfW = (baseSize * 1.22) / 2 - 0.4;
  const halfD = (baseSize * 1.15) / 2 - 0.4;

  if (visualLevel >= 2) {
    // Perimeter crenellated curtain walls
    const wallThick = 0.45;
    // Back wall
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(baseSize * 1.18, wallH, wallThick),
      whiteMarbleMaterial
    );
    backWall.position.set(0, plateauY + wallH / 2, -halfD);
    group.add(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThick, wallH, baseSize * 1.1),
      whiteMarbleMaterial
    );
    leftWall.position.set(-halfW, plateauY + wallH / 2, 0);
    group.add(leftWall);

    // Right wall (shortened to let pool and cliff waterfall open out to the sea)
    const rightWallLen = visualLevel >= 4 ? baseSize * 0.55 : baseSize * 1.1;
    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThick, wallH, rightWallLen),
      whiteMarbleMaterial
    );
    rightWall.position.set(halfW, plateauY + wallH / 2, -halfD + rightWallLen / 2);
    group.add(rightWall);

    // Front wall with grand portal opening
    const frontWallLeft = new THREE.Mesh(
      new THREE.BoxGeometry(halfW - 1.6, wallH, wallThick),
      whiteMarbleMaterial
    );
    frontWallLeft.position.set(-halfW / 2 - 0.8, plateauY + wallH / 2, halfD);
    group.add(frontWallLeft);

    const frontWallRight = new THREE.Mesh(
      new THREE.BoxGeometry(halfW - 1.6, wallH, wallThick),
      whiteMarbleMaterial
    );
    frontWallRight.position.set(halfW / 2 + 0.8, plateauY + wallH / 2, halfD);
    group.add(frontWallRight);

    // Wall gold trim coping
    const copingBack = new THREE.Mesh(
      new THREE.BoxGeometry(baseSize * 1.2, 0.15, wallThick + 0.12),
      goldDomeMaterial
    );
    copingBack.position.set(0, plateauY + wallH + 0.08, -halfD);
    group.add(copingBack);
  }

  // Corner Defensive Towers with Golden Domes
  const towerPositions: [number, number][] = [];
  if (visualLevel === 1) {
    // Level 1 has only one square tower on the right
    towerPositions.push([halfW - 1.8, -halfD + 1.8]);
  } else if (visualLevel >= 2) {
    // 2-4 corner towers
    towerPositions.push([-halfW + 0.6, -halfD + 0.6]);
    towerPositions.push([halfW - 0.6, -halfD + 0.6]);
    towerPositions.push([-halfW + 0.6, halfD - 0.6]);
    if (visualLevel >= 4) {
      towerPositions.push([halfW - 0.6, halfD - 0.6]);
    }
  }

  towerPositions.forEach(([tx, tz]) => {
    const towerH = wallH + 2.2 + (visualLevel >= 6 ? 0.6 : 0);
    const towerR = 0.95 + (visualLevel >= 5 ? 0.15 : 0);

    // Round fortified tower shaft
    const towerGeo = new THREE.CylinderGeometry(towerR * 0.92, towerR, towerH, 16);
    const towerMesh = new THREE.Mesh(towerGeo, whiteMarbleMaterial);
    towerMesh.position.set(tx, plateauY + towerH / 2, tz);
    towerMesh.castShadow = !isSoftwareGl;
    group.add(towerMesh);

    // Tower upper balcony crenellations
    const balconyGeo = new THREE.CylinderGeometry(towerR * 1.15, towerR * 1.05, 0.4, 16);
    const balconyMesh = new THREE.Mesh(balconyGeo, whiteMarbleMaterial);
    balconyMesh.position.set(tx, plateauY + towerH + 0.2, tz);
    group.add(balconyMesh);

    // Golden Tower Dome
    const domeGeo = new THREE.SphereGeometry(towerR * 1.05, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMesh = new THREE.Mesh(domeGeo, goldDomeMaterial);
    domeMesh.position.set(tx, plateauY + towerH + 0.4, tz);
    group.add(domeMesh);

    // Crescent Finial on top
    const finialGeo = new THREE.ConeGeometry(0.12, 0.5, 8);
    const finial = new THREE.Mesh(finialGeo, goldDomeMaterial);
    finial.position.set(tx, plateauY + towerH + 0.4 + towerR * 1.05 + 0.25, tz);
    group.add(finial);

    const crescentGeo = new THREE.TorusGeometry(0.18, 0.04, 6, 12, Math.PI * 1.4);
    const crescent = new THREE.Mesh(crescentGeo, goldDomeMaterial);
    crescent.position.set(tx, plateauY + towerH + 0.4 + towerR * 1.05 + 0.55, tz);
    crescent.rotation.z = Math.PI / 4;
    group.add(crescent);
  });

  // --------------------------------------------------------------------------
  // 3. MAIN NEOCLASSICAL ALLIANCE PALACE RESIDENCE
  // --------------------------------------------------------------------------
  const palaceW = 7.5 + (visualLevel >= 3 ? visualLevel * 0.35 : 0);
  const palaceD = 4.8 + (visualLevel >= 4 ? 1.2 : 0);
  const palaceH = 4.2 + (visualLevel >= 5 ? 1.0 : 0);
  const palaceZ = -halfD + palaceD / 2 + 1.2;

  // Main palace building block
  const palaceGeo = new THREE.BoxGeometry(palaceW, palaceH, palaceD);
  const palace = new THREE.Mesh(palaceGeo, whiteMarbleMaterial);
  palace.position.set(0, plateauY + palaceH / 2 + 0.25, palaceZ);
  palace.castShadow = !isSoftwareGl;
  group.add(palace);

  // Palace roof cornice & balustrade
  const corniceGeo = new THREE.BoxGeometry(palaceW + 0.5, 0.35, palaceD + 0.5);
  const cornice = new THREE.Mesh(corniceGeo, goldDomeMaterial);
  cornice.position.set(0, plateauY + palaceH + 0.42, palaceZ);
  group.add(cornice);

  // Arched Windows & Balconies across front facade
  const windowCount = visualLevel >= 4 ? 7 : 5;
  const winSpacing = (palaceW - 1.8) / (windowCount - 1);
  for (let w = 0; w < windowCount; w++) {
    const wx = -((palaceW - 1.8) / 2) + w * winSpacing;
    // Lower floor arched window
    const winGeo = new THREE.BoxGeometry(0.55, 1.2, 0.1);
    const winMesh = new THREE.Mesh(winGeo, palette.litGlassNight);
    winMesh.position.set(wx, plateauY + 1.2, palaceZ + palaceD / 2 + 0.06);
    group.add(winMesh);

    // Gold arch trim
    const archTrimGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 8, 1, false, 0, Math.PI);
    const archTrim = new THREE.Mesh(archTrimGeo, goldDomeMaterial);
    archTrim.rotation.z = -Math.PI / 2;
    archTrim.position.set(wx, plateauY + 1.8, palaceZ + palaceD / 2 + 0.06);
    group.add(archTrim);

    // Upper floor balcony and window
    if (palaceH > 3.8) {
      const upWin = new THREE.Mesh(winGeo, palette.litGlassNight);
      upWin.position.set(wx, plateauY + 3.0, palaceZ + palaceD / 2 + 0.06);
      group.add(upWin);

      const balcGeo = new THREE.BoxGeometry(0.7, 0.35, 0.25);
      const balc = new THREE.Mesh(balcGeo, goldDomeMaterial);
      balc.position.set(wx, plateauY + 2.3, palaceZ + palaceD / 2 + 0.18);
      group.add(balc);
    }
  }

  // Grand Arched Central Entrance Portal
  const portalW = 2.4;
  const portalH = 2.8;
  const portalFrame = new THREE.Mesh(
    new THREE.BoxGeometry(portalW, portalH, 0.4),
    whiteMarbleMaterial
  );
  portalFrame.position.set(0, plateauY + portalH / 2, palaceZ + palaceD / 2 + 0.2);
  group.add(portalFrame);

  const portalArch = new THREE.Mesh(
    new THREE.CylinderGeometry(portalW / 2, portalW / 2, 0.42, 16, 1, false, 0, Math.PI),
    goldDomeMaterial
  );
  portalArch.rotation.z = -Math.PI / 2;
  portalArch.position.set(0, plateauY + portalH, palaceZ + palaceD / 2 + 0.2);
  group.add(portalArch);

  // Flanking Neoclassical Entrance Columns
  [-1.4, 1.4].forEach((cx) => {
    const colGeo = new THREE.CylinderGeometry(0.2, 0.24, portalH + 0.6, 12);
    const col = new THREE.Mesh(colGeo, whiteMarbleMaterial);
    col.position.set(cx, plateauY + (portalH + 0.6) / 2, palaceZ + palaceD / 2 + 0.35);
    group.add(col);

    const colCap = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.18, 0.55), goldDomeMaterial);
    colCap.position.set(cx, plateauY + portalH + 0.6, palaceZ + palaceD / 2 + 0.35);
    group.add(colCap);
  });

  // --------------------------------------------------------------------------
  // 4. GOLDEN DOMES (SIGNATURE FEATURE FROM USER PHOTOS)
  // --------------------------------------------------------------------------
  // A. Central Grand Golden Dome
  const centerDomeR = 1.6 + visualLevel * 0.18;
  const domeBaseH = 0.8;

  // Drum base under dome
  const drumGeo = new THREE.CylinderGeometry(centerDomeR * 0.95, centerDomeR, domeBaseH, 24);
  const drum = new THREE.Mesh(drumGeo, whiteMarbleMaterial);
  drum.position.set(0, plateauY + palaceH + 0.42 + domeBaseH / 2, palaceZ);
  group.add(drum);

  // Grand Gold Bulbous Dome
  const grandDomeGeo = new THREE.SphereGeometry(
    centerDomeR,
    24,
    18,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.58
  );
  const grandDome = new THREE.Mesh(grandDomeGeo, goldDomeMaterial);
  grandDome.position.set(0, plateauY + palaceH + 0.42 + domeBaseH, palaceZ);
  group.add(grandDome);

  // Grand Golden Spire & Islamic Crescent Finial
  const spireGeo = new THREE.ConeGeometry(0.22, 1.1, 10);
  const spire = new THREE.Mesh(spireGeo, goldDomeMaterial);
  spire.position.set(0, plateauY + palaceH + 0.42 + domeBaseH + centerDomeR + 0.55, palaceZ);
  group.add(spire);

  const grandCrescentGeo = new THREE.TorusGeometry(0.42, 0.07, 8, 16, Math.PI * 1.45);
  const grandCrescent = new THREE.Mesh(grandCrescentGeo, goldDomeMaterial);
  grandCrescent.position.set(
    0,
    plateauY + palaceH + 0.42 + domeBaseH + centerDomeR + 1.25,
    palaceZ
  );
  grandCrescent.rotation.z = Math.PI / 4;
  group.add(grandCrescent);

  // B. Secondary Golden Domes across the palace wings
  if (visualLevel >= 3) {
    const sideDomeOffsets: number[] = [-palaceW / 2 + 1.2, palaceW / 2 - 1.2];
    if (visualLevel >= 5) {
      sideDomeOffsets.push(-palaceW / 4, palaceW / 4);
    }
    sideDomeOffsets.forEach((dx) => {
      const sR = 0.9 + (visualLevel >= 6 ? 0.15 : 0);
      const sDome = new THREE.Mesh(
        new THREE.SphereGeometry(sR, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        goldDomeMaterial
      );
      sDome.position.set(dx, plateauY + palaceH + 0.42, palaceZ);
      group.add(sDome);

      const sFinial = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.45, 8), goldDomeMaterial);
      sFinial.position.set(dx, plateauY + palaceH + 0.42 + sR + 0.22, palaceZ);
      group.add(sFinial);
    });
  }

  // --------------------------------------------------------------------------
  // 5. EXTENDED PALACE WINGS (LEVEL 4+)
  // --------------------------------------------------------------------------
  if (visualLevel >= 4) {
    const wingLen = 4.2 + (visualLevel >= 6 ? 1.4 : 0);
    const wingW = 2.2;
    const wingH = palaceH * 0.85;

    // Left Wing extending forward
    const leftWing = new THREE.Mesh(
      new THREE.BoxGeometry(wingW, wingH, wingLen),
      whiteMarbleMaterial
    );
    leftWing.position.set(-palaceW / 2 + wingW / 2, plateauY + wingH / 2, palaceZ + palaceD / 2 + wingLen / 2);
    leftWing.castShadow = !isSoftwareGl;
    group.add(leftWing);

    // Left Wing Front Pavillion with Gold Dome
    const leftPavDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.85, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      goldDomeMaterial
    );
    leftPavDome.position.set(
      -palaceW / 2 + wingW / 2,
      plateauY + wingH + 0.1,
      palaceZ + palaceD / 2 + wingLen - 0.5
    );
    group.add(leftPavDome);

    // Right Wing
    const rightWing = new THREE.Mesh(
      new THREE.BoxGeometry(wingW, wingH, wingLen * 0.75),
      whiteMarbleMaterial
    );
    rightWing.position.set(
      palaceW / 2 - wingW / 2,
      plateauY + wingH / 2,
      palaceZ + palaceD / 2 + (wingLen * 0.75) / 2
    );
    group.add(rightWing);
  }

  // --------------------------------------------------------------------------
  // 6. COURTYARD MOSAIC & ROYAL ALLIANCE SEAL FLOOR
  // --------------------------------------------------------------------------
  const courtyardMosaicSize = 4.8 + (visualLevel >= 5 ? 1.2 : 0);
  const mosaicTex = getOrCreateCourtyardTexture(visualLevel);
  const mosaicMat = new THREE.MeshStandardMaterial({
    map: mosaicTex,
    roughness: 0.35,
    metalness: 0.15,
  });

  const courtyardMosaic = new THREE.Mesh(
    new THREE.PlaneGeometry(courtyardMosaicSize, courtyardMosaicSize),
    mosaicMat
  );
  courtyardMosaic.rotation.x = -Math.PI / 2;
  courtyardMosaic.position.set(0, plateauY + 0.26, palaceZ + palaceD / 2 + 2.8);
  group.add(courtyardMosaic);

  // Central Fountain in Courtyard (Levels 5-8)
  if (visualLevel >= 5) {
    const fZ = palaceZ + palaceD / 2 + 2.8;
    const fBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.95, 0.35, 16),
      whiteMarbleMaterial
    );
    fBase.position.set(0, plateauY + 0.4, fZ);
    group.add(fBase);

    const fWater = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.05, 16), poolMaterial);
    fWater.position.set(0, plateauY + 0.52, fZ);
    group.add(fWater);

    const fTier = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.45, 0.45, 12),
      goldDomeMaterial
    );
    fTier.position.set(0, plateauY + 0.75, fZ);
    group.add(fTier);

    const fSpray = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.65, 8), palette.neonCyan);
    fSpray.position.set(0, plateauY + 1.15, fZ);
    group.add(fSpray);
  }

  // --------------------------------------------------------------------------
  // 7. LUXURY SWIMMING POOL & CLIFFSIDE CASCADING WATERFALL
  // --------------------------------------------------------------------------
  const poolW = 3.8 + (visualLevel >= 4 ? 1.6 : 0);
  const poolL = 2.4 + (visualLevel >= 4 ? 1.0 : 0);
  // Positioned on the right cliff edge overlooking the sea
  const poolX = halfW - poolW / 2 - 0.4;
  const poolZ = halfD - poolL / 2 - 0.8;

  // Pool Basin & Azure Water
  const poolWaterGeo = new THREE.BoxGeometry(poolW, 0.15, poolL);
  const poolWater = new THREE.Mesh(poolWaterGeo, poolMaterial);
  poolWater.position.set(poolX, plateauY + 0.22, poolZ);
  group.add(poolWater);

  // Pool deck coping border
  const poolBorderGeo = new THREE.BoxGeometry(poolW + 0.4, 0.28, poolL + 0.4);
  const poolBorder = new THREE.Mesh(poolBorderGeo, whiteMarbleMaterial);
  poolBorder.position.set(poolX, plateauY + 0.1, poolZ);
  group.add(poolBorder);

  // Cantilevered Glass Rim (Levels 4-8)
  if (visualLevel >= 4) {
    const glassRailGeo = new THREE.BoxGeometry(0.12, 0.65, poolL);
    const glassRail = new THREE.Mesh(glassRailGeo, glassMaterial);
    glassRail.position.set(halfW - 0.25, plateauY + 0.55, poolZ);
    group.add(glassRail);

    // Gold handrail cap
    const handrailGeo = new THREE.BoxGeometry(0.18, 0.08, poolL);
    const handrail = new THREE.Mesh(handrailGeo, goldDomeMaterial);
    handrail.position.set(halfW - 0.25, plateauY + 0.9, poolZ);
    group.add(handrail);
  }

  // Cascading Waterfall cascading down the rock cliff (Levels 4-8)
  if (visualLevel >= 4) {
    const wfW = poolL * 0.92;
    const wfH = cliffHeight + 0.3;
    const wfGeo = new THREE.BoxGeometry(0.3, wfH, wfW);
    const wfMesh = new THREE.Mesh(wfGeo, seaWaterMaterial);
    wfMesh.position.set(halfW + 0.1, 0.4 + wfH / 2, poolZ);
    group.add(wfMesh);

    // Cascading white water foam curtains
    const foamCurtainGeo = new THREE.BoxGeometry(0.1, wfH * 0.9, wfW * 0.85);
    const foamCurtain = new THREE.Mesh(foamCurtainGeo, seaFoamMaterial);
    foamCurtain.position.set(halfW + 0.25, 0.4 + wfH / 2, poolZ);
    group.add(foamCurtain);

    // Bottom splash ring at sea surface
    const splashGeo = new THREE.RingGeometry(wfW * 0.45, wfW * 0.75, 16);
    const splashMesh = new THREE.Mesh(splashGeo, seaFoamMaterial);
    splashMesh.rotation.x = -Math.PI / 2;
    splashMesh.position.set(halfW + 0.5, 0.42, poolZ);
    group.add(splashMesh);
  }

  // Poolside Sun Loungers & Parasols
  const loungerCount = visualLevel >= 3 ? 4 : 2;
  for (let li = 0; li < loungerCount; li++) {
    const lx = poolX - poolW / 2 + 0.6 + li * 0.85;
    const lz = poolZ - poolL / 2 - 0.45;
    const lounger = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.14, 0.75),
      whiteMarbleMaterial
    );
    lounger.position.set(lx, plateauY + 0.3, lz);
    group.add(lounger);

    // Umbrella
    if (li % 2 === 0) {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8),
        goldDomeMaterial
      );
      pole.position.set(lx - 0.3, plateauY + 0.8, lz);
      group.add(pole);

      const canopy = new THREE.Mesh(
        new THREE.ConeGeometry(0.55, 0.25, 10),
        whiteMarbleMaterial
      );
      canopy.position.set(lx - 0.3, plateauY + 1.45, lz);
      group.add(canopy);
    }
  }

  // --------------------------------------------------------------------------
  // 8. WOODEN PIER, MARINA & YACHTS / BOATS
  // --------------------------------------------------------------------------
  // Wooden pier extending into the sea at the bottom right cliff
  const pierLen = 4.5 + visualLevel * 0.35;
  const pierW = 1.6;
  const pierX = halfW + 1.8;
  const pierZ = halfD - 0.5;

  const pierDeck = new THREE.Mesh(
    new THREE.BoxGeometry(pierW, 0.2, pierLen),
    woodDeckMaterial
  );
  pierDeck.position.set(pierX, 0.55, pierZ);
  group.add(pierDeck);

  // Pier vertical wooden pilings into the seabed
  [-0.65, 0.65].forEach((px) => {
    [-pierLen / 3, 0, pierLen / 3].forEach((pz) => {
      const pile = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8),
        woodDeckMaterial
      );
      pile.position.set(pierX + px, 0.2, pierZ + pz);
      group.add(pile);
    });
  });

  // Stone steps from cliff plateau down to the pier
  const stepsCount = 6;
  for (let s = 0; s < stepsCount; s++) {
    const stepMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.3, 0.6),
      whiteMarbleMaterial
    );
    const tRatio = s / (stepsCount - 1);
    stepMesh.position.set(
      halfW - 0.3 + tRatio * 1.5,
      plateauY - tRatio * (plateauY - 0.6),
      pierZ - pierLen / 2 + s * 0.45
    );
    group.add(stepMesh);
  }

  // Boats & Yachts moored at pier:
  if (visualLevel === 1) {
    // Level 1: Motor launch & Sailboat
    const sailBoat = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.35, 1.8),
      whiteMarbleMaterial
    );
    sailBoat.position.set(pierX + 1.2, 0.45, pierZ + 0.5);
    group.add(sailBoat);

    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 2.2, 8), goldDomeMaterial);
    mast.position.set(pierX + 1.2, 1.45, pierZ + 0.5);
    group.add(mast);
  } else {
    // Level 2+: Speedboat
    const speedBoat = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.3, 1.6),
      new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.3 })
    );
    speedBoat.position.set(pierX - 1.2, 0.45, pierZ + 0.8);
    group.add(speedBoat);

    // Luxury Motor Yacht (Levels 4-8)
    if (visualLevel >= 4) {
      const yachtLen = 3.6 + (visualLevel >= 7 ? 1.4 : 0);
      const yachtW = 1.1;
      const yachtH = 0.55;
      const yachtZ = pierZ - 0.2;
      const yachtX = pierX + 1.6;

      // Hull
      const yachtHull = new THREE.Mesh(
        new THREE.BoxGeometry(yachtW, yachtH, yachtLen),
        whiteMarbleMaterial
      );
      yachtHull.position.set(yachtX, 0.55, yachtZ);
      group.add(yachtHull);

      // Cabin superstructure with dark glass
      const yachtCabin = new THREE.Mesh(
        new THREE.BoxGeometry(yachtW * 0.75, 0.45, yachtLen * 0.55),
        whiteMarbleMaterial
      );
      yachtCabin.position.set(yachtX, 0.95, yachtZ - 0.2);
      group.add(yachtCabin);

      const yachtGlass = new THREE.Mesh(
        new THREE.BoxGeometry(yachtW * 0.78, 0.25, yachtLen * 0.45),
        glassMaterial
      );
      yachtGlass.position.set(yachtX, 0.95, yachtZ - 0.2);
      group.add(yachtGlass);

      // Radar Arch & Twin Satellite Domes
      const radarArch = new THREE.Mesh(
        new THREE.BoxGeometry(yachtW * 0.7, 0.3, 0.1),
        whiteMarbleMaterial
      );
      radarArch.position.set(yachtX, 1.35, yachtZ - yachtLen * 0.2);
      group.add(radarArch);

      [-0.22, 0.22].forEach((sx) => {
        const satDome = new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 8, 8),
          goldDomeMaterial
        );
        satDome.position.set(yachtX + sx, 1.55, yachtZ - yachtLen * 0.2);
        group.add(satDome);
      });
    }
  }

  // --------------------------------------------------------------------------
  // 9. ROOFTOP HELIPAD & EXECUTIVE HELICOPTER (LEVELS 2-8)
  // --------------------------------------------------------------------------
  if (visualLevel >= 2) {
    const heliR = 1.5;
    // Positioned on the left upper roof terrace
    const heliX = -halfW + 2.2;
    const heliZ = -halfD + 2.2;
    const heliY = plateauY + palaceH * 0.75;

    // Helipad circular slab
    const heliPadGeo = new THREE.CylinderGeometry(heliR, heliR, 0.12, 24);
    const heliPadMesh = new THREE.Mesh(heliPadGeo, palette.asphalt);
    heliPadMesh.position.set(heliX, heliY, heliZ);
    group.add(heliPadMesh);

    // Helipad Yellow / Gold Outer Ring
    const heliRingGeo = new THREE.RingGeometry(heliR * 0.85, heliR * 0.95, 24);
    const heliRing = new THREE.Mesh(heliRingGeo, goldDomeMaterial);
    heliRing.rotation.x = -Math.PI / 2;
    heliRing.position.set(heliX, heliY + 0.08, heliZ);
    group.add(heliRing);

    // "H" Marking
    const hBar1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.8), goldDomeMaterial);
    hBar1.position.set(heliX - 0.25, heliY + 0.08, heliZ);
    group.add(hBar1);
    const hBar2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.8), goldDomeMaterial);
    hBar2.position.set(heliX + 0.25, heliY + 0.08, heliZ);
    group.add(hBar2);
    const hCross = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.12), goldDomeMaterial);
    hCross.position.set(heliX, heliY + 0.08, heliZ);
    group.add(hCross);

    // Tactical Executive Helicopter parked on helipad
    const heliBodyMat = new THREE.MeshStandardMaterial({
      color: '#1e293b',
      roughness: 0.4,
      metalness: 0.6,
    });

    const heliFuselage = new THREE.Mesh(
      new THREE.SphereGeometry(0.48, 12, 10),
      heliBodyMat
    );
    heliFuselage.scale.set(0.7, 0.65, 1.4);
    heliFuselage.position.set(heliX, heliY + 0.45, heliZ);
    group.add(heliFuselage);

    // Cockpit windshield
    const heliCockpit = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 10, 8),
      palette.litGlassNight
    );
    heliCockpit.scale.set(0.68, 0.55, 0.7);
    heliCockpit.position.set(heliX, heliY + 0.48, heliZ + 0.4);
    group.add(heliCockpit);

    // Tail Boom
    const tailBoom = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.14, 1.2, 8),
      heliBodyMat
    );
    tailBoom.rotation.x = Math.PI / 2;
    tailBoom.position.set(heliX, heliY + 0.48, heliZ - 0.9);
    group.add(tailBoom);

    // Main Rotor Blades (can rotate)
    const rotorShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.25, 8),
      palette.industrialSteel
    );
    rotorShaft.position.set(heliX, heliY + 0.8, heliZ);
    group.add(rotorShaft);

    const rotorBlades = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 0.02, 0.12),
      goldDomeMaterial
    );
    rotorBlades.position.set(heliX, heliY + 0.92, heliZ);
    rotorBlades.name = 'cartelHelicopterRotor';
    group.add(rotorBlades);

    // Helicopter Landing Skids
    [-0.32, 0.32].forEach((sx) => {
      const skid = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.04, 1.1),
        palette.industrialSteel
      );
      skid.position.set(heliX + sx, heliY + 0.15, heliZ);
      group.add(skid);
    });
  }

  // --------------------------------------------------------------------------
  // 10. LUXURY VEHICLES AT ENTRANCE GATE (LEVELS 3-8)
  // --------------------------------------------------------------------------
  if (visualLevel >= 3) {
    // Black Executive SUV parked near front gate
    const suvX = -1.2;
    const suvZ = halfD + 0.6;
    const suvY = plateauY + 0.32;

    const suvBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.48, 1.6),
      new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.2, metalness: 0.7 })
    );
    suvBody.position.set(suvX, suvY, suvZ);
    group.add(suvBody);

    const suvRoof = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.35, 0.95),
      new THREE.MeshStandardMaterial({ color: '#020617', roughness: 0.2 })
    );
    suvRoof.position.set(suvX, suvY + 0.36, suvZ - 0.15);
    group.add(suvRoof);

    // Gold Supercar alongside (Levels 4-8)
    if (visualLevel >= 4) {
      const carX = -2.4;
      const carZ = halfD + 0.55;
      const carBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.3, 1.5),
        new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.15, metalness: 0.85 })
      );
      carBody.position.set(carX, plateauY + 0.25, carZ);
      group.add(carBody);

      const carCabin = new THREE.Mesh(
        new THREE.BoxGeometry(0.68, 0.22, 0.75),
        new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.1 })
      );
      carCabin.position.set(carX, plateauY + 0.45, carZ - 0.1);
      group.add(carCabin);
    }
  }

  // --------------------------------------------------------------------------
  // 11. LANDSCAPING: DATE PALMS, CYPRESSES & TOPIARY GARDENS
  // --------------------------------------------------------------------------
  const treePositions: [number, number, 'palm' | 'cypress' | 'hedge'][] = [
    [-halfW + 1.2, halfD - 1.2, 'palm'],
    [-halfW + 1.2, halfD - 3.2, 'palm'],
    [-halfW + 2.4, halfD - 1.2, 'cypress'],
    [halfW - 1.4, -halfD + 3.8, 'palm'],
    [halfW - 2.8, -halfD + 3.8, 'cypress'],
  ];

  if (visualLevel >= 5) {
    treePositions.push([0, -halfD + 1.2, 'palm']);
    treePositions.push([-halfW + 1.5, 0, 'palm']);
    treePositions.push([halfW - 1.5, 0, 'cypress']);
  }

  treePositions.forEach(([tx, tz, type]) => {
    if (type === 'palm') {
      // Curved trunk
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.18, 1.8, 8),
        palette.treeTrunk
      );
      trunk.position.set(tx, plateauY + 0.9, tz);
      trunk.rotation.z = (Math.random() - 0.5) * 0.15;
      group.add(trunk);

      // Palm frond crown
      const frondGeo = new THREE.ConeGeometry(1.1, 0.45, 8);
      const fronds = new THREE.Mesh(frondGeo, palette.foliageGreen);
      fronds.position.set(tx, plateauY + 1.85, tz);
      group.add(fronds);
    } else if (type === 'cypress') {
      const cTrunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 0.4, 6),
        palette.treeTrunk
      );
      cTrunk.position.set(tx, plateauY + 0.2, tz);
      group.add(cTrunk);

      const cFoliage = new THREE.Mesh(
        new THREE.ConeGeometry(0.45, 1.8, 8),
        palette.foliageDarkGreen
      );
      cFoliage.position.set(tx, plateauY + 1.2, tz);
      group.add(cFoliage);
    }
  });

  // Topiary Boxwood Hedges in Courtyard
  const hedgePositions = [
    [-2.2, palaceZ + palaceD / 2 + 1.2],
    [2.2, palaceZ + palaceD / 2 + 1.2],
    [-2.2, palaceZ + palaceD / 2 + 4.2],
    [2.2, palaceZ + palaceD / 2 + 4.2],
  ];
  hedgePositions.forEach(([hx, hz]) => {
    const hedge = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.4, 0.4),
      palette.foliageGreen
    );
    hedge.position.set(hx, plateauY + 0.45, hz);
    group.add(hedge);
  });

  // --------------------------------------------------------------------------
  // 12. PERIPHERAL GUEST VILLAS ON CLIFF (LEVELS 5-8)
  // --------------------------------------------------------------------------
  if (visualLevel >= 5) {
    const villaPositions: [number, number][] = [
      [halfW - 1.2, -halfD + 1.6],
      [halfW - 2.8, -halfD + 1.4],
      [-halfW + 1.4, -halfD + 1.6],
    ];
    villaPositions.forEach(([vx, vz]) => {
      const vGeo = new THREE.BoxGeometry(1.6, 1.2, 1.4);
      const vMesh = new THREE.Mesh(vGeo, whiteMarbleMaterial);
      vMesh.position.set(vx, plateauY + 0.6, vz);
      group.add(vMesh);

      // Golden pyramid roof
      const vRoof = new THREE.Mesh(
        new THREE.ConeGeometry(1.2, 0.6, 4),
        goldDomeMaterial
      );
      vRoof.rotation.y = Math.PI / 4;
      vRoof.position.set(vx, plateauY + 1.5, vz);
      group.add(vRoof);
    });
  }

  // --------------------------------------------------------------------------
  // 13. NIGHT MODE LIGHTING / GLOWING ACCENTS
  // --------------------------------------------------------------------------
  const beacon1 = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), palette.neonGold);
  beacon1.position.set(0, plateauY + palaceH + centerDomeR + 2.2, palaceZ);
  group.add(beacon1);

  return group;
}
