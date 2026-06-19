import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { RutaId, Tier } from '@/types';
import { routeGeoJSON, routePoints } from './routeGeo';

interface Props {
  ruta: RutaId;
  activeIndex: number;
  tier: Tier;
}

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

/**
 * Tier Mapbox. Premium (desktop): proyección globo + terreno 3D + flyTo
 * cinematográfico. Lite (mobile capaz): mercator plano, sin terreno. La cámara
 * sigue al destino activo. Default export para lazy-loading.
 */
export default function RouteMapMapbox({ ruta, activeIndex, tier }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const readyRef = useRef(false);

  useEffect(() => {
    if (!TOKEN || !containerRef.current) return;
    mapboxgl.accessToken = TOKEN;
    const premium = tier === 'premium';

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [113.5, 22.2],
      zoom: 3,
      projection: premium ? 'globe' : 'mercator',
      attributionControl: false,
      pitch: premium ? 45 : 0,
    });
    mapRef.current = map;

    map.on('style.load', () => {
      map.setFog({
        color: 'rgb(8,8,11)',
        'high-color': 'rgb(20,20,40)',
        'space-color': 'rgb(4,4,8)',
        'star-intensity': 0.5,
      });

      if (premium) {
        map.addSource('dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
        });
        map.setTerrain({ source: 'dem', exaggeration: 1.3 });
      }

      map.addSource('route', { type: 'geojson', data: routeGeoJSON(ruta) });
      map.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#ff40a0',
          'line-width': 4,
          'line-blur': 6,
          'line-opacity': 0.9,
        },
      });

      readyRef.current = true;
    });

    // Marcadores pulsantes
    const pts = routePoints(ruta);
    const markers = pts.map((p) => {
      const el = document.createElement('div');
      el.className = 'mb-node';
      el.style.cssText =
        'width:12px;height:12px;border-radius:9999px;background:#ffc454;box-shadow:0 0 10px #ffc454,0 0 20px #ff40a0;';
      return new mapboxgl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map);
    });

    return () => {
      markers.forEach((m) => m.remove());
      map.remove();
      mapRef.current = null;
      readyRef.current = false;
    };
  }, [ruta, tier]);

  // Actualizar la ruta al togglear 30/45.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    const src = map.getSource('route') as mapboxgl.GeoJSONSource | undefined;
    src?.setData(routeGeoJSON(ruta));
  }, [ruta]);

  // flyTo cinematográfico al destino activo.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || activeIndex < 0) return;
    const pts = routePoints(ruta);
    const p = pts[activeIndex];
    if (!p) return;
    map.flyTo({
      center: [p.lng, p.lat],
      zoom: tier === 'premium' ? 5.2 : 4.4,
      pitch: tier === 'premium' ? 55 : 0,
      duration: 2600,
      essential: true,
      curve: 1.6,
    });
  }, [activeIndex, ruta, tier]);

  if (!TOKEN) return null;
  return <div ref={containerRef} className="absolute inset-0 h-full w-full" />;
}
