/**
 * Orchestrator REAL — usa Background Jobs (Netlify Functions).
 *
 * Padrão:
 *   1. POST /job-create com o form → resposta { jobId }
 *   2. POST /gemini-anuncio-background é disparado server-side
 *   3. Loop de polling em GET /job-status?id={jobId} até status === 'done' | 'error'
 *
 * Toda lógica Gemini agora vive server-side em netlify/functions/_lib/pipeline.ts.
 */

import type { CriacaoForm, CriacaoResults } from '../../types/anuncio';

const JOB_CREATE_FN = '/.netlify/functions/job-create';
const JOB_STATUS_FN = '/.netlify/functions/job-status';

const POLL_TIMEOUT_MS = 6 * 60 * 1000; // 6 minutos máximo total
const POLL_INITIAL_MS = 2_000;
const POLL_RAMP_AT_MS = 30_000;
const POLL_RAMP_MS = 3_000;
const POLL_LATE_AT_MS = 90_000;
const POLL_LATE_MS = 5_000;

interface JobStatusResp {
  jobId: string;
  status: 'pending' | 'running' | 'done' | 'error';
  step?: string;
  progress?: { current: number; total: number };
  result?: CriacaoResults;
  error?: string;
  createdAt?: number;
  startedAt?: number;
}

interface JobCreateResp {
  jobId: string;
  status: 'pending';
  estimatedSeconds?: number;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Detecta erros transientes — pra retentar a chamada de criação do job. */
function isTransient(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return (
    msg.includes('503') ||
    msg.includes('unavailable') ||
    msg.includes('502') ||
    msg.includes('504') ||
    msg.includes('timeout') ||
    msg.includes('failed to fetch') ||
    msg.includes('aborterror') ||
    msg.includes('network')
  );
}

/** Chama job-create com retry leve. Retorna jobId. */
async function triggerJob(form: CriacaoForm): Promise<string> {
  const maxAttempts = 3;
  let lastErr: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      if (attempt > 0) {
        const delay = 1500 * attempt + Math.floor(Math.random() * 500);
        console.warn(`[bottega] job-create retry ${attempt}/${maxAttempts - 1} em ${delay}ms…`);
        await wait(delay);
      }
      const res = await fetch(JOB_CREATE_FN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form }),
      });
      const ct = res.headers.get('content-type') ?? '';
      if (!ct.includes('application/json')) {
        throw new Error(`job-create resposta não-JSON (${res.status} ${res.statusText})`);
      }
      const data = (await res.json()) as JobCreateResp | { error?: string };
      if (!res.ok || !('jobId' in data)) {
        const msg = 'error' in data && data.error ? data.error : `HTTP ${res.status}`;
        throw new Error(`job-create falhou: ${msg}`);
      }
      return data.jobId;
    } catch (err) {
      lastErr = err;
      if (!isTransient(err) || attempt === maxAttempts - 1) throw err;
    }
  }
  throw lastErr;
}

/** Lê status do job. Retorna o objeto bruto. */
async function readJobStatus(jobId: string): Promise<JobStatusResp> {
  const res = await fetch(`${JOB_STATUS_FN}?id=${encodeURIComponent(jobId)}`);
  const ct = res.headers.get('content-type') ?? '';
  if (!ct.includes('application/json')) {
    throw new Error(`job-status resposta não-JSON (${res.status})`);
  }
  const data = (await res.json()) as JobStatusResp & { error?: string };
  if (!res.ok) {
    throw new Error(`job-status falhou: ${data.error ?? `HTTP ${res.status}`}`);
  }
  return data;
}

interface PollOptions {
  onUpdate?: (status: JobStatusResp) => void;
}

/** Loop de polling com backoff progressivo. Resolve com result ou throw com erro. */
async function pollJob(jobId: string, opts: PollOptions = {}): Promise<CriacaoResults> {
  const startedAt = Date.now();
  let pollMs = POLL_INITIAL_MS;
  let lastStep: string | undefined;
  let lastProgress: string | undefined;

  while (Date.now() - startedAt < POLL_TIMEOUT_MS) {
    await wait(pollMs);

    let status: JobStatusResp;
    try {
      status = await readJobStatus(jobId);
    } catch (err) {
      // Falha de rede transitória — continua o loop, não derruba
      if (isTransient(err)) {
        console.warn(`[bottega] job-status transient err, continua poll:`, err);
        continue;
      }
      throw err;
    }

    // Notifica UI somente quando step ou progress mudam
    const progressKey = status.progress ? `${status.progress.current}/${status.progress.total}` : '';
    if (status.step !== lastStep || progressKey !== lastProgress) {
      lastStep = status.step;
      lastProgress = progressKey;
      opts.onUpdate?.(status);
    }

    if (status.status === 'done') {
      if (!status.result) throw new Error('Job concluído sem result no payload');
      return status.result;
    }
    if (status.status === 'error') {
      throw new Error(status.error ?? 'Job falhou sem mensagem');
    }

    // Backoff progressivo — manter <30 reqs/min mesmo em jobs longos
    const elapsed = Date.now() - startedAt;
    if (elapsed > POLL_LATE_AT_MS) pollMs = POLL_LATE_MS;
    else if (elapsed > POLL_RAMP_AT_MS) pollMs = POLL_RAMP_MS;
  }

  throw new Error(`Polling excedeu ${Math.round(POLL_TIMEOUT_MS / 60_000)}min — job ${jobId} pode ainda estar rodando server-side`);
}

interface GerarOptions {
  onUpdate?: (status: JobStatusResp) => void;
}

/** Gera o anúncio completo via Background Job. */
export async function gerarTudoReal(form: CriacaoForm, opts: GerarOptions = {}): Promise<CriacaoResults> {
  console.log('[Bottega] disparando job de criação…');
  const jobId = await triggerJob(form);
  console.log(`[Bottega] job ${jobId} criado, iniciando poll…`);
  return pollJob(jobId, { onUpdate: opts.onUpdate });
}

/** Smoke test agora chama Function — sem expor key. */
export async function smokeTestGeminiViaFn(): Promise<{
  ok: boolean;
  latencyMs: number;
  sample: string;
  error?: string;
}> {
  try {
    const res = await fetch('/.netlify/functions/smoke-test');
    return (await res.json()) as { ok: boolean; latencyMs: number; sample: string; error?: string };
  } catch (err) {
    return {
      ok: false,
      latencyMs: 0,
      sample: '',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export type { JobStatusResp };
