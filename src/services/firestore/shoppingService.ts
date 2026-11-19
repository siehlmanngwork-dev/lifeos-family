import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { getDb } from '../../firebase/config';
import {
  SHOPPING_CATEGORY_NAME,
  type Category,
  type ClaimInput,
  type ShoppingItem,
  type ShoppingItemInput,
  type ShoppingList,
  type Task,
} from '../../models';
import {
  COLLECTIONS,
  FAMILY_SUBCOLLECTIONS,
  nowIso,
  withId,
  type ErrorHandler,
  type Unsubscribe,
} from './collections';

const SHOPPING_CATEGORY_COLOR = '#f59e0b';
const SHOPPING_CATEGORY_ICON = '🛒';

function listsRef(familyId: string) {
  return collection(getDb(), COLLECTIONS.families, familyId, FAMILY_SUBCOLLECTIONS.shoppingLists);
}

// ---------- lists ----------

export function subscribeShoppingLists(
  familyId: string,
  onData: (lists: ShoppingList[]) => void,
  onError: ErrorHandler,
): Unsubscribe {
  return onSnapshot(
    listsRef(familyId),
    (snap) =>
      onData(
        snap.docs
          .map((d) => withId<ShoppingList>(d))
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
      ),
    onError,
  );
}

export async function createShoppingList(familyId: string, userId: string, name: string): Promise<string> {
  const list: Omit<ShoppingList, 'id'> = {
    name: name.trim(),
    familyId,
    createdBy: userId,
    createdAt: nowIso(),
  };
  const ref = await addDoc(listsRef(familyId), list);
  return ref.id;
}

export function renameShoppingList(familyId: string, listId: string, name: string): Promise<void> {
  return updateDoc(doc(listsRef(familyId), listId), { name: name.trim() });
}

/**
 * Deletes a list and its items. Personal tasks created from claimed items
 * belong to their owners and are kept.
 */
export async function deleteShoppingList(familyId: string, listId: string): Promise<void> {
  const db = getDb();
  const items = await getDocs(
    query(
      collection(db, COLLECTIONS.shoppingItems),
      where('familyId', '==', familyId),
      where('listId', '==', listId),
    ),
  );
  const batch = writeBatch(db);
  items.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(listsRef(familyId), listId));
  await batch.commit();
}

// ---------- items ----------

/** All shopping items of the family; views filter by list. */
export function subscribeShoppingItems(
  familyId: string,
  onData: (items: ShoppingItem[]) => void,
  onError: ErrorHandler,
): Unsubscribe {
  const q = query(collection(getDb(), COLLECTIONS.shoppingItems), where('familyId', '==', familyId));
  return onSnapshot(
    q,
    (snap) =>
      onData(
        snap.docs
          .map((d) => withId<ShoppingItem>(d))
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
      ),
    onError,
  );
}

export async function createShoppingItem(
  familyId: string,
  listId: string,
  userId: string,
  input: ShoppingItemInput,
): Promise<void> {
  const item: Omit<ShoppingItem, 'id'> = {
    title: input.title.trim(),
    note: input.note.trim(),
    listId,
    familyId,
    status: 'open',
    assignedTo: null,
    estimatedDuration: null,
    taskId: null,
    createdBy: userId,
    createdAt: nowIso(),
  };
  await addDoc(collection(getDb(), COLLECTIONS.shoppingItems), item);
}

export function updateShoppingItem(itemId: string, input: ShoppingItemInput): Promise<void> {
  return updateDoc(doc(getDb(), COLLECTIONS.shoppingItems, itemId), {
    title: input.title.trim(),
    note: input.note.trim(),
  });
}

/** Deletes the item. A personal task created from it stays with its owner. */
export function deleteShoppingItem(itemId: string): Promise<void> {
  return deleteDoc(doc(getDb(), COLLECTIONS.shoppingItems, itemId));
}

/**
 * Claims an open item for the user and creates the linked personal task
 * "🛒 <Titel> kaufen" (RELEASE_0.2_SPEC §1, DECISIONS D2).
 * The category "Einkauf" is created on first use.
 */
export async function claimShoppingItem(item: ShoppingItem, userId: string, claim: ClaimInput): Promise<void> {
  const db = getDb();
  const batch = writeBatch(db);

  const ownCategories = await getDocs(
    query(collection(db, COLLECTIONS.categories), where('ownerId', '==', userId)),
  );
  let categoryId = ownCategories.docs.find(
    (d) => (d.data() as Category).name === SHOPPING_CATEGORY_NAME,
  )?.id;
  if (!categoryId) {
    const categoryRef = doc(collection(db, COLLECTIONS.categories));
    const category: Omit<Category, 'id'> = {
      name: SHOPPING_CATEGORY_NAME,
      color: SHOPPING_CATEGORY_COLOR,
      icon: SHOPPING_CATEGORY_ICON,
      ownerId: userId,
    };
    batch.set(categoryRef, category);
    categoryId = categoryRef.id;
  }

  const taskRef = doc(collection(db, COLLECTIONS.tasks));
  const task: Omit<Task, 'id'> = {
    title: `🛒 ${item.title} kaufen`,
    description: item.note,
    assignees: [userId],
    priority: 'normal',
    categoryId,
    estimatedDuration: claim.estimatedDuration,
    deadline: claim.deadline,
    reminder: null,
    spaceId: 'personal',
    familyId: null,
    projectId: null,
    status: 'open',
    isRecurring: false,
    completedAt: null,
    createdBy: userId,
    createdAt: nowIso(),
    shoppingItemId: item.id,
  };
  batch.set(taskRef, task);
  batch.update(doc(db, COLLECTIONS.shoppingItems, item.id), {
    status: 'claimed',
    assignedTo: userId,
    estimatedDuration: claim.estimatedDuration,
    taskId: taskRef.id,
  });
  await batch.commit();
}

/**
 * Marks an item as bought (or reverts it). Any family member may do this;
 * the linked task is completed/reopened accordingly (DECISIONS D3).
 */
export async function setShoppingItemBought(item: ShoppingItem, bought: boolean): Promise<void> {
  const db = getDb();
  const batch = writeBatch(db);
  const status = bought ? 'bought' : item.assignedTo ? 'claimed' : 'open';
  batch.update(doc(db, COLLECTIONS.shoppingItems, item.id), { status });
  if (item.taskId) {
    batch.update(doc(db, COLLECTIONS.tasks, item.taskId), {
      status: bought ? 'done' : 'open',
      completedAt: bought ? nowIso() : null,
    });
  }
  await batch.commit();
}
