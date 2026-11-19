/**
 * Per-user settings document `settings/{userId}`.
 * Created during user setup; no settings are defined for Release 0.1 yet,
 * the document is reserved for later preferences.
 */
export interface UserSettings {
  ownerId: string;
  createdAt: string;
}
