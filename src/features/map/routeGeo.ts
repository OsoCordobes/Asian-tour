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
