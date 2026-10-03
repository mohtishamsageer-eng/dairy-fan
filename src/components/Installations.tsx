"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import data from "@/data/installations.json";
import type { Installation } from "@/data/types";
import { useLang } from "./LangProvider";
import { SmartImage } from "./SmartImage";

const items = data as Installation[];

function BeforeAfter({ before, after, alt }: { before: string; after: string; alt: string }) {
  const { t } = useLang();
  const [x, setX] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const set = (clientX: number) => { const r = box.current!.getBoundingClientRect(); setX(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100))); };
  return (
    <div ref={box} className="relative aspect-[4/3] touch-none select-none overflow-hidden rounded-2xl" onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); set(e.clientX); }} onPointerMove={(e) => e.buttons && set(e.clientX)}>
      <SmartImage src={after} alt={`${alt}: ${t("work.after")}`} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - x}% 0 0)` }}><SmartImage src={before} alt={`${alt}: ${t("work.before")}`} className="h-full w-full" /></div>
      <div className="absolute inset-y-0 w-0.5 bg-white" style={{ left: `${x}%` }}><span className="absolute top-1/2 -ms-4 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white text-xs text-navy shadow">⇆</span></div>
      <span className="absolute start-3 top-3 rounded bg-navy/70 px-2 py-0.5 font-mono text-[10px] uppercase text-white">{t("work.before")}</span>
      <span className="absolute end-3 top-3 rounded bg-navy/70 px-2 py-0.5 font-mono text-[10px] uppercase text-white">{t("work.after")}</span>
    </div>
  );
}

export function Installations({ limit }: { limit?: number }) {
  const { t, pick } = useLang();
  const [open, setOpen] = useState<Installation | null>(null);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [open]);
  const list = limit ? items.slice(0, limit) : items;
  if (!list.length) return <p className="rounded-2xl border border-dashed border-white/20 p-10 text-center text-alu">{t("work.empty")}</p>;
  return (
    <>
      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4 [&>li]:break-inside-avoid">
        {list.map((it) => (
          <li key={it.id}>
            <button onClick={() => setOpen(it)} className="group relative block w-full overflow-hidden rounded-2xl">
              <SmartImage src={it.image} alt={pick(it.title, it.titleUr)} className="aspect-auto min-h-40 w-full transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/90 to-transparent p-4 text-start">
                <span className="block font-display font-semibold text-white">{pick(it.title, it.titleUr)}</span>
                {it.location && <span className="font-mono text-[11px] uppercase tracking-widest text-steel">📍 {it.location}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[60] grid place-items-center bg-navy/90 p-4 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" onClick={() => setOpen(null)}>
            <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
              {open.before ? <BeforeAfter before={open.before} after={open.image} alt={open.title} /> : <SmartImage src={open.image} alt={open.title} className="max-h-[80svh] w-full rounded-2xl" sizes="100vw" eager />}
              <p className="mt-3 text-center text-alu">{pick(open.title, open.titleUr)}{open.location ? ` · ${open.location}` : ""}</p>
              <button onClick={() => setOpen(null)} className="btn btn-ghost mx-auto mt-3 flex">✕ {t("services.close")}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
