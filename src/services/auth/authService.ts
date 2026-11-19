import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth';
import { getFirebaseAuth, googleProvider } from '../../firebase/config';

export type AuthUser = User;

export async function signInWithGoogle(): Promise<void> {
  const auth = getFirebaseAuth();
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    const code = (error as { code?: string }).code;
    // Popups are often blocked in installed PWAs / mobile browsers.
    if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
      await signInWithRedirect(auth, googleProvider);
      return;
    }
    throw error;
  }
}

export function signOutUser(): Promise<void> {
  return signOut(getFirebaseAuth());
}

export function subscribeAuthState(callback: (user: AuthUser | null) => void): () => void {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}
