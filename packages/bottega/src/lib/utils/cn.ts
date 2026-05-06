import clsx from 'clsx';
import type { ClassValue } from 'clsx';

/** Util pra composição de classes Tailwind. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
