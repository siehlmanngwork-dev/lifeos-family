import { useEffect, useRef, type MouseEvent } from 'react';
import type { CalendarEvent, Category } from '../../models';
import { formatShortDate, formatTime, isSameDay } from '../../utils/date';
import { eventColor, layoutDay } from './layout';

const HOUR_HEIGHT = 48;
const HOURS = Array.from({ length: 24 }, (_, h) => h);

interface TimeGridProps {
  days: Date[];
  events: CalendarEvent[];
  categoriesById: Map<string, Category>;
  now: Date;
  /** Prepared for conflict marking (Release 0.2). */
  markedEventIds?: Set<string>;
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick: (start: Date) => void;
  onDayClick?: (day: Date) => void;
}

/** Hour grid used by the day view (one column) and the week view (seven columns). */
export function TimeGrid({
  days,
  events,
  categoriesById,
  now,
  markedEventIds,
  onEventClick,
  onSlotClick,
  onDayClick,
}: TimeGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Start the view in the morning.
    if (scrollRef.current) scrollRef.current.scrollTop = 7 * HOUR_HEIGHT;
  }, []);

  const handleColumnClick = (day: Date, e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const minutes = ((e.clientY - rect.top) / HOUR_HEIGHT) * 60;
    const rounded = Math.max(0, Math.min(23 * 60 + 30, Math.floor(minutes / 30) * 30));
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, rounded);
    onSlotClick(start);
  };

  return (
    <div className="timegrid" style={{ ['--days' as string]: days.length }}>
      <div className="timegrid-header">
        <div className="timegrid-gutter" />
        {days.map((day) => (
          <button
            key={day.toISOString()}
            type="button"
            className={`timegrid-day-label ${isSameDay(day, now) ? 'today' : ''}`}
            onClick={() => onDayClick?.(day)}
            disabled={!onDayClick}
          >
            {formatShortDate(day)}
          </button>
        ))}
      </div>
      <div className="timegrid-scroll" ref={scrollRef}>
        <div className="timegrid-body" style={{ height: 24 * HOUR_HEIGHT }}>
          <div className="timegrid-gutter">
            {HOURS.map((h) => (
              <div key={h} className="timegrid-hour-label" style={{ height: HOUR_HEIGHT }}>
                {h > 0 ? `${String(h).padStart(2, '0')}:00` : ''}
              </div>
            ))}
          </div>
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className="timegrid-column"
              onClick={(e) => handleColumnClick(day, e)}
              style={{ backgroundSize: `100% ${HOUR_HEIGHT}px` }}
            >
              {isSameDay(day, now) && (
                <div
                  className="now-line"
                  style={{ top: ((now.getHours() * 60 + now.getMinutes()) / 60) * HOUR_HEIGHT }}
                />
              )}
              {layoutDay(day, events).map((s) => {
                const color = eventColor(s.event, categoriesById);
                return (
                  <button
                    key={s.event.id}
                    type="button"
                    className={`timegrid-event ${markedEventIds?.has(s.event.id) ? 'conflict' : ''}`}
                    style={{
                      top: (s.startMinute / 60) * HOUR_HEIGHT,
                      height: Math.max(18, ((s.endMinute - s.startMinute) / 60) * HOUR_HEIGHT - 2),
                      left: `calc(${(s.lane / s.laneCount) * 100}% + 2px)`,
                      width: `calc(${100 / s.laneCount}% - 4px)`,
                      background: color,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(s.event);
                    }}
                    title={s.event.title}
                  >
                    <span className="event-title">
                      {s.event.private ? '🔒 ' : ''}
                      {s.event.title}
                    </span>
                    <span className="event-time">
                      {s.continuesBefore ? '…' : formatTime(new Date(s.event.startDateTime))} –{' '}
                      {s.continuesAfter ? '…' : formatTime(new Date(s.event.endDateTime))}
                      {s.event.location ? ` · ${s.event.location}` : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
