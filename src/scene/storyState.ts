// Kept free of three.js imports so the page can create the state without loading the 3D bundle.
import type { FanState } from "./DairyFan";

export type StoryState = FanState & {
  cam: { x: number; y: number; z: number };
  tgt: { x: number; y: number; z: number };
  shift: { x: number; y: number };   // screen-space offset, fraction of viewport
  rotY: number; shed: number; install: number; mist: { v: number }; shake: number;
};

export const makeStoryState = (): StoryState => ({
  rpm: 0, idle: 0, explode: 0, labels: 0,
  cam: { x: 0, y: 0.2, z: 5.9 }, tgt: { x: 0, y: 0, z: 0 }, shift: { x: 0, y: 0 },
  rotY: 0.2, shed: 0, install: 0, mist: { v: 0 }, shake: 0,
});

