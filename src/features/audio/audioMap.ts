import type { Destino } from '@/types';
import { AMBIENCE, type AmbienceKey } from '@/data/assets';

/**
 * Tercera capa de audio: ambiente por destino. Cada destino tiene su grabación
 * de campo propia en AMBIENCE (ciudades con idioma local; playas con olas). Para
 * los que no tienen clip propio caemos a un genérico según la naturaleza del
 * lugar: costero → olas (`beach`), resto → bullicio urbano (`city`).
 */

/** Destinos costeros explícitos (refuerzan el badge `playa`). */
const BEACH_IDS = new Set(['filipinas', 'bali', 'phuket']);

/**
 * Override de fallback por país, para países sin clip propio. Clave: que dos
 * países VECINOS nunca compartan el mismo archivo (si no, al cruzar de uno a
 * otro el sonido "no cambia") y que al menos uno aporte voces/idioma. Filipinas
 * (Manila + Boracay) usa el bullicio urbano con voces; Bali se queda con olas.
 */
const FALLBACK_OVERRIDE: Record<string, AmbienceKey> = {
  filipinas: 'city',
  bali: 'beach',
};

/** Genérico de fallback cuando el destino no tiene clip propio en AMBIENCE. */
export function ambienceKeyFor(destino: Destino): AmbienceKey {
  const override = FALLBACK_OVERRIDE[destino.id];
  if (override) return override;
  if (BEACH_IDS.has(destino.id) || destino.badges.includes('playa')) {
    return 'beach';
  }
  return 'city';
}

/** True si `id` es una clave concreta de AMBIENCE (narrowing para el index). */
function hasAmbience(id: string): id is AmbienceKey {
  return Object.prototype.hasOwnProperty.call(AMBIENCE, id);
}

/**
 * Ruta del clip de ambiente para un destino: el específico (`AMBIENCE[id]`) si
 * existe, con fallback al genérico (costero → beach, resto → city).
 */
export function ambienceSrcFor(destino: Destino): string {
  if (hasAmbience(destino.id)) {
    return AMBIENCE[destino.id];
  }
  return AMBIENCE[ambienceKeyFor(destino)];
}

export { AMBIENCE };
