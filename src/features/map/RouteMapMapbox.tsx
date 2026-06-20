import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { RutaId, Tier } from '@/types';
import { useExperience } from '@/store/experience';
import { DESTINOS_BY_ID, destinosDeRuta } from '@/data/itinerario';
import { headingAt, revealFraction } from './routeGeo';
import {
  buildGlobalRoute,
  cityToNode,
  mercX,
  mercY,
  mercYToLat,
  pointAtFraction,
  type GlobalRoute,
} from './routeGeoV5';

interface Props {
  ruta: RutaId;
  tier: Tier;
}

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
const TAU_CAM = 0.14; // s — constante de tiempo cámara
const TAU_LINE = 0.1; // s — línea/cometa (más responsivo)
const TRAIL = 0.05; // fracción de línea como cola del cometa

interface CamState {
  cmx: number;
  cmy: number;
  zoom: number;
  pitch: number;
  bearing: number;
  reveal: number;
}

function lineGeoJSON(route: GlobalRoute): GeoJSON.Feature<GeoJSON.LineString> {
  return { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: route.nodes } };
}

/**
 * Mapa satélite, coreografía de dos niveles. El render está DESACOPLADO del
 * scroll: la suscripción al store solo escribe `target`; un rAF único lleva
 * `displayed → target` con suavizado exponencial (filtro de 1er orden, sin
 * overshoot) y lo aplica con jumpTo. Cometa alineado por arc-length (mismo
 * parámetro que la línea) + cola. Sin padding dinámico → mapa quieto en cada país.
 */
export default function RouteMapMapbox({ ruta, tier }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const readyRef = useRef(false);
  const routeRef = useRef<GlobalRoute>(buildGlobalRoute(destinosDeRuta(ruta)));
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const rafRef = useRef(0);
  const premium = tier === 'premium';

  const target = useRef<CamState>({ cmx: 0, cmy: 0, zoom: 4, pitch: 0, bearing: 0, reveal: 0 });
  const disp = useRef<CamState>({ ...target.current });
  const lastApplied = useRef<CamState>({ cmx: -999, cmy: 0, zoom: 0, pitch: 0, bearing: 0, reveal: -1 });
  const initedTarget = useRef(false);
  const lastTimeRef = useRef(0);

  function writeTarget() {
    const f = useExperience.getState().frame;
    const { nodes, cum, cityNodeIdx } = routeRef.current;
    const nodeIdx = cityToNode(cityNodeIdx, f.r);
    target.current.cmx = mercX(f.camTarget.center[0]);
    target.current.cmy = mercY(f.camTarget.center[1]);
    target.current.zoom = f.camTarget.zoom;
    target.current.pitch = premium ? 33 + 17 * f.camArc : 0;
    target.current.bearing =
      premium && f.cameraMode !== 'fixed' ? headingAt(nodes, nodeIdx) * 0.35 : 0;
    target.current.reveal = revealFraction(cum, nodeIdx);
    if (!initedTarget.current) {
      disp.current = { ...target.current };
      initedTarget.current = true;
    }
  }

  function applyDisplayed(now: number) {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    const d = disp.current;
    const la = lastApplied.current;

    const camMoved =
      Math.abs(d.cmx - la.cmx) > 1e-6 ||
      Math.abs(d.cmy - la.cmy) > 1e-6 ||
      Math.abs(d.zoom - la.zoom) > 1e-4 ||
      Math.abs(d.pitch - la.pitch) > 1e-3 ||
      Math.abs(d.bearing - la.bearing) > 1e-3;

    if (camMoved) {
      map.jumpTo({
        center: [d.cmx * 360 - 180, mercYToLat(d.cmy)],
        zoom: d.zoom,
        pitch: d.pitch,
        bearing: d.bearing,
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
      });
      la.cmx = d.cmx;
      la.cmy = d.cmy;
      la.zoom = d.zoom;
      la.pitch = d.pitch;
      la.bearing = d.bearing;
    }

    if (Math.abs(d.reveal - la.reveal) > 2e-5) {
      la.reveal = d.reveal;
      const r = Math.min(1, Math.max(0, d.reveal));
      map.setPaintProperty('route-draw', 'line-trim-offset', [r, 1]);
      map.setPaintProperty('route-draw-glow', 'line-trim-offset', [r, 1]);
      map.setPaintProperty('route-trail', 'line-trim-offset', [Math.max(0, r - TRAIL), r]);
      const { nodes, cum } = routeRef.current;
      const head = pointAtFraction(nodes, cum, r);
      (map.getSource('comet') as mapboxgl.GeoJSONSource | undefined)?.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: head },
      });
    }

    // Pulso decorativo del glow + cabeza del cometa.
    const pulse = 0.42 + 0.16 * Math.sin(now * 0.003);
    map.setPaintProperty('route-draw-glow', 'line-opacity', pulse);
    map.setPaintProperty('comet-glow', 'circle-radius', 12 + 2.5 * Math.sin(now * 0.004));
  }

  function tick(now: number) {
    const last = lastTimeRef.current || now;
    lastTimeRef.current = now;
    const dt = Math.min(0.05, (now - last) / 1000);
    const kc = 1 - Math.exp(-dt / TAU_CAM);
    const kl = 1 - Math.exp(-dt / TAU_LINE);
    const d = disp.current;
    const t = target.current;
    d.cmx += (t.cmx - d.cmx) * kc;
    d.cmy += (t.cmy - d.cmy) * kc;
    d.zoom += (t.zoom - d.zoom) * kc;
    d.pitch += (t.pitch - d.pitch) * kc;
    // bearing por el camino corto
    let db = t.bearing - d.bearing;
    while (db > 180) db -= 360;
    while (db < -180) db += 360;
    d.bearing += db * kc;
    d.reveal += (t.reveal - d.reveal) * kl;
    if (Math.abs(t.reveal - d.reveal) < 5e-4) d.reveal = t.reveal; // mata la asíntota
    applyDisplayed(now);
    rafRef.current = requestAnimationFrame(tick);
  }

  function addLayers(map: mapboxgl.Map) {
    map.addSource('route-draw', { type: 'geojson', lineMetrics: true, data: lineGeoJSON(routeRef.current) });
    map.addLayer({
      id: 'route-full',
      type: 'line',
      source: 'route-draw',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#ffffff', 'line-opacity': 0.1, 'line-width': 1.2, 'line-dasharray': [1, 3] },
    });
    map.addLayer({
      id: 'route-draw-glow',
      type: 'line',
      source: 'route-draw',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-gradient': ['interpolate', ['linear'], ['line-progress'], 0, 'rgb(255,64,160)', 1, 'rgb(255,196,84)'],
        'line-width': 8,
        'line-blur': 12,
        'line-opacity': 0.5,
        'line-trim-offset': [0, 0],
      },
    });
    map.addLayer({
      id: 'route-trail',
      type: 'line',
      source: 'route-draw',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': 'rgb(255,224,150)', 'line-width': 5, 'line-blur': 6, 'line-opacity': 0.85, 'line-trim-offset': [0, 0] },
    });
    map.addLayer({
      id: 'route-draw',
      type: 'line',
      source: 'route-draw',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': 'rgb(255,238,190)', 'line-width': 2.2, 'line-trim-offset': [0, 0] },
    });
    map.addSource('comet', {
      type: 'geojson',
      data: { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: routeRef.current.nodes[0] } },
    });
    map.addLayer({ id: 'comet-glow', type: 'circle', source: 'comet', paint: { 'circle-radius': 12, 'circle-color': 'rgb(255,200,90)', 'circle-blur': 1, 'circle-opacity': 0.55 } });
    map.addLayer({ id: 'comet', type: 'circle', source: 'comet', paint: { 'circle-radius': 4.5, 'circle-color': '#fff' } });
  }

  function addMarkers(map: mapboxgl.Map) {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = routeRef.current.cities.map((c) => {
      const el = document.createElement('div');
      el.style.cssText =
        'width:8px;height:8px;border-radius:9999px;background:#ffd27a;box-shadow:0 0 6px #ffc454,0 0 12px #ff40a0;';
      return new mapboxgl.Marker({ element: el }).setLngLat(c.coords).addTo(map);
    });
  }

  useEffect(() => {
    if (!TOKEN || !containerRef.current) return;
    mapboxgl.accessToken = TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: routeRef.current.nodes[0],
      zoom: premium ? 3.6 : 3.2,
      projection: premium ? 'globe' : 'mercator',
      pitch: premium ? 33 : 0,
      attributionControl: false,
      interactive: false,
      fadeDuration: 0,
    });
    mapRef.current = map;

    map.on('style.load', () => {
      map.setFog({
        color: 'rgb(8,8,11)',
        'high-color': 'rgb(30,20,45)',
        'space-color': 'rgb(3,3,7)',
        'horizon-blend': 0.12,
        'star-intensity': premium ? 0.55 : 0.2,
      });
      map.getStyle().layers?.forEach((l) => {
        if (l.type === 'symbol') {
          try {
            map.setPaintProperty(l.id, 'text-opacity', 0.3);
            map.setPaintProperty(l.id, 'icon-opacity', 0.15);
          } catch {
            /* noop */
          }
        }
      });
      addLayers(map);
      addMarkers(map);
      initedTarget.current = false;
      writeTarget();
      disp.current = { ...target.current };
      lastApplied.current.reveal = -1;
      readyRef.current = true;
    });

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      readyRef.current = false;
      cancelAnimationFrame(rafRef.current);
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier]);

  // Suscripción: solo actualiza el TARGET (el rAF lo persigue).
  useEffect(() => useExperience.subscribe(() => writeTarget()), []);

  // Toggle 30/45: rehacer geometría + markers + snap.
  useEffect(() => {
    routeRef.current = buildGlobalRoute(destinosDeRuta(ruta));
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    (map.getSource('route-draw') as mapboxgl.GeoJSONSource | undefined)?.setData(lineGeoJSON(routeRef.current));
    addMarkers(map);
    writeTarget();
    disp.current = { ...target.current };
    lastApplied.current.reveal = -1;
  }, [ruta]);

  // Fog teñido por temperatura.
  useEffect(
    () =>
      useExperience.subscribe((s) => {
        const map = mapRef.current;
        if (!map || !readyRef.current || !s.activeDestino) return;
        const region = DESTINOS_BY_ID[s.activeDestino]?.region;
        map.setFog({ 'high-color': region === 'norte' ? 'rgb(26,36,72)' : 'rgb(54,20,46)' });
      }),
    [],
  );

  if (!TOKEN) return null;
  return <div ref={containerRef} className="absolute inset-0 h-full w-full" />;
}
