import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { subscribeAuthState, type AuthUser } from '../../services/auth/authService';
import {
  ensureUserSetup,
  subscribePermissions,
  subscribeUserProfile,
} from '../../services/firestore';
import type { Permissions, UserProfile } from '../../models';

export interface SessionState {
  /** True until auth state and (if signed in) profile + permissions are known. */
  loading: boolean;
  authUser: AuthUser | null;
  profile: UserProfile | null;
  permissions: Permissions | null;
  error: string | null;
}

const initialState: SessionState = {
  loading: true,
  authUser: null,
  profile: null,
  permissions: null,
  error: null,
};

export const SessionContext = createContext<SessionState>(initialState);

/**
 * Tracks Firebase auth, runs the first-login user setup and keeps the
 * user's profile and permissions live.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [profileReady, setProfileReady] = useState(false);
  const [permissionsReady, setPermissionsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () =>
      subscribeAuthState((user) => {
        setAuthUser(user);
        setAuthReady(true);
      }),
    [],
  );

  useEffect(() => {
    setProfile(null);
    setPermissions(null);
    setProfileReady(false);
    setPermissionsReady(false);
    setError(null);
    if (!authUser) return;

    let cancelled = false;
    const unsubscribers: Array<() => void> = [];
    const onError = (e: Error) => {
      if (!cancelled) setError(e.message);
    };

    ensureUserSetup(authUser)
      .then(() => {
        if (cancelled) return;
        unsubscribers.push(
          subscribeUserProfile(
            authUser.uid,
            (p) => {
              setProfile(p);
              setProfileReady(true);
            },
            onError,
          ),
          subscribePermissions(
            authUser.uid,
            (p) => {
              setPermissions(p);
              setPermissionsReady(true);
            },
            onError,
          ),
        );
      })
      .catch(onError);

    return () => {
      cancelled = true;
      unsubscribers.forEach((u) => u());
    };
  }, [authUser]);

  const value = useMemo<SessionState>(
    () => ({
      loading: !authReady || (authUser !== null && error === null && (!profileReady || !permissionsReady)),
      authUser,
      profile,
      permissions,
      error,
    }),
    [authReady, authUser, profile, permissions, profileReady, permissionsReady, error],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
