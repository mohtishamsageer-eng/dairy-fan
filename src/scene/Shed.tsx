"use client";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { DairyFan, type FanState } from "./DairyFan";

export const FAN_SLOTS = [-6, -3, 0, 3, 6].map((x) => new THREE.Vector3(x, 3.05, -3.15));
const box = new THREE.BoxGeometry(1, 1, 1);

function useMats() {
  return useMemo(() => ({
    floor: new THREE.MeshStandardMaterial({ color: "#121C25", roughness: 0.95 }),
    lane: new THREE.MeshStandardMaterial({ color: "#1C2B38", roughness: 0.95 }),
    col: new THREE.MeshStandardMaterial({ color: "#8E9AA2", roughness: 0.6, metalness: 0.5 }),
    roof: new THREE.MeshStandardMaterial({ color: "#3A4F5E", roughness: 0.7, metalness: 0.3, side: THREE.DoubleSide }),
    black: new THREE.MeshStandardMaterial({ color: "#1E2224", roughness: 0.85 }),
    white: new THREE.MeshStandardMaterial({ color: "#E7EBED", roughness: 0.85 }),
    brown: new THREE.MeshStandardMaterial({ color: "#6B4A36", roughness: 0.9 }),
    pipe: new THREE.MeshStandardMaterial({ color: "#7AB3CC", roughness: 0.4, metalness: 0.4 }),
  }), []);
}
type M = ReturnType<typeof useMats>;
const B = ({ p, s, m, r }: { p: [number, number, number]; s: [number, number, number]; m: THREE.Material; r?: [number, number, number] }) => (
  <mesh geometry={box} material={m} position={p} scale={s} rotation={r} />
);

function Cow({ m, x, z, yaw, tone }: { m: M; x: number; z: number; yaw: number; tone: 0 | 1 | 2 }) {
  const body = tone === 2 ? m.brown : m.white;
  const patch = tone === 2 ? m.white : m.black;
  const head = useRef<THREE.Group>(null!);
  const seed = useMemo(() => Math.random() * 6, []);
  useFrame((s) => { head.current.rotation.z = -0.25 + Math.sin(s.clock.elapsedTime * 0.7 + seed) * 0.08; });
  return (
    <group position={[x, 0, z]} rotation={[0, yaw, 0]}>
      <B p={[0, 1.05, 0]} s={[2, 0.95, 0.85]} m={body} />
      <B p={[-0.3, 1.1, 0]} s={[0.8, 0.98, 0.87]} m={patch} />
      <B p={[0.6, 1.16, 0.02]} s={[0.5, 0.5, 0.88]} m={tone === 1 ? m.white : patch} />
      {[[-0.75, -0.27], [-0.75, 0.27], [0.75, -0.27], [0.75, 0.27]].map(([lx, lz], i) => <B key={i} p={[lx, 0.3, lz]} s={[0.2, 0.62, 0.2]} m={body} />)}
      <group ref={head} position={[1.0, 1.3, 0]}>
        <B p={[0.3, 0.05, 0]} s={[0.75, 0.42, 0.4]} m={body} />
        <B p={[0.62, 0.0, 0]} s={[0.25, 0.3, 0.32]} m={m.black} />
        <B p={[0.12, 0.3, 0.26]} s={[0.12, 0.08, 0.14]} m={patch} />
        <B p={[0.12, 0.3, -0.26]} s={[0.12, 0.08, 0.14]} m={patch} />
      </group>
      <B p={[-1.05, 1.0, 0]} s={[0.08, 0.7, 0.08]} m={patch} r={[0, 0, 0.12]} />
    </group>
  );
}

const mistVert = /* glsl */ `
uniform float uTime, uOpacity, uPx;
attribute vec4 aSeed;
varying float vA;
void main() {
  float t = fract(aSeed.w + uTime * (0.35 + aSeed.y * 0.3));
  vec3 p = vec3(-6.8 + aSeed.x * 13.6, 3.35 - t * 3.3, -1.2 + aSeed.z * 1.2 + sin(uTime + aSeed.x * 20.0) * 0.05);
  vA = (1.0 - t * 0.6) * uOpacity;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = 0.045 * uPx / max(0.1, -mv.z);
  gl_Position = projectionMatrix * mv;
}`;
const mistFrag = /* glsl */ `
varying float vA;
void main() { float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.1, d) * vA * 0.7; if (a < 0.004) discard; gl_FragColor = vec4(0.8, 0.93, 1.0, a); }`;

function Mist({ level, count }: { level: { v: number }; count: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const { size, viewport, camera } = useThree();
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry(); const seed = new Float32Array(count * 4);
    for (let i = 0; i < seed.length; i++) seed[i] = Math.random();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4)); return g;
  }, [count]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uOpacity: { value: 0 }, uPx: { value: 600 } }), []);
  useFrame((s) => {
    const u = mat.current.uniforms; u.uTime.value = s.clock.elapsedTime; u.uOpacity.value = level.v;
    const fov = ((camera as THREE.PerspectiveCamera).fov * Math.PI) / 180;
    u.uPx.value = (size.height * viewport.dpr) / (2 * Math.tan(fov / 2));
  });
  return (
    <points geometry={geom} frustumCulled={false}>
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={mistVert} fragmentShader={mistFrag} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/** Low-poly cattle shed. Slot 0 is where the hero fan lands; other slots get their own (low-detail) fans. */
export function Shed({ mist, quality }: { mist: { v: number }; quality: "high" | "low" }) {
  const m = useMats();
  const fanState = useMemo<FanState[]>(() => FAN_SLOTS.map((_, i) => ({ rpm: 13 + i * 0.7, explode: 0, labels: 0 })), []);
  const cols = [-6, -3, 0, 3, 6];
  return (
    <group>
      <mesh material={m.floor} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.5]}><planeGeometry args={[22, 15]} /></mesh>
      {[-1.2, 2.2].map((z) => <B key={z} p={[0, 0.012, z]} s={[17, 0.01, 2.2]} m={m.lane} />)}
      {/* columns + trusses: fan row at the back, two end trusses, long beams */}
      {cols.map((x) => <B key={x} p={[x, 1.9, -3.75]} s={[0.22, 3.8, 0.22]} m={m.col} />)}
      {[-7.5, 7.5].map((x) => (
        <group key={"e" + x}>
          <B p={[x, 1.9, -3.75]} s={[0.26, 3.8, 0.26]} m={m.col} />
          <B p={[x, 1.9, 4.2]} s={[0.26, 3.8, 0.26]} m={m.col} />
          <B p={[x, 3.85, 0.22]} s={[0.14, 0.14, 8.1]} m={m.col} />
          <B p={[x, 4.55, -1.9]} s={[0.1, 0.1, 4.5]} m={m.col} r={[0.36, 0, 0]} />
          <B p={[x, 4.55, 2.35]} s={[0.1, 0.1, 4.5]} m={m.col} r={[-0.36, 0, 0]} />
        </group>
      ))}
      <B p={[0, 3.85, -3.75]} s={[15.4, 0.14, 0.14]} m={m.col} />
      <B p={[0, 3.85, 4.2]} s={[15.4, 0.14, 0.14]} m={m.col} />
      <B p={[0, 5.25, 0.22]} s={[15.4, 0.12, 0.12]} m={m.col} />
      <B p={[0, 4.45, -1.9]} s={[16, 0.05, 4.3]} m={m.roof} r={[0.36, 0, 0]} />
      <B p={[0, 4.45, 2.4]} s={[16, 0.05, 4.3]} m={m.roof} r={[-0.36, 0, 0]} />
      {/* shower line */}
      <mesh material={m.pipe} position={[0, 3.35, -1.2]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.04, 0.04, 14, 8]} /></mesh>
      <B p={[0, 3.6, -1.2]} s={[14, 0.03, 0.03]} m={m.col} />
      {/* fans on the columns (slot 0 is the hero fan) */}
      {FAN_SLOTS.map((p, i) => (
        <group key={i}>
          <B p={[p.x, p.y + 0.4, p.z - 0.45]} s={[0.1, 0.1, 0.9]} m={m.col} />
          {i > 0 && (
            <group position={p} scale={0.75} rotation={[0.38, 0, 0]}>
              <DairyFan state={fanState[i]} detail="low" flowCount={quality === "high" ? 140 : 60} />
            </group>
          )}
        </group>
      ))}
      {/* cattle */}
      {[-5.2, -2.6, 0, 2.6, 5.2].map((x, i) => <Cow key={"a" + i} m={m} x={x + 0.3} z={-1.9} yaw={i % 2 ? 0 : Math.PI} tone={(i % 3) as 0 | 1 | 2} />)}
      {[-4.4, -1.4, 1.5, 4.5].map((x, i) => <Cow key={"b" + i} m={m} x={x} z={2.2} yaw={i % 2 ? Math.PI : 0.2} tone={((i + 1) % 3) as 0 | 1 | 2} />)}
      <Mist level={mist} count={quality === "high" ? 900 : 350} />
    </group>
  );
}
