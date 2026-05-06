/**
 * Orchestrator REAL — chama as Netlify Functions (server-side proxy).
 *
 * Não importa @google/genai no client: a key fica no servidor.
 * Importado lazy a partir do criacaoStore APENAS quando USE_MOCK=false.
 */

import { promptAnalise, promptKeywords, promptTitulos, promptDescricao, promptBriefings, buildImagenPrompt } from './prompts';
import {
  analiseSchema,
  keywordsSchema,
  titulosSchema,
  descricaoSchema,
  briefingsSchema,
} from './schemas';
import type { CriacaoForm, CriacaoResults, BriefingImagem, ImagemGerada } from '../../types/anuncio';

const TEXT_FN = '/.netlify/functions/gemini-text';
const IMAGE_FN = '/.netlify/functions/gemini-image';
const TIMEOUT_MS = 95_000;

interface TextOk { text: string; latencyMs: number }
interface FnError { error: string; latencyMs?: number }
type TextResp = TextOk | FnError;

interface ImageOk { base64: string; modelUsado: string; latencyMs: number }
type ImageResp = ImageOk | FnError;

const isError = <T extends object>(r: T | FnError): r is FnError =>
  typeof (r as FnError).error === 'string';

/** Chama a function de texto com timeout robusto. */
async function callTextFn(prompt: string, useSearch = false): Promise<string> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(TEXT_FN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, useSearch }),
      signal: ctl.signal,
    });
    const data = (await res.json()) as TextResp;
    if (!res.ok || isError(data)) {
      const errMsg = isError(data) ? data.error : `HTTP ${res.status}`;
      throw new Error(`gemini-text falhou: ${errMsg}`);
    }
    return data.text;
  } finally {
    clearTimeout(timer);
  }
}

/** Chama a function de imagem. Retorna base64 ou null em erro (graceful). */
async function callImageFn(
  prompt: string,
  negativePrompt?: string,
): Promise<{ base64: string; modelUsado: string } | null> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS + 30_000);
  try {
    const res = await fetch(IMAGE_FN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, negativePrompt }),
      signal: ctl.signal,
    });
    const data = (await res.json()) as ImageResp;
    if (!res.ok || isError(data)) {
      console.error('[bottega] gemini-image falhou:', isError(data) ? data.error : res.status);
      return null;
    }
    return { base64: data.base64, modelUsado: data.modelUsado };
  } catch (err) {
    console.error('[bottega] gemini-image network error:', err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Extrai JSON de respostas Gemini, tolerante a markdown wrapping. Throws com contexto se falhar. */
function extractJson(text: string, kind: string): unknown {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();
  if (!cleaned) {
    throw new Error(`[${kind}] resposta vazia`);
  }
  try {
    return JSON.parse(cleaned);
  } catch (parseErr) {
    const preview = cleaned.slice(0, 200);
    throw new Error(`[${kind}] JSON inválido — prévia: ${preview}…`, { cause: parseErr });
  }
}

/** Helper genérico: chama texto + extrai JSON + valida com Zod. */
async function geminiJson<T>(
  kind: string,
  prompt: string,
  validator: (raw: unknown) => T,
  useSearch = false,
): Promise<T> {
  const text = await callTextFn(prompt, useSearch);
  const raw = extractJson(text, kind);
  try {
    return validator(raw);
  } catch (zodErr) {
    const msg = zodErr instanceof Error ? zodErr.message : String(zodErr);
    throw new Error(`[${kind}] schema falhou: ${msg}`, { cause: zodErr });
  }
}

// ============================================================
// 1. Análise (com Google Search)
// ============================================================
export async function gerarAnalise(form: CriacaoForm) {
  return geminiJson('analise', promptAnalise(form), (r) => analiseSchema.parse(r), true);
}

// ============================================================
// 2. Keywords (com Google Search)
// ============================================================
export async function gerarKeywords(form: CriacaoForm, contextoAnalise: string) {
  return geminiJson('keywords', promptKeywords(form, contextoAnalise), (r) => keywordsSchema.parse(r), true);
}

// ============================================================
// 3. Títulos
// ============================================================
export async function gerarTitulos(form: CriacaoForm, keywordsContext: string) {
  return geminiJson('titulos', promptTitulos(form, keywordsContext), (r) => titulosSchema.parse(r));
}

// ============================================================
// 4. Descrição
// ============================================================
export async function gerarDescricao(form: CriacaoForm, analiseContext: string) {
  return geminiJson('descricao', promptDescricao(form, analiseContext), (r) => descricaoSchema.parse(r));
}

// ============================================================
// 5. Briefings
// ============================================================
export async function gerarBriefings(form: CriacaoForm, analiseContext: string): Promise<BriefingImagem[]> {
  return geminiJson('briefings', promptBriefings(form, analiseContext), (r) => briefingsSchema.parse(r));
}

// ============================================================
// 6. Imagens (paralelo, graceful per-image)
// ============================================================
export async function gerarImagens(briefings: BriefingImagem[]): Promise<ImagemGerada[]> {
  const tasks = briefings.map(async (b): Promise<ImagemGerada> => {
    const finalPrompt = buildImagenPrompt(b.prompt, b.negativePrompt);
    const result = await callImageFn(finalPrompt, b.negativePrompt);
    if (!result) {
      return {
        briefingNumero: b.numero,
        base64: '',
        largura: 0,
        altura: 0,
        modelUsado: 'imagen-failed',
        falhou: true,
      };
    }
    return {
      briefingNumero: b.numero,
      base64: `data:image/png;base64,${result.base64}`,
      largura: 1024,
      altura: 1024,
      modelUsado: result.modelUsado,
    };
  });

  return Promise.all(tasks);
}

// ============================================================
// ORCHESTRATOR principal
// ============================================================
export async function gerarTudoReal(form: CriacaoForm): Promise<CriacaoResults> {
  const inicio = Date.now();
  console.log('[Bottega] iniciando geração real…');

  const analise = await gerarAnalise(form);
  const analiseContext = JSON.stringify(analise);

  const [keywords, titulos, descricao] = await Promise.all([
    gerarKeywords(form, analiseContext),
    gerarTitulos(form, analiseContext),
    gerarDescricao(form, analiseContext),
  ]);

  const briefings = await gerarBriefings(form, analiseContext);
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

/** Smoke test agora chama Function — sem expor key. */
export async function smokeTestGeminiViaFn(): Promise<{
  ok: boolean;
  latencyMs: number;
  sample: string;
  error?: string;
}> {
  try {
    const res = await fetch('/.netlify/functions/smoke-test');
    return (await res.json()) as { ok: boolean; latencyMs: number; sample: string; error?: string };
  } catch (err) {
    return {
      ok: false,
      latencyMs: 0,
      sample: '',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
