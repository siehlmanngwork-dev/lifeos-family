import type { RecurrenceType, RecurrenceUnit, Task } from '../../models';
import { fromDateKey, toDateKey } from '../../utils/date';

export interface RecurrenceRule {
  type: RecurrenceType;
  /** Only for "custom": every N units. */
  interval: number;
  unit: RecurrenceUnit;
}

export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  daily: 'Täglich',
  weekly: 'Wöchentlich',
  monthly: 'Monatlich',
  yearly: 'Jährlich',
  custom: 'Benutzerdefiniert',
};

export const RECURRENCE_UNIT_LABELS: Record<RecurrenceUnit, string> = {
  days: 'Tage',
  weeks: 'Wochen',
  months: 'Monate',
};

/** Normalizes a rule to a step of N days or N months. */
function step(rule: RecurrenceRule): { days: number } | { months: number } {
  switch (rule.type) {
    case 'daily':
      return { days: 1 };
    case 'weekly':
      return { days: 7 };
    case 'monthly':
      return { months: 1 };
    case 'yearly':
      return { months: 12 };
    case 'custom': {
      const n = Math.max(1, Math.floor(rule.interval));
      if (rule.unit === 'days') return { days: n };
      if (rule.unit === 'weeks') return { days: 7 * n };
      return { months: n };
    }
  }
}

/**
 * Deadline of occurrence `index` (0 = start). Months are counted from the start date,
 * clamped to the month's last day (31.01. → 28./29.02. → 31.03.).
 */
export function occurrenceDate(startKey: string, rule: RecurrenceRule, index: number): string {
  const start = fromDateKey(startKey);
  const s = step(rule);
  if ('days' in s) {
    return toDateKey(new Date(start.getFullYear(), start.getMonth(), start.getDate() + s.days * index));
  }
  const monthIndex = start.getMonth() + s.months * index;
  const lastDay = new Date(start.getFullYear(), monthIndex + 1, 0).getDate();
  return toDateKey(new Date(start.getFullYear(), monthIndex, Math.min(start.getDate(), lastDay)));
}

/** Fixed assignment keeps the same persons; rotation moves one step per occurrence. */
export function assigneesFor(index: number, fixed: string[], rotationMembers: string[] | null | undefined): string[] {
  if (rotationMembers && rotationMembers.length > 0) return [rotationMembers[index % rotationMembers.length]];
  return fixed;
}

// ---------- dashboard helpers ----------


/**
 * The notice "Soll die Serie verlängert werden?" appears when at most this many
 * open future occurrences are left. Not fixed by the specification.
 */
export const SERIES_END_NOTICE_THRESHOLD = 2;

/** Last occurrence of each own series that is about to end (and was not dismissed). */
export function seriesEndingSoon(tasks: Task[], userId: string, todayKey: string, dismissed: string[]): Task[] {
  const bySeries = new Map<string, Task[]>();
  for (const t of tasks) {
    if (!t.seriesId || t.createdBy !== userId) continue;
    bySeries.set(t.seriesId, [...(bySeries.get(t.seriesId) ?? []), t]);
  }
  const result: Task[] = [];
  bySeries.forEach((occurrences, seriesId) => {
    if (dismissed.includes(seriesId)) return;
    const remaining = occurrences.filter((t) => t.status === 'open' && (t.deadline ?? '') >= todayKey).length;
    if (remaining > SERIES_END_NOTICE_THRESHOLD) return;
    result.push(occurrences.reduce((a, b) => ((b.occurrenceIndex ?? 0) > (a.occurrenceIndex ?? 0) ? b : a)));
  });
  return result;
}

/**
 * Own open recurring tasks that were due today (after the dialog time) or earlier
 * ("Aufgabe nicht erledigt. Verschieben oder Verwerfen?", DECISIONS D10).
 */
export function overdueRecurring(tasks: Task[], userId: string, now: Date, dialogTime: string): Task[] {
  const todayKey = toDateKey(now);
  const [h, m] = dialogTime.split(':').map(Number);
  const pastDialogTime = now.getHours() * 60 + now.getMinutes() >= h * 60 + m;
  return tasks
    .filter(
      (t) =>
        t.isRecurring &&
        t.status === 'open' &&
        t.assignees.includes(userId) &&
        t.deadline !== null &&
        (t.deadline < todayKey || (t.deadline === todayKey && pastDialogTime)),
    )
    .sort((a, b) => (a.deadline ?? '').localeCompare(b.deadline ?? ''));
}
