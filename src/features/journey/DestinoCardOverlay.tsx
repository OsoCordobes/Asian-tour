import { useEffect, useRef, type RefObject } from 'react';
import type { Destino, RutaId } from '@/types';
import { useExperience } from '@/store/experience';
import type { JourneyPlan } from '@/hooks/useJourneyStops';
import { CiudadCard } from './CiudadCard';

interface Props {
  plan: JourneyPlan;
  destinos: Destino[];
  ruta: RutaId;
  onOpenDeck: (id: string) => void;
}

const CROSS = 0.85;

function smoothstep(x: number): number {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
}

/**
 * Crossfade de cards por CIUDAD sin hueco. Dos slots fijos: ciudades pares a la
 * izquierda, impares a la derecha. Al pasar de una ciudad a la siguiente dentro
 * de un país, una se va por su lado y la otra entra por el opuesto, sobre el mapa
 * quieto. El "momento solo-mapa" ocurre solo en INTER (cardGate→0). La opacidad
 * se deriva del `r` continuo (suavizado), aplicada imperativamente (sin re-render
 * por tick); React solo reasigna qué ciudad vive en cada slot al cruzar enteros.
 */
export function DestinoCardOverlay({ plan, destinos, ruta, onOpenDeck }: Props) {
  const lo = useExperience((s) => Math.floor(Math.max(0, Math.min(plan.nCiudades - 1, s.frame.r))));
  const n = plan.nCiudades;
  const hi = Math.min(lo + 1, n - 1);

  // Las 2 ciudades candidatas (lo, hi). Asignación por paridad → slot estable.
  let evenCity = -1;
  let oddCity = -1;
  for (const c of new Set([lo, hi])) {
    if (c % 2 === 0) evenCity = c;
    else oddCity = c;
  }

  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const dispR = useRef(lo);
  const gate = useRef(0);
  const env = useRef(0);

  useEffect(() => {
    let raf = 0;
    let last = 0;
    const apply = (el: HTMLDivElement | null, city: number, dir: number) => {
      if (!el) return;
      if (city < 0) {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        return;
      }
      const op = smoothstep(1 - Math.abs(dispR.current - city) / CROSS) * gate.current * env.current;
      el.style.opacity = String(op);
      el.style.transform = `translateY(-50%) translateX(${dir * (1 - op) * 44}px)`;
      el.style.filter = `blur(${(1 - op) * 6}px)`;
      el.style.pointerEvents = op > 0.6 ? 'auto' : 'none';
    };
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      const st = useExperience.getState();
      const f = st.frame;
      const jp = st.journeyProgress;
      const kR = 1 - Math.exp(-dt / 0.1);
      const kG = 1 - Math.exp(-dt / 0.2);
      dispR.current += (f.r - dispR.current) * kR;
      // Gate: sin card durante viaje entre países ni en el zoom-out final.
      const gateTarget = f.phase === 'inter' || f.phase === 'outro' ? 0 : 1;
      gate.current += (gateTarget - gate.current) * kG;
      // Envelope global: la 1ª card ENTRA con la cadencia del scroll (no queda
      // fija desde el hero) y todo se va al acercarse el cierre.
      const envTarget = smoothstep(jp / 0.018) * smoothstep((1 - jp) / 0.05);
      env.current += (envTarget - env.current) * kG;
      apply(leftRef.current, evenCity, -1);
      apply(rightRef.current, oddCity, +1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [evenCity, oddCity]);

  const slot = (city: number, ref: RefObject<HTMLDivElement>, side: 'left' | 'right') => {
    if (city < 0) return null;
    const c = plan.route.cities[city];
    const destino = destinos[c.paisIdx];
    if (!destino) return null;
    const esPrimaria = city === plan.route.paisRanges[c.paisIdx].firstCity;
    return (
      <div
        ref={ref}
        className={`absolute top-1/2 max-h-[88svh] w-[min(90vw,384px)] overflow-hidden ${side === 'left' ? 'left-4 md:left-14' : 'right-4 md:right-14'}`}
        style={{ opacity: 0, transform: 'translateY(-50%)' }}
      >
        <CiudadCard
          key={city}
          ciudad={c.ciudad}
          destino={destino}
          esPrimaria={esPrimaria}
          ruta={ruta}
          onOpenDeck={onOpenDeck}
        />
      </div>
    );
  };

  return (
    <div className="pointer-events-none absolute inset-0">
      {slot(evenCity, leftRef, 'left')}
      {slot(oddCity, rightRef, 'right')}
    </div>
  );
}
