export type BadgeId = 'vida-nocturna' | 'playa' | 'ano-nuevo' | 'cultura' | 'comida';

/** Categorías de los planes "main" por destino (deck de cards). */
export type PlanCategoria =
  | 'comida'
  | 'playa'
  | 'ciudad'
  | 'templo'
  | 'fiesta'
  | 'cultura'
  | 'naturaleza';

export interface PlanCard {
  id: string;
  categoria: PlanCategoria;
  titulo: string;
  /** Descripción corta (1-2 frases) del plan. */
  blurb: string;
  /** URL de foto real de alta calidad (Unsplash/Pexels CDN). */
  img: string;
}

export type RutaId = '30' | '45';

export type Region = 'sudeste' | 'norte';

export type Moneda =
  | 'EUR'
  | 'DKK'
  | 'THB'
  | 'IDR'
  | 'PHP'
  | 'VND'
  | 'CNY'
  | 'JPY'
  | 'SGD'
  | 'USD';

export interface Destino {
  id: string;
  nombre: string;
  pais: string;
  /** [lng, lat] — GeoJSON / Mapbox order. */
  coords: [number, number];
  badges: BadgeId[];
  highlights: string[];
  /** Chip informativo de visa (pasaporte UE). */
  visa?: string;
  /** En qué rutas aparece este destino. */
  enRutas: RutaId[];
  /** Noches orientativas por ruta, ej. { '45': '5-6n' }. */
  nochesPorRuta: Partial<Record<RutaId, string>>;
  /** Phuket = clímax / año nuevo. */
  esClimax?: boolean;
  /** Dirige la temperatura de la paleta (warm/cold). */
  region: Region;
  /** Subtítulo poético corto para el panel. */
  tagline: string;
}

export interface Ruta {
  id: RutaId;
  nombre: string;
  destinos: string[];
  duracionAprox: string;
}

export interface TramoVuelo {
  id: string;
  /** id de destino o 'CPH'. */
  origen: string;
  destino: string;
  rutas: RutaId[];
  duracion: string;
  notaRuteo?: string;
  aerolinea?: string;
}

/** Identidad liviana, guardada en localStorage. No es auth. */
export interface Persona {
  id: string;
  nombre: string;
  color: string;
}

export interface Nota {
  id: string;
  trip_id: string;
  destino_id?: string | null;
  autor_id: string;
  autor_nombre: string;
  autor_color: string;
  texto: string;
  created_at: string;
  deleted_at?: string | null;
}

export interface Precio {
  id: string;
  trip_id: string;
  tramo_id: string;
  autor_id: string;
  autor_nombre: string;
  autor_color: string;
  monto: number;
  moneda: Moneda;
  /** Calculado al guardar con rates.ts. */
  monto_eur: number;
  fuente?: string;
  created_at: string;
  deleted_at?: string | null;
}

export type Tier = 'static' | 'lite' | 'premium';
