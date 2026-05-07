/**
 * Schema de params por slot — input pra composeForSlot.
 * Cada slot tem seu shape específico extraído do form/analise.
 */

import type { SlotKind } from '../../../../src/types/anuncio';

export type IconKey =
  | 'drop'
  | 'sparkle'
  | 'clock'
  | 'check'
  | 'crown'
  | 'diamond'
  | 'gem'
  | 'leaf'
  | 'soap'
  | 'brush'
  | 'tube'
  | 'palette'
  | 'ruler'
  | 'scale'
  | 'recycle'
  | 'shield'
  | 'star'
  | 'circle-check'
  | 'arrow-right'
  | 'home'
  | 'spray-can'
  | 'feather'
  | 'tag'
  | 'cup-soda'
  | 'glass-water'
  | 'package'
  | 'circle-dot';

export interface SlotParamsCapa {
  // Sem overlay (passa-through)
  empty?: never;
}

export interface SlotParamsDimensoes {
  /** Cotas do produto. Cada uma com axis + valor formatado. */
  cotas: Array<{
    axis: 'largura' | 'altura' | 'profundidade';
    value: string; // ex: "16 cm", "240 ml"
  }>;
  /** Label rodapé. Ex: "Dispenser de Sabonete · 240ml" */
  footerLabel: string;
}

export interface SlotParamsLifestyleCallouts {
  headline: string; // Serif, max 6 palavras
  callouts: Array<{ icon: IconKey; label: string }>; // exatamente 3
}

export interface SlotParamsComparativo {
  eyebrow: string; // sub-headline cap small
  headline: string; // serif grande
  bullets: string[]; // 3 bullets curtos
  comparisonLabel: string; // "Falta de Qualidade" no canto inferior direito
}

export interface SlotParamsAspiracional {
  headline: string; // 5-7 palavras transformacionais
  subBullets: string[]; // 3 sub-bullets curtos
}

export interface SlotParamsBeneficios {
  headline: string; // padrão "[Verbo] e [Verbo]"
  bullets: string[]; // 3 bullets práticos
}

export interface SlotParamsProvaFinal {
  tags: Array<{ icon: IconKey; label: string }>; // 2 tags discretas
}

export interface SlotParamsAplusHeader {
  headline: string; // serif grande
  sub: string; // italic complementar
  badges: Array<{ icon: IconKey; label: string }>; // 2 tags
}

export interface SlotParamsAplusAntesDepois {
  features: string[]; // 4 features (lado direito "depois") com checkmarks
}

export interface SlotParamsAplusSpecs {
  altura: string; // ex: "16cm Altura"
  callouts: Array<{ icon: IconKey; titulo: string; spec: string }>; // 4
}

export interface SlotParamsAplusCasosUso {
  usos: Array<{ icon: IconKey; label: string }>; // exato 4
}

export interface SlotParamsAplusValidacao {
  callouts: string[]; // 3 mini-callouts
}

export interface SlotParamsAplusCta {
  headline: string;
  subCta: string; // texto, sem botão
  miniFeatures: string[]; // 3 tags pequenas
}

export interface SlotParamsByKind {
  'anuncio-capa': SlotParamsCapa;
  'anuncio-dimensoes': SlotParamsDimensoes;
  'anuncio-lifestyle-callouts': SlotParamsLifestyleCallouts;
  'anuncio-comparativo': SlotParamsComparativo;
  'anuncio-aspiracional': SlotParamsAspiracional;
  'anuncio-beneficios': SlotParamsBeneficios;
  'anuncio-prova-final': SlotParamsProvaFinal;
  'aplus-header': SlotParamsAplusHeader;
  'aplus-antes-depois': SlotParamsAplusAntesDepois;
  'aplus-specs': SlotParamsAplusSpecs;
  'aplus-casos-uso': SlotParamsAplusCasosUso;
  'aplus-validacao': SlotParamsAplusValidacao;
  'aplus-cta': SlotParamsAplusCta;
}

export type SlotParams<K extends SlotKind> = SlotParamsByKind[K];
