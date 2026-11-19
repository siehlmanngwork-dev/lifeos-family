import { useState, type FormEvent } from 'react';
import { useFamilyMembers, useShoppingItems, useShoppingLists } from '../../hooks/useData';
import { useCurrentUser } from '../../hooks/useSession';
import { createShoppingList, deleteShoppingList, renameShoppingList } from '../../services/firestore';
import { Card } from '../shared/Card';
import { EmptyState, ErrorNote } from '../shared/Feedback';
import { ShoppingListView } from './ShoppingListView';

/** 🛒 Einkaufslisten: several lists per family, accessible to all members. */
export function ShoppingPanel() {
  const { userId, profile } = useCurrentUser();
  const familyId = profile.familyId;
  const { data: lists, error: listsError } = useShoppingLists();
  const { data: items, error: itemsError } = useShoppingItems();
  const { byId: membersById } = useFamilyMembers();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!familyId) return null;
  const selected = lists.find((l) => l.id === selectedId) ?? lists[0] ?? null;

  const run = async (action: () => Promise<unknown>, after?: () => void) => {
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

  const create = (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    run(
      async () => setSelectedId(await createShoppingList(familyId, userId, newName)),
      () => setNewName(''),
    );
  };

  const rename = () => {
    if (!selected) return;
    const name = window.prompt('Neuer Name der Liste', selected.name);
    if (name && name.trim()) run(() => renameShoppingList(familyId, selected.id, name));
  };

  const remove = () => {
    if (selected && window.confirm(`Liste „${selected.name}“ mit allen Einträgen löschen?`)) {
      run(() => deleteShoppingList(familyId, selected.id), () => setSelectedId(null));
    }
  };

  const openCount = (listId: string) => items.filter((i) => i.listId === listId && i.status !== 'bought').length;

  return (
    <Card title="🛒 Einkaufslisten">
      <ErrorNote message={listsError ?? itemsError ?? error} />
      {lists.length > 0 && (
        <div className="list-tabs" role="tablist">
          {lists.map((l) => (
            <button
              key={l.id}
              type="button"
              role="tab"
              aria-selected={selected?.id === l.id}
              className={`list-tab ${selected?.id === l.id ? 'active' : ''}`}
              onClick={() => setSelectedId(l.id)}
            >
              {l.name} <span className="muted">({openCount(l.id)})</span>
            </button>
          ))}
        </div>
      )}

      {selected ? (
        <>
          <div className="list-actions">
            <button type="button" className="link-button" onClick={rename} disabled={busy}>
              Umbenennen
            </button>
            <button type="button" className="link-button danger" onClick={remove} disabled={busy}>
              Liste löschen
            </button>
          </div>
          <ShoppingListView list={selected} items={items} userId={userId} membersById={membersById} />
        </>
      ) : (
        <EmptyState text="Noch keine Einkaufslisten." />
      )}

      <form className="shopping-add new-list" onSubmit={create}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Neue Liste, z. B. Wocheneinkauf"
          aria-label="Name der neuen Liste"
        />
        <button type="submit" className="button" disabled={busy || !newName.trim()}>
          Liste anlegen
        </button>
      </form>
    </Card>
  );
}
