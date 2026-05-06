import type { Context } from '@netlify/functions';
import { getJob, patchJob } from './_lib/jobs';
import { runAnuncioPipeline } from './_lib/pipeline';
import type { CriacaoForm } from '../../src/types/anuncio';

/**
 * gemini-anuncio-background — Background function V2 (até 15min runtime).
 *
 * Detectada pelo sufixo `-background.ts`. Netlify retorna 202 imediato ao
 * client e continua executando. Comunicação via Blobs (jobs store).
 *
 * POST /.netlify/functions/gemini-anuncio-background
 * body: { jobId }
 */

interface RequestBody {
  jobId: string;
}

export default async (req: Request, _context: Context) => {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    console.error('[bg-anuncio] body inválido');
    return new Response('invalid body', { status: 400 });
  }

  const { jobId } = body;
  if (!jobId) {
    console.error('[bg-anuncio] jobId ausente');
    return new Response('jobId required', { status: 400 });
  }

  const job = await getJob(jobId);
  if (!job) {
    console.error(`[bg-anuncio] job ${jobId} não encontrado`);
    return new Response('job not found', { status: 404 });
  }
  if (job.status === 'done' || job.status === 'error') {
    console.warn(`[bg-anuncio] job ${jobId} já concluído (status=${job.status})`);
    return new Response('already finished', { status: 200 });
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
    return new Response('ok', { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[bg-anuncio] job ${jobId} falhou:`, msg);
    await patchJob(jobId, {
      status: 'error',
      errorAt: Date.now(),
      error: msg,
    });
    return new Response('error', { status: 500 });
  }
};

export const config = {
  path: '/.netlify/functions/gemini-anuncio-background',
};
