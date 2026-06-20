/**
 * Manifiesto de assets. Convención de nombres fija → swapeás los placeholders de
 * stock por material propio sin tocar código. Los archivos viven en /public/media.
 *
 * Por ahora los `hero` apuntan a imágenes remotas de Unsplash (source) como
 * placeholders legales; reemplazá por `/media/dest-<id>-hero.jpg` cuando tengas
 * el material. Mantené el mismo nombre y todo sigue funcionando.
 */
export interface DestinoAssets {
  hero: string;
  loop?: string;
  gallery: string[];
}

const U = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=70`;

export const ASSETS: Record<string, DestinoAssets> = {
  macau: { hero: U('photo-1555212697-194d092e3b8f'), gallery: [] },
  hanoi: { hero: U('photo-1613131145282-9476375618e1'), gallery: [] },
  filipinas: { hero: U('photo-1518509562904-e7ef99cdcc86'), gallery: [] },
  bali: { hero: U('photo-1662879567074-9a8b3e6364b7'), gallery: [] },
  singapur: { hero: U('photo-1525625293386-3f8f99389edd'), gallery: [] },
  phuket: { hero: U('photo-1641546373508-635403c24289'), gallery: [] },
  beijing: { hero: U('photo-1508804185872-d7badad00f7d'), gallery: [] },
  seul: { hero: U('photo-1538485399081-7191377e8241'), gallery: [] },
  tokio: { hero: U('photo-1540959733332-eab4deabeeaf'), gallery: [] },
};

/** Clip del clímax (Phuket / año nuevo). Reemplazá por material propio. */
export const CLIMAX_VIDEO = '/media/phuket-fireworks.mp4';

/** Audio: beds por región + swell del clímax. Colocá los archivos en /public/audio. */
export const AUDIO = {
  bedWarm: '/audio/bed-warm.mp3',
  bedCold: '/audio/bed-cold.mp3',
  fireworks: '/audio/fireworks-swell.mp3',
};

/**
 * Ambientes de tercera capa (loops cortos). Cada destino tiene su grabación de
 * campo característica (ciudades con idioma local audible; playas con olas).
 * `beach`/`city` quedan como fallback genérico para destinos sin clip propio.
 * Ver public/audio/CREDITS.md para fuente + licencia de cada archivo.
 */
export const AMBIENCE = {
  /** Olas/playa genérico — fallback de destinos costeros (filipinas, bali). */
  beach: '/audio/amb-beach.mp3',
  /** Bullicio urbano genérico — fallback de destinos no costeros. */
  city: '/audio/amb-city.mp3',

  /** Calle de Macau (Avenida da Amizade), cantonés de fondo. */
  macau: '/audio/amb-macau.mp3',
  /** Lenin Park, Hanoi — gente y vietnamita. */
  hanoi: '/audio/amb-hanoi.mp3',
  /** Mercado de ropa cubierto, Beijing — mandarín. */
  beijing: '/audio/amb-beijing.mp3',
  /** Galería comercial subterránea, Seúl — coreano. */
  seul: '/audio/amb-seul.mp3',
  /** Calle de Akihabara, Tokio — japonés. */
  tokio: '/audio/amb-tokio.mp3',
  /** Lavender food square, Singapur — bullicio mixto inglés/mandarín. */
  singapur: '/audio/amb-singapur.mp3',
  /** Tubkaek Beach, mar de Andamán — olas suaves (Phuket). */
  phuket: '/audio/amb-phuket.mp3',
} as const;

export type AmbienceKey = keyof typeof AMBIENCE;

export function assetsFor(id: string): DestinoAssets {
  return ASSETS[id] ?? { hero: U('photo-1469474968028-56623f02e42e'), gallery: [] };
}
