import type { CalendarEvent, EventSource } from '../../models';

/**
 * Contract for external calendar integrations.
 *
 * Release 0.1: architecture only — no provider is implemented or registered.
 * Release 0.4: Google Calendar import. Release 0.5: Outlook and Apple.
 */
export interface ExternalCalendarProvider {
  readonly source: Exclude<EventSource, 'local'>;
  readonly displayName: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): Promise<boolean>;
  /** Fetches events in [from, to) mapped to the app's event model (without id). */
  fetchEvents(from: Date, to: Date): Promise<Omit<CalendarEvent, 'id'>[]>;
}

const providers = new Map<ExternalCalendarProvider['source'], ExternalCalendarProvider>();

export function registerCalendarProvider(provider: ExternalCalendarProvider): void {
  providers.set(provider.source, provider);
}

export function getCalendarProviders(): ExternalCalendarProvider[] {
  return Array.from(providers.values());
}
