import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePersona } from '@/hooks/usePersona';
import { useCollab } from '@/hooks/useCollab';
import { useExperience } from '@/store/experience';
import { tramosDeRuta } from '@/data/itinerario';
import { CUBIC } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { NameColorPicker } from '@/features/identity/NameColorPicker';
import { NotaComposer } from '@/features/planeo/NotaComposer';
import { NotaList } from '@/features/planeo/NotaList';
import { PrecioComposer } from '@/features/planeo/PrecioComposer';
import { PrecioList } from '@/features/planeo/PrecioList';
import { BudgetTally } from '@/features/planeo/BudgetTally';

type Tab = 'notas' | 'precios';

interface Props {
  open: boolean;
  onClose: () => void;
  tripId: string;
  destinoId?: string;
}

/**
 * Panel de planeo deslizable. Entra desde la derecha en desktop y desde abajo
 * en mobile. Cierra con botón, backdrop o Escape. Si no hay persona, pide la
 * identidad antes de mostrar el contenido colaborativo.
 */
export function PlaneoDrawer({ open, onClose, tripId, destinoId }: Props) {
  const reducedMotion = useExperience((s) => s.caps.reducedMotion);
  const isMobile = useExperience((s) => s.caps.isMobile);
  const ruta = useExperience((s) => s.ruta);
  const { persona } = usePersona();
  const { notas, precios, addNota, addPrecio } = useCollab(tripId, persona);
  const [tab, setTab] = useState<Tab>('notas');

  const tramos = useMemo(() => tramosDeRuta(ruta), [ruta]);

  const notasVisibles = useMemo(
    () =>
      (destinoId ? notas.filter((n) => n.destino_id === destinoId) : notas)
        .slice()
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [notas, destinoId],
  );

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const panelVariants = isMobile
    ? { hidden: { y: '100%' }, visible: { y: 0 } }
    : { hidden: { x: '100%' }, visible: { x: 0 } };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            className="absolute inset-0 bg-obsidian/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.4 }}
            onClick={onClose}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Planeo del viaje"
            className={cn(
              'glass grain relative flex h-full w-full flex-col overflow-hidden',
              'max-h-[88vh] self-end rounded-t-3xl',
              'sm:max-h-full sm:max-w-md sm:self-stretch sm:rounded-l-3xl sm:rounded-tr-none',
            )}
            variants={panelVariants}
            initial={reducedMotion ? { opacity: 0 } : 'hidden'}
            animate={reducedMotion ? { opacity: 1 } : 'visible'}
            exit={reducedMotion ? { opacity: 0 } : 'hidden'}
            transition={{ duration: reducedMotion ? 0.15 : 0.6, ease: CUBIC.land }}
          >
            <header className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <div>
                <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-white/40">
                  Planeo
                </p>
                <h2 className="font-display text-xl text-white">Notas y presupuesto</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="rounded-full p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <path
                    d="M5 5l10 10M15 5L5 15"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </header>

            <nav className="flex gap-1 border-b border-white/5 px-5 pt-3">
              {(['notas', 'precios'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={cn(
                    'relative px-3 pb-3 font-display text-sm transition',
                    tab === t ? 'text-white' : 'text-white/40 hover:text-white/70',
                  )}
                >
                  {t === 'notas' ? 'Notas' : 'Precios / Presupuesto'}
                  {tab === t && (
                    <motion.span
                      layoutId="planeo-tab"
                      className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-neon-1"
                      style={{ boxShadow: '0 0 8px rgb(var(--neon-1))' }}
                      transition={{ ease: CUBIC.soft, duration: 0.3 }}
                    />
                  )}
                </button>
              ))}
            </nav>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {tab === 'notas' ? (
                <div className="space-y-5">
                  <NotaComposer
                    tripId={tripId}
                    persona={persona}
                    destinoId={destinoId}
                    onAdd={addNota}
                  />
                  <NotaList notas={notasVisibles} />
                </div>
              ) : (
                <div className="space-y-6">
                  <BudgetTally precios={precios} />
                  <PrecioComposer persona={persona} tramos={tramos} onAdd={addPrecio} />
                  <PrecioList precios={precios} />
                </div>
              )}
            </div>
          </motion.aside>

          {!persona && <NameColorPicker />}
        </div>
      )}
    </AnimatePresence>
  );
}
