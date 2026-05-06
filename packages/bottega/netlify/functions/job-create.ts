import type { Context } from '@netlify/functions';
import { randomUUID } from 'node:crypto';
import { setJob } from './_lib/jobs';
import type { CriacaoForm } from '../../src/types/anuncio';

/**
 * job-create — Sync function (V2 syntax) que cria um job e dispara background.
 *
 * POST /.netlify/functions/job-create
 * body: { form: CriacaoForm }
 * resp: 202 { jobId, status: 'pending' }
 */

interface RequestBody {
  form: CriacaoForm;
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return json(400, { error: 'JSON inválido no body' });
  }

  if (!body.form || typeof body.form !== 'object') {
    return json(400, { error: 'form obrigatório' });
  }
  if (typeof body.form.nomeProduto !== 'string' || body.form.nomeProduto.trim().length < 3) {
    return json(400, { error: 'form.nomeProduto inválido (min 3 chars)' });
  }
  if (typeof body.form.detalhesTecnicos !== 'string' || body.form.detalhesTecnicos.trim().length < 20) {
    return json(400, { error: 'form.detalhesTecnicos inválido (min 20 chars)' });
  }

  const jobId = randomUUID();
  const createdAt = Date.now();

  await setJob({
    jobId,
    status: 'pending',
    kind: 'anuncio',
    payload: { form: body.form },
    createdAt,
    step: 'Aguardando para iniciar…',
  });

  // Dispara background function via fetch interno (background retorna 202 imediato)
  const url = new URL(req.url);
  const triggerUrl = `${url.protocol}//${url.host}/.netlify/functions/gemini-anuncio-background`;

  try {
    const trigger = await fetch(triggerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId }),
    });
    if (trigger.status !== 202 && trigger.status !== 200) {
      console.warn(`[job-create] background trigger HTTP ${trigger.status} pra job ${jobId}`);
    }
  } catch (err) {
    console.error('[job-create] erro ao disparar background:', err);
  }

  return json(202, {
    jobId,
    status: 'pending',
    estimatedSeconds: 90,
  });
};

export const config = {
  path: '/.netlify/functions/job-create',
};
