import type { Moneda } from '@/types';

/**
 * Tasas manuales → EUR. NO hay API en vivo (decisión de diseño: 2 personas,
 * sin dependencia frágil). Editá estos valores a mano cuando haga falta.
 * Valor = cuántas unidades de la moneda equivalen a 1 EUR.
 */
export const RATES_PER_EUR: Record<Moneda, number> = {
  EUR: 1,
  DKK: 7.46,
  THB: 38.5,
  IDR: 17500,
  PHP: 62,
  VND: 27000,
  CNY: 7.8,
  JPY: 168,
  SGD: 1.45,
  USD: 1.08,
};

/** Fecha de la última actualización manual de tasas (se muestra junto al tally). */
export const RATES_UPDATED_AT = '2026-06-19';

export function toEUR(monto: number, moneda: Moneda): number {
  const rate = RATES_PER_EUR[moneda] ?? 1;
  return Math.round((monto / rate) * 100) / 100;
}
