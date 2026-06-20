import { useEffect, useMemo, useRef, useState } from 'react';
import type { RutaId } from '@/types';
import { makeProjector, routePoints, svgPath } from './routeGeo';

interface Props {
  ruta: RutaId;
  /** Índice del destino activo dentro de la ruta (-1 = ninguno todavía). */
  activeIndex: number;
}

/**
 * Mapa Static (SVG, cero WebGL): la ruta se dibuja progresivamente hasta el
 * destino activo con un punto-cometa, los nodos pulsan. Backdrop abstracto
 * premium (glows + grid). Es la base garantizada que corre en cualquier device.
 */
export function RouteMapStatic({ ruta, activeIndex }: Props) {
  const pts = useMemo(() => routePoints(ruta), [ruta]);
  const proj = useMemo(() => makeProjector(pts), [pts]);
  const projected = useMemo(() => pts.map((p) => proj.project(p.lng, p.lat)), [pts, proj]);
  const fullPath = useMemo(() => svgPath(projected), [projected]);

  const pathRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(0);
  useEffect(() => {
    if (pathRef.current) setLen(pathRef.current.getTotalLength());
  }, [fullPath]);

  const n = projected.length;
  const frac = activeIndex < 0 ? 0 : Math.min(1, (activeIndex + 0.5) / Math.max(1, n - 1));
  const drawn = len * frac;

  return (
    <div className="absolute inset-0 overflow-hidden bg-obsidian">
      {/* Glows de fondo según temperatura */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 30% 30%, rgb(var(--neon-1) / 0.10), transparent 70%), radial-gradient(50% 50% at 75% 70%, rgb(var(--neon-2) / 0.10), transparent 70%)',
        }}
      />
      <svg
        viewBox={`0 0 ${proj.width} ${proj.height}`}
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Grid sutil */}
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgb(255 255 255 / 0.04)" strokeWidth="1" />
          </pattern>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width={proj.width} height={proj.height} fill="url(#grid)" />

        {/* Ruta completa, tenue */}
        <path d={fullPath} fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="2" strokeDasharray="2 6" />

        {/* Ruta dibujada hasta el activo */}
        <path
          ref={pathRef}
          d={fullPath}
          fill="none"
          stroke="rgb(var(--neon-1))"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#glow)"
          style={{
            strokeDasharray: len,
            strokeDashoffset: len - drawn,
            transition: 'stroke-dashoffset 1.4s cubic-bezier(0.65,0,0.35,1)',
          }}
        />

        {/* Nodos */}
        {projected.map((p, i) => {
          const visited = i <= activeIndex;
          const active = i === activeIndex;
          return (
            <g key={pts[i].id} transform={`translate(${p.x} ${p.y})`}>
              {active && (
                <circle r="6" fill="none" stroke="rgb(var(--neon-3))" strokeWidth="1.5">
                  <animate attributeName="r" from="6" to="22" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle
                r={active ? 6 : 4}
                fill={visited ? 'rgb(var(--neon-3))' : 'rgb(255 255 255 / 0.25)'}
                filter={active ? 'url(#glow)' : undefined}
                style={{ transition: 'all 0.5s ease' }}
              />
              <text
                x="0"
                y="-14"
                textAnchor="middle"
                className="font-sans"
                fontSize="13"
                fill={visited ? '#fff' : 'rgb(255 255 255 / 0.4)'}
                style={{ transition: 'fill 0.5s ease' }}
              >
                {pts[i].nombre}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
