import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePersona, PERSONA_COLORS } from '@/hooks/usePersona';
import { useExperience } from '@/store/experience';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { CUBIC, STAGGER } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface Props {
  onDone?: () => void;
  /** 'modal' = overlay a pantalla completa (default). 'inline' = bloque compacto dentro del flujo. */
  variant?: 'modal' | 'inline';
}

/**
 * Identidad liviana. En variante 'modal' aparece como overlay cuando todavía no
 * hay persona elegida. En variante 'inline' se integra al flujo (sala de planeo)
 * sin tapar la pantalla. Pide nombre + color y confirma la identidad.
 */
export function NameColorPicker({ onDone, variant = 'modal' }: Props) {
  const { elegir } = usePersona();
  const reducedMotion = useExperience((s) => s.caps.reducedMotion);
  const [nombre, setNombre] = useState('');
  const [color, setColor] = useState<string>(PERSONA_COLORS[0]);

  const limpio = nombre.trim();
  const valido = limpio.length > 0;

  function entrar() {
    if (!valido) return;
    elegir(limpio, color);
    onDone?.();
  }

  if (variant === 'inline') {
    return (
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0.1 : 0.4, ease: CUBIC.land }}
        className="glass grain rounded-2xl p-4"
      >
        <p className="font-sans text-xs uppercase tracking-[0.25em] text-white/40">
          ¿Quién sos en este viaje?
        </p>
        <p className="mt-1 font-sans text-sm text-white/50">
          Tu nombre y color te identifican en notas y precios.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block flex-1">
            <span className="font-sans text-[11px] uppercase tracking-widest text-white/40">
              Tu nombre
            </span>
            <input
              autoFocus
              value={nombre}
              maxLength={24}
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') entrar();
              }}
              placeholder="Lautaro"
              className="mt-1.5 w-full rounded-xl bg-white/5 px-4 py-2.5 font-sans text-sm text-white placeholder-white/25 outline-none transition focus:bg-white/10"
              style={{ boxShadow: `inset 0 0 0 1px ${color}66` }}
            />
          </label>
          <motion.button
            type="button"
            disabled={!valido}
            onClick={entrar}
            whileTap={valido ? { scale: 0.97 } : undefined}
            className={cn(
              'shrink-0 rounded-xl px-5 py-2.5 font-display text-sm text-obsidian transition',
              valido ? 'cursor-pointer' : 'cursor-not-allowed opacity-40',
            )}
            style={{
              backgroundColor: color,
              boxShadow: valido && !reducedMotion ? `0 0 18px ${color}80` : undefined,
            }}
          >
            Listo
          </motion.button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2.5">
          {PERSONA_COLORS.map((c, i) => {
            const activo = c === color;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Color ${i + 1}`}
                aria-pressed={activo}
                className={cn(
                  'h-7 w-7 rounded-full transition',
                  activo ? 'ring-2 ring-white ring-offset-2 ring-offset-obsidian' : 'opacity-70',
                )}
                style={{
                  backgroundColor: c,
                  boxShadow: activo ? `0 0 14px ${c}` : undefined,
                }}
              />
            );
          })}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-obsidian/80 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.4 }}
      />

      <motion.div
        className="relative w-full max-w-md"
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: reducedMotion ? 0.1 : 0.6, ease: CUBIC.land }}
      >
        <GlassPanel glow className="p-7">
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-white/40">
            Antes de empezar
          </p>
          <h2 className="mt-2 font-display text-2xl text-white">¿Quién sos en este viaje?</h2>
          <p className="mt-1 font-sans text-sm text-white/50">
            Tu nombre y color te identifican en notas y precios.
          </p>

          <label className="mt-6 block">
            <span className="font-sans text-xs uppercase tracking-widest text-white/40">
              Tu nombre
            </span>
            <input
              autoFocus
              value={nombre}
              maxLength={24}
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') entrar();
              }}
              placeholder="Lautaro"
              className="mt-2 w-full rounded-xl bg-white/5 px-4 py-3 font-sans text-white placeholder-white/25 outline-none transition focus:bg-white/10"
              style={{ boxShadow: `inset 0 0 0 1px ${color}66` }}
            />
          </label>

          <div className="mt-5">
            <span className="font-sans text-xs uppercase tracking-widest text-white/40">
              Tu color
            </span>
            <div className="mt-3 flex flex-wrap gap-3">
              {PERSONA_COLORS.map((c, i) => {
                const activo = c === color;
                return (
                  <motion.button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    aria-label={`Color ${i + 1}`}
                    aria-pressed={activo}
                    initial={reducedMotion ? false : { opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: reducedMotion ? 0 : i * STAGGER.tight, ease: CUBIC.land }}
                    whileTap={{ scale: 0.88 }}
                    className={cn(
                      'h-9 w-9 rounded-full transition',
                      activo ? 'ring-2 ring-white ring-offset-2 ring-offset-obsidian' : 'opacity-70',
                    )}
                    style={{
                      backgroundColor: c,
                      boxShadow: activo ? `0 0 18px ${c}` : undefined,
                    }}
                  />
                );
              })}
            </div>
          </div>

          <div className="mt-7 flex min-h-[3rem] items-center justify-center rounded-xl bg-white/[0.03] px-4 py-3">
            <AnimatePresence mode="wait">
              <motion.span
                key={`${limpio}-${color}`}
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: CUBIC.soft }}
                className="font-display text-xl"
                style={{ color, textShadow: `0 0 16px ${color}99` }}
              >
                {valido ? limpio : 'Tu nombre acá'}
              </motion.span>
            </AnimatePresence>
          </div>

          <motion.button
            type="button"
            disabled={!valido}
            onClick={entrar}
            whileTap={valido ? { scale: 0.97 } : undefined}
            className={cn(
              'mt-6 w-full rounded-xl px-4 py-3 font-display text-base text-obsidian transition',
              valido ? 'cursor-pointer' : 'cursor-not-allowed opacity-40',
            )}
            style={{
              backgroundColor: color,
              boxShadow: valido ? `0 0 24px ${color}80` : undefined,
            }}
          >
            Entrar al viaje
          </motion.button>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
