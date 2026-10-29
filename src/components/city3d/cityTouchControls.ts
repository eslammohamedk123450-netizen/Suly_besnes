/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

/**
 * The camera stays on a fixed elevated rail above the tallest city landmark.
 * Users can pan across the city and zoom with FOV, but cannot orbit, tilt,
 * roll, fly, or descend into the 3D models.
 */
export const CITY_CAMERA_LIMITS = {
  minFocusX: -95,
  maxFocusX: 125,
  minFocusZ: -75,
  maxFocusZ: 75,
  cameraHeight: 60,
  lookAtHeight: 26,
  headingOffsetZ: 65,
  minFov: 22,
  maxFov: 62,
  defaultFov: 52,
  zoomStep: 3,
} as const;

export interface CameraPanDelta {
  x: number;
  z: number;
}

export function clampCityCameraFocus(x: number, z: number): { x: number; z: number } {
  return {
    x: THREE.MathUtils.clamp(x, CITY_CAMERA_LIMITS.minFocusX, CITY_CAMERA_LIMITS.maxFocusX),
    z: THREE.MathUtils.clamp(z, CITY_CAMERA_LIMITS.minFocusZ, CITY_CAMERA_LIMITS.maxFocusZ),
  };
}

/** Place the camera and its aim at a fixed yaw, pitch, and safe altitude. */
export function focusCityCamera(
  cameraPosition: THREE.Vector3,
  lookAtPosition: THREE.Vector3,
  x: number,
  z: number
): void {
  const focus = clampCityCameraFocus(x, z);
  lookAtPosition.set(focus.x, CITY_CAMERA_LIMITS.lookAtHeight, focus.z);
  cameraPosition.set(
    focus.x,
    CITY_CAMERA_LIMITS.cameraHeight,
    focus.z + CITY_CAMERA_LIMITS.headingOffsetZ
  );
}

/** Translate both the camera and its focus together, preserving orientation. */
export function panCityCamera(
  cameraPosition: THREE.Vector3,
  lookAtPosition: THREE.Vector3,
  deltaX: number,
  deltaZ: number
): CameraPanDelta {
  const focus = clampCityCameraFocus(lookAtPosition.x + deltaX, lookAtPosition.z + deltaZ);
  const applied = {
    x: focus.x - lookAtPosition.x,
    z: focus.z - lookAtPosition.z,
  };

  lookAtPosition.x = focus.x;
  lookAtPosition.z = focus.z;
  cameraPosition.x += applied.x;
  cameraPosition.z += applied.z;

  return applied;
}

export function clampCityCameraFov(fov: number): number {
  return THREE.MathUtils.clamp(fov, CITY_CAMERA_LIMITS.minFov, CITY_CAMERA_LIMITS.maxFov);
}

export function adjustCityCameraFov(currentFov: number, delta: number): number {
  return clampCityCameraFov(currentFov + delta);
}

export interface CityTouchControllerOptions {
  domElement: HTMLElement;
  cameraTargetPos: React.MutableRefObject<THREE.Vector3>;
  cameraLookAtPos: React.MutableRefObject<THREE.Vector3>;
  cameraTargetFov: React.MutableRefObject<number>;
  onTapRaycast: (normalizedX: number, normalizedY: number) => void;
  speedMultiplier?: number;
}

export class CityTouchController {
  private dom: HTMLElement;
  private targetPos: React.MutableRefObject<THREE.Vector3>;
  private lookAtPos: React.MutableRefObject<THREE.Vector3>;
  private targetFov: React.MutableRefObject<number>;
  private onTapRaycast: (x: number, y: number) => void;

  private isPointerDown = false;
  private isPinching = false;
  private startX = 0;
  private startY = 0;
  private lastX = 0;
  private lastY = 0;
  private pinchStartDistance = 0;
  private dragDistance = 0;

  // Pan velocity is measured in world units per second.
  private velocityX = 0;
  private velocityZ = 0;
  private speedMultiplier = 1;
  private isLocked = false;

  constructor(options: CityTouchControllerOptions) {
    this.dom = options.domElement;
    this.targetPos = options.cameraTargetPos;
    this.lookAtPos = options.cameraLookAtPos;
    this.targetFov = options.cameraTargetFov;
    this.onTapRaycast = options.onTapRaycast;
    this.speedMultiplier = options.speedMultiplier ?? 1;

    this.bindEvents();
  }

  public setLocked(locked: boolean): void {
    this.isLocked = locked;
    if (locked) {
      this.cancelMotion();
    }
  }

  public getLocked(): boolean {
    return this.isLocked;
  }

  private onPointerDown = (e: MouseEvent | TouchEvent) => {
    if (this.isLocked) return;
    this.isPointerDown = true;
    this.velocityX = 0;
    this.velocityZ = 0;

    if ('touches' in e) {
      if (e.touches.length >= 2) {
        this.isPinching = true;
        this.dragDistance = 6;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        this.pinchStartDistance = Math.hypot(dx, dy);
      } else if (e.touches.length === 1) {
        this.isPinching = false;
        this.dragDistance = 0;
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
        this.lastX = this.startX;
        this.lastY = this.startY;
      }
    } else {
      this.isPinching = false;
      this.dragDistance = 0;
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.lastX = this.startX;
      this.lastY = this.startY;
    }
  };

  private onPointerMove = (e: MouseEvent | TouchEvent) => {
    if (this.isLocked || !this.isPointerDown) return;

    if ('touches' in e && e.touches.length === 0) return;

    if ('touches' in e && e.touches.length >= 2 && this.isPinching) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.hypot(dx, dy);
      const deltaDistance = currentDistance - this.pinchStartDistance;
      this.pinchStartDistance = currentDistance;

      // Spreading fingers narrows the FOV; pinching them together widens it.
      this.targetFov.current = adjustCityCameraFov(
        this.targetFov.current,
        -deltaDistance * 0.055 * this.speedMultiplier
      );
      this.dragDistance += Math.abs(deltaDistance);
      return;
    }

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaX = clientX - this.lastX;
    const deltaY = clientY - this.lastY;

    this.dragDistance += Math.hypot(deltaX, deltaY);

    const zoomScale = this.targetFov.current / CITY_CAMERA_LIMITS.defaultFov;
    const panSpeed = 0.08 * zoomScale * this.speedMultiplier;
    const applied = panCityCamera(
      this.targetPos.current,
      this.lookAtPos.current,
      -deltaX * panSpeed,
      -deltaY * panSpeed
    );

    this.velocityX = applied.x * 10;
    this.velocityZ = applied.z * 10;
    this.lastX = clientX;
    this.lastY = clientY;
  };

  private onPointerUp = (e: MouseEvent | TouchEvent) => {
    if (this.isLocked) {
      this.isPointerDown = false;
      this.isPinching = false;
      return;
    }

    if (this.dragDistance < 6) {
      const rect = this.dom.getBoundingClientRect();
      let clientX = this.startX;
      let clientY = this.startY;

      if ('changedTouches' in e && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const normalizedX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const normalizedY = -((clientY - rect.top) / rect.height) * 2 + 1;
      this.onTapRaycast(normalizedX, normalizedY);
    }

    this.isPointerDown = false;
    this.isPinching = false;
  };

  private onWheel = (e: WheelEvent) => {
    if (this.isLocked) return;
    e.preventDefault();
    this.targetFov.current = adjustCityCameraFov(
      this.targetFov.current,
      e.deltaY * 0.03 * this.speedMultiplier
    );
  };

  public zoomStep(direction: 'in' | 'out') {
    if (this.isLocked) return;
    const delta = direction === 'in'
      ? -CITY_CAMERA_LIMITS.zoomStep * this.speedMultiplier
      : CITY_CAMERA_LIMITS.zoomStep * this.speedMultiplier;
    this.targetFov.current = adjustCityCameraFov(this.targetFov.current, delta);
  }

  public resetView() {
    focusCityCamera(this.targetPos.current, this.lookAtPos.current, 0, 0);
    this.targetFov.current = CITY_CAMERA_LIMITS.defaultFov;
    this.cancelMotion();
  }

  /** Stop previous drag inertia before an explicit building transition. */
  public cancelMotion() {
    this.velocityX = 0;
    this.velocityZ = 0;
    this.isPointerDown = false;
    this.isPinching = false;
  }

  public setSpeed(multiplier: number) {
    this.speedMultiplier = THREE.MathUtils.clamp(multiplier, 0.5, 2);
  }

  public updateInertia(dt: number) {
    if (this.isLocked) {
      this.velocityX = 0;
      this.velocityZ = 0;
      return;
    }

    if (!this.isPointerDown && (Math.abs(this.velocityX) > 0.001 || Math.abs(this.velocityZ) > 0.001)) {
      const requestedX = this.velocityX * dt;
      const requestedZ = this.velocityZ * dt;
      const applied = panCityCamera(
        this.targetPos.current,
        this.lookAtPos.current,
        requestedX,
        requestedZ
      );

      if (Math.abs(applied.x - requestedX) > 0.0001) this.velocityX = 0;
      if (Math.abs(applied.z - requestedZ) > 0.0001) this.velocityZ = 0;

      const decay = Math.exp(-8 * dt);
      this.velocityX *= decay;
      this.velocityZ *= decay;
    }
  }

  private onContextMenu = (e: MouseEvent) => e.preventDefault();

  private bindEvents() {
    this.dom.addEventListener('mousedown', this.onPointerDown);
    window.addEventListener('mousemove', this.onPointerMove);
    window.addEventListener('mouseup', this.onPointerUp);

    this.dom.addEventListener('touchstart', this.onPointerDown, { passive: true });
    window.addEventListener('touchmove', this.onPointerMove, { passive: true });
    window.addEventListener('touchend', this.onPointerUp, { passive: true });
    window.addEventListener('touchcancel', this.onPointerUp, { passive: true });

    this.dom.addEventListener('wheel', this.onWheel, { passive: false });
    this.dom.addEventListener('contextmenu', this.onContextMenu);
  }

  public dispose() {
    this.dom.removeEventListener('mousedown', this.onPointerDown);
    window.removeEventListener('mousemove', this.onPointerMove);
    window.removeEventListener('mouseup', this.onPointerUp);

    this.dom.removeEventListener('touchstart', this.onPointerDown);
    window.removeEventListener('touchmove', this.onPointerMove);
    window.removeEventListener('touchend', this.onPointerUp);
    window.removeEventListener('touchcancel', this.onPointerUp);

    this.dom.removeEventListener('wheel', this.onWheel);
    this.dom.removeEventListener('contextmenu', this.onContextMenu);
  }
}
