import type { Handler, HandlerEvent } from '@netlify/functions';
import { getJob, patchJob } from './_lib/jobs';
import { runAnuncioPipeline } from './_lib/pipeline';
import type { CriacaoForm } from '../../src/types/anuncio';

/**
 * gemini-anuncio-background — Background function (até 15min de runtime).
 *
 * Detectada pelo sufixo `-background.ts`. Netlify retorna 202 imediatamente
 * ao client e continua executando. Output do client é zero — comunicação
 * acontece via blob storage (jobs).
 *
 * POST /.netlify/functions/gemini-anuncio-background
 * body: { jobId }
 */

interface RequestBody {
  jobId: string;
}

const handler: Handler = async (event: HandlerEvent) => {
  let body: RequestBody;
  try {
    body = JSON.parse(event.body ?? '{}') as RequestBody;
  } catch {
    console.error('[bg-anuncio] body inválido');
    return { statusCode: 400, body: 'invalid body' };
  }

  const { jobId } = body;
  if (!jobId) {
    console.error('[bg-anuncio] jobId ausente');
    return { statusCode: 400, body: 'jobId required' };
  }

  const job = await getJob(jobId);
  if (!job) {
    console.error(`[bg-anuncio] job ${jobId} não encontrado`);
    return { statusCode: 404, body: 'job not found' };
  }
  if (job.status === 'done' || job.status === 'error') {
    console.warn(`[bg-anuncio] job ${jobId} já concluído (status=${job.status})`);
    return { statusCode: 200, body: 'already finished' };
  }

  console.log(`[bg-anuncio] iniciando job ${jobId}`);
  await patchJob(jobId, {
    status: 'running',
    startedAt: Date.now(),
    step: 'Iniciando…',
  });

  try {
    const form = (job.payload?.form as CriacaoForm | undefined) ?? null;
    if (!form) throw new Error('payload.form ausente no job');

    const results = await runAnuncioPipeline(form, {
      onStep: async (step, progress) => {
        await patchJob(jobId, { step, progress });
        console.log(`[bg-anuncio] ${jobId} → ${step}${progress ? ` (${progress.current}/${progress.total})` : ''}`);
      },
    });

    await patchJob(jobId, {
      status: 'done',
      doneAt: Date.now(),
      step: 'Concluído',
      result: results,
    });
    console.log(`[bg-anuncio] job ${jobId} concluído`);
    return { statusCode: 200, body: 'ok' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[bg-anuncio] job ${jobId} falhou:`, msg);
    await patchJob(jobId, {
      status: 'error',
      errorAt: Date.now(),
      error: msg,
    });
    return { statusCode: 500, body: 'error' };
  }
};

export { handler };
