import type { PlanCard } from '@/types';

/**
 * Planes "main" por destino (deck de cards). Contenido real curado; fotos de
 * Unsplash (licencia libre, hotlink permitido) verificadas (200 image/jpeg).
 * Para reemplazar una foto por material propio, cambiá la URL de `img`.
 */
const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

export const PLANES: Record<string, PlanCard[]> = {
  macau: [
    {
      id: 'macau-sao-paulo',
      categoria: 'cultura',
      titulo: 'Ruínas de São Paulo',
      blurb: 'La fachada de la vieja iglesia jesuita, símbolo de Macau y del cruce entre Portugal y China. Arranque obligado del casco histórico.',
      img: img('photo-1707682769244-8c4feecd807c'),
    },
    {
      id: 'macau-senado',
      categoria: 'ciudad',
      titulo: 'Largo do Senado',
      blurb: 'La plaza empedrada en olas blancas y negras, rodeada de edificios coloniales pastel. El corazón peatonal de la ciudad vieja.',
      img: img('photo-1553660148-d3ffd5cfe5a8'),
    },
    {
      id: 'macau-cotai',
      categoria: 'fiesta',
      titulo: 'Cotai — los casinos',
      blurb: 'El Vegas de Asia: neón infinito, shows y casinos que no duermen. Para una noche de exceso elegante.',
      img: img('photo-1567225299676-9ebaa1d8b28f'),
    },
    {
      id: 'macau-comida',
      categoria: 'comida',
      titulo: 'Comida macaense',
      blurb: 'Egg tarts calentitos, bacalhau y minchi: la cocina que solo existe acá, mezcla de recetas portuguesas y cantonesas.',
      img: img('photo-1716360806681-b4defdfba134'),
    },
  ],

  hanoi: [
    {
      id: 'hanoi-old-quarter',
      categoria: 'ciudad',
      titulo: 'Old Quarter',
      blurb: 'Calles angostas, motos por todos lados y vida desbordada. Perderse acá a pie es el mejor plan.',
      img: img('photo-1613131145282-9476375618e1'),
    },
    {
      id: 'hanoi-hoan-kiem',
      categoria: 'cultura',
      titulo: 'Lago Hoan Kiem',
      blurb: 'El lago con la Torre de la Tortuga en el medio, el pulmón del centro. Mágico al amanecer, con la ciudad haciendo tai chi.',
      img: img('photo-1702118937156-d8f4d86076ac'),
    },
    {
      id: 'hanoi-pho',
      categoria: 'comida',
      titulo: 'Pho callejero',
      blurb: 'Un bowl humeante en un banquito de plástico en la vereda. Vietnam en una cucharada.',
      img: img('photo-1631709497146-a239ef373cf1'),
    },
    {
      id: 'hanoi-egg-coffee',
      categoria: 'comida',
      titulo: 'Egg coffee',
      blurb: 'Café cubierto con una crema dulce de yema batida, invento hanoiano. Suena raro, es adictivo.',
      img: img('photo-1751569543716-70c5fb9a8298'),
    },
    {
      id: 'hanoi-halong',
      categoria: 'naturaleza',
      titulo: 'Halong Bay (overnight)',
      blurb: 'Escapada opcional: dormir en un barco entre cientos de karsts de piedra saliendo del agua esmeralda.',
      img: img('photo-1761127138372-cad230082b19'),
    },
  ],

  filipinas: [
    {
      id: 'filipinas-boracay',
      categoria: 'playa',
      titulo: 'White Beach, Boracay',
      blurb: 'Arena blanca finísima y agua turquesa, con atardeceres de postal y bares a pie de playa.',
      img: img('photo-1574421624183-fa5b6250d896'),
    },
    {
      id: 'filipinas-island-hopping',
      categoria: 'naturaleza',
      titulo: 'Island hopping',
      blurb: 'Saltar de isla en isla en bangka, snorkel en lagunas escondidas y playas sin nadie.',
      img: img('photo-1587102492933-8fa2f2f230f6'),
    },
    {
      id: 'filipinas-manila',
      categoria: 'ciudad',
      titulo: 'Manila de noche',
      blurb: 'El caos vibrante del gateway: rooftops, vida nocturna y la energía de una megaciudad tropical.',
      img: img('photo-1623518761090-089a985ab17f'),
    },
  ],

  bali: [
    {
      id: 'bali-beach-club',
      categoria: 'fiesta',
      titulo: 'Beach clubs de Seminyak',
      blurb: 'Potato Head, Finns y compañía: piletas infinitas, tragos al atardecer y música hasta tarde frente al mar.',
      img: img('photo-1546484475-7f7bd55792da'),
    },
    {
      id: 'bali-tanah-lot',
      categoria: 'templo',
      titulo: 'Templo Tanah Lot',
      blurb: 'El templo sobre una roca en el mar, recortado contra el atardecer. La postal espiritual de Bali.',
      img: img('photo-1553902000-e036b7d05af5'),
    },
    {
      id: 'bali-ubud',
      categoria: 'naturaleza',
      titulo: 'Arrozales de Ubud',
      blurb: 'Las terrazas verdes de Tegallalang, escalonadas en la montaña. El Bali interior, calmo y selvático.',
      img: img('photo-1715755455989-76413081ad10'),
    },
    {
      id: 'bali-canggu',
      categoria: 'playa',
      titulo: 'Playas de Canggu',
      blurb: 'Surf, arena oscura volcánica y cafés de moda. El lado más relajado y joven de la isla.',
      img: img('photo-1662950267280-0cdf5f7139b4'),
    },
  ],

  singapur: [
    {
      id: 'singapur-marina-bay',
      categoria: 'ciudad',
      titulo: 'Marina Bay Sands',
      blurb: 'El skyline de ciencia ficción y la pileta infinita en el cielo. Singapur mostrando músculo.',
      img: img('photo-1744705221117-9c726f9497b0'),
    },
    {
      id: 'singapur-gardens',
      categoria: 'naturaleza',
      titulo: 'Gardens by the Bay',
      blurb: 'Los Supertrees iluminados de noche, un jardín futurista. Show de luces gratis al caer el sol.',
      img: img('photo-1698513924628-4f6e0e4c00f6'),
    },
    {
      id: 'singapur-hawker',
      categoria: 'comida',
      titulo: 'Hawker centres',
      blurb: 'Estrella Michelin por unos dólares: chili crab, laksa y Hainanese chicken rice en patios de comidas.',
      img: img('photo-1584198414538-f469f6fad430'),
    },
  ],

  phuket: [
    {
      id: 'phuket-patong',
      categoria: 'playa',
      titulo: 'Patong Beach',
      blurb: 'La playa epicentro, sobre el mar de Andamán. De día sol y agua tibia; de noche, el motor de la fiesta.',
      img: img('photo-1728023178162-5befe3071b1c'),
    },
    {
      id: 'phuket-bangla',
      categoria: 'fiesta',
      titulo: 'Bangla Road',
      blurb: 'La calle de neón que no para. El 31 a la noche, el punto cero del Año Nuevo.',
      img: img('photo-1642391326089-e1de34462ff2'),
    },
    {
      id: 'phuket-andaman',
      categoria: 'naturaleza',
      titulo: 'Mar de Andamán',
      blurb: 'Longtail boats hacia Phi Phi y James Bond Island: acantilados de piedra caliza y agua imposible.',
      img: img('photo-1686238349945-82074ce9f02f'),
    },
    {
      id: 'phuket-food',
      categoria: 'comida',
      titulo: 'Street food tailandés',
      blurb: 'Pad thai, mango sticky rice y curries en puestos al paso. Picante, dulce y barato.',
      img: img('photo-1637806930600-37fa8892069d'),
    },
    {
      id: 'phuket-big-buddha',
      categoria: 'templo',
      titulo: 'Big Buddha',
      blurb: 'El buda blanco de 45 metros sobre la colina, con vista de 360° a toda la isla. Pausa de calma.',
      img: img('photo-1586820672103-2272d8490ade'),
    },
  ],

  beijing: [
    {
      id: 'beijing-muralla',
      categoria: 'cultura',
      titulo: 'Gran Muralla — Mutianyu',
      blurb: 'El tramo mejor conservado y menos lleno, serpenteando por las montañas. En invierno, quizás con nieve.',
      img: img('photo-1716929955955-f6ef9c1ca084'),
    },
    {
      id: 'beijing-ciudad-prohibida',
      categoria: 'cultura',
      titulo: 'Ciudad Prohibida',
      blurb: 'El palacio imperial inmenso y helado, 9.000 salas de pura dinastía. Para perderse una mañana entera.',
      img: img('photo-1547981609-4b6bfe67ca0b'),
    },
    {
      id: 'beijing-pato',
      categoria: 'comida',
      titulo: 'Pato pekinés',
      blurb: 'Piel crujiente laqueada, cortada en la mesa y envuelta en panqueques finos. El plato de la ciudad.',
      img: img('photo-1765743691388-6a5608004b9c'),
    },
    {
      id: 'beijing-templo-cielo',
      categoria: 'templo',
      titulo: 'Templo del Cielo',
      blurb: 'El templo circular azul entre parques donde los locales bailan y juegan. Belleza y vida cotidiana.',
      img: img('photo-1754258987839-60f8aeab8664'),
    },
  ],

  seul: [
    {
      id: 'seul-gyeongbokgung',
      categoria: 'templo',
      titulo: 'Palacio Gyeongbokgung',
      blurb: 'El gran palacio real entre rascacielos, con cambio de guardia. Se puede recorrer en hanbok.',
      img: img('photo-1622368170784-08ee3184eb6f'),
    },
    {
      id: 'seul-nightlife',
      categoria: 'fiesta',
      titulo: 'Hongdae & Gangnam',
      blurb: 'Calles de neón, bares, karaoke y clubs hasta el amanecer. La noche coreana es maratón.',
      img: img('photo-1751571964263-e407682f8778'),
    },
    {
      id: 'seul-bbq',
      categoria: 'comida',
      titulo: 'Barbacoa coreana',
      blurb: 'Carne a la parrilla en la mesa, banchan sin fin y soju. Cena ritual, larga y feliz.',
      img: img('photo-1548150914-c9f19106dbf6'),
    },
    {
      id: 'seul-tower',
      categoria: 'ciudad',
      titulo: 'N Seoul Tower',
      blurb: 'La torre sobre el monte Namsan con vista total a la megaciudad. Mejor al atardecer, cuando se prenden las luces.',
      img: img('photo-1741311653793-f8581cff30a8'),
    },
  ],

  tokio: [
    {
      id: 'tokio-shibuya',
      categoria: 'ciudad',
      titulo: 'Shibuya Crossing',
      blurb: 'El cruce más famoso del mundo, un mar de gente bajo pantallas gigantes. Tokio en estado puro.',
      img: img('photo-1741684650296-19f452c8814f'),
    },
    {
      id: 'tokio-sensoji',
      categoria: 'templo',
      titulo: 'Senso-ji',
      blurb: 'El templo más antiguo de la ciudad, en Asakusa, con su calle de puestos y la linterna roja gigante.',
      img: img('photo-1543402701-cfd2d56f773b'),
    },
    {
      id: 'tokio-ramen',
      categoria: 'comida',
      titulo: 'Ramen & izakayas',
      blurb: 'De un bowl de ramen en un local de 6 asientos a saltar entre izakayas en callejones de neón.',
      img: img('photo-1569718212165-3a8278d5f624'),
    },
    {
      id: 'tokio-meiji',
      categoria: 'cultura',
      titulo: 'Meiji Jingu',
      blurb: 'El santuario en medio de un bosque, con su torii enorme de madera. Hatsumode de Año Nuevo si hay suerte.',
      img: img('photo-1720454206018-8d977e9e984a'),
    },
  ],
};
