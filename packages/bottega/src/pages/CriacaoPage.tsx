import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brandbar } from '../components/organisms/Brandbar';
import { FormCriacao } from '../components/organisms/FormCriacao';
import { ResultsTabs } from '../components/organisms/ResultsTabs';
import { GlobalFooter } from '../components/organisms/GlobalFooter';
import { useCriacaoStore } from '../store/criacaoStore';
import { useAnunciosStore } from '../store/anunciosStore';

export function CriacaoPage() {
  const navigate = useNavigate();
  const { form, results, status, loadingMessage, loadingStep, loadingProgress, errorMsg, setField, generate, reset } = useCriacaoStore();
  const addAnuncio = useAnunciosStore((s) => s.add);
  const lastSavedRef = useRef<string | null>(null);

  // Salva no anunciosStore exatamente uma vez por geração concluída.
  // Track via results.geradoEm pra evitar duplicação em re-renders.
  useEffect(() => {
    if (status !== 'concluido' || !results) return;
    if (lastSavedRef.current === results.geradoEm) return;
    addAnuncio(form, results);
    lastSavedRef.current = results.geradoEm;
  }, [status, results, form, addAnuncio]);

  return (
    <div className="min-h-screen bg-osso">
      <Brandbar />

      <div className="bg-tinta text-osso px-12 py-3.5 flex items-center justify-between">
        <span className="font-ui text-[11px] font-medium uppercase tracking-[0.24em]">
          02 · Novo anúncio · Espaço de criação
        </span>
        <span className="font-editorial italic text-[13px] opacity-70">
          Forma à esquerda · respiração à direita.
        </span>
      </div>

      {errorMsg && (
        <div className="bg-terracota text-osso px-12 py-4 font-editorial italic text-base">
          ⚠ Algo travou: {errorMsg}. Verifique o console pra detalhes.
        </div>
      )}

      <section className="grid grid-cols-[480px_1fr] min-h-[800px]">
        <FormCriacao
          form={form}
          setField={setField}
          onSubmit={generate}
          isSubmitting={status === 'gerando'}
        />
        <ResultsTabs
          results={results}
          isLoading={status === 'gerando'}
          loadingMessage={loadingMessage}
          loadingStep={loadingStep}
          loadingProgress={loadingProgress}
        />
      </section>

      {results && (
        <div className="bg-areia px-12 py-section flex justify-between items-center">
          <span className="font-editorial italic text-lg text-tinta">
            Anúncio salvo no seu Atelier. Continue curando.
          </span>
          <div className="flex gap-3">
            <button
              onClick={() => { reset(); }}
              className="font-ui text-[11px] font-medium uppercase tracking-widest px-7 py-4 border-thick border-tinta text-tinta hover:bg-tinta hover:text-osso transition-all"
            >
              Criar outro
            </button>
            <button
              onClick={() => navigate('/atelier')}
              className="font-ui text-[11px] font-medium uppercase tracking-widest px-7 py-4 border-thick border-tinta bg-tinta text-osso hover:bg-mar hover:border-mar transition-all"
            >
              Voltar ao Atelier
            </button>
          </div>
        </div>
      )}

      <GlobalFooter />
    </div>
  );
}
