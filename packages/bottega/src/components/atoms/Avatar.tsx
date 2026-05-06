import { cn } from '../../lib/utils/cn';

interface AvatarProps {
  initial: string;
  size?: number;
  className?: string;
}

/**
 * Avatar — círculo Tinta com inicial em DM Serif.
 * Default 36px (header).
 */
export function Avatar({ initial, size = 36, className }: AvatarProps) {
  return (
    <div
      className={cn('rounded-full bg-tinta text-osso flex items-center justify-center font-display', className)}
      style={{ width: size, height: size, fontSize: size * 0.45 }}
      aria-label={`Avatar de ${initial}`}
    >
      {initial.charAt(0).toUpperCase()}
    </div>
  );
}
