/**
 * Conflict types (MVP_SPEC §10). Detection is implemented in Release 0.2;
 * Release 0.1 only defines the shape and a placeholder engine.
 */
export type ConflictType = 'event-overlap' | 'insufficient-time';

export interface Conflict {
  id: string;
  type: ConflictType;
  message: string;
  eventIds: string[];
  taskIds: string[];
}
