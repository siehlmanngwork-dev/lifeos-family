import { useState, type FormEvent } from 'react';
import type { ClaimInput, ShoppingItem, ShoppingItemInput, ShoppingList, UserProfile } from '../../models';
import {
  claimShoppingItem,
  createShoppingItem,
  deleteShoppingItem,
  setShoppingItemBought,
  updateShoppingItem,
} from '../../services/firestore';
import { EmptyState, ErrorNote } from '../shared/Feedback';
import { ClaimItemDialog } from './ClaimItemDialog';
import { ShoppingItemRow } from './ShoppingItemRow';

interface ShoppingListViewProps {
  list: ShoppingList;
  items: ShoppingItem[];
  userId: string;
  membersById: Map<string, UserProfile>;
}

/** Items of one list. Claimed items stay visible with their responsible person. */
export function ShoppingListView({ list, items, userId, membersById }: ShoppingListViewProps) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [claiming, setClaiming] = useState<ShoppingItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const add = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    run(
      () => createShoppingItem(list.familyId, list.id, userId, { title, note }),
      () => {
        setTitle('');
        setNote('');
      },
    );
  };

  const remove = (item: ShoppingItem) => {
    const hint = item.taskId ? ' Die bereits angelegte Aufgabe bleibt bestehen.' : '';
    if (window.confirm(`„${item.title}“ löschen?${hint}`)) run(() => deleteShoppingItem(item.id));
  };

  const claim = (input: ClaimInput) => {
    if (claiming) run(() => claimShoppingItem(claiming, userId, input), () => setClaiming(null));
  };

  const listItems = items.filter((i) => i.listId === list.id);

  return (
    <div className="shopping-list">
      {listItems.length === 0 ? (
        <EmptyState text="Noch keine Einträge." />
      ) : (
        <ul className="shopping-items">
          {listItems.map((item) => (
            <ShoppingItemRow
              key={item.id}
              item={item}
              assigneeName={item.assignedTo ? membersById.get(item.assignedTo)?.displayName ?? 'Unbekannt' : null}
              busy={busy}
              onClaim={setClaiming}
              onToggleBought={(i) => run(() => setShoppingItemBought(i, i.status !== 'bought'))}
              onSave={(i, input: ShoppingItemInput) => run(() => updateShoppingItem(i.id, input))}
              onDelete={remove}
            />
          ))}
        </ul>
      )}

      <form className="shopping-add" onSubmit={add}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Eintrag, z. B. Milch" aria-label="Eintrag" />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notiz, z. B. 2 Liter" aria-label="Notiz" />
        <button type="submit" className="button primary" disabled={busy || !title.trim()}>
          Hinzufügen
        </button>
      </form>
      <ErrorNote message={error} />

      {claiming && (
        <ClaimItemDialog
          item={claiming}
          submitting={busy}
          error={error}
          onSubmit={claim}
          onClose={() => setClaiming(null)}
        />
      )}
    </div>
  );
}
