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
  numeroImagens: number;       // mantido por backward-compat (V3 fixa em 7+6)
  estiloImagem: EstiloImagem;
}

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

// === Slot Kinds (V3) — 13 slots fixos ===
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
  | 'aplus-cta';

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
};

/** Mapping centralizado: slot → dimensões (pixels). */
export const SLOT_DIMENSIONS: Record<SlotKind, { w: number; h: number }> = {
  'anuncio-capa': { w: 1024, h: 1024 },
  'anuncio-dimensoes': { w: 1024, h: 1024 },
  'anuncio-lifestyle-callouts': { w: 1024, h: 1024 },
  'anuncio-comparativo': { w: 1024, h: 1024 },
  'anuncio-aspiracional': { w: 1024, h: 1024 },
  'anuncio-beneficios': { w: 1024, h: 1024 },
  'anuncio-prova-final': { w: 1024, h: 1024 },
  'aplus-header': { w: 970, h: 600 },
  'aplus-antes-depois': { w: 970, h: 600 },
  'aplus-specs': { w: 970, h: 600 },
  'aplus-casos-uso': { w: 970, h: 600 },
  'aplus-validacao': { w: 970, h: 600 },
  'aplus-cta': { w: 970, h: 600 },
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
