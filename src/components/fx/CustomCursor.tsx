import { useEffect, useRef } from 'react';
import { useExperience } from '@/store/experience';

/**
 * Cursor custom desktop: punto + anillo que se agranda sobre interactivos.
 * No se monta si el puntero es coarse (mobile) o reduced-motion.
 */
export function CustomCursor() {
  const caps = useExperience((s) => s.caps);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (caps.coarsePointer || caps.reducedMotion) return;
    document.documentElement.classList.add('custom-cursor-active');

    let rx = 0;
    let ry = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      if (dotRef.current) dotRef.current.style.transform = `translate(${x}px, ${y}px)`;
      const target = e.target as HTMLElement;
      const interactive = target.closest('a, button, [data-cursor="hover"]');
      if (ringRef.current) {
        ringRef.current.dataset.hover = interactive ? 'true' : 'false';
      }
    };
    const tick = () => {
      const dot = dotRef.current;
      const ring = ringRef.current;
      if (dot && ring) {
        const t = dot.style.transform.match(/translate\(([-\d.]+)px, ([-\d.]+)px\)/);
        if (t) {
          const tx = parseFloat(t[1]);
          const ty = parseFloat(t[2]);
          rx += (tx - rx) * 0.18;
          ry += (ty - ry) * 0.18;
          ring.style.transform = `translate(${rx}px, ${ry}px)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [caps]);

  if (caps.coarsePointer || caps.reducedMotion) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[100] -ml-1 -mt-1 h-2 w-2 rounded-full bg-neon-1 mix-blend-screen"
        style={{ boxShadow: '0 0 12px rgb(var(--neon-1))' }}
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[100] -ml-4 -mt-4 h-8 w-8 rounded-full border border-neon-2/60 transition-[width,height,margin] duration-200 data-[hover=true]:-ml-6 data-[hover=true]:-mt-6 data-[hover=true]:h-12 data-[hover=true]:w-12"
      />
    </>
  );
}
