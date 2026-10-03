"use client";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";

export type Level = { v: number };

const vert = /* glsl */ `
uniform float uTime, uOpacity, uLen, uR, uPx, uSize;
attribute vec4 aSeed;
varying float vA;
void main() {
  float t = fract(aSeed.z + uTime * 0.2 * (0.7 + aSeed.w * 0.6));
  float rad = aSeed.y * uR * (1.0 + t * 0.3);
  float ang = aSeed.x + t * 2.4 * (aSeed.w - 0.5) + uTime * 0.15;
  vec3 p = vec3(cos(ang) * rad, sin(ang) * rad, 0.1 + t * uLen);
  vA = sin(t * 3.14159) * uOpacity;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = min(18.0, uSize * (0.6 + aSeed.w * 0.9) * uPx / max(0.1, -mv.z));
  vA *= smoothstep(1.2, 3.0, -mv.z);
  gl_Position = projectionMatrix * mv;
}`;
const frag = /* glsl */ `
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d) * vA * 0.3;
  if (a < 0.003) discard;
  gl_FragColor = vec4(0.72, 0.9, 1.0, a);
}`;

/** GPU particle stream blowing out of the fan front (+Z). Everything is computed in the vertex shader. */
export function Airflow({ level, count = 500, length = 5, radius = 0.85, size = 0.03 }: {
  level: Level; count?: number; length?: number; radius?: number; size?: number;
}) {
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const { size: vp, viewport, camera } = useThree();
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const seed = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      seed[i * 4] = Math.random() * Math.PI * 2;
      seed[i * 4 + 1] = Math.sqrt(Math.random());
      seed[i * 4 + 2] = Math.random();
      seed[i * 4 + 3] = Math.random();
    }
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
    return g;
  }, [count]);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uOpacity: { value: 0 }, uLen: { value: length }, uR: { value: radius },
    uPx: { value: 600 }, uSize: { value: size },
  }), [length, radius, size]);

  useFrame((state) => {
    const u = mat.current.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uOpacity.value = level.v;
    const fov = ((camera as THREE.PerspectiveCamera).fov * Math.PI) / 180;
    u.uPx.value = (vp.height * viewport.dpr) / (2 * Math.tan(fov / 2));
  });

  return (
    <points geometry={geom} frustumCulled={false} visible={true}>
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={vert} fragmentShader={frag}
        transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}
