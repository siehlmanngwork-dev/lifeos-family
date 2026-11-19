import { useState } from 'react';
import type { CalendarEvent, CalendarEventInput } from '../../models';
import { useCategories } from '../../hooks/useData';
import { useCurrentUser } from '../../hooks/useSession';
import { createEvent, deleteEvent, updateEvent } from '../../services/firestore';
import { Modal } from '../shared/Modal';
import { EventForm } from './EventForm';

interface EventEditorProps {
  event?: CalendarEvent;
  /** Start time for new events (defaults to the next full hour). */
  defaultStart?: Date;
  onClose: () => void;
}

function nextFullHour(): Date {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
}

/** Modal to create, edit or delete an event. */
export function EventEditor({ event, defaultStart, onClose }: EventEditorProps) {
  const { userId } = useCurrentUser();
  const { own, byId } = useCategories();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const foreign = event?.categoryId ? byId.get(event.categoryId) : undefined;
  const categories = foreign && !own.includes(foreign) ? [...own, foreign] : own;

  const run = async (action: () => Promise<void>) => {
    setSubmitting(true);
    setError(null);
    try {
      await action();
      onClose();
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  };

  const handleSubmit = (input: CalendarEventInput) =>
    run(() => (event ? updateEvent(event.id, input) : createEvent(userId, input)));

  const canDelete = event?.createdBy === userId;
  const handleDelete = () => {
    if (event && window.confirm(`Termin „${event.title}“ wirklich löschen?`)) run(() => deleteEvent(event.id));
  };

  return (
    <Modal title={event ? 'Termin bearbeiten' : 'Neuer Termin'} onClose={onClose}>
      <EventForm
        event={event}
        defaultStart={defaultStart ?? nextFullHour()}
        categories={categories}
        submitting={submitting}
        error={error}
        onSubmit={handleSubmit}
        onDelete={canDelete ? handleDelete : undefined}
      />
    </Modal>
  );
}
