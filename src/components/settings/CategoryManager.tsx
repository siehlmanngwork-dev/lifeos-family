import { useState, type FormEvent } from 'react';
import type { Category, CategoryInput } from '../../models';
import { createCategory, deleteCategory, updateCategory } from '../../services/firestore';
import { Card } from '../shared/Card';
import { EmptyState, ErrorNote } from '../shared/Feedback';

const EMPTY_INPUT: CategoryInput = { name: '', color: '#4caf50', icon: '' };

interface CategoryRowFormProps {
  initial: CategoryInput;
  submitLabel: string;
  busy: boolean;
  onSubmit: (input: CategoryInput) => void;
  onCancel?: () => void;
}

function CategoryRowForm({ initial, submitLabel, busy, onSubmit, onCancel }: CategoryRowFormProps) {
  const [input, setInput] = useState<CategoryInput>(initial);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.name.trim()) onSubmit(input);
  };

  return (
    <form className="category-form" onSubmit={handleSubmit}>
      <input
        type="color"
        value={input.color}
        onChange={(e) => setInput({ ...input, color: e.target.value })}
        aria-label="Farbe"
      />
      <input
        className="icon-input"
        value={input.icon ?? ''}
        onChange={(e) => setInput({ ...input, icon: e.target.value })}
        placeholder="Icon"
        maxLength={4}
        aria-label="Icon (optional)"
      />
      <input
        value={input.name}
        onChange={(e) => setInput({ ...input, name: e.target.value })}
        placeholder="Name"
        aria-label="Name"
        maxLength={60}
      />
      <button type="submit" className="button primary" disabled={busy || !input.name.trim()}>
        {submitLabel}
      </button>
      {onCancel && (
        <button type="button" className="button" onClick={onCancel}>
          Abbrechen
        </button>
      )}
    </form>
  );
}

interface CategoryManagerProps {
  userId: string;
  categories: Category[];
}

export function CategoryManager({ userId, categories }: CategoryManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  const run = async (action: () => Promise<void>, after?: () => void) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      after?.();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = (category: Category) => {
    if (window.confirm(`Kategorie „${category.name}“ löschen?`)) run(() => deleteCategory(category.id));
  };

  return (
    <Card title="Kategorien">
      {categories.length === 0 ? (
        <EmptyState text="Noch keine Kategorien." />
      ) : (
        <ul className="category-list">
          {categories.map((c) =>
            editingId === c.id ? (
              <li key={c.id}>
                <CategoryRowForm
                  initial={{ name: c.name, color: c.color, icon: c.icon ?? '' }}
                  submitLabel="Speichern"
                  busy={busy}
                  onSubmit={(input) => run(() => updateCategory(c.id, input), () => setEditingId(null))}
                  onCancel={() => setEditingId(null)}
                />
              </li>
            ) : (
              <li key={c.id} className="category-row">
                <span className="color-dot large" style={{ background: c.color }} />
                <span className="category-name">
                  {c.icon ? `${c.icon} ` : ''}
                  {c.name}
                </span>
                <button type="button" className="link-button" onClick={() => setEditingId(c.id)}>
                  Bearbeiten
                </button>
                <button type="button" className="link-button danger" onClick={() => remove(c)} disabled={busy}>
                  Löschen
                </button>
              </li>
            ),
          )}
        </ul>
      )}
      <h4 className="subheading">Neue Kategorie</h4>
      <CategoryRowForm
        key={formKey}
        initial={EMPTY_INPUT}
        submitLabel="Hinzufügen"
        busy={busy}
        onSubmit={(input) => run(() => createCategory(userId, input), () => setFormKey((k) => k + 1))}
      />
      <ErrorNote message={error} />
    </Card>
  );
}
