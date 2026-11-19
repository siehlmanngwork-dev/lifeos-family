import type { CalendarEvent, Category, Task } from '../../models';
import type { DayAgenda } from '../../services/dashboard/dashboardEngine';
import { formatShortDate, formatTime, isSameDay } from '../../utils/date';
import { eventColor } from '../calendar/layout';
import { Card } from '../shared/Card';
import { EmptyState } from '../shared/Feedback';
import { TaskItem } from '../tasks/TaskItem';

interface AgendaSectionProps {
  title: string;
  days: DayAgenda[];
  categoriesById: Map<string, Category>;
  showDayLabels?: boolean;
  onOpenTask: (task: Task) => void;
  onOpenEvent: (event: CalendarEvent) => void;
}

function eventTimeLabel(event: CalendarEvent, day: Date): string {
  const start = new Date(event.startDateTime);
  const end = new Date(event.endDateTime);
  const from = isSameDay(start, day) ? formatTime(start) : '…';
  const to = isSameDay(end, day) ? formatTime(end) : '…';
  return `${from} – ${to}`;
}

/** Tasks and events for one or more days ("Heute", "Morgen", "Diese Woche"). */
export function AgendaSection({ title, days, categoriesById, showDayLabels = false, onOpenTask, onOpenEvent }: AgendaSectionProps) {
  const isEmpty = days.every((d) => d.events.length === 0 && d.tasks.length === 0);

  return (
    <Card title={title}>
      {isEmpty ? (
        <EmptyState text="Nichts geplant." />
      ) : (
        days
          .filter((d) => d.events.length > 0 || d.tasks.length > 0)
          .map((d) => (
            <div key={d.date.toISOString()} className="agenda-day">
              {showDayLabels && <h4 className="agenda-day-label">{formatShortDate(d.date)}</h4>}
              {d.events.length > 0 && (
                <ul className="agenda-events">
                  {d.events.map((event) => (
                    <li key={event.id}>
                      <button
                        type="button"
                        className="agenda-event"
                        style={{ borderLeftColor: eventColor(event, categoriesById) }}
                        onClick={() => onOpenEvent(event)}
                      >
                        <span className="agenda-time">{eventTimeLabel(event, d.date)}</span>
                        <span>{event.title}</span>
                        {event.location && <span className="muted">📍 {event.location}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {d.tasks.length > 0 && (
                <ul className="task-list">
                  {d.tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      category={categoriesById.get(task.categoryId)}
                      onOpen={onOpenTask}
                      compact
                    />
                  ))}
                </ul>
              )}
            </div>
          ))
      )}
    </Card>
  );
}
