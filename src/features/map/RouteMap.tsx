import { Suspense, lazy } from 'react';
import type { RutaId } from '@/types';
import { useExperience } from '@/store/experience';
import { RouteMapStatic } from './RouteMapStatic';

const RouteMapMapbox = lazy(() => import('./RouteMapMapbox'));

const HAS_TOKEN = Boolean(import.meta.env.VITE_MAPBOX_TOKEN);

interface Props {
  ruta: RutaId;
  activeIndex: number;
}

/**
 * Selector de tier de mapa. Static (SVG) es la base garantizada; Mapbox entra
 * como progressive enhancement solo si hay token y el device es capaz. El tier
 * Static cubre reduced-motion, saveData, gama baja y la ausencia de token.
 */
export function RouteMap({ ruta, activeIndex }: Props) {
  const tier = useExperience((s) => s.caps.tier);
  const useMapbox = HAS_TOKEN && tier !== 'static';

  if (!useMapbox) {
    return <RouteMapStatic ruta={ruta} activeIndex={activeIndex} />;
  }

  return (
    <Suspense fallback={<RouteMapStatic ruta={ruta} activeIndex={activeIndex} />}>
      <RouteMapMapbox ruta={ruta} tier={tier} />
    </Suspense>
  );
}
