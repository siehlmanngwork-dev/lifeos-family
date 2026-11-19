import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
  type Query,
} from 'firebase/firestore';
import { getDb } from '../../firebase/config';
import type { Task, TaskInput } from '../../models';
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

/** Completing moves the task to the archive (status "done"). */
export function setTaskCompleted(taskId: string, completed: boolean): Promise<void> {
  return updateDoc(doc(getDb(), COLLECTIONS.tasks, taskId), {
    status: completed ? 'done' : 'open',
    completedAt: completed ? nowIso() : null,
  });
}

export function deleteTask(taskId: string): Promise<void> {
  return deleteDoc(doc(getDb(), COLLECTIONS.tasks, taskId));
}
