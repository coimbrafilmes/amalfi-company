import { useNavigate } from 'react-router-dom';
import { Brandbar } from '../components/organisms/Brandbar';
import { HeroEditorial } from '../components/organisms/HeroEditorial';
import { StatsRow } from '../components/organisms/StatsRow';
import { CatalogoSection } from '../components/organisms/CatalogoSection';
import { GlobalFooter } from '../components/organisms/GlobalFooter';
import { CardAnuncio } from '../components/molecules/CardAnuncio';
import { Editorial } from '../components/atoms/Editorial';
import { Button } from '../components/atoms/Button';
import { useAnunciosStore } from '../store/anunciosStore';

const VOLUME_LABEL = 'Volume Um · Maio 2026';

function formatRelativeDate(iso: string): string {
  const created = new Date(iso);
  const diffMs = Date.now() - created.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'há instantes';
  if (diffMin < 60) return `há ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH} ${diffH === 1 ? 'hora' : 'horas'}`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `há ${diffD} ${diffD === 1 ? 'dia' : 'dias'}`;
  return created.toLocaleDateString('pt-BR');
}

export function AtelierPage() {
  const navigate = useNavigate();
  const { anuncios } = useAnunciosStore();
  const isEmpty = anuncios.length === 0;

  // Stats reais — sem números inventados.
  const totalKeywords = anuncios.reduce((sum, a) => sum + (a.results.keywords?.total ?? 0), 0);
  const totalBriefings = anuncios.reduce((sum, a) => sum + (a.results.briefings?.length ?? 0), 0);

  const stats = [
    {
      label: 'Anúncios em curadoria',
      value: anuncios.length,
      delta: isEmpty
        ? 'comece pelo primeiro'
        : `${anuncios.length === 1 ? 'um' : anuncios.length} ${anuncios.length === 1 ? 'anúncio criado' : 'anúncios criados'}`,
    },
    {
      label: 'Palavras-chave geradas',
      value: totalKeywords,
      delta: isEmpty ? '—' : `média de ${Math.round(totalKeywords / anuncios.length)} por anúncio`,
    },
    {
      label: 'Briefings de imagem',
      value: totalBriefings,
      delta: isEmpty ? '—' : 'prontos para Imagen',
    },
  ];

  const ultimoAnuncio = anuncios[0];

  const cards = anuncios.slice(0, 6).map((a) => ({
    id: a.id,
    paletaCapa: 'mar' as const,
    capaLegenda: 'Anúncio Amalfi Creator',
    eyebrow: 'Curadoria · Casa',
    titulo: a.form.nomeProduto.split(' ').slice(0, 2).join(' '),
    tituloItalic: a.form.nomeProduto.split(' ').slice(2).join(' ') || 'criado.',
    sub: a.results.descricao.bulletPoints[0] ?? a.form.detalhesTecnicos.slice(0, 110),
    status: {
      label: a.status === 'em-revisao' ? 'Em revisão' : a.status,
      tone: 'mar' as const,
    },
    versao: `v${a.versao} · ${new Date(a.criadoEm).toLocaleDateString('pt-BR')}`,
  }));

  return (
    <div className="min-h-screen bg-osso">
      <Brandbar />

      <HeroEditorial
        eyebrow={VOLUME_LABEL}
        headline={{ topo: 'A vida boa', italic: 'cabe em pequenos gestos.' }}
        lede={
          isEmpty
            ? 'Aqui é onde a Amalfi & Co. começa cada anúncio. O atelier ainda está em branco — comece pelo essencial.'
            : `Hoje você tem ${anuncios.length} ${anuncios.length === 1 ? 'anúncio' : 'anúncios'} em curadoria. Comece pelo próximo.`
        }
        actions={
          <>
            <Button variant="terra" size="lg" onClick={() => navigate('/novo')}>
              Novo Anúncio
            </Button>
            {!isEmpty && (
              <Button variant="inverse-ghost" size="lg" onClick={() => navigate('/catalogo')}>
                Continuar curadoria
              </Button>
            )}
          </>
        }
        metaLabel="Sarah Mendes"
        metaValue="Curadora · Fundadora"
        metaSubLabel={ultimoAnuncio ? 'Última edição' : 'Status'}
        metaSubValue={
          ultimoAnuncio
            ? `${formatRelativeDate(ultimoAnuncio.criadoEm)} — ${ultimoAnuncio.form.nomeProduto}`
            : 'atelier vazio'
        }
      />

      <StatsRow stats={stats} />

      {isEmpty ? (
        <section className="bg-osso px-12 py-section-xl">
          <header className="flex justify-between items-end mb-section-lg pb-8 border-b border-tinta-15">
            <div>
              <span className="font-ui text-[11px] uppercase tracking-widest opacity-60">
                A Coleção · 2026 · Casa & Decoração
              </span>
              <h2 className="font-display text-[56px] leading-none mt-4">
                Coleção <em className="font-editorial italic font-regular">por vir</em>.
              </h2>
            </div>
          </header>
          <div className="text-center py-16 max-w-2xl mx-auto">
            <Editorial size="l" className="opacity-75 leading-snug mb-8">
              Quando você criar o primeiro anúncio, ele aparece aqui. Cada um curado com tempo,
              fotografado com luz natural, escrito sem pressa.
            </Editorial>
            <Button variant="primary" size="lg" onClick={() => navigate('/novo')}>
              Criar o primeiro
            </Button>
          </div>
        </section>
      ) : (
        <CatalogoSection
          eyebrow={`A Coleção · ${anuncios.length} ${anuncios.length === 1 ? 'item' : 'itens'} em curadoria`}
          titulo="Coleção"
          tituloItalic="atual"
          cta={{ label: 'Ver todos', onClick: () => navigate('/catalogo') }}
        >
          {cards.map((c) => (
            <CardAnuncio
              key={c.id}
              paletaCapa={c.paletaCapa}
              capaLegenda={c.capaLegenda}
              eyebrow={c.eyebrow}
              titulo={c.titulo}
              tituloItalic={c.tituloItalic}
              sub={c.sub}
              status={c.status}
              versao={c.versao}
              onClick={() => navigate('/catalogo')}
            />
          ))}
        </CatalogoSection>
      )}

      <GlobalFooter />
    </div>
  );
}
