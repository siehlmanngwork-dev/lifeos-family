import { PRIORITY_META, type Category, type Priority } from '../../models';

export function PriorityBadge({ priority }: { priority: Priority }) {
  const meta = PRIORITY_META[priority];
  return (
    <span className="badge" style={{ borderColor: meta.color, color: meta.color }}>
      {meta.emoji} {meta.label}
    </span>
  );
}

export function CategoryBadge({ category }: { category: Category | undefined }) {
  if (!category) return null;
  return (
    <span className="badge category-badge">
      <span className="color-dot" style={{ background: category.color }} />
      {category.icon ? `${category.icon} ` : ''}
      {category.name}
    </span>
  );
}
