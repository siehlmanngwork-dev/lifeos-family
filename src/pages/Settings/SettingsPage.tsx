import { CategoryManager } from '../../components/settings/CategoryManager';
import { OverdueDialogSettings } from '../../components/settings/OverdueDialogSettings';
import { ProfileForm } from '../../components/settings/ProfileForm';
import { ErrorNote } from '../../components/shared/Feedback';
import { useCategories } from '../../hooks/useData';
import { useCurrentUser } from '../../hooks/useSession';
import { signOutUser } from '../../services/auth/authService';

export function SettingsPage() {
  const { userId, profile } = useCurrentUser();
  const { own, error } = useCategories();

  return (
    <div className="page">
      <div className="page-header">
        <h1>Einstellungen</h1>
        <button type="button" className="button" onClick={() => signOutUser()}>
          Abmelden
        </button>
      </div>
      <ErrorNote message={error} />
      <div className="two-columns">
        <ProfileForm profile={profile} />
        <CategoryManager userId={userId} categories={own} />
        <OverdueDialogSettings userId={userId} />
      </div>
    </div>
  );
}
