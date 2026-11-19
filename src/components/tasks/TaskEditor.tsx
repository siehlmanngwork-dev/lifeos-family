import { useState } from 'react';
import type { Task, TaskInput } from '../../models';
import { useCategories, useFamilyMembers } from '../../hooks/useData';
import { useCurrentUser } from '../../hooks/useSession';
import { createTask, deleteTask, updateTask } from '../../services/firestore';
import { Modal } from '../shared/Modal';
import { TaskForm } from './TaskForm';

interface TaskEditorProps {
  task?: Task;
  onClose: () => void;
}

/** Modal to create or edit a task. */
export function TaskEditor({ task, onClose }: TaskEditorProps) {
  const { userId, profile, permissions } = useCurrentUser();
  const { own, byId } = useCategories();
  // Keep a family member's category selectable when editing their shared task.
  const foreign = task ? byId.get(task.categoryId) : undefined;
  const categories = foreign && !own.includes(foreign) ? [...own, foreign] : own;
  const { members } = useFamilyMembers();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<void>) => {
    setSubmitting(true);
    setError(null);
    try {
      await action();
      onClose();
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  };

  const handleSubmit = (input: TaskInput) =>
    run(() =>
      task ? updateTask(task.id, profile.familyId, input) : createTask(userId, profile.familyId, input),
    );

  const handleDelete = () => {
    if (task && window.confirm(`Aufgabe „${task.title}“ wirklich löschen?`)) run(() => deleteTask(task.id));
  };

  return (
    <Modal title={task ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'} onClose={onClose}>
      <TaskForm
        task={task}
        currentUserId={userId}
        categories={categories}
        members={members}
        hasFamily={profile.familyId !== null}
        canAssignOthers={permissions.assignTasksToOthers}
        submitting={submitting}
        error={error}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        canDelete={task?.createdBy === userId}
      />
    </Modal>
  );
}
