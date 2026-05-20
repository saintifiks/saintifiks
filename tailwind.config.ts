import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Saintifiks color palette — jangan tambah warna lain tanpa keputusan eksplisit
      colors: {
        "primary-dark": "#0D0D0D",
        "primary-light": "#F5F4F0",
        "accent-red": "#C90203",
        "accent-blue": "#002EC7",
        // Hijau elegan — indikator naik di strip indeks (keputusan eksplisit)
        "accent-green": "#5C8F6E",
      },
      // Font families — Libre Baskerville di-load via Google Fonts di layout.tsx
      // Helvetica adalah system font, tidak perlu di-load
      fontFamily: {
        libre: ["var(--font-libre-baskerville)", "Georgia", "serif"],
        helvetica: ["Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;