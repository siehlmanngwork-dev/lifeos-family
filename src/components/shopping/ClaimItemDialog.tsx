import { useState, type FormEvent } from 'react';
import type { ClaimInput, ShoppingItem } from '../../models';
import { toDateKey } from '../../utils/date';
import { ErrorNote } from '../shared/Feedback';
import { Modal } from '../shared/Modal';

interface ClaimItemDialogProps {
  item: ShoppingItem;
  submitting: boolean;
  error: string | null;
  onSubmit: (claim: ClaimInput) => void;
  onClose: () => void;
}

/** Claiming requires the estimated effort and a deadline (DECISIONS D2). */
export function ClaimItemDialog({ item, submitting, error, onSubmit, onClose }: ClaimItemDialogProps) {
  const [durationHours, setDurationHours] = useState('');
  const [hasDeadline, setHasDeadline] = useState(true);
  const [deadline, setDeadline] = useState(toDateKey(new Date()));
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const minutes = Math.round(Number(durationHours.replace(',', '.')) * 60);
    if (!Number.isFinite(minutes) || minutes <= 0) return setValidationError('Bitte einen geschätzten Aufwand angeben.');
    if (hasDeadline && !deadline) return setValidationError('Bitte ein Datum wählen oder „Irgendwann“.');
    setValidationError(null);
    onSubmit({ estimatedDuration: minutes, deadline: hasDeadline ? deadline : null });
  };

  return (
    <Modal title={`„${item.title}“ übernehmen`} onClose={onClose}>
      <form className="form" onSubmit={handleSubmit}>
        <p className="muted small">Es wird eine persönliche Aufgabe „🛒 {item.title} kaufen“ angelegt.</p>
        <label className="field">
          <span>Geschätzter Aufwand (Stunden) *</span>
          <input
            type="number"
            min="0.25"
            step="0.25"
            inputMode="decimal"
            value={durationHours}
            onChange={(e) => setDurationHours(e.target.value)}
            autoFocus
          />
        </label>
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
        <ErrorNote message={validationError ?? error} />
        <div className="form-actions">
          <button type="submit" className="button primary" disabled={submitting}>
            Übernehmen
          </button>
        </div>
      </form>
    </Modal>
  );
}
