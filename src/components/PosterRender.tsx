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
    }
    return s;
  }, []);
  return (
    <div id="poster-stage" style={{ position: "fixed", inset: 0, background: "#0B1620" }}>
      <Scene state={state} active onReady={() => ((window as unknown as { __ready: boolean }).__ready = true)} mobile={false} />
    </div>
  );
}
