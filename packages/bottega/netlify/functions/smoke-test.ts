import type { Handler, HandlerResponse } from '@netlify/functions';
import { GoogleGenAI } from '@google/genai';

/**
 * Netlify Function: smoke-test
 *
 * Health check — valida que GEMINI_API_KEY no servidor responde.
 * Retorna ok=true se Flash responde com algum texto.
 *
 * GET → { ok: boolean, latencyMs: number, sample: string, error?: string }
 */

const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL ?? 'gemini-2.5-flash';

const json = (status: number, body: unknown): HandlerResponse => ({
  statusCode: status,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  },
  body: JSON.stringify(body),
});

const handler: Handler = async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return json(200, {
      ok: false,
      latencyMs: 0,
      sample: '',
      error: 'GEMINI_API_KEY não configurada no servidor',
    });
  }

  const start = Date.now();
  try {
    const client = new GoogleGenAI({ apiKey });
    const result = await client.models.generateContent({
      model: TEXT_MODEL,
      contents: 'Responda apenas com a palavra "ok".',
    });
    const text = result.text ?? '';
    return json(200, {
      ok: text.toLowerCase().includes('ok'),
      latencyMs: Date.now() - start,
      sample: text,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return json(200, {
      ok: false,
      latencyMs: Date.now() - start,
      sample: '',
      error: msg,
    });
  }
};

export { handler };
