import { useEffect, useRef, useState } from 'react';
import { useExperience } from '@/store/experience';

/**
 * Cursor custom desktop con forma (cartoon) que sigue el mouse con lag y rota
 * hacia la dirección del movimiento; crece sobre interactivos. Gag del regalo:
 * por defecto está BLANDO (caído, corto); al hacer click se pone DURO (recto,
 * largo) con un rebotito. No se monta en mobile (coarse pointer) ni reduced-motion.
 */
export function CustomCursor() {
  const caps = useExperience((s) => s.caps);
  const ref = useRef<HTMLDivElement>(null);
  const [hard, setHard] = useState(false);

  useEffect(() => {
    if (caps.coarsePointer || caps.reducedMotion) return;
    document.documentElement.classList.add('custom-cursor-active');

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let cx = tx;
    let cy = ty;
    let angle = 0;
    let scale = 1;
    let targetScale = 1;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const t = e.target as HTMLElement;
      targetScale = t.closest('a, button, [data-cursor="hover"]') ? 1.45 : 1;
    };
    const onDown = () => setHard(true);
    const onUp = () => setHard(false);

    const tick = () => {
      const dx = tx - cx;
      const dy = ty - cy;
      cx += dx * 0.2;
      cy += dy * 0.2;
      scale += (targetScale - scale) * 0.2;
      const speed = Math.hypot(dx, dy);
      if (speed > 0.6) {
        const target = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        let diff = target - angle;
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        angle += diff * 0.2;
      }
      const el = ref.current;
      if (el) {
        el.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%) rotate(${angle}deg) scale(${scale})`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    raf = requestAnimationFrame(tick);
    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      cancelAnimationFrame(raf);
    };
  }, [caps]);

  if (caps.coarsePointer || caps.reducedMotion) return null;

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed left-0 top-0 z-[100]"
      style={{ filter: 'drop-shadow(0 0 6px rgb(255 120 160 / 0.5))' }}
    >
      <svg width="30" height="42" viewBox="0 0 34 46" aria-hidden>
        {/* Testículos (comunes a ambos estados) */}
        <ellipse cx="11" cy="40" rx="8" ry="6.5" fill="#f0b1a6" />
        <ellipse cx="23" cy="40" rx="8" ry="6.5" fill="#e7a397" />
        {hard ? (
          /* DURO: recto, largo, parado */
          <g
            style={{
              transition: 'transform 160ms cubic-bezier(0.34,1.56,0.64,1)',
              transformOrigin: '17px 40px',
              transform: 'scaleY(1)',
            }}
          >
            <rect x="11" y="8" width="12" height="30" rx="6" fill="#f6c3b8" />
            <circle cx="17" cy="9" r="7.5" fill="#ef8d85" />
            <line x1="17" y1="4.5" x2="17" y2="9" stroke="#d96f68" strokeWidth="1.4" strokeLinecap="round" />
          </g>
        ) : (
          /* BLANDO: corto y caído hacia un lado (curva con path) */
          <g
            style={{
              transition: 'transform 220ms cubic-bezier(0.34,1.56,0.64,1)',
              transformOrigin: '17px 38px',
            }}
          >
            <path
              d="M12 38 C10 30 13 26 19 25 C25 24 29 27 29 31 C29 34 26 35 24 34"
              fill="none"
              stroke="#f6c3b8"
              strokeWidth="11"
              strokeLinecap="round"
            />
            <circle cx="27.5" cy="32" r="6.2" fill="#ef8d85" />
          </g>
        )}
      </svg>
    </div>
  );
}
