import { useMemo } from 'react';
import type { Destino } from '@/types';

export type JourneyPhase = 'hold' | 'travel';

export interface JourneySegment {
  kind: JourneyPhase;
  /** hold: el destino; travel: el destino DESTINO (origen = stop-1). */
  stop: number;
  from: number; // progress global de inicio [0..1]
  to: number; // progress global de fin
  isClimax: boolean;
}

export interface JourneyFrame {
  stop: number;
  phase: JourneyPhase;
  /** node-space: posición de cámara a lo largo de la ruta. */
  r: number;
  /** visibilidad de la card (bump 0→1→0 dentro del hold). */
  holdAmount: number;
  travelAmount: number;
  mixFrom: number;
  mixTo: number;
  mixT: number;
  isClimax: boolean;
}

export interface JourneyPlan {
  segments: JourneySegment[];
  totalSvh: number;
  nStops: number;
}

const HOLD_SVH = 90;
const TRAVEL_SVH = 70;

function smooth(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Bump de visibilidad de la card: entra, sostiene, sale (0→1→0). */
function bump(x: number, edge = 0.22): number {
  return Math.min(smooth(x / edge), smooth((1 - x) / edge));
}

export function buildPlan(destinos: Destino[]): JourneyPlan {
  const n = destinos.length;
  const segs: (JourneySegment & { w: number })[] = [];

  for (let i = 0; i < n; i++) {
    let holdW = HOLD_SVH;
    if (i === 0) holdW *= 0.7; // ya venís ubicado del hero
    if (i === n - 1) holdW *= 1.1; // cerrar con calma antes del Cierre
    segs.push({ kind: 'hold', stop: i, from: 0, to: 0, isClimax: !!destinos[i].esClimax, w: holdW });

    if (i < n - 1) {
      let travelW = TRAVEL_SVH;
      if (destinos[i + 1].esClimax) travelW *= 1.15; // tensión antes del clímax
      segs.push({ kind: 'travel', stop: i + 1, from: 0, to: 0, isClimax: false, w: travelW });
    }
  }

  const total = segs.reduce((a, s) => a + s.w, 0);
  let acc = 0;
  for (const s of segs) {
    s.from = acc / total;
    acc += s.w;
    s.to = acc / total;
  }

  return { segments: segs, totalSvh: total, nStops: n };
}

export function resolveFrame(plan: JourneyPlan, progress: number): JourneyFrame {
  const p = Math.min(1, Math.max(0, progress));
  const seg =
    plan.segments.find((s) => p >= s.from && p <= s.to) ??
    plan.segments[plan.segments.length - 1];
  const span = Math.max(seg.to - seg.from, 1e-6);
  const local = (p - seg.from) / span;

  if (seg.kind === 'hold') {
    return {
      stop: seg.stop,
      phase: 'hold',
      r: seg.stop,
      holdAmount: bump(local),
      travelAmount: 0,
      mixFrom: seg.stop,
      mixTo: seg.stop,
      mixT: 0,
      isClimax: seg.isClimax,
    };
  }

  const from = seg.stop - 1;
  const to = seg.stop;
  const t = easeInOutCubic(local);
  return {
    stop: local < 0.5 ? from : to,
    phase: 'travel',
    r: from + t,
    holdAmount: 0,
    travelAmount: t,
    mixFrom: from,
    mixTo: to,
    mixT: t,
    isClimax: false,
  };
}

export function useJourneyStops(destinos: Destino[]): JourneyPlan {
  return useMemo(() => buildPlan(destinos), [destinos]);
}
