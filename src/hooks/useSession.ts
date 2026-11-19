import { useContext } from 'react';
import { SessionContext, type SessionState } from '../app/providers/SessionProvider';

export function useSession(): SessionState {
  return useContext(SessionContext);
}

/** Session data for screens behind the auth guard (user is signed in and set up). */
export function useCurrentUser() {
  const { authUser, profile, permissions } = useSession();
  if (!authUser || !profile || !permissions) {
    throw new Error('useCurrentUser must be used inside an authenticated route.');
  }
  return { userId: authUser.uid, profile, permissions };
}
