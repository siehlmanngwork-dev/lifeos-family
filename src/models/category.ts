export interface Category {
  id: string;
  name: string;
  /** Hex color, e.g. "#4CAF50". Colors events in the calendar. */
  color: string;
  /** Optional icon (free text, e.g. an emoji). */
  icon: string | null;
  ownerId: string;
}

export type CategoryInput = Pick<Category, 'name' | 'color' | 'icon'>;
