"use client";
import Link from "next/link";
import { useLang } from "./LangProvider";
import { WhatsAppIcon } from "./WhatsAppFab";
import { waLink } from "@/lib/site";

export function ServiceActions({ title, category }: { title: string; category: string }) {
  const { t } = useLang();
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <a className="btn btn-wa" target="_blank" rel="noopener" href={waLink(`Assalam o Alaikum, I want a quote for: ${title}`)}><WhatsAppIcon className="h-4 w-4" />{t("services.quote")}</a>
      <Link className="btn btn-line" href={`/products/?c=${category}`}>{t("services.view")}</Link>
    </div>
  );
}
