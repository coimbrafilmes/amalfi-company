import type { ReactNode } from 'react';
import { Eyebrow } from '../atoms/Eyebrow';

interface HeroEditorialProps {
  eyebrow: string;
  metaLabel?: string;
  metaValue?: string;
  metaSubLabel?: string;
  metaSubValue?: string;
  headline: { topo: string; italic: string };
  lede: string;
  actions: ReactNode;
}

/**
 * HeroEditorial — bloco hero combinação Tinta + Osso.
 * Princípio brandbook: combinação SERENIDADE (editorial padrão).
 * Mancha aquarela Mar de fundo (assinatura visual).
 */
export function HeroEditorial({ eyebrow, metaLabel, metaValue, metaSubLabel, metaSubValue, headline, lede, actions }: HeroEditorialProps) {
  return (
    <section className="bg-tinta text-osso px-12 py-section-xl pb-section-lg relative overflow-hidden grid grid-cols-[1.4fr_1fr] gap-18 items-end">
      <div className="absolute -top-24 -right-32 w-[480px] h-[480px] aquarela-mar pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-3.5 mb-8">
          <span className="block w-8 h-px bg-terracota" />
          <Eyebrow tone="inverse">{eyebrow}</Eyebrow>
        </div>

        <h1 className="font-display text-[88px] leading-[1.02] tracking-tighter mb-6">
          {headline.topo}<br />
          <em className="font-editorial italic font-regular">{headline.italic}</em>
        </h1>

        <p className="font-editorial italic text-[22px] leading-snug max-w-[540px] opacity-85 mb-10">{lede}</p>

        <div className="flex gap-4 items-center flex-wrap">{actions}</div>
      </div>

      {(metaLabel || metaSubLabel) && (
        <div className="relative z-10 text-right font-ui text-[11px] uppercase tracking-widest opacity-55 leading-loose">
          {metaLabel && (
            <>
              {metaLabel}
              <strong className="block mt-1 font-editorial italic font-regular text-[14px] normal-case tracking-normal opacity-95">
                {metaValue}
              </strong>
            </>
          )}
          {metaSubLabel && (
            <>
              <br /><br />
              {metaSubLabel}
              <strong className="block mt-1 font-editorial italic font-regular text-[14px] normal-case tracking-normal opacity-95">
                {metaSubValue}
              </strong>
            </>
          )}
        </div>
      )}
    </section>
  );
}
