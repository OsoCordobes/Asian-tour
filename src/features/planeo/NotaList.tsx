import { AnimatePresence, motion } from 'framer-motion';
import type { Nota } from '@/types';
import { useExperience } from '@/store/experience';
import { formatFecha } from '@/lib/format';
import { CUBIC } from '@/lib/motion';

interface Props {
  notas: Nota[];
}

/**
 * Lista de notas atribuidas por color de autor. Las nuevas entran con un pulso
 * suave teñido del color de quien las escribió.
 */
export function NotaList({ notas }: Props) {
  const reducedMotion = useExperience((s) => s.caps.reducedMotion);

  if (notas.length === 0) {
    return (
      <div className="rounded-xl border border-white/5 bg-white/[0.02] px-5 py-8 text-center">
        <p className="font-display text-base text-white/70">Todavía no hay notas.</p>
        <p className="mt-1 font-sans text-sm text-white/40">Empezá la conversación.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      <AnimatePresence initial={false}>
        {notas.map((nota) => (
          <motion.li
            key={nota.id}
            layout={!reducedMotion}
            initial={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, x: -16, boxShadow: `0 0 0px ${nota.autor_color}00` }
            }
            animate={
              reducedMotion
                ? { opacity: 1 }
                : {
                    opacity: 1,
                    x: 0,
                    boxShadow: [
                      `0 0 24px ${nota.autor_color}60`,
                      `0 0 0px ${nota.autor_color}00`,
                    ],
                  }
            }
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: reducedMotion ? 0.15 : 0.6, ease: CUBIC.land }}
            className="relative rounded-xl bg-white/[0.03] py-3 pl-4 pr-3"
            style={{ borderLeft: `3px solid ${nota.autor_color}` }}
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: nota.autor_color, boxShadow: `0 0 8px ${nota.autor_color}` }}
              />
              <span
                className="font-display text-sm"
                style={{ color: nota.autor_color }}
              >
                {nota.autor_nombre}
              </span>
              <span className="ml-auto font-sans text-xs text-white/30">
                {formatFecha(nota.created_at)}
              </span>
            </div>
            <p className="mt-1.5 whitespace-pre-wrap break-words font-sans text-sm text-white/80">
              {nota.texto}
            </p>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
