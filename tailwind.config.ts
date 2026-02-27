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
          "bg-tertiary": "#1a1f2a",
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
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-12px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "fade-in-up": "fade-in-up 0.4s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        shimmer: "shimmer 2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
