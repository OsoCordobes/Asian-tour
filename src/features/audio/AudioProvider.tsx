import { useEffect, useRef } from 'react';
import { Howl, Howler } from 'howler';
import { useExperience } from '@/store/experience';
import { DESTINOS_BY_ID } from '@/data/itinerario';
import { AUDIO } from '@/data/assets';
import { ambienceSrcFor } from './audioMap';

/**
 * Beds ambiente por región con crossfade (warm <-> cold) y swell en el clímax.
 * Solo arranca tras el gate de auriculares (audioUnlocked). Howl usa html5 para
 * streaming y no reventar memoria en mobile. Si los archivos no existen, falla
 * en silencio — el audio es enhancement.
 *
 * Capas:
 *  1-2. Beds warm/cold (música ambiente, vol ~0.3) que crossfadean por región.
 *  3.   Ambiente por destino (olas/ciudad, vol ~0.2) que fade-out/in al cambiar
 *       de destino, por debajo de la música.
 */

const BED_VOL = 0.3;
const AMB_VOL = 0.2;
const FADE_MS = 1800;

export function AudioProvider() {
  const audioUnlocked = useExperience((s) => s.audioUnlocked);
  const muted = useExperience((s) => s.muted);
  const activeDestino = useExperience((s) => s.activeDestino);

  const warmRef = useRef<Howl | null>(null);
  const coldRef = useRef<Howl | null>(null);
  const currentRegion = useRef<'sudeste' | 'norte' | null>(null);

  // Capa de ambiente por destino.
  const ambRef = useRef<Howl | null>(null);
  const ambSrc = useRef<string | null>(null);

  useEffect(() => {
    if (!audioUnlocked) return;
    warmRef.current = new Howl({ src: [AUDIO.bedWarm], loop: true, volume: 0, html5: true });
    coldRef.current = new Howl({ src: [AUDIO.bedCold], loop: true, volume: 0, html5: true });
    warmRef.current.play();
    coldRef.current.play();
    return () => {
      warmRef.current?.unload();
      coldRef.current?.unload();
      ambRef.current?.unload();
      warmRef.current = null;
      coldRef.current = null;
      ambRef.current = null;
      currentRegion.current = null;
      ambSrc.current = null;
    };
  }, [audioUnlocked]);

  useEffect(() => {
    Howler.mute(muted);
  }, [muted]);

  // Crossfade de beds warm/cold por región.
  useEffect(() => {
    if (!audioUnlocked || !activeDestino) return;
    const region = DESTINOS_BY_ID[activeDestino]?.region ?? 'sudeste';
    if (region === currentRegion.current) return;
    currentRegion.current = region;
    if (region === 'sudeste') {
      warmRef.current?.fade(warmRef.current.volume(), BED_VOL, FADE_MS);
      coldRef.current?.fade(coldRef.current.volume(), 0, FADE_MS);
    } else {
      coldRef.current?.fade(coldRef.current.volume(), BED_VOL, FADE_MS);
      warmRef.current?.fade(warmRef.current.volume(), 0, FADE_MS);
    }
  }, [activeDestino, audioUnlocked]);

  // Tercera capa: ambiente por destino (olas/ciudad), por debajo de la música.
  useEffect(() => {
    if (!audioUnlocked || !activeDestino) return;
    const destino = DESTINOS_BY_ID[activeDestino];
    if (!destino) return;
    const nextSrc = ambienceSrcFor(destino);
    if (nextSrc === ambSrc.current) return;

    const previous = ambRef.current;
    if (previous) {
      // Fade-out del ambiente anterior y descarga al terminar.
      previous.fade(previous.volume(), 0, FADE_MS);
      previous.once('fade', () => previous.unload());
    }

    ambSrc.current = nextSrc;
    const next = new Howl({ src: [nextSrc], loop: true, volume: 0, html5: true });
    next.play();
    next.fade(0, AMB_VOL, FADE_MS);
    ambRef.current = next;
  }, [activeDestino, audioUnlocked]);

  return null;
}
