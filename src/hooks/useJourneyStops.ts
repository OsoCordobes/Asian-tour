import { useEffect, useMemo, useState } from 'react';
import type { Destino } from '@/types';
import {
  buildGlobalRoute,
  fitBoundsFrame,
  flyLerpFrame,
  type CamFrame,
  type GlobalRoute,
} from '@/features/map/routeGeoV5';

export type JourneyPhase = 'inter' | 'intra' | 'hold';

/** Frame que consumen mapa, card y audio (vía store). */
export interface JourneyFrame {
  pais: number;
  ciudadGlobalIndex: number;
  phase: JourneyPhase;
  /** Posición en espacio de ciudad (índice float) sobre la polilínea global. */
  r: number;
  holdAmount: number;
  cameraMode: 'fly' | 'fixed';
  camTarget: CamFrame;
  /** Arco del vuelo (0 en hold/intra; sin(πt) en inter) → rampa de pitch. */
  camArc: number;
  mixFrom: number;
  mixTo: number;
  mixT: number;
  isClimax: boolean;
}

interface Segment5 {
  kind: JourneyPhase;
  paisIdx: number;
  paisFromIdx: number;
  rFrom: number;
  rTo: number;
  cityGlobalIdx: number;
  isClimax: boolean;
  w: number;
  from: number;
  to: number;
}

export interface JourneyPlan {
  segments: Segment5[];
  totalSvh: number;
  paisBounds: CamFrame[];
  route: GlobalRoute;
  nPaises: number;
  nCiudades: number;
}

const INTER_SVH = 64;
const INTRA_SVH = 34;
const HOLD_PROT = 78;
const HOLD_SEC = 48;
const NEUTRO_PAD = { top: 90, right: 130, bottom: 110, left: 130 };

function smooth(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function bump(x: number, edge = 0.22): number {
  return Math.min(smooth(x / edge), smooth((1 - x) / edge));
}

export function buildPlan5(
  destinos: Destino[],
  viewport: { width: number; height: number },
): JourneyPlan {
  const route = buildGlobalRoute(destinos);
  const n = route.nPaises;

  const paisBounds = route.paisRanges.map((rg) => {
    const coords = route.cities.slice(rg.firstCity, rg.lastCity + 1).map((c) => c.coords);
    return fitBoundsFrame(coords, viewport, NEUTRO_PAD, { maxZoom: 5.4, minZoom: 2.6 });
  });

  const segs: Segment5[] = [];
  const push = (s: Omit<Segment5, 'from' | 'to'>) => segs.push({ ...s, from: 0, to: 0 });

  for (let p = 0; p < n; p++) {
    const rg = route.paisRanges[p];
    const esClimaxPais = !!destinos[p].esClimax;

    if (p > 0) {
      push({
        kind: 'inter',
        paisIdx: p,
        paisFromIdx: p - 1,
        rFrom: route.paisRanges[p - 1].lastCity,
        rTo: rg.firstCity,
        cityGlobalIdx: rg.firstCity,
        isClimax: false,
        w: INTER_SVH * (esClimaxPais ? 1.15 : 1),
      });
    }

    push({
      kind: 'hold',
      paisIdx: p,
      paisFromIdx: p,
      rFrom: rg.firstCity,
      rTo: rg.firstCity,
      cityGlobalIdx: rg.firstCity,
      isClimax: esClimaxPais, // la 1ª ciudad del país clímax (Patong)
      w: HOLD_PROT * (p === 0 ? 0.7 : 1) * (esClimaxPais ? 1.25 : 1),
    });

    for (let c = rg.firstCity + 1; c <= rg.lastCity; c++) {
      push({
        kind: 'intra',
        paisIdx: p,
        paisFromIdx: p,
        rFrom: c - 1,
        rTo: c,
        cityGlobalIdx: c,
        isClimax: false,
        w: INTRA_SVH,
      });
      push({
        kind: 'hold',
        paisIdx: p,
        paisFromIdx: p,
        rFrom: c,
        rTo: c,
        cityGlobalIdx: c,
        isClimax: false,
        w: HOLD_SEC,
      });
    }
  }

  const total = segs.reduce((a, s) => a + s.w, 0);
  let acc = 0;
  for (const s of segs) {
    s.from = acc / total;
    acc += s.w;
    s.to = acc / total;
  }

  return { segments: segs, totalSvh: total, paisBounds, route, nPaises: n, nCiudades: route.nCiudades };
}

export function resolveFrame5(plan: JourneyPlan, progress: number): JourneyFrame {
  const p = Math.min(1, Math.max(0, progress));
  const seg = plan.segments.find((s) => p >= s.from && p <= s.to) ?? plan.segments[plan.segments.length - 1];
  const span = Math.max(seg.to - seg.from, 1e-6);
  const local = (p - seg.from) / span;
  const pb = plan.paisBounds;

  if (seg.kind === 'hold') {
    return {
      pais: seg.paisIdx,
      ciudadGlobalIndex: seg.cityGlobalIdx,
      phase: 'hold',
      r: seg.cityGlobalIdx,
      holdAmount: bump(local),
      cameraMode: 'fixed',
      camTarget: pb[seg.paisIdx],
      camArc: 0,
      mixFrom: seg.paisIdx,
      mixTo: seg.paisIdx,
      mixT: 0,
      isClimax: seg.isClimax,
    };
  }

  if (seg.kind === 'intra') {
    const t = easeInOutCubic(local);
    return {
      pais: seg.paisIdx,
      ciudadGlobalIndex: local < 0.5 ? seg.rFrom : seg.cityGlobalIdx,
      phase: 'intra',
      r: seg.rFrom + (seg.rTo - seg.rFrom) * t,
      holdAmount: 0,
      cameraMode: 'fixed',
      camTarget: pb[seg.paisIdx],
      camArc: 0,
      mixFrom: seg.paisIdx,
      mixTo: seg.paisIdx,
      mixT: 0,
      isClimax: false,
    };
  }

  // inter
  const t = easeInOutCubic(local);
  return {
    pais: t < 0.5 ? seg.paisFromIdx : seg.paisIdx,
    ciudadGlobalIndex: t < 0.5 ? seg.rFrom : seg.cityGlobalIdx,
    phase: 'inter',
    r: seg.rFrom + (seg.rTo - seg.rFrom) * t,
    holdAmount: 0,
    cameraMode: 'fly',
    camTarget: flyLerpFrame(pb[seg.paisFromIdx], pb[seg.paisIdx], t, 1.0),
    camArc: Math.sin(Math.PI * t),
    mixFrom: seg.paisFromIdx,
    mixTo: seg.paisIdx,
    mixT: t,
    isClimax: false,
  };
}

export function useJourneyStops(destinos: Destino[]): JourneyPlan {
  const [vp, setVp] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1440,
    height: typeof window !== 'undefined' ? window.innerHeight : 900,
  }));

  useEffect(() => {
    let t: number;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => setVp({ width: window.innerWidth, height: window.innerHeight }), 220);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return useMemo(() => buildPlan5(destinos, vp), [destinos, vp.width, vp.height]);
}
