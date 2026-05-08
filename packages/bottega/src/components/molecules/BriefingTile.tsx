import { cn } from '../../lib/utils/cn';

interface BriefingTileProps {
  numero: number;
  titulo: string;
  tag: string;
  paleta?: 'areia' | 'mar' | 'ceu' | 'terracota' | 'ocre' | 'osso-outline';
  imageBase64?: string;
  failed?: boolean;
  /** "square" pra anúncio (1:1), "landscape" pra A+ (970×600 ~ 4:3) */
  aspect?: 'square' | 'landscape';
  className?: string;
}

/**
 * BriefingTile — célula da grid de briefings.
 * Imagem fica num quadro limpo (sem overlay textual sobreposto), legenda abaixo.
 * Variants: square (1:1) pra anúncio, landscape (970×600 → ~4:3) pra A+.
 */
export function BriefingTile({
  numero,
  titulo,
  tag,
  paleta = 'mar',
  imageBase64,
  failed,
  aspect = 'square',
  className,
}: BriefingTileProps) {
  const placeholderClass = {
    areia: 'bg-areia text-tinta',
    mar: 'bg-mar text-osso',
    ceu: 'bg-ceu text-tinta',
    terracota: 'bg-terracota text-osso',
    ocre: 'bg-ocre text-tinta',
    'osso-outline': 'bg-osso/[0.08] text-osso border border-osso-15',
  }[paleta];

  const aspectClass = aspect === 'landscape' ? 'aspect-[970/600]' : 'aspect-square';

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Quadro da imagem — sem overlay textual sobreposto */}
      <div className={cn(aspectClass, 'relative overflow-hidden', !imageBase64 && placeholderClass)}>
        {imageBase64 ? (
          <img src={imageBase64} alt={titulo} className="w-full h-full object-cover" />
        ) : null}
        {failed && (
          <span className="absolute top-3 right-3 z-10 bg-terracota text-osso px-2 py-0.5 font-ui text-[9px] font-medium uppercase tracking-widest">
            falhou
          </span>
        )}
      </div>

      {/* Legenda abaixo da imagem */}
      <div className="px-1 space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-base opacity-70 tabular-nums">
            {String(numero).padStart(2, '0')}
          </span>
          <p className="font-editorial italic text-[15px] leading-snug flex-1 opacity-90">
            {titulo}
          </p>
        </div>
        <span className="block font-ui text-[9px] font-medium uppercase tracking-widest opacity-50">
          {tag}
        </span>
      </div>
    </div>
  );
}
