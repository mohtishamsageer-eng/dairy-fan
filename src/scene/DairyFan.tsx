"use client";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Airflow, type Level } from "./Airflow";

/** Mutable animation state shared with the page (GSAP writes it, useFrame reads it). */
export type FanState = { rpm: number; idle?: number; explode: number; labels: number };
export type PartLabels = Record<"guard" | "blades" | "hub" | "motor" | "bracket" | "drum", { t: string; s: string }>;

export const R = 1;      // drum radius
export const D = 0.5;    // drum depth (≈ 25% of the 2R diameter, from the reference video)
// colours sampled from the reference video of the real fan
const DRUM = "#7E9CA0";   // matte grey-teal powder coat
const WIRE = "#A8D8D4";   // pale aqua wire guard + front flat bars
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };

// ───────────────────────── procedural textures ─────────────────────────
function noiseTexture(size = 256, repeat = 8) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  const g = c.getContext("2d")!;
  const img = g.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const v = 110 + Math.random() * 90;
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat);
  return t;
}
function bladeTextTexture() {
  const c = document.createElement("canvas"); c.width = 128; c.height = 512;
  const g = c.getContext("2d")!;
  g.translate(64, 256); g.rotate(-Math.PI / 2);
  g.fillStyle = "rgba(176,184,190,0.9)";
  g.font = "700 64px 'Space Grotesk', Arial, sans-serif";
  g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText("KHALEEQ FAN", 0, 0);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
}
function blurDiscTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(128, 128, 18, 128, 128, 126);
  grad.addColorStop(0, "rgba(40,44,48,0)");
  grad.addColorStop(0.18, "rgba(40,44,48,0.55)");
  grad.addColorStop(0.8, "rgba(40,44,48,0.5)");
  grad.addColorStop(1, "rgba(40,44,48,0)");
  g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
  g.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 40; i++) {
    g.strokeStyle = `rgba(0,0,0,${Math.random() * 0.35})`; g.lineWidth = 1 + Math.random() * 2;
    g.beginPath(); g.arc(128, 128, 30 + Math.random() * 95, 0, Math.PI * 2); g.stroke();
  }
  return new THREE.CanvasTexture(c);
}

// ───────────────────────── geometry helpers ─────────────────────────
type Seg = [THREE.Vector3, THREE.Vector3];

function guardSegs(step: number, piece: number, rg: number, z0: number, dome: number) {
  const zAt = (x: number, y: number) => z0 + dome * (1 - (x * x + y * y) / (rg * rg));
  const wires: Seg[] = [];
  const line = (fixed: number, vertical: boolean) => {
    const half = Math.sqrt(rg * rg - fixed * fixed);
    const n = Math.max(2, Math.ceil((2 * half) / piece));
    for (let i = 0; i < n; i++) {
      const a = -half + (i * 2 * half) / n, b = -half + ((i + 1) * 2 * half) / n;
      const p = (s: number) => (vertical ? new THREE.Vector3(fixed, s, zAt(fixed, s)) : new THREE.Vector3(s, fixed, zAt(s, fixed)));
      wires.push([p(a), p(b)]);
    }
  };
  const k = Math.floor((rg - 0.05) / step);
  for (let i = -k; i <= k; i++) { line(i * step, true); line(i * step, false); }
  const braces: Seg[] = [];
  for (const bx of [-0.075, 0.075]) {
    const half = Math.sqrt(rg * rg - bx * bx), n = 8;
    for (let i = 0; i < n; i++) {
      const a = -half + (i * 2 * half) / n, b = -half + ((i + 1) * 2 * half) / n;
      braces.push([new THREE.Vector3(bx, a, zAt(bx, a) + 0.016), new THREE.Vector3(bx, b, zAt(bx, b) + 0.016)]);
    }
  }
  return { wires, braces };
}

function InstancedSegs({ segs, sx, sz, material, box }: { segs: Seg[]; sx: number; sz: number; material: THREE.Material; box?: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  useLayoutEffect(() => {
    const o = new THREE.Object3D(), up = new THREE.Vector3(0, 1, 0), d = new THREE.Vector3();
    segs.forEach(([a, b], i) => {
      d.subVectors(b, a); const len = d.length();
      o.position.addVectors(a, b).multiplyScalar(0.5);
      o.quaternion.setFromUnitVectors(up, d.normalize());
      o.scale.set(sx, len * 1.02, sz); o.updateMatrix();
      ref.current.setMatrixAt(i, o.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [segs, sx, sz]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, segs.length]} material={material} frustumCulled={false}>
      {box ? <boxGeometry args={[1, 1, 1]} /> : <cylinderGeometry args={[1, 1, 1, 6]} />}
    </instancedMesh>
  );
}

function PartLabel({ pos, side, dy = 0, title, sub, reg }: {
  pos: [number, number, number]; side: "l" | "r"; dy?: number; title: string; sub: string; reg: (el: HTMLDivElement | null) => void;
}) {
  const run = 56, len = Math.hypot(run, dy), ang = (Math.atan2(dy, run) * 180) / Math.PI;
  return (
    <Html position={pos} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div ref={reg} className={`part-label ${side}`} style={{ opacity: 0, ["--dy" as string]: `${dy}px`, ["--len" as string]: `${len}px`, ["--ang" as string]: `${side === "r" ? ang : -ang}deg` }}>
        <span className="dot" /><span className="line" />
        <span className="txt"><b>{title}</b><i>{sub}</i></span>
      </div>
    </Html>
  );
}

// ───────────────────────── the fan ─────────────────────────
export function DairyFan({ state, detail = "high", labels, flowCount = 500 }: {
  state: FanState; detail?: "high" | "low"; labels?: PartLabels; flowCount?: number; 
}) {
  const hi = detail === "high";
  const spin = useRef<THREE.Group>(null!);
  const hub = useRef<THREE.Group>(null!);
  const blades = useRef<(THREE.Group | null)[]>([]);
  const guard = useRef<THREE.Group>(null!);
  const motor = useRef<THREE.Group>(null!);
  const bracket = useRef<THREE.Group>(null!);
  const blurMat = useRef<THREE.MeshBasicMaterial>(null!);
  const labelEls = useRef<HTMLDivElement[]>([]);
  const cur = useRef(0);
  const level = useMemo<Level>(() => ({ v: 0 }), []);

  const m = useMemo(() => {
    const orange = noiseTexture(256, 10);
    const grit = noiseTexture(256, 5);
    return {
      blue: new THREE.MeshPhysicalMaterial({ color: DRUM, roughness: 0.62, metalness: 0.1, clearcoat: 0.12, clearcoatRoughness: 0.7, bumpMap: orange, bumpScale: 0.3, side: THREE.DoubleSide }),
      wire: new THREE.MeshStandardMaterial({ color: WIRE, roughness: 0.45, metalness: 0.15 }),
      blade: new THREE.MeshStandardMaterial({ color: "#2A2E31", roughness: 0.72, metalness: 0.02, bumpMap: grit, bumpScale: 0.6 }),
      alu: new THREE.MeshStandardMaterial({ color: "#C4CCD1", roughness: 0.35, metalness: 1 }),
      hub: new THREE.MeshStandardMaterial({ color: "#DCE0E1", roughness: 0.42, metalness: 0.45 }),
      cone: new THREE.MeshStandardMaterial({ color: "#4A4F53", roughness: 0.5, metalness: 0.6 }),
      motor: new THREE.MeshStandardMaterial({ color: "#3C4144", roughness: 0.62, metalness: 0.35, flatShading: true }),
      motorDark: new THREE.MeshStandardMaterial({ color: "#2C3033", roughness: 0.6, metalness: 0.4 }),
      steel: new THREE.MeshStandardMaterial({ color: "#5E7C80", roughness: 0.55, metalness: 0.35 }),
      cable: new THREE.MeshStandardMaterial({ color: "#F1F1EE", roughness: 0.6 }),
      text: new THREE.MeshBasicMaterial({ map: bladeTextTexture(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }),
      blurTex: blurDiscTexture(),
    };
  }, []);

  // ── drum (lathe profile revolved, then axis turned to Z)
  const drumGeo = useMemo(() => {
    const ro = R + 0.012, ri = R - 0.012, h = D / 2;
    const pts = [[ri - 0.02, -h], [ro, -h], [ro, h], [ri, h], [ri, -h + 0.02]].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, hi ? 128 : 64);
  }, [hi]);

  const { wires, braces } = useMemo(() => guardSegs(hi ? 0.115 : 0.22, hi ? 0.14 : 0.3, R - 0.025, D / 2 + 0.03, 0.07), [hi]);
  const rearBars = useMemo<Seg[]>(() => {
    const s: Seg[] = []; const half = 0.99;
    for (const bx of [-0.12, 0.12]) s.push([new THREE.Vector3(bx, -half, -D / 2 - 0.03), new THREE.Vector3(bx, half, -D / 2 - 0.03)]);
    return s;
  }, []);
  const rearGuard = useMemo(() => (hi ? guardSegs(0.115, 0.14, R - 0.025, -D / 2 - 0.012, -0.03).wires : []), [hi]);
  const hubGeo = useMemo(() => {
    // three-lobed cast hub plate, lobes aligned with the blades
    const sh = new THREE.Shape();
    for (let k = 0; k <= 72; k++) {
      const t = (k / 72) * Math.PI * 2, r = 0.115 + 0.045 * Math.cos(3 * (t - Math.PI / 2));
      k === 0 ? sh.moveTo(Math.cos(t) * r, Math.sin(t) * r) : sh.lineTo(Math.cos(t) * r, Math.sin(t) * r);
    }
    return new THREE.ExtrudeGeometry(sh, { depth: 0.045, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 2 });
  }, []);

  const tabGeo = useMemo(() => {
    const s = new THREE.Shape(); s.moveTo(-0.11, 0); s.lineTo(0.11, 0); s.lineTo(0.11, 0.17); s.lineTo(-0.11, 0.17); s.lineTo(-0.11, 0);
    const h = new THREE.Path(); h.absarc(0, 0.095, 0.034, 0, Math.PI * 2, true); s.holes.push(h);
    return new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: false });
  }, []);

  const handleGeo = useMemo(() => {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.17, 0), new THREE.Vector3(0.1, -0.2, 0), new THREE.Vector3(0.2, -0.15, 0),
      new THREE.Vector3(0.22, 0, 0), new THREE.Vector3(0.2, 0.15, 0), new THREE.Vector3(0.1, 0.2, 0), new THREE.Vector3(0, 0.17, 0),
    ], false, "catmullrom", 0.4);
    return new THREE.TubeGeometry(c, 40, 0.014, 8, false);
  }, []);

  const bladeGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.055, 0.32); s.lineTo(0.055, 0.32); s.lineTo(0.17, 0.96); s.lineTo(-0.17, 0.96); s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.014, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 1 });
  }, []);

  const cableGeo = useMemo(() => {
    const mk = (o: number) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02 + o, 0.19, -0.5), new THREE.Vector3(0.1 + o, 0.36, -0.62),
      new THREE.Vector3(0.28 + o, 0.5, -0.9), new THREE.Vector3(0.5 + o, 0.3, -1.1), new THREE.Vector3(0.75 + o, 0.05, -1.25),
    ]), 40, 0.011, 6, false);
    return [mk(0), mk(0.03)];
  }, []);

  useFrame((_, dt) => {
    const e = state.explode;
    cur.current += (state.rpm + (state.idle ?? 0) - cur.current) * (1 - Math.exp(-dt * 1.6));
    spin.current.rotation.z -= cur.current * dt;
    level.v = smooth(4, 14, cur.current);
    blurMat.current.opacity = smooth(9, 22, cur.current) * 0.62;

    guard.current.position.z = 0.95 * e;
    hub.current.position.z = 0.2 * e;
    for (let i = 0; i < 3; i++) {
      const b = blades.current[i]; if (!b) continue;
      const a = (i * 2 * Math.PI) / 3;
      b.position.set(-Math.sin(a) * 0.3 * e, Math.cos(a) * 0.3 * e, 0.55 * e);
    }
    bracket.current.position.z = -0.45 * e;
    motor.current.position.z = -1.0 * e;
    if (hi) for (const el of labelEls.current) if (el) el.style.opacity = String(state.labels);
  });

  const reg = (el: HTMLDivElement | null) => { if (el && !labelEls.current.includes(el)) labelEls.current.push(el); };
  const L = labels;

  return (
    <group>
      {/* ───── drum ───── */}
      <group>
        <mesh geometry={drumGeo} material={m.blue} rotation={[Math.PI / 2, 0, 0]} />
        <mesh material={m.blue} position={[0, 0, D / 2]}><torusGeometry args={[R + 0.035, 0.04, 14, hi ? 128 : 64]} /></mesh>
        <mesh material={m.blue} position={[0, 0, -D / 2]}><torusGeometry args={[R + 0.012, 0.022, 10, hi ? 128 : 64]} /></mesh>
        {/* handles */}
        {[1, -1].map((s) => (
          <mesh key={s} geometry={handleGeo} material={m.wire} position={[s * (R + 0.012), 0, 0]} scale={[s, 1, 1]} />
        ))}
        {/* mounting tabs (bottom + top) */}
        <mesh geometry={tabGeo} material={m.blue} position={[0, -(R + 0.17), -0.02]} />
        <mesh geometry={tabGeo} material={m.blue} position={[0, R + 0.17, 0.02]} rotation={[0, 0, Math.PI]} />
        {/* seam + screws */}
        {hi && (
          <group rotation={[0, 0, 2.35]}>
            <mesh position={[R + 0.014, 0, 0]} material={m.motorDark}><boxGeometry args={[0.008, 0.008, D * 0.98]} /></mesh>
            {[-0.2, -0.1, 0, 0.1, 0.2].map((z) => (
              <mesh key={z} position={[R + 0.02, 0.02, z]} rotation={[0, 0, Math.PI / 2]} material={m.alu}><cylinderGeometry args={[0.012, 0.012, 0.012, 8]} /></mesh>
            ))}
          </group>
        )}
        {L && <PartLabel pos={[-1.02, 0.45, 0]} side="l" dy={-40} title={L.drum.t} sub={L.drum.s} reg={reg} />}
      </group>

      {/* ───── front wire guard (+ clamps) ───── */}
      <group ref={guard}>
        <InstancedSegs segs={wires} sx={hi ? 0.0065 : 0.01} sz={hi ? 0.0065 : 0.01} material={m.wire} />
        <InstancedSegs segs={braces} sx={0.03} sz={0.007} material={m.wire} box />
        <mesh material={m.wire} position={[0, 0, D / 2 + 0.03]}><torusGeometry args={[R - 0.025, 0.011, 8, hi ? 128 : 48]} /></mesh>
        {Array.from({ length: 8 }, (_, k) => {
          const a = (k * Math.PI) / 4 + Math.PI / 8;
          return (
            <group key={k} position={[Math.cos(a) * (R - 0.01), Math.sin(a) * (R - 0.01), D / 2 + 0.035]} rotation={[0, 0, a]}>
              <mesh material={m.steel}><boxGeometry args={[0.035, 0.09, 0.05]} /></mesh>
              {hi && <mesh material={m.alu} position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.012, 0.012, 0.02, 8]} /></mesh>}
            </group>
          );
        })}
        {L && <PartLabel pos={[0.62, 0.66, D / 2 + 0.11]} side="l" dy={-34} title={L.guard.t} sub={L.guard.s} reg={reg} />}
      </group>

      {/* ───── rotor ───── */}
      <group ref={spin} position={[0, 0, 0.02]}>
        <group ref={hub}>
          <mesh geometry={hubGeo} material={m.hub} position={[0, 0, -0.03]} />
          <mesh material={m.hub} position={[0, 0, 0.035]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.055, 0.065, 0.04, 28]} /></mesh>
          <mesh material={m.cone} position={[0, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.018, 0.018, 0.02, 12]} /></mesh>
          {[0, 1, 2].map((i) => {
            const a = (i * 2 * Math.PI) / 3 + Math.PI / 2;
            return <mesh key={i} material={m.cone} position={[Math.cos(a) * 0.12, Math.sin(a) * 0.12, 0.03]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.012, 0.012, 0.02, 8]} /></mesh>;
          })}
          {L && <PartLabel pos={[0.04, -0.03, 0.14]} side="r" dy={-70} title={L.hub.t} sub={L.hub.s} reg={reg} />}
        </group>
        {[0, 1, 2].map((i) => (
          <group key={i} ref={(g) => { blades.current[i] = g; }}>
            <group rotation={[0, 0, (i * 2 * Math.PI) / 3]}>
              {/* conical root / shank */}
              <mesh material={m.cone} position={[0, 0.24, 0]}><cylinderGeometry args={[0.014, 0.055, 0.32, 16]} /></mesh>
              <group rotation={[0, 0.38, 0]}>
                <mesh geometry={bladeGeo} material={m.blade} position={[0, 0, -0.007]} />
                {/* leading-edge rib */}
                <mesh material={m.blade} position={[0.115, 0.64, 0.02]} rotation={[0, 0, -0.17]}><boxGeometry args={[0.014, 0.68, 0.026]} /></mesh>
                {/* embossed KHALEEQ FAN (decal) */}
                {hi && <mesh material={m.text} position={[0, 0.58, 0.0215]}><planeGeometry args={[0.11, 0.44]} /></mesh>}
                {L && i === 0 && <PartLabel pos={[-0.04, 0.82, 0.03]} side="r" dy={34} title={L.blades.t} sub={L.blades.s} reg={reg} />}
              </group>
            </group>
          </group>
        ))}
        {/* motion-blur disc (fades in at high rpm) */}
        <mesh position={[0, 0, 0.045]}>
          <circleGeometry args={[0.96, 64]} />
          <meshBasicMaterial ref={blurMat} map={m.blurTex} transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>

      {/* ───── rear frame: two box-section bars + motor plate ───── */}
      <group ref={bracket}>
        <InstancedSegs segs={rearBars} sx={0.05} sz={0.035} material={m.steel} box />
        {rearGuard.length > 0 && <InstancedSegs segs={rearGuard} sx={0.0065} sz={0.0065} material={m.wire} />}
        <mesh material={m.steel} position={[0, -0.17, -0.52]}><boxGeometry args={[0.36, 0.018, 0.46]} /></mesh>
        <mesh material={m.steel} position={[0.12, -0.27, -0.4]} rotation={[-0.75, 0, 0]}><boxGeometry args={[0.03, 0.28, 0.012]} /></mesh>
        <mesh material={m.steel} position={[-0.12, -0.27, -0.4]} rotation={[-0.75, 0, 0]}><boxGeometry args={[0.03, 0.28, 0.012]} /></mesh>
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], k) => (
          <mesh key={k} material={m.alu} position={[x * 0.12, -0.152, -0.52 + z * 0.13]}><cylinderGeometry args={[0.014, 0.014, 0.02, 8]} /></mesh>
        ))}
        {L && <PartLabel pos={[0.12, -0.18, -0.6]} side="r" dy={90} title={L.bracket.t} sub={L.bracket.s} reg={reg} />}
      </group>

      {/* ───── motor (behind the drum, on the plate) ───── */}
      <group ref={motor}>
        <mesh material={m.alu} position={[0, 0, -0.16]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.025, 0.025, 0.34, 12]} /></mesh>
        <mesh material={m.motor} position={[0, 0, -0.51]} rotation={[Math.PI / 2, Math.PI / 12, 0]}><cylinderGeometry args={[0.15, 0.15, 0.36, 12]} /></mesh>
        {[0.2, -0.2].map((dz) => (
          <mesh key={dz} material={m.motorDark} position={[0, 0, -0.51 + dz]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.13, 0.15, 0.05, 24]} /></mesh>
        ))}
        {hi && Array.from({ length: 8 }, (_, k) => {
          const a = (k / 8) * Math.PI * 2;
          return <mesh key={k} material={m.motor} position={[Math.cos(a) * 0.155, Math.sin(a) * 0.155, -0.51]} rotation={[0, 0, a]}><boxGeometry args={[0.022, 0.012, 0.34]} /></mesh>;
        })}
        <mesh material={m.motorDark} position={[0, 0.16, -0.5]}><boxGeometry args={[0.11, 0.06, 0.12]} /></mesh>
        <mesh material={m.motorDark} position={[0, -0.155, -0.51]}><boxGeometry args={[0.26, 0.03, 0.3]} /></mesh>
        {hi && cableGeo.map((g, i) => <mesh key={i} geometry={g} material={m.cable} />)}
        {L && <PartLabel pos={[0.16, 0.05, -0.51]} side="r" dy={-50} title={L.motor.t} sub={L.motor.s} reg={reg} />}
      </group>

      {/* ───── airflow out of the front ───── */}
      <group position={[0, 0, D / 2 + 0.12]}>
        <Airflow level={level} count={flowCount} length={hi ? 4.5 : 3.8} radius={0.82} size={hi ? 0.022 : 0.04} />
      </group>
    </group>
  );
}
