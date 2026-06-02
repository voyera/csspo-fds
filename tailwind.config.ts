import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f3ede0",
        paper2: "#ece3d2",
        ink: "#211d17",
        inksoft: "#5a5347",
        rule: "#cfc4ad",
        pen: "#b5281b",
        ledger: "#3f6f4e",
        gold: "#9a6b1f",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
