import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  where,
  writeBatch,
  type Query,
} from 'firebase/firestore';
import { getDb } from '../../firebase/config';
import type { Task, TaskInput } from '../../models';
import { assigneesFor, occurrenceDate, type RecurrenceRule } from '../recurrence/recurrenceEngine';
import { COLLECTIONS, nowIso, withId, type ErrorHandler, type Unsubscribe } from './collections';

function normalizeInput(input: TaskInput, familyId: string | null): TaskInput & { familyId: string | null } {
  return {
    title: input.title.trim(),
    description: input.description.trim(),
    assignees: Array.from(new Set(input.assignees)),
    priority: input.priority,
    categoryId: input.categoryId,
    estimatedDuration: input.estimatedDuration,
    deadline: input.deadline,
    deadlineTime: input.deadline ? input.deadlineTime ?? null : null,
    reminder: input.reminder,
    spaceId: input.spaceId,
    familyId: input.spaceId === 'family' ? familyId : null,
  };
}

/**
 * Subscribes to every task visible to the user:
 * tasks assigned to them, tasks they created, and tasks of their family space.
 * Results of the separate queries are merged by id.
 */
export function subscribeTasks(
  userId: string,
  familyId: string | null,
  onData: (tasks: Task[]) => void,
  onError: ErrorHandler,
): Unsubscribe {
  const tasksRef = collection(getDb(), COLLECTIONS.tasks);
  const queries: Query[] = [
    query(tasksRef, where('assignees', 'array-contains', userId)),
    query(tasksRef, where('createdBy', '==', userId)),
  ];
  if (familyId) queries.push(query(tasksRef, where('familyId', '==', familyId)));

  const buckets = queries.map(() => new Map<string, Task>());
  const emit = () => {
    const merged = new Map<string, Task>();
    buckets.forEach((bucket) => bucket.forEach((task, id) => merged.set(id, task)));
    onData(Array.from(merged.values()));
  };

  const unsubscribers = queries.map((q, index) =>
    onSnapshot(
      q,
      (snap) => {
        buckets[index] = new Map(snap.docs.map((d) => [d.id, withId<Task>(d)]));
        emit();
      },
      onError,
    ),
  );
  return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
}

export async function createTask(userId: string, familyId: string | null, input: TaskInput): Promise<void> {
  const task: Omit<Task, 'id'> = {
    ...normalizeInput(input, familyId),
    projectId: null,
    status: 'open',
    isRecurring: false,
    completedAt: null,
    createdBy: userId,
    createdAt: nowIso(),
  };
  await addDoc(collection(getDb(), COLLECTIONS.tasks), task);
}

export function updateTask(taskId: string, familyId: string | null, input: TaskInput): Promise<void> {
  return updateDoc(doc(getDb(), COLLECTIONS.tasks, taskId), normalizeInput(input, familyId));
}

/**
 * Completing moves the task to the archive (status "done").
 * Tasks created from a shopping item keep the item in sync:
 * done ⇄ bought, reopened ⇄ claimed (DECISIONS D3).
 */
export async function setTaskCompleted(
  taskId: string,
  completed: boolean,
  shoppingItemId?: string | null,
): Promise<void> {
  const db = getDb();
  const batch = writeBatch(db);
  batch.update(doc(db, COLLECTIONS.tasks, taskId), {
    status: completed ? 'done' : 'open',
    completedAt: completed ? nowIso() : null,
  });
  if (shoppingItemId) {
    const itemRef = doc(db, COLLECTIONS.shoppingItems, shoppingItemId);
    // The item may have been deleted from its list in the meantime.
    const item = await getDoc(itemRef).catch(() => null);
    if (item?.exists() && item.data().taskId === taskId) {
      batch.update(itemRef, { status: completed ? 'bought' : 'claimed' });
    }
  }
  await batch.commit();
}

export function deleteTask(taskId: string): Promise<void> {
  return deleteDoc(doc(getDb(), COLLECTIONS.tasks, taskId));
}

export interface SeriesInput extends RecurrenceRule {
  /** Number of occurrences to generate (DECISIONS D9). */
  count: number;
  /** Rotation order; null = fixed assignment. */
  rotationMembers: string[] | null;
}

function occurrence(base: Omit<Task, 'id'>, seriesId: string, index: number): Omit<Task, 'id'> {
  const rule: RecurrenceRule = {
    type: base.recurrenceType ?? 'weekly',
    interval: base.recurrenceInterval ?? 1,
    unit: base.recurrenceUnit ?? 'days',
  };
  return {
    ...base,
    assignees: assigneesFor(index, base.assignees, base.rotationEnabled ? base.rotationMembers : null),
    deadline: occurrenceDate(base.seriesStart as string, rule, index),
    status: 'open',
    completedAt: null,
    seriesId,
    occurrenceIndex: index,
    createdAt: nowIso(),
  };
}

/**
 * Creates a series with a limited number of occurrences (no infinite generation).
 * Ids `${seriesId}_${index}` prevent duplicates when several devices extend at once.
 */
export async function createTaskSeries(
  userId: string,
  familyId: string | null,
  input: TaskInput,
  series: SeriesInput,
): Promise<void> {
  if (!input.deadline) throw new Error('Wiederkehrende Aufgaben brauchen ein Startdatum.');
  const db = getDb();
  const seriesId = doc(collection(db, COLLECTIONS.tasks)).id;
  const rotation = series.rotationMembers && series.rotationMembers.length > 1 ? series.rotationMembers : null;
  const base: Omit<Task, 'id'> = {
    ...normalizeInput(input, familyId),
    projectId: null,
    status: 'open',
    isRecurring: true,
    completedAt: null,
    createdBy: userId,
    createdAt: nowIso(),
    recurrenceType: series.type,
    recurrenceInterval: series.type === 'custom' ? series.interval : null,
    recurrenceUnit: series.type === 'custom' ? series.unit : null,
    rotationEnabled: rotation !== null,
    rotationMembers: rotation ?? [],
    seriesLength: series.count,
    seriesStart: input.deadline,
  };
  const batch = writeBatch(db);
  for (let i = 0; i < series.count; i++) {
    batch.set(doc(db, COLLECTIONS.tasks, `${seriesId}_${i}`), occurrence(base, seriesId, i));
  }
  await batch.commit();
}

/** Appends the next batch of occurrences after the last existing one ("Serie verlängern"). */
export async function extendTaskSeries(lastOccurrence: Task): Promise<void> {
  if (!lastOccurrence.seriesId || lastOccurrence.occurrenceIndex == null || !lastOccurrence.seriesStart) return;
  const db = getDb();
  const { id: _id, ...base } = lastOccurrence;
  const count = lastOccurrence.seriesLength ?? 10;
  // Rotation follows the stored order; fixed assignment keeps the last occurrence's persons.
  const template: Omit<Task, 'id'> = base;
  const batch = writeBatch(db);
  for (let k = 1; k <= count; k++) {
    const index = lastOccurrence.occurrenceIndex + k;
    batch.set(doc(db, COLLECTIONS.tasks, `${lastOccurrence.seriesId}_${index}`), occurrence(template, lastOccurrence.seriesId, index));
  }
  await batch.commit();
}

/** "Verschieben": new deadline for an open occurrence (DECISIONS D10). */
export function rescheduleTask(taskId: string, deadline: string): Promise<void> {
  return updateDoc(doc(getDb(), COLLECTIONS.tasks, taskId), { deadline });
}

/** "Verwerfen": closes the task without counting it as done (status "discarded"). */
export function discardTask(taskId: string): Promise<void> {
  return updateDoc(doc(getDb(), COLLECTIONS.tasks, taskId), { status: 'discarded', completedAt: null });
}
