import type { Context } from '@netlify/functions';
import { GoogleGenAI } from '@google/genai';

/**
 * smoke-test — Health check V2.
 * GET → { ok: boolean, latencyMs: number, sample: string, error?: string }
 */

const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL ?? 'gemini-2.5-flash';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export default async (_req: Request, _context: Context) => {
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
    return json(200, {
      ok: false,
      latencyMs: Date.now() - start,
      sample: '',
      error: err instanceof Error ? err.message : String(err),
    });
  }
};

export const config = {
  path: '/.netlify/functions/smoke-test',
};
