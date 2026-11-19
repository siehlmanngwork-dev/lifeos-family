import { PRIORITY_META, SPACE_LABELS, type Category, type Task } from '../../models';
import { formatDeadline, formatDuration, toDateKey } from '../../utils/date';
import { CategoryBadge, PriorityBadge } from '../shared/Badges';

interface TaskItemProps {
  task: Task;
  category: Category | undefined;
  assigneeNames?: string[];
  onToggle?: (task: Task) => void;
  onOpen?: (task: Task) => void;
  compact?: boolean;
}

export function TaskItem({ task, category, assigneeNames, onToggle, onOpen, compact = false }: TaskItemProps) {
  const done = task.status === 'done';
  const overdue = !done && task.deadline !== null && task.deadline < toDateKey(new Date());

  return (
    <li
      className={`task-item ${done ? 'done' : ''}`}
      style={{ borderLeftColor: PRIORITY_META[task.priority].color }}
    >
      {onToggle && (
        <input
          type="checkbox"
          className="task-check"
          checked={done}
          onChange={() => onToggle(task)}
          aria-label={done ? 'Als offen markieren' : 'Als erledigt markieren'}
        />
      )}
      <button type="button" className="task-main" onClick={() => onOpen?.(task)} disabled={!onOpen}>
        <span className="task-title">{task.title}</span>
        <span className="task-meta">
          <span className={overdue ? 'overdue' : ''}>
            {overdue ? 'Überfällig · ' : ''}
            {formatDeadline(task.deadline)}
          </span>
          <span>{formatDuration(task.estimatedDuration)}</span>
          {!compact && <span>{SPACE_LABELS[task.spaceId]}</span>}
          {!compact && assigneeNames && assigneeNames.length > 0 && <span>👤 {assigneeNames.join(', ')}</span>}
        </span>
        {!compact && (
          <span className="task-badges">
            <PriorityBadge priority={task.priority} />
            <CategoryBadge category={category} />
          </span>
        )}
      </button>
    </li>
  );
}
