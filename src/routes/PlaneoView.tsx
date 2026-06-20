import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTrip } from '@/hooks/useTrip';
import { usePersona } from '@/hooks/usePersona';
import { useCollab } from '@/hooks/useCollab';
import { useExperience } from '@/store/experience';
import { destinosDeRuta, tramosDeRuta } from '@/data/itinerario';
import { CUBIC } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { NameColorPicker } from '@/features/identity/NameColorPicker';
import { NotaComposer } from '@/features/planeo/NotaComposer';
import { NotaList } from '@/features/planeo/NotaList';
import { PrecioComposer } from '@/features/planeo/PrecioComposer';
import { PrecioList } from '@/features/planeo/PrecioList';
import { BudgetTally } from '@/features/planeo/BudgetTally';

type MobileTab = 'notas' | 'presupuesto';

/**
 * Sala de planeo: pantalla dedicada calma (no un drawer). Desktop dos columnas
 * (notas chat + presupuesto); mobile tabs. Las notas son tipo mensajería:
 * nuevo abajo, autoscroll, composer pinned.
 */
export function PlaneoView() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { trip, loading, notFound } = useTrip(slug);

  const reducedMotion = useExperience((s) => s.caps.reducedMotion);
  const isMobile = useExperience((s) => s.caps.isMobile);
  const ruta = useExperience((s) => s.ruta);

  const { persona } = usePersona();
  const { notas, precios, addNota, addPrecio } = useCollab(trip?.id, persona);

  const tramos = useMemo(() => tramosDeRuta(ruta), [ruta]);
  const destinos = useMemo(() => destinosDeRuta(ruta), [ruta]);

  const destinoQuery = params.get('destino') ?? undefined;
  // Filtro de destino para las notas. Arranca en el destino del query si vino.
  const [filtroDestino, setFiltroDestino] = useState<string | undefined>(destinoQuery);
  const [mobileTab, setMobileTab] = useState<MobileTab>('notas');
  // El prompt de identidad inline aparece recién al intentar participar.
  const [pidiendoIdentidad, setPidiendoIdentidad] = useState(false);

  useEffect(() => {
    setFiltroDestino(destinoQuery);
  }, [destinoQuery]);

  // Notas en orden ascendente (viejo→nuevo) para el patrón chat.
  const notasVisibles = useMemo(
    () =>
      (filtroDestino ? notas.filter((n) => n.destino_id === filtroDestino) : notas)
        .slice()
        .sort((a, b) => a.created_at.localeCompare(b.created_at)),
    [notas, filtroDestino],
  );

  // Solo precios de tramos de la ruta activa (espeja la decisión del drawer).
  const preciosVisibles = useMemo(
    () => precios.filter((p) => tramos.some((t) => t.id === p.tramo_id)),
    [precios, tramos],
  );

  // Autoscroll al fondo: al cargar y cada vez que entra/sale una nota visible.
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [notasVisibles.length, filtroDestino, mobileTab, reducedMotion]);

  if (notFound) {
    return (
      <div className="min-svh flex flex-col items-center justify-center gap-3 bg-obsidian text-center">
        <h1 className="font-display text-3xl text-white">Este viaje no existe</h1>
        <p className="font-sans text-white/60">El link puede estar mal o el viaje fue archivado.</p>
      </div>
    );
  }

  const tienePersona = Boolean(persona);

  // Al intentar participar sin identidad, mostramos el prompt inline (no overlay).
  function requerirIdentidad() {
    if (!tienePersona) setPidiendoIdentidad(true);
  }

  const identidadPrompt =
    !tienePersona && pidiendoIdentidad ? (
      <NameColorPicker variant="inline" onDone={() => setPidiendoIdentidad(false)} />
    ) : null;

  const identidadChip = tienePersona ? (
    <div
      className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1.5"
      style={{ boxShadow: `inset 0 0 0 1px ${persona!.color}55` }}
    >
      <span className="font-sans text-[11px] uppercase tracking-widest text-white/40">sos</span>
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: persona!.color, boxShadow: `0 0 8px ${persona!.color}` }}
      />
      <span className="font-display text-sm" style={{ color: persona!.color }}>
        {persona!.nombre}
      </span>
      <button
        type="button"
        onClick={() => setPidiendoIdentidad(true)}
        aria-label="Cambiar identidad"
        className="ml-0.5 text-white/40 transition hover:text-white"
      >
        ✎
      </button>
    </div>
  ) : (
    <button
      type="button"
      onClick={() => setPidiendoIdentidad(true)}
      className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1.5 font-sans text-sm text-white/60 transition hover:text-white"
    >
      <span aria-hidden>＋</span> Definir tu identidad
    </button>
  );

  // --- Bloque NOTAS (chat) -------------------------------------------------
  const notasPane = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap gap-2 pb-3">
        <FiltroChip
          activo={!filtroDestino}
          onClick={() => setFiltroDestino(undefined)}
          color="#ffffff"
        >
          Todos
        </FiltroChip>
        {destinos.map((d) => (
          <FiltroChip
            key={d.id}
            activo={filtroDestino === d.id}
            onClick={() => setFiltroDestino(d.id)}
          >
            {d.nombre}
          </FiltroChip>
        ))}
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto rounded-2xl bg-white/[0.02] px-4 py-4"
      >
        <NotaList notas={notasVisibles} ascending />
      </div>

      <div className="pt-3" onFocusCapture={requerirIdentidad}>
        {identidadPrompt}
        {tienePersona ? (
          <NotaComposer
            tripId={trip?.id ?? ''}
            persona={persona}
            destinoId={filtroDestino}
            onAdd={addNota}
          />
        ) : (
          !pidiendoIdentidad && (
            <button
              type="button"
              onClick={requerirIdentidad}
              className="w-full rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-3 text-left font-sans text-sm text-white/50 transition hover:border-white/30 hover:text-white/70"
            >
              Escribí una nota… (primero definí tu identidad)
            </button>
          )
        )}
      </div>
    </div>
  );

  // --- Bloque PRESUPUESTO --------------------------------------------------
  const presupuestoPane = (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
      <BudgetTally precios={preciosVisibles} />

      <div onFocusCapture={requerirIdentidad}>
        {!tienePersona && identidadPrompt}
        {tienePersona && (
          <div className="glass grain rounded-2xl p-4">
            <PrecioComposer persona={persona} tramos={tramos} onAdd={addPrecio} />
          </div>
        )}
        {!tienePersona && !pidiendoIdentidad && (
          <button
            type="button"
            onClick={requerirIdentidad}
            className="w-full rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-3 text-left font-sans text-sm text-white/50 transition hover:border-white/30 hover:text-white/70"
          >
            Cargar un precio… (primero definí tu identidad)
          </button>
        )}
      </div>

      <PrecioList precios={preciosVisibles} />
    </div>
  );

  return (
    <main className="full-svh flex flex-col overflow-hidden bg-obsidian">
      <header className="flex shrink-0 flex-col gap-3 border-b border-white/5 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(`/viaje/${slug}`)}
            className="font-sans text-sm text-white/50 transition hover:text-white"
          >
            ← volver al viaje
          </button>
          {identidadChip}
        </div>
        <div>
          <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-white/40">Planeo</p>
          <h1 className="font-display text-2xl text-white sm:text-3xl">Sala de planeo</h1>
        </div>
      </header>

      {loading || !trip ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="font-sans text-sm text-white/40">Cargando…</p>
        </div>
      ) : isMobile ? (
        <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-4">
          <nav className="mb-4 flex gap-1 rounded-xl bg-white/[0.04] p-1">
            {(['notas', 'presupuesto'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setMobileTab(t)}
                className={cn(
                  'relative flex-1 rounded-lg px-3 py-2 font-display text-sm transition',
                  mobileTab === t ? 'text-white' : 'text-white/40',
                )}
              >
                {mobileTab === t && (
                  <motion.span
                    layoutId="planeo-mobile-tab"
                    className="absolute inset-0 rounded-lg bg-white/[0.06]"
                    style={{ boxShadow: 'inset 0 0 0 1px rgb(var(--neon-1) / 0.3)' }}
                    transition={{ ease: CUBIC.soft, duration: reducedMotion ? 0 : 0.3 }}
                  />
                )}
                <span className="relative">{t === 'notas' ? 'Notas' : 'Presupuesto'}</span>
              </button>
            ))}
          </nav>
          {mobileTab === 'notas' ? notasPane : presupuestoPane}
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-6 px-6 py-6">
          <section className="flex min-h-0 flex-col">
            <h2 className="mb-3 font-display text-lg text-white/80">Notas</h2>
            {notasPane}
          </section>
          <section className="flex min-h-0 flex-col">
            <h2 className="mb-3 font-display text-lg text-white/80">Presupuesto</h2>
            {presupuestoPane}
          </section>
        </div>
      )}
    </main>
  );
}

function FiltroChip({
  activo,
  onClick,
  color = '#ffffff',
  children,
}: {
  activo: boolean;
  onClick: () => void;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1 font-sans text-xs transition',
        activo ? 'text-obsidian' : 'bg-white/[0.04] text-white/50 hover:text-white/80',
      )}
      style={
        activo
          ? { backgroundColor: color, boxShadow: `0 0 12px ${color}66` }
          : undefined
      }
    >
      {children}
    </button>
  );
}
