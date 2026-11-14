// Fechas como claves locales 'YYYY-MM-DD' para evitar problemas de zona horaria.

export type DateKey = string;

const pad = (n: number) => String(n).padStart(2, '0');

export function toKey(d: Date): DateKey {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromKey(key: DateKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(): DateKey {
  return toKey(new Date());
}

export function addDays(key: DateKey, days: number): DateKey {
  const d = fromKey(key);
  d.setDate(d.getDate() + days);
  return toKey(d);
}

/** Días del mes en una cuadrícula que empieza en lunes. null = celda vacía. */
export function monthGrid(year: number, month: number): (DateKey | null)[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // lunes = 0
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (DateKey | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= days; d++) cells.push(toKey(new Date(year, month, d)));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function formatLong(key: DateKey): string {
  const d = fromKey(key);
  const wd = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][d.getDay()];
  return `${wd} ${d.getDate()} de ${MONTHS[d.getMonth()].toLowerCase()}`;
}
