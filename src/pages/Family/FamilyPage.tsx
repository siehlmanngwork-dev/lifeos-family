import { FamilyGrid } from '../../components/family/FamilyGrid';
import { FamilySetup } from '../../components/family/FamilySetup';
import { ErrorNote, LoadingScreen } from '../../components/shared/Feedback';
import { useFamily, useFamilyMembers } from '../../hooks/useData';
import { useCurrentUser } from '../../hooks/useSession';

export function FamilyPage() {
  const { userId, profile } = useCurrentUser();
  const { data: family, loading, error } = useFamily();
  const { error: membersError } = useFamilyMembers();

  return (
    <div className="page">
      <div className="page-header">
        <h1>Familie</h1>
      </div>
      <ErrorNote message={error ?? membersError} />
      {!profile.familyId ? (
        <FamilySetup userId={userId} />
      ) : loading ? (
        <LoadingScreen />
      ) : family ? (
        <FamilyGrid family={family} />
      ) : (
        <ErrorNote message="Familie wurde nicht gefunden." />
      )}
    </div>
  );
}
