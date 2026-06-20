import type { Destino, Ruta, TramoVuelo } from '@/types';

/** Construye una URL de Unsplash CDN al tamaño que usan las cards de ciudad. */
const cityImg = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&q=70`;

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
    ciudades: [
      {
        id: 'macau-main',
        nombre: 'Macau',
        coords: [113.5439, 22.1987],
        blurb:
          'Arrancamos acá, donde tu amigo ya nos espera. Café con egg tart portuguesa, perdernos por las callecitas del Senado y de noche dejar que las luces de Cotai nos arrastren.',
        img: cityImg('photo-1555212697-194d092e3b8f'),
      },
    ],
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
    ciudades: [
      {
        id: 'hanoi-main',
        nombre: 'Hanoi',
        coords: [105.8342, 21.0278],
        blurb:
          'Nos tiramos de cabeza al caos hermoso del Old Quarter: motos por todos lados, un banquito de plástico para el pho del desayuno y un egg coffee mirando el lago Hoan Kiem.',
        img: cityImg('photo-1613131145282-9476375618e1'),
      },
      {
        id: 'hanoi-halong',
        nombre: 'Halong Bay',
        coords: [107.0843, 20.9101],
        blurb:
          'Una noche a bordo entre los karsts que salen del agua como dientes. Kayak al amanecer, niebla baja y el silencio que no esperás después de Hanoi.',
        img: cityImg('photo-1668000018482-a02acf02b22a'),
      },
    ],
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
    ciudades: [
      {
        id: 'filipinas-manila',
        nombre: 'Manila',
        coords: [120.9842, 14.5995],
        blurb:
          'La puerta de entrada al archipiélago: una noche en Manila para sentir el pulso, comer algo local y dejar todo listo para saltar a la isla a la mañana siguiente.',
        img: cityImg('photo-1518509562904-e7ef99cdcc86'),
      },
      {
        id: 'filipinas-boracay',
        nombre: 'Boracay',
        coords: [121.9248, 11.9674],
        blurb:
          'Nuestro primer mar de verdad. White Beach con esa arena imposible, paraw al atardecer y un cubo de cervezas con los pies en el agua hasta que se hace de noche.',
        img: cityImg('photo-1639526473371-e68e5336df56'),
      },
    ],
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
    ciudades: [
      {
        id: 'bali-main',
        nombre: 'Seminyak / Canggu',
        coords: [115.1889, -8.4095],
        blurb:
          'Días largos de isla: tabla y café de especialidad en Canggu, y al atardecer un beach club tipo Potato Head con los pies en la arena y el sol cayendo al mar.',
        img: cityImg('photo-1662879567074-9a8b3e6364b7'),
      },
      {
        id: 'bali-ubud',
        nombre: 'Ubud',
        coords: [115.2624, -8.5069],
        blurb:
          'Subimos al verde: arrozales en terraza, templos entre la selva y un ritmo más lento. El lado de Bali que se queda con vos cuando volvés a casa.',
        img: cityImg('photo-1557093793-d149a38a1be8'),
      },
    ],
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
    ciudades: [
      {
        id: 'singapur-main',
        nombre: 'Singapur',
        coords: [103.8198, 1.3521],
        blurb:
          'El lujo limpio antes del clímax: Marina Bay de ciencia ficción, los Supertrees iluminados de noche y cena de hawker centre con estrella Michelin por monedas.',
        img: cityImg('photo-1525625293386-3f8f99389edd'),
      },
    ],
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
    ciudades: [
      {
        id: 'phuket-main',
        nombre: 'Phuket / Patong',
        coords: [98.3923, 7.8804],
        blurb:
          'Acá converge todo el 31. Día de playa en Patong y a la noche el Countdown 2026: fuegos sobre el mar de Andamán y Bangla Road hasta que salga el sol.',
        img: cityImg('photo-1641546373508-635403c24289'),
      },
      {
        id: 'phuket-krabi',
        nombre: 'Krabi / Ao Nang',
        coords: [98.8197, 8.0322],
        blurb:
          'Cruzamos en long-tail a Railay: paredes de caliza cayendo al agua turquesa, una cueva escondida y playas a las que solo se llega por mar.',
        img: cityImg('photo-1771533680002-5210c217a16f'),
      },
    ],
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
    ciudades: [
      {
        id: 'beijing-main',
        nombre: 'Beijing',
        coords: [116.4074, 39.9042],
        blurb:
          'Cambia el aire y entra el frío. La Gran Muralla en Mutianyu, ojalá con nieve, la Ciudad Prohibida inmensa y helada, y de cierre un pato pekinés como manda la tradición.',
        img: cityImg('photo-1508804185872-d7badad00f7d'),
      },
      {
        id: 'beijing-shanghai',
        nombre: 'Shanghái',
        coords: [121.4737, 31.2304],
        blurb:
          'Salto a la otra cara de China: caminamos el Bund al anochecer mientras se prende el skyline de Pudong, y nos perdemos entre rascacielos y callecitas de la concesión francesa.',
        img: cityImg('photo-1636017427762-5a8b1bd9f684'),
      },
    ],
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
    ciudades: [
      {
        id: 'seul-main',
        nombre: 'Seúl',
        coords: [126.978, 37.5665],
        blurb:
          'Neón helado: palacios entre rascacielos de día, Hongdae y Gangnam de noche, y BBQ con soju hasta tarde para entrar en calor.',
        img: cityImg('photo-1538485399081-7191377e8241'),
      },
      {
        id: 'seul-busan',
        nombre: 'Busan',
        coords: [129.0756, 35.1796],
        blurb:
          'Bajamos al sur en KTX: el pueblo-arcoíris de Gamcheon trepando la colina, mariscos frescos en Jagalchi y un paseo con viento de mar por Haeundae.',
        img: cityImg('photo-1672671187899-a10f547341f1'),
      },
    ],
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
    ciudades: [
      {
        id: 'tokio-main',
        nombre: 'Tokio',
        coords: [139.6917, 35.6895],
        blurb:
          'El cierre del viaje. Iluminaciones de invierno por toda la ciudad, el cruce de Shibuya sin freno y, si caemos en fin de año, hatsumode en Meiji Jingu.',
        img: cityImg('photo-1540959733332-eab4deabeeaf'),
      },
      {
        id: 'tokio-kyoto',
        nombre: 'Kyoto',
        coords: [135.7681, 35.0116],
        blurb:
          'Escapada en shinkansen al Japón de postal: los mil torii rojos de Fushimi Inari subiendo la montaña y templos en silencio entre los barrios viejos.',
        img: cityImg('photo-1764418365982-742441557a6c'),
      },
      {
        id: 'tokio-osaka',
        nombre: 'Osaka',
        coords: [135.5023, 34.6937],
        blurb:
          'La parada más golosa: el castillo recortado contra el cielo de día y, de noche, takoyaki y luces de neón reflejándose en el canal de Dotonbori.',
        img: cityImg('photo-1759041878407-371e2c1b0ac4'),
      },
    ],
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
