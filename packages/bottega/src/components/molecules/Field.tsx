import type { ReactNode } from 'react';
import { Eyebrow } from '../atoms/Eyebrow';
import { cn } from '../../lib/utils/cn';

interface FieldProps {
  label: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Field — wrapper com Label CAPS + input + hint italic.
 * Princípio brandbook: hint sempre Cormorant italic.
 */
export function Field({ label, hint, optional, children, className }: FieldProps) {
  return (
    <div className={cn('mb-7', className)}>
      <label className="block mb-2.5">
        <Eyebrow>
          {label}
          {optional && <span className="ml-1.5 normal-case tracking-normal opacity-60 font-light">(opcional)</span>}
        </Eyebrow>
      </label>
      {children}
      {hint && <span className="block font-editorial italic text-[13px] text-tinta-50 mt-1.5">{hint}</span>}
    </div>
  );
}
