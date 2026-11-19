import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CalendarPage } from '../../pages/Calendar/CalendarPage';
import { DashboardPage } from '../../pages/Dashboard/DashboardPage';
import { FamilyPage } from '../../pages/Family/FamilyPage';
import { LoginPage } from '../../pages/Login/LoginPage';
import { SettingsPage } from '../../pages/Settings/SettingsPage';
import { TasksPage } from '../../pages/Tasks/TasksPage';
import { AppLayout } from '../layouts/AppLayout';
import { RedirectIfAuthenticated, RequireAuth, RequirePermission } from './guards';

/** HashRouter: works on GitHub Pages without server-side rewrites. */
export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <RedirectIfAuthenticated>
              <LoginPage />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route
            index
            element={
              <RequirePermission permission="dashboard">
                <DashboardPage />
              </RequirePermission>
            }
          />
          <Route
            path="calendar"
            element={
              <RequirePermission permission="calendar">
                <CalendarPage />
              </RequirePermission>
            }
          />
          <Route
            path="tasks"
            element={
              <RequirePermission permission="tasks">
                <TasksPage />
              </RequirePermission>
            }
          />
          <Route
            path="family"
            element={
              <RequirePermission permission="family">
                <FamilyPage />
              </RequirePermission>
            }
          />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
