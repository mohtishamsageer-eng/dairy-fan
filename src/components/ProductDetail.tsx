"use client";
import { useState } from "react";
import type { Product } from "@/data/types";
import { useLang } from "./LangProvider";
import { SmartImage } from "./SmartImage";
import { WhatsAppIcon } from "./WhatsAppFab";
import { waLink } from "@/lib/site";

export function ProductDetail({ p }: { p: Product }) {
  const { t, pick } = useLang();
  const [i, setI] = useState(0);
  const name = pick(p.name, p.nameUr);
  const imgs = p.images.length ? p.images : [undefined];
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <SmartImage src={imgs[i]} alt={name} className="aspect-square rounded-2xl" sizes="(max-width:768px) 100vw, 50vw" eager />
        {imgs.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {imgs.map((im, k) => <button key={k} onClick={() => setI(k)} aria-label={`Image ${k + 1}`} className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${k === i ? "border-steel-dark" : "border-transparent"}`}><SmartImage src={im} alt="" className="h-full w-full" sizes="64px" /></button>)}
          </div>
        )}
      </div>
      <div>
        {p.sample && <span className="mb-3 inline-block rounded-full bg-accent/20 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-[#8a5a0c]">{t("products.sample")}</span>}
        <h2 className="font-display text-3xl font-bold text-navy">{name}</h2>
        <p className="mt-3 leading-relaxed">{pick(p.shortDesc, p.shortDescUr)}</p>
        {Object.keys(p.specs).length > 0 && (
          <>
            <h3 className="mb-2 mt-6 font-mono text-xs uppercase tracking-[0.25em] text-steel-dark">{t("products.specs")}</h3>
            <dl className="divide-y divide-navy/10 border-y border-navy/10 text-sm">
              {Object.entries(p.specs).map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-2"><dt className="text-graphite/70">{k}</dt><dd className="text-end font-medium">{v}</dd></div>)}
            </dl>
          </>
        )}
        <a className="btn btn-wa mt-7" target="_blank" rel="noopener" href={waLink(p.whatsappText)}><WhatsAppIcon className="h-4 w-4" />{t("products.quote")}</a>
      </div>
    </div>
  );
}
