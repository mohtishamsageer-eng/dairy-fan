"use client";
import { useLang } from "./LangProvider";

/** Translated text for server components: <T k="key" /> or <T en="..." ur="..." />. */
export function T({ k, en, ur }: { k?: string; en?: string; ur?: string }) {
  const { t, pick } = useLang();
  return <>{k ? t(k) : pick(en ?? "", ur)}</>;
}
