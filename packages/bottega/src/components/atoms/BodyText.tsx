import type { HTMLAttributes, ReactNode, ElementType } from 'react';
import { cn } from '../../lib/utils/cn';

interface BodyTextProps extends HTMLAttributes<HTMLElement> {
  size?: 'lg' | 'md';
  as?: ElementType;
  weight?: 'light' | 'regular' | 'medium';
  tone?: 'default' | 'secondary' | 'inverse' | 'inverse-secondary';
  children: ReactNode;
}

/**
 * BodyText — Inter (UI sans).
 * Princípio brandbook: peso 300 em texto corrido pra sensação arejada.
 */
export function BodyText({
  size = 'lg',
  as,
  weight = 'light',
  tone = 'default',
  className,
  children,
  ...rest
}: BodyTextProps) {
  const Tag = (as ?? 'p') as ElementType;
  const sizeClass = size === 'lg' ? 'text-body-lg' : 'text-body';
  const weightClass = { light: 'font-light', regular: 'font-regular', medium: 'font-medium' }[weight];
  const toneClass = {
    default: 'text-tinta',
    secondary: 'text-tinta-65',
    inverse: 'text-osso',
    'inverse-secondary': 'text-osso-65',
  }[tone];

  return (
    <Tag className={cn('font-ui leading-loose', sizeClass, weightClass, toneClass, className)} {...rest}>
      {children}
    </Tag>
  );
}
