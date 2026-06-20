import type { BadgeId } from '@/types';

export interface BadgeDef {
  id: BadgeId;
  label: string;
  icon: string; // emoji placeholder, swappable for SVG later
}

export const BADGES: Record<BadgeId, BadgeDef> = {
  'vida-nocturna': { id: 'vida-nocturna', label: 'Vida nocturna', icon: '🌃' },
  playa: { id: 'playa', label: 'Playa', icon: '🏝️' },
  'ano-nuevo': { id: 'ano-nuevo', label: 'Año nuevo', icon: '🎆' },
  cultura: { id: 'cultura', label: 'Cultura', icon: '🏯' },
  comida: { id: 'comida', label: 'Comida', icon: '🍜' },
};

export const BADGE_LIST: BadgeDef[] = Object.values(BADGES);
