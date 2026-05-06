import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils/cn';

type ButtonVariant = 'primary' | 'ghost' | 'terra' | 'inverse' | 'inverse-ghost';
type ButtonSize = 'md' | 'sm' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
}

/**
 * Button — sempre CAPS Inter Medium 11px tracking 0.18em.
 * Princípio brandbook: 5 variantes cobrem 100% dos casos.
 * Sem border-radius (princípio editorial).
 */
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-ui font-medium uppercase tracking-widest transition-all duration-base border-thick disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClass = {
    primary: 'bg-tinta text-osso border-tinta hover:bg-mar hover:border-mar',
    ghost: 'bg-transparent text-tinta border-tinta hover:bg-tinta hover:text-osso',
    terra: 'bg-terracota text-osso border-terracota hover:bg-terracota-hover hover:border-terracota-hover',
    inverse: 'bg-osso text-tinta border-osso hover:bg-transparent hover:text-osso',
    'inverse-ghost': 'bg-transparent text-osso border-osso hover:bg-osso hover:text-tinta',
  }[variant];

  const sizeClass = {
    sm: 'px-4 py-2 text-[10px]',
    md: 'px-7 py-4 text-button',
    lg: 'px-9 py-5 text-button',
  }[size];

  return (
    <button
      type="button"
      className={cn(base, variantClass, sizeClass, fullWidth && 'w-full', className)}
      {...rest}
    >
      {children}
    </button>
  );
}
