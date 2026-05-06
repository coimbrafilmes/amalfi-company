import { Badge } from '../atoms/Badge';
import { Dot } from '../atoms/Dot';
import { cn } from '../../lib/utils/cn';

interface CardAnuncioProps {
  paletaCapa: 'mar' | 'areia' | 'ceu' | 'terracota' | 'ocre' | 'osso';
  capaLegenda: string;
  badge?: string;
  eyebrow: string;
  titulo: string;
  tituloItalic?: string;        // parte italic da headline
  sub: string;
  status: { label: string; tone: 'mar' | 'terracota' };
  versao: string;
  onClick?: () => void;
  className?: string;
}

/**
 * CardAnuncio — card de anúncio no Atelier (catálogo).
 * Princípio brandbook: media bg paleta + body Osso + meta com Dot.
 * Hover: lift sutil, borda Tinta forte.
 */
export function CardAnuncio({
  paletaCapa,
  capaLegenda,
  badge,
  eyebrow,
  titulo,
  tituloItalic,
  sub,
  status,
  versao,
  onClick,
  className,
}: CardAnuncioProps) {
  const mediaClass = {
    mar: 'bg-mar text-osso',
    areia: 'bg-areia text-tinta-65',
    ceu: 'bg-ceu text-tinta-65',
    terracota: 'bg-terracota text-osso',
    ocre: 'bg-ocre text-tinta',
    osso: 'bg-osso text-tinta-65 border border-tinta-15',
  }[paletaCapa];

  const isLight = paletaCapa === 'areia' || paletaCapa === 'ceu' || paletaCapa === 'osso' || paletaCapa === 'ocre';

  return (
    <article
      onClick={onClick}
      className={cn(
        'bg-osso border border-tinta-15 hover:border-tinta hover:-translate-y-0.5 transition-all duration-base cursor-pointer flex flex-col',
        className,
      )}
    >
      <div className={cn('h-[200px] relative flex items-center justify-center overflow-hidden', mediaClass)}>
        <span className="font-ui text-[10px] font-medium uppercase tracking-widest opacity-65 px-4 text-center leading-tight">
          {capaLegenda}
        </span>
        {badge && (
          <Badge tone="terra" className="absolute top-3.5 left-3.5">
            {badge}
          </Badge>
        )}
      </div>
      <div className="px-7 pt-6 pb-7 flex-1 flex flex-col">
        <span className="font-ui text-[10px] font-medium uppercase tracking-widest opacity-55 mb-3">{eyebrow}</span>
        <h3 className="font-display text-2xl leading-tight mb-2 text-tinta">
          {titulo}
          {tituloItalic && (
            <>
              {' '}
              <em className="font-editorial italic font-regular">{tituloItalic}</em>
            </>
          )}
        </h3>
        <p className="font-editorial italic text-[15px] leading-snug text-tinta-65 mb-5 flex-1">{sub}</p>
        <div className="flex justify-between items-center pt-4 border-t border-tinta-08 font-ui text-[11px] text-tinta-65">
          <span className="inline-flex items-center gap-1.5">
            <Dot tone={status.tone} />
            {status.label}
          </span>
          <span>{versao}</span>
        </div>
        {/* isLight é visual hint pra QA — sem efeito */}
        <span className="hidden">{isLight ? 'light' : 'dark'}</span>
      </div>
    </article>
  );
}
