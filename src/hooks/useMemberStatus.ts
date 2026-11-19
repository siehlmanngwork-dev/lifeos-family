import { useMemo } from 'react';
import type { ResolvedStatus, UserProfile } from '../models';
import { nextSource, resolveStatus, statusSourcesFor, type StatusSource } from '../services/status/statusEngine';
import { useBusyBlocks, useEvents } from './useData';
import { useNow } from './useNow';
import { useCurrentUser } from './useSession';

export interface MemberStatusInfo {
  status: ResolvedStatus;
  next: StatusSource | null;
}

/** Status and next appointment per member, re-evaluated every minute (manual status expiry). */
export function useMemberStatus(members: UserProfile[]): Map<string, MemberStatusInfo> {
  const { userId } = useCurrentUser();
  const { data: events } = useEvents();
  const { data: blocks } = useBusyBlocks();
  const now = useNow();

  return useMemo(() => {
    const result = new Map<string, MemberStatusInfo>();
    for (const member of members) {
      const sources = statusSourcesFor(member.id, userId, events, blocks);
      result.set(member.id, {
        status: resolveStatus(member.manualStatus, sources, now),
        next: nextSource(sources, now),
      });
    }
    return result;
  }, [members, userId, events, blocks, now]);
}
