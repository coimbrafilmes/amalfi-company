import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils/cn';

interface KeywordChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent';
  children: string;
}

/**
 * KeywordChip — pílula CAPS-light com borda sutil.
 * Variant accent = borda Terracota (top keywords).
 * Em fundo escuro (Tinta), usa bg translúcido Osso.
 */
export function KeywordChip({ variant = 'default', className, children, ...rest }: KeywordChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-ui text-xs font-regular px-3.5 py-1.5 transition-colors',
        'border bg-osso/[0.04] text-osso/85',
        variant === 'accent' ? 'border-terracota text-terracota' : 'border-osso-15',
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
