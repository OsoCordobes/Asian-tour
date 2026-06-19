import { useCallback } from 'react';
import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { Persona } from '@/types';

const KEY = 'asia-persona';

/** Paleta de colores para la identidad liviana (uno por persona). */
export const PERSONA_COLORS = [
  '#ff40a0',
  '#40e0ff',
  '#ffc454',
  '#8a78ff',
  '#5ef0b0',
  '#ff7a59',
];

function load(): Persona | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Persona) : null;
  } catch {
    return null;
  }
}

/**
 * Store compartido: todos los consumidores (picker + drawer + composers) ven la
 * misma persona, así elegir identidad en un lugar se refleja en todos al toque.
 */
interface PersonaState {
  persona: Persona | null;
  set: (p: Persona) => void;
}
const usePersonaStore = create<PersonaState>((set) => ({
  persona: load(),
  set: (persona) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(persona));
    } catch {
      /* noop */
    }
    set({ persona });
  },
}));

export function usePersona() {
  const persona = usePersonaStore((s) => s.persona);
  const setPersona = usePersonaStore((s) => s.set);

  const elegir = useCallback(
    (nombre: string, color: string) => {
      setPersona({ id: nanoid(), nombre: nombre.trim().slice(0, 24), color });
    },
    [setPersona],
  );

  return { persona, elegir };
}
