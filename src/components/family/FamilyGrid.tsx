import { useSearchParams } from 'react-router-dom';
import type { Family } from '../../models';
import { useEvents, useShoppingItems, useTasks } from '../../hooks/useData';
import { ShoppingPanel } from '../shopping/ShoppingPanel';
import { FamilyEventsPanel } from './FamilyEventsPanel';
import { FamilyTasksPanel } from './FamilyTasksPanel';
import { MembersPanel } from './MembersPanel';

type Section = 'members' | 'events' | 'tasks' | 'shopping';

const SECTIONS: { key: Section; icon: string; label: string }[] = [
  { key: 'members', icon: '👥', label: 'Mitglieder' },
  { key: 'events', icon: '📅', label: 'Familientermine' },
  { key: 'tasks', icon: '✅', label: 'Familienaufgaben' },
  { key: 'shopping', icon: '🛒', label: 'Einkaufslisten' },
];

function isSection(value: string | null): value is Section {
  return SECTIONS.some((s) => s.key === value);
}

/** Family area as a 2×2 grid on mobile and desktop (RELEASE_0.2_SPEC „Neue Navigation“). */
export function FamilyGrid({ family }: { family: Family }) {
  const [params, setParams] = useSearchParams();
  const raw = params.get('view');
  const section: Section = isSection(raw) ? raw : 'members';
  const { data: tasks } = useTasks();
  const { data: items } = useShoppingItems();
  const { data: events } = useEvents();
  const nowIso = new Date().toISOString();

  const summaries: Record<Section, string> = {
    members: `${family.memberIds.length} Personen`,
    events: `${events.filter((e) => e.spaceId === 'family' && e.endDateTime > nowIso).length} anstehend`,
    tasks: `${tasks.filter((t) => t.spaceId === 'family' && t.status === 'open').length} offen`,
    shopping: `${items.filter((i) => i.status !== 'bought').length} offen`,
  };

  return (
    <>
      <nav className="family-grid" aria-label="Familienbereiche">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            className={`family-tile ${section === s.key ? 'active' : ''}`}
            aria-current={section === s.key ? 'page' : undefined}
            onClick={() => setParams({ view: s.key }, { replace: true })}
          >
            <span className="family-tile-icon" aria-hidden="true">
              {s.icon}
            </span>
            <span className="family-tile-label">{s.label}</span>
            {summaries[s.key] && <span className="family-tile-meta">{summaries[s.key]}</span>}
          </button>
        ))}
      </nav>

      <div key={section} className="view-transition">
        {section === 'members' && <MembersPanel family={family} />}
        {section === 'events' && <FamilyEventsPanel />}
        {section === 'tasks' && <FamilyTasksPanel />}
        {section === 'shopping' && <ShoppingPanel />}
      </div>
    </>
  );
}
