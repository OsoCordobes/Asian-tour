import { useEffect, useRef } from 'react';
import { useExperience } from '@/store/experience';
import { DESTINOS_BY_ID } from '@/data/itinerario';

const WARM = { c1: [255, 64, 160], c2: [64, 224, 255], c3: [255, 196, 84] };
const COLD = { c1: [138, 120, 255], c2: [120, 200, 255], c3: [226, 240, 255] };

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}
function rgb(a: number[], b: number[], t: number) {
  return `${lerp(a[0], b[0], t)} ${lerp(a[1], b[1], t)} ${lerp(a[2], b[2], t)}`;
}

/**
 * Interpola la paleta neón warm -> cold de forma continua. El target lo marca la
 * región del destino activo (sudeste = warm, norte = cold); el valor se acerca
 * frame a frame, así el cambio de clima se *siente* al cruzar a Beijing.
 */
export function useTemperature() {
  const activeDestino = useExperience((s) => s.activeDestino);
  const reducedMotion = useExperience((s) => s.caps.reducedMotion);
  const tempRef = useRef(0); // 0 = warm, 1 = cold

  useEffect(() => {
    const region = activeDestino ? DESTINOS_BY_ID[activeDestino]?.region : 'sudeste';
    const target = region === 'norte' ? 1 : 0;
    let raf = 0;

    const apply = (t: number) => {
      const root = document.documentElement.style;
      root.setProperty('--neon-1', rgb(WARM.c1, COLD.c1, t));
      root.setProperty('--neon-2', rgb(WARM.c2, COLD.c2, t));
      root.setProperty('--neon-3', rgb(WARM.c3, COLD.c3, t));
    };

    if (reducedMotion) {
      tempRef.current = target;
      apply(target);
      return;
    }

    const tick = () => {
      tempRef.current += (target - tempRef.current) * 0.05;
      apply(tempRef.current);
      if (Math.abs(target - tempRef.current) > 0.001) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [activeDestino, reducedMotion]);
}
