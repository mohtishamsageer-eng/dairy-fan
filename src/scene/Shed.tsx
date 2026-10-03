"use client";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import { DairyFan, type FanState } from "./DairyFan";

/*
  Free-stall dairy shed modelled on the reference photos:
  maroon steel portal frames, grey corrugated roof with a skylight ridge, a central concrete
  feed alley with hay windrows, blue head-lock rails, Holsteins eating on both sides, and fans
  hung from the rafters above each cow row, tilted down and blowing along the shed (+Z).
  The shed runs along Z; the camera looks down the alley from the open end (+Z).
*/

const LEN0 = 8, LEN1 = -28;                  // shed extent along Z
const FRAMES = Array.from({ length: 10 }, (_, i) => LEN0 - 2 - i * 4);
const HALF = 8;                              // half width (outer walls)
const RAIL = 2.35;                           // head-lock rail line
const EAVE = 4.2, RIDGE = 6.6;
const roofY = (x: number) => RIDGE - (Math.abs(x) / HALF) * (RIDGE - EAVE);
const PITCH = Math.atan((RIDGE - EAVE) / HALF);

/** Fan positions: over each cow row, every 8 m. Slot 0 is where the hero fan lands. */
export const FAN_SLOTS = [4, -4, -12, -20].flatMap((z) => [-3.6, 3.6].map((x) => new THREE.Vector3(x, 4.15, z)));
export const FAN_SCALE = 0.75;
export const FAN_TILT = 0.36;

const box = new THREE.BoxGeometry(1, 1, 1);

function corrugated(color: string, light: string) {
  const c = document.createElement("canvas"); c.width = 64; c.height = 8;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 64, 0);
  for (let i = 0; i <= 8; i++) grad.addColorStop(i / 8, i % 2 ? color : light);
  g.fillStyle = grad; g.fillRect(0, 0, 64, 8);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function noise(size = 128, base = 150, amp = 90) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  const g = c.getContext("2d")!; const img = g.createImageData(size, size);
  for (let i = 0; i < size * size; i++) { const v = base + (Math.random() - 0.5) * amp; img.data.set([v, v, v, 255], i * 4); }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

function useMats() {
  return useMemo(() => {
    const roofTex = corrugated("#B9C1C6", "#E3E8EA"); roofTex.repeat.set(26, 1);
    const hayTex = noise(128, 160, 120); hayTex.repeat.set(2, 40);
    const conc = noise(256, 170, 40); conc.repeat.set(4, 20);
    return {
      alley: new THREE.MeshStandardMaterial({ color: "#A9A79F", roughness: 0.85, map: conc }),
      stall: new THREE.MeshStandardMaterial({ color: "#6E7270", roughness: 0.9 }),
      curb: new THREE.MeshStandardMaterial({ color: "#C9C7BF", roughness: 0.8 }),
      hay: new THREE.MeshStandardMaterial({ color: "#C9A65A", roughness: 1, bumpMap: hayTex, bumpScale: 2 }),
      frame: new THREE.MeshStandardMaterial({ color: "#6F2622", roughness: 0.55, metalness: 0.3 }),
      roof: new THREE.MeshStandardMaterial({ color: "#FFFFFF", map: roofTex, roughness: 0.5, metalness: 0.45, side: THREE.DoubleSide }),
      ground: new THREE.MeshStandardMaterial({ color: "#B59D78", roughness: 1 }),
      sky: new THREE.MeshBasicMaterial({ color: "#F6F9FA", toneMapped: false, fog: false }),
      rail: new THREE.MeshStandardMaterial({ color: "#2F6DB3", roughness: 0.4, metalness: 0.45 }),
      rod: new THREE.MeshStandardMaterial({ color: "#9AA3A8", roughness: 0.4, metalness: 0.8 }),
      wall: new THREE.MeshStandardMaterial({ color: "#D9D6CF", roughness: 0.9 }),
      pipe: new THREE.MeshStandardMaterial({ color: "#B8C0C4", roughness: 0.35, metalness: 0.8 }),
      white: new THREE.MeshStandardMaterial({ color: "#F2F1EC", roughness: 0.85 }),
      black: new THREE.MeshStandardMaterial({ color: "#1B1D1F", roughness: 0.75 }),
      pink: new THREE.MeshStandardMaterial({ color: "#D7A39A", roughness: 0.8 }),
      tag: new THREE.MeshStandardMaterial({ color: "#E9C21D", roughness: 0.5 }),
    };
  }, []);
}
type M = ReturnType<typeof useMats>;

const B = ({ p, s, m, r }: { p: [number, number, number]; s: [number, number, number]; m: THREE.Material; r?: [number, number, number] }) => (
  <mesh geometry={box} material={m} position={p} scale={s} rotation={r} />
);

/** Many boxes sharing one material → one draw call. */
function Boxes({ mats, material }: { mats: THREE.Matrix4[]; material: THREE.Material }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  useLayoutEffect(() => {
    mats.forEach((mm, i) => ref.current.setMatrixAt(i, mm));
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [mats]);
  return <instancedMesh ref={ref} args={[box, material, mats.length]} frustumCulled={false} />;
}

// ── cows: rounded low-poly Holsteins, instanced by (geometry, material): ~12 draw calls for the whole herd
function holstein(seed: number) {
  const c = document.createElement("canvas"); c.width = 256; c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#F2F1EC"; g.fillRect(0, 0, 256, 128);
  let r = seed * 9301 + 49297; const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  g.fillStyle = "#17191A";
  for (let k = 0; k < 7; k++) {
    const cx = rnd() * 256, cy = rnd() * 128, size = 14 + rnd() * 26;
    for (let j = 0; j < 9; j++) { g.beginPath(); g.ellipse((cx + (rnd() - 0.5) * size * 1.4) % 256, cy + (rnd() - 0.5) * size, size * (0.4 + rnd() * 0.5), size * (0.35 + rnd() * 0.4), rnd() * 3, 0, Math.PI * 2); g.fill(); }
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t;
}
const COW_GEO = (() => {
  const body = new THREE.CapsuleGeometry(0.4, 1.05, 6, 16); body.rotateZ(Math.PI / 2);
  const neck = new THREE.CylinderGeometry(0.16, 0.22, 0.5, 10); neck.rotateZ(Math.PI / 2);
  const head = new THREE.CapsuleGeometry(0.15, 0.3, 4, 10); head.rotateZ(Math.PI / 2);
  return {
    body, neck, head,
    leg: new THREE.CylinderGeometry(0.075, 0.058, 0.72, 8),
    ball: new THREE.SphereGeometry(0.14, 10, 8),
    tail: new THREE.CylinderGeometry(0.02, 0.015, 0.75, 5),
    box,
  };
})();
type GeoKey = keyof typeof COW_GEO;
type Piece = { g: GeoKey; m: string; p: [number, number, number]; s?: [number, number, number]; r?: [number, number, number]; head?: boolean };
const COW: Piece[] = [
  { g: "leg", m: "white", p: [0.6, 0.36, 0.2] }, { g: "leg", m: "black", p: [0.6, 0.36, -0.2] },
  { g: "leg", m: "white", p: [-0.6, 0.36, 0.2] }, { g: "leg", m: "white", p: [-0.6, 0.36, -0.2] },
  { g: "ball", m: "pink", p: [-0.42, 0.7, 0], s: [1.3, 0.8, 1.3] },
  { g: "tail", m: "black", p: [-1.0, 0.82, 0], r: [0, 0, -0.12] },
  { g: "neck", m: "black", p: [0.22, 0, 0], head: true },
  { g: "head", m: "black", p: [0.62, -0.03, 0], head: true },
  { g: "box", m: "white", p: [0.64, 0.1, 0], s: [0.36, 0.08, 0.13], head: true },
  { g: "ball", m: "pink", p: [0.9, -0.06, 0], s: [0.85, 0.95, 1.05], head: true },
  { g: "box", m: "black", p: [0.44, 0.08, 0.19], s: [0.08, 0.04, 0.2], r: [0.3, 0, 0], head: true },
  { g: "box", m: "black", p: [0.44, 0.08, -0.19], s: [0.08, 0.04, 0.2], r: [-0.3, 0, 0], head: true },
  { g: "box", m: "tag", p: [0.44, 0.04, 0.29], s: [0.025, 0.09, 0.07], head: true },
  { g: "box", m: "tag", p: [0.44, 0.04, -0.29], s: [0.025, 0.09, 0.07], head: true },
];

function useHerd(m: M) {
  return useMemo(() => {
    const bodyMats = [1, 2, 3].map((k) => new THREE.MeshStandardMaterial({ map: holstein(k), roughness: 0.8 }));
    const mats: Record<string, THREE.Material> = { white: m.white, black: m.black, pink: m.pink, tag: m.tag, b0: bodyMats[0], b1: bodyMats[1], b2: bodyMats[2] };
    const groups = new Map<string, { geo: THREE.BufferGeometry; mat: THREE.Material; list: THREE.Matrix4[] }>();
    const push = (g: GeoKey, mk: string, mx: THREE.Matrix4) => {
      const key = g + "|" + mk;
      if (!groups.has(key)) groups.set(key, { geo: COW_GEO[g], mat: mats[mk], list: [] });
      groups.get(key)!.list.push(mx);
    };
    const cow = new THREE.Matrix4(), head = new THREE.Matrix4(), part = new THREE.Matrix4(), tmp = new THREE.Matrix4();
    const q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();
    let n = 0;
    for (const side of [-1, 1]) {
      for (let z = LEN0 - 3.2; z > LEN1 + 3; z -= 1.08) {
        n++;
        if ((n * 7) % 11 === 0) continue;                       // a few gaps so the row looks natural
        const yaw = (side < 0 ? 0 : Math.PI) + (((n * 3) % 5) - 2) * 0.04;
        cow.compose(v.set(side * (RAIL + 0.85 + ((n * 13) % 5) * 0.04), 0, z), q.setFromEuler(e.set(0, yaw, 0)), sc.set(1, 1, 1));
        const eating = n % 6 !== 0;
        head.copy(cow).multiply(tmp.compose(v.set(0.75, 1.2, 0), q.setFromEuler(e.set(((n * 5) % 3 - 1) * 0.12, 0, eating ? -0.95 - ((n * 7) % 3) * 0.06 : -0.25)), sc.set(1, 1, 1)));
        push("body", "b" + (n % 3), new THREE.Matrix4().multiplyMatrices(cow, part.compose(v.set(0, 1.08, 0), q.identity(), sc.set(1, 1, 0.82))));
        for (const pc of COW) {
          part.compose(v.set(...pc.p), q.setFromEuler(e.set(...(pc.r ?? [0, 0, 0]))), sc.set(...(pc.s ?? [1, 1, 1])));
          push(pc.g, pc.m, new THREE.Matrix4().multiplyMatrices(pc.head ? head : cow, part));
        }
      }
    }
    return [...groups.values()];
  }, [m]);
}

function Herd({ m }: { m: M }) {
  const groups = useHerd(m);
  return <>{groups.map((g, i) => <InstancedGeo key={i} geo={g.geo} mat={g.mat} mats={g.list} />)}</>;
}
function InstancedGeo({ geo, mat, mats }: { geo: THREE.BufferGeometry; mat: THREE.Material; mats: THREE.Matrix4[] }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  useLayoutEffect(() => {
    mats.forEach((mm, i) => ref.current.setMatrixAt(i, mm));
    ref.current.instanceMatrix.needsUpdate = true;
  }, [mats]);
  return <instancedMesh ref={ref} args={[geo, mat, mats.length]} frustumCulled={false} />;
}

function useRails() {
  return useMemo(() => {
    const out: THREE.Matrix4[] = []; const q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3();
    for (const side of [-1, 1]) {
      const x = side * RAIL;
      for (const y of [0.55, 1.32]) out.push(new THREE.Matrix4().compose(v.set(x, y, (LEN0 + LEN1) / 2), q, s.set(0.06, 0.06, LEN0 - LEN1 - 1)));
      for (let z = LEN0 - 1; z > LEN1 + 0.5; z -= 0.56) out.push(new THREE.Matrix4().compose(v.set(x, 0.95, z), q, s.set(0.04, 0.95, 0.04)));
    }
    return out;
  }, []);
}

const mistVert = /* glsl */ `
uniform float uTime, uOpacity, uPx;
attribute vec4 aSeed;
varying float vA;
void main() {
  float t = fract(aSeed.w + uTime * (0.35 + aSeed.y * 0.3));
  float side = aSeed.x < 0.5 ? -1.0 : 1.0;
  vec3 p = vec3(side * (3.5 + (fract(aSeed.x * 17.0) - 0.5) * 1.6), 3.1 - t * 2.9, 6.0 - aSeed.z * 30.0);
  vA = (1.0 - t * 0.6) * uOpacity;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = min(10.0, 0.04 * uPx / max(0.1, -mv.z));
  gl_Position = projectionMatrix * mv;
}`;
const mistFrag = /* glsl */ `
varying float vA;
void main() { float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.1, d) * vA * 0.75; if (a < 0.004) discard; gl_FragColor = vec4(0.86, 0.95, 1.0, a); }`;

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

export function Shed({ mist, quality }: { mist: { v: number }; quality: "high" | "low" }) {
  const m = useMats();
  const rails = useRails();
  const fanState = useMemo<FanState[]>(() => FAN_SLOTS.map((_, i) => ({ rpm: 13 + (i % 3) * 0.8, explode: 0, labels: 0 })), []);
  const L = LEN0 - LEN1, ZC = (LEN0 + LEN1) / 2;
  const rafterLen = Math.hypot(HALF, RIDGE - EAVE);

  return (
    <group>
      <mesh material={m.ground} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, ZC]}><planeGeometry args={[140, 140]} /></mesh>
      {/* floor: alley, feed curbs, hay windrows, stall beds, outer passages */}
      <mesh material={m.alley} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, ZC]}><planeGeometry args={[RAIL * 2, L]} /></mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh material={m.stall} rotation={[-Math.PI / 2, 0, 0]} position={[s * (RAIL + 2.8), 0.005, ZC]}><planeGeometry args={[5.6, L]} /></mesh>
          <B p={[s * (RAIL - 0.08), 0.18, ZC]} s={[0.28, 0.36, L]} m={m.curb} />
          <B p={[s * (RAIL - 0.75), 0.1, ZC]} s={[0.95, 0.24, L - 1]} m={m.hay} r={[0, 0, s * 0.06]} />
          <B p={[s * HALF, 0.6, ZC]} s={[0.25, 1.2, L]} m={m.wall} />
          {/* shower line above the cows */}
          <mesh material={m.pipe} position={[s * 3.5, 3.15, ZC]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.035, 0.035, L, 8]} /></mesh>
        </group>
      ))}
      {/* bright far end, like the open gable in the photos */}
      <mesh material={m.sky} position={[0, 2.8, LEN1 - 0.2]}><planeGeometry args={[HALF * 2, 5.6]} /></mesh>

      {/* maroon portal frames */}
      {FRAMES.map((z) => (
        <group key={z}>
          {[-1, 1].map((s) => (
            <group key={s}>
              <B p={[s * (RAIL + 0.12), roofY(RAIL) / 2, z]} s={[0.22, roofY(RAIL), 0.3]} m={m.frame} />
              <B p={[s * (HALF - 0.1), EAVE / 2, z]} s={[0.22, EAVE, 0.3]} m={m.frame} />
              <B p={[s * HALF / 2, (EAVE + RIDGE) / 2 - 0.12, z]} s={[rafterLen, 0.3, 0.16]} m={m.frame} r={[0, 0, -s * PITCH]} />
              <B p={[s * 4.6, roofY(4.6) - 0.8, z]} s={[0.07, 1.4, 0.07]} m={m.frame} r={[0, 0, s * 0.55]} />
            </group>
          ))}
        </group>
      ))}
      {/* purlin + eave beams along the shed */}
      {[-1, 1].map((s) => [0.5, 2.5, 4.5, 6.5].map((x) => (
        <B key={s + "p" + x} p={[s * x, roofY(x) - 0.22, ZC]} s={[0.08, 0.12, L]} m={m.frame} />
      )))}
      {/* roof sheets + skylight ridge */}
      {[-1, 1].map((s) => (
        <mesh key={"r" + s} material={m.roof} position={[s * HALF / 2, (EAVE + RIDGE) / 2 + 0.06, ZC]} rotation={[0, 0, -s * PITCH]}>
          <boxGeometry args={[rafterLen + 0.4, 0.04, L + 0.6]} />
        </mesh>
      ))}
      <B p={[0, RIDGE + 0.12, ZC]} s={[0.9, 0.04, L + 0.6]} m={m.sky} />

      <Boxes mats={rails} material={m.rail} />
      <Herd m={m} />

      {/* fans hung from the rafters (slot 0 = hero fan) */}
      {FAN_SLOTS.map((p, i) => (
        <group key={i}>
          {[-0.35, 0.35].map((dx) => (
            <B key={dx} p={[p.x + dx, (p.y + FAN_SCALE + roofY(p.x)) / 2, p.z - 0.15]} s={[0.035, roofY(p.x) - p.y - FAN_SCALE, 0.035]} m={m.rod} />
          ))}
          {i > 0 && (
            <group position={p} scale={FAN_SCALE} rotation={[FAN_TILT, 0, 0]}>
              <DairyFan state={fanState[i]} detail="low" flowCount={quality === "high" ? 110 : 45} />
            </group>
          )}
        </group>
      ))}
      <Mist level={mist} count={quality === "high" ? 1400 : 500} />
    </group>
  );
}
