/**
 * Gemini orchestration pipeline V2 — server-side.
 *
 * Importado pela background function gemini-anuncio-background.
 * Executa a sequência completa de criação de anúncio:
 *   análise → [keywords|títulos|descrição] (paralelo) →
 *   visualSpec (Gemini Vision) → briefings (anúncio + A+ paralelo) →
 *   imagens (anúncio 1024×1024 + A+ 970×600, todas com refs).
 *
 * Atualiza o blob do job a cada etapa via callback `onStep`.
 */

import { GoogleGenAI, Modality } from '@google/genai';
import {
  promptAnalise,
  promptKeywords,
  promptTitulos,
  promptDescricao,
  promptBriefings,
  promptBriefingsAPlus,
  promptVisualSpec,
  buildImageGenPrompt,
} from '../../../src/lib/gemini/prompts';
import {
  analiseSchema,
  keywordsSchema,
  titulosSchema,
  descricaoSchema,
  briefingsSchema,
  briefingsAPlusSchema,
} from '../../../src/lib/gemini/schemas';
import type {
  CriacaoForm,
  CriacaoResults,
  BriefingImagem,
  BriefingAPlus,
  ImagemGerada,
} from '../../../src/types/anuncio';
import { cropToSize } from './cropImage';

const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL ?? 'gemini-2.5-flash';
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL ?? 'gemini-2.5-flash-image';

// Retry config — Gemini retorna 503 quando sobrecarregado.
const MAX_ATTEMPTS = 5;
const BACKOFF_MS = [2_000, 5_000, 10_000, 20_000];

// A+ Content target dimensions (Amazon spec)
const APLUS_WIDTH = 970;
const APLUS_HEIGHT = 600;

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
  let cleaned = text.trim();
  if (!cleaned) throw new Error(`[${kind}] resposta vazia do Gemini`);

  // Pega do primeiro { ou [ em diante (remove prefácio conversacional)
  const startObj = cleaned.indexOf('{');
  const startArr = cleaned.indexOf('[');
  let start: number;
  if (startObj === -1) start = startArr;
  else if (startArr === -1) start = startObj;
  else start = Math.min(startObj, startArr);
  if (start > 0) cleaned = cleaned.slice(start);

  // Remove texto após o último } ou ]
  const lastObj = cleaned.lastIndexOf('}');
  const lastArr = cleaned.lastIndexOf(']');
  const end = Math.max(lastObj, lastArr);
  if (end >= 0 && end < cleaned.length - 1) cleaned = cleaned.slice(0, end + 1);

  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Sanitiza control chars dentro de strings
    let inString = false;
    let escaped = false;
    let out = '';
    for (let i = 0; i < cleaned.length; i++) {
      const c = cleaned[i];
      const code = cleaned.charCodeAt(i);
      if (escaped) {
        out += c;
        escaped = false;
        continue;
      }
      if (c === '\\') {
        out += c;
        escaped = true;
        continue;
      }
      if (c === '"') {
        out += c;
        inString = !inString;
        continue;
      }
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
    const preview = cleaned.slice(0, 200);
    throw new Error(`[${kind}] JSON inválido após sanitização — prévia: ${preview}…`, {
      cause: parseErr,
    });
  }
}

interface PipelineOpts {
  onStep: (step: string, progress?: { current: number; total: number }) => Promise<void>;
}

/** Strip data URI prefix se presente; retorna só os bytes base64. */
function stripDataUri(b64: string): { data: string; mimeType: string } {
  const m = b64.match(/^data:([^;]+);base64,(.+)$/);
  if (m) return { mimeType: m[1], data: m[2] };
  return { mimeType: 'image/jpeg', data: b64 };
}

export async function runAnuncioPipeline(form: CriacaoForm, opts: PipelineOpts): Promise<CriacaoResults> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY não configurada no servidor');

  const client = new GoogleGenAI({ apiKey });
  const inicio = Date.now();
  const fotos = (form.fotosBase64 ?? []).slice(0, 3); // max 3 refs

  // ---------------------------------------------------------
  // Helper: Gemini text com retry + JSON validation
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // 1. Análise (sem Search — JSON estrito)
  // ---------------------------------------------------------
  await opts.onStep('Lendo o mercado…');
  const analise = await geminiText(promptAnalise(form), (r) => analiseSchema.parse(r), 'analise', false);
  const analiseContext = JSON.stringify(analise);

  // ---------------------------------------------------------
  // 2. Keywords + Títulos + Descrição (paralelo)
  // ---------------------------------------------------------
  await opts.onStep('Curando palavras e títulos…');
  const [keywords, titulos, descricao] = await Promise.all([
    geminiText(promptKeywords(form, analiseContext), (r) => keywordsSchema.parse(r), 'keywords', false),
    geminiText(promptTitulos(form, analiseContext), (r) => titulosSchema.parse(r), 'titulos'),
    geminiText(promptDescricao(form, analiseContext), (r) => descricaoSchema.parse(r), 'descricao'),
  ]);

  // ---------------------------------------------------------
  // 3. Visual Spec (Gemini Vision lê fotos do produto, se houver)
  // ---------------------------------------------------------
  let visualSpec: string | undefined;
  if (fotos.length > 0) {
    await opts.onStep('Estudando o produto pelas fotos…');
    visualSpec = await withRetry(async () => {
      const visionContents: Array<unknown> = [
        { text: promptVisualSpec() },
        ...fotos.map((b64) => {
          const { data, mimeType } = stripDataUri(b64);
          return { inlineData: { mimeType, data } };
        }),
      ];
      const result = await client.models.generateContent({
        model: TEXT_MODEL,
        contents: visionContents as never,
      });
      return (result.text ?? '').trim();
    }, 'visual-spec');
    console.log(`[pipeline] visualSpec: ${visualSpec.slice(0, 100)}…`);
  }

  // ---------------------------------------------------------
  // 4. Briefings (anúncio + A+ em paralelo)
  // ---------------------------------------------------------
  await opts.onStep('Compondo briefings de imagem…');
  const [briefings, briefingsAPlus] = await Promise.all([
    geminiText(promptBriefings(form, analiseContext), (r) => briefingsSchema.parse(r), 'briefings'),
    geminiText(promptBriefingsAPlus(form, analiseContext), (r) => briefingsAPlusSchema.parse(r), 'briefings-aplus'),
  ]);

  // ---------------------------------------------------------
  // 5. Imagens — anúncio (1024×1024) + A+ (970×600 via crop)
  // ---------------------------------------------------------
  const totalImages = briefings.length + briefingsAPlus.length;
  let completed = 0;
  await opts.onStep('Renderizando imagens…', { current: 0, total: totalImages });

  // Helper pra gerar 1 imagem com refs + retry
  async function generateImage(
    promptText: string,
    aspectRatio: '1:1' | '4:3',
    label: string,
  ): Promise<string | null> {
    try {
      return await withRetry(async () => {
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
        // Acessa partes inline da resposta
        const parts = result.candidates?.[0]?.content?.parts ?? [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            return part.inlineData.data;
          }
        }
        throw new Error(`[${label}] sem imagem na resposta`);
      }, label);
    } catch (err) {
      console.error(`[pipeline] ${label} falhou após retries:`, err);
      return null;
    }
  }

  // Anúncio (1024×1024 nativo)
  const anuncioTasks: Promise<ImagemGerada>[] = briefings.map(async (b: BriefingImagem) => {
    const finalPrompt = buildImageGenPrompt(b.prompt, visualSpec, {
      negative: b.negativePrompt,
      landscape: false,
    });
    const base64 = await generateImage(finalPrompt, '1:1', `anuncio-${b.numero}`);
    completed += 1;
    await opts.onStep('Renderizando imagens…', { current: completed, total: totalImages });
    if (!base64) {
      return {
        briefingNumero: b.numero,
        variante: 'anuncio',
        base64: '',
        largura: 0,
        altura: 0,
        modelUsado: `${IMAGE_MODEL}-failed`,
        falhou: true,
      };
    }
    return {
      briefingNumero: b.numero,
      variante: 'anuncio',
      base64: `data:image/png;base64,${base64}`,
      largura: 1024,
      altura: 1024,
      modelUsado: IMAGE_MODEL,
    };
  });

  // A+ (4:3 nativo + crop pra 970×600 via Sharp)
  const aplusTasks: Promise<ImagemGerada>[] = briefingsAPlus.map(async (b: BriefingAPlus) => {
    const finalPrompt = buildImageGenPrompt(b.prompt, visualSpec, {
      negative: b.negativePrompt,
      landscape: true,
    });
    const base64 = await generateImage(finalPrompt, '4:3', `aplus-${b.numero}`);
    completed += 1;
    await opts.onStep('Renderizando imagens…', { current: completed, total: totalImages });
    if (!base64) {
      return {
        briefingNumero: b.numero,
        variante: 'aplus',
        base64: '',
        largura: 0,
        altura: 0,
        modelUsado: `${IMAGE_MODEL}-failed`,
        falhou: true,
      };
    }
    // Crop pra 970×600
    try {
      const cropped = await cropToSize(base64, APLUS_WIDTH, APLUS_HEIGHT);
      return {
        briefingNumero: b.numero,
        variante: 'aplus',
        base64: `data:image/png;base64,${cropped.base64}`,
        largura: cropped.largura,
        altura: cropped.altura,
        modelUsado: IMAGE_MODEL,
      };
    } catch (err) {
      console.error(`[pipeline] aplus-${b.numero} crop falhou:`, err);
      // Fallback: usa imagem sem crop (será reescalada pelo CSS no client)
      return {
        briefingNumero: b.numero,
        variante: 'aplus',
        base64: `data:image/png;base64,${base64}`,
        largura: 1024,
        altura: 768,
        modelUsado: `${IMAGE_MODEL}-uncropped`,
      };
    }
  });

  const imagens = await Promise.all([...anuncioTasks, ...aplusTasks]);

  console.log(`[pipeline] anúncio concluído em ${Date.now() - inicio}ms`);

  return {
    analise,
    keywords,
    titulos,
    descricao,
    briefings,
    briefingsAPlus,
    imagens,
    visualSpec,
    geradoEm: new Date().toISOString(),
    modoGeracao: 'real',
  };
}

/**
 * Regenera UMA imagem específica (chamada do regen-image function).
 * Uso: novo briefing prompt + fotos refs → 1 imagem nova.
 */
export async function regenerateOneImage(
  briefingPrompt: string,
  variante: 'anuncio' | 'aplus',
  fotos: string[],
  visualSpec?: string,
  negativePrompt?: string,
): Promise<{ base64: string; largura: number; altura: number; modelUsado: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY não configurada no servidor');

  const client = new GoogleGenAI({ apiKey });
  const aspectRatio = variante === 'aplus' ? '4:3' : '1:1';
  const finalPrompt = buildImageGenPrompt(briefingPrompt, visualSpec, {
    negative: negativePrompt,
    landscape: variante === 'aplus',
  });

  const base64 = await withRetry(async () => {
    const contents: Array<unknown> = [
      { text: finalPrompt },
      ...fotos.slice(0, 3).map((b64) => {
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
  }, `regen-${variante}`);

  if (variante === 'aplus') {
    const cropped = await cropToSize(base64, APLUS_WIDTH, APLUS_HEIGHT);
    return {
      base64: `data:image/png;base64,${cropped.base64}`,
      largura: cropped.largura,
      altura: cropped.altura,
      modelUsado: IMAGE_MODEL,
    };
  }
  return {
    base64: `data:image/png;base64,${base64}`,
    largura: 1024,
    altura: 1024,
    modelUsado: IMAGE_MODEL,
  };
}
