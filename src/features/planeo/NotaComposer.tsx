import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Persona } from '@/types';
import { useExperience } from '@/store/experience';
import { CUBIC } from '@/lib/motion';
import { cn } from '@/lib/utils';

const MAX = 2000;

interface Props {
  tripId: string;
  persona: Persona | null;
  destinoId?: string;
  onAdd: (texto: string, destino_id?: string) => void | Promise<void>;
}

/**
 * Compositor de notas. Enter envía, Shift+Enter inserta salto de línea.
 * Si no hay persona, invita a crear la identidad primero.
 */
export function NotaComposer({ tripId, persona, destinoId, onAdd }: Props) {
  const reducedMotion = useExperience((s) => s.caps.reducedMotion);
  const [texto, setTexto] = useState('');

  // tripId se mantiene en la firma por contrato; el envío real lo resuelve onAdd.
  void tripId;

  const limpio = texto.trim();
  const puedeEnviar = !!persona && limpio.length > 0;

  function enviar() {
    if (!puedeEnviar) return;
    void onAdd(limpio, destinoId);
    setTexto('');
  }

  if (!persona) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-3 font-sans text-sm text-white/50">
        Creá tu identidad para dejar notas en el viaje.
      </div>
    );
  }

  return (
    <div className="relative">
      <textarea
        value={texto}
        maxLength={MAX}
        rows={3}
        placeholder="Dejá una nota…"
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviar();
          }
        }}
        className="w-full resize-none rounded-xl bg-white/5 px-4 py-3 font-sans text-sm text-white placeholder-white/25 outline-none transition focus:bg-white/10"
        style={{ boxShadow: `inset 0 0 0 1px ${persona.color}40` }}
      />
      <div className="mt-2 flex items-center justify-between">
        <span
          className={cn(
            'font-sans text-xs tabular-nums',
            texto.length > MAX - 100 ? 'text-neon-1' : 'text-white/30',
          )}
        >
          {texto.length}/{MAX}
        </span>
        <motion.button
          type="button"
          disabled={!puedeEnviar}
          onClick={enviar}
          whileTap={puedeEnviar ? { scale: 0.96 } : undefined}
          transition={{ ease: CUBIC.soft }}
          className={cn(
            'rounded-lg px-4 py-1.5 font-display text-sm text-obsidian transition',
            puedeEnviar ? 'cursor-pointer' : 'cursor-not-allowed opacity-40',
          )}
          style={{
            backgroundColor: persona.color,
            boxShadow: puedeEnviar && !reducedMotion ? `0 0 16px ${persona.color}70` : undefined,
          }}
        >
          Enviar
        </motion.button>
      </div>
    </div>
  );
}
