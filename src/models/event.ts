import type { SpaceId } from './space';

/**
 * Origin of an event. Only "local" exists in Release 0.1;
 * external calendar providers (Google: 0.4, Outlook/Apple: 0.5) add their own values.
 */
export type EventSource = 'local' | 'google' | 'outlook' | 'apple';

export interface CalendarEvent {
  id: string;
  title: string;
  /** ISO date-time (UTC). */
  startDateTime: string;
  /** ISO date-time (UTC). Multi-day events are supported. */
  endDateTime: string;
  location: string;
  categoryId: string | null;
  private: boolean;
  /** Reserved: participants selection is not part of Release 0.1 (creator only). */
  participants: string[];
  /** Reserved: space selection for events is not part of Release 0.1 ("personal"). */
  spaceId: SpaceId;
  familyId: string | null;
  /** Reserved for Release 0.3 (projects). */
  projectId: string | null;
  source: EventSource;
  /** Id in the external calendar, if imported. */
  externalId: string | null;
  createdBy: string;
  createdAt: string;
}

/** Fields the user edits in the event form (Release 0.1). */
export type CalendarEventInput = Pick<
  CalendarEvent,
  'title' | 'startDateTime' | 'endDateTime' | 'location' | 'categoryId' | 'private'
>;
