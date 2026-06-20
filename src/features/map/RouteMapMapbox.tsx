import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { RutaId, Tier } from '@/types';
import { useExperience } from '@/store/experience';
import { DESTINOS_BY_ID, destinosDeRuta } from '@/data/itinerario';
import { headingAt, interpAlongNodes, revealFraction } from './routeGeo';
import { buildGlobalRoute, cityToNode, type GlobalRoute } from './routeGeoV5';
import type { JourneyFrame } from '@/hooks/useJourneyStops';

interface Props {
  ruta: RutaId;
  tier: Tier;
}

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

function lineGeoJSON(route: GlobalRoute): GeoJSON.Feature<GeoJSON.LineString> {
  return { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: route.nodes } };
}

function makeMarker(map: mapboxgl.Map, coords: [number, number]): mapboxgl.Marker {
  const el = document.createElement('div');
  el.style.cssText =
    'width:9px;height:9px;border-radius:9999px;background:#ffc454;box-shadow:0 0 7px #ffc454,0 0 14px #ff40a0;';
  return new mapboxgl.Marker({ element: el }).setLngLat(coords).addTo(map);
}

/**
 * Mapa satélite con coreografía de DOS NIVELES. La cámara aplica `frame.camTarget`
 * (fly entre encuadres de país en 'inter', fijo en el encuadre del país en
 * 'intra'/'hold'); la línea se traza por `r` (índice de ciudad → nodo). Glow
 * pulsante decorativo por rAF. Suscripción imperativa al store (sin re-render).
 */
export default function RouteMapMapbox({ ruta, tier }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const readyRef = useRef(false);
  const routeRef = useRef<GlobalRoute>(buildGlobalRoute(destinosDeRuta(ruta)));
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const lastRevealRef = useRef(-1);
  const rafRef = useRef(0);
  const premium = tier === 'premium';

  function applyFrame(frame: JourneyFrame) {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    const { nodes, cum, cityNodeIdx } = routeRef.current;
    const nodeIdx = cityToNode(cityNodeIdx, frame.r);
    const reveal = revealFraction(cum, nodeIdx);
    const head = interpAlongNodes(nodes, nodeIdx);

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

    const fixed = frame.cameraMode === 'fixed';
    const pad = fixed ? frame.holdAmount * 360 : 0;
    const leftCard = frame.pais % 2 === 0;
    map.jumpTo({
      center: frame.camTarget.center,
      zoom: frame.camTarget.zoom,
      pitch: premium ? 33 + 17 * frame.camArc : 0,
      bearing: premium && !fixed ? headingAt(nodes, nodeIdx) * 0.35 : 0,
      padding: { top: 0, bottom: 0, left: leftCard ? pad : 0, right: leftCard ? 0 : pad },
    });
  }

  function addLayers(map: mapboxgl.Map) {
    const data = lineGeoJSON(routeRef.current);
    map.addSource('route-draw', { type: 'geojson', lineMetrics: true, data });
    map.addLayer({
      id: 'route-full',
      type: 'line',
      source: 'route-draw',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#ffffff', 'line-opacity': 0.12, 'line-width': 1.3, 'line-dasharray': [1, 3] },
    });
    map.addLayer({
      id: 'route-draw-glow',
      type: 'line',
      source: 'route-draw',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-gradient': [
          'interpolate',
          ['linear'],
          ['line-progress'],
          0, 'rgb(255,64,160)',
          1, 'rgb(255,196,84)',
        ],
        'line-width': 9,
        'line-blur': 12,
        'line-opacity': 0.5,
        'line-trim-offset': [0, 0],
      },
    });
    map.addLayer({
      id: 'route-draw',
      type: 'line',
      source: 'route-draw',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': 'rgb(255,236,180)', 'line-width': 2.4, 'line-trim-offset': [0, 0] },
    });
    map.addSource('comet', {
      type: 'geojson',
      data: { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: routeRef.current.nodes[0] } },
    });
    map.addLayer({
      id: 'comet-glow',
      type: 'circle',
      source: 'comet',
      paint: { 'circle-radius': 13, 'circle-color': 'rgb(255,196,84)', 'circle-blur': 1, 'circle-opacity': 0.5 },
    });
    map.addLayer({
      id: 'comet',
      type: 'circle',
      source: 'comet',
      paint: { 'circle-radius': 4.5, 'circle-color': '#fff' },
    });
  }

  function addMarkers(map: mapboxgl.Map) {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = routeRef.current.cities.map((c) => makeMarker(map, c.coords));
  }

  // --- Init (por cambio de tier) -------------------------------------------
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
      // Atenuar labels para mantener el mood (sin romper el contexto).
      map.getStyle().layers?.forEach((l) => {
        if (l.type === 'symbol') {
          try {
            map.setPaintProperty(l.id, 'text-opacity', 0.35);
            map.setPaintProperty(l.id, 'icon-opacity', 0.2);
          } catch {
            /* algunas capas no aceptan estas props */
          }
        }
      });
      addLayers(map);
      addMarkers(map);
      readyRef.current = true;
      applyFrame(useExperience.getState().frame);
    });

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

  // --- Suscripción al frame -------------------------------------------------
  useEffect(() => useExperience.subscribe((s) => applyFrame(s.frame)), []);

  // --- Glow pulsante decorativo (única animación temporizada) ----------------
  useEffect(() => {
    const tick = (now: number) => {
      const map = mapRef.current;
      if (map && readyRef.current) {
        try {
          map.setPaintProperty('route-draw-glow', 'line-opacity', 0.42 + 0.16 * Math.sin(now * 0.003));
        } catch {
          /* layer aún no lista */
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // --- Toggle 30/45: rehacer geometría + markers ----------------------------
  useEffect(() => {
    routeRef.current = buildGlobalRoute(destinosDeRuta(ruta));
    lastRevealRef.current = -1;
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    (map.getSource('route-draw') as mapboxgl.GeoJSONSource | undefined)?.setData(lineGeoJSON(routeRef.current));
    addMarkers(map);
    applyFrame(useExperience.getState().frame);
  }, [ruta]);

  // --- Fog teñido por temperatura -------------------------------------------
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
