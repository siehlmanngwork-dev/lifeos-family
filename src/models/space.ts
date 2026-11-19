/**
 * Built-in spaces for Release 0.1.
 * Custom spaces (collection `spaces`, MVP_SPEC §5) arrive with Release 0.3;
 * the field is typed as a string union so it can be widened to arbitrary space ids later.
 */
export type SpaceId = 'personal' | 'family';

export const SPACE_LABELS: Record<SpaceId, string> = {
  personal: 'Personal',
  family: 'Family',
};

/** Reserved shape for the `spaces` collection (Release 0.3). */
export interface Space {
  id: string;
  name: string;
  members: string[];
  createdBy: string;
  type: 'custom';
}
