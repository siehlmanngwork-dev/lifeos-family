import type { CalendarEvent, Category } from '../../models';
import { eventsOnDay } from '../../services/dashboard/dashboardEngine';
import { addDays, formatTime, isSameDay, startOfMonth, startOfWeek, toDateKey } from '../../utils/date';
import { eventColor } from './layout';

const WEEKDAY_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const MAX_CHIPS = 3;

interface MonthViewProps {
  anchor: Date;
  events: CalendarEvent[];
  categoriesById: Map<string, Category>;
  now: Date;
  markedEventIds?: Set<string>;
  onEventClick: (event: CalendarEvent) => void;
  onDayClick: (day: Date) => void;
}

export function MonthView({ anchor, events, categoriesById, now, markedEventIds, onEventClick, onDayClick }: MonthViewProps) {
  const first = startOfWeek(startOfMonth(anchor));
  const days = Array.from({ length: 42 }, (_, i) => addDays(first, i));

  return (
    <div className="month">
      {WEEKDAY_SHORT.map((d) => (
        <div key={d} className="month-weekday">
          {d}
        </div>
      ))}
      {days.map((day) => {
        const dayEvents = eventsOnDay(events, day);
        const outside = day.getMonth() !== anchor.getMonth();
        return (
          <div
            key={toDateKey(day)}
            className={`month-cell ${outside ? 'outside' : ''} ${isSameDay(day, now) ? 'today' : ''}`}
            onClick={() => onDayClick(day)}
          >
            <span className="month-date">{day.getDate()}</span>
            {dayEvents.slice(0, MAX_CHIPS).map((event) => (
              <button
                key={event.id}
                type="button"
                className={`month-chip ${markedEventIds?.has(event.id) ? 'conflict' : ''}`}
                style={{ borderLeftColor: eventColor(event, categoriesById) }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick(event);
                }}
                title={event.title}
              >
                {isSameDay(new Date(event.startDateTime), day) ? `${formatTime(new Date(event.startDateTime))} ` : ''}
                {event.title}
              </button>
            ))}
            {dayEvents.length > MAX_CHIPS && <span className="month-more">+{dayEvents.length - MAX_CHIPS} weitere</span>}
          </div>
        );
      })}
    </div>
  );
}
