import { useEffect, useState } from 'react';
import { supabase, supabaseEnabled } from '@/lib/supabase';

export interface Trip {
  id: string;
  slug: string;
  titulo: string;
}

/**
 * Resuelve slug -> trip vía RPC `get_trip_by_slug` (la tabla `trips` está
 * cerrada a anon; el RPC es la única puerta). Si Supabase no está configurado,
 * devuelve un trip "local" usando el slug como id, para que la app corra
 * standalone con persistencia en localStorage.
 */
export function useTrip(slug: string | undefined) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!slug) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    if (!supabaseEnabled || !supabase) {
      setTrip({ id: `local:${slug}`, slug, titulo: 'Nuestro viaje' });
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .rpc('get_trip_by_slug', { p_slug: slug })
      .then(({ data, error }) => {
        if (cancelled) return;
        const row = Array.isArray(data) ? data[0] : data;
        if (error || !row) {
          setNotFound(true);
        } else {
          setTrip({ id: row.id, slug: row.slug, titulo: row.titulo ?? 'Nuestro viaje' });
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { trip, loading, notFound };
}
