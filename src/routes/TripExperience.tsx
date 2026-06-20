import { useNavigate, useParams } from 'react-router-dom';
import { useTrip } from '@/hooks/useTrip';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { useTemperature } from '@/hooks/useTemperature';
import { CinematicPreloader } from '@/features/preloader/CinematicPreloader';
import { Hero } from '@/features/hero/Hero';
import { JourneyScroll } from '@/features/journey/JourneyScroll';
import { RouteToggle } from '@/features/journey/RouteToggle';
import { AudioProvider } from '@/features/audio/AudioProvider';
import { CustomCursor } from '@/components/fx/CustomCursor';
import { ScrollProgress } from '@/components/fx/ScrollProgress';
import { AudioToggle } from '@/components/ui/AudioToggle';

export function TripExperience() {
  const { slug } = useParams<{ slug: string }>();
  const { trip, loading, notFound } = useTrip(slug);
  const navigate = useNavigate();

  useSmoothScroll();
  useTemperature();

  // Abrir el planeo ya no es un drawer: navega a la sala dedicada, enfocando el
  // destino tocado vía query. JourneyScroll mantiene la firma (id) => void.
  const openDeck = (id: string) => {
    navigate(`/viaje/${slug}/planeo?destino=${id}`);
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
      {/* Acceso persistente a la sala de planeo (espejo del AudioToggle) */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          type="button"
          data-cursor="hover"
          aria-label="Sala de planeo"
          title="Sala de planeo"
          onClick={() => navigate(`/viaje/${slug}/planeo`)}
          className="glass flex h-11 items-center gap-2 rounded-full px-4 text-sm text-white transition hover:brightness-125 active:scale-95"
        >
          <span aria-hidden>📝</span>
          <span className="font-display">Planeo</span>
        </button>
      </div>

      {!loading && trip && (
        <>
          <Hero />
          <JourneyScroll onOpenDeck={openDeck} />
        </>
      )}
    </main>
  );
}
