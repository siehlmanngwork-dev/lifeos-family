import { PRIORITY_META, type CalendarEvent, type Task, type WeeklyCapacity } from '../../models';
import { addDays, overlapMinutes, startOfDay, startOfWeek, toDateKey, weekdayOf } from '../../utils/date';

/** Open tasks for which the user is responsible. */
export function openTasksFor(tasks: Task[], userId: string): Task[] {
  return tasks.filter((t) => t.status === 'open' && t.assignees.includes(userId));
}

/**
 * Importance order (ARCHITECTURE.md "Wichtigste Aufgabe"):
 * 1. priority (Sofort → Niedrig)
 * 2. deadline (earliest first; overdue deadlines therefore come first; "Irgendwann" last)
 * 3. effort (larger effort first)
 */
export function compareByImportance(a: Task, b: Task): number {
  const byPriority = PRIORITY_META[b.priority].rank - PRIORITY_META[a.priority].rank;
  if (byPriority !== 0) return byPriority;

  if (a.deadline !== b.deadline) {
    if (a.deadline === null) return 1;
    if (b.deadline === null) return -1;
    return a.deadline < b.deadline ? -1 : 1;
  }
  return b.estimatedDuration - a.estimatedDuration;
}

export function mostImportantTask(tasks: Task[], userId: string): Task | null {
  return [...openTasksFor(tasks, userId)].sort(compareByImportance)[0] ?? null;
}

export function isOverdue(task: Task, now: Date): boolean {
  return task.status === 'open' && task.deadline !== null && task.deadline < toDateKey(now);
}

/** Event with the smallest time distance to now (a running event has distance 0). */
export function nextEvent(events: CalendarEvent[], now: Date): CalendarEvent | null {
  const nowMs = now.getTime();
  return (
    events
      .filter((e) => new Date(e.endDateTime).getTime() > nowMs)
      .sort((a, b) => {
        const da = Math.max(0, new Date(a.startDateTime).getTime() - nowMs);
        const db = Math.max(0, new Date(b.startDateTime).getTime() - nowMs);
        return da - db || a.startDateTime.localeCompare(b.startDateTime);
      })[0] ?? null
  );
}

export function eventsOnDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  const dayStart = startOfDay(day);
  const dayEnd = addDays(dayStart, 1);
  return events
    .filter((e) => new Date(e.startDateTime) < dayEnd && new Date(e.endDateTime) > dayStart)
    .sort((a, b) => a.startDateTime.localeCompare(b.startDateTime));
}

export function tasksDueOn(tasks: Task[], day: Date): Task[] {
  const key = toDateKey(day);
  return tasks.filter((t) => t.deadline === key).sort(compareByImportance);
}

export interface DayAgenda {
  date: Date;
  events: CalendarEvent[];
  tasks: Task[];
}

export function agendaFor(day: Date, events: CalendarEvent[], tasks: Task[]): DayAgenda {
  return { date: startOfDay(day), events: eventsOnDay(events, day), tasks: tasksDueOn(tasks, day) };
}

/** Remaining days of the current week (Mon–Sun) after today and tomorrow. */
export function restOfWeekDays(now: Date): Date[] {
  const weekEnd = addDays(startOfWeek(now), 7);
  const days: Date[] = [];
  for (let d = addDays(startOfDay(now), 2); d < weekEnd; d = addDays(d, 1)) days.push(d);
  return days;
}

export interface DayCapacity {
  plannedMinutes: number;
  availableMinutes: number;
}

/**
 * Daily load: event time on the given day plus the effort of open tasks due that day,
 * compared to the user's self-defined capacity for that weekday.
 */
export function dayCapacity(
  day: Date,
  events: CalendarEvent[],
  openTasks: Task[],
  capacity: WeeklyCapacity,
): DayCapacity {
  const dayStart = startOfDay(day);
  const dayEnd = addDays(dayStart, 1);
  const eventMinutes = events.reduce(
    (sum, e) => sum + overlapMinutes(new Date(e.startDateTime), new Date(e.endDateTime), dayStart, dayEnd),
    0,
  );
  const taskMinutes = tasksDueOn(openTasks, day).reduce((sum, t) => sum + t.estimatedDuration, 0);
  return {
    plannedMinutes: eventMinutes + taskMinutes,
    availableMinutes: (capacity[weekdayOf(day)] ?? 0) * 60,
  };
}
