/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import type { CityMaterialPalette } from './cityMaterials';

/**
 * Creates high-performance rubber tire with alloy rims
 */
function createSportWheel(
  palette: CityMaterialPalette,
  radius = 0.28,
  width = 0.22,
  rimMat: THREE.Material = palette.chromeMetal
): THREE.Group {
  const group = new THREE.Group();

  // Rubber tire
  const tireGeo = new THREE.CylinderGeometry(radius, radius, width, 14);
  const tire = new THREE.Mesh(tireGeo, palette.tireRubber);
  tire.rotation.z = Math.PI / 2;
  group.add(tire);

  // Rim face with spokes
  const rimGeo = new THREE.CylinderGeometry(radius * 0.72, radius * 0.72, width + 0.02, 12);
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.rotation.z = Math.PI / 2;
  group.add(rim);

  // Center lock hub
  const hubGeo = new THREE.CylinderGeometry(radius * 0.24, radius * 0.24, width + 0.04, 8);
  const hub = new THREE.Mesh(hubGeo, palette.imperialGold);
  hub.rotation.z = Math.PI / 2;
  group.add(hub);

  // Sport brake disc & caliper behind rim
  const discGeo = new THREE.CylinderGeometry(radius * 0.58, radius * 0.58, 0.04, 10);
  const disc = new THREE.Mesh(discGeo, palette.industrialSteel);
  disc.rotation.z = Math.PI / 2;
  disc.position.x = 0.04;
  group.add(disc);

  const caliperGeo = new THREE.BoxGeometry(0.06, 0.16, 0.14);
  const caliper = new THREE.Mesh(caliperGeo, palette.ferrariRed);
  caliper.position.set(0.04, 0.1, 0);
  group.add(caliper);

  return group;
}

// ============================================================================
// 1. LAMBORGHINI SUPERCAR (Low-slung wedge, carbon splitter, Y-LEDs, wing)
// ============================================================================
export function buildLamborghiniSupercar(
  palette: CityMaterialPalette,
  isSoftwareGl: boolean,
  color: 'green' | 'orange' | 'black' = 'green'
): THREE.Group {
  const car = new THREE.Group();
  car.name = 'supercar_lamborghini';

  const bodyMat = color === 'green'
    ? palette.lamborghiniGreen
    : color === 'orange'
      ? palette.lamborghiniOrange
      : palette.carbonFiber;

  // 1. Ultra low-profile wedge chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.32, 3.6), bodyMat);
  chassis.position.y = 0.32;
  chassis.castShadow = !isSoftwareGl;
  car.add(chassis);

  // 2. Aggressive Front Hood & Air Extractor Vents
  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.16, 1.3), bodyMat);
  hood.position.set(0, 0.44, 1.05);
  car.add(hood);

  // Front Carbon Fiber Splitter
  const splitter = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.06, 0.45), palette.carbonFiber);
  splitter.position.set(0, 0.16, 1.82);
  splitter.castShadow = !isSoftwareGl;
  car.add(splitter);

  // Carbon Side Skirts with Aerodynamic Winglets
  [-0.85, 0.85].forEach((sx) => {
    const skirt = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 2.4), palette.carbonFiber);
    skirt.position.set(sx, 0.18, 0);
    car.add(skirt);
  });

  // 3. Low Hexagonal Fighter Jet Cockpit Canopy
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.42, 1.5), palette.carGlass);
  cabin.position.set(0, 0.68, -0.15);
  car.add(cabin);

  // Roof plate
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.05, 1.1), bodyMat);
  roof.position.set(0, 0.9, -0.2);
  car.add(roof);

  // 4. Side Intakes / Scissor Door Aerodynamic Channels
  [-0.82, 0.82].forEach((ix) => {
    const intake = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 0.7), palette.carbonFiber);
    intake.position.set(ix, 0.42, -0.4);
    car.add(intake);
  });

  // 5. Rear Mid-Engine Louvered Glass Deck & V12 Engine Bay
  const engineCover = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.14, 1.0), palette.blackObsidianGlass);
  engineCover.position.set(0, 0.54, -1.1);
  car.add(engineCover);

  // Illuminated Red Cylinder Heads underneath
  const engineHeads = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.08, 0.6), palette.ferrariRed);
  engineHeads.position.set(0, 0.5, -1.1);
  car.add(engineHeads);

  // 6. Massive Carbon GT Wing Spoiler on Dual Struts
  const wing = new THREE.Mesh(new THREE.BoxGeometry(1.76, 0.06, 0.4), palette.carbonFiber);
  wing.position.set(0, 0.95, -1.82);
  wing.castShadow = !isSoftwareGl;
  car.add(wing);

  [-0.45, 0.45].forEach((wx) => {
    const strut = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.35, 0.2), palette.carbonFiber);
    strut.position.set(wx, 0.78, -1.8);
    car.add(strut);
  });

  // 7. Aggressive Rear Diffuser & Center Hexagonal Quad Exhausts
  const diffuser = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.18, 0.3), palette.carbonFiber);
  diffuser.position.set(0, 0.24, -1.82);
  car.add(diffuser);

  const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.28, 8), palette.imperialGold);
  exhaust.rotation.x = Math.PI / 2;
  exhaust.position.set(0, 0.38, -1.86);
  car.add(exhaust);

  // 8. Iconic Y-shaped LED Headlights
  [-0.6, 0.6].forEach((hx) => {
    const headlight = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 0.08), palette.carHeadlight);
    headlight.position.set(hx, 0.4, 1.76);
    car.add(headlight);
  });

  // 9. Angular LED Taillights
  [-0.58, 0.58].forEach((tx) => {
    const taillight = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.07, 0.06), palette.carTaillight);
    taillight.position.set(tx, 0.44, -1.82);
    car.add(taillight);
  });

  // 10. 4 Wide Racing Wheels
  const wheelLocations = [
    { x: -0.84, z: 1.05 },
    { x: 0.84, z: 1.05 },
    { x: -0.86, z: -1.05 },
    { x: 0.86, z: -1.05 },
  ];

  wheelLocations.forEach((loc) => {
    const wheel = createSportWheel(palette, 0.3, 0.22, palette.imperialGold);
    wheel.position.set(loc.x, 0.3, loc.z);
    car.add(wheel);
  });

  return car;
}

// ============================================================================
// 2. FERRARI SUPERCAR (Rosso Corsa, sculpted S-duct, quad round lights)
// ============================================================================
export function buildFerrariSupercar(
  palette: CityMaterialPalette,
  isSoftwareGl: boolean,
  color: 'red' | 'yellow' = 'red'
): THREE.Group {
  const car = new THREE.Group();
  car.name = 'supercar_ferrari';

  const bodyMat = color === 'red' ? palette.ferrariRed : palette.lamborghiniGreen;

  // 1. Aerodynamic Curvaceous Monocoque Body
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.34, 3.5), bodyMat);
  chassis.position.y = 0.34;
  chassis.castShadow = !isSoftwareGl;
  car.add(chassis);

  // 2. Sculpted S-Duct Sloping Nose & Front Splitter
  const nose = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.18, 1.25), bodyMat);
  nose.position.set(0, 0.44, 1.08);
  car.add(nose);

  const frontSplitter = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.06, 0.4), palette.carbonFiber);
  frontSplitter.position.set(0, 0.16, 1.76);
  car.add(frontSplitter);

  // Hood Aerodynamic Center Air Channel
  const sDuct = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.06, 0.85), palette.carbonFiber);
  sDuct.position.set(0, 0.54, 0.95);
  car.add(sDuct);

  // 3. Teardrop Glass Cockpit Canopy
  const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.72, 1.45, 12), palette.carGlass);
  canopy.rotation.x = Math.PI / 2;
  canopy.scale.set(1.0, 0.8, 1.1);
  canopy.position.set(0, 0.72, -0.15);
  car.add(canopy);

  // 4. Scuderia Shield Badges on front quarter fenders
  [-0.82, 0.82].forEach((bx) => {
    const shield = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.1), palette.imperialGold);
    shield.position.set(bx, 0.52, 0.65);
    car.add(shield);
  });

  // 5. Rear Deck with Visible Engine Cover & Aero Bridge
  const rearDeck = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.16, 1.0), bodyMat);
  rearDeck.position.set(0, 0.52, -1.1);
  car.add(rearDeck);

  const engineWindow = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.65), palette.blackObsidianGlass);
  engineWindow.position.set(0, 0.61, -1.05);
  car.add(engineWindow);

  // 6. Integrated Ducktail Rear Spoiler
  const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.12, 0.28), bodyMat);
  spoiler.position.set(0, 0.66, -1.75);
  car.add(spoiler);

  // 7. Quad Round Iconic Ferrari Taillights
  [
    { x: -0.62, y: 0.48 },
    { x: -0.42, y: 0.48 },
    { x: 0.42, y: 0.48 },
    { x: 0.62, y: 0.48 },
  ].forEach((pos) => {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 10), palette.carTaillight);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(pos.x, pos.y, -1.78);
    car.add(ring);
  });

  // 8. Slender Swept-Back LED Headlights
  [-0.6, 0.6].forEach((hx) => {
    const light = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.12), palette.carHeadlight);
    light.position.set(hx, 0.42, 1.68);
    car.add(light);
  });

  // 9. Dual Titanium Center Exhaust Tips
  [-0.14, 0.14].forEach((ex) => {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.22, 8), palette.chromeMetal);
    pipe.rotation.x = Math.PI / 2;
    pipe.position.set(ex, 0.34, -1.8);
    car.add(pipe);
  });

  // 10. Star-Spoke Alloy Wheels
  const wheelLocations = [
    { x: -0.83, z: 1.0 },
    { x: 0.83, z: 1.0 },
    { x: -0.85, z: -1.0 },
    { x: 0.85, z: -1.0 },
  ];

  wheelLocations.forEach((loc) => {
    const wheel = createSportWheel(palette, 0.3, 0.22, palette.chromeMetal);
    wheel.position.set(loc.x, 0.3, loc.z);
    car.add(wheel);
  });

  return car;
}

// ============================================================================
// 3. LUXURY MULTI-DECK SUPERYACHT (Displacement hull, teak decks, flybridge)
// ============================================================================
export interface AnimatedYacht {
  mesh: THREE.Group;
  speed: number;
  dir: 1 | -1;
  min: number;
  max: number;
  phase: number;
}

export function buildLuxurySuperyacht(palette: CityMaterialPalette, isSoftwareGl: boolean): THREE.Group {
  const yacht = new THREE.Group();
  yacht.name = 'superyacht_luxury';

  // Scale: ~18 city meters long
  // 1. Hydro-dynamic Displacement Hull in High-Gloss Marine White
  const hullLength = 17.5;
  const hullWidth = 4.2;
  const hullHeight = 1.8;

  const hullMain = new THREE.Mesh(
    new THREE.BoxGeometry(hullWidth, hullHeight, hullLength * 0.72),
    palette.yachtHullWhite
  );
  hullMain.position.set(0, 0.7, -1.2);
  hullMain.castShadow = !isSoftwareGl;
  yacht.add(hullMain);

  // Pointed hydrodynamic bow section
  const bow = new THREE.Mesh(
    new THREE.ConeGeometry(hullWidth * 0.55, hullLength * 0.38, 4),
    palette.yachtHullWhite
  );
  bow.rotation.x = -Math.PI / 2;
  bow.rotation.y = Math.PI / 4;
  bow.scale.set(1.3, 1.0, 0.7);
  bow.position.set(0, 0.7, hullLength * 0.34);
  bow.castShadow = !isSoftwareGl;
  yacht.add(bow);

  // Navy & Imperial Gold Waterline Boot Stripe
  const bootStripe = new THREE.Mesh(
    new THREE.BoxGeometry(hullWidth + 0.08, 0.16, hullLength * 0.92),
    palette.royalNavyMat
  );
  bootStripe.position.set(0, 0.25, 0);
  yacht.add(bootStripe);

  const goldStripe = new THREE.Mesh(
    new THREE.BoxGeometry(hullWidth + 0.1, 0.06, hullLength * 0.9),
    palette.imperialGold
  );
  goldStripe.position.set(0, 0.38, 0);
  yacht.add(goldStripe);

  // 2. Teak Wood Main Deck
  const mainDeck = new THREE.Mesh(
    new THREE.BoxGeometry(hullWidth - 0.2, 0.12, hullLength * 0.88),
    palette.teakWood
  );
  mainDeck.position.set(0, 1.62, 0);
  yacht.add(mainDeck);

  // Stainless Steel Perimeter Railings
  [-hullWidth / 2 + 0.15, hullWidth / 2 - 0.15].forEach((rx) => {
    const rail = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, hullLength * 0.75, 6),
      palette.chromeMetal
    );
    rail.rotation.x = Math.PI / 2;
    rail.position.set(rx, 2.05, -0.8);
    yacht.add(rail);
  });

  // 3. Main Deck Salon with Floor-to-Ceiling Tinted Panoramic Sea-View Glass
  const salonW = 3.4;
  const salonH = 1.6;
  const salonL = 8.5;

  const salon = new THREE.Mesh(new THREE.BoxGeometry(salonW, salonH, salonL), palette.yachtHullWhite);
  salon.position.set(0, 2.45, -1.0);
  salon.castShadow = !isSoftwareGl;
  yacht.add(salon);

  const salonGlass = new THREE.Mesh(
    new THREE.BoxGeometry(salonW + 0.08, salonH * 0.7, salonL * 0.82),
    palette.skyReflectiveCurtainGlass
  );
  salonGlass.position.set(0, 2.5, -1.0);
  yacht.add(salonGlass);

  // 4. Upper Wheelhouse & Navigation Bridge Deck
  const bridgeW = 2.8;
  const bridgeH = 1.35;
  const bridgeL = 5.2;

  const bridge = new THREE.Mesh(new THREE.BoxGeometry(bridgeW, bridgeH, bridgeL), palette.yachtHullWhite);
  bridge.position.set(0, 3.85, 0.2);
  bridge.castShadow = !isSoftwareGl;
  yacht.add(bridge);

  const bridgeGlass = new THREE.Mesh(
    new THREE.BoxGeometry(bridgeW + 0.08, bridgeH * 0.7, bridgeL * 0.8),
    palette.blackObsidianGlass
  );
  bridgeGlass.position.set(0, 3.9, 0.4);
  yacht.add(bridgeGlass);

  // 5. Sun Deck / Flybridge with Radar Mast & Dual Satellite Domes
  const flybridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 4.4), palette.teakWood);
  flybridgeDeck.position.set(0, 4.55, 0.2);
  yacht.add(flybridgeDeck);

  // Radar arch with navigation equipment
  const radarArch = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.2, 0.35), palette.yachtHullWhite);
  radarArch.position.set(0, 5.15, -1.0);
  yacht.add(radarArch);

  // Dual White Satellite Radomes
  [-0.75, 0.75].forEach((dx) => {
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), palette.yachtHullWhite);
    dome.position.set(dx, 5.85, -1.0);
    yacht.add(dome);
  });

  // Rotating Radar Scanner Bar
  const radarBar = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 0.12), palette.imperialGold);
  radarBar.position.set(0, 6.1, -1.0);
  yacht.add(radarBar);

  // 6. Aft Transom Beach Club, Swim Platform & Tender Garage
  const swimPlatform = new THREE.Mesh(new THREE.BoxGeometry(hullWidth * 0.92, 0.2, 1.8), palette.teakWood);
  swimPlatform.position.set(0, 0.45, -hullLength * 0.46);
  yacht.add(swimPlatform);

  // Underwater LED Pool/Ocean Lighting (Vibrant Cyan Glow under the stern)
  const underwaterLight = new THREE.Mesh(
    new THREE.BoxGeometry(hullWidth * 0.75, 0.12, 0.2),
    palette.neonCyan
  );
  underwaterLight.position.set(0, 0.15, -hullLength * 0.47);
  yacht.add(underwaterLight);

  // 7. Navigation Lights (Starboard Green, Port Red)
  const starLight = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), palette.foliageGreen);
  starLight.position.set(bridgeW / 2 + 0.08, 3.8, 1.2);
  yacht.add(starLight);

  const portLight = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), palette.ferrariRed);
  portLight.position.set(-bridgeW / 2 - 0.08, 3.8, 1.2);
  yacht.add(portLight);

  // 8. Bow Sun Lounge Pads
  const sunPad = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.15, 2.2), palette.imperialGold);
  sunPad.position.set(0, 1.75, 4.6);
  yacht.add(sunPad);

  return yacht;
}

// Sleek 50ft Sports Yacht (High-speed cruiser)
export function buildSpeedboatYacht(palette: CityMaterialPalette, isSoftwareGl: boolean): THREE.Group {
  const boat = new THREE.Group();
  boat.name = 'speedboat_yacht';

  const len = 11.5;
  const wid = 3.2;

  // Streamlined wedge hull
  const hull = new THREE.Mesh(new THREE.BoxGeometry(wid, 1.3, len * 0.7), palette.royalNavyMat);
  hull.position.set(0, 0.55, -0.8);
  boat.add(hull);

  const bow = new THREE.Mesh(new THREE.ConeGeometry(wid * 0.52, len * 0.38, 4), palette.royalNavyMat);
  bow.rotation.x = -Math.PI / 2;
  bow.rotation.y = Math.PI / 4;
  bow.scale.set(1.2, 1.0, 0.65);
  bow.position.set(0, 0.55, len * 0.28);
  boat.add(bow);

  // Teak deck
  const deck = new THREE.Mesh(new THREE.BoxGeometry(wid - 0.25, 0.1, len * 0.85), palette.teakWood);
  deck.position.set(0, 1.22, 0);
  boat.add(deck);

  // Aerodynamic wrap-around tinted windshield
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(wid * 0.85, 0.7, 1.8), palette.blackObsidianGlass);
  windshield.position.set(0, 1.62, 0.6);
  boat.add(windshield);

  // Aft Sun Lounge
  const aftLounge = new THREE.Mesh(new THREE.BoxGeometry(wid * 0.78, 0.25, 2.4), palette.imperialGold);
  aftLounge.position.set(0, 1.36, -2.4);
  boat.add(aftLounge);

  // Chrome Twin Outboard Motors
  [-0.65, 0.65].forEach((mx) => {
    const motor = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.8, 0.55), palette.chromeMetal);
    motor.position.set(mx, 0.45, -len * 0.42);
    boat.add(motor);
  });

  return boat;
}

// ============================================================================
// 4. EXECUTIVE PATROL HELICOPTER (Spinning main & tail rotors, searchlight)
// ============================================================================
export interface HelicopterAssets {
  group: THREE.Group;
  mainRotor: THREE.Group;
  tailRotor: THREE.Group;
  strobeLight: THREE.Mesh;
}

export function buildExecutiveHelicopter(
  palette: CityMaterialPalette,
  isSoftwareGl: boolean
): HelicopterAssets {
  const heli = new THREE.Group();
  heli.name = 'executive_helicopter';

  // 1. Aerodynamic VIP Composite Fuselage (Royal Navy & Imperial Gold)
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 1.45, 3.4),
    palette.royalNavyMat
  );
  body.position.set(0, 0.95, 0);
  body.castShadow = !isSoftwareGl;
  heli.add(body);

  // Rounded aerodynamic nose cone
  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 12, 10),
    palette.royalNavyMat
  );
  nose.scale.set(0.98, 0.9, 1.25);
  nose.position.set(0, 0.95, 1.65);
  heli.add(nose);

  // 2. Large Tinted Panoramic Cockpit Bubble Canopy
  const canopy = new THREE.Mesh(
    new THREE.SphereGeometry(0.78, 12, 10),
    palette.blackObsidianGlass
  );
  canopy.scale.set(0.96, 0.85, 1.15);
  canopy.position.set(0, 1.1, 1.4);
  heli.add(canopy);

  // Executive Gold Lateral Trim Line
  const goldTrim = new THREE.Mesh(
    new THREE.BoxGeometry(1.64, 0.12, 3.6),
    palette.imperialGold
  );
  goldTrim.position.set(0, 0.85, 0.2);
  heli.add(goldTrim);

  // 3. Slender Tail Boom & Vertical Stabilizer Fin
  const tailBoom = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.32, 3.8, 8),
    palette.royalNavyMat
  );
  tailBoom.rotation.x = Math.PI / 2;
  tailBoom.position.set(0, 1.15, -3.2);
  heli.add(tailBoom);

  // Vertical Tail Fin
  const vertFin = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 1.4, 0.85),
    palette.royalNavyMat
  );
  vertFin.position.set(0, 1.65, -5.0);
  heli.add(vertFin);

  // Horizontal Stabilizer Winglets
  const horizFin = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.08, 0.4),
    palette.imperialGold
  );
  horizFin.position.set(0, 1.4, -4.6);
  heli.add(horizFin);

  // 4. Main Rotor Mast, Hub & 4 Spinning Blades
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.12, 0.55, 8),
    palette.chromeMetal
  );
  mast.position.set(0, 1.95, 0.3);
  heli.add(mast);

  const mainRotorGroup = new THREE.Group();
  mainRotorGroup.position.set(0, 2.22, 0.3);
  heli.add(mainRotorGroup);

  const rotorHub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.26, 0.12, 12),
    palette.imperialGold
  );
  mainRotorGroup.add(rotorHub);

  // 4 Aerodynamic Carbon Fiber Blades (Diameter: 6.8 units)
  for (let i = 0; i < 4; i++) {
    const bladeAngle = (i * Math.PI) / 2;
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.03, 3.2),
      palette.carbonFiber
    );
    blade.position.set(
      Math.sin(bladeAngle) * 1.6,
      0,
      Math.cos(bladeAngle) * 1.6
    );
    blade.rotation.y = bladeAngle;

    // Gilded High-Visibility Blade Tips
    const tip = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.035, 0.35),
      palette.imperialGold
    );
    tip.position.set(0, 0, 1.45);
    blade.add(tip);

    mainRotorGroup.add(blade);
  }

  // 5. Tail Rotor (Anti-torque 2-blade spinning prop)
  const tailRotorGroup = new THREE.Group();
  tailRotorGroup.position.set(0.14, 1.85, -5.1);
  heli.add(tailRotorGroup);

  const tailHub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.08, 8),
    palette.imperialGold
  );
  tailHub.rotation.z = Math.PI / 2;
  tailRotorGroup.add(tailHub);

  const tailBlade = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 1.1, 0.1),
    palette.carbonFiber
  );
  tailRotorGroup.add(tailBlade);

  // 6. Dual Tubular Landing Skids
  [-0.75, 0.75].forEach((kx) => {
    // Horizontal runner
    const runner = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 3.4, 8),
      palette.chromeMetal
    );
    runner.rotation.x = Math.PI / 2;
    runner.position.set(kx, 0.08, 0.1);
    heli.add(runner);

    // Front/rear angled skid struts
    [-0.8, 0.9].forEach((sz) => {
      const strut = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.65, 6),
        palette.chromeMetal
      );
      strut.position.set(kx * 0.75, 0.42, sz);
      strut.rotation.z = kx > 0 ? -0.35 : 0.35;
      heli.add(strut);
    });
  });

  // 7. Flashing Anti-Collision Red Beacon Light
  const strobeLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 8, 8),
    palette.ferrariRed
  );
  strobeLight.position.set(0, 2.38, -5.0);
  heli.add(strobeLight);

  // 8. Downward High-Intensity VIP Searchlight
  const searchlight = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.24, 0.28, 10),
    palette.imperialGold
  );
  searchlight.rotation.x = Math.PI / 4;
  searchlight.position.set(0, 0.28, 1.4);
  heli.add(searchlight);

  const searchBeam = new THREE.Mesh(
    new THREE.ConeGeometry(1.8, 14, 12, 1, true),
    new THREE.MeshBasicMaterial({
      color: '#fef08a',
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  searchBeam.position.set(0, -7.0, 4.0);
  searchBeam.rotation.x = -Math.PI / 6;
  heli.add(searchBeam);

  return {
    group: heli,
    mainRotor: mainRotorGroup,
    tailRotor: tailRotorGroup,
    strobeLight,
  };
}

// ============================================================================
// 5. DANCING CHOREOGRAPHIC MUSICAL FOUNTAIN (Multi-tier, pulsing water jets)
// ============================================================================
export interface DancingFountainAssets {
  group: THREE.Group;
  centerJet: THREE.Mesh;
  jets: THREE.Mesh[];
  lightMaterial: THREE.MeshBasicMaterial;
  phase: number;
}

export function buildDancingFountain(
  palette: CityMaterialPalette,
  isSoftwareGl: boolean,
  radius = 5.2
): DancingFountainAssets {
  const fountain = new THREE.Group();
  fountain.name = 'dancing_musical_fountain';

  // 1. Stepped Carrara White Marble Basin with Imperial Gold Inlays
  const outerBasin = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius + 0.35, 0.55, 24),
    palette.whiteMarble
  );
  outerBasin.position.y = 0.275;
  outerBasin.receiveShadow = !isSoftwareGl;
  fountain.add(outerBasin);

  const goldCoping = new THREE.Mesh(
    new THREE.CylinderGeometry(radius + 0.15, radius + 0.15, 0.12, 24),
    palette.curbGold
  );
  goldCoping.position.y = 0.58;
  fountain.add(goldCoping);

  // Inner reflective water pool surface
  const waterPool = new THREE.Mesh(
    new THREE.CylinderGeometry(radius - 0.4, radius - 0.4, 0.38, 24),
    palette.poolTurquoise
  );
  waterPool.position.y = 0.42;
  fountain.add(waterPool);

  // 2. Center Tiered Architectural Pedestal
  const centerPlinth = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 1.8, 1.1, 16),
    palette.whiteMarble
  );
  centerPlinth.position.y = 0.85;
  fountain.add(centerPlinth);

  const centerCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.5, 0.18, 16),
    palette.imperialGold
  );
  centerCollar.position.y = 1.45;
  fountain.add(centerCollar);

  // 3. Dynamic Center High-Pressure Geyser Spout (scales in render loop)
  const centerJetGeo = new THREE.CylinderGeometry(0.14, 0.42, 6.5, 12);
  centerJetGeo.translate(0, 3.25, 0); // pivot at base
  const centerJet = new THREE.Mesh(centerJetGeo, palette.fountainWaterDancing);
  centerJet.position.set(0, 1.45, 0);
  fountain.add(centerJet);

  // Foam crown at top of center jet
  const foamCrown = new THREE.Mesh(
    new THREE.SphereGeometry(0.65, 10, 8),
    palette.whiteMarble
  );
  foamCrown.position.y = 6.2;
  centerJet.add(foamCrown);

  // 4. Middle Ring of 8 Choreographed Arching Water Jets
  const jets: THREE.Mesh[] = [];
  const midRadius = radius * 0.52;
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    const jx = Math.cos(angle) * midRadius;
    const jz = Math.sin(angle) * midRadius;

    const ringJetGeo = new THREE.CylinderGeometry(0.08, 0.22, 3.8, 8);
    ringJetGeo.translate(0, 1.9, 0);
    const ringJet = new THREE.Mesh(ringJetGeo, palette.fountainWaterDancing);
    ringJet.position.set(jx, 0.45, jz);
    ringJet.rotation.z = -Math.cos(angle) * 0.25;
    ringJet.rotation.x = Math.sin(angle) * 0.25;
    fountain.add(ringJet);
    jets.push(ringJet);

    // Nozzle head
    const nozzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.15, 0.25, 8),
      palette.imperialGold
    );
    nozzle.position.set(jx, 0.55, jz);
    fountain.add(nozzle);
  }

  // 5. Underwater Submerged RGB LED Ring
  const lightMaterial = new THREE.MeshBasicMaterial({ color: '#00f0ff' });
  const ledRing = new THREE.Mesh(
    new THREE.TorusGeometry(midRadius, 0.08, 8, 24),
    lightMaterial
  );
  ledRing.rotation.x = Math.PI / 2;
  ledRing.position.y = 0.48;
  fountain.add(ledRing);

  return {
    group: fountain,
    centerJet,
    jets,
    lightMaterial,
    phase: Math.random() * Math.PI * 2,
  };
}

// ============================================================================
// 6. IMPERIAL GOLDEN EAGLE / FALCON MONUMENT (تمثال الصقر الذهبي الإمبراطوري)
// ============================================================================
export function buildImperialGoldenEagleStatue(
  palette: CityMaterialPalette,
  isSoftwareGl: boolean
): THREE.Group {
  const monument = new THREE.Group();
  monument.name = 'monument_golden_eagle';

  // 1. Stepped Polished Black Granite & Carrara Marble Plinth
  const step1 = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.35, 4.8), palette.slateStructure);
  step1.position.y = 0.175;
  monument.add(step1);

  const step2 = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.35, 4.0), palette.whiteMarble);
  step2.position.y = 0.525;
  monument.add(step2);

  // Octagonal Central Marble Column Shaft with Gold Inscription Plaque
  const column = new THREE.Mesh(
    new THREE.CylinderGeometry(1.15, 1.35, 2.8, 8),
    palette.whiteMarble
  );
  column.position.y = 2.1;
  monument.add(column);

  const plaque = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.06), palette.imperialGold);
  plaque.position.set(0, 2.1, 1.25);
  monument.add(plaque);

  const capital = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 1.3, 0.45, 8),
    palette.curbGold
  );
  capital.position.y = 3.65;
  monument.add(capital);

  // 2. Celestial World Globe Held at Eagle's Feet
  const globe = new THREE.Mesh(new THREE.SphereGeometry(0.65, 14, 12), palette.imperialGold);
  globe.position.set(0, 4.3, 0);
  monument.add(globe);

  // 3. Sculpted Imperial Golden Eagle with Outspread Wings
  const eagleGroup = new THREE.Group();
  eagleGroup.position.set(0, 4.8, 0);

  // Eagle Torso & Muscular Chest
  const torso = new THREE.Mesh(
    new THREE.ConeGeometry(0.48, 1.25, 8),
    palette.imperialGold
  );
  torso.rotation.x = 0.2;
  torso.position.set(0, 0.45, 0);
  eagleGroup.add(torso);

  // Crested Eagle Head with Curved Golden Beak
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), palette.imperialGold);
  head.position.set(0, 1.15, 0.18);
  eagleGroup.add(head);

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.38, 6), palette.brushedGold);
  beak.rotation.x = Math.PI / 2 + 0.3;
  beak.position.set(0, 1.12, 0.46);
  eagleGroup.add(beak);

  // Majestic Outspread Wings (Wingspan 4.6m)
  [-1, 1].forEach((dir) => {
    const wing = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.75, 0.14),
      palette.imperialGold
    );
    wing.position.set(dir * 1.25, 0.8, 0);
    wing.rotation.z = dir * 0.45;
    wing.rotation.y = -dir * 0.25;

    // Layered Feather Trim
    const featherTip = new THREE.Mesh(
      new THREE.ConeGeometry(0.45, 1.2, 4),
      palette.imperialGold
    );
    featherTip.rotation.z = -dir * (Math.PI / 2 + 0.3);
    featherTip.position.set(dir * 1.1, 0.2, 0);
    wing.add(featherTip);

    eagleGroup.add(wing);
  });

  // Fan Tail Feathers
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.95, 0.1), palette.imperialGold);
  tail.rotation.x = -0.45;
  tail.position.set(0, -0.15, -0.32);
  eagleGroup.add(tail);

  monument.add(eagleGroup);

  // 4. Four Golden Ceremonial Torches at Plinth Corners
  [
    [-1.8, -1.8],
    [1.8, -1.8],
    [-1.8, 1.8],
    [1.8, 1.8],
  ].forEach(([tx, tz]) => {
    const torchPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.12, 1.6, 8),
      palette.imperialGold
    );
    torchPost.position.set(tx, 0.8, tz);
    monument.add(torchPost);

    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 0.42, 8),
      palette.amberIndicator
    );
    flame.position.set(tx, 1.75, tz);
    monument.add(flame);
  });

  return monument;
}

// ============================================================================
// 7. CLASSICAL BRONZE TITAN / EMPEROR STATUE (تمثال الفارس / القيصر البرونزي)
// ============================================================================
export function buildClassicalTitanStatue(
  palette: CityMaterialPalette,
  isSoftwareGl: boolean
): THREE.Group {
  const statue = new THREE.Group();
  statue.name = 'statue_classical_titan';

  // 1. Stepped Marble Base with 4 Guardian Bronze Lions
  const base = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.6, 4.4), palette.whiteMarble);
  base.position.y = 0.3;
  statue.add(base);

  const pedestal = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 2.4), palette.slateStructure);
  pedestal.position.y = 1.7;
  statue.add(pedestal);

  const pedGoldTrim = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.18, 2.6), palette.curbGold);
  pedGoldTrim.position.y = 2.85;
  statue.add(pedGoldTrim);

  // 4 Guardian Bronze Lions at Base Corners
  [
    [-1.6, -1.6],
    [1.6, -1.6],
    [-1.6, 1.6],
    [1.6, 1.6],
  ].forEach(([lx, lz]) => {
    const lion = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.5, 0.9), palette.bronzeStatue);
    lion.position.set(lx, 0.85, lz);
    lion.rotation.y = Math.atan2(lx, lz);
    statue.add(lion);
  });

  // 2. Classical Bronze Emperor Silhouette
  const titan = new THREE.Group();
  titan.position.y = 2.95;

  // Legs & Robes
  const robes = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.85, 1.8, 10),
    palette.bronzeStatue
  );
  robes.position.y = 0.9;
  titan.add(robes);

  // Torso / Cuirass Armor
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.1, 0.55), palette.bronzeStatue);
  torso.position.y = 2.2;
  titan.add(torso);

  // Head with Laurels
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), palette.bronzeStatue);
  head.position.y = 3.0;
  titan.add(head);

  const laurel = new THREE.Mesh(
    new THREE.TorusGeometry(0.28, 0.05, 6, 12),
    palette.imperialGold
  );
  laurel.rotation.x = Math.PI / 2;
  laurel.position.y = 3.12;
  titan.add(laurel);

  // Raised Arm Holding the Torch of Prosperity
  const arm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.12, 1.4, 6),
    palette.bronzeStatue
  );
  arm.position.set(0.65, 2.7, 0.2);
  arm.rotation.z = -0.4;
  arm.rotation.x = 0.2;
  titan.add(arm);

  const torch = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.06, 0.6, 8),
    palette.imperialGold
  );
  torch.position.set(1.15, 3.4, 0.35);
  titan.add(torch);

  const flame = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 8, 8),
    palette.amberIndicator
  );
  flame.position.set(1.15, 3.75, 0.35);
  titan.add(flame);

  statue.add(titan);
  return statue;
}

// ============================================================================
// 8. ROLEX HAUTE HORLOGERIE FLAGSHIP BOUTIQUE (متجر رولكس العالمي)
// ============================================================================
export function buildRolexFlagshipStore(
  palette: CityMaterialPalette,
  isSoftwareGl: boolean
): THREE.Group {
  const store = new THREE.Group();
  store.name = 'flagship_store_rolex';

  // 1. Paved Plaza Base with Travertine Stone
  const base = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.4, 10.5), palette.plazaPaver);
  base.position.y = 0.2;
  base.receiveShadow = !isSoftwareGl;
  store.add(base);

  // 2. Green Marble & Fluted Gold Architectural Facade
  const mainBuilding = new THREE.Mesh(
    new THREE.BoxGeometry(9.6, 5.2, 7.8),
    palette.rolexGreenMarble
  );
  mainBuilding.position.set(0, 2.8, -0.6);
  mainBuilding.castShadow = !isSoftwareGl;
  store.add(mainBuilding);

  // Rolex Fluted Bezel Golden Cornice (Iconic fluted gold crown trim)
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.45, 8.2), palette.imperialGold);
  cornice.position.set(0, 5.5, -0.6);
  store.add(cornice);

  // Fluted architectural gold pilasters on facade
  [-4.5, -2.4, 2.4, 4.5].forEach((px) => {
    const pilaster = new THREE.Mesh(new THREE.BoxGeometry(0.35, 5.2, 0.4), palette.imperialGold);
    pilaster.position.set(px, 2.8, 3.35);
    store.add(pilaster);
  });

  // 3. Double-Height Crystal Glass Display Windows with High Sky Reflection
  const windowLeft = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 3.2, 0.15),
    palette.skyReflectiveCurtainGlass
  );
  windowLeft.position.set(-2.2, 2.1, 3.35);
  store.add(windowLeft);

  const windowRight = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 3.2, 0.15),
    palette.skyReflectiveCurtainGlass
  );
  windowRight.position.set(2.2, 2.1, 3.35);
  store.add(windowRight);

  // Watch Display Pedestals inside vitrines
  [-2.2, 2.2].forEach((vx) => {
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.4, 1.1, 12),
      palette.rolexGreenMarble
    );
    pedestal.position.set(vx, 1.1, 3.1);
    store.add(pedestal);

    const watchDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 8, 8),
      palette.curtainGlass
    );
    watchDome.position.set(vx, 1.8, 3.1);
    store.add(watchDome);

    const goldWatch = new THREE.Mesh(
      new THREE.TorusGeometry(0.12, 0.04, 6, 12),
      palette.imperialGold
    );
    goldWatch.position.set(vx, 1.75, 3.1);
    store.add(goldWatch);
  });

  // 4. Central Grand Gilded Brass Entrance Portal
  const portal = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.4, 0.25), palette.imperialGold);
  portal.position.set(0, 2.1, 3.38);
  store.add(portal);

  const doorGlass = new THREE.Mesh(new THREE.BoxGeometry(1.9, 2.9, 0.1), palette.blackObsidianGlass);
  doorGlass.position.set(0, 2.05, 3.44);
  store.add(doorGlass);

  // 5. Illuminated Emerald Green & Gold ROLEX Crown Signboard
  const signBoard = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.3, 0.2), palette.rolexGreenMarble);
  signBoard.position.set(0, 4.35, 3.4);
  store.add(signBoard);

  const signBorder = new THREE.Mesh(new THREE.BoxGeometry(5.4, 1.45, 0.12), palette.imperialGold);
  signBorder.position.set(0, 4.35, 3.38);
  store.add(signBorder);

  // Rolex 5-Point Crown Emblem in Luminous Gold
  const crownGroup = new THREE.Group();
  crownGroup.position.set(0, 4.65, 3.55);
  for (let c = -2; c <= 2; c++) {
    const spikeH = 0.35 - Math.abs(c) * 0.05;
    const spike = new THREE.Mesh(
      new THREE.ConeGeometry(0.06, spikeH, 6),
      palette.imperialGold
    );
    spike.position.set(c * 0.14, spikeH / 2, 0);
    crownGroup.add(spike);

    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), palette.imperialGold);
    bead.position.set(c * 0.14, spikeH, 0);
    crownGroup.add(bead);
  }
  const crownBase = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.04), palette.imperialGold);
  crownBase.position.y = -0.04;
  crownGroup.add(crownBase);
  store.add(crownGroup);

  // "ROLEX" Gilded 3D Letters Plate
  const lettersPlate = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.42, 0.08), palette.emeraldGlow);
  lettersPlate.position.set(0, 4.15, 3.52);
  store.add(lettersPlate);

  return store;
}

// ============================================================================
// 9. LOUIS VUITTON / GUCCI LUXURY FASHION MAISON (ميزون الماركات العالمية)
// ============================================================================
export function buildLouisVuittonFlagshipStore(
  palette: CityMaterialPalette,
  isSoftwareGl: boolean
): THREE.Group {
  const maison = new THREE.Group();
  maison.name = 'flagship_store_louis_vuitton';

  // 1. Polished Travertine Marble Plaza
  const base = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.4, 10.8), palette.plazaPaver);
  base.position.y = 0.2;
  base.receiveShadow = !isSoftwareGl;
  maison.add(base);

  // 2. Multi-Story French Beaux-Arts Contemporary Flagship
  const mainBuilding = new THREE.Mesh(
    new THREE.BoxGeometry(10.2, 6.2, 8.2),
    palette.whiteMarble
  );
  mainBuilding.position.set(0, 3.3, -0.6);
  mainBuilding.castShadow = !isSoftwareGl;
  maison.add(mainBuilding);

  // Architectural Bronze Monogram Screening Lattice
  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(9.6, 2.6, 0.12),
    palette.brushedGold
  );
  screen.position.set(0, 4.8, 3.55);
  maison.add(screen);

  // Gilded Grand Parapet & Balustrade
  const parapet = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.45, 8.5), palette.imperialGold);
  parapet.position.set(0, 6.55, -0.6);
  maison.add(parapet);

  // 3. Ultra-Wide Fashion Window Vitrines with Mannequin Silhouettes
  [-2.8, 2.8].forEach((wx) => {
    const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.4, 0.2), palette.imperialGold);
    windowFrame.position.set(wx, 2.1, 3.55);
    maison.add(windowFrame);

    const windowGlass = new THREE.Mesh(
      new THREE.BoxGeometry(3.3, 3.1, 0.1),
      palette.skyReflectiveCurtainGlass
    );
    windowGlass.position.set(wx, 2.1, 3.6);
    maison.add(windowGlass);

    // Fashion Mannequin inside window
    const mannequin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.28, 1.4, 8),
      palette.imperialGold
    );
    mannequin.position.set(wx, 1.5, 3.2);
    maison.add(mannequin);

    // Luxury Handbag on display stand
    const handbag = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.32, 0.22),
      palette.copperAccent
    );
    handbag.position.set(wx + 0.45, 1.25, 3.2);
    maison.add(handbag);
  });

  // 4. Central Rotating Golden Revolving Door with Bronze Awning
  const awning = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.2, 1.6), palette.royalNavyMat);
  awning.position.set(0, 3.5, 4.2);
  maison.add(awning);

  const awningGoldTrim = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.08, 1.7), palette.imperialGold);
  awningGoldTrim.position.set(0, 3.58, 4.2);
  maison.add(awningGoldTrim);

  const revolvingDoor = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.2, 2.8, 16),
    palette.blackObsidianGlass
  );
  revolvingDoor.position.set(0, 1.8, 3.55);
  maison.add(revolvingDoor);

  // 5. Iconic "LOUIS VUITTON" & "GUCCI" Illuminated Signboards
  const lvSign = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.65, 0.12), palette.blackObsidianGlass);
  lvSign.position.set(0, 3.95, 3.6);
  maison.add(lvSign);

  const lvTextGold = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.28, 0.06), palette.imperialGold);
  lvTextGold.position.set(0, 3.95, 3.68);
  maison.add(lvTextGold);

  return maison;
}

// ============================================================================
// 10. APPLE-STYLE MINIMALIST GLASS CUBE PAVILION (مقر التقنية والابتكار الزجاجي)
// ============================================================================
export function buildAppleFlagshipStore(
  palette: CityMaterialPalette,
  isSoftwareGl: boolean
): THREE.Group {
  const pavilion = new THREE.Group();
  pavilion.name = 'flagship_store_apple';

  // 1. Minimalist White Italian Quartz Plaza
  const base = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.35, 10.2), palette.whiteMarble);
  base.position.y = 0.175;
  base.receiveShadow = !isSoftwareGl;
  pavilion.add(base);

  // 2. 360-Degree Crystal Clear Reflective Glass Cube
  const cubeW = 8.8;
  const cubeH = 4.8;
  const cubeD = 7.6;

  const glassCube = new THREE.Mesh(
    new THREE.BoxGeometry(cubeW, cubeH, cubeD),
    palette.skyReflectiveCurtainGlass
  );
  glassCube.position.set(0, 2.75, 0);
  glassCube.castShadow = !isSoftwareGl;
  pavilion.add(glassCube);

  // Cantilevered Ultra-Thin Carbon & Brushed Aluminum Floating Roof
  const floatingRoof = new THREE.Mesh(
    new THREE.BoxGeometry(cubeW + 1.2, 0.22, cubeD + 1.2),
    palette.chromeMetal
  );
  floatingRoof.position.set(0, 5.25, 0);
  floatingRoof.castShadow = !isSoftwareGl;
  pavilion.add(floatingRoof);

  // 3. Interior Light Oak Product Tables with Miniature Gadgets
  [-2.2, 2.2].forEach((tx) => {
    [-1.6, 1.6].forEach((tz) => {
      // Wood table
      const table = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.85, 0.9), palette.teakWood);
      table.position.set(tx, 0.775, tz);
      pavilion.add(table);

      // Glowing miniature screen tablets/laptops
      const device = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 0.25), palette.neonCyan);
      device.position.set(tx, 1.24, tz);
      pavilion.add(device);
    });
  });

  // 4. Center Glowing Minimalist Tech Emblem on Roof
  const emblem = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 10), palette.imperialGold);
  emblem.position.set(0, 5.65, 0);
  pavilion.add(emblem);

  return pavilion;
}
