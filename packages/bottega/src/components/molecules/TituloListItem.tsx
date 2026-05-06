import { cn } from '../../lib/utils/cn';

interface TituloListItemProps {
  numeral: string;       // "i.", "ii.", "iii."...
  texto: string;
  charsAtuais: number;
  charsMaximo?: number;
  isFirst?: boolean;
  className?: string;
}

/** Lista de títulos gerados — numeral italic + texto display. */
export function TituloListItem({
  numeral,
  texto,
  charsAtuais,
  charsMaximo = 200,
  isFirst = false,
  className,
}: TituloListItemProps) {
  return (
    <li
      className={cn(
        'py-3.5 flex gap-4 items-baseline',
        !isFirst && 'border-t border-osso-15',
        className,
      )}
    >
      <span className="font-editorial italic text-terracota w-6 flex-shrink-0 text-base">{numeral}</span>
      <span className="font-display text-[19px] leading-snug flex-1 text-osso">{texto}</span>
      <span className="font-ui text-[10px] font-regular uppercase tracking-wider opacity-50 whitespace-nowrap">
        {charsAtuais} / {charsMaximo}
      </span>
    </li>
  );
}
