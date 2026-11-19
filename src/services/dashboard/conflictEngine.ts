import type { CalendarEvent, Conflict, Task } from '../../models';

/**
 * Placeholder for conflict detection (MVP_SPEC §10).
 * Release 0.1 does not calculate conflicts; detection (event overlap,
 * insufficient time) is implemented in Release 0.2 behind this signature.
 */
export function detectConflicts(_events: CalendarEvent[], _tasks: Task[], _now: Date): Conflict[] {
  return [];
}
