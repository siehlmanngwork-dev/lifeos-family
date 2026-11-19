/** Stored in `families/{familyId}/shoppingLists/{listId}` (DECISIONS D1). */
export interface ShoppingList {
  id: string;
  name: string;
  familyId: string;
  createdBy: string;
  createdAt: string;
}

export type ShoppingListInput = Pick<ShoppingList, 'name'>;

export const SHOPPING_ITEM_STATUSES = ['open', 'claimed', 'bought'] as const;
export type ShoppingItemStatus = (typeof SHOPPING_ITEM_STATUSES)[number];

export const SHOPPING_ITEM_STATUS_LABELS: Record<ShoppingItemStatus, string> = {
  open: 'Offen',
  claimed: 'Übernommen',
  bought: 'Gekauft',
};

/** Stored in `shoppingItems/{itemId}`. */
export interface ShoppingItem {
  id: string;
  title: string;
  /** Free text instead of a fixed quantity field, e.g. "2 Liter". */
  note: string;
  listId: string;
  familyId: string;
  status: ShoppingItemStatus;
  /** Exactly one responsible person, or null while open. */
  assignedTo: string | null;
  /** Estimated effort in minutes, required when claiming. */
  estimatedDuration: number | null;
  /** Personal task created on claim; linked both ways (DECISIONS D3). */
  taskId: string | null;
  createdBy: string;
  createdAt: string;
}

export type ShoppingItemInput = Pick<ShoppingItem, 'title' | 'note'>;

/** Values requested when claiming an item (DECISIONS D2). */
export interface ClaimInput {
  /** Minutes. */
  estimatedDuration: number;
  /** "YYYY-MM-DD" or null for "Irgendwann". */
  deadline: string | null;
}

/** Name of the category created automatically for shopping tasks (DECISIONS D2). */
export const SHOPPING_CATEGORY_NAME = 'Einkauf';
