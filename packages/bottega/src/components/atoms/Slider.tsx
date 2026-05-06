import * as RadixSlider from '@radix-ui/react-slider';
import { cn } from '../../lib/utils/cn';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  className?: string;
}

/**
 * Slider — track Mar, fill Mar, handle Terracota com borda Osso.
 * Princípio brandbook: cores oficiais, sem rounded em track.
 */
export function Slider({ value, min, max, step = 1, onChange, className }: SliderProps) {
  return (
    <RadixSlider.Root
      className={cn('relative flex items-center w-full h-4 select-none touch-none', className)}
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={(v) => onChange(v[0])}
    >
      <RadixSlider.Track className="relative grow h-px bg-tinta-15">
        <RadixSlider.Range className="absolute h-full bg-mar" />
      </RadixSlider.Track>
      <RadixSlider.Thumb
        className="block w-4 h-4 rounded-full bg-terracota border-2 border-osso shadow-[0_0_0_1px_rgba(31,42,58,0.15)] focus:outline-none focus:ring-2 focus:ring-mar"
        aria-label="Quantidade"
      />
    </RadixSlider.Root>
  );
}
