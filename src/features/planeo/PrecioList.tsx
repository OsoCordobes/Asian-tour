import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Precio } from '@/types';
import { TRAMOS } from '@/data/itinerario';
import { formatEUR, formatFecha, formatMoney } from '@/lib/format';
import { useExperience } from '@/store/experience';
import { CUBIC } from '@/lib/motion';
import { nombreTramo } from '@/features/planeo/PrecioComposer';

interface Props {
  precios: Precio[];
}

const TRAMO_BY_ID = Object.fromEntries(TRAMOS.map((t) => [t.id, t]));

function nombreDeTramo(tramoId: string): string {
  const t = TRAMO_BY_ID[tramoId];
  return t ? nombreTramo(t) : tramoId;
}

/**
 * Precios agrupados por tramo. Dentro de cada grupo se muestran del más reciente
 * al más antiguo, cada uno con monto original, equivalente EUR, autor y fuente.
 */
export function PrecioList({ precios }: Props) {
  const reducedMotion = useExperience((s) => s.caps.reducedMotion);

  const grupos = useMemo(() => {
    const byTramo = new Map<string, Precio[]>();
    for (const p of precios) {
      const arr = byTramo.get(p.tramo_id) ?? [];
      arr.push(p);
      byTramo.set(p.tramo_id, arr);
    }
    return [...byTramo.entries()].map(([tramoId, items]) => ({
      tramoId,
      items: [...items].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    }));
  }, [precios]);

  if (precios.length === 0) {
    return (
      <div className="rounded-xl border border-white/5 bg-white/[0.02] px-5 py-8 text-center">
        <p className="font-display text-base text-white/70">Sin precios todavía.</p>
        <p className="mt-1 font-sans text-sm text-white/40">Cargá la primera cotización.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {grupos.map((g) => (
        <div key={g.tramoId}>
          <h4 className="mb-2 font-display text-sm text-white/80">{nombreDeTramo(g.tramoId)}</h4>
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {g.items.map((p, i) => (
                <motion.li
                  key={p.id}
                  layout={!reducedMotion}
                  initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reducedMotion ? 0.15 : 0.4, ease: CUBIC.land }}
                  className="rounded-xl bg-white/[0.03] px-4 py-2.5"
                  style={{ borderLeft: `3px solid ${p.autor_color}` }}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-base text-white tabular-nums">
                      {formatMoney(p.monto, p.moneda)}
                    </span>
                    <span className="neon-text font-sans text-sm tabular-nums">
                      {formatEUR(p.monto_eur)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 font-sans text-xs text-white/40">
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: p.autor_color }}
                    />
                    <span style={{ color: p.autor_color }}>{p.autor_nombre}</span>
                    {p.fuente && <span className="text-white/40">· {p.fuente}</span>}
                    <span className="ml-auto text-white/25">{formatFecha(p.created_at)}</span>
                    {i === 0 && g.items.length > 1 && (
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/60">
                        vigente
                      </span>
                    )}
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      ))}
    </div>
  );
}
