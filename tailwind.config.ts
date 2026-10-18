import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Palette pilotée par variables CSS (thèmes) — valeurs dans globals.css
        paper: "rgb(var(--paper) / <alpha-value>)",
        secondary: "rgb(var(--secondary) / <alpha-value>)",
        "secondary-light": "rgb(var(--secondary-light) / <alpha-value>)",
        "text-sec": "rgb(var(--text-sec) / <alpha-value>)",
        ternary: "rgb(var(--ternary) / <alpha-value>)",
        "ternary-light": "rgb(var(--ternary-light) / <alpha-value>)",
      },
      fontFamily: {
        logo: ["LeviReBrushed", "cursive"],
        title: ["'Cartoonist Kooky'", "Candara", "sans-serif"],
        body: ["Candara", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
