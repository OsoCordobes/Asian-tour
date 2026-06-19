import { useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { PlanCard as PlanCardT } from '@/types';
import { PlanCard } from './PlanCard';
import { PlanCardModal } from './PlanCardModal';

interface Props {
  planes: PlanCardT[];
  destinoId: string;
}

/**
 * Deck de planes "main" por destino: tira horizontal con snap-scroll (swipe en
 * mobile, drag/flechas en desktop) que asoma la próxima card. Tap → modal grande
 * con transición compartida (layoutId).
 */
export function PlanDeck({ planes, destinoId }: Props) {
  const [abierto, setAbierto] = useState<PlanCardT | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (planes.length === 0) return null;

  const nudge = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 200, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.25em] text-white/40">Planes</p>
        <div className="hidden gap-1 md:flex">
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => nudge(-1)}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={() => nudge(1)}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            ›
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {planes.map((plan, i) => (
          <PlanCard key={plan.id} plan={plan} index={i} onOpen={setAbierto} />
        ))}
      </div>

      <AnimatePresence>
        {abierto && (
          <PlanCardModal plan={abierto} destinoId={destinoId} onClose={() => setAbierto(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
