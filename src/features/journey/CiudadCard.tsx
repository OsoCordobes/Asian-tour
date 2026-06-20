import { motion } from 'framer-motion';
import type { Ciudad, Destino, RutaId } from '@/types';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { NeonChip } from '@/components/ui/NeonChip';
import { KineticText } from '@/components/ui/KineticText';
import { BlurUpImage } from '@/components/fx/BlurUpImage';
import { PLANES } from '@/data/planes';
import { ITINERARIOS } from '@/data/itinerarios';
import { PlanDeck } from './PlanDeck';
import { CUBIC, STAGGER } from '@/lib/motion';

interface Props {
  ciudad: Ciudad;
  destino: Destino;
  esPrimaria: boolean;
  ruta: RutaId;
  onOpenDeck: (id: string) => void;
}

/** Card de una ciudad. La 1ª ciudad del país trae todo (badges, itinerario,
 * deck de planes); las secundarias son livianas (foto + nombre + qué haríamos). */
export function CiudadCard({ ciudad, destino, esPrimaria, ruta, onOpenDeck }: Props) {
  const noches = destino.nochesPorRuta[ruta];
  const beats = ITINERARIOS[destino.id] ?? destino.highlights;

  return (
    <GlassPanel glow={destino.esClimax} className="overflow-hidden">
      <div className="relative h-32 w-full overflow-hidden sm:h-40">
        <motion.div
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 6, ease: 'easeOut' }}
          className="h-full w-full"
        >
          <BlurUpImage src={ciudad.img} alt={ciudad.nombre} />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-transparent" />
        {destino.esClimax && (
          <motion.span
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: CUBIC.land }}
            className="neon-border absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-obsidian/60 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-wider text-white"
            style={{ filter: 'brightness(1.35)' }}
          >
            <span aria-hidden>🎆</span> 31 Dic · Año Nuevo 2026
          </motion.span>
        )}
        <div className="absolute bottom-2.5 left-4 right-4">
          <p className="text-legible text-[0.65rem] uppercase tracking-[0.3em] text-neon-2">{destino.pais}</p>
          <h2 className="text-legible text-2xl text-white sm:text-3xl">
            <KineticText text={ciudad.nombre} whileInView={false} />
          </h2>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <p className="text-legible line-clamp-3 text-sm leading-relaxed text-white/80">{ciudad.blurb}</p>

        {esPrimaria ? (
          <>
            <div className="flex items-center justify-between text-sm text-white/55">
              <span>{destino.tagline}</span>
              {noches && <span className="neon-text whitespace-nowrap font-medium">{noches}</span>}
            </div>

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
                  className="text-legible flex items-start gap-2 text-sm text-white/85"
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

            <button
              data-cursor="hover"
              onClick={() => onOpenDeck(destino.id)}
              className="neon-border w-full rounded-xl py-2.5 text-sm font-medium uppercase tracking-wider transition hover:brightness-125 active:scale-[0.98]"
            >
              Abrir · planear · notas
            </button>
          </>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3 py-1 text-xs uppercase tracking-wider text-white/55">
            <span aria-hidden>📍</span> Parada en {destino.pais}
          </span>
        )}
      </div>
    </GlassPanel>
  );
}
