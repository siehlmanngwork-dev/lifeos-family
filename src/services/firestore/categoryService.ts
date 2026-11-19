import { addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { getDb } from '../../firebase/config';
import type { Category, CategoryInput } from '../../models';
import { COLLECTIONS, withId, type ErrorHandler, type Unsubscribe } from './collections';

function sanitize(input: CategoryInput): CategoryInput {
  const icon = input.icon?.trim();
  return { name: input.name.trim(), color: input.color, icon: icon ? icon : null };
}

/**
 * Categories of the given owners (the user and their family members),
 * so shared family tasks can show the creator's category.
 */
export function subscribeCategories(
  ownerIds: string[],
  onData: (categories: Category[]) => void,
  onError: ErrorHandler,
): Unsubscribe {
  // Firestore `in` supports up to 30 values.
  const q = query(collection(getDb(), COLLECTIONS.categories), where('ownerId', 'in', ownerIds.slice(0, 30)));
  return onSnapshot(
    q,
    (snap) =>
      onData(
        snap.docs
          .map((d) => withId<Category>(d))
          .sort((a, b) => a.name.localeCompare(b.name, 'de')),
      ),
    onError,
  );
}

export async function createCategory(ownerId: string, input: CategoryInput): Promise<void> {
  await addDoc(collection(getDb(), COLLECTIONS.categories), { ...sanitize(input), ownerId });
}

export function updateCategory(categoryId: string, input: CategoryInput): Promise<void> {
  return updateDoc(doc(getDb(), COLLECTIONS.categories, categoryId), { ...sanitize(input) });
}

export function deleteCategory(categoryId: string): Promise<void> {
  return deleteDoc(doc(getDb(), COLLECTIONS.categories, categoryId));
}
