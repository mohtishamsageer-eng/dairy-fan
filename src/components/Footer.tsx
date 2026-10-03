"use client";
import Link from "next/link";
import services from "@/data/services.json";
import type { Service } from "@/data/types";
import { site, telLink } from "@/lib/site";
import { useLang } from "./LangProvider";
import { Logo } from "./Logo";

export function Footer() {
  const { t, pick } = useLang();
  return (
    <footer className="bg-[#070e15] text-alu">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4 md:px-8">
        <div><Logo className="text-paper" /><p className="mt-4 max-w-xs text-sm">{site.brand}: dairy-farm equipment, installation and service across Pakistan.</p></div>
        <div>
          <h4 className="mb-3 font-mono text-xs uppercase tracking-widest text-steel">{t("footer.links")}</h4>
          <ul className="space-y-2 text-sm">
            {[["/", "nav.home"], ["/#fan", "nav.fans"], ["/products/", "nav.products"], ["/installations/", "nav.installations"], ["/contact/", "nav.contact"]].map(([h, k]) => <li key={h}><Link className="hover:text-white" href={h}>{t(k)}</Link></li>)}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-mono text-xs uppercase tracking-widest text-steel">{t("footer.services")}</h4>
          <ul className="space-y-2 text-sm">{(services as Service[]).slice(0, 6).map((s) => <li key={s.slug}><Link className="hover:text-white" href={`/services/${s.slug}/`}>{pick(s.title, s.titleUr)}</Link></li>)}</ul>
        </div>
        <div>
          <h4 className="mb-3 font-mono text-xs uppercase tracking-widest text-steel">{t("footer.contact")}</h4>
          <ul className="space-y-2 text-sm"><li><a href={telLink()} className="hover:text-white">{site.phoneDisplay}</a></li><li>{site.email}</li><li>{site.address}</li><li><a href={site.facebook} target="_blank" rel="noopener" className="hover:text-white">Facebook</a></li></ul>
        </div>
      </div>
      <p className="border-t border-white/10 py-5 text-center text-xs">© {new Date().getFullYear()} {site.name}. {t("footer.rights")}</p>
    </footer>
  );
}
