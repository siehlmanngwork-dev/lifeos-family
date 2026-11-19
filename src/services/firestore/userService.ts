import { collection, doc, getDoc, onSnapshot, query, updateDoc, where, writeBatch } from 'firebase/firestore';
import { getDb } from '../../firebase/config';
import {
  DEFAULT_PERMISSIONS,
  DEFAULT_WEEKLY_CAPACITY,
  type UserProfile,
  type UserProfileUpdate,
  type UserSettings,
} from '../../models';
import type { AuthUser } from '../auth/authService';
import { COLLECTIONS, nowIso, withId, type ErrorHandler, type Unsubscribe } from './collections';

/**
 * Creates the user's profile, permissions and settings documents on first login.
 * Missing documents are created individually, existing ones are left untouched.
 */
export async function ensureUserSetup(user: AuthUser): Promise<void> {
  const db = getDb();
  const userRef = doc(db, COLLECTIONS.users, user.uid);
  const permissionsRef = doc(db, COLLECTIONS.permissions, user.uid);
  const settingsRef = doc(db, COLLECTIONS.settings, user.uid);

  const [userSnap, permissionsSnap, settingsSnap] = await Promise.all([
    getDoc(userRef),
    getDoc(permissionsRef),
    getDoc(settingsRef),
  ]);

  if (userSnap.exists() && permissionsSnap.exists() && settingsSnap.exists()) return;

  const createdAt = nowIso();
  const batch = writeBatch(db);

  if (!userSnap.exists()) {
    const profile: Omit<UserProfile, 'id'> = {
      displayName: user.displayName ?? user.email ?? 'Nutzer',
      email: user.email ?? '',
      photoURL: user.photoURL ?? null,
      familyId: null,
      availableHoursPerDay: DEFAULT_WEEKLY_CAPACITY,
      createdAt,
    };
    batch.set(userRef, profile);
  }
  if (!permissionsSnap.exists()) {
    batch.set(permissionsRef, DEFAULT_PERMISSIONS);
  }
  if (!settingsSnap.exists()) {
    const settings: UserSettings = { ownerId: user.uid, createdAt };
    batch.set(settingsRef, settings);
  }

  await batch.commit();
}

export function subscribeUserProfile(
  userId: string,
  onData: (profile: UserProfile | null) => void,
  onError: ErrorHandler,
): Unsubscribe {
  return onSnapshot(
    doc(getDb(), COLLECTIONS.users, userId),
    (snap) => onData(snap.exists() ? withId<UserProfile>(snap) : null),
    onError,
  );
}

export function updateUserProfile(userId: string, update: UserProfileUpdate): Promise<void> {
  return updateDoc(doc(getDb(), COLLECTIONS.users, userId), update);
}

/** All users that belong to the given family. */
export function subscribeFamilyMembers(
  familyId: string,
  onData: (members: UserProfile[]) => void,
  onError: ErrorHandler,
): Unsubscribe {
  const q = query(collection(getDb(), COLLECTIONS.users), where('familyId', '==', familyId));
  return onSnapshot(q, (snap) => onData(snap.docs.map((d) => withId<UserProfile>(d))), onError);
}
