/**
 * Tipos centrais do domínio Bottega.
 * Cada anúncio é uma criação editorial completa.
 */

export type EstiloImagem = 'lifestyle' | 'infografico' | 'misto';
export type StatusAnuncio = 'rascunho' | 'em-revisao' | 'publicado' | 'arquivado';

/** Form de entrada do owner ao criar um anúncio */
export interface CriacaoForm {
  nomeProduto: string;
  fotoBase64?: string;        // foto crua do produto
  detalhesTecnicos: string;
  tituloAtual?: string;
  numeroImagens: number;       // 7-12
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

/** Descrição completa (etapa 4) */
export interface FAQItem { pergunta: string; resposta: string; }
export interface DescricaoResult {
  description: string;          // texto plano
  descriptionHTML: string;      // HTML A+ style
  amazonBulletPoints: string[]; // 5 bullets Amazon
  bulletPoints: string[];       // bullets genéricos
  faq: FAQItem[];
}

/** Briefings de imagem (etapa 5) — 7-12 cenas */
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
  prompt: string;            // prompt completo pra Imagen
  negativePrompt?: string;
  overlayText?: string;       // max 6 palavras
  dataPoints: string[];       // dados técnicos usados (sem inventar)
  paletaCor?: string;         // chave visual do briefing (mar/areia/terracota/etc)
}

export interface ImagemGerada {
  briefingNumero: number;
  base64: string;             // mock = data URI placeholder; "" se falhou
  largura: number;
  altura: number;
  modelUsado?: string;
  falhou?: boolean;           // true se Imagen retornou erro / vazio
}

/** Resultado completo da geração */
export interface CriacaoResults {
  analise: AnaliseDeMercado;
  keywords: KeywordsResult;
  titulos: TitulosResult;
  descricao: DescricaoResult;
  briefings: BriefingImagem[];
  imagens?: ImagemGerada[];     // opcional (Imagen é caro/custoso)
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
