/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand = the active mode's accent, driven by CSS variables so the whole UI
        // (header, buttons, chatbot, badges) re-tints when the department mode changes.
        // Defaults live in globals.css; per-mode values are set on <body> (see layout.tsx).
        brand: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          dark: 'var(--accent-dark)',
          light: 'var(--accent-light)',
          soft: 'var(--accent-soft)',
        },
        // "Noir & Gold" palette. The legacy token names are kept (used widely across
        // components) but repointed to the dark editorial scheme so the whole app flips
        // at once. `contrast` = primary (light) text/foreground; `cream` = page bg.
        background: '#0D0D0D',
        surface: '#171717',
        'surface-2': '#212121',
        foreground: '#F5F4F0',
        primary: '#171717',
        neutral: '#9B9689',
        contrast: '#F5F4F0',
        cream: '#0D0D0D',
        sand: '#2A2A2A',
        charcoal: '#0D0D0D',
        'warm-gray': '#9B9689',
        'warm-beige': '#171717',
      },
      fontFamily: {
        // Loaded once via next/font (see layout.tsx) and referenced through CSS variables.
        // `serif`/`display` -> Bebas Neue (condensed all-caps display), `sans` -> Barlow
        // (body), `mono` -> JetBrains Mono (prices, badges, metadata labels).
        serif: ['var(--font-serif)', 'ui-sans-serif', 'sans-serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'sans-serif'],
        display: ['var(--font-serif)', 'ui-sans-serif', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-xl': ['4.25rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-lg': ['3.25rem', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        'display-md': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      // The editorial system is intentionally sharp: everything but true circles
      // (rounded-full, kept for dots/avatars/spinners) collapses to square corners.
      borderRadius: {
        none: '0',
        sm: '0',
        DEFAULT: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        '3xl': '0',
        full: '9999px',
      },
      boxShadow: {
        // Noir relies on borders, not drop shadows; shadows become subtle depth only.
        card: '0 1px 2px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.55)',
        soft: '0 10px 30px rgba(0, 0, 0, 0.45)',
      },
    },
  },
  plugins: [],
}
