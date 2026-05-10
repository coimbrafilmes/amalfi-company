import { Link, useLocation } from 'react-router-dom';
import { Avatar } from '../atoms/Avatar';
import { Lockup } from '../molecules/Lockup';
import { cn } from '../../lib/utils/cn';

const navItems = [
  { to: '/atelier', label: 'Atelier' },
  { to: '/novo', label: 'Novo Anúncio' },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/configuracoes', label: 'Configurações' },
];

/** Brandbar — header sticky topo. */
export function Brandbar() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-osso border-b border-tinta-08 px-12 py-4 flex items-center justify-between">
      <Link to="/atelier" aria-label="AMALFI CREATOR home">
        <Lockup variant="brandbar" />
      </Link>
      <nav className="flex items-center gap-9">
        {navItems.map((item) => {
          const active = pathname === item.to || (item.to === '/atelier' && pathname === '/');
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'relative font-ui text-[11px] font-medium uppercase tracking-[0.16em] transition-opacity duration-fast pb-1',
                active ? 'opacity-100' : 'opacity-65 hover:opacity-100',
              )}
            >
              {item.label}
              {active && <span className="absolute -bottom-[22px] left-0 right-0 h-0.5 bg-terracota" />}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center gap-4">
        <Avatar initial="S" />
      </div>
    </header>
  );
}
