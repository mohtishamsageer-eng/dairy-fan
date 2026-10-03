import { Fx } from "./Fx";

/** Wrapper for inner pages: dark header strip under the fixed nav, then content. */
export function PageShell({ kicker, title, intro, dark = false, children }: { kicker: React.ReactNode; title: React.ReactNode; intro?: React.ReactNode; dark?: boolean; children: React.ReactNode }) {
  return (
    <>
      <header className="relative overflow-hidden bg-navy pb-14 pt-32 text-paper md:pb-20 md:pt-40">
        <div className="blueprint pointer-events-none absolute inset-0 opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          <Fx>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-steel">{kicker}</p>
            <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight md:text-6xl">{title}</h1>
            {intro && <p className="mt-4 max-w-2xl text-lg text-alu">{intro}</p>}
          </Fx>
        </div>
      </header>
      <div className={dark ? "bg-navy text-paper" : "bg-paper text-graphite"}>
        <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">{children}</div>
      </div>
    </>
  );
}
