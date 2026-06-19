import type { Destino, Ruta, TramoVuelo } from '@/types';

/** Punto de origen/retorno. No es un "destino" del recorrido pero ancla los arcos. */
export const ORIGEN = {
  id: 'CPH',
  nombre: 'Copenhague',
  pais: 'Dinamarca',
  coords: [12.5683, 55.6761] as [number, number],
};

/**
 * Single source of truth del itinerario. Días orientativos.
 * Phuket el 31/dic es ancla fija (año nuevo). Japón después del 3/ene.
 */
export const DESTINOS: Destino[] = [
  {
    id: 'macau',
    nombre: 'Macau',
    pais: 'China (RAE)',
    coords: [113.5439, 22.1987],
    badges: ['cultura', 'vida-nocturna', 'comida'],
    highlights: [
      'Casco histórico portugués: Senado, Ruínas de São Paulo',
      'Cotai y los casinos que nunca duermen',
      'Comida macaense: el cruce de Portugal y el sur de China',
    ],
    visa: 'Visa-free',
    enRutas: ['30', '45'],
    nochesPorRuta: { '30': '3n', '45': '4n' },
    region: 'sudeste',
    tagline: 'Donde arranca todo. Tu amigo ya está acá.',
  },
  {
    id: 'hanoi',
    nombre: 'Hanoi',
    pais: 'Vietnam',
    coords: [105.8342, 21.0278],
    badges: ['cultura', 'comida'],
    highlights: [
      'Old Quarter y el lago Hoan Kiem al amanecer',
      'Street food sin fin: pho, bun cha, egg coffee',
      'Opcional: Halong Bay overnight entre karsts',
    ],
    visa: 'Visa-free 45d',
    enRutas: ['30', '45'],
    nochesPorRuta: { '30': '3n', '45': '3-4n' },
    region: 'sudeste',
    tagline: 'Caos hermoso a 1h45 de Macau.',
  },
  {
    id: 'filipinas',
    nombre: 'Filipinas',
    pais: 'Filipinas',
    coords: [120.9842, 14.5995],
    badges: ['playa', 'vida-nocturna', 'comida'],
    highlights: [
      'Manila como gateway',
      'Isla a elección: Cebu/Bohol o Boracay vía Caticlan',
      'White Beach y el agua imposible',
    ],
    visa: 'Visa-free 30d (+ eTravel)',
    enRutas: ['30', '45'],
    nochesPorRuta: { '30': '4n', '45': '6-7n' },
    region: 'sudeste',
    tagline: 'El primer mar de verdad.',
  },
  {
    id: 'bali',
    nombre: 'Bali',
    pais: 'Indonesia',
    coords: [115.1889, -8.4095],
    badges: ['playa', 'vida-nocturna', 'cultura'],
    highlights: [
      'Seminyak / Canggu: Finns, Potato Head, beach clubs al atardecer',
      'Templos y los arrozales de Ubud',
      'Ritmo de isla, días largos',
    ],
    visa: 'e-VoA pago (IDR 500.000, 30d)',
    enRutas: ['30', '45'],
    nochesPorRuta: { '30': '3-4n', '45': '6n' },
    region: 'sudeste',
    tagline: 'La única visa que se paga. Vale cada rupia.',
  },
  {
    id: 'singapur',
    nombre: 'Singapur',
    pais: 'Singapur',
    coords: [103.8198, 1.3521],
    badges: ['vida-nocturna', 'comida', 'cultura'],
    highlights: [
      'Marina Bay y el skyline de ciencia ficción',
      'Gardens by the Bay de noche',
      'Hawker centres: estrella Michelin por 4 dólares',
    ],
    visa: 'Visa-free 90d',
    enRutas: ['45'],
    nochesPorRuta: { '45': '3n' },
    region: 'sudeste',
    tagline: 'Solo en la ruta de 45. El lujo limpio antes del clímax.',
  },
  {
    id: 'phuket',
    nombre: 'Phuket',
    pais: 'Tailandia',
    coords: [98.3923, 7.8804],
    badges: ['ano-nuevo', 'playa', 'vida-nocturna'],
    highlights: [
      'Patong Countdown 2026: fuegos sobre el mar de Andamán',
      'Bangla Road hasta que salga el sol',
      'El 31 a la noche, todo converge acá',
    ],
    visa: 'Visa-free',
    enRutas: ['30', '45'],
    nochesPorRuta: { '30': '4n', '45': '5-6n' },
    esClimax: true,
    region: 'sudeste',
    tagline: '31 de diciembre. El pico de todo el viaje.',
  },
  {
    id: 'beijing',
    nombre: 'Beijing',
    pais: 'China',
    coords: [116.4074, 39.9042],
    badges: ['cultura', 'comida'],
    highlights: [
      'La Gran Muralla en Mutianyu, con nieve si hay suerte',
      'Ciudad Prohibida, inmensa y helada',
      'Pato pekinés como se debe',
    ],
    visa: 'Visa-free 30d (italianos, hasta 31/12/2026)',
    enRutas: ['30', '45'],
    nochesPorRuta: { '30': '3n', '45': '4-5n' },
    region: 'norte',
    tagline: 'El aire cambia. Empieza el frío.',
  },
  {
    id: 'seul',
    nombre: 'Seúl',
    pais: 'Corea del Sur',
    coords: [126.978, 37.5665],
    badges: ['vida-nocturna', 'comida', 'cultura'],
    highlights: [
      'Hongdae y Gangnam de noche',
      'Palacios entre rascacielos',
      'Mercados, BBQ y soju hasta tarde',
    ],
    visa: 'Visa-free 90d (verificar K-ETA)',
    enRutas: ['45'],
    nochesPorRuta: { '45': '3-4n' },
    region: 'norte',
    tagline: 'Solo en la ruta de 45. Neón helado.',
  },
  {
    id: 'tokio',
    nombre: 'Tokio',
    pais: 'Japón',
    coords: [139.6917, 35.6895],
    badges: ['cultura', 'comida', 'vida-nocturna'],
    highlights: [
      'Iluminaciones de invierno por toda la ciudad',
      'Hatsumode en Meiji Jingu, Shibuya sin freno',
      'Opcional: escapada a Kioto',
    ],
    visa: 'Visa-free 90d',
    enRutas: ['30', '45'],
    nochesPorRuta: { '30': '6n', '45': '7-8n' },
    region: 'norte',
    tagline: 'El cierre. Desde acá, el vuelo a casa.',
  },
];

export const DESTINOS_BY_ID: Record<string, Destino> = Object.fromEntries(
  DESTINOS.map((d) => [d.id, d]),
);

export const RUTAS: Record<'30' | '45', Ruta> = {
  '45': {
    id: '45',
    nombre: 'La ruta completa',
    duracionAprox: '~45 días',
    destinos: [
      'macau',
      'hanoi',
      'filipinas',
      'bali',
      'singapur',
      'phuket',
      'beijing',
      'seul',
      'tokio',
    ],
  },
  '30': {
    id: '30',
    nombre: 'El recorte',
    duracionAprox: '~30 días',
    destinos: ['macau', 'hanoi', 'filipinas', 'bali', 'phuket', 'beijing', 'tokio'],
  },
};

/** Destinos que solo existen en la ruta de 45 — los que el toggle prende/apaga. */
export const DESTINOS_SOLO_45 = ['singapur', 'seul'];

export const TRAMOS: TramoVuelo[] = [
  {
    id: 'cph-macau',
    origen: 'CPH',
    destino: 'macau',
    rutas: ['30', '45'],
    duracion: '1 escala',
    notaRuteo: 'Vía Shanghái, o vía Hong Kong + coach del puente HZMB',
  },
  {
    id: 'macau-hanoi',
    origen: 'macau',
    destino: 'hanoi',
    rutas: ['30', '45'],
    duracion: '~1h45',
    aerolinea: 'Air Macau',
  },
  { id: 'hanoi-manila', origen: 'hanoi', destino: 'filipinas', rutas: ['30', '45'], duracion: '~3h25' },
  {
    id: 'manila-bali',
    origen: 'filipinas',
    destino: 'bali',
    rutas: ['30', '45'],
    duracion: '1 escala, ~6-8h',
  },
  { id: 'bali-singapur', origen: 'bali', destino: 'singapur', rutas: ['45'], duracion: '~2h45' },
  { id: 'singapur-phuket', origen: 'singapur', destino: 'phuket', rutas: ['45'], duracion: '~1h45' },
  {
    id: 'bali-phuket',
    origen: 'bali',
    destino: 'phuket',
    rutas: ['30'],
    duracion: '~4h directo',
  },
  {
    id: 'phuket-beijing',
    origen: 'phuket',
    destino: 'beijing',
    rutas: ['30', '45'],
    duracion: '~5,5h o 1 escala',
  },
  { id: 'beijing-seul', origen: 'beijing', destino: 'seul', rutas: ['45'], duracion: '~2h' },
  { id: 'seul-tokio', origen: 'seul', destino: 'tokio', rutas: ['45'], duracion: '~2,5h' },
  {
    id: 'beijing-tokio',
    origen: 'beijing',
    destino: 'tokio',
    rutas: ['30'],
    duracion: '~3,5h directo',
  },
  {
    id: 'tokio-cph',
    origen: 'tokio',
    destino: 'CPH',
    rutas: ['30', '45'],
    duracion: '~13h20 nonstop',
    aerolinea: 'SAS SK984, A350',
  },
];

export function tramosDeRuta(ruta: '30' | '45'): TramoVuelo[] {
  return TRAMOS.filter((t) => t.rutas.includes(ruta));
}

export function destinosDeRuta(ruta: '30' | '45'): Destino[] {
  return RUTAS[ruta].destinos.map((id) => DESTINOS_BY_ID[id]);
}
