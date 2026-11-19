import { useMemo, useState } from 'react';
import type { Task } from '../../models';
import { useCategories, useFamilyMembers, useTasks } from '../../hooks/useData';
import { compareByImportance } from '../../services/dashboard/dashboardEngine';
import { setTaskCompleted } from '../../services/firestore';
import { Card } from '../shared/Card';
import { EmptyState, ErrorNote } from '../shared/Feedback';
import { TaskEditor } from '../tasks/TaskEditor';
import { TaskItem } from '../tasks/TaskItem';

type EditorState = { task?: Task } | null;

/** ✅ Familienaufgaben: open tasks of the family space. */
export function FamilyTasksPanel() {
  const { data: tasks, error } = useTasks();
  const { byId: categoriesById } = useCategories();
  const { byId: membersById } = useFamilyMembers();
  const [editor, setEditor] = useState<EditorState>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const open = useMemo(
    () => tasks.filter((t) => t.spaceId === 'family' && t.status === 'open').sort(compareByImportance),
    [tasks],
  );

  const toggle = (task: Task) => {
    setActionError(null);
    setTaskCompleted(task.id, true, task.shoppingItemId).catch((e: Error) => setActionError(e.message));
  };

  return (
    <Card
      title={`✅ Familienaufgaben (${open.length})`}
      actions={
        <button type="button" className="button primary" onClick={() => setEditor({})}>
          + Aufgabe
        </button>
      }
    >
      <ErrorNote message={error ?? actionError} />
      {open.length === 0 ? (
        <EmptyState text="Keine offenen Familienaufgaben." />
      ) : (
        <ul className="task-list">
          {open.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              category={categoriesById.get(task.categoryId)}
              assigneeNames={task.assignees.map((id) => membersById.get(id)?.displayName ?? 'Unbekannt')}
              onToggle={toggle}
              onOpen={(t) => setEditor({ task: t })}
            />
          ))}
        </ul>
      )}
      {editor && <TaskEditor task={editor.task} defaultSpaceId="family" onClose={() => setEditor(null)} />}
    </Card>
  );
}
