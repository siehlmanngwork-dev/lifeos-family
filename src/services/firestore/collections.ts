import type { DocumentData, DocumentSnapshot, QueryDocumentSnapshot } from 'firebase/firestore';

/** All Firestore collections known to the app (ARCHITECTURE.md). */
export const COLLECTIONS = {
  users: 'users',
  families: 'families',
  spaces: 'spaces',
  tasks: 'tasks',
  events: 'events',
  projects: 'projects',
  categories: 'categories',
  shoppingItems: 'shoppingItems',
  permissions: 'permissions',
  settings: 'settings',
} as const;

/** Subcollections of `families/{familyId}` (DECISIONS D1, D6). */
export const FAMILY_SUBCOLLECTIONS = {
  shoppingLists: 'shoppingLists',
  busyBlocks: 'busyBlocks',
} as const;

/** Maps a snapshot to a model object that carries its document id. */
export function withId<T extends { id: string }>(
  snap: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>,
): T {
  return { ...(snap.data() as Omit<T, 'id'>), id: snap.id } as T;
}

export type Unsubscribe = () => void;
export type ErrorHandler = (error: Error) => void;

export const nowIso = (): string => new Date().toISOString();
