import { useNavigate } from 'react-router-dom';
import { Brandbar } from '../components/organisms/Brandbar';
import { HeroEditorial } from '../components/organisms/HeroEditorial';
import { StatsRow } from '../components/organisms/StatsRow';
import { CatalogoSection } from '../components/organisms/CatalogoSection';
import { GlobalFooter } from '../components/organisms/GlobalFooter';
import { CardAnuncio } from '../components/molecules/CardAnuncio';
import { Button } from '../components/atoms/Button';
import { useAnunciosStore } from '../store/anunciosStore';

const sampleCards = [
  {
    id: 'sample-1',
    paletaCapa: 'mar' as const,
    capaLegenda: 'Lifestyle · Cozinha ao entardecer',
    badge: 'Novo',
    eyebrow: 'Material elétrico · Casa',
    titulo: 'Tomada 10A 250V',
    tituloItalic: 'branca, NBR 14136.',
    sub: 'Compatível com o padrão brasileiro. Encaixa em caixa 4x2. Pequenos gestos para uma casa que dura.',
    status: { label: 'Em revisão', tone: 'mar' as const },
    versao: 'v1 · 2026.05.06',
  },
  {
    id: 'sample-2',
    paletaCapa: 'areia' as const,
    capaLegenda: 'Still · Vista frontal',
    eyebrow: 'Têxtil · Quarto',
    titulo: 'Jogo de lençóis',
    tituloItalic: 'linho lavado.',
    sub: 'Dois corpos. Cor aveia. Linho italiano. Para os meses quentes — e para os frios também.',
    status: { label: 'Publicado', tone: 'mar' as const },
    versao: 'v3 · 2026.04.21',
  },
  {
    id: 'sample-3',
    paletaCapa: 'ceu' as const,
    capaLegenda: 'Detalhe · Textura',
    eyebrow: 'Cerâmica · Mesa',
    titulo: 'Jarra',
    tituloItalic: 'Vietri.',
    sub: 'Cerâmica trabalhada à mão. 1,8 litros. Acabamento natural — escolhido em uma feira em Vietri sul Mare.',
    status: { label: 'Rascunho', tone: 'terracota' as const },
    versao: 'v1 · 2026.05.04',
  },
];

export function AtelierPage() {
  const navigate = useNavigate();
  const { anuncios } = useAnunciosStore();

  const stats = [
    {
      label: 'Anúncios ativos',
      value: anuncios.length || 12,
      delta: anuncios.length ? `${anuncios.length} no catálogo local` : 'três aguardando aprovação',
    },
    { label: 'Palavras-chave geradas', value: 487, delta: 'média de 41 por anúncio' },
    { label: 'Briefings de imagem', value: 94, delta: 'prontos para Imagen' },
  ];

  // Combina anúncios persistidos com samples
  const cardsRender = anuncios.length > 0
    ? anuncios.slice(0, 6).map((a) => ({
        id: a.id,
        paletaCapa: 'mar' as const,
        capaLegenda: 'Anúncio recente',
        eyebrow: 'Catálogo Amalfi',
        titulo: a.form.nomeProduto.split(' ').slice(0, 2).join(' '),
        tituloItalic: a.form.nomeProduto.split(' ').slice(2).join(' ') || 'criado.',
        sub: a.results.descricao.bulletPoints[0] ?? a.form.detalhesTecnicos.slice(0, 100),
        status: { label: a.status === 'em-revisao' ? 'Em revisão' : a.status, tone: 'mar' as const },
        versao: `v${a.versao} · ${new Date(a.criadoEm).toLocaleDateString('pt-BR')}`,
      }))
    : sampleCards;

  return (
    <div className="min-h-screen bg-osso">
      <Brandbar />

      <HeroEditorial
        eyebrow="Volume Um · Maio 2026"
        headline={{ topo: 'A vida boa', italic: 'cabe em pequenos gestos.' }}
        lede={
          anuncios.length === 0
            ? 'Aqui é onde a Amalfi & Co. começa cada anúncio. Comece pelo essencial.'
            : `Hoje você tem ${anuncios.length} ${anuncios.length === 1 ? 'anúncio' : 'anúncios'} em curadoria. Comece pelo próximo.`
        }
        actions={
          <>
            <Button variant="terra" size="lg" onClick={() => navigate('/novo')}>
              Novo Anúncio
            </Button>
            <Button variant="inverse-ghost" size="lg">
              Continuar curadoria
            </Button>
          </>
        }
        metaLabel="Sarah Mendes"
        metaValue="Curadora · Fundadora"
        metaSubLabel="Última edição"
        metaSubValue={anuncios[0]
          ? `há instantes — ${anuncios[0].form.nomeProduto}`
          : 'há 3 horas — Tomada NBR 14136'}
      />

      <StatsRow stats={stats} />

      <CatalogoSection
        eyebrow="A Coleção · 2026 · Casa & Decoração"
        titulo="Coleção"
        tituloItalic="atual"
        cta={{ label: 'Ver todos' }}
      >
        {cardsRender.map((c) => (
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
            onClick={() => navigate('/novo')}
          />
        ))}
      </CatalogoSection>

      <GlobalFooter />
    </div>
  );
}
