export type CalendarView = 'day' | 'week' | 'month';

const VIEW_LABELS: Record<CalendarView, string> = { day: 'Tag', week: 'Woche', month: 'Monat' };

interface CalendarToolbarProps {
  view: CalendarView;
  title: string;
  onViewChange: (view: CalendarView) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onCreate: () => void;
}

export function CalendarToolbar({ view, title, onViewChange, onPrev, onNext, onToday, onCreate }: CalendarToolbarProps) {
  return (
    <div className="calendar-toolbar">
      <div className="toolbar-group">
        <button type="button" className="icon-button" onClick={onPrev} aria-label="Zurück">
          ‹
        </button>
        <button type="button" className="button" onClick={onToday}>
          Heute
        </button>
        <button type="button" className="icon-button" onClick={onNext} aria-label="Weiter">
          ›
        </button>
        <h2 className="calendar-title">{title}</h2>
      </div>
      <div className="toolbar-group">
        <div className="segmented" role="tablist">
          {(Object.keys(VIEW_LABELS) as CalendarView[]).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              className={view === v ? 'active' : ''}
              onClick={() => onViewChange(v)}
            >
              {VIEW_LABELS[v]}
            </button>
          ))}
        </div>
        <button type="button" className="button primary" onClick={onCreate}>
          + Termin
        </button>
      </div>
    </div>
  );
}
