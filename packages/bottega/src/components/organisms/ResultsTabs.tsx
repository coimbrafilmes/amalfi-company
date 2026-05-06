import * as Tabs from '@radix-ui/react-tabs';
import { TabItem } from '../molecules/TabItem';
import { ResultsBlock } from './ResultsBlock';
import { KeywordChip } from '../molecules/KeywordChip';
import { TituloListItem } from '../molecules/TituloListItem';
import { BriefingTile } from '../molecules/BriefingTile';
import { Button } from '../atoms/Button';
import type { CriacaoResults, ImagemGerada, BriefingImagem, VarianteImagem } from '../../types/anuncio';

interface ResultsTabsProps {
  results: CriacaoResults | null;
  isLoading: boolean;
  loadingMessage?: string;
  loadingStep?: string;
  loadingProgress?: { current: number; total: number } | null;
  /** Set de "variante:numero" das imagens em regenerate */
  regenerating?: Set<string>;
  /** Callback de regenerate */
  onRegenerate?: (briefingNumero: number, variante: VarianteImagem) => void;
}

const PALETAS_PALETA: Array<BriefingImagem['paletaCor']> = ['areia', 'mar', 'ceu', 'terracota', 'ocre', 'osso-outline'];

function paletaPraTile(idx: number, paletaCor?: BriefingImagem['paletaCor']) {
  return (paletaCor ?? PALETAS_PALETA[idx % PALETAS_PALETA.length]) as
    | 'areia' | 'mar' | 'ceu' | 'terracota' | 'ocre' | 'osso-outline';
}

function imageInfoFor(imagens: ImagemGerada[] | undefined, n: number, variante: VarianteImagem) {
  const img = imagens?.find((i) => i.briefingNumero === n && i.variante === variante);
  return {
    base64: img?.base64,
    failed: img?.falhou ?? false,
    regenerated: !!img?.regeneradaEm,
  };
}

/** ResultsTabs — coluna direita Tinta com 5 tabs. */
export function ResultsTabs({
  results,
  isLoading,
  loadingMessage,
  loadingStep,
  loadingProgress,
  regenerating,
  onRegenerate,
}: ResultsTabsProps) {
  if (isLoading) {
    const progressLabel = loadingProgress
      ? ` · ${loadingProgress.current}/${loadingProgress.total}`
      : '';
    return (
      <div className="bg-tinta text-osso flex flex-col items-center justify-center min-h-[800px] px-12 py-section-lg text-center gap-6">
        <div className="w-10 h-10 border-2 border-terracota border-t-transparent rounded-full animate-spin" />
        {loadingStep && (
          <span className="font-ui text-[11px] uppercase tracking-widest opacity-65">
            {loadingStep}{progressLabel}
          </span>
        )}
        <p className="font-editorial italic text-[22px] max-w-md leading-snug">
          {loadingMessage ?? 'Compondo o anúncio com calma e precisão…'}
        </p>
        <p className="font-editorial italic text-[13px] opacity-50 max-w-md leading-snug">
          Geração via Background Function · pode levar 1-3 minutos.
        </p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="bg-tinta text-osso flex flex-col items-center justify-center min-h-[800px] px-12 py-section-lg text-center gap-4">
        <span className="font-ui text-[11px] uppercase tracking-widest opacity-50">aguardando</span>
        <p className="font-editorial italic text-[28px] max-w-md leading-snug opacity-90">
          A página direita preenche-se quando o produto for criado.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-tinta text-osso">
      <Tabs.Root defaultValue="analise">
        <Tabs.List className="flex items-center border-b border-osso-15 px-12 overflow-x-auto">
          <TabItem value="analise" num="01" label="Análise de mercado" />
          <TabItem value="keywords" num="02" label="Palavras-chave" />
          <TabItem value="titulos" num="03" label="Títulos" />
          <TabItem value="descricao" num="04" label="Descrição & Bullets" />
          <TabItem value="briefings" num="05" label="Briefings de Imagem" />
        </Tabs.List>

        {/* TAB 01 — ANÁLISE */}
        <Tabs.Content value="analise" className="px-12 py-14 max-w-[760px]">
          <div className="flex items-center gap-3.5 mb-6">
            <span className="block w-8 h-px bg-terracota" />
            <span className="font-ui text-[11px] uppercase tracking-widest opacity-60">A leitura do mercado</span>
          </div>
          <h2 className="font-display text-[52px] leading-tight mb-4">
            Quem compra <em className="font-editorial italic font-regular">e por quê.</em>
          </h2>
          <p className="font-editorial italic text-[22px] leading-snug opacity-85 mb-12">
            Antes de escrever, observamos. Quem está procurando este produto, em que momento, com que palavras.
          </p>

          <ResultsBlock isFirst eyebrow="Persona dominante" headline={results.analise.persona.label}>
            <p>{results.analise.persona.descricao}</p>
            <p className="mt-3 opacity-70">{results.analise.persona.perfilDemografico}</p>
          </ResultsBlock>

          {results.analise.dores.map((dor, idx) => (
            <ResultsBlock key={idx} eyebrow={`Dor ${idx + 1}`} headline={dor.titulo}>
              <p>{dor.descricao}</p>
            </ResultsBlock>
          ))}

          <ResultsBlock eyebrow="Motivações" headline="O que faz ela apertar comprar">
            <ul className="list-none space-y-2">
              {results.analise.motivacoes.map((m, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-editorial italic text-terracota">·</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </ResultsBlock>
        </Tabs.Content>

        {/* TAB 02 — KEYWORDS */}
        <Tabs.Content value="keywords" className="px-12 py-14 max-w-[760px]">
          <div className="flex items-center gap-3.5 mb-6">
            <span className="block w-8 h-px bg-terracota" />
            <span className="font-ui text-[11px] uppercase tracking-widest opacity-60">Palavras que ressoam</span>
          </div>
          <h2 className="font-display text-[52px] leading-tight mb-4">
            {results.keywords.total} termos <em className="font-editorial italic font-regular">selecionados.</em>
          </h2>
          <p className="font-editorial italic text-[22px] leading-snug opacity-85 mb-12">
            Mineradas com cuidado das buscas reais do consumidor brasileiro.
          </p>

          <ResultsBlock isFirst eyebrow="Top destaque" headline="Para a campanha principal">
            <div className="flex flex-wrap gap-2 mt-4">
              {results.keywords.destaque.map((k) => (
                <KeywordChip key={k} variant="accent">{k}</KeywordChip>
              ))}
            </div>
          </ResultsBlock>

          {results.keywords.grupos.map((grupo) => (
            <ResultsBlock key={grupo.categoria} eyebrow={grupo.categoria} headline={`${grupo.termos.length} termos`}>
              <div className="flex flex-wrap gap-2 mt-4">
                {grupo.termos.map((t) => (
                  <KeywordChip key={t}>{t}</KeywordChip>
                ))}
              </div>
            </ResultsBlock>
          ))}
        </Tabs.Content>

        {/* TAB 03 — TÍTULOS */}
        <Tabs.Content value="titulos" className="px-12 py-14 max-w-[760px]">
          <div className="flex items-center gap-3.5 mb-6">
            <span className="block w-8 h-px bg-terracota" />
            <span className="font-ui text-[11px] uppercase tracking-widest opacity-60">Dez chamadas, dez ângulos</span>
          </div>
          <h2 className="font-display text-[52px] leading-tight mb-4">
            Começar pelo <em className="font-editorial italic font-regular">nome.</em>
          </h2>
          <p className="font-editorial italic text-[22px] leading-snug opacity-85 mb-12">
            Cinco focados no produto, cinco focados na dor. Escolha o que traduz a peça.
          </p>

          <ResultsBlock isFirst eyebrow="Foco · Produto" headline="Cinco títulos">
            <ol className="list-none p-0 mt-4">
              {results.titulos.produto.map((t, i) => (
                <TituloListItem
                  key={i}
                  numeral={`${['i', 'ii', 'iii', 'iv', 'v'][i] ?? `${i + 1}`}.`}
                  texto={t.texto}
                  charsAtuais={t.caracteres}
                  isFirst={i === 0}
                />
              ))}
            </ol>
          </ResultsBlock>

          <ResultsBlock eyebrow="Foco · Dor" headline="Cinco títulos">
            <ol className="list-none p-0 mt-4">
              {results.titulos.dor.map((t, i) => (
                <TituloListItem
                  key={i}
                  numeral={`${['i', 'ii', 'iii', 'iv', 'v'][i] ?? `${i + 1}`}.`}
                  texto={t.texto}
                  charsAtuais={t.caracteres}
                  isFirst={i === 0}
                />
              ))}
            </ol>
          </ResultsBlock>
        </Tabs.Content>

        {/* TAB 04 — DESCRIÇÃO */}
        <Tabs.Content value="descricao" className="px-12 py-14 max-w-[760px]">
          <div className="flex items-center gap-3.5 mb-6">
            <span className="block w-8 h-px bg-terracota" />
            <span className="font-ui text-[11px] uppercase tracking-widest opacity-60">A página inteira</span>
          </div>
          <h2 className="font-display text-[52px] leading-tight mb-4">
            Descrição, bullets e <em className="font-editorial italic font-regular">FAQ.</em>
          </h2>

          <ResultsBlock isFirst eyebrow="Bullets Amazon · 5" headline="Para o campo de bullets oficiais">
            <ul className="list-none p-0 space-y-3 mt-2">
              {results.descricao.amazonBulletPoints.map((b, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-editorial italic text-terracota">{i + 1}.</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </ResultsBlock>

          <ResultsBlock eyebrow="Descrição · plain text Amazon" headline="Pronto pra colar no Seller Central">
            <p className="whitespace-pre-line">{results.descricao.description}</p>
            <p className="mt-4 font-editorial italic text-sm opacity-60">
              Amazon depreciou HTML em descriptions desde julho/2021 — texto plain com quebras de parágrafo
              é o formato aceito hoje.
            </p>
          </ResultsBlock>

          <ResultsBlock eyebrow="FAQ" headline={`${results.descricao.faq.length} perguntas frequentes`}>
            <dl className="space-y-5 mt-2">
              {results.descricao.faq.map((q, i) => (
                <div key={i}>
                  <dt className="font-display text-lg leading-tight">{q.pergunta}</dt>
                  <dd className="mt-1 opacity-80">{q.resposta}</dd>
                </div>
              ))}
            </dl>
          </ResultsBlock>
        </Tabs.Content>

        {/* TAB 05 — BRIEFINGS (com 2 sub-abas: Anúncio + A+ Content) */}
        <Tabs.Content value="briefings" className="px-12 py-14 max-w-[1280px]">
          <div className="flex items-center gap-3.5 mb-6">
            <span className="block w-8 h-px bg-terracota" />
            <span className="font-ui text-[11px] uppercase tracking-widest opacity-60">A imagem como linguagem</span>
          </div>
          <h2 className="font-display text-[52px] leading-tight mb-4">
            Da capa ao <em className="font-editorial italic font-regular">detalhe.</em>
          </h2>
          <p className="font-editorial italic text-[22px] leading-snug opacity-85 mb-10">
            Imagens em duas categorias: anúncio principal (1024×1024) e Conteúdo A+ (970×600).
          </p>

          <Tabs.Root defaultValue="aba-anuncio">
            <Tabs.List className="flex items-center gap-2 mb-8 border-b border-osso-15 pb-3">
              <Tabs.Trigger
                value="aba-anuncio"
                className="font-ui text-[11px] uppercase tracking-widest px-4 py-2 data-[state=active]:bg-osso data-[state=active]:text-tinta data-[state=inactive]:opacity-60 transition-colors"
              >
                Anúncio · 1024×1024 · {results.briefings.length}
              </Tabs.Trigger>
              <Tabs.Trigger
                value="aba-aplus"
                className="font-ui text-[11px] uppercase tracking-widest px-4 py-2 data-[state=active]:bg-osso data-[state=active]:text-tinta data-[state=inactive]:opacity-60 transition-colors"
              >
                Conteúdo A+ · 970×600 · {results.briefingsAPlus?.length ?? 0}
              </Tabs.Trigger>
            </Tabs.List>

            {/* Sub-aba Anúncio */}
            <Tabs.Content value="aba-anuncio">
              <div className="grid grid-cols-3 gap-4">
                {results.briefings.map((b, idx) => {
                  const info = imageInfoFor(results.imagens, b.numero, 'anuncio');
                  const isRegen = regenerating?.has(`anuncio:${b.numero}`) ?? false;
                  return (
                    <BriefingTile
                      key={`anuncio-${b.numero}`}
                      numero={b.numero}
                      titulo={b.titulo}
                      tag={b.estagio}
                      paleta={paletaPraTile(idx, b.paletaCor)}
                      imageBase64={info.base64}
                      failed={info.failed}
                      regenerated={info.regenerated}
                      regenerating={isRegen}
                      onRegenerate={
                        onRegenerate ? () => onRegenerate(b.numero, 'anuncio') : undefined
                      }
                    />
                  );
                })}
              </div>
              {results.imagens && (() => {
                const list = results.imagens.filter((i) => i.variante === 'anuncio');
                const ok = list.filter((i) => !i.falhou && i.base64).length;
                return (
                  <p className="mt-8 font-editorial italic text-base opacity-75">
                    {ok} de {list.length} imagens · modo {results.modoGeracao}
                  </p>
                );
              })()}
            </Tabs.Content>

            {/* Sub-aba A+ */}
            <Tabs.Content value="aba-aplus">
              {results.briefingsAPlus && results.briefingsAPlus.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {results.briefingsAPlus.map((b, idx) => {
                      const info = imageInfoFor(results.imagens, b.numero, 'aplus');
                      const isRegen = regenerating?.has(`aplus:${b.numero}`) ?? false;
                      return (
                        <BriefingTile
                          key={`aplus-${b.numero}`}
                          numero={b.numero}
                          titulo={b.titulo}
                          tag={b.estagio.replace('aplus-', '')}
                          paleta={paletaPraTile(idx, b.paletaCor)}
                          imageBase64={info.base64}
                          failed={info.failed}
                          regenerated={info.regenerated}
                          regenerating={isRegen}
                          aspect="landscape"
                          onRegenerate={
                            onRegenerate ? () => onRegenerate(b.numero, 'aplus') : undefined
                          }
                        />
                      );
                    })}
                  </div>
                  {results.imagens && (() => {
                    const list = results.imagens.filter((i) => i.variante === 'aplus');
                    const ok = list.filter((i) => !i.falhou && i.base64).length;
                    return (
                      <p className="mt-8 font-editorial italic text-base opacity-75">
                        {ok} de {list.length} imagens A+ · 970×600 px · prontas pro Brand Story
                      </p>
                    );
                  })()}
                </>
              ) : (
                <p className="font-editorial italic text-lg opacity-60">
                  Anúncio antigo · não tem A+ Content. Gere um novo pra ter as 6 imagens A+.
                </p>
              )}
            </Tabs.Content>
          </Tabs.Root>
        </Tabs.Content>
      </Tabs.Root>

      {/* Footer da tela de criação */}
      <div className="bg-tinta px-12 py-6 border-t border-osso-15 flex items-center justify-between">
        <span className="font-ui text-[11px] uppercase tracking-widest opacity-55">
          v1 · gerado {new Date(results.geradoEm).toLocaleString('pt-BR')} · modo {results.modoGeracao}
        </span>
        <span className="font-editorial italic text-[14px] opacity-70 hidden md:block">
          "A gente fala como quem oferece café num fim de tarde."
        </span>
        <div className="flex gap-2">
          <Button variant="inverse" size="sm">Exportar PDF</Button>
          <Button variant="inverse-ghost" size="sm">Aprovar &amp; arquivar</Button>
        </div>
      </div>
    </div>
  );
}
