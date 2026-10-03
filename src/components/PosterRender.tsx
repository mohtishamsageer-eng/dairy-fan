"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { makeStoryState } from "@/scene/storyState";


const Scene = dynamic(() => import("@/scene/StoryScene"), { ssr: false });


export function PosterRender() {
  const state = useMemo(() => {
    const s = makeStoryState(); s.rpm = 30; s.rotY = 0.2;
    if (typeof window !== "undefined") {
      const og = new URLSearchParams(window.location.search).has("og");
      const wide = window.innerWidth >= 768;
      s.shift.x = og ? 0 : wide ? 0.24 : 0; s.shift.y = !og && !wide ? -0.13 : 0;
      // ?view=hub|rear|side|top: still, close views used to compare the model with the reference video
      const views: Record<string, [number, number, number]> = { hub: [1.7, 0.7, 3.4], rear: [2.4, 0.9, -3.0], side: [4.0, 0.5, 0.4], top: [0.6, 3.4, -1.6] };
      const v = views[new URLSearchParams(window.location.search).get("view") ?? ""];
      if (v) { s.rpm = 0; s.rotY = 0; s.shift.x = 0; s.shift.y = 0; s.cam = { x: v[0], y: v[1], z: v[2] }; }
    }
    return s;
  }, []);
  return (
    <div id="poster-stage" style={{ position: "fixed", inset: 0, background: "#0B1620" }}>
      <Scene state={state} active onReady={() => ((window as unknown as { __ready: boolean }).__ready = true)} mobile={false} />
    </div>
  );
}
