import { motion } from 'framer-motion';
import type { BadgeId } from '@/types';
import { BADGES } from '@/data/badges';
import { CUBIC, STAGGER } from '@/lib/motion';

interface Props {
  badge: BadgeId;
  index?: number;
  bright?: boolean;
}

/** Chip de badge con flicker de neón al encender. */
export function NeonChip({ badge, index = 0, bright }: Props) {
  const def = BADGES[badge];
  return (
    <motion.span
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * STAGGER.base, ease: CUBIC.land }}
      className="neon-border inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider"
      style={bright ? { filter: 'brightness(1.4)' } : undefined}
    >
      <span aria-hidden>{def.icon}</span>
      {def.label}
    </motion.span>
  );
}
