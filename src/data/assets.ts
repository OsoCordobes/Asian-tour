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
  hanoi: { hero: U('photo-1509030450996-dd1a26dda341'), gallery: [] },
  filipinas: { hero: U('photo-1518509562904-e7ef99cdcc86'), gallery: [] },
  bali: { hero: U('photo-1537953773345-d172ccd13da7'), gallery: [] },
  singapur: { hero: U('photo-1525625293386-3f8f99389edd'), gallery: [] },
  phuket: { hero: U('photo-1589394760882-8e5d6a3c33ad'), gallery: [] },
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
 * Ambientes de tercera capa (loops cortos por tipo de lugar). Se reutilizan
 * entre destinos vía audioMap → no hace falta uno único por ciudad.
 */
export const AMBIENCE = {
  /** Olas/playa: filipinas, bali, phuket. */
  beach: '/audio/amb-beach.mp3',
  /** Bullicio urbano: macau, hanoi, beijing, seul, tokio, singapur. */
  city: '/audio/amb-city.mp3',
} as const;

export type AmbienceKey = keyof typeof AMBIENCE;

export function assetsFor(id: string): DestinoAssets {
  return ASSETS[id] ?? { hero: U('photo-1469474968028-56623f02e42e'), gallery: [] };
}
