import { useState } from 'react';
import type { Task } from '../../models';
import { dismissSeriesNotice, extendTaskSeries } from '../../services/firestore';
import { formatDeadline } from '../../utils/date';
import { ErrorNote } from '../shared/Feedback';

interface SeriesEndNoticeProps {
  userId: string;
  /** Last occurrence of each series that is about to end. */
  series: Task[];
}

/** Dashboard notice "Soll die Serie verlängert werden?" (RELEASE_0.2_SPEC §4). */
export function SeriesEndNotice({ userId, series }: SeriesEndNoticeProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (series.length === 0) return null;

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="series-notice">
      {series.map((last) => (
        <div key={last.seriesId} className="series-notice-row">
          <span>
            🔁 Die Serie <strong>{last.title.replace(/^🛒 /, '')}</strong> endet am {formatDeadline(last.deadline)}.
            Soll die Serie verlängert werden?
          </span>
          <span className="series-notice-actions">
            <button type="button" className="button primary" disabled={busy} onClick={() => run(() => extendTaskSeries(last))}>
              Verlängern (+{last.seriesLength ?? 10})
            </button>
            <button
              type="button"
              className="button"
              disabled={busy}
              onClick={() => run(() => dismissSeriesNotice(userId, last.seriesId as string))}
            >
              Nein
            </button>
          </span>
        </div>
      ))}
      <ErrorNote message={error} />
    </section>
  );
}
