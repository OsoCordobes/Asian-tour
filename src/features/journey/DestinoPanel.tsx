import { motion } from 'framer-motion';
import type { Destino, RutaId } from '@/types';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { NeonChip } from '@/components/ui/NeonChip';
import { KineticText } from '@/components/ui/KineticText';
import { BlurUpImage } from '@/components/fx/BlurUpImage';
import { assetsFor } from '@/data/assets';
import { CUBIC } from '@/lib/motion';

interface Props {
  destino: Destino;
  ruta: RutaId;
  index: number;
  onOpenDeck: (id: string) => void;
}

export function DestinoPanel({ destino, ruta, index, onOpenDeck }: Props) {
  const assets = assetsFor(destino.id);
  const noches = destino.nochesPorRuta[ruta];
  const side = index % 2 === 0 ? 'left' : 'right';

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: false, amount: 0.5 }}
      transition={{ duration: 0.9, ease: CUBIC.land }}
      className={`pointer-events-auto w-[min(92vw,460px)] ${side === 'right' ? 'md:ml-auto' : ''}`}
    >
      <GlassPanel glow={destino.esClimax} className="overflow-hidden">
        <div className="relative h-44 w-full overflow-hidden sm:h-52">
          <motion.div
            initial={{ scale: 1.12 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 6, ease: 'easeOut' }}
            className="h-full w-full"
          >
            <BlurUpImage src={assets.hero} alt={destino.nombre} />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <p className="text-xs uppercase tracking-[0.3em] text-neon-2">{destino.pais}</p>
            <h2 className="text-3xl text-white sm:text-4xl">
              <KineticText text={destino.nombre} />
            </h2>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between text-sm text-white/60">
            <span>{destino.tagline}</span>
            {noches && <span className="neon-text whitespace-nowrap font-medium">{noches}</span>}
          </div>

          <div className="flex flex-wrap gap-2">
            {destino.badges.map((b, i) => (
              <NeonChip key={b} badge={b} index={i} bright={destino.esClimax} />
            ))}
          </div>

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
    </motion.div>
  );
}
