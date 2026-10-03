"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "./Logo";
import { useLang } from "./LangProvider";
import { WhatsAppIcon } from "./WhatsAppFab";
import { waLink } from "@/lib/site";

const links = [
  { href: "/", key: "nav.home" },
  { href: "/#fan", key: "nav.fans" },
  { href: "/#services", key: "nav.services" },
  { href: "/products/", key: "nav.products" },
  { href: "/installations/", key: "nav.installations" },
  { href: "/contact/", key: "nav.contact" },
];

export function Nav() {
  const { t, lang, setLang } = useLang();
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 30);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [path]);

  const solid = scrolled || path !== "/" || open;
  return (
    <header className={`fixed inset-x-0 top-0 z-50 text-paper transition-all duration-500 ${solid ? "bg-navy/75 shadow-[0_1px_0_rgba(255,255,255,.08)] backdrop-blur-xl" : "bg-transparent"}`}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:h-20 md:px-8" aria-label="Main">
        <Logo />
        <ul className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <li key={l.href}><Link href={l.href} className="text-sm text-alu transition-colors hover:text-white">{t(l.key)}</Link></li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <button onClick={() => setLang(lang === "en" ? "ur" : "en")} className="rounded-full border border-white/25 px-3 py-1.5 text-xs font-semibold text-alu transition hover:border-steel hover:text-white" aria-label="Switch language">
            {lang === "en" ? "اردو" : "EN"}
          </button>
          <a href={waLink("Assalam o Alaikum, I want a quote for Khaleeq Fans")} target="_blank" rel="noopener" className="btn btn-wa hidden !px-4 !py-2 sm:inline-flex"><WhatsAppIcon className="h-4 w-4" />{t("nav.whatsapp")}</a>
          <button className="grid h-10 w-10 place-items-center rounded-full border border-white/25 lg:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={t("nav.menu")}>
            <span className="relative block h-3 w-5">
              <span className={`absolute inset-x-0 top-0 h-0.5 bg-current transition ${open ? "translate-y-[5px] rotate-45" : ""}`} />
              <span className={`absolute inset-x-0 top-[5px] h-0.5 bg-current transition ${open ? "opacity-0" : ""}`} />
              <span className={`absolute inset-x-0 top-[10px] h-0.5 bg-current transition ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden lg:hidden">
            <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-5 pb-6 pt-2">
              {links.map((l) => (
                <li key={l.href}><Link href={l.href} className="block rounded-lg px-3 py-3 font-display text-lg text-paper hover:bg-white/5">{t(l.key)}</Link></li>
              ))}
              <li className="pt-2"><a href={waLink("Assalam o Alaikum, I want a quote for Khaleeq Fans")} className="btn btn-wa w-full" target="_blank" rel="noopener"><WhatsAppIcon className="h-4 w-4" />{t("hero.cta")}</a></li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
