import { motion } from 'framer-motion';
import type { Destino, RutaId } from '@/types';
import { DestinoCardContent } from './DestinoCardContent';
import { CUBIC } from '@/lib/motion';

interface Props {
  destino: Destino;
  ruta: RutaId;
  index: number;
  onOpenDeck: (id: string) => void;
}

/** Panel de destino para el fallback estático (scrollea con whileInView). */
export function DestinoPanel({ destino, ruta, index, onOpenDeck }: Props) {
  const side = index % 2 === 0 ? 'left' : 'right';
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: false, amount: 0.5 }}
      transition={{ duration: 0.9, ease: CUBIC.land }}
      className={`pointer-events-auto w-[min(92vw,460px)] ${side === 'right' ? 'md:ml-auto' : ''}`}
    >
      <DestinoCardContent destino={destino} ruta={ruta} onOpenDeck={onOpenDeck} />
    </motion.div>
  );
}
