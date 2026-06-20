import { useEffect, useRef } from 'react';
import { Howl, Howler } from 'howler';
import { useExperience } from '@/store/experience';
import { DESTINOS_BY_ID, destinosDeRuta } from '@/data/itinerario';
import { AUDIO } from '@/data/assets';
import { ambienceSrcFor } from './audioMap';
import type { Destino } from '@/types';

/**
 * Audio del Acto 2. Tres capas, tras el gate de auriculares:
 *  1-2. Beds warm/cold (música, SUTIL) que crossfadean por región — colchón de
 *       continuidad.
 *  3.   Ambiente real por destino (PROTAGONISTA): durante el VIAJE entre i→i+1
 *       hace un crossfade equal-power continuo dirigido por el scroll; en la
 *       PARADA suena solo el ambiente de ese destino. Cache de Howls + LRU para
 *       no crear/destruir por tick. (iOS Safari ignora volume() en <audio>: ahí
 *       el crossfade degrada a discreto, aceptable — desktop-primary.)
 */

const BED_VOL = 0.22;
const AMB_VOL = 0.32;
const REGION_FADE_MS = 1800;

export function AudioProvider() {
  const audioUnlocked = useExperience((s) => s.audioUnlocked);
  const muted = useExperience((s) => s.muted);
  const activeDestino = useExperience((s) => s.activeDestino);
  const ruta = useExperience((s) => s.ruta);

  const warmRef = useRef<Howl | null>(null);
  const coldRef = useRef<Howl | null>(null);
  const currentRegion = useRef<'sudeste' | 'norte' | null>(null);

  // Ambiente por destino: cache index → Howl.
  const ambCache = useRef<Map<number, Howl>>(new Map());
  const destinosRef = useRef<Destino[]>(destinosDeRuta(ruta));

  // Mantener la lista de destinos y limpiar el cache al togglear 30/45.
  useEffect(() => {
    destinosRef.current = destinosDeRuta(ruta);
    ambCache.current.forEach((h) => h.unload());
    ambCache.current.clear();
  }, [ruta]);

  // Arranque tras el gate.
  useEffect(() => {
    if (!audioUnlocked) return;
    warmRef.current = new Howl({ src: [AUDIO.bedWarm], loop: true, volume: 0, html5: true });
    coldRef.current = new Howl({ src: [AUDIO.bedCold], loop: true, volume: 0, html5: true });
    warmRef.current.play();
    coldRef.current.play();
    return () => {
      warmRef.current?.unload();
      coldRef.current?.unload();
      ambCache.current.forEach((h) => h.unload());
      ambCache.current.clear();
      warmRef.current = null;
      coldRef.current = null;
      currentRegion.current = null;
    };
  }, [audioUnlocked]);

  useEffect(() => {
    Howler.mute(muted);
  }, [muted]);

  // Crossfade de beds warm/cold por región (sutil).
  useEffect(() => {
    if (!audioUnlocked || !activeDestino) return;
    const region = DESTINOS_BY_ID[activeDestino]?.region ?? 'sudeste';
    if (region === currentRegion.current) return;
    currentRegion.current = region;
    const warm = warmRef.current;
    const cold = coldRef.current;
    if (region === 'sudeste') {
      warm?.fade(warm.volume(), BED_VOL, REGION_FADE_MS);
      cold?.fade(cold.volume(), 0, REGION_FADE_MS);
    } else {
      cold?.fade(cold.volume(), BED_VOL, REGION_FADE_MS);
      warm?.fade(warm.volume(), 0, REGION_FADE_MS);
    }
  }, [activeDestino, audioUnlocked]);

  // Capa de ambiente: crossfade scroll-driven (suscripción imperativa al frame).
  useEffect(() => {
    function ensure(idx: number): Howl | null {
      const d = destinosRef.current[idx];
      if (!d) return null;
      let h = ambCache.current.get(idx);
      if (!h) {
        h = new Howl({ src: [ambienceSrcFor(d)], loop: true, volume: 0, html5: true });
        h.play();
        ambCache.current.set(idx, h);
      }
      return h;
    }
    function setVol(h: Howl | null, v: number) {
      if (h && Math.abs(h.volume() - v) > 0.005) h.volume(v);
    }

    const unsub = useExperience.subscribe((state) => {
      if (!state.audioUnlocked) return;
      const { phase, mixFrom, mixTo, mixT, stop } = state.frame;

      if (phase === 'travel') {
        // equal-power: mantiene el loudness percibido constante en el cruce.
        setVol(ensure(mixFrom), AMB_VOL * Math.cos((mixT * Math.PI) / 2));
        setVol(ensure(mixTo), AMB_VOL * Math.sin((mixT * Math.PI) / 2));
      } else {
        setVol(ensure(stop), AMB_VOL);
      }

      // Silenciar el resto + LRU (descargar los lejanos al stop actual).
      ambCache.current.forEach((h, idx) => {
        const keep =
          phase === 'travel' ? idx === mixFrom || idx === mixTo : idx === stop;
        if (keep) return;
        setVol(h, 0);
        if (Math.abs(idx - stop) >= 2) {
          h.unload();
          ambCache.current.delete(idx);
        }
      });
    });
    return unsub;
  }, []);

  return null;
}
