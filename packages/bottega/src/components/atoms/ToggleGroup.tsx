import * as RadixToggle from '@radix-ui/react-toggle-group';
import { cn } from '../../lib/utils/cn';

interface ToggleOption<T extends string> {
  value: T;
  label: string;
}

interface ToggleGroupProps<T extends string> {
  value: T;
  options: ToggleOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}

/**
 * ToggleGroup — segmented control.
 * Princípio brandbook: CAPS Inter Medium 11px tracking 0.18em.
 * Active state = bg Tinta.
 */
export function ToggleGroup<T extends string>({ value, options, onChange, className }: ToggleGroupProps<T>) {
  return (
    <RadixToggle.Root
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v as T)}
      className={cn('grid border border-tinta-15 bg-osso', className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      {options.map((opt, idx) => (
        <RadixToggle.Item
          key={opt.value}
          value={opt.value}
          className={cn(
            'py-3.5 px-2 text-center font-ui text-button font-medium uppercase tracking-widest cursor-pointer transition-all duration-fast',
            'text-tinta-65 hover:text-tinta',
            'data-[state=on]:bg-tinta data-[state=on]:text-osso',
            idx > 0 && 'border-l border-tinta-15',
          )}
        >
          {opt.label}
        </RadixToggle.Item>
      ))}
    </RadixToggle.Root>
  );
}
