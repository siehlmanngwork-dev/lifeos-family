import type { Weekday } from '../models';

const pad = (n: number): string => String(n).padStart(2, '0');

/** Local calendar date as "YYYY-MM-DD". */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Local midnight of a "YYYY-MM-DD" key. */
export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, date.getHours(), date.getMinutes());
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

/** Monday-based start of week. */
export function startOfWeek(date: Date): Date {
  const day = startOfDay(date);
  const offset = (day.getDay() + 6) % 7;
  return addDays(day, -offset);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

const WEEKDAY_BY_JS_DAY: Weekday[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export function weekdayOf(date: Date): Weekday {
  return WEEKDAY_BY_JS_DAY[date.getDay()];
}

/** Value for <input type="datetime-local"> from an ISO string. */
export function toDateTimeLocalValue(iso: string): string {
  const d = new Date(iso);
  return `${toDateKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** ISO string from an <input type="datetime-local"> value (interpreted as local time). */
export function fromDateTimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}

/** Overlap of [aStart, aEnd) and [bStart, bEnd) in minutes. */
export function overlapMinutes(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): number {
  const start = Math.max(aStart.getTime(), bStart.getTime());
  const end = Math.min(aEnd.getTime(), bEnd.getTime());
  return Math.max(0, (end - start) / 60000);
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

/** e.g. "Mittwoch, 18. November" */
export function formatLongDate(date: Date): string {
  return date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
}

/** e.g. "Mi., 18.11." */
export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

export function formatDeadline(deadline: string | null, time?: string | null): string {
  if (!deadline) return 'Irgendwann';
  const date = formatShortDate(fromDateKey(deadline));
  return time ? `${date} ${time}` : date;
}

/** e.g. "2 h 30 min" */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h && m) return `${h} h ${m} min`;
  if (h) return `${h} h`;
  return `${m} min`;
}
