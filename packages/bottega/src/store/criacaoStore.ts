import { create } from 'zustand';
import type { CriacaoForm, CriacaoResults, ImagemGerada, VarianteImagem } from '../types/anuncio';
import { gerarMockTudo, LOADING_MESSAGES } from '../lib/mocks';
import { USE_MOCK } from '../lib/utils/env';

const formInicial = (): CriacaoForm => ({
  nomeProduto: '',
  fotosBase64: undefined,
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
  loadingStep: string;
  loadingProgress: { current: number; total: number } | null;
  errorMsg: string | null;
  /** Set de "variante:numero" das imagens em regenerate ativo. */
  regenerating: Set<string>;
  setField<K extends keyof CriacaoForm>(k: K, v: CriacaoForm[K]): void;
  generate(): Promise<void>;
  regenerateImage(briefingNumero: number, variante: VarianteImagem): Promise<void>;
  reset(): void;
}

const regenKey = (variante: VarianteImagem, numero: number) => `${variante}:${numero}`;

export const useCriacaoStore = create<CriacaoState>()((set, get) => ({
  form: formInicial(),
  results: null,
  status: 'idle',
  loadingMessage: LOADING_MESSAGES[0],
  loadingStep: 'Iniciando…',
  loadingProgress: null,
  errorMsg: null,
  regenerating: new Set(),

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

  regenerateImage: async (briefingNumero, variante) => {
    const state = get();
    if (!state.results) return;

    // Acha a imagem atual (pode estar em qualquer variante)
    const img = state.results.imagens?.find(
      (i) => i.briefingNumero === briefingNumero && i.variante === variante,
    );
    if (img?.regeneradaEm) {
      console.warn('[Bottega] imagem já regenerada (limite 1×).');
      return;
    }

    const key = regenKey(variante, briefingNumero);
    const newRegenerating = new Set(state.regenerating);
    newRegenerating.add(key);
    set({ regenerating: newRegenerating });

    // Acha o briefing original (anuncio ou aplus)
    const briefing =
      variante === 'anuncio'
        ? state.results.briefings.find((b) => b.numero === briefingNumero)
        : state.results.briefingsAPlus.find((b) => b.numero === briefingNumero);
    if (!briefing) {
      console.error('[Bottega] briefing não encontrado pra regen.');
      const cleanup = new Set(get().regenerating);
      cleanup.delete(key);
      set({ regenerating: cleanup });
      return;
    }

    try {
      const res = await fetch('/.netlify/functions/regen-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          briefingPrompt: briefing.prompt,
          variante,
          fotosBase64: state.form.fotosBase64 ?? [],
          visualSpec: state.results.visualSpec,
          negativePrompt: briefing.negativePrompt,
          regeneradaEm: img?.regeneradaEm,
        }),
      });
      const data = (await res.json()) as
        | { base64: string; largura: number; altura: number; modelUsado: string; regeneradaEm: string }
        | { error: string };
      if (!res.ok || 'error' in data) {
        throw new Error('error' in data ? data.error : `HTTP ${res.status}`);
      }

      // Atualiza a imagem específica nos results
      const current = get().results;
      if (!current) return;
      const newImagens: ImagemGerada[] = (current.imagens ?? []).map((i) =>
        i.briefingNumero === briefingNumero && i.variante === variante
          ? {
              ...i,
              base64: data.base64,
              largura: data.largura,
              altura: data.altura,
              modelUsado: data.modelUsado,
              falhou: false,
              regeneradaEm: data.regeneradaEm,
            }
          : i,
      );
      set({
        results: { ...current, imagens: newImagens },
      });
    } catch (err) {
      console.error('[Bottega] regenerate falhou:', err);
    } finally {
      const cleanup = new Set(get().regenerating);
      cleanup.delete(key);
      set({ regenerating: cleanup });
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
      regenerating: new Set(),
    }),
}));
