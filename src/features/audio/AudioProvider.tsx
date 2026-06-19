import { useEffect, useRef } from 'react';
import { Howl, Howler } from 'howler';
import { useExperience } from '@/store/experience';
import { DESTINOS_BY_ID } from '@/data/itinerario';
import { AUDIO } from '@/data/assets';

/**
 * Beds ambiente por región con crossfade (warm <-> cold) y swell en el clímax.
 * Solo arranca tras el gate de auriculares (audioUnlocked). Howl usa html5 para
 * streaming y no reventar memoria en mobile. Si los archivos no existen, falla
 * en silencio — el audio es enhancement.
 */
export function AudioProvider() {
  const audioUnlocked = useExperience((s) => s.audioUnlocked);
  const muted = useExperience((s) => s.muted);
  const activeDestino = useExperience((s) => s.activeDestino);

  const warmRef = useRef<Howl | null>(null);
  const coldRef = useRef<Howl | null>(null);
  const currentRegion = useRef<'sudeste' | 'norte' | null>(null);

  useEffect(() => {
    if (!audioUnlocked) return;
    warmRef.current = new Howl({ src: [AUDIO.bedWarm], loop: true, volume: 0, html5: true });
    coldRef.current = new Howl({ src: [AUDIO.bedCold], loop: true, volume: 0, html5: true });
    warmRef.current.play();
    coldRef.current.play();
    return () => {
      warmRef.current?.unload();
      coldRef.current?.unload();
    };
  }, [audioUnlocked]);

  useEffect(() => {
    Howler.mute(muted);
  }, [muted]);

  useEffect(() => {
    if (!audioUnlocked || !activeDestino) return;
    const region = DESTINOS_BY_ID[activeDestino]?.region ?? 'sudeste';
    if (region === currentRegion.current) return;
    currentRegion.current = region;
    const target = 0.35;
    if (region === 'sudeste') {
      warmRef.current?.fade(warmRef.current.volume(), target, 1800);
      coldRef.current?.fade(coldRef.current.volume(), 0, 1800);
    } else {
      coldRef.current?.fade(coldRef.current.volume(), target, 1800);
      warmRef.current?.fade(warmRef.current.volume(), 0, 1800);
    }
  }, [activeDestino, audioUnlocked]);

  return null;
}
