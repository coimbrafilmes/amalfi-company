import type { Handler, HandlerEvent } from '@netlify/functions';
import { getJob, jsonResponse } from './_lib/jobs';

/**
 * job-status — Sync function leve que retorna o estado atual de um job.
 * Cliente faz polling neste endpoint enquanto status === 'pending' | 'running'.
 *
 * GET /.netlify/functions/job-status?id={jobId}
 */

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  const jobId = event.queryStringParameters?.id;
  if (!jobId || typeof jobId !== 'string') {
    return jsonResponse(400, { error: 'query param "id" obrigatório' });
  }

  const job = await getJob(jobId);
  if (!job) {
    return jsonResponse(404, { error: 'job não encontrado', jobId });
  }

  // Retornamos só campos públicos relevantes pra UI — não vazamos payload bruto.
  return jsonResponse(200, {
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

export { handler };
