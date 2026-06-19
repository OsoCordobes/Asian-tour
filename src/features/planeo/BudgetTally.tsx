import { useEffect, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import type { Precio } from '@/types';
import { RATES_UPDATED_AT } from '@/data/rates';
import { formatEUR } from '@/lib/format';
import { useExperience } from '@/store/experience';

interface Props {
  precios: Precio[];
}

/**
 * Total de presupuesto vigente.
 *
 * Decisión: cuando hay varias cotizaciones para el mismo tramo, el total toma
 * el precio MÁS RECIENTE por tramo (no el promedio). Para planear, lo que
 * importa es el valor vigente del último sondeo de cada vuelo; el histórico y
 * la comparación quedan visibles en PrecioList. El número se anima con un
 * spring (count-up) al cambiar.
 */
export function BudgetTally({ precios }: Props) {
  const reducedMotion = useExperience((s) => s.caps.reducedMotion);

  const total = useMemo(() => {
    const masReciente = new Map<string, Precio>();
    for (const p of precios) {
      const actual = masReciente.get(p.tramo_id);
      if (!actual || p.created_at > actual.created_at) {
        masReciente.set(p.tramo_id, p);
      }
    }
    let suma = 0;
    for (const p of masReciente.values()) suma += p.monto_eur;
    return suma;
  }, [precios]);

  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 90, damping: 20, mass: 0.6 });
  const display = useTransform(spring, (v) => formatEUR(Math.max(0, Math.round(v))));

  useEffect(() => {
    if (reducedMotion) {
      mv.set(total);
      spring.set(total);
    } else {
      mv.set(total);
    }
  }, [total, reducedMotion, mv, spring]);

  return (
    <div className="rounded-2xl bg-white/[0.03] px-5 py-5 text-center">
      <p className="font-sans text-xs uppercase tracking-[0.3em] text-white/40">
        Presupuesto vigente
      </p>
      <motion.div className="neon-text mt-2 font-display text-4xl tabular-nums sm:text-5xl">
        {display}
      </motion.div>
      <p className="mt-3 font-sans text-[11px] text-white/30">
        Tasas actualizadas el {RATES_UPDATED_AT} · vuelo más reciente por tramo
      </p>
    </div>
  );
}
