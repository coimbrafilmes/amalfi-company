import { cn } from '../../lib/utils/cn';

interface LockupProps {
  variant?: 'brandbar' | 'footer' | 'inline';
  showBy?: boolean;
  className?: string;
}

/**
 * Lockup — Bottega by Amalfi & Co.
 * Princípio brandbook: DM Serif "Amalfi" + Cormorant italic "& Co.".
 */
export function Lockup({ variant = 'brandbar', showBy = true, className }: LockupProps) {
  if (variant === 'footer') {
    return (
      <div className={cn('flex flex-col gap-1', className)}>
        <div className="font-display text-display-m leading-none text-tinta">
          Bottega <em className="font-editorial italic font-regular text-display-s">by</em>
        </div>
        <div className="font-display text-2xl text-tinta">
          Amalfi <em className="font-editorial italic font-regular text-xl">&amp; Co.</em>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <span className={cn('font-display text-tinta', className)}>
        Bottega
        {showBy && <em className="font-editorial italic font-regular text-tinta-65 mx-1.5 text-[0.75em]">by</em>}
        Amalfi <em className="font-editorial italic font-regular text-[0.85em]">&amp; Co.</em>
      </span>
    );
  }

  // brandbar default
  return (
    <div className={cn('flex items-baseline gap-2', className)}>
      <span className="font-display text-[28px] leading-none text-tinta tracking-tight">Bottega</span>
      {showBy && <span className="font-editorial italic text-base text-tinta-65">by</span>}
      <span className="font-display text-[22px] text-tinta">Amalfi</span>
      <span className="font-editorial italic text-lg text-tinta -ml-1">&amp; Co.</span>
    </div>
  );
}
