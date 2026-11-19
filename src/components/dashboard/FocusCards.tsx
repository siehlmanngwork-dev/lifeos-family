import { PRIORITY_META, type CalendarEvent, type Category, type Task } from '../../models';
import { formatDeadline, formatDuration, formatShortDate, formatTime, isSameDay } from '../../utils/date';
import { CategoryBadge, PriorityBadge } from '../shared/Badges';
import { Card } from '../shared/Card';
import { EmptyState } from '../shared/Feedback';
import { eventColor } from '../calendar/layout';

interface ImportantTaskCardProps {
  task: Task | null;
  category: Category | undefined;
  overdue: boolean;
  onOpen: (task: Task) => void;
}

export function ImportantTaskCard({ task, category, overdue, onOpen }: ImportantTaskCardProps) {
  return (
    <Card
      title="Wichtigste Aufgabe"
      className="focus-card"
      accentColor={task ? PRIORITY_META[task.priority].color : undefined}
    >
      {task ? (
        <button type="button" className="focus-body" onClick={() => onOpen(task)}>
          <span className="focus-title">{task.title}</span>
          <span className="focus-meta">
            <span className={overdue ? 'overdue' : ''}>
              {overdue ? 'Überfällig · ' : 'Deadline: '}
              {formatDeadline(task.deadline, task.deadlineTime)}
            </span>
            <span>Aufwand: {formatDuration(task.estimatedDuration)}</span>
          </span>
          <span className="task-badges">
            <PriorityBadge priority={task.priority} />
            <CategoryBadge category={category} />
          </span>
        </button>
      ) : (
        <EmptyState text="Keine offenen Aufgaben." />
      )}
    </Card>
  );
}

interface NextEventCardProps {
  event: CalendarEvent | null;
  categoriesById: Map<string, Category>;
  now: Date;
  onOpen: (event: CalendarEvent) => void;
}

export function NextEventCard({ event, categoriesById, now, onOpen }: NextEventCardProps) {
  const start = event ? new Date(event.startDateTime) : null;
  const end = event ? new Date(event.endDateTime) : null;
  const running = start !== null && start <= now;

  return (
    <Card
      title="Nächster Termin"
      className="focus-card"
      accentColor={event ? eventColor(event, categoriesById) : undefined}
    >
      {event && start && end ? (
        <button type="button" className="focus-body" onClick={() => onOpen(event)}>
          <span className="focus-title">{event.title}</span>
          <span className="focus-meta">
            <span>
              {running ? 'Läuft gerade · ' : isSameDay(start, now) ? 'Heute · ' : `${formatShortDate(start)} · `}
              {formatTime(start)} – {isSameDay(start, end) ? formatTime(end) : `${formatShortDate(end)} ${formatTime(end)}`}
            </span>
            {event.location && <span>📍 {event.location}</span>}
          </span>
          {event.categoryId && (
            <span className="task-badges">
              <CategoryBadge category={categoriesById.get(event.categoryId)} />
            </span>
          )}
        </button>
      ) : (
        <EmptyState text="Keine anstehenden Termine." />
      )}
    </Card>
  );
}
