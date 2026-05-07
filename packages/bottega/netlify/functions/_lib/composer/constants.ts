/**
 * Tokens visuais Amalfi pra composition layer.
 * Espelha src/styles/tokens.css mas em TS pro server.
 */

export const COLOR = {
  tinta: '#1F2A3A',
  tinta65: 'rgba(31, 42, 58, 0.65)',
  tinta40: 'rgba(31, 42, 58, 0.40)',
  osso: '#F8F4EE',
  osso15: 'rgba(248, 244, 238, 0.15)',
  areia: '#E8DFD2',
  mar: '#2D5D7B',
  terracota: '#C47855',
  ceu: '#A8C0CF',
  ocre: '#D4A876',
  ocreSoft: 'rgba(212, 168, 118, 0.12)',
  validacao: '#2D7A4E',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const FONT_PATH = {
  // @fontsource fornece .woff (text-to-svg + opentype.js aceita)
  // Usamos latin-ext pra cobrir acentos pt-BR (ã, ç, é, etc)
  serif400: 'node_modules/@fontsource/dm-serif-display/files/dm-serif-display-latin-ext-400-normal.woff',
  italic400: 'node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-ext-400-italic.woff',
  italic500: 'node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-ext-500-italic.woff',
  sans400: 'node_modules/@fontsource/inter/files/inter-latin-ext-400-normal.woff',
  sans500: 'node_modules/@fontsource/inter/files/inter-latin-ext-500-normal.woff',
  sans600: 'node_modules/@fontsource/inter/files/inter-latin-ext-600-normal.woff',
} as const;

export type FontKey = keyof typeof FONT_PATH;

/** Sizes em pixels (1pt ≈ 1.333px na convenção web) */
export const SIZE = {
  heroHeadline: 72,    // hero serif (slot 5 aspiracional, A+ header)
  sectionHeadline: 56, // slot 4, A+ CTA
  cardHeadline: 44,    // slot 3, 6
  smallHeadline: 32,
  italicSubLarge: 36,
  italicSubMedium: 26,
  italicSubSmall: 18,
  bodyLarge: 22,
  body: 18,
  bullet: 17,
  caption: 14,
  eyebrow: 11,
  cota: 26,
  badgeLabel: 14,
} as const;
