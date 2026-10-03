"use client";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { useMemo, useEffect } from "react";
import { FakeShadow } from "./FakeShadow";
import { DairyFan, type FanState } from "./DairyFan";

export default function FanViewerCanvas({ on, mobile }: { on: boolean; mobile: boolean }) {
  const state = useMemo<FanState>(() => ({ rpm: 0, explode: 0, labels: 0 }), []);
  useEffect(() => { state.rpm = on ? 20 : 0; }, [on, state]);
  return (
    <Canvas dpr={mobile ? [1, 1.5] : [1, 2]} camera={{ fov: 35, position: [2.6, 0.9, 4.2] }} gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 5]} intensity={2.4} />
      <directionalLight position={[-4, 2, -3]} intensity={1.5} color="#7AB3CC" />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 3]} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[-5, 1, 2]} scale={[2, 5, 1]} color="#9ccfe6" />
      </Environment>
      <group rotation={[0, -0.5, 0]}><DairyFan state={state} flowCount={mobile ? 200 : 420} /></group>
      <FakeShadow />
      <OrbitControls enablePan={false} enableZoom={false} enableDamping dampingFactor={0.08} minPolarAngle={0.5} maxPolarAngle={2.3} />
    </Canvas>
  );
}
