import type { HTMLAttributes, ReactNode, ElementType } from 'react';
import { cn } from '../../lib/utils/cn';

interface EditorialProps extends HTMLAttributes<HTMLElement> {
  size?: 'xl' | 'l' | 'm';
  as?: ElementType;
  children: ReactNode;
}

/**
 * Editorial — Cormorant Garamond italic.
 * Princípio brandbook: subtítulos, citações, descrições poéticas.
 * NUNCA usar em texto longo (princípio página 11).
 */
export function Editorial({ size = 'l', as, className, children, ...rest }: EditorialProps) {
  const Tag = (as ?? 'p') as ElementType;
  const sizeClass = {
    xl: 'text-editorial-xl',
    l: 'text-editorial-l',
    m: 'text-editorial-m',
  }[size];

  return (
    <Tag className={cn('font-editorial italic font-regular', sizeClass, className)} {...rest}>
      {children}
    </Tag>
  );
}
