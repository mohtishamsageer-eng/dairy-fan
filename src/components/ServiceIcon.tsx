/** Animated line icons (pure SVG + CSS keyframes in globals.css). */
export function ServiceIcon({ name, className = "h-14 w-14" }: { name: string; className?: string }) {
  const p = { viewBox: "0 0 64 64", fill: "none", stroke: "currentColor", strokeWidth: 2.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className: `ico ${className}`, "aria-hidden": true };
  switch (name) {
    case "fan":
      return (<svg {...p}><circle cx="32" cy="32" r="27" /><g className="spin">{[0, 120, 240].map((a) => <path key={a} transform={`rotate(${a} 32 32)`} d="M30 28 L27 8 L37 8 L34 28 Z" />)}</g><circle cx="32" cy="32" r="4" fill="currentColor" /></svg>);
    case "install":
      return (<svg {...p}><g className="wig"><path d="M40 8a11 11 0 0 0-9 15L10 44a5 5 0 0 0 7 7l21-21a11 11 0 0 0 15-9l-8 4-5-5 4-8-4-2Z" /></g><path d="M44 52h12M50 46v12" opacity=".5" /></svg>);
    case "wiring":
      return (<svg {...p}><path d="M6 44h14l6-24h12l6 24h14" className="dash" /><circle cx="6" cy="44" r="3" /><circle cx="58" cy="44" r="3" /><path d="M26 20v-8M38 20v-8" /></svg>);
    case "panel":
      return (<svg {...p}><rect x="8" y="6" width="48" height="52" rx="4" />{[0, 1, 2].map((i) => (<g key={i}><rect x={16 + i * 13} y="16" width="8" height="22" rx="3" opacity=".5" /><circle className={i % 2 ? "flip2" : "flip"} cx={20 + i * 13} cy="22" r="2.6" fill="currentColor" /></g>))}<path d="M16 48h32" /></svg>);
    case "milk":
      return (<svg {...p}><g className="bob"><path d="M32 6C22 20 16 28 16 37a16 16 0 0 0 32 0C48 28 42 20 32 6Z" /></g><path d="M20 40c4 3 8 3 12 0s8-3 12 0" opacity=".6" /></svg>);
    case "control":
      return (<svg {...p}><rect x="6" y="20" width="52" height="24" rx="12" /><circle className="slide" cx="18" cy="32" r="7" fill="currentColor" /><path d="M16 8v5M32 8v5M48 8v5" opacity=".5" /><path d="M14 54h8M42 54h8" /></svg>);
    case "shower":
      return (<svg {...p}><path d="M8 24a24 14 0 0 1 48 0Z" /><path d="M32 10V4M18 24l-2 2" opacity=".6" />{[16, 32, 48].map((x, i) => <path key={x} className="drop" style={{ animationDelay: `${i * 0.45}s` }} d={`M${x} 34v6`} />)}{[24, 40].map((x, i) => <path key={x} className="drop" style={{ animationDelay: `${0.2 + i * 0.5}s` }} d={`M${x} 44v6`} />)}</svg>);
    case "parts":
      return (<svg {...p}><g className="spin-slow"><circle cx="32" cy="32" r="12" />{Array.from({ length: 8 }, (_, i) => <path key={i} transform={`rotate(${i * 45} 32 32)`} d="M32 14V6M28 8h8" />)}</g><circle cx="32" cy="32" r="4" /></svg>);
    case "pump":
      return (<svg {...p}><rect x="14" y="26" width="36" height="30" rx="4" /><path d="M14 40h36" opacity=".5" /><g className="piston"><path d="M32 8v18M24 8h16" /></g><path d="M50 48h8M6 48h8" /></svg>);
    default:
      return <svg {...p}><circle cx="32" cy="32" r="24" /></svg>;
  }
}
