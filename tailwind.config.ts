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
        // V3 semantic aliases (Design System V3.0)
        'surface-page':      'rgb(var(--color-surface-page) / <alpha-value>)',
        'surface-elevated':  'rgb(var(--color-surface-elevated) / <alpha-value>)',
        'surface-sunken':    'rgb(var(--color-surface-sunken) / <alpha-value>)',
        'surface-overlay':   'rgb(var(--color-surface-overlay) / <alpha-value>)',
        'surface-inverse':   'rgb(var(--color-surface-inverse) / <alpha-value>)',
        'text-primary':      'rgb(var(--color-text-primary) / <alpha-value>)',
        'text-secondary':    'rgb(var(--color-text-secondary) / <alpha-value>)',
        'text-tertiary':     'rgb(var(--color-text-tertiary) / <alpha-value>)',
        'text-on-inverse':   'rgb(var(--color-text-on-inverse) / <alpha-value>)',
        'text-link':         'rgb(var(--color-text-link) / <alpha-value>)',
        'border-default':    'rgb(var(--color-border-default) / <alpha-value>)',
        'border-strong':     'rgb(var(--color-border-strong) / <alpha-value>)',
        'border-accent':     'rgb(var(--color-border-accent) / <alpha-value>)',
        'interactive-primary':        'rgb(var(--color-interactive-primary) / <alpha-value>)',
        'interactive-primary-hover':  'rgb(var(--color-interactive-primary-hover) / <alpha-value>)',
        'interactive-primary-active': 'rgb(var(--color-interactive-primary-active) / <alpha-value>)',
        'signal-success':          'rgb(var(--color-signal-success) / <alpha-value>)',
        'signal-success-surface':  'rgb(var(--color-signal-success-surface) / <alpha-value>)',
        'signal-warning':          'rgb(var(--color-signal-warning) / <alpha-value>)',
        'signal-warning-surface':  'rgb(var(--color-signal-warning-surface) / <alpha-value>)',
        'signal-danger':           'rgb(var(--color-signal-danger) / <alpha-value>)',
        'signal-danger-surface':   'rgb(var(--color-signal-danger-surface) / <alpha-value>)',
        'signal-info':             'rgb(var(--color-signal-info) / <alpha-value>)',
        'signal-info-surface':     'rgb(var(--color-signal-info-surface) / <alpha-value>)',
      },
      // Font families V2
      fontFamily: {
        display:   ['var(--font-display)', 'Georgia', 'serif'],
        libre:     ['var(--font-display)', 'Georgia', 'serif'],
        body:      ['"Source Serif 4"', 'var(--font-body)', 'Georgia', 'serif'],
        lora:      ['var(--font-lora)', 'Lora', 'Georgia', 'serif'],
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
        "xs": "var(--shadow-xs)",
        "sm": "var(--shadow-sm)",
        "md": "var(--shadow-md)",
        "lg": "0 8px 24px rgba(13, 13, 13, 0.14), 0 2px 8px rgba(13, 13, 13, 0.08)",
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      transitionDuration: {
        swift: 'var(--duration-swift)',
        moderate: 'var(--duration-moderate)',
        deliberate: 'var(--duration-deliberate)',
      },
      zIndex: {
        raised: 'var(--z-raised)',
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        overlay: 'var(--z-overlay)',
        modal: 'var(--z-modal)',
        toast: 'var(--z-toast)',
        tooltip: 'var(--z-tooltip)',
      },
    },
  },
  plugins: [],
};

export default config;