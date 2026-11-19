import { useMemo, useState } from 'react';
import type { CalendarEvent } from '../../models';
import { useCategories, useEvents, useFamilyMembers } from '../../hooks/useData';
import { useNow } from '../../hooks/useNow';
import { formatShortDate, formatTime, isSameDay } from '../../utils/date';
import { EventEditor } from '../calendar/EventEditor';
import { eventColor } from '../calendar/layout';
import { Card } from '../shared/Card';
import { EmptyState, ErrorNote } from '../shared/Feedback';

type EditorState = { event?: CalendarEvent } | null;

/** 📅 Familientermine: upcoming events of the family space (DECISIONS D5). */
export function FamilyEventsPanel() {
  const { data: events, error } = useEvents();
  const { byId: categoriesById } = useCategories();
  const { byId: membersById } = useFamilyMembers();
  const now = useNow();
  const [editor, setEditor] = useState<EditorState>(null);

  const upcoming = useMemo(() => {
    const nowIso = now.toISOString();
    return events
      .filter((e) => e.spaceId === 'family' && e.endDateTime > nowIso)
      .sort((a, b) => a.startDateTime.localeCompare(b.startDateTime));
  }, [events, now]);

  return (
    <Card
      title={`📅 Familientermine (${upcoming.length})`}
      actions={
        <button type="button" className="button primary" onClick={() => setEditor({})}>
          + Termin
        </button>
      }
    >
      <ErrorNote message={error} />
      {upcoming.length === 0 ? (
        <EmptyState text="Keine anstehenden Familientermine." />
      ) : (
        <ul className="agenda-events">
          {upcoming.map((event) => {
            const start = new Date(event.startDateTime);
            return (
              <li key={event.id}>
                <button
                  type="button"
                  className="agenda-event"
                  style={{ borderLeftColor: eventColor(event, categoriesById) }}
                  onClick={() => setEditor({ event })}
                >
                  <span className="agenda-time">
                    {isSameDay(start, now) ? 'Heute' : formatShortDate(start)} {formatTime(start)}
                  </span>
                  <span>
                    {event.private ? '🔒 ' : ''}
                    {event.title}
                  </span>
                  {event.location && <span className="muted">📍 {event.location}</span>}
                  <span className="muted">👤 {membersById.get(event.createdBy)?.displayName ?? 'Unbekannt'}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {editor && <EventEditor event={editor.event} defaultSpaceId="family" onClose={() => setEditor(null)} />}
    </Card>
  );
}
