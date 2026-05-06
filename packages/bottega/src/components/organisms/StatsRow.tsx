import { Stat } from '../molecules/Stat';

interface StatsRowProps {
  stats: { label: string; value: string | number; delta?: string }[];
}

/** StatsRow — bloco horizontal de stats (Areia bg combinação Presença). */
export function StatsRow({ stats }: StatsRowProps) {
  return (
    <section className="bg-areia px-12 py-section-lg grid gap-12" style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}>
      {stats.map((s, idx) => (
        <Stat key={s.label} {...s} isFirst={idx === 0} />
      ))}
    </section>
  );
}
