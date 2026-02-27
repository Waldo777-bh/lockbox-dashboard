import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#0a0c10",
          "bg-secondary": "#0f1218",
          card: "#141820",
          "card-hover": "#1a1f2a",
          border: "#1e2432",
          "border-bright": "#2a3142",
          text: "#e8eaf0",
          "text-secondary": "#8b92a5",
          "text-muted": "#5a6178",
          accent: "#22d68a",
          "accent-dim": "#1aad6f",
          warning: "#f0a744",
          danger: "#e8485c",
          blue: "#4a9eff",
          purple: "#9b7aff",
        },
      },
      fontFamily: {
        sans: ["Outfit", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
