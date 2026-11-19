import { isFirebaseConfigured } from '../firebase/config';
import { SessionProvider } from './providers/SessionProvider';
import { AppRouter } from './router/AppRouter';

export function App() {
  if (!isFirebaseConfigured) {
    return (
      <div className="center-screen">
        <div className="login-card">
          <h1>LifeOS Family</h1>
          <p className="error-note">
            Firebase ist nicht konfiguriert. Bitte <code>.env.example</code> nach <code>.env.local</code> kopieren
            und die Werte des Firebase-Projekts eintragen.
          </p>
        </div>
      </div>
    );
  }
  return (
    <SessionProvider>
      <AppRouter />
    </SessionProvider>
  );
}
