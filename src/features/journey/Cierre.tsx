import { motion } from 'framer-motion';
import { KineticText } from '@/components/ui/KineticText';

/** Acto 5 — el cierre emotivo. */
export function Cierre() {
  return (
    <section
      className="relative flex min-svh flex-col items-center justify-center px-6 text-center"
      data-act="cierre"
    >
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.6 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="mb-6 text-xs uppercase tracking-[0.5em] text-neon-2"
      >
        Y después de todo
      </motion.p>
      <h2 className="text-5xl text-white sm:text-7xl md:text-8xl">
        <KineticText text="Nos vemos en Macau" />
      </h2>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 0.8, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 1 }}
        className="mt-8 font-display text-2xl text-neon-3"
      >
        Diciembre 2026
      </motion.p>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="mt-12 h-px w-40 bg-gradient-to-r from-transparent via-neon-1 to-transparent"
      />
    </section>
  );
}
