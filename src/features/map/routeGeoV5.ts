import type { Ciudad, Destino } from '@/types';
import { cumulativeFractions, type LngLat } from './routeGeo';

export interface CamFrame {
  center: LngLat;
  zoom: number;
}

export interface GlobalCity {
  coords: LngLat;
  paisIdx: number;
  ciudad: Ciudad;
}

export interface GlobalRoute {
  /** Polilínea densificada (great-circle en tramos inter-país). */
  nodes: LngLat[];
  /** cumulativeFractions(nodes) — para revealFraction. */
  cum: number[];
  /** cityNodeIdx[cityIndex] = índice de nodo de esa ciudad. */
  cityNodeIdx: number[];
  cities: GlobalCity[];
  /** Por país: rango de índices de ciudad [firstCity, lastCity]. */
  paisRanges: { firstCity: number; lastCity: number }[];
  nPaises: number;
  nCiudades: number;
}

const INTER_SEGMENTS = 28;

// --- Mercator ---------------------------------------------------------------
const WORLD = 512;

export function mercX(lng: number): number {
  return (lng + 180) / 360;
}
export function mercY(lat: number): number {
  const l = (Math.max(-85.05113, Math.min(85.05113, lat)) * Math.PI) / 180;
  return (1 - Math.log(Math.tan(l) + 1 / Math.cos(l)) / Math.PI) / 2;
}
export function mercYToLat(y: number): number {
  const n = Math.PI * (1 - 2 * y);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

/** Interpolación en espacio mercator (líneas rectas visuales en el mapa). */
export function mercLerp(a: LngLat, b: LngLat, t: number): LngLat {
  const x = mercX(a[0]) + (mercX(b[0]) - mercX(a[0])) * t;
  const y = mercY(a[1]) + (mercY(b[1]) - mercY(a[1])) * t;
  return [x * 360 - 180, mercYToLat(y)];
}

/** Punto sobre la geodésica (great-circle) entre a y b a la fracción f. */
export function gcInterp(a: LngLat, b: LngLat, f: number): LngLat {
  const toRad = Math.PI / 180;
  const lat1 = a[1] * toRad,
    lon1 = a[0] * toRad,
    lat2 = b[1] * toRad,
    lon2 = b[0] * toRad;
  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((lat2 - lat1) / 2) ** 2 +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2,
      ),
    );
  if (d === 0) return a;
  const A = Math.sin((1 - f) * d) / Math.sin(d);
  const B = Math.sin(f * d) / Math.sin(d);
  const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
  const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
  const z = A * Math.sin(lat1) + B * Math.sin(lat2);
  const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
  const lon = Math.atan2(y, x);
  return [lon / toRad, lat / toRad];
}

/** Encuadre {center, zoom} que enmarca un set de coords (Web Mercator, sin mapa vivo). */
export function fitBoundsFrame(
  coords: LngLat[],
  viewport: { width: number; height: number },
  pad: { top: number; right: number; bottom: number; left: number },
  opts: { minZoom?: number; maxZoom?: number; minFrac?: number } = {},
): CamFrame {
  const xs = coords.map((c) => mercX(c[0]));
  const ys = coords.map((c) => mercY(c[1]));
  let minX = Math.min(...xs),
    maxX = Math.max(...xs);
  let minY = Math.min(...ys),
    maxY = Math.max(...ys);

  // Inflar bbox a un mínimo (países de 1 sola ciudad → evita zoom infinito).
  const minFrac = opts.minFrac ?? 0.012;
  if (maxX - minX < minFrac) {
    const c = (minX + maxX) / 2;
    minX = c - minFrac / 2;
    maxX = c + minFrac / 2;
  }
  if (maxY - minY < minFrac) {
    const c = (minY + maxY) / 2;
    minY = c - minFrac / 2;
    maxY = c + minFrac / 2;
  }

  const center: LngLat = [((minX + maxX) / 2) * 360 - 180, mercYToLat((minY + maxY) / 2)];
  const fracX = Math.max(maxX - minX, 1e-9);
  const fracY = Math.max(maxY - minY, 1e-9);
  const availW = Math.max(viewport.width - pad.left - pad.right, 1);
  const availH = Math.max(viewport.height - pad.top - pad.bottom, 1);
  const zoomX = Math.log2(availW / (fracX * WORLD));
  const zoomY = Math.log2(availH / (fracY * WORLD));
  let zoom = Math.min(zoomX, zoomY);
  zoom = Math.max(opts.minZoom ?? 1, Math.min(opts.maxZoom ?? 5.4, zoom));
  return { center, zoom };
}

/** Lerp de encuadre con arco de "vuelo" (zoom-out en el medio). */
export function flyLerpFrame(a: CamFrame, b: CamFrame, t: number, dip = 1.0): CamFrame {
  const center = mercLerp(a.center, b.center, t);
  const zBase = a.zoom + (b.zoom - a.zoom) * t;
  return { center, zoom: zBase - dip * Math.sin(Math.PI * t) };
}

/** Construye la polilínea global: ciudades en orden, arcos great-circle inter-país. */
export function buildGlobalRoute(destinos: Destino[]): GlobalRoute {
  const cities: GlobalCity[] = [];
  const paisRanges: { firstCity: number; lastCity: number }[] = [];
  destinos.forEach((d, paisIdx) => {
    const first = cities.length;
    (d.ciudades.length ? d.ciudades : [{ id: d.id, nombre: d.nombre, coords: d.coords, blurb: d.tagline, img: '' }]).forEach(
      (c) => cities.push({ coords: c.coords, paisIdx, ciudad: c }),
    );
    paisRanges.push({ firstCity: first, lastCity: cities.length - 1 });
  });

  const nodes: LngLat[] = [];
  const cityNodeIdx: number[] = [];
  for (let i = 0; i < cities.length; i++) {
    cityNodeIdx[i] = nodes.length;
    nodes.push(cities[i].coords);
    if (i < cities.length - 1 && cities[i].paisIdx !== cities[i + 1].paisIdx) {
      // tramo INTER-país → densificar great-circle (sin los extremos)
      for (let s = 1; s < INTER_SEGMENTS; s++) {
        nodes.push(gcInterp(cities[i].coords, cities[i + 1].coords, s / INTER_SEGMENTS));
      }
    }
  }

  return {
    nodes,
    cum: cumulativeFractions(nodes),
    cityNodeIdx,
    cities,
    paisRanges,
    nPaises: destinos.length,
    nCiudades: cities.length,
  };
}

/** Traduce un índice de ciudad (float) a índice de nodo (float) en la polilínea. */
export function cityToNode(cityNodeIdx: number[], rCity: number): number {
  const i = Math.max(0, Math.min(cityNodeIdx.length - 1, Math.floor(rCity)));
  const f = rCity - i;
  if (i >= cityNodeIdx.length - 1) return cityNodeIdx[cityNodeIdx.length - 1];
  return cityNodeIdx[i] + f * (cityNodeIdx[i + 1] - cityNodeIdx[i]);
}
