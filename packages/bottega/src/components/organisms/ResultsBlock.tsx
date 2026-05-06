import type { ReactNode } from 'react';
import { cn } from '../../lib/utils/cn';

interface ResultsBlockProps {
  eyebrow: string;
  headline: string;
  isFirst?: boolean;
  children: ReactNode;
  className?: string;
}

/** ResultsBlock — bloco interno de cada tab de resultados. */
export function ResultsBlock({ eyebrow, headline, isFirst = false, children, className }: ResultsBlockProps) {
  return (
    <div className={cn('py-8', !isFirst && 'border-t border-osso-15', className)}>
      <span className="block font-ui text-[11px] font-medium uppercase tracking-widest opacity-55 mb-4">
        {eyebrow}
      </span>
      <h3 className="font-display text-[28px] leading-tight mb-3 text-osso">{headline}</h3>
      <div className="font-ui font-light text-[15px] leading-loose opacity-85 max-w-[640px]">{children}</div>
    </div>
  );
}
