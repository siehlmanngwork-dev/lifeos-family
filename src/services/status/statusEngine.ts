import type { BusyBlock, CalendarEvent, ManualStatus, ResolvedStatus } from '../../models';

/** A time span that can determine a status or a "next event". */
export interface StatusSource {
  title: string | null;
  location: string | null;
  startDateTime: string;
  endDateTime: string;
}

/**
 * What can be known about a member's schedule:
 * - own user: own events with full content,
 * - others: their busy blocks plus their non-private family events.
 */
export function statusSourcesFor(
  memberId: string,
  currentUserId: string,
  events: CalendarEvent[],
  blocks: BusyBlock[],
): StatusSource[] {
  const fromEvents = events
    .filter((e) => e.createdBy === memberId && (memberId === currentUserId || (e.spaceId === 'family' && !e.private)))
    .map((e) => ({
      title: e.title,
      location: e.location || null,
      startDateTime: e.startDateTime,
      endDateTime: e.endDateTime,
    }));
  if (memberId === currentUserId) return fromEvents;
  return [...fromEvents, ...blocks.filter((b) => b.ownerId === memberId)];
}

export function isManualStatusActive(manual: ManualStatus | null | undefined, now: Date): manual is ManualStatus {
  return !!manual && (manual.expiresAt === null || new Date(manual.expiresAt) > now);
}

/**
 * Status priority (RELEASE_0.2_SPEC §3):
 * 1. manual status (until it expires), 2. active event (location or "busy"), 3. none.
 */
export function resolveStatus(
  manual: ManualStatus | null | undefined,
  sources: StatusSource[],
  now: Date,
): ResolvedStatus {
  if (isManualStatusActive(manual, now)) {
    return { source: 'manual', kind: manual.type, label: manual.label, until: manual.expiresAt };
  }
  const nowIso = now.toISOString();
  const active = sources
    .filter((s) => s.startDateTime <= nowIso && s.endDateTime > nowIso)
    // Most recently started event first; an event with location wins over one without.
    .sort((a, b) => Number(!!b.location) - Number(!!a.location) || b.startDateTime.localeCompare(a.startDateTime))[0];
  if (!active) return { source: 'none' };
  return active.location
    ? { source: 'event', kind: 'location', label: active.location, until: active.endDateTime }
    : { source: 'event', kind: 'busy', until: active.endDateTime };
}

export function formatStatus(status: ResolvedStatus): string {
  if (status.source === 'none') return 'Kein aktiver Termin';
  if (status.kind === 'home') return '🏠 Zuhause';
  if (status.kind === 'busy') return '🔴 Beschäftigt';
  return `📍 ${status.label}`;
}

/** Next upcoming source (a running one counts); title null = "Beschäftigt". */
export function nextSource(sources: StatusSource[], now: Date): StatusSource | null {
  const nowIso = now.toISOString();
  return (
    sources
      .filter((s) => s.endDateTime > nowIso)
      .sort((a, b) => a.startDateTime.localeCompare(b.startDateTime))[0] ?? null
  );
}
