/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface CityTouchControllerOptions {
  domElement: HTMLElement;
  camera: THREE.PerspectiveCamera;
  cameraTargetPos: React.MutableRefObject<THREE.Vector3>;
  cameraLookAtPos: React.MutableRefObject<THREE.Vector3>;
  onTapRaycast: (normalizedX: number, normalizedY: number) => void;
}

/**
 * Bounds for camera movement
 */
const BOUNDS = {
  minY: 10,
  maxY: 70,
  minZ: -45,
  maxZ: 85,
  minX: -55,
  maxX: 55,
  lookAtMinX: -45,
  lookAtMaxX: 45,
  lookAtMinZ: -40,
  lookAtMaxZ: 40,
};

export class CityTouchController {
  private dom: HTMLElement;
  private camera: THREE.PerspectiveCamera;
  private targetPos: React.MutableRefObject<THREE.Vector3>;
  private lookAtPos: React.MutableRefObject<THREE.Vector3>;
  private onTapRaycast: (x: number, y: number) => void;

  private isPointerDown = false;
  private isPinching = false;
  private startX = 0;
  private startY = 0;
  private lastX = 0;
  private lastY = 0;
  private pinchStartDistance = 0;
  private pinchStartAngle = 0;
  private dragDistance = 0;

  // Velocity for smooth touch inertia on mobile
  private velocityX = 0;
  private velocityZ = 0;

  constructor(options: CityTouchControllerOptions) {
    this.dom = options.domElement;
    this.camera = options.camera;
    this.targetPos = options.cameraTargetPos;
    this.lookAtPos = options.cameraLookAtPos;
    this.onTapRaycast = options.onTapRaycast;

    this.bindEvents();
  }

  private onPointerDown = (e: MouseEvent | TouchEvent) => {
    this.isPointerDown = true;
    this.dragDistance = 0;
    this.velocityX = 0;
    this.velocityZ = 0;

    if ('touches' in e) {
      if (e.touches.length === 1) {
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
        this.lastX = this.startX;
        this.lastY = this.startY;
      } else if (e.touches.length === 2) {
        this.isPinching = true;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        this.pinchStartDistance = Math.hypot(dx, dy);
        this.pinchStartAngle = Math.atan2(dy, dx);
      }
    } else {
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.lastX = this.startX;
      this.lastY = this.startY;
    }
  };

  private onPointerMove = (e: MouseEvent | TouchEvent) => {
    if (!this.isPointerDown) return;

    if ('touches' in e && e.touches.length === 2 && this.isPinching) {
      // 1. Two-Finger Pinch (Zoom & Pitch Tilt)
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.hypot(dx, dy);
      const deltaDist = this.pinchStartDistance - currentDist;
      this.pinchStartDistance = currentDist;

      const zoomFactor = deltaDist * 0.12;
      this.targetPos.current.y = THREE.MathUtils.clamp(
        this.targetPos.current.y + zoomFactor,
        BOUNDS.minY,
        BOUNDS.maxY
      );
      this.targetPos.current.z = THREE.MathUtils.clamp(
        this.targetPos.current.z + zoomFactor * 1.3,
        BOUNDS.minZ,
        BOUNDS.maxZ
      );

      // 2. Two-Finger Rotation (Twist yaw around lookAt point)
      const currentAngle = Math.atan2(dy, dx);
      const deltaAngle = currentAngle - this.pinchStartAngle;
      if (Math.abs(deltaAngle) < 0.5) {
        this.rotateAroundLookAt(-deltaAngle * 0.85);
      }
      this.pinchStartAngle = currentAngle;

      this.dragDistance += Math.abs(deltaDist);
      return;
    }

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - this.lastX;
    const deltaY = clientY - this.lastY;

    this.dragDistance += Math.hypot(deltaX, deltaY);

    const isRotateMode =
      ('button' in e && (e.button === 2 || (e.button === 0 && e.ctrlKey))) ||
      ('shiftKey' in e && e.shiftKey);

    if (isRotateMode) {
      // Orbit Yaw Rotation
      const angle = -deltaX * 0.007;
      this.rotateAroundLookAt(angle);
    } else {
      // Fluid Pan scaled to camera altitude
      const panSpeed = (this.targetPos.current.y / 36) * 0.048;
      const moveX = -deltaX * panSpeed;
      const moveZ = -deltaY * panSpeed;

      this.targetPos.current.x = THREE.MathUtils.clamp(
        this.targetPos.current.x + moveX,
        BOUNDS.minX,
        BOUNDS.maxX
      );
      this.targetPos.current.z = THREE.MathUtils.clamp(
        this.targetPos.current.z + moveZ,
        BOUNDS.minZ,
        BOUNDS.maxZ
      );

      this.lookAtPos.current.x = THREE.MathUtils.clamp(
        this.lookAtPos.current.x + moveX,
        BOUNDS.lookAtMinX,
        BOUNDS.lookAtMaxX
      );
      this.lookAtPos.current.z = THREE.MathUtils.clamp(
        this.lookAtPos.current.z + moveZ,
        BOUNDS.lookAtMinZ,
        BOUNDS.lookAtMaxZ
      );

      this.velocityX = moveX * 0.4;
      this.velocityZ = moveZ * 0.4;
    }

    this.lastX = clientX;
    this.lastY = clientY;
  };

  private onPointerUp = (e: MouseEvent | TouchEvent) => {
    // If user dragged less than 6 pixels, treat it as a precision tap/click
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
    e.preventDefault();
    const zoomDelta = e.deltaY * 0.035;

    this.targetPos.current.y = THREE.MathUtils.clamp(
      this.targetPos.current.y + zoomDelta,
      BOUNDS.minY,
      BOUNDS.maxY
    );
    this.targetPos.current.z = THREE.MathUtils.clamp(
      this.targetPos.current.z + zoomDelta * 1.25,
      BOUNDS.minZ,
      BOUNDS.maxZ
    );
  };

  public rotateAroundLookAt(angleRad: number) {
    const offset = new THREE.Vector3().subVectors(this.targetPos.current, this.lookAtPos.current);
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angleRad);
    this.targetPos.current.copy(this.lookAtPos.current).add(offset);
  }

  public zoomStep(direction: 'in' | 'out') {
    const delta = direction === 'in' ? -6 : 6;
    this.targetPos.current.y = THREE.MathUtils.clamp(
      this.targetPos.current.y + delta,
      BOUNDS.minY,
      BOUNDS.maxY
    );
    this.targetPos.current.z = THREE.MathUtils.clamp(
      this.targetPos.current.z + delta * 1.25,
      BOUNDS.minZ,
      BOUNDS.maxZ
    );
  }

  public resetToNorth() {
    // Reset camera orientation to facing true North
    const distance = Math.hypot(
      this.targetPos.current.x - this.lookAtPos.current.x,
      this.targetPos.current.z - this.lookAtPos.current.z
    );
    this.targetPos.current.x = this.lookAtPos.current.x;
    this.targetPos.current.z = this.lookAtPos.current.z + distance;
  }

  public updateInertia(dt: number) {
    if (!this.isPointerDown && (Math.abs(this.velocityX) > 0.001 || Math.abs(this.velocityZ) > 0.001)) {
      this.targetPos.current.x = THREE.MathUtils.clamp(
        this.targetPos.current.x + this.velocityX,
        BOUNDS.minX,
        BOUNDS.maxX
      );
      this.targetPos.current.z = THREE.MathUtils.clamp(
        this.targetPos.current.z + this.velocityZ,
        BOUNDS.minZ,
        BOUNDS.maxZ
      );

      this.lookAtPos.current.x = THREE.MathUtils.clamp(
        this.lookAtPos.current.x + this.velocityX,
        BOUNDS.lookAtMinX,
        BOUNDS.lookAtMaxX
      );
      this.lookAtPos.current.z = THREE.MathUtils.clamp(
        this.lookAtPos.current.z + this.velocityZ,
        BOUNDS.lookAtMinZ,
        BOUNDS.lookAtMaxZ
      );

      // Exponential decay
      const decay = Math.exp(-8 * dt);
      this.velocityX *= decay;
      this.velocityZ *= decay;
    }
  }

  private bindEvents() {
    this.dom.addEventListener('mousedown', this.onPointerDown);
    window.addEventListener('mousemove', this.onPointerMove);
    window.addEventListener('mouseup', this.onPointerUp);

    this.dom.addEventListener('touchstart', this.onPointerDown, { passive: true });
    window.addEventListener('touchmove', this.onPointerMove, { passive: true });
    window.addEventListener('touchend', this.onPointerUp, { passive: true });

    this.dom.addEventListener('wheel', this.onWheel, { passive: false });
    this.dom.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  public dispose() {
    this.dom.removeEventListener('mousedown', this.onPointerDown);
    window.removeEventListener('mousemove', this.onPointerMove);
    window.removeEventListener('mouseup', this.onPointerUp);

    this.dom.removeEventListener('touchstart', this.onPointerDown);
    window.removeEventListener('touchmove', this.onPointerMove);
    window.removeEventListener('touchend', this.onPointerUp);

    this.dom.removeEventListener('wheel', this.onWheel);
  }
}
