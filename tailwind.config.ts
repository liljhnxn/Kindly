import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: "#FCFAF7",
          100: "#F8F5EE",
          200: "#F0EAE0",
          300: "#E5DDCE",
          400: "#D4C7B2",
          500: "#B8A78D",
        },
        forest: {
          50: "#EEF5F1",
          100: "#D7E8DE",
          200: "#B0D1C0",
          300: "#80B39C",
          400: "#4D8E73",
          500: "#2B6E52",
          600: "#1E543E",
          700: "#1A4533",
          800: "#16382A",
          900: "#0F261C",
          950: "#081610",
        },
        terracotta: {
          50: "#FDF5F2",
          100: "#FCE8E2",
          200: "#F9D3C7",
          300: "#F3B5A1",
          400: "#E98C70",
          500: "#E06D4B",
          600: "#C95433",
          700: "#A84126",
          800: "#893722",
          900: "#703120",
        },
        charcoal: {
          50: "#F6F7F7",
          100: "#EBEDED",
          200: "#D6DBDA",
          300: "#B5BCBA",
          400: "#8E9794",
          500: "#6B7471",
          600: "#535B58",
          700: "#424846",
          800: "#282D2B",
          900: "#1A1D1C",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(22, 56, 42, 0.05), 0 4px 6px -2px rgba(22, 56, 42, 0.02)",
        lifted: "0 10px 25px -5px rgba(22, 56, 42, 0.08), 0 8px 10px -6px rgba(22, 56, 42, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;

