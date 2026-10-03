"use client";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import { DairyFan, type PartLabels } from "./DairyFan";
import { FAN_SCALE, FAN_SLOTS, FAN_TILT, Shed } from "./Shed";
import { FakeShadow } from "./FakeShadow";

import type { StoryState } from "./storyState";
export type { StoryState };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function Rig({ state, labels, quality }: { state: StoryState; labels?: PartLabels; quality: "high" | "low" }) {
  const { camera, size, scene } = useThree();
  const hemi = useRef<THREE.HemisphereLight>(null!);
  const sun = useRef<THREE.DirectionalLight>(null!);
  const night = useMemo(() => new THREE.Color("#0B1620"), []);
  const day = useMemo(() => new THREE.Color("#C9D9E2"), []);
  const hero = useRef<THREE.Group>(null!);
  const shed = useRef<THREE.Group>(null!);
  const shadows = useRef<THREE.Group>(null!);
  const tgt = useMemo(() => new THREE.Vector3(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const slot0 = FAN_SLOTS[0];

  useFrame((s) => {
    const aspect = size.width / size.height;
    const fit = lerp(Math.max(1, 0.85 / aspect) * (1 + state.explode * (aspect < 1 ? 0.6 : 0)), Math.max(1, 0.62 / aspect), Math.min(1, state.shed * 1.5));   // pull back on portrait screens
    tgt.set(state.tgt.x, state.tgt.y, state.tgt.z);
    pos.set(state.cam.x, state.cam.y, state.cam.z).sub(tgt).multiplyScalar(fit).add(tgt);
    camera.position.copy(pos);
    camera.lookAt(tgt);
    (camera as THREE.PerspectiveCamera).setViewOffset(size.width, size.height, -state.shift.x * size.width, -state.shift.y * size.height, size.width, size.height);

    const i = state.install, sh = state.shake * 0.018 * Math.sin(s.clock.elapsedTime * 90);
    hero.current.position.set(lerp(0, slot0.x, i) + sh, lerp(0, slot0.y, i) + sh * 0.6, lerp(0, slot0.z, i));
    hero.current.scale.setScalar(lerp(1, FAN_SCALE, i));
    hero.current.rotation.set(lerp(0, FAN_TILT, i), state.rotY * (1 - i), 0);

    const k = Math.max(0.0001, state.shed);
    shed.current.visible = state.shed > 0.001; shed.current.scale.setScalar(k);
    // studio night → farm daylight as the shed builds
    const d = Math.min(1, state.shed * 1.2);
    if (scene.background instanceof THREE.Color) scene.background.lerpColors(night, day, d);
    if (scene.fog) { scene.fog.color.lerpColors(night, day, d); (scene.fog as THREE.Fog).near = lerp(30, 40, d); (scene.fog as THREE.Fog).far = lerp(90, 170, d); }
    hemi.current.intensity = d * 1.5; sun.current.intensity = d * 2.2;
    const sk = Math.max(0.0001, 1 - state.install * 1.4);
    shadows.current.scale.setScalar(sk);
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={["#F4F1E8", "#6E6A5E", 0]} />
      <directionalLight ref={sun} position={[-6, 14, 10]} intensity={0} color="#FFF4DE" />
      <group ref={hero}><DairyFan state={state} labels={labels} flowCount={quality === "high" ? 520 : 220} /></group>
      <group ref={shed}><Shed mist={state.mist} quality={quality} /></group>
      <group ref={shadows}><FakeShadow /></group>
    </>
  );
}

export default function StoryScene({ state, labels, active, onReady, mobile }: {
  state: StoryState; labels?: PartLabels; active: boolean; onReady: () => void; mobile: boolean;
}) {
  const [quality, setQuality] = useState<"high" | "low">(mobile ? "low" : "high");
  const [dpr, setDpr] = useState<[number, number]>(mobile ? [1, 1.5] : [1, 2]);
  const ready = useRef(false);
  return (
    <Canvas
      dpr={dpr} frameloop={active ? "always" : "never"}
      camera={{ fov: 35, position: [0, 0.2, 5.9], near: 0.1, far: 120 }}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      onCreated={({ gl, scene }) => { gl.setClearColor("#0B1620"); scene.fog = new THREE.Fog("#0B1620", 30, 90); gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; }}
    >
      <PerformanceMonitor onDecline={() => { setQuality("low"); setDpr([1, 1]); }} />
      <color attach="background" args={["#0B1620"]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={2.4} color="#ffffff" />
      <directionalLight position={[-4, 2.5, -3]} intensity={1.6} color="#7AB3CC" />
      <pointLight position={[0, 3, 2]} intensity={6} distance={12} color="#cfe8f5" />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 3]} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[-5, 1, 2]} scale={[2, 5, 1]} color="#9ccfe6" />
        <Lightformer form="rect" intensity={1.2} position={[5, 1, -2]} scale={[2, 5, 1]} />
        <Lightformer form="ring" intensity={1} position={[0, -2, 4]} scale={4} />
      </Environment>
      <Rig state={state} labels={labels} quality={quality} />
      <ReadyPing onReady={() => { if (!ready.current) { ready.current = true; onReady(); } }} />
    </Canvas>
  );
}

function ReadyPing({ onReady }: { onReady: () => void }) {
  const n = useRef(0);
  useFrame(() => { if (++n.current === 3) onReady(); });
  return null;
}
