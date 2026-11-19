/**
 * Per-user settings document `settings/{userId}`.
 * Created during user setup.
 */
export interface UserSettings {
  ownerId: string;
  createdAt: string;
  /** Time "HH:mm" of the evening dialog for open recurring tasks (DECISIONS D10). */
  overdueDialogTime?: string;
  /** Series for which the "extend?" notice was answered with no. */
  dismissedSeriesIds?: string[];
}

/** DECISIONS R2. */
export const DEFAULT_OVERDUE_DIALOG_TIME = '20:00';
