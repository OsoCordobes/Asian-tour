import { useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';
import { motion } from 'framer-motion';
import { useExperience } from '@/store/experience';
import { KineticText } from '@/components/ui/KineticText';
import { CLIMAX_VIDEO, AUDIO } from '@/data/assets';

/**
 * El beat clímax: Phuket, 31 de diciembre. Tensión -> estallido -> resolución.
 * Video de fuegos (poster -> video, muted+playsInline) + capa de partículas CSS.
 * `asOverlay` (modelo de paradas): se monta durante el hold de Phuket, ocupa la
 * pantalla sobre el mapa y estalla al montar. Sin `asOverlay` (fallback estático):
 * es una sección en el flujo que estalla al entrar al viewport.
 */
export function PhuketClimax({ asOverlay = false }: { asOverlay?: boolean }) {
  const reducedMotion = useExperience((s) => s.caps.reducedMotion);
  const audioUnlocked = useExperience((s) => s.audioUnlocked);
  const muted = useExperience((s) => s.muted);
  const [burst, setBurst] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const swellRef = useRef<Howl | null>(null);
  const playedSwell = useRef(false);

  useEffect(() => {
    if (asOverlay) {
      setBurst(true);
      videoRef.current?.play().catch(() => {});
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setBurst(true);
          videoRef.current?.play().catch(() => {});
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [asOverlay]);

  // Swell de fuegos artificiales: una sola vez al entrar la sección, si el gate
  // está abierto y no está silenciado. Fade-in corto sobre la música ambiente.
  useEffect(() => {
    if (!burst || playedSwell.current || !audioUnlocked || muted) return;
    playedSwell.current = true;
    const swell = new Howl({ src: [AUDIO.fireworks], volume: 0, html5: true });
    swellRef.current = swell;
    swell.play();
    swell.fade(0, 0.5, 800);
  }, [burst, audioUnlocked, muted]);

  useEffect(() => {
    return () => {
      swellRef.current?.unload();
      swellRef.current = null;
    };
  }, []);

  return (
    <motion.div
      ref={ref}
      data-act="climax"
      className={
        asOverlay
          ? 'absolute inset-0 z-20 flex items-center justify-center overflow-hidden'
          : 'relative flex min-svh items-center justify-center overflow-hidden'
      }
      initial={asOverlay ? { opacity: 0 } : false}
      animate={asOverlay ? { opacity: 1 } : undefined}
      transition={{ duration: 0.8 }}
    >
      {/* Video de fuegos (si existe el archivo; si no, el fondo de partículas manda) */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover opacity-70"
        muted
        loop
        playsInline
        preload="none"
      >
        <source src={CLIMAX_VIDEO} type="video/mp4" />
      </video>

      {/* Fondo de estallido */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 40%, rgb(255 196 84 / 0.25), transparent 55%), radial-gradient(circle at 30% 60%, rgb(255 64 160 / 0.2), transparent 60%)',
        }}
      />

      {/* Partículas CSS que estallan */}
      {!reducedMotion && burst && (
        <div className="pointer-events-none absolute inset-0">
          {[...Array(28)].map((_, i) => {
            const angle = (i / 28) * Math.PI * 2;
            const dist = 30 + (i % 5) * 12;
            return (
              <motion.span
                key={i}
                className="absolute left-1/2 top-[42%] h-1.5 w-1.5 rounded-full"
                style={{
                  background: i % 2 ? 'rgb(255 196 84)' : 'rgb(255 64 160)',
                  boxShadow: '0 0 8px currentColor',
                }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: `${Math.cos(angle) * dist}vmin`,
                  y: `${Math.sin(angle) * dist}vmin`,
                  opacity: 0,
                }}
                transition={{ duration: 1.8, ease: 'easeOut', repeat: Infinity, repeatDelay: 0.6, delay: (i % 7) * 0.15 }}
              />
            );
          })}
        </div>
      )}

      <div className="relative z-10 px-6 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mb-3 text-sm uppercase tracking-[0.5em] text-neon-3"
        >
          31 de diciembre · Patong
        </motion.p>
        <h2 className="text-5xl text-white drop-shadow-[0_0_30px_rgba(255,196,84,0.5)] sm:text-7xl md:text-8xl">
          <KineticText text="Feliz Año Nuevo" />
        </h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 0.85, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 1 }}
          className="mx-auto mt-6 max-w-md text-white/80"
        >
          Fuegos sobre el mar de Andamán. El pico de todo el viaje. Desde acá,
          el mundo empieza a enfriarse.
        </motion.p>
      </div>
    </motion.div>
  );
}
