import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0A1128",
          dark: "#080D1F",
          card: "#101935",
          orange: "#F2A93B",
          amber: "#F2A93B",
          blaze: "#FF6B00",
          accent: "#38BDF8",
          purple: "#8B5CF6",
          emerald: "#10B981",
          rose: "#F43F5E",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
