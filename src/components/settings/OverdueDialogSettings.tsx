import { useState } from 'react';
import { DEFAULT_OVERDUE_DIALOG_TIME } from '../../models';
import { useSettings } from '../../hooks/useData';
import { setOverdueDialogTime } from '../../services/firestore';
import { Card } from '../shared/Card';
import { ErrorNote } from '../shared/Feedback';

/** Time of the evening dialog for open recurring tasks (DECISIONS D10, R2). */
export function OverdueDialogSettings({ userId }: { userId: string }) {
  const { data: settings } = useSettings();
  const current = settings?.overdueDialogTime ?? DEFAULT_OVERDUE_DIALOG_TIME;
  const [value, setValue] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!value) return;
    setError(null);
    try {
      await setOverdueDialogTime(userId, value);
      setValue(null);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Card title="Wiederkehrende Aufgaben">
      <div className="form">
        <label className="field">
          <span>Abendliche Nachfrage zu unerledigten Wiederholungen ab</span>
          <input type="time" value={value ?? current} onChange={(e) => setValue(e.target.value)} />
        </label>
        <ErrorNote message={error} />
        <div className="form-actions">
          <button type="button" className="button primary" onClick={save} disabled={!value || value === current}>
            {saved ? 'Gespeichert ✓' : 'Speichern'}
          </button>
        </div>
      </div>
    </Card>
  );
}
