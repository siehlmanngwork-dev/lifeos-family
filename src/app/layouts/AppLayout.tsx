import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { EventEditor } from '../../components/calendar/EventEditor';
import { Modal } from '../../components/shared/Modal';
import { TaskEditor } from '../../components/tasks/TaskEditor';
import { useCurrentUser } from '../../hooks/useSession';
import { buildNavigation } from '../../services/permissions/navigation';

type NewDialog = 'menu' | 'task' | 'event' | null;

/**
 * App shell: side navigation on desktop, bottom navigation on mobile.
 * Navigation entries are generated from the user's permissions.
 */
export function AppLayout() {
  const { profile, permissions } = useCurrentUser();
  const [dialog, setDialog] = useState<NewDialog>(null);
  const items = buildNavigation(permissions);

  return (
    <div className="app-shell">
      <header className="topbar">
        <span className="brand">LifeOS Family</span>
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
    </div>
  );
}
