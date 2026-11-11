import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#0b0b0f", 2: "#121218", 3: "#1b1b23", 4: "#26262f" },
        lime: { DEFAULT: "#c6ff3d", dim: "#a5d92a" },
        violet: { DEFAULT: "#7b61ff" },
        heart: "#ff3b6b",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
