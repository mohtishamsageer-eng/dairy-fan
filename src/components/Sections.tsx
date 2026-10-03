"use client";
import { useEffect, useRef, useState } from "react";
import testimonials from "@/data/testimonials.json";
import { site } from "@/lib/site";
import { useLang } from "./LangProvider";
import { Band, Heading } from "./Section";
import { Fx } from "./Fx";

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      const t0 = performance.now();
      const step = (t: number) => { const k = Math.min(1, (t - t0) / 1400); setN(Math.round(value * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
    io.observe(el); return () => io.disconnect();
  }, [value]);
  return <span ref={ref}>{n}{suffix}</span>;
}

const whyIcons = ["M4 20h16M6 20V10l6-6 6 6v10", "M3 12l6 6L21 6", "M12 3a9 9 0 1 0 9 9M12 7v5l3 3", "M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z", "M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"];

export function Why() {
  const { t, pick } = useLang();
  return (
    <Band id="why" dark>
      <Heading dark kicker={t("why.kicker")} title={t("why.title")} />
      {site.stats.length > 0 && (
        <Fx className="mb-12 grid grid-cols-2 gap-6 border-y border-white/10 py-8 md:grid-cols-4">
          {site.stats.map((s) => (
            <div key={s.label}><p className="font-display text-4xl font-bold text-steel md:text-5xl"><Counter value={s.value} suffix={s.suffix} /></p><p className="mt-1 text-sm text-alu">{pick(s.label, s.labelUr)}</p></div>
          ))}
        </Fx>
      )}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Fx key={i} delay={(i % 3) * 0.08} className="rounded-2xl border border-white/10 bg-white/[.03] p-6 transition-colors hover:border-steel/50 hover:bg-white/[.06]">
            <svg viewBox="0 0 24 24" className="mb-4 h-9 w-9 text-steel" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={whyIcons[i - 1]} /></svg>
            <h3 className="font-display text-xl font-semibold">{t(`why.${i}.t`)}</h3>
            <p className="mt-2 text-sm leading-relaxed text-alu">{t(`why.${i}.b`)}</p>
          </Fx>
        ))}
      </div>
    </Band>
  );
}

export function Process() {
  const { t } = useLang();
  return (
    <Band id="process">
      <Heading kicker={t("process.kicker")} title={t("process.title")} />
      <ol className="relative grid gap-8 md:grid-cols-5 md:gap-4">
        <span className="absolute start-[1.35rem] top-2 h-[calc(100%-1rem)] w-px bg-navy/15 md:start-0 md:top-[1.35rem] md:h-px md:w-full" aria-hidden />
        {[1, 2, 3, 4, 5].map((i) => (
          <Fx as="li" key={i} delay={i * 0.12} className="relative ps-14 md:ps-0 md:pt-14">
            <span className="absolute start-0 top-0 grid h-11 w-11 place-items-center rounded-full bg-navy font-mono text-sm text-steel ring-4 ring-paper">{String(i).padStart(2, "0")}</span>
            <h3 className="font-display text-lg font-semibold text-navy">{t(`process.${i}.t`)}</h3>
            <p className="mt-1 text-sm text-graphite/75">{t(`process.${i}.b`)}</p>
          </Fx>
        ))}
      </ol>
    </Band>
  );
}

const benefitIcons = [
  <path key="a" d="M12 3v12a4 4 0 1 0 0 0V3m0 0h0M9 6h3M9 9h3" />,
  <path key="b" d="M12 2l8 3v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V5z" />,
  <path key="c" d="M9 2h6v3l2 3v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V8l2-3zM7 12h10" />,
  <path key="d" d="M12 21s-8-5.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.5-8 11-8 11Z" />,
];
export function Benefits() {
  const { t } = useLang();
  return (
    <Band id="benefits" dark className="overflow-hidden">
      <div className="blueprint pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div className="relative">
        <Heading dark kicker={t("benefits.kicker")} title={t("benefits.title")} sub={t("benefits.chain")} />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Fx key={i} delay={i * 0.1} className="relative rounded-2xl border border-white/10 bg-navy-800/70 p-6 text-center">
              <svg viewBox="0 0 24 24" className="mx-auto mb-4 h-12 w-12 text-steel" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{benefitIcons[i - 1]}</svg>
              <p className="font-display text-lg font-semibold">{t(`benefits.${i}`)}</p>
              {i < 4 && <span className="absolute -end-3 top-1/2 z-10 hidden -translate-y-1/2 text-steel lg:block rtl:rotate-180" aria-hidden>→</span>}
            </Fx>
          ))}
        </div>
      </div>
    </Band>
  );
}

type Testi = { name: string; place?: string; text: string };
export function Testimonials() {
  const { t } = useLang();
  const list = testimonials as Testi[];
  return (
    <Band id="testimonials">
      <Heading kicker={t("testi.kicker")} title={t("testi.title")} />
      {list.length === 0 ? (
        <Fx className="rounded-2xl border border-dashed border-navy/25 p-10 text-center text-graphite/70">{t("testi.placeholder")}</Fx>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {list.map((x, i) => (
            <Fx key={i} delay={i * 0.08} className="rounded-2xl bg-white p-6 shadow-sm"><blockquote className="text-graphite">“{x.text}”</blockquote><p className="mt-4 font-semibold text-navy">{x.name}</p>{x.place && <p className="text-sm text-graphite/60">{x.place}</p>}</Fx>
          ))}
        </div>
      )}
    </Band>
  );
}
