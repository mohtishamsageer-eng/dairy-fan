"use client";
import { useEffect, useRef } from "react";

/** Reveals children when they scroll into view. Content is visible by default if JS fails. */
export function Fx({ children, className = "", delay = 0, as: Tag = "div" }: {
  children: React.ReactNode; className?: string; delay?: number; as?: "div" | "li" | "section" | "article";
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const n = ref.current; if (!n) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { n.classList.add("in"); io.disconnect(); } }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    io.observe(n); return () => io.disconnect();
  }, []);
  const T = Tag as "div";
  return <T ref={ref as React.RefObject<HTMLDivElement>} className={`fx ${className}`} style={{ "--d": `${delay}s` } as React.CSSProperties}>{children}</T>;
}
