import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { ErrorNote, LoadingScreen } from '../../components/shared/Feedback';
import { useSession } from '../../hooks/useSession';
import type { PermissionKey } from '../../models';
import { signOutUser } from '../../services/auth/authService';
import { firstPermittedPath, hasPermission } from '../../services/permissions/navigation';

/** Renders children only for signed-in users whose profile is set up. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { loading, authUser, profile, permissions, error } = useSession();

  if (loading) return <LoadingScreen />;
  if (!authUser) return <Navigate to="/login" replace />;
  if (error || !profile || !permissions) {
    return (
      <div className="center-screen">
        <div className="login-card">
          <ErrorNote message={error ?? 'Profil konnte nicht geladen werden.'} />
          <button type="button" className="button" onClick={() => signOutUser()}>
            Abmelden
          </button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

/** Redirects to the first permitted area when the permission is missing. */
export function RequirePermission({ permission, children }: { permission: PermissionKey; children: ReactNode }) {
  const { permissions } = useSession();
  if (hasPermission(permissions, permission)) return <>{children}</>;
  const fallback = firstPermittedPath(permissions);
  if (fallback && fallback !== '/') return <Navigate to={fallback} replace />;
  return <ErrorNote message="Für diesen Bereich fehlen die Berechtigungen." />;
}

/** Login page is only reachable when signed out. */
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { loading, authUser } = useSession();
  if (loading) return <LoadingScreen />;
  if (authUser) return <Navigate to="/" replace />;
  return <>{children}</>;
}
