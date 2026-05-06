import type { TextareaHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '../../lib/utils/cn';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...rest }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full min-h-[110px] px-4 py-3.5 bg-osso text-tinta font-ui font-light text-[15px] leading-snug',
        'border border-tinta-15 transition-colors duration-fast resize-y',
        'focus:border-tinta focus:outline-none',
        'placeholder:text-tinta-50',
        className,
      )}
      {...rest}
    />
  );
});
Textarea.displayName = 'Textarea';
