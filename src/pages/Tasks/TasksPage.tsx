import { useMemo, useState } from 'react';
import type { Task } from '../../models';
import { Card } from '../../components/shared/Card';
import { EmptyState, ErrorNote } from '../../components/shared/Feedback';
import { TaskEditor } from '../../components/tasks/TaskEditor';
import { TaskItem } from '../../components/tasks/TaskItem';
import { useCategories, useFamilyMembers, useTasks } from '../../hooks/useData';
import { compareByImportance } from '../../services/dashboard/dashboardEngine';
import { setTaskCompleted } from '../../services/firestore';

type EditorState = { task?: Task } | null;

export function TasksPage() {
  const { data: tasks, error, loading } = useTasks();
  const { byId: categoriesById } = useCategories();
  const { byId: membersById } = useFamilyMembers();
  const [editor, setEditor] = useState<EditorState>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showArchive, setShowArchive] = useState(false);

  const open = useMemo(() => tasks.filter((t) => t.status === 'open').sort(compareByImportance), [tasks]);
  const done = useMemo(
    () =>
      tasks
        .filter((t) => t.status !== 'open')
        .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? '')),
    [tasks],
  );

  const toggle = (task: Task) => {
    setActionError(null);
    setTaskCompleted(task.id, task.status === 'open', task.shoppingItemId).catch((e: Error) => setActionError(e.message));
  };

  const names = (task: Task) => task.assignees.map((id) => membersById.get(id)?.displayName ?? 'Unbekannt');

  return (
    <div className="page">
      <div className="page-header">
        <h1>Aufgaben</h1>
        <button type="button" className="button primary" onClick={() => setEditor({})}>
          + Aufgabe
        </button>
      </div>
      <ErrorNote message={error ?? actionError} />

      <Card title={`Offen (${open.length})`}>
        {!loading && open.length === 0 ? (
          <EmptyState text="Keine offenen Aufgaben." />
        ) : (
          <ul className="task-list">
            {open.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                category={categoriesById.get(task.categoryId)}
                assigneeNames={names(task)}
                onToggle={toggle}
                onOpen={(t) => setEditor({ task: t })}
              />
            ))}
          </ul>
        )}
      </Card>

      <Card
        title={`Archiv (${done.length})`}
        actions={
          <button type="button" className="link-button" onClick={() => setShowArchive((s) => !s)}>
            {showArchive ? 'Ausblenden' : 'Anzeigen'}
          </button>
        }
      >
        {showArchive &&
          (done.length === 0 ? (
            <EmptyState text="Noch keine erledigten Aufgaben." />
          ) : (
            <ul className="task-list">
              {done.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  category={categoriesById.get(task.categoryId)}
                  assigneeNames={names(task)}
                  onToggle={toggle}
                  onOpen={(t) => setEditor({ task: t })}
                />
              ))}
            </ul>
          ))}
      </Card>

      {editor && <TaskEditor task={editor.task} onClose={() => setEditor(null)} />}
    </div>
  );
}
