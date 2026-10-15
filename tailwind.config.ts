import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Palette fidèle à la maquette Mazala
        paper: "#f7f7f7",
        secondary: "#4A4860",
        "secondary-light": "#585371",
        "text-sec": "#716F94",
        ternary: "#CC8800",
        "ternary-light": "#F5A608",
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
