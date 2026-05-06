/**
 * Env helpers — leitura segura de variáveis Vite.
 * USE_MOCK default = true (segurança: zero $ por acidente).
 */

export const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false';

export const GEMINI_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY ?? '').trim();

export const GEMINI_TEXT_MODEL =
  (import.meta.env.VITE_GEMINI_TEXT_MODEL as string | undefined) ?? 'gemini-2.5-flash';

export const GEMINI_IMAGE_MODEL =
  (import.meta.env.VITE_GEMINI_IMAGE_MODEL as string | undefined) ?? 'imagen-4.0-generate-001';

/** Verifica se a chave Gemini está plausível (formato AIza...) */
export const HAS_VALID_KEY = /^AIza[A-Za-z0-9_-]{35}$/.test(GEMINI_API_KEY);

/** Pretty status pra debug */
export function envSummary() {
  return {
    mode: USE_MOCK ? 'mock' : 'real',
    keyPresent: HAS_VALID_KEY,
    textModel: GEMINI_TEXT_MODEL,
    imageModel: GEMINI_IMAGE_MODEL,
  };
}
