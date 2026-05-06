import type { Context } from '@netlify/functions';
import { getJob } from './_lib/jobs';

/**
 * job-status — Sync function (V2 syntax) leve que retorna estado do job.
 *
 * GET /.netlify/functions/job-status?id={jobId}
 */

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export default async (req: Request, _context: Context) => {
  if (req.method !== 'GET') return json(405, { error: 'Method not allowed' });

  const url = new URL(req.url);
  const jobId = url.searchParams.get('id');
  if (!jobId) return json(400, { error: 'query param "id" obrigatório' });

  const job = await getJob(jobId);
  if (!job) return json(404, { error: 'job não encontrado', jobId });

  return json(200, {
    jobId: job.jobId,
    status: job.status,
    step: job.step,
    progress: job.progress,
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    doneAt: job.doneAt,
    errorAt: job.errorAt,
    error: job.error,
    result: job.result,
  });
};

export const config = {
  path: '/.netlify/functions/job-status',
};
