import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  writeBatch,
  type Query,
  type WriteBatch,
} from 'firebase/firestore';
import { getDb } from '../../firebase/config';
import type { BusyBlock, CalendarEvent, CalendarEventInput } from '../../models';
import {
  COLLECTIONS,
  FAMILY_SUBCOLLECTIONS,
  nowIso,
  withId,
  type ErrorHandler,
  type Unsubscribe,
} from './collections';

function normalizeInput(input: CalendarEventInput, userFamilyId: string | null) {
  const spaceId = input.spaceId === 'family' && userFamilyId ? 'family' : 'personal';
  return {
    title: input.title.trim(),
    startDateTime: input.startDateTime,
    endDateTime: input.endDateTime,
    location: input.location.trim(),
    categoryId: input.categoryId || null,
    private: input.private,
    spaceId,
    familyId: spaceId === 'family' ? userFamilyId : null,
  } as const;
}

function busyBlocksRef(familyId: string) {
  return collection(getDb(), COLLECTIONS.families, familyId, FAMILY_SUBCOLLECTIONS.busyBlocks);
}

/**
 * Busy entry other family members may read (DECISIONS D6/R1).
 * Needed when the family cannot read the event itself: personal or private events.
 * Private events never expose title or location.
 */
export function expectedBusyBlock(
  event: Pick<CalendarEvent, 'id' | 'createdBy' | 'startDateTime' | 'endDateTime' | 'title' | 'location' | 'private' | 'spaceId'>,
): BusyBlock | null {
  if (event.spaceId === 'family' && !event.private) return null;
  return {
    id: event.id,
    ownerId: event.createdBy,
    startDateTime: event.startDateTime,
    endDateTime: event.endDateTime,
    title: event.private ? null : event.title,
    location: event.private || !event.location ? null : event.location,
  };
}

function writeBusyBlock(batch: WriteBatch, familyId: string, eventId: string, block: BusyBlock | null) {
  const ref = doc(busyBlocksRef(familyId), eventId);
  if (block) {
    const { id: _id, ...data } = block;
    batch.set(ref, data);
  } else {
    batch.delete(ref);
  }
}

/**
 * Events visible to the user: own events (participant) and
 * non-private family events of the user's family.
 */
export function subscribeEvents(
  userId: string,
  familyId: string | null,
  onData: (events: CalendarEvent[]) => void,
  onError: ErrorHandler,
): Unsubscribe {
  const eventsRef = collection(getDb(), COLLECTIONS.events);
  const queries: Query[] = [query(eventsRef, where('participants', 'array-contains', userId))];
  if (familyId) {
    queries.push(query(eventsRef, where('familyId', '==', familyId), where('private', '==', false)));
  }

  const buckets = queries.map(() => new Map<string, CalendarEvent>());
  const emit = () => {
    const merged = new Map<string, CalendarEvent>();
    buckets.forEach((bucket) => bucket.forEach((event, id) => merged.set(id, event)));
    onData(Array.from(merged.values()));
  };
  const unsubscribers = queries.map((q, index) =>
    onSnapshot(
      q,
      (snap) => {
        buckets[index] = new Map(snap.docs.map((d) => [d.id, withId<CalendarEvent>(d)]));
        emit();
      },
      onError,
    ),
  );
  return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
}

export function subscribeBusyBlocks(
  familyId: string,
  onData: (blocks: BusyBlock[]) => void,
  onError: ErrorHandler,
): Unsubscribe {
  return onSnapshot(busyBlocksRef(familyId), (snap) => onData(snap.docs.map((d) => withId<BusyBlock>(d))), onError);
}

export async function createEvent(userId: string, userFamilyId: string | null, input: CalendarEventInput): Promise<void> {
  const db = getDb();
  const ref = doc(collection(db, COLLECTIONS.events));
  const event: Omit<CalendarEvent, 'id'> = {
    ...normalizeInput(input, userFamilyId),
    participants: [userId],
    projectId: null,
    source: 'local',
    externalId: null,
    createdBy: userId,
    createdAt: nowIso(),
  };
  const batch = writeBatch(db);
  batch.set(ref, event);
  if (userFamilyId) writeBusyBlock(batch, userFamilyId, ref.id, expectedBusyBlock({ ...event, id: ref.id }));
  await batch.commit();
}

export async function updateEvent(event: CalendarEvent, userFamilyId: string | null, input: CalendarEventInput): Promise<void> {
  const db = getDb();
  const data = normalizeInput(input, userFamilyId);
  const batch = writeBatch(db);
  batch.update(doc(db, COLLECTIONS.events, event.id), { ...data });
  if (userFamilyId) writeBusyBlock(batch, userFamilyId, event.id, expectedBusyBlock({ ...event, ...data }));
  await batch.commit();
}

export async function deleteEvent(event: CalendarEvent, userFamilyId: string | null): Promise<void> {
  const db = getDb();
  const batch = writeBatch(db);
  batch.delete(doc(db, COLLECTIONS.events, event.id));
  if (userFamilyId) writeBusyBlock(batch, userFamilyId, event.id, null);
  await batch.commit();
}

/**
 * Brings the user's busy entries in line with their own events, e.g. for events
 * created before 0.2 or before joining the family. Only events that have not
 * ended more than a day ago are considered. Writes nothing when already in sync.
 */
function blockKey(block: BusyBlock | null): string {
  if (!block) return '';
  return [block.ownerId, block.startDateTime, block.endDateTime, block.title, block.location].join('|');
}

export async function syncBusyBlocks(
  userId: string,
  familyId: string,
  ownEvents: CalendarEvent[],
  existing: BusyBlock[],
  now: Date,
): Promise<void> {
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const mine = new Map(existing.filter((b) => b.ownerId === userId).map((b) => [b.id, b]));
  const eventIds = new Set(ownEvents.map((e) => e.id));
  const batch = writeBatch(getDb());
  let writes = 0;

  for (const event of ownEvents) {
    if (event.createdBy !== userId || event.endDateTime < cutoff) continue;
    const expected = expectedBusyBlock(event);
    const current = mine.get(event.id) ?? null;
    if (blockKey(expected) !== blockKey(current)) {
      writeBusyBlock(batch, familyId, event.id, expected);
      writes++;
    }
  }
  for (const block of mine.values()) {
    if (!eventIds.has(block.id)) {
      writeBusyBlock(batch, familyId, block.id, null);
      writes++;
    }
  }
  if (writes > 0) await batch.commit();
}
