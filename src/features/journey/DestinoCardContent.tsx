import { motion } from 'framer-motion';
import type { Destino, RutaId } from '@/types';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { NeonChip } from '@/components/ui/NeonChip';
import { KineticText } from '@/components/ui/KineticText';
import { BlurUpImage } from '@/components/fx/BlurUpImage';
import { assetsFor } from '@/data/assets';
import { PLANES } from '@/data/planes';
import { ITINERARIOS } from '@/data/itinerarios';
import { PlanDeck } from './PlanDeck';
import { CUBIC, STAGGER } from '@/lib/motion';

interface Props {
  destino: Destino;
  ruta: RutaId;
  onOpenDeck: (id: string) => void;
}

/**
 * Contenido de la tarjeta de un destino (foto + mini-itinerario que cae + badges
 * + deck de planes). Compartido por el overlay premium y el fallback estático.
 * El mini-itinerario hace su "caída" con stagger al montar.
 */
export function DestinoCardContent({ destino, ruta, onOpenDeck }: Props) {
  const assets = assetsFor(destino.id);
  const noches = destino.nochesPorRuta[ruta];
  const beats = ITINERARIOS[destino.id] ?? destino.highlights;

  return (
    <GlassPanel glow={destino.esClimax} className="overflow-hidden">
      <div className="relative h-44 w-full overflow-hidden sm:h-52">
        <motion.div
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 6, ease: 'easeOut' }}
          className="h-full w-full"
        >
          <BlurUpImage src={assets.hero} alt={destino.nombre} />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <p className="text-xs uppercase tracking-[0.3em] text-neon-2">{destino.pais}</p>
          <h2 className="text-3xl text-white sm:text-4xl">
            <KineticText text={destino.nombre} whileInView={false} />
          </h2>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between text-sm text-white/60">
          <span>{destino.tagline}</span>
          {noches && <span className="neon-text whitespace-nowrap font-medium">{noches}</span>}
        </div>

        {/* Mini-itinerario que cae debajo de la foto */}
        <motion.ul
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: STAGGER.base, delayChildren: 0.15 } } }}
          className="space-y-1.5"
        >
          {beats.map((b, i) => (
            <motion.li
              key={i}
              variants={{
                hidden: { opacity: 0, y: -8 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: CUBIC.land } },
              }}
              className="flex items-start gap-2 text-sm text-white/80"
            >
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neon-1"
                style={{ boxShadow: '0 0 8px rgb(var(--neon-1))' }}
              />
              {b}
            </motion.li>
          ))}
        </motion.ul>

        <div className="flex flex-wrap gap-2">
          {destino.badges.map((b, i) => (
            <NeonChip key={b} badge={b} index={i} bright={destino.esClimax} />
          ))}
        </div>

        <PlanDeck planes={PLANES[destino.id] ?? []} destinoId={destino.id} />

        {destino.visa && (
          <p className="text-xs text-white/40">
            <span className="text-white/60">Visa:</span> {destino.visa}
          </p>
        )}

        <button
          data-cursor="hover"
          onClick={() => onOpenDeck(destino.id)}
          className="neon-border w-full rounded-xl py-2.5 text-sm font-medium uppercase tracking-wider transition hover:brightness-125 active:scale-[0.98]"
        >
          Abrir · planear · notas
        </button>
      </div>
    </GlassPanel>
  );
}
