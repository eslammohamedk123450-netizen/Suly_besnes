/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * خريطة جمهورية مصر العربية ثلاثية الأبعاد - لعبة إمبراطورية الأعمال
 * تشمل نهر النيل، فرعي رشيد ودمياط، الدلتا الخصبة، البحر المتوسط، قناة السويس، والبحر الأحمر
 */

import * as THREE from 'three';

export interface EgyptCityBeacon {
  nameAr: string;
  pos: [number, number, number];
  color: number;
}

export const EGYPT_CITY_BEACONS: EgyptCityBeacon[] = [
  { nameAr: 'القاهرة الكبرى والعاصمة الإدارية', pos: [0, 0.22, 10], color: 0xf59e0b },
  { nameAr: 'الإسكندرية والساحل الشمالي', pos: [-40, 0.22, 68], color: 0x0284c7 },
  { nameAr: 'بورسعيد ومدخل القناة الشمالي', pos: [36, 0.22, 70], color: 0x3b82f6 },
  { nameAr: 'السويس والمدخل الجنوبي', pos: [42, 0.22, 10], color: 0x06b6d4 },
  { nameAr: 'دمياط ورأس البر', pos: [14, 0.22, 70], color: 0x10b981 },
  { nameAr: 'المحلة الكبرى والدلتا', pos: [4, 0.22, 46], color: 0xc026d3 },
  { nameAr: 'أسوان وبحيرة ناصر', pos: [18, 0.22, -88], color: 0xea580c },
  { nameAr: 'شرم الشيخ وجنوب سيناء', pos: [68, 0.22, -18], color: 0x8b5cf6 },
];

export function buildEgyptGeography(scene: THREE.Scene, isNightMode: boolean): THREE.Group {
  const egyptGroup = new THREE.Group();
  egyptGroup.name = 'egypt_geography_layer';

  // 1. Mediterranean Sea (البحر الأبيض المتوسط في الشمال)
  const seaGeo = new THREE.PlaneGeometry(360, 80);
  const seaMat = new THREE.MeshStandardMaterial({
    color: isNightMode ? 0x03224c : 0x0284c7,
    roughness: 0.1,
    metalness: 0.8,
  });
  const seaMesh = new THREE.Mesh(seaGeo, seaMat);
  seaMesh.rotation.x = -Math.PI / 2;
  seaMesh.position.set(0, 0.15, 110);
  egyptGroup.add(seaMesh);

  // 2. The Green Nile Delta (مثلث الدلتا الخصيب)
  const deltaShape = new THREE.Shape();
  deltaShape.moveTo(0, 10);
  deltaShape.lineTo(-44, 73);
  deltaShape.lineTo(34, 73);
  deltaShape.closePath();

  const deltaGeo = new THREE.ShapeGeometry(deltaShape);
  const deltaMat = new THREE.MeshStandardMaterial({
    color: isNightMode ? 0x064e3b : 0x047857,
    roughness: 0.8,
  });
  const deltaMesh = new THREE.Mesh(deltaGeo, deltaMat);
  deltaMesh.rotation.x = -Math.PI / 2;
  deltaMesh.position.y = 0.08;
  egyptGroup.add(deltaMesh);

  // 3. The River Nile (مجرى نهر النيل الرئيسي من الجنوب للشمال)
  const waterMat = new THREE.MeshStandardMaterial({
    color: isNightMode ? 0x38bdf8 : 0x0ea5e9,
    roughness: 0.1,
    metalness: 0.7,
    emissive: isNightMode ? 0x0284c7 : 0x0369a1,
    emissiveIntensity: isNightMode ? 0.35 : 0.1,
  });

  const nileCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(18, 0.18, -95),  // Lake Nasser & Aswan
    new THREE.Vector3(16, 0.18, -75),  // Kom Ombo
    new THREE.Vector3(14, 0.18, -50),  // Qena & Luxor
    new THREE.Vector3(8, 0.18, -35),   // Sohag & Asyut
    new THREE.Vector3(4, 0.18, -10),   // Minya & Beni Suef
    new THREE.Vector3(0, 0.18, 10),    // Cairo & Giza
  ]);
  const nileTube = new THREE.TubeGeometry(nileCurve, 32, 1.5, 8, false);
  const nileMesh = new THREE.Mesh(nileTube, waterMat);
  egyptGroup.add(nileMesh);

  // Rosetta Branch (فرع رشيد)
  const rosettaCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.18, 10),
    new THREE.Vector3(-14, 0.18, 42),
    new THREE.Vector3(-38, 0.18, 73),
  ]);
  const rosettaTube = new THREE.TubeGeometry(rosettaCurve, 20, 1.1, 8, false);
  const rosettaMesh = new THREE.Mesh(rosettaTube, waterMat);
  egyptGroup.add(rosettaMesh);

  // Damietta Branch (فرع دمياط)
  const damiettaCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.18, 10),
    new THREE.Vector3(8, 0.18, 45),
    new THREE.Vector3(16, 0.18, 73),
  ]);
  const damiettaTube = new THREE.TubeGeometry(damiettaCurve, 20, 1.1, 8, false);
  const damiettaMesh = new THREE.Mesh(damiettaTube, waterMat);
  egyptGroup.add(damiettaMesh);

  // 4. Gulf of Suez & Suez Canal (خليج السويس وقناة السويس)
  const gulfCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(56, 0.18, -60),
    new THREE.Vector3(48, 0.18, -25),
    new THREE.Vector3(42, 0.18, 8),   // Suez City
  ]);
  const gulfTube = new THREE.TubeGeometry(gulfCurve, 24, 2.8, 8, false);
  const gulfMesh = new THREE.Mesh(gulfTube, waterMat);
  egyptGroup.add(gulfMesh);

  // Suez Canal (قناة السويس الملاحية)
  const canalCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(42, 0.18, 8),    // Suez
    new THREE.Vector3(38, 0.18, 30),   // Ismailia & Bitter Lakes
    new THREE.Vector3(36, 0.18, 72),   // Port Said
  ]);
  const canalTube = new THREE.TubeGeometry(canalCurve, 24, 1.6, 8, false);
  const canalMesh = new THREE.Mesh(canalTube, waterMat);
  egyptGroup.add(canalMesh);

  // 5. City Landmark Beacons
  EGYPT_CITY_BEACONS.forEach((beacon) => {
    const ringGeo = new THREE.RingGeometry(2.2, 2.9, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: beacon.color,
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.set(beacon.pos[0], 0.22, beacon.pos[2]);
    egyptGroup.add(ringMesh);

    const pillarGeo = new THREE.CylinderGeometry(0.18, 0.18, 7, 8);
    const pillarMat = new THREE.MeshBasicMaterial({
      color: beacon.color,
      transparent: true,
      opacity: isNightMode ? 0.6 : 0.35,
    });
    const pillarMesh = new THREE.Mesh(pillarGeo, pillarMat);
    pillarMesh.position.set(beacon.pos[0], 3.5, beacon.pos[2]);
    egyptGroup.add(pillarMesh);
  });

  scene.add(egyptGroup);
  return egyptGroup;
}
