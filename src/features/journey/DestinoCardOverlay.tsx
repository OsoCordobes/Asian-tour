import { useEffect, useRef } from 'react';
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

/**
 * Card de la CIUDAD activa, centrada sobre el mapa. El contenido se re-monta por
 * ciudad (key) para re-disparar la entrada; la visibilidad (opacity/blur/y) la
 * maneja `holdAmount` imperativamente (sin re-render por tick). Durante el clímax
 * cede al overlay de Phuket.
 */
export function DestinoCardOverlay({ plan, destinos, ruta, onOpenDeck }: Props) {
  const idx = useExperience((s) => s.frame.ciudadGlobalIndex);
  const isClimax = useExperience((s) => s.frame.isClimax);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apply = (h: number) => {
      const el = wrapRef.current;
      if (!el) return;
      el.style.opacity = String(h);
      el.style.transform = `translateY(${(1 - h) * 24}px)`;
      el.style.filter = `blur(${(1 - h) * 8}px)`;
      el.style.pointerEvents = h > 0.5 ? 'auto' : 'none';
    };
    apply(useExperience.getState().frame.holdAmount);
    return useExperience.subscribe((s) => apply(s.frame.holdAmount));
  }, []);

  const city = plan.route.cities[idx];
  if (!city || isClimax) return null;
  const destino = destinos[city.paisIdx];
  if (!destino) return null;
  const esPrimaria = idx === plan.route.paisRanges[city.paisIdx].firstCity;
  const side = city.paisIdx % 2 === 0 ? 'left' : 'right';

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center px-6 md:px-16">
      <div
        ref={wrapRef}
        className={`w-[min(92vw,440px)] ${side === 'right' ? 'ml-auto' : ''}`}
        style={{ opacity: 0 }}
      >
        <CiudadCard
          key={idx}
          ciudad={city.ciudad}
          destino={destino}
          esPrimaria={esPrimaria}
          ruta={ruta}
          onOpenDeck={onOpenDeck}
        />
      </div>
    </div>
  );
}
