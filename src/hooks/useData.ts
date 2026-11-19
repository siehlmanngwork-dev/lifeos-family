import { useMemo } from 'react';
import type { UserSettings } from '../models';
import type { BusyBlock, CalendarEvent, Category, Family, ShoppingItem, ShoppingList, Task, UserProfile } from '../models';
import {
  subscribeBusyBlocks,
  subscribeCategories,
  subscribeEvents,
  subscribeFamily,
  subscribeFamilyMembers,
  subscribeSettings,
  subscribeShoppingItems,
  subscribeShoppingLists,
  subscribeTasks,
} from '../services/firestore';
import { useCurrentUser } from './useSession';
import { useSubscription } from './useSubscription';

const EMPTY: never[] = [];

export function useTasks() {
  const { userId, profile } = useCurrentUser();
  const familyId = profile.familyId;
  return useSubscription<Task[]>(
    (onData, onError) => subscribeTasks(userId, familyId, onData, onError),
    EMPTY,
    [userId, familyId],
  );
}

/** Own events plus non-private family events. */
export function useEvents() {
  const { userId, profile } = useCurrentUser();
  const familyId = profile.familyId;
  return useSubscription<CalendarEvent[]>(
    (onData, onError) => subscribeEvents(userId, familyId, onData, onError),
    EMPTY,
    [userId, familyId],
  );
}

/** Busy entries of all family members (DECISIONS D6). */
export function useBusyBlocks() {
  const { profile } = useCurrentUser();
  const familyId = profile.familyId;
  return useSubscription<BusyBlock[]>(
    familyId ? (onData, onError) => subscribeBusyBlocks(familyId, onData, onError) : null,
    EMPTY,
    [familyId],
  );
}

/**
 * `own`: categories the user manages and selects.
 * `byId`: also includes family members' categories for display.
 */
export function useCategories() {
  const { userId } = useCurrentUser();
  const { members } = useFamilyMembers();
  const ownerIds = useMemo(
    () => Array.from(new Set([userId, ...members.map((m) => m.id)])).sort(),
    [userId, members],
  );
  const key = ownerIds.join(',');
  const state = useSubscription<Category[]>(
    (onData, onError) => subscribeCategories(ownerIds, onData, onError),
    EMPTY,
    [key],
  );
  const own = useMemo(() => state.data.filter((c) => c.ownerId === userId), [state.data, userId]);
  const byId = useMemo(() => new Map(state.data.map((c) => [c.id, c])), [state.data]);
  return { ...state, own, byId };
}

export function useFamily() {
  const { profile } = useCurrentUser();
  const familyId = profile.familyId;
  return useSubscription<Family | null>(
    familyId ? (onData, onError) => subscribeFamily(familyId, onData, onError) : null,
    null,
    [familyId],
  );
}

/** Members of the user's family; just the user themself when there is no family. */
export function useFamilyMembers() {
  const { profile } = useCurrentUser();
  const familyId = profile.familyId;
  const state = useSubscription<UserProfile[]>(
    familyId ? (onData, onError) => subscribeFamilyMembers(familyId, onData, onError) : null,
    EMPTY,
    [familyId],
  );
  const members = useMemo(() => {
    const list = state.data.length ? state.data : [profile];
    return [...list].sort((a, b) => a.displayName.localeCompare(b.displayName, 'de'));
  }, [state.data, profile]);
  const byId = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);
  return { ...state, members, byId };
}

export function useShoppingLists() {
  const { profile } = useCurrentUser();
  const familyId = profile.familyId;
  return useSubscription<ShoppingList[]>(
    familyId ? (onData, onError) => subscribeShoppingLists(familyId, onData, onError) : null,
    EMPTY,
    [familyId],
  );
}

/** All shopping items of the family. */
export function useShoppingItems() {
  const { profile } = useCurrentUser();
  const familyId = profile.familyId;
  return useSubscription<ShoppingItem[]>(
    familyId ? (onData, onError) => subscribeShoppingItems(familyId, onData, onError) : null,
    EMPTY,
    [familyId],
  );
}

export function useSettings() {
  const { userId } = useCurrentUser();
  return useSubscription<UserSettings | null>(
    (onData, onError) => subscribeSettings(userId, onData, onError),
    null,
    [userId],
  );
}
