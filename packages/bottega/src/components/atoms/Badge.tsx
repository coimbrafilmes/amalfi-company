import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils/cn';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'terra' | 'mar' | 'tinta' | 'ocre' | 'osso-outline';
  children: ReactNode;
}

/**
 * Badge — etiqueta CAPS pequena (status, "Novo", "v1").
 * Sem border-radius, micro-padding.
 */
export function Badge({ tone = 'terra', className, children, ...rest }: BadgeProps) {
  const toneClass = {
    terra: 'bg-terracota text-osso',
    mar: 'bg-mar text-osso',
    tinta: 'bg-tinta text-osso',
    ocre: 'bg-ocre text-tinta',
    'osso-outline': 'bg-transparent border border-osso-15 text-osso-80',
  }[tone];

  return (
    <span
      className={cn(
        'inline-flex items-center font-ui font-medium uppercase tracking-widest text-[9px] px-2.5 py-1',
        toneClass,
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
