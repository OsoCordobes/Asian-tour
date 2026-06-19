import type { Tier } from '@/types';

export interface Capabilities {
  tier: Tier;
  reducedMotion: boolean;
  saveData: boolean;
  webgl2: boolean;
  coarsePointer: boolean;
  isMobile: boolean;
}

function probeWebGL2(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    return !!gl;
  } catch {
    return false;
  }
}

/**
 * Detección por CAPABILITY, no por user-agent. Se corre una sola vez al montar.
 * prefers-reduced-motion y saveData fuerzan el tier estático.
 */
export function detectCapabilities(): Capabilities {
  if (typeof window === 'undefined') {
    return {
      tier: 'static',
      reducedMotion: true,
      saveData: false,
      webgl2: false,
      coarsePointer: false,
      isMobile: false,
    };
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const narrow = window.matchMedia('(max-width: 1024px)').matches;
  const isMobile = coarsePointer && narrow;

  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
    .connection;
  const saveData = conn?.saveData === true;
  const slowNet = ['slow-2g', '2g', '3g'].includes(conn?.effectiveType ?? '');

  const webgl2 = probeWebGL2();
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency;

  let tier: Tier = 'premium';

  // Accesibilidad y ahorro de datos ganan siempre.
  if (reducedMotion || saveData || !webgl2) {
    tier = 'static';
  } else {
    // Señales de gama media → como máximo 'lite' (nunca R3F + Mapbox 3D).
    if (slowNet) tier = 'lite';
    if (deviceMemory !== undefined && deviceMemory < 4) tier = 'lite';
    if (cores !== undefined && cores < 4) tier = 'lite';
    if (isMobile) tier = 'lite';
  }

  return { tier, reducedMotion, saveData, webgl2, coarsePointer, isMobile };
}
