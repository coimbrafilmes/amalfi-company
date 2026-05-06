import type { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions';
import { GoogleGenAI } from '@google/genai';

/**
 * Netlify Function: gemini-text
 *
 * Proxy server-side pra Gemini Flash. A API key fica em process.env (Netlify dashboard),
 * NUNCA no bundle do client. O client chama esta função via fetch.
 *
 * POST body: { prompt: string, useSearch?: boolean, model?: string }
 * Response: { text: string, latencyMs: number } | { error: string }
 */

const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL ?? 'gemini-2.5-flash';
const TIMEOUT_MS = 90_000;

interface RequestBody {
  prompt: string;
  useSearch?: boolean;
  model?: string;
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
  if (body.prompt.length > 50_000) {
    return json(400, { error: 'prompt muito longo (>50k chars)' });
  }

  const start = Date.now();
  try {
    const client = new GoogleGenAI({ apiKey });
    // Gemini API: tools (Search) + responseMimeType:json são mutuamente exclusivos.
    // Quando Search está ativo, retorno vem em texto livre (que pode envolver JSON
    // em markdown). O cliente trata isso via extractJson.
    const config: Record<string, unknown> = {};
    if (body.useSearch) {
      config.tools = [{ googleSearch: {} }];
    } else {
      config.responseMimeType = 'application/json';
    }

    const result = await Promise.race([
      client.models.generateContent({
        model: body.model ?? TEXT_MODEL,
        contents: body.prompt,
        config,
      }),
      new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error(`Timeout após ${TIMEOUT_MS}ms`)), TIMEOUT_MS),
      ),
    ]);

    const text = result.text ?? '';
    return json(200, { text, latencyMs: Date.now() - start });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[gemini-text] erro:', msg);
    return json(502, { error: msg, latencyMs: Date.now() - start });
  }
};

export { handler };
