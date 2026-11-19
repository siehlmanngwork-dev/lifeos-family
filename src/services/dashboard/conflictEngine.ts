import type { CalendarEvent, Conflict, Task } from '../../models';

type DeadlineTask = Pick<Task, 'id' | 'title' | 'status' | 'deadline' | 'deadlineTime'>;
type EventSpan = Pick<CalendarEvent, 'id' | 'title' | 'startDateTime' | 'endDateTime'>;

/** Deadline as a point in time; null without date or without time (DECISIONS D4). */
export function deadlineInstant(task: Pick<Task, 'deadline' | 'deadlineTime'>): Date | null {
  if (!task.deadline || !task.deadlineTime) return null;
  const [y, m, d] = task.deadline.split('-').map(Number);
  const [h, min] = task.deadlineTime.split(':').map(Number);
  return new Date(y, m - 1, d, h, min);
}

/**
 * "Deadline fällt in bestehenden Termin" (RELEASE_0.2_SPEC §5).
 * Only warns — never changes tasks or events. Past deadlines are ignored.
 */
export function detectConflicts(events: EventSpan[], tasks: DeadlineTask[], now: Date): Conflict[] {
  const conflicts: Conflict[] = [];
  for (const task of tasks) {
    if (task.status !== 'open') continue;
    const instant = deadlineInstant(task);
    if (!instant || instant < now) continue;
    for (const event of events) {
      if (new Date(event.startDateTime) <= instant && instant < new Date(event.endDateTime)) {
        conflicts.push({
          id: `${task.id}__${event.id}`,
          type: 'deadline-in-event',
          message: `Deadline von „${task.title}“ fällt in den Termin „${event.title}“.`,
          eventIds: [event.id],
          taskIds: [task.id],
        });
      }
    }
  }
  return conflicts;
}
