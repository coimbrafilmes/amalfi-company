import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '../../lib/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

/**
 * Input — campo de texto base.
 * Sem border-radius. Inter peso 300. Foco em borda Tinta.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({ invalid, className, ...rest }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full px-4 py-3.5 bg-osso text-tinta font-ui font-light text-[15px]',
        'border border-tinta-15 transition-colors duration-fast',
        'focus:border-tinta focus:outline-none',
        'placeholder:text-tinta-50',
        invalid && 'border-terracota',
        className,
      )}
      {...rest}
    />
  );
});
Input.displayName = 'Input';
