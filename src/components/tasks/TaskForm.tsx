import { useState, type FormEvent } from 'react';
import {
  PRIORITIES,
  PRIORITY_META,
  SPACE_LABELS,
  type Category,
  type Priority,
  type SpaceId,
  type Task,
  type TaskInput,
  type UserProfile,
} from '../../models';
import { fromDateTimeLocalValue, toDateKey, toDateTimeLocalValue } from '../../utils/date';
import { ErrorNote } from '../shared/Feedback';

interface TaskFormProps {
  task?: Task;
  currentUserId: string;
  categories: Category[];
  members: UserProfile[];
  hasFamily: boolean;
  canAssignOthers: boolean;
  submitting: boolean;
  error: string | null;
  onSubmit: (input: TaskInput) => void;
  onDelete?: () => void;
  canDelete?: boolean;
}

export function TaskForm({
  task,
  currentUserId,
  categories,
  members,
  hasFamily,
  canAssignOthers,
  submitting,
  error,
  onSubmit,
  onDelete,
  canDelete = false,
}: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [spaceId, setSpaceId] = useState<SpaceId>(task?.spaceId ?? 'personal');
  const [assignees, setAssignees] = useState<string[]>(task?.assignees ?? [currentUserId]);
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'normal');
  const [categoryId, setCategoryId] = useState(task?.categoryId ?? '');
  const [durationHours, setDurationHours] = useState(
    task ? String(task.estimatedDuration / 60) : '',
  );
  const [hasDeadline, setHasDeadline] = useState(task ? task.deadline !== null : true);
  const [deadline, setDeadline] = useState(task?.deadline ?? toDateKey(new Date()));
  const [reminder, setReminder] = useState(task?.reminder ? toDateTimeLocalValue(task.reminder) : '');
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectableMembers = canAssignOthers ? members : members.filter((m) => m.id === currentUserId);
  const categoryMissing = categoryId !== '' && !categories.some((c) => c.id === categoryId);

  const changeSpace = (next: SpaceId) => {
    setSpaceId(next);
    // Personal tasks have exactly one responsible person (MVP_SPEC §11).
    if (next === 'personal' && assignees.length > 1) setAssignees([assignees[0]]);
  };

  const toggleAssignee = (id: string) => {
    setAssignees((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const minutes = Math.round(Number(durationHours.replace(',', '.')) * 60);
    if (!title.trim()) return setValidationError('Bitte einen Titel eingeben.');
    if (assignees.length === 0) return setValidationError('Bitte mindestens eine verantwortliche Person wählen.');
    if (!categoryId || categoryMissing) return setValidationError('Bitte eine Kategorie wählen.');
    if (!Number.isFinite(minutes) || minutes <= 0) return setValidationError('Bitte einen geschätzten Aufwand angeben.');
    if (hasDeadline && !deadline) return setValidationError('Bitte ein Datum wählen oder „Irgendwann“.');
    setValidationError(null);
    onSubmit({
      title,
      description,
      assignees,
      priority,
      categoryId,
      estimatedDuration: minutes,
      deadline: hasDeadline ? deadline : null,
      reminder: reminder ? fromDateTimeLocalValue(reminder) : null,
      spaceId,
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
          <span>Space *</span>
          <select value={spaceId} onChange={(e) => changeSpace(e.target.value as SpaceId)}>
            <option value="personal">{SPACE_LABELS.personal}</option>
            {(hasFamily || spaceId === 'family') && <option value="family">{SPACE_LABELS.family}</option>}
          </select>
        </label>

        <label className="field">
          <span>Priorität *</span>
          <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            {[...PRIORITIES].reverse().map((p) => (
              <option key={p} value={p}>
                {PRIORITY_META[p].emoji} {PRIORITY_META[p].label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="field">
        <legend>Verantwortlich *</legend>
        {spaceId === 'personal' ? (
          <select
            value={assignees[0] ?? ''}
            onChange={(e) => setAssignees([e.target.value])}
            disabled={selectableMembers.length <= 1}
          >
            {selectableMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id === currentUserId ? `${m.displayName} (ich)` : m.displayName}
              </option>
            ))}
          </select>
        ) : (
          <div className="checkbox-list">
            {selectableMembers.map((m) => (
              <label key={m.id} className="checkbox">
                <input
                  type="checkbox"
                  checked={assignees.includes(m.id)}
                  onChange={() => toggleAssignee(m.id)}
                />
                {m.id === currentUserId ? `${m.displayName} (ich)` : m.displayName}
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <fieldset className="field">
        <legend>Deadline *</legend>
        <div className="inline-options">
          <label className="checkbox">
            <input type="radio" checked={hasDeadline} onChange={() => setHasDeadline(true)} />
            Datum
          </label>
          <label className="checkbox">
            <input type="radio" checked={!hasDeadline} onChange={() => setHasDeadline(false)} />
            Irgendwann
          </label>
        </div>
        {hasDeadline && <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />}
      </fieldset>

      <div className="field-row">
        <label className="field">
          <span>Kategorie *</span>
          <select value={categoryMissing ? '' : categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">– wählen –</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon ? `${c.icon} ` : ''}
                {c.name}
              </option>
            ))}
          </select>
          {categories.length === 0 && (
            <small className="muted">Noch keine Kategorien – unter Einstellungen anlegen.</small>
          )}
        </label>

        <label className="field">
          <span>Geschätzter Aufwand (Stunden) *</span>
          <input
            type="number"
            min="0.25"
            step="0.25"
            inputMode="decimal"
            value={durationHours}
            onChange={(e) => setDurationHours(e.target.value)}
          />
        </label>
      </div>

      <label className="field">
        <span>Beschreibung</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </label>

      <label className="field">
        <span>Erinnerung</span>
        <input type="datetime-local" value={reminder} onChange={(e) => setReminder(e.target.value)} />
      </label>

      <ErrorNote message={validationError ?? error} />

      <div className="form-actions">
        {onDelete && canDelete && (
          <button type="button" className="button danger" onClick={onDelete} disabled={submitting}>
            Löschen
          </button>
        )}
        <button type="submit" className="button primary" disabled={submitting}>
          {task ? 'Speichern' : 'Aufgabe erstellen'}
        </button>
      </div>
    </form>
  );
}
