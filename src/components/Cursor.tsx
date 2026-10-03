"use client";
import { useEffect, useRef } from "react";

/** Desktop-only custom cursor: a dot that becomes a spinning fan over interactive 3D. */
export function Cursor() {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    document.body.classList.add("has-kcursor");
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      const t = e.target as HTMLElement | null;
      const c = el.current; if (!c) return;
      c.classList.toggle("is-fan", !!t?.closest('[data-cursor="fan"]'));
      c.classList.toggle("is-link", !!t?.closest("a,button,[role=button],input,select,textarea,label"));
    };
    const loop = () => {
      cx += (x - cx) * 0.22; cy += (y - cy) * 0.22;
      if (el.current) el.current.style.transform = `translate3d(${cx}px,${cy}px,0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener("pointermove", move); cancelAnimationFrame(raf); document.body.classList.remove("has-kcursor"); };
  }, []);
  return (
    <div ref={el} className="kcursor" aria-hidden>
      <span className="dot" />
      <svg className="fan" viewBox="-50 -50 100 100"><circle r="44" fill="none" stroke="currentColor" strokeWidth="4" />{[0, 120, 240].map((a) => <path key={a} transform={`rotate(${a})`} d="M-5 -6 L-9 -38 L9 -38 L5 -6 Z" fill="currentColor" />)}<circle r="7" fill="currentColor" /></svg>
    </div>
  );
}
