import { useEffect, useRef } from 'react';
import { useExperience } from '@/store/experience';

/**
 * Globo liviano sin WebGL para mobile/static: un disco con gradiente, meridianos
 * SVG, atmósfera glow y un pin pulsante en Copenhague. Parallax sutil por
 * puntero/orientación. Visualmente premium, cero contexto WebGL.
 */
export function GlobeFallback() {
  const reducedMotion = useExperience((s) => s.caps.reducedMotion);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const onMove = (x: number, y: number) => {
      el.style.transform = `translate(${x * 14}px, ${y * 14}px)`;
    };
    const onMouse = (e: MouseEvent) => {
      onMove(e.clientX / window.innerWidth - 0.5, e.clientY / window.innerHeight - 0.5);
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      onMove(Math.max(-0.5, Math.min(0.5, (e.gamma ?? 0) / 60)), Math.max(-0.5, Math.min(0.5, (e.beta ?? 0) / 90)));
    };
    window.addEventListener('mousemove', onMouse);
    window.addEventListener('deviceorientation', onOrient);
    return () => {
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('deviceorientation', onOrient);
    };
  }, [reducedMotion]);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      <div ref={ref} className="relative transition-transform duration-300 ease-out">
        {/* Atmósfera glow */}
        <div
          className="absolute left-1/2 top-1/2 h-[78vmin] w-[78vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 50% 45%, rgb(var(--neon-2) / 0.18), transparent 62%)',
            filter: 'blur(8px)',
          }}
        />
        {/* Globo */}
        <div
          className="relative h-[62vmin] w-[62vmin] animate-breathe rounded-full"
          style={{
            background:
              'radial-gradient(circle at 38% 32%, #1b2440, #0a0e1c 60%, #05060c 100%)',
            boxShadow:
              'inset -24px -18px 60px rgb(0 0 0 / 0.8), 0 0 80px rgb(var(--neon-1) / 0.25)',
          }}
        >
          {/* Meridianos */}
          <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full opacity-30">
            {[...Array(6)].map((_, i) => (
              <ellipse
                key={i}
                cx="100"
                cy="100"
                rx={100 - i * 0}
                ry={20 + i * 16}
                fill="none"
                stroke="rgb(var(--neon-2))"
                strokeWidth="0.4"
              />
            ))}
            <circle cx="100" cy="100" r="99" fill="none" stroke="rgb(var(--neon-2))" strokeWidth="0.5" />
          </svg>
          {/* Pin Copenhague */}
          <div className="absolute left-[56%] top-[24%]">
            <span className="absolute inline-flex h-3 w-3 animate-pulse-ring rounded-full bg-neon-3" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-neon-3 shadow-glow-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
