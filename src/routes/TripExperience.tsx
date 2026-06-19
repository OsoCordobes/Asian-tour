import { useParams, useSearchParams } from 'react-router-dom';
import { useTrip } from '@/hooks/useTrip';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { useTemperature } from '@/hooks/useTemperature';
import { CinematicPreloader } from '@/features/preloader/CinematicPreloader';
import { Hero } from '@/features/hero/Hero';
import { JourneyScroll } from '@/features/journey/JourneyScroll';
import { RouteToggle } from '@/features/journey/RouteToggle';
import { AudioProvider } from '@/features/audio/AudioProvider';
import { PlaneoDrawer } from '@/features/planeo/PlaneoDrawer';
import { CustomCursor } from '@/components/fx/CustomCursor';
import { ScrollProgress } from '@/components/fx/ScrollProgress';
import { AudioToggle } from '@/components/ui/AudioToggle';

export function TripExperience() {
  const { slug } = useParams<{ slug: string }>();
  const { trip, loading, notFound } = useTrip(slug);
  const [params, setParams] = useSearchParams();

  useSmoothScroll();
  useTemperature();

  const deckId = params.get('destino') ?? undefined;
  const openDeck = (id: string) => {
    const next = new URLSearchParams(params);
    next.set('destino', id);
    setParams(next, { replace: false });
  };
  const closeDeck = () => {
    const next = new URLSearchParams(params);
    next.delete('destino');
    setParams(next, { replace: true });
  };

  if (notFound) {
    return (
      <div className="flex min-svh flex-col items-center justify-center gap-3 text-center">
        <h1 className="text-3xl">Este viaje no existe</h1>
        <p className="text-white/60">El link puede estar mal o el viaje fue archivado.</p>
      </div>
    );
  }

  return (
    <main className="relative bg-obsidian">
      <CinematicPreloader />
      <CustomCursor />
      <ScrollProgress />
      <AudioProvider />

      {/* Controles fijos */}
      <div className="fixed left-1/2 top-4 z-40 -translate-x-1/2">
        <RouteToggle />
      </div>
      <div className="fixed bottom-4 right-4 z-40">
        <AudioToggle />
      </div>

      {!loading && trip && (
        <>
          <Hero />
          <JourneyScroll onOpenDeck={openDeck} />
          <PlaneoDrawer
            open={Boolean(deckId)}
            onClose={closeDeck}
            tripId={trip.id}
            destinoId={deckId}
          />
        </>
      )}
    </main>
  );
}
