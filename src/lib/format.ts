import type { Moneda } from '@/types';

export function formatMoney(monto: number, moneda: Moneda): string {
  try {
    return new Intl.NumberFormat('es', {
      style: 'currency',
      currency: moneda,
      maximumFractionDigits: moneda === 'IDR' || moneda === 'VND' ? 0 : 2,
    }).format(monto);
  } catch {
    return `${monto} ${moneda}`;
  }
}

export function formatEUR(monto: number): string {
  return new Intl.NumberFormat('es', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(monto);
}

export function formatFecha(iso: string): string {
  try {
    return new Intl.DateTimeFormat('es', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
