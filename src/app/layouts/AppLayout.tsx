import { useMemo, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { EventEditor } from '../../components/calendar/EventEditor';
import { Modal } from '../../components/shared/Modal';
import { StatusEditor } from '../../components/status/StatusEditor';
import { TaskEditor } from '../../components/tasks/TaskEditor';
import { useBusyBlockSync } from '../../hooks/useBusyBlockSync';
import { useMemberStatus } from '../../hooks/useMemberStatus';
import { useCurrentUser } from '../../hooks/useSession';
import { formatStatus } from '../../services/status/statusEngine';
import { buildNavigation } from '../../services/permissions/navigation';

type NewDialog = 'menu' | 'task' | 'event' | 'status' | null;

/**
 * App shell: side navigation on desktop, bottom navigation on mobile.
 * Navigation entries are generated from the user's permissions.
 */
export function AppLayout() {
  const { userId, profile, permissions } = useCurrentUser();
  const [dialog, setDialog] = useState<NewDialog>(null);
  const items = buildNavigation(permissions);
  useBusyBlockSync();
  const self = useMemo(() => [profile], [profile]);
  const ownStatus = useMemberStatus(self).get(userId)?.status ?? { source: 'none' as const };

  return (
    <div className="app-shell">
      <header className="topbar">
        <span className="brand">LifeOS Family</span>
        <button type="button" className="status-chip" onClick={() => setDialog('status')} title="Status ändern">
          {formatStatus(ownStatus)}
        </button>
        <NavLink to="/settings" className="topbar-user" title="Einstellungen">
          <span className="avatar">{profile.displayName.charAt(0).toUpperCase()}</span>
          <span className="topbar-name">{profile.displayName}</span>
          <span aria-hidden="true">⚙️</span>
        </NavLink>
      </header>

      <nav className="nav" aria-label="Hauptnavigation">
        {items.map((item) =>
          item.path ? (
            <NavLink key={item.key} to={item.path} end={item.path === '/'} className="nav-item">
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ) : (
            <button key={item.key} type="button" className="nav-item" onClick={() => setDialog('menu')}>
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="nav-label">{item.label}</span>
            </button>
          ),
        )}
      </nav>

      <main className="content">
        <Outlet />
      </main>

      {dialog === 'menu' && (
        <Modal title="Neu" onClose={() => setDialog(null)}>
          <div className="new-menu">
            {permissions.tasks && (
              <button type="button" className="button large" onClick={() => setDialog('task')}>
                ✅ Aufgabe
              </button>
            )}
            {permissions.calendar && (
              <button type="button" className="button large" onClick={() => setDialog('event')}>
                📅 Termin
              </button>
            )}
          </div>
        </Modal>
      )}
      {dialog === 'task' && <TaskEditor onClose={() => setDialog(null)} />}
      {dialog === 'event' && <EventEditor onClose={() => setDialog(null)} />}
      {dialog === 'status' && (
        <StatusEditor
          userId={userId}
          current={ownStatus}
          manual={profile.manualStatus}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}
