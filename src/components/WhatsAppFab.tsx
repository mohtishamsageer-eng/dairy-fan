"use client";
import { useLang } from "./LangProvider";
import { waLink } from "@/lib/site";

export function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.27-1.38A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.2 8.2 0 1 1 7 3.87Zm4.5-6.15c-.25-.12-1.46-.72-1.69-.8-.22-.08-.39-.12-.55.12-.16.25-.63.8-.78.96-.14.17-.29.18-.54.06a6.7 6.7 0 0 1-3.3-2.88c-.25-.43.25-.4.71-1.32.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.3-.22.25-.86.84-.86 2.05 0 1.2.88 2.37 1 2.54.12.16 1.72 2.62 4.17 3.68 1.55.67 2.15.73 2.93.61.47-.07 1.46-.6 1.66-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  );
}

export function WhatsAppFab() {
  const { t } = useLang();
  return (
    <a href={waLink("Assalam o Alaikum, I want to know more about Khaleeq Fans")} target="_blank" rel="noopener"
      aria-label={t("common.wa")}
      className="wa-pulse fixed bottom-5 end-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-wa text-white shadow-[0_8px_30px_rgba(37,211,102,.45)] transition-transform hover:scale-110">
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
