import { useMemo } from 'react';
import type { CalendarEvent, Category, Family, Task, UserProfile } from '../models';
import {
  subscribeCategories,
  subscribeEvents,
  subscribeFamily,
  subscribeFamilyMembers,
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

export function useEvents() {
  const { userId } = useCurrentUser();
  return useSubscription<CalendarEvent[]>(
    (onData, onError) => subscribeEvents(userId, onData, onError),
    EMPTY,
    [userId],
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
