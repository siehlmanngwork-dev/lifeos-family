import { useState, type FormEvent } from 'react';
import { createFamily, joinFamily } from '../../services/firestore';
import { Card } from '../shared/Card';
import { ErrorNote } from '../shared/Feedback';

/** Shown when the user has no family yet: create one or join via family code. */
export function FamilySetup({ userId }: { userId: string }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState<'create' | 'join' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (kind: 'create' | 'join', action: () => Promise<unknown>) => {
    setBusy(kind);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    run('create', () => createFamily(userId, name));
  };

  const handleJoin = (e: FormEvent) => {
    e.preventDefault();
    run('join', () => joinFamily(userId, code));
  };

  return (
    <div className="two-columns">
      <Card title="Familie erstellen">
        <form className="form" onSubmit={handleCreate}>
          <label className="field">
            <span>Familienname</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Familie Müller" />
          </label>
          <button type="submit" className="button primary" disabled={busy !== null || !name.trim()}>
            {busy === 'create' ? 'Wird erstellt …' : 'Familie erstellen'}
          </button>
        </form>
      </Card>
      <Card title="Familie beitreten">
        <form className="form" onSubmit={handleJoin}>
          <label className="field">
            <span>Familiencode</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="FAM-72AB-91QX"
              autoCapitalize="characters"
            />
          </label>
          <button type="submit" className="button primary" disabled={busy !== null || !code.trim()}>
            {busy === 'join' ? 'Tritt bei …' : 'Beitreten'}
          </button>
        </form>
      </Card>
      <ErrorNote message={error} />
    </div>
  );
}
