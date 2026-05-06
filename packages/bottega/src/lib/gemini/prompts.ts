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
// 4. DESCRIÇÃO (plain text Amazon-compatible — sem HTML)
// ============================================================

export function promptDescricao(form: CriacaoForm, analiseContext: string): string {
  return `
${CONTEXTO_PRODUTO(form)}

CONTEXTO DA ANÁLISE: ${analiseContext}

Crie a página de produto completa pro anúncio Amazon BR.

⚠️ AMAZON DEPRECIOU HTML EM DESCRIPTIONS desde julho/2021. Description deve ser
PLAIN TEXT puro (sem <p>, <br>, <ul>, etc). Use \\n\\n entre parágrafos pra
quebra. Bullets também são plain text — Amazon adiciona o "•" automaticamente.

ENTREGUE 4 ARTEFATOS (JSON estrito):
1. description: PLAIN TEXT (1500-2500 chars). Use \\n\\n pra parágrafos. ZERO HTML.
2. amazonBulletPoints: 5 bullets no formato "HEADLINE EM CAPS: descrição com benefício específico." (200-250 chars cada). Plain text.
3. bulletPoints: 5 bullets curtos genéricos (1 linha cada). Plain text.
4. faq: 4-6 perguntas frequentes do consumidor BR + respostas curtas (2-3 linhas).

REGRAS:
- pt-BR fluente, não traduzido.
- Use SOMENTE fatos dos detalhes técnicos. Zero invenção.
- Sem URLs, sem emails, sem telefones.
- Sem palavras proibidas Amazon: "Best seller", "Amazon's Choice", "Top vendido".
- ABSOLUTAMENTE NENHUMA tag HTML em description. Nem <br>. Nem <p>. Nem &nbsp;.

${VOZ_AMALFI}

Retorne JSON estrito:
{
  "description": "Parágrafo um.\\n\\nParágrafo dois.\\n\\nParágrafo três.",
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
// 6. BRIEFINGS A+ CONTENT (6 fixos, 970×600)
// ============================================================

export function promptBriefingsAPlus(form: CriacaoForm, analiseContext: string): string {
  return `
${CONTEXTO_PRODUTO(form)}

CONTEXTO DA ANÁLISE: ${analiseContext}

Você cria briefings de imagem pro CONTEÚDO A+ (Amazon A+ Content / Brand Story)
deste produto. A+ é a página rica que aparece ABAIXO do anúncio principal.

Cada imagem é 970×600 (formato paisagem 4:3 ratio aproximado), com mais espaço
horizontal pra storytelling visual.

ESTRUTURA OBRIGATÓRIA — 6 briefings nesta ordem exata:

1. aplus-header — Banner principal (full width). Produto destacado em ambiente
   Amalfi (Costa Amalfitana inspirada). Overlay text curto (max 8 palavras pt-BR).
   Estabelece a marca + categoria.

2. aplus-beneficio-1 — Foco no benefício PRINCIPAL do produto. Mostra "antes/depois"
   ou "como funciona" visualmente. Overlay com headline curta.

3. aplus-beneficio-2 — Benefício SECUNDÁRIO. Outra angulação de valor.

4. aplus-comparacao — Visual comparativo. NÃO compare com marca de terceiro —
   compare versões/alternativas genéricas (ex: "linho lavado" vs "algodão comum").
   Pode ser dois produtos lado a lado ou diagrama.

5. aplus-lifestyle-amplo — Cena lifestyle ampla, residência brasileira real.
   Produto em uso natural. Mais espaço pra ambientação.

6. aplus-detalhe-tecnico — Macro/zoom em detalhe técnico relevante. Textura,
   acabamento, costura, encaixe — algo que valida qualidade.

REGRAS OBRIGATÓRIAS:
- Não inventar recursos, materiais, medidas, voltagem, compatibilidade.
- Só usar claims que existem nos detalhes técnicos oficiais.
- 1 cena coerente por briefing (sem colagem, grade, mosaico).
- Overlay text em pt-BR, max 8 palavras, factual.
- Format paisagem (referenciar "horizontal landscape orientation" no prompt).

${VOZ_AMALFI}

Retorne JSON ARRAY estrito (exatamente 6 itens):
[
  {
    "numero": 1,
    "estagio": "aplus-header",
    "titulo": "frase pt-BR (4-8 palavras)",
    "prompt": "prompt em INGLÊS pra Gemini Image (3-5 frases descritivas, fotorealista, horizontal landscape, 970x600 ratio)",
    "negativePrompt": "things to avoid (inglês)",
    "overlayText": "max 8 palavras pt-BR ou string vazia",
    "paletaCor": "mar"
  },
  ...
]

Estágios válidos (em ordem): aplus-header, aplus-beneficio-1, aplus-beneficio-2, aplus-comparacao, aplus-lifestyle-amplo, aplus-detalhe-tecnico
`.trim();
}

// ============================================================
// 7. VISUAL SPEC (Gemini Vision lê fotos do produto)
// ============================================================

export function promptVisualSpec(): string {
  return `
Analise as imagens deste produto e descreva visualmente em detalhes técnicos
EXATOS, pra que outra IA possa gerar imagens novas FIÉIS ao produto real.

Capture:
- Cor exata (use nomes técnicos: "branco osso", "off-white #F8F4EE", etc)
- Formato e proporções
- Materiais visíveis (plástico ABS, metal escovado, cerâmica esmaltada, etc)
- Marcas, logos, gravações (transcreva texto se visível)
- Detalhes funcionais visíveis (botões, encaixes, texturas, acabamentos)
- Dimensões aparentes (relativas)
- Características distintivas que distinguem do produto genérico

Responda em INGLÊS, parágrafo único, 200-400 palavras, denso e factual.
NÃO interprete uso, função ou marketing — só descreva o que SE VÊ.

Comece com: "Product description for image generation:"
`.trim();
}

// ============================================================
// 8. PROMPT PARA IMAGE GENERATION (combina briefing + visual spec)
// ============================================================

export function buildImageGenPrompt(
  briefingPrompt: string,
  visualSpec: string | undefined,
  options?: { negative?: string; landscape?: boolean },
): string {
  const fidelityClause = visualSpec
    ? `\n\nIMPORTANT — render the EXACT product described:\n${visualSpec}`
    : '';
  const orientation = options?.landscape
    ? '\n\nOrientation: horizontal landscape, 4:3 aspect ratio.'
    : '\n\nOrientation: square 1:1 aspect ratio.';
  const negative = options?.negative ? `\n\nAvoid: ${options.negative}` : '';
  return `${briefingPrompt}${fidelityClause}${orientation}${negative}`;
}

/** @deprecated — use buildImageGenPrompt. Mantido pra retrocompat dos mocks. */
export function buildImagenPrompt(prompt: string, negative?: string): string {
  return buildImageGenPrompt(prompt, undefined, { negative });
}
