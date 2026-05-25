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
        "accent-blue-hover": "#0024A3",
        // Hijau elegan — indikator naik di strip indeks (keputusan eksplisit)
        "accent-green": "#5C8F6E",
        // Token tonal — berbasis palette yang ada, bukan warna baru
        "text-secondary": "#6B6B6B",
        "text-muted": "#9A9A9A",
        "border-subtle": "#E2E0DC",
        "border-default": "#D8D6D2",
        "surface-elevated": "#EEECEA",
      },
      // Font families — Libre Baskerville di-load via Google Fonts di layout.tsx
      // Helvetica adalah system font, tidak perlu di-load
      fontFamily: {
        libre: ["var(--font-libre-baskerville)", "Georgia", "serif"],
        helvetica: ["Helvetica", "Arial", "sans-serif"],
      },
      fontSize: {
        "article-body": ["17px", { lineHeight: "1.72" }],
        "article-lead": ["20px", { lineHeight: "1.6" }],
      },
      boxShadow: {
        "xs": "0 1px 2px rgba(13, 13, 13, 0.06)",
        "sm": "0 1px 4px rgba(13, 13, 13, 0.08), 0 0 0 1px rgba(13, 13, 13, 0.04)",
        "md": "0 4px 12px rgba(13, 13, 13, 0.10), 0 1px 3px rgba(13, 13, 13, 0.06)",
        "lg": "0 8px 24px rgba(13, 13, 13, 0.14), 0 2px 8px rgba(13, 13, 13, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;