import { useState } from 'react';
import type { Task } from '../../models';
import { discardTask, rescheduleTask } from '../../services/firestore';
import { addDays, formatDeadline, toDateKey } from '../../utils/date';
import { ErrorNote } from '../shared/Feedback';
import { Modal } from '../shared/Modal';

interface OverdueRecurringDialogProps {
  task: Task;
  onClose: () => void;
}

/**
 * Evening dialog for an open recurring task (RELEASE_0.2_SPEC §4):
 * "Aufgabe nicht erledigt. Verschieben? oder Verwerfen?"
 */
export function OverdueRecurringDialog({ task, onClose }: OverdueRecurringDialogProps) {
  const [deadline, setDeadline] = useState(() => toDateKey(addDays(new Date(), 1)));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <Modal title="Aufgabe nicht erledigt" onClose={onClose}>
      <div className="form">
        <p>
          <strong>{task.title}</strong>
          <br />
          <span className="muted">Fällig: {formatDeadline(task.deadline, task.deadlineTime)}</span>
        </p>
        <label className="field">
          <span>Verschieben auf</span>
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </label>
        <ErrorNote message={error} />
        <div className="form-actions">
          <button type="button" className="button danger" disabled={busy} onClick={() => run(() => discardTask(task.id))}>
            Verwerfen
          </button>
          <button
            type="button"
            className="button primary"
            disabled={busy || !deadline}
            onClick={() => run(() => rescheduleTask(task.id, deadline))}
          >
            Verschieben
          </button>
        </div>
      </div>
    </Modal>
  );
}
