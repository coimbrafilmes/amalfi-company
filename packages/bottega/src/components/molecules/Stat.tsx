import { Eyebrow } from '../atoms/Eyebrow';
import { cn } from '../../lib/utils/cn';

interface StatProps {
  label: string;
  value: string | number;
  delta?: string;
  isFirst?: boolean;
  className?: string;
}

/** Stat — bloco numérico editorial. Linha vertical separadora à esquerda. */
export function Stat({ label, value, delta, isFirst = false, className }: StatProps) {
  return (
    <div className={cn(!isFirst && 'border-l border-tinta-15 pl-6', className)}>
      <Eyebrow className="block mb-4">{label}</Eyebrow>
      <div className="font-display text-[56px] leading-none mb-2 text-tinta">{value}</div>
      {delta && <div className="font-editorial italic text-base text-mar">{delta}</div>}
    </div>
  );
}
