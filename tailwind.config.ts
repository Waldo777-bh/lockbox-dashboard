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
        /* N5: rgb() + <alpha-value> enables opacity modifiers like bg-brand-accent/10 */
        brand: {
          bg: "rgb(var(--brand-bg) / <alpha-value>)",
          "bg-secondary": "rgb(var(--brand-bg-secondary) / <alpha-value>)",
          "bg-tertiary": "rgb(var(--brand-bg-tertiary) / <alpha-value>)",
          card: "rgb(var(--brand-card) / <alpha-value>)",
          "card-hover": "rgb(var(--brand-card-hover) / <alpha-value>)",
          border: "rgb(var(--brand-border) / <alpha-value>)",
          "border-bright": "rgb(var(--brand-border-bright) / <alpha-value>)",
          text: "rgb(var(--brand-text) / <alpha-value>)",
          "text-secondary": "rgb(var(--brand-text-secondary) / <alpha-value>)",
          "text-muted": "rgb(var(--brand-text-muted) / <alpha-value>)",
          accent: "rgb(var(--brand-accent) / <alpha-value>)",
          "accent-dim": "rgb(var(--brand-accent-dim) / <alpha-value>)",
          pro: "rgb(var(--brand-pro) / <alpha-value>)",
          warning: "rgb(var(--brand-warning) / <alpha-value>)",
          danger: "rgb(var(--brand-danger) / <alpha-value>)",
          blue: "rgb(var(--brand-blue) / <alpha-value>)",
          purple: "rgb(var(--brand-purple) / <alpha-value>)",
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
