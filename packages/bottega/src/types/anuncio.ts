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
  numeroImagens: number;       // 7-12 (apenas pra aba Anúncio; A+ é fixo 6)
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
  flat: string[];                  // pra "copiar todas"
  destaque: string[];              // top 5-10 priorizadas
}

/** Títulos (etapa 3) — 5 produto + 5 dor */
export interface Titulo {
  texto: string;
  caracteres: number;
  foco: 'produto' | 'dor';
}

export interface TitulosResult {
  produto: Titulo[];     // 5
  dor: Titulo[];          // 5
}

/**
 * Descrição (etapa 4).
 * Amazon depreciou HTML em descriptions desde julho/2021 — só plain text +
 * `<br>` é tolerado. `description` agora é plain text com `\n\n` como
 * separador de parágrafos. Bullets continuam plain text.
 */
export interface FAQItem { pergunta: string; resposta: string; }
export interface DescricaoResult {
  description: string;          // plain text Amazon-compatible (parágrafos com \n\n)
  amazonBulletPoints: string[]; // 5 bullets Amazon (plain)
  bulletPoints: string[];       // bullets curtos genéricos
  faq: FAQItem[];
}

/** Briefings de imagem do anúncio principal (7-12 cenas, 1024×1024) */
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

export interface BriefingImagem {
  numero: number;
  isCover: boolean;
  estagio: EstagioConversao;
  titulo: string;            // 4-6 palavras pt-BR
  prompt: string;            // prompt completo pra Gemini Image
  negativePrompt?: string;
  overlayText?: string;       // max 6 palavras
  dataPoints: string[];       // dados técnicos usados (sem inventar)
  paletaCor?: string;         // chave visual do briefing (mar/areia/terracota/etc)
}

/** Briefings de imagem do A+ Content (6 fixos, 970×600) */
export type EstagioAPlus =
  | 'aplus-header'
  | 'aplus-beneficio-1'
  | 'aplus-beneficio-2'
  | 'aplus-comparacao'
  | 'aplus-lifestyle-amplo'
  | 'aplus-detalhe-tecnico';

export interface BriefingAPlus {
  numero: number;             // 1-6
  estagio: EstagioAPlus;
  titulo: string;             // 4-6 palavras pt-BR
  prompt: string;
  negativePrompt?: string;
  overlayText?: string;
  paletaCor?: string;
}

/** Imagem gerada — pode ser do anúncio (1024×1024) ou A+ (970×600) */
export type VarianteImagem = 'anuncio' | 'aplus';

export interface ImagemGerada {
  briefingNumero: number;
  variante: VarianteImagem;
  base64: string;             // data URI base64; "" se falhou
  largura: number;
  altura: number;
  modelUsado?: string;
  falhou?: boolean;
  /** ISO timestamp se foi regenerada (limite 1×); ausente = ainda não regenerada. */
  regeneradaEm?: string;
}

/** Resultado completo da geração */
export interface CriacaoResults {
  analise: AnaliseDeMercado;
  keywords: KeywordsResult;
  titulos: TitulosResult;
  descricao: DescricaoResult;
  briefings: BriefingImagem[];        // anúncio (7-12)
  briefingsAPlus: BriefingAPlus[];    // A+ (6 fixos)
  imagens?: ImagemGerada[];           // todas (anúncio + A+), filtra por variante
  /** Descrição visual extraída por Gemini Vision a partir das fotos de referência */
  visualSpec?: string;
  geradoEm: string;             // ISO timestamp
  modoGeracao: 'mock' | 'real';
}

/** Anúncio persistido no catálogo */
export interface Anuncio {
  id: string;
  slug: string;
  asin?: string;                // preenchido depois do owner cadastrar no Seller Central
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
