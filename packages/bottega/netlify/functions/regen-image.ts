import type { Context } from '@netlify/functions';
import { regenerateOneImage } from './_lib/pipeline';

/**
 * regen-image — Regenera UMA imagem (anúncio ou A+).
 * Sync function (1 imagem só, ~15-25s — cabe no timeout pago do Netlify).
 *
 * POST /.netlify/functions/regen-image
 * body: {
 *   briefingPrompt: string,
 *   variante: 'anuncio' | 'aplus',
 *   fotosBase64: string[],         // até 3
 *   visualSpec?: string,           // descrição extraída via Vision (opcional)
 *   negativePrompt?: string,
 *   regeneradaEm?: string          // se truthy, recusa (limite 1×)
 * }
 * resp 200: { base64, largura, altura, modelUsado, regeneradaEm }
 */

interface RequestBody {
  briefingPrompt: string;
  variante: 'anuncio' | 'aplus';
  fotosBase64?: string[];
  visualSpec?: string;
  negativePrompt?: string;
  regeneradaEm?: string;
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return json(400, { error: 'JSON inválido no body' });
  }

  // Limite 1× por imagem
  if (body.regeneradaEm) {
    return json(429, { error: 'Esta imagem já foi regenerada (limite 1×).' });
  }

  if (!body.briefingPrompt || typeof body.briefingPrompt !== 'string') {
    return json(400, { error: 'briefingPrompt obrigatório' });
  }
  if (body.variante !== 'anuncio' && body.variante !== 'aplus') {
    return json(400, { error: 'variante deve ser "anuncio" ou "aplus"' });
  }

  try {
    const result = await regenerateOneImage(
      body.briefingPrompt,
      body.variante,
      body.fotosBase64 ?? [],
      body.visualSpec,
      body.negativePrompt,
    );
    return json(200, {
      ...result,
      regeneradaEm: new Date().toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[regen-image] erro:', msg);
    return json(502, { error: msg });
  }
};

export const config = {
  path: '/.netlify/functions/regen-image',
};
