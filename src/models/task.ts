import type { Priority } from './priority';
import type { SpaceId } from './space';

export type TaskStatus = 'open' | 'done';

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
  /** Reserved for Release 0.2 (recurring tasks). */
  isRecurring: boolean;
  /** Set when the task is completed (archive; automatic deletion arrives later). */
  completedAt: string | null;
  createdBy: string;
  createdAt: string;
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
  | 'reminder'
  | 'spaceId'
>;
