import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        steel: { DEFAULT: "#7AB3CC", dark: "#4F8AA5", light: "#A9D0E2" },
        navy: { DEFAULT: "#0B1620", 800: "#122231", 700: "#1A3144" },
        graphite: "#2A2E31",
        alu: "#C9D1D6",
        paper: "#F4F7F8",
        accent: "#F2A93B",
        wa: "#25D366",
      },
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        urdu: ['"Noto Nastaliq Urdu"', "serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      transitionTimingFunction: { mech: "cubic-bezier(0.16, 1, 0.3, 1)" },
    },
  },
  plugins: [],
};
export default config;
