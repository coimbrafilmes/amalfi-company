/**
 * Tipos centrais do domínio Bottega.
 * Cada anúncio é uma criação editorial completa.
 */

export type EstiloImagem = 'lifestyle' | 'infografico' | 'misto';
export type StatusAnuncio = 'rascunho' | 'em-revisao' | 'publicado' | 'arquivado';

/** Form de entrada do owner ao criar um anúncio */
export interface CriacaoForm {
  nomeProduto: string;
  /** Até 3 fotos de referência do produto. base64 (data URI ou cru). */
  fotosBase64?: string[];
  detalhesTecnicos: string;
  tituloAtual?: string;

  // V4: quantidades configuráveis por categoria (padrão Gumpinho)
  /** Quantidade de imagens de Anúncio (2000×2000). Range 6-10. */
  numeroAnuncio: number;
  /** Quantidade de imagens de Conteúdo A+ (970×600). Range 3-6. */
  numeroAplus: number;
  /** Estilo visual das imagens de Anúncio. */
  estiloAnuncio: EstiloImagem;
  /** Estilo visual das imagens de A+. */
  estiloAplus: EstiloImagem;

  // === Backward-compat V3 ===
  // Mantidos pra compatibilidade com anúncios antigos no localStorage. Quando
  // V3 setava numeroImagens=N e estiloImagem=X, V4 deriva numeroAnuncio/Aplus
  // e estiloAnuncio/Aplus de maneira sensata.
  /** @deprecated V4 usa numeroAnuncio + numeroAplus. Mantido pra migration. */
  numeroImagens?: number;
  /** @deprecated V4 usa estiloAnuncio + estiloAplus. Mantido pra migration. */
  estiloImagem?: EstiloImagem;
}

/** Defaults V4 do formulário (Gumpinho-style). */
export const FORM_DEFAULTS = {
  numeroAnuncio: 7,
  numeroAplus: 5,
  estiloAnuncio: 'misto' as EstiloImagem,
  estiloAplus: 'misto' as EstiloImagem,
  numeroAnuncioMin: 6,
  numeroAnuncioMax: 10,
  numeroAplusMin: 3,
  numeroAplusMax: 6,
} as const;

/** Análise de mercado (etapa 1) */
export interface AnaliseDeMercado {
  persona: {
    label: string;
    descricao: string;
    perfilDemografico: string;
  };
  dores: { titulo: string; descricao: string }[];
  motivacoes: string[];
  janelaDeDecisao: string;
  publicoSecundario?: string | null;
}

/** Keywords agrupadas (etapa 2) */
export interface KeywordGroup {
  categoria: string;
  termos: string[];
}

export interface KeywordsResult {
  total: number;
  grupos: KeywordGroup[];
  flat: string[];
  destaque: string[];
}

/** Títulos (etapa 3) — 5 produto + 5 dor */
export interface Titulo {
  texto: string;
  caracteres: number;
  foco: 'produto' | 'dor';
}

export interface TitulosResult {
  produto: Titulo[];
  dor: Titulo[];
}

/**
 * Descrição (etapa 4).
 * Amazon depreciou HTML em descriptions desde julho/2021 — só plain text.
 */
export interface FAQItem { pergunta: string; resposta: string; }
export interface DescricaoResult {
  description: string;          // plain text Amazon-compatible (\n\n entre parágrafos)
  amazonBulletPoints: string[]; // 5 bullets Amazon (plain)
  bulletPoints: string[];       // bullets curtos genéricos
  faq: FAQItem[];
}

// === Slot Kinds (V3.1) — 15 slots fixos ===
// V3.1 adicionou aplus-premium (1464×600 hero amplificado) e aplus-comparison
// (220×220 thumbnail pra Amazon Comparison Charts).
export type SlotKind =
  | 'anuncio-capa'
  | 'anuncio-dimensoes'
  | 'anuncio-lifestyle-callouts'
  | 'anuncio-comparativo'
  | 'anuncio-aspiracional'
  | 'anuncio-beneficios'
  | 'anuncio-prova-final'
  | 'aplus-header'
  | 'aplus-antes-depois'
  | 'aplus-specs'
  | 'aplus-casos-uso'
  | 'aplus-validacao'
  | 'aplus-cta'
  | 'aplus-premium'
  | 'aplus-comparison';

export type VarianteImagem = 'anuncio' | 'aplus';

/** Mapping centralizado: slot → variante. */
export const SLOT_VARIANT: Record<SlotKind, VarianteImagem> = {
  'anuncio-capa': 'anuncio',
  'anuncio-dimensoes': 'anuncio',
  'anuncio-lifestyle-callouts': 'anuncio',
  'anuncio-comparativo': 'anuncio',
  'anuncio-aspiracional': 'anuncio',
  'anuncio-beneficios': 'anuncio',
  'anuncio-prova-final': 'anuncio',
  'aplus-header': 'aplus',
  'aplus-antes-depois': 'aplus',
  'aplus-specs': 'aplus',
  'aplus-casos-uso': 'aplus',
  'aplus-validacao': 'aplus',
  'aplus-cta': 'aplus',
  'aplus-premium': 'aplus',
  'aplus-comparison': 'aplus',
};

/** Mapping centralizado: slot → dimensões (pixels). */
export const SLOT_DIMENSIONS: Record<SlotKind, { w: number; h: number }> = {
  'anuncio-capa': { w: 2000, h: 2000 },
  'anuncio-dimensoes': { w: 2000, h: 2000 },
  'anuncio-lifestyle-callouts': { w: 2000, h: 2000 },
  'anuncio-comparativo': { w: 2000, h: 2000 },
  'anuncio-aspiracional': { w: 2000, h: 2000 },
  'anuncio-beneficios': { w: 2000, h: 2000 },
  'anuncio-prova-final': { w: 2000, h: 2000 },
  'aplus-header': { w: 970, h: 600 },
  'aplus-antes-depois': { w: 970, h: 600 },
  'aplus-specs': { w: 970, h: 600 },
  'aplus-casos-uso': { w: 970, h: 600 },
  'aplus-validacao': { w: 970, h: 600 },
  'aplus-cta': { w: 970, h: 600 },
  'aplus-premium': { w: 1464, h: 600 },
  'aplus-comparison': { w: 220, h: 220 },
};

/**
 * Mapping centralizado: slot → aspect ratio do Gemini Image.
 * Gemini suporta apenas '1:1', '4:3', '3:4', '16:9', '9:16'. Sharp depois faz crop center
 * pra dim alvo do slot. Pra aplus-premium (2.44:1) usamos '16:9' (1.78:1) — mais próximo
 * do alvo, com crop horizontal mínimo.
 */
export const SLOT_ASPECT_RATIO: Record<SlotKind, '1:1' | '4:3' | '16:9'> = {
  'anuncio-capa': '1:1',
  'anuncio-dimensoes': '1:1',
  'anuncio-lifestyle-callouts': '1:1',
  'anuncio-comparativo': '1:1',
  'anuncio-aspiracional': '1:1',
  'anuncio-beneficios': '1:1',
  'anuncio-prova-final': '1:1',
  'aplus-header': '4:3',
  'aplus-antes-depois': '4:3',
  'aplus-specs': '4:3',
  'aplus-casos-uso': '4:3',
  'aplus-validacao': '4:3',
  'aplus-cta': '4:3',
  'aplus-premium': '16:9',
  'aplus-comparison': '1:1',
};

/** Ordem canônica dos slots (sequência de conversão). */
export const SLOT_ORDER: SlotKind[] = [
  'anuncio-capa',
  'anuncio-dimensoes',
  'anuncio-lifestyle-callouts',
  'anuncio-comparativo',
  'anuncio-aspiracional',
  'anuncio-beneficios',
  'anuncio-prova-final',
  'aplus-header',
  'aplus-antes-depois',
  'aplus-specs',
  'aplus-casos-uso',
  'aplus-validacao',
  'aplus-cta',
  'aplus-premium',
  'aplus-comparison',
];

/** Labels human-friendly pra UI (sub-abas, tooltips). */
export const SLOT_LABEL: Record<SlotKind, string> = {
  'anuncio-capa': 'Capa',
  'anuncio-dimensoes': 'Dimensões',
  'anuncio-lifestyle-callouts': 'Lifestyle + Callouts',
  'anuncio-comparativo': 'Comparativo',
  'anuncio-aspiracional': 'Aspiracional',
  'anuncio-beneficios': 'Benefícios práticos',
  'anuncio-prova-final': 'Prova final',
  'aplus-header': 'A+ Hero',
  'aplus-antes-depois': 'Antes/Depois',
  'aplus-specs': 'Specs visuais',
  'aplus-casos-uso': 'Casos de uso',
  'aplus-validacao': 'Validação',
  'aplus-cta': 'CTA final',
  'aplus-premium': 'A+ Premium (1464×600)',
  'aplus-comparison': 'A+ Comparison (220×220)',
};

/**
 * Cada slot tem um "estágio" semântico. Mantém compat com tile rendering.
 * V3 usa SlotKind; V1/V2 antigos usam EstagioConversao/EstagioAPlus literal.
 */
export type EstagioConversao =
  | 'capa'
  | 'gancho'
  | 'dor'
  | 'mecanismo'
  | 'prova'
  | 'objecao'
  | 'decisao'
  | 'lifestyle'
  | 'detalhe';

export type EstagioAPlus =
  | 'aplus-header'
  | 'aplus-beneficio-1'
  | 'aplus-beneficio-2'
  | 'aplus-comparacao'
  | 'aplus-lifestyle-amplo'
  | 'aplus-detalhe-tecnico';

export interface BriefingImagem {
  numero: number;
  isCover: boolean;
  estagio: EstagioConversao | string;
  titulo: string;
  prompt: string;
  negativePrompt?: string;
  overlayText?: string;
  dataPoints: string[];
  paletaCor?: string;
}

export interface BriefingAPlus {
  numero: number;
  estagio: EstagioAPlus | string;
  titulo: string;
  prompt: string;
  negativePrompt?: string;
  overlayText?: string;
  paletaCor?: string;
}

/** Imagem gerada — com slotKind explícito (V3). */
export interface ImagemGerada {
  /** V3+: identifica unicamente entre os 13 slots. */
  slotKind?: SlotKind;
  /** Backward-compat V1/V2: numero do briefing. */
  briefingNumero: number;
  variante: VarianteImagem;
  base64: string;
  largura: number;
  altura: number;
  modelUsado?: string;
  falhou?: boolean;
  /** ISO timestamp se foi regenerada (limite 1×). */
  regeneradaEm?: string;
}

/** Resultado completo da geração */
export interface CriacaoResults {
  analise: AnaliseDeMercado;
  keywords: KeywordsResult;
  titulos: TitulosResult;
  descricao: DescricaoResult;
  /** V3.1+: 7 destaques punchy (paridade Gumpinho — carousel Amazon, social). */
  destaques?: string[];
  briefings: BriefingImagem[];
  briefingsAPlus: BriefingAPlus[];
  imagens?: ImagemGerada[];
  visualSpec?: string;
  geradoEm: string;
  modoGeracao: 'mock' | 'real';
  /** V3+: versão do schema do resultado. */
  schemaVersion?: number;
}

/** Anúncio persistido no catálogo */
export interface Anuncio {
  id: string;
  slug: string;
  asin?: string;
  status: StatusAnuncio;
  versao: number;
  form: CriacaoForm;
  results: CriacaoResults;
  criadoEm: string;
  atualizadoEm: string;
  capa?: {
    paleta: 'mar' | 'areia' | 'ceu' | 'terracota' | 'osso' | 'ocre';
    legenda?: string;
  };
}
