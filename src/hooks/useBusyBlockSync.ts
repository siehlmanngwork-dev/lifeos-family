import { useEffect, useRef } from 'react';
import { syncBusyBlocks } from '../services/firestore';
import { useBusyBlocks, useEvents } from './useData';
import { useCurrentUser } from './useSession';

/**
 * Keeps the user's busy entries in line with their own events
 * (events from 0.1 or created before joining the family). Runs while the app is open.
 */
export function useBusyBlockSync(): void {
  const { userId, profile } = useCurrentUser();
  const familyId = profile.familyId;
  const { data: events, loading: eventsLoading } = useEvents();
  const { data: blocks, loading: blocksLoading } = useBusyBlocks();
  const running = useRef(false);

  useEffect(() => {
    if (!familyId || eventsLoading || blocksLoading || running.current) return;
    running.current = true;
    const ownEvents = events.filter((e) => e.createdBy === userId);
    syncBusyBlocks(userId, familyId, ownEvents, blocks, new Date())
      .catch(() => {
        // Retried on the next data change; status display falls back to existing entries.
      })
      .finally(() => {
        running.current = false;
      });
  }, [userId, familyId, events, blocks, eventsLoading, blocksLoading]);
}
