import * as Tabs from '@radix-ui/react-tabs';
import { cn } from '../../lib/utils/cn';

interface TabItemProps {
  value: string;
  num: string;       // "01", "02"...
  label: string;
  className?: string;
}

/**
 * TabItem — para Radix Tabs.
 * Princípio brandbook: num em Cormorant italic terracota, texto CAPS Inter.
 */
export function TabItem({ value, num, label, className }: TabItemProps) {
  return (
    <Tabs.Trigger
      value={value}
      className={cn(
        'group relative py-5 mr-9 font-ui font-medium uppercase tracking-widest text-button',
        'opacity-50 hover:opacity-80 transition-opacity duration-fast cursor-pointer whitespace-nowrap',
        'data-[state=active]:opacity-100',
        'after:content-[""] after:absolute after:bottom-[-1px] after:left-0 after:right-0',
        'after:h-0.5 after:bg-terracota after:opacity-0 data-[state=active]:after:opacity-100',
        className,
      )}
    >
      <span className="font-editorial italic font-regular text-xs text-terracota mr-1.5 normal-case tracking-normal opacity-85">
        {num}
      </span>
      {label}
    </Tabs.Trigger>
  );
}
