import { useMemo } from 'react';
import { useExperience } from '@/store/experience';
import { destinosDeRuta } from '@/data/itinerario';
import { RouteMap } from '@/features/map/RouteMap';
import { PhuketClimax } from '@/features/climax/PhuketClimax';
import { DestinoSection } from './DestinoSection';
import { DestinoPanel } from './DestinoPanel';
import { Cierre } from './Cierre';

interface Props {
  onOpenDeck: (id: string) => void;
}

/**
 * Orquesta el Acto 2. El mapa es sticky de fondo (sin pin de ScrollTrigger);
 * los paneles scrollean por encima y reportan el destino activo, que mueve la
 * cámara/traza del mapa. El clímax de Phuket se intercala como sección propia.
 */
export function JourneyScroll({ onOpenDeck }: Props) {
  const ruta = useExperience((s) => s.ruta);
  const activeDestino = useExperience((s) => s.activeDestino);
  const setActiveDestino = useExperience((s) => s.setActiveDestino);

  const destinos = useMemo(() => destinosDeRuta(ruta), [ruta]);
  const activeIndex = activeDestino
    ? destinos.findIndex((d) => d.id === activeDestino)
    : -1;

  return (
    <section className="relative" data-act="journey">
      {/* Mapa sticky de fondo */}
      <div className="sticky top-0 h-svh w-full">
        <RouteMap ruta={ruta} activeIndex={activeIndex} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-obsidian/70 via-transparent to-obsidian/70" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-obsidian to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-obsidian to-transparent" />
      </div>

      {/* Paneles que scrollean sobre el mapa */}
      <div className="relative z-10 -mt-[100svh]">
        {destinos.map((d, i) => (
          <div key={d.id}>
            <DestinoSection id={d.id} onActive={setActiveDestino} align={i % 2 === 0 ? 'left' : 'right'}>
              <DestinoPanel destino={d} ruta={ruta} index={i} onOpenDeck={onOpenDeck} />
            </DestinoSection>
            {d.esClimax && <PhuketClimax />}
          </div>
        ))}
        <Cierre />
      </div>
    </section>
  );
}
