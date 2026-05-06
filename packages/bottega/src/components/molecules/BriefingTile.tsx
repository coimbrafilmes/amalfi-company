import { cn } from '../../lib/utils/cn';

interface BriefingTileProps {
  numero: number;
  titulo: string;
  tag: string;
  paleta?: 'areia' | 'mar' | 'ceu' | 'terracota' | 'ocre' | 'osso-outline';
  imageBase64?: string;
  failed?: boolean;
  className?: string;
}

/**
 * BriefingTile — quadrado da grid de briefings.
 * Princípio brandbook: cores secundárias da paleta, texto editorial sobre fundo.
 * Se imageBase64, renderiza imagem (geração real); senão, placeholder editorial.
 */
export function BriefingTile({ numero, titulo, tag, paleta = 'mar', imageBase64, failed, className }: BriefingTileProps) {
  const paletaClass = {
    areia: 'bg-areia text-tinta',
    mar: 'bg-mar text-osso',
    ceu: 'bg-ceu text-tinta',
    terracota: 'bg-terracota text-osso',
    ocre: 'bg-ocre text-tinta',
    'osso-outline': 'bg-osso/[0.08] text-osso border border-osso-15',
  }[paleta];

  return (
    <div className={cn('aspect-square p-4 flex flex-col justify-between relative overflow-hidden', paletaClass, className)}>
      {imageBase64 ? (
        <img src={imageBase64} alt={titulo} className="absolute inset-0 w-full h-full object-cover" />
      ) : null}
      <div className="relative z-10 font-display text-base opacity-70">{String(numero).padStart(2, '0')}</div>
      <div className="relative z-10">
        <p className="font-editorial italic text-[17px] leading-snug">{titulo}</p>
      </div>
      <span className="absolute bottom-4 left-4 z-10 font-ui text-[9px] font-medium uppercase tracking-widest opacity-70">
        {tag}
      </span>
      {failed && (
        <span className="absolute top-3 right-3 z-10 bg-terracota text-osso px-2 py-0.5 font-ui text-[9px] font-medium uppercase tracking-widest">
          falhou
        </span>
      )}
    </div>
  );
}
