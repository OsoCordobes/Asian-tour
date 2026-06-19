import type { Destino } from '@/types';
import { AMBIENCE, type AmbienceKey } from '@/data/assets';

/**
 * Tercera capa de audio: ambiente por destino. Reutilizamos dos loops genéricos
 * (playa / ciudad) mapeados por la naturaleza del lugar, en vez de un clip único
 * por ciudad — mantiene el peso bajo y suena coherente.
 *
 * Regla: si el destino es de playa (badge `playa`) → olas; el resto (capitales,
 * vida nocturna urbana) → bullicio de ciudad.
 */

/** Destinos costeros explícitos (refuerzan el badge `playa`). */
const BEACH_IDS = new Set(['filipinas', 'bali', 'phuket']);

export function ambienceKeyFor(destino: Destino): AmbienceKey {
  if (BEACH_IDS.has(destino.id) || destino.badges.includes('playa')) {
    return 'beach';
  }
  return 'city';
}

/** Ruta del clip de ambiente que corresponde a un destino. */
export function ambienceSrcFor(destino: Destino): string {
  return AMBIENCE[ambienceKeyFor(destino)];
}

export { AMBIENCE };
