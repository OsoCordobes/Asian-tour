import { create } from 'zustand';
import type { Capabilities } from '@/lib/capabilities';
import { detectCapabilities } from '@/lib/capabilities';
import type { RutaId } from '@/types';
import type { JourneyFrame } from '@/hooks/useJourneyStops';

interface ExperienceState {
  caps: Capabilities;
  /** Progreso global de scroll 0..1, dirige la temperatura de la paleta. */
  scrollProgress: number;
  /** Progreso 0..1 dentro del Acto 2 (el viaje), dirige el trazado del mapa. */
  journeyProgress: number;
  /** Frame derivado del modelo de paradas (cámara/card/audio lo consumen). */
  frame: JourneyFrame;
  /** id del destino activo según el scroll. */
  activeDestino: string | null;
  ruta: RutaId;
  /** El usuario pasó el gate de auriculares. */
  audioUnlocked: boolean;
  muted: boolean;
  preloaderDone: boolean;

  setScrollProgress: (p: number) => void;
  setJourneyProgress: (p: number) => void;
  setFrame: (f: JourneyFrame) => void;
  setActiveDestino: (id: string | null) => void;
  setRuta: (r: RutaId) => void;
  unlockAudio: () => void;
  toggleMute: () => void;
  finishPreloader: () => void;
}

const INITIAL_FRAME: JourneyFrame = {
  stop: 0,
  phase: 'hold',
  r: 0,
  holdAmount: 0,
  travelAmount: 0,
  mixFrom: 0,
  mixTo: 0,
  mixT: 0,
  isClimax: false,
};

export const useExperience = create<ExperienceState>((set) => ({
  caps: detectCapabilities(),
  scrollProgress: 0,
  journeyProgress: 0,
  frame: INITIAL_FRAME,
  activeDestino: null,
  ruta: '45',
  audioUnlocked: false,
  muted: false,
  preloaderDone: false,

  setScrollProgress: (p) => set({ scrollProgress: p }),
  setJourneyProgress: (p) => set({ journeyProgress: p }),
  setFrame: (f) => set({ frame: f }),
  setActiveDestino: (id) => set({ activeDestino: id }),
  setRuta: (r) => set({ ruta: r }),
  unlockAudio: () => set({ audioUnlocked: true }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  finishPreloader: () => set({ preloaderDone: true }),
}));
