import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils/cn';

interface EyebrowProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'default' | 'inverse' | 'terra';
  children: ReactNode;
}

/**
 * Eyebrow — texto curto CAPS 11px com tracking generoso (0.18em).
 * Princípio brandbook: identifica seções, contextualiza headlines.
 */
export function Eyebrow({ tone = 'default', className, children, ...rest }: EyebrowProps) {
  const toneClass = {
    default: 'text-tinta-65',
    inverse: 'text-osso-65',
    terra: 'text-terracota',
  }[tone];

  return (
    <span
      className={cn(
        'font-ui text-eyebrow font-medium uppercase tracking-widest',
        toneClass,
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
