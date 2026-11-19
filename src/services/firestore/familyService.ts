import { arrayUnion, doc, getDoc, onSnapshot, writeBatch } from 'firebase/firestore';
import { getDb } from '../../firebase/config';
import type { Family } from '../../models';
import { generateJoinCode, isValidJoinCode, normalizeJoinCode } from '../../utils/joinCode';
import { COLLECTIONS, nowIso, withId, type ErrorHandler, type Unsubscribe } from './collections';

export class FamilyError extends Error {}

/**
 * Creates a family and makes the creator its first member.
 * The join code doubles as the document id, so joining only needs a direct
 * document lookup and families can never be listed by other users.
 */
export async function createFamily(userId: string, name: string): Promise<Family> {
  const db = getDb();
  const trimmed = name.trim();
  if (!trimmed) throw new FamilyError('Bitte einen Familiennamen eingeben.');

  let joinCode = '';
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateJoinCode();
    const existing = await getDoc(doc(db, COLLECTIONS.families, candidate));
    if (!existing.exists()) {
      joinCode = candidate;
      break;
    }
  }
  if (!joinCode) throw new FamilyError('Familiencode konnte nicht erzeugt werden. Bitte erneut versuchen.');

  const family: Omit<Family, 'id'> = {
    name: trimmed,
    createdBy: userId,
    joinCode,
    memberIds: [userId],
    createdAt: nowIso(),
  };

  const batch = writeBatch(db);
  batch.set(doc(db, COLLECTIONS.families, joinCode), family);
  batch.update(doc(db, COLLECTIONS.users, userId), { familyId: joinCode });
  await batch.commit();

  return { ...family, id: joinCode };
}

/** Joins an existing family via its family code. No admin confirmation (MVP_SPEC §4). */
export async function joinFamily(userId: string, rawCode: string): Promise<Family> {
  const db = getDb();
  const code = normalizeJoinCode(rawCode);
  if (!isValidJoinCode(code)) throw new FamilyError('Ungültiges Format. Beispiel: FAM-72AB-91QX');

  const familyRef = doc(db, COLLECTIONS.families, code);
  const snap = await getDoc(familyRef);
  if (!snap.exists()) throw new FamilyError('Keine Familie mit diesem Code gefunden.');

  const family = withId<Family>(snap);
  const batch = writeBatch(db);
  if (!family.memberIds.includes(userId)) {
    batch.update(familyRef, { memberIds: arrayUnion(userId) });
  }
  batch.update(doc(db, COLLECTIONS.users, userId), { familyId: code });
  await batch.commit();

  return { ...family, memberIds: Array.from(new Set([...family.memberIds, userId])) };
}

export function subscribeFamily(
  familyId: string,
  onData: (family: Family | null) => void,
  onError: ErrorHandler,
): Unsubscribe {
  return onSnapshot(
    doc(getDb(), COLLECTIONS.families, familyId),
    (snap) => onData(snap.exists() ? withId<Family>(snap) : null),
    onError,
  );
}
