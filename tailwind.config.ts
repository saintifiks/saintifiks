import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Dark mode dikendalikan via atribut data-theme pada <html> (toggle manual + default OS).
  // Script anti-FOUC di layout.tsx selalu men-set data-theme, jadi preferensi OS tetap terbaca.
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      // Saintifiks color palette V2 - Mendukung Opacity Modifier (/10, /20, dst)
      colors: {
        paper:        'rgb(var(--color-paper) / <alpha-value>)',
        ink:          'rgb(var(--color-ink) / <alpha-value>)',
        night:        'rgb(var(--color-night) / <alpha-value>)',
        'warm-gray':  'rgb(var(--color-warm-gray) / <alpha-value>)',
        'sea-deep':   'rgb(var(--color-sea-deep) / <alpha-value>)',
        amber:        'rgb(var(--color-amber) / <alpha-value>)',
        'data-gray':  'rgb(var(--color-data-gray) / <alpha-value>)',
        'trend-up':   'rgb(var(--color-trend-up) / <alpha-value>)',
        'trend-down': 'rgb(var(--color-trend-down) / <alpha-value>)',
      },
      // Font families V2
      fontFamily: {
        display:   ['var(--font-display)', 'Georgia', 'serif'],
        libre:     ['var(--font-display)', 'Georgia', 'serif'],
        body:      ['"Source Serif 4"', 'var(--font-body)', 'Georgia', 'serif'],
        interface: ['"IBM Plex Sans"', 'var(--font-interface)', 'Arial', 'sans-serif'],
        mono:      ['"IBM Plex Mono"', 'var(--font-mono)', '"Courier New"', 'monospace'],
        sans:      ['"IBM Plex Sans"', 'var(--font-interface)', 'Arial', 'sans-serif'],
      },
      maxWidth: {
        content: '680px',
      },
      lineHeight: {
        reading: '1.75',
        deck:    '1.6',
        heading: '1.4',
      },
      fontSize: {
        kicker:         ['11px', { lineHeight: '1.4', letterSpacing: '0.05em', fontWeight: '500' }],
        'kicker-lg':    ['12px', { lineHeight: '1.4', letterSpacing: '0.05em', fontWeight: '500' }],
        meta:           ['12px', { lineHeight: '1.4' }],
        caption:        ['12px', { lineHeight: '1.5' }],
        'caption-lg':   ['13px', { lineHeight: '1.5' }],
        'body-sm':      ['16px', { lineHeight: '1.75' }],
        'body-base':    ['18px', { lineHeight: '1.75' }],
        'body-lg':      ['19px', { lineHeight: '1.75' }],
        'display-sm':   ['32px', { lineHeight: '1.2',  letterSpacing: '0.01em' }],
        'display-base': ['40px', { lineHeight: '1.15', letterSpacing: '0.01em' }],
        'display-lg':   ['52px', { lineHeight: '1.1',  letterSpacing: '0.01em' }],
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