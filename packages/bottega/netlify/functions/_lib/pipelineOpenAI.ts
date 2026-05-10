/**
 * Pipeline alternativo usando OpenAI gpt-image-1 (Bloco L).
 *
 * Por que existe:
 *   Gemini 2.5 Flash Image falha em texto-embedded e infográfico-com-layout.
 *   gpt-image-1 (modelo do ChatGPT) gera infográficos com texto perfeito —
 *   é o modelo que faz aqueles anúncios Amazon BR estilo Gumpinho.
 *
 * Diferença pro pipelineGemini:
 *   - Imagens são geradas pela OpenAI (não Gemini)
 *   - Prompts pedem TUDO no prompt (texto + layout + composição), não só foto
 *   - Composer SVG vira opcional (gpt-image-1 já gera tudo)
 *   - Custo: ~$0.042/imagem (medium) × 15 = ~$0.63/anúncio
 *
 * Usa toggle via env IMAGE_PROVIDER=openai (default ainda é 'gemini').
 *
 * Fluxo:
 *   1. analise + visualSpec   (Gemini Text — barato, funciona)
 *   2. keywords + titulos + descricao + destaques (Gemini Text)
 *   3. 15 slots Gemini Image → AGORA via gpt-image-1
 *      - Quando tem fotos refs → images.edit (multi-image input, fidelidade)
 *      - Quando não tem refs → images.generate (cena pura)
 *   4. Sharp resize pra dim alvo (gpt-image-1 retorna 1024×1024 ou 1536×1024)
 *   5. Composer SVG opcional (controle via APPLY_COMPOSER env)
 *      - true (default): aplica overlays SVG por cima do output OpenAI
 *      - false: deixa output puro do gpt-image-1 (texto JÁ embedded no pixel)
 *      Quando os prompts pedem texto no próprio modelo, usar false evita
 *      sobreposição/duplicação visual entre layout-OpenAI e overlay-SVG.
 *   6. Retorna CriacaoResults com 15 imagens compostas
 */

import OpenAI, { toFile } from 'openai';
import { GoogleGenAI } from '@google/genai';
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
  SLOT_VARIANT,
  SLOT_DIMENSIONS,
  type CriacaoForm,
  type CriacaoResults,
  type ImagemGerada,
  type SlotKind,
} from '../../../src/types/anuncio';
import { cropToSize } from './cropImage';
import { promptForSlotOpenAI } from './slot-prompts-openai';
import { extractSlotParams } from './slot-params';
import { composeForSlot } from './composer';
import { selectSlots, estiloForSlot, type SlotSelection } from './slot-pools';

const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL ?? 'gemini-2.5-flash';
const IMAGE_MODEL = 'gpt-image-1';
const IMAGE_QUALITY = (process.env.OPENAI_IMAGE_QUALITY ?? 'medium') as 'low' | 'medium' | 'high';
/** Concorrência limitada — Tier 1 OpenAI tem ~5 RPS; usar 4 dá folga */
const IMAGE_CONCURRENCY = parseInt(process.env.OPENAI_IMAGE_CONCURRENCY ?? '4', 10);
/** Composer SVG vira opcional quando gpt-image-1 já gera tudo. Default true (segurança). */
const APPLY_COMPOSER = process.env.APPLY_COMPOSER !== 'false';

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
        console.log(`[pipelineOpenAI] ${label} retry ${attempt}/${MAX_ATTEMPTS - 1} em ${delay}ms`);
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

/**
 * Mapeia slot → tamanho a pedir pra OpenAI.
 * gpt-image-1 suporta apenas: '1024x1024', '1024x1536', '1536x1024', 'auto'.
 * Sharp depois faz resize/crop pra dim alvo final.
 */
function openaiSizeForSlot(slot: SlotKind): '1024x1024' | '1024x1536' | '1536x1024' {
  const variante = SLOT_VARIANT[slot];
  if (variante === 'anuncio') return '1024x1024'; // anúncio é 1:1, Sharp upscale 2× pra 2000
  if (slot === 'aplus-comparison') return '1024x1024'; // 220×220, Sharp resize down
  // Demais aplus são landscape (970×600 standard, 1464×600 premium) — pedir 1536×1024
  return '1536x1024';
}

interface PipelineOpts {
  onStep: (step: string, progress?: { current: number; total: number }) => Promise<void>;
}

export async function runAnuncioPipelineOpenAI(form: CriacaoForm, opts: PipelineOpts): Promise<CriacaoResults> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) throw new Error('OPENAI_API_KEY não configurada no servidor — necessária pro IMAGE_PROVIDER=openai');

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) throw new Error('GEMINI_API_KEY não configurada no servidor — pipeline ainda usa Gemini Text');

  const openai = new OpenAI({ apiKey: openaiKey });
  const gemini = new GoogleGenAI({ apiKey: geminiKey });
  const inicio = Date.now();
  const fotos = (form.fotosBase64 ?? []).slice(0, 3);

  // ---------- helper: Gemini text (continua barato pra texto) ----------
  async function geminiText<T>(
    prompt: string,
    validator: (raw: unknown) => T,
    kind: string,
  ): Promise<T> {
    return withRetry(async () => {
      const result = await gemini.models.generateContent({
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

  // ---------- 1. Análise + Visual Spec (paralelo, Gemini Text) ----------
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
          const result = await gemini.models.generateContent({
            model: TEXT_MODEL,
            contents: visionContents as never,
          });
          return (result.text ?? '').trim();
        }, 'visual-spec')
      : Promise.resolve(undefined),
  ]);
  if (visualSpec) {
    console.log('[pipelineOpenAI] visualSpec extraído:', visualSpec.slice(0, 100), '…');
  }

  const analiseContext = JSON.stringify(analise);

  // ---------- 2. Keywords + Títulos + Descrição + Destaques (Gemini Text) ----------
  await opts.onStep('Curando palavras e títulos…');
  const [keywords, titulos, descricao, destaquesResult] = await Promise.all([
    geminiText(promptKeywords(form, analiseContext), (r) => keywordsSchema.parse(r), 'keywords'),
    geminiText(promptTitulos(form, analiseContext), (r) => titulosSchema.parse(r), 'titulos'),
    geminiText(promptDescricao(form, analiseContext), (r) => descricaoSchema.parse(r), 'descricao'),
    geminiText(promptDestaques(form, analiseContext), (r) => destaquesSchema.parse(r), 'destaques'),
  ]);
  const destaques = destaquesResult.destaques;

  // ---------- 3. Imagens dos slots via OpenAI gpt-image-1 ----------
  // V4: seleção dinâmica de slots baseada em form (numeroAnuncio, numeroAplus,
  // estiloAnuncio, estiloAplus). Slots viram lista runtime ao invés de SLOT_ORDER fixo.
  const selection: SlotSelection = selectSlots(form);
  const slotsToRender = selection.slots;
  const totalImages = slotsToRender.length;
  let completed = 0;
  console.log(
    `[pipelineOpenAI] V4 slot selection: ${selection.anuncioSlots.length} anúncio (${selection.estiloAnuncio}) ` +
    `+ ${selection.aplusSlots.length} A+ (${selection.estiloAplus}) = ${totalImages} total`,
  );
  await opts.onStep(`Renderizando imagens (gpt-image-1 · ${IMAGE_QUALITY})…`, { current: 0, total: totalImages });

  /**
   * Gera 1 imagem via OpenAI gpt-image-1.
   * Quando tem fotos do produto → usa images.edit (multi-image input pra fidelidade).
   * Quando não tem refs → usa images.generate (cena pura).
   */
  async function generateImageForSlot(slot: SlotKind, slotIndex: number): Promise<string | null> {
    const params = extractSlotParams(slot, form, analise, descricao);
    const estilo = estiloForSlot(slot, selection);
    const promptText = promptForSlotOpenAI(slot, form, params, estilo, visualSpec);
    const size = openaiSizeForSlot(slot);
    void slotIndex; // mantido pra debugging (variante futura entre slots repetidos)

    try {
      return await withRetry(async () => {
        if (fotos.length > 0) {
          // images.edit com fotos como referência (fidelidade ao produto real)
          const imageFiles = await Promise.all(
            fotos.map(async (b64, i) => {
              const { data, mimeType } = stripDataUri(b64);
              const buffer = Buffer.from(data, 'base64');
              const ext = mimeType.includes('png') ? 'png' : 'jpg';
              return toFile(buffer, `ref-${i}.${ext}`, { type: mimeType });
            }),
          );
          const result = await openai.images.edit({
            model: IMAGE_MODEL,
            image: imageFiles,
            prompt: promptText,
            size,
            quality: IMAGE_QUALITY,
            n: 1,
          });
          const b64 = result.data?.[0]?.b64_json;
          if (!b64) throw new Error(`[image-edit-${slot}] sem b64_json na resposta`);
          return b64;
        }
        // Sem refs: generate puro
        const result = await openai.images.generate({
          model: IMAGE_MODEL,
          prompt: promptText,
          size,
          quality: IMAGE_QUALITY,
          n: 1,
        });
        const b64 = result.data?.[0]?.b64_json;
        if (!b64) throw new Error(`[image-gen-${slot}] sem b64_json na resposta`);
        return b64;
      }, `image-${slot}`);
    } catch (err) {
      console.error(`[pipelineOpenAI] image gen falhou pra ${slot}:`, err);
      return null;
    }
  }

  /** Pool com concorrência limitada (rate limit OpenAI Tier 1 = ~5 RPS) */
  async function runWithPool<T, R>(items: T[], poolSize: number, worker: (item: T) => Promise<R>): Promise<R[]> {
    const results: R[] = new Array(items.length);
    let cursor = 0;
    async function next(): Promise<void> {
      const idx = cursor;
      cursor += 1;
      if (idx >= items.length) return;
      results[idx] = await worker(items[idx]);
      return next();
    }
    const workers = Array.from({ length: Math.min(poolSize, items.length) }, () => next());
    await Promise.all(workers);
    return results;
  }

  // V4: lista de slots vem de selectSlots(form), não SLOT_ORDER fixo.
  // Cada item carrega (slot, indexNoArray) pra suportar slots repetidos
  // quando numeroAnuncio > 7 ou numeroAplus > 8.
  const slotsWithIdx = slotsToRender.map((slot, idx) => ({ slot, idx }));

  const imagens: ImagemGerada[] = await runWithPool(slotsWithIdx, IMAGE_CONCURRENCY, async ({ slot, idx }): Promise<ImagemGerada> => {
    const base64 = await generateImageForSlot(slot, idx);
    const variante = SLOT_VARIANT[slot];
    const dim = SLOT_DIMENSIONS[slot];
    const briefingNumero = idx + 1;

    if (!base64) {
      completed += 1;
      await opts.onStep(`Renderizando imagens (gpt-image-1)…`, { current: completed, total: totalImages });
      return {
        slotKind: slot,
        briefingNumero,
        variante,
        base64: '',
        largura: dim.w,
        altura: dim.h,
        modelUsado: `${IMAGE_MODEL}-failed`,
        falhou: true,
      };
    }

    // Sharp resize pra dim alvo (gpt-image-1 retorna 1024×1024 ou 1536×1024)
    let baseBuffer: Buffer;
    try {
      const resized = await cropToSize(base64, dim.w, dim.h);
      baseBuffer = Buffer.from(resized.base64, 'base64');
    } catch (err) {
      console.error(`[pipelineOpenAI] resize falhou pra ${slot}:`, err);
      baseBuffer = Buffer.from(base64, 'base64');
    }

    // V4 (Filosofia C): composer SVG é responsável por TODO texto. gpt-image-1
    // entrega cena pura sem texto. APPLY_COMPOSER=true é o padrão correto pra V4.
    // Quando false (debug), deixa imagem crua do modelo (sem branding/headlines).
    let finalBuffer: Buffer = baseBuffer;
    if (APPLY_COMPOSER) {
      try {
        const params = extractSlotParams(slot, form, analise, descricao);
        finalBuffer = await composeForSlot(slot, baseBuffer, params);
      } catch (err) {
        console.error(`[pipelineOpenAI] composer falhou pra ${slot}:`, err);
      }
    }

    completed += 1;
    await opts.onStep(`Renderizando imagens (gpt-image-1)…`, { current: completed, total: totalImages });

    return {
      slotKind: slot,
      briefingNumero,
      variante,
      base64: `data:image/png;base64,${finalBuffer.toString('base64')}`,
      largura: dim.w,
      altura: dim.h,
      modelUsado: APPLY_COMPOSER ? `${IMAGE_MODEL}+composer` : IMAGE_MODEL,
    };
  });

  // Briefings sintéticos pra UI continuar funcionando — agora baseados na
  // selection dinâmica do V4, não no SLOT_ORDER fixo.
  const briefings = selection.anuncioSlots.map((slot, idx) => ({
    numero: idx + 1,
    isCover: slot === 'anuncio-capa',
    estagio: slot,
    titulo: slot.replace('anuncio-', '').replace(/-/g, ' '),
    prompt: '(handled by pipelineOpenAI)',
    dataPoints: [],
  }));

  const briefingsAPlus = selection.aplusSlots.map((slot, idx) => ({
    numero: idx + 1,
    estagio: slot,
    titulo: slot.replace('aplus-', '').replace(/-/g, ' '),
    prompt: '(handled by pipelineOpenAI)',
  }));

  console.log(`[pipelineOpenAI] V4 concluído em ${Date.now() - inicio}ms · provider=openai · quality=${IMAGE_QUALITY}`);

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
    schemaVersion: 4,
  };
}

/**
 * Regenera UMA imagem específica via OpenAI gpt-image-1.
 * Usado pelo regen-image quando IMAGE_PROVIDER=openai.
 */
export async function regenerateOneImageOpenAI(
  slot: SlotKind,
  form: CriacaoForm,
  analise: import('../../../src/types/anuncio').AnaliseDeMercado,
  descricao: import('../../../src/types/anuncio').DescricaoResult,
  visualSpec?: string,
): Promise<{ base64: string; largura: number; altura: number; modelUsado: string }> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) throw new Error('OPENAI_API_KEY não configurada');
  const openai = new OpenAI({ apiKey: openaiKey });

  const fotos = (form.fotosBase64 ?? []).slice(0, 3);
  const dim = SLOT_DIMENSIONS[slot];
  const size = openaiSizeForSlot(slot);
  const params = extractSlotParams(slot, form, analise, descricao);
  // Pra regenerate, usa estilo do form (anuncio ou aplus dependendo do slot)
  const variante = SLOT_VARIANT[slot];
  const estilo = variante === 'anuncio'
    ? (form.estiloAnuncio ?? form.estiloImagem ?? 'misto')
    : (form.estiloAplus ?? form.estiloImagem ?? 'misto');
  const promptText = promptForSlotOpenAI(slot, form, params, estilo, visualSpec);

  const base64 = await withRetry(async () => {
    if (fotos.length > 0) {
      const imageFiles = await Promise.all(
        fotos.map(async (b64, i) => {
          const { data, mimeType } = stripDataUri(b64);
          const buffer = Buffer.from(data, 'base64');
          const ext = mimeType.includes('png') ? 'png' : 'jpg';
          return toFile(buffer, `ref-${i}.${ext}`, { type: mimeType });
        }),
      );
      const result = await openai.images.edit({
        model: IMAGE_MODEL,
        image: imageFiles,
        prompt: promptText,
        size,
        quality: IMAGE_QUALITY,
        n: 1,
      });
      const b64 = result.data?.[0]?.b64_json;
      if (!b64) throw new Error('sem b64_json na resposta');
      return b64;
    }
    const result = await openai.images.generate({
      model: IMAGE_MODEL,
      prompt: promptText,
      size,
      quality: IMAGE_QUALITY,
      n: 1,
    });
    const b64 = result.data?.[0]?.b64_json;
    if (!b64) throw new Error('sem b64_json na resposta');
    return b64;
  }, `regen-openai-${slot}`);

  // Resize pra dim alvo
  const resized = await cropToSize(base64, dim.w, dim.h);
  let finalBuffer = Buffer.from(resized.base64, 'base64');

  if (APPLY_COMPOSER) {
    try {
      finalBuffer = await composeForSlot(slot, finalBuffer, params);
    } catch (err) {
      console.error(`[regen-openai] composer falhou pra ${slot}:`, err);
    }
  }

  return {
    base64: `data:image/png;base64,${finalBuffer.toString('base64')}`,
    largura: dim.w,
    altura: dim.h,
    modelUsado: APPLY_COMPOSER ? `${IMAGE_MODEL}+composer` : IMAGE_MODEL,
  };
}
