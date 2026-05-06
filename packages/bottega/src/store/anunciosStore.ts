import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Anuncio, ImagemGerada } from '../types/anuncio';
import { gerarId, slugify } from '../lib/utils/slug';

interface AnunciosState {
  anuncios: Anuncio[];
  current: string | null;
  add(form: Anuncio['form'], results: Anuncio['results']): Anuncio;
  update(id: string, patch: Partial<Anuncio>): void;
  remove(id: string): void;
  setCurrent(id: string | null): void;
  getById(id: string): Anuncio | undefined;
}

/**
 * Strip imagens base64 antes de persistir — base64 das imagens (até 1MB cada)
 * estoura o limite de localStorage (~5-10MB) rapidamente. Mantém metadados
 * (briefingNumero, falhou, etc) pra UI mostrar contagem; base64 some no reload.
 *
 * Sessão atual mantém imagens em memória; são perdidas após reload.
 * Pra histórico permanente das imagens, exportar PDF/HTML antes de fechar.
 */
function stripImageBase64(anuncios: Anuncio[]): Anuncio[] {
  return anuncios.map((a) => ({
    ...a,
    results: {
      ...a.results,
      imagens: a.results.imagens?.map(
        (img): ImagemGerada => ({
          briefingNumero: img.briefingNumero,
          base64: '',
          largura: img.largura,
          altura: img.altura,
          modelUsado: img.modelUsado,
          falhou: img.falhou,
        }),
      ),
    },
  }));
}

export const useAnunciosStore = create<AnunciosState>()(
  persist(
    (set, get) => ({
      anuncios: [],
      current: null,

      add: (form, results) => {
        const id = gerarId('anuncio');
        const slug = slugify(form.nomeProduto);
        const now = new Date().toISOString();
        const novo: Anuncio = {
          id,
          slug,
          status: 'em-revisao',
          versao: 1,
          form,
          results,
          criadoEm: now,
          atualizadoEm: now,
        };
        set((s) => ({ anuncios: [novo, ...s.anuncios], current: id }));
        return novo;
      },

      update: (id, patch) =>
        set((s) => ({
          anuncios: s.anuncios.map((a) =>
            a.id === id ? { ...a, ...patch, atualizadoEm: new Date().toISOString() } : a,
          ),
        })),

      remove: (id) =>
        set((s) => ({
          anuncios: s.anuncios.filter((a) => a.id !== id),
          current: s.current === id ? null : s.current,
        })),

      setCurrent: (id) => set({ current: id }),

      getById: (id) => get().anuncios.find((a) => a.id === id),
    }),
    {
      name: 'bottega.anuncios',
      version: 3,
      // Strip base64 antes de gravar no localStorage (evita QuotaExceededError).
      partialize: (state) => ({
        ...state,
        anuncios: stripImageBase64(state.anuncios),
      }),
      migrate: (persistedState, version) => {
        const state = persistedState as Partial<AnunciosState> | undefined;
        if (!state) return { anuncios: [], current: null } as Partial<AnunciosState>;
        // v1 → v2: garante flag falhou em cada imagem
        if (version < 2 && Array.isArray(state.anuncios)) {
          state.anuncios = state.anuncios.map((a) => ({
            ...a,
            results: {
              ...a.results,
              imagens: a.results.imagens?.map((img) => ({
                ...img,
                falhou: img.falhou ?? !img.base64,
              })),
            },
          }));
        }
        // v2 → v3: strip base64 retroativo (resolve QuotaExceededError em users
        // que tinham anúncios com imagens persistidas)
        if (version < 3 && Array.isArray(state.anuncios)) {
          state.anuncios = stripImageBase64(state.anuncios);
        }
        return state;
      },
    },
  ),
);
