import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getDb } from '../../firebase/config';
import type { CalendarEvent, CalendarEventInput } from '../../models';
import { COLLECTIONS, nowIso, withId, type ErrorHandler, type Unsubscribe } from './collections';

function normalizeInput(input: CalendarEventInput): CalendarEventInput {
  return {
    title: input.title.trim(),
    startDateTime: input.startDateTime,
    endDateTime: input.endDateTime,
    location: input.location.trim(),
    categoryId: input.categoryId || null,
    private: input.private,
  };
}

/** Events in which the user participates. */
export function subscribeEvents(
  userId: string,
  onData: (events: CalendarEvent[]) => void,
  onError: ErrorHandler,
): Unsubscribe {
  const q = query(
    collection(getDb(), COLLECTIONS.events),
    where('participants', 'array-contains', userId),
  );
  return onSnapshot(q, (snap) => onData(snap.docs.map((d) => withId<CalendarEvent>(d))), onError);
}

export async function createEvent(userId: string, input: CalendarEventInput): Promise<void> {
  const event: Omit<CalendarEvent, 'id'> = {
    ...normalizeInput(input),
    participants: [userId],
    spaceId: 'personal',
    familyId: null,
    projectId: null,
    source: 'local',
    externalId: null,
    createdBy: userId,
    createdAt: nowIso(),
  };
  await addDoc(collection(getDb(), COLLECTIONS.events), event);
}

export function updateEvent(eventId: string, input: CalendarEventInput): Promise<void> {
  return updateDoc(doc(getDb(), COLLECTIONS.events, eventId), { ...normalizeInput(input) });
}

export function deleteEvent(eventId: string): Promise<void> {
  return deleteDoc(doc(getDb(), COLLECTIONS.events, eventId));
}
