import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        cream: "#fbf4ea",
        porcelain: "#fffaf4",
        blush: "#e9b7ad",
        rosewood: "#9f5f57",
        cocoa: "#6f4b3d",
        sage: "#8ea08b",
        ink: "#2d2723"
      },
      boxShadow: {
        soft: "0 18px 55px rgba(96, 69, 53, 0.12)"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
