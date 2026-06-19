import { useCallback, useEffect, useRef, useState } from 'react';
import { nanoid } from 'nanoid';
import { supabase, supabaseEnabled } from '@/lib/supabase';
import { toEUR } from '@/data/rates';
import type { Moneda, Nota, Persona, Precio } from '@/types';

function lsKey(tripId: string, table: string) {
  return `asia-${table}-${tripId}`;
}

function lsLoad<T>(tripId: string, table: string): T[] {
  try {
    const raw = localStorage.getItem(lsKey(tripId, table));
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function lsSave<T>(tripId: string, table: string, rows: T[]) {
  localStorage.setItem(lsKey(tripId, table), JSON.stringify(rows));
}

/**
 * Notas + precios del viaje con realtime (Supabase) o fallback localStorage.
 * Las inserciones son optimistas. El borrado es soft (deleted_at) para evitar
 * pérdidas catastróficas con el modelo de link confiado.
 */
export function useCollab(tripId: string | undefined, persona: Persona | null) {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [precios, setPrecios] = useState<Precio[]>([]);
  const local = !supabaseEnabled || !supabase || tripId?.startsWith('local:');
  const localRef = useRef(local);
  localRef.current = local;

  useEffect(() => {
    if (!tripId) return;
    let cancelled = false;

    if (local) {
      setNotas(lsLoad<Nota>(tripId, 'notas').filter((n) => !n.deleted_at));
      setPrecios(lsLoad<Precio>(tripId, 'precios').filter((p) => !p.deleted_at));
      return;
    }

    const sb = supabase!;
    void sb
      .from('notas')
      .select('*')
      .eq('trip_id', tripId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .then(({ data }) => !cancelled && data && setNotas(data as Nota[]));
    void sb
      .from('precios')
      .select('*')
      .eq('trip_id', tripId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .then(({ data }) => !cancelled && data && setPrecios(data as Precio[]));

    const channel = sb
      .channel(`trip:${tripId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notas', filter: `trip_id=eq.${tripId}` },
        (payload) => {
          const row = payload.new as Nota;
          setNotas((prev) => mergeRow(prev, row));
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'precios', filter: `trip_id=eq.${tripId}` },
        (payload) => {
          const row = payload.new as Precio;
          setPrecios((prev) => mergeRow(prev, row));
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void sb.removeChannel(channel);
    };
  }, [tripId, local]);

  const addNota = useCallback(
    async (texto: string, destino_id?: string) => {
      if (!tripId || !persona || !texto.trim()) return;
      const nota: Nota = {
        id: nanoid(),
        trip_id: tripId,
        destino_id: destino_id ?? null,
        autor_id: persona.id,
        autor_nombre: persona.nombre,
        autor_color: persona.color,
        texto: texto.trim().slice(0, 2000),
        created_at: new Date().toISOString(),
        deleted_at: null,
      };
      setNotas((prev) => [...prev, nota]);
      if (localRef.current) {
        lsSave(tripId, 'notas', [...lsLoad<Nota>(tripId, 'notas'), nota]);
      } else {
        await supabase!.from('notas').insert(nota);
      }
    },
    [tripId, persona],
  );

  const addPrecio = useCallback(
    async (input: { tramo_id: string; monto: number; moneda: Moneda; fuente?: string }) => {
      if (!tripId || !persona || !input.monto) return;
      const precio: Precio = {
        id: nanoid(),
        trip_id: tripId,
        tramo_id: input.tramo_id,
        autor_id: persona.id,
        autor_nombre: persona.nombre,
        autor_color: persona.color,
        monto: input.monto,
        moneda: input.moneda,
        monto_eur: toEUR(input.monto, input.moneda),
        fuente: input.fuente?.slice(0, 120),
        created_at: new Date().toISOString(),
        deleted_at: null,
      };
      setPrecios((prev) => [...prev, precio]);
      if (localRef.current) {
        lsSave(tripId, 'precios', [...lsLoad<Precio>(tripId, 'precios'), precio]);
      } else {
        await supabase!.from('precios').insert(precio);
      }
    },
    [tripId, persona],
  );

  return { notas, precios, addNota, addPrecio, isLocal: local };
}

function mergeRow<T extends { id: string; deleted_at?: string | null }>(prev: T[], row: T): T[] {
  if (row.deleted_at) return prev.filter((r) => r.id !== row.id);
  const idx = prev.findIndex((r) => r.id === row.id);
  if (idx === -1) return [...prev, row];
  const copy = [...prev];
  copy[idx] = row;
  return copy;
}
