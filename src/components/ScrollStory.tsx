"use client";
import dynamic from "next/dynamic";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLang } from "./LangProvider";
import { FanLoader } from "./FanLoader";
import { makeStoryState, type StoryState } from "@/scene/storyState";
import type { PartLabels } from "@/scene/DairyFan";
import { isMobileViewport, isWeakDevice, prefersReducedMotion, webglOK } from "@/lib/device";
import { waLink } from "@/lib/site";

const StoryScene = dynamic(() => import("@/scene/StoryScene"), { ssr: false });
type Mode = "pending" | "story" | "static";

const PANELS = ["hero", "orbit", "top", "explode", "assemble", "install"] as const;

export function ScrollStory() {
  const { t } = useLang();
  const [mode, setMode] = useState<Mode>("pending");
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const [mobile, setMobile] = useState(false);
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const state = useRef<StoryState>(makeStoryState());

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    setMobile(isMobileViewport());
    setMode(!webglOK() || prefersReducedMotion() || isWeakDevice() ? "static" : "story");
  }, []);

  // pause rendering when the story is off-screen
  useEffect(() => {
    if (!section.current) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "200px" });
    io.observe(section.current);
    return () => io.disconnect();
  }, [mode]);

  // scroll choreography: one GSAP timeline, scrubbed by scroll, drives the 3D state + text panels
  useLayoutEffect(() => {
    if (mode !== "story" || !section.current || !stage.current) return;
    const s = state.current;
    const ctx = gsap.context(() => {
      const q = (sel: string) => stage.current!.querySelector<HTMLElement>(sel)!;
      const panel = (n: string) => q(`[data-panel="${n}"]`);
      const wide = window.innerWidth >= 768;
      const d = wide ? 1 : 0;           // desktop: fan slides left/right of the text; mobile: stays centred above it
      const lift = wide ? 0 : -0.13;    // mobile: lift the fan above the text block
      s.shift.x = d * 0.24; s.shift.y = lift;

      gsap.to(s, { idle: 9, duration: 3.5, delay: 0.4, ease: "power2.in" });   // blades slowly spin up on load
      gsap.set(PANELS.filter((p) => p !== "hero").map(panel), { autoAlpha: 0, y: 40 });
      gsap.set(q("[data-wipe]"), { opacity: 0 });
      gsap.set(q("[data-blueprint]"), { opacity: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: { trigger: section.current, start: "top top", end: "bottom bottom", scrub: 1 },
      });
      const show = (n: string, a: number, b: number) => {
        const p = panel(n);
        tl.fromTo(p, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 3, immediateRender: false }, a);
        tl.fromTo(p.querySelectorAll("[data-reveal]"), { yPercent: 110 }, { yPercent: 0, duration: 3, stagger: 0.4, immediateRender: false }, a);
        tl.to(p, { autoAlpha: 0, y: -30, duration: 2.5 }, b);
      };

      // 0–10  hero: blades spin up, airflow starts
      tl.to(s, { rpm: 20, duration: 7, ease: "power2.out" }, 0);
      tl.to(s, { idle: 0, duration: 4 }, 7);
      tl.to(panel("hero"), { autoAlpha: 0, y: -40, duration: 3 }, 7);
      tl.to(q("[data-cue]"), { autoAlpha: 0, duration: 1 }, 1);
      // 10–25 orbit to 3/4 angle
      tl.to(s.cam, { x: 3.7, y: 1.2, z: 4.7, duration: 17 }, 8);
      tl.to(s.shift, { x: d * -0.27, duration: 9 }, 8);
      tl.to(s, { rotY: 0, duration: 17 }, 8);
      show("orbit", 15, 24);
      // 25–40 top-down over motor + blades
      tl.to(s.cam, { x: 0.5, y: 3.9, z: 3.0, duration: 15 }, 25);
      tl.to(s.tgt, { z: -0.15, duration: 15 }, 25);
      tl.to(s.shift, { x: d * 0.27, duration: 8 }, 25);
      show("top", 31, 39);
      // 40–60 exploded view
      tl.to(s, { rpm: 0, duration: 5, ease: "power2.out" }, 40);
      tl.to(s.cam, { x: 4.0, y: 1.4, z: 6.3, duration: 10 }, 40);
      tl.to(s.shift, { x: 0, y: wide ? 0 : lift - 0.04, duration: 10 }, 40);
      tl.to(s, { explode: 1, duration: 10, ease: "power3.inOut" }, 40);
      tl.to(s, { rotY: -0.8, duration: 20, ease: "none" }, 40);
      tl.to(s, { labels: 1, duration: 4 }, 47);
      tl.to(s.cam, { x: -3.3, y: 1.0, z: 6.5, duration: 10, ease: "none" }, 50);
      tl.to(q("[data-blueprint]"), { opacity: 1, duration: 5 }, 42);
      show("explode", 41, 58);
      // 60–70 reassemble with a settle shake
      tl.to(s, { labels: 0, duration: 2 }, 58);
      tl.to(q("[data-blueprint]"), { opacity: 0, duration: 4 }, 58);
      tl.to(s, { explode: 0, duration: 8, ease: "power3.inOut" }, 60);
      tl.to(s, { rotY: 0, duration: 10 }, 60);
      tl.to(s.cam, { x: 0.9, y: 0.4, z: 5.9, duration: 10 }, 60);
      tl.to(s.tgt, { x: 0, y: 0, z: 0, duration: 10 }, 60);
      tl.to(s.shift, { x: d * 0.27, duration: 10 }, 60);
      tl.to(s, { rpm: 12, duration: 4 }, 66);
      tl.to(s, { shake: 1, duration: 1, ease: "none" }, 67.5);
      tl.to(s, { shake: 0, duration: 2, ease: "power2.out" }, 68.5);
      show("assemble", 61, 69);
      // 70–85 installation scene
      tl.to(s, { shed: 1, duration: 7, ease: "power2.out" }, 70);
      tl.to(s, { install: 1, duration: 10 }, 71);
      tl.to(s.cam, { x: 0, y: 2.9, z: 13, duration: 15 }, 70);
      tl.to(s.tgt, { x: 0, y: 2.6, z: -12, duration: 15 }, 70);
      tl.to(s.shift, { x: 0, y: wide ? 0 : lift, duration: 15 }, 70);
      tl.to(s.mist, { v: 1, duration: 4, ease: "none" }, 79);
      show("install", 74, 90);
      // 85–100 hand-off to the brand colour
      tl.to(s.cam, { x: 26, y: 21, z: 36, duration: 15 }, 85);
      tl.to(s.tgt, { x: 0, y: 2, z: -10, duration: 15 }, 85);
      tl.to(s, { rpm: 6, duration: 15 }, 85);
      tl.to(q("[data-wipe]"), { opacity: 1, duration: 10, ease: "power1.in" }, 90);
      tl.set({}, {}, 100);
    }, section.current);
    return () => ctx.revert();
  }, [mode]);

  const labels = useMemo<PartLabels>(() => ({
    guard: { t: t("part.guard"), s: t("part.guard.s") }, blades: { t: t("part.blades"), s: t("part.blades.s") },
    hub: { t: t("part.hub"), s: t("part.hub.s") }, motor: { t: t("part.motor"), s: t("part.motor.s") },
    bracket: { t: t("part.bracket"), s: t("part.bracket.s") }, drum: { t: t("part.drum"), s: t("part.drum.s") },
  }), [t]);

  const story = mode === "story";
  const copy = (key: string) => ({ title: t(`story.${key}.title`), body: t(`story.${key}.body`) });

  return (
    <section id="home" ref={section} className="story relative bg-navy text-paper" style={story ? { height: mobile ? "620vh" : "720vh" } : undefined} aria-label="Khaleeq Fans">
      <div ref={stage} className="story-stage relative h-[100svh] overflow-hidden" style={story ? { position: "sticky", top: 0 } : undefined}>
        {/* instant poster, replaced by the live 3D once it renders */}
        <picture>
          <source media="(max-width: 767px)" srcSet="/assets/fan/poster-mobile.webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/fan/poster.webp" alt="Khaleeq dairy fan" fetchPriority="high" decoding="async"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${story && ready ? "opacity-0" : "opacity-100"}`} />
        </picture>
        {story && (
          <div className="absolute inset-0" data-cursor="fan">
            <StoryScene state={state.current} labels={labels} active={active} onReady={() => setReady(true)} mobile={mobile} />
          </div>
        )}
        {story && <FanLoader done={ready} />}
        <div data-blueprint className="blueprint pointer-events-none absolute inset-0" />
        <div className="grain pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-navy/90 to-transparent md:hidden" />

        {/* ── text panels ── */}
        <Panel name="hero" side="left">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-steel">{t("hero.kicker")}</p>
          <Reveal as="h1" className="font-display text-[2.1rem] font-bold leading-[1.05] sm:text-5xl lg:text-6xl">{t("hero.title")}</Reveal>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={waLink("Assalam o Alaikum, I want a quote for Khaleeq Fans")} target="_blank" rel="noopener" className="btn btn-wa">{t("hero.cta")}</a>
            <a href="/products/" className="btn btn-ghost">{t("hero.cta2")}</a>
          </div>
        </Panel>
        {story && (
          <>
            <Panel name="orbit" side="right"><Copy {...copy("orbit")} /></Panel>
            <Panel name="top" side="left"><Copy {...copy("top")} /></Panel>
            <Panel name="explode" side="left" low><Copy {...copy("explode")} /></Panel>
            <Panel name="assemble" side="left"><Copy {...copy("assemble")} /></Panel>
            <Panel name="install" side="left" low><Copy {...copy("install")} /></Panel>
            <div data-wipe className="pointer-events-none absolute inset-0 z-20 bg-steel" />
            <div data-cue className="pointer-events-none absolute bottom-5 start-1/2 hidden md:block z-10 -translate-x-1/2 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-alu">
              {t("hero.scroll")}<span className="mx-auto mt-2 block h-8 w-px animate-pulse bg-steel" />
            </div>
          </>
        )}
      </div>

      {/* no-WebGL / reduced-motion / low-end: the same story as plain readable content */}
      {mode === "static" && (
        <div className="bg-navy">
          {(["orbit", "top", "explode", "assemble", "install"] as const).map((k) => (
            <div key={k} className="mx-auto max-w-3xl border-t border-white/10 px-6 py-12">
              <Copy {...copy(k)} static />
            </div>
          ))}
        </div>
      )}
      <noscript>
        <style>{`.story{height:auto!important}.story-stage{position:relative!important;height:auto!important;min-height:100svh}`}</style>
      </noscript>
    </section>
  );
}

function Panel({ name, side, low, children }: { name: string; side: "left" | "right"; low?: boolean; children: React.ReactNode }) {
  return (
    <div className={`pointer-events-none absolute inset-0 z-10 flex px-5 pb-14 md:px-14 md:pb-0 ${low ? "items-end md:items-end md:pb-16" : "items-end md:items-center"} ${side === "right" ? "md:justify-end" : "md:justify-start"}`}>
      <div data-panel={name} className="pointer-events-auto max-w-[34rem]">{children}</div>
    </div>
  );
}
function Reveal({ as: Tag = "h2", className = "", children }: { as?: "h1" | "h2"; className?: string; children: React.ReactNode }) {
  return <div className="overflow-hidden pb-1"><Tag data-reveal className={`${className} will-change-transform`}>{children}</Tag></div>;
}
function Copy({ title, body, static: st }: { title: string; body: string; static?: boolean }) {
  return (
    <>
      <Reveal className="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{title}</Reveal>
      {body && <p className={`mt-3 max-w-md text-base text-alu md:text-lg ${st ? "" : ""}`}>{body}</p>}
    </>
  );
}
