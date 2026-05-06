/**
 * Orchestrator REAL — encadeia as 5 chamadas Gemini sequencialmente
 * + chamada Imagen pra renderizar imagens.
 *
 * Importado lazy a partir do criacaoStore APENAS quando USE_MOCK=false.
 */

import { getGeminiClient, TEXT_MODEL, IMAGE_MODEL } from './client';
import { promptAnalise, promptKeywords, promptTitulos, promptDescricao, promptBriefings, buildImagenPrompt } from './prompts';
import { analiseSchema, keywordsSchema, titulosSchema, descricaoSchema, briefingsSchema } from './schemas';
import type { CriacaoForm, CriacaoResults, BriefingImagem, ImagemGerada } from '../../types/anuncio';

/** Helper pra extrair JSON de respostas Gemini. Tolerante a markdown wrapping. */
function extractJson(text: string): unknown {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();
  return JSON.parse(cleaned);
}

async function geminiJson<T>(prompt: string, validator: (raw: unknown) => T, useSearch = false): Promise<T> {
  const client = getGeminiClient();
  const config: Record<string, unknown> = {
    responseMimeType: 'application/json',
  };
  if (useSearch) {
    config.tools = [{ googleSearch: {} }];
  }
  const result = await client.models.generateContent({
    model: TEXT_MODEL,
    contents: prompt,
    config,
  });
  const raw = extractJson(result.text ?? '{}');
  return validator(raw);
}

// ============================================================
// 1. Análise de mercado (com Google Search)
// ============================================================
export async function gerarAnalise(form: CriacaoForm) {
  return geminiJson(promptAnalise(form), (r) => analiseSchema.parse(r), true);
}

// ============================================================
// 2. Keywords (com Google Search)
// ============================================================
export async function gerarKeywords(form: CriacaoForm, contextoAnalise: string) {
  return geminiJson(promptKeywords(form, contextoAnalise), (r) => keywordsSchema.parse(r), true);
}

// ============================================================
// 3. Títulos
// ============================================================
export async function gerarTitulos(form: CriacaoForm, keywordsContext: string) {
  return geminiJson(promptTitulos(form, keywordsContext), (r) => titulosSchema.parse(r));
}

// ============================================================
// 4. Descrição completa
// ============================================================
export async function gerarDescricao(form: CriacaoForm, analiseContext: string) {
  return geminiJson(promptDescricao(form, analiseContext), (r) => descricaoSchema.parse(r));
}

// ============================================================
// 5. Briefings de imagem
// ============================================================
export async function gerarBriefings(form: CriacaoForm, analiseContext: string): Promise<BriefingImagem[]> {
  return geminiJson(promptBriefings(form, analiseContext), (r) => briefingsSchema.parse(r));
}

// ============================================================
// 6. Imagens (Imagen 4) — paralelo
// ============================================================
export async function gerarImagens(briefings: BriefingImagem[]): Promise<ImagemGerada[]> {
  const client = getGeminiClient();

  const tasks = briefings.map(async (b): Promise<ImagemGerada> => {
    try {
      const result = await client.models.generateImages({
        model: IMAGE_MODEL,
        prompt: buildImagenPrompt(b.prompt, b.negativePrompt),
        config: {
          numberOfImages: 1,
          aspectRatio: '1:1',
        },
      });
      const first = result.generatedImages?.[0];
      const base64 = first?.image?.imageBytes ?? '';
      return {
        briefingNumero: b.numero,
        base64: base64 ? `data:image/png;base64,${base64}` : '',
        largura: 1024,
        altura: 1024,
        modelUsado: IMAGE_MODEL,
      };
    } catch (err) {
      console.error(`[Bottega] Falha ao gerar imagem #${b.numero}:`, err);
      return {
        briefingNumero: b.numero,
        base64: '',
        largura: 0,
        altura: 0,
        modelUsado: `${IMAGE_MODEL}-failed`,
      };
    }
  });

  return Promise.all(tasks);
}

// ============================================================
// ORCHESTRATOR principal — encadeia tudo
// ============================================================
export async function gerarTudoReal(form: CriacaoForm): Promise<CriacaoResults> {
  const inicio = Date.now();
  console.log('[Bottega] iniciando geração real…');

  // 1. análise (com search)
  const analise = await gerarAnalise(form);
  const analiseContext = JSON.stringify(analise);

  // 2. keywords (paralelo com 3 e 4 — todas dependem só da análise)
  // ATENÇÃO: keywords usa Google Search; títulos e descrição não.
  const [keywords, titulos, descricao] = await Promise.all([
    gerarKeywords(form, analiseContext),
    gerarTitulos(form, analiseContext),
    gerarDescricao(form, analiseContext),
  ]);

  // 5. briefings (depende da análise)
  const briefings = await gerarBriefings(form, analiseContext);

  // 6. imagens (paralelo, opcional — pode ser caro)
  const imagens = await gerarImagens(briefings);

  console.log(`[Bottega] geração real concluída em ${Date.now() - inicio}ms.`);

  return {
    analise,
    keywords,
    titulos,
    descricao,
    briefings,
    imagens,
    geradoEm: new Date().toISOString(),
    modoGeracao: 'real',
  };
}
