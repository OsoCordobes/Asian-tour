/**
 * Tokens de movimiento centralizados. Toda animación los consume → ritmo
 * coherente en todo el sitio. Easings nombrados por intención, no por curva.
 */
export const DUR = {
  fast: 0.2,
  base: 0.5,
  slow: 1.2,
  cine: 2.5,
} as const;

export const EASE = {
  land: 'expo.out', // entradas que "aterrizan"
  camera: 'power4.inOut', // movimientos de cámara
  accent: 'back.out(1.6)', // micro-acentos con overshoot
  soft: 'power2.out',
} as const;

// Cubic-bezier equivalentes para Framer Motion / CSS.
export const CUBIC = {
  land: [0.16, 1, 0.3, 1],
  camera: [0.65, 0, 0.35, 1],
  soft: [0.25, 0.46, 0.45, 0.94],
} as const;

export const STAGGER = {
  tight: 0.04,
  base: 0.06,
  loose: 0.12,
} as const;

export const DIST = {
  panel: 40,
  text: 24,
} as const;
