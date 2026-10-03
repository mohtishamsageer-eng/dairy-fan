"use client";
import { useState } from "react";
import manifest from "@/data/image-manifest.json";

type Entry = { blur: string; w: number; h: number; src: string; srcset: string };
const man = manifest as Record<string, Entry>;

function Placeholder({ className = "" }: { className?: string }) {
  return (
    <div className={`grid place-items-center bg-gradient-to-br from-navy-700 to-navy ${className}`} role="img" aria-label="Photo coming soon">
      <svg viewBox="-50 -50 100 100" className="h-1/3 w-1/3 max-h-24 max-w-24 text-steel/60">
        <circle r="44" fill="none" stroke="currentColor" strokeWidth="3" />
        {[0, 120, 240].map((a) => <path key={a} transform={`rotate(${a})`} d="M-5 -6 L-9 -38 L9 -38 L5 -6 Z" fill="currentColor" />)}
        <circle r="7" fill="currentColor" />
      </svg>
    </div>
  );
}

/** Uses the optimised WebP set + blur-up from image-manifest.json when `npm run images` has produced one; falls back to the original file, then to a placeholder. */
export function SmartImage({ src, alt, className = "", sizes = "(max-width: 768px) 100vw, 33vw", eager = false }: {
  src?: string; alt: string; className?: string; sizes?: string; eager?: boolean;
}) {
  const [bad, setBad] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (!src || bad) return <Placeholder className={className} />;
  const e = man[src];
  return (
    <span className={`relative block overflow-hidden ${className}`} style={e ? { backgroundImage: `url(${e.blur})`, backgroundSize: "cover" } : undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={e?.src ?? src} srcSet={e?.srcset} sizes={e ? sizes : undefined} alt={alt} width={e?.w} height={e?.h}
        loading={eager ? "eager" : "lazy"} decoding="async" onError={() => setBad(true)} onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-500 ${loaded || !e ? "opacity-100" : "opacity-0"}`} />
    </span>
  );
}
