/**
 * Gemini orchestration pipeline — server-side.
 *
 * Importado pela background function gemini-anuncio-background.
 * Executa toda a sequência de geração de um anúncio:
 *   análise → [keywords | títulos | descrição] → briefings → imagens.
 *
 * Atualiza o blob do job a cada etapa via callback `onStep`.
 */

import { GoogleGenAI } from '@google/genai';
import {
  promptAnalise,
  promptKeywords,
  promptTitulos,
  promptDescricao,
  promptBriefings,
  buildImagenPrompt,
} from '../../../src/lib/gemini/prompts';
import {
  analiseSchema,
  keywordsSchema,
  titulosSchema,
  descricaoSchema,
  briefingsSchema,
} from '../../../src/lib/gemini/schemas';
import type {
  CriacaoForm,
  CriacaoResults,
  BriefingImagem,
  ImagemGerada,
} from '../../../src/types/anuncio';

const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL ?? 'gemini-2.5-flash';
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL ?? 'imagen-4.0-generate-001';

// Retry config — Gemini retorna 503 quando sobrecarregado. Fast retries no servidor.
const MAX_ATTEMPTS = 3;
const BACKOFF_MS = [1_500, 4_000];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isTransient(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return (
    msg.includes('503') ||
    msg.includes('unavailable') ||
    msg.includes('429') ||
    msg.includes('resource_exhausted') ||
    msg.includes('rate limit') ||
    msg.includes('500') ||
    msg.includes('internal') ||
    msg.includes('timeout') ||
    msg.includes('fetch failed') ||
    msg.includes('econnreset') ||
    msg.includes('network')
  );
}

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      if (attempt > 0) {
        const delay = (BACKOFF_MS[attempt - 1] ?? 8_000) + Math.floor(Math.random() * 500);
        console.log(`[pipeline] ${label} retry ${attempt}/${MAX_ATTEMPTS - 1} em ${delay}ms`);
        await wait(delay);
      }
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isTransient(err) || attempt === MAX_ATTEMPTS - 1) {
        throw err;
      }
    }
  }
  throw lastErr;
}

function extractJson(text: string, kind: string): unknown {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();
  if (!cleaned) throw new Error(`[${kind}] resposta vazia do Gemini`);
  try {
    return JSON.parse(cleaned);
  } catch (parseErr) {
    const preview = cleaned.slice(0, 200);
    throw new Error(`[${kind}] JSON inválido — prévia: ${preview}…`, { cause: parseErr });
  }
}

interface PipelineOpts {
  onStep: (step: string, progress?: { current: number; total: number }) => Promise<void>;
}

export async function runAnuncioPipeline(form: CriacaoForm, opts: PipelineOpts): Promise<CriacaoResults> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY não configurada no servidor');

  const client = new GoogleGenAI({ apiKey });
  const inicio = Date.now();

  async function geminiText<T>(
    prompt: string,
    validator: (raw: unknown) => T,
    kind: string,
    useSearch = false,
  ): Promise<T> {
    return withRetry(async () => {
      const config: Record<string, unknown> = {};
      if (useSearch) {
        config.tools = [{ googleSearch: {} }];
      } else {
        config.responseMimeType = 'application/json';
      }
      const result = await client.models.generateContent({
        model: TEXT_MODEL,
        contents: prompt,
        config,
      });
      const text = result.text ?? '';
      const raw = extractJson(text, kind);
      try {
        return validator(raw);
      } catch (zodErr) {
        const msg = zodErr instanceof Error ? zodErr.message : String(zodErr);
        throw new Error(`[${kind}] schema falhou: ${msg}`, { cause: zodErr });
      }
    }, kind);
  }

  // === 1. Análise (com Search) ===
  await opts.onStep('Lendo o mercado…');
  const analise = await geminiText(promptAnalise(form), (r) => analiseSchema.parse(r), 'analise', true);
  const analiseContext = JSON.stringify(analise);

  // === 2. Keywords + Títulos + Descrição (paralelo) ===
  await opts.onStep('Curando palavras e títulos…');
  const [keywords, titulos, descricao] = await Promise.all([
    geminiText(promptKeywords(form, analiseContext), (r) => keywordsSchema.parse(r), 'keywords', true),
    geminiText(promptTitulos(form, analiseContext), (r) => titulosSchema.parse(r), 'titulos'),
    geminiText(promptDescricao(form, analiseContext), (r) => descricaoSchema.parse(r), 'descricao'),
  ]);

  // === 3. Briefings de imagem ===
  await opts.onStep('Compondo briefings de imagem…');
  const briefings: BriefingImagem[] = await geminiText(
    promptBriefings(form, analiseContext),
    (r) => briefingsSchema.parse(r),
    'briefings',
  );

  // === 4. Imagens (paralelo, isolado) ===
  await opts.onStep('Renderizando imagens…', { current: 0, total: briefings.length });

  let completed = 0;
  const imagens: ImagemGerada[] = await Promise.all(
    briefings.map(async (b): Promise<ImagemGerada> => {
      try {
        const result = await withRetry(
          () =>
            client.models.generateImages({
              model: IMAGE_MODEL,
              prompt: buildImagenPrompt(b.prompt, b.negativePrompt),
              config: { numberOfImages: 1, aspectRatio: '1:1' },
            }),
          `imagen-${b.numero}`,
        );
        const first = result.generatedImages?.[0];
        const base64 = first?.image?.imageBytes ?? '';
        completed += 1;
        await opts.onStep('Renderizando imagens…', { current: completed, total: briefings.length });
        if (!base64) {
          return {
            briefingNumero: b.numero,
            base64: '',
            largura: 0,
            altura: 0,
            modelUsado: `${IMAGE_MODEL}-empty`,
            falhou: true,
          };
        }
        return {
          briefingNumero: b.numero,
          base64: `data:image/png;base64,${base64}`,
          largura: 1024,
          altura: 1024,
          modelUsado: IMAGE_MODEL,
        };
      } catch (err) {
        completed += 1;
        await opts.onStep('Renderizando imagens…', { current: completed, total: briefings.length });
        console.error(`[pipeline] imagen #${b.numero} falhou:`, err);
        return {
          briefingNumero: b.numero,
          base64: '',
          largura: 0,
          altura: 0,
          modelUsado: 'imagen-failed',
          falhou: true,
        };
      }
    }),
  );

  console.log(`[pipeline] anúncio concluído em ${Date.now() - inicio}ms`);

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
