"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import services from "@/data/services.json";
import type { Service } from "@/data/types";
import { useLang } from "./LangProvider";
import { Band, Heading } from "./Section";
import { Fx } from "./Fx";
import { ServiceIcon } from "./ServiceIcon";
import { SmartImage } from "./SmartImage";
import { WhatsAppIcon } from "./WhatsAppFab";
import { waLink } from "@/lib/site";

const list = services as Service[];

function TiltCard({ s, onOpen, i }: { s: Service; onOpen: () => void; i: number }) {
  const { pick, t } = useLang();
  const ref = useRef<HTMLButtonElement>(null);
  const mx = useMotionValue(0), my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), { stiffness: 200, damping: 20 });
  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = ref.current!.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5);
  };
  return (
    <Fx delay={(i % 3) * 0.08} className="[perspective:900px]">
      <motion.button ref={ref} onClick={onOpen} onPointerMove={move} onPointerLeave={() => { mx.set(0); my.set(0); }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="group relative flex h-full w-full flex-col items-start rounded-2xl border border-navy/10 bg-white p-6 text-start shadow-sm transition-shadow hover:shadow-xl hover:shadow-navy/10">
        <span className="mb-5 grid h-20 w-20 place-items-center rounded-2xl bg-navy text-steel transition-colors group-hover:bg-steel group-hover:text-navy" style={{ transform: "translateZ(30px)" }}>
          <ServiceIcon name={s.icon} />
        </span>
        <h3 className="font-display text-xl font-semibold text-navy" style={{ transform: "translateZ(20px)" }}>{pick(s.title, s.titleUr)}</h3>
        <p className="mt-2 text-sm leading-relaxed text-graphite/75">{pick(s.short, s.shortUr)}</p>
        <span className="mt-5 font-mono text-xs uppercase tracking-widest text-steel-dark">{t("services.details")} →</span>
      </motion.button>
    </Fx>
  );
}

function Drawer({ s, onClose }: { s: Service; onClose: () => void }) {
  const { pick, t } = useLang();
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k); document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <motion.div className="fixed inset-0 z-[60]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={s.title}>
      <button className="absolute inset-0 bg-navy/70 backdrop-blur-sm" onClick={onClose} aria-label={t("services.close")} />
      <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-y-0 end-0 w-full max-w-lg overflow-y-auto bg-paper p-7 text-graphite shadow-2xl">
        <button onClick={onClose} className="mb-6 rounded-full border border-navy/20 px-4 py-1.5 text-sm hover:bg-navy/5">✕ {t("services.close")}</button>
        <span className="mb-4 grid h-20 w-20 place-items-center rounded-2xl bg-navy text-steel"><ServiceIcon name={s.icon} /></span>
        <h3 className="font-display text-3xl font-bold text-navy">{pick(s.title, s.titleUr)}</h3>
        <p className="mt-4 leading-relaxed">{s.description}</p>
        <ul className="mt-6 space-y-2">{s.points.map((p) => <li key={p} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-steel-dark" />{p}</li>)}</ul>
        {s.images.length > 0 && <div className="mt-6 grid grid-cols-2 gap-3">{s.images.map((im) => <SmartImage key={im} src={im} alt={s.title} className="aspect-[4/3] rounded-xl" />)}</div>}
        <div className="mt-8 flex flex-wrap gap-3">
          <a className="btn btn-wa" target="_blank" rel="noopener" href={waLink(`Assalam o Alaikum, I want a quote for: ${s.title}`)}><WhatsAppIcon className="h-4 w-4" />{t("services.quote")}</a>
          <Link className="btn btn-line" href={`/services/${s.slug}/`}>{t("services.details")}</Link>
          <Link className="btn btn-line" href={`/products/?c=${s.category}`}>{t("services.view")}</Link>
        </div>
      </motion.aside>
    </motion.div>
  );
}

export function Services() {
  const { t } = useLang();
  const [open, setOpen] = useState<Service | null>(null);
  return (
    <section id="services" className="relative scroll-mt-16 bg-gradient-to-b from-steel to-paper pt-0 text-graphite">
      <div className="h-24 md:h-32" aria-hidden />
      <div className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28">
        <div className="[&_p.font-mono]:text-navy/70"><Heading kicker={t("services.kicker")} title={t("services.title")} sub={t("services.sub")} /></div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s, i) => <TiltCard key={s.slug} s={s} i={i} onOpen={() => setOpen(s)} />)}
        </div>
      </div>
      <AnimatePresence>{open && <Drawer s={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </section>
  );
}
export { Band };
