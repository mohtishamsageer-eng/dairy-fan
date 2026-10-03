"use client";
import { useState } from "react";
import services from "@/data/services.json";
import type { Service } from "@/data/types";
import { site, telLink, waLink } from "@/lib/site";
import { useLang } from "./LangProvider";
import { WhatsAppIcon } from "./WhatsAppFab";

export function ContactForm({ dark = false }: { dark?: boolean }) {
  const { t, pick } = useLang();
  const [sel, setSel] = useState<string[]>([]);
  const toggle = (s: string) => setSel((a) => (a.includes(s) ? a.filter((x) => x !== s) : [...a, s]));
  const field = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-steel ${dark ? "border-white/20 bg-white/5 text-paper placeholder:text-alu/60" : "border-navy/20 bg-white text-graphite"}`;

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const lines = [
      "Assalam o Alaikum, I would like a quote / site survey.",
      `Name: ${f.get("name")}`, `Phone: ${f.get("phone")}`, `City: ${f.get("city")}`,
      f.get("animals") ? `Number of animals: ${f.get("animals")}` : "",
      sel.length ? `Services needed: ${sel.join(", ")}` : "",
      f.get("message") ? `Message: ${f.get("message")}` : "",
    ].filter(Boolean);
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  };

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm"><span>{t("contact.name")}</span><input name="name" required autoComplete="name" className={field} /></label>
        <label className="grid gap-1.5 text-sm"><span>{t("contact.phone")}</span><input name="phone" required type="tel" inputMode="tel" autoComplete="tel" className={field} /></label>
        <label className="grid gap-1.5 text-sm"><span>{t("contact.city")}</span><input name="city" required className={field} /></label>
        <label className="grid gap-1.5 text-sm"><span>{t("contact.animals")}</span><input name="animals" type="number" min="0" inputMode="numeric" className={field} /></label>
      </div>
      <fieldset>
        <legend className="mb-2 text-sm">{t("contact.services")}</legend>
        <div className="flex flex-wrap gap-2">
          {(services as Service[]).map((s) => {
            const on = sel.includes(s.title);
            return <button type="button" key={s.slug} onClick={() => toggle(s.title)} aria-pressed={on}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition ${on ? "border-steel bg-steel text-navy" : dark ? "border-white/25 text-alu hover:border-steel" : "border-navy/25 hover:border-navy"}`}>{pick(s.title, s.titleUr)}</button>;
          })}
        </div>
      </fieldset>
      <label className="grid gap-1.5 text-sm"><span>{t("contact.message")}</span><textarea name="message" rows={4} className={field} /></label>
      <div>
        <button type="submit" className="btn btn-wa"><WhatsAppIcon className="h-4 w-4" />{t("contact.send")}</button>
        <p className={`mt-2 text-xs ${dark ? "text-alu" : "text-graphite/60"}`}>{t("contact.note")}</p>
      </div>
    </form>
  );
}

export function ContactInfo({ dark = false }: { dark?: boolean }) {
  const { t } = useLang();
  const sub = dark ? "text-alu" : "text-graphite/70";
  return (
    <div className="grid gap-5">
      <div><p className={`font-mono text-xs uppercase tracking-widest ${dark ? "text-steel" : "text-steel-dark"}`}>{t("contact.call")}</p><a href={telLink()} className="font-display text-xl font-semibold">{site.phoneDisplay}</a><p className={`text-sm ${sub}`}>{site.email}</p></div>
      <div><p className={`font-mono text-xs uppercase tracking-widest ${dark ? "text-steel" : "text-steel-dark"}`}>{t("contact.address")}</p><p>{site.address}</p><p className={sub}>{site.city}</p></div>
      <div><p className={`font-mono text-xs uppercase tracking-widest ${dark ? "text-steel" : "text-steel-dark"}`}>{t("contact.timings")}</p><p>{site.timings}</p></div>
      {site.mapEmbed ? (
        <iframe title="Map" src={site.mapEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-64 w-full rounded-2xl border-0" />
      ) : (
        <div className={`grid h-48 place-items-center rounded-2xl border border-dashed text-sm ${dark ? "border-white/20 text-alu" : "border-navy/25 text-graphite/60"}`}>[PLACEHOLDER: Google Map. Set site.mapEmbed in src/lib/site.ts]</div>
      )}
    </div>
  );
}
