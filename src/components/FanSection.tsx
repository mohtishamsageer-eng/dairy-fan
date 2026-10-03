"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import products from "@/data/products.json";
import type { Product } from "@/data/types";
import { useLang } from "./LangProvider";
import { Heading } from "./Section";
import { Fx } from "./Fx";
import { WhatsAppIcon } from "./WhatsAppFab";
import { waLink } from "@/lib/site";
import { isMobileViewport, isWeakDevice, webglOK } from "@/lib/device";

const Viewer = dynamic(() => import("@/scene/FanViewerCanvas"), { ssr: false });
const fans = (products as unknown as Product[]).filter((p) => p.category === "dairy-fans");

export function FanSection() {
  const { t, pick } = useLang();
  const box = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const [on, setOn] = useState(true);
  const [mobile, setMobile] = useState(false);
  const [can3d, setCan3d] = useState(true);
  const [idx, setIdx] = useState(0);
  const fan = fans[idx];

  useEffect(() => {
    setMobile(isMobileViewport()); setCan3d(webglOK() && !isWeakDevice());
    const n = box.current; if (!n) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setShow(true), io.disconnect()), { rootMargin: "300px" });
    io.observe(n); return () => io.disconnect();
  }, []);

  return (
    <section id="fan" className="relative scroll-mt-16 overflow-hidden bg-navy py-20 text-paper md:py-28">
      <div className="blueprint pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 md:px-8 lg:grid-cols-[1.1fr_1fr]">
        <Fx>
          <div ref={box} data-cursor="fan" className="relative aspect-square w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-navy-700 to-navy sm:aspect-[5/4]" role="group" aria-label="Interactive 3D dairy fan. Drag to rotate.">
            {show && can3d ? <Viewer on={on} mobile={mobile} /> : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/assets/fan/poster.webp" alt="Khaleeq dairy fan" className="h-full w-full object-cover" loading="lazy" />
            )}
            {can3d && (
              <button onClick={() => setOn(!on)} aria-pressed={on} className="btn btn-ghost absolute bottom-4 start-4 bg-navy/60 backdrop-blur">
                <span className={`h-2 w-2 rounded-full ${on ? "bg-wa" : "bg-alu/50"}`} />{on ? t("fan.off") : t("fan.on")}
              </button>
            )}
            <span className="pointer-events-none absolute bottom-4 end-4 font-mono text-[10px] uppercase tracking-[0.25em] text-alu/70">↔ drag</span>
          </div>
        </Fx>
        <div>
          <Heading dark kicker={t("fan.kicker")} title={t("fan.title")} sub={t("fan.sub")} />
          <Fx>
            {fans.length > 1 && (
              <div className="mb-4 flex flex-wrap gap-2" role="tablist">
                {fans.map((f, i) => <button key={f.id} role="tab" aria-selected={i === idx} onClick={() => setIdx(i)} className={`rounded-full border px-4 py-1.5 text-sm ${i === idx ? "border-steel bg-steel text-navy" : "border-white/25 text-alu"}`}>{pick(f.name, f.nameUr)}</button>)}
              </div>
            )}
            <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-steel">{t("fan.specs")}</h3>
            <dl className="divide-y divide-white/10 border-y border-white/10 font-mono text-sm">
              {Object.entries(fan?.specs ?? {}).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2.5"><dt className="text-alu">{k}</dt><dd className="text-end text-white">{v}</dd></div>
              ))}
            </dl>
            <div className="mt-7 flex flex-wrap gap-3">
              <a className="btn btn-wa" target="_blank" rel="noopener" href={waLink(fan?.whatsappText ?? "Assalam o Alaikum, I want a quote for a Khaleeq Dairy Fan")}><WhatsAppIcon className="h-4 w-4" />{t("fan.quote")}</a>
              <button className="btn btn-ghost cursor-not-allowed opacity-60" disabled>{t("fan.brochure")}</button>
            </div>
          </Fx>
        </div>
      </div>
    </section>
  );
}
