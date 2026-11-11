import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#0a0a0a", 2: "#111111", 3: "#181818", 4: "#222222" },
        // Monochrome theme: "lime" is the primary (white) and "violet" the secondary (graphite).
        lime: { DEFAULT: "#ffffff", dim: "#d4d4d4" },
        violet: { DEFAULT: "#2a2a2a" },
        heart: "#ffffff",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
