import { useExperience } from '@/store/experience';
import { RUTAS } from '@/data/itinerario';
import { cn } from '@/lib/utils';

/** Switch 30 ↔ 45 que reconfigura la ruta en vivo. Control de vidrio premium. */
export function RouteToggle() {
  const ruta = useExperience((s) => s.ruta);
  const setRuta = useExperience((s) => s.setRuta);

  return (
    <div className="glass flex items-center gap-1 rounded-full p-1 text-xs">
      {(['30', '45'] as const).map((r) => (
        <button
          key={r}
          data-cursor="hover"
          onClick={() => {
            setRuta(r);
            if (navigator.vibrate) navigator.vibrate(8);
          }}
          className={cn(
            'relative rounded-full px-4 py-1.5 font-medium uppercase tracking-wider transition',
            ruta === r ? 'text-obsidian' : 'text-white/60 hover:text-white',
          )}
        >
          {ruta === r && (
            <span className="absolute inset-0 rounded-full bg-neon-3 shadow-glow-sm" />
          )}
          <span className="relative">{r} días</span>
        </button>
      ))}
      <span className="px-2 text-white/40">{RUTAS[ruta].duracionAprox}</span>
    </div>
  );
}
