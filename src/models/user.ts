import type { ManualStatus } from './status';

export const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: 'Montag',
  tuesday: 'Dienstag',
  wednesday: 'Mittwoch',
  thursday: 'Donnerstag',
  friday: 'Freitag',
  saturday: 'Samstag',
  sunday: 'Sonntag',
};

/** Available hours per weekday, defined by the user (MVP_SPEC §7 Tagesauslastung). */
export type WeeklyCapacity = Record<Weekday, number>;

/** Initial values taken from ARCHITECTURE.md (users example). */
export const DEFAULT_WEEKLY_CAPACITY: WeeklyCapacity = {
  monday: 10,
  tuesday: 10,
  wednesday: 10,
  thursday: 10,
  friday: 10,
  saturday: 5,
  sunday: 5,
};

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  familyId: string | null;
  availableHoursPerDay: WeeklyCapacity;
  createdAt: string;
  /** Manual status override (Release 0.2). */
  manualStatus?: ManualStatus | null;
}

export type UserProfileUpdate = Partial<Pick<UserProfile, 'displayName' | 'availableHoursPerDay'>>;
