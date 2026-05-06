import { create } from 'zustand';
import type { CriacaoForm, CriacaoResults } from '../types/anuncio';
import { gerarMockTudo, LOADING_MESSAGES } from '../lib/mocks';
import { USE_MOCK } from '../lib/utils/env';

const formInicial = (): CriacaoForm => ({
  nomeProduto: '',
  fotoBase64: undefined,
  detalhesTecnicos: '',
  tituloAtual: '',
  numeroImagens: 9,
  estiloImagem: 'lifestyle',
});

interface CriacaoState {
  form: CriacaoForm;
  results: CriacaoResults | null;
  status: 'idle' | 'gerando' | 'concluido' | 'erro';
  loadingMessage: string;
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
  errorMsg: null,

  setField: (k, v) => set((s) => ({ form: { ...s.form, [k]: v } })),

  generate: async () => {
    // Guard: só uma geração por vez (resolve race condition de cliques duplos)
    if (get().status === 'gerando') {
      console.warn('[Bottega] geração já em andamento — ignorando duplicação.');
      return;
    }

    const { form } = get();
    set({ status: 'gerando', errorMsg: null, results: null, loadingMessage: LOADING_MESSAGES[0] });

    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      // Só atualiza se ainda estiver gerando (evita override após erro/conclusão)
      if (get().status === 'gerando') {
        set({ loadingMessage: LOADING_MESSAGES[i] });
      }
    }, 1200);

    try {
      let results: CriacaoResults;
      if (USE_MOCK) {
        results = await gerarMockTudo(form);
      } else {
        const { gerarTudoReal } = await import('../lib/gemini/orchestrator');
        results = await gerarTudoReal(form);
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
    }),
}));
