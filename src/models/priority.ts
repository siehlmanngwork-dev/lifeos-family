/** Priority levels from lowest to highest (MVP_SPEC §8). */
export const PRIORITIES = ['low', 'normal', 'high', 'critical', 'immediate'] as const;
export type Priority = (typeof PRIORITIES)[number];

export interface PriorityMeta {
  label: string;
  emoji: string;
  /** Single source of truth for priority colors across the whole app. */
  color: string;
  /** Higher = more important. */
  rank: number;
}

export const PRIORITY_META: Record<Priority, PriorityMeta> = {
  low: { label: 'Niedrig', emoji: '🟢', color: '#2e9d4f', rank: 1 },
  normal: { label: 'Normal', emoji: '🟡', color: '#e0b000', rank: 2 },
  high: { label: 'Hoch', emoji: '🟠', color: '#f07d00', rank: 3 },
  critical: { label: 'Kritisch', emoji: '🔴', color: '#d62d2d', rank: 4 },
  immediate: { label: 'Sofort', emoji: '⚫', color: '#1a1a1a', rank: 5 },
};
