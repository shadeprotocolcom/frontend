import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        shade: {
          bg: "#0a0a0a",
          surface: "#111111",
          border: "#1e1e1e",
          "border-hover": "#2a2a2a",
          muted: "#666666",
          text: "#e5e5e5",
          green: "#22c55e",
          "green-dim": "#16a34a",
          red: "#ef4444",
          "red-dim": "#dc2626",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
