import type { Family, UserProfile } from '../../models';
import { useFamilyMembers, useTasks } from '../../hooks/useData';
import { useMemberStatus } from '../../hooks/useMemberStatus';
import { useNow } from '../../hooks/useNow';
import { useCurrentUser } from '../../hooks/useSession';
import { formatStatus, type StatusSource } from '../../services/status/statusEngine';
import { formatShortDate, formatTime, isSameDay } from '../../utils/date';
import { FamilyOverview } from './FamilyOverview';

function formatNext(next: StatusSource | null, now: Date): string {
  if (!next) return '–';
  const start = new Date(next.startDateTime);
  const when = isSameDay(start, now) ? formatTime(start) : `${formatShortDate(start)} ${formatTime(start)}`;
  return `${next.title ?? 'Beschäftigt'} ${when}`;
}

/**
 * 👥 Mitglieder. First level: only the current status.
 * Click: status, next appointment, open family tasks (RELEASE_0.2_SPEC §2).
 */
export function MembersPanel({ family }: { family: Family }) {
  const { userId } = useCurrentUser();
  const { members } = useFamilyMembers();
  const { data: tasks } = useTasks();
  const statusById = useMemberStatus(members);
  const now = useNow();

  const openFamilyTasks = (member: UserProfile) =>
    tasks.filter((t) => t.spaceId === 'family' && t.status === 'open' && t.assignees.includes(member.id)).length;

  const statusLabel = (m: UserProfile) => {
    const info = statusById.get(m.id);
    return info ? formatStatus(info.status) : '';
  };

  return (
    <FamilyOverview
      family={family}
      members={members}
      currentUserId={userId}
      renderSummary={statusLabel}
      renderDetail={(m) => (
        <dl className="member-facts">
          <dt>Status</dt>
          <dd>{statusLabel(m)}</dd>
          <dt>Nächster Termin</dt>
          <dd>{formatNext(statusById.get(m.id)?.next ?? null, now)}</dd>
          <dt>Offene Familienaufgaben</dt>
          <dd>{openFamilyTasks(m)}</dd>
        </dl>
      )}
    />
  );
}
