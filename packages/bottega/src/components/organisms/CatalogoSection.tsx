import type { ReactNode } from 'react';
import { Eyebrow } from '../atoms/Eyebrow';
import { Button } from '../atoms/Button';

interface CatalogoSectionProps {
  eyebrow: string;
  titulo: string;
  tituloItalic: string;
  cta: { label: string; onClick?: () => void };
  children: ReactNode;
}

/** CatalogoSection — wrapper editorial pra grid de cards. */
export function CatalogoSection({ eyebrow, titulo, tituloItalic, cta, children }: CatalogoSectionProps) {
  return (
    <section className="bg-osso px-12 py-section-xl">
      <header className="flex justify-between items-end mb-section-lg pb-8 border-b border-tinta-15">
        <div>
          <Eyebrow className="block">{eyebrow}</Eyebrow>
          <h2 className="font-display text-[56px] leading-none mt-4">
            {titulo} <em className="font-editorial italic font-regular">{tituloItalic}</em>.
          </h2>
        </div>
        <Button variant="ghost" size="sm" onClick={cta.onClick}>{cta.label}</Button>
      </header>
      <div className="grid grid-cols-3 gap-8">{children}</div>
    </section>
  );
}
