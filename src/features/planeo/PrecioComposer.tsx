import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { Moneda, Persona, TramoVuelo } from '@/types';
import { DESTINOS_BY_ID, ORIGEN } from '@/data/itinerario';
import { RATES_PER_EUR, toEUR } from '@/data/rates';
import { formatEUR } from '@/lib/format';
import { useExperience } from '@/store/experience';
import { CUBIC } from '@/lib/motion';
import { cn } from '@/lib/utils';

const MONEDAS = Object.keys(RATES_PER_EUR) as Moneda[];

/** Nombre legible de un punto del itinerario (destino o el origen CPH). */
function nombrePunto(id: string): string {
  if (id === ORIGEN.id) return ORIGEN.nombre;
  return DESTINOS_BY_ID[id]?.nombre ?? id;
}

export function nombreTramo(tramo: TramoVuelo): string {
  return `${nombrePunto(tramo.origen)} → ${nombrePunto(tramo.destino)}`;
}

interface Props {
  persona: Persona | null;
  tramos: TramoVuelo[];
  onAdd: (input: {
    tramo_id: string;
    monto: number;
    moneda: Moneda;
    fuente?: string;
  }) => void | Promise<void>;
}

/**
 * Carga de precio de un tramo, con conversión a EUR en vivo mientras se escribe.
 */
export function PrecioComposer({ persona, tramos, onAdd }: Props) {
  const reducedMotion = useExperience((s) => s.caps.reducedMotion);
  const [tramoId, setTramoId] = useState<string>(tramos[0]?.id ?? '');
  const [montoStr, setMontoStr] = useState('');
  const [moneda, setMoneda] = useState<Moneda>('EUR');
  const [fuente, setFuente] = useState('');

  const monto = Number(montoStr);
  const montoValido = montoStr !== '' && !Number.isNaN(monto) && monto > 0;
  const eur = useMemo(
    () => (montoValido ? toEUR(monto, moneda) : 0),
    [monto, moneda, montoValido],
  );
  const puede = !!persona && !!tramoId && montoValido;

  function guardar() {
    if (!puede) return;
    void onAdd({
      tramo_id: tramoId,
      monto,
      moneda,
      fuente: fuente.trim() || undefined,
    });
    setMontoStr('');
    setFuente('');
  }

  if (!persona) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-3 font-sans text-sm text-white/50">
        Creá tu identidad para cargar precios.
      </div>
    );
  }

  const inputBase =
    'w-full rounded-xl bg-white/5 px-3 py-2.5 font-sans text-sm text-white placeholder-white/25 outline-none transition focus:bg-white/10';

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="font-sans text-xs uppercase tracking-widest text-white/40">Tramo</span>
        <select
          value={tramoId}
          onChange={(e) => setTramoId(e.target.value)}
          className={cn(inputBase, 'mt-1.5 appearance-none bg-obsidian-700')}
        >
          {tramos.map((t) => (
            <option key={t.id} value={t.id} className="bg-obsidian-700">
              {nombreTramo(t)}
            </option>
          ))}
        </select>
      </label>

      <div className="flex gap-3">
        <label className="block flex-1">
          <span className="font-sans text-xs uppercase tracking-widest text-white/40">Monto</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={montoStr}
            placeholder="0"
            onChange={(e) => setMontoStr(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') guardar();
            }}
            className={cn(inputBase, 'mt-1.5 tabular-nums')}
          />
        </label>
        <label className="block w-28">
          <span className="font-sans text-xs uppercase tracking-widest text-white/40">Moneda</span>
          <select
            value={moneda}
            onChange={(e) => setMoneda(e.target.value as Moneda)}
            className={cn(inputBase, 'mt-1.5 appearance-none bg-obsidian-700')}
          >
            {MONEDAS.map((m) => (
              <option key={m} value={m} className="bg-obsidian-700">
                {m}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="font-sans text-xs uppercase tracking-widest text-white/40">
          Fuente (opcional)
        </span>
        <input
          value={fuente}
          maxLength={120}
          placeholder="Skyscanner 19/6"
          onChange={(e) => setFuente(e.target.value)}
          className={cn(inputBase, 'mt-1.5')}
        />
      </label>

      <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-2.5">
        <span className="font-sans text-xs uppercase tracking-widest text-white/40">≈ en EUR</span>
        <span className="neon-text font-display text-lg tabular-nums">
          {montoValido ? formatEUR(eur) : '—'}
        </span>
      </div>

      <motion.button
        type="button"
        disabled={!puede}
        onClick={guardar}
        whileTap={puede ? { scale: 0.97 } : undefined}
        transition={{ ease: CUBIC.soft }}
        className={cn(
          'w-full rounded-xl px-4 py-2.5 font-display text-sm text-obsidian transition',
          puede ? 'cursor-pointer' : 'cursor-not-allowed opacity-40',
        )}
        style={{
          backgroundColor: persona.color,
          boxShadow: puede && !reducedMotion ? `0 0 18px ${persona.color}70` : undefined,
        }}
      >
        Guardar precio
      </motion.button>
    </div>
  );
}
