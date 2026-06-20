import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { RutaId, Tier } from '@/types';
import { useExperience } from '@/store/experience';
import { DESTINOS_BY_ID } from '@/data/itinerario';
import {
  cumulativeFractions,
  drawLineGeoJSON,
  headingAt,
  interpAlongNodes,
  revealFraction,
  routeDrawCoords,
  routeGeoJSON,
  routePoints,
  type LngLat,
} from './routeGeo';

interface Props {
  ruta: RutaId;
  tier: Tier;
}

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

/**
 * Tier Mapbox. El recorrido se TRAZA al scrollear (line-trim-offset revelando la
 * línea según journeyProgress) y la cámara + un punto-cometa siguen la cabeza del
 * trazo. Premium (desktop): globo + pitch + bearing a lo largo del path. Lite
 * (mobile): plano. Se suscribe imperativamente al store para no re-renderizar en
 * cada tick de scroll. Default export para lazy-loading.
 */
export default function RouteMapMapbox({ ruta, tier }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const readyRef = useRef(false);
  const coordsRef = useRef<LngLat[]>(routeDrawCoords(ruta));
  const cumRef = useRef<number[]>(cumulativeFractions(coordsRef.current));
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const lastRevealRef = useRef(-1);
  const premium = tier === 'premium';

  // --- Init (una vez por cambio de tier) -----------------------------------
  useEffect(() => {
    if (!TOKEN || !containerRef.current) return;
    mapboxgl.accessToken = TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: coordsRef.current[0],
      zoom: premium ? 4.4 : 3.8,
      projection: premium ? 'globe' : 'mercator',
      pitch: premium ? 50 : 0,
      attributionControl: false,
      interactive: false,
      fadeDuration: 0,
    });
    mapRef.current = map;

    map.on('style.load', () => {
      map.setFog({
        color: 'rgb(8,8,11)',
        'high-color': 'rgb(40,20,50)',
        'space-color': 'rgb(4,4,8)',
        'horizon-blend': 0.1,
        'star-intensity': premium ? 0.5 : 0.2,
      });

      // Línea completa, tenue (incluye el arco de retorno a CPH).
      map.addSource('route-full', { type: 'geojson', data: routeGeoJSON(ruta) });
      map.addLayer({
        id: 'route-full',
        type: 'line',
        source: 'route-full',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#ffffff', 'line-opacity': 0.1, 'line-width': 1.5, 'line-dasharray': [1, 3] },
      });

      // Línea que se dibuja (solo destinos). lineMetrics para line-trim-offset.
      map.addSource('route-draw', { type: 'geojson', lineMetrics: true, data: drawLineGeoJSON(ruta) });
      map.addLayer({
        id: 'route-draw-glow',
        type: 'line',
        source: 'route-draw',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': 'rgb(255,64,160)',
          'line-width': 9,
          'line-blur': 12,
          'line-opacity': 0.55,
          'line-trim-offset': [0, 0],
        },
      });
      map.addLayer({
        id: 'route-draw',
        type: 'line',
        source: 'route-draw',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': 'rgb(255,196,84)',
          'line-width': 2.6,
          'line-trim-offset': [0, 0],
        },
      });

      // Cometa en la cabeza del trazo.
      map.addSource('comet', {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: coordsRef.current[0] } },
      });
      map.addLayer({
        id: 'comet-glow',
        type: 'circle',
        source: 'comet',
        paint: { 'circle-radius': 14, 'circle-color': 'rgb(255,196,84)', 'circle-blur': 1, 'circle-opacity': 0.5 },
      });
      map.addLayer({
        id: 'comet',
        type: 'circle',
        source: 'comet',
        paint: { 'circle-radius': 5, 'circle-color': '#fff' },
      });

      readyRef.current = true;
      applyFrame(useExperience.getState().frame);
    });

    // Marcadores pulsantes por destino.
    markersRef.current = routePoints(ruta).map((p) => {
      const el = document.createElement('div');
      el.style.cssText =
        'width:10px;height:10px;border-radius:9999px;background:#ffc454;box-shadow:0 0 8px #ffc454,0 0 16px #ff40a0;';
      return new mapboxgl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map);
    });

    return () => {
      readyRef.current = false;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier]);

  // --- Trazado + cámara imperativos, dirigidos por el frame de paradas ------
  function applyFrame(frame: { r: number; holdAmount: number; stop: number }) {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    const coords = coordsRef.current;
    const r = Math.min(frame.r, coords.length - 1);
    const reveal = revealFraction(cumRef.current, r);
    const head = interpAlongNodes(coords, r);

    // Dedupe: en el hold `reveal` no cambia → no reescribir la línea ni el cometa.
    if (Math.abs(reveal - lastRevealRef.current) > 1e-4) {
      lastRevealRef.current = reveal;
      const trim: [number, number] = [Math.min(reveal, 1), 1];
      map.setPaintProperty('route-draw', 'line-trim-offset', trim);
      map.setPaintProperty('route-draw-glow', 'line-trim-offset', trim);
      (map.getSource('comet') as mapboxgl.GeoJSONSource | undefined)?.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: head },
      });
    }

    // Cámara: push de "llegada" (zoom in) modulado por holdAmount; bearing y
    // pitch se relajan al detenerse. Padding empuja el destino al lado opuesto
    // de la card para que el vidrio no lo tape.
    const ease = 1 - Math.pow(1 - frame.holdAmount, 3); // easeOutCubic
    const zoom = (premium ? 4.7 : 4) + (premium ? 0.9 : 0.6) * ease;
    const leftCard = frame.stop % 2 === 0;
    const pad = premium ? 360 * frame.holdAmount : 0;

    map.jumpTo({
      center: head,
      zoom,
      pitch: premium ? 50 + 6 * ease : 0,
      bearing: premium ? headingAt(coords, r) * 0.4 * (1 - frame.holdAmount) : 0,
      padding: { top: 0, bottom: 0, left: leftCard ? pad : 0, right: leftCard ? 0 : pad },
    });
  }

  useEffect(() => {
    const unsub = useExperience.subscribe((state) => {
      applyFrame(state.frame);
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Toggle 30/45: rehacer datos + recomputar fracciones ------------------
  useEffect(() => {
    coordsRef.current = routeDrawCoords(ruta);
    cumRef.current = cumulativeFractions(coordsRef.current);
    lastRevealRef.current = -1; // forzar redibujo tras cambiar los datos
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    (map.getSource('route-full') as mapboxgl.GeoJSONSource | undefined)?.setData(routeGeoJSON(ruta));
    (map.getSource('route-draw') as mapboxgl.GeoJSONSource | undefined)?.setData(drawLineGeoJSON(ruta));
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = routePoints(ruta).map((p) => {
      const el = document.createElement('div');
      el.style.cssText =
        'width:10px;height:10px;border-radius:9999px;background:#ffc454;box-shadow:0 0 8px #ffc454,0 0 16px #ff40a0;';
      return new mapboxgl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map);
    });
    applyFrame(useExperience.getState().frame);
  }, [ruta]);

  // --- Fog teñido por temperatura (región del destino activo) ---------------
  useEffect(() => {
    const unsub = useExperience.subscribe((state) => {
      const map = mapRef.current;
      if (!map || !readyRef.current || !state.activeDestino) return;
      const region = DESTINOS_BY_ID[state.activeDestino]?.region;
      map.setFog({
        'high-color': region === 'norte' ? 'rgb(30,40,80)' : 'rgb(60,20,50)',
      });
    });
    return unsub;
  }, []);

  if (!TOKEN) return null;
  return <div ref={containerRef} className="absolute inset-0 h-full w-full" />;
}
