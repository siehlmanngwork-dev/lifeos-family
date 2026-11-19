import { useState, type FormEvent } from 'react';
import type { ManualStatus, ResolvedStatus } from '../../models';
import { setManualStatus } from '../../services/firestore';
import { formatStatus } from '../../services/status/statusEngine';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '../../utils/date';
import { ErrorNote } from '../shared/Feedback';
import { Modal } from '../shared/Modal';

interface StatusEditorProps {
  userId: string;
  current: ResolvedStatus;
  manual: ManualStatus | null | undefined;
  onClose: () => void;
}

/** Manual status: 🏠 Zuhause or 📍 free text, unlimited or until a point in time. */
export function StatusEditor({ userId, current, manual, onClose }: StatusEditorProps) {
  const [type, setType] = useState<ManualStatus['type']>(manual?.type ?? 'home');
  const [label, setLabel] = useState(manual?.type === 'custom' ? manual.label : '');
  const [limited, setLimited] = useState(Boolean(manual?.expiresAt));
  const [until, setUntil] = useState(() =>
    toDateTimeLocalValue(manual?.expiresAt ?? new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (status: ManualStatus | null) => {
    setBusy(true);
    setError(null);
    try {
      await setManualStatus(userId, status);
      onClose();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (type === 'custom' && !label.trim()) return setError('Bitte einen Ort oder Status eingeben.');
    if (limited && (!until || new Date(until) <= new Date())) return setError('Das Ende muss in der Zukunft liegen.');
    run({
      type,
      label: type === 'home' ? 'Zuhause' : label.trim(),
      expiresAt: limited ? fromDateTimeLocalValue(until) : null,
    });
  };

  return (
    <Modal title="Mein Status" onClose={onClose}>
      <form className="form" onSubmit={handleSubmit}>
        <p className="muted">Aktuell: {formatStatus(current)}</p>

        <fieldset className="field">
          <legend>Status</legend>
          <div className="inline-options">
            <label className="checkbox">
              <input type="radio" checked={type === 'home'} onChange={() => setType('home')} />
              🏠 Zuhause
            </label>
            <label className="checkbox">
              <input type="radio" checked={type === 'custom'} onChange={() => setType('custom')} />
              📍 Freitext
            </label>
          </div>
          {type === 'custom' && (
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="z. B. Fitnessstudio"
              maxLength={60}
              autoFocus
            />
          )}
        </fieldset>

        <fieldset className="field">
          <legend>Gültigkeit</legend>
          <div className="inline-options">
            <label className="checkbox">
              <input type="radio" checked={!limited} onChange={() => setLimited(false)} />
              Unbegrenzt
            </label>
            <label className="checkbox">
              <input type="radio" checked={limited} onChange={() => setLimited(true)} />
              Bis
            </label>
          </div>
          {limited && <input type="datetime-local" value={until} onChange={(e) => setUntil(e.target.value)} />}
        </fieldset>

        <ErrorNote message={error} />
        <div className="form-actions">
          {manual && (
            <button type="button" className="button" onClick={() => run(null)} disabled={busy}>
              Automatisch (aus Terminen)
            </button>
          )}
          <button type="submit" className="button primary" disabled={busy}>
            Status setzen
          </button>
        </div>
      </form>
    </Modal>
  );
}
