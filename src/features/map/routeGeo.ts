import type { RutaId } from '@/types';
import { destinosDeRuta, ORIGEN } from '@/data/itinerario';

export interface RoutePoint {
  id: string;
  nombre: string;
  lng: number;
  lat: number;
}

/** Puntos ordenados de la ruta (sin CPH, que es origen/retorno lejano). */
export function routePoints(ruta: RutaId): RoutePoint[] {
  return destinosDeRuta(ruta).map((d) => ({
    id: d.id,
    nombre: d.nombre,
    lng: d.coords[0],
    lat: d.coords[1],
  }));
}

/** GeoJSON LineString para Mapbox (incluye el arco de retorno a CPH al final). */
export function routeGeoJSON(ruta: RutaId): GeoJSON.Feature<GeoJSON.LineString> {
  const pts = routePoints(ruta);
  const coords = pts.map((p) => [p.lng, p.lat] as [number, number]);
  coords.push([ORIGEN.coords[0], ORIGEN.coords[1]]);
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'LineString', coordinates: coords },
  };
}

export interface Projector {
  width: number;
  height: number;
  project: (lng: number, lat: number) => { x: number; y: number };
}

/**
 * Proyección equirectangular simple a un viewBox con padding, ajustada a los
 * bounds de la ruta. Para el mapa Static (SVG), sin dependencias.
 */
export function makeProjector(
  pts: RoutePoint[],
  width = 1000,
  height = 620,
  pad = 90,
): Projector {
  const lngs = pts.map((p) => p.lng);
  const lats = pts.map((p) => p.lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const spanLng = maxLng - minLng || 1;
  const spanLat = maxLat - minLat || 1;

  return {
    width,
    height,
    project: (lng, lat) => ({
      x: pad + ((lng - minLng) / spanLng) * (width - pad * 2),
      // lat invertida (norte arriba)
      y: pad + (1 - (lat - minLat) / spanLat) * (height - pad * 2),
    }),
  };
}

// --- Helpers para el trazado scroll-driven sobre Mapbox -------------------

export type LngLat = [number, number];

/** Coords ordenadas de la ruta (solo destinos, sin el arco de retorno a CPH). */
export function routeDrawCoords(ruta: RutaId): LngLat[] {
  return routePoints(ruta).map((p) => [p.lng, p.lat]);
}

function haversine(a: LngLat, b: LngLat): number {
  const R = 6371;
  const dLat = ((b[1] - a[1]) * Math.PI) / 180;
  const dLng = ((b[0] - a[0]) * Math.PI) / 180;
  const lat1 = (a[1] * Math.PI) / 180;
  const lat2 = (b[1] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Fracción acumulada de longitud (0..1) en cada nodo de la ruta. */
export function cumulativeFractions(coords: LngLat[]): number[] {
  const segs: number[] = [0];
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversine(coords[i - 1], coords[i]);
    segs.push(total);
  }
  return total > 0 ? segs.map((s) => s / total) : segs.map(() => 0);
}

/**
 * "node-space": r ∈ [0, n-1] mapea linealmente al índice de destino, así la
 * cámara/cometa quedan sobre el destino cuyo panel está centrado.
 */
export function indexFloat(progress: number, n: number): number {
  return Math.max(0, Math.min(1, progress)) * (n - 1);
}

/** Punto interpolado a lo largo de los nodos según r (node-space). */
export function interpAlongNodes(coords: LngLat[], r: number): LngLat {
  const i = Math.floor(r);
  const t = r - i;
  if (i >= coords.length - 1) return coords[coords.length - 1];
  const a = coords[i];
  const b = coords[i + 1];
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/** Fracción de longitud de la línea (0..1) en la posición node-space r. */
export function revealFraction(cumFr: number[], r: number): number {
  const i = Math.floor(r);
  const t = r - i;
  if (i >= cumFr.length - 1) return 1;
  return cumFr[i] + (cumFr[i + 1] - cumFr[i]) * t;
}

/** Rumbo (bearing, grados) del segmento actual, para "volar" a lo largo del path. */
export function headingAt(coords: LngLat[], r: number): number {
  const i = Math.min(Math.floor(r), coords.length - 2);
  if (i < 0) return 0;
  const a = coords[i];
  const b = coords[i + 1];
  const y = Math.sin(((b[0] - a[0]) * Math.PI) / 180) * Math.cos((b[1] * Math.PI) / 180);
  const x =
    Math.cos((a[1] * Math.PI) / 180) * Math.sin((b[1] * Math.PI) / 180) -
    Math.sin((a[1] * Math.PI) / 180) *
      Math.cos((b[1] * Math.PI) / 180) *
      Math.cos(((b[0] - a[0]) * Math.PI) / 180);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

/** GeoJSON LineString solo de destinos (para el trazado con line-trim-offset). */
export function drawLineGeoJSON(ruta: RutaId): GeoJSON.Feature<GeoJSON.LineString> {
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'LineString', coordinates: routeDrawCoords(ruta) },
  };
}

/** Path SVG suave (curvas) que conecta los puntos proyectados. */
export function svgPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const cur = pts[i];
    const mx = (prev.x + cur.x) / 2;
    const my = (prev.y + cur.y) / 2;
    d += ` Q ${prev.x} ${prev.y} ${mx} ${my}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}
