import type { Handler, HandlerEvent } from '@netlify/functions';
import { randomUUID } from 'node:crypto';
import { setJob, jsonResponse } from './_lib/jobs';
import type { CriacaoForm } from '../../src/types/anuncio';

/**
 * job-create — Sync function que recebe um form de criação de anúncio,
 * cria um job ID, persiste status pending, dispara a background function
 * e retorna o jobId pra polling.
 *
 * POST /.netlify/functions/job-create
 * body: { form: CriacaoForm }
 * resp: 202 { jobId, status: 'pending' }
 */

interface RequestBody {
  form: CriacaoForm;
}

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  let body: RequestBody;
  try {
    body = JSON.parse(event.body ?? '{}') as RequestBody;
  } catch {
    return jsonResponse(400, { error: 'JSON inválido no body' });
  }

  if (!body.form || typeof body.form !== 'object') {
    return jsonResponse(400, { error: 'form obrigatório' });
  }
  if (typeof body.form.nomeProduto !== 'string' || body.form.nomeProduto.trim().length < 3) {
    return jsonResponse(400, { error: 'form.nomeProduto inválido (min 3 chars)' });
  }
  if (typeof body.form.detalhesTecnicos !== 'string' || body.form.detalhesTecnicos.trim().length < 20) {
    return jsonResponse(400, { error: 'form.detalhesTecnicos inválido (min 20 chars)' });
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

  // Dispara background function. Background functions Netlify retornam 202 imediatamente
  // e continuam executando — não precisamos aguardar response completo.
  const baseUrl = process.env.URL ?? `https://${event.headers.host}`;
  const triggerUrl = `${baseUrl}/.netlify/functions/gemini-anuncio-background`;

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
    // Mesmo se o fetch falhar localmente, o background pode ainda ter enfileirado.
    // Logamos mas seguimos — o cliente vai poll e eventualmente ver erro se o bg não rodou.
    console.error('[job-create] erro ao disparar background:', err);
  }

  return jsonResponse(202, {
    jobId,
    status: 'pending',
    estimatedSeconds: 90,
  });
};

export { handler };
