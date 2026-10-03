"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import products from "@/data/products.json";
import categories from "@/data/categories.json";
import type { Category, Product } from "@/data/types";
import { useLang } from "./LangProvider";
import { SmartImage } from "./SmartImage";
import { ProductDetail } from "./ProductDetail";

const all = products as unknown as Product[];
const cats = categories as Category[];

function Card({ p, onOpen }: { p: Product; onOpen: () => void }) {
  const { pick, t } = useLang();
  const [hover, setHover] = useState(false);
  const name = pick(p.name, p.nameUr);
  return (
    <motion.li layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.35 }}>
      <button onClick={onOpen} onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}
        className="group block w-full overflow-hidden rounded-2xl border border-navy/10 bg-white text-start shadow-sm transition hover:shadow-xl hover:shadow-navy/10">
        <span className="relative block aspect-[4/3] overflow-hidden">
          <SmartImage src={p.images[0]} alt={name} className={`absolute inset-0 h-full w-full transition-transform duration-700 ${hover ? "scale-110" : ""}`} />
          {p.images[1] && <SmartImage src={p.images[1]} alt="" className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${hover ? "opacity-100" : "opacity-0"}`} />}
          {p.sample && <span className="absolute start-3 top-3 rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-navy">{t("products.sample")}</span>}
        </span>
        <span className="block p-5">
          <span className="font-mono text-[11px] uppercase tracking-widest text-steel-dark">{pick(cats.find((c) => c.id === p.category)?.label ?? "", cats.find((c) => c.id === p.category)?.labelUr)}</span>
          <span className="mt-1 block font-display text-lg font-semibold text-navy">{name}</span>
          <span className="mt-1 line-clamp-2 block text-sm text-graphite/70">{pick(p.shortDesc, p.shortDescUr)}</span>
        </span>
      </button>
    </motion.li>
  );
}

export function ProductsCatalog({ limit, featuredOnly }: { limit?: number; featuredOnly?: boolean }) {
  const { t, pick } = useLang();
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Product | null>(null);

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("c");
    if (c && cats.some((x) => x.id === c)) setCat(c);
  }, []);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", k); document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open]);

  const shown = useMemo(() => {
    let l = all.filter((p) => (cat === "all" || p.category === cat) && (!featuredOnly || p.featured || all.length <= (limit ?? 99)));
    const n = q.trim().toLowerCase();
    if (n) l = l.filter((p) => `${p.name} ${p.nameUr ?? ""} ${p.shortDesc}`.toLowerCase().includes(n));
    return limit ? l.slice(0, limit) : l;
  }, [cat, q, limit, featuredOnly]);
  const used = cats.filter((c) => all.some((p) => p.category === c.id));

  return (
    <div>
      {!limit && (
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <LayoutGroup>
            <div className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0" role="tablist">
              {[{ id: "all", label: t("products.all"), labelUr: t("products.all") }, ...used].map((c) => (
                <button key={c.id} role="tab" aria-selected={cat === c.id} onClick={() => setCat(c.id)}
                  className={`relative shrink-0 rounded-full border px-4 py-2 text-sm transition ${cat === c.id ? "border-navy text-paper" : "border-navy/20 text-navy hover:border-navy/50"}`}>
                  {cat === c.id && <motion.span layoutId="chip" className="absolute inset-0 -z-0 rounded-full bg-navy" />}
                  <span className="relative">{pick(c.label, c.labelUr)}</span>
                </button>
              ))}
            </div>
          </LayoutGroup>
          <label className="relative block md:w-72">
            <span className="sr-only">{t("products.search")}</span>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("products.search")} className="w-full rounded-full border border-navy/20 bg-white px-5 py-2.5 text-sm outline-none focus:border-steel-dark" />
          </label>
        </div>
      )}
      <motion.ul layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">{shown.map((p) => <Card key={p.id} p={p} onOpen={() => setOpen(p)} />)}</AnimatePresence>
      </motion.ul>
      {shown.length === 0 && <p className="py-10 text-center text-graphite/70">{t("products.none")}</p>}

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[60] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={open.name}>
            <button className="absolute inset-0 bg-navy/75 backdrop-blur-sm" onClick={() => setOpen(null)} aria-label="Close" />
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="relative max-h-[92svh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-paper p-6 text-graphite md:p-9">
              <button onClick={() => setOpen(null)} className="absolute end-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-navy/20 hover:bg-navy/5" aria-label="Close">✕</button>
              <ProductDetail p={open} />
              <Link href={`/products/${open.id}/`} className="mt-6 inline-block text-sm text-steel-dark underline underline-offset-4">{t("products.details")} →</Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
