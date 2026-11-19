import { doc, onSnapshot } from 'firebase/firestore';
import { getDb } from '../../firebase/config';
import { DEFAULT_PERMISSIONS, type Permissions } from '../../models';
import { COLLECTIONS, type ErrorHandler, type Unsubscribe } from './collections';

/** Subscribes to `permissions/{userId}`. Missing flags fall back to `false`. */
export function subscribePermissions(
  userId: string,
  onData: (permissions: Permissions | null) => void,
  onError: ErrorHandler,
): Unsubscribe {
  return onSnapshot(
    doc(getDb(), COLLECTIONS.permissions, userId),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      const data = snap.data();
      const permissions = Object.fromEntries(
        Object.keys(DEFAULT_PERMISSIONS).map((key) => [key, data[key] === true]),
      ) as unknown as Permissions;
      onData(permissions);
    },
    onError,
  );
}
