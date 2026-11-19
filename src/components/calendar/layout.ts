import type { CalendarEvent, Category } from '../../models';
import { addDays, startOfDay } from '../../utils/date';

export const DEFAULT_EVENT_COLOR = '#64748b';

export function eventColor(event: CalendarEvent, categoriesById: Map<string, Category>): string {
  return (event.categoryId && categoriesById.get(event.categoryId)?.color) || DEFAULT_EVENT_COLOR;
}

export interface PositionedSegment {
  event: CalendarEvent;
  /** Minutes from midnight of the day. */
  startMinute: number;
  endMinute: number;
  lane: number;
  laneCount: number;
  /** Event continues from the previous / into the next day. */
  continuesBefore: boolean;
  continuesAfter: boolean;
}

/**
 * Clips events to one day and assigns side-by-side lanes for overlapping events.
 */
export function layoutDay(day: Date, events: CalendarEvent[]): PositionedSegment[] {
  const dayStart = startOfDay(day);
  const dayEnd = addDays(dayStart, 1);

  const segments = events
    .map((event) => {
      const start = new Date(event.startDateTime);
      const end = new Date(event.endDateTime);
      if (start >= dayEnd || end <= dayStart) return null;
      const clippedStart = start < dayStart ? dayStart : start;
      const clippedEnd = end > dayEnd ? dayEnd : end;
      return {
        event,
        startMinute: (clippedStart.getTime() - dayStart.getTime()) / 60000,
        endMinute: (clippedEnd.getTime() - dayStart.getTime()) / 60000,
        lane: 0,
        laneCount: 1,
        continuesBefore: start < dayStart,
        continuesAfter: end > dayEnd,
      };
    })
    .filter((s): s is PositionedSegment => s !== null)
    .sort((a, b) => a.startMinute - b.startMinute || b.endMinute - a.endMinute);

  // Group into clusters of transitively overlapping segments, then assign lanes.
  let cluster: PositionedSegment[] = [];
  let laneEnds: number[] = [];
  let clusterEnd = -1;
  const flush = () => {
    cluster.forEach((s) => (s.laneCount = laneEnds.length));
    cluster = [];
    laneEnds = [];
  };

  for (const segment of segments) {
    if (segment.startMinute >= clusterEnd) flush();
    let lane = laneEnds.findIndex((end) => end <= segment.startMinute);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(segment.endMinute);
    } else {
      laneEnds[lane] = segment.endMinute;
    }
    segment.lane = lane;
    cluster.push(segment);
    clusterEnd = Math.max(clusterEnd, segment.endMinute);
  }
  flush();

  return segments;
}
