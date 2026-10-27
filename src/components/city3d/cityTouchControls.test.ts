/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
  adjustCityCameraFov,
  CITY_CAMERA_LIMITS,
  focusCityCamera,
  panCityCamera,
} from './cityTouchControls';

describe('bounded city camera controls', () => {
  it('keeps the camera at a fixed elevated pose when focusing districts', () => {
    const cameraPosition = new THREE.Vector3();
    const lookAtPosition = new THREE.Vector3();

    focusCityCamera(cameraPosition, lookAtPosition, 80, 32);

    expect(cameraPosition.y).toBe(CITY_CAMERA_LIMITS.cameraHeight);
    expect(lookAtPosition.y).toBe(CITY_CAMERA_LIMITS.lookAtHeight);
    expect(cameraPosition.x).toBe(lookAtPosition.x);
    expect(cameraPosition.z - lookAtPosition.z).toBe(CITY_CAMERA_LIMITS.headingOffsetZ);
  });

  it('pans camera and focus together without changing height or orientation', () => {
    const cameraPosition = new THREE.Vector3(
      0,
      CITY_CAMERA_LIMITS.cameraHeight,
      CITY_CAMERA_LIMITS.headingOffsetZ
    );
    const lookAtPosition = new THREE.Vector3(0, CITY_CAMERA_LIMITS.lookAtHeight, 0);

    const moved = panCityCamera(cameraPosition, lookAtPosition, 12, -8);

    expect(moved).toEqual({ x: 12, z: -8 });
    expect(cameraPosition.y).toBe(CITY_CAMERA_LIMITS.cameraHeight);
    expect(lookAtPosition.y).toBe(CITY_CAMERA_LIMITS.lookAtHeight);
    expect(cameraPosition.x - lookAtPosition.x).toBe(0);
    expect(cameraPosition.z - lookAtPosition.z).toBe(65);
  });

  it('clamps pan at the city boundary while preserving the camera offset', () => {
    const cameraPosition = new THREE.Vector3(120, 60, 140);
    const lookAtPosition = new THREE.Vector3(120, CITY_CAMERA_LIMITS.lookAtHeight, 75);

    const moved = panCityCamera(cameraPosition, lookAtPosition, 20, 20);

    expect(moved).toEqual({ x: 5, z: 0 });
    expect(lookAtPosition.x).toBe(CITY_CAMERA_LIMITS.maxFocusX);
    expect(lookAtPosition.z).toBe(CITY_CAMERA_LIMITS.maxFocusZ);
    expect(cameraPosition.x).toBe(CITY_CAMERA_LIMITS.maxFocusX);
    expect(cameraPosition.z - lookAtPosition.z).toBe(CITY_CAMERA_LIMITS.headingOffsetZ);
    expect(cameraPosition.y).toBe(CITY_CAMERA_LIMITS.cameraHeight);
  });

  it('limits smooth zoom to a safe field-of-view range', () => {
    expect(adjustCityCameraFov(CITY_CAMERA_LIMITS.defaultFov, -10)).toBe(CITY_CAMERA_LIMITS.minFov);
    expect(adjustCityCameraFov(CITY_CAMERA_LIMITS.defaultFov, -100)).toBe(CITY_CAMERA_LIMITS.minFov);
    expect(adjustCityCameraFov(CITY_CAMERA_LIMITS.defaultFov, 100)).toBe(CITY_CAMERA_LIMITS.maxFov);
  });
});
