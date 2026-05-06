import * as Tabs from '@radix-ui/react-tabs';
import { TabItem } from '../molecules/TabItem';
import { ResultsBlock } from './ResultsBlock';
import { KeywordChip } from '../molecules/KeywordChip';
import { TituloListItem } from '../molecules/TituloListItem';
import { BriefingTile } from '../molecules/BriefingTile';
import { Button } from '../atoms/Button';
import type { CriacaoResults, ImagemGerada, BriefingImagem } from '../../types/anuncio';

interface ResultsTabsProps {
  results: CriacaoResults | null;
  isLoading: boolean;
  loadingMessage?: string;
}

const PALETAS_PALETA: Array<BriefingImagem['paletaCor']> = ['areia', 'mar', 'ceu', 'terracota', 'ocre', 'osso-outline'];

function paletaPraTile(idx: number, paletaCor?: BriefingImagem['paletaCor']) {
  return (paletaCor ?? PALETAS_PALETA[idx % PALETAS_PALETA.length]) as
    | 'areia' | 'mar' | 'ceu' | 'terracota' | 'ocre' | 'osso-outline';
}

function imageBase64For(imagens: ImagemGerada[] | undefined, n: number) {
  return imagens?.find((i) => i.briefingNumero === n)?.base64;
}

/** ResultsTabs — coluna direita Tinta com 5 tabs. */
export function ResultsTabs({ results, isLoading, loadingMessage }: ResultsTabsProps) {
  if (isLoading) {
    return (
      <div className="bg-tinta text-osso flex flex-col items-center justify-center min-h-[800px] px-12 py-section-lg text-center gap-6">
        <div className="w-10 h-10 border-2 border-terracota border-t-transparent rounded-full animate-spin" />
        <p className="font-editorial italic text-[22px] max-w-md leading-snug">
          {loadingMessage ?? 'Compondo o anúncio com calma e precisão…'}
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

          <ResultsBlock eyebrow="Descrição corrida" headline="Texto-base">
            <p className="whitespace-pre-line">{results.descricao.description}</p>
          </ResultsBlock>

          <ResultsBlock eyebrow="HTML A+" headline="Pronto pra colar">
            <div
              className="prose-osso text-osso/85"
              dangerouslySetInnerHTML={{ __html: results.descricao.descriptionHTML }}
            />
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

        {/* TAB 05 — BRIEFINGS */}
        <Tabs.Content value="briefings" className="px-12 py-14 max-w-[1080px]">
          <div className="flex items-center gap-3.5 mb-6">
            <span className="block w-8 h-px bg-terracota" />
            <span className="font-ui text-[11px] uppercase tracking-widest opacity-60">A imagem como linguagem</span>
          </div>
          <h2 className="font-display text-[52px] leading-tight mb-4">
            Da capa ao <em className="font-editorial italic font-regular">detalhe.</em>
          </h2>
          <p className="font-editorial italic text-[22px] leading-snug opacity-85 mb-12">
            {results.briefings.length} cenas que conduzem a leitura — gancho, dor, prova, decisão.
          </p>

          <div className="grid grid-cols-3 gap-4">
            {results.briefings.map((b, idx) => (
              <BriefingTile
                key={b.numero}
                numero={b.numero}
                titulo={b.titulo}
                tag={b.estagio}
                paleta={paletaPraTile(idx, b.paletaCor)}
                imageBase64={imageBase64For(results.imagens, b.numero)}
              />
            ))}
          </div>

          {results.imagens && (
            <p className="mt-10 font-editorial italic text-base opacity-75">
              {results.imagens.length} imagens renderizadas em modo {results.modoGeracao}.
            </p>
          )}
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
