import { DEFAULT_SERIES_LENGTH, type RecurrenceType, type RecurrenceUnit } from '../../models';

/** Form state of the repetition fields. */
export interface RecurrenceValue {
  type: RecurrenceType | 'none';
  interval: number;
  unit: RecurrenceUnit;
  count: number;
  rotation: boolean;
  rotationMembers: string[];
}

export const NO_RECURRENCE: RecurrenceValue = {
  type: 'none',
  interval: 2,
  unit: 'weeks',
  count: DEFAULT_SERIES_LENGTH,
  rotation: false,
  rotationMembers: [],
};
