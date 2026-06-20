import { motion } from 'framer-motion';
import type { PlanCard as PlanCardT, PlanCategoria } from '@/types';
import { BlurUpImage } from '@/components/fx/BlurUpImage';
import { CUBIC } from '@/lib/motion';

export const CATEGORIA_META: Record<PlanCategoria, { label: string; icon: string }> = {
  comida: { label: 'Comida', icon: '🍜' },
  playa: { label: 'Playa', icon: '🏝️' },
  ciudad: { label: 'Ciudad', icon: '🌃' },
  templo: { label: 'Templo', icon: '⛩️' },
  fiesta: { label: 'Fiesta', icon: '🎉' },
  cultura: { label: 'Cultura', icon: '🏛️' },
  naturaleza: { label: 'Naturaleza', icon: '⛰️' },
};

interface Props {
  plan: PlanCardT;
  index: number;
  onOpen: (plan: PlanCardT) => void;
}

/** Card de plan en la tira horizontal. Tap → la abre en grande (layoutId). */
export function PlanCard({ plan, index, onOpen }: Props) {
  const meta = CATEGORIA_META[plan.categoria];
  return (
    <motion.button
      type="button"
      data-cursor="hover"
      onClick={() => onOpen(plan)}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: CUBIC.land }}
      whileTap={{ scale: 0.97 }}
      className="group relative w-40 shrink-0 snap-start overflow-hidden rounded-xl text-left sm:w-44"
      style={{ scrollSnapAlign: 'start' }}
    >
      <motion.div
        layoutId={`plan-img-${plan.id}`}
        className="relative h-28 w-full overflow-hidden rounded-xl sm:h-32"
      >
        <BlurUpImage src={plan.img} alt={plan.titulo} className="transition group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent" />
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-obsidian/60 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/80 backdrop-blur-sm">
          <span aria-hidden>{meta.icon}</span>
          {meta.label}
        </span>
      </motion.div>
      <p className="mt-1.5 line-clamp-2 px-0.5 font-display text-sm leading-tight text-white/90">
        {plan.titulo}
      </p>
    </motion.button>
  );
}
