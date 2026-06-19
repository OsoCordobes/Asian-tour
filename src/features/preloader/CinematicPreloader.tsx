import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useExperience } from '@/store/experience';
import { CUBIC } from '@/lib/motion';

/**
 * Preloader cinematográfico: contador 0->100 + línea de neón que se dibuja, y un
 * susurro de texto. No es un spinner; es el primer beat. Al 100% hace fade y
 * cede al hero. Respeta reduced-motion (entrada instantánea).
 */
export function CinematicPreloader() {
  const finishPreloader = useExperience((s) => s.finishPreloader);
  const reducedMotion = useExperience((s) => s.caps.reducedMotion);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (reducedMotion) {
      setCount(100);
      setDone(true);
      finishPreloader();
      return;
    }

    const duration = 2200;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setDone(true);
          finishPreloader();
        }, 450);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [finishPreloader, reducedMotion]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-obsidian"
          exit={{ opacity: 0, transition: { duration: 0.8, ease: CUBIC.soft } }}
        >
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 0.7, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-8 text-center text-sm uppercase tracking-[0.4em] text-white/60"
          >
            un mes · nueve ciudades · un año nuevo
          </motion.p>

          <div className="relative h-px w-[min(70vw,420px)] overflow-hidden bg-white/10">
            <motion.div
              className="absolute left-0 top-0 h-full bg-neon-1"
              style={{ boxShadow: '0 0 12px rgb(var(--neon-1)), 0 0 28px rgb(var(--neon-2))' }}
              initial={{ width: '0%' }}
              animate={{ width: `${count}%` }}
              transition={{ ease: 'linear', duration: 0.1 }}
            />
          </div>

          <div className="mt-6 font-display text-6xl tabular-nums text-white/90">
            {String(count).padStart(3, '0')}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
