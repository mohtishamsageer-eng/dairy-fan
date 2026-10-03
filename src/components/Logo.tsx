import Link from "next/link";

export function Logo({ light = true, className = "" }: { light?: boolean; className?: string }) {
  return (
    <Link href="/" aria-label="Khaleeq Engineering, home" className={`group inline-flex items-center gap-2.5 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/assets/logo/logo-mark-${light ? "light" : "dark"}.png`} alt="" width={40} height={40} className="h-9 w-9 object-contain transition-transform duration-700 group-hover:rotate-[60deg]" />
      <span className="leading-none">
        <span className="block font-display text-lg font-bold tracking-[0.18em]">KHALEEQ</span>
        <span className="mt-0.5 hidden font-mono min-[420px]:block text-[9px] uppercase tracking-[0.3em] opacity-70">Engineering · Fans</span>
      </span>
    </Link>
  );
}
