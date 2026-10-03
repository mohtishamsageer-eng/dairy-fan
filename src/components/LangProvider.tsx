"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { en, ur } from "@/lib/dictionary";

export type Lang = "en" | "ur";
type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  /** pick the Urdu variant of a data field when in Urdu mode, else English */
  pick: (enText: string, urText?: string) => string;
};
const LangCtx = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => en[k] ?? k, pick: (e) => e });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang") as Lang | null;
      if (saved === "ur" || saved === "en") setLangState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("lang", l); } catch {}
  }, []);

  const value = useMemo<Ctx>(() => ({
    lang, setLang,
    t: (key) => (lang === "ur" ? ur[key] : undefined) ?? en[key] ?? key,
    pick: (e, u) => (lang === "ur" && u ? u : e),
  }), [lang, setLang]);

  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}
export const useLang = () => useContext(LangCtx);
