/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

/**
 * Creates an animated realistic water shader material with sky reflection,
 * Fresnel viewing effects, gentle physical wave displacement, and sun specular shimmer.
 */
export function createRealisticWaterMaterial(isNightMode: boolean): THREE.ShaderMaterial {
  const uniforms = {
    uTime: { value: 0 },
    uSunDirection: {
      value: new THREE.Vector3(0.5, 0.8, 0.3).normalize(),
    },
    uDeepColor: {
      value: new THREE.Color(isNightMode ? '#031726' : '#033a5b'),
    },
    uShallowColor: {
      value: new THREE.Color(isNightMode ? '#082f49' : '#0284c7'),
    },
    uSkyColor: {
      value: new THREE.Color(isNightMode ? '#0f172a' : '#38bdf8'),
    },
    uSunGlintColor: {
      value: new THREE.Color(isNightMode ? '#7dd3fc' : '#fef08a'),
    },
    uWaveHeight: { value: 0.18 },
    uIsNight: { value: isNightMode ? 1.0 : 0.0 },
  };

  const vertexShader = /* glsl */ `
    uniform float uTime;
    uniform float uWaveHeight;
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying float vWaveElevation;

    // Multi-octave wave displacement
    float calculateWaveHeight(vec2 pos, float time) {
      float h = 0.0;
      // Primary swell
      h += sin(pos.x * 0.12 + time * 1.3) * 0.45;
      h += cos(pos.y * 0.15 + time * 1.1) * 0.40;
      // Secondary cross ripples
      h += sin((pos.x + pos.y) * 0.28 + time * 2.1) * 0.22;
      h += cos((pos.x * 0.8 - pos.y * 0.6) * 0.35 + time * 2.7) * 0.15;
      // High-frequency capillary ripples
      h += sin(pos.x * 0.7 - time * 3.4) * 0.08;
      h += cos(pos.y * 0.8 + time * 3.1) * 0.08;
      return h * uWaveHeight;
    }

    void main() {
      vUv = uv;
      vec3 displacedPos = position;

      // Calculate wave height at this vertex
      float elevation = calculateWaveHeight(position.xy, uTime);
      displacedPos.z += elevation;
      vWaveElevation = elevation;

      // Analytical normal calculation via finite differences
      float delta = 0.2;
      float hR = calculateWaveHeight(position.xy + vec2(delta, 0.0), uTime);
      float hU = calculateWaveHeight(position.xy + vec2(0.0, delta), uTime);
      vec3 tangentX = vec3(delta, 0.0, hR - elevation);
      vec3 tangentY = vec3(0.0, delta, hU - elevation);
      vec3 computedNormal = normalize(cross(tangentX, tangentY));

      vNormal = normalize(normalMatrix * computedNormal);

      vec4 worldPos = modelMatrix * vec4(displacedPos, 1.0);
      vWorldPosition = worldPos.xyz;

      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `;

  const fragmentShader = /* glsl */ `
    uniform float uTime;
    uniform vec3 uSunDirection;
    uniform vec3 uDeepColor;
    uniform vec3 uShallowColor;
    uniform vec3 uSkyColor;
    uniform vec3 uSunGlintColor;
    uniform float uIsNight;

    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying float vWaveElevation;

    void main() {
      // Normal perturbed with moving micro-noise
      vec3 N = normalize(vNormal);

      // View direction
      vec3 V = normalize(cameraPosition - vWorldPosition);

      // Fresnel reflection factor: glancing angles reflect more sky
      float fresnel = pow(1.0 - max(dot(V, N), 0.0), 3.0);
      fresnel = clamp(fresnel, 0.08, 0.88);

      // Base water depth color mix based on wave crests
      float waveFactor = smoothstep(-0.15, 0.15, vWaveElevation);
      vec3 waterColor = mix(uDeepColor, uShallowColor, waveFactor);

      // Sky reflection blend
      vec3 reflectedSky = mix(uSkyColor, vec3(1.0), fresnel * 0.35);
      vec3 finalColor = mix(waterColor, reflectedSky, fresnel);

      // Sun specular glint (Blinn-Phong)
      vec3 L = normalize(uSunDirection);
      vec3 H = normalize(L + V);
      float NdotH = max(dot(N, H), 0.0);
      float spec = pow(NdotH, uIsNight > 0.5 ? 40.0 : 120.0);
      vec3 specular = uSunGlintColor * spec * (uIsNight > 0.5 ? 0.45 : 1.4);

      // Soft white foam on highest wave peaks
      float foam = smoothstep(0.13, 0.17, vWaveElevation) * 0.4;
      finalColor = mix(finalColor + specular, vec3(0.92, 0.98, 1.0), foam);

      // Shoreline gentle caustics tint
      float caustics = sin(vWorldPosition.x * 0.8 + uTime * 2.0) * cos(vWorldPosition.z * 0.8 - uTime * 1.8);
      finalColor += vec3(0.04, 0.08, 0.12) * max(caustics, 0.0);

      gl_FragColor = vec4(finalColor, 0.92);
    }
  `;

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: true,
  });

  return mat;
}

/**
 * Creates dynamic fountain water material for plaza fountains
 */
export function createFountainWaterMaterial(isNightMode: boolean): THREE.ShaderMaterial {
  const uniforms = {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(isNightMode ? '#0284c7' : '#38bdf8') },
    uHighlight: { value: new THREE.Color(isNightMode ? '#38bdf8' : '#f0fdf4') },
  };

  const vertexShader = /* glsl */ `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec3 p = position;
      // Gentle bubbling ripple on top of fountain
      if (p.y > 0.1) {
        p.y += sin(length(p.xz) * 12.0 - uTime * 6.0) * 0.035;
      }
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `;

  const fragmentShader = /* glsl */ `
    uniform float uTime;
    uniform vec3 uColor;
    uniform vec3 uHighlight;
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      float ripple = sin(length(vUv - 0.5) * 35.0 - uTime * 5.0) * 0.5 + 0.5;
      vec3 col = mix(uColor, uHighlight, ripple * 0.4);
      gl_FragColor = vec4(col, 0.88);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
  });
}
