import { createContext } from 'react';
import type { AuthUser } from '../../services/auth/authService';
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
