import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'media',
  theme: {
    extend: {
      // Saintifiks color palette V2
       colors: {
         paper:        { DEFAULT: '#F7F5F0', night: '#0F1620' },
         ink:          { DEFAULT: '#1A1917', night: '#E8E4DC' },
         night:        '#0F1620',
         'warm-gray':  { DEFAULT: '#5A5750', night: '#8A8880' },
         'sea-deep':   { DEFAULT: '#0B5263', light: '#3A9BB5' },
         amber:        { DEFAULT: '#C8972A', night: '#E8B84B' },
         'data-gray':  '#B8B4AE',
         'trend-up':   '#5C8F6E',
         'trend-down': '#C90203',
       },
      // Font families V2
      fontFamily: {
        display:   ['Marcellus', 'var(--font-display)', 'Georgia', 'serif'],
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