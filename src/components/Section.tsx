import { Fx } from "./Fx";

export function Heading({ kicker, title, sub, dark = false, center = false }: { kicker: string; title: string; sub?: string; dark?: boolean; center?: boolean }) {
  return (
    <Fx className={`mb-10 max-w-2xl md:mb-14 ${center ? "mx-auto text-center" : ""}`}>
      <p className={`mb-3 font-mono text-xs uppercase tracking-[0.3em] ${dark ? "text-steel" : "text-steel-dark"}`}>{kicker}</p>
      <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{title}</h2>
      {sub && <p className={`mt-4 text-base md:text-lg ${dark ? "text-alu" : "text-graphite/80"}`}>{sub}</p>}
    </Fx>
  );
}

export function Band({ id, dark, children, className = "" }: { id?: string; dark?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`relative scroll-mt-16 py-20 md:py-28 ${dark ? "bg-navy text-paper" : "bg-paper text-graphite"} ${className}`}>
      <div className="mx-auto max-w-7xl px-5 md:px-8">{children}</div>
    </section>
  );
}
