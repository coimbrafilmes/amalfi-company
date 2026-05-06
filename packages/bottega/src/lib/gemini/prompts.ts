/**
 * Prompts editoriais Bottega.
 * Combinam: conhecimento técnico Amazon BR + tom Amalfi (sem PROMOÇÃO IMPERDÍVEL).
 *
 * Sintetizados a partir do bundle GUMPINHO + brandbook Amalfi & Co. (página 14).
 */

import type { CriacaoForm } from '../../types/anuncio';

const VOZ_AMALFI = `
Tom de voz da Amalfi & Co.: SERENO, CURADO, CALOROSO, HONESTO.
Frases curtas, ritmo respirado. Nunca CAPS LOCK por urgência.
Cada palavra ganha o lugar. Adjetivos com parcimônia.
Tratamos por "você". Falamos da casa como casa, não como ambiente.
Não exageramos. Se um pano é de algodão, é algodão — não "premium soft touch".
EVITE: "PROMOÇÃO IMPERDÍVEL", "ÚLTIMAS UNIDADES", "premium soft touch luxury",
"Você merece o melhor", "Adquira já", "Frete grátis para todo o Brasil!!! 🔥🔥".
PREFIRA: "Linho lavado para os meses quentes", "Volta a entrar em estoque na próxima semana".
`.trim();

const CONTEXTO_PRODUTO = (form: CriacaoForm) => `
DADOS DO PRODUTO:
- Nome: ${form.nomeProduto}
- Detalhes técnicos REAIS (não invente nada além disso): ${form.detalhesTecnicos}
${form.tituloAtual ? `- Título atual usado pelo seller (não repetir palavras dele): ${form.tituloAtual}` : ''}
- Estilo de imagem desejado: ${form.estiloImagem}
- Quantidade de imagens: ${form.numeroImagens}
`.trim();

// ============================================================
// 1. ANÁLISE DE MERCADO (com Google Search grounding)
// ============================================================

export function promptAnalise(form: CriacaoForm): string {
  return `
${CONTEXTO_PRODUTO(form)}

Você é um analista sênior de comportamento do consumidor brasileiro de marketplace, focado em Amazon BR.

Faça uma análise de mercado SUCINTA e ACIONÁVEL pra orientar a criação de um anúncio Amazon BR pra este produto.

Considere o consumidor brasileiro real: como ele busca, decide, compara. Use seu conhecimento real de comportamento.

${VOZ_AMALFI}

Retorne JSON estritamente neste schema:
{
  "persona": {
    "label": "frase curta-conceito de 3-6 palavras (DM Serif feel)",
    "descricao": "1-2 frases sobre comportamento de compra, sem clichê",
    "perfilDemografico": "1 linha gênero/idade/classe/contexto"
  },
  "dores": [
    { "titulo": "frase curta editorial", "descricao": "2-3 frases honestas, sem dramatizar" }
  ],
  "motivacoes": ["motivação 1", "motivação 2", "motivação 3", "motivação 4"],
  "janelaDeDecisao": "ex: '24 a 72 horas após primeira busca'",
  "publicoSecundario": "público adicional (1 frase) ou null"
}

REGRAS:
- 2 a 4 dores. Sem repetir. Sem inventar dores que não existem.
- 3 a 5 motivações.
- Tudo em pt-BR fluente. Zero anglicismo desnecessário.
- Zero superlativos vazios.
`.trim();
}

// ============================================================
// 2. KEYWORDS (50 termos, agrupados, com Google Search)
// ============================================================

export function promptKeywords(form: CriacaoForm, contextoAnalise: string): string {
  return `
${CONTEXTO_PRODUTO(form)}

CONTEXTO DA ANÁLISE: ${contextoAnalise}

Você é um especialista em SEO de marketplace brasileiro. Use Google Search pra validar volume de busca real.

Gere 50 palavras-chave que o consumidor brasileiro REALMENTE digita ao buscar este produto na Amazon BR.

REGRAS:
1. Use Google Search pra priorizar termos com volume real no Brasil.
2. Escreva como o cliente realmente pesquisa (com erros, com sinônimos, com regionalismos).
3. NÃO repetir palavras do título atual: ${form.tituloAtual ?? '(nenhum)'}.
4. Distribua entre 5 grupos semânticos.
5. Tudo lowercase, sem pontuação, sem marcas de terceiros.

Retorne JSON estrito neste schema:
{
  "total": 50,
  "destaque": ["6-8 keywords priorizadas pra campanha principal"],
  "flat": ["lista única de 50 termos pra copy/paste"],
  "grupos": [
    { "categoria": "Termos técnicos", "termos": ["10 termos"] },
    { "categoria": "Linguagem do consumidor", "termos": ["10 termos"] },
    { "categoria": "Ambientes", "termos": ["10 termos"] },
    { "categoria": "Ocasião de compra", "termos": ["10 termos"] },
    { "categoria": "Diferenciais", "termos": ["10 termos"] }
  ]
}
`.trim();
}

// ============================================================
// 3. TÍTULOS (5 produto + 5 dor)
// ============================================================

export function promptTitulos(form: CriacaoForm, keywordsContext: string, charLimit: number = 200): string {
  return `
${CONTEXTO_PRODUTO(form)}

CONTEXTO DE KEYWORDS: ${keywordsContext}

Crie 10 títulos pra anúncio Amazon BR deste produto.

REGRAS RÍGIDAS:
- 5 títulos focados no PRODUTO (técnico, descritivo).
- 5 títulos focados na DOR do consumidor (transformação, benefício).
- Cada título: máximo ${charLimit} caracteres (recomendado 90-120).
- Comece com o nome ou função do produto.
- Use as palavras-chave principais.
- NÃO repetir palavras do mesmo título.
- NÃO inventar marca, selo ou certificação.
- Sem CAPS LOCK. Sem "PROMOÇÃO". Sem emojis.

${VOZ_AMALFI}

Retorne JSON estrito:
{
  "produto": [
    { "texto": "...", "caracteres": 119, "foco": "produto" }
  ],
  "dor": [
    { "texto": "...", "caracteres": 105, "foco": "dor" }
  ]
}
`.trim();
}

// ============================================================
// 4. DESCRIÇÃO + BULLETS + FAQ + HTML A+
// ============================================================

export function promptDescricao(form: CriacaoForm, analiseContext: string): string {
  return `
${CONTEXTO_PRODUTO(form)}

CONTEXTO DA ANÁLISE: ${analiseContext}

Crie a página de produto completa pro anúncio Amazon BR.

ENTREGUE 5 ARTEFATOS:
1. description: texto corrido (1.500-2.000 chars) — descrição editorial, divisível em parágrafos curtos.
2. descriptionHTML: mesmo conteúdo em HTML A+ style (h2, p, ul, table) — pra A+ Content premium.
3. amazonBulletPoints: 5 bullets no formato "HEADLINE EM CAPS: descrição com benefício específico." (200-250 chars cada).
4. bulletPoints: 5 bullets curtos genéricos (1 linha cada).
5. faq: 4-6 perguntas frequentes do consumidor BR + respostas curtas (2-3 linhas).

REGRAS:
- pt-BR fluente, não traduzido.
- Use SOMENTE fatos dos detalhes técnicos. Zero invenção.
- Sem URLs, sem emails, sem telefones.
- Sem palavras proibidas Amazon: "Best seller", "Amazon's Choice", "Top vendido".

${VOZ_AMALFI}

Retorne JSON estrito:
{
  "description": "...",
  "descriptionHTML": "<h2>...</h2><p>...</p>",
  "amazonBulletPoints": ["...", "...", "...", "...", "..."],
  "bulletPoints": ["...", "...", "...", "...", "..."],
  "faq": [
    { "pergunta": "...", "resposta": "..." }
  ]
}
`.trim();
}

// ============================================================
// 5. BRIEFINGS DE IMAGEM (com narrativa de conversão)
// ============================================================

export function promptBriefings(form: CriacaoForm, analiseContext: string): string {
  const numImg = form.numeroImagens;
  const callouts =
    form.estiloImagem === 'infografico'
      ? 'INFO CALLOUTS: use 4 to 6 short callouts with clean spacing.'
      : 'INFO CALLOUTS: optional and minimal.';
  const layoutGuard =
    form.estiloImagem === 'infografico'
      ? 'LAYOUT GUARD: keep one coherent scene with one hero product and integrated callouts only. Never create tiled panels, contact sheets or many mini-photos.'
      : 'LAYOUT GUARD: keep one coherent scene only. Never create collage, grid, split-screen or multiple small photos.';

  return `
${CONTEXTO_PRODUTO(form)}

CONTEXTO DA ANÁLISE: ${analiseContext}

ESTILO VISUAL: ${form.estiloImagem}
QUANTIDADE: ${numImg} imagens.

OBJETIVO DE CONVERSÃO:
Construir narrativa visual progressiva: GANCHO → DOR → MECANISMO → PROVA → OBJEÇÕES → DECISÃO.
Mostrar dor real do usuário comum. Mostrar alívio quando usa o produto.
Priorizar contexto residencial brasileiro.

REGRAS OBRIGATÓRIAS:
1. Não inventar recursos, materiais, medidas, voltagem, compatibilidade.
2. Só usar claims que existem nos detalhes técnicos oficiais.
3. A primeira imagem (isCover=true) DEVE ser produto isolado em fundo branco puro, ocupando 80% da área útil.
4. Distribuir os ${numImg} briefings entre os estágios de conversão.
5. No máximo 1 briefing de comparação (e sem usar marca de terceiro).
6. Overlay text curto (max 6 palavras), pt-BR, factual.
7. Não usar inglês no overlay.
8. Cenas: 1 pessoa máximo, 2 mãos visíveis no máximo.
9. Cada briefing = UMA cena única. Sem colagem, grade, mosaico, split-screen.
10. dataPoints DEVE listar dados técnicos REAIS usados (sem inventar).

${callouts}
${layoutGuard}

PALETA SUGERIDA pra cada briefing (paletaCor): "areia", "mar", "ceu", "terracota", "ocre", "osso-outline".

${VOZ_AMALFI}

Retorne JSON estrito (array com ${numImg} itens):
[
  {
    "numero": 1,
    "isCover": true,
    "estagio": "capa",
    "titulo": "frase curta pt-BR (4-8 palavras)",
    "prompt": "prompt em INGLÊS pra Imagen 4 (3-5 frases descritivas, fotorealista)",
    "negativePrompt": "things to avoid (inglês)",
    "overlayText": "max 6 palavras pt-BR ou string vazia",
    "dataPoints": ["dado técnico real 1", "dado técnico real 2"],
    "paletaCor": "osso-outline"
  }
]

Estágios válidos: capa | gancho | dor | mecanismo | prova | objecao | decisao | lifestyle | detalhe
`.trim();
}

// ============================================================
// 6. PROMPT PARA IMAGEN (single image)
// ============================================================

export function buildImagenPrompt(prompt: string, negative?: string): string {
  // Imagen 4 aceita prompt simples; negative vai concatenado em estilo "no X, no Y..."
  if (negative) {
    return `${prompt}\n\nAvoid: ${negative}`;
  }
  return prompt;
}
