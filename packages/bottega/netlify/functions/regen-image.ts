import type { Context } from '@netlify/functions';
import { regenerateOneImage } from './_lib/pipeline';
import type {
  AnaliseDeMercado,
  CriacaoForm,
  DescricaoResult,
  SlotKind,
} from '../../src/types/anuncio';

/**
 * regen-image — Regenera UMA imagem (slot específico) com fotos refs.
 *
 * POST /.netlify/functions/regen-image
 * body: {
 *   slotKind: SlotKind,
 *   form: CriacaoForm,
 *   analise: AnaliseDeMercado,
 *   descricao: DescricaoResult,
 *   visualSpec?: string,
 *   regeneradaEm?: string         // se truthy, recusa (limite 1×)
 * }
 * resp 200: { base64, largura, altura, modelUsado, regeneradaEm }
 */

interface RequestBody {
  slotKind: SlotKind;
  form: CriacaoForm;
  analise: AnaliseDeMercado;
  descricao: DescricaoResult;
  visualSpec?: string;
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

  if (body.regeneradaEm) {
    return json(429, { error: 'Esta imagem já foi regenerada (limite 1×).' });
  }

  if (!body.slotKind) {
    return json(400, { error: 'slotKind obrigatório' });
  }

  try {
    const result = await regenerateOneImage(
      body.slotKind,
      body.form,
      body.analise,
      body.descricao,
      body.visualSpec,
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
