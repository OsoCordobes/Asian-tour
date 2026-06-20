import { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useExperience } from '@/store/experience';
import { destinosDeRuta } from '@/data/itinerario';
import { resolveFrame, useJourneyStops } from '@/hooks/useJourneyStops';
import { RouteMap } from '@/features/map/RouteMap';
import { PhuketClimax } from '@/features/climax/PhuketClimax';
import { DestinoSection } from './DestinoSection';
import { DestinoPanel } from './DestinoPanel';
import { DestinoCardOverlay } from './DestinoCardOverlay';
import { Cierre } from './Cierre';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  onOpenDeck: (id: string) => void;
}

export function JourneyScroll({ onOpenDeck }: Props) {
  const tier = useExperience((s) => s.caps.tier);
  return tier === 'static' ? (
    <JourneyStatic onOpenDeck={onOpenDeck} />
  ) : (
    <JourneyStops onOpenDeck={onOpenDeck} />
  );
}

/* -------------------------------------------------------------------------- */
/* Modelo de PARADAS (premium / lite con Mapbox)                              */
/* -------------------------------------------------------------------------- */
function JourneyStops({ onOpenDeck }: Props) {
  const ruta = useExperience((s) => s.ruta);
  const setFrame = useExperience((s) => s.setFrame);
  const setJourneyProgress = useExperience((s) => s.setJourneyProgress);
  const setActiveDestino = useExperience((s) => s.setActiveDestino);
  const isClimax = useExperience((s) => s.frame.isClimax);
  const activeIndex = useExperience((s) => s.frame.stop);

  const destinos = useMemo(() => destinosDeRuta(ruta), [ruta]);
  const plan = useJourneyStops(destinos);
  const sectionRef = useRef<HTMLElement>(null);
  const prevStop = useRef(-1);

  // Anclar el primer destino al montar (temperatura/audio).
  useEffect(() => {
    if (destinos[0]) setActiveDestino(destinos[0].id);
    prevStop.current = 0;
  }, [destinos, setActiveDestino]);

  // Scroll → frame (cámara + card + audio). Se recrea al togglear 30/45.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const frame = resolveFrame(plan, self.progress);
        setFrame(frame);
        setJourneyProgress(self.progress);
        if (frame.stop !== prevStop.current) {
          prevStop.current = frame.stop;
          const d = destinos[frame.stop];
          if (d) setActiveDestino(d.id);
        }
      },
    });
    ScrollTrigger.refresh();
    return () => st.kill();
  }, [plan, destinos, setFrame, setJourneyProgress, setActiveDestino]);

  return (
    <>
      <section
        ref={sectionRef}
        className="relative"
        data-act="journey"
        style={{ height: `${plan.totalSvh}svh` }}
      >
        <div className="sticky top-0 h-svh w-full overflow-hidden">
          <RouteMap ruta={ruta} activeIndex={activeIndex} />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-obsidian to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-obsidian to-transparent" />
          <DestinoCardOverlay destinos={destinos} ruta={ruta} onOpenDeck={onOpenDeck} />
          {isClimax && <PhuketClimax asOverlay />}
        </div>
      </section>
      <Cierre />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Fallback DISCRETO (tier static: reduced-motion / sin WebGL / saveData)     */
/* -------------------------------------------------------------------------- */
function JourneyStatic({ onOpenDeck }: Props) {
  const ruta = useExperience((s) => s.ruta);
  const activeDestino = useExperience((s) => s.activeDestino);
  const setActiveDestino = useExperience((s) => s.setActiveDestino);
  const destinos = useMemo(() => destinosDeRuta(ruta), [ruta]);
  const activeIndex = activeDestino ? destinos.findIndex((d) => d.id === activeDestino) : -1;

  return (
    <section className="relative" data-act="journey">
      <div className="sticky top-0 h-svh w-full">
        <RouteMap ruta={ruta} activeIndex={activeIndex} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-obsidian/70 via-transparent to-obsidian/70" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-obsidian to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-obsidian to-transparent" />
      </div>
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
