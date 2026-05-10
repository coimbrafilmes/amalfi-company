import { cn } from '../../lib/utils/cn';

interface LockupProps {
  variant?: 'brandbar' | 'footer' | 'inline';
  showBy?: boolean;
  className?: string;
}

/**
 * Lockup — AMALFI CREATOR by Amalfi Co.
 * Princípio brandbook: DM Serif "AMALFI CREATOR" (caixa-alta) + Cormorant italic "by Amalfi Co.".
 */
export function Lockup({ variant = 'brandbar', showBy = true, className }: LockupProps) {
  if (variant === 'footer') {
    return (
      <div className={cn('flex flex-col gap-1', className)}>
        <div className="font-display text-display-m leading-none text-tinta tracking-tight">
          AMALFI <em className="font-editorial italic font-regular text-display-s">CREATOR</em>
        </div>
        <div className="font-editorial italic text-xl text-tinta-65">
          by Amalfi Co.
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <span className={cn('font-display text-tinta tracking-tight', className)}>
        AMALFI CREATOR
        {showBy && <em className="font-editorial italic font-regular text-tinta-65 mx-1.5 text-[0.75em]">by</em>}
        <em className="font-editorial italic font-regular text-[0.85em]">Amalfi Co.</em>
      </span>
    );
  }

  // brandbar default
  return (
    <div className={cn('flex items-baseline gap-2', className)}>
      <span className="font-display text-[26px] leading-none text-tinta tracking-tight">AMALFI CREATOR</span>
      {showBy && <span className="font-editorial italic text-base text-tinta-65">by</span>}
      <span className="font-editorial italic text-lg text-tinta">Amalfi Co.</span>
    </div>
  );
}
