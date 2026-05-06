import { MonogramaA } from '../molecules/MonogramaA';
import { Lockup } from '../molecules/Lockup';

/** GlobalFooter — encerramento editorial. */
export function GlobalFooter() {
  return (
    <footer className="bg-osso border-t border-tinta-15 px-12 py-section-lg grid grid-cols-3 gap-12 items-start">
      <div>
        <Lockup variant="footer" />
        <p className="font-ui text-xs leading-loose mt-6 opacity-65 max-w-[280px]">
          Atelier digital de criação de anúncios. Pequenos gestos que cabem na vida boa.
        </p>
      </div>
      <div className="font-ui text-xs leading-loose opacity-65">
        <h4 className="font-ui text-[11px] uppercase tracking-widest mb-4 opacity-100 font-medium">Plataforma</h4>
        Atelier<br />
        Novo Anúncio<br />
        Catálogo<br />
        Coleções de palavras<br />
        Briefings
      </div>
      <div className="flex items-start justify-end">
        <MonogramaA size={80} variant="terra" />
      </div>
    </footer>
  );
}
