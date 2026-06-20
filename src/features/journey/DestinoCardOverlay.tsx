import { useEffect, useRef } from 'react';
import type { Destino, RutaId } from '@/types';
import { useExperience } from '@/store/experience';
import { DestinoCardContent } from './DestinoCardContent';

interface Props {
  destinos: Destino[];
  ruta: RutaId;
  onOpenDeck: (id: string) => void;
}

/**
 * Tarjeta activa del modelo de paradas: una sola card visible a la vez, centrada
 * sobre el mapa fijo. El contenido se re-monta por parada (key={stop}) para
 * re-disparar la caída del mini-itinerario; la entrada/salida (opacity/blur/y) la
 * maneja `holdAmount` imperativamente (sin re-render por tick).
 */
export function DestinoCardOverlay({ destinos, ruta, onOpenDeck }: Props) {
  const stop = useExperience((s) => s.frame.stop);
  const isClimax = useExperience((s) => s.frame.isClimax);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apply = (holdAmount: number) => {
      const el = wrapRef.current;
      if (!el) return;
      el.style.opacity = String(holdAmount);
      el.style.transform = `translateY(${(1 - holdAmount) * 24}px)`;
      el.style.filter = `blur(${(1 - holdAmount) * 8}px)`;
      el.style.pointerEvents = holdAmount > 0.5 ? 'auto' : 'none';
    };
    apply(useExperience.getState().frame.holdAmount);
    return useExperience.subscribe((s) => apply(s.frame.holdAmount));
  }, []);

  const destino = destinos[stop];
  // Durante el clímax de Phuket la card cede al overlay del clímax.
  if (!destino || isClimax) return null;
  const side = stop % 2 === 0 ? 'left' : 'right';

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center px-6 md:px-16">
      <div
        ref={wrapRef}
        className={`w-[min(92vw,440px)] ${side === 'right' ? 'ml-auto' : ''}`}
        style={{ opacity: 0 }}
      >
        <DestinoCardContent key={stop} destino={destino} ruta={ruta} onOpenDeck={onOpenDeck} />
      </div>
    </div>
  );
}
