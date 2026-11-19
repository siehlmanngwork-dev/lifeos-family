import { useState, type FormEvent } from 'react';
import { SHOPPING_ITEM_STATUS_LABELS, type ShoppingItem, type ShoppingItemInput } from '../../models';

interface ShoppingItemRowProps {
  item: ShoppingItem;
  assigneeName: string | null;
  busy: boolean;
  onClaim: (item: ShoppingItem) => void;
  onToggleBought: (item: ShoppingItem) => void;
  onSave: (item: ShoppingItem, input: ShoppingItemInput) => void;
  onDelete: (item: ShoppingItem) => void;
}

export function ShoppingItemRow({ item, assigneeName, busy, onClaim, onToggleBought, onSave, onDelete }: ShoppingItemRowProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [note, setNote] = useState(item.note);
  const bought = item.status === 'bought';

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(item, { title, note });
    setEditing(false);
  };

  if (editing) {
    return (
      <li className="shopping-item">
        <form className="shopping-add" onSubmit={save}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Titel" autoFocus />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notiz" aria-label="Notiz" />
          <button type="submit" className="button primary" disabled={busy || !title.trim()}>
            Speichern
          </button>
          <button type="button" className="button" onClick={() => setEditing(false)}>
            Abbrechen
          </button>
        </form>
      </li>
    );
  }

  return (
    <li className={`shopping-item status-${item.status}`}>
      <input
        type="checkbox"
        className="task-check"
        checked={bought}
        onChange={() => onToggleBought(item)}
        disabled={busy}
        aria-label={bought ? 'Als nicht gekauft markieren' : 'Als gekauft markieren'}
      />
      <div className="shopping-main">
        <span className="task-title">{item.title}</span>
        <span className="task-meta">
          {item.note && <span>{item.note}</span>}
          <span>{SHOPPING_ITEM_STATUS_LABELS[item.status]}</span>
          {assigneeName && <span>👤 {assigneeName}</span>}
        </span>
      </div>
      <div className="shopping-actions">
        {item.status === 'open' && (
          <button type="button" className="button" onClick={() => onClaim(item)} disabled={busy}>
            Übernehmen
          </button>
        )}
        <button type="button" className="link-button" onClick={() => setEditing(true)}>
          Bearbeiten
        </button>
        <button type="button" className="link-button danger" onClick={() => onDelete(item)} disabled={busy}>
          Löschen
        </button>
      </div>
    </li>
  );
}
