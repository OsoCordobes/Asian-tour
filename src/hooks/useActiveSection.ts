import { useEffect, useRef } from 'react';

/**
 * Observa una sección y dispara onActive(id) cuando entra al centro del
 * viewport. Reemplaza el pinning de ScrollTrigger (la fuente #1 de bugs en
 * mobile) por detección discreta y robusta.
 */
export function useActiveSection(id: string, onActive: (id: string) => void) {
  const ref = useRef<HTMLDivElement>(null);
  const cb = useRef(onActive);
  cb.current = onActive;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) cb.current(id);
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [id]);

  return ref;
}
