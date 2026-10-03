"use client";
import { useEffect, useState } from "react";
import { useLang } from "./LangProvider";

/** Fan icon spinning up with a % counter. `done` jumps it to 100 and fades it out. */
export function FanLoader({ done }: { done: boolean }) {
  const { t } = useLang();
  const [pct, setPct] = useState(0);
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (done) { setPct(100); const id = setTimeout(() => setGone(true), 600); return () => clearTimeout(id); }
    const id = setInterval(() => setPct((p) => Math.min(92, p + Math.max(1, (92 - p) * 0.06))), 90);
    return () => clearInterval(id);
  }, [done]);
  if (gone) return null;
  return (
    <div className={`pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center bg-navy transition-opacity duration-500 ${done ? "opacity-0" : "opacity-100"}`} aria-live="polite">
      <svg viewBox="-50 -50 100 100" className="h-20 w-20 animate-spin text-steel" style={{ animationDuration: done ? "0.4s" : "1.2s" }} aria-hidden>
        <circle r="44" fill="none" stroke="currentColor" strokeWidth="3" opacity=".5" />
        {[0, 120, 240].map((a) => <path key={a} transform={`rotate(${a})`} d="M-5 -6 L-9 -38 L9 -38 L5 -6 Z" fill="currentColor" />)}
        <circle r="7" fill="currentColor" />
      </svg>
      <p className="mt-5 font-mono text-xs uppercase tracking-[0.3em] text-alu">{t("loader.loading")} {Math.round(pct)}%</p>
    </div>
  );
}
