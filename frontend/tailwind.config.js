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
        // Legacy token names kept (used widely across components) but repointed to a
        // clean, modern convenience-store palette so the whole app shifts at once.
        primary: '#E7F3EC',
        neutral: '#64748B',
        contrast: '#0F172A',
        cream: '#F7F8FA',
        sand: '#E2E8F0',
        charcoal: '#0F172A',
        'warm-gray': '#64748B',
        'warm-beige': '#E7F3EC',
      },
      fontFamily: {
        // Loaded once via next/font (see layout.tsx) and referenced through CSS variables.
        // `serif` token maps to the clean display sans (Plus Jakarta Sans) so every existing
        // `font-serif` heading becomes modern without per-file edits.
        serif: ['var(--font-serif)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-serif)', 'system-ui', 'sans-serif'],
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
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06)',
        'card-hover': '0 2px 6px rgba(15, 23, 42, 0.06), 0 18px 40px rgba(15, 23, 42, 0.12)',
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
}
