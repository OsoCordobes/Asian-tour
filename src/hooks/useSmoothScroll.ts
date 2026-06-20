import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useExperience } from '@/store/experience';

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis (smooth en wheel desktop, momentum nativo en mobile con smoothTouch
 * apagado) integrado con ScrollTrigger. Reporta el progreso global de scroll al
 * store (dirige la temperatura). Respeta reduced-motion.
 */
export function useSmoothScroll() {
  const reducedMotion = useExperience((s) => s.caps.reducedMotion);
  const setScrollProgress = useExperience((s) => s.setScrollProgress);

  useEffect(() => {
    if (reducedMotion) return;
    const lenis = new Lenis({ smoothWheel: true, syncTouch: false });

    lenis.on('scroll', ({ scroll, limit }: { scroll: number; limit: number }) => {
      ScrollTrigger.update();
      setScrollProgress(limit > 0 ? scroll / limit : 0);
    });

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    let resizeTimer: number;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    };
    window.addEventListener('orientationchange', onResize);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      window.removeEventListener('orientationchange', onResize);
    };
  }, [reducedMotion, setScrollProgress]);
}
