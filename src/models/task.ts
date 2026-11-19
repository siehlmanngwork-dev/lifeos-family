import type { Priority } from './priority';
import type { SpaceId } from './space';

/** "discarded": closed without being done (DECISIONS D10); does not count as done. */
export type TaskStatus = 'open' | 'done' | 'discarded';

export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
export type RecurrenceUnit = 'days' | 'weeks' | 'months';

/** Default number of generated occurrences (DECISIONS D9). */
export const DEFAULT_SERIES_LENGTH = 10;

export interface Task {
  id: string;
  title: string;
  description: string;
  /** Responsible person(s). Personal space: exactly one. */
  assignees: string[];
  priority: Priority;
  categoryId: string;
  /** Estimated effort in minutes. */
  estimatedDuration: number;
  /** Date key "YYYY-MM-DD", or null for "Irgendwann". */
  deadline: string | null;
  /** Optional reminder (ISO date-time). Stored only; notifications arrive in Release 0.5. */
  reminder: string | null;
  spaceId: SpaceId;
  /** Set for tasks in the family space; used for access control and queries. */
  familyId: string | null;
  /** Reserved for Release 0.3 (projects). */
  projectId: string | null;
  status: TaskStatus;
  isRecurring: boolean;
  /** Set when the task is completed (archive; automatic deletion arrives later). */
  completedAt: string | null;
  createdBy: string;
  createdAt: string;

  // ----- Release 0.2 (optional: tasks from 0.1 do not have these fields) -----
  /** Optional deadline time "HH:mm"; conflicts are only checked when set (DECISIONS D4). */
  deadlineTime?: string | null;
  /** Shopping item this task was created from (DECISIONS D3). */
  shoppingItemId?: string | null;
  recurrenceType?: RecurrenceType | null;
  /** For "custom": every N units. */
  recurrenceInterval?: number | null;
  recurrenceUnit?: RecurrenceUnit | null;
  rotationEnabled?: boolean;
  /** Rotation order of responsible persons. */
  rotationMembers?: string[];
  /** Links all occurrences of a series. */
  seriesId?: string | null;
  /** 0-based position within the series. */
  occurrenceIndex?: number | null;
  /** Number of occurrences generated per batch (DECISIONS D9); also used when extending. */
  seriesLength?: number | null;
  /** Deadline of occurrence 0; all occurrence dates are computed from it. */
  seriesStart?: string | null;
}

/** Fields the user edits in the task form. */
export type TaskInput = Pick<
  Task,
  | 'title'
  | 'description'
  | 'assignees'
  | 'priority'
  | 'categoryId'
  | 'estimatedDuration'
  | 'deadline'
  | 'deadlineTime'
  | 'reminder'
  | 'spaceId'
>;
