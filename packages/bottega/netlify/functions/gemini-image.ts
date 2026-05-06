import type { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions';
import { GoogleGenAI } from '@google/genai';

/**
 * Netlify Function: gemini-image
 *
 * Proxy server-side pra Imagen 4. Recebe um prompt e retorna base64 PNG.
 *
 * POST body: { prompt: string, negativePrompt?: string, aspectRatio?: '1:1' | '16:9' | '4:3' | '3:4' | '9:16' }
 * Response: { base64: string, modelUsado: string, latencyMs: number } | { error: string }
 */

const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL ?? 'imagen-4.0-generate-001';
const TIMEOUT_MS = 120_000;
const DEFAULT_ASPECT = '1:1';

interface RequestBody {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: '1:1' | '16:9' | '4:3' | '3:4' | '9:16';
}

const json = (status: number, body: unknown): HandlerResponse => ({
  statusCode: status,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  },
  body: JSON.stringify(body),
});

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return json(500, { error: 'GEMINI_API_KEY não configurada no servidor' });
  }

  let body: RequestBody;
  try {
    body = JSON.parse(event.body ?? '{}') as RequestBody;
  } catch {
    return json(400, { error: 'JSON inválido no body' });
  }

  if (!body.prompt || typeof body.prompt !== 'string') {
    return json(400, { error: 'prompt obrigatório (string)' });
  }
  if (body.prompt.length > 4_000) {
    return json(400, { error: 'prompt muito longo (>4k chars)' });
  }

  const finalPrompt = body.negativePrompt
    ? `${body.prompt}\n\nAvoid: ${body.negativePrompt}`
    : body.prompt;

  const start = Date.now();
  try {
    const client = new GoogleGenAI({ apiKey });

    const result = await Promise.race([
      client.models.generateImages({
        model: IMAGE_MODEL,
        prompt: finalPrompt,
        config: {
          numberOfImages: 1,
          aspectRatio: body.aspectRatio ?? DEFAULT_ASPECT,
        },
      }),
      new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error(`Timeout após ${TIMEOUT_MS}ms`)), TIMEOUT_MS),
      ),
    ]);

    const first = result.generatedImages?.[0];
    const base64 = first?.image?.imageBytes ?? '';
    if (!base64) {
      return json(502, { error: 'Imagen retornou sem imagem', latencyMs: Date.now() - start });
    }

    return json(200, {
      base64,
      modelUsado: IMAGE_MODEL,
      latencyMs: Date.now() - start,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[gemini-image] erro:', msg);
    return json(502, { error: msg, latencyMs: Date.now() - start });
  }
};

export { handler };
