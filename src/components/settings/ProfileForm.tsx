import { useState, type FormEvent } from 'react';
import { WEEKDAYS, WEEKDAY_LABELS, type UserProfile, type WeeklyCapacity } from '../../models';
import { updateUserProfile } from '../../services/firestore';
import { Card } from '../shared/Card';
import { ErrorNote } from '../shared/Feedback';

export function ProfileForm({ profile }: { profile: UserProfile }) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [capacity, setCapacity] = useState<Record<string, string>>(() =>
    Object.fromEntries(WEEKDAYS.map((d) => [d, String(profile.availableHoursPerDay[d] ?? 0)])),
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return setError('Bitte einen Namen eingeben.');
    const hours = Object.fromEntries(
      WEEKDAYS.map((d) => [d, Number(capacity[d].replace(',', '.'))]),
    ) as WeeklyCapacity;
    if (WEEKDAYS.some((d) => !Number.isFinite(hours[d]) || hours[d] < 0 || hours[d] > 24)) {
      return setError('Stunden pro Tag müssen zwischen 0 und 24 liegen.');
    }
    setSaving(true);
    setError(null);
    try {
      await updateUserProfile(profile.id, { displayName: displayName.trim(), availableHoursPerDay: hours });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Profil">
      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Name</span>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </label>
        <p className="muted small">E-Mail: {profile.email}</p>

        <fieldset className="field">
          <legend>Verfügbare Stunden pro Tag</legend>
          <div className="capacity-grid">
            {WEEKDAYS.map((d) => (
              <label key={d} className="field">
                <span>{WEEKDAY_LABELS[d]}</span>
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  inputMode="decimal"
                  value={capacity[d]}
                  onChange={(e) => setCapacity((c) => ({ ...c, [d]: e.target.value }))}
                />
              </label>
            ))}
          </div>
        </fieldset>

        <ErrorNote message={error} />
        <div className="form-actions">
          <button type="submit" className="button primary" disabled={saving}>
            {saved ? 'Gespeichert ✓' : saving ? 'Speichert …' : 'Speichern'}
          </button>
        </div>
      </form>
    </Card>
  );
}
