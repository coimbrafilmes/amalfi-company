/**
 * Amalfi & Co. — Tailwind CSS Config
 * --------------------------------------------------------------------
 * Fonte: docs/brand/Amalfi Co. — Manual de Marca.pdf (v1.0 · Maio 2026)
 * Tradução de tokens.css → Tailwind v4 / v3 config.
 * Pra @dev: importa este config no projeto Bottega; já vem com paleta,
 * tipografia, espaçamentos e tudo do brandbook.
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    // ========== COLORS ==========
    // Sobrescrevemos COMPLETAMENTE a paleta default (princípio Amalfi:
    // só usar cores oficiais do brandbook).
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      black: '#000000',

      // Primárias (60-25-15)
      tinta: {
        DEFAULT: '#1F2A3A',
        // alphas pra borders/overlays
        '08': 'rgba(31, 42, 58, 0.08)',
        '15': 'rgba(31, 42, 58, 0.15)',
        '50': 'rgba(31, 42, 58, 0.50)',
        '65': 'rgba(31, 42, 58, 0.65)',
      },
      mar: '#2D5D7B',
      terracota: {
        DEFAULT: '#C47855',
        hover: '#B6643F',
      },

      // Secundárias
      aqua: '#6E9BB3',
      ceu: '#CFDFE6',
      ocre: '#D4A05A',
      areia: '#E6D6BF',
      osso: {
        DEFAULT: '#F4EDE0',
        '15': 'rgba(244, 237, 224, 0.15)',
        '50': 'rgba(244, 237, 224, 0.50)',
        '65': 'rgba(244, 237, 224, 0.65)',
        '80': 'rgba(244, 237, 224, 0.80)',
      },
    },

    // ========== TIPOGRAFIA ==========
    fontFamily: {
      // Display — DM Serif Display Regular (títulos, capas, headlines, logo)
      display: ['"DM Serif Display"', 'Times New Roman', 'Georgia', 'serif'],
      // Editorial — Cormorant Garamond Italic (subtítulos, citações)
      editorial: ['"Cormorant Garamond"', 'Times New Roman', 'serif'],
      // UI — Inter (body, interfaces, botões, etiquetas)
      ui: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      // Aliases:
      sans: ['Inter', 'sans-serif'],
      serif: ['"DM Serif Display"', 'serif'],
    },

    fontSize: {
      // Display (DM Serif)
      'display-xl': ['96px', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
      'display-l':  ['64px', { lineHeight: '1.08', letterSpacing: '-0.01em' }],
      'display-m':  ['48px', { lineHeight: '1.1',  letterSpacing: '-0.005em' }],
      'display-s':  ['32px', { lineHeight: '1.15' }],

      // Editorial (Cormorant Italic)
      'editorial-xl': ['32px', { lineHeight: '1.25' }],
      'editorial-l':  ['22px', { lineHeight: '1.4' }],   // lede oficial
      'editorial-m':  ['18px', { lineHeight: '1.5' }],

      // Hierarquia oficial brandbook
      h1: ['64px', { lineHeight: '1.05', letterSpacing: '-0.01em' }],
      h2: ['48px', { lineHeight: '1.1' }],
      h3: ['32px', { lineHeight: '1.15' }],

      lede:    ['22px', { lineHeight: '1.4' }],
      'body-lg': ['16px', { lineHeight: '1.7' }],     // body principal Inter Medium
      body:    ['14px', { lineHeight: '1.7' }],
      eyebrow: ['11px', { lineHeight: '1.4', letterSpacing: '0.18em' }],
      button:  ['11px', { lineHeight: '1', letterSpacing: '0.18em' }],
      caption: ['11px', { lineHeight: '1.4' }],
      meta:    ['10px', { lineHeight: '1.4', letterSpacing: '0.16em' }],
    },

    fontWeight: {
      light: '300',     // Inter Light — body
      regular: '400',
      medium: '500',    // eyebrows, botões
      semibold: '600',
    },

    letterSpacing: {
      tighter: '-0.02em',
      tight: '-0.01em',
      normal: '0',
      wide: '0.04em',
      wider: '0.16em',
      widest: '0.18em',  // eyebrow oficial
      cap: '0.24em',     // CAPS muito espaçado (raro)
    },

    lineHeight: {
      none: '1',
      tight: '1.05',
      snug: '1.15',
      normal: '1.4',
      relaxed: '1.5',
      loose: '1.7',  // body principal
    },

    // ========== ESPAÇO ==========
    extend: {
      spacing: {
        // Mínimo 32px de respiro entre seções (princípio brandbook)
        section: '32px',
        'section-lg': '64px',
        'section-xl': '96px',
      },
      maxWidth: {
        prose: '640px',
        content: '1280px',
        wide: '1440px',
      },
      borderRadius: {
        // Amalfi não usa cantos arredondados (visual editorial)
        none: '0',
        DEFAULT: '0',
        sm: '2px',
        full: '9999px',
      },
      borderWidth: {
        DEFAULT: '1px',
        hair: '1px',
        thick: '1.5px',
      },
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '320ms',
      },
    },
  },
  plugins: [],
};
