import { useState, type FormEvent } from 'react';
import type { CalendarEvent, CalendarEventInput, Category } from '../../models';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '../../utils/date';
import { ErrorNote } from '../shared/Feedback';

interface EventFormProps {
  event?: CalendarEvent;
  defaultStart: Date;
  categories: Category[];
  submitting: boolean;
  error: string | null;
  onSubmit: (input: CalendarEventInput) => void;
  onDelete?: () => void;
}

const HOUR = 60 * 60 * 1000;

export function EventForm({ event, defaultStart, categories, submitting, error, onSubmit, onDelete }: EventFormProps) {
  const [title, setTitle] = useState(event?.title ?? '');
  const [start, setStart] = useState(
    toDateTimeLocalValue(event?.startDateTime ?? defaultStart.toISOString()),
  );
  const [end, setEnd] = useState(
    toDateTimeLocalValue(event?.endDateTime ?? new Date(defaultStart.getTime() + HOUR).toISOString()),
  );
  const [location, setLocation] = useState(event?.location ?? '');
  const [categoryId, setCategoryId] = useState(event?.categoryId ?? '');
  const [isPrivate, setIsPrivate] = useState(event?.private ?? false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const changeStart = (value: string) => {
    // Keep the duration when the start moves.
    if (value && start && end) {
      const duration = new Date(end).getTime() - new Date(start).getTime();
      if (duration > 0) setEnd(toDateTimeLocalValue(new Date(new Date(value).getTime() + duration).toISOString()));
    }
    setStart(value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setValidationError('Bitte einen Titel eingeben.');
    if (!start || !end) return setValidationError('Bitte Start und Ende angeben.');
    if (new Date(end) <= new Date(start)) return setValidationError('Das Ende muss nach dem Start liegen.');
    setValidationError(null);
    onSubmit({
      title,
      startDateTime: fromDateTimeLocalValue(start),
      endDateTime: fromDateTimeLocalValue(end),
      location,
      categoryId: categoryId || null,
      private: isPrivate,
    });
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Titel *</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus maxLength={200} />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Start *</span>
          <input type="datetime-local" value={start} onChange={(e) => changeStart(e.target.value)} />
        </label>
        <label className="field">
          <span>Ende *</span>
          <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span>Kategorie</span>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">– keine –</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon ? `${c.icon} ` : ''}
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Location</span>
          <input value={location} onChange={(e) => setLocation(e.target.value)} />
        </label>
      </div>

      <label className="checkbox">
        <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
        Privat
      </label>

      <ErrorNote message={validationError ?? error} />

      <div className="form-actions">
        {onDelete && (
          <button type="button" className="button danger" onClick={onDelete} disabled={submitting}>
            Löschen
          </button>
        )}
        <button type="submit" className="button primary" disabled={submitting}>
          {event ? 'Speichern' : 'Termin erstellen'}
        </button>
      </div>
    </form>
  );
}
