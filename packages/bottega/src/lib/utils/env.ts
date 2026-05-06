/**
 * Env helpers — leitura segura de variáveis Vite.
 *
 * USE_MOCK default = true (zero $ por acidente).
 * A API key Gemini fica server-side (Netlify Function), NUNCA no client.
 */

export const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false';

/** Pretty status pra debug — mostrado em /configuracoes. */
export function envSummary() {
  return {
    mode: USE_MOCK ? 'mock' : 'real',
    note: 'API key Gemini fica server-side (Netlify Function). Não exposta ao client.',
  };
}
