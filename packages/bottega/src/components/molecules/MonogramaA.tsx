import { cn } from '../../lib/utils/cn';

interface MonogramaAProps {
  size?: number;
  variant?: 'terra' | 'tinta' | 'osso-on-tinta';
  className?: string;
}

/**
 * MonogramaA — selo redondo "A · co. ·" do brandbook.
 * Default Terracota com Osso (lacre/embalagem premium).
 */
export function MonogramaA({ size = 80, variant = 'terra', className }: MonogramaAProps) {
  const variantClass = {
    terra: 'bg-terracota text-osso',
    tinta: 'bg-tinta text-osso',
    'osso-on-tinta': 'bg-osso text-tinta',
  }[variant];

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center flex-col leading-none',
        variantClass,
        className,
      )}
      style={{ width: size, height: size }}
      aria-label="Amalfi & Co. monograma"
    >
      <span className="font-display" style={{ fontSize: size * 0.42 }}>
        A
      </span>
      <span className="font-editorial italic opacity-85" style={{ fontSize: size * 0.14, marginTop: size * 0.04 }}>
        · co. ·
      </span>
    </div>
  );
}
