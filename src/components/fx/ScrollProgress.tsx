import { useExperience } from '@/store/experience';

/** Hilo de neón lateral que se llena y cambia de temperatura con el viaje. */
export function ScrollProgress() {
  const progress = useExperience((s) => s.scrollProgress);
  return (
    <div className="pointer-events-none fixed right-4 top-1/2 z-40 hidden h-48 w-[3px] -translate-y-1/2 rounded-full bg-white/10 md:block">
      <div
        className="w-full rounded-full bg-neon-1 transition-[height] duration-150"
        style={{
          height: `${Math.round(progress * 100)}%`,
          boxShadow: '0 0 10px rgb(var(--neon-1)), 0 0 20px rgb(var(--neon-2) / 0.5)',
        }}
      />
    </div>
  );
}
