import { GoogleGenAI } from '@google/genai';
import { GEMINI_API_KEY, HAS_VALID_KEY, GEMINI_TEXT_MODEL, GEMINI_IMAGE_MODEL } from '../utils/env';

let cached: GoogleGenAI | null = null;

/** Retorna instância única do cliente Gemini. */
export function getGeminiClient(): GoogleGenAI {
  if (!HAS_VALID_KEY) {
    throw new Error(
      'VITE_GEMINI_API_KEY não configurada ou inválida. Verifique seu .env.',
    );
  }
  if (!cached) {
    cached = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return cached;
}

export const TEXT_MODEL = GEMINI_TEXT_MODEL;
export const IMAGE_MODEL = GEMINI_IMAGE_MODEL;

/**
 * Smoke test simples — valida que a key funciona com 1 call mínima.
 * Free tier (Gemini 2.5 Flash, prompt curto) custa $0.
 */
export async function smokeTestGemini(): Promise<{ ok: boolean; latencyMs: number; sample: string; error?: string }> {
  const start = Date.now();
  try {
    const client = getGeminiClient();
    const result = await client.models.generateContent({
      model: TEXT_MODEL,
      contents: 'Responda apenas com a palavra "ok".',
    });
    const text = result.text ?? '';
    return { ok: text.toLowerCase().includes('ok'), latencyMs: Date.now() - start, sample: text };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      sample: '',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
