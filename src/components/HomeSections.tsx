"use client";
import Link from "next/link";
import { useLang } from "./LangProvider";
import { Band, Heading } from "./Section";
import { ProductsCatalog } from "./ProductsCatalog";
import { Installations } from "./Installations";
import { ContactForm, ContactInfo } from "./ContactForm";

export function ProductsPreview() {
  const { t } = useLang();
  return (
    <Band id="products">
      <Heading kicker={t("products.kicker")} title={t("products.title")} />
      <ProductsCatalog limit={6} />
      <div className="mt-10 text-center"><Link href="/products/" className="btn btn-dark">{t("hero.cta2")} →</Link></div>
    </Band>
  );
}

export function InstallationsPreview() {
  const { t } = useLang();
  return (
    <Band id="installations" dark>
      <Heading dark kicker={t("work.kicker")} title={t("work.title")} />
      <Installations limit={6} />
    </Band>
  );
}

export function QuoteSection() {
  const { t } = useLang();
  return (
    <Band id="contact">
      <Heading kicker={t("contact.kicker")} title={t("contact.title")} />
      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]"><ContactForm /><ContactInfo /></div>
    </Band>
  );
}
