/**
 * Job storage helpers — Netlify Blobs.
 *
 * Padrão simples: cada job é um JSON no store 'bottega-jobs', chave = jobId (UUID v4).
 * Status flui: pending → running → done | error.
 */

import { getStore } from '@netlify/blobs';

export type JobStatus = 'pending' | 'running' | 'done' | 'error';

export interface JobBase {
  jobId: string;
  status: JobStatus;
  kind: 'anuncio';
  payload: Record<string, unknown>;
  createdAt: number;
  startedAt?: number;
  doneAt?: number;
  errorAt?: number;
  step?: string; // ex: "Análise de mercado", "Imagens 3/9"
  progress?: { current: number; total: number };
  error?: string;
  result?: unknown;
}

const STORE_NAME = 'bottega-jobs';

export function jobsStore() {
  return getStore({ name: STORE_NAME, consistency: 'strong' });
}

export async function setJob(job: JobBase): Promise<void> {
  await jobsStore().setJSON(job.jobId, job);
}

export async function getJob(jobId: string): Promise<JobBase | null> {
  const data = await jobsStore().get(jobId, { type: 'json' });
  return (data as JobBase | null) ?? null;
}

export async function patchJob(jobId: string, patch: Partial<JobBase>): Promise<JobBase | null> {
  const current = await getJob(jobId);
  if (!current) return null;
  const updated: JobBase = { ...current, ...patch };
  await setJob(updated);
  return updated;
}

/** Helper: retorna response JSON com headers padrão. */
export function jsonResponse(status: number, body: unknown) {
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}
