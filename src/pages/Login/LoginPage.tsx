import { useState } from 'react';
import { ErrorNote } from '../../components/shared/Feedback';
import { signInWithGoogle } from '../../services/auth/authService';

export function LoginPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async () => {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setError((e as Error).message);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="center-screen">
      <div className="login-card">
        <img src="./icon.svg" alt="" width={64} height={64} />
        <h1>LifeOS Family</h1>
        <p className="muted">Wissen, was als Nächstes wichtig ist.</p>
        <button type="button" className="button primary large" onClick={login} disabled={busy}>
          {busy ? 'Anmeldung läuft …' : 'Mit Google anmelden'}
        </button>
        <ErrorNote message={error} />
      </div>
    </div>
  );
}
