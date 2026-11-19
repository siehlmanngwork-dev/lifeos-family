/**
 * Manual status override, stored on `users/{userId}.manualStatus`.
 * `expiresAt: null` = unlimited; after expiry the automatic logic applies again.
 */
export interface ManualStatus {
  type: 'home' | 'custom';
  /** "Zuhause" for type home, free text for type custom. */
  label: string;
  /** ISO date-time or null (unlimited). */
  expiresAt: string | null;
}

/**
 * Busy entry for a personal event, readable by the family
 * (`families/{familyId}/busyBlocks/{eventId}`, DECISIONS D6 / R1).
 * Private events never expose title or location.
 */
export interface BusyBlock {
  /** Same as the event id. */
  id: string;
  ownerId: string;
  startDateTime: string;
  endDateTime: string;
  /** null for private events. */
  title: string | null;
  /** null for private events or events without location. */
  location: string | null;
}

/** Result of the status engine, in priority order of its sources. */
export type ResolvedStatus =
  | { source: 'manual'; kind: 'home' | 'custom'; label: string; until: string | null }
  | { source: 'event'; kind: 'location'; label: string; until: string }
  | { source: 'event'; kind: 'busy'; until: string }
  | { source: 'none' };
