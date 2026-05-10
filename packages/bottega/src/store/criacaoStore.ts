import { create } from 'zustand';
import type { CriacaoForm, CriacaoResults } from '../types/anuncio';
import { FORM_DEFAULTS } from '../types/anuncio';
import { gerarMockTudo, LOADING_MESSAGES } from '../lib/mocks';
import { USE_MOCK } from '../lib/utils/env';

const formInicial = (): CriacaoForm => ({
  nomeProduto: '',
  fotosBase64: undefined,
  detalhesTecnicos: '',
  tituloAtual: '',
  numeroAnuncio: FORM_DEFAULTS.numeroAnuncio,
  numeroAplus: FORM_DEFAULTS.numeroAplus,
  estiloAnuncio: FORM_DEFAULTS.estiloAnuncio,
  estiloAplus: FORM_DEFAULTS.estiloAplus,
});

interface CriacaoState {
  form: CriacaoForm;
  results: CriacaoResults | null;
  status: 'idle' | 'gerando' | 'concluido' | 'erro';
  loadingMessage: string;       // mensagem rotativa decorativa
  loadingStep: string;          // etapa atual da pipeline (server-side)
  loadingProgress: { current: number; total: number } | null; // ex: imagens 3/9
  errorMsg: string | null;
  setField<K extends keyof CriacaoForm>(k: K, v: CriacaoForm[K]): void;
  generate(): Promise<void>;
  reset(): void;
}

export const useCriacaoStore = create<CriacaoState>()((set, get) => ({
  form: formInicial(),
  results: null,
  status: 'idle',
  loadingMessage: LOADING_MESSAGES[0],
  loadingStep: 'Iniciando…',
  loadingProgress: null,
  errorMsg: null,

  setField: (k, v) => set((s) => ({ form: { ...s.form, [k]: v } })),

  generate: async () => {
    if (get().status === 'gerando') {
      console.warn('[Bottega] geração já em andamento — ignorando duplicação.');
      return;
    }

    const { form } = get();
    set({
      status: 'gerando',
      errorMsg: null,
      results: null,
      loadingMessage: LOADING_MESSAGES[0],
      loadingStep: 'Iniciando…',
      loadingProgress: null,
    });

    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      if (get().status === 'gerando') {
        set({ loadingMessage: LOADING_MESSAGES[i] });
      }
    }, 1500);

    try {
      let results: CriacaoResults;
      if (USE_MOCK) {
        results = await gerarMockTudo(form);
      } else {
        const { gerarTudoReal } = await import('../lib/gemini/orchestrator');
        results = await gerarTudoReal(form, {
          onUpdate: (status) => {
            // Atualiza step/progress conforme background avança
            if (get().status === 'gerando') {
              set({
                loadingStep: status.step ?? 'Em andamento…',
                loadingProgress: status.progress ?? null,
              });
            }
          },
        });
      }
      set({ results, status: 'concluido' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ status: 'erro', errorMsg: msg });
      console.error('[Bottega] generate erro:', err);
    } finally {
      clearInterval(interval);
    }
  },

  reset: () =>
    set({
      form: formInicial(),
      results: null,
      status: 'idle',
      errorMsg: null,
      loadingMessage: LOADING_MESSAGES[0],
      loadingStep: 'Iniciando…',
      loadingProgress: null,
    }),
}));
