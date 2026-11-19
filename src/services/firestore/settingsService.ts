import { arrayUnion, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { getDb } from '../../firebase/config';
import type { UserSettings } from '../../models';
import { COLLECTIONS, type ErrorHandler, type Unsubscribe } from './collections';

export function subscribeSettings(
  userId: string,
  onData: (settings: UserSettings | null) => void,
  onError: ErrorHandler,
): Unsubscribe {
  return onSnapshot(
    doc(getDb(), COLLECTIONS.settings, userId),
    (snap) => onData(snap.exists() ? (snap.data() as UserSettings) : null),
    onError,
  );
}

/** Time "HH:mm" of the evening dialog (DECISIONS D10). */
export function setOverdueDialogTime(userId: string, time: string): Promise<void> {
  return setDoc(doc(getDb(), COLLECTIONS.settings, userId), { overdueDialogTime: time }, { merge: true });
}

/** Remembers that the "extend series?" notice was answered with no. */
export function dismissSeriesNotice(userId: string, seriesId: string): Promise<void> {
  return setDoc(doc(getDb(), COLLECTIONS.settings, userId), { dismissedSeriesIds: arrayUnion(seriesId) }, { merge: true });
}
