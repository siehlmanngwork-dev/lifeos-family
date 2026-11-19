/**
 * Individual permissions per user (no fixed roles, MVP_SPEC §6).
 * Stored in `permissions/{userId}`.
 */
export interface Permissions {
  dashboard: boolean;
  calendar: boolean;
  tasks: boolean;
  family: boolean;
  projects: boolean;
  admin: boolean;
  assignTasksToOthers: boolean;
}

export type PermissionKey = keyof Permissions;

/** Defaults taken from ARCHITECTURE.md (permissions example). */
export const DEFAULT_PERMISSIONS: Permissions = {
  dashboard: true,
  calendar: true,
  tasks: true,
  family: true,
  projects: false,
  admin: false,
  assignTasksToOthers: false,
};
