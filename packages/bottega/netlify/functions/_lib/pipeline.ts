/**
 * Gemini orchestration pipeline V3 — server-side com composition layer.
 *
 * Fluxo:
 *   1. analise (Gemini text)
 *   2. visualSpec (Gemini Vision com fotos refs) — paralelo com 1
 *   3. keywords + titulos + descricao (paralelo)
 *   4. 13 slots Gemini Image (paralelo) — cada um com prompt fixo do slot
 *   5. 13 composições Sharp + SVG (paralelo)
 *   6. retorna CriacaoResults com 13 imagens compostas
 */

import { GoogleGenAI, Modality } from '@google/genai';
import {
  promptAnalise,
  promptKeywords,
  promptTitulos,
  promptDescricao,
  promptDestaques,
  promptVisualSpec,
} from '../../../src/lib/gemini/prompts';
import {
  analiseSchema,
  keywordsSchema,
  titulosSchema,
  descricaoSchema,
  destaquesSchema,
} from '../../../src/lib/gemini/schemas';
import {
  SLOT_ORDER,
  SLOT_VARIANT,
  SLOT_DIMENSIONS,
  SLOT_ASPECT_RATIO,
  type CriacaoForm,
  type CriacaoResults,
  type ImagemGerada,
  type SlotKind,
} from '../../../src/types/anuncio';
import { cropToSize } from './cropImage';
import { promptForSlot } from './slot-prompts';
import { extractSlotParams } from './slot-params';
import { composeForSlot } from './composer';

const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL ?? 'gemini-2.5-flash';
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL ?? 'gemini-2.5-flash-image';

const MAX_ATTEMPTS = 5;
const BACKOFF_MS = [2_000, 5_000, 10_000, 20_000];

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
      if (!isTransient(err) || attempt === MAX_ATTEMPTS - 1) throw err;
    }
  }
  throw lastErr;
}

function extractJson(text: string, kind: string): unknown {
  let cleaned = text.trim();
  if (!cleaned) throw new Error(`[${kind}] resposta vazia do Gemini`);

  const startObj = cleaned.indexOf('{');
  const startArr = cleaned.indexOf('[');
  let start: number;
  if (startObj === -1) start = startArr;
  else if (startArr === -1) start = startObj;
  else start = Math.min(startObj, startArr);
  if (start > 0) cleaned = cleaned.slice(start);

  const lastObj = cleaned.lastIndexOf('}');
  const lastArr = cleaned.lastIndexOf(']');
  const end = Math.max(lastObj, lastArr);
  if (end >= 0 && end < cleaned.length - 1) cleaned = cleaned.slice(0, end + 1);
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    let inString = false;
    let escaped = false;
    let out = '';
    for (let i = 0; i < cleaned.length; i++) {
      const c = cleaned[i];
      const code = cleaned.charCodeAt(i);
      if (escaped) { out += c; escaped = false; continue; }
      if (c === '\\') { out += c; escaped = true; continue; }
      if (c === '"') { out += c; inString = !inString; continue; }
      if (inString && code < 0x20) {
        if (c === '\n') out += '\\n';
        else if (c === '\r') out += '\\r';
        else if (c === '\t') out += '\\t';
        else out += '\\u' + code.toString(16).padStart(4, '0');
        continue;
      }
      out += c;
    }
    cleaned = out;
  }
  try {
    return JSON.parse(cleaned);
  } catch (parseErr) {
    throw new Error(`[${kind}] JSON inválido — prévia: ${cleaned.slice(0, 200)}…`, { cause: parseErr });
  }
}

function stripDataUri(b64: string): { data: string; mimeType: string } {
  const m = b64.match(/^data:([^;]+);base64,(.+)$/);
  if (m) return { mimeType: m[1], data: m[2] };
  return { mimeType: 'image/jpeg', data: b64 };
}

interface PipelineOpts {
  onStep: (step: string, progress?: { current: number; total: number }) => Promise<void>;
}

/**
 * Provider toggle (Bloco L): permite alternar entre Gemini e OpenAI sem deploy.
 * Setar IMAGE_PROVIDER=openai no Netlify ativa pipelineOpenAI.ts (gpt-image-1).
 * Default 'gemini' — comportamento atual.
 */
const IMAGE_PROVIDER = (process.env.IMAGE_PROVIDER ?? 'gemini').toLowerCase();

export async function runAnuncioPipeline(form: CriacaoForm, opts: PipelineOpts): Promise<CriacaoResults> {
  if (IMAGE_PROVIDER === 'openai') {
    // Lazy import — evita carregar OpenAI SDK em deploys que só usam Gemini
    const { runAnuncioPipelineOpenAI } = await import('./pipelineOpenAI');
    return runAnuncioPipelineOpenAI(form, opts);
  }
  return runAnuncioPipelineGemini(form, opts);
}

async function runAnuncioPipelineGemini(form: CriacaoForm, opts: PipelineOpts): Promise<CriacaoResults> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY não configurada no servidor');

  const client = new GoogleGenAI({ apiKey });
  const inicio = Date.now();
  const fotos = (form.fotosBase64 ?? []).slice(0, 3);

  // ---------- helper: Gemini text com retry + JSON ----------
  async function geminiText<T>(
    prompt: string,
    validator: (raw: unknown) => T,
    kind: string,
  ): Promise<T> {
    return withRetry(async () => {
      const result = await client.models.generateContent({
        model: TEXT_MODEL,
        contents: prompt,
        config: { responseMimeType: 'application/json' },
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

  // ---------- 1. Análise + Visual Spec (paralelo) ----------
  await opts.onStep('Lendo o mercado…');
  const visionContents = fotos.length > 0 ? [
    { text: promptVisualSpec() },
    ...fotos.map((b64) => {
      const { data, mimeType } = stripDataUri(b64);
      return { inlineData: { mimeType, data } };
    }),
  ] : null;

  const [analise, visualSpec] = await Promise.all([
    geminiText(promptAnalise(form), (r) => analiseSchema.parse(r), 'analise'),
    visionContents
      ? withRetry(async () => {
          const result = await client.models.generateContent({
            model: TEXT_MODEL,
            contents: visionContents as never,
          });
          return (result.text ?? '').trim();
        }, 'visual-spec')
      : Promise.resolve(undefined),
  ]);
  if (visualSpec) {
    console.log('[pipeline] visualSpec extraído:', visualSpec.slice(0, 100), '…');
  }

  const analiseContext = JSON.stringify(analise);

  // ---------- 2. Keywords + Títulos + Descrição + Destaques (paralelo) ----------
  await opts.onStep('Curando palavras e títulos…');
  const [keywords, titulos, descricao, destaquesResult] = await Promise.all([
    geminiText(promptKeywords(form, analiseContext), (r) => keywordsSchema.parse(r), 'keywords'),
    geminiText(promptTitulos(form, analiseContext), (r) => titulosSchema.parse(r), 'titulos'),
    geminiText(promptDescricao(form, analiseContext), (r) => descricaoSchema.parse(r), 'descricao'),
    geminiText(promptDestaques(form, analiseContext), (r) => destaquesSchema.parse(r), 'destaques'),
  ]);
  const destaques = destaquesResult.destaques;

  // ---------- 3. Imagens dos 13 slots (paralelo Gemini + composer) ----------
  const totalImages = SLOT_ORDER.length;
  let completed = 0;
  await opts.onStep('Renderizando imagens…', { current: 0, total: totalImages });

  async function generateImageForSlot(slot: SlotKind): Promise<{ slot: SlotKind; base64: string | null }> {
    const promptText = promptForSlot(slot, form, visualSpec);
    const aspectRatio = SLOT_ASPECT_RATIO[slot];

    try {
      const base64 = await withRetry(async () => {
        const contents: Array<unknown> = [
          { text: promptText },
          ...fotos.map((b64) => {
            const { data, mimeType } = stripDataUri(b64);
            return { inlineData: { mimeType, data } };
          }),
        ];
        const result = await client.models.generateContent({
          model: IMAGE_MODEL,
          contents: contents as never,
          config: {
            responseModalities: [Modality.IMAGE],
            imageConfig: { aspectRatio },
          },
        });
        const parts = result.candidates?.[0]?.content?.parts ?? [];
        for (const part of parts) {
          if (part.inlineData?.data) return part.inlineData.data;
        }
        throw new Error(`[gemini-image-${slot}] sem imagem na resposta`);
      }, `image-${slot}`);
      return { slot, base64 };
    } catch (err) {
      console.error(`[pipeline] image gen falhou pra ${slot}:`, err);
      return { slot, base64: null };
    }
  }

  const imagens: ImagemGerada[] = await Promise.all(
    SLOT_ORDER.map(async (slot): Promise<ImagemGerada> => {
      const { base64 } = await generateImageForSlot(slot);
      const variante = SLOT_VARIANT[slot];
      const dim = SLOT_DIMENSIONS[slot];

      // Sem base → falhou, retorna placeholder
      if (!base64) {
        completed += 1;
        await opts.onStep('Renderizando imagens…', { current: completed, total: totalImages });
        return {
          slotKind: slot,
          briefingNumero: SLOT_ORDER.indexOf(slot) + 1,
          variante,
          base64: '',
          largura: dim.w,
          altura: dim.h,
          modelUsado: `${IMAGE_MODEL}-failed`,
          falhou: true,
        };
      }

      // Sempre normaliza pra dim alvo:
      //   - A+ (4:3 nativo Gemini): crop centro pra 970×600
      //   - Anúncio (1:1 nativo ~1024×1024 Gemini): upscale Sharp pra 2000×2000
      let baseBuffer: Buffer;
      try {
        const resized = await cropToSize(base64, dim.w, dim.h);
        baseBuffer = Buffer.from(resized.base64, 'base64');
      } catch (err) {
        console.error(`[pipeline] resize falhou pra ${slot}:`, err);
        baseBuffer = Buffer.from(base64, 'base64');
      }

      // Composer aplica overlay
      let finalBuffer: Buffer = baseBuffer;
      try {
        const params = extractSlotParams(slot, form, analise, descricao);
        finalBuffer = await composeForSlot(slot, baseBuffer, params);
      } catch (err) {
        console.error(`[pipeline] composer falhou pra ${slot}:`, err);
        // Fallback graceful: usa imagem base sem overlay
      }

      completed += 1;
      await opts.onStep('Renderizando imagens…', { current: completed, total: totalImages });

      return {
        slotKind: slot,
        briefingNumero: SLOT_ORDER.indexOf(slot) + 1,
        variante,
        base64: `data:image/png;base64,${finalBuffer.toString('base64')}`,
        largura: dim.w,
        altura: dim.h,
        modelUsado: IMAGE_MODEL,
      };
    }),
  );

  // Briefings sintéticos pra UI continuar funcionando (legacy compatibility)
  const briefings = SLOT_ORDER
    .filter((s) => SLOT_VARIANT[s] === 'anuncio')
    .map((slot, idx) => ({
      numero: idx + 1,
      isCover: slot === 'anuncio-capa',
      estagio: slot,
      titulo: slot.replace('anuncio-', '').replace(/-/g, ' '),
      prompt: '(handled by pipeline)',
      dataPoints: [],
    }));

  const briefingsAPlus = SLOT_ORDER
    .filter((s) => SLOT_VARIANT[s] === 'aplus')
    .map((slot, idx) => ({
      numero: idx + 1,
      estagio: slot,
      titulo: slot.replace('aplus-', '').replace(/-/g, ' '),
      prompt: '(handled by pipeline)',
    }));

  console.log(`[pipeline] V3 anúncio concluído em ${Date.now() - inicio}ms`);

  return {
    analise,
    keywords,
    titulos,
    descricao,
    destaques,
    briefings,
    briefingsAPlus,
    imagens,
    visualSpec,
    geradoEm: new Date().toISOString(),
    modoGeracao: 'real',
    schemaVersion: 3,
  };
}

/**
 * Regenera UMA imagem específica pelo slotKind.
 * Usado pelo regen-image function. Rotea pelo IMAGE_PROVIDER.
 */
export async function regenerateOneImage(
  slot: SlotKind,
  form: CriacaoForm,
  analise: import('../../../src/types/anuncio').AnaliseDeMercado,
  descricao: import('../../../src/types/anuncio').DescricaoResult,
  visualSpec?: string,
): Promise<{ base64: string; largura: number; altura: number; modelUsado: string }> {
  if (IMAGE_PROVIDER === 'openai') {
    const { regenerateOneImageOpenAI } = await import('./pipelineOpenAI');
    return regenerateOneImageOpenAI(slot, form, analise, descricao, visualSpec);
  }
  return regenerateOneImageGemini(slot, form, analise, descricao, visualSpec);
}

async function regenerateOneImageGemini(
  slot: SlotKind,
  form: CriacaoForm,
  analise: import('../../../src/types/anuncio').AnaliseDeMercado,
  descricao: import('../../../src/types/anuncio').DescricaoResult,
  visualSpec?: string,
): Promise<{ base64: string; largura: number; altura: number; modelUsado: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY não configurada no servidor');

  const client = new GoogleGenAI({ apiKey });
  const fotos = (form.fotosBase64 ?? []).slice(0, 3);
  const dim = SLOT_DIMENSIONS[slot];
  const aspectRatio = SLOT_ASPECT_RATIO[slot];
  const promptText = promptForSlot(slot, form, visualSpec);

  const base64 = await withRetry(async () => {
    const contents: Array<unknown> = [
      { text: promptText },
      ...fotos.map((b64) => {
        const { data, mimeType } = stripDataUri(b64);
        return { inlineData: { mimeType, data } };
      }),
    ];
    const result = await client.models.generateContent({
      model: IMAGE_MODEL,
      contents: contents as never,
      config: {
        responseModalities: [Modality.IMAGE],
        imageConfig: { aspectRatio },
      },
    });
    const parts = result.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData?.data) return part.inlineData.data;
    }
    throw new Error('sem imagem na resposta');
  }, `regen-${slot}`);

  // Sempre normaliza pra dim alvo (anúncio: upscale 1024→2000; A+: crop 4:3 → 970×600)
  let baseBuffer: Buffer;
  try {
    const resized = await cropToSize(base64, dim.w, dim.h);
    baseBuffer = Buffer.from(resized.base64, 'base64');
  } catch (err) {
    console.error(`[regen] resize falhou pra ${slot}:`, err);
    baseBuffer = Buffer.from(base64, 'base64');
  }

  let finalBuffer: Buffer = baseBuffer;
  try {
    const params = extractSlotParams(slot, form, analise, descricao);
    finalBuffer = await composeForSlot(slot, baseBuffer, params);
  } catch (err) {
    console.error(`[regen] composer falhou pra ${slot}:`, err);
  }

  return {
    base64: `data:image/png;base64,${finalBuffer.toString('base64')}`,
    largura: dim.w,
    altura: dim.h,
    modelUsado: IMAGE_MODEL,
  };
}
