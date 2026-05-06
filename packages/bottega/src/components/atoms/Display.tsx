import type { HTMLAttributes, ReactNode, ElementType } from 'react';
import { cn } from '../../lib/utils/cn';

interface DisplayProps extends HTMLAttributes<HTMLElement> {
  size?: 'xl' | 'l' | 'm' | 's';
  as?: ElementType;
  children: ReactNode;
}

/**
 * Display — DM Serif Display (heavy serif).
 * Princípio brandbook: títulos, capas, headlines, logo.
 * Sempre combinar com Editorial italic em headlines de impacto.
 */
export function Display({ size = 'm', as, className, children, ...rest }: DisplayProps) {
  const Tag = (as ?? (size === 'xl' || size === 'l' ? 'h1' : 'h2')) as ElementType;
  const sizeClass = {
    xl: 'text-display-xl',
    l: 'text-display-l',
    m: 'text-display-m',
    s: 'text-display-s',
  }[size];

  return (
    <Tag className={cn('font-display font-regular', sizeClass, className)} {...rest}>
      {children}
    </Tag>
  );
}
