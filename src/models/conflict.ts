/**
 * Conflict types (MVP_SPEC §10, RELEASE_0.2_SPEC §5).
 * Release 0.2 detects "deadline-in-event"; the other types are reserved.
 */
export type ConflictType = 'deadline-in-event' | 'event-overlap' | 'insufficient-time';

export interface Conflict {
  id: string;
  type: ConflictType;
  message: string;
  eventIds: string[];
  taskIds: string[];
}
