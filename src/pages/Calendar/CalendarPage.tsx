import { useState } from 'react';
import type { CalendarEvent } from '../../models';
import { CalendarToolbar, type CalendarView } from '../../components/calendar/CalendarToolbar';
import { EventEditor } from '../../components/calendar/EventEditor';
import { MonthView } from '../../components/calendar/MonthView';
import { TimeGrid } from '../../components/calendar/TimeGrid';
import { ErrorNote } from '../../components/shared/Feedback';
import { useCategories, useEvents } from '../../hooks/useData';
import { useNow } from '../../hooks/useNow';
import { addDays, addMonths, formatLongDate, startOfDay, startOfWeek } from '../../utils/date';

type EditorState = { event?: CalendarEvent; defaultStart?: Date } | null;

function titleFor(view: CalendarView, anchor: Date): string {
  if (view === 'day') return formatLongDate(anchor);
  if (view === 'month') return anchor.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  const start = startOfWeek(anchor);
  const end = addDays(start, 6);
  const fmt = (d: Date) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  return `${fmt(start)} – ${fmt(end)}.${end.getFullYear()}`;
}

export function CalendarPage() {
  const now = useNow();
  const { data: events, error } = useEvents();
  const { byId: categoriesById } = useCategories();
  const [view, setView] = useState<CalendarView>('week');
  const [anchor, setAnchor] = useState(() => startOfDay(new Date()));
  const [editor, setEditor] = useState<EditorState>(null);

  const step = (direction: 1 | -1) => {
    if (view === 'day') setAnchor((a) => addDays(a, direction));
    else if (view === 'week') setAnchor((a) => addDays(a, 7 * direction));
    else setAnchor((a) => addMonths(a, direction));
  };

  // Zooming into a day keeps the context: month/week → day.
  const openDay = (day: Date) => {
    setAnchor(startOfDay(day));
    setView('day');
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(anchor), i));

  return (
    <div className="page calendar-page">
      <CalendarToolbar
        view={view}
        title={titleFor(view, anchor)}
        onViewChange={setView}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
        onToday={() => setAnchor(startOfDay(new Date()))}
        onCreate={() => setEditor({})}
      />
      <ErrorNote message={error} />

      {/* Keyed wrapper animates the transition between views instead of a hard switch. */}
      <div key={view} className="calendar-view view-transition">
        {view === 'month' ? (
          <MonthView
            anchor={anchor}
            events={events}
            categoriesById={categoriesById}
            now={now}
            onEventClick={(event) => setEditor({ event })}
            onDayClick={openDay}
          />
        ) : (
          <TimeGrid
            days={view === 'day' ? [anchor] : weekDays}
            events={events}
            categoriesById={categoriesById}
            now={now}
            onEventClick={(event) => setEditor({ event })}
            onSlotClick={(start) => setEditor({ defaultStart: start })}
            onDayClick={view === 'week' ? openDay : undefined}
          />
        )}
      </div>

      {editor && (
        <EventEditor event={editor.event} defaultStart={editor.defaultStart} onClose={() => setEditor(null)} />
      )}
    </div>
  );
}
