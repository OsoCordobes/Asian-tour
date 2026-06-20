import { motion } from 'framer-motion';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { CUBIC } from '@/lib/motion';

/**
 * Gate de auriculares: el click es el gesto que desbloquea el audio (resuelve el
 * bloqueo de autoplay-con-sonido). Umbral premium intencional. Se puede saltar
 * (entra en silencio, con un botón flotante para activar sonido después).
 */
export function HeadphoneGate({ onContinue }: { onContinue: (withAudio: boolean) => void }) {
  return (
    <motion.div
      className="absolute inset-0 z-30 flex items-end justify-center pb-[12vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 1 }}
    >
      <motion.div
        initial={{ y: 30, opacity: 0, filter: 'blur(8px)' }}
        animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
        transition={{ delay: 0.8, duration: 0.9, ease: CUBIC.land }}
      >
        <GlassPanel glow className="flex flex-col items-center gap-4 px-8 py-6 text-center">
          <span className="text-3xl">🎧</span>
          <p className="max-w-xs text-sm text-white/80">
            Esto se vive con sonido. Poné los auriculares y subí el volumen.
          </p>
          <div className="flex flex-col items-center gap-2">
            <button
              data-cursor="hover"
              onClick={() => onContinue(true)}
              className="neon-border rounded-full px-6 py-2.5 text-sm font-medium uppercase tracking-wider transition hover:brightness-125 active:scale-95"
            >
              Poné los auriculares
            </button>
            <button
              data-cursor="hover"
              onClick={() => onContinue(false)}
              className="text-xs text-white/40 underline-offset-4 transition hover:text-white/70 hover:underline"
            >
              entrar en silencio
            </button>
          </div>
        </GlassPanel>
      </motion.div>
    </motion.div>
  );
}
