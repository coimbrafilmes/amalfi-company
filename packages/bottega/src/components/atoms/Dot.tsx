import { cn } from '../../lib/utils/cn';

interface DotProps {
  tone?: 'mar' | 'terracota' | 'tinta';
  className?: string;
}

/** Dot — pequeno indicador 6px (status). */
export function Dot({ tone = 'mar', className }: DotProps) {
  const toneClass = {
    mar: 'bg-mar',
    terracota: 'bg-terracota',
    tinta: 'bg-tinta',
  }[tone];
  return <span className={cn('inline-block w-1.5 h-1.5 rounded-full', toneClass, className)} aria-hidden />;
}
