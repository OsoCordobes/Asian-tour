import { Suspense, lazy, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useExperience } from '@/store/experience';
import { KineticText } from '@/components/ui/KineticText';
import { GlobeFallback } from './GlobeFallback';
import { HeadphoneGate } from './HeadphoneGate';

const GlobeR3F = lazy(() => import('./GlobeR3F'));

export function Hero() {
  const tier = useExperience((s) => s.caps.tier);
  const unlockAudio = useExperience((s) => s.unlockAudio);
  const [gatePassed, setGatePassed] = useState(false);

  const handleContinue = (withAudio: boolean) => {
    if (withAudio) unlockAudio();
    setGatePassed(true);
  };

  return (
    <section className="relative min-svh w-full overflow-hidden" data-act="hero">
      {/* Globo: R3F solo en premium (desktop), fallback liviano en el resto. */}
      {tier === 'premium' ? (
        <Suspense fallback={<GlobeFallback />}>
          <GlobeR3F />
        </Suspense>
      ) : (
        <GlobeFallback />
      )}

      {/* Viñeta para legibilidad */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-obsidian/40 via-transparent to-obsidian" />

      {/* Título */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.4, duration: 1.2 }}
          className="mb-4 text-xs uppercase tracking-[0.5em] text-neon-2"
        >
          Una invitación
        </motion.p>
        <h1 className="max-w-4xl text-5xl leading-[0.95] text-white sm:text-7xl md:text-8xl">
          <KineticText text="Un mes por Asia" whileInView={false} delay={0.5} />
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.75, y: 0 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="mt-6 max-w-md text-base text-white/70"
        >
          Desde Copenhague hasta el mar de Andamán. Nueve ciudades, un Año Nuevo,
          y un vuelo de vuelta a casa.
        </motion.p>
      </div>

      {/* Gate de auriculares */}
      <AnimatePresence>
        {!gatePassed && <HeadphoneGate key="gate" onContinue={handleContinue} />}
      </AnimatePresence>

      {/* Hint de scroll */}
      {gatePassed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-xs uppercase tracking-[0.3em] text-white/50"
        >
          <div className="mx-auto mb-2 h-10 w-px animate-breathe bg-gradient-to-b from-neon-1 to-transparent" />
          scrolleá para empezar el viaje
        </motion.div>
      )}
    </section>
  );
}
