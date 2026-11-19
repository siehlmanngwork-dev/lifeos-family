import type { PermissionKey, Permissions } from '../../models';

export interface NavItem {
  key: 'dashboard' | 'calendar' | 'tasks' | 'family' | 'new';
  label: string;
  icon: string;
  /** Route path, or null for actions (e.g. "Neu" opens a dialog). */
  path: string | null;
  /** The item is shown if the user holds at least one of these permissions. */
  requiresAny: PermissionKey[];
}

/**
 * Standard navigation (MVP_SPEC §18). New areas (projects, admin, ...) are added
 * here with their permission and appear automatically for permitted users.
 */
export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '🏠', path: '/', requiresAny: ['dashboard'] },
  { key: 'calendar', label: 'Kalender', icon: '📅', path: '/calendar', requiresAny: ['calendar'] },
  { key: 'tasks', label: 'Aufgaben', icon: '✅', path: '/tasks', requiresAny: ['tasks'] },
  { key: 'family', label: 'Familie', icon: '👨‍👩‍👧', path: '/family', requiresAny: ['family'] },
  { key: 'new', label: 'Neu', icon: '➕', path: null, requiresAny: ['tasks', 'calendar'] },
];

export function hasPermission(permissions: Permissions | null, key: PermissionKey): boolean {
  return permissions?.[key] === true;
}

export function buildNavigation(permissions: Permissions | null): NavItem[] {
  return NAV_ITEMS.filter((item) => item.requiresAny.some((key) => hasPermission(permissions, key)));
}

/** First route the user may open (used as fallback when a route is not permitted). */
export function firstPermittedPath(permissions: Permissions | null): string | null {
  return buildNavigation(permissions).find((item) => item.path !== null)?.path ?? null;
}
