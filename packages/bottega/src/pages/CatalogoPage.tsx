import { useNavigate } from 'react-router-dom';
import { Brandbar } from '../components/organisms/Brandbar';
import { CatalogoSection } from '../components/organisms/CatalogoSection';
import { CardAnuncio } from '../components/molecules/CardAnuncio';
import { Editorial } from '../components/atoms/Editorial';
import { GlobalFooter } from '../components/organisms/GlobalFooter';
import { useAnunciosStore } from '../store/anunciosStore';

export function CatalogoPage() {
  const navigate = useNavigate();
  const { anuncios } = useAnunciosStore();

  return (
    <div className="min-h-screen bg-osso">
      <Brandbar />
      <div className="px-12 pt-section-xl">
        <span className="font-ui text-[11px] uppercase tracking-widest opacity-60">A coleção inteira</span>
        <h1 className="font-display text-[88px] leading-tight mt-4 mb-3">
          Catálogo <em className="font-editorial italic font-regular">completo.</em>
        </h1>
        <Editorial size="l" className="opacity-75 mb-6 max-w-prose">
          Tudo o que está em curadoria neste momento.
        </Editorial>
      </div>
      {anuncios.length === 0 ? (
        <div className="px-12 py-section-xl text-center">
          <Editorial size="l" className="opacity-65">
            Ainda não há anúncios no catálogo. Comece pelo essencial.
          </Editorial>
        </div>
      ) : (
        <CatalogoSection
          eyebrow={`${anuncios.length} ${anuncios.length === 1 ? 'anúncio' : 'anúncios'} · Atualizados`}
          titulo="Cada um"
          tituloItalic="curado"
          cta={{ label: 'Novo anúncio', onClick: () => navigate('/novo') }}
        >
          {anuncios.map((a) => (
            <CardAnuncio
              key={a.id}
              paletaCapa="mar"
              capaLegenda="Anúncio Amalfi Creator"
              eyebrow="Curadoria · Casa"
              titulo={a.form.nomeProduto.split(' ').slice(0, 2).join(' ')}
              tituloItalic={a.form.nomeProduto.split(' ').slice(2).join(' ') || 'criado.'}
              sub={a.results.descricao.bulletPoints[0] ?? a.form.detalhesTecnicos.slice(0, 110)}
              status={{ label: a.status === 'em-revisao' ? 'Em revisão' : a.status, tone: 'mar' }}
              versao={`v${a.versao} · ${new Date(a.criadoEm).toLocaleDateString('pt-BR')}`}
              onClick={() => navigate('/novo')}
            />
          ))}
        </CatalogoSection>
      )}
      <GlobalFooter />
    </div>
  );
}
